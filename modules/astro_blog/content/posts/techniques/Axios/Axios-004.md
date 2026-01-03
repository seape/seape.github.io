---
title: "第4章：拦截器机制"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第4章：拦截器机制

## 学习目标
1. 理解拦截器的概念和作用
2. 掌握请求拦截器的使用
3. 学会响应拦截器的配置
4. 实现统一的错误处理
5. 掌握拦截器的动态管理

## 4.1 拦截器基础概念

拦截器是Axios的核心特性之一，允许在请求或响应被处理之前对其进行拦截和修改。

### 拦截器工作流程
```javascript
// 请求拦截器 -> 发送请求 -> 响应拦截器 -> 返回结果
const interceptorFlow = {
  request: "在请求发送前执行",
  response: "在响应返回后执行",
  error: "在发生错误时执行"
};
```

## 4.2 请求拦截器

### 基本用法
```javascript
// 添加请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    console.log('发送请求:', config);
    
    // 添加时间戳
    config.headers['X-Timestamp'] = Date.now();
    
    // 添加认证token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    console.error('请求配置错误:', error);
    return Promise.reject(error);
  }
);
```

## 4.3 响应拦截器

### 基本用法
```javascript
// 添加响应拦截器
axios.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数
    console.log('收到响应:', response.status);
    
    // 统一处理响应数据
    if (response.data && response.data.code !== undefined) {
      if (response.data.code !== 200) {
        throw new Error(response.data.message || '请求失败');
      }
      return response.data.data;
    }
    
    return response;
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数
    console.error('响应错误:', error);
    
    if (error.response?.status === 401) {
      // 清除token并跳转到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
```

## 4.4 拦截器管理

### 移除拦截器
```javascript
// 保存拦截器ID
const requestInterceptor = axios.interceptors.request.use(config => config);
const responseInterceptor = axios.interceptors.response.use(response => response);

// 移除拦截器
axios.interceptors.request.eject(requestInterceptor);
axios.interceptors.response.eject(responseInterceptor);
```

## 4.5 实际应用示例

### 完整的拦截器配置
```javascript
class ApiInterceptors {
  constructor(axiosInstance) {
    this.axios = axiosInstance;
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    // 请求拦截器
    this.axios.interceptors.request.use(
      (config) => {
        // 添加loading
        this.showLoading();
        
        // 添加认证头
        const token = this.getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        this.hideLoading();
        return Promise.reject(error);
      }
    );
    
    // 响应拦截器
    this.axios.interceptors.response.use(
      (response) => {
        this.hideLoading();
        return response;
      },
      (error) => {
        this.hideLoading();
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }
  
  getToken() {
    return localStorage.getItem('token');
  }
  
  showLoading() {
    // 显示loading状态
  }
  
  hideLoading() {
    // 隐藏loading状态
  }
  
  handleError(error) {
    if (error.response?.status === 401) {
      this.handleUnauthorized();
    } else if (error.response?.status >= 500) {
      this.showErrorMessage('服务器错误，请稍后重试');
    }
  }
  
  handleUnauthorized() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  
  showErrorMessage(message) {
    console.error(message);
  }
}
```

## 本章小结

拦截器是Axios最强大的功能之一，能够实现：
- 统一的请求头管理
- 自动的认证处理
- 统一的错误处理
- 请求和响应的数据转换
- Loading状态管理

## 关键要点
- 拦截器按添加顺序执行
- 请求拦截器可以修改配置
- 响应拦截器可以处理数据和错误
- 合理使用拦截器能大大简化代码

## 下一章预告
下一章将学习实例化和全局配置，了解如何创建多个Axios实例来处理不同的API服务。