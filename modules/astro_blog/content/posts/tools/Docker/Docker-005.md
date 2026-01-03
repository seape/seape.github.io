---
title: "第 5 章：数据卷与网络配置"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第 5 章：数据卷与网络配置

::: tip 学习目标
- 掌握Docker数据卷的创建和使用
- 理解绑定挂载和命名卷的区别
- 学会Docker网络的创建和配置
- 熟练进行容器间的网络通信
:::

## 知识点

### 数据持久化的必要性

容器本身是短暂的，当容器被删除时，容器内的数据也会丢失。为了实现数据持久化，Docker提供了多种存储机制：

| 存储类型 | 特点 | 适用场景 |
|----------|------|----------|
| 数据卷(Volumes) | Docker管理，性能好，可共享 | 数据库文件、应用数据 |
| 绑定挂载(Bind Mounts) | 直接映射主机目录，灵活 | 配置文件、开发环境 |
| 临时挂载(tmpfs) | 存储在内存中，高性能 | 临时文件、缓存 |

### Docker网络模型

Docker使用CNM (Container Network Model)网络架构，包含三个核心组件：
- **Sandbox**：容器的网络栈
- **Endpoint**：容器的网络接口
- **Network**：可以通信的端点集合

## 数据卷管理

### 创建和管理数据卷

```bash
# 创建数据卷
docker volume create my-volume
docker volume create --driver local web-data
docker volume create --name db-data

# 查看数据卷列表
docker volume ls

# 查看数据卷详细信息
docker volume inspect my-volume

# 输出示例：
[
    {
        "CreatedAt": "2023-01-15T10:30:45Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/my-volume/_data",
        "Name": "my-volume",
        "Options": {},
        "Scope": "local"
    }
]

# 删除数据卷
docker volume rm my-volume

# 清理未使用的数据卷
docker volume prune

# 强制删除所有数据卷（危险操作）
docker volume rm $(docker volume ls -q)
```

### 使用数据卷

```bash
# 使用命名数据卷
docker run -d --name mysql-server \
    -v db-data:/var/lib/mysql \
    -e MYSQL_ROOT_PASSWORD=password \
    mysql:8.0

# 使用匿名数据卷
docker run -d --name web-server \
    -v /usr/share/nginx/html \
    nginx:latest

# 多个数据卷挂载
docker run -d --name app-server \
    -v app-data:/opt/app/data \
    -v log-data:/opt/app/logs \
    -v config-data:/opt/app/config \
    myapp:latest

# 只读数据卷
docker run -d --name readonly-app \
    -v config-data:/opt/app/config:ro \
    myapp:latest
```

### 数据卷高级特性

```bash
# 从容器预填充数据卷
docker run -d --name data-container \
    -v shared-data:/data \
    busybox sh -c "echo 'Hello World' > /data/hello.txt"

# 在其他容器中使用相同数据卷
docker run --rm -v shared-data:/data ubuntu cat /data/hello.txt

# 数据卷标签
docker volume create \
    --label environment=production \
    --label project=webapp \
    prod-data

# 查看带标签的数据卷
docker volume ls --filter label=environment=production

# 使用驱动选项创建数据卷
docker volume create \
    --driver local \
    --opt type=nfs \
    --opt o=addr=192.168.1.100,rw \
    --opt device=:/path/to/share \
    nfs-volume
```

### 数据卷备份和恢复

```bash
# 备份数据卷
docker run --rm \
    -v db-data:/source:ro \
    -v $(pwd):/backup \
    ubuntu tar czf /backup/db-backup-$(date +%Y%m%d).tar.gz -C /source .

# 恢复数据卷
docker volume create db-data-restored

docker run --rm \
    -v db-data-restored:/target \
    -v $(pwd):/backup \
    ubuntu tar xzf /backup/db-backup-20230115.tar.gz -C /target

# 数据卷迁移
# 创建备份容器
docker create --name backup-container \
    -v source-volume:/source:ro \
    ubuntu

# 将数据复制到主机
docker cp backup-container:/source/. ./backup/

# 恢复到新数据卷
docker run --rm \
    -v target-volume:/target \
    -v $(pwd)/backup:/backup \
    ubuntu cp -r /backup/. /target/
```

## 绑定挂载

### 基本绑定挂载

```bash
# 绑定挂载主机目录
docker run -d --name web-dev \
    -p 8080:80 \
    -v /home/user/html:/usr/share/nginx/html \
    nginx:latest

# 使用绝对路径
docker run -d --name app-dev \
    -v /opt/myapp:/app \
    -w /app \
    python:3.9 python app.py

# 使用相对路径（当前目录）
docker run -d --name node-dev \
    -p 3000:3000 \
    -v $(pwd):/usr/src/app \
    -w /usr/src/app \
    node:16 npm start

# 只读绑定挂载
docker run -d --name config-app \
    -v /etc/myapp/config:/opt/app/config:ro \
    myapp:latest
```

### 高级绑定挂载选项

```bash
# 使用mount语法（推荐）
docker run -d --name advanced-app \
    --mount type=bind,source=/host/path,target=/container/path,readonly \
    myapp:latest

# 带权限控制的挂载
docker run -d --name perm-app \
    --mount type=bind,source=/host/data,target=/app/data,bind-propagation=shared \
    myapp:latest

# 设置SELinux标签（在启用SELinux的系统上）
docker run -d --name selinux-app \
    -v /host/data:/app/data:Z \
    myapp:latest

# 挂载单个文件
docker run -d --name single-file \
    -v /host/config.json:/app/config.json:ro \
    myapp:latest
```

### 开发环境实践

```bash
# 前端开发环境
mkdir -p ~/projects/frontend-app
cd ~/projects/frontend-app

# 创建package.json
cat > package.json << 'EOF'
{
  "name": "frontend-app",
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production"
  }
}
EOF

# 运行开发容器
docker run -it --rm \
    --name frontend-dev \
    -p 3000:3000 \
    -v $(pwd):/app \
    -v /app/node_modules \
    -w /app \
    node:16 bash

# 在容器内安装依赖和启动开发服务器
npm install
npm run dev
```

## Docker网络

### 网络驱动类型

| 网络驱动 | 特点 | 适用场景 |
|----------|------|----------|
| bridge | 默认网络，单机通信 | 单机多容器应用 |
| host | 使用主机网络栈 | 高性能网络应用 |
| none | 无网络连接 | 安全隔离场景 |
| overlay | 跨主机通信 | 集群环境 |
| macvlan | MAC地址独立容器 | 物理网络集成 |

### 默认网络查看

```bash
# 查看所有网络
docker network ls

# 输出示例：
NETWORK ID     NAME      DRIVER    SCOPE
d8b6a3c7f4e2   bridge    bridge    local
f7a8b9c6d5e4   host      host      local
a1b2c3d4e5f6   none      null      local

# 查看网络详细信息
docker network inspect bridge

# 查看容器网络信息
docker inspect container-name | jq '.[0].NetworkSettings'
```

### 创建自定义网络

```bash
# 创建bridge网络
docker network create my-network
docker network create --driver bridge app-network

# 创建带子网的网络
docker network create \
    --driver bridge \
    --subnet=172.20.0.0/16 \
    --ip-range=172.20.240.0/20 \
    --gateway=172.20.0.1 \
    custom-network

# 创建overlay网络（Swarm模式）
docker network create \
    --driver overlay \
    --subnet=10.1.0.0/24 \
    --gateway=10.1.0.1 \
    swarm-network

# 查看网络详情
docker network inspect my-network
```

### 容器网络连接

```bash
# 运行时指定网络
docker run -d --name web-server \
    --network my-network \
    nginx:latest

# 连接现有容器到网络
docker network connect my-network existing-container

# 断开网络连接
docker network disconnect my-network container-name

# 为容器指定IP地址
docker run -d --name static-ip \
    --network custom-network \
    --ip 172.20.0.10 \
    nginx:latest

# 设置主机名和别名
docker run -d --name web-server \
    --network my-network \
    --hostname webserver \
    --network-alias www \
    nginx:latest
```

## 容器间通信

### 同网络容器通信

```bash
# 创建应用网络
docker network create app-net

# 启动数据库容器
docker run -d --name mysql-db \
    --network app-net \
    -e MYSQL_ROOT_PASSWORD=password \
    -e MYSQL_DATABASE=appdb \
    mysql:8.0

# 启动应用容器
docker run -d --name web-app \
    --network app-net \
    -p 8080:80 \
    -e DATABASE_HOST=mysql-db \
    -e DATABASE_USER=root \
    -e DATABASE_PASSWORD=password \
    my-web-app:latest

# 测试容器间通信
docker exec web-app ping mysql-db
docker exec web-app nslookup mysql-db
```

### 多网络容器

```bash
# 创建前端和后端网络
docker network create frontend-net
docker network create backend-net

# 启动数据库（仅在后端网络）
docker run -d --name database \
    --network backend-net \
    postgres:13

# 启动应用服务器（连接两个网络）
docker run -d --name app-server \
    --network backend-net \
    my-app:latest

docker network connect frontend-net app-server

# 启动Web服务器（仅在前端网络）
docker run -d --name web-server \
    --network frontend-net \
    -p 80:80 \
    nginx:latest
```

### 网络故障排查

```bash
# 查看容器网络配置
docker exec container-name ip addr show
docker exec container-name ip route show

# 测试网络连通性
docker exec container1 ping container2
docker exec container1 telnet container2 80

# 查看网络连接
docker exec container-name netstat -tuln
docker exec container-name ss -tuln

# 抓包分析
docker exec container-name tcpdump -i eth0 -w /tmp/capture.pcap
```

## 实战案例

### 完整的LAMP架构

```bash
# 1. 创建项目网络
docker network create lamp-network

# 2. 创建数据卷
docker volume create mysql-data
docker volume create web-data

# 3. 启动MySQL数据库
docker run -d --name mysql \
    --network lamp-network \
    --restart unless-stopped \
    -v mysql-data:/var/lib/mysql \
    -e MYSQL_ROOT_PASSWORD=rootpassword \
    -e MYSQL_DATABASE=webapp \
    -e MYSQL_USER=webuser \
    -e MYSQL_PASSWORD=webpassword \
    mysql:8.0

# 4. 启动Apache+PHP容器
docker run -d --name apache-php \
    --network lamp-network \
    --restart unless-stopped \
    -p 8080:80 \
    -v web-data:/var/www/html \
    php:8.1-apache

# 5. 安装PHP MySQL扩展
docker exec apache-php docker-php-ext-install mysqli pdo pdo_mysql

# 6. 提交修改后的镜像
docker commit apache-php php:8.1-apache-mysql

# 7. 重新启动Apache容器
docker stop apache-php
docker rm apache-php
docker run -d --name apache-php \
    --network lamp-network \
    --restart unless-stopped \
    -p 8080:80 \
    -v web-data:/var/www/html \
    php:8.1-apache-mysql

# 8. 创建测试PHP文件
docker exec apache-php bash -c 'cat > /var/www/html/test.php << "EOF"
<?php
$servername = "mysql";
$username = "webuser";
$password = "webpassword";
$dbname = "webapp";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully to MySQL database!<br>";

phpinfo();
?>
EOF'

# 9. 测试应用
curl http://localhost:8080/test.php
```

### 微服务架构示例

```bash
# 创建微服务网络
docker network create microservices-net

# 服务发现和配置中心
docker run -d --name consul \
    --network microservices-net \
    -p 8500:8500 \
    consul:latest

# API网关
docker run -d --name api-gateway \
    --network microservices-net \
    -p 80:8080 \
    -e CONSUL_URL=http://consul:8500 \
    my-api-gateway:latest

# 用户服务
docker run -d --name user-service \
    --network microservices-net \
    -e CONSUL_URL=http://consul:8500 \
    -e DB_HOST=postgres \
    my-user-service:latest

# 订单服务  
docker run -d --name order-service \
    --network microservices-net \
    -e CONSUL_URL=http://consul:8500 \
    -e DB_HOST=postgres \
    my-order-service:latest

# PostgreSQL数据库
docker run -d --name postgres \
    --network microservices-net \
    -v postgres-data:/var/lib/postgresql/data \
    -e POSTGRES_DB=microservices \
    -e POSTGRES_USER=admin \
    -e POSTGRES_PASSWORD=password \
    postgres:13

# Redis缓存
docker run -d --name redis \
    --network microservices-net \
    redis:alpine
```

### 开发环境搭建

```bash
# 创建开发项目
mkdir ~/dev-environment
cd ~/dev-environment

# 创建开发网络和数据卷
docker network create dev-network
docker volume create postgres-dev-data
docker volume create redis-dev-data

# 启动开发数据库
docker run -d --name dev-postgres \
    --network dev-network \
    -p 5432:5432 \
    -v postgres-dev-data:/var/lib/postgresql/data \
    -e POSTGRES_DB=devdb \
    -e POSTGRES_USER=developer \
    -e POSTGRES_PASSWORD=devpass \
    postgres:13

# 启动Redis
docker run -d --name dev-redis \
    --network dev-network \
    -p 6379:6379 \
    -v redis-dev-data:/data \
    redis:alpine

# 启动开发容器（Node.js环境）
docker run -it --rm \
    --name dev-environment \
    --network dev-network \
    -p 3000:3000 \
    -v $(pwd):/workspace \
    -w /workspace \
    -e DATABASE_URL=postgresql://developer:devpass@dev-postgres:5432/devdb \
    -e REDIS_URL=redis://dev-redis:6379 \
    node:16 bash

# 在开发容器中初始化项目
npm init -y
npm install express pg redis

# 创建简单的应用
cat > app.js << 'EOF'
const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const port = 3000;

// 数据库连接
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Redis连接
const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

app.get('/', async (req, res) => {
    try {
        const dbResult = await pool.query('SELECT NOW()');
        await redisClient.set('last_visit', new Date().toISOString());
        const lastVisit = await redisClient.get('last_visit');
        
        res.json({
            message: 'Development environment is working!',
            database_time: dbResult.rows[0].now,
            last_visit: lastVisit
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Dev server running on port ${port}`);
});
EOF

# 启动开发服务器
node app.js
```

## 网络安全和最佳实践

### 网络隔离策略

```bash
# 创建不同环境的网络
docker network create production-net
docker network create staging-net  
docker network create development-net

# 数据库仅在后端网络
docker network create backend-net
docker network create frontend-net

# 敏感服务使用专用网络
docker network create secure-net \
    --internal  # 禁止外部访问
```

### 防火墙规则

```bash
# 限制容器访问外部网络
iptables -I DOCKER-USER -s 172.17.0.0/16 -d 8.8.8.8 -j DROP

# 允许特定容器访问外部API
iptables -I DOCKER-USER -s 172.20.0.10 -d api.example.com -p tcp --dport 443 -j ACCEPT

# 记录网络连接
iptables -I DOCKER-USER -j LOG --log-prefix "DOCKER-USER: "
```

::: note 数据和网络最佳实践
1. **数据持久化**：为重要数据使用命名数据卷而非绑定挂载
2. **网络隔离**：不同环境和服务使用不同的网络
3. **备份策略**：定期备份重要数据卷
4. **安全配置**：敏感服务使用内部网络，限制外部访问
5. **监控告警**：监控网络和存储使用情况
:::

::: warning 注意事项
- 删除容器时数据卷不会自动删除，需要手动清理
- 绑定挂载的文件权限问题可能导致应用无法正常运行
- 网络配置错误可能导致容器无法通信
- 在生产环境中谨慎使用host网络模式
:::

## 小结

通过本章学习，你应该掌握了：

- **数据持久化**：掌握数据卷、绑定挂载等存储机制
- **网络通信**：理解Docker网络模型和容器间通信方式
- **实战应用**：能够搭建复杂的多容器应用架构
- **安全配置**：了解网络隔离和安全最佳实践

下一章我们将学习Docker Compose，实现多容器应用的声明式编排和管理。