---
title: 第8章 Docker安全与最佳实践
icon: shield
date: 2024-01-08
category:
  - Docker
  - 容器化
tag:
  - Docker安全
  - 最佳实践
  - 安全配置
---

# 第8章 Docker安全与最佳实践

## 学习目标

1. 掌握 Docker 安全威胁模型和攻击向量
2. 学会配置容器安全运行环境
3. 实现镜像安全扫描和漏洞检测
4. 掌握访问控制和权限管理
5. 了解 Docker 安全最佳实践

## 知识点详解

### 8.1 Docker 安全威胁模型

#### 8.1.1 容器安全威胁

**主要威胁类型：**
- 容器逃逸
- 特权升级
- 拒绝服务攻击
- 恶意镜像
- 数据泄露
- 网络攻击

**威胁示例：**

```bash
# 危险的特权容器运行
docker run --privileged -it ubuntu bash

# 不安全的主机挂载
docker run -v /:/host ubuntu bash

# 使用不可信镜像
docker run untrusted/malicious-image
```

#### 8.1.2 攻击向量分析

**容器逃逸场景：**

```bash
# 1. 内核漏洞利用
# 检查内核版本
uname -r

# 2. Docker daemon 攻击
# 查看 Docker socket 权限
ls -la /var/run/docker.sock

# 3. 容器配置错误
docker inspect container_name | grep -i privileged
```

### 8.2 容器安全配置

#### 8.2.1 用户权限控制

**非 root 用户运行：**

```dockerfile
# Dockerfile 安全配置
FROM ubuntu:20.04

# 创建非特权用户
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 设置工作目录权限
WORKDIR /app
COPY app.py .
RUN chown -R appuser:appuser /app

# 切换到非特权用户
USER appuser

CMD ["python", "app.py"]
```

**运行时用户控制：**

```bash
# 指定用户 ID 运行
docker run --user 1000:1000 myapp

# 使用用户名运行
docker run --user appuser myapp

# 验证当前用户
docker exec container_id whoami
```

#### 8.2.2 文件系统安全

**只读文件系统：**

```bash
# 只读根文件系统
docker run --read-only ubuntu

# 临时文件系统挂载
docker run --read-only --tmpfs /tmp ubuntu

# 只读挂载
docker run -v /host/path:/container/path:ro ubuntu
```

**文件权限控制：**

```dockerfile
# 设置安全文件权限
COPY --chmod=644 config.yml /app/
COPY --chmod=755 entrypoint.sh /usr/local/bin/

# 移除不必要的 setuid 程序
RUN find / -perm /6000 -type f -exec ls -ld {} \; && \
    find / -perm /6000 -type f -exec rm {} \;
```

#### 8.2.3 Capabilities 控制

**移除危险 capabilities：**

```bash
# 移除所有 capabilities
docker run --cap-drop=ALL ubuntu

# 仅保留必要的 capabilities
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx

# 查看容器 capabilities
docker run --rm ubuntu capsh --print
```

**常用 capabilities 说明：**

```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    image: nginx
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
      - CHOWN
      - SETUID
      - SETGID
```

### 8.3 镜像安全

#### 8.3.1 镜像扫描

**使用 Docker Scout：**

```bash
# 启用 Docker Scout
docker scout quickview

# 扫描本地镜像
docker scout cves nginx:latest

# 扫描并获取详细报告
docker scout cves --format sarif nginx:latest > report.sarif

# 比较镜像安全性
docker scout compare nginx:1.20 --to nginx:latest
```

**使用 Trivy 扫描：**

```bash
# 安装 Trivy
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# 扫描镜像漏洞
trivy image nginx:latest

# 扫描高危漏洞
trivy image --severity HIGH,CRITICAL nginx:latest

# 输出 JSON 格式
trivy image --format json --output result.json nginx:latest
```

#### 8.3.2 安全基础镜像

**选择安全基础镜像：**

```dockerfile
# 使用官方精简镜像
FROM nginx:alpine

# 使用无发行版镜像
FROM gcr.io/distroless/java:11

# 多阶段构建减少攻击面
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER node
CMD ["node", "server.js"]
```

**镜像加固：**

```dockerfile
FROM ubuntu:20.04

# 更新包管理器
RUN apt-get update && apt-get upgrade -y

# 移除不必要的包
RUN apt-get autoremove -y && apt-get autoclean

# 清理缓存
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# 设置安全配置
RUN sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS 90/' /etc/login.defs
```

### 8.4 网络安全

#### 8.4.1 网络隔离

**自定义网络：**

```bash
# 创建隔离网络
docker network create --driver bridge isolated-net

# 运行容器在隔离网络
docker run --network isolated-net nginx

# 网络间通信控制
docker network create frontend
docker network create backend

# 前端容器
docker run --name web --network frontend nginx

# 后端容器连接多个网络
docker run --name api --network backend mysql
docker network connect frontend api
```

#### 8.4.2 端口安全

**最小化端口暴露：**

```bash
# 只绑定本地接口
docker run -p 127.0.0.1:8080:80 nginx

# 使用非标准端口
docker run -p 8443:443 nginx

# 动态端口分配
docker run -P nginx
```

**网络策略：**

```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    image: nginx
    networks:
      - frontend
    ports:
      - "127.0.0.1:8080:80"
  
  api:
    image: myapi
    networks:
      - frontend
      - backend
    expose:
      - "3000"
  
  db:
    image: postgres
    networks:
      - backend
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true

secrets:
  db_password:
    file: ./db_password.txt
```

### 8.5 密钥管理

#### 8.5.1 Docker Secrets

**密钥管理：**

```bash
# 创建密钥
echo "mypassword" | docker secret create db_password -

# 查看密钥
docker secret ls

# 在服务中使用密钥
docker service create --name web --secret db_password nginx
```

**在 Compose 中使用：**

```yaml
version: '3.8'
services:
  db:
    image: postgres
    secrets:
      - db_password
      - db_user
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
      - POSTGRES_USER_FILE=/run/secrets/db_user

secrets:
  db_password:
    external: true
  db_user:
    external: true
```

#### 8.5.2 环境变量安全

**安全的环境变量处理：**

```bash
# 使用文件而非命令行传递敏感信息
docker run --env-file .env myapp

# .env 文件内容
DATABASE_URL=postgresql://user:pass@localhost/db
API_KEY=secret_key_here
```

**运行时密钥注入：**

```dockerfile
FROM alpine
RUN apk add --no-cache curl
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
```

```bash
#!/bin/sh
# entrypoint.sh
# 从外部密钥管理系统获取密钥
export API_KEY=$(curl -s "$SECRET_SERVICE_URL/api-key")
exec "$@"
```

### 8.6 安全监控与审计

#### 8.6.1 容器运行时监控

**使用 Falco 监控：**

```yaml
# falco-rules.yaml
- rule: Shell in Container
  desc: Detect shell execution in container
  condition: spawned_process and container and shell_procs
  output: Shell spawned in container (user=%user.name container_id=%container.id image=%container.image.repository:%container.image.tag)
  priority: WARNING

- rule: Sensitive File Access
  desc: Detect access to sensitive files
  condition: open_read and fd.filename in (/etc/passwd, /etc/shadow)
  output: Sensitive file accessed (file=%fd.name user=%user.name container=%container.id)
  priority: HIGH
```

**Docker Bench Security：**

```bash
# 运行安全基准测试
docker run --rm --net host --pid host --userns host --cap-add audit_control \
  -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
  -v /etc:/etc:ro \
  -v /usr/bin/containerd:/usr/bin/containerd:ro \
  -v /usr/bin/runc:/usr/bin/runc:ro \
  -v /usr/lib/systemd:/usr/lib/systemd:ro \
  -v /var/lib:/var/lib:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --label docker_bench_security \
  docker/docker-bench-security
```

#### 8.6.2 日志审计

**启用审计日志：**

```json
# /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "experimental": true,
  "debug": true
}
```

**日志分析示例：**

```bash
# 查看容器日志
docker logs --details container_name

# 监控实时日志
docker logs -f --tail 100 container_name

# 使用 journald 收集系统日志
journalctl -u docker.service -f
```

### 8.7 最佳实践总结

#### 8.7.1 开发阶段

**Dockerfile 最佳实践：**

```dockerfile
# 1. 使用官方基础镜像
FROM node:16-alpine

# 2. 设置非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 3. 最小化层数
RUN apk add --no-cache libc6-compat && \
    apk update

# 4. 复制文件时设置正确权限
COPY --chown=nextjs:nodejs package*.json ./

# 5. 切换到非特权用户
USER nextjs

# 6. 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 7. 使用 COPY 而非 ADD
COPY . .

# 8. 明确暴露端口
EXPOSE 3000

# 9. 使用 exec 形式
CMD ["node", "server.js"]
```

#### 8.7.2 部署阶段

**安全部署清单：**

```yaml
# security-checklist.yml
version: '3.8'
services:
  app:
    image: myapp:latest
    # 1. 使用非特权用户
    user: "1001:1001"
    
    # 2. 只读根文件系统
    read_only: true
    
    # 3. 移除所有 capabilities
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    
    # 4. 资源限制
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    
    # 5. 健康检查
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    
    # 6. 安全选项
    security_opt:
      - no-new-privileges:true
    
    # 7. 临时文件系统
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
    
    # 8. 环境变量从文件读取
    env_file:
      - .env
    
    # 9. 网络隔离
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.20.0.0/16
```

#### 8.7.3 运维阶段

**持续安全监控：**

```bash
#!/bin/bash
# security-monitor.sh

# 1. 定期扫描镜像
trivy image --format table myapp:latest

# 2. 检查运行容器安全状态
docker ps --format "table {{.ID}}\t{{.Image}}\t{{.Status}}" | while read line; do
    container_id=$(echo $line | awk '{print $1}')
    if [[ $container_id != "CONTAINER" ]]; then
        echo "Checking container: $container_id"
        docker inspect $container_id | jq '.[] | {Privileged: .HostConfig.Privileged, User: .Config.User}'
    fi
done

# 3. 监控资源使用
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# 4. 检查网络连接
netstat -tulpn | grep docker
```

## 实战案例

### 案例1：Web 应用安全加固

**场景描述：**
对一个 Node.js Web 应用进行全面的安全加固。

**实现步骤：**

1. **安全 Dockerfile：**

```dockerfile
# 多阶段构建
FROM node:16-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:16-alpine AS runner
WORKDIR /app

# 创建非特权用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制依赖
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

# 设置环境变量
ENV NODE_ENV production

# 切换用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

2. **安全部署配置：**

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "127.0.0.1:3000:3000"
    read_only: true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    security_opt:
      - no-new-privileges:true
    tmpfs:
      - /tmp:noexec,nosuid,size=50m
    environment:
      - NODE_ENV=production
    secrets:
      - jwt_secret
      - db_password
    networks:
      - app-network
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

secrets:
  jwt_secret:
    external: true
  db_password:
    external: true

networks:
  app-network:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.30.0.0/16
```

3. **安全监控脚本：**

```bash
#!/bin/bash
# web-security-check.sh

echo "=== Web Application Security Check ==="

# 检查容器状态
echo "1. Container Security Status:"
docker inspect web_container | jq '{
  Privileged: .HostConfig.Privileged,
  ReadonlyRootfs: .HostConfig.ReadonlyRootfs,
  User: .Config.User,
  Capabilities: .HostConfig.CapDrop
}'

# 检查网络连接
echo "2. Network Connections:"
docker exec web_container netstat -tulpn

# 检查进程
echo "3. Running Processes:"
docker exec web_container ps aux

# 扫描漏洞
echo "4. Vulnerability Scan:"
trivy image --severity HIGH,CRITICAL web:latest

echo "Security check completed."
```

### 案例2：微服务安全架构

**场景描述：**
构建一个安全的微服务架构，包含前端、API 服务和数据库。

**实现方案：**

```yaml
version: '3.8'
services:
  # 前端服务
  frontend:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    networks:
      - frontend-net
    deploy:
      resources:
        limits:
          memory: 128M
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /var/cache/nginx:noexec,nosuid,size=50m
      - /var/run:noexec,nosuid,size=10m

  # API 网关
  api-gateway:
    image: traefik:v2.9
    command:
      - --api.insecure=false
      - --providers.docker=true
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.myresolver.acme.tlschallenge=true
    ports:
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - frontend-net
      - api-net
    security_opt:
      - no-new-privileges:true

  # 用户服务
  user-service:
    build: ./services/user
    networks:
      - api-net
      - db-net
    secrets:
      - user_db_password
      - jwt_secret
    deploy:
      resources:
        limits:
          memory: 256M
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=20m

  # 数据库
  database:
    image: postgres:14-alpine
    networks:
      - db-net
    volumes:
      - db_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_root_password
    secrets:
      - db_root_password
      - user_db_password
    security_opt:
      - no-new-privileges:true

networks:
  frontend-net:
    driver: bridge
  api-net:
    driver: bridge
  db-net:
    driver: bridge
    internal: true

secrets:
  jwt_secret:
    external: true
  db_root_password:
    external: true
  user_db_password:
    external: true

volumes:
  db_data:
    driver: local
```

## 总结

Docker 安全是一个多层面的问题，需要从镜像构建、容器运行、网络隔离、密钥管理等多个角度进行综合防护。通过遵循安全最佳实践，可以显著降低容器化应用的安全风险：

1. **最小权限原则**：使用非特权用户、移除不必要的 capabilities
2. **深度防御**：多层安全控制，网络隔离，访问控制
3. **持续监控**：实时监控容器行为，定期安全扫描
4. **密钥管理**：使用专门的密钥管理服务，避免硬编码
5. **镜像安全**：使用可信镜像源，定期更新和扫描

记住，容器安全不是一次性的工作，而是需要在整个应用生命周期中持续关注和改进的过程。