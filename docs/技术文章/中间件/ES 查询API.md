---
title: ES查询API
date: 2022-02-24 12:44:15
tags:
- 'ES'
categories:
- '中间件'
---
<!-- more -->


## 1. 基本查询类型
- match_all  查询全部
**注意**： 数据量大（100W数据以上）时禁止使用查询全部，会直接把服务卡死
- match 和match_phrase的区别

    match 和match_phrase查询的关键字都会被分词，match_phrase 要求查询结果中包含所有查询的分词结果，并且顺序保持一致

- query_string

    可以匹配文档中的任意字段进行全文搜索

    - 使用复杂的语法

      ```json
      {
          "query": {
              "query_string": {
                  "query": "Men -Event:Football"
              }
          }
      }
      ```

      

    - 指定查询字段request

    ```json
    {
        "query": {
            "query_string": {
                "query": "keyword",
                "fields": ["field1", "field2", "field3"]
            }
        }
    }
    ```

- term 查询

    对关键词不分词进行全部匹配

    ```json
    {
        "query": {
            "term": {
                "field": "word"
            }
        }
    }
    ```

    

- prefix查询

    ```json
    {
        "query": {
            "prefix": {
                "field": "qu"
            }
        }
    }
    ```

    前缀查询，类似mysql  like “qu%”

## 2. Bool 查询

```json
{
    "query": {
        "bool": {
            "must": [
                {
                    "match": {
                        "City": "paris"
                    }
                },
                {
                    "match": {
                        "Medal": "gold"
                    }
                }
            ],
            "should": [],
            "must_not": [],
            "filter": [
                {
                    "term": {
                        "Country": "ger"
                    }
                },
                {
                    "range": {
                        "@timestamp": {
                            "gte": "2023-06-28 13:26:27",
                            "lte": "2023-06-28 13:26:27",
                            "format": "2006-01-02 15:04:05"
                        }
                    }
                }
            ]
        }
    },
    "sort": [
        {
            "@timestamp": {
                "order": "desc"
            }
        }
    ],
    "size": 10
}
```

一旦指定sort 将不按照得分排序


查询关键字高亮
```json
{
    "query": {
        "bool": {
            "must": [
                {
                    "match": {
                        "description": "文件"
                    }
                },
                 {
                    "match": {
                        "user_name": "乔"
                    }
                }
            ],
        }
    },
    "highlight": {
        "pre_tags": [
            "<span style='color:red'>"
        ],
        "post_tags": [
            "</span>"
        ],
        "fields": {
            "description": {},
            "user_name": {}
        }
    },
    "from": 1,
    "size": 10
}
```

## 3聚合查询

分组
```json
{
    "aggs": {
        // 聚合查询名
        "moduleGroup": {
            // 聚合查询类型
            "terms": {
                // 聚合查询字段
                "field": "file_extension"
            }
        }
    },
    // 加上不展示数据 只展示聚合结果
    "size": 0
}
```
分组后聚合
```json
{
    "query":{
        "term":{
            "location":"字节云"
        }
    },
    "aggs": {
        "moduleGroup": {
            "terms": {
                "field": "file_extension"
            },
            //  分组后聚合
            "aggs":{
                // 分组后聚合的字段名称
                "aggSum":{
                    // 聚合操作
                    "sum":{
                        // 聚合字段
                        "field":"file_size"
                    }
                }
            }
        }
    },
    "size": 0
}
```

求某个字段平均值
```json
{
    "query": {
        "term": {
            "location": "字节云"
        }
    },
    "aggs": {
        "avgFileSize": {
            "avg": {
                "field": "file_size"
            }
        }
    },
    "size": 0
}
```

多字段聚合
![Alt text](image.png)
一次查询多个聚合
![Alt text](image-1.png)
分桶后展示前5条数据
![Alt text](image-2.png)
对聚合进行排序
![Alt text](image-3.png)

直方图统计
通过create_time 查询每天上传的文件数量
```json
{
    "query": {
        "range": {
            "create_time": {
                "gte": "2023-06-01 00:00:00",
                "lte": "2023-06-30 13:26:27",
                "format": "2006-01-02 15:04:05"
            }
        }
    },
    "aggs": {
        "agg_dataUpload": {
            "date_histogram": {
                "field": "create_time",
                "calendar_interval":"day"
            }
        }
    },
    "size": 0
}
```
