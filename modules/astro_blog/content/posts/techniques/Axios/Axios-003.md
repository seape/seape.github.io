---
title: "第3章：请求和响应配置"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第3章：请求和响应配置

## 学习目标
1. 理解请求配置对象的结构
2. 掌握请求头的设置和管理
3. 学会配置超时和重试机制
4. 理解响应数据的结构和处理
5. 掌握响应状态码的判断

## 3.1 请求配置对象详解

### 完整的请求配置结构
```javascript
// Axios完整的请求配置选项
const fullRequestConfig = {
  // 请求的URL
  url: '/api/users',
  
  // 请求方法
  method: 'get', // 默认是get
  
  // 基础URL，会与url拼接
  baseURL: 'https://api.example.com',
  
  // 请求头
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token',
    'Accept': 'application/json'
  },
  
  // URL参数（会被拼接到URL后面）
  params: {
    page: 1,
    limit: 10
  },
  
  // 参数序列化函数
  paramsSerializer: function(params) {
    return Qs.stringify(params, { arrayFormat: 'brackets' });
  },
  
  // 请求体数据
  data: {
    name: 'John',
    email: 'john@example.com'
  },
  
  // 请求超时时间（毫秒）
  timeout: 5000,
  
  // 跨站点请求是否应该使用凭证
  withCredentials: false,
  
  // 响应数据类型
  responseType: 'json', // 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
  
  // 响应编码
  responseEncoding: 'utf8',
  
  // XSRF设置
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  
  // 上传进度回调
  onUploadProgress: function(progressEvent) {
    console.log('上传进度:', (progressEvent.loaded / progressEvent.total) * 100 + '%');
  },
  
  // 下载进度回调
  onDownloadProgress: function(progressEvent) {
    console.log('下载进度:', (progressEvent.loaded / progressEvent.total) * 100 + '%');
  },
  
  // 响应体最大大小
  maxContentLength: 2000,
  maxBodyLength: 2000,
  
  // 状态码验证函数
  validateStatus: function(status) {
    return status >= 200 && status < 300;
  },
  
  // 最大重定向次数
  maxRedirects: 5,
  
  // Node.js专用配置
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  
  // 代理配置
  proxy: {
    host: '127.0.0.1',
    port: 9000,
    auth: {
      username: 'mikeymike',
      password: 'rapunz3l'
    }
  },
  
  // 取消令牌
  cancelToken: new axios.CancelToken(function(cancel) {
    // ...
  })
};
```

### 配置的优先级
```javascript
// 配置优先级演示
// 优先级从高到低：
// 1. 请求配置
// 2. 实例配置  
// 3. 全局配置

// 全局配置
axios.defaults.timeout = 10000;
axios.defaults.baseURL = 'https://api.example.com';

// 实例配置
const apiClient = axios.create({
  timeout: 5000,
  baseURL: 'https://api.myservice.com'
});

// 请求配置（优先级最高）
apiClient.get('/users', {
  timeout: 3000  // 这个会覆盖实例和全局的timeout配置
});
```

## 3.2 请求头管理

### 常用请求头设置
```javascript
// 设置常用请求头
const commonHeaders = {
  // 内容类型
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  
  // 授权相关
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  'X-API-Key': 'your-api-key',
  
  // 客户端信息
  'User-Agent': 'MyApp/1.0.0',
  'X-Client-Version': '1.0.0',
  
  // 请求追踪
  'X-Request-ID': 'req-' + Date.now(),
  'X-Correlation-ID': 'corr-' + Math.random().toString(36),
  
  // 缓存控制
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  
  // 语言和地区
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br'
};

// 使用请求头
async function requestWithHeaders() {
  try {
    const response = await axios.get('/api/users', {
      headers: commonHeaders
    });
    
    console.log('请求成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}
```

### 动态请求头
```javascript
// 动态设置请求头
class HeaderManager {
  constructor() {
    this.headers = {};
  }
  
  // 设置认证头
  setAuthHeader(token, type = 'Bearer') {
    this.headers['Authorization'] = `${type} ${token}`;
  }
  
  // 设置API密钥
  setApiKey(key, headerName = 'X-API-Key') {
    this.headers[headerName] = key;
  }
  
  // 设置内容类型
  setContentType(type) {
    this.headers['Content-Type'] = type;
  }
  
  // 设置用户代理
  setUserAgent(userAgent) {
    this.headers['User-Agent'] = userAgent;
  }
  
  // 添加自定义头
  addHeader(name, value) {
    this.headers[name] = value;
  }
  
  // 删除头
  removeHeader(name) {
    delete this.headers[name];
  }
  
  // 获取所有头
  getHeaders() {
    return { ...this.headers };
  }
  
  // 清空所有头
  clear() {
    this.headers = {};
  }
}

// 使用头管理器
const headerManager = new HeaderManager();
headerManager.setAuthHeader('your-jwt-token');
headerManager.setApiKey('your-api-key');
headerManager.addHeader('X-Custom-Header', 'custom-value');

async function requestWithDynamicHeaders() {
  const response = await axios.get('/api/protected', {
    headers: headerManager.getHeaders()
  });
  
  return response.data;
}
```

### 请求头的条件设置
```javascript
// 根据条件动态设置请求头
function buildHeaders(options = {}) {
  const headers = {
    'Accept': 'application/json'
  };
  
  // 根据请求类型设置Content-Type
  if (options.hasFormData) {
    // FormData会自动设置Content-Type，不需要手动设置
    // headers['Content-Type'] = 'multipart/form-data'; // 不要设置
  } else if (options.isFormUrlEncoded) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  } else if (options.isXml) {
    headers['Content-Type'] = 'application/xml';
  } else {
    headers['Content-Type'] = 'application/json';
  }
  
  // 认证头
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  
  // API密钥
  if (options.apiKey) {
    headers['X-API-Key'] = options.apiKey;
  }
  
  // 请求ID用于追踪
  if (options.includeRequestId) {
    headers['X-Request-ID'] = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // 客户端信息
  if (options.clientInfo) {
    headers['X-Client-Info'] = JSON.stringify(options.clientInfo);
  }
  
  return headers;
}

// 使用示例
async function apiRequest(url, data, options = {}) {
  const headers = buildHeaders(options);
  
  const response = await axios.post(url, data, { headers });
  return response.data;
}
```

## 3.3 超时配置

### 基本超时设置
```javascript
// 全局超时设置
axios.defaults.timeout = 10000; // 10秒

// 单个请求超时
async function requestWithTimeout() {
  try {
    const response = await axios.get('/api/slow-endpoint', {
      timeout: 5000 // 5秒超时
    });
    
    console.log('请求成功:', response.data);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('请求超时');
      throw new Error('请求超时，请稍后重试');
    }
    throw error;
  }
}
```

### 不同类型请求的超时策略
```javascript
// 针对不同API端点的超时策略
class TimeoutManager {
  constructor() {
    this.timeouts = {
      // 快速查询接口
      'fast': 3000,
      // 普通CRUD操作
      'normal': 10000,
      // 数据分析接口
      'analysis': 30000,
      // 文件上传
      'upload': 60000,
      // 报表生成
      'report': 120000
    };
  }
  
  getTimeout(type) {
    return this.timeouts[type] || this.timeouts.normal;
  }
  
  setCustomTimeout(type, timeout) {
    this.timeouts[type] = timeout;
  }
}

const timeoutManager = new TimeoutManager();

// 根据接口类型设置不同超时
async function smartRequest(url, options = {}) {
  const { type = 'normal', ...otherOptions } = options;
  const timeout = timeoutManager.getTimeout(type);
  
  try {
    const response = await axios({
      url,
      timeout,
      ...otherOptions
    });
    
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error(`${type}类型请求超时 (${timeout}ms)`);
    }
    throw error;
  }
}

// 使用示例
smartRequest('/api/users', { type: 'fast' });
smartRequest('/api/upload', { type: 'upload', method: 'post', data: formData });
smartRequest('/api/generate-report', { type: 'report' });
```

### 超时重试机制
```javascript
// 带重试的超时处理
async function requestWithTimeoutRetry(url, config = {}, maxRetries = 3) {
  const baseTimeout = config.timeout || 5000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 递增超时时间
      const timeout = baseTimeout * attempt;
      
      console.log(`尝试第${attempt}次请求，超时时间: ${timeout}ms`);
      
      const response = await axios({
        url,
        timeout,
        ...config
      });
      
      console.log(`第${attempt}次请求成功`);
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log(`第${attempt}次请求超时`);
        
        if (attempt === maxRetries) {
          throw new Error(`请求失败：经过${maxRetries}次重试后仍然超时`);
        }
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        // 非超时错误，直接抛出
        throw error;
      }
    }
  }
}
```

## 3.4 响应配置和处理

### 响应数据类型
```javascript
// 不同响应类型的处理
const responseTypeExamples = {
  // JSON数据（默认）
  json: async () => {
    const response = await axios.get('/api/users', {
      responseType: 'json'
    });
    console.log('JSON数据:', response.data);
    return response.data;
  },
  
  // 纯文本
  text: async () => {
    const response = await axios.get('/api/readme', {
      responseType: 'text'
    });
    console.log('文本内容:', response.data);
    return response.data;
  },
  
  // 二进制数据
  arraybuffer: async () => {
    const response = await axios.get('/api/file.pdf', {
      responseType: 'arraybuffer'
    });
    console.log('二进制数据长度:', response.data.byteLength);
    return response.data;
  },
  
  // Blob对象（浏览器中）
  blob: async () => {
    const response = await axios.get('/api/image.jpg', {
      responseType: 'blob'
    });
    console.log('Blob类型:', response.data.type);
    return response.data;
  },
  
  // 流数据（Node.js中）
  stream: async () => {
    const response = await axios.get('/api/large-file', {
      responseType: 'stream'
    });
    
    // 处理流数据
    response.data.on('data', chunk => {
      console.log('收到数据块:', chunk.length);
    });
    
    response.data.on('end', () => {
      console.log('流数据接收完成');
    });
    
    return response.data;
  }
};
```

### 响应状态码验证
```javascript
// 自定义状态码验证
const statusValidators = {
  // 默认验证（200-299为成功）
  default: (status) => status >= 200 && status < 300,
  
  // 宽松验证（包括304 Not Modified）
  lenient: (status) => (status >= 200 && status < 300) || status === 304,
  
  // 严格验证（只有200为成功）
  strict: (status) => status === 200,
  
  // 自定义业务验证
  business: (status) => {
    // 200: 成功
    // 201: 创建成功
    // 204: 删除成功
    // 400: 参数错误但可处理
    return [200, 201, 204, 400].includes(status);
  }
};

async function requestWithStatusValidation(url, validationType = 'default') {
  try {
    const response = await axios.get(url, {
      validateStatus: statusValidators[validationType]
    });
    
    console.log('状态码:', response.status);
    console.log('响应数据:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('请求失败:', error.response?.status, error.response?.data);
    throw error;
  }
}
```

### 响应数据转换
```javascript
// 自定义响应数据转换器
const responseTransformers = {
  // 添加接收时间戳
  addTimestamp: (data) => {
    if (typeof data === 'object' && data !== null) {
      data._receivedAt = new Date().toISOString();
    }
    return data;
  },
  
  // 转换日期字符串为Date对象
  parseDates: (data) => {
    if (typeof data === 'object' && data !== null) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      
      function parseObject(obj) {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (typeof value === 'string' && dateRegex.test(value)) {
              obj[key] = new Date(value);
            } else if (typeof value === 'object' && value !== null) {
              parseObject(value);
            }
          }
        }
      }
      
      parseObject(data);
    }
    return data;
  },
  
  // 标准化API响应格式
  normalizeResponse: (data) => {
    // 假设后端返回格式为 { code: 200, message: 'success', data: {...} }
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code === 200) {
        return data.data;
      } else {
        throw new Error(data.message || '请求失败');
      }
    }
    return data;
  }
};

// 使用自定义转换器
async function requestWithTransforms() {
  const response = await axios.get('/api/users', {
    transformResponse: [
      ...axios.defaults.transformResponse, // 保留默认转换器
      responseTransformers.addTimestamp,
      responseTransformers.parseDates,
      responseTransformers.normalizeResponse
    ]
  });
  
  console.log('转换后的数据:', response.data);
  return response.data;
}
```

## 3.5 请求配置模板

### 配置模板类
```javascript
// 请求配置模板管理器
class RequestConfigManager {
  constructor() {
    this.templates = {
      // API请求模板
      api: {
        baseURL: '/api/v1',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        validateStatus: (status) => status >= 200 && status < 300
      },
      
      // 文件上传模板
      upload: {
        timeout: 60000,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`上传进度: ${percent}%`);
        }
      },
      
      // 文件下载模板
      download: {
        responseType: 'blob',
        timeout: 120000,
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`下载进度: ${percent}%`);
          }
        }
      },
      
      // 长轮询模板
      longPolling: {
        timeout: 30000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    };
  }
  
  // 获取模板
  getTemplate(name) {
    return { ...this.templates[name] };
  }
  
  // 合并配置
  mergeConfig(templateName, customConfig = {}) {
    const template = this.getTemplate(templateName);
    
    return {
      ...template,
      ...customConfig,
      headers: {
        ...template.headers,
        ...customConfig.headers
      }
    };
  }
  
  // 添加自定义模板
  addTemplate(name, config) {
    this.templates[name] = config;
  }
}

// 使用配置模板
const configManager = new RequestConfigManager();

// API请求
async function apiRequest(url, data, customConfig = {}) {
  const config = configManager.mergeConfig('api', {
    method: 'post',
    url,
    data,
    ...customConfig
  });
  
  const response = await axios(config);
  return response.data;
}

// 文件上传
async function uploadFile(file, customConfig = {}) {
  const formData = new FormData();
  formData.append('file', file);
  
  const config = configManager.mergeConfig('upload', {
    method: 'post',
    url: '/api/upload',
    data: formData,
    ...customConfig
  });
  
  const response = await axios(config);
  return response.data;
}

// 文件下载
async function downloadFile(url, filename) {
  const config = configManager.mergeConfig('download', {
    method: 'get',
    url
  });
  
  const response = await axios(config);
  
  // 创建下载链接（浏览器环境）
  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(downloadUrl);
  
  return true;
}
```

## 3.6 实际应用示例

### 完整的API客户端配置
```javascript
// 企业级API客户端配置
class EnterpriseApiClient {
  constructor(config = {}) {
    this.config = {
      baseURL: config.baseURL || '/api/v1',
      timeout: config.timeout || 10000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      ...config
    };
    
    this.setupClient();
  }
  
  setupClient() {
    // 创建axios实例
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Version': '1.0.0'
      }
    });
    
    // 设置请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 添加请求时间戳
        config.metadata = { startTime: Date.now() };
        
        // 添加请求ID
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        console.log(`发送请求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('请求配置错误:', error);
        return Promise.reject(error);
      }
    );
    
    // 设置响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        console.log(`请求完成: ${response.status} (${duration}ms)`);
        return response;
      },
      (error) => {
        const duration = error.config?.metadata
          ? Date.now() - error.config.metadata.startTime
          : 0;
        
        console.error(`请求失败: ${error.response?.status} (${duration}ms)`);
        
        // 重试逻辑
        return this.handleRetry(error);
      }
    );
  }
  
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  async handleRetry(error) {
    const config = error.config;
    
    if (!config || !this.shouldRetry(error)) {
      return Promise.reject(error);
    }
    
    config.__retryCount = config.__retryCount || 0;
    
    if (config.__retryCount >= this.config.retries) {
      return Promise.reject(error);
    }
    
    config.__retryCount++;
    
    console.log(`重试请求 (${config.__retryCount}/${this.config.retries})`);
    
    // 等待重试延迟
    await new Promise(resolve => 
      setTimeout(resolve, this.config.retryDelay * config.__retryCount)
    );
    
    return this.client(config);
  }
  
  shouldRetry(error) {
    // 网络错误或5xx错误才重试
    return !error.response || (error.response.status >= 500);
  }
  
  // API方法
  async get(url, config = {}) {
    const response = await this.client.get(url, config);
    return response.data;
  }
  
  async post(url, data, config = {}) {
    const response = await this.client.post(url, data, config);
    return response.data;
  }
  
  async put(url, data, config = {}) {
    const response = await this.client.put(url, data, config);
    return response.data;
  }
  
  async patch(url, data, config = {}) {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }
  
  async delete(url, config = {}) {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

// 使用企业级客户端
const apiClient = new EnterpriseApiClient({
  baseURL: 'https://api.myservice.com/v1',
  timeout: 15000,
  retries: 3,
  retryDelay: 1000
});

// 业务API封装
class UserService {
  constructor(apiClient) {
    this.api = apiClient;
  }
  
  async getUsers(params = {}) {
    return this.api.get('/users', { params });
  }
  
  async getUser(id) {
    return this.api.get(`/users/${id}`);
  }
  
  async createUser(userData) {
    return this.api.post('/users', userData);
  }
  
  async updateUser(id, userData) {
    return this.api.put(`/users/${id}`, userData);
  }
  
  async deleteUser(id) {
    return this.api.delete(`/users/${id}`);
  }
}

const userService = new UserService(apiClient);
```

## 本章小结

在第3章中，我们深入学习了：

1. **请求配置对象**：理解了完整的配置选项和优先级机制
2. **请求头管理**：掌握了静态和动态请求头的设置方法
3. **超时配置**：学会了设置超时时间和重试机制
4. **响应处理**：理解了不同响应类型和数据转换
5. **配置模板**：学会了创建可复用的配置模板
6. **实际应用**：掌握了构建企业级API客户端的方法

这些知识让我们能够精确控制HTTP请求的各个方面，为构建稳定可靠的网络应用奠定基础。

## 关键要点
- 配置对象提供了全面的请求控制能力
- 请求头管理是API交互的重要环节
- 合理的超时和重试机制提高应用健壮性
- 响应数据的正确处理影响用户体验
- 配置模板可以提高开发效率和一致性
- 企业级应用需要完善的错误处理和监控

## 下一章预告
下一章将学习拦截器机制，这是Axios最强大的功能之一，可以实现统一的请求响应处理和中间件功能。