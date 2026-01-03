---
title: "第6章：错误处理和重试机制"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第6章：错误处理和重试机制

## 学习目标
1. 理解Axios的错误类型和结构
2. 掌握不同层级的错误处理
3. 学会实现请求重试机制
4. 掌握网络错误的处理方法
5. 实现用户友好的错误提示

## 6.1 错误类型分析

### Axios错误结构
```javascript
// 错误对象结构
const errorTypes = {
  networkError: {
    description: "网络连接错误",
    detection: "!error.response && error.request",
    examples: ["无网络连接", "DNS解析失败", "服务器无响应"]
  },
  
  responseError: {
    description: "服务器响应错误",
    detection: "error.response && error.response.status",
    examples: ["4xx客户端错误", "5xx服务器错误"]
  },
  
  configError: {
    description: "请求配置错误",
    detection: "!error.response && !error.request",
    examples: ["请求配置无效", "拦截器错误"]
  }
};
```

## 6.2 统一错误处理

### 错误处理器
```javascript
class ErrorHandler {
  static handle(error) {
    if (error.response) {
      // 服务器响应错误
      return this.handleResponseError(error.response);
    } else if (error.request) {
      // 网络错误
      return this.handleNetworkError(error);
    } else {
      // 配置错误
      return this.handleConfigError(error);
    }
  }
  
  static handleResponseError(response) {
    const { status, data } = response;
    
    switch (status) {
      case 400:
        return { message: '请求参数错误', type: 'warning' };
      case 401:
        return { message: '未授权，请重新登录', type: 'error' };
      case 403:
        return { message: '访问被禁止', type: 'error' };
      case 404:
        return { message: '请求的资源不存在', type: 'error' };
      case 500:
        return { message: '服务器内部错误', type: 'error' };
      default:
        return { message: data?.message || '请求失败', type: 'error' };
    }
  }
  
  static handleNetworkError(error) {
    if (error.code === 'ECONNABORTED') {
      return { message: '请求超时，请稍后重试', type: 'warning' };
    }
    return { message: '网络连接异常，请检查网络', type: 'error' };
  }
  
  static handleConfigError(error) {
    return { message: '请求配置错误', type: 'error' };
  }
}
```

## 6.3 重试机制

### 智能重试
```javascript
class RetryHandler {
  constructor(maxRetries = 3, retryDelay = 1000) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }
  
  async executeWithRetry(requestFn, config = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxRetries || !this.shouldRetry(error)) {
          break;
        }
        
        console.log(`重试第${attempt}次，${this.retryDelay * attempt}ms后重试`);
        await this.delay(this.retryDelay * attempt);
      }
    }
    
    throw lastError;
  }
  
  shouldRetry(error) {
    // 只对网络错误和5xx错误重试
    return !error.response || error.response.status >= 500;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 使用重试机制
const retryHandler = new RetryHandler(3, 1000);

async function reliableRequest(url) {
  return retryHandler.executeWithRetry(() => axios.get(url));
}
```

## 6.4 错误边界和恢复

### 错误恢复策略
```javascript
class ErrorRecovery {
  static strategies = {
    retry: 'automatic_retry',
    fallback: 'use_cached_data', 
    offline: 'queue_for_later',
    degraded: 'reduced_functionality'
  };
  
  static async handleWithRecovery(requestFn, recoveryOptions = {}) {
    try {
      return await requestFn();
    } catch (error) {
      return this.executeRecovery(error, recoveryOptions);
    }
  }
  
  static async executeRecovery(error, options) {
    // 根据错误类型选择恢复策略
    if (options.fallbackData && this.isNetworkError(error)) {
      console.log('使用缓存数据');
      return options.fallbackData;
    }
    
    if (options.retryCount && this.canRetry(error)) {
      console.log('自动重试');
      // 执行重试逻辑
    }
    
    throw error;
  }
  
  static isNetworkError(error) {
    return !error.response && error.request;
  }
  
  static canRetry(error) {
    return !error.response || error.response.status >= 500;
  }
}
```

## 本章小结

- 理解不同类型的错误及其处理方式
- 实现智能重试机制提高请求成功率
- 通过错误恢复策略提升用户体验
- 统一错误处理简化代码维护

## 关键要点
- 区分网络错误、响应错误和配置错误
- 合理的重试策略避免过度请求
- 错误恢复机制提供备选方案
- 用户友好的错误提示改善体验