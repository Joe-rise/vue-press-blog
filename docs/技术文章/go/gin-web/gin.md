---
title: '使用gin部署vue静态页面'
date: 2023-09-21 18:44:15
tags:
- '部署'
- 'vue'
categories:
- 'go'
---

<!-- more -->

## 1、前端打包
> vite build --mode production --base ./

注意--base 一定是./

## 2、go 项目配置

### 2.1 项目根目录下新增web/dist目录
将前端打包的dist内容拷贝到web/dist目录下
### 2.2 根目录下新建embed.go文件
```go
package go_web

import (
	"embed"
	"io/fs"
)

//go:embed web/dist
var embedFrontend embed.FS

func GetFrontendAssets() (fs.FS, error) {
	return fs.Sub(embedFrontend, "web/dist")
}
```
2.3 修改go项目route配置

```go
// ui
front, err := go_web.GetFrontendAssets()
if err != nil {
    log.Logger.Error("HttpError", zap.Any("HttpError", err))
}

HTTPCacheForUI(r)
r.StaticFS("/ui/", http.FS(front))
r.NoRoute(func(c *gin.Context) {
    log.Logger.Warn("UiNoRouteLog",
        log.String("URL", c.Request.RequestURI),
        log.String("Method", c.Request.Method),
        log.Int("Status", 404),
        log.Any("Duration", 0),
    )

    if strings.HasPrefix(c.Request.RequestURI, "/ui/") {
        path := strings.TrimPrefix(c.Request.RequestURI, "/ui/")
        locationPath := strings.Repeat("../", strings.Count(path, "/"))
        c.Status(http.StatusFound)
        c.Writer.Header().Set("Location", "./"+locationPath)
    }
})



func HTTPCacheForUI(app *gin.Engine) {
	app.Use(func(c *gin.Context) {
		if c.Request.Method == "GET" || c.Request.Method == "HEAD" {
			if strings.Contains(c.Request.RequestURI, "/ui/assets/") {
				c.Writer.Header().Set("cache-control", "public, max-age=2592000")
				c.Writer.Header().Set("expires", time.Now().Add(time.Hour*24*30).Format(time.RFC1123))
				if strings.Contains(c.Request.RequestURI, ".js") {
					c.Writer.Header().Set("content-type", "application/javascript")
				}
				if strings.Contains(c.Request.RequestURI, ".css") {
					c.Writer.Header().Set("content-type", "text/css; charset=utf-8")
				}
			}
		}

		c.Next()
	})
}

```

## 3、启动项目
访问localhost:端口号/ui，即可看到前端页面




