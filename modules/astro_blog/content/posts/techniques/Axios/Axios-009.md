---
title: "第9章：身份认证和安全"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第9章：身份认证和安全

## 学习目标
1. 实现Token认证机制
2. 掌握JWT的处理和刷新
3. 学会OAuth2.0集成
4. 理解HTTPS和证书配置
5. 实现安全的跨域处理

## 9.1 Token认证

### Bearer Token认证
```javascript
class TokenManager {
  constructor() {
    this.token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }
  
  setToken(accessToken, refreshToken = null) {
    this.token = accessToken;
    localStorage.setItem('access_token', accessToken);
    
    if (refreshToken) {
      this.refreshToken = refreshToken;
      localStorage.setItem('refresh_token', refreshToken);
    }
  }
  
  getToken() {
    return this.token;
  }
  
  clearToken() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
  
  isTokenValid() {
    if (!this.token) return false;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }
}

const tokenManager = new TokenManager();
```

## 9.2 JWT处理和自动刷新

### JWT拦截器
```javascript
class JWTInterceptor {
  constructor(axiosInstance, tokenManager) {
    this.axios = axiosInstance;
    this.tokenManager = tokenManager;
    this.isRefreshing = false;
    this.failedQueue = [];
    
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    // 请求拦截器 - 添加token
    this.axios.interceptors.request.use((config) => {
      const token = this.tokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    // 响应拦截器 - 处理token过期
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // 如果正在刷新token，将请求加入队列
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.axios(originalRequest);
            });
          }
          
          originalRequest._retry = true;
          this.isRefreshing = true;
          
          try {
            const newToken = await this.refreshAccessToken();
            this.tokenManager.setToken(newToken);
            
            // 处理队列中的请求
            this.processQueue(null, newToken);
            
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.axios(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.tokenManager.clearToken();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  async refreshAccessToken() {
    const refreshToken = this.tokenManager.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await axios.post('/api/auth/refresh', {
      refresh_token: refreshToken
    });
    
    return response.data.access_token;
  }
  
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }
}
```

## 9.3 OAuth2.0集成

### OAuth2流程实现
```javascript
class OAuth2Handler {
  constructor(clientId, redirectUri, authUrl) {
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    this.authUrl = authUrl;
  }
  
  // 授权码流程
  initiateAuthorizationCode(scope = 'read write') {
    const state = this.generateState();
    sessionStorage.setItem('oauth_state', state);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scope,
      state: state
    });
    
    window.location.href = `${this.authUrl}?${params.toString()}`;
  }
  
  // 处理授权回调
  async handleAuthorizationCallback(code, state) {
    // 验证state
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }
    
    // 交换访问令牌
    const response = await axios.post('/api/oauth/token', {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      code: code,
      redirect_uri: this.redirectUri
    });
    
    return response.data;
  }
  
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}
```

## 9.4 HTTPS和安全配置

### 安全请求配置
```javascript
// HTTPS和安全配置
const secureAxios = axios.create({
  // 强制HTTPS
  baseURL: 'https://api.example.com',
  
  // 安全头设置
  headers: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  },
  
  // 请求验证
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  }
});

// Node.js环境下的证书配置
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  const https = require('https');
  const fs = require('fs');
  
  const httpsAgent = new https.Agent({
    cert: fs.readFileSync('path/to/client-cert.pem'),
    key: fs.readFileSync('path/to/client-key.pem'),
    ca: fs.readFileSync('path/to/ca-cert.pem'),
    rejectUnauthorized: true
  });
  
  secureAxios.defaults.httpsAgent = httpsAgent;
}
```

## 9.5 CSRF防护

### CSRF Token处理
```javascript
class CSRFHandler {
  constructor() {
    this.token = null;
    this.init();
  }
  
  async init() {
    try {
      // 获取CSRF token
      const response = await axios.get('/api/csrf-token');
      this.token = response.data.token;
      
      // 设置默认头
      axios.defaults.headers.common['X-CSRF-TOKEN'] = this.token;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }
  
  async refreshToken() {
    await this.init();
  }
  
  getToken() {
    return this.token;
  }
}

const csrfHandler = new CSRFHandler();
```

## 9.6 API密钥管理

### 安全的API密钥处理
```javascript
class APIKeyManager {
  constructor() {
    this.apiKey = process.env.API_KEY || '';
    this.keyRotationInterval = 24 * 60 * 60 * 1000; // 24小时
    this.setupKeyRotation();
  }
  
  setupKeyRotation() {
    setInterval(() => {
      this.rotateApiKey();
    }, this.keyRotationInterval);
  }
  
  async rotateApiKey() {
    try {
      const response = await axios.post('/api/rotate-key', {
        current_key: this.apiKey
      });
      
      this.apiKey = response.data.new_key;
      process.env.API_KEY = this.apiKey;
      
      console.log('API key rotated successfully');
    } catch (error) {
      console.error('Failed to rotate API key:', error);
    }
  }
  
  getApiKey() {
    return this.apiKey;
  }
  
  setApiKeyHeader(config) {
    config.headers = config.headers || {};
    config.headers['X-API-Key'] = this.getApiKey();
    return config;
  }
}
```

## 本章小结

- Token认证是现代Web应用的标准认证方式
- JWT自动刷新保证用户体验的连续性
- OAuth2.0提供安全的第三方授权
- HTTPS和安全配置保护数据传输
- CSRF防护预防跨站请求伪造攻击

## 关键要点
- 永远不要在客户端存储敏感信息
- 使用HTTPS保护所有认证相关通信
- 实现token自动刷新避免用户重复登录
- 合理的安全头配置增强应用安全性