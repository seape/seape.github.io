---
title: "第5章：实例化和全局配置"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第5章：实例化和全局配置

## 学习目标
1. 理解Axios实例的概念
2. 掌握创建和配置Axios实例
3. 学会全局默认配置的设置
4. 理解配置的优先级机制
5. 实现多环境配置管理

## 5.1 Axios实例化

### 创建实例
```javascript
// 创建axios实例
const apiClient = axios.create({
  baseURL: 'https://api.example.com/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 不同服务的实例
const userAPI = axios.create({
  baseURL: 'https://user-service.com/api'
});

const paymentAPI = axios.create({
  baseURL: 'https://payment-service.com/api',
  timeout: 30000
});
```

## 5.2 全局配置

### 默认配置
```javascript
// 全局默认配置
axios.defaults.baseURL = 'https://api.example.com';
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Authorization'] = 'Bearer token';
axios.defaults.headers.post['Content-Type'] = 'application/json';
```

## 5.3 配置优先级

配置优先级从高到低：
1. 请求配置
2. 实例配置
3. 全局配置

```javascript
// 演示配置优先级
axios.defaults.timeout = 10000; // 全局配置

const instance = axios.create({
  timeout: 5000 // 实例配置，覆盖全局
});

instance.get('/api/data', {
  timeout: 3000 // 请求配置，优先级最高
});
```

## 5.4 多环境配置

```javascript
// 环境配置管理
class EnvironmentConfig {
  constructor() {
    this.configs = {
      development: {
        baseURL: 'http://localhost:3000/api',
        timeout: 10000
      },
      testing: {
        baseURL: 'https://test-api.example.com',
        timeout: 15000
      },
      production: {
        baseURL: 'https://api.example.com',
        timeout: 5000
      }
    };
  }
  
  getConfig(env = 'development') {
    return this.configs[env] || this.configs.development;
  }
  
  createInstance(env) {
    const config = this.getConfig(env);
    return axios.create(config);
  }
}

const envConfig = new EnvironmentConfig();
const apiClient = envConfig.createInstance(process.env.NODE_ENV);
```

## 本章小结

- 实例化提供了隔离和复用的能力
- 全局配置影响所有请求
- 配置优先级确保灵活性
- 多环境配置支持不同部署环境

## 关键要点
- 不同服务使用不同实例
- 合理设置全局默认值
- 理解配置优先级避免冲突
- 环境配置提高可维护性