---
title: 'RabbitMQ常见问题'
date: 2023-12-13 12:44:15
tags:
- 'RabbitMQ'
- '消息队列'
categories:
- '中间件'

---

<!-- more -->

## 1. RabbitMQ如何保证消息不丢失？

### 1.1 (生产者需要做的) 
生产者重写 RabbitTemplate.ConfirmCallback的 confirm方法以及 returnedMessage 方法。
将 ack==false 的消息 持久化到数据库,定时扫描 DB 中投递失败的数据，重新投递到MQ中；

```java
/**
 * 生产者 确认消息的配置
 * 此函数为回调函数,用于通知producer消息是否投递成功
 *
 * @param correlationData 消息唯一ID
 * @param ack             确认消息是否被MQ 接收,true是已被接收,false反之
 * @param cause
 */
@Override
public void confirm(CorrelationData correlationData, boolean ack, String cause) {
   //投递成功
   if (ack) {
      //不做处理，等待消费成功
      log.info(correlationData.getId() + "：发送成功");
      //删除redis里面备份的数据
      redisTemplate.delete(correlationData.getId());
   } else {
      //投递失败 //测试该逻辑时候 把上边的if(ack) 改成if(!ack)即可
      //持久化到数据库 (TODO 注意: 有时候 (严格保证消息投递成功的场景下) 可能需要增加定时任务，
      //TODO 定时扫描 redis或者DB (这里我们把投递失败的保存到了DB 所以定时任务扫描DB就可以了) 中投递失败的数据，重新投递到MQ中,这也是保证消息投递成功的一个手段)
      //TODO (但是 :  如果是需要顺序消费的话，这种重新投递的策略就显得不那么合适了，我想的是某几个顺序消息拥有同一个会话ID 。。。具体的实现我将在后续研究一下,这里先不考虑顺序消费的场景)
      log.error(correlationData.getId() + "：发送失败");
      log.info("备份到DB的内容：" + redisTemplate.opsForValue().get(correlationData.getId()));
      try {
         SaveNackMessage strategy = SaveNackMessage.getStrategy(SaveNackMessage.NackTypeEnum.PRODUCER.getType());
         HashMap<String, Object> map = new HashMap<>();
         map.put("cause", StringUtils.isNoneBlank(cause) ? cause : StringUtils.EMPTY);
         map.put("ack", ack ? 1 : 0);
         map.put("correlationData", Objects.nonNull(correlationData) ? correlationData : StringUtils.EMPTY);
         saveNackMessageThread.execute(strategy.template(map));
      } catch (Exception e) {
         //TODO 发布event事件 监听方发送钉钉消息提醒开发者
         log.error("记录mq发送端错误日志失败", e);
      }
   }
}
```

另外除了实现confirm方法，还需要实现returnedMessage方法 即(投递消息后，交换机找不到具体的queue将会回调该方法 一般我们需要配置钉钉预警，告知开发者)
具体代码如下:
```java
@Autowired
private ApplicationEventPublisher publisher;

/**
 * 当投递消息后，交换机找不到具体的queue将会回调该方法 一般我们需要配置钉钉预警，告知开发者
 *
 * @param message
 * @param replyCode
 * @param replyText
 * @param exchange
 * @param routingKey
 */
@Override
public void returnedMessage(Message message, int replyCode, String replyText, String exchange, String routingKey) {
   log.error("returnedMessage 消息主体 message : {}", message);
   log.error("returnedMessage 描述：{}", replyText);
   log.error("returnedMessage 消息使用的交换器 exchange : {}", exchange);
   log.error("returnedMessage 消息使用的路由键 routing : {}", routingKey);

   HashMap<String, Object> maps = Maps.newHashMap();
   maps.put("message", message);
   maps.put("replyCode", replyCode);
   maps.put("replyText", replyText);
   maps.put("exchange", exchange);
   maps.put("routingKey", routingKey);
   String returnedMessage = JSON.toJSONString(maps);

   SendFailNoticeEvent noticeEvent = new SendFailNoticeEvent();
   noticeEvent.setLevel(1);
   noticeEvent.setErrorMsg(
         System.lineSeparator() +
               "producer投递消息失败；报错信息: " + returnedMessage);
   noticeEvent.setTalkTypeEnum(DingTalkTypeEnum.BIZ_NOTICE);
   //发送消息投递失败事件，监听器方将信息发送至钉钉机器人群里或者是某个具体的人。
   publisher.publishEvent(noticeEvent);
}
```
### 1.2 (MQ需要做的) 开启持久化参数 durable=true

### 1.3 (消费者) 需要做的 手动ack,保证业务执行完后再ack,通知mq将某条消息删除

```
spring.rabbitmq.listener.simple.acknowledge-mode=manual
```


## 2. RabbitMQ如何保证消息幂等？

### 2.1 生产端做消息幂等 (即不重复投递)
在生产端的话，其实消费端做好幂等，生产端就算投递多次，也无所谓了。 如果实在想在生产者做幂等的话，可以参考消费端的思路，比如通过redis的 setnx (key可以设计成 producer:具体业务:具有唯一性的某几个或者某一个业务字段 作为key) ,添加防重表等等。但是我个人觉得没必要。把消费端做好幂等就可以了。
### 2.2 消费端做消息幂等 (即不重复消费)
- A方案: 使用redis的set命令: 此时redis的服务一定要保证高可用 保证只有一个消息被消费,这种情况下，也保证了多实例(消费者)下，只有一个消费者能消费成功 (我也是这么做的)
    ```java
    /**
    * 是否能消费，用于防止重复消费
    * <p>
    * false 代表未消费过 ，true代表消费过
    *
    * @param content
    * @param queueName
    * @return
    */
    private Boolean checkConsumedFlag(T content, String queueName) {
    String messageKey = queueName + ":" + content.getId();
    if (StringUtils.isBlank(redisTemplate.opsForValue().get(messageKey))) {
        //从redis中没获取到value，说明未消费过该消息，返回true
        return false;
    } else {
        //获取到了value说明消费过，然后将该消息标记为已消费并直接响应ack，不进行下边的业务处理，防止消费n次(保证幂等)
        redisTemplate.opsForValue().set(messageKey, "lock", 60, TimeUnit.SECONDS);
        //事实上，set操作应该放在业务执行完后，确保真正消费成功后执行。这里偷个懒。写在业务执行前了。
        return true;
    }
    }
    ```
- B方案(防重表): 并发高情况下可能会有IO瓶颈 (先读在写) 该方式需要在发送消息时候，指定一个业务上唯一的字段。如 xzll:order:10001 (10001代表订单id) 然后，在消费端获取该字段，并插入到防重表中(插入代码写在哪？) 如果你声明了事务，那么插入防重这段代码位置无需关注(因为出现异常肯定会回滚)，如果没实现事务，那么最好在执行完业务逻辑后，再插入防重表，保证防重表中的数据肯定是消费成功的。\ 实现步骤: \ 接收到消息后，select count(0) from 防重表 where biz_unique_id=message.getBizUniqueId(); 如果大于0，那么说明以及消费过，将直接ack，告知mq删除该消息。如果=0说明没消费过。进行正常的业务逻辑
- C方案(唯一键 : 真正保证了幂等): 直接写) 如果消费端业务是新增操作，我们可以为某几个或者某一个字段设置业务上的唯一键约束，如果重复消费将会插入两条相同的记录，数据库会报错从而可以保证数据不会插入两条。
- D方案(乐观锁):并发高下也可能会产生IO瓶颈 (先读再写) 如果消费端业务是更新操作（例如扣减库存），可以给业务表加一个 version 字段，每次更新把 version 作为条件，更新之后 version + 1。由于 MySQL 的 innoDB 是行锁，当其中一个请求成功更新之后，另一个请求才能进来(注意此时该请求拿到的version还是1)，由于版本号 version 已经变成 2，所以更新操作不会执行，从而保证幂等。





## 3. RabbitMQ重试策略如何配置？
### 消息手动ack + 手动重试
```java
/**
 * 消息最大重试次数
 */
private static final int MAX_RETRIES = 3;
 
/**
 * 重试间隔(秒)
 */
private static final long RETRY_INTERVAL = 5;
 
private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    
@RabbitListener(queues = RabbitMqConfig.USER_ADD_QUEUE, concurrency = "10")
public void userAddReceiver(String data, Message message, Channel channel) throws IOException, InterruptedException {
    UserVo vo = OBJECT_MAPPER.readValue(data, UserVo.class);
    // 重试次数
    int retryCount = 0;
    boolean success = false;
    // 消费失败并且重试次数<=重试上限次数
    while (!success && retryCount < MAX_RETRIES) {
        retryCount++;
        // 具体业务逻辑
        success = messageHandle(vo);
        // 如果失败则重试
        if (!success) {
            String errorTip = "第" + retryCount + "次消费失败" +
                    ((retryCount < 3) ? "," + RETRY_INTERVAL + "s后重试" : ",进入死信队列");
            log.error(errorTip);
            Thread.sleep(RETRY_INTERVAL * 1000);
        }
    }
    if (success) {
        // 消费成功，确认
        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        log.info("创建订单数据消费成功");
    } else {
        // 重试多次之后仍失败，发送到死信队列
        channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
        log.info("创建订单数据消费失败");
    }
}
```