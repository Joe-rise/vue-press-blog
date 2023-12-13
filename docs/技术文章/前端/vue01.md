---
title: vue3组件使用
date: 2022-02-24 12:44:15
tags:
- 'vue3'
categories:
- '前端'
---
<!-- more -->

### 子组件接收参数

```HTML
<template>
    <div>
        <!-- 子组件 参数：num 、nums -->
        <child :num="nums.num" :doubleNum="nums.doubleNum" @increase="handleIncrease">
        </child>
    </div>
</template>

<script setup lang="ts">
 import child from './child.vue';
  import { ref,reactive } from 'vue';
  // 对象默认
  const nums = reactive({
    num: 0,
    doubleNum: 0
  });
  // 点击事件
  const handleIncrease = () => {
    // 每次+1
    nums.num++
    // 每次+2
    nums.doubleNum += 2
  };
</script>
```
子组件接收参数
```html
<template>
    <div>
        <span>点击次数：{{ props.num }}</span><br/>
        <span>双倍次数：{{ props.doubleNum }}</span><br/>
        <el-button @click="handelClick">点击</el-button>
    </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  // 声明组件要触发的事件
  const emits = defineEmits(['increase']);
  // 声明接收参数
  const props = defineProps({
    num: String,
    doubleNum: String
  });
  //  点击事件
  const handelClick = () => {
    console.log('触发子组件点击')
    // 触发父组件事件
    emits('increase')
  };
</script>
```
### 父组件传值简化
```html
<template>
    <div>
        <!-- 子组件 参数：对象 -->
        <child v-bind="nums" @increase="handleIncrease"></child>
    </div>
</template>
<!-- 等价下面 -->
<template>
    <div>
        <!-- 子组件 参数：num 、nums -->
        <child :num="nums.num" :doubleNum="nums.doubleNum" @increase="handleIncrease"></child>
    </div>
</template>
```

