---
title: "第6章：使用CDK创建Lambda函数"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第6章：使用CDK创建Lambda函数

::: info 章节概述
本章将详细介绍如何使用Python CDK创建、配置和部署Lambda函数。我们将从最简单的Hello World函数开始，逐步深入到复杂的函数配置和部署策略。
:::

## 学习目标

1. 掌握使用CDK创建Lambda函数的完整流程
2. 理解Lambda函数的各种配置选项
3. 学会处理函数代码的打包和部署
4. 掌握环境变量和权限配置
5. 了解不同的部署模式和最佳实践

## 6.1 Lambda函数基础配置

### 6.1.1 最简单的Lambda函数

```python
# stacks/lambda_stack.py
from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    Duration
)
from constructs import Construct

class LambdaStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建最简单的Lambda函数
        self.hello_function = _lambda.Function(
            self, "HelloWorldFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_inline("""
def handler(event, context):
    return {
        'statusCode': 200,
        'body': 'Hello from Lambda!'
    }
            """),
            function_name="hello-world-function"
        )
```

### 6.1.2 从文件创建Lambda函数

```python
# 项目结构
my_lambda_cdk/
├── lambda_functions/
│   └── hello_world/
│       ├── index.py
│       └── requirements.txt
└── stacks/
    └── lambda_stack.py
```

```python
# lambda_functions/hello_world/index.py
import json
import os
from datetime import datetime

def handler(event, context):
    """
    Lambda函数处理器
    """
    response = {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'message': 'Hello from Lambda CDK!',
            'timestamp': datetime.utcnow().isoformat(),
            'function_name': context.function_name,
            'function_version': context.function_version,
            'environment': os.getenv('ENVIRONMENT', 'unknown')
        })
    }
    
    return response
```

```python
# stacks/lambda_stack.py (更新版本)
from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    Duration
)
from constructs import Construct
import os

class LambdaStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 从目录创建Lambda函数
        self.hello_function = _lambda.Function(
            self, "HelloWorldFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset(
                os.path.join(os.path.dirname(__file__), 
                           "../lambda_functions/hello_world")
            ),
            function_name="hello-world-function",
            timeout=Duration.seconds(30),
            memory_size=128,
            environment={
                "ENVIRONMENT": "development",
                "LOG_LEVEL": "INFO"
            }
        )
```

## 6.2 Lambda函数配置详解

### 6.2.1 运行时和处理器配置

```python
from aws_cdk import aws_lambda as _lambda

class AdvancedLambdaStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 支持的Python运行时
        runtimes = {
            'python38': _lambda.Runtime.PYTHON_3_8,
            'python39': _lambda.Runtime.PYTHON_3_9,
            'python310': _lambda.Runtime.PYTHON_3_10,
            'python311': _lambda.Runtime.PYTHON_3_11
        }
        
        # 创建多个版本的函数
        self.functions = {}
        for name, runtime in runtimes.items():
            self.functions[name] = _lambda.Function(
                self, f"Function{name.title()}",
                runtime=runtime,
                handler="index.handler",
                code=_lambda.Code.from_asset("lambda_functions/multi_runtime"),
                function_name=f"multi-runtime-{name}",
                description=f"Function using {runtime.name}"
            )
```

### 6.2.2 内存和超时配置

```python
from aws_cdk import Duration

class PerformanceOptimizedStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 不同性能需求的函数配置
        function_configs = [
            {
                'name': 'LightweightFunction',
                'memory': 128,      # 最小内存
                'timeout': 15,      # 15秒超时
                'description': '轻量级处理函数'
            },
            {
                'name': 'StandardFunction', 
                'memory': 512,      # 标准内存
                'timeout': 60,      # 1分钟超时
                'description': '标准处理函数'
            },
            {
                'name': 'HeavyFunction',
                'memory': 3008,     # 最大内存
                'timeout': 900,     # 15分钟超时
                'description': '重型计算函数'
            }
        ]
        
        self.functions = {}
        for config in function_configs:
            self.functions[config['name']] = _lambda.Function(
                self, config['name'],
                runtime=_lambda.Runtime.PYTHON_3_9,
                handler="index.handler",
                code=_lambda.Code.from_asset("lambda_functions/performance"),
                memory_size=config['memory'],
                timeout=Duration.seconds(config['timeout']),
                description=config['description'],
                environment={
                    'MEMORY_SIZE': str(config['memory']),
                    'TIMEOUT': str(config['timeout'])
                }
            )
```

### 6.2.3 环境变量配置

```python
import os
from aws_cdk import aws_ssm as ssm

class ConfigurableStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 从SSM Parameter Store获取配置
        api_key_param = ssm.StringParameter.from_string_parameter_name(
            self, "ApiKeyParam",
            string_parameter_name="/myapp/api-key"
        )
        
        # 复杂的环境变量配置
        environment_vars = {
            # 基础配置
            'ENVIRONMENT': os.getenv('ENVIRONMENT', 'dev'),
            'AWS_REGION': self.region,
            'LOG_LEVEL': 'DEBUG' if os.getenv('ENVIRONMENT') == 'dev' else 'INFO',
            
            # 功能开关
            'FEATURE_FLAG_NEW_API': 'true',
            'ENABLE_CACHE': 'true',
            'MAX_RETRY_ATTEMPTS': '3',
            
            # 服务配置
            'DATABASE_TIMEOUT': '30',
            'API_TIMEOUT': '60',
            'BATCH_SIZE': '100',
            
            # 外部服务
            'EXTERNAL_API_ENDPOINT': 'https://api.example.com',
            'API_KEY_PARAM': api_key_param.parameter_name
        }
        
        self.configurable_function = _lambda.Function(
            self, "ConfigurableFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/configurable"),
            environment=environment_vars,
            function_name="configurable-function"
        )
        
        # 授予访问SSM参数的权限
        api_key_param.grant_read(self.configurable_function)
```

## 6.3 代码打包和依赖管理

### 6.3.1 处理Python依赖

```python
# lambda_functions/with_dependencies/requirements.txt
requests==2.28.1
boto3==1.26.137
pandas==1.5.3
numpy==1.24.3
```

```python
# lambda_functions/with_dependencies/index.py
import json
import requests
import pandas as pd
import boto3
from datetime import datetime

def handler(event, context):
    """
    使用第三方库的Lambda函数
    """
    try:
        # 使用requests库
        response = requests.get('https://httpbin.org/json', timeout=10)
        external_data = response.json()
        
        # 使用pandas处理数据
        df = pd.DataFrame([
            {'name': 'Alice', 'age': 25},
            {'name': 'Bob', 'age': 30},
            {'name': 'Charlie', 'age': 35}
        ])
        
        # 使用boto3
        s3_client = boto3.client('s3')
        
        result = {
            'statusCode': 200,
            'body': json.dumps({
                'external_data': external_data,
                'processed_data': df.to_dict('records'),
                'timestamp': datetime.utcnow().isoformat()
            })
        }
        
    except Exception as e:
        result = {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            })
        }
    
    return result
```

```python
# stacks/lambda_with_deps_stack.py
from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    BundlingOptions,
    Duration
)
import os

class LambdaWithDepsStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 方法1: 使用bundling自动安装依赖
        self.deps_function = _lambda.Function(
            self, "DependenciesFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset(
                "lambda_functions/with_dependencies",
                bundling=BundlingOptions(
                    image=_lambda.Runtime.PYTHON_3_9.bundling_image,
                    command=[
                        "bash", "-c",
                        "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output"
                    ]
                )
            ),
            timeout=Duration.seconds(60),
            memory_size=256
        )
```

### 6.3.2 使用Docker构建

```dockerfile
# lambda_functions/docker_function/Dockerfile
FROM public.ecr.aws/lambda/python:3.9

# 复制requirements并安装依赖
COPY requirements.txt ${LAMBDA_TASK_ROOT}
RUN pip install -r requirements.txt

# 复制函数代码
COPY index.py ${LAMBDA_TASK_ROOT}

# 设置处理器
CMD ["index.handler"]
```

```python
# stacks/docker_lambda_stack.py
from aws_cdk import aws_lambda as _lambda

class DockerLambdaStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 使用Docker镜像创建Lambda函数
        self.docker_function = _lambda.Function(
            self, "DockerFunction",
            runtime=_lambda.Runtime.FROM_IMAGE,
            handler=_lambda.Handler.FROM_IMAGE,
            code=_lambda.Code.from_asset_image(
                "lambda_functions/docker_function"
            ),
            timeout=Duration.seconds(60),
            memory_size=512,
            function_name="docker-lambda-function"
        )
```

## 6.4 Lambda函数权限管理

### 6.4.1 基本IAM权限

```python
from aws_cdk import (
    aws_iam as iam,
    aws_s3 as s3,
    aws_dynamodb as dynamodb
)

class LambdaPermissionsStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建S3存储桶
        self.bucket = s3.Bucket(
            self, "MyBucket",
            bucket_name="my-lambda-cdk-bucket"
        )
        
        # 创建DynamoDB表
        self.table = dynamodb.Table(
            self, "MyTable",
            table_name="my-lambda-table",
            partition_key=dynamodb.Attribute(
                name="id",
                type=dynamodb.AttributeType.STRING
            )
        )
        
        # 创建Lambda函数
        self.lambda_function = _lambda.Function(
            self, "PermissionsFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/permissions"),
            environment={
                'BUCKET_NAME': self.bucket.bucket_name,
                'TABLE_NAME': self.table.table_name
            }
        )
        
        # 授予S3权限
        self.bucket.grant_read_write(self.lambda_function)
        
        # 授予DynamoDB权限
        self.table.grant_read_write_data(self.lambda_function)
        
        # 添加自定义IAM策略
        custom_policy = iam.PolicyStatement(
            effect=iam.Effect.ALLOW,
            actions=[
                "secretsmanager:GetSecretValue",
                "ssm:GetParameter",
                "ssm:GetParameters"
            ],
            resources=["*"]
        )
        
        self.lambda_function.add_to_role_policy(custom_policy)
```

### 6.4.2 高级权限配置

```python
class AdvancedPermissionsStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建自定义IAM角色
        lambda_role = iam.Role(
            self, "LambdaExecutionRole",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name(
                    "service-role/AWSLambdaBasicExecutionRole"
                )
            ]
        )
        
        # 添加特定权限
        lambda_role.add_to_policy(
            iam.PolicyStatement(
                effect=iam.Effect.ALLOW,
                actions=[
                    "dynamodb:GetItem",
                    "dynamodb:PutItem", 
                    "dynamodb:UpdateItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:Query",
                    "dynamodb:Scan"
                ],
                resources=[
                    f"arn:aws:dynamodb:{self.region}:{self.account}:table/MyTable*"
                ]
            )
        )
        
        # 使用自定义角色创建Lambda函数
        self.secure_function = _lambda.Function(
            self, "SecureFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/secure"),
            role=lambda_role,
            function_name="secure-lambda-function"
        )
```

## 6.5 Lambda函数版本和别名

### 6.5.1 版本管理

```python
from aws_cdk import aws_lambda as _lambda

class VersionedLambdaStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建Lambda函数
        self.main_function = _lambda.Function(
            self, "MainFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/versioned"),
            function_name="versioned-function"
        )
        
        # 创建版本
        version = self.main_function.current_version
        
        # 创建别名指向版本
        self.prod_alias = _lambda.Alias(
            self, "ProdAlias",
            alias_name="PROD",
            version=version
        )
        
        self.staging_alias = _lambda.Alias(
            self, "StagingAlias", 
            alias_name="STAGING",
            version=version
        )
```

### 6.5.2 蓝绿部署配置

```python
from aws_cdk import aws_codedeploy as codedeploy

class BlueGreenLambdaStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建Lambda函数
        self.lambda_function = _lambda.Function(
            self, "BlueGreenFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/blue_green")
        )
        
        # 创建别名
        self.alias = _lambda.Alias(
            self, "LiveAlias",
            alias_name="live",
            version=self.lambda_function.current_version
        )
        
        # 创建CodeDeploy应用
        application = codedeploy.LambdaApplication(
            self, "CodeDeployApplication",
            application_name="my-lambda-app"
        )
        
        # 创建部署组
        deployment_group = codedeploy.LambdaDeploymentGroup(
            self, "DeploymentGroup",
            application=application,
            alias=self.alias,
            deployment_config=codedeploy.LambdaDeploymentConfig.LINEAR_10_PERCENT_EVERY_1_MINUTE
        )
```

## 6.6 监控和日志配置

### 6.6.1 CloudWatch日志配置

```python
from aws_cdk import (
    aws_logs as logs,
    RemovalPolicy
)

class MonitoredLambdaStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建自定义日志组
        log_group = logs.LogGroup(
            self, "LambdaLogGroup",
            log_group_name="/aws/lambda/monitored-function",
            retention=logs.RetentionDays.ONE_WEEK,
            removal_policy=RemovalPolicy.DESTROY
        )
        
        # 创建Lambda函数
        self.monitored_function = _lambda.Function(
            self, "MonitoredFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/monitored"),
            log_group=log_group,
            environment={
                'LOG_LEVEL': 'INFO'
            }
        )
```

### 6.6.2 X-Ray跟踪配置

```python
class TrackedLambdaStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 启用X-Ray跟踪的Lambda函数
        self.tracked_function = _lambda.Function(
            self, "TrackedFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/tracked"),
            tracing=_lambda.Tracing.ACTIVE,
            environment={
                '_X_AMZN_TRACE_ID': 'true'
            }
        )
        
        # 添加X-Ray权限
        self.tracked_function.add_to_role_policy(
            iam.PolicyStatement(
                effect=iam.Effect.ALLOW,
                actions=[
                    "xray:PutTraceSegments",
                    "xray:PutTelemetryRecords"
                ],
                resources=["*"]
            )
        )
```

## 6.7 完整示例：构建RESTful API后端

```python
# stacks/api_backend_stack.py
from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    aws_dynamodb as dynamodb,
    Duration,
    CfnOutput
)
from constructs import Construct

class ApiBackendStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建DynamoDB表
        self.users_table = dynamodb.Table(
            self, "UsersTable",
            table_name="users",
            partition_key=dynamodb.Attribute(
                name="userId",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST
        )
        
        # 创建Lambda函数
        self.api_function = _lambda.Function(
            self, "ApiFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/api_backend"),
            timeout=Duration.seconds(30),
            memory_size=256,
            environment={
                'USERS_TABLE': self.users_table.table_name,
                'REGION': self.region
            }
        )
        
        # 授予DynamoDB权限
        self.users_table.grant_read_write_data(self.api_function)
        
        # 创建API Gateway
        self.api = apigateway.LambdaRestApi(
            self, "UsersApi",
            handler=self.api_function,
            proxy=False,
            description="Users API powered by Lambda"
        )
        
        # 添加资源和方法
        users_resource = self.api.root.add_resource("users")
        users_resource.add_method("GET")    # GET /users
        users_resource.add_method("POST")   # POST /users
        
        user_resource = users_resource.add_resource("{userId}")
        user_resource.add_method("GET")     # GET /users/{userId}
        user_resource.add_method("PUT")     # PUT /users/{userId}
        user_resource.add_method("DELETE")  # DELETE /users/{userId}
        
        # 输出API URL
        CfnOutput(
            self, "ApiUrl",
            value=self.api.url,
            description="API Gateway URL"
        )
```

```python
# lambda_functions/api_backend/index.py
import json
import boto3
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['USERS_TABLE'])

def handler(event, context):
    """
    RESTful API处理器
    """
    http_method = event['httpMethod']
    path = event['path']
    
    try:
        if http_method == 'GET' and path == '/users':
            return get_all_users()
        elif http_method == 'POST' and path == '/users':
            return create_user(json.loads(event['body']))
        elif http_method == 'GET' and '/users/' in path:
            user_id = path.split('/')[-1]
            return get_user(user_id)
        elif http_method == 'PUT' and '/users/' in path:
            user_id = path.split('/')[-1]
            return update_user(user_id, json.loads(event['body']))
        elif http_method == 'DELETE' and '/users/' in path:
            user_id = path.split('/')[-1]
            return delete_user(user_id)
        else:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Not found'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def get_all_users():
    response = table.scan()
    return {
        'statusCode': 200,
        'body': json.dumps(response['Items'])
    }

def create_user(user_data):
    user_id = str(uuid.uuid4())
    user_data['userId'] = user_id
    user_data['createdAt'] = datetime.utcnow().isoformat()
    
    table.put_item(Item=user_data)
    
    return {
        'statusCode': 201,
        'body': json.dumps(user_data)
    }

def get_user(user_id):
    response = table.get_item(Key={'userId': user_id})
    
    if 'Item' in response:
        return {
            'statusCode': 200,
            'body': json.dumps(response['Item'])
        }
    else:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'User not found'})
        }

def update_user(user_id, user_data):
    user_data['updatedAt'] = datetime.utcnow().isoformat()
    
    # 构建更新表达式
    update_expression = "SET "
    expression_values = {}
    
    for key, value in user_data.items():
        if key != 'userId':
            update_expression += f"{key} = :{key}, "
            expression_values[f":{key}"] = value
    
    update_expression = update_expression.rstrip(', ')
    
    table.update_item(
        Key={'userId': user_id},
        UpdateExpression=update_expression,
        ExpressionAttributeValues=expression_values
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'User updated successfully'})
    }

def delete_user(user_id):
    table.delete_item(Key={'userId': user_id})
    
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'User deleted successfully'})
    }
```

## 6.8 部署和测试

### 6.8.1 部署命令

```bash
# 安装依赖
pip install -r requirements.txt

# 合成CloudFormation模板
cdk synth

# 部署到AWS
cdk deploy ApiBackendStack

# 查看输出
cdk deploy ApiBackendStack --outputs-file outputs.json
```

### 6.8.2 测试API

```bash
# 获取API URL
API_URL=$(cat outputs.json | jq -r '.ApiBackendStack.ApiUrl')

# 测试API端点
curl -X GET "${API_URL}users"
curl -X POST "${API_URL}users" -H "Content-Type: application/json" -d '{"name":"John Doe","email":"john@example.com"}'
```

## 6.9 故障排除和调试

### 6.9.1 常见问题

::: warning 常见部署问题
1. **权限问题**: 确保CDK有足够的权限创建资源
2. **代码打包问题**: 检查依赖是否正确安装
3. **超时问题**: 调整Lambda函数的超时设置
4. **内存问题**: 根据需要调整内存分配
:::

### 6.9.2 调试技巧

```python
# 添加详细日志
import logging
import os

logger = logging.getLogger()
logger.setLevel(os.getenv('LOG_LEVEL', 'INFO'))

def handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    logger.info(f"Context: {context}")
    
    try:
        # 处理逻辑
        result = process_event(event)
        logger.info(f"Processing result: {result}")
        return result
    except Exception as e:
        logger.error(f"Error processing event: {str(e)}")
        raise
```

## 6.10 章节总结

::: tip 关键要点
- CDK提供了灵活强大的Lambda函数创建和配置能力
- 正确的权限配置是Lambda函数安全运行的基础
- 代码打包和依赖管理需要特别注意
- 监控和日志配置有助于生产环境的维护
- 版本和别名管理支持安全的部署策略
:::

在下一章中，我们将深入探讨Lambda函数的高级配置，包括VPC配置、Layer使用、错误处理等高级主题。

## 扩展阅读

- [AWS Lambda开发者指南](https://docs.aws.amazon.com/lambda/latest/dg/)
- [CDK Lambda构造参考](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_lambda.html)
- [Lambda最佳实践](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)