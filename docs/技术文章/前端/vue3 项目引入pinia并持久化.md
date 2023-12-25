---
title: vue3 项目引入pinia并持久化
date: 2023-06-25 12:44:19
tags:
- 'vue3'
categories:
- '前端'
- 'pinia'
---
<!-- more -->

## 1、安装pinia
> pnpm install pinia

main.ts 引入

```javascript
import { createPinia } from "pinia"
const pinia = createPinia();
app.use(pinia)
```
## 2、创建store 文件
在src/store下新建index.js文件

```js
import { defineStore } from 'pinia'

// 用户store
export const useUserStore = defineStore('user', {
    persist: true,
    state: () => ({
        token: '',
        userName: '',
        uuid: '',
        isAuthenticated: '',
    }),
    getters: {
        getToken() {
            return this.token
        },
        getUserName() {
            return this.userName
        },
        IsAuthenticated() {
            return this.isAuthenticated
        }
    },
    actions: {
        setToken(token) {
            this.token = token
        },
        setUuid(val) {
            this.uuid = val
        },
        login() {
            this.isAuthenticated = true
        },
        logout() {
            this.isAuthenticated = false
        }
    }
})
```

state 中定义全局共享的变量
actions 中定义变量的设置方法

## 3、使用store
### 3.1 在需要设置store的组件中配置user信息
```js
// 先引入
import { useUserStore } from '../store/index'
const userStore = useUserStore()


const login = async () => {
    const res = await userLogin({ "username": username.value, "password": password.value })
    console.log("login resp:", res)
    if(res.code===0){
        loginSuccess.value = true
        userStore.login()
        userStore.setUuid(res.data.uuid)
    }else{
        loginSuccess.value = false
        errMsg.value = res.msg
    }
};
```

### 3.2 读取userStore信息

```js
// 先引入
import { useUserStore } from '../store/index'
const userStore = useUserStore()
// 使用computed 实时响应sotre中的数据变化
const isAuthenticated = computed(() => (userStore.isAuthenticated));
```
如果需要获取实时变化的userStore 的信息，一定要使用computed，否则值发生变化不会更新


## 4、配置持久化
 ### 4.1 安装插件 pinia-plugin-persistedstate
 > pnpm install pinia-plugin-persistedstate
 ### 4.2 main.ts配置
```javascript
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
pinia.use(piniaPluginPersistedstate);
```



