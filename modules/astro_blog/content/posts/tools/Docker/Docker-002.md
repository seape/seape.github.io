---
title: "第 2 章：Docker镜像管理"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第 2 章：Docker镜像管理

::: tip 学习目标
- 深入理解Docker镜像的分层结构
- 掌握镜像的拉取、查看和删除操作
- 学会从容器创建自定义镜像
- 熟练使用Docker Hub和私有镜像仓库
:::

## 知识点

### Docker镜像分层结构

Docker镜像采用分层存储架构，这是Docker的核心设计之一。每个镜像由多个只读层组成，层与层之间通过指针连接。

**分层存储的优势：**
- **存储效率**：相同的层可以在不同镜像间共享，节省磁盘空间
- **传输效率**：只需下载缺失的层，加快镜像拉取速度
- **缓存机制**：构建时可复用已有层，提升构建效率

```text
镜像分层示例：
┌─────────────────────────────────┐
│     应用层 (nginx:latest)        │  ← 可写层（容器运行时）
├─────────────────────────────────┤
│     Nginx配置层                   │  ← 只读层
├─────────────────────────────────┤
│     Nginx程序层                   │  ← 只读层
├─────────────────────────────────┤
│     Ubuntu基础系统层              │  ← 只读层
├─────────────────────────────────┤
│     内核启动层                    │  ← 只读层
└─────────────────────────────────┘
```

### 镜像命名规则

Docker镜像遵循特定的命名约定：`[registry]/[namespace]/[repository]:[tag]`

| 组成部分 | 说明 | 示例 |
|----------|------|------|
| registry | 镜像仓库地址 | docker.io, gcr.io |
| namespace | 命名空间/用户名 | library, nginx, mycompany |
| repository | 仓库名称 | nginx, mysql, ubuntu |
| tag | 标签版本 | latest, 1.20, stable |

```bash
# 完整镜像名称示例
docker.io/library/nginx:1.20        # 官方nginx 1.20版本
gcr.io/kubernetes-e2e-test-images/busybox:1.29   # Google仓库中的busybox
myregistry.com/myteam/myapp:v1.0     # 私有仓库中的应用
```

### 镜像存储驱动

Docker支持多种存储驱动来管理镜像层：

| 存储驱动 | 适用系统 | 特点 |
|----------|----------|------|
| overlay2 | 现代Linux | 性能最优，推荐使用 |
| aufs | 旧版Ubuntu | 较老技术，逐渐被淘汰 |
| devicemapper | RHEL/CentOS | 企业级特性，配置复杂 |
| btrfs | 支持Btrfs文件系统 | 高级特性，快照支持 |

```bash
# 查看当前存储驱动
docker info | grep "Storage Driver"

# 输出示例
Storage Driver: overlay2
```

## 镜像基本操作

### 搜索镜像

```bash
# 基本搜索
docker search nginx
docker search mysql
docker search python

# 高级搜索选项
docker search --limit 10 nginx                    # 限制结果数量
docker search --filter stars=100 nginx            # 过滤星级
docker search --filter is-official=true nginx     # 只显示官方镜像
docker search --filter is-automated=true nginx    # 只显示自动构建镜像

# 搜索结果格式化
docker search --format "table {{.Name}}\t{{.Stars}}\t{{.Official}}" nginx
```

### 拉取镜像

```bash
# 拉取最新版本
docker pull nginx                    # 等同于 docker pull nginx:latest
docker pull ubuntu                   # 拉取Ubuntu最新版

# 拉取指定版本
docker pull nginx:1.20               # 拉取nginx 1.20版本
docker pull mysql:8.0               # 拉取MySQL 8.0版本
docker pull python:3.9-alpine       # 拉取Python 3.9 Alpine版本

# 拉取指定平台镜像
docker pull --platform linux/amd64 nginx:latest    # 指定平台架构
docker pull --platform linux/arm64 nginx:latest    # ARM64架构

# 拉取所有标签
docker pull -a nginx                 # 拉取nginx仓库的所有标签（慎用）

# 查看拉取进度
docker pull nginx:latest
# 输出示例：
# latest: Pulling from library/nginx
# b4d181a07f80: Pull complete 
# 66b1c490df3f: Pull complete 
# d0f91ae9b44c: Pull complete 
```

### 查看本地镜像

```bash
# 列出所有镜像
docker images
docker image ls                      # 同上，新语法

# 查看特定镜像
docker images nginx                  # 只显示nginx相关镜像
docker images nginx:1.20            # 显示特定版本

# 格式化输出
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"

# 显示镜像摘要
docker images --digests              # 显示镜像摘要信息

# 显示中间层镜像
docker images -a                     # 显示所有镜像，包括中间层

# 过滤镜像
docker images --filter "before=nginx:1.20"      # 显示nginx:1.20之前的镜像
docker images --filter "since=nginx:1.20"       # 显示nginx:1.20之后的镜像
docker images --filter "reference=nginx:*"      # 显示所有nginx镜像
docker images --filter "dangling=true"          # 显示悬挂镜像

# 查看镜像占用空间
docker system df                     # 查看Docker整体空间使用
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

### 镜像详细信息

```bash
# 查看镜像详细信息
docker inspect nginx:latest

# 查看镜像历史
docker history nginx:latest          # 显示镜像构建历史
docker history --no-trunc nginx:latest  # 显示完整命令

# 查看镜像分层信息
docker inspect nginx:latest | jq '.[0].RootFS.Layers'

# 示例输出：
[
  "sha256:b4d181a07f80...",
  "sha256:66b1c490df3f...",
  "sha256:d0f91ae9b44c..."
]
```

### 删除镜像

```bash
# 删除单个镜像
docker rmi nginx:latest              # 通过标签删除
docker rmi b4d181a07f80              # 通过镜像ID删除

# 强制删除
docker rmi -f nginx:latest           # 强制删除，即使有容器在使用

# 批量删除
docker rmi $(docker images nginx -q)           # 删除所有nginx镜像
docker rmi $(docker images -f "dangling=true" -q)  # 删除悬挂镜像

# 清理未使用镜像
docker image prune                   # 删除悬挂镜像
docker image prune -a                # 删除所有未使用镜像
docker image prune --filter "until=24h"  # 删除24小时前的未使用镜像

# 交互式删除确认
docker image prune -a --filter "until=168h"  # 删除一周前的镜像
```

## 自定义镜像创建

### 从容器创建镜像

```bash
# 启动一个基础容器
docker run -it --name mycontainer ubuntu:20.04 /bin/bash

# 在容器内进行自定义操作
apt-get update
apt-get install -y nginx vim curl
echo "Hello from my custom image" > /var/www/html/index.html

# 退出容器（不要停止）
exit

# 将容器提交为新镜像
docker commit mycontainer my-nginx:v1.0

# 带更多参数的提交
docker commit \
  --author "Your Name <your.email@example.com>" \
  --message "Added nginx and custom index page" \
  mycontainer \
  my-nginx:v1.0

# 验证新镜像
docker images my-nginx
docker history my-nginx:v1.0
```

### 导出和导入镜像

```bash
# 将镜像保存为tar文件
docker save nginx:latest > nginx-latest.tar
docker save -o nginx-latest.tar nginx:latest

# 保存多个镜像到一个文件
docker save -o images.tar nginx:latest mysql:8.0 ubuntu:20.04

# 从tar文件加载镜像
docker load < nginx-latest.tar
docker load -i nginx-latest.tar

# 导出容器为tar文件（不推荐，会丢失历史和元数据）
docker export mycontainer > mycontainer.tar

# 从tar文件导入为镜像
docker import mycontainer.tar my-imported-image:latest

# 从URL导入镜像
docker import http://example.com/image.tar my-image:latest
```

### 镜像标签管理

```bash
# 为镜像添加标签
docker tag nginx:latest mynginx:latest
docker tag nginx:latest mynginx:v1.0
docker tag nginx:latest myregistry.com/mynginx:latest

# 创建别名标签
docker tag b4d181a07f80 nginx:stable    # 通过ID创建标签

# 查看镜像所有标签
docker images nginx                      # 显示所有nginx标签

# 删除标签（不删除镜像）
docker rmi mynginx:latest                # 只删除标签，镜像保留

# 重命名镜像（实际是添加新标签后删除旧标签）
docker tag oldname:tag newname:tag
docker rmi oldname:tag
```

## Docker Hub使用

### 注册和登录

```bash
# 登录Docker Hub（需要先在https://hub.docker.com注册账号）
docker login
# 输入用户名和密码

# 登录到特定仓库
docker login myregistry.com
docker login -u username -p password myregistry.com  # 命令行登录（不安全）

# 查看登录状态
cat ~/.docker/config.json

# 登出
docker logout
docker logout myregistry.com
```

### 推送镜像到Docker Hub

```bash
# 准备要推送的镜像（必须包含用户名前缀）
docker tag my-nginx:v1.0 yourusername/my-nginx:v1.0
docker tag my-nginx:v1.0 yourusername/my-nginx:latest

# 推送镜像
docker push yourusername/my-nginx:v1.0
docker push yourusername/my-nginx:latest

# 推送所有标签
docker push -a yourusername/my-nginx

# 推送进度显示
# 输出示例：
# The push refers to repository [docker.io/yourusername/my-nginx]
# 08249ce7456f: Pushed 
# 0d2b33356e6f: Pushed 
# v1.0: digest: sha256:abc123... size: 1234
```

### 从Docker Hub拉取

```bash
# 拉取自己的镜像
docker pull yourusername/my-nginx:v1.0

# 拉取其他用户的公开镜像
docker pull someuser/their-image:latest

# 拉取官方镜像（无需用户名前缀）
docker pull nginx:latest
```

## 私有镜像仓库

### 搭建本地Registry

```bash
# 运行官方registry镜像
docker run -d \
  --name local-registry \
  -p 5000:5000 \
  -v /opt/registry:/var/lib/registry \
  registry:2

# 配置允许HTTP连接（仅用于测试）
sudo tee /etc/docker/daemon.json <<EOF
{
  "insecure-registries": ["localhost:5000"]
}
EOF

# 重启Docker服务
sudo systemctl restart docker

# 标记镜像用于推送到本地仓库
docker tag nginx:latest localhost:5000/nginx:latest

# 推送到本地仓库
docker push localhost:5000/nginx:latest

# 从本地仓库拉取
docker pull localhost:5000/nginx:latest
```

### 配置Registry认证

```bash
# 创建认证配置目录
mkdir -p /opt/registry/auth

# 创建用户密码文件
docker run --rm \
  --entrypoint htpasswd \
  registry:2 -Bbn testuser testpass > /opt/registry/auth/htpasswd

# 运行带认证的registry
docker run -d \
  --name secure-registry \
  -p 5000:5000 \
  -v /opt/registry:/var/lib/registry \
  -v /opt/registry/auth:/auth \
  -e "REGISTRY_AUTH=htpasswd" \
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  -e "REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd" \
  registry:2

# 登录到私有仓库
docker login localhost:5000
# 用户名：testuser
# 密码：testpass
```

### Registry API操作

```bash
# 查看仓库中的所有镜像
curl -X GET http://localhost:5000/v2/_catalog

# 查看镜像的所有标签
curl -X GET http://localhost:5000/v2/nginx/tags/list

# 获取镜像清单信息
curl -H "Accept: application/vnd.docker.distribution.manifest.v2+json" \
  http://localhost:5000/v2/nginx/manifests/latest

# 删除镜像（需要先获取digest）
# 1. 获取digest
DIGEST=$(curl -I -H "Accept: application/vnd.docker.distribution.manifest.v2+json" \
  http://localhost:5000/v2/nginx/manifests/latest | grep Docker-Content-Digest | awk '{print $2}' | tr -d '\r')

# 2. 删除镜像
curl -X DELETE http://localhost:5000/v2/nginx/manifests/$DIGEST
```

## 镜像优化技巧

### 选择合适的基础镜像

```bash
# 大小对比
docker images ubuntu:20.04        # ~72MB
docker images alpine:latest       # ~5MB
docker images scratch             # 0MB (空镜像)

# 多阶段构建示例基础镜像选择
FROM golang:1.19-alpine AS builder   # 构建阶段用完整镜像
FROM alpine:latest                   # 运行阶段用精简镜像
```

### 镜像层优化

```bash
# 不推荐：创建多个层
RUN apt-get update
RUN apt-get install -y nginx
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# 推荐：合并命令减少层数
RUN apt-get update && \
    apt-get install -y nginx curl && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean
```

### 使用.dockerignore文件

```bash
# 创建.dockerignore文件排除不需要的文件
cat > .dockerignore << EOF
.git
.gitignore
README.md
Dockerfile
.dockerignore
node_modules
npm-debug.log
.coverage
.nyc_output
EOF
```

## 实战案例

### 构建自定义Web服务器镜像

```bash
# 1. 创建工作目录
mkdir my-web-server
cd my-web-server

# 2. 创建网页文件
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>My Custom Web Server</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        .info { background: #f0f0f0; padding: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>欢迎访问我的自定义Web服务器</h1>
    <div class="info">
        <p>这是一个基于Docker的自定义Nginx镜像</p>
        <p>构建时间: $(date)</p>
        <p>服务器: Nginx + Custom Configuration</p>
    </div>
</body>
</html>
EOF

# 3. 创建自定义nginx配置
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        
        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
        
        # 自定义状态页面
        location /status {
            return 200 "Server is running!\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# 4. 启动容器并自定义
docker run -it --name temp-nginx nginx:alpine /bin/sh

# 5. 在容器内进行配置（在另一个终端）
docker cp index.html temp-nginx:/usr/share/nginx/html/
docker cp nginx.conf temp-nginx:/etc/nginx/
docker exec temp-nginx nginx -t  # 测试配置

# 6. 提交为新镜像
docker commit temp-nginx my-web-server:v1.0

# 7. 测试新镜像
docker stop temp-nginx
docker rm temp-nginx
docker run -d --name web-server -p 8080:80 my-web-server:v1.0

# 8. 验证服务
curl http://localhost:8080
curl http://localhost:8080/status

# 9. 清理
docker stop web-server
docker rm web-server
```

::: note 镜像管理最佳实践
1. **版本控制**：为镜像打上语义化版本标签，避免只使用latest
2. **安全扫描**：定期扫描镜像漏洞，及时更新基础镜像
3. **大小优化**：选择合适的基础镜像，清理缓存文件，使用多阶段构建
4. **文档记录**：为自定义镜像编写清晰的文档和使用说明
5. **自动化构建**：使用CI/CD流水线自动构建和推送镜像
:::

::: warning 注意事项
- 推送镜像前确保不包含敏感信息（密码、密钥等）
- 私有仓库在生产环境中建议使用HTTPS和认证
- 定期清理未使用的镜像以节省存储空间
- 避免在镜像中硬编码配置，使用环境变量或配置挂载
:::

## 小结

通过本章学习，你应该掌握了：

- **镜像结构**：深入理解了Docker镜像的分层存储原理
- **镜像操作**：熟练使用镜像的搜索、拉取、查看、删除等基本操作
- **自定义镜像**：学会从容器提交镜像和镜像的导入导出
- **仓库管理**：掌握了Docker Hub和私有仓库的使用方法
- **优化技巧**：了解了镜像优化和管理的最佳实践

下一章我们将学习容器的生命周期管理，包括容器的创建、启动、停止、监控等操作。