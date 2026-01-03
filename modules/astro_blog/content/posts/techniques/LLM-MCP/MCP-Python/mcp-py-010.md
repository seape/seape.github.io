---
title: "第10章：性能优化和扩展性"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第10章：性能优化和扩展性

## 学习目标
1. 分析和优化Server性能瓶颈
2. 实现缓存和资源池管理
3. 掌握并发处理和异步编程
4. 学习内存管理和垃圾回收优化
5. 设计可扩展的架构模式

## 1. 性能分析和监控

### 1.1 性能指标体系
```typescript
interface PerformanceMetrics {
  // 响应时间指标
  responseTime: {
    mean: number;
    median: number;
    p95: number;
    p99: number;
  };
  
  // 吞吐量指标
  throughput: {
    requestsPerSecond: number;
    bytesPerSecond: number;
    operationsPerSecond: number;
  };
  
  // 资源使用指标
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    diskIO: number;
    networkIO: number;
  };
  
  // 错误率指标
  errorRate: {
    total: number;
    byType: Record<string, number>;
  };
}

class PerformanceProfiler {
  private metrics: Map<string, number[]> = new Map();
  private timers: Map<string, number> = new Map();
  private counters: Map<string, number> = new Map();

  // 开始计时
  start(label: string): void {
    this.timers.set(label, process.hrtime.bigint());
  }

  // 结束计时并记录
  end(label: string): number {
    const start = this.timers.get(label);
    if (!start) {
      throw new Error(`Timer ${label} was not started`);
    }

    const duration = Number(process.hrtime.bigint() - start) / 1_000_000; // 转换为毫秒
    this.recordMetric(label, duration);
    this.timers.delete(label);
    
    return duration;
  }

  // 记录指标
  recordMetric(name: string, value: number): void {
    const values = this.metrics.get(name) || [];
    values.push(value);
    
    // 保持最近1000个数据点
    if (values.length > 1000) {
      values.shift();
    }
    
    this.metrics.set(name, values);
  }

  // 增加计数器
  increment(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  // 获取统计信息
  getStats(name: string): { count: number; sum: number; mean: number; min: number; max: number; p95: number; p99: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      sum,
      mean: sum / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  // 获取所有指标概览
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [name] of this.metrics) {
      stats[name] = this.getStats(name);
    }
    
    // 添加计数器
    for (const [name, value] of this.counters) {
      stats[`counter_${name}`] = value;
    }

    // 添加系统指标
    stats.system = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime()
    };

    return stats;
  }

  // 重置所有指标
  reset(): void {
    this.metrics.clear();
    this.timers.clear();
    this.counters.clear();
  }
}
```

### 1.2 性能监控装饰器
```typescript
function performanceMonitor(metricName?: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const name = metricName || `${target.constructor.name}.${propertyName}`;
    
    descriptor.value = async function(...args: any[]) {
      const profiler = getGlobalProfiler();
      const startTime = Date.now();
      
      try {
        profiler.increment(`${name}_calls`);
        const result = await method.apply(this, args);
        
        const duration = Date.now() - startTime;
        profiler.recordMetric(`${name}_duration`, duration);
        profiler.increment(`${name}_success`);
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        profiler.recordMetric(`${name}_duration`, duration);
        profiler.increment(`${name}_errors`);
        
        throw error;
      }
    };
  };
}

// 全局性能分析器实例
let globalProfiler: PerformanceProfiler;

function getGlobalProfiler(): PerformanceProfiler {
  if (!globalProfiler) {
    globalProfiler = new PerformanceProfiler();
  }
  return globalProfiler;
}

// 使用示例
class OptimizedToolHandler {
  @performanceMonitor('tool_execution')
  async executeTool(name: string, args: any): Promise<any> {
    // 工具执行逻辑
    return { result: 'success' };
  }
}
```

## 2. 缓存系统设计

### 2.1 多级缓存架构
```typescript
interface CacheConfig {
  maxSize: number;
  ttl: number; // 生存时间(秒)
  maxAge?: number; // 最大存活时间
  strategy: 'LRU' | 'LFU' | 'FIFO';
}

interface CacheEntry<T> {
  value: T;
  createdAt: Date;
  accessedAt: Date;
  accessCount: number;
  expiresAt: Date;
}

abstract class CacheStore<T> {
  protected config: CacheConfig;
  protected entries: Map<string, CacheEntry<T>> = new Map();

  constructor(config: CacheConfig) {
    this.config = config;
    
    // 定期清理过期条目
    setInterval(() => this.cleanup(), 60000);
  }

  abstract evict(): void;

  set(key: string, value: T, customTTL?: number): void {
    // 检查是否需要驱逐
    if (this.entries.size >= this.config.maxSize && !this.entries.has(key)) {
      this.evict();
    }

    const ttl = (customTTL || this.config.ttl) * 1000;
    const now = new Date();

    const entry: CacheEntry<T> = {
      value,
      createdAt: now,
      accessedAt: now,
      accessCount: 1,
      expiresAt: new Date(now.getTime() + ttl)
    };

    this.entries.set(key, entry);
  }

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) {
      return undefined;
    }

    // 检查是否过期
    if (entry.expiresAt < new Date()) {
      this.entries.delete(key);
      return undefined;
    }

    // 更新访问信息
    entry.accessedAt = new Date();
    entry.accessCount++;

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }

  size(): number {
    return this.entries.size;
  }

  private cleanup(): void {
    const now = new Date();
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt < now) {
        this.entries.delete(key);
      }
    }
  }
}

class LRUCache<T> extends CacheStore<T> {
  evict(): void {
    if (this.entries.size === 0) return;

    let oldestKey: string | null = null;
    let oldestTime = new Date();

    for (const [key, entry] of this.entries) {
      if (entry.accessedAt < oldestTime) {
        oldestTime = entry.accessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.entries.delete(oldestKey);
    }
  }
}

class LFUCache<T> extends CacheStore<T> {
  evict(): void {
    if (this.entries.size === 0) return;

    let leastUsedKey: string | null = null;
    let leastCount = Infinity;

    for (const [key, entry] of this.entries) {
      if (entry.accessCount < leastCount) {
        leastCount = entry.accessCount;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.entries.delete(leastUsedKey);
    }
  }
}
```

### 2.2 分层缓存管理器
```typescript
interface CacheLayer<T> {
  name: string;
  cache: CacheStore<T>;
  priority: number;
}

class LayeredCacheManager<T> {
  private layers: CacheLayer<T>[] = [];
  private stats = {
    hits: 0,
    misses: 0,
    writes: 0
  };

  addLayer(name: string, cache: CacheStore<T>, priority: number): void {
    this.layers.push({ name, cache, priority });
    this.layers.sort((a, b) => b.priority - a.priority); // 高优先级在前
  }

  async get(key: string): Promise<T | undefined> {
    for (const layer of this.layers) {
      const value = layer.cache.get(key);
      if (value !== undefined) {
        this.stats.hits++;
        
        // 回填到更高优先级的层
        await this.backfill(key, value, layer.priority);
        
        return value;
      }
    }

    this.stats.misses++;
    return undefined;
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    this.stats.writes++;
    
    // 写入所有层
    for (const layer of this.layers) {
      layer.cache.set(key, value, ttl);
    }
  }

  async delete(key: string): Promise<void> {
    // 从所有层删除
    for (const layer of this.layers) {
      layer.cache.delete(key);
    }
  }

  private async backfill(key: string, value: T, fromPriority: number): Promise<void> {
    // 回填到优先级更高的层
    for (const layer of this.layers) {
      if (layer.priority > fromPriority) {
        layer.cache.set(key, value);
      }
    }
  }

  getStats(): { hits: number; misses: number; writes: number; hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0
    };
  }

  clear(): void {
    for (const layer of this.layers) {
      layer.cache.clear();
    }
    this.stats = { hits: 0, misses: 0, writes: 0 };
  }
}

// 使用示例：工具结果缓存
class ToolResultCache {
  private cache: LayeredCacheManager<any>;

  constructor() {
    this.cache = new LayeredCacheManager<any>();
    
    // L1: 内存缓存 (快速访问)
    this.cache.addLayer(
      'memory',
      new LRUCache({ maxSize: 100, ttl: 300, strategy: 'LRU' }),
      3
    );
    
    // L2: 持久化缓存 (更大容量)
    // 这里可以集成Redis或其他外部缓存
  }

  async getToolResult(toolName: string, args: any): Promise<any> {
    const cacheKey = this.generateCacheKey(toolName, args);
    return await this.cache.get(cacheKey);
  }

  async cacheToolResult(toolName: string, args: any, result: any, ttl: number = 300): Promise<void> {
    const cacheKey = this.generateCacheKey(toolName, args);
    await this.cache.set(cacheKey, result, ttl);
  }

  private generateCacheKey(toolName: string, args: any): string {
    const argsHash = require('crypto')
      .createHash('sha256')
      .update(JSON.stringify(args))
      .digest('hex')
      .substring(0, 16);
    
    return `tool:${toolName}:${argsHash}`;
  }
}
```

## 3. 并发和异步处理

### 3.1 请求队列管理
```typescript
interface QueueConfig {
  maxConcurrency: number;
  maxQueueSize: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

interface QueuedTask<T> {
  id: string;
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  attempts: number;
  createdAt: Date;
  timeout?: NodeJS.Timeout;
}

class ConcurrencyController<T> {
  private config: QueueConfig;
  private queue: QueuedTask<T>[] = [];
  private running: Set<string> = new Set();
  private stats = {
    processed: 0,
    failed: 0,
    retried: 0,
    timeout: 0
  };

  constructor(config: QueueConfig) {
    this.config = config;
  }

  async execute<R>(task: () => Promise<R>): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      if (this.queue.length >= this.config.maxQueueSize) {
        reject(new Error('Queue is full'));
        return;
      }

      const taskId = this.generateTaskId();
      const queuedTask: QueuedTask<R> = {
        id: taskId,
        task: task as any,
        resolve: resolve as any,
        reject,
        attempts: 0,
        createdAt: new Date()
      };

      // 设置超时
      if (this.config.timeout > 0) {
        queuedTask.timeout = setTimeout(() => {
          this.handleTimeout(taskId);
        }, this.config.timeout);
      }

      this.queue.push(queuedTask as any);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.running.size >= this.config.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const queuedTask = this.queue.shift();
    if (!queuedTask) return;

    this.running.add(queuedTask.id);
    
    try {
      const result = await queuedTask.task();
      
      if (queuedTask.timeout) {
        clearTimeout(queuedTask.timeout);
      }
      
      queuedTask.resolve(result);
      this.stats.processed++;
      
    } catch (error) {
      queuedTask.attempts++;
      
      if (queuedTask.attempts < this.config.retryAttempts) {
        // 重试
        setTimeout(() => {
          this.queue.unshift(queuedTask);
          this.processQueue();
        }, this.config.retryDelay);
        this.stats.retried++;
      } else {
        if (queuedTask.timeout) {
          clearTimeout(queuedTask.timeout);
        }
        queuedTask.reject(error as Error);
        this.stats.failed++;
      }
    } finally {
      this.running.delete(queuedTask.id);
      
      // 继续处理队列
      setImmediate(() => this.processQueue());
    }
  }

  private handleTimeout(taskId: string): void {
    const task = this.queue.find(t => t.id === taskId) || 
                 Array.from(this.running).includes(taskId);
    
    if (task) {
      this.stats.timeout++;
      // 这里可以添加更复杂的超时处理逻辑
    }
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats(): typeof this.stats & { queueSize: number; runningCount: number } {
    return {
      ...this.stats,
      queueSize: this.queue.length,
      runningCount: this.running.size
    };
  }
}
```

### 3.2 资源池管理
```typescript
interface PoolConfig {
  min: number;
  max: number;
  acquireTimeout: number;
  idleTimeout: number;
  maxUses?: number;
}

interface PoolResource<T> {
  resource: T;
  id: string;
  createdAt: Date;
  lastUsed: Date;
  useCount: number;
  inUse: boolean;
}

abstract class ResourcePool<T> {
  protected config: PoolConfig;
  protected resources: Map<string, PoolResource<T>> = new Map();
  protected waitingQueue: Array<{
    resolve: (resource: T) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = [];

  constructor(config: PoolConfig) {
    this.config = config;
    this.initializePool();
    
    // 定期清理闲置资源
    setInterval(() => this.cleanupIdle(), 30000);
  }

  abstract createResource(): Promise<T>;
  abstract validateResource(resource: T): Promise<boolean>;
  abstract destroyResource(resource: T): Promise<void>;

  async acquire(): Promise<T> {
    // 尝试获取可用资源
    const availableResource = this.findAvailableResource();
    if (availableResource) {
      return this.useResource(availableResource);
    }

    // 如果池未满，创建新资源
    if (this.resources.size < this.config.max) {
      try {
        const resource = await this.createResource();
        const poolResource = this.wrapResource(resource);
        this.resources.set(poolResource.id, poolResource);
        return this.useResource(poolResource);
      } catch (error) {
        // 创建失败，加入等待队列
      }
    }

    // 加入等待队列
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex(w => w.resolve === resolve);
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
        }
        reject(new Error('Acquire timeout'));
      }, this.config.acquireTimeout);

      this.waitingQueue.push({ resolve, reject, timeout });
    });
  }

  release(resource: T): void {
    const poolResource = this.findPoolResource(resource);
    if (!poolResource) {
      return; // 资源不属于此池
    }

    poolResource.inUse = false;
    poolResource.lastUsed = new Date();

    // 检查是否需要销毁资源
    if (this.shouldDestroyResource(poolResource)) {
      this.destroyPoolResource(poolResource.id);
      return;
    }

    // 处理等待队列
    if (this.waitingQueue.length > 0) {
      const waiter = this.waitingQueue.shift();
      if (waiter) {
        clearTimeout(waiter.timeout);
        waiter.resolve(this.useResource(poolResource));
      }
    }
  }

  private async initializePool(): Promise<void> {
    const createPromises = [];
    for (let i = 0; i < this.config.min; i++) {
      createPromises.push(this.createAndAddResource());
    }
    
    await Promise.allSettled(createPromises);
  }

  private async createAndAddResource(): Promise<void> {
    try {
      const resource = await this.createResource();
      const poolResource = this.wrapResource(resource);
      this.resources.set(poolResource.id, poolResource);
    } catch (error) {
      // 资源创建失败，记录但不抛出错误
      console.error('Failed to create resource:', error);
    }
  }

  private wrapResource(resource: T): PoolResource<T> {
    return {
      resource,
      id: this.generateResourceId(),
      createdAt: new Date(),
      lastUsed: new Date(),
      useCount: 0,
      inUse: false
    };
  }

  private findAvailableResource(): PoolResource<T> | undefined {
    for (const [, poolResource] of this.resources) {
      if (!poolResource.inUse) {
        return poolResource;
      }
    }
    return undefined;
  }

  private findPoolResource(resource: T): PoolResource<T> | undefined {
    for (const [, poolResource] of this.resources) {
      if (poolResource.resource === resource) {
        return poolResource;
      }
    }
    return undefined;
  }

  private useResource(poolResource: PoolResource<T>): T {
    poolResource.inUse = true;
    poolResource.useCount++;
    poolResource.lastUsed = new Date();
    return poolResource.resource;
  }

  private shouldDestroyResource(poolResource: PoolResource<T>): boolean {
    // 检查最大使用次数
    if (this.config.maxUses && poolResource.useCount >= this.config.maxUses) {
      return true;
    }

    // 检查是否超过最小数量
    if (this.resources.size <= this.config.min) {
      return false;
    }

    return false;
  }

  private async destroyPoolResource(resourceId: string): Promise<void> {
    const poolResource = this.resources.get(resourceId);
    if (!poolResource) return;

    this.resources.delete(resourceId);
    
    try {
      await this.destroyResource(poolResource.resource);
    } catch (error) {
      console.error('Failed to destroy resource:', error);
    }
  }

  private async cleanupIdle(): Promise<void> {
    const now = new Date();
    const idleThreshold = new Date(now.getTime() - this.config.idleTimeout);

    for (const [id, poolResource] of this.resources) {
      if (!poolResource.inUse && 
          poolResource.lastUsed < idleThreshold &&
          this.resources.size > this.config.min) {
        await this.destroyPoolResource(id);
      }
    }
  }

  private generateResourceId(): string {
    return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats(): { total: number; available: number; inUse: number; waiting: number } {
    const inUse = Array.from(this.resources.values()).filter(r => r.inUse).length;
    return {
      total: this.resources.size,
      available: this.resources.size - inUse,
      inUse,
      waiting: this.waitingQueue.length
    };
  }
}

// 数据库连接池示例
class DatabaseConnectionPool extends ResourcePool<any> {
  private connectionConfig: any;

  constructor(config: PoolConfig, connectionConfig: any) {
    super(config);
    this.connectionConfig = connectionConfig;
  }

  async createResource(): Promise<any> {
    // 这里集成实际的数据库连接逻辑
    // 例如: return mysql.createConnection(this.connectionConfig);
    return { connected: true, id: Math.random().toString(36) };
  }

  async validateResource(resource: any): Promise<boolean> {
    // 验证连接是否仍然有效
    try {
      // 例如: await resource.ping();
      return true;
    } catch {
      return false;
    }
  }

  async destroyResource(resource: any): Promise<void> {
    // 关闭连接
    try {
      // 例如: await resource.close();
      console.log('Connection closed');
    } catch (error) {
      console.error('Error closing connection:', error);
    }
  }
}
```

## 4. 内存管理优化

### 4.1 内存使用监控
```typescript
interface MemorySnapshot {
  timestamp: Date;
  usage: NodeJS.MemoryUsage;
  gcCount: number;
  heapSizeLimit: number;
}

class MemoryMonitor {
  private snapshots: MemorySnapshot[] = [];
  private gcCount = 0;
  private alertThresholds = {
    heapUsed: 0.8, // 80%
    rss: 1024 * 1024 * 1024, // 1GB
    external: 100 * 1024 * 1024 // 100MB
  };
  private alertCallback?: (snapshot: MemorySnapshot) => void;

  constructor() {
    // 监控GC事件
    if (process.env.NODE_ENV === 'development') {
      this.enableGCMonitoring();
    }

    // 定期采集内存快照
    setInterval(() => this.takeSnapshot(), 10000);
  }

  private enableGCMonitoring(): void {
    const v8 = require('v8');
    
    // 这需要启动时设置 --expose-gc 或使用 gc-stats 库
    if (global.gc) {
      const originalGC = global.gc;
      global.gc = () => {
        this.gcCount++;
        return originalGC();
      };
    }
  }

  takeSnapshot(): MemorySnapshot {
    const usage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      timestamp: new Date(),
      usage,
      gcCount: this.gcCount,
      heapSizeLimit: require('v8').getHeapStatistics().heap_size_limit
    };

    this.snapshots.push(snapshot);
    
    // 保持最近100个快照
    if (this.snapshots.length > 100) {
      this.snapshots.shift();
    }

    // 检查告警条件
    this.checkMemoryAlerts(snapshot);

    return snapshot;
  }

  private checkMemoryAlerts(snapshot: MemorySnapshot): void {
    const { usage, heapSizeLimit } = snapshot;
    const heapUsedRatio = usage.heapUsed / heapSizeLimit;

    let alertTriggered = false;
    let alertMessage = 'Memory usage alert: ';

    if (heapUsedRatio > this.alertThresholds.heapUsed) {
      alertMessage += `Heap usage ${(heapUsedRatio * 100).toFixed(1)}% `;
      alertTriggered = true;
    }

    if (usage.rss > this.alertThresholds.rss) {
      alertMessage += `RSS ${Math.round(usage.rss / 1024 / 1024)}MB `;
      alertTriggered = true;
    }

    if (usage.external > this.alertThresholds.external) {
      alertMessage += `External ${Math.round(usage.external / 1024 / 1024)}MB `;
      alertTriggered = true;
    }

    if (alertTriggered) {
      console.warn(alertMessage);
      if (this.alertCallback) {
        this.alertCallback(snapshot);
      }
    }
  }

  getMemoryTrend(minutes: number = 10): MemorySnapshot[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.snapshots.filter(s => s.timestamp >= cutoff);
  }

  analyzeMemoryLeak(): { isLeaking: boolean; trend: number; recommendation: string } {
    if (this.snapshots.length < 10) {
      return {
        isLeaking: false,
        trend: 0,
        recommendation: 'Not enough data to analyze'
      };
    }

    const recentSnapshots = this.snapshots.slice(-10);
    const heapUsages = recentSnapshots.map(s => s.usage.heapUsed);
    
    // 计算趋势 (简单线性回归)
    const trend = this.calculateTrend(heapUsages);
    const isLeaking = trend > 1024 * 1024; // 1MB增长趋势

    let recommendation = '';
    if (isLeaking) {
      recommendation = 'Potential memory leak detected. Consider: 1) Check for event listener leaks 2) Review cache configurations 3) Analyze large object retention';
    } else {
      recommendation = 'Memory usage appears stable';
    }

    return { isLeaking, trend, recommendation };
  }

  private calculateTrend(values: number[]): number {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;

    const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);

    return denominator === 0 ? 0 : numerator / denominator;
  }

  setAlertCallback(callback: (snapshot: MemorySnapshot) => void): void {
    this.alertCallback = callback;
  }

  forceGC(): void {
    if (global.gc) {
      global.gc();
      console.log('Garbage collection triggered manually');
    } else {
      console.warn('Garbage collection not available. Start with --expose-gc');
    }
  }
}
```

### 4.2 对象池和重用策略
```typescript
interface PoolableObject {
  reset(): void;
  isReusable(): boolean;
}

class ObjectPool<T extends PoolableObject> {
  private pool: T[] = [];
  private factory: () => T;
  private maxSize: number;
  private stats = {
    created: 0,
    reused: 0,
    destroyed: 0
  };

  constructor(factory: () => T, maxSize: number = 100) {
    this.factory = factory;
    this.maxSize = maxSize;
  }

  acquire(): T {
    let obj = this.pool.pop();
    
    if (!obj) {
      obj = this.factory();
      this.stats.created++;
    } else {
      this.stats.reused++;
    }

    return obj;
  }

  release(obj: T): void {
    if (!obj.isReusable() || this.pool.length >= this.maxSize) {
      this.stats.destroyed++;
      return;
    }

    try {
      obj.reset();
      this.pool.push(obj);
    } catch (error) {
      this.stats.destroyed++;
      console.error('Failed to reset object for pool:', error);
    }
  }

  clear(): void {
    this.pool.length = 0;
  }

  getStats(): typeof this.stats & { poolSize: number } {
    return {
      ...this.stats,
      poolSize: this.pool.length
    };
  }
}

// Buffer池示例
class PooledBuffer implements PoolableObject {
  private buffer: Buffer;
  private size: number;

  constructor(size: number) {
    this.size = size;
    this.buffer = Buffer.allocUnsafe(size);
  }

  reset(): void {
    this.buffer.fill(0);
  }

  isReusable(): boolean {
    return this.buffer.length === this.size;
  }

  getBuffer(): Buffer {
    return this.buffer;
  }
}

// 使用示例
const bufferPool = new ObjectPool(() => new PooledBuffer(1024), 50);

function processData(data: any): Buffer {
  const pooledBuffer = bufferPool.acquire();
  try {
    const buffer = pooledBuffer.getBuffer();
    // 处理数据...
    return buffer.slice(0, data.length); // 返回实际数据大小的copy
  } finally {
    bufferPool.release(pooledBuffer);
  }
}
```

## 5. 可扩展架构模式

### 5.1 微服务架构适配
```typescript
interface ServiceConfig {
  name: string;
  version: string;
  endpoints: string[];
  healthCheck: string;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
  circuitBreaker: {
    failureThreshold: number;
    resetTimeoutMs: number;
  };
}

enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failures = 0;
  private lastFailureTime = 0;
  private config: ServiceConfig['circuitBreaker'];

  constructor(config: ServiceConfig['circuitBreaker']) {
    this.config = config;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      
      if (this.state === CircuitState.HALF_OPEN) {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.config.failureThreshold) {
        this.state = CircuitState.OPEN;
      }
      
      throw error;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

class MicroserviceClient {
  private config: ServiceConfig;
  private circuitBreaker: CircuitBreaker;
  private loadBalancer: LoadBalancer;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
    this.loadBalancer = new LoadBalancer(config.endpoints);
  }

  async call<T>(endpoint: string, data?: any): Promise<T> {
    return this.circuitBreaker.execute(async () => {
      const url = await this.loadBalancer.getEndpoint();
      return this.makeRequest<T>(`${url}${endpoint}`, data);
    });
  }

  private async makeRequest<T>(url: string, data?: any): Promise<T> {
    const fetch = require('node-fetch');
    
    let attempt = 0;
    let lastError: Error;

    while (attempt < this.config.retryPolicy.maxRetries) {
      try {
        const response = await fetch(url, {
          method: data ? 'POST' : 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: data ? JSON.stringify(data) : undefined
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        attempt++;
        
        if (attempt < this.config.retryPolicy.maxRetries) {
          await this.delay(this.config.retryPolicy.backoffMs * attempt);
        }
      }
    }

    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class LoadBalancer {
  private endpoints: string[];
  private currentIndex = 0;
  private healthStatus: Map<string, boolean> = new Map();

  constructor(endpoints: string[]) {
    this.endpoints = endpoints;
    
    // 初始化所有端点为健康状态
    endpoints.forEach(endpoint => {
      this.healthStatus.set(endpoint, true);
    });
  }

  async getEndpoint(): Promise<string> {
    const healthyEndpoints = this.endpoints.filter(ep => 
      this.healthStatus.get(ep) === true
    );

    if (healthyEndpoints.length === 0) {
      throw new Error('No healthy endpoints available');
    }

    // 简单轮询策略
    const endpoint = healthyEndpoints[this.currentIndex % healthyEndpoints.length];
    this.currentIndex++;
    
    return endpoint;
  }

  markUnhealthy(endpoint: string): void {
    this.healthStatus.set(endpoint, false);
  }

  markHealthy(endpoint: string): void {
    this.healthStatus.set(endpoint, true);
  }
}
```

### 5.2 水平扩展支持
```typescript
interface ClusterConfig {
  nodeId: string;
  nodes: string[];
  shardingStrategy: 'consistent_hash' | 'range' | 'random';
  replicationFactor: number;
}

class ClusterManager {
  private config: ClusterConfig;
  private hashRing: ConsistentHashRing;
  private nodeHealth: Map<string, boolean> = new Map();

  constructor(config: ClusterConfig) {
    this.config = config;
    this.hashRing = new ConsistentHashRing(config.nodes);
    
    // 初始化节点健康状态
    config.nodes.forEach(node => {
      this.nodeHealth.set(node, true);
    });
  }

  getNodeForKey(key: string): string[] {
    switch (this.config.shardingStrategy) {
      case 'consistent_hash':
        return this.hashRing.getNodes(key, this.config.replicationFactor);
      case 'range':
        return this.getRangeNodes(key);
      case 'random':
        return this.getRandomNodes();
      default:
        throw new Error(`Unknown sharding strategy: ${this.config.shardingStrategy}`);
    }
  }

  private getRangeNodes(key: string): string[] {
    // 简化的范围分片实现
    const hash = this.simpleHash(key);
    const nodeIndex = hash % this.config.nodes.length;
    return [this.config.nodes[nodeIndex]];
  }

  private getRandomNodes(): string[] {
    const healthyNodes = this.config.nodes.filter(node => 
      this.nodeHealth.get(node) === true
    );
    
    const selectedNodes = [];
    for (let i = 0; i < Math.min(this.config.replicationFactor, healthyNodes.length); i++) {
      const randomIndex = Math.floor(Math.random() * healthyNodes.length);
      selectedNodes.push(healthyNodes[randomIndex]);
    }
    
    return selectedNodes;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  isLocalNode(nodeId: string): boolean {
    return nodeId === this.config.nodeId;
  }

  updateNodeHealth(nodeId: string, healthy: boolean): void {
    this.nodeHealth.set(nodeId, healthy);
    
    if (!healthy) {
      this.hashRing.removeNode(nodeId);
    } else {
      this.hashRing.addNode(nodeId);
    }
  }
}

class ConsistentHashRing {
  private ring: Map<number, string> = new Map();
  private virtualNodes = 150; // 每个物理节点的虚拟节点数

  constructor(nodes: string[]) {
    nodes.forEach(node => this.addNode(node));
  }

  addNode(node: string): void {
    for (let i = 0; i < this.virtualNodes; i++) {
      const virtualNodeKey = `${node}:${i}`;
      const hash = this.hash(virtualNodeKey);
      this.ring.set(hash, node);
    }
  }

  removeNode(node: string): void {
    for (let i = 0; i < this.virtualNodes; i++) {
      const virtualNodeKey = `${node}:${i}`;
      const hash = this.hash(virtualNodeKey);
      this.ring.delete(hash);
    }
  }

  getNodes(key: string, count: number = 1): string[] {
    if (this.ring.size === 0) {
      return [];
    }

    const keyHash = this.hash(key);
    const sortedHashes = Array.from(this.ring.keys()).sort((a, b) => a - b);
    
    // 找到第一个大于等于keyHash的位置
    let index = sortedHashes.findIndex(hash => hash >= keyHash);
    if (index === -1) {
      index = 0; // 环形结构，回到开始
    }

    const selectedNodes = new Set<string>();
    let currentIndex = index;

    while (selectedNodes.size < count && selectedNodes.size < this.getUniqueNodeCount()) {
      const hash = sortedHashes[currentIndex];
      const node = this.ring.get(hash)!;
      selectedNodes.add(node);
      
      currentIndex = (currentIndex + 1) % sortedHashes.length;
    }

    return Array.from(selectedNodes);
  }

  private getUniqueNodeCount(): number {
    return new Set(this.ring.values()).size;
  }

  private hash(str: string): number {
    // 使用更好的哈希函数，这里简化实现
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(str).digest('hex');
    return parseInt(hash.substring(0, 8), 16);
  }
}
```

## 6. 最佳实践

### 6.1 性能优化原则
1. **测量优先** - 先测量再优化，基于数据做决策
2. **局部优化** - 专注于热点代码路径
3. **缓存策略** - 合理使用多级缓存
4. **异步处理** - 充分利用Node.js异步特性
5. **资源池化** - 复用昂贵的资源

### 6.2 扩展性设计
1. **无状态设计** - 服务实例间无状态共享
2. **水平分片** - 支持数据和请求分片
3. **负载均衡** - 合理分配请求负载
4. **故障隔离** - 防止单点故障影响整体
5. **监控告警** - 完善的监控和告警体系

### 6.3 内存优化技巧
1. **及时释放** - 及时清理不再使用的对象
2. **避免泄漏** - 注意事件监听器和定时器清理
3. **流式处理** - 对大数据使用流式处理
4. **对象池** - 复用频繁创建的对象
5. **垃圾回收** - 了解并优化GC行为

## 小结

通过本章学习，我们掌握了：
- 性能分析和监控的完整体系
- 多级缓存系统的设计和实现
- 并发控制和资源池管理
- 内存优化和泄漏检测
- 可扩展架构的设计模式

性能优化是一个持续的过程，需要根据实际业务场景和负载特征进行针对性的优化，同时要平衡性能、复杂性和可维护性。