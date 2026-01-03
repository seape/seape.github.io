---
title: 第10章 生产环境部署与运维
icon: server
date: 2024-01-10
category:
  - Docker
  - 运维
tag:
  - 生产环境
  - 容器编排
  - 运维管理
  - 高可用
---

# 第10章 生产环境部署与运维

## 学习目标

1. 掌握生产环境容器化部署策略
2. 学会实现高可用和负载均衡
3. 理解容器编排和集群管理
4. 掌握生产环境监控和故障排查
5. 学会容器化应用的性能优化

## 知识点详解

### 10.1 生产环境架构设计

#### 10.1.1 架构模式选择

**单机部署模式：**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  web:
    image: myapp:latest
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
    depends_on:
      - web
    restart: unless-stopped
```

**集群部署模式：**
```yaml
# docker-stack.yml
version: '3.8'
services:
  web:
    image: myapp:latest
    networks:
      - web-network
    deploy:
      replicas: 3
      placement:
        constraints:
          - node.role == worker
      resources:
        limits:
          memory: 256M
          cpus: '0.5'
        reservations:
          memory: 128M
          cpus: '0.25'
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
        monitor: 60s
        order: start-first

  lb:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    networks:
      - web-network
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    deploy:
      replicas: 2
      placement:
        constraints:
          - node.role == manager

networks:
  web-network:
    driver: overlay
    attachable: true
```

#### 10.1.2 资源规划

**服务器资源配置：**
```bash
#!/bin/bash
# resource-planning.sh

# 检查系统资源
echo "=== System Resource Check ==="
echo "CPU cores: $(nproc)"
echo "Memory: $(free -h | grep '^Mem:' | awk '{print $2}')"
echo "Disk space: $(df -h / | tail -1 | awk '{print $4}')"
echo "Docker version: $(docker --version)"

# 计算资源分配
TOTAL_MEMORY=$(free -m | grep '^Mem:' | awk '{print $2}')
TOTAL_CPUS=$(nproc)

# 为系统保留资源
SYSTEM_MEMORY=$((TOTAL_MEMORY * 20 / 100))
SYSTEM_CPUS="0.5"

# 可分配资源
AVAILABLE_MEMORY=$((TOTAL_MEMORY - SYSTEM_MEMORY))
AVAILABLE_CPUS=$((TOTAL_CPUS - 1))

echo "Available for containers:"
echo "Memory: ${AVAILABLE_MEMORY}MB"
echo "CPUs: ${AVAILABLE_CPUS}"

# 生成资源限制配置
cat > resource-limits.yml << EOF
version: '3.8'
services:
  web:
    deploy:
      resources:
        limits:
          memory: ${AVAILABLE_MEMORY}m
          cpus: '${AVAILABLE_CPUS}'
        reservations:
          memory: $((AVAILABLE_MEMORY / 2))m
          cpus: '0.25'
EOF
```

### 10.2 高可用性设计

#### 10.2.1 多副本部署

**Docker Swarm 高可用配置：**
```bash
# 初始化 Swarm 集群
docker swarm init --advertise-addr 192.168.1.100

# 添加 manager 节点
docker swarm join-token manager

# 添加 worker 节点
docker swarm join-token worker

# 检查集群状态
docker node ls
```

**服务高可用部署：**
```bash
#!/bin/bash
# ha-deploy.sh

# 创建 overlay 网络
docker network create -d overlay --attachable ha-network

# 部署 Web 服务（3个副本）
docker service create \
    --name web-service \
    --replicas 3 \
    --network ha-network \
    --constraint 'node.role==worker' \
    --update-parallelism 1 \
    --update-delay 10s \
    --rollback-parallelism 1 \
    --rollback-delay 10s \
    --restart-condition on-failure \
    --restart-max-attempts 3 \
    --limit-memory 256m \
    --limit-cpu 0.5 \
    myapp:latest

# 部署负载均衡器
docker service create \
    --name lb-service \
    --replicas 2 \
    --network ha-network \
    --publish 80:80 \
    --publish 443:443 \
    --constraint 'node.role==manager' \
    --mount type=bind,source=$(pwd)/nginx.conf,target=/etc/nginx/nginx.conf \
    nginx:alpine

# 部署数据库（主从复制）
docker service create \
    --name db-master \
    --replicas 1 \
    --network ha-network \
    --constraint 'node.labels.db-role==master' \
    --mount type=volume,source=db-master-data,target=/var/lib/mysql \
    --env MYSQL_ROOT_PASSWORD=rootpassword \
    --env MYSQL_REPLICATION_MODE=master \
    --env MYSQL_REPLICATION_USER=replicator \
    --env MYSQL_REPLICATION_PASSWORD=replicatorpassword \
    mysql:8.0

docker service create \
    --name db-slave \
    --replicas 2 \
    --network ha-network \
    --constraint 'node.labels.db-role==slave' \
    --env MYSQL_ROOT_PASSWORD=rootpassword \
    --env MYSQL_REPLICATION_MODE=slave \
    --env MYSQL_REPLICATION_USER=replicator \
    --env MYSQL_REPLICATION_PASSWORD=replicatorpassword \
    --env MYSQL_MASTER_HOST=db-master \
    mysql:8.0
```

#### 10.2.2 负载均衡配置

**Nginx 负载均衡：**
```nginx
# nginx.conf
upstream web_backend {
    least_conn;
    server web-service:3000 max_fails=3 fail_timeout=30s;
    server web-service:3000 max_fails=3 fail_timeout=30s;
    server web-service:3000 max_fails=3 fail_timeout=30s;
}

upstream api_backend {
    ip_hash;
    server api-service:8080 weight=3;
    server api-service:8080 weight=2;
    server api-service:8080 weight=1 backup;
}

server {
    listen 80;
    server_name example.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/private.key;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS;
    ssl_prefer_server_ciphers off;
    
    # 健康检查
    location /health {
        access_log off;
        proxy_pass http://web_backend/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Web 应用
    location / {
        proxy_pass http://web_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 连接超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # API 路由
    location /api/ {
        proxy_pass http://api_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 静态文件
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @fallback;
    }
    
    location @fallback {
        proxy_pass http://web_backend;
    }
}
```

**HAProxy 配置：**
```
# haproxy.cfg
global
    daemon
    maxconn 4096
    log stdout local0 info
    
defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httplog
    option dontlognull
    option redispatch
    retries 3
    
frontend web_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/example.com.pem
    redirect scheme https if !{ ssl_fc }
    
    # ACL 定义
    acl is_api path_beg /api/
    acl is_admin path_beg /admin/
    
    # 路由规则
    use_backend api_backend if is_api
    use_backend admin_backend if is_admin
    default_backend web_backend

backend web_backend
    balance roundrobin
    option httpchk GET /health
    server web1 web-service:3000 check inter 3000 fall 3 rise 2
    server web2 web-service:3000 check inter 3000 fall 3 rise 2
    server web3 web-service:3000 check inter 3000 fall 3 rise 2

backend api_backend
    balance leastconn
    option httpchk GET /api/health
    server api1 api-service:8080 check inter 3000 fall 3 rise 2
    server api2 api-service:8080 check inter 3000 fall 3 rise 2

backend admin_backend
    balance source
    option httpchk GET /admin/health
    server admin1 admin-service:9000 check inter 3000 fall 3 rise 2

listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 30s
    stats admin if TRUE
```

### 10.3 数据持久化与备份

#### 10.3.1 数据卷管理

**生产环境数据卷配置：**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  database:
    image: postgres:14
    volumes:
      - db_data:/var/lib/postgresql/data
      - db_backup:/backup
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    networks:
      - db_network
    deploy:
      placement:
        constraints:
          - node.labels.storage == ssd
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
      - ./redis.conf:/etc/redis/redis.conf:ro
    command: redis-server /etc/redis/redis.conf
    networks:
      - db_network
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'

volumes:
  db_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/docker/data/postgres
  
  redis_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/docker/data/redis
  
  db_backup:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/docker/backup

secrets:
  db_password:
    external: true

networks:
  db_network:
    driver: overlay
    internal: true
```

#### 10.3.2 自动化备份策略

**数据库备份脚本：**
```bash
#!/bin/bash
# backup-database.sh

DB_CONTAINER="myapp_database_1"
DB_USER="myuser"
DB_NAME="myapp"
BACKUP_DIR="/opt/docker/backup"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_${DB_NAME}_${DATE}.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 数据库备份
echo "Starting database backup..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/$BACKUP_FILE

# 压缩备份文件
gzip $BACKUP_DIR/$BACKUP_FILE

# 上传到远程存储
echo "Uploading backup to cloud storage..."
aws s3 cp $BACKUP_DIR/${BACKUP_FILE}.gz s3://myapp-backups/database/

# 清理本地旧备份（保留7天）
find $BACKUP_DIR -name "backup_${DB_NAME}_*.sql.gz" -mtime +7 -delete

# 记录备份状态
if [ $? -eq 0 ]; then
    echo "$(date): Backup completed successfully - ${BACKUP_FILE}.gz" >> /var/log/backup.log
else
    echo "$(date): Backup failed" >> /var/log/backup.log
    # 发送告警邮件
    echo "Database backup failed on $(hostname)" | mail -s "Backup Alert" admin@example.com
fi
```

**完整备份解决方案：**
```bash
#!/bin/bash
# full-backup.sh

BACKUP_BASE="/opt/docker/backup"
DATE=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=30

# 创建备份目录
mkdir -p $BACKUP_BASE/{database,volumes,configs}

# 1. 数据库备份
echo "Backing up databases..."
docker exec postgres_container pg_dumpall -U postgres | gzip > $BACKUP_BASE/database/full_dump_$DATE.sql.gz

# 2. 数据卷备份
echo "Backing up volumes..."
docker run --rm \
    -v myapp_db_data:/source:ro \
    -v $BACKUP_BASE/volumes:/backup \
    alpine tar czf /backup/db_data_$DATE.tar.gz -C /source .

docker run --rm \
    -v myapp_redis_data:/source:ro \
    -v $BACKUP_BASE/volumes:/backup \
    alpine tar czf /backup/redis_data_$DATE.tar.gz -C /source .

# 3. 配置文件备份
echo "Backing up configurations..."
tar czf $BACKUP_BASE/configs/configs_$DATE.tar.gz \
    /opt/docker/compose \
    /opt/docker/nginx \
    /opt/docker/ssl

# 4. 上传到云存储
echo "Uploading to cloud storage..."
aws s3 sync $BACKUP_BASE s3://myapp-backups/$(date +"%Y/%m/%d")/

# 5. 清理旧备份
echo "Cleaning up old backups..."
find $BACKUP_BASE -type f -mtime +$RETENTION_DAYS -delete

# 6. 验证备份完整性
echo "Verifying backup integrity..."
BACKUP_SIZE=$(du -s $BACKUP_BASE | cut -f1)
if [ $BACKUP_SIZE -lt 1000 ]; then
    echo "Warning: Backup size seems too small" | mail -s "Backup Warning" admin@example.com
fi

echo "Backup completed at $(date)"
```

**Crontab 定时备份：**
```bash
# 编辑 crontab
crontab -e

# 添加定时任务
# 每天凌晨 2 点执行完整备份
0 2 * * * /opt/scripts/full-backup.sh >> /var/log/backup.log 2>&1

# 每 6 小时执行增量备份
0 */6 * * * /opt/scripts/incremental-backup.sh >> /var/log/backup.log 2>&1

# 每周日执行数据完整性检查
0 3 * * 0 /opt/scripts/backup-verify.sh >> /var/log/backup-verify.log 2>&1
```

### 10.4 监控与告警

#### 10.4.1 综合监控方案

**Prometheus + Grafana 监控栈：**
```yaml
# monitoring-stack.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./rules:/etc/prometheus/rules:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
      - '--web.enable-admin-api'
    networks:
      - monitoring
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
      - ./grafana/dashboards:/var/lib/grafana/dashboards:ro
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-simple-json-datasource
    networks:
      - monitoring
    depends_on:
      - prometheus

  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
      - '--web.external-url=http://localhost:9093'
      - '--web.route-prefix=/'
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - monitoring

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    devices:
      - /dev/kmsg:/dev/kmsg
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:

networks:
  monitoring:
    driver: overlay
    attachable: true
```

**Prometheus 配置：**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'docker'
    static_configs:
      - targets: ['host.docker.internal:9323']

  - job_name: 'app'
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        port: 3000
    relabel_configs:
      - source_labels: [__meta_docker_container_label_monitoring]
        target_label: __tmp_should_be_scraped
        regex: true
      - source_labels: [__tmp_should_be_scraped]
        regex: true
        target_label: __address__
        replacement: ${1}:3000
```

#### 10.4.2 告警规则配置

**生产环境告警规则：**
```yaml
# rules/production.yml
groups:
- name: production.rules
  rules:
  # 服务可用性告警
  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Service {{ $labels.job }} is down"
      description: "Service {{ $labels.job }} on {{ $labels.instance }} has been down for more than 1 minute."

  # 高 CPU 使用率
  - alert: HighCPUUsage
    expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[2m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is {{ $value }}% on {{ $labels.instance }}"

  # 高内存使用率
  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage detected"
      description: "Memory usage is {{ $value }}% on {{ $labels.instance }}"

  # 磁盘空间不足
  - alert: DiskSpaceLow
    expr: (node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100 > 90
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Disk space is running low"
      description: "Disk usage is {{ $value }}% on {{ $labels.instance }}"

  # 容器重启频繁
  - alert: ContainerRestartingOften
    expr: increase(container_start_time_seconds[1h]) > 5
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Container restarting frequently"
      description: "Container {{ $labels.name }} has restarted {{ $value }} times in the last hour"

  # HTTP 响应时间过长
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High HTTP response time"
      description: "95th percentile response time is {{ $value }}s"

  # HTTP 错误率过高
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100 > 5
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High HTTP error rate"
      description: "HTTP error rate is {{ $value }}%"

  # 数据库连接异常
  - alert: DatabaseConnectionFailed
    expr: mysql_up == 0 or postgres_up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Database connection failed"
      description: "Cannot connect to database {{ $labels.instance }}"
```

**告警管理器配置：**
```yaml
# alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@example.com'
  smtp_auth_username: 'alerts@example.com'
  smtp_auth_password: 'app-password'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
  - match:
      severity: critical
    receiver: 'critical-alerts'
  - match:
      severity: warning
    receiver: 'warning-alerts'

receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://webhook-service:5000/alerts'

- name: 'critical-alerts'
  email_configs:
  - to: 'admin@example.com'
    subject: '🚨 Critical Alert: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      Labels: {{ .Labels }}
      {{ end }}
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
    channel: '#alerts'
    title: 'Critical Alert'
    text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

- name: 'warning-alerts'
  email_configs:
  - to: 'team@example.com'
    subject: '⚠️ Warning Alert: {{ .GroupLabels.alertname }}'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

### 10.5 日志管理

#### 10.5.1 集中式日志收集

**ELK Stack 日志方案：**
```yaml
# logging-stack.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - logging

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash/config:/usr/share/logstash/pipeline:ro
      - ./logstash/patterns:/opt/logstash/patterns:ro
    ports:
      - "5044:5044"
      - "12201:12201/udp"
    depends_on:
      - elasticsearch
    networks:
      - logging
    environment:
      LS_JAVA_OPTS: "-Xmx256m -Xms256m"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - logging

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.5.0
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - logstash
    networks:
      - logging
    user: root

volumes:
  es_data:

networks:
  logging:
    driver: overlay
    attachable: true
```

**Filebeat 配置：**
```yaml
# filebeat/filebeat.yml
filebeat.inputs:
- type: container
  paths:
    - '/var/lib/docker/containers/*/*.log'
  processors:
  - add_docker_metadata:
      host: "unix:///var/run/docker.sock"
  - decode_json_fields:
      fields: ["message"]
      target: ""
      overwrite_keys: true

output.logstash:
  hosts: ["logstash:5044"]

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
  permissions: 0644
```

**Logstash 配置：**
```ruby
# logstash/config/logstash.conf
input {
  beats {
    port => 5044
  }
  
  gelf {
    port => 12201
  }
}

filter {
  if [container][name] {
    mutate {
      add_field => { "service_name" => "%{[container][name]}" }
    }
  }

  # 解析 Nginx 日志
  if [service_name] =~ "nginx" {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
    
    date {
      match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
    }
    
    mutate {
      convert => { "response" => "integer" }
      convert => { "bytes" => "integer" }
    }
  }

  # 解析应用日志
  if [service_name] =~ "web" {
    json {
      source => "message"
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }

  # 添加环境标签
  mutate {
    add_field => { "environment" => "production" }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }

  # 错误日志单独存储
  if [level] == "ERROR" {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      index => "errors-%{+YYYY.MM.dd}"
    }
  }
}
```

#### 10.5.2 应用日志最佳实践

**结构化日志输出：**
```javascript
// Node.js 应用日志配置
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'web-app',
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development' 
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : winston.format.json()
    })
  ]
});

// 使用示例
logger.info('User login successful', {
  userId: '12345',
  ip: req.ip,
  userAgent: req.get('User-Agent')
});

logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  query: sqlQuery
});
```

**Docker 日志驱动配置：**
```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    image: myapp:latest
    logging:
      driver: "fluentd"
      options:
        fluentd-address: localhost:24224
        tag: myapp.web
        labels: "environment,service"
    labels:
      - "environment=production"
      - "service=web"

  api:
    image: myapi:latest
    logging:
      driver: "gelf"
      options:
        gelf-address: "udp://localhost:12201"
        tag: "{{.ImageName}}/{{.Name}}/{{.ID}}"

  database:
    image: postgres:14
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "environment,service"
```

### 10.6 性能优化

#### 10.6.1 容器性能调优

**资源限制优化：**
```bash
#!/bin/bash
# container-tuning.sh

# 分析容器资源使用情况
echo "=== Container Resource Analysis ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

# 获取容器详细资源信息
for container in $(docker ps -q); do
    echo "Container: $(docker ps --format '{{.Names}}' --filter id=$container)"
    echo "Memory limit: $(docker inspect $container | jq '.[0].HostConfig.Memory')"
    echo "CPU limit: $(docker inspect $container | jq '.[0].HostConfig.CpuQuota')"
    echo "---"
done

# 优化建议脚本
optimize_container() {
    local container_name=$1
    local cpu_usage=$(docker stats --no-stream --format "{{.CPUPerc}}" $container_name | sed 's/%//')
    local mem_usage=$(docker stats --no-stream --format "{{.MemPerc}}" $container_name | sed 's/%//')
    
    echo "Container: $container_name"
    echo "CPU Usage: $cpu_usage%"
    echo "Memory Usage: $mem_usage%"
    
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        echo "⚠️  High CPU usage detected. Consider:"
        echo "   - Increasing CPU limits"
        echo "   - Optimizing application code"
        echo "   - Adding more replicas"
    fi
    
    if (( $(echo "$mem_usage > 85" | bc -l) )); then
        echo "⚠️  High memory usage detected. Consider:"
        echo "   - Increasing memory limits"
        echo "   - Memory leak investigation"
        echo "   - Application profiling"
    fi
    
    echo ""
}

# 分析所有运行的容器
for container in $(docker ps --format '{{.Names}}'); do
    optimize_container $container
done
```

**网络性能优化：**
```yaml
# docker-compose.performance.yml
version: '3.8'
services:
  web:
    image: myapp:latest
    networks:
      - app-network
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
        reservations:
          memory: 256M
          cpus: '0.5'
    # 使用 host 网络提升性能（单机部署）
    # network_mode: host
    
    # 调整 ulimits
    ulimits:
      nproc: 65535
      nofile:
        soft: 65535
        hard: 65535

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx-optimized.conf:/etc/nginx/nginx.conf:ro
    networks:
      - app-network
    # 启用内核旁路
    sysctls:
      - net.core.somaxconn=65535
      - net.ipv4.ip_local_port_range=1024 65535

networks:
  app-network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: "br-app"
      com.docker.network.driver.mtu: 1500
```

**优化的 Nginx 配置：**
```nginx
# nginx-optimized.conf
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 65535;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 100;
    
    # 缓冲区优化
    client_body_buffer_size 128k;
    client_max_body_size 50m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/json;
    
    # 缓存配置
    open_file_cache max=200000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
    
    upstream backend {
        least_conn;
        server web:3000 weight=1 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }
    
    server {
        listen 80 default_server;
        
        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            
            # 缓冲优化
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
            proxy_busy_buffers_size 8k;
        }
        
        # 静态文件缓存
        location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

#### 10.6.2 应用性能监控

**APM 集成：**
```javascript
// Node.js APM 配置
const apm = require('elastic-apm-node').start({
  serviceName: 'web-app',
  serviceVersion: process.env.APP_VERSION,
  environment: process.env.NODE_ENV,
  serverUrl: process.env.ELASTIC_APM_SERVER_URL,
  captureBody: 'all',
  captureHeaders: true,
  logUncaughtExceptions: true
});

const express = require('express');
const app = express();

// 自定义性能指标
app.use((req, res, next) => {
  const span = apm.startSpan('http.request');
  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] * 1e3 + diff[1] * 1e-6;
    
    apm.setCustomContext({
      response_time: duration,
      status_code: res.statusCode,
      method: req.method,
      url: req.url
    });
    
    if (span) span.end();
  });
  
  next();
});
```

## 实战案例

### 案例：电商网站生产环境部署

**场景描述：**
部署一个高并发电商网站，包含前端、API、订单服务、支付服务、数据库等组件。

**架构设计：**
```
Internet
    ↓
Load Balancer (HAProxy)
    ↓
Web Tier (Nginx + React App)
    ↓
API Gateway (Kong/Traefik)
    ↓
Microservices (Node.js/Go)
    ↓
Database Tier (PostgreSQL Master/Slave)
    ↓
Cache Tier (Redis Cluster)
```

**完整部署配置：**
```yaml
# production-stack.yml
version: '3.8'
services:
  # 负载均衡器
  haproxy:
    image: haproxy:2.6-alpine
    ports:
      - "80:80"
      - "443:443"
      - "8404:8404"  # Stats页面
    volumes:
      - ./haproxy/haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
      - ./ssl:/etc/ssl:ro
    networks:
      - frontend
    deploy:
      replicas: 2
      placement:
        constraints: [node.role == manager]
      resources:
        limits:
          memory: 256M
          cpus: '0.5'

  # 前端应用
  web:
    image: mystore/web:${VERSION}
    networks:
      - frontend
    deploy:
      replicas: 4
      placement:
        constraints: [node.role == worker]
      resources:
        limits:
          memory: 128M
          cpus: '0.25'
        reservations:
          memory: 64M
          cpus: '0.1'
      update_config:
        parallelism: 2
        delay: 10s
        failure_action: rollback
      restart_policy:
        condition: on-failure
        max_attempts: 3

  # API 网关
  api-gateway:
    image: kong:3.0-alpine
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/declarative/kong.yml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
    volumes:
      - ./kong/kong.yml:/kong/declarative/kong.yml:ro
    networks:
      - frontend
      - backend
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  # 用户服务
  user-service:
    image: mystore/user-service:${VERSION}
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/userdb
      REDIS_URL: redis://redis-cluster:6379
    networks:
      - backend
      - database
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 256M
          cpus: '0.5'
    secrets:
      - db_password
      - jwt_secret

  # 订单服务
  order-service:
    image: mystore/order-service:${VERSION}
    environment:
      DATABASE_URL: postgresql://order:password@postgres:5432/orderdb
      MESSAGE_QUEUE: redis://redis-cluster:6379
    networks:
      - backend
      - database
    deploy:
      replicas: 5  # 订单服务需要更多实例
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
    depends_on:
      - postgres
      - redis-cluster

  # 支付服务
  payment-service:
    image: mystore/payment-service:${VERSION}
    environment:
      DATABASE_URL: postgresql://payment:password@postgres:5432/paymentdb
      ENCRYPTION_KEY_FILE: /run/secrets/encryption_key
    networks:
      - backend
      - database
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 256M
          cpus: '0.5'
      placement:
        constraints: [node.labels.security == high]  # 部署在高安全节点
    secrets:
      - encryption_key

  # 数据库主节点
  postgres-master:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
      POSTGRES_REPLICATION_MODE: master
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD_FILE: /run/secrets/replication_password
    volumes:
      - postgres_master_data:/var/lib/postgresql/data
      - ./postgres/init:/docker-entrypoint-initdb.d:ro
    networks:
      - database
    deploy:
      replicas: 1
      placement:
        constraints: [node.labels.database == master]
      resources:
        limits:
          memory: 2G
          cpus: '2.0'
        reservations:
          memory: 1G
          cpus: '1.0'
    secrets:
      - postgres_password
      - replication_password

  # 数据库从节点
  postgres-slave:
    image: postgres:14
    environment:
      POSTGRES_MASTER_HOST: postgres-master
      POSTGRES_REPLICATION_MODE: slave
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD_FILE: /run/secrets/replication_password
    volumes:
      - postgres_slave_data:/var/lib/postgresql/data
    networks:
      - database
    deploy:
      replicas: 2
      placement:
        constraints: [node.labels.database == slave]
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
    depends_on:
      - postgres-master
    secrets:
      - replication_password

  # Redis 集群
  redis-cluster:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - database
    deploy:
      replicas: 6  # 3主3从
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  # 监控组件
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    networks:
      - monitoring
    deploy:
      replicas: 1
      placement:
        constraints: [node.role == manager]

  grafana:
    image: grafana/grafana:latest
    environment:
      GF_SECURITY_ADMIN_PASSWORD_FILE: /run/secrets/grafana_password
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - monitoring
    secrets:
      - grafana_password

# 网络定义
networks:
  frontend:
    driver: overlay
    attachable: true
  backend:
    driver: overlay
    internal: true
  database:
    driver: overlay
    internal: true
  monitoring:
    driver: overlay
    attachable: true

# 数据卷定义
volumes:
  postgres_master_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/postgres/master
  postgres_slave_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/postgres/slave
  redis_data:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local

# 密钥定义
secrets:
  db_password:
    external: true
  postgres_password:
    external: true
  replication_password:
    external: true
  jwt_secret:
    external: true
  encryption_key:
    external: true
  grafana_password:
    external: true
```

**部署脚本：**
```bash
#!/bin/bash
# deploy-production.sh

set -e

# 配置变量
STACK_NAME="ecommerce"
VERSION=${1:-latest}
REGISTRY="registry.example.com"

echo "Deploying $STACK_NAME version $VERSION..."

# 1. 创建 Swarm 密钥
echo "Creating secrets..."
echo "your-db-password" | docker secret create db_password - 2>/dev/null || true
echo "your-postgres-password" | docker secret create postgres_password - 2>/dev/null || true
echo "your-jwt-secret" | docker secret create jwt_secret - 2>/dev/null || true

# 2. 设置节点标签
echo "Setting node labels..."
docker node update --label-add database=master swarm-manager-1
docker node update --label-add database=slave swarm-worker-1
docker node update --label-add database=slave swarm-worker-2
docker node update --label-add security=high swarm-worker-3

# 3. 创建数据目录
echo "Creating data directories..."
sudo mkdir -p /data/postgres/{master,slave}
sudo chown -R 999:999 /data/postgres

# 4. 部署服务栈
echo "Deploying stack..."
VERSION=$VERSION docker stack deploy -c production-stack.yml $STACK_NAME

# 5. 等待服务启动
echo "Waiting for services to start..."
sleep 30

# 6. 验证部署
echo "Verifying deployment..."
docker stack services $STACK_NAME
docker service logs ${STACK_NAME}_web
docker service logs ${STACK_NAME}_api-gateway

# 7. 运行健康检查
echo "Running health checks..."
./health-check.sh

echo "Deployment completed successfully!"
```

**健康检查脚本：**
```bash
#!/bin/bash
# health-check.sh

STACK_NAME="ecommerce"
FAILED=0

echo "=== Health Check Report ==="

# 检查服务状态
echo "1. Service Status:"
for service in $(docker stack services $STACK_NAME --format "{{.Name}}"); do
    replicas=$(docker service ps $service --filter "desired-state=running" --format "{{.CurrentState}}" | grep -c "Running" || echo "0")
    desired=$(docker service inspect $service --format "{{.Spec.Replicas}}")
    
    if [ "$replicas" -eq "$desired" ]; then
        echo "✅ $service: $replicas/$desired replicas running"
    else
        echo "❌ $service: $replicas/$desired replicas running"
        FAILED=1
    fi
done

# 检查网络连通性
echo ""
echo "2. Network Connectivity:"
if curl -f -s http://localhost/health > /dev/null; then
    echo "✅ Web frontend accessible"
else
    echo "❌ Web frontend not accessible"
    FAILED=1
fi

if curl -f -s http://localhost:8001/status > /dev/null; then
    echo "✅ API Gateway accessible"
else
    echo "❌ API Gateway not accessible"
    FAILED=1
fi

# 检查数据库连接
echo ""
echo "3. Database Connectivity:"
if docker exec -it ${STACK_NAME}_postgres-master.1.$(docker service ps ${STACK_NAME}_postgres-master --format "{{.ID}}" | head -1) pg_isready -U postgres; then
    echo "✅ PostgreSQL master accessible"
else
    echo "❌ PostgreSQL master not accessible"
    FAILED=1
fi

# 检查 Redis 集群
echo ""
echo "4. Cache Status:"
if docker exec -it ${STACK_NAME}_redis-cluster.1.$(docker service ps ${STACK_NAME}_redis-cluster --format "{{.ID}}" | head -1) redis-cli ping | grep -q PONG; then
    echo "✅ Redis cluster accessible"
else
    echo "❌ Redis cluster not accessible"
    FAILED=1
fi

# 检查监控服务
echo ""
echo "5. Monitoring Status:"
if curl -f -s http://localhost:9090/api/v1/query?query=up > /dev/null; then
    echo "✅ Prometheus accessible"
else
    echo "❌ Prometheus not accessible"
    FAILED=1
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo "🎉 All health checks passed!"
    exit 0
else
    echo "💥 Some health checks failed!"
    exit 1
fi
```

## 总结

生产环境的 Docker 容器化部署是一个复杂的系统工程，需要考虑：

**核心要素：**
1. **高可用架构**：多副本部署、负载均衡、故障转移
2. **资源管理**：合理的资源限制和预留
3. **数据安全**：持久化存储、定期备份、灾难恢复
4. **监控告警**：全方位监控、及时告警、故障自愈
5. **性能优化**：网络优化、缓存策略、资源调优

**最佳实践：**
- 采用基础设施即代码（IaC）
- 实施 GitOps 工作流
- 建立完善的 CI/CD 流程
- 定期进行灾难恢复演练
- 保持系统和依赖的及时更新

通过系统化的规划和实施，Docker 容器化技术能够为生产环境提供稳定、高效、可扩展的服务支撑。