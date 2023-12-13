---
title: 常用脚本
date: 2022-05-01 12:44:15
tags:
- 'linux'
categories:
- '运维'
---
<!-- more -->

## 启动python脚本 并输出日志到文件
```sh
nohup python3 -u doReport.py --env=prod > doReport.out 2>&1 &
```

## pip 使用清华源
```sh
pip3 install scikit-learn -i https://pypi.tuna.tsinghua.edu.cn/simple
```