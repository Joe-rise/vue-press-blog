---
title: 使用filebeat监听异常日志发送redis
date: 2023-08-01 12:44:15
tags:
- 'filebeat'
categories:
- '中间件'
---
<!-- more -->

使用场景： **自定义监听日志关键字符**，第一时间发现生产问题，实测从服务打出异常日志到redis监听到日志延迟在5s左右

适用于：服务机器数有限的情况，目前全部采用手动部署的方式，



## 一 、在目标机器上部署filebeat



### 1. 下载并安装GPG key

```sh
rpm --import https://packages.elastic.co/GPG-KEY-elasticsearch
```

### 2.添加yum仓库

```shell
vim /etc/yum.repos.d/filebeat.repo
cat /etc/yum.repos.d/filebeat.repo

[elastic-8.x]
name=Elastic repository for 8.x packages
baseurl=https://artifacts.elastic.co/packages/8.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md
```

### 3. 安装filebeat插件

```sh
yum install   -y filebeat
```

### 4. 启动

```sh
systemctl start filebeat
```

### 5. 停止

```sh
systemctl stop filebeat
```

### 6.设置开机启动

```sh
systemctl enable filebeat
```



### filebeat 配置多行异常日志合成单个事件发送

```yml
// 正常日志的前缀正则匹配
multiline.pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}' 
multiline.negate: true
multiline.match: after

```



#### 方法2 （部署后长时间运行会出现自动退出现象）

1. 官网下载filebeat https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.9.1-linux-x86_64.tar.gz

2. 上传至服务器 /usr/local/filebeat

3. tarf -zx 解压 

4. 编辑/usr/local/filebeat/ 下filebeat.yml 配置文件

   ```yml
     # =============日志输入配置=================
     filebeat.inputs:
   
     - type: log
       # Unique ID among all inputs, an ID is required.
       id: my-filestream-id
       # Change to true to enable this input configuration.
       enabled: true
       harvester_limit: 1
       # 配置输入过滤条件
       # include_lines: ["/mq/start"]
       paths:
         - /root/java/logs/all.log
     # =============日志输出配置=================
   
     output.redis:
       hosts: ["10.6.133.65:6379"]
       password: pass1w22ord12543!#
       db: 3
       # 发送至redis list  也可选用发布订阅模式
       datatype: list
       # 默认redis key 必须配置，否则会默认为 filebeat
       key: appLog
       # 配置条件key
       keys:
         - key: "mqStart_list" 
           when.contains:
             message: "/mq/start"
         - key: "delete_list"  
           when.contains:
             message: "数据删除消息"
   
   ```

5. 启动filebeat   

   ```sh
   ./filebeat $
   ```

## 二、配置redis日志监听 

springboot中代码如下

```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.annotation.PostConstruct;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class RedisListListener {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    RestTemplate restTemplate;

    @PostConstruct
    public void startListening() {
        Thread thread = new Thread(() -> {
            while (true) {
                String mqStart_list = null;
                try {
                    mqStart_list = stringRedisTemplate.opsForList().rightPop("mqStart_list", 30, TimeUnit.SECONDS);
                    if (mqStart_list != null) {
                        log.info("监听到redisList新增：{}", mqStart_list);
                        // todo  发送告警

                    }
                } catch (Exception ignored) {
                }
            }
        });
        thread.start();
    }
}
```



eg filebeat 参考配置

```yml
# ============================== Filebeat inputs ===============================
filebeat.inputs:
- type: log
  id: my-filestream-id
  enabled: true
  #harvester_limit: 1 
  multiline.pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
  multiline.negate: true
  multiline.match: after

  #include_lines: ["start"]
  paths:
    - /root/java/logs/all.log
# ================================Redis output==================================
output.redis:
  hosts: ["10.6.133.65:6379"]
  key: appLog
  password: password123!#
  db: 3
  datatype: list
  keys:
    - key: "exception_list"
      when.contains:
        message: "Exception"
    - key: "mqStart_list"
      when.contains:
        message: "mq/start"
    - key: "delete_list"
      when.contains:
        message: "数据删除消息"

```

