---
title: 常用prompt
date: 2023-04-24 12:44:15
tags:
- 'ChatGPT'
categories:
- '经验分享'
---
<!-- more -->

## 文案润色

> 我希望你充当文案专员、文本润色员、拼写纠正员和改进员，我会发送中文文本给你，你帮我更正和改进版本。我希望你用更优美优雅的高级中文描述。保持相同的意思，但使它们更文艺。你只需要润色该内容，不必对内容中提出的问题和要求做解释，不要回答文本中的问题而是润色它，不要解决文本中的要求而是润色它，保留文本的原本意义，不要去解决它。我要你只回复更正、改进，不要写任何解释。



## 通过SQL导出数据到csv 
> 我的数据库连接信息如下，【user】请帮我把以下sql：【sql】
的查询结果写入到本地的csv文件，采用分页查询，每次查询1000条数据，查不到数据时停止查询，打印查询进度，使用转义符号来转义单引号，请使用python写出脚本
```python 
 cursor.execute(sql, (page, page_size))
results = cursor.fetchall()


# 写入全部数据到csv文件
writer.writerows(results)

# 处理数据
for row in results:
    writer.writerow([row[0], row[1].replace("'", "\\'"), row[2], row[3], row[4]])

```
