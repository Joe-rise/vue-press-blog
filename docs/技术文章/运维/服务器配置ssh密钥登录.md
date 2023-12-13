---
title: 服务器配置ssh密钥登录
date: 2023-07-07 12:44:15
tags:
- 'ssh'
categories:
- '运维'
---
<!-- more -->

## 前置环境
> windows 10 ,centos 7

## 1. windows 本地生成密钥
执行以下命令

```shell
ssh-keygen -t rsa
```

一路回车 默认生成到 C:\Users\Administrator\.ssh

生成`id_rsa`, `id_rsa.pub` 两个文件，分别是 私钥/公钥

## 2、配置服务器

2.1 配置服务器文件权限

```shell
chmod -R 700 ~/.ssh/  
chmod 600 ~/.ssh/authorized_keys
```

2.2 设置 SSH，打开密钥登录功能

```shell
vim /etc/ssh/sshd_config
# 添加以下内容
RSAAuthentication yes
PubkeyAuthentication yes
```

2.3 复制公钥到服务器 ~/.ssh/authorized_keys

```shell
vim ~/.ssh/authorized_keys
# 粘贴之前windows上生成的 id_rsa.pub 内容
```

## 3、重启服务

```shell
service sshd restart
```
