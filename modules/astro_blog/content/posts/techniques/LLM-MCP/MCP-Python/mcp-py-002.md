---
title: "第 2 章：开发环境搭建"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第 2 章：开发环境搭建

::: tip 学习目标
- 安装和配置Node.js开发环境
- 了解MCP SDK和相关工具
- 搭建第一个MCP Server项目
- 配置开发调试工具和测试环境
- 理解MCP Server的基本项目结构
:::

## 知识点总结

### 环境要求
- **Node.js** >= 18.0.0 (推荐使用LTS版本)
- **npm** 或 **yarn** 包管理器
- **TypeScript** 支持 (推荐)
- **Git** 版本控制工具
- **VS Code** 或其他支持TypeScript的IDE

### MCP SDK核心包

| 包名 | 用途 | 说明 |
|------|------|------|
| `@modelcontextprotocol/sdk` | MCP核心SDK | 提供基础的协议实现和类型定义 |
| `@modelcontextprotocol/server` | MCP服务端框架 | 简化Server开发的高级框架 |
| `@modelcontextprotocol/client` | MCP客户端工具 | 用于测试和调试MCP Server |
| `@types/node` | Node.js类型定义 | TypeScript开发必需 |

### 项目结构规范

```
mcp-server-example/
├── src/
│   ├── index.ts          # 服务器入口文件
│   ├── tools/            # 工具实现
│   ├── resources/        # 资源提供者
│   ├── prompts/          # 提示模板
│   └── types/            # 类型定义
├── dist/                 # 编译输出目录
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── .gitignore           # Git忽略配置
└── README.md            # 项目说明
```

## 环境搭建步骤

### 1. 安装Node.js环境

```python
# 使用Python演示环境检查脚本
import subprocess
import sys
import json

def check_node_version():
    """检查Node.js版本"""
    try:
        result = subprocess.run(['node', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✅ Node.js已安装: {version}")
            
            # 检查版本是否满足要求
            major_version = int(version[1:].split('.')[0])
            if major_version >= 18:
                print("✅ Node.js版本满足要求 (>=18.0.0)")
                return True
            else:
                print("❌ Node.js版本过低，需要>=18.0.0")
                return False
        else:
            print("❌ Node.js未安装")
            return False
    except FileNotFoundError:
        print("❌ Node.js未安装")
        return False

def check_npm_version():
    """检查npm版本"""
    try:
        result = subprocess.run(['npm', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✅ npm已安装: {version}")
            return True
        else:
            print("❌ npm未安装")
            return False
    except FileNotFoundError:
        print("❌ npm未安装")
        return False

# 环境检查
print("🔍 检查开发环境...")
node_ok = check_node_version()
npm_ok = check_npm_version()

if node_ok and npm_ok:
    print("\n✅ 环境检查通过，可以开始MCP开发！")
else:
    print("\n❌ 环境检查失败，请安装必需的工具")
```

### 2. 创建MCP Server项目

```python
# 模拟项目初始化过程
import os
import json
from pathlib import Path

def create_mcp_project(project_name):
    """创建MCP Server项目结构"""
    
    # 创建项目目录结构
    dirs = [
        f"{project_name}",
        f"{project_name}/src",
        f"{project_name}/src/tools",
        f"{project_name}/src/resources", 
        f"{project_name}/src/prompts",
        f"{project_name}/src/types",
        f"{project_name}/dist"
    ]
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"📁 创建目录: {dir_path}")
    
    # 生成package.json
    package_json = {
        "name": project_name,
        "version": "1.0.0",
        "description": "MCP Server example",
        "main": "dist/index.js",
        "scripts": {
            "build": "tsc",
            "start": "node dist/index.js",
            "dev": "tsx src/index.ts",
            "watch": "tsx watch src/index.ts"
        },
        "dependencies": {
            "@modelcontextprotocol/sdk": "^1.0.0",
            "@modelcontextprotocol/server": "^1.0.0"
        },
        "devDependencies": {
            "@types/node": "^20.0.0",
            "typescript": "^5.0.0",
            "tsx": "^4.0.0"
        }
    }
    
    # 生成tsconfig.json
    tsconfig = {
        "compilerOptions": {
            "target": "ES2022",
            "module": "CommonJS", 
            "moduleResolution": "node",
            "outDir": "./dist",
            "rootDir": "./src",
            "strict": True,
            "esModuleInterop": True,
            "skipLibCheck": True,
            "forceConsistentCasingInFileNames": True,
            "declaration": True,
            "declarationMap": True,
            "sourceMap": True
        },
        "include": ["src/**/*"],
        "exclude": ["node_modules", "dist"]
    }
    
    # 写入配置文件
    with open(f"{project_name}/package.json", "w", encoding="utf-8") as f:
        json.dump(package_json, f, indent=2, ensure_ascii=False)
    
    with open(f"{project_name}/tsconfig.json", "w", encoding="utf-8") as f:
        json.dump(tsconfig, f, indent=2, ensure_ascii=False)
    
    print(f"📝 创建配置文件: package.json, tsconfig.json")
    
    return f"{project_name}"

# 创建示例项目
project_path = create_mcp_project("my-mcp-server")
print(f"\n✅ 项目 '{project_path}' 创建完成！")
```

### 3. Hello World MCP Server

```python
# 生成基础的MCP Server代码结构
hello_world_server = '''
import { Server } from '@modelcontextprotocol/server';
import { StdioTransport } from '@modelcontextprotocol/server/stdio';

class HelloWorldMCPServer {
    private server: Server;
    
    constructor() {
        // 创建MCP Server实例
        this.server = new Server(
            {
                name: "hello-world-server",
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
        this.setupPrompts();
    }
    
    private setupTools() {
        // 注册Hello World工具
        this.server.setRequestHandler('tools/list', async () => {
            return {
                tools: [
                    {
                        name: "say_hello",
                        description: "说Hello的工具",
                        inputSchema: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                    description: "要问候的名字"
                                }
                            },
                            required: ["name"]
                        }
                    }
                ]
            };
        });
        
        // 处理工具调用
        this.server.setRequestHandler('tools/call', async (request) => {
            const { name, arguments: args } = request.params;
            
            if (name === "say_hello") {
                const userName = args.name || "World";
                return {
                    content: [
                        {
                            type: "text",
                            text: `Hello, ${userName}! 欢迎使用MCP Server！`
                        }
                    ]
                };
            }
            
            throw new Error(`未知工具: ${name}`);
        });
    }
    
    private setupResources() {
        // 注册资源列表
        this.server.setRequestHandler('resources/list', async () => {
            return {
                resources: [
                    {
                        uri: "hello://info",
                        name: "服务器信息",
                        description: "获取Hello World服务器的基本信息",
                        mimeType: "text/plain"
                    }
                ]
            };
        });
        
        // 处理资源读取
        this.server.setRequestHandler('resources/read', async (request) => {
            const uri = request.params.uri;
            
            if (uri === "hello://info") {
                return {
                    contents: [
                        {
                            uri: uri,
                            mimeType: "text/plain",
                            text: "这是一个Hello World MCP Server示例\\n版本: 1.0.0\\n功能: 演示MCP协议基础用法"
                        }
                    ]
                };
            }
            
            throw new Error(`未知资源: ${uri}`);
        });
    }
    
    private setupPrompts() {
        // 注册提示模板
        this.server.setRequestHandler('prompts/list', async () => {
            return {
                prompts: [
                    {
                        name: "greeting_template",
                        description: "友好问候模板",
                        arguments: [
                            {
                                name: "user_name",
                                description: "用户名",
                                required: true
                            }
                        ]
                    }
                ]
            };
        });
        
        // 处理提示模板获取
        this.server.setRequestHandler('prompts/get', async (request) => {
            const { name, arguments: args } = request.params;
            
            if (name === "greeting_template") {
                const userName = args?.user_name || "朋友";
                return {
                    description: "生成友好的问候消息",
                    messages: [
                        {
                            role: "user", 
                            content: {
                                type: "text",
                                text: `请以友好的方式问候 ${userName}，并介绍MCP协议的优势。`
                            }
                        }
                    ]
                };
            }
            
            throw new Error(`未知提示模板: ${name}`);
        });
    }
    
    public async start() {
        // 使用标准输入输出传输
        const transport = new StdioTransport();
        await this.server.connect(transport);
        console.error("Hello World MCP Server 已启动！");
    }
}

// 启动服务器
const server = new HelloWorldMCPServer();
server.start().catch((error) => {
    console.error("服务器启动失败:", error);
    process.exit(1);
});
'''

print("📄 基础MCP Server代码模板:")
print("=" * 50)
print(hello_world_server)
print("=" * 50)
```

## 开发工具配置

### VS Code配置

```python
# VS Code配置示例
import json

def create_vscode_config():
    """生成VS Code开发配置"""
    
    # launch.json - 调试配置
    launch_config = {
        "version": "0.2.0",
        "configurations": [
            {
                "name": "启动MCP Server",
                "type": "node",
                "request": "launch",
                "program": "${workspaceFolder}/src/index.ts",
                "outFiles": ["${workspaceFolder}/dist/**/*.js"],
                "console": "integratedTerminal",
                "envFile": "${workspaceFolder}/.env"
            },
            {
                "name": "调试MCP Server",
                "type": "node",
                "request": "launch",
                "program": "${workspaceFolder}/node_modules/tsx/cli.js",
                "args": ["${workspaceFolder}/src/index.ts"],
                "console": "integratedTerminal",
                "envFile": "${workspaceFolder}/.env"
            }
        ]
    }
    
    # settings.json - 工作区设置
    settings_config = {
        "typescript.preferences.importModuleSpecifier": "relative",
        "editor.codeActionsOnSave": {
            "source.organizeImports": True
        },
        "files.exclude": {
            "**/node_modules": True,
            "**/dist": True,
            "**/.git": True
        }
    }
    
    # extensions.json - 推荐扩展
    extensions_config = {
        "recommendations": [
            "ms-vscode.vscode-typescript-next",
            "esbenp.prettier-vscode",
            "ms-vscode.vscode-json",
            "bradlc.vscode-tailwindcss"
        ]
    }
    
    print("VS Code配置文件:")
    print("\n.vscode/launch.json:")
    print(json.dumps(launch_config, indent=2, ensure_ascii=False))
    
    print("\n.vscode/settings.json:")
    print(json.dumps(settings_config, indent=2, ensure_ascii=False))
    
    print("\n.vscode/extensions.json:")
    print(json.dumps(extensions_config, indent=2, ensure_ascii=False))

create_vscode_config()
```

### 测试和调试工具

::: note 测试工具
**MCP Inspector** - MCP协议调试工具
- 提供可视化界面测试MCP Server
- 实时查看消息传递过程
- 支持工具调用和资源访问测试

**MCP Client CLI** - 命令行测试工具
- 快速测试MCP Server功能
- 自动化测试脚本支持
- 性能和负载测试
:::

```python
# 测试脚本示例
def create_test_script():
    """生成MCP Server测试脚本"""
    
    test_script = '''
import asyncio
import json
from typing import Any, Dict

class MCPServerTester:
    def __init__(self, server_command: str):
        self.server_command = server_command
        self.process = None
    
    async def start_server(self):
        """启动MCP Server进程"""
        import subprocess
        self.process = await asyncio.create_subprocess_exec(
            *self.server_command.split(),
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        print("📡 MCP Server已启动")
    
    async def send_request(self, method: str, params: Dict[str, Any] = None):
        """发送MCP请求"""
        if not self.process:
            raise RuntimeError("服务器未启动")
        
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params or {}
        }
        
        # 发送请求
        request_data = json.dumps(request) + "\\n"
        self.process.stdin.write(request_data.encode())
        await self.process.stdin.drain()
        
        # 读取响应
        response_line = await self.process.stdout.readline()
        response = json.loads(response_line.decode())
        
        return response
    
    async def test_tools(self):
        """测试工具功能"""
        print("🔧 测试Tools功能...")
        
        # 获取工具列表
        tools_response = await self.send_request("tools/list")
        print(f"可用工具: {tools_response}")
        
        # 调用say_hello工具
        call_response = await self.send_request("tools/call", {
            "name": "say_hello",
            "arguments": {"name": "测试用户"}
        })
        print(f"工具调用结果: {call_response}")
    
    async def test_resources(self):
        """测试资源功能"""
        print("📚 测试Resources功能...")
        
        # 获取资源列表
        resources_response = await self.send_request("resources/list")
        print(f"可用资源: {resources_response}")
        
        # 读取资源内容
        read_response = await self.send_request("resources/read", {
            "uri": "hello://info"
        })
        print(f"资源内容: {read_response}")
    
    async def test_prompts(self):
        """测试提示模板功能"""
        print("💬 测试Prompts功能...")
        
        # 获取提示模板列表
        prompts_response = await self.send_request("prompts/list")
        print(f"可用模板: {prompts_response}")
        
        # 获取提示模板
        get_response = await self.send_request("prompts/get", {
            "name": "greeting_template",
            "arguments": {"user_name": "开发者"}
        })
        print(f"模板内容: {get_response}")
    
    async def run_all_tests(self):
        """运行所有测试"""
        await self.start_server()
        try:
            await self.test_tools()
            await self.test_resources() 
            await self.test_prompts()
            print("\\n✅ 所有测试通过！")
        finally:
            if self.process:
                self.process.terminate()
                await self.process.wait()

# 使用示例
async def main():
    tester = MCPServerTester("node dist/index.js")
    await tester.run_all_tests()

# 运行测试
# asyncio.run(main())
print("测试脚本已准备就绪")
    '''
    
    print("🧪 MCP Server测试脚本:")
    print(test_script)

create_test_script()
```

## 项目管理最佳实践

### Git配置

```python
# .gitignore文件内容
gitignore_content = '''
# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript
dist/
*.tsbuildinfo

# 环境变量
.env
.env.local
.env.production

# IDE
.vscode/settings.json
.idea/

# 操作系统
.DS_Store
Thumbs.db

# 日志文件
logs/
*.log

# 临时文件
tmp/
temp/
'''

print("📄 .gitignore配置:")
print(gitignore_content)
```

### 开发流程

::: warning 开发工作流
1. **项目初始化** - 使用脚手架工具快速创建项目结构
2. **依赖安装** - 安装MCP SDK和开发依赖
3. **代码开发** - 使用TypeScript开发MCP Server
4. **本地测试** - 使用MCP Client工具测试功能
5. **构建打包** - TypeScript编译为JavaScript
6. **集成测试** - 在真实AI客户端中测试
7. **部署发布** - 发布到npm或私有仓库
:::

通过本章学习，我们成功搭建了完整的MCP Server开发环境，创建了第一个Hello World项目，并配置了必要的开发和测试工具。这为后续深入学习MCP协议实现奠定了坚实的基础。