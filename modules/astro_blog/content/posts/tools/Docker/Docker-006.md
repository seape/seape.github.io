---
title: "第 6 章：Docker Compose编排"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第 6 章：Docker Compose编排

::: tip 学习目标
- 理解服务编排的概念和重要性
- 掌握docker-compose.yml文件编写
- 学会多容器应用的部署和管理
- 熟练使用Compose进行开发环境搭建
:::

## 知识点

### 什么是Docker Compose

Docker Compose是Docker的官方编排工具，用于定义和运行多容器Docker应用程序。通过YAML文件来配置应用程序的服务，然后使用一个命令就可以从配置中创建并启动所有服务。

**Compose的核心概念：**
- **Service（服务）**：应用程序的一个组件，如数据库、Web服务器等
- **Project（项目）**：由一组关联的服务组成的完整应用
- **Container（容器）**：服务的运行实例

### Compose文件结构

```yaml
version: '3.8'  # Compose文件格式版本

services:       # 定义服务
  web:
    image: nginx:alpine
    ports:
      - "80:80"
  
  database:
    image: postgres:13
    environment:
      - POSTGRES_DB=mydb

volumes:        # 定义数据卷
  data-volume:

networks:       # 定义网络
  app-network:
    driver: bridge
```

## Docker Compose安装

### Linux系统安装

```bash
# 下载Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 创建符号链接（可选）
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# 验证安装
docker-compose --version
```

### 使用pip安装

```bash
# 使用pip安装（Python环境）
pip install docker-compose

# 验证安装
docker-compose --version
```

## Compose文件编写

### 基础语法

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Web服务
  web:
    image: nginx:alpine
    container_name: my-nginx
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
      - ./conf/nginx.conf:/etc/nginx/nginx.conf:ro
    restart: unless-stopped
    depends_on:
      - api
    networks:
      - frontend

  # API服务
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: my-api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    volumes:
      - ./api:/usr/src/app
      - /usr/src/app/node_modules
    depends_on:
      - db
      - redis
    networks:
      - frontend
      - backend

  # 数据库服务
  db:
    image: postgres:13-alpine
    container_name: my-postgres
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - backend

  # Redis缓存
  redis:
    image: redis:alpine
    container_name: my-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - backend

# 数据卷定义
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

# 网络定义
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
```

### 环境变量配置

```yaml
# .env文件
POSTGRES_DB=myapp
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret123
API_PORT=3000
WEB_PORT=8080
```

```yaml
# docker-compose.yml中使用环境变量
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "${WEB_PORT}:80"
  
  api:
    build: ./api
    ports:
      - "${API_PORT}:3000"
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
  
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

### 构建配置

```yaml
services:
  web:
    build:
      context: ./web
      dockerfile: Dockerfile.prod
      args:
        - NODE_ENV=production
        - API_URL=http://api:3000
      target: production
      cache_from:
        - node:16-alpine
        - my-app:latest
    image: my-web-app:latest
```

## 常用Compose命令

### 基本操作命令

```bash
# 启动服务（后台运行）
docker-compose up -d

# 启动特定服务
docker-compose up web db

# 查看运行状态
docker-compose ps

# 查看服务日志
docker-compose logs
docker-compose logs -f web  # 跟踪特定服务日志
docker-compose logs --tail=100 api  # 显示最后100行

# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、数据卷
docker-compose down -v

# 重启服务
docker-compose restart
docker-compose restart web
```

### 管理和调试命令

```bash
# 构建或重新构建服务
docker-compose build
docker-compose build --no-cache web

# 拉取服务镜像
docker-compose pull

# 在服务中执行命令
docker-compose exec web bash
docker-compose exec db psql -U postgres -d mydb

# 运行一次性命令
docker-compose run --rm web curl http://api:3000/health

# 查看服务配置
docker-compose config

# 验证compose文件
docker-compose config --quiet

# 扩展服务实例
docker-compose up --scale web=3 --scale api=2

# 查看端口映射
docker-compose port web 80
```

### 项目管理命令

```bash
# 指定项目名称
docker-compose -p myproject up -d

# 指定compose文件
docker-compose -f docker-compose.prod.yml up -d

# 使用多个compose文件
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 查看项目
docker-compose ls

# 暂停/恢复服务
docker-compose pause
docker-compose unpause

# 发送信号给服务
docker-compose kill -s SIGUSR1 web
```

## 实战案例

### LAMP架构应用

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    image: httpd:2.4-alpine
    container_name: apache-server
    ports:
      - "80:80"
    volumes:
      - ./www:/usr/local/apache2/htdocs
      - ./apache/httpd.conf:/usr/local/apache2/conf/httpd.conf:ro
    depends_on:
      - php
    networks:
      - lamp-network

  php:
    build:
      context: ./php
      dockerfile: Dockerfile
    container_name: php-fpm
    volumes:
      - ./www:/var/www/html
    depends_on:
      - mysql
    networks:
      - lamp-network

  mysql:
    image: mysql:8.0
    container_name: mysql-server
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: lampdb
      MYSQL_USER: lampuser
      MYSQL_PASSWORD: lamppass
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "3306:3306"
    networks:
      - lamp-network

  phpmyadmin:
    image: phpmyadmin:latest
    container_name: phpmyadmin
    environment:
      PMA_HOST: mysql
      PMA_USER: root
      PMA_PASSWORD: rootpass
    ports:
      - "8080:80"
    depends_on:
      - mysql
    networks:
      - lamp-network

volumes:
  mysql_data:

networks:
  lamp-network:
    driver: bridge
```

### 微服务架构

```yaml
# docker-compose.microservices.yml
version: '3.8'

services:
  # API网关
  gateway:
    image: nginx:alpine
    container_name: api-gateway
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - user-service
      - order-service
      - product-service
    networks:
      - frontend

  # 用户服务
  user-service:
    build: ./services/user
    container_name: user-service
    environment:
      - DATABASE_URL=postgresql://postgres:password@user-db:5432/users
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - user-db
      - redis
    networks:
      - frontend
      - user-backend

  # 订单服务
  order-service:
    build: ./services/order
    container_name: order-service
    environment:
      - DATABASE_URL=postgresql://postgres:password@order-db:5432/orders
      - USER_SERVICE_URL=http://user-service:3000
    depends_on:
      - order-db
    networks:
      - frontend
      - order-backend

  # 产品服务
  product-service:
    build: ./services/product
    container_name: product-service
    environment:
      - DATABASE_URL=postgresql://postgres:password@product-db:5432/products
    depends_on:
      - product-db
    networks:
      - frontend
      - product-backend

  # 数据库服务
  user-db:
    image: postgres:13-alpine
    container_name: user-database
    environment:
      POSTGRES_DB: users
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - user_db_data:/var/lib/postgresql/data
    networks:
      - user-backend

  order-db:
    image: postgres:13-alpine
    container_name: order-database
    environment:
      POSTGRES_DB: orders
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - order_db_data:/var/lib/postgresql/data
    networks:
      - order-backend

  product-db:
    image: postgres:13-alpine
    container_name: product-database
    environment:
      POSTGRES_DB: products
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - product_db_data:/var/lib/postgresql/data
    networks:
      - product-backend

  # 共享服务
  redis:
    image: redis:alpine
    container_name: redis-cache
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - user-backend

  # 监控服务
  prometheus:
    image: prom/prometheus
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    networks:
      - monitoring

  grafana:
    image: grafana/grafana
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    networks:
      - monitoring

volumes:
  user_db_data:
  order_db_data:
  product_db_data:
  redis_data:
  grafana_data:

networks:
  frontend:
    driver: bridge
  user-backend:
    driver: bridge
    internal: true
  order-backend:
    driver: bridge
    internal: true
  product-backend:
    driver: bridge
    internal: true
  monitoring:
    driver: bridge
```

### 开发环境配置

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # 前端开发环境
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: frontend-dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - CHOKIDAR_USEPOLLING=true
      - REACT_APP_API_URL=http://localhost:8000
    command: npm start

  # 后端开发环境
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: backend-dev
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://developer:devpass@postgres:5432/devdb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    command: npm run dev

  # 开发数据库
  postgres:
    image: postgres:13-alpine
    container_name: postgres-dev
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: devdb
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: devpass
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./database/init-dev.sql:/docker-entrypoint-initdb.d/init.sql:ro

  # 开发缓存
  redis:
    image: redis:alpine
    container_name: redis-dev
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data

  # 数据库管理工具
  adminer:
    image: adminer
    container_name: adminer-dev
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_dev_data:
  redis_dev_data:
```

## 高级特性

### 健康检查配置

```yaml
services:
  web:
    image: nginx:alpine
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  api:
    build: ./api
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 1m30s
      timeout: 10s
      retries: 3
```

### 资源限制

```yaml
services:
  web:
    image: nginx:alpine
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
```

### 配置和密钥管理

```yaml
services:
  app:
    image: my-app:latest
    configs:
      - source: app_config
        target: /etc/app/config.yml
        mode: 0644
    secrets:
      - db_password
      - api_key

configs:
  app_config:
    external: true

secrets:
  db_password:
    external: true
  api_key:
    external: true
```

### 多环境配置

```bash
# 基础配置
# docker-compose.yml
version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"

# 开发环境覆盖
# docker-compose.override.yml
version: '3.8'
services:
  web:
    volumes:
      - ./src:/usr/share/nginx/html
    environment:
      - DEBUG=true

# 生产环境配置
# docker-compose.prod.yml
version: '3.8'
services:
  web:
    restart: unless-stopped
    environment:
      - DEBUG=false
    deploy:
      replicas: 3
```

使用不同环境：

```bash
# 开发环境（自动使用override文件）
docker-compose up -d

# 生产环境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 测试环境
docker-compose -f docker-compose.yml -f docker-compose.test.yml up -d
```

## 性能优化和最佳实践

### 构建优化

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      cache_from:
        - my-app:latest
        - my-app:cache
      target: production
    image: my-app:latest
```

### 启动顺序控制

```yaml
# 使用healthcheck控制启动顺序
services:
  db:
    image: postgres:13
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    image: my-app:latest
    depends_on:
      db:
        condition: service_healthy
```

### 日志管理

```yaml
services:
  web:
    image: nginx:alpine
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "production_status"
        env: "NODE_ENV"
```

::: note Docker Compose最佳实践
1. **版本控制**：将compose文件纳入Git版本控制
2. **环境隔离**：使用不同的compose文件管理不同环境
3. **健康检查**：为关键服务配置健康检查
4. **资源限制**：为生产环境设置合适的资源限制
5. **日志管理**：配置适当的日志驱动和轮转策略
6. **安全配置**：使用secrets管理敏感信息
:::

::: warning 注意事项
- Compose主要用于单机编排，集群环境建议使用Kubernetes
- 生产环境需要考虑高可用和负载均衡
- 数据卷的备份和恢复策略很重要
- 网络安全配置在生产环境中不可忽视
:::

## 小结

通过本章学习，你应该掌握了：

- **Compose基础**：理解Docker Compose的作用和核心概念
- **文件编写**：熟练编写docker-compose.yml配置文件
- **服务编排**：能够编排复杂的多容器应用
- **环境管理**：掌握多环境配置和管理技巧
- **最佳实践**：了解生产环境使用的优化策略

下一章我们将学习容器监控与日志管理，建立完善的运维监控体系。