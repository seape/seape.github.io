---
title: "第7章：CDK中的Lambda高级配置"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第7章：CDK中的Lambda高级配置

::: info 章节概述
本章将深入探讨Lambda函数的高级配置选项，包括VPC集成、Layer使用、错误处理、并发控制、预留并发等企业级功能。这些配置对于构建生产级的serverless应用至关重要。
:::

## 学习目标

1. 掌握Lambda函数的VPC配置和网络安全设置
2. 学会创建和使用Lambda Layers
3. 理解Lambda的错误处理和重试机制
4. 掌握并发控制和预留并发配置
5. 学会配置死信队列和异步调用
6. 了解Lambda的环境变量和密钥管理

## 7.1 VPC配置与网络安全

### 7.1.1 基础VPC配置

```python
from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_ec2 as ec2,
    aws_rds as rds,
    Duration
)
from constructs import Construct

class VpcLambdaStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建VPC
        self.vpc = ec2.Vpc(
            self, "LambdaVpc",
            max_azs=2,
            cidr="10.0.0.0/16",
            subnet_configuration=[
                ec2.SubnetConfiguration(
                    name="Private",
                    subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    cidr_mask=24
                ),
                ec2.SubnetConfiguration(
                    name="Public", 
                    subnet_type=ec2.SubnetType.PUBLIC,
                    cidr_mask=24
                )
            ]
        )
        
        # 创建安全组
        self.lambda_sg = ec2.SecurityGroup(
            self, "LambdaSecurityGroup",
            vpc=self.vpc,
            description="Security group for Lambda functions",
            allow_all_outbound=True
        )
        
        # 创建数据库安全组
        self.db_sg = ec2.SecurityGroup(
            self, "DatabaseSecurityGroup", 
            vpc=self.vpc,
            description="Security group for RDS database"
        )
        
        # 允许Lambda访问数据库
        self.db_sg.add_ingress_rule(
            peer=self.lambda_sg,
            connection=ec2.Port.tcp(5432),  # PostgreSQL端口
            description="Allow Lambda access to database"
        )
        
        # 创建Lambda函数（在VPC中）
        self.vpc_lambda = _lambda.Function(
            self, "VpcLambdaFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/vpc_lambda"),
            vpc=self.vpc,
            vpc_subnets=ec2.SubnetSelection(
                subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS
            ),
            security_groups=[self.lambda_sg],
            timeout=Duration.minutes(5),
            function_name="vpc-lambda-function"
        )
```

### 7.1.2 RDS集成配置

```python
class DatabaseLambdaStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 使用现有VPC或创建新VPC
        self.vpc = ec2.Vpc.from_lookup(self, "ExistingVpc", is_default=True)
        
        # 创建数据库子网组
        db_subnet_group = rds.SubnetGroup(
            self, "DatabaseSubnetGroup",
            description="Subnet group for RDS database",
            vpc=self.vpc,
            vpc_subnets=ec2.SubnetSelection(
                subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS
            )
        )
        
        # 创建RDS实例
        self.database = rds.DatabaseInstance(
            self, "PostgresDatabase",
            engine=rds.DatabaseInstanceEngine.postgres(
                version=rds.PostgresEngineVersion.VER_14_9
            ),
            instance_type=ec2.InstanceType.of(
                ec2.InstanceClass.T3,
                ec2.InstanceSize.MICRO
            ),
            vpc=self.vpc,
            subnet_group=db_subnet_group,
            database_name="appdb",
            credentials=rds.Credentials.from_generated_secret("dbadmin"),
            allocated_storage=20,
            storage_encrypted=True,
            multi_az=False,
            deletion_protection=False
        )
        
        # Lambda函数配置
        self.db_lambda = _lambda.Function(
            self, "DatabaseLambda",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/database_lambda"),
            vpc=self.vpc,
            environment={
                'DB_SECRET_ARN': self.database.secret.secret_arn,
                'DB_ENDPOINT': self.database.instance_endpoint.hostname,
                'DB_PORT': str(self.database.instance_endpoint.port),
                'DB_NAME': 'appdb'
            },
            timeout=Duration.minutes(2)
        )
        
        # 授予访问数据库密钥的权限
        self.database.secret.grant_read(self.db_lambda)
        
        # 允许Lambda连接到数据库
        self.database.connections.allow_from(
            self.db_lambda,
            ec2.Port.tcp(5432),
            "Lambda database access"
        )
```

### 7.1.3 VPC Endpoint配置

```python
class VpcEndpointStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建VPC
        self.vpc = ec2.Vpc(self, "VpcWithEndpoints", max_azs=2)
        
        # 创建S3 VPC端点
        s3_endpoint = self.vpc.add_gateway_endpoint(
            "S3Endpoint",
            service=ec2.GatewayVpcEndpointAwsService.S3,
            subnets=[ec2.SubnetSelection(
                subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS
            )]
        )
        
        # 创建DynamoDB VPC端点
        dynamodb_endpoint = self.vpc.add_gateway_endpoint(
            "DynamoDbEndpoint",
            service=ec2.GatewayVpcEndpointAwsService.DYNAMODB,
            subnets=[ec2.SubnetSelection(
                subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS
            )]
        )
        
        # 创建Lambda VPC端点（用于调用其他Lambda函数）
        lambda_endpoint = self.vpc.add_interface_endpoint(
            "LambdaEndpoint",
            service=ec2.InterfaceVpcEndpointAwsService.LAMBDA_,
            subnets=ec2.SubnetSelection(
                subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS
            )
        )
        
        # 使用VPC端点的Lambda函数
        self.endpoint_lambda = _lambda.Function(
            self, "EndpointLambda",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/endpoint_lambda"),
            vpc=self.vpc,
            environment={
                'USE_VPC_ENDPOINTS': 'true'
            }
        )
```

## 7.2 Lambda Layers

### 7.2.1 创建共享Library Layer

```python
# layers/python_utils/python/utils.py
import json
import logging
from datetime import datetime
from typing import Dict, Any

def setup_logging(level: str = "INFO") -> logging.Logger:
    """设置日志配置"""
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, level))
    return logger

def format_response(status_code: int, body: Dict[str, Any], 
                   headers: Dict[str, str] = None) -> Dict[str, Any]:
    """格式化Lambda响应"""
    default_headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    if headers:
        default_headers.update(headers)
    
    return {
        'statusCode': status_code,
        'headers': default_headers,
        'body': json.dumps(body, default=str)
    }

def get_current_timestamp() -> str:
    """获取当前时间戳"""
    return datetime.utcnow().isoformat()

class DatabaseHelper:
    """数据库操作辅助类"""
    
    @staticmethod
    def build_update_expression(data: Dict[str, Any]) -> tuple:
        """构建DynamoDB更新表达式"""
        update_expression = "SET "
        expression_values = {}
        
        for key, value in data.items():
            if key not in ['id', 'pk', 'sk']:  # 排除键字段
                update_expression += f"{key} = :{key}, "
                expression_values[f":{key}"] = value
        
        update_expression = update_expression.rstrip(', ')
        return update_expression, expression_values
```

```python
# stacks/layers_stack.py
from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    Duration
)
from constructs import Construct
import os

class LayersStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建Python工具库Layer
        self.utils_layer = _lambda.LayerVersion(
            self, "PythonUtilsLayer",
            code=_lambda.Code.from_asset("layers/python_utils"),
            compatible_runtimes=[
                _lambda.Runtime.PYTHON_3_8,
                _lambda.Runtime.PYTHON_3_9,
                _lambda.Runtime.PYTHON_3_10,
                _lambda.Runtime.PYTHON_3_11
            ],
            description="Common Python utilities for Lambda functions",
            layer_version_name="python-utils-layer"
        )
        
        # 创建第三方依赖Layer
        self.deps_layer = _lambda.LayerVersion(
            self, "DependenciesLayer",
            code=_lambda.Code.from_asset(
                "layers/dependencies",
                bundling=_lambda.BundlingOptions(
                    image=_lambda.Runtime.PYTHON_3_9.bundling_image,
                    command=[
                        "bash", "-c",
                        "pip install -r requirements.txt -t /asset-output/python/"
                    ]
                )
            ),
            compatible_runtimes=[_lambda.Runtime.PYTHON_3_9],
            description="Third-party dependencies layer"
        )
        
        # 使用Layers的Lambda函数
        self.layered_function = _lambda.Function(
            self, "LayeredFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/layered"),
            layers=[self.utils_layer, self.deps_layer],
            timeout=Duration.seconds(30)
        )
```

### 7.2.2 使用Layer的Lambda函数

```python
# lambda_functions/layered/index.py
import json
from utils import setup_logging, format_response, get_current_timestamp, DatabaseHelper

# 使用Layer中的工具
logger = setup_logging("INFO")

def handler(event, context):
    """使用Layer工具的Lambda函数"""
    logger.info(f"Processing event: {json.dumps(event)}")
    
    try:
        # 使用Layer中的工具函数
        timestamp = get_current_timestamp()
        
        # 模拟数据处理
        data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'updated_at': timestamp
        }
        
        # 使用DatabaseHelper
        update_expr, expr_values = DatabaseHelper.build_update_expression(data)
        
        result = {
            'message': 'Data processed successfully',
            'timestamp': timestamp,
            'update_expression': update_expr,
            'expression_values': expr_values
        }
        
        # 使用格式化响应函数
        return format_response(200, result)
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return format_response(500, {'error': str(e)})
```

### 7.2.3 跨账户Layer共享

```python
from aws_cdk import aws_iam as iam

class SharedLayersStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建可共享的Layer
        self.shared_layer = _lambda.LayerVersion(
            self, "SharedUtilsLayer",
            code=_lambda.Code.from_asset("layers/shared_utils"),
            compatible_runtimes=[_lambda.Runtime.PYTHON_3_9],
            description="Shared utilities across accounts"
        )
        
        # 添加资源策略允许其他账户使用
        self.shared_layer.add_permission(
            "CrossAccountAccess",
            principal=iam.AccountPrincipal("123456789012"),  # 目标账户ID
            action="lambda:GetLayerVersion"
        )
        
        # 或者允许组织内所有账户
        self.shared_layer.add_permission(
            "OrganizationAccess",
            principal=iam.OrganizationPrincipal("o-example12345"),
            action="lambda:GetLayerVersion"
        )
```

## 7.3 错误处理和重试机制

### 7.3.1 同步调用错误处理

```python
# lambda_functions/error_handling/index.py
import json
import logging
import traceback
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class LambdaError(Exception):
    """自定义Lambda异常"""
    def __init__(self, message: str, error_code: str = "GENERAL_ERROR"):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """带有完整错误处理的Lambda函数"""
    
    # 记录请求信息
    logger.info(f"Request ID: {context.aws_request_id}")
    logger.info(f"Function Name: {context.function_name}")
    logger.info(f"Remaining Time: {context.get_remaining_time_in_millis()}ms")
    
    try:
        # 验证输入
        if not event.get('action'):
            raise LambdaError("Missing required field: action", "VALIDATION_ERROR")
        
        action = event['action']
        
        # 根据action执行不同操作
        if action == 'process_data':
            result = process_data(event.get('data', {}))
        elif action == 'validate_input':
            result = validate_input(event.get('input', {}))
        else:
            raise LambdaError(f"Unknown action: {action}", "INVALID_ACTION")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'result': result,
                'request_id': context.aws_request_id
            })
        }
        
    except LambdaError as e:
        logger.error(f"Business logic error: {e.message}")
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'error': e.message,
                'error_code': e.error_code,
                'request_id': context.aws_request_id
            })
        }
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': 'Internal server error',
                'error_code': 'INTERNAL_ERROR',
                'request_id': context.aws_request_id
            })
        }

def process_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """数据处理函数"""
    if not data:
        raise LambdaError("No data provided", "NO_DATA")
    
    # 模拟数据处理
    processed = {
        'original': data,
        'processed_at': '2023-01-01T00:00:00Z',
        'status': 'processed'
    }
    
    return processed

def validate_input(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """输入验证函数"""
    required_fields = ['name', 'email']
    missing_fields = [field for field in required_fields if field not in input_data]
    
    if missing_fields:
        raise LambdaError(
            f"Missing required fields: {', '.join(missing_fields)}", 
            "MISSING_FIELDS"
        )
    
    return {'valid': True, 'message': 'Input validation passed'}
```

### 7.3.2 异步调用和重试配置

```python
from aws_cdk import (
    aws_lambda as _lambda,
    aws_sqs as sqs,
    aws_lambda_event_sources as lambda_event_sources
)

class AsyncLambdaStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建死信队列
        self.dlq = sqs.Queue(
            self, "AsyncLambdaDLQ",
            queue_name="async-lambda-dlq",
            retention_period=Duration.days(14)
        )
        
        # 创建重试队列
        self.retry_queue = sqs.Queue(
            self, "AsyncLambdaRetryQueue",
            queue_name="async-lambda-retry",
            visibility_timeout=Duration.minutes(5),
            dead_letter_queue=sqs.DeadLetterQueue(
                max_receive_count=3,
                queue=self.dlq
            )
        )
        
        # 创建异步Lambda函数
        self.async_function = _lambda.Function(
            self, "AsyncFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/async_handler"),
            timeout=Duration.minutes(5),
            retry_attempts=2,  # 设置重试次数
            dead_letter_queue=self.dlq,  # 设置死信队列
            environment={
                'RETRY_QUEUE_URL': self.retry_queue.queue_url
            }
        )
        
        # 为SQS队列添加Lambda触发器
        self.async_function.add_event_source(
            lambda_event_sources.SqsEventSource(
                self.retry_queue,
                batch_size=10,
                max_batching_window=Duration.seconds(5)
            )
        )
        
        # 授予访问队列的权限
        self.retry_queue.grant_send_messages(self.async_function)
        self.dlq.grant_send_messages(self.async_function)
```

### 7.3.3 断路器模式实现

```python
# lambda_functions/circuit_breaker/index.py
import json
import time
from typing import Dict, Any, Optional
import boto3

class CircuitBreaker:
    """断路器实现"""
    
    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time: Optional[float] = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    def call(self, func, *args, **kwargs):
        """调用被保护的函数"""
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.timeout:
                self.state = "HALF_OPEN"
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = func(*args, **kwargs)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise e
    
    def on_success(self):
        """成功调用时的处理"""
        self.failure_count = 0
        self.state = "CLOSED"
    
    def on_failure(self):
        """失败调用时的处理"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

# 全局断路器实例
external_api_breaker = CircuitBreaker(failure_threshold=3, timeout=30)

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """使用断路器的Lambda函数"""
    
    try:
        # 使用断路器保护外部API调用
        result = external_api_breaker.call(call_external_api, event.get('data'))
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'result': result,
                'circuit_breaker_state': external_api_breaker.state
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 503,
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'circuit_breaker_state': external_api_breaker.state
            })
        }

def call_external_api(data: Dict[str, Any]) -> Dict[str, Any]:
    """模拟外部API调用"""
    import requests
    
    # 模拟可能失败的外部API调用
    response = requests.get('https://httpbin.org/json', timeout=5)
    response.raise_for_status()
    
    return response.json()
```

## 7.4 并发控制和预留并发

### 7.4.1 并发限制配置

```python
class ConcurrencyControlStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 高优先级函数 - 预留并发
        self.high_priority_function = _lambda.Function(
            self, "HighPriorityFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/high_priority"),
            reserved_concurrent_executions=50,  # 预留50个并发
            timeout=Duration.seconds(30)
        )
        
        # 标准函数 - 限制并发
        self.standard_function = _lambda.Function(
            self, "StandardFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler", 
            code=_lambda.Code.from_asset("lambda_functions/standard"),
            reserved_concurrent_executions=10,  # 限制为10个并发
            timeout=Duration.seconds(60)
        )
        
        # 批处理函数 - 无并发限制
        self.batch_function = _lambda.Function(
            self, "BatchFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/batch"),
            # 不设置并发限制，使用账户级别的剩余并发
            timeout=Duration.minutes(15)
        )
```

### 7.4.2 预置并发配置

```python
class ProvisionedConcurrencyStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建Lambda函数
        self.warm_function = _lambda.Function(
            self, "WarmFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/warm_function"),
            timeout=Duration.seconds(30)
        )
        
        # 创建版本
        version = self.warm_function.current_version
        
        # 创建别名
        self.prod_alias = _lambda.Alias(
            self, "ProdAlias",
            alias_name="PROD",
            version=version,
            provisioned_concurrency_config=_lambda.ProvisionedConcurrencyConfig(
                provisioned_concurrent_executions=10
            )
        )
        
        # 创建应用自动扩缩目标
        from aws_cdk import aws_applicationautoscaling as appscaling
        
        scalable_target = appscaling.ScalableTarget(
            self, "ScalableTarget",
            service_namespace=appscaling.ServiceNamespace.LAMBDA,
            scalable_dimension="lambda:function:ProvisionedConcurrency",
            resource_id=f"function:{self.warm_function.function_name}:PROD",
            min_capacity=5,
            max_capacity=50
        )
        
        # 配置自动扩缩策略
        scalable_target.scale_to_track_metric(
            "TargetTracking",
            target_value=0.7,
            metric=appscaling.predefined_metric_specification(
                appscaling.PredefinedMetric.LAMBDA_PROVISIONED_CONCURRENCY_UTILIZATION
            )
        )
```

## 7.5 环境变量和密钥管理

### 7.5.1 安全的环境变量配置

```python
from aws_cdk import (
    aws_secretsmanager as secretsmanager,
    aws_ssm as ssm,
    aws_kms as kms
)

class SecureConfigStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建KMS密钥
        self.lambda_key = kms.Key(
            self, "LambdaKmsKey",
            description="KMS key for Lambda environment variables",
            enable_key_rotation=True
        )
        
        # 创建Secrets Manager密钥
        self.db_credentials = secretsmanager.Secret(
            self, "DatabaseCredentials",
            description="Database credentials",
            generate_secret_string=secretsmanager.SecretStringGenerator(
                secret_string_template='{"username": "dbadmin"}',
                generate_string_key="password",
                exclude_characters=" %+~`#$&*()|[]{}:;<>?!'/\\\"",
                password_length=32
            )
        )
        
        # 创建SSM参数
        self.api_config = ssm.StringParameter(
            self, "ApiConfig",
            parameter_name="/myapp/api/config",
            string_value=json.dumps({
                "endpoint": "https://api.example.com",
                "timeout": 30,
                "retry_count": 3
            })
        )
        
        # 创建加密的SSM参数
        self.api_key = ssm.StringParameter(
            self, "ApiKey",
            parameter_name="/myapp/api/key",
            string_value="your-api-key-here",
            type=ssm.ParameterType.SECURE_STRING
        )
        
        # 创建Lambda函数
        self.secure_function = _lambda.Function(
            self, "SecureFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/secure_config"),
            environment={
                # 基础配置
                'ENVIRONMENT': 'production',
                'LOG_LEVEL': 'INFO',
                
                # 服务配置
                'DB_SECRET_ARN': self.db_credentials.secret_arn,
                'API_CONFIG_PARAM': self.api_config.parameter_name,
                'API_KEY_PARAM': self.api_key.parameter_name,
                
                # KMS密钥
                'KMS_KEY_ID': self.lambda_key.key_id
            },
            environment_encryption=self.lambda_key  # 加密环境变量
        )
        
        # 授予权限
        self.db_credentials.grant_read(self.secure_function)
        self.api_config.grant_read(self.secure_function)
        self.api_key.grant_read(self.secure_function)
        self.lambda_key.grant_decrypt(self.secure_function)
```

### 7.5.2 配置管理Lambda函数

```python
# lambda_functions/secure_config/index.py
import json
import boto3
import os
from typing import Dict, Any
import logging

logger = logging.getLogger()
logger.setLevel(os.getenv('LOG_LEVEL', 'INFO'))

# 初始化AWS客户端
secrets_client = boto3.client('secretsmanager')
ssm_client = boto3.client('ssm')

class ConfigManager:
    """配置管理器"""
    
    def __init__(self):
        self._cache = {}
        self.ttl = 300  # 5分钟缓存
    
    def get_secret(self, secret_arn: str) -> Dict[str, Any]:
        """获取Secrets Manager密钥"""
        if secret_arn in self._cache:
            return self._cache[secret_arn]
        
        try:
            response = secrets_client.get_secret_value(SecretId=secret_arn)
            secret_value = json.loads(response['SecretString'])
            self._cache[secret_arn] = secret_value
            return secret_value
        except Exception as e:
            logger.error(f"Failed to get secret {secret_arn}: {str(e)}")
            raise
    
    def get_parameter(self, parameter_name: str, decrypt: bool = True) -> str:
        """获取SSM参数"""
        cache_key = f"{parameter_name}_{decrypt}"
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        try:
            response = ssm_client.get_parameter(
                Name=parameter_name,
                WithDecryption=decrypt
            )
            value = response['Parameter']['Value']
            self._cache[cache_key] = value
            return value
        except Exception as e:
            logger.error(f"Failed to get parameter {parameter_name}: {str(e)}")
            raise

# 全局配置管理器
config_manager = ConfigManager()

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """使用安全配置的Lambda函数"""
    
    try:
        # 获取数据库凭据
        db_secret_arn = os.environ['DB_SECRET_ARN']
        db_credentials = config_manager.get_secret(db_secret_arn)
        
        # 获取API配置
        api_config_param = os.environ['API_CONFIG_PARAM']
        api_config = json.loads(config_manager.get_parameter(api_config_param, False))
        
        # 获取API密钥
        api_key_param = os.environ['API_KEY_PARAM']
        api_key = config_manager.get_parameter(api_key_param, True)
        
        # 处理业务逻辑
        result = process_request(event, db_credentials, api_config, api_key)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'result': result
            })
        }
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': 'Internal server error'
            })
        }

def process_request(event: Dict[str, Any], db_creds: Dict[str, Any], 
                   api_config: Dict[str, Any], api_key: str) -> Dict[str, Any]:
    """处理请求的业务逻辑"""
    
    # 使用配置进行数据库连接、API调用等
    logger.info("Processing request with secure configuration")
    
    return {
        'message': 'Request processed successfully',
        'database_connected': bool(db_creds.get('username')),
        'api_configured': bool(api_config.get('endpoint')),
        'api_key_available': bool(api_key)
    }
```

## 7.6 Lambda Extensions

### 7.6.1 自定义Extension

```python
# extensions/config_extension/index.py
import json
import os
import requests
import time
from threading import Thread

class ConfigExtension:
    """配置扩展，定期更新配置"""
    
    def __init__(self):
        self.lambda_api_url = f"http://{os.environ['AWS_LAMBDA_RUNTIME_API']}"
        self.extension_name = "config-extension"
        self.config_cache = {}
        
    def register(self):
        """注册扩展"""
        url = f"{self.lambda_api_url}/2020-01-01/extension/register"
        headers = {'Lambda-Extension-Name': self.extension_name}
        data = {'events': ['INVOKE', 'SHUTDOWN']}
        
        response = requests.post(url, headers=headers, json=data)
        return response.headers.get('Lambda-Extension-Identifier')
    
    def next_event(self, extension_id: str):
        """获取下一个事件"""
        url = f"{self.lambda_api_url}/2020-01-01/extension/event/next"
        headers = {'Lambda-Extension-Identifier': extension_id}
        
        response = requests.get(url, headers=headers)
        return response.json()
    
    def update_config(self):
        """更新配置缓存"""
        # 这里可以从外部配置服务获取配置
        self.config_cache = {
            'updated_at': time.time(),
            'feature_flags': {
                'new_feature': True,
                'beta_feature': False
            },
            'api_endpoints': {
                'primary': 'https://api.example.com',
                'fallback': 'https://api-backup.example.com'
            }
        }
        
        # 将配置写入共享文件
        with open('/tmp/config.json', 'w') as f:
            json.dump(self.config_cache, f)
    
    def run(self):
        """运行扩展"""
        extension_id = self.register()
        
        # 启动配置更新线程
        config_thread = Thread(target=self.config_updater, daemon=True)
        config_thread.start()
        
        # 主事件循环
        while True:
            event = self.next_event(extension_id)
            
            if event['eventType'] == 'SHUTDOWN':
                break
    
    def config_updater(self):
        """定期更新配置"""
        while True:
            self.update_config()
            time.sleep(60)  # 每60秒更新一次

if __name__ == '__main__':
    extension = ConfigExtension()
    extension.run()
```

### 7.6.2 Extension配置

```python
class ExtensionStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建Extension Layer
        self.extension_layer = _lambda.LayerVersion(
            self, "ConfigExtensionLayer",
            code=_lambda.Code.from_asset("extensions/config_extension"),
            compatible_runtimes=[_lambda.Runtime.PYTHON_3_9],
            description="Configuration extension layer"
        )
        
        # 使用Extension的Lambda函数
        self.extended_function = _lambda.Function(
            self, "ExtendedFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/extended"),
            layers=[self.extension_layer],
            environment={
                'USE_EXTENSION_CONFIG': 'true'
            }
        )
```

## 7.7 章节总结

::: tip 关键要点
- VPC配置使Lambda能够安全访问私有资源
- Layers提供了代码复用和依赖管理的有效方式
- 完善的错误处理和重试机制提高了系统的可靠性
- 并发控制和预置并发优化了性能和成本
- 安全的配置管理保护了敏感信息
- Extensions扩展了Lambda的功能边界
:::

在下一章中，我们将学习Lambda与其他AWS服务的集成，包括API Gateway、DynamoDB、S3等服务的深度集成。

## 扩展阅读

- [Lambda VPC配置最佳实践](https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html)
- [Lambda Layers开发指南](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html)
- [Lambda错误处理](https://docs.aws.amazon.com/lambda/latest/dg/invocation-retries.html)
- [Lambda并发控制](https://docs.aws.amazon.com/lambda/latest/dg/invocation-scaling.html)