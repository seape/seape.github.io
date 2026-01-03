---
title: "第1章：Axios基础入门"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第1章：Axios基础入门

## 学习目标
1. 了解Axios的概念和优势
2. 掌握Axios的安装和基本配置
3. 学会发送简单的HTTP请求
4. 理解Promise和异步编程基础
5. 掌握基本的错误处理

## 1.1 什么是Axios

### Axios简介
Axios是一个基于Promise的HTTP客户端库，用于浏览器和Node.js环境。它是目前最流行的JavaScript HTTP请求库之一。

### 主要特性
```javascript
// Axios的核心特性
const axiosFeatures = {
  promise: "基于Promise，支持async/await",
  browser: "支持浏览器环境",
  nodejs: "支持Node.js环境", 
  interceptors: "请求和响应拦截器",
  transformation: "自动JSON数据转换",
  cancellation: "请求取消支持",
  protection: "客户端XSRF防护",
  timeout: "请求超时设置",
  wide_browser_support: "广泛的浏览器兼容性"
};
```

### 与其他HTTP库的对比
```javascript
// 对比表格
const comparison = {
  fetch: {
    pros: ["原生API", "现代浏览器支持", "轻量级"],
    cons: ["需要polyfill", "错误处理复杂", "缺少拦截器"]
  },
  xhr: {
    pros: ["原生支持", "完全控制"],
    cons: ["API复杂", "回调地狱", "代码冗长"]
  },
  axios: {
    pros: ["Promise支持", "拦截器", "自动转换", "错误处理", "取消请求"],
    cons: ["需要额外依赖", "包体积相对较大"]
  }
};
```

## 1.2 安装和引入Axios

### NPM安装
```bash
# 使用npm安装
npm install axios

# 使用yarn安装
yarn add axios

# 使用pnpm安装
pnpm add axios
```

### CDN引入
```html
<!-- 通过CDN引入 -->
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

<!-- 或者使用unpkg -->
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
```

### 模块化引入
```javascript
// ES6 模块化引入
import axios from 'axios';

// CommonJS引入
const axios = require('axios');

// 按需引入
import { get, post } from 'axios';
```

## 1.3 基本使用方法

### 发送GET请求
```javascript
// 最简单的GET请求
axios.get('https://jsonplaceholder.typicode.com/posts/1')
  .then(response => {
    console.log('数据:', response.data);
    console.log('状态:', response.status);
    console.log('头信息:', response.headers);
  })
  .catch(error => {
    console.error('错误:', error);
  });

// 使用async/await
async function fetchPost() {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
    console.log(response.data);
  } catch (error) {
    console.error('请求失败:', error);
  }
}
```

### 发送POST请求
```javascript
// POST请求发送数据
const postData = {
  title: 'Hello World',
  body: 'This is a test post',
  userId: 1
};

axios.post('https://jsonplaceholder.typicode.com/posts', postData)
  .then(response => {
    console.log('创建成功:', response.data);
    console.log('状态码:', response.status);
  })
  .catch(error => {
    console.error('创建失败:', error);
  });

// 使用async/await方式
async function createPost() {
  try {
    const response = await axios.post(
      'https://jsonplaceholder.typicode.com/posts',
      {
        title: 'New Post',
        body: 'Post content',
        userId: 1
      }
    );
    console.log('新文章:', response.data);
  } catch (error) {
    console.error('创建失败:', error);
  }
}
```

### 使用配置对象
```javascript
// 使用完整配置对象
const config = {
  method: 'get',
  url: 'https://jsonplaceholder.typicode.com/posts',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  timeout: 5000,
  params: {
    userId: 1,
    _limit: 10
  }
};

axios(config)
  .then(response => {
    console.log('配置请求成功:', response.data);
  })
  .catch(error => {
    console.error('配置请求失败:', error);
  });
```

## 1.4 Promise基础回顾

### Promise概念
```javascript
// Promise的三种状态
const promiseStates = {
  pending: "等待中 - 初始状态",
  fulfilled: "已完成 - 操作成功",
  rejected: "已拒绝 - 操作失败"
};

// Promise基本用法
const myPromise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = Math.random() > 0.5;
    if (success) {
      resolve('操作成功');
    } else {
      reject('操作失败');
    }
  }, 1000);
});

myPromise
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

### async/await语法
```javascript
// async/await让异步代码看起来像同步代码
async function fetchUserData(userId) {
  try {
    // 等待Promise完成
    const userResponse = await axios.get(`/api/users/${userId}`);
    const user = userResponse.data;
    
    // 可以连续等待多个Promise
    const postsResponse = await axios.get(`/api/users/${userId}/posts`);
    const posts = postsResponse.data;
    
    return {
      user,
      posts,
      totalPosts: posts.length
    };
  } catch (error) {
    console.error('获取用户数据失败:', error);
    throw error; // 重新抛出错误
  }
}

// 使用async函数
fetchUserData(1)
  .then(data => console.log('用户信息:', data))
  .catch(error => console.error('处理失败:', error));
```

## 1.5 响应结构详解

### 响应对象结构
```javascript
// Axios响应对象的完整结构
axios.get('/api/users/1')
  .then(response => {
    console.log('响应数据:', response.data);        // 服务器响应数据
    console.log('状态码:', response.status);         // HTTP状态码
    console.log('状态文本:', response.statusText);   // HTTP状态文本
    console.log('响应头:', response.headers);        // 响应头对象
    console.log('请求配置:', response.config);       // 请求配置
    console.log('请求对象:', response.request);      // 请求对象
  });

// 解构赋值提取需要的数据
axios.get('/api/users/1')
  .then(({ data, status, headers }) => {
    console.log('只关心这些数据:', { data, status, headers });
  });
```

### 状态码处理
```javascript
// 根据状态码处理不同情况
async function handleResponse(url) {
  try {
    const response = await axios.get(url);
    
    switch (response.status) {
      case 200:
        console.log('请求成功:', response.data);
        break;
      case 201:
        console.log('创建成功:', response.data);
        break;
      case 204:
        console.log('删除成功，无内容返回');
        break;
      default:
        console.log('其他成功状态:', response.status);
    }
    
    return response.data;
  } catch (error) {
    // 处理错误状态码
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 400:
          console.error('请求参数错误:', data);
          break;
        case 401:
          console.error('未授权访问:', data);
          break;
        case 404:
          console.error('资源不存在:', data);
          break;
        case 500:
          console.error('服务器内部错误:', data);
          break;
        default:
          console.error('其他错误:', status, data);
      }
    }
    throw error;
  }
}
```

## 1.6 基本错误处理

### 错误类型分类
```javascript
// Axios错误处理的完整示例
async function robustRequest(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (error.response) {
      // 服务器响应了错误状态码
      console.error('响应错误:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // 根据错误类型进行不同处理
      if (error.response.status >= 500) {
        console.error('服务器错误，请稍后重试');
      } else if (error.response.status >= 400) {
        console.error('客户端错误，请检查请求');
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误:', error.request);
      console.error('可能是网络连接问题或服务器无响应');
    } else {
      // 请求设置时发生错误
      console.error('请求配置错误:', error.message);
    }
    
    // 通用错误信息
    console.error('完整错误信息:', error.config);
    throw error;
  }
}
```

### 错误重试机制
```javascript
// 简单的重试机制
async function requestWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.log(`第${attempt}次请求失败`);
      
      // 最后一次尝试失败，抛出错误
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// 使用重试机制
requestWithRetry('https://jsonplaceholder.typicode.com/posts/1')
  .then(data => console.log('成功获取数据:', data))
  .catch(error => console.error('多次重试后仍然失败:', error));
```

## 1.7 实践练习

### 练习1：基础请求
```javascript
// 练习：获取用户列表并显示
async function getUserList() {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/users');
    const users = response.data;
    
    console.log(`获取到${users.length}个用户:`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });
    
    return users;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return [];
  }
}

getUserList();
```

### 练习2：POST请求创建资源
```javascript
// 练习：创建新用户
async function createUser(userData) {
  try {
    const response = await axios.post('https://jsonplaceholder.typicode.com/users', {
      name: userData.name,
      email: userData.email,
      phone: userData.phone
    });
    
    console.log('用户创建成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
}

// 测试创建用户
createUser({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '123-456-7890'
});
```

### 练习3：综合应用
```javascript
// 练习：用户管理系统
class UserManager {
  constructor() {
    this.baseURL = 'https://jsonplaceholder.typicode.com';
  }
  
  // 获取所有用户
  async getAllUsers() {
    try {
      const response = await axios.get(`${this.baseURL}/users`);
      return response.data;
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return [];
    }
  }
  
  // 获取单个用户
  async getUser(id) {
    try {
      const response = await axios.get(`${this.baseURL}/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`获取用户${id}失败:`, error);
      return null;
    }
  }
  
  // 创建用户
  async createUser(userData) {
    try {
      const response = await axios.post(`${this.baseURL}/users`, userData);
      console.log('用户创建成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }
  
  // 更新用户
  async updateUser(id, userData) {
    try {
      const response = await axios.put(`${this.baseURL}/users/${id}`, userData);
      console.log('用户更新成功:', response.data);
      return response.data;
    } catch (error) {
      console.error(`更新用户${id}失败:`, error);
      throw error;
    }
  }
  
  // 删除用户
  async deleteUser(id) {
    try {
      await axios.delete(`${this.baseURL}/users/${id}`);
      console.log(`用户${id}删除成功`);
      return true;
    } catch (error) {
      console.error(`删除用户${id}失败:`, error);
      return false;
    }
  }
}

// 使用用户管理系统
async function testUserManager() {
  const userManager = new UserManager();
  
  // 获取所有用户
  const users = await userManager.getAllUsers();
  console.log('所有用户:', users.length);
  
  // 获取特定用户
  const user = await userManager.getUser(1);
  console.log('用户1:', user?.name);
  
  // 创建新用户
  const newUser = await userManager.createUser({
    name: 'Test User',
    email: 'test@example.com'
  });
}

testUserManager();
```

## 本章小结

在第1章中，我们学习了：

1. **Axios概念和优势**：了解了Axios作为HTTP客户端的核心特性和优势
2. **安装和引入**：掌握了多种安装和引入Axios的方法
3. **基本使用**：学会了发送GET、POST等基本HTTP请求
4. **Promise基础**：回顾了Promise和async/await的使用方法
5. **响应处理**：理解了Axios响应对象的结构和数据提取
6. **错误处理**：掌握了基本的错误处理和重试机制

这些基础知识为后续深入学习Axios的高级特性奠定了坚实的基础。在下一章中，我们将详细学习各种HTTP请求方法的使用。

## 关键要点
- Axios是基于Promise的HTTP客户端，支持浏览器和Node.js
- 使用async/await可以让异步代码更加简洁易读
- 正确的错误处理是构建稳定应用的关键
- 响应对象包含data、status、headers等重要信息
- 实践是掌握Axios的最佳方式

## 下一章预告
下一章将深入学习HTTP请求方法，包括GET、POST、PUT、DELETE等方法的详细使用，以及参数传递和数据格式处理。