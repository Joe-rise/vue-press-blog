---
title: '实现自定义starter'
date: 2023-03-01 12:44:15
tags:
- 'Spring'
- 'SpringBoot'
categories:
- 'java'
---
<!-- more -->

### pom.xml依赖
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.4.6</version>
    <relativePath/> <!-- lookup parent from repository -->
  </parent>
  <groupId>com.example</groupId>
  <artifactId>spring-boot-starter-demo</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <name>spring-boot-starter-demo</name>
  <description>Demo project for Spring Boot</description>

  <properties>
    <java.version>1.8</java.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-configuration-processor</artifactId>
      <optional>true</optional>
    </dependency>

  </dependencies>
</project>

```


###  resources 下新建META-INF 文件夹 
spring.factories 文件内容
``` yml
org.springframework.boot.autoconfigure.EnableAutoConfiguration=org.example.conf.TosConfig

```

关键词：开箱即用、减少大量的配置项、约定大于配置。

总结
Spring Boot在启动时扫描项目所依赖的JAR包，寻找包含spring.factories文件的JAR包，
然后读取spring.factories文件获取配置的自动配置类AutoConfiguration`，
然后将自动配置类下满足条件(@ConditionalOnXxx)的@Bean放入到Spring容器中(Spring Context)
这样使用者就可以直接用来注入，因为该类已经在容器中了。