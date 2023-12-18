---
title: docker 容器内安装wget等
date: 2023-09-01 12:44:15
tags:
- 'docker'
- 'wget'
categories:
- '运维'
---
<!-- more -->


## 1、进入容器
``` shell
docker exec -ti 容器名 /bin/bash
```

## 2、使用apt-get
同步 /etc/apt/sources.list 和 /etc/apt/sources.list.d 中列出的源的索引，获取到最新的软件包

```shell
apt-get update
```
## 安装vim

``` sh
apt-get install vim
```
## 安装ping命令

```shell
apt-get install iputils-ping
```
## 安装wget

```shell
apt-get install wget
```
## 安装ps

```shell
apt-get install procps
```