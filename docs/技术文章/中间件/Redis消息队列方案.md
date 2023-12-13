---
title: Redis 消息队列方案
date: 2022-06-01 09:44:15
tags:
- 'Redis'
categories:
- '运维'
---
<!-- more -->

## List 实现消息队列

   - 使用LPUSH、RPOP 左进右出或RPUSH、LPOP 右进左出，实现消息顺序消费
   - 使用 BLPOP、BRPOP 这种阻塞式读取的命令，实现消息及时消费
   - ack 机制  使用，使用index 读取list 的消息，正常消费完成后再使用POP删除

    ```java
    // 使用redission实现
   @Slf4j
   @Service
   public class QueueService {

      @Autowired
      private RedissonClient redissonClient;
       
      private static final String REDIS_MQ = "redisMQ";
       
      /**
      * 发送消息到队列头部
      *
      * @param message
      */
      public void sendMessage(String message) {
         RBlockingDeque<String> blockingDeque = redissonClient.getBlockingDeque(REDIS_MQ);
       
         try {
               blockingDeque.putFirst(message);
               log.info("将消息: {} 插入到队列。", message);
         } catch (InterruptedException e) {
               e.printStackTrace();
         }
      }
       
    /**
     * 从队列尾部阻塞读取消息，若没有消息，线程就会阻塞等待新消息插入，防止 CPU 空转
     */
    public void onMessage() {
        RBlockingDeque<String> blockingDeque = redissonClient.getBlockingDeque(REDIS_MQ);
        while (true) {
            try {
                String message = blockingDeque.takeLast();
                log.info("从队列 {} 中读取到消息：{}.", REDIS_MQ, message);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
       
        }
    }```
## **发布/订阅**模式
  可以实现进程间的消息传递，其原理如下:
    "发布/订阅"模式包含两种角色，分别是发布者和订阅者。订阅者可以订阅一个或者多个频道(channel)，而发布者可以向指定的频道(channel)发送消息，所有订阅此频道的订阅者都会收到此消息。
    缺点： 无法实现消息持久化，没有订阅者者数据会被丢弃
## 基于zset实现延时队列

   zset 会按 score 进行排序，如果 score 代表想要执行时间的时间戳。在某个时间将它插入zset集合中，它变会按照时间戳大小进行排序，也就是对执行时间前后进行排序。
   起一个死循环线程不断地进行取第一个key值，如果当前时间戳大于等于该key值的socre就将它取出来进行消费删除，可以达到延时执行的目的。

> zset命令
>
> - 范围查询所有 zrange yuwen 0 -1 withscores 
> - 添加/更新 ZADD yuwen 90 s01 89 s03 99 s02 74 s04 97 s05
> - 查询指定分数  ZSCORE yuwen s03
> - 查询分数范围 ZRANGEBYSCORE yuwen 90 100 withscores
> - 删除 ZREM myzset member1

