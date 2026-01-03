---
title: "第8章：错误处理和日志系统"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第8章：错误处理和日志系统

## 学习目标
1. 建立完善的错误处理机制
2. 实现结构化日志记录系统
3. 掌握异常捕获和恢复策略
4. 学习错误码和错误消息规范
5. 实现调试和诊断功能

## 1. 错误处理基础架构

### 1.1 错误分类体系
```typescript
enum ErrorCategory {
  VALIDATION = "validation",       // 参数验证错误
  AUTHENTICATION = "auth",         // 认证错误
  AUTHORIZATION = "authz",         // 授权错误
  NOT_FOUND = "not_found",        // 资源未找到
  CONFLICT = "conflict",          // 冲突错误
  RATE_LIMIT = "rate_limit",      // 速率限制
  INTERNAL = "internal",          // 内部错误
  NETWORK = "network",            // 网络错误
  TIMEOUT = "timeout",            // 超时错误
  DEPENDENCY = "dependency"       // 外部依赖错误
}

enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium", 
  HIGH = "high",
  CRITICAL = "critical"
}

interface MCPError {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  details?: Record<string, any>;
  timestamp: Date;
  requestId?: string;
  stackTrace?: string;
}
```

### 1.2 基础错误类
```typescript
class BaseMCPError extends Error {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly details: Record<string, any>;
  public readonly timestamp: Date;
  public readonly requestId?: string;

  constructor(
    code: string,
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details: Record<string, any> = {},
    requestId?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date();
    this.requestId = requestId;

    // 保持堆栈跟踪
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): MCPError {
    return {
      code: this.code,
      message: this.message,
      category: this.category,
      severity: this.severity,
      details: this.details,
      timestamp: this.timestamp,
      requestId: this.requestId,
      stackTrace: this.stack
    };
  }
}

// 具体错误类型
class ValidationError extends BaseMCPError {
  constructor(message: string, details: Record<string, any> = {}, requestId?: string) {
    super("VALIDATION_ERROR", message, ErrorCategory.VALIDATION, ErrorSeverity.LOW, details, requestId);
  }
}

class AuthenticationError extends BaseMCPError {
  constructor(message: string, details: Record<string, any> = {}, requestId?: string) {
    super("AUTH_ERROR", message, ErrorCategory.AUTHENTICATION, ErrorSeverity.HIGH, details, requestId);
  }
}

class ResourceNotFoundError extends BaseMCPError {
  constructor(resource: string, resourceId: string, requestId?: string) {
    super(
      "RESOURCE_NOT_FOUND", 
      `${resource} not found: ${resourceId}`,
      ErrorCategory.NOT_FOUND,
      ErrorSeverity.MEDIUM,
      { resource, resourceId },
      requestId
    );
  }
}

class InternalServerError extends BaseMCPError {
  constructor(message: string, originalError?: Error, requestId?: string) {
    super(
      "INTERNAL_ERROR",
      message,
      ErrorCategory.INTERNAL,
      ErrorSeverity.CRITICAL,
      { originalError: originalError?.message },
      requestId
    );
  }
}
```

## 2. 错误处理中间件

### 2.1 请求级错误处理
```typescript
interface RequestContext {
  requestId: string;
  method: string;
  startTime: Date;
  params?: any;
}

class ErrorHandlingMiddleware {
  private errorReporter: ErrorReporter;
  private logger: Logger;

  constructor(errorReporter: ErrorReporter, logger: Logger) {
    this.errorReporter = errorReporter;
    this.logger = logger;
  }

  wrapHandler<T>(handler: (request: any, context: RequestContext) => Promise<T>) {
    return async (request: any): Promise<T> => {
      const context: RequestContext = {
        requestId: this.generateRequestId(),
        method: request.method || "unknown",
        startTime: new Date(),
        params: request.params
      };

      try {
        this.logger.debug("Request started", {
          requestId: context.requestId,
          method: context.method,
          params: context.params
        });

        const result = await handler(request, context);

        this.logger.info("Request completed", {
          requestId: context.requestId,
          method: context.method,
          duration: Date.now() - context.startTime.getTime()
        });

        return result;

      } catch (error) {
        return this.handleError(error, context);
      }
    };
  }

  private async handleError(error: any, context: RequestContext): Promise<never> {
    let mcpError: BaseMCPError;

    if (error instanceof BaseMCPError) {
      mcpError = error;
    } else if (error instanceof Error) {
      mcpError = new InternalServerError(
        `Unhandled error in ${context.method}`,
        error,
        context.requestId
      );
    } else {
      mcpError = new InternalServerError(
        "Unknown error occurred",
        undefined,
        context.requestId
      );
    }

    // 记录错误
    await this.logError(mcpError, context);

    // 报告错误（发送到监控系统等）
    await this.errorReporter.report(mcpError, context);

    // 根据严重程度决定响应
    throw this.createClientError(mcpError);
  }

  private async logError(error: BaseMCPError, context: RequestContext) {
    const logData = {
      requestId: context.requestId,
      method: context.method,
      error: error.toJSON(),
      duration: Date.now() - context.startTime.getTime()
    };

    switch (error.severity) {
      case ErrorSeverity.LOW:
        this.logger.warn("Request failed", logData);
        break;
      case ErrorSeverity.MEDIUM:
        this.logger.error("Request error", logData);
        break;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        this.logger.fatal("Critical request error", logData);
        break;
    }
  }

  private createClientError(error: BaseMCPError): any {
    // 根据MCP协议创建错误响应
    const shouldExposeDetails = error.severity !== ErrorSeverity.CRITICAL;
    
    return {
      error: {
        code: error.code,
        message: error.message,
        data: shouldExposeDetails ? error.details : undefined
      }
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 2.2 错误恢复策略
```typescript
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrorCategories: ErrorCategory[];
}

class ErrorRecoveryManager {
  private defaultRetryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrorCategories: [
      ErrorCategory.NETWORK,
      ErrorCategory.TIMEOUT,
      ErrorCategory.DEPENDENCY
    ]
  };

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: Error;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // 检查是否应该重试
        if (!this.shouldRetry(error, attempt, finalConfig)) {
          throw error;
        }

        // 计算延迟时间
        const delay = this.calculateDelay(attempt, finalConfig);
        
        console.error(`Operation failed (attempt ${attempt}/${finalConfig.maxAttempts}), retrying in ${delay}ms:`, error.message);
        
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private shouldRetry(error: any, attempt: number, config: RetryConfig): boolean {
    // 已达到最大重试次数
    if (attempt >= config.maxAttempts) {
      return false;
    }

    // 检查错误类型是否可重试
    if (error instanceof BaseMCPError) {
      return config.retryableErrorCategories.includes(error.category);
    }

    // 对于网络相关的原生错误也进行重试
    if (error.code === 'ECONNREFUSED' || 
        error.code === 'ETIMEDOUT' ||
        error.code === 'ENOTFOUND') {
      return true;
    }

    return false;
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5); // 添加抖动
    return Math.min(jitteredDelay, config.maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## 3. 结构化日志系统

### 3.1 日志级别和格式
```typescript
enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
  requestId?: string;
  component?: string;
  userId?: string;
  sessionId?: string;
}

interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'text';
  outputs: LogOutput[];
  enableStackTrace: boolean;
  maxDataSize: number;
}

abstract class LogOutput {
  abstract write(entry: LogEntry): Promise<void>;
}

class ConsoleLogOutput extends LogOutput {
  async write(entry: LogEntry): Promise<void> {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp;
    const message = entry.message;
    const data = entry.data ? JSON.stringify(entry.data) : '';

    console.log(`${timestamp} [${levelName}] ${message} ${data}`);
  }
}

class FileLogOutput extends LogOutput {
  private filePath: string;
  private writeStream: any;

  constructor(filePath: string) {
    this.filePath = filePath;
    // 初始化文件写入流
  }

  async write(entry: LogEntry): Promise<void> {
    const logLine = JSON.stringify(entry) + '\n';
    // 写入文件
  }
}
```

### 3.2 高级日志记录器
```typescript
import { createHash } from 'crypto';

class AdvancedLogger {
  private config: LoggerConfig;
  private outputs: LogOutput[];
  private contextData: Map<string, any> = new Map();

  constructor(config: LoggerConfig) {
    this.config = config;
    this.outputs = config.outputs;
  }

  // 设置上下文数据
  setContext(key: string, value: any): void {
    this.contextData.set(key, value);
  }

  clearContext(): void {
    this.contextData.clear();
  }

  // 主要日志方法
  trace(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, data);
  }

  debug(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, data);
  }

  fatal(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, data);
  }

  // 性能日志
  time(label: string): void {
    this.setContext(`timer_${label}`, Date.now());
  }

  timeEnd(label: string, message?: string): void {
    const startTime = this.contextData.get(`timer_${label}`);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.info(message || `Timer ${label}`, { duration, label });
      this.contextData.delete(`timer_${label}`);
    }
  }

  // 结构化错误日志
  logError(error: Error | BaseMCPError, additionalData?: Record<string, any>): void {
    let errorData: Record<string, any> = {
      errorName: error.name,
      errorMessage: error.message,
      stackTrace: this.config.enableStackTrace ? error.stack : undefined,
      ...additionalData
    };

    if (error instanceof BaseMCPError) {
      errorData = {
        ...errorData,
        errorCode: error.code,
        errorCategory: error.category,
        errorSeverity: error.severity,
        errorDetails: error.details,
        requestId: error.requestId
      };
    }

    this.error("Error occurred", errorData);
  }

  // 审计日志
  audit(action: string, data?: Record<string, any>): void {
    this.info(`AUDIT: ${action}`, {
      ...data,
      auditTimestamp: new Date().toISOString(),
      auditType: "action"
    });
  }

  // 私有核心日志方法
  private async log(level: LogLevel, message: string, data?: Record<string, any>): Promise<void> {
    // 检查日志级别
    if (level < this.config.level) {
      return;
    }

    // 创建日志条目
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.sanitizeData({ 
        ...Object.fromEntries(this.contextData),
        ...data
      }),
      requestId: this.contextData.get('requestId'),
      component: this.contextData.get('component'),
      userId: this.contextData.get('userId'),
      sessionId: this.contextData.get('sessionId')
    };

    // 输出到所有配置的输出源
    for (const output of this.outputs) {
      try {
        await output.write(entry);
      } catch (error) {
        // 日志输出失败时的处理
        console.error('Failed to write log entry:', error);
      }
    }
  }

  private sanitizeData(data?: Record<string, any>): Record<string, any> | undefined {
    if (!data) return undefined;

    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      // 过滤敏感信息
      if (this.isSensitiveKey(key)) {
        sanitized[key] = this.maskSensitiveValue(value);
        continue;
      }

      // 限制数据大小
      if (typeof value === 'string' && value.length > this.config.maxDataSize) {
        sanitized[key] = value.substring(0, this.config.maxDataSize) + '...';
        continue;
      }

      // 处理对象
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
        continue;
      }

      sanitized[key] = value;
    }

    return sanitized;
  }

  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'password', 'token', 'apikey', 'secret', 'auth',
      'credentials', 'private', 'key', 'cert'
    ];
    
    return sensitiveKeys.some(sensitiveKey => 
      key.toLowerCase().includes(sensitiveKey)
    );
  }

  private maskSensitiveValue(value: any): string {
    if (typeof value === 'string') {
      if (value.length <= 4) return '****';
      return value.substring(0, 2) + '****' + value.substring(value.length - 2);
    }
    return '[MASKED]';
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => 
        typeof item === 'object' ? this.sanitizeObject(item) : item
      );
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (this.isSensitiveKey(key)) {
        sanitized[key] = this.maskSensitiveValue(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}
```

## 4. 错误报告和监控

### 4.1 错误报告系统
```typescript
interface ErrorReport {
  error: MCPError;
  context: RequestContext;
  environment: {
    nodeVersion: string;
    platform: string;
    memory: NodeJS.MemoryUsage;
    uptime: number;
  };
  metadata: Record<string, any>;
}

interface ErrorReportingConfig {
  enableReporting: boolean;
  reportingEndpoint?: string;
  apiKey?: string;
  samplingRate: number; // 0-1
  maxReportsPerMinute: number;
}

class ErrorReporter {
  private config: ErrorReportingConfig;
  private reportQueue: ErrorReport[] = [];
  private reportCounts: Map<string, number> = new Map();
  private lastResetTime: number = Date.now();
  private logger: AdvancedLogger;

  constructor(config: ErrorReportingConfig, logger: AdvancedLogger) {
    this.config = config;
    this.logger = logger;
    
    // 定期发送报告
    setInterval(() => this.flushReports(), 10000);
    
    // 定期重置速率限制计数
    setInterval(() => this.resetRateLimit(), 60000);
  }

  async report(error: BaseMCPError, context: RequestContext): Promise<void> {
    if (!this.config.enableReporting) {
      return;
    }

    // 采样检查
    if (Math.random() > this.config.samplingRate) {
      return;
    }

    // 速率限制检查
    const errorKey = `${error.code}_${error.category}`;
    const currentCount = this.reportCounts.get(errorKey) || 0;
    
    if (currentCount >= this.config.maxReportsPerMinute) {
      this.logger.warn("Error reporting rate limit reached", { errorKey });
      return;
    }

    this.reportCounts.set(errorKey, currentCount + 1);

    // 创建错误报告
    const report: ErrorReport = {
      error: error.toJSON(),
      context,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      },
      metadata: {
        timestamp: new Date().toISOString(),
        serverVersion: "1.0.0" // 从配置获取
      }
    };

    // 添加到队列
    this.reportQueue.push(report);
    
    this.logger.debug("Error report queued", { 
      errorCode: error.code, 
      queueSize: this.reportQueue.length 
    });
  }

  private async flushReports(): Promise<void> {
    if (this.reportQueue.length === 0) {
      return;
    }

    const reportsToSend = this.reportQueue.splice(0);
    
    try {
      await this.sendReports(reportsToSend);
      this.logger.debug(`Sent ${reportsToSend.length} error reports`);
    } catch (error) {
      this.logger.error("Failed to send error reports", { 
        error: error.message,
        reportCount: reportsToSend.length
      });
      
      // 重新加入队列（最多保留1000个报告）
      this.reportQueue.unshift(...reportsToSend.slice(-1000));
    }
  }

  private async sendReports(reports: ErrorReport[]): Promise<void> {
    if (!this.config.reportingEndpoint) {
      return;
    }

    // 这里实现发送到外部监控服务的逻辑
    // 例如发送到 Sentry, DataDog, 或自定义监控系统
    
    const response = await fetch(this.config.reportingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        reports,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Reporting failed: ${response.status} ${response.statusText}`);
    }
  }

  private resetRateLimit(): void {
    this.reportCounts.clear();
    this.lastResetTime = Date.now();
  }
}
```

### 4.2 性能监控集成
```typescript
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

class PerformanceLogger {
  private logger: AdvancedLogger;
  private metrics: PerformanceMetric[] = [];

  constructor(logger: AdvancedLogger) {
    this.logger = logger;
    
    // 定期输出性能指标
    setInterval(() => this.flushMetrics(), 30000);
  }

  recordMetric(name: string, value: number, unit: string, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      tags
    };

    this.metrics.push(metric);
  }

  recordExecutionTime(name: string, startTime: number, tags?: Record<string, string>): void {
    const duration = Date.now() - startTime;
    this.recordMetric(name, duration, 'ms', tags);
  }

  recordMemoryUsage(): void {
    const usage = process.memoryUsage();
    this.recordMetric('memory.heap.used', usage.heapUsed / 1024 / 1024, 'MB');
    this.recordMetric('memory.heap.total', usage.heapTotal / 1024 / 1024, 'MB');
    this.recordMetric('memory.external', usage.external / 1024 / 1024, 'MB');
  }

  recordResponseSize(size: number, endpoint?: string): void {
    this.recordMetric('response.size', size, 'bytes', { endpoint });
  }

  private flushMetrics(): void {
    if (this.metrics.length === 0) {
      return;
    }

    // 计算聚合指标
    const aggregated = this.aggregateMetrics(this.metrics);
    
    this.logger.info("Performance metrics", { metrics: aggregated });
    
    // 清空指标
    this.metrics = [];
  }

  private aggregateMetrics(metrics: PerformanceMetric[]): Record<string, any> {
    const grouped = new Map<string, number[]>();
    
    for (const metric of metrics) {
      const key = metric.name;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(metric.value);
    }

    const aggregated: Record<string, any> = {};
    
    for (const [name, values] of grouped) {
      aggregated[name] = {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values)
      };
    }

    return aggregated;
  }
}
```

## 5. 调试和诊断工具

### 5.1 调试信息收集器
```typescript
interface DebugInfo {
  server: {
    version: string;
    uptime: number;
    startTime: Date;
    nodeVersion: string;
    platform: string;
  };
  memory: NodeJS.MemoryUsage;
  connections: {
    active: number;
    total: number;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  errors: {
    recent: MCPError[];
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  performance: {
    cpuUsage: NodeJS.CpuUsage;
    memoryTrend: number[];
  };
}

class DiagnosticsCollector {
  private logger: AdvancedLogger;
  private startTime: Date;
  private requestStats: {
    total: number;
    successful: number;
    failed: number;
    totalResponseTime: number;
  };
  private recentErrors: MCPError[] = [];
  private memoryHistory: number[] = [];

  constructor(logger: AdvancedLogger) {
    this.logger = logger;
    this.startTime = new Date();
    this.requestStats = {
      total: 0,
      successful: 0,
      failed: 0,
      totalResponseTime: 0
    };

    // 定期收集内存使用情况
    setInterval(() => {
      const usage = process.memoryUsage();
      this.memoryHistory.push(usage.heapUsed);
      
      // 只保留最近50个数据点
      if (this.memoryHistory.length > 50) {
        this.memoryHistory.shift();
      }
    }, 30000);
  }

  recordRequest(success: boolean, responseTime: number): void {
    this.requestStats.total++;
    this.requestStats.totalResponseTime += responseTime;
    
    if (success) {
      this.requestStats.successful++;
    } else {
      this.requestStats.failed++;
    }
  }

  recordError(error: MCPError): void {
    this.recentErrors.push(error);
    
    // 只保留最近100个错误
    if (this.recentErrors.length > 100) {
      this.recentErrors.shift();
    }
  }

  collectDebugInfo(): DebugInfo {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // 统计错误
    const errorsByCategory: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    
    for (const error of this.recentErrors) {
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    }

    return {
      server: {
        version: "1.0.0", // 从配置获取
        uptime: process.uptime(),
        startTime: this.startTime,
        nodeVersion: process.version,
        platform: process.platform
      },
      memory: memoryUsage,
      connections: {
        active: 0, // 从连接管理器获取
        total: 0
      },
      requests: {
        total: this.requestStats.total,
        successful: this.requestStats.successful,
        failed: this.requestStats.failed,
        averageResponseTime: this.requestStats.total > 0 
          ? this.requestStats.totalResponseTime / this.requestStats.total 
          : 0
      },
      errors: {
        recent: this.recentErrors.slice(-20), // 最近20个错误
        byCategory: errorsByCategory,
        bySeverity: errorsBySeverity
      },
      performance: {
        cpuUsage,
        memoryTrend: [...this.memoryHistory]
      }
    };
  }

  generateHealthReport(): string {
    const debugInfo = this.collectDebugInfo();
    
    let report = "=== MCP Server Health Report ===\n\n";
    
    report += `Server Version: ${debugInfo.server.version}\n`;
    report += `Uptime: ${Math.floor(debugInfo.server.uptime)}s\n`;
    report += `Node Version: ${debugInfo.server.nodeVersion}\n`;
    report += `Platform: ${debugInfo.server.platform}\n\n`;
    
    report += "Memory Usage:\n";
    report += `  Heap Used: ${Math.round(debugInfo.memory.heapUsed / 1024 / 1024)}MB\n`;
    report += `  Heap Total: ${Math.round(debugInfo.memory.heapTotal / 1024 / 1024)}MB\n`;
    report += `  External: ${Math.round(debugInfo.memory.external / 1024 / 1024)}MB\n\n`;
    
    report += "Request Statistics:\n";
    report += `  Total Requests: ${debugInfo.requests.total}\n`;
    report += `  Successful: ${debugInfo.requests.successful}\n`;
    report += `  Failed: ${debugInfo.requests.failed}\n`;
    report += `  Success Rate: ${debugInfo.requests.total > 0 ? 
      Math.round(debugInfo.requests.successful / debugInfo.requests.total * 100) : 0}%\n`;
    report += `  Avg Response Time: ${Math.round(debugInfo.requests.averageResponseTime)}ms\n\n`;
    
    if (Object.keys(debugInfo.errors.byCategory).length > 0) {
      report += "Recent Errors by Category:\n";
      for (const [category, count] of Object.entries(debugInfo.errors.byCategory)) {
        report += `  ${category}: ${count}\n`;
      }
      report += "\n";
    }
    
    return report;
  }
}
```

### 5.2 运行时调试工具
```typescript
class DebugTools {
  private logger: AdvancedLogger;
  private diagnostics: DiagnosticsCollector;
  private isDebugMode: boolean = false;

  constructor(logger: AdvancedLogger, diagnostics: DiagnosticsCollector) {
    this.logger = logger;
    this.diagnostics = diagnostics;
    
    // 检查调试模式环境变量
    this.isDebugMode = process.env.DEBUG === 'true';
  }

  enableDebugMode(): void {
    this.isDebugMode = true;
    this.logger.info("Debug mode enabled");
  }

  disableDebugMode(): void {
    this.isDebugMode = false;
    this.logger.info("Debug mode disabled");
  }

  debugRequest(method: string, params: any, result?: any, error?: Error): void {
    if (!this.isDebugMode) return;

    this.logger.debug("Request Debug Info", {
      method,
      params,
      result: result ? JSON.stringify(result).substring(0, 500) : undefined,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
  }

  debugMemoryUsage(label: string): void {
    if (!this.isDebugMode) return;

    const usage = process.memoryUsage();
    this.logger.debug(`Memory Usage - ${label}`, {
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`,
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`
    });
  }

  dumpStackTrace(label: string): void {
    if (!this.isDebugMode) return;

    const stack = new Error().stack;
    this.logger.debug(`Stack Trace - ${label}`, { stack });
  }

  profileFunction<T>(fn: () => T, name: string): T {
    if (!this.isDebugMode) {
      return fn();
    }

    const start = process.hrtime();
    const result = fn();
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    this.logger.debug(`Function Profile - ${name}`, {
      duration: `${duration.toFixed(2)}ms`
    });

    return result;
  }

  async profileAsyncFunction<T>(fn: () => Promise<T>, name: string): Promise<T> {
    if (!this.isDebugMode) {
      return fn();
    }

    const start = process.hrtime();
    try {
      const result = await fn();
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000;

      this.logger.debug(`Async Function Profile - ${name}`, {
        duration: `${duration.toFixed(2)}ms`,
        status: 'success'
      });

      return result;
    } catch (error) {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000;

      this.logger.debug(`Async Function Profile - ${name}`, {
        duration: `${duration.toFixed(2)}ms`,
        status: 'error',
        error: error.message
      });

      throw error;
    }
  }
}
```

## 6. 集成示例

### 6.1 完整的错误处理和日志系统
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

class LoggedMCPServer {
  private server: Server;
  private logger: AdvancedLogger;
  private errorHandler: ErrorHandlingMiddleware;
  private errorReporter: ErrorReporter;
  private diagnostics: DiagnosticsCollector;
  private debugTools: DebugTools;
  private performanceLogger: PerformanceLogger;

  constructor() {
    // 初始化日志系统
    this.logger = new AdvancedLogger({
      level: LogLevel.INFO,
      format: 'json',
      outputs: [
        new ConsoleLogOutput(),
        // new FileLogOutput('./logs/server.log')
      ],
      enableStackTrace: true,
      maxDataSize: 1000
    });

    // 初始化监控和诊断
    this.diagnostics = new DiagnosticsCollector(this.logger);
    this.debugTools = new DebugTools(this.logger, this.diagnostics);
    this.performanceLogger = new PerformanceLogger(this.logger);

    // 初始化错误报告
    this.errorReporter = new ErrorReporter({
      enableReporting: process.env.ENABLE_ERROR_REPORTING === 'true',
      reportingEndpoint: process.env.ERROR_REPORTING_ENDPOINT,
      apiKey: process.env.ERROR_REPORTING_API_KEY,
      samplingRate: 1.0,
      maxReportsPerMinute: 100
    }, this.logger);

    // 初始化错误处理中间件
    this.errorHandler = new ErrorHandlingMiddleware(this.errorReporter, this.logger);

    // 创建服务器
    this.server = new Server(
      {
        name: "logged-mcp-server",
        version: "1.0.0"
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        }
      }
    );

    this.setupHandlers();
    this.setupHealthEndpoints();
  }

  private setupHandlers(): void {
    // 使用错误处理中间件包装所有处理器
    this.server.setRequestHandler(
      "tools/list",
      this.errorHandler.wrapHandler(async (request, context) => {
        this.debugTools.debugRequest("tools/list", request.params);
        
        // 模拟处理逻辑
        const startTime = Date.now();
        const result = { tools: [] };
        
        this.performanceLogger.recordExecutionTime(
          "tools/list", 
          startTime, 
          { method: "tools/list" }
        );
        
        this.diagnostics.recordRequest(true, Date.now() - startTime);
        return result;
      })
    );

    // 其他处理器...
  }

  private setupHealthEndpoints(): void {
    // 健康检查端点（如果支持HTTP接口）
    this.server.setRequestHandler(
      "debug/health",
      this.errorHandler.wrapHandler(async (request, context) => {
        const debugInfo = this.diagnostics.collectDebugInfo();
        return { health: debugInfo };
      })
    );

    this.server.setRequestHandler(
      "debug/report",
      this.errorHandler.wrapHandler(async (request, context) => {
        const report = this.diagnostics.generateHealthReport();
        return { report };
      })
    );
  }

  async start(): Promise<void> {
    try {
      this.logger.info("Starting MCP Server with logging and error handling");
      
      // 启动服务器
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      this.logger.info("MCP Server started successfully");
    } catch (error) {
      this.logger.fatal("Failed to start MCP Server", { error: error.message });
      throw error;
    }
  }
}

// 启动服务器
const server = new LoggedMCPServer();
server.start().catch(error => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
```

## 7. 最佳实践

### 7.1 错误处理原则
1. **快速失败** - 尽早发现和处理错误
2. **错误分类** - 按类型和严重程度分类错误
3. **上下文保留** - 保留足够的错误上下文信息
4. **优雅降级** - 在可能的情况下提供降级服务
5. **用户友好** - 向用户提供有意义的错误信息

### 7.2 日志记录准则
1. **结构化日志** - 使用结构化格式便于分析
2. **敏感信息过滤** - 自动过滤敏感信息
3. **适当级别** - 选择合适的日志级别
4. **性能考虑** - 避免过度日志记录影响性能
5. **日志轮转** - 实现日志文件轮转和清理

### 7.3 监控和告警
1. **关键指标** - 监控关键性能和健康指标
2. **实时告警** - 在问题发生时及时告警
3. **趋势分析** - 分析错误和性能趋势
4. **容量规划** - 基于监控数据进行容量规划
5. **故障预防** - 主动发现和预防潜在问题

## 小结

通过本章学习，我们掌握了：
- 完善的错误分类和处理机制
- 结构化日志记录系统的实现
- 错误报告和监控集成方案
- 调试和诊断工具的构建
- 企业级错误处理和日志系统的完整实现

良好的错误处理和日志系统是构建可靠MCP Server的关键基础设施，能够大大提高系统的可维护性和可观测性。