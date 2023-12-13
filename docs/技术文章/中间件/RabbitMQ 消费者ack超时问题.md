---
title: RabbitMQ 消费者ack超时问题
date: 2023-09-01 12:44:15
tags:
- 'RabbitMQ'
- '消息队列'
categories:
- '中间件'
---
<!-- more -->

### 报错信息

> Shutdown Signal: channel error; protocol method: #method<channel.close>(reply-code=406, reply-text=PRECONDITION_FAILED - delivery acknowledgement on channel 2 timed out. Timeout value used: 1800000 ms. This timeout value can be configured, see consumers doc guide to learn more, class-id=0, method-id=0)

### 解决方法
rabbitmq默认客户端超时时间是30分钟，手动ACK情况下会如果业务事件较长会超时，可以采用下面修改方式：

第一种：需要重启MQ

          .在etc目录下建一个文件，/etc/rabbitmq.conf，rabbitmq默认不会建这个文件，然后文件里面设置consumer_timeout = 360000（根据需要来决定）。然后重新启动rabbitmq。

第二种：无需重启，动态修改：

    修改前，在MQ服务器上执行：rabbitmqctl eval 'application:get_env(rabbit,consumer_timeout).' 来查看当前时间是多少，然后： 

1 ：在MQ服务器上执行：

       rabbitmqctl eval 'application:set_env(rabbit,consumer_timeout,360000).' 

  2：修改后，再执行rabbitmqctl eval 'application:get_env(rabbit,consumer_timeout).' 验证。