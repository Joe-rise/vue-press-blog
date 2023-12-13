---
title: 返回流式数据
date: 2023-06-18 15:24:11
tags:
- 'Spring'
- '流式数据'
categories:
- 'java'
---
<!-- more -->
```java
@PostMapping("/stream")
public ResponseEntity<StreamingResponseBody> stream() {
    StreamingResponseBody stream = out -> {
        for (int i = 0; i < 3; i++) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            out.write(("This is line " + i + "\n").getBytes());
            out.flush();
        }
    };
    return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(stream);
}
```