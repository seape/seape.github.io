---
title: 第9章 CI/CD集成与自动化
icon: workflow
date: 2024-01-09
category:
  - Docker
  - DevOps
tag:
  - CICD
  - 自动化部署
  - Jenkins
  - GitLab CI
  - GitHub Actions
---

# 第9章 CI/CD集成与自动化

## 学习目标

1. 理解 Docker 在 CI/CD 流程中的作用
2. 掌握基于 Docker 的持续集成配置
3. 学会实现自动化镜像构建和推送
4. 实现容器化应用的自动部署
5. 掌握多环境部署策略

## 知识点详解

### 9.1 CI/CD 基础概念

#### 9.1.1 CI/CD 流程概述

**传统 CI/CD 流程：**
```mermaid
graph LR
    A[代码提交] --> B[构建]
    B --> C[测试]
    C --> D[打包]
    D --> E[部署]
    E --> F[监控]
```

**Docker 化 CI/CD 流程：**
```mermaid
graph LR
    A[代码提交] --> B[Docker构建]
    B --> C[容器测试]
    C --> D[镜像推送]
    D --> E[容器部署]
    E --> F[服务监控]
```

#### 9.1.2 Docker 在 CI/CD 中的优势

**环境一致性：**
```bash
# 开发环境
docker run -p 3000:3000 myapp:dev

# 测试环境
docker run -p 3000:3000 myapp:test

# 生产环境
docker run -p 3000:3000 myapp:prod
```

**快速部署：**
```bash
# 蓝绿部署
docker service update --image myapp:v2.0 web-service

# 滚动更新
docker service update --update-parallelism 2 --update-delay 10s myapp
```

### 9.2 Jenkins 集成

#### 9.2.1 Jenkins 环境搭建

**Docker 运行 Jenkins：**
```bash
# 创建 Jenkins 数据卷
docker volume create jenkins_home

# 运行 Jenkins 容器
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/bin/docker:/usr/bin/docker \
  jenkins/jenkins:lts
```

**Jenkins 配置文件：**
```yaml
# docker-compose.yml
version: '3.8'
services:
  jenkins:
    image: jenkins/jenkins:lts
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - JAVA_OPTS=-Dhudson.plugins.git.GitSCM.ALLOW_LOCAL_CHECKOUT=true
    networks:
      - jenkins-network

  jenkins-agent:
    image: jenkins/inbound-agent:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker
    networks:
      - jenkins-network

volumes:
  jenkins_home:

networks:
  jenkins-network:
    driver: bridge
```

#### 9.2.2 Jenkins Pipeline 配置

**Jenkinsfile 示例：**
```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        IMAGE_NAME = 'myapp'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/your-repo/myapp.git'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                    docker.build("${IMAGE_NAME}:latest")
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    // 运行测试容器
                    sh """
                        docker run --rm \
                        -v \$(pwd):/app \
                        ${IMAGE_NAME}:${IMAGE_TAG} \
                        npm test
                    """
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    // 使用 Trivy 扫描镜像
                    sh """
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:latest image ${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        docker.image("${IMAGE_NAME}:${IMAGE_TAG}").push()
                        docker.image("${IMAGE_NAME}:latest").push()
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            steps {
                script {
                    // 部署到测试环境
                    sh """
                        docker service update \
                        --image ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                        staging_web
                    """
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                script {
                    // 运行集成测试
                    sh """
                        docker run --rm \
                        --network staging_network \
                        cypress/included:latest \
                        --spec "cypress/integration/**/*"
                    """
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input 'Deploy to production?'
                script {
                    // 生产环境部署
                    sh """
                        docker service update \
                        --image ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                        --update-parallelism 2 \
                        --update-delay 30s \
                        production_web
                    """
                }
            }
        }
    }
    
    post {
        always {
            // 清理构建镜像
            sh "docker image prune -f"
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
```

**多分支构建策略：**
```groovy
pipeline {
    agent any
    
    stages {
        stage('Build & Test') {
            steps {
                script {
                    def imageTag = env.BRANCH_NAME == 'main' ? 'latest' : env.BRANCH_NAME
                    
                    // 构建镜像
                    def image = docker.build("myapp:${imageTag}")
                    
                    // 运行测试
                    image.inside {
                        sh 'npm test'
                    }
                    
                    // 根据分支决定是否推送
                    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME.startsWith('release/')) {
                        docker.withRegistry('https://your-registry.com', 'registry-credentials') {
                            image.push()
                        }
                    }
                }
            }
        }
    }
}
```

### 9.3 GitLab CI 集成

#### 9.3.1 GitLab CI 配置

**.gitlab-ci.yml 基础配置：**
```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - security
  - deploy-staging
  - deploy-production

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  LATEST_TAG: $CI_REGISTRY_IMAGE:latest

services:
  - docker:dind

before_script:
  - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY

build:
  stage: build
  image: docker:latest
  script:
    - docker build -t $IMAGE_TAG .
    - docker build -t $LATEST_TAG .
    - docker push $IMAGE_TAG
    - docker push $LATEST_TAG
  only:
    - main
    - develop
    - merge_requests

test:
  stage: test
  image: docker:latest
  script:
    - docker pull $IMAGE_TAG
    - docker run --rm $IMAGE_TAG npm test
    - docker run --rm $IMAGE_TAG npm run lint
  coverage: '/Coverage: \d+\.\d+/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

security_scan:
  stage: security
  image: docker:latest
  script:
    - docker pull $IMAGE_TAG
    - docker run --rm -v /var/run/docker.sock:/var/run/docker.sock 
      aquasec/trivy:latest image --format table $IMAGE_TAG
  allow_failure: true

deploy_staging:
  stage: deploy-staging
  image: docker:latest
  script:
    - echo "Deploying to staging..."
    - docker service update --image $IMAGE_TAG staging_web
  environment:
    name: staging
    url: https://staging.example.com
  only:
    - develop

deploy_production:
  stage: deploy-production
  image: docker:latest
  script:
    - echo "Deploying to production..."
    - docker service update --image $IMAGE_TAG production_web
  environment:
    name: production
    url: https://example.com
  when: manual
  only:
    - main
```

#### 9.3.2 多环境部署

**环境特定配置：**
```yaml
# .gitlab-ci.yml
.deploy_template: &deploy_template
  image: docker:latest
  script:
    - docker-compose -f docker-compose.$ENVIRONMENT.yml up -d
    - docker system prune -f

deploy_dev:
  <<: *deploy_template
  stage: deploy
  variables:
    ENVIRONMENT: development
  environment:
    name: development
  only:
    - develop

deploy_staging:
  <<: *deploy_template
  stage: deploy
  variables:
    ENVIRONMENT: staging
  environment:
    name: staging
  only:
    - main

deploy_production:
  <<: *deploy_template
  stage: deploy
  variables:
    ENVIRONMENT: production
  environment:
    name: production
  when: manual
  only:
    - main
```

**环境配置文件：**
```yaml
# docker-compose.development.yml
version: '3.8'
services:
  web:
    image: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DEBUG=true

# docker-compose.production.yml
version: '3.8'
services:
  web:
    image: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
```

### 9.4 GitHub Actions 集成

#### 9.4.1 基础工作流

**.github/workflows/ci-cd.yml：**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Run tests
      run: |
        docker run --rm ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} npm test

  security-scan:
    runs-on: ubuntu-latest
    needs: build-and-test
    
    steps:
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build-and-test, security-scan]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - name: Deploy to staging
      uses: appleboy/ssh-action@v0.1.7
      with:
        host: ${{ secrets.STAGING_HOST }}
        username: ${{ secrets.STAGING_USER }}
        key: ${{ secrets.STAGING_SSH_KEY }}
        script: |
          docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          docker service update --image ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} staging_web

  deploy-production:
    runs-on: ubuntu-latest
    needs: [build-and-test, security-scan]
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.7
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.PRODUCTION_USER }}
        key: ${{ secrets.PRODUCTION_SSH_KEY }}
        script: |
          docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          docker service update \
            --image ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
            --update-parallelism 2 \
            --update-delay 30s \
            production_web
```

#### 9.4.2 矩阵构建策略

**多版本构建：**
```yaml
name: Multi-version Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
        platform: [linux/amd64, linux/arm64]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Build Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        platforms: ${{ matrix.platform }}
        build-args: |
          NODE_VERSION=${{ matrix.node-version }}
        tags: myapp:node${{ matrix.node-version }}-${{ matrix.platform }}
        push: false

  test:
    runs-on: ubuntu-latest
    needs: build
    strategy:
      matrix:
        test-suite: [unit, integration, e2e]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Run ${{ matrix.test-suite }} tests
      run: |
        docker run --rm myapp:latest npm run test:${{ matrix.test-suite }}
```

### 9.5 自动化部署策略

#### 9.5.1 蓝绿部署

**蓝绿部署脚本：**
```bash
#!/bin/bash
# blue-green-deploy.sh

IMAGE_TAG=$1
SERVICE_NAME="web-service"
NETWORK_NAME="app-network"

# 获取当前活跃的部署
CURRENT_COLOR=$(docker service inspect --format '{{.Spec.Labels.color}}' ${SERVICE_NAME} 2>/dev/null || echo "blue")

# 确定新的颜色
if [ "$CURRENT_COLOR" = "blue" ]; then
    NEW_COLOR="green"
else
    NEW_COLOR="blue"
fi

echo "Current deployment: $CURRENT_COLOR"
echo "New deployment: $NEW_COLOR"

# 部署新版本
docker service create \
    --name ${SERVICE_NAME}-${NEW_COLOR} \
    --network $NETWORK_NAME \
    --label color=$NEW_COLOR \
    --replicas 3 \
    $IMAGE_TAG

# 等待新服务就绪
echo "Waiting for new service to be ready..."
while [ $(docker service ps ${SERVICE_NAME}-${NEW_COLOR} --filter "desired-state=running" --format "{{.CurrentState}}" | grep -c "Running") -ne 3 ]; do
    sleep 5
done

# 健康检查
echo "Performing health check..."
if curl -f http://localhost:8080/health; then
    echo "Health check passed. Switching traffic..."
    
    # 更新负载均衡器配置
    docker service update \
        --label-add color=$NEW_COLOR \
        nginx-lb
    
    # 移除旧服务
    if docker service ls --filter name=${SERVICE_NAME}-${CURRENT_COLOR} --format "{{.Name}}" | grep -q ${SERVICE_NAME}-${CURRENT_COLOR}; then
        docker service rm ${SERVICE_NAME}-${CURRENT_COLOR}
    fi
    
    # 重命名新服务
    docker service update --name ${SERVICE_NAME} ${SERVICE_NAME}-${NEW_COLOR}
    
    echo "Deployment completed successfully!"
else
    echo "Health check failed. Rolling back..."
    docker service rm ${SERVICE_NAME}-${NEW_COLOR}
    exit 1
fi
```

#### 9.5.2 滚动更新

**Kubernetes 滚动更新：**
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web
        image: myapp:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Docker Swarm 滚动更新：**
```bash
# 配置滚动更新参数
docker service update \
    --image myapp:v2.0 \
    --update-parallelism 2 \
    --update-delay 30s \
    --update-failure-action rollback \
    --update-monitor 60s \
    web-service
```

#### 9.5.3 金丝雀发布

**金丝雀发布配置：**
```bash
#!/bin/bash
# canary-deploy.sh

NEW_IMAGE=$1
CANARY_PERCENTAGE=${2:-10}

# 计算金丝雀实例数
TOTAL_REPLICAS=$(docker service inspect --format='{{.Spec.Replicas}}' production-web)
CANARY_REPLICAS=$((TOTAL_REPLICAS * CANARY_PERCENTAGE / 100))

echo "Deploying canary with $CANARY_REPLICAS replicas (${CANARY_PERCENTAGE}%)"

# 创建金丝雀服务
docker service create \
    --name production-web-canary \
    --network production-network \
    --label version=canary \
    --replicas $CANARY_REPLICAS \
    $NEW_IMAGE

# 监控金丝雀指标
echo "Monitoring canary deployment..."
sleep 300

# 检查错误率
ERROR_RATE=$(curl -s "http://prometheus:9090/api/v1/query?query=rate(http_requests_total{status=~'5..'}[5m])" | jq '.data.result[0].value[1]' | tr -d '"')

if (( $(echo "$ERROR_RATE < 0.01" | bc -l) )); then
    echo "Canary deployment successful. Promoting to full deployment..."
    
    # 更新生产服务
    docker service update --image $NEW_IMAGE production-web
    
    # 移除金丝雀服务
    docker service rm production-web-canary
    
    echo "Full deployment completed!"
else
    echo "Canary deployment failed. Rolling back..."
    docker service rm production-web-canary
    exit 1
fi
```

### 9.6 监控与回滚

#### 9.6.1 部署监控

**Prometheus 监控配置：**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'docker'
    static_configs:
      - targets: ['localhost:9323']
  
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

rule_files:
  - "deployment_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

**部署告警规则：**
```yaml
# deployment_rules.yml
groups:
- name: deployment
  rules:
  - alert: DeploymentFailed
    expr: up{job="app"} == 0
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Application deployment failed"
      description: "Application {{ $labels.instance }} is down for more than 2 minutes"

  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} for instance {{ $labels.instance }}"

  - alert: HighLatency
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High latency detected"
      description: "95th percentile latency is {{ $value }}s for instance {{ $labels.instance }}"
```

#### 9.6.2 自动回滚

**健康检查和回滚脚本：**
```bash
#!/bin/bash
# auto-rollback.sh

SERVICE_NAME=$1
NEW_IMAGE=$2
HEALTH_ENDPOINT=$3
MAX_WAIT=300
WAIT_INTERVAL=10

echo "Updating service $SERVICE_NAME to $NEW_IMAGE"

# 获取当前镜像作为回滚版本
PREVIOUS_IMAGE=$(docker service inspect --format='{{.Spec.TaskTemplate.ContainerSpec.Image}}' $SERVICE_NAME)

# 执行更新
docker service update --image $NEW_IMAGE $SERVICE_NAME

# 等待服务更新完成
echo "Waiting for service update to complete..."
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
    REPLICAS_UPDATED=$(docker service ps $SERVICE_NAME --filter "desired-state=running" --format "{{.Image}}" | grep -c $NEW_IMAGE)
    TOTAL_REPLICAS=$(docker service inspect --format='{{.Spec.Replicas}}' $SERVICE_NAME)
    
    if [ $REPLICAS_UPDATED -eq $TOTAL_REPLICAS ]; then
        echo "All replicas updated successfully"
        break
    fi
    
    sleep $WAIT_INTERVAL
    ELAPSED=$((ELAPSED + WAIT_INTERVAL))
done

# 健康检查
echo "Performing health check..."
sleep 30  # 等待应用启动

HEALTH_CHECK_ATTEMPTS=0
MAX_HEALTH_ATTEMPTS=10

while [ $HEALTH_CHECK_ATTEMPTS -lt $MAX_HEALTH_ATTEMPTS ]; do
    if curl -f -s $HEALTH_ENDPOINT > /dev/null; then
        echo "Health check passed"
        
        # 检查错误率
        ERROR_COUNT=$(curl -s "http://prometheus:9090/api/v1/query?query=increase(http_requests_total{status=~'5..'}[5m])" | jq '.data.result[0].value[1]' | tr -d '"' | cut -d. -f1)
        
        if [ ${ERROR_COUNT:-0} -lt 10 ]; then
            echo "Deployment successful!"
            exit 0
        else
            echo "High error rate detected, initiating rollback..."
            break
        fi
    else
        echo "Health check failed, attempt $((HEALTH_CHECK_ATTEMPTS + 1))"
        HEALTH_CHECK_ATTEMPTS=$((HEALTH_CHECK_ATTEMPTS + 1))
        sleep 30
    fi
done

# 执行回滚
echo "Rolling back to previous version: $PREVIOUS_IMAGE"
docker service update --image $PREVIOUS_IMAGE $SERVICE_NAME

# 等待回滚完成
echo "Waiting for rollback to complete..."
sleep 60

# 验证回滚
if curl -f -s $HEALTH_ENDPOINT > /dev/null; then
    echo "Rollback completed successfully"
    exit 1
else
    echo "Rollback failed, manual intervention required"
    exit 2
fi
```

## 实战案例

### 案例1：微服务 CI/CD 流水线

**场景描述：**
为一个包含前端、API 网关、用户服务、订单服务的微服务架构建立完整的 CI/CD 流水线。

**项目结构：**
```
microservices-app/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── api-gateway/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── user-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── order-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── docker-compose.yml
├── .gitlab-ci.yml
└── deploy/
    ├── staging.yml
    └── production.yml
```

**GitLab CI 配置：**
```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy-staging
  - integration-test
  - deploy-production

variables:
  DOCKER_DRIVER: overlay2
  SERVICES: "frontend api-gateway user-service order-service"

.build_template: &build_template
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - cd $SERVICE_DIR
    - docker build -t $CI_REGISTRY_IMAGE/$SERVICE_NAME:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE/$SERVICE_NAME:$CI_COMMIT_SHA
  only:
    changes:
      - "$SERVICE_DIR/**/*"

build-frontend:
  <<: *build_template
  variables:
    SERVICE_NAME: frontend
    SERVICE_DIR: frontend

build-api-gateway:
  <<: *build_template
  variables:
    SERVICE_NAME: api-gateway
    SERVICE_DIR: api-gateway

build-user-service:
  <<: *build_template
  variables:
    SERVICE_NAME: user-service
    SERVICE_DIR: user-service

build-order-service:
  <<: *build_template
  variables:
    SERVICE_NAME: order-service
    SERVICE_DIR: order-service

.test_template: &test_template
  stage: test
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker run --rm $CI_REGISTRY_IMAGE/$SERVICE_NAME:$CI_COMMIT_SHA npm test

test-frontend:
  <<: *test_template
  variables:
    SERVICE_NAME: frontend
  needs: ["build-frontend"]

test-api-gateway:
  <<: *test_template
  variables:
    SERVICE_NAME: api-gateway
  needs: ["build-api-gateway"]

test-user-service:
  <<: *test_template
  variables:
    SERVICE_NAME: user-service
  needs: ["build-user-service"]

test-order-service:
  <<: *test_template
  variables:
    SERVICE_NAME: order-service
  needs: ["build-order-service"]

deploy-staging:
  stage: deploy-staging
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker-compose -f deploy/staging.yml up -d
  environment:
    name: staging
    url: https://staging.example.com
  only:
    - develop

integration-tests:
  stage: integration-test
  image: postman/newman:alpine
  script:
    - newman run tests/integration/postman_collection.json --environment tests/integration/staging.json
  needs: ["deploy-staging"]

deploy-production:
  stage: deploy-production
  image: docker:latest
  services:
    - docker:dind
  script:
    - ./scripts/blue-green-deploy.sh
  environment:
    name: production
    url: https://example.com
  when: manual
  only:
    - main
```

**蓝绿部署脚本：**
```bash
#!/bin/bash
# scripts/blue-green-deploy.sh

SERVICES="frontend api-gateway user-service order-service"
REGISTRY=$CI_REGISTRY_IMAGE
TAG=$CI_COMMIT_SHA

# 获取当前环境颜色
CURRENT_COLOR=$(docker service ls --filter label=environment=production --format "{{.Labels}}" | grep -o 'color=[^,]*' | cut -d= -f2 | head -1)
NEW_COLOR=$([ "$CURRENT_COLOR" = "blue" ] && echo "green" || echo "blue")

echo "Current production: $CURRENT_COLOR"
echo "Deploying new production: $NEW_COLOR"

# 为每个服务创建新的部署
for SERVICE in $SERVICES; do
    echo "Deploying $SERVICE..."
    
    docker service create \
        --name ${SERVICE}-${NEW_COLOR} \
        --label environment=production \
        --label color=$NEW_COLOR \
        --network production-network \
        --replicas 2 \
        $REGISTRY/$SERVICE:$TAG
done

# 等待所有服务就绪
echo "Waiting for services to be ready..."
for SERVICE in $SERVICES; do
    while [ $(docker service ps ${SERVICE}-${NEW_COLOR} --filter "desired-state=running" --format "{{.CurrentState}}" | grep -c "Running") -ne 2 ]; do
        sleep 10
    done
    echo "$SERVICE is ready"
done

# 健康检查
echo "Performing health checks..."
sleep 30

HEALTH_CHECK_PASSED=true
for SERVICE in $SERVICES; do
    if ! curl -f http://${SERVICE}-${NEW_COLOR}:8080/health; then
        echo "Health check failed for $SERVICE"
        HEALTH_CHECK_PASSED=false
    fi
done

if [ "$HEALTH_CHECK_PASSED" = true ]; then
    echo "All health checks passed. Switching traffic..."
    
    # 更新负载均衡器
    docker service update --label-add color=$NEW_COLOR nginx-lb
    
    # 移除旧版本
    for SERVICE in $SERVICES; do
        if docker service ls --filter name=${SERVICE}-${CURRENT_COLOR} --format "{{.Name}}" | grep -q ${SERVICE}-${CURRENT_COLOR}; then
            docker service rm ${SERVICE}-${CURRENT_COLOR}
        fi
        
        # 重命名新服务
        docker service update --name $SERVICE ${SERVICE}-${NEW_COLOR}
    done
    
    echo "Blue-green deployment completed successfully!"
else
    echo "Health checks failed. Rolling back..."
    for SERVICE in $SERVICES; do
        docker service rm ${SERVICE}-${NEW_COLOR}
    done
    exit 1
fi
```

### 案例2：基于 GitHub Actions 的自动化发布

**场景描述：**
使用 GitHub Actions 实现基于语义化版本的自动发布流程。

**.github/workflows/release.yml：**
```yaml
name: Release

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha,prefix={{branch}}-
    
    - name: Build and push Docker image
      id: build
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        platforms: linux/amd64,linux/arm64

  security:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ${{ needs.build.outputs.image-tag }}
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results to GitHub Security tab
      uses: github/codeql-action/upload-sarif@v2
      if: always()
      with:
        sarif_file: 'trivy-results.sarif'

  release:
    needs: [test, build, security]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    permissions:
      contents: write
      pull-requests: write
      issues: write
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      with:
        fetch-depth: 0
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Release
      uses: cycjimmy/semantic-release-action@v3
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        extra_plugins: |
          @semantic-release/changelog
          @semantic-release/git

  deploy-staging:
    needs: [build, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: staging
    
    steps:
    - name: Deploy to staging
      uses: appleboy/ssh-action@v0.1.7
      with:
        host: ${{ secrets.STAGING_HOST }}
        username: ${{ secrets.STAGING_USER }}
        key: ${{ secrets.STAGING_SSH_KEY }}
        script: |
          docker pull ${{ needs.build.outputs.image-tag }}
          docker-compose -f docker-compose.staging.yml up -d
          docker system prune -f

  deploy-production:
    needs: [release]
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.7
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.PRODUCTION_USER }}
        key: ${{ secrets.PRODUCTION_SSH_KEY }}
        script: |
          # 获取最新发布版本
          LATEST_TAG=$(curl -s https://api.github.com/repos/${{ github.repository }}/releases/latest | jq -r .tag_name)
          docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:$LATEST_TAG
          
          # 执行蓝绿部署
          ./blue-green-deploy.sh ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:$LATEST_TAG
```

## 总结

Docker 在 CI/CD 流程中扮演着核心角色，通过容器化技术实现了：

1. **环境一致性**：开发、测试、生产环境完全一致
2. **快速部署**：容器启动速度快，部署效率高
3. **易于扩展**：支持水平扩展和负载均衡
4. **版本管理**：通过镜像标签实现版本控制
5. **回滚能力**：快速回滚到之前的版本

**最佳实践总结：**

- 使用多阶段构建优化镜像大小
- 实施镜像安全扫描和漏洞检测
- 采用语义化版本管理策略
- 实现自动化测试和部署
- 建立完善的监控和告警机制
- 制定应急响应和回滚策略

通过合理的 CI/CD 流程设计，可以显著提高开发效率，降低部署风险，确保应用的高质量和稳定性。