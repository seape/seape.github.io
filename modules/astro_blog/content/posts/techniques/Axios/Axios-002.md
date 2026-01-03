---
title: "第2章：HTTP请求方法详解"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第2章：HTTP请求方法详解

## 学习目标
1. 掌握GET请求的使用方法
2. 学会POST请求发送数据
3. 理解PUT、PATCH、DELETE等方法
4. 掌握请求参数的传递方式
5. 学会处理不同的数据格式

## 2.1 HTTP方法概述

### REST架构中的HTTP方法
```javascript
// HTTP方法与CRUD操作的对应关系
const httpMethodMapping = {
  GET: {
    purpose: "读取资源",
    crud: "Read",
    idempotent: true,
    safe: true,
    examples: ["获取用户列表", "查看文章详情", "搜索商品"]
  },
  POST: {
    purpose: "创建资源",
    crud: "Create", 
    idempotent: false,
    safe: false,
    examples: ["注册用户", "发表文章", "提交订单"]
  },
  PUT: {
    purpose: "完整更新资源",
    crud: "Update",
    idempotent: true,
    safe: false,
    examples: ["更新用户信息", "替换文章内容"]
  },
  PATCH: {
    purpose: "部分更新资源", 
    crud: "Update",
    idempotent: false,
    safe: false,
    examples: ["修改用户头像", "更新文章标题"]
  },
  DELETE: {
    purpose: "删除资源",
    crud: "Delete",
    idempotent: true,
    safe: false,
    examples: ["删除用户", "删除文章", "取消订单"]
  }
};
```

### Axios支持的所有方法
```javascript
// Axios提供的便捷方法
const axiosMethods = {
  'axios.request(config)': '通用请求方法',
  'axios.get(url[, config])': 'GET请求',
  'axios.delete(url[, config])': 'DELETE请求',
  'axios.head(url[, config])': 'HEAD请求',
  'axios.options(url[, config])': 'OPTIONS请求',
  'axios.post(url[, data[, config]])': 'POST请求',
  'axios.put(url[, data[, config]])': 'PUT请求',
  'axios.patch(url[, data[, config]])': 'PATCH请求'
};
```

## 2.2 GET请求详解

### 基本GET请求
```javascript
// 最简单的GET请求
async function basicGetRequest() {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    console.log('获取到的文章:', response.data.slice(0, 3)); // 只显示前3篇
    return response.data;
  } catch (error) {
    console.error('GET请求失败:', error);
    throw error;
  }
}
```

### 带参数的GET请求
```javascript
// 方式1：URL拼接参数
async function getWithUrlParams() {
  const url = 'https://jsonplaceholder.typicode.com/posts?userId=1&_limit=5';
  const response = await axios.get(url);
  console.log('URL参数方式:', response.data);
  return response.data;
}

// 方式2：使用params配置
async function getWithParamsConfig() {
  const response = await axios.get('https://jsonplaceholder.typicode.com/posts', {
    params: {
      userId: 1,
      _limit: 5,
      _sort: 'id',
      _order: 'desc'
    }
  });
  console.log('params配置方式:', response.data);
  return response.data;
}

// 方式3：动态构建参数
async function getWithDynamicParams(filters) {
  const params = {};
  
  // 根据条件动态添加参数
  if (filters.userId) params.userId = filters.userId;
  if (filters.limit) params._limit = filters.limit;
  if (filters.search) params.q = filters.search;
  
  const response = await axios.get('https://jsonplaceholder.typicode.com/posts', {
    params
  });
  
  console.log('动态参数:', params);
  console.log('结果:', response.data);
  return response.data;
}
```

### GET请求的高级用法
```javascript
// 带请求头的GET请求
async function getWithHeaders() {
  const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1', {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'MyApp/1.0',
      'Authorization': 'Bearer your-token-here'
    }
  });
  
  console.log('请求头信息:', response.config.headers);
  console.log('响应数据:', response.data);
  return response.data;
}

// 设置超时的GET请求
async function getWithTimeout() {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts', {
      timeout: 5000, // 5秒超时
      params: {
        _limit: 10
      }
    });
    
    console.log('在超时前获取到数据:', response.data.length);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('请求超时');
    }
    throw error;
  }
}
```

## 2.3 POST请求详解

### 发送JSON数据
```javascript
// 发送JSON格式数据
async function postJsonData() {
  const postData = {
    title: '新文章标题',
    body: '这是文章的内容部分',
    userId: 1,
    tags: ['javascript', 'axios', 'http'],
    publishedAt: new Date().toISOString()
  };
  
  try {
    const response = await axios.post('https://jsonplaceholder.typicode.com/posts', postData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('创建成功:', response.data);
    console.log('状态码:', response.status);
    return response.data;
  } catch (error) {
    console.error('POST请求失败:', error);
    throw error;
  }
}
```

### 发送表单数据
```javascript
// 发送表单格式数据 (application/x-www-form-urlencoded)
async function postFormData() {
  const formData = new URLSearchParams();
  formData.append('title', '表单提交的标题');
  formData.append('body', '表单提交的内容');
  formData.append('userId', '1');
  
  try {
    const response = await axios.post('https://jsonplaceholder.typicode.com/posts', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('表单提交成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('表单提交失败:', error);
    throw error;
  }
}

// 使用qs库处理复杂表单数据
const qs = require('qs'); // 需要安装: npm install qs

async function postComplexFormData() {
  const data = {
    user: {
      name: '张三',
      email: 'zhangsan@example.com',
      preferences: ['news', 'sports', 'technology']
    },
    settings: {
      theme: 'dark',
      notifications: true
    }
  };
  
  const formData = qs.stringify(data);
  
  const response = await axios.post('/api/user/profile', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  return response.data;
}
```

### 发送文件和多媒体数据
```javascript
// 发送FormData（用于文件上传）
async function postWithFormData() {
  const formData = new FormData();
  
  // 添加文本字段
  formData.append('title', '带文件的文章');
  formData.append('description', '这篇文章包含图片');
  
  // 添加文件（在浏览器环境中）
  const fileInput = document.getElementById('file-input');
  if (fileInput && fileInput.files[0]) {
    formData.append('image', fileInput.files[0]);
  }
  
  // 也可以添加Blob数据
  const blob = new Blob(['Hello World'], { type: 'text/plain' });
  formData.append('textFile', blob, 'hello.txt');
  
  try {
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('文件上传成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('文件上传失败:', error);
    throw error;
  }
}
```

## 2.4 PUT和PATCH请求

### PUT请求 - 完整替换资源
```javascript
// PUT请求用于完整更新资源
async function updateUserWithPUT() {
  const userId = 1;
  const completeUserData = {
    id: userId,
    name: '李四',
    username: 'lisi',
    email: 'lisi@example.com',
    address: {
      street: '新街道',
      suite: 'Apt. 556',
      city: '北京',
      zipcode: '100000',
      geo: {
        lat: '39.9042',
        lng: '116.4074'
      }
    },
    phone: '1-770-736-8031',
    website: 'lisi.org',
    company: {
      name: '新公司',
      catchPhrase: '创新科技',
      bs: 'harness real-time e-markets'
    }
  };
  
  try {
    const response = await axios.put(
      `https://jsonplaceholder.typicode.com/users/${userId}`,
      completeUserData
    );
    
    console.log('PUT更新成功:', response.data);
    console.log('状态码:', response.status);
    return response.data;
  } catch (error) {
    console.error('PUT更新失败:', error);
    throw error;
  }
}
```

### PATCH请求 - 部分更新资源
```javascript
// PATCH请求用于部分更新资源
async function updateUserWithPATCH() {
  const userId = 1;
  const partialUpdate = {
    name: '王五',
    email: 'wangwu@example.com'
    // 只更新这两个字段，其他字段保持不变
  };
  
  try {
    const response = await axios.patch(
      `https://jsonplaceholder.typicode.com/users/${userId}`,
      partialUpdate
    );
    
    console.log('PATCH更新成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('PATCH更新失败:', error);
    throw error;
  }
}

// 批量PATCH更新
async function batchUpdateUsers() {
  const updates = [
    { id: 1, email: 'user1@newdomain.com' },
    { id: 2, email: 'user2@newdomain.com' },
    { id: 3, email: 'user3@newdomain.com' }
  ];
  
  try {
    const promises = updates.map(update =>
      axios.patch(`https://jsonplaceholder.typicode.com/users/${update.id}`, {
        email: update.email
      })
    );
    
    const responses = await Promise.all(promises);
    console.log('批量更新完成:', responses.length);
    
    return responses.map(response => response.data);
  } catch (error) {
    console.error('批量更新失败:', error);
    throw error;
  }
}
```

## 2.5 DELETE请求

### 基本DELETE请求
```javascript
// 删除单个资源
async function deleteUser(userId) {
  try {
    const response = await axios.delete(
      `https://jsonplaceholder.typicode.com/users/${userId}`
    );
    
    console.log('删除成功, 状态码:', response.status);
    
    // DELETE请求通常返回204 No Content或200 OK
    if (response.status === 204) {
      console.log('资源已删除，无内容返回');
    } else if (response.status === 200) {
      console.log('删除确认:', response.data);
    }
    
    return true;
  } catch (error) {
    console.error(`删除用户${userId}失败:`, error);
    throw error;
  }
}

// 带确认的删除
async function deleteWithConfirmation(userId) {
  try {
    // 先获取要删除的资源信息
    const userResponse = await axios.get(
      `https://jsonplaceholder.typicode.com/users/${userId}`
    );
    const user = userResponse.data;
    
    console.log(`准备删除用户: ${user.name} (${user.email})`);
    
    // 模拟用户确认（实际项目中可能是弹窗确认）
    const confirmed = true; // 实际应该是用户交互的结果
    
    if (confirmed) {
      await axios.delete(`https://jsonplaceholder.typicode.com/users/${userId}`);
      console.log('用户删除成功');
      return true;
    } else {
      console.log('用户取消删除操作');
      return false;
    }
  } catch (error) {
    console.error('删除操作失败:', error);
    throw error;
  }
}
```

### 批量删除
```javascript
// 批量删除多个资源
async function batchDeleteUsers(userIds) {
  try {
    const deletePromises = userIds.map(id =>
      axios.delete(`https://jsonplaceholder.typicode.com/users/${id}`)
        .then(() => ({ id, success: true }))
        .catch(error => ({ id, success: false, error: error.message }))
    );
    
    const results = await Promise.all(deletePromises);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`删除完成: 成功${successful.length}个，失败${failed.length}个`);
    
    if (failed.length > 0) {
      console.log('删除失败的ID:', failed.map(f => f.id));
    }
    
    return { successful, failed };
  } catch (error) {
    console.error('批量删除操作失败:', error);
    throw error;
  }
}

// 软删除（逻辑删除）
async function softDeleteUser(userId) {
  try {
    const response = await axios.patch(
      `https://jsonplaceholder.typicode.com/users/${userId}`,
      {
        deleted: true,
        deletedAt: new Date().toISOString()
      }
    );
    
    console.log('软删除成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('软删除失败:', error);
    throw error;
  }
}
```

## 2.6 其他HTTP方法

### HEAD请求
```javascript
// HEAD请求只获取响应头，不获取响应体
async function headRequest() {
  try {
    const response = await axios.head('https://jsonplaceholder.typicode.com/posts/1');
    
    console.log('HEAD请求成功');
    console.log('状态码:', response.status);
    console.log('响应头:', response.headers);
    console.log('内容长度:', response.headers['content-length']);
    console.log('内容类型:', response.headers['content-type']);
    console.log('响应体:', response.data); // 应该是空的
    
    return response.headers;
  } catch (error) {
    console.error('HEAD请求失败:', error);
    throw error;
  }
}
```

### OPTIONS请求
```javascript
// OPTIONS请求用于获取服务器支持的HTTP方法
async function optionsRequest() {
  try {
    const response = await axios.options('https://jsonplaceholder.typicode.com/posts');
    
    console.log('OPTIONS请求成功');
    console.log('允许的方法:', response.headers['allow']);
    console.log('CORS头信息:', {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
    });
    
    return response.headers;
  } catch (error) {
    console.error('OPTIONS请求失败:', error);
    throw error;
  }
}
```

## 2.7 请求数据格式处理

### 自动数据转换
```javascript
// Axios会自动处理常见的数据格式
const dataFormatExamples = {
  // JSON数据（默认）
  json: async () => {
    const data = { name: 'John', age: 30 };
    const response = await axios.post('/api/users', data);
    // Axios自动设置Content-Type为application/json
    // 并将JavaScript对象转换为JSON字符串
    return response.data;
  },
  
  // 字符串数据
  string: async () => {
    const data = 'plain text data';
    const response = await axios.post('/api/text', data, {
      headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
  },
  
  // ArrayBuffer数据
  arrayBuffer: async () => {
    const buffer = new ArrayBuffer(1024);
    const response = await axios.post('/api/binary', buffer, {
      headers: { 'Content-Type': 'application/octet-stream' }
    });
    return response.data;
  }
};
```

### 自定义数据转换
```javascript
// 自定义请求数据转换器
const customTransformRequest = [
  function(data, headers) {
    // 在发送前转换数据
    if (typeof data === 'object' && data !== null) {
      // 自定义JSON序列化
      return JSON.stringify(data, null, 2);
    }
    return data;
  },
  ...axios.defaults.transformRequest // 保留默认转换器
];

// 自定义响应数据转换器
const customTransformResponse = [
  ...axios.defaults.transformResponse, // 保留默认转换器
  function(data) {
    // 在处理响应后转换数据
    if (typeof data === 'object' && data !== null) {
      // 添加时间戳
      data._receivedAt = new Date().toISOString();
    }
    return data;
  }
];

// 使用自定义转换器
async function requestWithCustomTransform() {
  const response = await axios.post('/api/data', 
    { message: 'Hello World' },
    {
      transformRequest: customTransformRequest,
      transformResponse: customTransformResponse
    }
  );
  
  console.log('转换后的数据:', response.data);
  return response.data;
}
```

## 2.8 实战练习

### 练习1：用户管理API
```javascript
// 完整的用户管理API封装
class UserAPI {
  constructor(baseURL = 'https://jsonplaceholder.typicode.com') {
    this.baseURL = baseURL;
  }
  
  // 获取所有用户
  async getUsers(params = {}) {
    const response = await axios.get(`${this.baseURL}/users`, { params });
    return response.data;
  }
  
  // 获取单个用户
  async getUser(id) {
    const response = await axios.get(`${this.baseURL}/users/${id}`);
    return response.data;
  }
  
  // 创建用户
  async createUser(userData) {
    const response = await axios.post(`${this.baseURL}/users`, userData);
    return response.data;
  }
  
  // 完整更新用户
  async updateUser(id, userData) {
    const response = await axios.put(`${this.baseURL}/users/${id}`, userData);
    return response.data;
  }
  
  // 部分更新用户
  async patchUser(id, partialData) {
    const response = await axios.patch(`${this.baseURL}/users/${id}`, partialData);
    return response.data;
  }
  
  // 删除用户
  async deleteUser(id) {
    const response = await axios.delete(`${this.baseURL}/users/${id}`);
    return response.status === 200;
  }
  
  // 获取用户的文章
  async getUserPosts(userId) {
    const response = await axios.get(`${this.baseURL}/posts`, {
      params: { userId }
    });
    return response.data;
  }
}

// 使用示例
async function testUserAPI() {
  const userAPI = new UserAPI();
  
  try {
    // 获取所有用户
    console.log('=== 获取所有用户 ===');
    const users = await userAPI.getUsers();
    console.log(`找到${users.length}个用户`);
    
    // 获取特定用户
    console.log('=== 获取用户详情 ===');
    const user = await userAPI.getUser(1);
    console.log('用户信息:', user.name, user.email);
    
    // 创建新用户
    console.log('=== 创建新用户 ===');
    const newUser = await userAPI.createUser({
      name: '测试用户',
      username: 'testuser',
      email: 'test@example.com'
    });
    console.log('新用户:', newUser);
    
    // 更新用户
    console.log('=== 更新用户信息 ===');
    const updatedUser = await userAPI.patchUser(1, {
      email: 'newemail@example.com'
    });
    console.log('更新后:', updatedUser);
    
    // 获取用户文章
    console.log('=== 获取用户文章 ===');
    const posts = await userAPI.getUserPosts(1);
    console.log(`用户有${posts.length}篇文章`);
    
  } catch (error) {
    console.error('API测试失败:', error);
  }
}

testUserAPI();
```

### 练习2：商品管理系统
```javascript
// 电商商品管理API
class ProductAPI {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }
  
  // 获取商品列表（支持搜索、分页、排序）
  async getProducts(options = {}) {
    const {
      search = '',
      category = '',
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
      minPrice,
      maxPrice
    } = options;
    
    const params = {
      page,
      limit,
      sortBy,
      order
    };
    
    if (search) params.search = search;
    if (category) params.category = category;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    
    const response = await axios.get(`${this.baseURL}/products`, { params });
    return response.data;
  }
  
  // 创建商品
  async createProduct(productData) {
    const response = await axios.post(`${this.baseURL}/products`, productData);
    return response.data;
  }
  
  // 批量创建商品
  async batchCreateProducts(productsArray) {
    const response = await axios.post(`${this.baseURL}/products/batch`, {
      products: productsArray
    });
    return response.data;
  }
  
  // 更新商品库存
  async updateStock(productId, quantity, operation = 'set') {
    const response = await axios.patch(`${this.baseURL}/products/${productId}/stock`, {
      quantity,
      operation // 'set', 'add', 'subtract'
    });
    return response.data;
  }
  
  // 上传商品图片
  async uploadProductImage(productId, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('productId', productId);
    
    const response = await axios.post(`${this.baseURL}/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
  
  // 删除商品（软删除）
  async deleteProduct(productId, permanent = false) {
    if (permanent) {
      const response = await axios.delete(`${this.baseURL}/products/${productId}?permanent=true`);
      return response.data;
    } else {
      const response = await axios.patch(`${this.baseURL}/products/${productId}`, {
        deleted: true,
        deletedAt: new Date().toISOString()
      });
      return response.data;
    }
  }
}
```

## 本章小结

在第2章中，我们深入学习了：

1. **HTTP方法概述**：理解了不同HTTP方法的用途和特性
2. **GET请求**：掌握了参数传递、请求头设置、超时控制等技巧
3. **POST请求**：学会了发送JSON、表单、文件等不同格式的数据
4. **PUT/PATCH请求**：理解了完整更新和部分更新的区别和应用
5. **DELETE请求**：掌握了资源删除的各种场景和最佳实践
6. **其他方法**：了解了HEAD、OPTIONS等辅助方法的用途
7. **数据格式**：学会了处理各种请求和响应数据格式

这些知识为我们在实际项目中灵活运用Axios处理各种HTTP通信需求打下了坚实基础。

## 关键要点
- GET请求用于获取数据，参数通过URL或params传递
- POST请求用于创建资源，数据放在请求体中
- PUT用于完整替换，PATCH用于部分更新
- DELETE用于删除资源，可以是物理删除或逻辑删除
- 正确选择HTTP方法能让API更加RESTful和语义化
- 数据格式的正确处理是API交互的关键

## 下一章预告
下一章将学习请求和响应配置，包括请求头管理、超时设置、响应处理等高级配置技巧。