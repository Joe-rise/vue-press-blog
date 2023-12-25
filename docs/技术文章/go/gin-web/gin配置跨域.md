---
title: 'gin配置跨域'
date: 2023-09-27 18:43:15
tags:
- '跨域'
- 'gin'
categories:
- 'go'
---

<!-- more -->
## 1 安装依赖

使用官方提供的 "github.com/gin-contrib/cors" 
> go get github.com/gin-contrib/cors


## 2 配置router

```go
server := gin.Default()
config := cors.DefaultConfig()
// 允许所有来源访问，可以根据需要修改为特定的域名或 IP
config.AllowAllOrigins = true
// 允许所有 HTTP 方法
config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
// 允许携带认证信息，如 Cookie、HTTP 认证头等
config.AllowCredentials = true

server.Use(cors.New(config))
```

## 可能遇到的坑
前端axios 不能配置   withCredentials: true, 否则会以下错误
> The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.