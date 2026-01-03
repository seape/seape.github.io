---
title: "第7章：Server配置和生命周期"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第7章：Server配置和生命周期

## 学习目标
1. 掌握MCP Server的初始化和配置
2. 学习连接建立和握手过程
3. 理解Server的生命周期管理
4. 掌握优雅关闭和资源清理
5. 学习Server的监控和健康检查

## 1. MCP Server架构概述

### 1.1 Server组件结构
```typescript
interface ServerArchitecture {
  core: {
    server: Server;           // 核心服务器实例
    transport: Transport;     // 传输层
    protocol: Protocol;       // 协议处理器
  };
  handlers: {
    tools: ToolHandler[];     // 工具处理器
    resources: ResourceHandler[]; // 资源处理器
    prompts: PromptHandler[]; // 提示处理器
  };
  lifecycle: {
    initializer: Initializer; // 初始化器
    monitor: HealthMonitor;   // 健康监控
    cleanup: CleanupManager;  // 清理管理器
  };
}
```

### 1.2 Server状态管理
```typescript
enum ServerState {
  INITIALIZING = "initializing",
  CONNECTING = "connecting", 
  CONNECTED = "connected",
  READY = "ready",
  SHUTTING_DOWN = "shutting_down",
  SHUTDOWN = "shutdown",
  ERROR = "error"
}

interface ServerStatus {
  state: ServerState;
  startTime: Date;
  lastActivity: Date;
  connectionCount: number;
  errors: Error[];
}
```

## 2. Server初始化和配置

### 2.1 配置管理系统
```typescript
interface ServerConfig {
  server: {
    name: string;
    version: string;
    description?: string;
    timeout?: number;
    maxConnections?: number;
  };
  capabilities: {
    tools?: {
      listChanged?: boolean;
    };
    resources?: {
      subscribe?: boolean;
      listChanged?: boolean;
    };
    prompts?: {};
    logging?: {
      level?: "debug" | "info" | "warn" | "error";
    };
  };
  transport: {
    type: "stdio" | "sse" | "websocket";
    options?: Record<string, any>;
  };
  features?: {
    authentication?: boolean;
    compression?: boolean;
    encryption?: boolean;
  };
}

class ConfigManager {
  private config: ServerConfig;
  private validators: Map<string, (value: any) => boolean> = new Map();

  constructor(config: Partial<ServerConfig>) {
    this.config = this.mergeWithDefaults(config);
    this.setupValidators();
    this.validateConfig();
  }

  private mergeWithDefaults(config: Partial<ServerConfig>): ServerConfig {
    const defaults: ServerConfig = {
      server: {
        name: "mcp-server",
        version: "1.0.0",
        timeout: 30000,
        maxConnections: 10
      },
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
        logging: { level: "info" }
      },
      transport: {
        type: "stdio"
      }
    };

    return this.deepMerge(defaults, config);
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private setupValidators() {
    this.validators.set("server.timeout", (value) => 
      typeof value === "number" && value > 0 && value <= 300000);
    
    this.validators.set("server.maxConnections", (value) =>
      typeof value === "number" && value > 0 && value <= 1000);
    
    this.validators.set("capabilities.logging.level", (value) =>
      ["debug", "info", "warn", "error"].includes(value));
  }

  private validateConfig() {
    for (const [path, validator] of this.validators) {
      const value = this.getValueByPath(this.config, path);
      if (value !== undefined && !validator(value)) {
        throw new Error(`Invalid configuration value for ${path}: ${value}`);
      }
    }
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  getConfig(): ServerConfig {
    return this.config;
  }

  updateConfig(updates: Partial<ServerConfig>) {
    this.config = this.deepMerge(this.config, updates);
    this.validateConfig();
  }
}
```

### 2.2 Server初始化器
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

class ServerInitializer {
  private configManager: ConfigManager;
  private server: Server | null = null;
  private transport: any = null;
  private status: ServerStatus;

  constructor(config: Partial<ServerConfig>) {
    this.configManager = new ConfigManager(config);
    this.status = {
      state: ServerState.INITIALIZING,
      startTime: new Date(),
      lastActivity: new Date(),
      connectionCount: 0,
      errors: []
    };
  }

  async initialize(): Promise<Server> {
    try {
      this.updateState(ServerState.INITIALIZING);
      
      const config = this.configManager.getConfig();
      
      // 创建服务器实例
      this.server = new Server(
        {
          name: config.server.name,
          version: config.server.version,
          description: config.server.description
        },
        {
          capabilities: config.capabilities
        }
      );

      // 设置错误处理
      this.setupErrorHandling();
      
      // 设置请求拦截器
      this.setupRequestInterceptors();
      
      // 创建传输层
      this.transport = this.createTransport(config.transport);
      
      console.error(`Server initialized: ${config.server.name} v${config.server.version}`);
      
      return this.server;
      
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  private createTransport(transportConfig: ServerConfig['transport']) {
    switch (transportConfig.type) {
      case "stdio":
        return new StdioServerTransport();
      // 其他传输类型的实现
      default:
        throw new Error(`Unsupported transport type: ${transportConfig.type}`);
    }
  }

  private setupErrorHandling() {
    if (!this.server) return;

    this.server.onerror = (error) => {
      this.handleError(error);
    };

    // 全局错误处理
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.handleError(error);
      this.shutdown();
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.handleError(new Error(`Unhandled Rejection: ${reason}`));
    });
  }

  private setupRequestInterceptors() {
    if (!this.server) return;

    // 请求前拦截
    const originalSetRequestHandler = this.server.setRequestHandler.bind(this.server);
    this.server.setRequestHandler = (method: string, handler: any) => {
      const wrappedHandler = async (request: any) => {
        this.updateActivity();
        const startTime = Date.now();
        
        try {
          const result = await handler(request);
          const duration = Date.now() - startTime;
          
          console.error(`Request completed: ${method} (${duration}ms)`);
          return result;
          
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`Request failed: ${method} (${duration}ms) - ${error.message}`);
          throw error;
        }
      };
      
      return originalSetRequestHandler(method, wrappedHandler);
    };
  }

  async connect(): Promise<void> {
    if (!this.server || !this.transport) {
      throw new Error("Server not initialized");
    }

    try {
      this.updateState(ServerState.CONNECTING);
      
      await this.server.connect(this.transport);
      
      this.updateState(ServerState.CONNECTED);
      this.status.connectionCount++;
      
      console.error("Server connected and ready");
      
      this.updateState(ServerState.READY);
      
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  private updateState(newState: ServerState) {
    const oldState = this.status.state;
    this.status.state = newState;
    this.status.lastActivity = new Date();
    
    console.error(`State transition: ${oldState} -> ${newState}`);
  }

  private updateActivity() {
    this.status.lastActivity = new Date();
  }

  private handleError(error: Error) {
    this.status.errors.push(error);
    this.updateState(ServerState.ERROR);
    console.error("Server error:", error.message);
  }

  async shutdown(): Promise<void> {
    this.updateState(ServerState.SHUTTING_DOWN);
    
    // 执行清理操作
    if (this.server) {
      await this.server.close?.();
    }
    
    this.updateState(ServerState.SHUTDOWN);
    console.error("Server shutdown completed");
  }

  getStatus(): ServerStatus {
    return { ...this.status };
  }
}
```

## 3. 连接和握手处理

### 3.1 连接管理器
```typescript
interface ClientConnection {
  id: string;
  connectedAt: Date;
  lastActivity: Date;
  requestCount: number;
  protocol: string;
  capabilities: any;
}

class ConnectionManager {
  private connections: Map<string, ClientConnection> = new Map();
  private maxConnections: number;
  private connectionTimeout: number;

  constructor(maxConnections: number = 10, connectionTimeout: number = 300000) {
    this.maxConnections = maxConnections;
    this.connectionTimeout = connectionTimeout;
    
    // 定期清理超时连接
    setInterval(() => this.cleanupTimeoutConnections(), 60000);
  }

  addConnection(id: string, capabilities: any): ClientConnection {
    // 检查连接数量限制
    if (this.connections.size >= this.maxConnections) {
      throw new Error("Maximum connections exceeded");
    }

    const connection: ClientConnection = {
      id,
      connectedAt: new Date(),
      lastActivity: new Date(),
      requestCount: 0,
      protocol: "mcp",
      capabilities
    };

    this.connections.set(id, connection);
    console.error(`Client connected: ${id} (${this.connections.size}/${this.maxConnections})`);
    
    return connection;
  }

  removeConnection(id: string): boolean {
    const removed = this.connections.delete(id);
    if (removed) {
      console.error(`Client disconnected: ${id} (${this.connections.size}/${this.maxConnections})`);
    }
    return removed;
  }

  updateActivity(id: string) {
    const connection = this.connections.get(id);
    if (connection) {
      connection.lastActivity = new Date();
      connection.requestCount++;
    }
  }

  private cleanupTimeoutConnections() {
    const now = Date.now();
    const timeoutConnections: string[] = [];

    for (const [id, connection] of this.connections) {
      if (now - connection.lastActivity.getTime() > this.connectionTimeout) {
        timeoutConnections.push(id);
      }
    }

    timeoutConnections.forEach(id => {
      this.removeConnection(id);
      console.error(`Connection timeout: ${id}`);
    });
  }

  getConnections(): ClientConnection[] {
    return Array.from(this.connections.values());
  }

  getConnectionCount(): number {
    return this.connections.size;
  }
}
```

### 3.2 握手协议处理
```typescript
interface HandshakeRequest {
  protocolVersion: string;
  capabilities: any;
  clientInfo: {
    name: string;
    version: string;
  };
}

interface HandshakeResponse {
  protocolVersion: string;
  capabilities: any;
  serverInfo: {
    name: string;
    version: string;
  };
  instructions?: string;
}

class HandshakeManager {
  private supportedVersions: string[] = ["2024-11-05"];
  private serverInfo: { name: string; version: string };
  private serverCapabilities: any;

  constructor(serverInfo: { name: string; version: string }, capabilities: any) {
    this.serverInfo = serverInfo;
    this.serverCapabilities = capabilities;
  }

  processHandshake(request: HandshakeRequest): HandshakeResponse {
    // 验证协议版本
    if (!this.supportedVersions.includes(request.protocolVersion)) {
      throw new Error(`Unsupported protocol version: ${request.protocolVersion}`);
    }

    // 验证客户端信息
    this.validateClientInfo(request.clientInfo);

    // 协商能力
    const negotiatedCapabilities = this.negotiateCapabilities(
      request.capabilities,
      this.serverCapabilities
    );

    console.error(`Handshake completed with ${request.clientInfo.name} v${request.clientInfo.version}`);

    return {
      protocolVersion: request.protocolVersion,
      capabilities: negotiatedCapabilities,
      serverInfo: this.serverInfo,
      instructions: "Welcome to MCP Server"
    };
  }

  private validateClientInfo(clientInfo: { name: string; version: string }) {
    if (!clientInfo.name || !clientInfo.version) {
      throw new Error("Invalid client info: name and version are required");
    }

    // 可以添加更多验证逻辑，如客户端白名单等
  }

  private negotiateCapabilities(clientCapabilities: any, serverCapabilities: any): any {
    const negotiated: any = {};

    // 协商工具能力
    if (clientCapabilities.tools && serverCapabilities.tools) {
      negotiated.tools = {
        listChanged: Boolean(
          clientCapabilities.tools.listChanged && 
          serverCapabilities.tools.listChanged
        )
      };
    }

    // 协商资源能力
    if (clientCapabilities.resources && serverCapabilities.resources) {
      negotiated.resources = {
        subscribe: Boolean(
          clientCapabilities.resources.subscribe && 
          serverCapabilities.resources.subscribe
        ),
        listChanged: Boolean(
          clientCapabilities.resources.listChanged && 
          serverCapabilities.resources.listChanged
        )
      };
    }

    // 协商提示能力
    if (clientCapabilities.prompts && serverCapabilities.prompts) {
      negotiated.prompts = {};
    }

    return negotiated;
  }
}
```

## 4. 生命周期事件管理

### 4.1 事件系统
```typescript
import { EventEmitter } from "events";

enum LifecycleEvent {
  INITIALIZING = "initializing",
  INITIALIZED = "initialized",
  CONNECTING = "connecting", 
  CONNECTED = "connected",
  CLIENT_CONNECTED = "client_connected",
  CLIENT_DISCONNECTED = "client_disconnected",
  REQUEST_RECEIVED = "request_received",
  REQUEST_COMPLETED = "request_completed",
  ERROR_OCCURRED = "error_occurred",
  SHUTTING_DOWN = "shutting_down",
  SHUTDOWN = "shutdown"
}

interface LifecycleEventData {
  timestamp: Date;
  event: LifecycleEvent;
  data?: any;
  error?: Error;
}

class LifecycleManager extends EventEmitter {
  private eventHistory: LifecycleEventData[] = [];
  private maxHistorySize: number = 1000;

  constructor() {
    super();
    this.setupEventLogging();
  }

  private setupEventLogging() {
    // 监听所有事件并记录
    this.onAny((event: LifecycleEvent, data?: any) => {
      const eventData: LifecycleEventData = {
        timestamp: new Date(),
        event,
        data
      };

      this.eventHistory.push(eventData);
      
      // 限制历史记录大小
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
      }

      console.error(`Lifecycle event: ${event}`, data ? `[${JSON.stringify(data)}]` : '');
    });
  }

  emitLifecycleEvent(event: LifecycleEvent, data?: any) {
    this.emit(event, data);
  }

  emitError(event: LifecycleEvent, error: Error, data?: any) {
    const eventData: LifecycleEventData = {
      timestamp: new Date(),
      event,
      error,
      data
    };

    this.eventHistory.push(eventData);
    this.emit(event, { error, data });
  }

  getEventHistory(limit?: number): LifecycleEventData[] {
    if (limit) {
      return this.eventHistory.slice(-limit);
    }
    return [...this.eventHistory];
  }

  getEventsByType(eventType: LifecycleEvent): LifecycleEventData[] {
    return this.eventHistory.filter(event => event.event === eventType);
  }

  // 扩展EventEmitter以支持通配符监听
  private onAny(callback: (event: LifecycleEvent, data?: any) => void) {
    const originalEmit = this.emit.bind(this);
    
    this.emit = function(event: string | symbol, ...args: any[]) {
      callback(event as LifecycleEvent, args[0]);
      return originalEmit(event, ...args);
    };
  }
}
```

### 4.2 生命周期钩子系统
```typescript
type LifecycleHook = (context: any) => Promise<void> | void;

interface HookRegistry {
  beforeInit: LifecycleHook[];
  afterInit: LifecycleHook[];
  beforeConnect: LifecycleHook[];
  afterConnect: LifecycleHook[];
  beforeShutdown: LifecycleHook[];
  afterShutdown: LifecycleHook[];
}

class LifecycleHookManager {
  private hooks: HookRegistry = {
    beforeInit: [],
    afterInit: [],
    beforeConnect: [],
    afterConnect: [],
    beforeShutdown: [],
    afterShutdown: []
  };

  registerHook(phase: keyof HookRegistry, hook: LifecycleHook) {
    this.hooks[phase].push(hook);
  }

  async executeHooks(phase: keyof HookRegistry, context: any = {}) {
    const phaseHooks = this.hooks[phase];
    
    console.error(`Executing ${phaseHooks.length} hooks for phase: ${phase}`);
    
    for (const hook of phaseHooks) {
      try {
        await hook(context);
      } catch (error) {
        console.error(`Hook execution failed in phase ${phase}:`, error);
        throw error;
      }
    }
  }

  clearHooks(phase?: keyof HookRegistry) {
    if (phase) {
      this.hooks[phase] = [];
    } else {
      for (const key in this.hooks) {
        this.hooks[key as keyof HookRegistry] = [];
      }
    }
  }
}
```

## 5. 健康监控和监控

### 5.1 健康检查系统
```typescript
interface HealthMetrics {
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  connectionCount: number;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
}

interface HealthStatus {
  status: "healthy" | "warning" | "critical";
  timestamp: Date;
  metrics: HealthMetrics;
  issues: string[];
}

class HealthMonitor {
  private startTime: Date;
  private requestMetrics: number[] = [];
  private errorCount: number = 0;
  private requestCount: number = 0;
  private connectionManager: ConnectionManager;

  constructor(connectionManager: ConnectionManager) {
    this.startTime = new Date();
    this.connectionManager = connectionManager;
    
    // 定期清理旧的指标数据
    setInterval(() => this.cleanupOldMetrics(), 60000);
  }

  recordRequest(responseTime: number) {
    this.requestCount++;
    this.requestMetrics.push(responseTime);
    
    // 只保留最近的1000个请求指标
    if (this.requestMetrics.length > 1000) {
      this.requestMetrics.shift();
    }
  }

  recordError() {
    this.errorCount++;
  }

  getHealthStatus(): HealthStatus {
    const now = new Date();
    const uptime = now.getTime() - this.startTime.getTime();
    
    const metrics: HealthMetrics = {
      uptime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      connectionCount: this.connectionManager.getConnectionCount(),
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: this.calculateAverageResponseTime()
    };

    const { status, issues } = this.analyzeHealth(metrics);

    return {
      status,
      timestamp: now,
      metrics,
      issues
    };
  }

  private calculateAverageResponseTime(): number {
    if (this.requestMetrics.length === 0) return 0;
    
    const sum = this.requestMetrics.reduce((acc, time) => acc + time, 0);
    return sum / this.requestMetrics.length;
  }

  private analyzeHealth(metrics: HealthMetrics): { status: HealthStatus['status'], issues: string[] } {
    const issues: string[] = [];
    let status: HealthStatus['status'] = "healthy";

    // 检查内存使用
    const memoryUsagePercent = (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      issues.push(`High memory usage: ${memoryUsagePercent.toFixed(1)}%`);
      status = "critical";
    } else if (memoryUsagePercent > 75) {
      issues.push(`Elevated memory usage: ${memoryUsagePercent.toFixed(1)}%`);
      if (status === "healthy") status = "warning";
    }

    // 检查响应时间
    if (metrics.averageResponseTime > 5000) {
      issues.push(`High response time: ${metrics.averageResponseTime.toFixed(0)}ms`);
      status = "critical";
    } else if (metrics.averageResponseTime > 2000) {
      issues.push(`Elevated response time: ${metrics.averageResponseTime.toFixed(0)}ms`);
      if (status === "healthy") status = "warning";
    }

    // 检查错误率
    const errorRate = metrics.requestCount > 0 ? (metrics.errorCount / metrics.requestCount) * 100 : 0;
    if (errorRate > 10) {
      issues.push(`High error rate: ${errorRate.toFixed(1)}%`);
      status = "critical";
    } else if (errorRate > 5) {
      issues.push(`Elevated error rate: ${errorRate.toFixed(1)}%`);
      if (status === "healthy") status = "warning";
    }

    return { status, issues };
  }

  private cleanupOldMetrics() {
    // 清理超过1小时的请求指标
    const oneHourAgo = Date.now() - 3600000;
    // 这里简化处理，实际应该记录时间戳
    if (this.requestMetrics.length > 1000) {
      this.requestMetrics.splice(0, this.requestMetrics.length - 1000);
    }
  }
}
```

### 5.2 性能监控
```typescript
interface PerformanceMetrics {
  requestLatency: {
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    bytesPerSecond: number;
  };
  resources: {
    memoryMB: number;
    cpuPercent: number;
  };
}

class PerformanceMonitor {
  private metrics: {
    requestTimes: { timestamp: number; duration: number }[];
    requestSizes: { timestamp: number; bytes: number }[];
  };

  constructor() {
    this.metrics = {
      requestTimes: [],
      requestSizes: []
    };

    // 定期清理旧数据
    setInterval(() => this.cleanupOldData(), 60000);
  }

  recordRequestMetrics(duration: number, requestSize: number, responseSize: number) {
    const timestamp = Date.now();
    
    this.metrics.requestTimes.push({ timestamp, duration });
    this.metrics.requestSizes.push({ timestamp, bytes: requestSize + responseSize });
  }

  getPerformanceMetrics(): PerformanceMetrics {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // 获取最近一分钟的数据
    const recentTimes = this.metrics.requestTimes.filter(m => m.timestamp > oneMinuteAgo);
    const recentSizes = this.metrics.requestSizes.filter(m => m.timestamp > oneMinuteAgo);

    // 计算延迟百分位数
    const latencies = recentTimes.map(m => m.duration).sort((a, b) => a - b);
    const latencyPercentiles = {
      p50: this.calculatePercentile(latencies, 50),
      p95: this.calculatePercentile(latencies, 95),
      p99: this.calculatePercentile(latencies, 99)
    };

    // 计算吞吐量
    const requestsPerSecond = recentTimes.length / 60;
    const totalBytes = recentSizes.reduce((sum, m) => sum + m.bytes, 0);
    const bytesPerSecond = totalBytes / 60;

    // 获取资源使用情况
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      requestLatency: latencyPercentiles,
      throughput: {
        requestsPerSecond,
        bytesPerSecond
      },
      resources: {
        memoryMB: memoryUsage.heapUsed / 1024 / 1024,
        cpuPercent: (cpuUsage.user + cpuUsage.system) / 1000000 * 100
      }
    };
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[Math.max(0, index)];
  }

  private cleanupOldData() {
    const oneHourAgo = Date.now() - 3600000;
    
    this.metrics.requestTimes = this.metrics.requestTimes.filter(m => m.timestamp > oneHourAgo);
    this.metrics.requestSizes = this.metrics.requestSizes.filter(m => m.timestamp > oneHourAgo);
  }
}
```

## 6. 优雅关闭和资源清理

### 6.1 关闭管理器
```typescript
interface ShutdownHandler {
  name: string;
  priority: number;  // 0-100, 100为最高优先级
  timeout: number;   // 超时时间(ms)
  handler: () => Promise<void>;
}

class ShutdownManager {
  private handlers: ShutdownHandler[] = [];
  private isShuttingDown: boolean = false;
  private shutdownTimeout: number = 30000; // 30秒

  constructor() {
    this.setupSignalHandlers();
  }

  private setupSignalHandlers() {
    const gracefulShutdown = () => {
      if (!this.isShuttingDown) {
        console.error("Received shutdown signal, initiating graceful shutdown...");
        this.shutdown().catch(console.error);
      }
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGUSR2', gracefulShutdown); // nodemon重启
  }

  registerShutdownHandler(handler: ShutdownHandler) {
    this.handlers.push(handler);
    // 按优先级排序，优先级高的先执行
    this.handlers.sort((a, b) => b.priority - a.priority);
  }

  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      console.error("Shutdown already in progress");
      return;
    }

    this.isShuttingDown = true;
    console.error("Starting graceful shutdown...");

    const shutdownStart = Date.now();
    const overallTimeout = setTimeout(() => {
      console.error("Shutdown timeout reached, forcing exit");
      process.exit(1);
    }, this.shutdownTimeout);

    try {
      for (const handler of this.handlers) {
        console.error(`Executing shutdown handler: ${handler.name}`);
        
        const handlerTimeout = setTimeout(() => {
          console.error(`Shutdown handler timeout: ${handler.name}`);
        }, handler.timeout);

        try {
          await handler.handler();
          clearTimeout(handlerTimeout);
          console.error(`Shutdown handler completed: ${handler.name}`);
        } catch (error) {
          clearTimeout(handlerTimeout);
          console.error(`Shutdown handler failed: ${handler.name}`, error);
        }
      }

      clearTimeout(overallTimeout);
      const shutdownDuration = Date.now() - shutdownStart;
      console.error(`Graceful shutdown completed in ${shutdownDuration}ms`);
      
      process.exit(0);
      
    } catch (error) {
      clearTimeout(overallTimeout);
      console.error("Shutdown failed:", error);
      process.exit(1);
    }
  }
}
```

### 6.2 资源清理管理器
```typescript
interface Resource {
  id: string;
  type: string;
  cleanup: () => Promise<void>;
  created: Date;
}

class ResourceCleanupManager {
  private resources: Map<string, Resource> = new Map();
  private cleanupInProgress: boolean = false;

  registerResource(resource: Resource) {
    this.resources.set(resource.id, resource);
    console.error(`Resource registered: ${resource.type}:${resource.id}`);
  }

  unregisterResource(resourceId: string): boolean {
    const resource = this.resources.get(resourceId);
    if (resource) {
      this.resources.delete(resourceId);
      console.error(`Resource unregistered: ${resource.type}:${resourceId}`);
      return true;
    }
    return false;
  }

  async cleanupAll(): Promise<void> {
    if (this.cleanupInProgress) {
      console.error("Cleanup already in progress");
      return;
    }

    this.cleanupInProgress = true;
    console.error(`Starting cleanup of ${this.resources.size} resources`);

    const cleanupPromises = Array.from(this.resources.values()).map(async (resource) => {
      try {
        console.error(`Cleaning up resource: ${resource.type}:${resource.id}`);
        await resource.cleanup();
        console.error(`Resource cleaned up: ${resource.type}:${resource.id}`);
      } catch (error) {
        console.error(`Resource cleanup failed: ${resource.type}:${resource.id}`, error);
      }
    });

    await Promise.allSettled(cleanupPromises);
    
    this.resources.clear();
    this.cleanupInProgress = false;
    console.error("Resource cleanup completed");
  }

  async cleanupByType(type: string): Promise<void> {
    const resourcesOfType = Array.from(this.resources.values())
      .filter(r => r.type === type);

    console.error(`Cleaning up ${resourcesOfType.length} resources of type: ${type}`);

    for (const resource of resourcesOfType) {
      try {
        await resource.cleanup();
        this.resources.delete(resource.id);
        console.error(`Resource cleaned up: ${resource.type}:${resource.id}`);
      } catch (error) {
        console.error(`Resource cleanup failed: ${resource.type}:${resource.id}`, error);
      }
    }
  }

  getResourceCount(): number {
    return this.resources.size;
  }

  getResourcesByType(type: string): Resource[] {
    return Array.from(this.resources.values()).filter(r => r.type === type);
  }
}
```

## 7. 完整的Server实现

### 7.1 ManagedMCPServer
```typescript
class ManagedMCPServer {
  private initializer: ServerInitializer;
  private lifecycleManager: LifecycleManager;
  private hookManager: LifecycleHookManager;
  private connectionManager: ConnectionManager;
  private handshakeManager: HandshakeManager;
  private healthMonitor: HealthMonitor;
  private performanceMonitor: PerformanceMonitor;
  private shutdownManager: ShutdownManager;
  private resourceCleanup: ResourceCleanupManager;
  private server: Server | null = null;

  constructor(config: Partial<ServerConfig>) {
    // 初始化所有管理器
    this.lifecycleManager = new LifecycleManager();
    this.hookManager = new LifecycleHookManager();
    this.connectionManager = new ConnectionManager();
    this.shutdownManager = new ShutdownManager();
    this.resourceCleanup = new ResourceCleanupManager();
    this.initializer = new ServerInitializer(config);
    
    const serverConfig = this.initializer.getConfigManager().getConfig();
    this.handshakeManager = new HandshakeManager(
      { name: serverConfig.server.name, version: serverConfig.server.version },
      serverConfig.capabilities
    );
    
    this.healthMonitor = new HealthMonitor(this.connectionManager);
    this.performanceMonitor = new PerformanceMonitor();

    this.setupLifecycleHooks();
    this.setupShutdownHandlers();
  }

  private setupLifecycleHooks() {
    // 注册内置生命周期钩子
    this.hookManager.registerHook('beforeInit', async () => {
      this.lifecycleManager.emitLifecycleEvent(LifecycleEvent.INITIALIZING);
    });

    this.hookManager.registerHook('afterInit', async () => {
      this.lifecycleManager.emitLifecycleEvent(LifecycleEvent.INITIALIZED);
    });

    this.hookManager.registerHook('beforeConnect', async () => {
      this.lifecycleManager.emitLifecycleEvent(LifecycleEvent.CONNECTING);
    });

    this.hookManager.registerHook('afterConnect', async () => {
      this.lifecycleManager.emitLifecycleEvent(LifecycleEvent.CONNECTED);
    });

    this.hookManager.registerHook('beforeShutdown', async () => {
      this.lifecycleManager.emitLifecycleEvent(LifecycleEvent.SHUTTING_DOWN);
    });

    this.hookManager.registerHook('afterShutdown', async () => {
      this.lifecycleManager.emitLifecycleEvent(LifecycleEvent.SHUTDOWN);
    });
  }

  private setupShutdownHandlers() {
    // 注册关闭处理器
    this.shutdownManager.registerShutdownHandler({
      name: "connection-cleanup",
      priority: 90,
      timeout: 5000,
      handler: async () => {
        // 清理所有连接
        const connections = this.connectionManager.getConnections();
        for (const connection of connections) {
          this.connectionManager.removeConnection(connection.id);
        }
      }
    });

    this.shutdownManager.registerShutdownHandler({
      name: "resource-cleanup",
      priority: 80,
      timeout: 10000,
      handler: async () => {
        await this.resourceCleanup.cleanupAll();
      }
    });

    this.shutdownManager.registerShutdownHandler({
      name: "server-close",
      priority: 70,
      timeout: 5000,
      handler: async () => {
        if (this.server) {
          await this.server.close?.();
        }
      }
    });
  }

  async start(): Promise<void> {
    try {
      // 执行初始化前钩子
      await this.hookManager.executeHooks('beforeInit');

      // 初始化服务器
      this.server = await this.initializer.initialize();

      // 执行初始化后钩子
      await this.hookManager.executeHooks('afterInit');

      // 执行连接前钩子
      await this.hookManager.executeHooks('beforeConnect');

      // 建立连接
      await this.initializer.connect();

      // 执行连接后钩子
      await this.hookManager.executeHooks('afterConnect');

      console.error("MCP Server started successfully");

    } catch (error) {
      this.lifecycleManager.emitError(LifecycleEvent.ERROR_OCCURRED, error as Error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    await this.hookManager.executeHooks('beforeShutdown');
    await this.shutdownManager.shutdown();
    await this.hookManager.executeHooks('afterShutdown');
  }

  // 公共API方法
  addLifecycleHook(phase: keyof HookRegistry, hook: LifecycleHook) {
    this.hookManager.registerHook(phase, hook);
  }

  getHealthStatus(): HealthStatus {
    return this.healthMonitor.getHealthStatus();
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return this.performanceMonitor.getPerformanceMetrics();
  }

  getServerStatus(): ServerStatus {
    return this.initializer.getStatus();
  }

  getServer(): Server | null {
    return this.server;
  }
}

// 使用示例
const server = new ManagedMCPServer({
  server: {
    name: "my-mcp-server",
    version: "1.0.0",
    timeout: 30000
  },
  capabilities: {
    tools: { listChanged: true },
    resources: { subscribe: true },
    prompts: {}
  }
});

// 添加自定义生命周期钩子
server.addLifecycleHook('afterInit', async () => {
  console.error("Custom initialization completed");
});

// 启动服务器
server.start().catch(console.error);
```

## 8. 最佳实践

### 8.1 配置管理
1. **环境分离** - 开发、测试、生产环境使用不同配置
2. **敏感信息** - 使用环境变量存储敏感配置
3. **配置验证** - 启动时验证所有配置项
4. **热重载** - 支持部分配置的热重载
5. **默认值** - 为所有配置提供合理的默认值

### 8.2 监控和运维
1. **健康检查** - 实现全面的健康检查机制
2. **日志记录** - 记录关键事件和错误信息
3. **性能监控** - 持续监控服务器性能指标
4. **告警机制** - 在出现问题时及时告警
5. **故障恢复** - 实现自动故障检测和恢复

### 8.3 资源管理
1. **内存管理** - 防止内存泄漏和过度使用
2. **连接池** - 合理管理网络连接资源
3. **文件句柄** - 及时关闭文件和资源句柄
4. **定时清理** - 定期清理过期和无用资源
5. **资源限制** - 设置合理的资源使用限制

## 小结

通过本章学习，我们掌握了：
- MCP Server的完整初始化和配置流程
- 连接管理和握手协议处理
- 生命周期事件管理和钩子系统
- 健康监控和性能监控机制
- 优雅关闭和资源清理策略

良好的Server配置和生命周期管理是构建稳定、可靠MCP Server的基础，为后续的功能开发和运维管理奠定了坚实基础。