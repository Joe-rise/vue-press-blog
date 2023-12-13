---
title: linux 安装docker
date: 2022-08-01 10:44:15
tags:
- 'docker'
categories:
- '运维'
---
<!-- more -->

## 安装需要的软件包
```sh
yum install -y yum-utils device-mapper-persistent-data lvm2
```
## 设置yum安装源
```shell
yum-config-manager --add-repo http://download.docker.com/linux/centos/docker-ce.repo（中央仓库）
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo（国内建议安装阿里仓库）

```
## 安装
```shell
yum install -y docker-ce docker-ce-cli http://containerd.io
```
## 启动 Docker 并设置开机自启
```sh
systemctl start docker
systemctl enable docker
```