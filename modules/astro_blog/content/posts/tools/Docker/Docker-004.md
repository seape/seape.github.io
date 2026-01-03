---
title: "第 4 章：Dockerfile构建技术"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第 4 章：Dockerfile构建技术

::: tip 学习目标
- 掌握Dockerfile的语法和指令使用
- 学会编写高效的多层镜像构建文件
- 理解镜像层缓存机制和优化策略
- 熟练使用多阶段构建减小镜像体积
:::

## 知识点

### Dockerfile基础概念

Dockerfile是一个文本文件，包含了一系列指令，用于自动化构建Docker镜像。每个指令都会在镜像中创建一个新的层，通过层的叠加形成最终的镜像。

**Dockerfile的优势：**
- **版本控制**：可以通过Git等工具管理Dockerfile变更
- **可重复构建**：确保每次构建都得到一致的结果
- **自动化**：集成到CI/CD流水线中实现自动构建
- **透明性**：构建过程完全透明，便于调试和优化

### Dockerfile指令分类

| 类别 | 指令 | 作用 |
|------|------|------|
| 基础指令 | FROM, MAINTAINER | 定义基础镜像和维护者信息 |
| 文件操作 | COPY, ADD, VOLUME | 复制文件和目录操作 |
| 环境配置 | ENV, ARG, WORKDIR | 设置环境变量和工作目录 |
| 执行指令 | RUN, CMD, ENTRYPOINT | 执行命令和定义启动指令 |
| 网络配置 | EXPOSE | 声明端口 |
| 用户管理 | USER | 设置运行用户 |
| 元数据 | LABEL, ONBUILD | 添加标签和触发指令 |

### 构建上下文

构建上下文是指`docker build`命令执行时发送给Docker守护进程的文件和目录。

```text
构建上下文示例：
project/
├── Dockerfile          # 构建文件
├── .dockerignore       # 忽略文件列表
├── app/                # 应用代码
│   ├── main.py
│   └── requirements.txt
├── config/             # 配置文件
│   └── app.conf
└── static/             # 静态资源
    ├── css/
    └── js/
```

## Dockerfile基本指令

### FROM - 基础镜像

```dockerfile
# 指定基础镜像
FROM ubuntu:20.04

# 使用特定版本
FROM node:16-alpine

# 多阶段构建中的命名
FROM golang:1.19 AS builder
FROM alpine:latest AS runtime

# 使用官方镜像
FROM nginx:latest
FROM mysql:8.0
FROM python:3.9-slim

# 空镜像（最小化镜像）
FROM scratch
```

### MAINTAINER/LABEL - 元数据信息

```dockerfile
# 维护者信息（已弃用，推荐使用LABEL）
MAINTAINER John Doe <john@example.com>

# 推荐使用LABEL
LABEL maintainer="john@example.com"
LABEL version="1.0.0"
LABEL description="This is a demo Docker image"
LABEL vendor="My Company"

# 多个标签
LABEL version="1.0.0" \
      description="Multi-line label example" \
      maintainer="john@example.com"
```

### RUN - 执行命令

```dockerfile
# 基本用法
RUN apt-get update
RUN apt-get install -y nginx

# 推荐：合并命令减少层数
RUN apt-get update && \
    apt-get install -y \
        nginx \
        curl \
        vim && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# 使用exec形式
RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "nginx"]

# 多行复杂命令
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        wget; \
    rm -rf /var/lib/apt/lists/*

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 创建用户
RUN groupadd -r appuser && useradd -r -g appuser appuser
```

### COPY和ADD - 文件复制

```dockerfile
# COPY：简单文件复制（推荐）
COPY app.py /opt/app/
COPY requirements.txt /opt/app/
COPY . /opt/app/

# 复制并设置权限
COPY --chown=appuser:appuser app.py /opt/app/

# ADD：支持URL和自动解压（功能更强但不推荐日常使用）
ADD https://example.com/file.tar.gz /opt/
ADD archive.tar.gz /opt/  # 自动解压

# 复制多个文件
COPY ["file1.txt", "file2.txt", "/opt/app/"]

# 使用通配符
COPY *.py /opt/app/
COPY config/*.conf /etc/myapp/

# 复制目录结构
COPY --from=builder /app/build /usr/share/nginx/html
```

### ENV和ARG - 环境变量

```dockerfile
# ENV：运行时环境变量
ENV NODE_ENV=production
ENV APP_PORT=3000
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# 多个环境变量
ENV NODE_ENV=production \
    APP_PORT=3000 \
    LOG_LEVEL=info

# ARG：构建时参数
ARG VERSION=latest
ARG BUILD_DATE
ARG VCS_REF

# 结合使用
ARG APP_VERSION=1.0.0
ENV APP_VERSION=${APP_VERSION}

# 带默认值的ARG
ARG PYTHON_VERSION=3.9
FROM python:${PYTHON_VERSION}-slim

# 使用ARG示例
ARG TARGETPLATFORM
ARG BUILDPLATFORM
RUN echo "Building on $BUILDPLATFORM, targeting $TARGETPLATFORM"
```

### WORKDIR - 工作目录

```dockerfile
# 设置工作目录
WORKDIR /opt/app

# 自动创建目录
WORKDIR /path/to/nonexistent/directory

# 相对路径（基于上一个WORKDIR）
WORKDIR /opt
WORKDIR app  # 等价于 /opt/app

# 使用环境变量
ENV APP_HOME=/opt/myapp
WORKDIR ${APP_HOME}

# 实际使用示例
FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
```

### EXPOSE - 端口声明

```dockerfile
# 声明端口（仅文档作用，不实际开放）
EXPOSE 80
EXPOSE 443
EXPOSE 8080/tcp
EXPOSE 53/udp

# 使用变量
ARG PORT=8080
EXPOSE ${PORT}

# 多个端口
EXPOSE 80 443 8080
```

### USER - 运行用户

```dockerfile
# 创建并使用非root用户
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser

# 使用UID:GID
USER 1000:1000

# 临时切换用户
USER root
RUN apt-get update && apt-get install -y some-package
USER appuser

# 实际使用示例
FROM node:16-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
```

### CMD和ENTRYPOINT - 启动命令

```dockerfile
# CMD：默认启动命令（可被覆盖）
CMD ["nginx", "-g", "daemon off;"]
CMD nginx -g "daemon off;"  # shell形式
CMD ["/bin/bash"]  # 交互式shell

# ENTRYPOINT：固定入口点（不可覆盖）
ENTRYPOINT ["docker-entrypoint.sh"]
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# 组合使用：ENTRYPOINT + CMD
ENTRYPOINT ["python", "app.py"]
CMD ["--port", "8080"]  # 默认参数

# 实际组合示例
FROM python:3.9-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
ENTRYPOINT ["python", "app.py"]
CMD ["--host", "0.0.0.0", "--port", "8080"]

# 使用脚本作为入口点
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
```

## 实际应用示例

### Python Web应用Dockerfile

```dockerfile
# 多阶段构建：Python Flask应用
FROM python:3.9-slim as base

# 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# 安装系统依赖
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        libc6-dev && \
    rm -rf /var/lib/apt/lists/*

# 创建非root用户
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 设置工作目录
WORKDIR /app

# 复制并安装Python依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY --chown=appuser:appuser . .

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# 启动命令
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]
```

### Node.js应用Dockerfile

```dockerfile
# Node.js应用多阶段构建
FROM node:16-alpine AS dependencies

# 设置工作目录
WORKDIR /usr/src/app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 构建阶段
FROM node:16-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM node:16-alpine AS production

# 创建用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /usr/src/app

# 从dependencies阶段复制node_modules
COPY --from=dependencies --chown=nextjs:nodejs /usr/src/app/node_modules ./node_modules

# 从builder阶段复制构建结果
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/package*.json ./

# 切换用户
USER nextjs

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

CMD ["npm", "start"]
```

### Nginx静态网站Dockerfile

```dockerfile
# 多阶段构建：前端应用
FROM node:16-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci

# 构建应用
COPY . .
RUN npm run build

# 生产镜像
FROM nginx:alpine

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制启动脚本
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

## 多阶段构建

### 基本多阶段构建

```dockerfile
# 构建阶段
FROM golang:1.19 AS builder

WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# 运行阶段
FROM alpine:latest

# 安装CA证书
RUN apk --no-cache add ca-certificates
WORKDIR /root/

# 从构建阶段复制二进制文件
COPY --from=builder /app/main .

# 创建非root用户
RUN adduser -D -s /bin/sh appuser
USER appuser

EXPOSE 8080
CMD ["./main"]
```

### 复杂多阶段构建示例

```dockerfile
# 基础镜像
FROM node:16-alpine AS base
WORKDIR /app
COPY package*.json ./

# 依赖安装阶段
FROM base AS dependencies
RUN npm ci --only=production

# 开发依赖阶段
FROM base AS dev-dependencies  
RUN npm ci

# 构建阶段
FROM dev-dependencies AS builder
COPY . .
RUN npm run build

# 测试阶段
FROM dev-dependencies AS tester
COPY . .
RUN npm test

# 生产镜像
FROM node:16-alpine AS production

# 安全配置
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

WORKDIR /app
USER appuser

# 复制生产依赖
COPY --from=dependencies --chown=appuser:nodejs /app/node_modules ./node_modules

# 复制构建产物
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --chown=appuser:nodejs package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

## 构建优化技巧

### 利用缓存机制

```dockerfile
# ❌ 不好的做法：每次都重新安装依赖
COPY . /app
WORKDIR /app
RUN npm install

# ✅ 好的做法：先复制依赖文件，利用缓存
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
```

### 减少镜像层数

```dockerfile
# ❌ 创建多个层
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y wget
RUN rm -rf /var/lib/apt/lists/*

# ✅ 合并为一个层
RUN apt-get update && \
    apt-get install -y \
        curl \
        wget && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean
```

### 使用.dockerignore

```dockerfile
# .dockerignore文件内容
.git
.gitignore
README.md
Dockerfile
.dockerignore
node_modules
npm-debug.log
.nyc_output
.coverage
.env.local
.env.development.local
.env.test.local
.env.production.local
.next
.vscode
__pycache__
*.pyc
*.pyo
*.pyd
```

### 选择合适的基础镜像

```dockerfile
# 大小对比
FROM ubuntu:20.04        # ~72MB
FROM python:3.9-slim     # ~45MB  
FROM python:3.9-alpine   # ~15MB
FROM scratch             # 0MB

# 根据需求选择
FROM alpine:latest       # 最小化生产镜像
FROM ubuntu:20.04        # 需要更多工具的开发镜像
FROM python:3.9-alpine   # Python应用的平衡选择
```

## 构建参数和变量

### 使用构建参数

```dockerfile
# 定义构建参数
ARG NODE_VERSION=16
ARG APP_ENV=production

FROM node:${NODE_VERSION}-alpine

# 使用构建参数
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

# 设置标签
LABEL build_date=${BUILD_DATE}
LABEL vcs_ref=${VCS_REF}
LABEL version=${VERSION}

# 转为环境变量
ENV APP_ENV=${APP_ENV}
```

构建时传递参数：

```bash
# 传递构建参数
docker build \
  --build-arg NODE_VERSION=18 \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VCS_REF=$(git rev-parse HEAD) \
  --build-arg VERSION=1.2.0 \
  -t myapp:1.2.0 .

# 查看构建参数
docker inspect myapp:1.2.0 | jq '.[0].Config.Labels'
```

### 条件构建

```dockerfile
ARG INSTALL_DEV_TOOLS=false

# 条件安装开发工具
RUN if [ "$INSTALL_DEV_TOOLS" = "true" ]; then \
        apt-get update && \
        apt-get install -y vim curl wget; \
    fi
```

## 实战项目构建

### 完整的Web应用构建

创建项目结构：

```bash
mkdir docker-webapp-build
cd docker-webapp-build

# 创建应用代码
cat > app.py << 'EOF'
from flask import Flask, jsonify
import os
import sys
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

@app.route('/')
def home():
    return jsonify({
        "message": "Hello from Dockerized Flask App!",
        "version": os.getenv("APP_VERSION", "unknown"),
        "environment": os.getenv("APP_ENV", "development")
    })

@app.route('/health')
def health():
    return jsonify({"status": "healthy"})

@app.route('/info')
def info():
    return jsonify({
        "python_version": sys.version,
        "environment": dict(os.environ)
    })

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
EOF

# 创建依赖文件
cat > requirements.txt << 'EOF'
Flask==2.3.2
gunicorn==21.2.0
EOF

# 创建配置文件
cat > config.py << 'EOF'
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    PORT = int(os.environ.get('PORT', 5000))
EOF

# 创建启动脚本
cat > docker-entrypoint.sh << 'EOF'
#!/bin/sh
set -e

echo "Starting Flask application..."
echo "Environment: ${APP_ENV:-development}"
echo "Version: ${APP_VERSION:-unknown}"

# 数据库迁移等初始化操作可以在这里执行
# python -c "from app import db; db.create_all()"

exec "$@"
EOF

chmod +x docker-entrypoint.sh
```

创建优化的Dockerfile：

```dockerfile
# 多阶段构建的完整Flask应用
ARG PYTHON_VERSION=3.9
FROM python:${PYTHON_VERSION}-slim as base

# 构建参数
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION=dev

# 标签信息
LABEL maintainer="developer@example.com" \
      build_date="${BUILD_DATE}" \
      vcs_ref="${VCS_REF}" \
      version="${VERSION}" \
      description="Flask web application with Docker"

# Python环境配置
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=100

# 依赖安装阶段
FROM base AS dependencies

# 安装系统依赖
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        libc6-dev \
        curl && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# 创建应用用户
RUN groupadd -r appuser && \
    useradd -r -g appuser -d /app -s /bin/bash appuser

# 设置工作目录
WORKDIR /app

# 安装Python依赖
COPY requirements.txt .
RUN pip install --user --no-warn-script-location -r requirements.txt

# 生产镜像
FROM base AS production

# 复制用户配置
RUN groupadd -r appuser && \
    useradd -r -g appuser -d /app -s /bin/bash appuser

# 安装运行时依赖
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

WORKDIR /app

# 复制Python依赖
COPY --from=dependencies --chown=appuser:appuser /root/.local /home/appuser/.local

# 复制应用代码
COPY --chown=appuser:appuser . .

# 确保脚本可执行
RUN chmod +x docker-entrypoint.sh

# 切换到应用用户
USER appuser

# 设置PATH以包含用户安装的包
ENV PATH=/home/appuser/.local/bin:$PATH

# 设置应用环境变量
ENV APP_VERSION=${VERSION} \
    APP_ENV=production \
    PORT=5000

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# 启动配置
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]
```

创建.dockerignore文件：

```dockerfile
.git
.gitignore
README.md
Dockerfile
.dockerignore
__pycache__
*.pyc
*.pyo
*.pyd
.Python
.pytest_cache
.coverage
.venv
venv/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

构建和测试：

```bash
# 构建镜像
docker build \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VCS_REF=$(git rev-parse --short HEAD) \
  --build-arg VERSION=1.0.0 \
  -t flask-app:1.0.0 \
  -t flask-app:latest .

# 查看镜像信息
docker images flask-app
docker inspect flask-app:latest | jq '.[0].Config.Labels'

# 运行容器
docker run -d --name flask-app \
  -p 5000:5000 \
  -e APP_ENV=production \
  flask-app:latest

# 测试应用
curl http://localhost:5000/
curl http://localhost:5000/health
curl http://localhost:5000/info

# 查看日志
docker logs -f flask-app

# 清理
docker stop flask-app
docker rm flask-app
```

::: note Dockerfile最佳实践
1. **单一职责**：每个容器应该只运行一个服务
2. **最小化层数**：合并相关的RUN指令减少层数
3. **利用缓存**：将变化频率低的指令放在前面
4. **安全配置**：使用非root用户运行应用
5. **健康检查**：添加健康检查确保服务可用性
6. **标签管理**：为镜像添加适当的标签和元数据
:::

::: warning 注意事项
- 避免在镜像中包含敏感信息（密码、密钥等）
- 使用多阶段构建减小最终镜像体积
- 定期更新基础镜像以获取安全补丁
- 使用.dockerignore排除不需要的文件
- 在生产环境中固定基础镜像版本
:::

## 小结

通过本章学习，你应该掌握了：

- **Dockerfile语法**：熟练使用各种Dockerfile指令
- **构建技巧**：掌握多阶段构建和镜像优化方法
- **最佳实践**：了解安全、性能和可维护性最佳实践
- **实战能力**：能够为不同类型的应用编写高质量的Dockerfile

下一章我们将学习Docker的数据卷与网络配置，解决容器数据持久化和网络通信问题。