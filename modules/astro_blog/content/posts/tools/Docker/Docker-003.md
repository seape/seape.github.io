---
title: "第 3 章：容器生命周期管理"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第 3 章：容器生命周期管理

::: tip 学习目标
- 掌握容器的创建、启动、停止和删除
- 学会容器的端口映射和数据挂载
- 理解容器的生命周期状态转换
- 熟练进行容器的监控和日志查看
:::

## 知识点

### 容器生命周期状态

Docker容器从创建到销毁会经历多个状态，理解这些状态有助于更好地管理容器。

```text
容器状态转换图：
┌─────────┐    docker create    ┌─────────┐    docker start     ┌─────────┐
│   无    │ ──────────────────→ │ Created │ ──────────────────→ │ Running │
└─────────┘                     └─────────┘                     └─────────┘
                                      │                               │
                                      │ docker run (create + start)  │
                                      └──────────────────────────────┘
                                                                      │
                                                                      ▼
┌─────────┐    docker rm       ┌─────────┐    docker stop/kill   ┌─────────┐
│ Removed │ ◄─────────────────  │ Exited  │ ◄─────────────────── │ Paused  │
└─────────┘                     └─────────┘                       └─────────┘
                                      ▲                               │
                                      │        docker pause          │
                                      │◄─────────────────────────────┘
                                      │        docker unpause
                                      └──────────────────────────────►
```

### 容器状态详解

| 状态 | 说明 | 相关命令 |
|------|------|----------|
| Created | 已创建但未启动 | docker create |
| Running | 正在运行 | docker start, docker run |
| Paused | 已暂停 | docker pause |
| Restarting | 正在重启 | docker restart |
| Exited | 已退出 | docker stop, docker kill |
| Dead | 已死亡（异常状态） | 系统异常 |
| Removing | 正在删除 | docker rm |

### 容器运行模式

Docker容器支持多种运行模式：

**前台模式（Foreground）**
- 容器在前台运行，控制台显示容器输出
- 使用 Ctrl+C 可以停止容器
- 适合开发和调试

**后台模式（Detached）**
- 容器在后台运行，不占用当前终端
- 使用 `-d` 参数启动
- 适合生产环境服务

**交互模式（Interactive）**
- 保持STDIN打开，分配伪终端
- 使用 `-it` 参数启动
- 适合需要用户交互的场景

## 容器基本操作

### 创建和运行容器

```bash
# 创建容器（不启动）
docker create --name my-nginx nginx:latest

# 启动已创建的容器
docker start my-nginx

# 一步到位：创建并启动容器
docker run nginx:latest

# 后台运行容器
docker run -d --name web-server nginx:latest

# 交互式运行容器
docker run -it ubuntu:20.04 /bin/bash

# 指定容器名称
docker run -d --name my-web-server nginx:latest

# 运行完即删除容器
docker run --rm hello-world

# 设置重启策略
docker run -d --restart=always --name persistent-nginx nginx:latest
docker run -d --restart=on-failure:3 --name retry-nginx nginx:latest

# 限制资源使用
docker run -d --name limited-nginx \
    --memory=512m \
    --cpus=0.5 \
    nginx:latest
```

### 容器状态管理

```bash
# 查看容器状态
docker ps                          # 查看运行中的容器
docker ps -a                       # 查看所有容器
docker ps --filter "status=running" # 过滤运行中的容器
docker ps --filter "name=nginx"    # 过滤名称包含nginx的容器

# 启动和停止容器
docker start my-nginx              # 启动容器
docker stop my-nginx               # 优雅停止容器（发送SIGTERM信号）
docker kill my-nginx               # 强制停止容器（发送SIGKILL信号）

# 重启容器
docker restart my-nginx            # 重启容器

# 暂停和恢复容器
docker pause my-nginx              # 暂停容器中的所有进程
docker unpause my-nginx            # 恢复容器中的所有进程

# 等待容器退出
docker wait my-nginx               # 阻塞等待容器退出，返回退出码
```

### 容器信息查看

```bash
# 查看容器详细信息
docker inspect my-nginx

# 查看容器资源使用情况
docker stats my-nginx              # 实时显示资源使用
docker stats --no-stream my-nginx  # 显示一次资源使用情况

# 查看容器进程
docker top my-nginx                # 查看容器内的进程

# 查看容器端口映射
docker port my-nginx               # 显示容器的端口映射

# 查看容器文件系统变化
docker diff my-nginx               # 显示容器文件系统的变化
```

### 容器交互操作

```bash
# 进入运行中的容器
docker exec -it my-nginx /bin/bash    # 推荐方式，新建进程
docker attach my-nginx                # 连接到容器主进程（不推荐）

# 在容器中执行单个命令
docker exec my-nginx ls -la /etc/nginx
docker exec my-nginx cat /etc/nginx/nginx.conf
docker exec my-nginx nginx -t         # 测试nginx配置

# 以特定用户身份执行命令
docker exec -u root my-nginx whoami   # 以root用户执行
docker exec -u 1000:1000 my-nginx id  # 以指定UID:GID执行

# 设置工作目录
docker exec -w /etc/nginx my-nginx pwd
```

## 端口映射

### 基本端口映射

```bash
# 映射到随机端口
docker run -d -P nginx:latest         # 自动映射所有EXPOSE端口到随机端口

# 映射到指定端口
docker run -d -p 8080:80 nginx:latest        # 主机8080端口 -> 容器80端口
docker run -d -p 127.0.0.1:8080:80 nginx    # 只绑定本地接口

# 映射多个端口
docker run -d \
    -p 8080:80 \
    -p 8443:443 \
    nginx:latest

# 映射UDP端口
docker run -d -p 53:53/udp alpine:latest    # 映射UDP端口
```

### 端口映射管理

```bash
# 查看端口映射
docker port my-nginx                   # 查看容器端口映射
docker ps                             # 在容器列表中查看端口

# 动态添加端口映射（需要重新创建容器）
# 1. 提交当前容器为镜像
docker commit my-nginx my-nginx:backup

# 2. 停止并删除原容器
docker stop my-nginx
docker rm my-nginx

# 3. 用新的端口映射重新创建容器
docker run -d --name my-nginx -p 8080:80 -p 8443:443 my-nginx:backup

# 使用iptables动态添加端口映射（高级技巧）
# 查找容器IP地址
CONTAINER_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' my-nginx)

# 添加iptables规则
sudo iptables -t nat -A DOCKER -p tcp --dport 9090 -j DNAT --to-destination $CONTAINER_IP:80
```

### 端口映射实例

```bash
# Web服务器示例
docker run -d --name web-server \
    -p 80:80 \
    -p 443:443 \
    nginx:latest

# 数据库服务示例
docker run -d --name mysql-server \
    -p 3306:3306 \
    -e MYSQL_ROOT_PASSWORD=mypassword \
    mysql:8.0

# 开发环境示例（Node.js应用）
docker run -d --name nodejs-app \
    -p 3000:3000 \
    -v $(pwd):/app \
    -w /app \
    node:16 npm start
```

## 数据挂载

### 挂载类型对比

| 挂载类型 | 语法 | 用途 | 持久性 |
|----------|------|------|--------|
| Bind Mount | `-v /host/path:/container/path` | 挂载主机目录 | 高 |
| Named Volume | `-v volume-name:/container/path` | Docker管理的卷 | 高 |
| Anonymous Volume | `-v /container/path` | 匿名卷 | 中 |
| tmpfs Mount | `--tmpfs /container/path` | 内存文件系统 | 低 |

### 目录绑定挂载

```bash
# 绑定挂载主机目录
docker run -d --name nginx-with-content \
    -p 8080:80 \
    -v /home/user/html:/usr/share/nginx/html \
    nginx:latest

# 只读挂载
docker run -d --name nginx-readonly \
    -p 8080:80 \
    -v /home/user/html:/usr/share/nginx/html:ro \
    nginx:latest

# 挂载多个目录
docker run -d --name nginx-multi-mount \
    -p 8080:80 \
    -v /home/user/html:/usr/share/nginx/html \
    -v /home/user/conf:/etc/nginx/conf.d \
    -v /home/user/logs:/var/log/nginx \
    nginx:latest

# 使用相对路径
docker run -d --name app-dev \
    -p 3000:3000 \
    -v $(pwd):/app \
    -w /app \
    node:16 npm start
```

### 数据卷管理

```bash
# 创建命名数据卷
docker volume create my-data-volume
docker volume create --driver local web-data

# 查看数据卷
docker volume ls
docker volume inspect my-data-volume

# 使用命名数据卷
docker run -d --name mysql-with-volume \
    -v my-data-volume:/var/lib/mysql \
    -e MYSQL_ROOT_PASSWORD=password \
    mysql:8.0

# 数据卷备份
# 1. 创建备份容器
docker run --rm \
    -v my-data-volume:/source \
    -v $(pwd):/backup \
    ubuntu tar czf /backup/backup.tar.gz -C /source .

# 2. 恢复数据卷
docker run --rm \
    -v my-data-volume:/target \
    -v $(pwd):/backup \
    ubuntu tar xzf /backup/backup.tar.gz -C /target

# 清理未使用的数据卷
docker volume prune
```

### tmpfs挂载

```bash
# 创建内存文件系统挂载
docker run -d --name app-with-tmpfs \
    --tmpfs /tmp:rw,size=100m,mode=1777 \
    nginx:latest

# 查看tmpfs挂载
docker inspect app-with-tmpfs | grep -A 5 "Tmpfs"
```

## 容器监控和日志

### 容器日志管理

```bash
# 查看容器日志
docker logs my-nginx                   # 查看所有日志
docker logs -f my-nginx                # 实时跟踪日志
docker logs --tail 50 my-nginx         # 显示最后50行
docker logs --since="2023-01-01" my-nginx  # 显示指定时间后的日志
docker logs --until="2023-01-02" my-nginx  # 显示指定时间前的日志

# 显示时间戳
docker logs -t my-nginx                # 显示时间戳

# 日志格式化
docker logs --details my-nginx         # 显示额外的详细信息

# 限制日志输出
docker logs --tail 100 -f my-nginx | head -20
```

### 日志驱动配置

```bash
# 配置日志驱动（在daemon.json中）
sudo tee /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# 重启Docker服务
sudo systemctl restart docker

# 为特定容器设置日志驱动
docker run -d --name nginx-custom-log \
    --log-driver json-file \
    --log-opt max-size=10m \
    --log-opt max-file=3 \
    nginx:latest

# 禁用日志
docker run -d --name nginx-no-logs \
    --log-driver none \
    nginx:latest

# 使用syslog驱动
docker run -d --name nginx-syslog \
    --log-driver syslog \
    --log-opt syslog-address=tcp://192.168.1.100:514 \
    nginx:latest
```

### 容器性能监控

```bash
# 实时监控容器资源使用
docker stats                          # 监控所有运行中的容器
docker stats my-nginx                  # 监控特定容器
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" # 格式化输出

# 一次性查看资源使用情况
docker stats --no-stream my-nginx

# 监控容器事件
docker events                         # 实时显示Docker事件
docker events --filter container=my-nginx  # 过滤特定容器事件
docker events --since="1h"            # 显示最近1小时的事件
```

### 高级监控工具

```bash
# 使用ctop监控容器（需要安装ctop）
sudo wget https://github.com/bcicen/ctop/releases/download/v0.7.7/ctop-0.7.7-linux-amd64 -O /usr/local/bin/ctop
sudo chmod +x /usr/local/bin/ctop
ctop

# 使用docker system命令
docker system df                      # 查看Docker磁盘使用情况
docker system events                  # 查看系统事件
docker system prune                   # 清理系统

# 导出容器性能数据
docker stats --format "{{.Container}},{{.CPUPerc}},{{.MemUsage}}" --no-stream > stats.csv
```

## 实战演练

### Web应用完整部署

```bash
# 1. 创建项目目录结构
mkdir -p ~/docker-webapp/{html,conf,logs}

# 2. 创建网页内容
cat > ~/docker-webapp/html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Docker Web App</title>
    <style>
        body { font-family: Arial; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .status { background: #e8f5e8; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐳 Docker容器化Web应用</h1>
        <div class="status">
            <h3>✅ 应用状态：运行中</h3>
            <p>服务器时间：<span id="time"></span></p>
        </div>
        <h2>功能特性：</h2>
        <ul>
            <li>✨ 容器化部署</li>
            <li>🔄 数据持久化</li>
            <li>📊 实时监控</li>
            <li>📝 日志管理</li>
        </ul>
    </div>
    <script>
        document.getElementById('time').textContent = new Date().toLocaleString();
        setInterval(() => {
            document.getElementById('time').textContent = new Date().toLocaleString();
        }, 1000);
    </script>
</body>
</html>
EOF

# 3. 创建nginx配置
cat > ~/docker-webapp/conf/default.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    # 访问日志
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ =404;
    }
    
    # API接口示例
    location /api/status {
        add_header Content-Type application/json;
        return 200 '{"status":"running","timestamp":"$time_iso8601","server":"$hostname"}';
    }
    
    # 健康检查端点
    location /health {
        access_log off;
        add_header Content-Type text/plain;
        return 200 "OK";
    }
}
EOF

# 4. 启动Web应用容器
docker run -d --name webapp \
    --restart=unless-stopped \
    -p 8080:80 \
    -v ~/docker-webapp/html:/usr/share/nginx/html:ro \
    -v ~/docker-webapp/conf:/etc/nginx/conf.d:ro \
    -v ~/docker-webapp/logs:/var/log/nginx \
    --log-opt max-size=10m \
    --log-opt max-file=3 \
    nginx:alpine

# 5. 验证部署
echo "等待容器启动..."
sleep 3

# 检查容器状态
docker ps | grep webapp

# 测试Web服务
curl -s http://localhost:8080 | grep -o '<title>[^<]*'
curl -s http://localhost:8080/api/status | jq .
curl -s http://localhost:8080/health

# 6. 监控和管理
echo "=== 容器信息 ==="
docker inspect webapp | jq '.[0].State'

echo "=== 资源使用 ==="
docker stats --no-stream webapp

echo "=== 端口映射 ==="
docker port webapp

echo "=== 最近日志 ==="
docker logs --tail 10 webapp
```

### 开发环境搭建

```bash
# 1. Node.js开发环境
mkdir ~/my-node-app
cd ~/my-node-app

# 创建package.json
cat > package.json << 'EOF'
{
  "name": "docker-node-app",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}
EOF

# 创建应用代码
cat > server.js << 'EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        message: 'Hello from Dockerized Node.js App!',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
EOF

# 2. 运行开发容器
docker run -it --rm \
    --name node-dev \
    -p 3000:3000 \
    -v $(pwd):/app \
    -w /app \
    -e NODE_ENV=development \
    node:16-alpine \
    sh -c "npm install && npm run dev"

# 在另一个终端测试
curl http://localhost:3000
curl http://localhost:3000/health
```

::: note 容器管理最佳实践
1. **命名约定**：为容器使用有意义的名称，便于管理和识别
2. **重启策略**：生产环境使用适当的重启策略，如`--restart=unless-stopped`
3. **资源限制**：为容器设置合理的CPU和内存限制
4. **日志管理**：配置日志轮转，避免日志文件过大
5. **监控告警**：建立容器监控和告警机制
6. **安全配置**：避免以root用户运行应用，使用只读挂载保护配置文件
:::

::: warning 注意事项
- 容器删除后，未持久化的数据将丢失
- 端口映射冲突会导致容器启动失败
- 过多的容器会消耗系统资源，定期清理停止的容器
- 生产环境建议使用编排工具而非单独管理容器
:::

## 小结

通过本章学习，你应该掌握了：

- **容器状态管理**：理解容器的生命周期和状态转换
- **容器操作**：熟练使用容器的创建、启动、停止、删除等操作
- **端口映射**：掌握容器与主机的端口映射配置
- **数据挂载**：学会使用各种挂载方式实现数据持久化
- **监控日志**：能够有效监控容器性能和管理日志

下一章我们将学习Dockerfile构建技术，学会自动化构建定制化的Docker镜像。