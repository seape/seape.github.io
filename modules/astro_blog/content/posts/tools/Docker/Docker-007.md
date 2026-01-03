---
title: "第 7 章：容器监控与日志"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第 7 章：容器监控与日志

::: tip 学习目标
- 掌握容器性能监控的方法和工具
- 学会容器日志的收集和分析
- 理解容器健康检查机制
- 熟练使用监控工具进行故障排查
:::

## 知识点

### 监控的重要性

容器监控是确保应用稳定运行的关键环节。有效的监控系统应该包含：

| 监控维度 | 监控指标 | 工具示例 |
|----------|----------|----------|
| 资源使用 | CPU、内存、磁盘、网络 | docker stats、cAdvisor |
| 应用性能 | 响应时间、吞吐量、错误率 | APM工具、自定义指标 |
| 日志分析 | 应用日志、系统日志、错误日志 | ELK Stack、Fluentd |
| 健康状态 | 服务可用性、依赖检查 | Health Check、Probe |

### 监控架构模式

```text
容器监控架构：
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   应用容器   │    │   应用容器   │    │   应用容器   │
└─────────────┘    └─────────────┘    └─────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                           │
                ┌─────────────┐
                │  监控代理    │ (cAdvisor, Node Exporter)
                └─────────────┘
                           │
                ┌─────────────┐
                │  监控系统    │ (Prometheus, Grafana)
                └─────────────┘
                           │
                ┌─────────────┐
                │  告警系统    │ (AlertManager, PagerDuty)
                └─────────────┘
```

## Docker内置监控

### docker stats命令

```bash
# 实时监控所有容器
docker stats

# 监控特定容器
docker stats web-server api-server

# 格式化输出
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# 一次性输出（不持续刷新）
docker stats --no-stream

# 显示所有容器（包括停止的）
docker stats --all

# 输出到文件
docker stats --format "{{.Name}},{{.CPUPerc}},{{.MemUsage}}" --no-stream > container_stats.csv
```

### 系统事件监控

```bash
# 实时监控Docker事件
docker events

# 过滤特定容器的事件
docker events --filter container=web-server

# 过滤特定类型的事件
docker events --filter event=start
docker events --filter event=die
docker events --filter event=restart

# 时间范围过滤
docker events --since="2023-01-01"
docker events --until="2023-01-02"

# 格式化事件输出
docker events --format 'Time={{.Time}} Action={{.Action}} Container={{.Actor.Attributes.name}}'

# 将事件保存到文件
docker events --since="1h" > docker_events.log
```

### 容器资源限制监控

```bash
# 查看容器资源限制
docker inspect container-name | jq '.[0].HostConfig | {Memory, CpuShares, CpuQuota, CpuPeriod}'

# 运行带资源限制的容器
docker run -d --name limited-container \
    --memory=512m \
    --cpus=0.5 \
    --memory-swap=1g \
    nginx:alpine

# 监控资源使用是否超限
docker stats limited-container
```

## 高级监控解决方案

### cAdvisor监控

```bash
# 运行cAdvisor容器
docker run -d \
    --name=cadvisor \
    --restart=unless-stopped \
    --volume=/:/rootfs:ro \
    --volume=/var/run:/var/run:ro \
    --volume=/sys:/sys:ro \
    --volume=/var/lib/docker/:/var/lib/docker:ro \
    --volume=/dev/disk/:/dev/disk:ro \
    --publish=8080:8080 \
    --detach=true \
    gcr.io/cadvisor/cadvisor:latest

# 访问cAdvisor Web界面
# http://localhost:8080
```

### Prometheus + Grafana监控栈

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  # Prometheus监控系统
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./prometheus/rules:/etc/prometheus/rules:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
    networks:
      - monitoring

  # Grafana可视化
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    depends_on:
      - prometheus
    networks:
      - monitoring

  # Node Exporter (主机指标)
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
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
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - monitoring

  # cAdvisor (容器指标)
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    privileged: true
    devices:
      - /dev/kmsg
    networks:
      - monitoring

  # AlertManager (告警管理)
  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
      - alertmanager_data:/alertmanager
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:

networks:
  monitoring:
    driver: bridge
```

Prometheus配置文件：

```yaml
# prometheus/prometheus.yml
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

  - job_name: 'docker-containers'
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
        port: 8080
```

### 自定义应用指标

```python
# Python Flask应用集成Prometheus
from flask import Flask, Response
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import time

app = Flask(__name__)

# 定义指标
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency')

@app.before_request
def before_request():
    app.start_time = time.time()

@app.after_request
def after_request(response):
    request_latency = time.time() - app.start_time
    REQUEST_COUNT.labels(
        method=request.method, 
        endpoint=request.endpoint or 'unknown',
        status=response.status_code
    ).inc()
    REQUEST_LATENCY.observe(request_latency)
    return response

@app.route('/metrics')
def metrics():
    return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)

@app.route('/')
def home():
    return {'message': 'Hello World', 'timestamp': time.time()}

@app.route('/health')
def health():
    return {'status': 'healthy'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

## 日志管理

### Docker日志驱动

```bash
# 查看当前日志驱动
docker info | grep "Logging Driver"

# 配置全局日志驱动
sudo tee /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "compress": "true"
  }
}
EOF

# 重启Docker服务
sudo systemctl restart docker

# 为特定容器设置日志驱动
docker run -d --name app \
    --log-driver json-file \
    --log-opt max-size=10m \
    --log-opt max-file=3 \
    myapp:latest

# 使用syslog驱动
docker run -d --name app \
    --log-driver syslog \
    --log-opt syslog-address=tcp://192.168.1.100:514 \
    --log-opt tag="{{.Name}}" \
    myapp:latest
```

### ELK Stack日志系统

```yaml
# docker-compose.elk.yml
version: '3.8'

services:
  # Elasticsearch
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - elk

  # Logstash
  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    container_name: logstash
    ports:
      - "5044:5044"
      - "9600:9600"
    volumes:
      - ./logstash/config:/usr/share/logstash/pipeline:ro
      - ./logstash/logstash.yml:/usr/share/logstash/config/logstash.yml:ro
    depends_on:
      - elasticsearch
    networks:
      - elk

  # Kibana
  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    container_name: kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - elk

  # Filebeat (日志收集器)
  filebeat:
    image: docker.elastic.co/beats/filebeat:7.15.0
    container_name: filebeat
    user: root
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - logstash
    networks:
      - elk

  # 示例应用
  web-app:
    image: nginx:alpine
    container_name: web-app
    ports:
      - "8080:80"
    labels:
      - "co.elastic.logs/enabled=true"
      - "co.elastic.logs/module=nginx"
    networks:
      - elk

volumes:
  elasticsearch_data:

networks:
  elk:
    driver: bridge
```

Filebeat配置：

```yaml
# filebeat/filebeat.yml
filebeat.inputs:
- type: container
  paths:
    - '/var/lib/docker/containers/*/*.log'
  processors:
    - add_docker_metadata:
        host: "unix:///var/run/docker.sock"

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

### 应用日志结构化

```python
# Python应用结构化日志
import logging
import json
import sys
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # 添加额外字段
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
            
        return json.dumps(log_entry)

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',
    stream=sys.stdout
)

logger = logging.getLogger(__name__)
logger.handlers[0].setFormatter(JSONFormatter())

# 使用示例
logger.info("User login successful", extra={'user_id': 123, 'request_id': 'req-456'})
logger.error("Database connection failed", extra={'error_code': 'DB001'})
```

## 健康检查

### Docker健康检查

```dockerfile
# Dockerfile中定义健康检查
FROM nginx:alpine

# 安装curl用于健康检查
RUN apk add --no-cache curl

# 定义健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# 复制自定义健康检查脚本
COPY health-check.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/health-check.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /usr/local/bin/health-check.sh
```

```bash
#!/bin/bash
# health-check.sh
set -e

# 检查Web服务
if ! curl -f http://localhost/ >/dev/null 2>&1; then
    echo "Web service health check failed"
    exit 1
fi

# 检查数据库连接
if ! pg_isready -h db -p 5432 >/dev/null 2>&1; then
    echo "Database health check failed"
    exit 1
fi

# 检查Redis连接
if ! redis-cli -h redis ping | grep -q "PONG"; then
    echo "Redis health check failed"
    exit 1
fi

echo "All health checks passed"
exit 0
```

### Compose中的健康检查

```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 1m30s
      timeout: 10s
      retries: 3
      start_period: 40s

  api:
    build: ./api
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    depends_on:
      database:
        condition: service_healthy

  database:
    image: postgres:13
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
```

### 健康检查监控

```bash
# 查看容器健康状态
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 检查健康状态详情
docker inspect --format='{{.State.Health.Status}}' container-name
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' container-name

# 只显示不健康的容器
docker ps --filter health=unhealthy
```

## 实战监控案例

### 完整监控解决方案

```bash
# 创建监控项目
mkdir docker-monitoring
cd docker-monitoring

# 创建目录结构
mkdir -p {prometheus/{rules,targets},grafana/{dashboards,provisioning/{dashboards,datasources}},alertmanager}
```

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  # 应用服务
  web-app:
    build: ./app
    container_name: web-app
    ports:
      - "8000:8000"
    environment:
      - PROMETHEUS_METRICS=true
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=8000"
      - "prometheus.path=/metrics"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app
      - monitoring

  # 数据库
  postgres:
    image: postgres:13
    container_name: postgres
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app

  # 监控栈
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./prometheus/rules:/etc/prometheus/rules
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
      - '--web.route-prefix=/'
      - '--web.external-url=http://localhost:9090'
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    networks:
      - monitoring

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    networks:
      - monitoring

  # 导出器
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
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
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - monitoring

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    privileged: true
    networks:
      - monitoring

volumes:
  postgres_data:
  prometheus_data:
  grafana_data:
  alertmanager_data:

networks:
  app:
    driver: bridge
  monitoring:
    driver: bridge
```

告警规则配置：

```yaml
# prometheus/rules/alerts.yml
groups:
- name: container.rules
  rules:
  - alert: ContainerDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Container {{ $labels.instance }} is down"
      description: "Container {{ $labels.instance }} has been down for more than 1 minute."

  - alert: HighCPUUsage
    expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage on {{ $labels.name }}"
      description: "Container {{ $labels.name }} has high CPU usage: {{ $value }}%"

  - alert: HighMemoryUsage
    expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage on {{ $labels.name }}"
      description: "Container {{ $labels.name }} has high memory usage: {{ $value }}%"

  - alert: ContainerUnhealthy
    expr: container_healthcheck_failures_total > 3
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Container {{ $labels.name }} is unhealthy"
      description: "Container {{ $labels.name }} has failed health checks {{ $value }} times."
```

::: note 监控最佳实践
1. **四个黄金信号**：监控延迟、流量、错误和饱和度
2. **分层监控**：基础设施、平台、应用和业务层面
3. **告警策略**：避免告警疲劳，设置合理的阈值和抑制规则
4. **日志结构化**：使用结构化日志便于分析和查询
5. **监控即代码**：将监控配置纳入版本控制
:::

::: warning 注意事项
- 监控系统本身也需要监控，避免单点故障
- 日志存储需要考虑磁盘空间和保留策略
- 敏感信息不应出现在日志中
- 监控数据的安全传输和访问控制
:::

## 小结

通过本章学习，你应该掌握了：

- **基础监控**：使用Docker内置工具进行容器监控
- **高级监控**：部署Prometheus+Grafana监控栈
- **日志管理**：使用ELK Stack进行日志收集和分析
- **健康检查**：配置容器健康检查机制
- **监控实践**：建立完整的监控告警体系

下一章我们将学习Docker安全与最佳实践，保障容器化应用的安全运行。