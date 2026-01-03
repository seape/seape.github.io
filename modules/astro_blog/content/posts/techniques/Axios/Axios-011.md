---
title: "第11章：TypeScript集成"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第11章：TypeScript集成

## 学习目标
1. 掌握Axios的TypeScript类型定义
2. 学会创建类型安全的API客户端
3. 实现接口类型约束
4. 掌握泛型的高级应用
5. 构建类型完整的HTTP服务

## 11.1 基础类型定义

### Axios TypeScript基础
```typescript
import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

// 基础类型定义
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 基础用法
async function getUser(id: number): Promise<User> {
  const response: AxiosResponse<ApiResponse<User>> = await axios.get(`/api/users/${id}`);
  return response.data.data;
}
```

## 11.2 泛型API客户端

### 类型安全的API客户端
```typescript
class TypedApiClient {
  private client: AxiosInstance;
  
  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL,
      ...config
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API错误:', error);
        return Promise.reject(error);
      }
    );
  }
  
  // 泛型GET方法
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);
    return response.data.data;
  }
  
  // 泛型POST方法
  async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);
    return response.data.data;
  }
  
  // 泛型PUT方法
  async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config);
    return response.data.data;
  }
  
  // 泛型DELETE方法
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config);
    return response.data.data;
  }
}
```

## 11.3 服务层封装

### 类型化的服务层
```typescript
// 用户相关类型
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
}

interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// 用户服务类
class UserService {
  private api: TypedApiClient;
  
  constructor(api: TypedApiClient) {
    this.api = api;
  }
  
  async getUsers(params?: UserListParams): Promise<PaginatedResponse<User>> {
    return this.api.get<PaginatedResponse<User>>('/users', { params });
  }
  
  async getUser(id: number): Promise<User> {
    return this.api.get<User>(`/users/${id}`);
  }
  
  async createUser(userData: CreateUserRequest): Promise<User> {
    return this.api.post<User, CreateUserRequest>('/users', userData);
  }
  
  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    return this.api.put<User, UpdateUserRequest>(`/users/${id}`, userData);
  }
  
  async deleteUser(id: number): Promise<void> {
    return this.api.delete<void>(`/users/${id}`);
  }
}
```

## 11.4 高级类型应用

### 条件类型和映射类型
```typescript
// 响应类型条件映射
type ResponseData<T> = T extends string ? string :
                     T extends number ? number :
                     T extends boolean ? boolean :
                     T extends Array<infer U> ? U[] :
                     T;

// API端点类型映射
type ApiEndpoints = {
  '/users': {
    GET: { params?: UserListParams; response: PaginatedResponse<User> };
    POST: { data: CreateUserRequest; response: User };
  };
  '/users/:id': {
    GET: { response: User };
    PUT: { data: UpdateUserRequest; response: User };
    DELETE: { response: void };
  };
};

// 类型安全的请求函数
type ExtractParams<T> = T extends { params: infer P } ? P : never;
type ExtractData<T> = T extends { data: infer D } ? D : never;
type ExtractResponse<T> = T extends { response: infer R } ? R : never;

class TypeSafeApiClient {
  private client: AxiosInstance;
  
  constructor(baseURL: string) {
    this.client = axios.create({ baseURL });
  }
  
  async request<
    Path extends keyof ApiEndpoints,
    Method extends keyof ApiEndpoints[Path]
  >(
    method: Method,
    path: Path,
    options?: {
      params?: ExtractParams<ApiEndpoints[Path][Method]>;
      data?: ExtractData<ApiEndpoints[Path][Method]>;
    }
  ): Promise<ExtractResponse<ApiEndpoints[Path][Method]>> {
    const response = await this.client.request({
      method: method as string,
      url: path as string,
      params: options?.params,
      data: options?.data
    });
    
    return response.data;
  }
}
```

## 11.5 错误处理类型

### 类型化的错误处理
```typescript
// 错误类型定义
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR';
  fields: Record<string, string[]>;
}

interface AuthError extends ApiError {
  code: 'AUTH_ERROR';
  reason: 'INVALID_TOKEN' | 'TOKEN_EXPIRED' | 'INSUFFICIENT_PERMISSIONS';
}

// 类型化的错误处理器
class TypedErrorHandler {
  static handle(error: any): never {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const apiError = error.response.data as ApiError;
        
        switch (apiError.code) {
          case 'VALIDATION_ERROR':
            throw new ValidationErrorException(apiError as ValidationError);
          case 'AUTH_ERROR':
            throw new AuthErrorException(apiError as AuthError);
          default:
            throw new ApiErrorException(apiError);
        }
      } else if (error.request) {
        throw new NetworkErrorException(error.message);
      }
    }
    
    throw new UnknownErrorException(error.message);
  }
}

// 自定义错误类
class ApiErrorException extends Error {
  constructor(public apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiErrorException';
  }
}

class ValidationErrorException extends ApiErrorException {
  constructor(public validationError: ValidationError) {
    super(validationError);
    this.name = 'ValidationErrorException';
  }
}
```

## 11.6 装饰器模式

### 使用装饰器增强API
```typescript
// 缓存装饰器
function Cache(ttl: number = 300000) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = new Map<string, { data: any; timestamp: number }>();
    
    descriptor.value = async function(...args: any[]) {
      const key = JSON.stringify(args);
      const cached = cache.get(key);
      
      if (cached && Date.now() - cached.timestamp < ttl) {
        console.log(`缓存命中: ${propertyName}`);
        return cached.data;
      }
      
      const result = await method.apply(this, args);
      cache.set(key, { data: result, timestamp: Date.now() });
      
      return result;
    };
  };
}

// 重试装饰器
function Retry(maxAttempts: number = 3, delay: number = 1000) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      let lastError: Error;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await method.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          
          if (attempt === maxAttempts) break;
          
          console.log(`重试 ${propertyName} (${attempt}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
      
      throw lastError;
    };
  };
}

// 使用装饰器的服务类
class EnhancedUserService {
  constructor(private api: TypedApiClient) {}
  
  @Cache(300000) // 5分钟缓存
  async getUser(id: number): Promise<User> {
    return this.api.get<User>(`/users/${id}`);
  }
  
  @Retry(3, 1000) // 最多重试3次，间隔1秒
  async createUser(userData: CreateUserRequest): Promise<User> {
    return this.api.post<User>('/users', userData);
  }
}
```

## 11.7 配置类型

### 强类型配置
```typescript
interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  auth?: {
    type: 'bearer' | 'basic' | 'api-key';
    credentials: string | { username: string; password: string };
  };
  retry?: {
    attempts: number;
    delay: number;
  };
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}

class ConfigurableApiClient {
  private client: AxiosInstance;
  private config: Required<ApiClientConfig>;
  
  constructor(config: ApiClientConfig) {
    this.config = this.mergeWithDefaults(config);
    this.client = this.createAxiosInstance();
  }
  
  private mergeWithDefaults(config: ApiClientConfig): Required<ApiClientConfig> {
    return {
      baseURL: config.baseURL,
      timeout: config.timeout ?? 10000,
      auth: config.auth ?? { type: 'bearer', credentials: '' },
      retry: config.retry ?? { attempts: 3, delay: 1000 },
      cache: config.cache ?? { enabled: false, ttl: 300000 }
    };
  }
  
  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout
    });
    
    this.setupAuth(instance);
    return instance;
  }
  
  private setupAuth(instance: AxiosInstance): void {
    if (this.config.auth.type === 'bearer') {
      instance.defaults.headers.common['Authorization'] = 
        `Bearer ${this.config.auth.credentials}`;
    }
    // 其他认证方式...
  }
}
```

## 本章小结

- TypeScript为Axios提供了完整的类型支持
- 泛型让API客户端具有类型安全性
- 接口定义确保了数据结构的一致性
- 装饰器模式增强了API功能
- 强类型配置提高了代码质量

## 关键要点
- 使用泛型创建可重用的类型安全API
- 接口定义明确数据契约
- 错误类型化提高调试效率
- 装饰器增强功能而不破坏代码结构