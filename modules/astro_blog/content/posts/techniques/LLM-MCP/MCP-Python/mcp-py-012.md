---
title: "第12章：测试、部署和运维"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第12章：测试、部署和运维

## 学习目标
1. 建立完整的测试体系（单元测试、集成测试）
2. 掌握MCP Server的打包和部署策略
3. 学习容器化部署和编排
4. 实现监控、告警和故障恢复
5. 掌握版本管理和持续集成/部署

## 1. 测试体系构建

### 1.1 单元测试框架
```typescript
// 使用Jest作为测试框架
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// Mock传输层
class MockTransport {
  private handlers: Map<string, Function> = new Map();
  private responses: any[] = [];

  onMessage(handler: Function): void {
    this.handlers.set('message', handler);
  }

  onError(handler: Function): void {
    this.handlers.set('error', handler);
  }

  onClose(handler: Function): void {
    this.handlers.set('close', handler);
  }

  async send(message: any): Promise<void> {
    this.responses.push(message);
  }

  // 模拟接收消息
  async simulateMessage(message: any): Promise<any> {
    const handler = this.handlers.get('message');
    if (handler) {
      return await handler(message);
    }
  }

  getResponses(): any[] {
    return [...this.responses];
  }

  clearResponses(): void {
    this.responses = [];
  }
}

// 测试工具类
class MCPTestUtils {
  static createTestServer(capabilities: any = {}): { server: Server; transport: MockTransport } {
    const server = new Server(
      {
        name: "test-server",
        version: "1.0.0"
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
          ...capabilities
        }
      }
    );

    const transport = new MockTransport();
    return { server, transport };
  }

  static createToolCallRequest(toolName: string, args: any = {}): any {
    return {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      }
    };
  }

  static createResourceReadRequest(uri: string): any {
    return {
      jsonrpc: "2.0",
      id: 2,
      method: "resources/read",
      params: { uri }
    };
  }

  static createPromptGetRequest(name: string, args: any = {}): any {
    return {
      jsonrpc: "2.0",
      id: 3,
      method: "prompts/get",
      params: {
        name,
        arguments: args
      }
    };
  }
}

// 示例：文件操作工具的单元测试
describe('FileOperationsTool', () => {
  let server: Server;
  let transport: MockTransport;
  let fileOps: FileOperationsTool;
  let tempDir: string;

  beforeEach(async () => {
    // 创建临时测试目录
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-test-'));
    
    ({ server, transport } = MCPTestUtils.createTestServer());
    
    fileOps = new FileOperationsTool({
      baseDirectory: tempDir,
      maxFileSize: 1024 * 1024, // 1MB
      allowedExtensions: ['.txt', '.json'],
      forbiddenPaths: []
    });

    // 注册工具到服务器
    fileOps.register(server);
  });

  afterEach(async () => {
    // 清理临时目录
    await fs.rmdir(tempDir, { recursive: true });
  });

  describe('list_files tool', () => {
    it('should list files in directory', async () => {
      // 准备测试数据
      await fs.writeFile(path.join(tempDir, 'test.txt'), 'Hello World');
      await fs.mkdir(path.join(tempDir, 'subdir'));

      // 执行工具调用
      const request = MCPTestUtils.createToolCallRequest('list_files', {
        path: '.'
      });

      await server.connect(transport);
      const response = await transport.simulateMessage(request);

      // 验证结果
      expect(response.result).toBeDefined();
      expect(response.result.content[0].type).toBe('text');
      
      const files = JSON.parse(response.result.content[0].text);
      expect(files).toHaveLength(2);
      expect(files.find(f => f.name === 'test.txt')).toBeDefined();
      expect(files.find(f => f.name === 'subdir')).toBeDefined();
    });

    it('should handle empty directory', async () => {
      const request = MCPTestUtils.createToolCallRequest('list_files', {
        path: '.'
      });

      await server.connect(transport);
      const response = await transport.simulateMessage(request);

      const files = JSON.parse(response.result.content[0].text);
      expect(files).toHaveLength(0);
    });

    it('should reject invalid paths', async () => {
      const request = MCPTestUtils.createToolCallRequest('list_files', {
        path: '../../../etc'
      });

      await server.connect(transport);
      const response = await transport.simulateMessage(request);

      expect(response.error).toBeDefined();
      expect(response.error.message).toContain('outside of allowed directory');
    });
  });

  describe('read_file tool', () => {
    it('should read file content', async () => {
      const content = 'Hello, MCP World!';
      await fs.writeFile(path.join(tempDir, 'test.txt'), content);

      const request = MCPTestUtils.createToolCallRequest('read_file', {
        path: 'test.txt'
      });

      await server.connect(transport);
      const response = await transport.simulateMessage(request);

      expect(response.result.content[0].text).toBe(content);
    });

    it('should handle file not found', async () => {
      const request = MCPTestUtils.createToolCallRequest('read_file', {
        path: 'nonexistent.txt'
      });

      await server.connect(transport);
      const response = await transport.simulateMessage(request);

      expect(response.error).toBeDefined();
      expect(response.error.message).toContain('ENOENT');
    });

    it('should enforce file size limits', async () => {
      // 创建超过限制的大文件
      const largeContent = 'x'.repeat(2 * 1024 * 1024); // 2MB
      await fs.writeFile(path.join(tempDir, 'large.txt'), largeContent);

      const request = MCPTestUtils.createToolCallRequest('read_file', {
        path: 'large.txt'
      });

      await server.connect(transport);
      const response = await transport.simulateMessage(request);

      expect(response.error).toBeDefined();
      expect(response.error.message).toContain('File too large');
    });
  });

  describe('write_file tool', () => {
    it('should write file content', async () => {
      const content = 'New file content';
      const request = MCPTestUtils.createToolCallRequest('write_file', {
        path: 'new.txt',
        content
      });

      await server.connect(transport);
      const response = await transport.simulateMessage(request);

      expect(response.result).toBeDefined();
      
      // 验证文件确实被写入
      const writtenContent = await fs.readFile(path.join(tempDir, 'new.txt'), 'utf8');
      expect(writtenContent).toBe(content);
    });

    it('should create backup when requested', async () => {
      const originalContent = 'Original content';
      const newContent = 'New content';
      
      // 创建原始文件
      await fs.writeFile(path.join(tempDir, 'test.txt'), originalContent);

      const request = MCPTestUtils.createToolCallRequest('write_file', {
        path: 'test.txt',
        content: newContent,
        backup: true
      });

      await server.connect(transport);
      await transport.simulateMessage(request);

      // 检查备份文件是否存在
      const files = await fs.readdir(tempDir);
      const backupFile = files.find(f => f.startsWith('test.txt.backup.'));
      expect(backupFile).toBeDefined();

      // 验证备份内容
      const backupContent = await fs.readFile(path.join(tempDir, backupFile!), 'utf8');
      expect(backupContent).toBe(originalContent);
    });
  });
});
```

### 1.2 集成测试
```typescript
// 集成测试：测试完整的MCP Server
describe('MCP Server Integration Tests', () => {
  let serverProcess: ChildProcess;
  let client: MCPClient;

  beforeAll(async () => {
    // 启动MCP Server进程
    serverProcess = spawn('node', ['dist/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // 等待服务器启动
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 创建客户端连接
    client = new MCPClient({
      transport: new StdioClientTransport({
        command: 'node',
        args: ['dist/server.js']
      })
    });

    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
    serverProcess.kill();
  });

  describe('Server Capabilities', () => {
    it('should advertise correct capabilities', async () => {
      const capabilities = await client.getCapabilities();
      
      expect(capabilities.tools).toBeDefined();
      expect(capabilities.resources).toBeDefined();
      expect(capabilities.prompts).toBeDefined();
    });
  });

  describe('Tool Integration', () => {
    it('should execute tools end-to-end', async () => {
      const tools = await client.listTools();
      expect(tools.length).toBeGreaterThan(0);

      const listFilesTool = tools.find(t => t.name === 'list_files');
      expect(listFilesTool).toBeDefined();

      const result = await client.callTool('list_files', { path: '.' });
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
    });

    it('should handle tool errors gracefully', async () => {
      await expect(
        client.callTool('invalid_tool', {})
      ).rejects.toThrow('Unknown tool');
    });
  });

  describe('Resource Integration', () => {
    it('should list and read resources', async () => {
      const resources = await client.listResources();
      expect(Array.isArray(resources)).toBe(true);

      if (resources.length > 0) {
        const resource = resources[0];
        const content = await client.readResource(resource.uri);
        expect(content.contents).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should return proper error responses', async () => {
      // 测试各种错误情况
      await expect(
        client.callTool('read_file', { path: '/nonexistent/path' })
      ).rejects.toThrow();
    });
  });
});

// MCP客户端测试工具
class MCPClient {
  private transport: any;
  private connected = false;
  private requestId = 1;

  constructor(config: { transport: any }) {
    this.transport = config.transport;
  }

  async connect(): Promise<void> {
    await this.transport.connect();
    this.connected = true;

    // 执行握手
    await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
        resources: {},
        prompts: {}
      },
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.transport.disconnect();
      this.connected = false;
    }
  }

  async getCapabilities(): Promise<any> {
    // 从初始化响应中获取能力
    return {
      tools: {},
      resources: {},
      prompts: {}
    };
  }

  async listTools(): Promise<any[]> {
    const response = await this.sendRequest('tools/list', {});
    return response.tools || [];
  }

  async callTool(name: string, args: any): Promise<any> {
    return await this.sendRequest('tools/call', {
      name,
      arguments: args
    });
  }

  async listResources(): Promise<any[]> {
    const response = await this.sendRequest('resources/list', {});
    return response.resources || [];
  }

  async readResource(uri: string): Promise<any> {
    return await this.sendRequest('resources/read', { uri });
  }

  private async sendRequest(method: string, params: any): Promise<any> {
    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params
    };

    const response = await this.transport.sendRequest(request);
    
    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.result;
  }
}
```

### 1.3 性能测试
```typescript
// 性能测试套件
describe('Performance Tests', () => {
  let server: Server;
  let transport: MockTransport;

  beforeEach(() => {
    ({ server, transport } = MCPTestUtils.createTestServer());
  });

  describe('Tool Performance', () => {
    it('should handle high concurrency', async () => {
      const concurrentRequests = 100;
      const promises: Promise<any>[] = [];

      const startTime = Date.now();

      // 创建并发请求
      for (let i = 0; i < concurrentRequests; i++) {
        const request = MCPTestUtils.createToolCallRequest('list_files', {
          path: '.'
        });
        promises.push(transport.simulateMessage(request));
      }

      // 等待所有请求完成
      const results = await Promise.all(promises);
      const endTime = Date.now();

      // 验证所有请求都成功
      results.forEach(result => {
        expect(result.result).toBeDefined();
      });

      const totalTime = endTime - startTime;
      const requestsPerSecond = (concurrentRequests / totalTime) * 1000;

      console.log(`Handled ${concurrentRequests} requests in ${totalTime}ms`);
      console.log(`Throughput: ${requestsPerSecond.toFixed(2)} requests/second`);

      // 性能断言
      expect(requestsPerSecond).toBeGreaterThan(10); // 至少10请求/秒
    });

    it('should have acceptable memory usage', async () => {
      const initialMemory = process.memoryUsage();

      // 执行大量操作
      for (let i = 0; i < 1000; i++) {
        const request = MCPTestUtils.createToolCallRequest('list_files', {
          path: '.'
        });
        await transport.simulateMessage(request);
      }

      // 强制垃圾回收
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      console.log(`Memory increase: ${memoryIncrease / 1024 / 1024}MB`);

      // 内存增长不应超过50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Response Time Tests', () => {
    it('should respond within acceptable time limits', async () => {
      const maxResponseTime = 1000; // 1秒
      const testRequests = [
        MCPTestUtils.createToolCallRequest('list_files', { path: '.' }),
        MCPTestUtils.createResourceReadRequest('file://schema'),
        MCPTestUtils.createPromptGetRequest('code_review', { code: 'test' })
      ];

      for (const request of testRequests) {
        const startTime = Date.now();
        await transport.simulateMessage(request);
        const responseTime = Date.now() - startTime;

        expect(responseTime).toBeLessThan(maxResponseTime);
      }
    });
  });
});

// 负载测试工具
class LoadTestRunner {
  private server: Server;
  private concurrency: number;
  private duration: number;
  private results: LoadTestResult[] = [];

  constructor(server: Server, concurrency: number = 10, duration: number = 60000) {
    this.server = server;
    this.concurrency = concurrency;
    this.duration = duration;
  }

  async run(): Promise<LoadTestSummary> {
    const startTime = Date.now();
    const endTime = startTime + this.duration;
    const workers: Promise<void>[] = [];

    // 启动并发工作者
    for (let i = 0; i < this.concurrency; i++) {
      workers.push(this.runWorker(i, endTime));
    }

    // 等待所有工作者完成
    await Promise.all(workers);

    return this.generateSummary();
  }

  private async runWorker(workerId: number, endTime: number): Promise<void> {
    const transport = new MockTransport();
    
    while (Date.now() < endTime) {
      const startTime = Date.now();
      
      try {
        const request = this.generateRandomRequest();
        await transport.simulateMessage(request);
        
        this.results.push({
          workerId,
          success: true,
          responseTime: Date.now() - startTime,
          timestamp: Date.now()
        });
      } catch (error) {
        this.results.push({
          workerId,
          success: false,
          responseTime: Date.now() - startTime,
          error: error.message,
          timestamp: Date.now()
        });
      }

      // 短暂延迟以模拟真实负载
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private generateRandomRequest(): any {
    const requests = [
      MCPTestUtils.createToolCallRequest('list_files', { path: '.' }),
      MCPTestUtils.createToolCallRequest('read_file', { path: 'test.txt' }),
      MCPTestUtils.createResourceReadRequest('file://schema')
    ];

    return requests[Math.floor(Math.random() * requests.length)];
  }

  private generateSummary(): LoadTestSummary {
    const totalRequests = this.results.length;
    const successfulRequests = this.results.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    
    const responseTimes = this.results
      .filter(r => r.success)
      .map(r => r.responseTime)
      .sort((a, b) => a - b);

    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const p95ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.95)];
    const p99ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.99)];

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: (successfulRequests / totalRequests) * 100,
      avgResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      requestsPerSecond: totalRequests / (this.duration / 1000)
    };
  }
}

interface LoadTestResult {
  workerId: number;
  success: boolean;
  responseTime: number;
  error?: string;
  timestamp: number;
}

interface LoadTestSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
}
```

## 2. 构建和打包

### 2.1 TypeScript构建配置
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "importHelpers": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}

// tsconfig.test.json - 测试配置
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jest", "node"]
  },
  "include": [
    "src/**/*",
    "tests/**/*"
  ]
}
```

### 2.2 构建脚本
```json
// package.json
{
  "name": "mcp-server",
  "version": "1.0.0",
  "description": "MCP Server Implementation",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc --build",
    "build:watch": "tsc --build --watch",
    "build:prod": "tsc --build && npm run bundle",
    "bundle": "esbuild src/index.ts --bundle --platform=node --target=node18 --outfile=dist/bundle.js --external:@modelcontextprotocol/sdk",
    "clean": "rimraf dist",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --config jest.integration.config.js",
    "test:performance": "jest --config jest.performance.config.js",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "start": "node dist/index.js",
    "start:dev": "tsx watch src/index.ts",
    "docker:build": "docker build -t mcp-server .",
    "docker:run": "docker run -it --rm mcp-server"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "esbuild": "^0.19.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "prettier": "^3.0.0",
    "rimraf": "^5.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 2.3 质量检查配置
```javascript
// jest.config.js
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/*.(test|spec).ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};

// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error'
    }
  }
);

// prettier.config.js
export default {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false
};
```

## 3. 容器化部署

### 3.1 Dockerfile优化
```dockerfile
# 多阶段构建Dockerfile
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（包括dev依赖）
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build:prod

# 运行测试
RUN npm run test

# 生产镜像
FROM node:20-alpine AS production

# 安装安全更新
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcpuser -u 1001

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 复制配置文件
COPY --chown=mcpuser:nodejs config/ ./config/

# 切换到非root用户
USER mcpuser

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 使用dumb-init作为PID 1
ENTRYPOINT ["dumb-init", "--"]

# 启动应用
CMD ["node", "dist/index.js"]
```

### 3.2 Docker Compose编排
```yaml
# docker-compose.yml - 开发环境
version: '3.8'

services:
  mcp-server:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - LOG_LEVEL=debug
    depends_on:
      - redis
      - postgres
    networks:
      - mcp-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - mcp-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=mcpserver
      - POSTGRES_USER=mcpuser
      - POSTGRES_PASSWORD=mcppass
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - mcp-network

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - mcp-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - mcp-network

volumes:
  redis-data:
  postgres-data:
  grafana-data:

networks:
  mcp-network:
    driver: bridge

---
# docker-compose.prod.yml - 生产环境
version: '3.8'

services:
  mcp-server:
    image: mcp-server:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://mcpuser:mcppass@postgres:5432/mcpserver
    depends_on:
      - redis
      - postgres
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - mcp-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - mcp-server
    networks:
      - mcp-network
```

### 3.3 Kubernetes部署
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mcp-server

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mcp-server-config
  namespace: mcp-server
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  PORT: "3000"

---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: mcp-server-secrets
  namespace: mcp-server
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@postgres:5432/mcpserver"
  REDIS_URL: "redis://redis:6379"
  JWT_SECRET: "your-jwt-secret"

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-server
  namespace: mcp-server
  labels:
    app: mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mcp-server
  template:
    metadata:
      labels:
        app: mcp-server
    spec:
      containers:
      - name: mcp-server
        image: mcp-server:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: mcp-server-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: mcp-server-secrets
              key: DATABASE_URL
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mcp-server-service
  namespace: mcp-server
spec:
  selector:
    app: mcp-server
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mcp-server-ingress
  namespace: mcp-server
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - mcp-server.example.com
    secretName: mcp-server-tls
  rules:
  - host: mcp-server.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: mcp-server-service
            port:
              number: 80

---
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mcp-server-hpa
  namespace: mcp-server
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mcp-server
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 4. 监控和告警

### 4.1 应用监控
```typescript
// 监控指标收集
import { register, Counter, Histogram, Gauge } from 'prom-client';

class MCPMetricsCollector {
  private requestCounter: Counter<string>;
  private responseTimeHistogram: Histogram<string>;
  private activeConnectionsGauge: Gauge<string>;
  private errorCounter: Counter<string>;

  constructor() {
    // 请求计数器
    this.requestCounter = new Counter({
      name: 'mcp_requests_total',
      help: 'Total number of MCP requests',
      labelNames: ['method', 'status']
    });

    // 响应时间直方图
    this.responseTimeHistogram = new Histogram({
      name: 'mcp_request_duration_seconds',
      help: 'Duration of MCP requests in seconds',
      labelNames: ['method'],
      buckets: [0.1, 0.5, 1, 2, 5, 10]
    });

    // 活跃连接数
    this.activeConnectionsGauge = new Gauge({
      name: 'mcp_active_connections',
      help: 'Number of active MCP connections'
    });

    // 错误计数器
    this.errorCounter = new Counter({
      name: 'mcp_errors_total',
      help: 'Total number of MCP errors',
      labelNames: ['type', 'method']
    });

    register.registerMetric(this.requestCounter);
    register.registerMetric(this.responseTimeHistogram);
    register.registerMetric(this.activeConnectionsGauge);
    register.registerMetric(this.errorCounter);
  }

  recordRequest(method: string, status: string): void {
    this.requestCounter.inc({ method, status });
  }

  recordResponseTime(method: string, duration: number): void {
    this.responseTimeHistogram.observe({ method }, duration);
  }

  setActiveConnections(count: number): void {
    this.activeConnectionsGauge.set(count);
  }

  recordError(type: string, method: string): void {
    this.errorCounter.inc({ type, method });
  }

  getMetrics(): string {
    return register.metrics();
  }
}

// 监控中间件
class MonitoringMiddleware {
  private metricsCollector: MCPMetricsCollector;

  constructor(metricsCollector: MCPMetricsCollector) {
    this.metricsCollector = metricsCollector;
  }

  wrapHandler(method: string, handler: Function): Function {
    return async (...args: any[]) => {
      const startTime = Date.now();
      
      try {
        const result = await handler.apply(this, args);
        const duration = (Date.now() - startTime) / 1000;
        
        this.metricsCollector.recordRequest(method, 'success');
        this.metricsCollector.recordResponseTime(method, duration);
        
        return result;
      } catch (error) {
        const duration = (Date.now() - startTime) / 1000;
        
        this.metricsCollector.recordRequest(method, 'error');
        this.metricsCollector.recordResponseTime(method, duration);
        this.metricsCollector.recordError(error.constructor.name, method);
        
        throw error;
      }
    };
  }
}
```

### 4.2 健康检查
```typescript
// 健康检查系统
interface HealthCheck {
  name: string;
  check(): Promise<HealthCheckResult>;
}

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

class DatabaseHealthCheck implements HealthCheck {
  name = 'database';
  
  constructor(private dbAdapter: DatabaseAdapter) {}

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      await this.dbAdapter.query('SELECT 1', []);
      
      return {
        status: 'healthy',
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        duration: Date.now() - startTime
      };
    }
  }
}

class RedisHealthCheck implements HealthCheck {
  name = 'redis';
  
  constructor(private redisClient: any) {}

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      await this.redisClient.ping();
      
      return {
        status: 'healthy',
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        duration: Date.now() - startTime
      };
    }
  }
}

class HealthCheckManager {
  private checks: Map<string, HealthCheck> = new Map();

  addCheck(check: HealthCheck): void {
    this.checks.set(check.name, check);
  }

  async runAllChecks(): Promise<{ status: string; checks: Record<string, HealthCheckResult> }> {
    const results: Record<string, HealthCheckResult> = {};
    let overallStatus = 'healthy';

    await Promise.all(
      Array.from(this.checks.entries()).map(async ([name, check]) => {
        try {
          results[name] = await check.check();
          
          if (results[name].status === 'unhealthy') {
            overallStatus = 'unhealthy';
          } else if (results[name].status === 'degraded' && overallStatus === 'healthy') {
            overallStatus = 'degraded';
          }
        } catch (error) {
          results[name] = {
            status: 'unhealthy',
            message: error.message
          };
          overallStatus = 'unhealthy';
        }
      })
    );

    return { status: overallStatus, checks: results };
  }

  async runCheck(checkName: string): Promise<HealthCheckResult> {
    const check = this.checks.get(checkName);
    if (!check) {
      throw new Error(`Health check not found: ${checkName}`);
    }

    return await check.check();
  }
}

// 健康检查端点
class HealthCheckEndpoint {
  constructor(private healthManager: HealthCheckManager) {}

  async handleHealthCheck(req: any, res: any): Promise<void> {
    try {
      const result = await this.healthManager.runAllChecks();
      const statusCode = result.status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json({
        status: result.status,
        timestamp: new Date().toISOString(),
        checks: result.checks
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async handleReadinessCheck(req: any, res: any): Promise<void> {
    // 更严格的就绪检查
    const result = await this.healthManager.runAllChecks();
    
    if (result.status === 'healthy') {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready', details: result.checks });
    }
  }
}
```

### 4.3 告警系统
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mcp-server'
    static_configs:
      - targets: ['mcp-server:3000']
    scrape_interval: 5s
    metrics_path: /metrics

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

---
# monitoring/alert_rules.yml
groups:
  - name: mcp-server
    rules:
      - alert: MCPServerDown
        expr: up{job="mcp-server"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "MCP Server is down"
          description: "MCP Server has been down for more than 1 minute"

      - alert: HighErrorRate
        expr: rate(mcp_errors_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 10% for 2 minutes"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(mcp_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time"
          description: "95th percentile response time is above 2 seconds"

      - alert: HighMemoryUsage
        expr: (process_resident_memory_bytes / 1024 / 1024) > 512
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 512MB for 10 minutes"
```

## 5. CI/CD流水线

### 5.1 GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint code
      run: npm run lint
    
    - name: Run unit tests
      run: npm run test:coverage
      env:
        DATABASE_URL: postgres://postgres:postgres@localhost:5432/test
        REDIS_URL: redis://localhost:6379
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgres://postgres:postgres@localhost:5432/test
        REDIS_URL: redis://localhost:6379
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        fail_ci_if_error: true

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run security audit
      run: npm audit --audit-level moderate
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    outputs:
      image: ${{ steps.image.outputs.image }}
      digest: ${{ steps.build.outputs.digest }}
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build:prod
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
    
    - name: Build and push Docker image
      id: build
      uses: docker/build-push-action@v5
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Output image
      id: image
      run: |
        echo "image=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}" >> $GITHUB_OUTPUT

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - name: Deploy to staging
      run: |
        echo "Deploying ${{ needs.build.outputs.image }} to staging"
        # 这里添加实际的部署逻辑

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Deploy to production
      run: |
        echo "Deploying ${{ needs.build.outputs.image }} to production"
        # 这里添加实际的部署逻辑
```

### 5.2 部署脚本
```bash
#!/bin/bash
# scripts/deploy.sh

set -euo pipefail

ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}
NAMESPACE="mcp-server-${ENVIRONMENT}"

echo "Deploying MCP Server to ${ENVIRONMENT}"
echo "Image tag: ${IMAGE_TAG}"

# 检查kubectl连接
kubectl cluster-info

# 创建命名空间（如果不存在）
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# 更新部署镜像
kubectl set image deployment/mcp-server mcp-server=${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} -n ${NAMESPACE}

# 等待部署完成
kubectl rollout status deployment/mcp-server -n ${NAMESPACE} --timeout=300s

# 运行健康检查
echo "Running health check..."
sleep 30
kubectl get pods -n ${NAMESPACE}

# 验证部署
HEALTH_URL="http://$(kubectl get svc mcp-server-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')/health"
curl -f ${HEALTH_URL} || {
  echo "Health check failed, rolling back"
  kubectl rollout undo deployment/mcp-server -n ${NAMESPACE}
  exit 1
}

echo "Deployment successful!"
```

## 6. 最佳实践

### 6.1 测试策略
1. **测试金字塔** - 大量单元测试，适量集成测试，少量端到端测试
2. **测试覆盖率** - 保持80%以上的代码覆盖率
3. **测试数据管理** - 使用工厂模式和假数据生成
4. **测试隔离** - 每个测试独立，无外部依赖
5. **持续测试** - 集成到CI/CD流水线

### 6.2 部署策略
1. **蓝绿部署** - 零停机时间部署
2. **滚动更新** - 渐进式替换实例
3. **金丝雀发布** - 小流量验证新版本
4. **回滚机制** - 快速回滚到稳定版本
5. **环境一致性** - 开发、测试、生产环境保持一致

### 6.3 运维监控
1. **监控指标** - 应用指标、基础设施指标、业务指标
2. **日志聚合** - 集中式日志收集和分析
3. **告警策略** - 分级告警，避免告警疲劳
4. **故障恢复** - 自动故障检测和恢复
5. **容量规划** - 基于监控数据进行容量规划

## 小结

通过本章学习，我们掌握了：
- 完整的测试体系构建方法
- 现代化的构建和打包流程
- 容器化部署和Kubernetes编排
- 全面的监控告警系统
- 自动化的CI/CD流水线

这些技能确保了MCP Server能够在生产环境中稳定、安全、高效地运行，为业务提供可靠的服务支撑。