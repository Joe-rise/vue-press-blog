---
title: 'ZincSearch'
date: 2023-09-01 12:44:15
tags:
- '搜索引擎'
- '全文索引'
- 'ZincSearch'
categories:
- '中间件'
---

<!-- more -->



## 使用模式

ZincSearch 中存储需要查询和展示的关键信息，数据的详细信息使用 mysql存储

如何和Mysql 保持一致： 每5分钟将变更的数据批量推送到mq ，由mq来更新es中的数据，比每次数据变化就发送给下游，效率高很多


docker 搭建
```sh
docker run  -p 4080:4080 \
    -e ZINC_FIRST_ADMIN_USER=admin -e ZINC_FIRST_ADMIN_PASSWORD=Complexpass#123 \
    --name zincsearch public.ecr.aws/zinclabs/zincsearch:latest
```


## 1. 创建索引

POST http://localhost:4080/api/index

注意： index 设置为false 将无法用于查询和过滤

```json
{
    "name": "audit_log",
    "storage_type": "disk",
    "shard_num": 3,
    "mappings": {
        "properties": {
            "user_name": {
                "type": "text",
                "index": true,
                "store": true,
                "highlightable": false
            },
            "description": {
                "type": "text",
                "index": true,
                "store": true,
                "highlightable": true
            },
            "operation_type": {
                "type": "numeric",
                "index": false,
                "sortable": false,
                "aggregatable": true
            },
            "module": {
                "type": "numeric",
                "index": false,
                "sortable": false,
                "aggregatable": true
            },
            "create_time": {
                "type": "date",
                "format": "2006-01-02 15:04:05",
                "index": true,
                "sortable": true,
                "aggregatable": true
            }
        }
    }
}

```





## 2. 使用bulk API 导入数据

先将mysql 数据导出csv格式，

然后使用python 脚本转为ndjson格式，

将ndjson文件上传至服务器

```sh
curl http://localhost:4080/api/_bulk -i -u admin:Complexpass#123  --data-binary "@audit_log.ndjson"
```

**ndjson数据格式**

```json
{"index": {"_index": "audit_log", "_id": "2228975"}}
{"user_name": "test", "description": "通过条件[文件名: pvs-46; 是否通过文件名排序: false; 是否通过id升序: false; 当前页数: 1; 分页大小: 15; ]查询了内容", "operation_type": 0, "module": 0, "create_time": "2023-08-09 16:32:46"}
{"index": {"_index": "audit_log", "_id": "2228976"}}
{"user_name": "tets", "description": "通过条件[文件名: pvs_46; 是否通过文件名排序: false; 是否通过id升序: false; 当前页数: 1; 分页大小: 15; ]查询了内容", "operation_type": 0, "module": 0, "create_time": "2023-08-09 16:32:54"}
```

坑： 接口返回成功数据并未完全导入成功，需要等待一会，目前测试一次导入70W条数据没有问题

实测 2c4g 机器一次导入60w数据需要6分钟
当数据量很大时无法一次导入时，可以采用以下python脚本进行数据拆分
```python
import os
import json

# 定义大文件路径和输出目录
input_file = 'data_file.ndjson'
output_dir = './split_files/'

# 每个新文件的组数据数量*2  60W条数据
group_per_file = 1200000

# 创建输出目录
os.makedirs(output_dir, exist_ok=True)

# 打开大文件进行读取
with open(input_file, 'r') as f:
    # 初始化计数器和文件名序号
    count = 0
    file_index = 1
    output_file = None

    # 逐行读取大文件
    for line in f:
        # 检查是否需要创建新文件
        if count % group_per_file == 0:
            # 关闭上一个文件的写入流
            if output_file:
                output_file.close()
            
            # 创建新文件并打开写入流
            output_file_path = os.path.join(output_dir, f'data_file_{file_index}.djson')
            output_file = open(output_file_path, 'w')
            file_index += 1
        
        # 写入当前行到新文件中
        output_file.write(line)
        count += 1
    
    # 关闭最后一个文件的写入流
    if output_file:
        output_file.close()

print('拆分完成！')

```



当存在多个的ndjson文件需要导入时，可以使用以下shell脚本进行自动导入
```sh
#!/bin/bash
# 起始文件后缀
counter=9
# 结束文件后缀
while [ $counter -le 21 ]
do
    filename="data_file_${counter}.ndjson"
    echo "当前正在执行文件: $filename"
    command="curl http://localhost:4080/api/_bulk -i -u admin:Complexpass#123 --data-binary \"@$filename\""
    eval $command

    sleep 360
    counter=$((counter+1))
done
```
