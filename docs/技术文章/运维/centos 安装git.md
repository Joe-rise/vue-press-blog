---
title: centos7安装git
date: 2021-07-22 12:44:15
tags:
- 'git'
categories:
- '运维'
---
<!-- more -->

安装方法有两种

### 1yum命令安装(可能不是最新版本)
```shell
yum install -y git

卸载已安装的 Git

yum remove git
```

### 2源码安装

```shell
安装前需要安装依赖库

yum install curl-devel expat-devel gettext-devel openssl-devel zlib-devel
yum install  gcc perl-ExtUtils-MakeMaker

下载安装包

cd /usr/bin
wget https://mirrors.edge.kernel.org/pub/software/scm/git/git-2.24.0.tar.gz

解压安装

tar zxf git-2.24.0.tar.gz

编译安装

cd git-2.24.0
make prefix=/usr/local/git all
make install

添加至环境变量

echo "export PATH=$PATH:/usr/local/git/bin" >> /etc/profile
source /etc/profile
```
### git 配置
```shell
# 配置用户名 和邮箱

在使用 Git 之前，需要先配置用户名和邮箱，这样在提交代码时，Git 就知道是谁提交的了。可以使用以下命令来配置：

git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
其中，--global 表示全局配置，即对所有 Git 仓库生效。如果只想对当前仓库生效，可以去掉 --global 参数。

配置完成后，可以使用以下命令来查看配置信息：


git config --list
如果需要修改配置信息，可以再次运行上述命令并修改对应的值即可。
```