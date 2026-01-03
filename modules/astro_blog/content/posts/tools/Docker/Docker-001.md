---
title: "第 1 章：Docker基础入门"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第 1 章：Docker基础入门

::: tip 学习目标
- 理解容器化技术的概念和优势
- 掌握Docker的核心架构和基本组件
- 完成Docker环境的安装和配置
- 学会使用基本的Docker命令操作
:::

## 知识点

### 什么是容器化技术

容器化是一种轻量级的虚拟化技术，它将应用程序及其依赖项打包在一个可移植的容器中，确保应用在任何环境中都能一致地运行。

**容器化技术的核心特点：**
- **轻量级**：相比传统虚拟机，容器共享主机操作系统内核，资源占用更少
- **可移植性**：一次构建，随处运行，解决了"在我机器上能跑"的问题
- **隔离性**：容器之间相互隔离，提供安全的运行环境
- **快速启动**：秒级启动，远快于传统虚拟机

### Docker架构概述

Docker采用客户端-服务器(C/S)架构模式，主要由以下组件构成：

| 组件 | 作用 | 说明 |
|------|------|------|
| Docker Client | 客户端 | 用户与Docker交互的主要方式，发送命令给Docker Daemon |
| Docker Daemon | 守护进程 | Docker的核心服务，处理Docker API请求，管理镜像、容器等 |
| Docker Images | 镜像 | 只读模板，用于创建Docker容器 |
| Docker Container | 容器 | 镜像的运行实例，可启动、停止、移动或删除 |
| Docker Registry | 镜像仓库 | 存储Docker镜像的地方，如Docker Hub |

### 容器 vs 虚拟机

```text
传统虚拟机架构：
┌─────────────────────────────────────────┐
│          应用A    │    应用B           │
│    ┌─────────────┐│┌─────────────┐     │
│    │  Guest OS   │││  Guest OS   │     │
│    └─────────────┘││└─────────────┘     │
│         │         ││         │           │
├─────────────────────────────────────────┤
│            Hypervisor                    │
├─────────────────────────────────────────┤
│            Host OS                       │
├─────────────────────────────────────────┤
│            Hardware                      │
└─────────────────────────────────────────┘

Docker容器架构：
┌─────────────────────────────────────────┐
│        应用A      │      应用B          │
│    ┌──────────────┼──────────────┐     │
│    │  Container A │ Container B  │     │
│    └──────────────┼──────────────┘     │
├─────────────────────────────────────────┤
│           Docker Engine                  │
├─────────────────────────────────────────┤
│             Host OS                      │
├─────────────────────────────────────────┤
│            Hardware                      │
└─────────────────────────────────────────┘
```

::: note 核心区别
- **资源开销**：容器直接运行在宿主机内核上，无需额外的操作系统
- **启动时间**：容器启动时间通常在秒级，虚拟机需要分钟级
- **密度**：同样的硬件资源可以运行更多的容器
- **隔离级别**：虚拟机提供更强的隔离性，容器隔离性相对较弱但足够安全
:::

## Docker安装与配置

### Linux系统安装

```bash
# Ubuntu/Debian系统安装Docker
# 更新包索引
sudo apt-get update

# 安装必要的包
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加Docker官方仓库
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

# 验证安装是否成功
sudo docker run hello-world
```

### CentOS/RHEL系统安装

```bash
# 安装必要的工具
sudo yum install -y yum-utils

# 添加Docker仓库
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

# 安装Docker Engine
sudo yum install docker-ce docker-ce-cli containerd.io

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
sudo docker run hello-world
```

### Windows和macOS安装

```bash
# Windows用户：
# 下载Docker Desktop for Windows
# 地址：https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

# macOS用户：
# 下载Docker Desktop for Mac
# 地址：https://desktop.docker.com/mac/main/amd64/Docker.dmg

# 安装完成后验证
docker --version
docker-compose --version
```

### 配置Docker用户权限

```bash
# 将当前用户添加到docker组（避免每次使用sudo）
sudo usermod -aG docker $USER

# 重新登录或使用以下命令生效
newgrp docker

# 测试是否可以无sudo运行
docker run hello-world
```

## 基本命令操作

### 镜像相关命令

```bash
# 查看Docker版本信息
docker --version
docker version    # 详细版本信息
docker info      # 系统信息

# 搜索镜像
docker search nginx
docker search --filter stars=100 nginx  # 过滤100星以上的镜像

# 拉取镜像
docker pull nginx                    # 拉取最新版nginx
docker pull nginx:1.20             # 拉取指定版本
docker pull ubuntu:20.04           # 拉取Ubuntu 20.04

# 查看本地镜像
docker images                       # 列出所有镜像
docker images nginx                # 列出nginx相关镜像
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"  # 格式化输出

# 删除镜像
docker rmi nginx:latest             # 删除指定镜像
docker rmi $(docker images -q)     # 删除所有镜像
docker image prune                  # 清理无用镜像
```

### 容器相关命令

```bash
# 运行容器
docker run hello-world                      # 运行并退出
docker run -it ubuntu:20.04 /bin/bash     # 交互式运行Ubuntu
docker run -d nginx                        # 后台运行nginx
docker run -d -p 8080:80 nginx            # 端口映射运行nginx
docker run -d --name my-nginx nginx       # 指定容器名称

# 查看容器
docker ps                          # 查看运行中的容器
docker ps -a                       # 查看所有容器（包括停止的）
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"  # 格式化输出

# 容器操作
docker start my-nginx              # 启动容器
docker stop my-nginx               # 停止容器
docker restart my-nginx            # 重启容器
docker pause my-nginx              # 暂停容器
docker unpause my-nginx            # 恢复容器

# 进入容器
docker exec -it my-nginx /bin/bash        # 进入运行中的容器
docker attach my-nginx                     # 连接到容器（不推荐）

# 查看容器日志
docker logs my-nginx               # 查看容器日志
docker logs -f my-nginx            # 实时跟踪日志
docker logs --tail 100 my-nginx   # 查看最后100行日志

# 删除容器
docker rm my-nginx                 # 删除停止的容器
docker rm -f my-nginx              # 强制删除运行中的容器
docker rm $(docker ps -aq)        # 删除所有容器
docker container prune             # 清理停止的容器
```

### 实用命令组合

```bash
# 一键清理Docker环境
docker system prune -a             # 清理所有未使用的镜像、容器、网络
docker system df                   # 查看Docker磁盘使用情况

# 批量操作
docker stop $(docker ps -q)       # 停止所有运行中的容器
docker rm $(docker ps -aq)        # 删除所有容器
docker rmi $(docker images -q)    # 删除所有镜像

# 容器资源监控
docker stats                      # 实时查看容器资源使用情况
docker stats my-nginx             # 查看指定容器资源使用

# 容器详细信息
docker inspect my-nginx           # 查看容器详细配置信息
docker port my-nginx              # 查看容器端口映射
docker top my-nginx               # 查看容器进程信息
```

## 实战演练

### Hello World示例

```bash
# 运行第一个Docker容器
docker run hello-world

# 输出解释：
# 1. Docker客户端联系Docker守护进程
# 2. 守护进程从Docker Hub拉取hello-world镜像
# 3. 创建新容器并运行镜像中的程序
# 4. 程序输出消息后容器停止
```

### Web服务器示例

```bash
# 运行Nginx Web服务器
docker run -d --name web-server -p 8080:80 nginx

# 验证服务运行
curl http://localhost:8080
# 或在浏览器中访问 http://localhost:8080

# 查看容器状态
docker ps

# 查看容器日志
docker logs web-server

# 进入容器内部
docker exec -it web-server /bin/bash

# 在容器内部执行命令
ls /usr/share/nginx/html/    # 查看网页文件
cat /etc/nginx/nginx.conf    # 查看nginx配置

# 退出容器
exit

# 停止并删除容器
docker stop web-server
docker rm web-server
```

### 数据持久化示例

```bash
# 创建数据卷并运行容器
docker run -d --name nginx-with-volume \
    -p 8080:80 \
    -v /tmp/nginx-data:/usr/share/nginx/html \
    nginx

# 在宿主机创建自定义网页
echo "<h1>Hello from Docker!</h1>" > /tmp/nginx-data/index.html

# 访问网页查看效果
curl http://localhost:8080

# 停止容器但数据依然保存在宿主机
docker stop nginx-with-volume
ls /tmp/nginx-data/  # 文件依然存在
```

## 常见问题解决

### 权限问题

```bash
# 问题：Got permission denied while trying to connect to the Docker daemon socket
# 解决方案：将用户加入docker组
sudo usermod -aG docker $USER
newgrp docker

# 或者临时使用sudo
sudo docker run hello-world
```

### 网络连接问题

```bash
# 问题：无法拉取镜像或连接超时
# 解决方案：配置国内镜像源

# 创建或编辑daemon配置文件
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
    "registry-mirrors": [
        "https://registry.docker-cn.com",
        "https://docker.mirrors.ustc.edu.cn",
        "https://hub-mirror.c.163.com"
    ]
}
EOF

# 重启Docker服务
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证配置
docker info | grep "Registry Mirrors" -A 3
```

### 存储空间问题

```bash
# 问题：磁盘空间不足
# 解决方案：清理Docker资源

# 查看磁盘使用情况
docker system df

# 清理未使用的资源
docker system prune -a    # 清理所有未使用的镜像、容器、网络、构建缓存

# 分别清理
docker container prune    # 清理停止的容器
docker image prune        # 清理无用镜像
docker network prune      # 清理无用网络
docker volume prune       # 清理无用数据卷
```

::: warning 注意事项
- Docker需要64位操作系统支持
- 在生产环境中建议使用具体版本标签而不是`latest`
- 定期清理未使用的Docker资源以释放磁盘空间
- 容器默认以root用户运行，注意安全性
:::

## 小结

通过本章学习，你应该掌握了：

- **容器化概念**：理解了容器化技术的优势和应用场景
- **Docker架构**：了解了Docker的核心组件和工作原理
- **环境搭建**：完成了Docker的安装和基础配置
- **基础操作**：掌握了镜像和容器的基本管理命令
- **实战经验**：通过实际案例加深了对Docker的理解

下一章我们将深入学习Docker镜像管理，包括镜像的分层结构、构建过程和仓库管理。