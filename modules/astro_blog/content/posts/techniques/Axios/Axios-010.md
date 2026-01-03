---
title: "第10章：性能优化和最佳实践"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第10章：性能优化和最佳实践

## 学习目标
1. 掌握请求缓存机制
2. 学会数据压缩和优化
3. 实现连接池和复用
4. 掌握性能监控方法
5. 了解最佳实践和规范

## 10.1 请求缓存

### 内存缓存实现
```javascript
class RequestCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  
  generateKey(config) {
    const { method, url, params, data } = config;
    return `${method}-${url}-${JSON.stringify(params)}-${JSON.stringify(data)}`;
  }
  
  get(config) {
    const key = this.generateKey(config);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  set(config, data) {
    const key = this.generateKey(config);
    
    // 如果缓存满了，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  clear() {
    this.cache.clear();
  }
}

// 使用缓存的axios实例
const cache = new RequestCache();

const cachedAxios = axios.create();
cachedAxios.interceptors.request.use(config => {
  // 只缓存GET请求
  if (config.method === 'get') {
    const cached = cache.get(config);
    if (cached) {
      console.log('使用缓存数据');
      return Promise.resolve({ data: cached, status: 200, cached: true });
    }
  }
  return config;
});

cachedAxios.interceptors.response.use(response => {
  if (response.config.method === 'get' && !response.cached) {
    cache.set(response.config, response.data);
  }
  return response;
});
```

## 10.2 数据压缩

### 请求数据压缩
```javascript
// 使用compression库进行数据压缩
const pako = require('pako'); // 或其他压缩库

class CompressionHandler {
  static compress(data) {
    const jsonString = JSON.stringify(data);
    const compressed = pako.gzip(jsonString);
    return compressed;
  }
  
  static decompress(compressed) {
    const decompressed = pako.ungzip(compressed, { to: 'string' });
    return JSON.parse(decompressed);
  }
  
  static shouldCompress(data, threshold = 1024) {
    const size = JSON.stringify(data).length;
    return size > threshold;
  }
}

// 压缩拦截器
axios.interceptors.request.use(config => {
  if (config.data && CompressionHandler.shouldCompress(config.data)) {
    config.data = CompressionHandler.compress(config.data);
    config.headers['Content-Encoding'] = 'gzip';
    config.headers['Content-Type'] = 'application/octet-stream';
  }
  return config;
});
```

## 10.3 连接池优化

### HTTP Agent配置 (Node.js)
```javascript
const http = require('http');
const https = require('https');

// 配置连接池
const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000
});

const optimizedAxios = axios.create({
  httpAgent,
  httpsAgent,
  timeout: 30000
});
```

## 10.4 性能监控

### 请求性能监控
```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      responses: 0,
      errors: 0,
      totalTime: 0,
      avgResponseTime: 0
    };
  }
  
  startTimer(config) {
    config.metadata = {
      startTime: performance.now()
    };
  }
  
  endTimer(response) {
    const endTime = performance.now();
    const startTime = response.config.metadata?.startTime;
    
    if (startTime) {
      const duration = endTime - startTime;
      this.recordMetric(duration);
    }
  }
  
  recordMetric(duration) {
    this.metrics.requests++;
    this.metrics.totalTime += duration;
    this.metrics.avgResponseTime = this.metrics.totalTime / this.metrics.requests;
  }
  
  recordError() {
    this.metrics.errors++;
  }
  
  getStats() {
    return {
      ...this.metrics,
      errorRate: this.metrics.errors / this.metrics.requests,
      successRate: (this.metrics.requests - this.metrics.errors) / this.metrics.requests
    };
  }
}

const monitor = new PerformanceMonitor();

// 性能监控拦截器
axios.interceptors.request.use(config => {
  monitor.startTimer(config);
  return config;
});

axios.interceptors.response.use(
  response => {
    monitor.endTimer(response);
    return response;
  },
  error => {
    monitor.recordError();
    if (error.config) {
      monitor.endTimer({ config: error.config });
    }
    return Promise.reject(error);
  }
);
```

## 10.5 最佳实践

### API客户端设计原则
```javascript
class BestPracticesClient {
  constructor(config = {}) {
    this.client = axios.create({
      // 基础配置
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      
      // 安全头
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      
      // 状态验证
      validateStatus: (status) => status >= 200 && status < 300,
      
      // 自动重试配置
      retry: 3,
      retryDelay: 1000
    });
    
    this.setupInterceptors();
    this.setupCache();
    this.setupMonitoring();
  }
  
  setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this)
    );
    
    // 响应拦截器
    this.client.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this)
    );
  }
  
  handleRequest(config) {
    // 添加请求ID
    config.headers['X-Request-ID'] = this.generateRequestId();
    
    // 添加时间戳
    config.metadata = { startTime: Date.now() };
    
    return config;
  }
  
  handleResponse(response) {
    // 记录响应时间
    const duration = Date.now() - response.config.metadata.startTime;
    console.log(`请求完成: ${duration}ms`);
    
    return response;
  }
  
  handleResponseError(error) {
    // 统一错误处理
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    };
    
    console.error('请求失败:', errorInfo);
    
    return Promise.reject(error);
  }
  
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## 10.6 代码规范

### API接口封装规范
```javascript
// 良好的API封装示例
class UserService {
  constructor(apiClient) {
    this.api = apiClient;
    this.basePath = '/api/v1/users';
  }
  
  // 获取用户列表
  async getUsers(params = {}) {
    const response = await this.api.get(this.basePath, { params });
    return response.data;
  }
  
  // 获取单个用户
  async getUser(id) {
    if (!id) throw new Error('用户ID是必需的');
    
    const response = await this.api.get(`${this.basePath}/${id}`);
    return response.data;
  }
  
  // 创建用户
  async createUser(userData) {
    this.validateUserData(userData);
    
    const response = await this.api.post(this.basePath, userData);
    return response.data;
  }
  
  // 更新用户
  async updateUser(id, userData) {
    if (!id) throw new Error('用户ID是必需的');
    
    this.validateUserData(userData, false);
    
    const response = await this.api.put(`${this.basePath}/${id}`, userData);
    return response.data;
  }
  
  // 删除用户
  async deleteUser(id) {
    if (!id) throw new Error('用户ID是必需的');
    
    await this.api.delete(`${this.basePath}/${id}`);
    return true;
  }
  
  // 数据验证
  validateUserData(data, isCreate = true) {
    if (isCreate && (!data.name || !data.email)) {
      throw new Error('用户名和邮箱是必需的');
    }
    
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('邮箱格式不正确');
    }
  }
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

## 本章小结

- 缓存机制显著提升重复请求的性能
- 数据压缩减少网络传输开销
- 连接池优化提高并发处理能力
- 性能监控帮助识别和解决瓶颈
- 遵循最佳实践提高代码质量和可维护性

## 关键要点
- 合理使用缓存平衡性能和数据新鲜度
- 压缩大数据减少传输时间
- 连接复用降低建连开销
- 持续监控识别性能问题
- 标准化的API封装提高开发效率