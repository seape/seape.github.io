---
title: "第12章：框架集成与实战应用"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第12章：框架集成与实战应用

## 学习目标
1. 掌握在Vue.js中集成Axios
2. 学会在React中使用Axios
3. 了解在Node.js中的应用
4. 实现状态管理集成
5. 构建完整的API服务层

## 12.1 Vue.js集成

### Vue 3 + Composition API
```javascript
// composables/useApi.js
import { ref, reactive } from 'vue'
import axios from 'axios'

export function useApi(baseURL = '/api') {
  const loading = ref(false)
  const error = ref(null)
  
  const client = axios.create({
    baseURL,
    timeout: 10000
  })
  
  // 请求拦截器
  client.interceptors.request.use(
    config => {
      loading.value = true
      error.value = null
      return config
    },
    err => {
      loading.value = false
      error.value = err
      return Promise.reject(err)
    }
  )
  
  // 响应拦截器
  client.interceptors.response.use(
    response => {
      loading.value = false
      return response
    },
    err => {
      loading.value = false
      error.value = err
      return Promise.reject(err)
    }
  )
  
  const get = async (url, config = {}) => {
    try {
      const response = await client.get(url, config)
      return response.data
    } catch (err) {
      throw err
    }
  }
  
  const post = async (url, data, config = {}) => {
    try {
      const response = await client.post(url, data, config)
      return response.data
    } catch (err) {
      throw err
    }
  }
  
  return {
    loading: readonly(loading),
    error: readonly(error),
    get,
    post,
    put: (url, data, config) => client.put(url, data, config),
    delete: (url, config) => client.delete(url, config),
    client
  }
}

// 在组件中使用
// UserList.vue
<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <ul v-else>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'

const { loading, error, get } = useApi()
const users = ref([])

onMounted(async () => {
  try {
    users.value = await get('/users')
  } catch (err) {
    console.error('获取用户列表失败:', err)
  }
})
</script>
```

### Pinia状态管理集成
```javascript
// stores/user.js
import { defineStore } from 'pinia'
import { useApi } from '@/composables/useApi'

export const useUserStore = defineStore('user', () => {
  const { get, post, put, delete: del } = useApi()
  
  const users = ref([])
  const currentUser = ref(null)
  const loading = ref(false)
  
  const fetchUsers = async () => {
    loading.value = true
    try {
      users.value = await get('/users')
    } catch (error) {
      console.error('获取用户失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  const createUser = async (userData) => {
    try {
      const newUser = await post('/users', userData)
      users.value.push(newUser)
      return newUser
    } catch (error) {
      console.error('创建用户失败:', error)
      throw error
    }
  }
  
  const updateUser = async (id, userData) => {
    try {
      const updatedUser = await put(`/users/${id}`, userData)
      const index = users.value.findIndex(u => u.id === id)
      if (index > -1) {
        users.value[index] = updatedUser
      }
      return updatedUser
    } catch (error) {
      console.error('更新用户失败:', error)
      throw error
    }
  }
  
  return {
    users,
    currentUser,
    loading,
    fetchUsers,
    createUser,
    updateUser
  }
})
```

## 12.2 React集成

### 自定义Hook
```javascript
// hooks/useApi.js
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export function useApi(baseURL = '/api') {
  const [client] = useState(() => axios.create({
    baseURL,
    timeout: 10000
  }))
  
  useEffect(() => {
    const requestInterceptor = client.interceptors.request.use(
      config => config,
      error => Promise.reject(error)
    )
    
    const responseInterceptor = client.interceptors.response.use(
      response => response,
      error => {
        console.error('API错误:', error)
        return Promise.reject(error)
      }
    )
    
    return () => {
      client.interceptors.request.eject(requestInterceptor)
      client.interceptors.response.eject(responseInterceptor)
    }
  }, [client])
  
  return client
}

// hooks/useUsers.js
import { useState, useEffect } from 'react'
import { useApi } from './useApi'

export function useUsers() {
  const api = useApi()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [api])
  
  const createUser = useCallback(async (userData) => {
    try {
      const response = await api.post('/users', userData)
      setUsers(prev => [...prev, response.data])
      return response.data
    } catch (err) {
      setError(err)
      throw err
    }
  }, [api])
  
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])
  
  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    createUser
  }
}
```

### React Context集成
```javascript
// context/ApiContext.js
import React, { createContext, useContext, useEffect } from 'react'
import axios from 'axios'

const ApiContext = createContext()

export function ApiProvider({ children, baseURL = '/api' }) {
  const client = axios.create({
    baseURL,
    timeout: 10000
  })
  
  // 设置拦截器
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    
    const responseInterceptor = client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
    
    return () => {
      client.interceptors.response.eject(responseInterceptor)
    }
  }, [client])
  
  return (
    <ApiContext.Provider value={client}>
      {children}
    </ApiContext.Provider>
  )
}

export function useApiClient() {
  const client = useContext(ApiContext)
  if (!client) {
    throw new Error('useApiClient必须在ApiProvider内使用')
  }
  return client
}
```

## 12.3 Node.js后端集成

### Express中间件
```javascript
// middleware/apiClient.js
const axios = require('axios')

function createApiClient(baseURL, timeout = 10000) {
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'User-Agent': 'NodeJS-Server/1.0'
    }
  })
  
  // 请求拦截器
  client.interceptors.request.use(
    config => {
      console.log(`发送请求: ${config.method?.toUpperCase()} ${config.url}`)
      return config
    },
    error => {
      console.error('请求配置错误:', error)
      return Promise.reject(error)
    }
  )
  
  // 响应拦截器
  client.interceptors.response.use(
    response => {
      console.log(`请求成功: ${response.status} ${response.config.url}`)
      return response
    },
    error => {
      console.error(`请求失败: ${error.response?.status} ${error.config?.url}`)
      return Promise.reject(error)
    }
  )
  
  return client
}

// 创建不同服务的客户端
const userServiceClient = createApiClient('http://user-service:3001')
const orderServiceClient = createApiClient('http://order-service:3002')

module.exports = {
  userServiceClient,
  orderServiceClient
}
```

### 服务代理层
```javascript
// services/UserService.js
const { userServiceClient } = require('../middleware/apiClient')

class UserService {
  async getUsers(page = 1, limit = 10) {
    try {
      const response = await userServiceClient.get('/users', {
        params: { page, limit }
      })
      return response.data
    } catch (error) {
      throw new Error(`获取用户列表失败: ${error.message}`)
    }
  }
  
  async getUserById(id) {
    try {
      const response = await userServiceClient.get(`/users/${id}`)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        return null
      }
      throw new Error(`获取用户失败: ${error.message}`)
    }
  }
  
  async createUser(userData) {
    try {
      const response = await userServiceClient.post('/users', userData)
      return response.data
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(`创建用户失败: ${error.response.data.message}`)
      }
      throw new Error(`创建用户失败: ${error.message}`)
    }
  }
}

module.exports = new UserService()
```

## 12.4 完整应用示例

### 前后端分离架构
```javascript
// 前端 - API服务层
// services/ApiService.js
class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.VUE_APP_API_BASE_URL || '/api',
      timeout: 10000
    })
    
    this.setupInterceptors()
  }
  
  setupInterceptors() {
    // 请求拦截器 - 添加认证
    this.client.interceptors.request.use(config => {
      const token = this.$store.getters['auth/token']
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
    
    // 响应拦截器 - 处理错误
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          this.$store.dispatch('auth/logout')
          this.$router.push('/login')
        }
        
        return Promise.reject(error)
      }
    )
  }
  
  // 用户相关API
  users = {
    list: (params) => this.client.get('/users', { params }),
    get: (id) => this.client.get(`/users/${id}`),
    create: (data) => this.client.post('/users', data),
    update: (id, data) => this.client.put(`/users/${id}`, data),
    delete: (id) => this.client.delete(`/users/${id}`)
  }
  
  // 订单相关API
  orders = {
    list: (params) => this.client.get('/orders', { params }),
    get: (id) => this.client.get(`/orders/${id}`),
    create: (data) => this.client.post('/orders', data),
    update: (id, data) => this.client.put(`/orders/${id}`, data),
    cancel: (id) => this.client.post(`/orders/${id}/cancel`)
  }
}

export default new ApiService()
```

### 错误边界和恢复
```javascript
// utils/errorHandler.js
export class ApiErrorHandler {
  static handle(error, context = {}) {
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      context
    }
    
    // 记录错误
    console.error('API错误:', errorInfo)
    
    // 根据错误类型进行不同处理
    if (error.response) {
      return this.handleResponseError(error.response, context)
    } else if (error.request) {
      return this.handleNetworkError(error, context)
    } else {
      return this.handleConfigError(error, context)
    }
  }
  
  static handleResponseError(response, context) {
    const { status, data } = response
    
    switch (status) {
      case 400:
        return { message: '请求参数错误', canRetry: false }
      case 401:
        return { message: '请重新登录', canRetry: false, requiresAuth: true }
      case 403:
        return { message: '没有权限访问', canRetry: false }
      case 404:
        return { message: '请求的资源不存在', canRetry: false }
      case 500:
        return { message: '服务器错误，请稍后重试', canRetry: true }
      default:
        return { message: data?.message || '请求失败', canRetry: true }
    }
  }
  
  static handleNetworkError(error, context) {
    if (error.code === 'ECONNABORTED') {
      return { message: '请求超时，请稍后重试', canRetry: true }
    }
    return { message: '网络连接失败，请检查网络', canRetry: true }
  }
}
```

## 本章小结

通过本章学习，我们掌握了：
- 在Vue.js中使用Composition API和Pinia集成Axios
- 在React中通过自定义Hook和Context使用Axios
- 在Node.js后端环境中的Axios应用
- 构建完整的API服务层架构
- 统一的错误处理和恢复机制

## Axios课程完整总结

经过12章的系统学习，我们从Axios基础入门开始，逐步深入到高级应用，最终完成了完整的Axios HTTP客户端学习：

### 核心技能掌握
- **基础技能**: HTTP方法、请求配置、响应处理、错误处理
- **进阶技能**: 拦截器机制、实例化配置、取消请求、并发控制
- **高级应用**: 文件上传下载、身份认证、性能优化、TypeScript集成
- **实战应用**: 框架集成、企业级架构、最佳实践

### 关键特性理解
- 拦截器提供了强大的请求响应处理能力
- 实例化支持多服务和多环境配置
- 完善的错误处理机制保证应用稳定性
- TypeScript集成提供类型安全保障
- 框架集成适配不同的开发环境

### 生产级实践
- 安全的认证机制和token管理
- 高效的缓存和性能优化策略
- 完善的错误恢复和用户体验
- 可维护的代码架构和最佳实践
- 全面的测试和监控方案

Axios作为现代Web开发中最重要的HTTP客户端库，为我们提供了完整的网络通信解决方案。掌握这些知识和技能，将为构建高质量的Web应用提供坚实基础。

## 关键要点
- 不同框架有各自的集成最佳实践
- 状态管理集成简化数据流管理
- 统一的API服务层提高代码复用性
- 完善的错误处理机制提升用户体验
- 持续学习新的API设计模式和最佳实践