---
title: "第8章：文件上传和下载"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第8章：文件上传和下载

## 学习目标
1. 掌握单文件上传的实现
2. 学会多文件上传处理
3. 实现上传进度监控
4. 掌握文件下载功能
5. 处理大文件和断点续传

## 8.1 文件上传基础

### 单文件上传
```javascript
// 单文件上传
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`上传进度: ${percent}%`);
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('文件上传失败:', error);
    throw error;
  }
}
```

### 多文件上传
```javascript
// 多文件上传
async function uploadMultipleFiles(files) {
  const formData = new FormData();
  
  // 添加多个文件
  files.forEach((file, index) => {
    formData.append(`file${index}`, file);
  });
  
  const response = await axios.post('/api/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`总上传进度: ${percent}%`);
    }
  });
  
  return response.data;
}
```

## 8.2 上传进度监控

### 进度回调处理
```javascript
class UploadProgressHandler {
  constructor(onProgress) {
    this.onProgress = onProgress;
    this.startTime = null;
  }
  
  handleProgress(progressEvent) {
    if (!this.startTime) {
      this.startTime = Date.now();
    }
    
    const { loaded, total } = progressEvent;
    const percent = Math.round((loaded * 100) / total);
    const elapsed = Date.now() - this.startTime;
    const rate = loaded / elapsed * 1000; // bytes per second
    const remaining = (total - loaded) / rate;
    
    this.onProgress({
      percent,
      loaded,
      total,
      rate: this.formatBytes(rate) + '/s',
      remaining: this.formatTime(remaining)
    });
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  formatTime(seconds) {
    if (seconds < 60) return Math.round(seconds) + 's';
    return Math.round(seconds / 60) + 'm';
  }
}
```

## 8.3 文件下载

### 基本文件下载
```javascript
// 下载文件
async function downloadFile(url, filename) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`下载进度: ${percent}%`);
        }
      }
    });
    
    // 创建下载链接
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return true;
  } catch (error) {
    console.error('文件下载失败:', error);
    throw error;
  }
}
```

### 大文件分片下载
```javascript
class ChunkedDownloader {
  constructor(url, chunkSize = 1024 * 1024) { // 1MB chunks
    this.url = url;
    this.chunkSize = chunkSize;
  }
  
  async download() {
    // 获取文件大小
    const headResponse = await axios.head(this.url);
    const fileSize = parseInt(headResponse.headers['content-length']);
    
    const chunks = [];
    const promises = [];
    
    for (let start = 0; start < fileSize; start += this.chunkSize) {
      const end = Math.min(start + this.chunkSize - 1, fileSize - 1);
      
      const promise = axios.get(this.url, {
        headers: {
          Range: `bytes=${start}-${end}`
        },
        responseType: 'arraybuffer'
      }).then(response => {
        chunks[start / this.chunkSize] = response.data;
      });
      
      promises.push(promise);
    }
    
    await Promise.all(promises);
    
    // 合并chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    chunks.forEach(chunk => {
      result.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    });
    
    return result.buffer;
  }
}
```

## 8.4 文件类型验证

### 上传前验证
```javascript
class FileValidator {
  constructor() {
    this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    this.maxSize = 10 * 1024 * 1024; // 10MB
  }
  
  validate(file) {
    const errors = [];
    
    // 检查文件类型
    if (!this.allowedTypes.includes(file.type)) {
      errors.push(`不支持的文件类型: ${file.type}`);
    }
    
    // 检查文件大小
    if (file.size > this.maxSize) {
      errors.push(`文件大小超出限制: ${this.formatBytes(file.size)}`);
    }
    
    // 检查文件名
    if (!this.isValidFilename(file.name)) {
      errors.push('文件名包含非法字符');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  isValidFilename(filename) {
    // 检查文件名是否包含非法字符
    const invalidChars = /[<>:"/\\|?*]/;
    return !invalidChars.test(filename);
  }
  
  formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}
```

## 本章小结

- 文件上传需要使用FormData和multipart/form-data
- 进度监控提升用户体验
- 文件下载支持进度跟踪和分片处理
- 文件验证确保安全性和规范性

## 关键要点
- FormData自动设置正确的Content-Type
- 进度回调提供丰富的上传/下载信息
- 分片技术处理大文件传输
- 客户端验证提高用户体验，服务端验证确保安全