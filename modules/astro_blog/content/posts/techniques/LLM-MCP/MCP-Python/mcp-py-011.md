---
title: "第11章：实战项目开发"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第11章：实战项目开发

## 学习目标
1. 开发文件系统管理MCP Server
2. 创建数据库操作MCP Server
3. 实现API网关和代理Server
4. 构建内容管理和搜索Server
5. 开发自定义业务逻辑Server

## 1. 项目1：文件系统管理Server

### 1.1 项目需求分析
```typescript
interface FileManagerRequirements {
  // 工具功能
  tools: {
    listFiles: "列出目录内容";
    readFile: "读取文件内容";
    writeFile: "写入文件内容";
    createDirectory: "创建目录";
    deleteFile: "删除文件";
    moveFile: "移动文件";
    copyFile: "复制文件";
    searchFiles: "搜索文件";
    getFileInfo: "获取文件信息";
    compressFiles: "压缩文件";
    extractArchive: "解压文件";
  };
  
  // 资源功能
  resources: {
    fileContent: "文件内容资源";
    directoryTree: "目录树资源";
    fileMetadata: "文件元数据资源";
  };
  
  // 安全要求
  security: {
    sandboxing: "文件访问沙盒限制";
    permissions: "文件操作权限控制";
    validation: "路径和内容验证";
  };
}
```

### 1.2 核心架构实现
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as fs from 'fs/promises';
import * as path from 'path';
import * as mime from 'mime-types';
import { z } from 'zod';

interface FileManagerConfig {
  baseDirectory: string;
  maxFileSize: number;
  allowedExtensions: string[];
  forbiddenPaths: string[];
  enableCompression: boolean;
}

class FileSystemManager {
  private config: FileManagerConfig;
  private basePath: string;

  constructor(config: FileManagerConfig) {
    this.config = config;
    this.basePath = path.resolve(config.baseDirectory);
    this.validateBasePath();
  }

  private validateBasePath(): void {
    if (!fs.stat(this.basePath).catch(() => false)) {
      throw new Error(`Base directory does not exist: ${this.basePath}`);
    }
  }

  private validatePath(filePath: string): string {
    const resolvedPath = path.resolve(this.basePath, filePath);
    
    // 确保路径在沙盒内
    if (!resolvedPath.startsWith(this.basePath)) {
      throw new Error("Path is outside of allowed directory");
    }

    // 检查禁用路径
    const relativePath = path.relative(this.basePath, resolvedPath);
    for (const forbidden of this.config.forbiddenPaths) {
      if (relativePath.startsWith(forbidden)) {
        throw new Error(`Access to path is forbidden: ${relativePath}`);
      }
    }

    return resolvedPath;
  }

  private validateFileExtension(fileName: string): void {
    if (this.config.allowedExtensions.length === 0) return;
    
    const ext = path.extname(fileName).toLowerCase();
    if (!this.config.allowedExtensions.includes(ext)) {
      throw new Error(`File extension not allowed: ${ext}`);
    }
  }

  async listFiles(directoryPath: string = '.'): Promise<FileInfo[]> {
    const fullPath = this.validatePath(directoryPath);
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    
    const fileInfos = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(fullPath, entry.name);
        const stats = await fs.stat(entryPath);
        
        return {
          name: entry.name,
          path: path.relative(this.basePath, entryPath),
          type: entry.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modified: stats.mtime,
          permissions: this.getPermissions(stats),
          mimeType: entry.isFile() ? mime.lookup(entry.name) || 'application/octet-stream' : null
        } as FileInfo;
      })
    );

    return fileInfos.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  async readFile(filePath: string, encoding: string = 'utf8'): Promise<string | Buffer> {
    const fullPath = this.validatePath(filePath);
    this.validateFileExtension(filePath);
    
    const stats = await fs.stat(fullPath);
    if (stats.size > this.config.maxFileSize) {
      throw new Error(`File too large: ${stats.size} bytes (max: ${this.config.maxFileSize})`);
    }

    if (encoding === 'binary') {
      return await fs.readFile(fullPath);
    } else {
      return await fs.readFile(fullPath, encoding as BufferEncoding);
    }
  }

  async writeFile(filePath: string, content: string | Buffer, options?: WriteOptions): Promise<void> {
    const fullPath = this.validatePath(filePath);
    this.validateFileExtension(filePath);

    // 检查内容大小
    const contentSize = typeof content === 'string' ? Buffer.byteLength(content) : content.length;
    if (contentSize > this.config.maxFileSize) {
      throw new Error(`Content too large: ${contentSize} bytes (max: ${this.config.maxFileSize})`);
    }

    // 确保目录存在
    const directory = path.dirname(fullPath);
    await fs.mkdir(directory, { recursive: true });

    const writeOptions: any = {
      encoding: options?.encoding || 'utf8',
      mode: options?.mode || 0o644
    };

    if (options?.backup && await this.fileExists(fullPath)) {
      await this.createBackup(fullPath);
    }

    await fs.writeFile(fullPath, content, writeOptions);
  }

  async createDirectory(dirPath: string, recursive: boolean = true): Promise<void> {
    const fullPath = this.validatePath(dirPath);
    await fs.mkdir(fullPath, { recursive });
  }

  async deleteFile(filePath: string, force: boolean = false): Promise<void> {
    const fullPath = this.validatePath(filePath);
    const stats = await fs.stat(fullPath);

    if (!force && stats.isDirectory()) {
      const entries = await fs.readdir(fullPath);
      if (entries.length > 0) {
        throw new Error("Directory is not empty. Use force=true to delete recursively.");
      }
    }

    if (stats.isDirectory()) {
      await fs.rmdir(fullPath, { recursive: force });
    } else {
      await fs.unlink(fullPath);
    }
  }

  async moveFile(sourcePath: string, targetPath: string): Promise<void> {
    const fullSourcePath = this.validatePath(sourcePath);
    const fullTargetPath = this.validatePath(targetPath);

    // 确保目标目录存在
    const targetDir = path.dirname(fullTargetPath);
    await fs.mkdir(targetDir, { recursive: true });

    await fs.rename(fullSourcePath, fullTargetPath);
  }

  async copyFile(sourcePath: string, targetPath: string, overwrite: boolean = false): Promise<void> {
    const fullSourcePath = this.validatePath(sourcePath);
    const fullTargetPath = this.validatePath(targetPath);

    if (!overwrite && await this.fileExists(fullTargetPath)) {
      throw new Error("Target file already exists. Use overwrite=true to replace.");
    }

    // 确保目标目录存在
    const targetDir = path.dirname(fullTargetPath);
    await fs.mkdir(targetDir, { recursive: true });

    await fs.copyFile(fullSourcePath, fullTargetPath);
  }

  async searchFiles(pattern: string, directory: string = '.', options?: SearchOptions): Promise<FileInfo[]> {
    const fullPath = this.validatePath(directory);
    const results: FileInfo[] = [];
    
    await this.searchRecursive(fullPath, pattern, results, options);
    return results;
  }

  private async searchRecursive(
    dirPath: string, 
    pattern: string, 
    results: FileInfo[], 
    options?: SearchOptions
  ): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(this.basePath, entryPath);

      if (entry.isDirectory() && (options?.recursive !== false)) {
        await this.searchRecursive(entryPath, pattern, results, options);
      } else if (entry.isFile()) {
        const matches = options?.useRegex ? 
          new RegExp(pattern, options.caseSensitive ? '' : 'i').test(entry.name) :
          entry.name.toLowerCase().includes(pattern.toLowerCase());

        if (matches) {
          const stats = await fs.stat(entryPath);
          results.push({
            name: entry.name,
            path: relativePath,
            type: 'file',
            size: stats.size,
            modified: stats.mtime,
            permissions: this.getPermissions(stats),
            mimeType: mime.lookup(entry.name) || 'application/octet-stream'
          });
        }
      }
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async createBackup(filePath: string): Promise<void> {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    await fs.copyFile(filePath, backupPath);
  }

  private getPermissions(stats: any): string {
    const mode = stats.mode;
    return {
      readable: !!(mode & 0o444),
      writable: !!(mode & 0o222),
      executable: !!(mode & 0o111)
    };
  }
}

interface FileInfo {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: Date;
  permissions: any;
  mimeType: string | null;
}

interface WriteOptions {
  encoding?: string;
  mode?: number;
  backup?: boolean;
}

interface SearchOptions {
  recursive?: boolean;
  useRegex?: boolean;
  caseSensitive?: boolean;
}
```

### 1.3 MCP Server集成
```typescript
class FileSystemMCPServer {
  private server: Server;
  private fileManager: FileSystemManager;

  constructor(config: FileManagerConfig) {
    this.fileManager = new FileSystemManager(config);
    
    this.server = new Server(
      {
        name: "filesystem-manager",
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

    this.setupTools();
    this.setupResources();
  }

  private setupTools(): void {
    // 列出文件工具
    this.server.setRequestHandler("tools/list", async () => ({
      tools: [
        {
          name: "list_files",
          description: "List files and directories in a given path",
          inputSchema: {
            type: "object",
            properties: {
              path: { type: "string", description: "Directory path to list" }
            }
          }
        },
        {
          name: "read_file",
          description: "Read the contents of a file",
          inputSchema: {
            type: "object",
            properties: {
              path: { type: "string", description: "File path to read" },
              encoding: { type: "string", description: "File encoding", default: "utf8" }
            },
            required: ["path"]
          }
        },
        {
          name: "write_file",
          description: "Write content to a file",
          inputSchema: {
            type: "object",
            properties: {
              path: { type: "string", description: "File path to write" },
              content: { type: "string", description: "Content to write" },
              encoding: { type: "string", description: "File encoding", default: "utf8" },
              backup: { type: "boolean", description: "Create backup before writing", default: false }
            },
            required: ["path", "content"]
          }
        },
        {
          name: "search_files",
          description: "Search for files matching a pattern",
          inputSchema: {
            type: "object",
            properties: {
              pattern: { type: "string", description: "Search pattern" },
              directory: { type: "string", description: "Directory to search in", default: "." },
              recursive: { type: "boolean", description: "Search recursively", default: true },
              useRegex: { type: "boolean", description: "Use regular expressions", default: false }
            },
            required: ["pattern"]
          }
        }
      ]
    }));

    // 工具调用处理
    this.server.setRequestHandler("tools/call", async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "list_files":
          const files = await this.fileManager.listFiles(args.path);
          return {
            content: [{
              type: "text",
              text: JSON.stringify(files, null, 2)
            }]
          };

        case "read_file":
          const content = await this.fileManager.readFile(args.path, args.encoding);
          return {
            content: [{
              type: "text",
              text: typeof content === 'string' ? content : content.toString('base64')
            }]
          };

        case "write_file":
          await this.fileManager.writeFile(args.path, args.content, {
            encoding: args.encoding,
            backup: args.backup
          });
          return {
            content: [{
              type: "text",
              text: `File written successfully: ${args.path}`
            }]
          };

        case "search_files":
          const results = await this.fileManager.searchFiles(args.pattern, args.directory, {
            recursive: args.recursive,
            useRegex: args.useRegex
          });
          return {
            content: [{
              type: "text",
              text: JSON.stringify(results, null, 2)
            }]
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private setupResources(): void {
    this.server.setRequestHandler("resources/list", async () => ({
      resources: [
        {
          uri: "file://tree",
          name: "Directory Tree",
          description: "Complete directory tree structure",
          mimeType: "application/json"
        }
      ]
    }));

    this.server.setRequestHandler("resources/read", async (request) => {
      const { uri } = request.params;

      if (uri === "file://tree") {
        const tree = await this.buildDirectoryTree('.');
        return {
          contents: [{
            uri,
            mimeType: "application/json",
            text: JSON.stringify(tree, null, 2)
          }]
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  private async buildDirectoryTree(dirPath: string): Promise<any> {
    const files = await this.fileManager.listFiles(dirPath);
    const tree: any = { name: path.basename(dirPath) || 'root', type: 'directory', children: [] };

    for (const file of files) {
      if (file.type === 'directory') {
        const subtree = await this.buildDirectoryTree(file.path);
        tree.children.push(subtree);
      } else {
        tree.children.push({
          name: file.name,
          type: 'file',
          size: file.size,
          mimeType: file.mimeType
        });
      }
    }

    return tree;
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("File System MCP Server running");
  }
}

// 启动服务器
const config: FileManagerConfig = {
  baseDirectory: process.env.FS_BASE_DIR || './sandbox',
  maxFileSize: parseInt(process.env.FS_MAX_FILE_SIZE || '10485760'), // 10MB
  allowedExtensions: process.env.FS_ALLOWED_EXT?.split(',') || [],
  forbiddenPaths: process.env.FS_FORBIDDEN_PATHS?.split(',') || ['.git', 'node_modules'],
  enableCompression: process.env.FS_ENABLE_COMPRESSION === 'true'
};

const server = new FileSystemMCPServer(config);
server.start().catch(console.error);
```

## 2. 项目2：数据库操作Server

### 2.1 数据库抽象层
```typescript
interface DatabaseConfig {
  type: 'sqlite' | 'mysql' | 'postgresql';
  connection: {
    host?: string;
    port?: number;
    database: string;
    username?: string;
    password?: string;
    filename?: string; // for SQLite
  };
  pool?: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
  };
}

interface QueryResult {
  rows: any[];
  rowCount: number;
  fields: FieldInfo[];
  query: string;
  duration: number;
}

interface FieldInfo {
  name: string;
  type: string;
  nullable: boolean;
}

abstract class DatabaseAdapter {
  protected config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract query(sql: string, params?: any[]): Promise<QueryResult>;
  abstract getSchema(): Promise<SchemaInfo>;
  abstract beginTransaction(): Promise<Transaction>;
}

interface SchemaInfo {
  tables: TableInfo[];
}

interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  constraints: ConstraintInfo[];
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: any;
  isPrimaryKey: boolean;
}

interface IndexInfo {
  name: string;
  columns: string[];
  unique: boolean;
}

interface ConstraintInfo {
  name: string;
  type: 'primary_key' | 'foreign_key' | 'unique' | 'check';
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
}

interface Transaction {
  query(sql: string, params?: any[]): Promise<QueryResult>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
```

### 2.2 SQLite适配器实现
```typescript
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

class SQLiteAdapter extends DatabaseAdapter {
  private db: Database | null = null;

  async connect(): Promise<void> {
    this.db = await open({
      filename: this.config.connection.filename || ':memory:',
      driver: sqlite3.Database
    });
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  async query(sql: string, params: any[] = []): Promise<QueryResult> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const startTime = Date.now();
    
    try {
      // 检查是否是SELECT查询
      const isSelect = sql.trim().toLowerCase().startsWith('select');
      
      if (isSelect) {
        const rows = await this.db.all(sql, params);
        const duration = Date.now() - startTime;
        
        // 获取字段信息
        const fields = rows.length > 0 ? 
          Object.keys(rows[0]).map(name => ({
            name,
            type: this.getColumnType(rows[0][name]),
            nullable: true // SQLite doesn't provide this info easily
          })) : [];

        return {
          rows,
          rowCount: rows.length,
          fields,
          query: sql,
          duration
        };
      } else {
        const result = await this.db.run(sql, params);
        const duration = Date.now() - startTime;
        
        return {
          rows: [],
          rowCount: result.changes || 0,
          fields: [],
          query: sql,
          duration
        };
      }
    } catch (error) {
      throw new Error(`Query failed: ${error.message}\nSQL: ${sql}`);
    }
  }

  async getSchema(): Promise<SchemaInfo> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const tables = await this.db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    const schemaInfo: SchemaInfo = { tables: [] };

    for (const table of tables) {
      const tableInfo = await this.getTableInfo(table.name);
      schemaInfo.tables.push(tableInfo);
    }

    return schemaInfo;
  }

  private async getTableInfo(tableName: string): Promise<TableInfo> {
    const columns = await this.db!.all(`PRAGMA table_info(${tableName})`);
    const indexes = await this.db!.all(`PRAGMA index_list(${tableName})`);

    const tableInfo: TableInfo = {
      name: tableName,
      columns: columns.map(col => ({
        name: col.name,
        type: col.type,
        nullable: !col.notnull,
        defaultValue: col.dflt_value,
        isPrimaryKey: !!col.pk
      })),
      indexes: [],
      constraints: []
    };

    // 获取索引信息
    for (const index of indexes) {
      const indexColumns = await this.db!.all(`PRAGMA index_info(${index.name})`);
      tableInfo.indexes.push({
        name: index.name,
        columns: indexColumns.map(col => col.name),
        unique: !!index.unique
      });
    }

    return tableInfo;
  }

  async beginTransaction(): Promise<Transaction> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    await this.db.exec('BEGIN TRANSACTION');
    
    return new SQLiteTransaction(this.db);
  }

  private getColumnType(value: any): string {
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'INTEGER' : 'REAL';
    }
    if (typeof value === 'string') return 'TEXT';
    if (typeof value === 'boolean') return 'BOOLEAN';
    if (value instanceof Date) return 'DATETIME';
    if (value === null) return 'NULL';
    return 'BLOB';
  }
}

class SQLiteTransaction implements Transaction {
  constructor(private db: Database) {}

  async query(sql: string, params: any[] = []): Promise<QueryResult> {
    const startTime = Date.now();
    
    const isSelect = sql.trim().toLowerCase().startsWith('select');
    
    if (isSelect) {
      const rows = await this.db.all(sql, params);
      return {
        rows,
        rowCount: rows.length,
        fields: [],
        query: sql,
        duration: Date.now() - startTime
      };
    } else {
      const result = await this.db.run(sql, params);
      return {
        rows: [],
        rowCount: result.changes || 0,
        fields: [],
        query: sql,
        duration: Date.now() - startTime
      };
    }
  }

  async commit(): Promise<void> {
    await this.db.exec('COMMIT');
  }

  async rollback(): Promise<void> {
    await this.db.exec('ROLLBACK');
  }
}
```

### 2.3 数据库MCP Server
```typescript
class DatabaseMCPServer {
  private server: Server;
  private dbAdapter: DatabaseAdapter;
  private queryValidator: QueryValidator;

  constructor(config: DatabaseConfig) {
    this.dbAdapter = this.createAdapter(config);
    this.queryValidator = new QueryValidator();
    
    this.server = new Server(
      {
        name: "database-manager",
        version: "1.0.0"
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        }
      }
    );

    this.setupTools();
    this.setupResources();
  }

  private createAdapter(config: DatabaseConfig): DatabaseAdapter {
    switch (config.type) {
      case 'sqlite':
        return new SQLiteAdapter(config);
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }

  private setupTools(): void {
    this.server.setRequestHandler("tools/list", async () => ({
      tools: [
        {
          name: "execute_query",
          description: "Execute a SQL query",
          inputSchema: {
            type: "object",
            properties: {
              sql: { type: "string", description: "SQL query to execute" },
              params: { 
                type: "array", 
                items: { type: "string" },
                description: "Parameters for prepared statement" 
              }
            },
            required: ["sql"]
          }
        },
        {
          name: "get_schema",
          description: "Get database schema information",
          inputSchema: {
            type: "object",
            properties: {
              table: { type: "string", description: "Specific table name (optional)" }
            }
          }
        },
        {
          name: "execute_transaction",
          description: "Execute multiple queries in a transaction",
          inputSchema: {
            type: "object",
            properties: {
              queries: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    sql: { type: "string" },
                    params: { type: "array", items: { type: "string" } }
                  }
                },
                description: "Array of queries to execute"
              }
            },
            required: ["queries"]
          }
        }
      ]
    }));

    this.server.setRequestHandler("tools/call", async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "execute_query":
          return await this.executeQuery(args.sql, args.params);

        case "get_schema":
          return await this.getSchemaInfo(args.table);

        case "execute_transaction":
          return await this.executeTransaction(args.queries);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async executeQuery(sql: string, params: any[] = []): Promise<any> {
    // 验证查询
    const validation = this.queryValidator.validate(sql);
    if (!validation.safe) {
      throw new Error(`Unsafe query detected: ${validation.reason}`);
    }

    try {
      const result = await this.dbAdapter.query(sql, params);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            query: result.query,
            rowCount: result.rowCount,
            duration: `${result.duration}ms`,
            data: result.rows.slice(0, 100) // 限制返回行数
          }, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  private async getSchemaInfo(tableName?: string): Promise<any> {
    const schema = await this.dbAdapter.getSchema();
    
    if (tableName) {
      const table = schema.tables.find(t => t.name === tableName);
      if (!table) {
        throw new Error(`Table not found: ${tableName}`);
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(table, null, 2)
        }]
      };
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify(schema, null, 2)
      }]
    };
  }

  private async executeTransaction(queries: Array<{sql: string, params?: any[]}>): Promise<any> {
    const transaction = await this.dbAdapter.beginTransaction();
    const results: any[] = [];

    try {
      for (const queryInfo of queries) {
        const validation = this.queryValidator.validate(queryInfo.sql);
        if (!validation.safe) {
          throw new Error(`Unsafe query in transaction: ${validation.reason}`);
        }

        const result = await transaction.query(queryInfo.sql, queryInfo.params);
        results.push({
          query: result.query,
          rowCount: result.rowCount,
          duration: result.duration
        });
      }

      await transaction.commit();
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "committed",
            results
          }, null, 2)
        }]
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  private setupResources(): void {
    this.server.setRequestHandler("resources/list", async () => ({
      resources: [
        {
          uri: "db://schema",
          name: "Database Schema",
          description: "Complete database schema",
          mimeType: "application/json"
        },
        {
          uri: "db://tables",
          name: "Table List",
          description: "List of all tables",
          mimeType: "application/json"
        }
      ]
    }));

    this.server.setRequestHandler("resources/read", async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case "db://schema":
          const schema = await this.dbAdapter.getSchema();
          return {
            contents: [{
              uri,
              mimeType: "application/json",
              text: JSON.stringify(schema, null, 2)
            }]
          };

        case "db://tables":
          const tables = (await this.dbAdapter.getSchema()).tables.map(t => ({
            name: t.name,
            columns: t.columns.length,
            indexes: t.indexes.length
          }));
          return {
            contents: [{
              uri,
              mimeType: "application/json", 
              text: JSON.stringify(tables, null, 2)
            }]
          };

        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });
  }

  async start(): Promise<void> {
    await this.dbAdapter.connect();
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Database MCP Server running");
  }

  async stop(): Promise<void> {
    await this.dbAdapter.disconnect();
  }
}

class QueryValidator {
  private dangerousKeywords = [
    'drop', 'truncate', 'delete', 'alter', 'create', 'grant', 'revoke'
  ];

  validate(sql: string): { safe: boolean; reason?: string } {
    const normalizedSql = sql.toLowerCase().trim();

    // 检查危险关键字
    for (const keyword of this.dangerousKeywords) {
      if (normalizedSql.includes(keyword)) {
        return { 
          safe: false, 
          reason: `Contains potentially dangerous keyword: ${keyword}` 
        };
      }
    }

    // 检查注释注入
    if (normalizedSql.includes('--') || normalizedSql.includes('/*')) {
      return { 
        safe: false, 
        reason: "SQL comments not allowed" 
      };
    }

    // 检查多语句
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    if (statements.length > 1) {
      return { 
        safe: false, 
        reason: "Multiple statements not allowed" 
      };
    }

    return { safe: true };
  }
}
```

## 3. 项目3：API网关代理Server

### 3.1 API网关核心架构
```typescript
interface APIConfig {
  name: string;
  baseURL: string;
  authentication: {
    type: 'none' | 'api_key' | 'bearer' | 'basic';
    credentials?: {
      apiKey?: string;
      token?: string;
      username?: string;
      password?: string;
    };
  };
  rateLimit: {
    requestsPerMinute: number;
    burstLimit: number;
  };
  timeout: number;
  retries: number;
  endpoints: APIEndpoint[];
}

interface APIEndpoint {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: APIParameter[];
  responseSchema?: any;
  cached?: boolean;
  cacheTTL?: number;
}

interface APIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  location: 'query' | 'path' | 'header' | 'body';
  required: boolean;
  description: string;
  defaultValue?: any;
}

class APIGateway {
  private config: APIConfig;
  private rateLimiter: RateLimiter;
  private cache: Map<string, CachedResponse> = new Map();
  private metrics = {
    requests: 0,
    errors: 0,
    cacheHits: 0,
    totalResponseTime: 0
  };

  constructor(config: APIConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter(
      config.rateLimit.requestsPerMinute,
      config.rateLimit.burstLimit
    );

    // 定期清理缓存
    setInterval(() => this.cleanupCache(), 60000);
  }

  async callEndpoint(
    endpointName: string, 
    parameters: Record<string, any> = {}
  ): Promise<APIResponse> {
    const endpoint = this.config.endpoints.find(ep => ep.name === endpointName);
    if (!endpoint) {
      throw new Error(`Endpoint not found: ${endpointName}`);
    }

    // 速率限制检查
    if (!this.rateLimiter.allowRequest()) {
      throw new Error("Rate limit exceeded");
    }

    // 缓存检查
    const cacheKey = this.generateCacheKey(endpoint, parameters);
    if (endpoint.cached) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > new Date()) {
        this.metrics.cacheHits++;
        return cached.response;
      }
    }

    const startTime = Date.now();
    this.metrics.requests++;

    try {
      const request = this.buildRequest(endpoint, parameters);
      const response = await this.executeRequest(request);

      // 缓存响应
      if (endpoint.cached && endpoint.cacheTTL) {
        this.cache.set(cacheKey, {
          response,
          expiresAt: new Date(Date.now() + endpoint.cacheTTL * 1000)
        });
      }

      this.metrics.totalResponseTime += Date.now() - startTime;
      return response;

    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  private buildRequest(endpoint: APIEndpoint, parameters: Record<string, any>): APIRequest {
    // 验证参数
    this.validateParameters(endpoint, parameters);

    let url = this.config.baseURL + endpoint.path;
    const headers: Record<string, string> = {};
    const queryParams: Record<string, string> = {};
    let body: any = undefined;

    // 处理认证
    this.addAuthentication(headers);

    // 处理参数
    for (const param of endpoint.parameters) {
      const value = parameters[param.name] || param.defaultValue;
      
      if (param.required && value === undefined) {
        throw new Error(`Required parameter missing: ${param.name}`);
      }

      if (value === undefined) continue;

      switch (param.location) {
        case 'path':
          url = url.replace(`{${param.name}}`, String(value));
          break;
        case 'query':
          queryParams[param.name] = String(value);
          break;
        case 'header':
          headers[param.name] = String(value);
          break;
        case 'body':
          if (!body) body = {};
          body[param.name] = value;
          break;
      }
    }

    // 添加查询参数到URL
    if (Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams(queryParams);
      url += '?' + searchParams.toString();
    }

    return {
      url,
      method: endpoint.method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      timeout: this.config.timeout
    };
  }

  private async executeRequest(request: APIRequest): Promise<APIResponse> {
    const fetch = require('node-fetch');
    const AbortController = require('abort-controller');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), request.timeout);

    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      let responseData: any;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        success: response.ok
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${request.timeout}ms`);
      }
      
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  private addAuthentication(headers: Record<string, string>): void {
    const { authentication } = this.config;

    switch (authentication.type) {
      case 'api_key':
        if (authentication.credentials?.apiKey) {
          headers['X-API-Key'] = authentication.credentials.apiKey;
        }
        break;
      case 'bearer':
        if (authentication.credentials?.token) {
          headers['Authorization'] = `Bearer ${authentication.credentials.token}`;
        }
        break;
      case 'basic':
        if (authentication.credentials?.username && authentication.credentials?.password) {
          const credentials = Buffer.from(
            `${authentication.credentials.username}:${authentication.credentials.password}`
          ).toString('base64');
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;
    }
  }

  private validateParameters(endpoint: APIEndpoint, parameters: Record<string, any>): void {
    for (const param of endpoint.parameters) {
      const value = parameters[param.name];
      
      if (value === undefined && param.required) {
        throw new Error(`Required parameter missing: ${param.name}`);
      }

      if (value !== undefined && !this.validateParameterType(value, param.type)) {
        throw new Error(`Invalid type for parameter ${param.name}: expected ${param.type}`);
      }
    }
  }

  private validateParameterType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  private generateCacheKey(endpoint: APIEndpoint, parameters: Record<string, any>): string {
    const key = `${endpoint.name}:${JSON.stringify(parameters)}`;
    return require('crypto').createHash('md5').update(key).digest('hex');
  }

  private cleanupCache(): void {
    const now = new Date();
    for (const [key, cached] of this.cache) {
      if (cached.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  getMetrics(): any {
    const avgResponseTime = this.metrics.requests > 0 ? 
      this.metrics.totalResponseTime / this.metrics.requests : 0;

    return {
      ...this.metrics,
      averageResponseTime: avgResponseTime,
      cacheHitRate: this.metrics.requests > 0 ? 
        this.metrics.cacheHits / this.metrics.requests : 0
    };
  }
}

interface APIRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timeout: number;
}

interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  success: boolean;
}

interface CachedResponse {
  response: APIResponse;
  expiresAt: Date;
}

class RateLimiter {
  private requests: number[] = [];
  private requestsPerMinute: number;
  private burstLimit: number;

  constructor(requestsPerMinute: number, burstLimit: number) {
    this.requestsPerMinute = requestsPerMinute;
    this.burstLimit = burstLimit;
  }

  allowRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // 清理过期请求
    this.requests = this.requests.filter(time => time > oneMinuteAgo);

    // 检查突发限制
    if (this.requests.length >= this.burstLimit) {
      return false;
    }

    // 检查每分钟限制
    if (this.requests.length >= this.requestsPerMinute) {
      return false;
    }

    this.requests.push(now);
    return true;
  }
}
```

### 3.2 API网关MCP Server
```typescript
class APIGatewayMCPServer {
  private server: Server;
  private gateways: Map<string, APIGateway> = new Map();

  constructor(apiConfigs: APIConfig[]) {
    // 初始化API网关
    for (const config of apiConfigs) {
      this.gateways.set(config.name, new APIGateway(config));
    }

    this.server = new Server(
      {
        name: "api-gateway",
        version: "1.0.0"
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        }
      }
    );

    this.setupTools();
    this.setupResources();
  }

  private setupTools(): void {
    this.server.setRequestHandler("tools/list", async () => {
      const tools: any[] = [];

      // 为每个API端点创建工具
      for (const [apiName, gateway] of this.gateways) {
        const config = (gateway as any).config as APIConfig;
        
        for (const endpoint of config.endpoints) {
          tools.push({
            name: `${apiName}_${endpoint.name}`,
            description: `${endpoint.description} (${config.name})`,
            inputSchema: this.generateInputSchema(endpoint)
          });
        }
      }

      // 添加管理工具
      tools.push(
        {
          name: "get_api_metrics",
          description: "Get API usage metrics",
          inputSchema: {
            type: "object",
            properties: {
              api: { type: "string", description: "API name (optional)" }
            }
          }
        },
        {
          name: "list_apis",
          description: "List all available APIs",
          inputSchema: { type: "object", properties: {} }
        }
      );

      return { tools };
    });

    this.server.setRequestHandler("tools/call", async (request) => {
      const { name, arguments: args } = request.params;

      // 处理管理工具
      if (name === "get_api_metrics") {
        return this.getMetrics(args.api);
      }

      if (name === "list_apis") {
        return this.listAPIs();
      }

      // 处理API调用
      const [apiName, endpointName] = name.split('_', 2);
      const gateway = this.gateways.get(apiName);
      
      if (!gateway) {
        throw new Error(`API not found: ${apiName}`);
      }

      try {
        const response = await gateway.callEndpoint(endpointName, args);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: response.status,
              success: response.success,
              data: response.data
            }, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`API call failed: ${error.message}`);
      }
    });
  }

  private generateInputSchema(endpoint: APIEndpoint): any {
    const properties: any = {};
    const required: string[] = [];

    for (const param of endpoint.parameters) {
      properties[param.name] = {
        type: param.type,
        description: param.description
      };

      if (param.defaultValue !== undefined) {
        properties[param.name].default = param.defaultValue;
      }

      if (param.required) {
        required.push(param.name);
      }
    }

    return {
      type: "object",
      properties,
      required
    };
  }

  private async getMetrics(apiName?: string): Promise<any> {
    if (apiName) {
      const gateway = this.gateways.get(apiName);
      if (!gateway) {
        throw new Error(`API not found: ${apiName}`);
      }

      const metrics = gateway.getMetrics();
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ [apiName]: metrics }, null, 2)
        }]
      };
    } else {
      const allMetrics: any = {};
      for (const [name, gateway] of this.gateways) {
        allMetrics[name] = gateway.getMetrics();
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify(allMetrics, null, 2)
        }]
      };
    }
  }

  private async listAPIs(): Promise<any> {
    const apis: any[] = [];

    for (const [name, gateway] of this.gateways) {
      const config = (gateway as any).config as APIConfig;
      apis.push({
        name: config.name,
        baseURL: config.baseURL,
        endpoints: config.endpoints.length,
        authentication: config.authentication.type
      });
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify(apis, null, 2)
      }]
    };
  }

  private setupResources(): void {
    this.server.setRequestHandler("resources/list", async () => ({
      resources: [
        {
          uri: "gateway://apis",
          name: "API Configuration",
          description: "List of all configured APIs",
          mimeType: "application/json"
        },
        {
          uri: "gateway://metrics",
          name: "Gateway Metrics",
          description: "Performance and usage metrics",
          mimeType: "application/json"
        }
      ]
    }));

    this.server.setRequestHandler("resources/read", async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case "gateway://apis":
          const apis = await this.listAPIs();
          return {
            contents: [{
              uri,
              mimeType: "application/json",
              text: apis.content[0].text
            }]
          };

        case "gateway://metrics":
          const metrics = await this.getMetrics();
          return {
            contents: [{
              uri,
              mimeType: "application/json",
              text: metrics.content[0].text
            }]
          };

        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("API Gateway MCP Server running");
  }
}

// 配置示例
const apiConfigs: APIConfig[] = [
  {
    name: "jsonplaceholder",
    baseURL: "https://jsonplaceholder.typicode.com",
    authentication: { type: 'none' },
    rateLimit: { requestsPerMinute: 100, burstLimit: 10 },
    timeout: 10000,
    retries: 3,
    endpoints: [
      {
        name: "get_posts",
        path: "/posts",
        method: "GET",
        description: "Get all posts",
        parameters: [],
        cached: true,
        cacheTTL: 300
      },
      {
        name: "get_post",
        path: "/posts/{id}",
        method: "GET", 
        description: "Get a specific post",
        parameters: [
          {
            name: "id",
            type: "number",
            location: "path",
            required: true,
            description: "Post ID"
          }
        ],
        cached: true,
        cacheTTL: 600
      }
    ]
  }
];

const server = new APIGatewayMCPServer(apiConfigs);
server.start().catch(console.error);
```

## 4. 最佳实践

### 4.1 项目组织原则
1. **模块化设计** - 功能模块清晰分离
2. **配置外部化** - 所有配置可外部指定
3. **错误处理** - 完善的错误处理和用户友好消息
4. **日志记录** - 详细的操作日志记录
5. **性能优化** - 合理的缓存和资源管理

### 4.2 安全考虑
1. **输入验证** - 严格验证所有用户输入
2. **权限控制** - 细粒度的操作权限控制
3. **沙盒隔离** - 限制文件和网络访问范围
4. **敏感信息** - 避免在日志中记录敏感信息
5. **审计日志** - 记录所有关键操作的审计日志

### 4.3 可维护性
1. **代码结构** - 清晰的代码组织和命名
2. **文档说明** - 详细的API和配置文档
3. **测试覆盖** - 充分的单元测试和集成测试
4. **监控告警** - 实时监控和异常告警
5. **版本管理** - 规范的版本发布和变更管理

## 小结

通过本章的实战项目开发，我们学习了：
- 文件系统管理Server的完整实现
- 数据库操作Server的架构设计
- API网关代理Server的核心功能
- 实际项目中的安全和性能考虑
- 企业级MCP Server的最佳实践

这些实战项目展示了如何将前面学习的理论知识应用到具体的业务场景中，为开发实用的MCP Server应用奠定了基础。