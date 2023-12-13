---
title: '使用protobuf'
date: 2023-09-21 18:44:15
tags:
- '部署'
- 'go'
categories:
- 'go'
---

<!-- more -->

## 1、安装protobuf编译器
在 官方github 选择适合自己系统的Proto编译器程序进行下载安装、配置环境变量

## 2、下载protobuf的golang支持库，安装protoc-gen-go
protoc-gen-go用来将 .proto 文件转换为 Golang 代码。

在终端运行命令：

```sh
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
```

## 3、protobuf使用示例
### 1、go项目中创建 message.proto文件
```go
// message.proto
syntax = "proto3";

package v1;
option go_package ="./";
message Message {
  string content = 1;
}

```
### 2、编译.proto文件，生成Go语言文件。执行如下命令：   

```sh
## 1、安装protobuf编译器
protoc --go_out=. message.proto
```

### 3、使用proto反序列化

```go
// 创建 protobuf 消息
message := &Message{
    Content: "Hello, Protobuf!",
    Age:     234,
}
data, err := proto.Marshal(message)
fmt.Println("protobuf:", data)
```
