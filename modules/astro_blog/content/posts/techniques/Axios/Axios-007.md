---
title: "第7章：取消请求和并发控制"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第7章：取消请求和并发控制

## 学习目标
1. 掌握CancelToken的使用方法
2. 学会AbortController取消请求
3. 理解并发请求的处理
4. 实现请求去重机制
5. 掌握请求队列管理

## 7.1 取消请求

### 使用CancelToken
```javascript
// 创建取消令牌
const source = axios.CancelToken.source();

// 发送可取消的请求
axios.get('/api/data', {
  cancelToken: source.token
}).catch(function (thrown) {
  if (axios.isCancel(thrown)) {
    console.log('请求被取消:', thrown.message);
  } else {
    console.error('请求错误:', thrown);
  }
});

// 取消请求
source.cancel('用户取消操作');
```

### 使用AbortController (推荐)
```javascript
// 现代浏览器推荐使用AbortController
const controller = new AbortController();

axios.get('/api/data', {
  signal: controller.signal
}).catch(function (error) {
  if (error.name === 'AbortError') {
    console.log('请求被中止');
  }
});

// 取消请求
controller.abort();
```

## 7.2 请求去重

### 防止重复请求
```javascript
class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
  }
  
  generateKey(config) {
    return `${config.method}-${config.url}-${JSON.stringify(config.params)}`;
  }
  
  async request(config) {
    const key = this.generateKey(config);
    
    // 如果存在相同的请求，返回现有Promise
    if (this.pendingRequests.has(key)) {
      console.log('发现重复请求，返回现有Promise');
      return this.pendingRequests.get(key);
    }
    
    // 创建新请求
    const promise = axios(config)
      .finally(() => {
        this.pendingRequests.delete(key);
      });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }
}

const deduplicator = new RequestDeduplicator();
```

## 7.3 并发控制

### 限制并发数量
```javascript
class ConcurrencyController {
  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }
  
  async request(config) {
    return new Promise((resolve, reject) => {
      this.queue.push({ config, resolve, reject });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { config, resolve, reject } = this.queue.shift();
    
    try {
      const response = await axios(config);
      resolve(response);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.processQueue();
    }
  }
}

const concurrencyController = new ConcurrencyController(3);
```

## 7.4 批量请求处理

### Promise.all和Promise.allSettled
```javascript
// 并行执行所有请求
async function batchRequests() {
  try {
    const [users, posts, comments] = await Promise.all([
      axios.get('/api/users'),
      axios.get('/api/posts'),
      axios.get('/api/comments')
    ]);
    
    return { users: users.data, posts: posts.data, comments: comments.data };
  } catch (error) {
    console.error('批量请求失败:', error);
    throw error;
  }
}

// 处理部分失败的情况
async function robustBatchRequests() {
  const results = await Promise.allSettled([
    axios.get('/api/users'),
    axios.get('/api/posts'),
    axios.get('/api/comments')
  ]);
  
  const successful = results.filter(result => result.status === 'fulfilled')
                           .map(result => result.value.data);
  
  const failed = results.filter(result => result.status === 'rejected')
                        .map(result => result.reason);
  
  return { successful, failed };
}
```

## 本章小结

- 取消请求机制防止无用的网络开销
- 请求去重避免重复请求浪费资源
- 并发控制保护服务器和客户端性能
- 批量处理提高数据获取效率

## 关键要点
- 使用AbortController替代已废弃的CancelToken
- 合理的去重策略提升用户体验
- 并发控制避免服务器过载
- 批量请求需要考虑部分失败的情况