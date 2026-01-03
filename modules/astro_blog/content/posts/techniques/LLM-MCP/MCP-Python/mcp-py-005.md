---
title: "第5章：Resources资源管理"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第5章：Resources资源管理

## 学习目标
1. 理解Resources的概念和用途
2. 学会创建和管理各种资源类型
3. 掌握资源的读取、更新和监听机制
4. 实现文件系统、数据库等资源提供者
5. 学习资源权限和安全控制

## 1. Resources概念概述

### 1.1 什么是Resources
Resources是MCP协议中用于向AI模型提供各种类型数据源和内容的机制。与Tools不同，Resources主要用于：
- 提供可读取的数据内容
- 向AI模型暴露各种信息源
- 实现动态内容访问
- 支持实时数据更新

### 1.2 Resources vs Tools的区别
| 特性 | Resources | Tools |
|------|-----------|-------|
| 用途 | 提供数据和内容 | 执行操作和任务 |
| 访问方式 | 读取为主 | 执行为主 |
| 数据流向 | Server → Client | Client → Server → Client |
| 实时性 | 支持变更监听 | 按需执行 |

## 2. Resources类型和结构

### 2.1 Resource基本结构
```typescript
interface Resource {
  uri: string;           // 资源唯一标识符
  name: string;          // 资源显示名称
  description?: string;  // 资源描述
  mimeType?: string;     // MIME类型
  annotations?: {        // 元数据注释
    audience?: ["human" | "assistant"];
    priority?: number;
  };
}
```

### 2.2 常见Resource类型
1. **文件资源** - 本地文件系统内容
2. **数据库资源** - 数据库查询结果
3. **API资源** - 外部API数据
4. **配置资源** - 应用配置信息
5. **日志资源** - 系统日志数据

## 3. 实现Resources功能

### 3.1 基础Resource Provider
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";

class ResourceManager {
  private server: Server;
  private resources: Map<string, any> = new Map();

  constructor(server: Server) {
    this.server = server;
    this.setupResourceHandlers();
  }

  private setupResourceHandlers() {
    // 列出可用资源
    this.server.setRequestHandler(
      "resources/list",
      async () => {
        return {
          resources: Array.from(this.resources.values())
        };
      }
    );

    // 读取特定资源
    this.server.setRequestHandler(
      "resources/read",
      async (request) => {
        const { uri } = request.params;
        return await this.readResource(uri);
      }
    );
  }

  async readResource(uri: string) {
    const resource = this.resources.get(uri);
    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }

    // 根据资源类型读取内容
    const content = await this.loadResourceContent(resource);
    
    return {
      contents: [{
        uri: resource.uri,
        mimeType: resource.mimeType,
        text: content
      }]
    };
  }

  private async loadResourceContent(resource: any): Promise<string> {
    // 实现具体的资源内容加载逻辑
    return "Resource content";
  }
}
```

### 3.2 文件系统Resource Provider
```typescript
import { promises as fs } from "fs";
import path from "path";

class FileSystemResourceProvider {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = path.resolve(basePath);
  }

  async listResources(): Promise<Resource[]> {
    const files = await this.scanDirectory(this.basePath);
    return files.map(file => ({
      uri: `file://${file}`,
      name: path.basename(file),
      description: `File: ${path.relative(this.basePath, file)}`,
      mimeType: this.getMimeType(file)
    }));
  }

  async readResource(uri: string): Promise<string> {
    const filePath = uri.replace("file://", "");
    
    // 安全检查：确保文件在允许的目录内
    if (!filePath.startsWith(this.basePath)) {
      throw new Error("Access denied: file outside allowed directory");
    }

    try {
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  private async scanDirectory(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await this.scanDirectory(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".txt": "text/plain",
      ".md": "text/markdown",
      ".json": "application/json",
      ".js": "text/javascript",
      ".ts": "text/typescript",
      ".py": "text/x-python",
      ".html": "text/html",
      ".css": "text/css"
    };
    return mimeTypes[ext] || "text/plain";
  }
}
```

## 4. 数据库Resource Provider

### 4.1 数据库查询资源
```typescript
import { Database } from "sqlite3";

class DatabaseResourceProvider {
  private db: Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  async listResources(): Promise<Resource[]> {
    return [
      {
        uri: "db://users",
        name: "Users Table",
        description: "All users in the system",
        mimeType: "application/json"
      },
      {
        uri: "db://orders",
        name: "Orders Table", 
        description: "Order records",
        mimeType: "application/json"
      }
    ];
  }

  async readResource(uri: string): Promise<string> {
    const table = uri.replace("db://", "");
    
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM ${table} LIMIT 100`, (err, rows) => {
        if (err) {
          reject(new Error(`Database query failed: ${err.message}`));
        } else {
          resolve(JSON.stringify(rows, null, 2));
        }
      });
    });
  }

  async executeQuery(query: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(new Error(`Query failed: ${err.message}`));
        } else {
          resolve(JSON.stringify(rows, null, 2));
        }
      });
    });
  }
}
```

## 5. 资源监听和变更通知

### 5.1 Resource变更监听
```typescript
import { EventEmitter } from "events";
import { watch } from "chokidar";

class ResourceWatcher extends EventEmitter {
  private watchers: Map<string, any> = new Map();

  watchFileResource(uri: string, filePath: string) {
    const watcher = watch(filePath);
    
    watcher.on("change", () => {
      this.emit("resourceChanged", {
        uri,
        changeType: "modified"
      });
    });

    watcher.on("unlink", () => {
      this.emit("resourceChanged", {
        uri,
        changeType: "deleted"
      });
    });

    this.watchers.set(uri, watcher);
  }

  unwatchResource(uri: string) {
    const watcher = this.watchers.get(uri);
    if (watcher) {
      watcher.close();
      this.watchers.delete(uri);
    }
  }

  stopAllWatchers() {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
  }
}
```

### 5.2 通知客户端资源变更
```typescript
class ManagedResourceProvider {
  private server: Server;
  private watcher: ResourceWatcher;

  constructor(server: Server) {
    this.server = server;
    this.watcher = new ResourceWatcher();
    this.setupChangeNotifications();
  }

  private setupChangeNotifications() {
    this.watcher.on("resourceChanged", (change) => {
      // 通知客户端资源发生变更
      this.server.notification({
        method: "notifications/resources/updated",
        params: {
          uri: change.uri,
          changeType: change.changeType
        }
      });
    });
  }

  addFileResource(uri: string, filePath: string) {
    // 添加文件资源并开始监听
    this.watcher.watchFileResource(uri, filePath);
  }
}
```

## 6. 资源权限和安全控制

### 6.1 访问权限控制
```typescript
interface ResourcePermission {
  uri: string;
  allowedOperations: ("read" | "write" | "delete")[];
  accessLevel: "public" | "protected" | "private";
}

class ResourceSecurityManager {
  private permissions: Map<string, ResourcePermission> = new Map();

  setResourcePermission(permission: ResourcePermission) {
    this.permissions.set(permission.uri, permission);
  }

  checkReadAccess(uri: string, userContext?: any): boolean {
    const permission = this.permissions.get(uri);
    if (!permission) {
      return false; // 默认拒绝访问
    }

    // 检查读取权限
    if (!permission.allowedOperations.includes("read")) {
      return false;
    }

    // 根据访问级别进行权限检查
    switch (permission.accessLevel) {
      case "public":
        return true;
      case "protected":
        return this.validateUserAccess(userContext);
      case "private":
        return this.validateAdminAccess(userContext);
      default:
        return false;
    }
  }

  private validateUserAccess(userContext?: any): boolean {
    // 实现用户权限验证逻辑
    return userContext && userContext.authenticated;
  }

  private validateAdminAccess(userContext?: any): boolean {
    // 实现管理员权限验证逻辑
    return userContext && userContext.role === "admin";
  }
}
```

### 6.2 输入验证和清理
```typescript
class ResourceValidator {
  static validateUri(uri: string): boolean {
    // URI格式验证
    try {
      new URL(uri);
      return true;
    } catch {
      return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(uri);
    }
  }

  static sanitizeContent(content: string, mimeType: string): string {
    switch (mimeType) {
      case "text/html":
        return this.sanitizeHtml(content);
      case "application/json":
        return this.sanitizeJson(content);
      default:
        return content;
    }
  }

  private static sanitizeHtml(html: string): string {
    // 移除潜在的恶意HTML内容
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/javascript:/gi, "");
  }

  private static sanitizeJson(json: string): string {
    try {
      // 验证JSON格式并重新序列化
      const parsed = JSON.parse(json);
      return JSON.stringify(parsed, null, 2);
    } catch {
      throw new Error("Invalid JSON content");
    }
  }
}
```

## 7. 完整Resource Server示例

### 7.1 综合Resource Server
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

class ComprehensiveResourceServer {
  private server: Server;
  private fileProvider: FileSystemResourceProvider;
  private dbProvider: DatabaseResourceProvider;
  private securityManager: ResourceSecurityManager;
  private watcher: ResourceWatcher;

  constructor() {
    this.server = new Server(
      {
        name: "comprehensive-resource-server",
        version: "1.0.0"
      },
      {
        capabilities: {
          resources: {
            subscribe: true,  // 支持资源变更订阅
            listChanged: true // 支持资源列表变更
          }
        }
      }
    );

    this.fileProvider = new FileSystemResourceProvider("./data");
    this.dbProvider = new DatabaseResourceProvider("./db.sqlite");
    this.securityManager = new ResourceSecurityManager();
    this.watcher = new ResourceWatcher();

    this.setupHandlers();
  }

  private setupHandlers() {
    // 资源列表
    this.server.setRequestHandler("resources/list", async () => {
      const fileResources = await this.fileProvider.listResources();
      const dbResources = await this.dbProvider.listResources();
      
      return {
        resources: [...fileResources, ...dbResources]
      };
    });

    // 读取资源
    this.server.setRequestHandler("resources/read", async (request) => {
      const { uri } = request.params;

      // 权限检查
      if (!this.securityManager.checkReadAccess(uri)) {
        throw new Error("Access denied");
      }

      // 路由到相应的provider
      let content: string;
      if (uri.startsWith("file://")) {
        content = await this.fileProvider.readResource(uri);
      } else if (uri.startsWith("db://")) {
        content = await this.dbProvider.readResource(uri);
      } else {
        throw new Error("Unsupported resource type");
      }

      return {
        contents: [{
          uri,
          mimeType: "text/plain",
          text: content
        }]
      };
    });

    // 资源订阅
    this.server.setRequestHandler("resources/subscribe", async (request) => {
      const { uri } = request.params;
      
      if (uri.startsWith("file://")) {
        const filePath = uri.replace("file://", "");
        this.watcher.watchFileResource(uri, filePath);
      }

      return {};
    });

    // 取消订阅
    this.server.setRequestHandler("resources/unsubscribe", async (request) => {
      const { uri } = request.params;
      this.watcher.unwatchResource(uri);
      return {};
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Comprehensive Resource Server running on stdio");
  }
}

// 启动服务器
const server = new ComprehensiveResourceServer();
server.start().catch(console.error);
```

## 8. 最佳实践

### 8.1 资源设计原则
1. **URI唯一性** - 确保每个资源有唯一的URI
2. **描述性命名** - 使用清晰描述性的资源名称
3. **适当的MIME类型** - 正确设置资源的MIME类型
4. **权限最小化** - 只提供必要的访问权限
5. **错误处理** - 优雅处理资源访问错误

### 8.2 性能优化
1. **缓存机制** - 对频繁访问的资源实现缓存
2. **懒加载** - 只在需要时加载资源内容
3. **分页支持** - 对大型资源实现分页访问
4. **压缩传输** - 对大型内容启用压缩

### 8.3 安全考虑
1. **路径遍历防护** - 防止../等路径遍历攻击
2. **内容过滤** - 过滤敏感信息和恶意内容
3. **访问日志** - 记录资源访问日志
4. **限流机制** - 防止资源滥用

## 小结

通过本章学习，我们掌握了：
- Resources的基本概念和架构
- 如何实现文件系统和数据库资源提供者
- 资源监听和变更通知机制
- 权限控制和安全防护
- 完整的Resource Server实现

Resources为MCP Server提供了强大的数据访问能力，使AI模型能够获取各种类型的信息源，是构建智能应用的重要基础。