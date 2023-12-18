---
title: docker rabbitMQ 安装延时队列插件
date: 2023-08-01 12:44:15
tags:
- 'RabbitMQ'
- '消息队列'
categories:
- '中间件'
---
<!-- more -->

## 1下载插件到容器内
 在[这个网站](https://www.rabbitmq.com/community-plugins.html) 上找到插件的下载链接
 容器内wget 或 使用docker cp 复制到容器内
 ```sh
docker cp /rabbitmq_delayed_message_exchange-3.8.0.ez rabbit:/plugins
```

## 2 启用插件
```sh
#   进入容器启用插件
   docker exec -it rabbit /bin/bash
   rabbitmq-plugins enable rabbitmq_delayed_message_exchange

```

## 3 退出容器并重启服务

```sh
docker restart rabbit
```