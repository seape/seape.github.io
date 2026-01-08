---
title: "第8章：Lambda与其他AWS服务集成"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第8章：Lambda与其他AWS服务集成

::: info 章节概述
本章将深入探讨Lambda函数与AWS生态系统中核心服务的集成，包括API Gateway、DynamoDB、S3、SQS/SNS、EventBridge等。通过实际案例学习如何构建完整的serverless应用架构。
:::

## 学习目标

1. 掌握Lambda与API Gateway的深度集成
2. 学会Lambda与DynamoDB的数据操作模式
3. 理解Lambda与S3的事件驱动处理
4. 掌握Lambda与消息队列的异步处理
5. 学会使用EventBridge构建事件驱动架构
6. 了解Lambda与其他AWS服务的集成模式

## 8.1 Lambda与API Gateway集成

### 8.1.1 RESTful API设计

```python
from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    aws_iam as iam,
    Duration,
    CfnOutput
)
from constructs import Construct

class ApiGatewayLambdaStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建Lambda函数
        self.api_handler = _lambda.Function(
            self, "ApiHandler",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/api_handler"),
            timeout=Duration.seconds(30),
            environment={
                'CORS_ALLOW_ORIGIN': '*',
                'LOG_LEVEL': 'INFO'
            }
        )
        
        # 创建API Gateway
        self.api = apigateway.RestApi(
            self, "MyApi",
            rest_api_name="My Serverless API",
            description="Complete serverless API with Lambda",
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_origins=apigateway.Cors.ALL_ORIGINS,
                allow_methods=apigateway.Cors.ALL_METHODS,
                allow_headers=["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key"]
            ),
            deploy_options=apigateway.StageOptions(
                stage_name="prod",
                throttling_rate_limit=100,
                throttling_burst_limit=200,
                logging_level=apigateway.MethodLoggingLevel.INFO,
                data_trace_enabled=True,
                metrics_enabled=True
            )
        )
        
        # 创建Lambda集成
        lambda_integration = apigateway.LambdaIntegration(
            self.api_handler,
            proxy=False,
            integration_responses=[
                apigateway.IntegrationResponse(
                    status_code="200",
                    response_parameters={
                        'method.response.header.Access-Control-Allow-Origin': "'*'"
                    }
                ),
                apigateway.IntegrationResponse(
                    status_code="400",
                    selection_pattern="4\\d{2}"
                ),
                apigateway.IntegrationResponse(
                    status_code="500",
                    selection_pattern="5\\d{2}"
                )
            ]
        )
        
        # 添加资源和方法
        self._create_users_api(lambda_integration)
        self._create_orders_api(lambda_integration)
        
        # 输出API信息
        CfnOutput(self, "ApiUrl", value=self.api.url)
        CfnOutput(self, "ApiId", value=self.api.rest_api_id)
    
    def _create_users_api(self, integration: apigateway.LambdaIntegration):
        """创建用户相关API"""
        users = self.api.root.add_resource("users")
        
        # GET /users - 获取用户列表
        users.add_method(
            "GET",
            integration,
            method_responses=[
                apigateway.MethodResponse(
                    status_code="200",
                    response_models={
                        "application/json": apigateway.Model.EMPTY_MODEL
                    },
                    response_parameters={
                        'method.response.header.Access-Control-Allow-Origin': True
                    }
                )
            ],
            request_parameters={
                'method.request.querystring.limit': False,
                'method.request.querystring.offset': False
            }
        )
        
        # POST /users - 创建用户
        users.add_method(
            "POST",
            integration,
            request_models={
                "application/json": self._create_user_model()
            },
            request_validator=apigateway.RequestValidator(
                self, "UserRequestValidator",
                rest_api=self.api,
                validate_request_body=True,
                validate_request_parameters=True
            )
        )
        
        # 单个用户操作
        user = users.add_resource("{userId}")
        user.add_method("GET", integration)    # 获取用户
        user.add_method("PUT", integration)    # 更新用户
        user.add_method("DELETE", integration) # 删除用户
    
    def _create_orders_api(self, integration: apigateway.LambdaIntegration):
        """创建订单相关API"""
        orders = self.api.root.add_resource("orders")
        orders.add_method("GET", integration)
        orders.add_method("POST", integration)
        
        order = orders.add_resource("{orderId}")
        order.add_method("GET", integration)
        order.add_method("PUT", integration)
    
    def _create_user_model(self) -> apigateway.Model:
        """创建用户数据模型"""
        return self.api.add_model(
            "UserModel",
            content_type="application/json",
            schema=apigateway.JsonSchema(
                type=apigateway.JsonSchemaType.OBJECT,
                properties={
                    "name": apigateway.JsonSchema(
                        type=apigateway.JsonSchemaType.STRING,
                        min_length=1,
                        max_length=100
                    ),
                    "email": apigateway.JsonSchema(
                        type=apigateway.JsonSchemaType.STRING,
                        format="email"
                    ),
                    "age": apigateway.JsonSchema(
                        type=apigateway.JsonSchemaType.INTEGER,
                        minimum=18,
                        maximum=120
                    )
                },
                required=["name", "email"]
            )
        )
```

### 8.1.2 API Handler Lambda函数

```python
# lambda_functions/api_handler/index.py
import json
import logging
import os
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

# 配置日志
logger = logging.getLogger()
logger.setLevel(os.getenv('LOG_LEVEL', 'INFO'))

class ApiResponse:
    """API响应工具类"""
    
    @staticmethod
    def success(data: Any, status_code: int = 200) -> Dict[str, Any]:
        return {
            'statusCode': status_code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': os.getenv('CORS_ALLOW_ORIGIN', '*'),
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            'body': json.dumps(data, default=str)
        }
    
    @staticmethod
    def error(message: str, status_code: int = 400, error_code: str = None) -> Dict[str, Any]:
        error_data = {
            'error': message,
            'timestamp': datetime.utcnow().isoformat()
        }
        if error_code:
            error_data['errorCode'] = error_code
            
        return ApiResponse.success(error_data, status_code)

class RouteHandler:
    """路由处理器"""
    
    def __init__(self):
        # 模拟数据存储
        self.users_data = {}
        self.orders_data = {}
    
    def handle_users(self, method: str, path: str, body: str, query_params: Dict[str, str]) -> Dict[str, Any]:
        """处理用户相关请求"""
        path_parts = [p for p in path.split('/') if p]
        
        if method == 'GET' and len(path_parts) == 1:  # GET /users
            return self._get_users(query_params)
        elif method == 'POST' and len(path_parts) == 1:  # POST /users
            return self._create_user(json.loads(body) if body else {})
        elif method == 'GET' and len(path_parts) == 2:  # GET /users/{userId}
            return self._get_user(path_parts[1])
        elif method == 'PUT' and len(path_parts) == 2:  # PUT /users/{userId}
            return self._update_user(path_parts[1], json.loads(body) if body else {})
        elif method == 'DELETE' and len(path_parts) == 2:  # DELETE /users/{userId}
            return self._delete_user(path_parts[1])
        else:
            return ApiResponse.error("Route not found", 404)
    
    def handle_orders(self, method: str, path: str, body: str, query_params: Dict[str, str]) -> Dict[str, Any]:
        """处理订单相关请求"""
        path_parts = [p for p in path.split('/') if p]
        
        if method == 'GET' and len(path_parts) == 1:  # GET /orders
            return self._get_orders(query_params)
        elif method == 'POST' and len(path_parts) == 1:  # POST /orders
            return self._create_order(json.loads(body) if body else {})
        elif method == 'GET' and len(path_parts) == 2:  # GET /orders/{orderId}
            return self._get_order(path_parts[1])
        elif method == 'PUT' and len(path_parts) == 2:  # PUT /orders/{orderId}
            return self._update_order(path_parts[1], json.loads(body) if body else {})
        else:
            return ApiResponse.error("Route not found", 404)
    
    def _get_users(self, query_params: Dict[str, str]) -> Dict[str, Any]:
        """获取用户列表"""
        limit = int(query_params.get('limit', 10))
        offset = int(query_params.get('offset', 0))
        
        users_list = list(self.users_data.values())
        paginated_users = users_list[offset:offset + limit]
        
        return ApiResponse.success({
            'users': paginated_users,
            'total': len(users_list),
            'limit': limit,
            'offset': offset
        })
    
    def _create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建用户"""
        # 验证必需字段
        if not user_data.get('name') or not user_data.get('email'):
            return ApiResponse.error("Name and email are required", 400)
        
        user_id = str(uuid.uuid4())
        user = {
            'userId': user_id,
            'name': user_data['name'],
            'email': user_data['email'],
            'age': user_data.get('age'),
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
        
        self.users_data[user_id] = user
        return ApiResponse.success(user, 201)
    
    def _get_user(self, user_id: str) -> Dict[str, Any]:
        """获取单个用户"""
        user = self.users_data.get(user_id)
        if not user:
            return ApiResponse.error("User not found", 404)
        
        return ApiResponse.success(user)
    
    def _update_user(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新用户"""
        user = self.users_data.get(user_id)
        if not user:
            return ApiResponse.error("User not found", 404)
        
        # 更新字段
        if 'name' in user_data:
            user['name'] = user_data['name']
        if 'email' in user_data:
            user['email'] = user_data['email']
        if 'age' in user_data:
            user['age'] = user_data['age']
        
        user['updatedAt'] = datetime.utcnow().isoformat()
        self.users_data[user_id] = user
        
        return ApiResponse.success(user)
    
    def _delete_user(self, user_id: str) -> Dict[str, Any]:
        """删除用户"""
        if user_id not in self.users_data:
            return ApiResponse.error("User not found", 404)
        
        del self.users_data[user_id]
        return ApiResponse.success({'message': 'User deleted successfully'})
    
    def _get_orders(self, query_params: Dict[str, str]) -> Dict[str, Any]:
        """获取订单列表"""
        orders_list = list(self.orders_data.values())
        return ApiResponse.success({'orders': orders_list})
    
    def _create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建订单"""
        order_id = str(uuid.uuid4())
        order = {
            'orderId': order_id,
            'userId': order_data.get('userId'),
            'items': order_data.get('items', []),
            'totalAmount': order_data.get('totalAmount', 0),
            'status': 'pending',
            'createdAt': datetime.utcnow().isoformat()
        }
        
        self.orders_data[order_id] = order
        return ApiResponse.success(order, 201)
    
    def _get_order(self, order_id: str) -> Dict[str, Any]:
        """获取单个订单"""
        order = self.orders_data.get(order_id)
        if not order:
            return ApiResponse.error("Order not found", 404)
        
        return ApiResponse.success(order)
    
    def _update_order(self, order_id: str, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新订单"""
        order = self.orders_data.get(order_id)
        if not order:
            return ApiResponse.error("Order not found", 404)
        
        # 更新状态
        if 'status' in order_data:
            order['status'] = order_data['status']
        
        order['updatedAt'] = datetime.utcnow().isoformat()
        self.orders_data[order_id] = order
        
        return ApiResponse.success(order)

# 全局路由处理器
route_handler = RouteHandler()

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """API Gateway Lambda处理器"""
    
    logger.info(f"Received event: {json.dumps(event, default=str)}")
    
    try:
        # 解析请求信息
        method = event.get('httpMethod', '').upper()
        path = event.get('path', '')
        body = event.get('body', '')
        query_params = event.get('queryStringParameters') or {}
        
        logger.info(f"Processing {method} {path}")
        
        # 路由分发
        if path.startswith('/users'):
            response = route_handler.handle_users(method, path, body, query_params)
        elif path.startswith('/orders'):
            response = route_handler.handle_orders(method, path, body, query_params)
        else:
            response = ApiResponse.error("API endpoint not found", 404)
        
        logger.info(f"Response status: {response['statusCode']}")
        return response
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in request body: {str(e)}")
        return ApiResponse.error("Invalid JSON in request body", 400)
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return ApiResponse.error("Internal server error", 500)
```

### 8.1.3 WebSocket API集成

```python
from aws_cdk import (
    aws_apigatewayv2 as apigatewayv2,
    aws_apigatewayv2_integrations as integrations
)

class WebSocketApiStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # WebSocket处理函数
        self.websocket_handler = _lambda.Function(
            self, "WebSocketHandler",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/websocket_handler"),
            environment={
                'CONNECTION_TABLE': 'websocket-connections'
            }
        )
        
        # 创建WebSocket API
        self.websocket_api = apigatewayv2.WebSocketApi(
            self, "WebSocketApi",
            api_name="My WebSocket API",
            description="Real-time communication API"
        )
        
        # 创建Lambda集成
        lambda_integration = integrations.WebSocketLambdaIntegration(
            "LambdaIntegration",
            self.websocket_handler
        )
        
        # 添加路由
        self.websocket_api.add_route(
            "$connect",
            integration=lambda_integration
        )
        
        self.websocket_api.add_route(
            "$disconnect", 
            integration=lambda_integration
        )
        
        self.websocket_api.add_route(
            "sendMessage",
            integration=lambda_integration
        )
        
        # 部署WebSocket API
        self.websocket_stage = apigatewayv2.WebSocketStage(
            self, "WebSocketStage",
            web_socket_api=self.websocket_api,
            stage_name="prod",
            auto_deploy=True
        )
        
        # 输出WebSocket URL
        CfnOutput(
            self, "WebSocketUrl",
            value=self.websocket_stage.url
        )
```

## 8.2 Lambda与DynamoDB集成

### 8.2.1 DynamoDB操作模式

```python
from aws_cdk import (
    aws_dynamodb as dynamodb,
    aws_lambda_event_sources as lambda_event_sources,
    RemovalPolicy
)

class DynamoDBLambdaStack(Stack):
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
            sort_key=dynamodb.Attribute(
                name="sk",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            stream=dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
            removal_policy=RemovalPolicy.DESTROY,
            global_secondary_indexes=[
                dynamodb.GlobalSecondaryIndex(
                    index_name="EmailIndex",
                    partition_key=dynamodb.Attribute(
                        name="email",
                        type=dynamodb.AttributeType.STRING
                    ),
                    projection_type=dynamodb.ProjectionType.ALL
                )
            ]
        )
        
        # CRUD操作Lambda函数
        self.crud_function = _lambda.Function(
            self, "CrudFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/dynamodb_crud"),
            environment={
                'USERS_TABLE': self.users_table.table_name,
                'EMAIL_INDEX': 'EmailIndex'
            },
            timeout=Duration.seconds(30)
        )
        
        # 流处理Lambda函数
        self.stream_processor = _lambda.Function(
            self, "StreamProcessor",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/dynamodb_stream"),
            timeout=Duration.minutes(1)
        )
        
        # 授予权限
        self.users_table.grant_read_write_data(self.crud_function)
        self.users_table.grant_stream_read(self.stream_processor)
        
        # 添加DynamoDB流触发器
        self.stream_processor.add_event_source(
            lambda_event_sources.DynamoEventSource(
                self.users_table,
                starting_position=_lambda.StartingPosition.TRIM_HORIZON,
                batch_size=10,
                max_batching_window=Duration.seconds(5),
                retry_attempts=3
            )
        )
```

### 8.2.2 DynamoDB CRUD操作

```python
# lambda_functions/dynamodb_crud/index.py
import json
import boto3
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# DynamoDB资源
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['USERS_TABLE'])

class DynamoDBOperations:
    """DynamoDB操作封装类"""
    
    @staticmethod
    def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建用户"""
        user_id = user_data['userId']
        timestamp = datetime.utcnow().isoformat()
        
        item = {
            'userId': user_id,
            'sk': 'USER#PROFILE',
            'name': user_data['name'],
            'email': user_data['email'],
            'age': user_data.get('age'),
            'status': 'active',
            'createdAt': timestamp,
            'updatedAt': timestamp,
            'gsi1pk': user_data['email'],  # GSI分区键
            'type': 'user'
        }
        
        try:
            # 使用条件表达式防止重复创建
            table.put_item(
                Item=item,
                ConditionExpression=Attr('userId').not_exists()
            )
            return {'success': True, 'user': item}
        
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                return {'success': False, 'error': 'User already exists'}
            raise e
    
    @staticmethod
    def get_user(user_id: str) -> Optional[Dict[str, Any]]:
        """获取用户"""
        try:
            response = table.get_item(
                Key={
                    'userId': user_id,
                    'sk': 'USER#PROFILE'
                }
            )
            return response.get('Item')
        
        except ClientError as e:
            logger.error(f"Error getting user {user_id}: {str(e)}")
            return None
    
    @staticmethod
    def update_user(user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """更新用户"""
        update_expression = "SET updatedAt = :timestamp"
        expression_values = {':timestamp': datetime.utcnow().isoformat()}
        expression_names = {}
        
        # 构建更新表达式
        for key, value in updates.items():
            if key not in ['userId', 'sk', 'createdAt']:
                if key in ['name', 'status']:  # 保留字需要使用表达式名称
                    expr_name = f"#{key}"
                    expression_names[expr_name] = key
                    update_expression += f", {expr_name} = :{key}"
                else:
                    update_expression += f", {key} = :{key}"
                expression_values[f":{key}"] = value
        
        try:
            response = table.update_item(
                Key={
                    'userId': user_id,
                    'sk': 'USER#PROFILE'
                },
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values,
                ExpressionAttributeNames=expression_names if expression_names else None,
                ConditionExpression=Attr('userId').exists(),
                ReturnValues='ALL_NEW'
            )
            return {'success': True, 'user': response['Attributes']}
        
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                return {'success': False, 'error': 'User not found'}
            raise e
    
    @staticmethod
    def delete_user(user_id: str) -> Dict[str, Any]:
        """删除用户"""
        try:
            table.delete_item(
                Key={
                    'userId': user_id,
                    'sk': 'USER#PROFILE'
                },
                ConditionExpression=Attr('userId').exists()
            )
            return {'success': True, 'message': 'User deleted'}
        
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                return {'success': False, 'error': 'User not found'}
            raise e
    
    @staticmethod
    def query_users_by_email(email: str) -> List[Dict[str, Any]]:
        """通过邮箱查询用户（使用GSI）"""
        try:
            response = table.query(
                IndexName=os.environ['EMAIL_INDEX'],
                KeyConditionExpression=Key('email').eq(email)
            )
            return response['Items']
        
        except ClientError as e:
            logger.error(f"Error querying users by email {email}: {str(e)}")
            return []
    
    @staticmethod
    def scan_active_users(limit: int = 50) -> Dict[str, Any]:
        """扫描活跃用户"""
        try:
            response = table.scan(
                FilterExpression=Attr('status').eq('active') & Attr('type').eq('user'),
                Limit=limit
            )
            
            return {
                'users': response['Items'],
                'count': response['Count'],
                'last_evaluated_key': response.get('LastEvaluatedKey')
            }
        
        except ClientError as e:
            logger.error(f"Error scanning active users: {str(e)}")
            return {'users': [], 'count': 0}
    
    @staticmethod
    def batch_create_users(users: List[Dict[str, Any]]) -> Dict[str, Any]:
        """批量创建用户"""
        timestamp = datetime.utcnow().isoformat()
        
        with table.batch_writer() as batch:
            for user_data in users:
                item = {
                    'userId': user_data['userId'],
                    'sk': 'USER#PROFILE',
                    'name': user_data['name'],
                    'email': user_data['email'],
                    'age': user_data.get('age'),
                    'status': 'active',
                    'createdAt': timestamp,
                    'updatedAt': timestamp,
                    'type': 'user'
                }
                batch.put_item(Item=item)
        
        return {'success': True, 'processed': len(users)}

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """DynamoDB CRUD处理器"""
    
    logger.info(f"Processing event: {json.dumps(event, default=str)}")
    
    try:
        operation = event.get('operation')
        data = event.get('data', {})
        
        if operation == 'create':
            result = DynamoDBOperations.create_user(data)
        elif operation == 'get':
            user = DynamoDBOperations.get_user(data['userId'])
            result = {'success': True, 'user': user} if user else {'success': False, 'error': 'User not found'}
        elif operation == 'update':
            result = DynamoDBOperations.update_user(data['userId'], data.get('updates', {}))
        elif operation == 'delete':
            result = DynamoDBOperations.delete_user(data['userId'])
        elif operation == 'query_by_email':
            users = DynamoDBOperations.query_users_by_email(data['email'])
            result = {'success': True, 'users': users}
        elif operation == 'scan_active':
            result = DynamoDBOperations.scan_active_users(data.get('limit', 50))
            result['success'] = True
        elif operation == 'batch_create':
            result = DynamoDBOperations.batch_create_users(data['users'])
        else:
            result = {'success': False, 'error': f'Unknown operation: {operation}'}
        
        return {
            'statusCode': 200 if result['success'] else 400,
            'body': json.dumps(result, default=str)
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
```

### 8.2.3 DynamoDB Streams处理

```python
# lambda_functions/dynamodb_stream/index.py
import json
import boto3
import logging
from typing import Dict, Any, List
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 初始化AWS服务
sns = boto3.client('sns')
eventbridge = boto3.client('events')

class StreamProcessor:
    """DynamoDB流处理器"""
    
    @staticmethod
    def process_record(record: Dict[str, Any]) -> Dict[str, Any]:
        """处理单个记录"""
        event_name = record['eventName']
        
        if event_name == 'INSERT':
            return StreamProcessor._handle_insert(record)
        elif event_name == 'MODIFY':
            return StreamProcessor._handle_modify(record)
        elif event_name == 'REMOVE':
            return StreamProcessor._handle_remove(record)
        else:
            logger.warning(f"Unknown event name: {event_name}")
            return {'status': 'ignored', 'reason': f'Unknown event: {event_name}'}
    
    @staticmethod
    def _handle_insert(record: Dict[str, Any]) -> Dict[str, Any]:
        """处理插入事件"""
        new_image = record['dynamodb']['NewImage']
        user_data = StreamProcessor._deserialize_item(new_image)
        
        logger.info(f"New user created: {user_data['userId']}")
        
        # 发送欢迎邮件事件
        StreamProcessor._publish_user_event('user.created', user_data)
        
        # 更新用户统计
        StreamProcessor._update_user_metrics('increment')
        
        return {
            'status': 'processed',
            'action': 'user_created',
            'userId': user_data['userId']
        }
    
    @staticmethod
    def _handle_modify(record: Dict[str, Any]) -> Dict[str, Any]:
        """处理修改事件"""
        new_image = record['dynamodb']['NewImage']
        old_image = record['dynamodb']['OldImage']
        
        new_data = StreamProcessor._deserialize_item(new_image)
        old_data = StreamProcessor._deserialize_item(old_image)
        
        # 检查关键字段变更
        changes = StreamProcessor._detect_changes(old_data, new_data)
        
        if changes:
            logger.info(f"User {new_data['userId']} updated: {changes}")
            
            # 发布用户更新事件
            StreamProcessor._publish_user_event('user.updated', {
                'userId': new_data['userId'],
                'changes': changes,
                'newData': new_data,
                'oldData': old_data
            })
        
        return {
            'status': 'processed',
            'action': 'user_updated',
            'userId': new_data['userId'],
            'changes': changes
        }
    
    @staticmethod
    def _handle_remove(record: Dict[str, Any]) -> Dict[str, Any]:
        """处理删除事件"""
        old_image = record['dynamodb']['OldImage']
        user_data = StreamProcessor._deserialize_item(old_image)
        
        logger.info(f"User deleted: {user_data['userId']}")
        
        # 发布用户删除事件
        StreamProcessor._publish_user_event('user.deleted', user_data)
        
        # 更新用户统计
        StreamProcessor._update_user_metrics('decrement')
        
        return {
            'status': 'processed',
            'action': 'user_deleted',
            'userId': user_data['userId']
        }
    
    @staticmethod
    def _deserialize_item(dynamodb_item: Dict[str, Any]) -> Dict[str, Any]:
        """反序列化DynamoDB项目"""
        deserializer = boto3.dynamodb.types.TypeDeserializer()
        return {k: deserializer.deserialize(v) for k, v in dynamodb_item.items()}
    
    @staticmethod
    def _detect_changes(old_data: Dict[str, Any], new_data: Dict[str, Any]) -> Dict[str, Any]:
        """检测数据变更"""
        changes = {}
        
        # 检查关键字段
        fields_to_check = ['name', 'email', 'status', 'age']
        
        for field in fields_to_check:
            old_value = old_data.get(field)
            new_value = new_data.get(field)
            
            if old_value != new_value:
                changes[field] = {
                    'old': old_value,
                    'new': new_value
                }
        
        return changes
    
    @staticmethod
    def _publish_user_event(event_type: str, data: Dict[str, Any]):
        """发布用户事件到EventBridge"""
        try:
            event_detail = {
                'eventType': event_type,
                'timestamp': datetime.utcnow().isoformat(),
                'data': data
            }
            
            eventbridge.put_events(
                Entries=[
                    {
                        'Source': 'user.service',
                        'DetailType': event_type,
                        'Detail': json.dumps(event_detail, default=str),
                        'EventBusName': 'default'
                    }
                ]
            )
            
            logger.info(f"Published event: {event_type}")
            
        except Exception as e:
            logger.error(f"Failed to publish event {event_type}: {str(e)}")
    
    @staticmethod
    def _update_user_metrics(action: str):
        """更新用户指标"""
        # 这里可以更新CloudWatch指标或者其他监控系统
        try:
            cloudwatch = boto3.client('cloudwatch')
            
            cloudwatch.put_metric_data(
                Namespace='UserService',
                MetricData=[
                    {
                        'MetricName': 'UserCount',
                        'Value': 1 if action == 'increment' else -1,
                        'Unit': 'Count',
                        'Timestamp': datetime.utcnow()
                    }
                ]
            )
            
        except Exception as e:
            logger.error(f"Failed to update metrics: {str(e)}")

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """DynamoDB流处理器主函数"""
    
    logger.info(f"Processing {len(event['Records'])} records")
    
    results = []
    
    for record in event['Records']:
        try:
            result = StreamProcessor.process_record(record)
            results.append(result)
            
        except Exception as e:
            logger.error(f"Error processing record: {str(e)}")
            results.append({
                'status': 'error',
                'error': str(e),
                'record': record['eventName']
            })
    
    logger.info(f"Processed {len(results)} records")
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'processed': len(results),
            'results': results
        }, default=str)
    }
```

## 8.3 Lambda与S3集成

### 8.3.1 S3事件触发配置

```python
from aws_cdk import (
    aws_s3 as s3,
    aws_s3_notifications as s3n,
    aws_lambda_event_sources as lambda_event_sources
)

class S3LambdaStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建S3存储桶
        self.source_bucket = s3.Bucket(
            self, "SourceBucket",
            bucket_name="my-lambda-source-bucket",
            versioned=True,
            event_bridge_enabled=True,
            lifecycle_rules=[
                s3.LifecycleRule(
                    id="DeleteOldVersions",
                    noncurrent_version_expiration=Duration.days(30)
                )
            ]
        )
        
        self.processed_bucket = s3.Bucket(
            self, "ProcessedBucket",
            bucket_name="my-lambda-processed-bucket"
        )
        
        # 图片处理Lambda函数
        self.image_processor = _lambda.Function(
            self, "ImageProcessor",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/image_processor"),
            timeout=Duration.minutes(5),
            memory_size=1024,
            environment={
                'PROCESSED_BUCKET': self.processed_bucket.bucket_name,
                'SUPPORTED_FORMATS': 'jpg,jpeg,png,gif,bmp'
            }
        )
        
        # 文档处理Lambda函数
        self.document_processor = _lambda.Function(
            self, "DocumentProcessor",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/document_processor"),
            timeout=Duration.minutes(5),
            memory_size=512,
            environment={
                'PROCESSED_BUCKET': self.processed_bucket.bucket_name
            }
        )
        
        # 配置S3事件通知
        self.source_bucket.add_event_notification(
            s3.EventType.OBJECT_CREATED,
            s3n.LambdaDestination(self.image_processor),
            s3.NotificationKeyFilter(
                prefix="images/",
                suffix=".jpg"
            )
        )
        
        self.source_bucket.add_event_notification(
            s3.EventType.OBJECT_CREATED,
            s3n.LambdaDestination(self.image_processor),
            s3.NotificationKeyFilter(
                prefix="images/",
                suffix=".png"
            )
        )
        
        self.source_bucket.add_event_notification(
            s3.EventType.OBJECT_CREATED,
            s3n.LambdaDestination(self.document_processor),
            s3.NotificationKeyFilter(
                prefix="documents/",
                suffix=".pdf"
            )
        )
        
        # 授予权限
        self.source_bucket.grant_read(self.image_processor)
        self.source_bucket.grant_read(self.document_processor)
        self.processed_bucket.grant_write(self.image_processor)
        self.processed_bucket.grant_write(self.document_processor)
```

### 8.3.2 图片处理Lambda函数

```python
# lambda_functions/image_processor/index.py
import json
import boto3
import os
import logging
from typing import Dict, Any
from urllib.parse import unquote_plus
from PIL import Image, ImageOps
import io

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3_client = boto3.client('s3')

class ImageProcessor:
    """图片处理器"""
    
    def __init__(self):
        self.processed_bucket = os.environ['PROCESSED_BUCKET']
        self.supported_formats = os.environ.get('SUPPORTED_FORMATS', 'jpg,jpeg,png').split(',')
        
        # 定义缩略图尺寸
        self.thumbnail_sizes = [
            (150, 150),    # 小缩略图
            (300, 300),    # 中等缩略图
            (800, 600),    # 大缩略图
        ]
    
    def process_image(self, bucket: str, key: str) -> Dict[str, Any]:
        """处理单个图片"""
        try:
            # 检查文件格式
            file_extension = key.split('.')[-1].lower()
            if file_extension not in self.supported_formats:
                return {
                    'success': False,
                    'error': f'Unsupported format: {file_extension}'
                }
            
            # 下载原始图片
            response = s3_client.get_object(Bucket=bucket, Key=key)
            image_content = response['Body'].read()
            
            # 打开图片
            image = Image.open(io.BytesIO(image_content))
            
            # 获取图片信息
            image_info = {
                'format': image.format,
                'mode': image.mode,
                'size': image.size,
                'has_transparency': image.mode in ('RGBA', 'LA')
            }
            
            logger.info(f"Processing image: {key}, Size: {image.size}, Format: {image.format}")
            
            # 生成缩略图
            thumbnails = self._generate_thumbnails(image, key)
            
            # 优化原图（可选）
            optimized_image = self._optimize_image(image)
            optimized_key = self._upload_processed_image(
                optimized_image, 
                key, 
                'optimized'
            )
            
            return {
                'success': True,
                'original_key': key,
                'optimized_key': optimized_key,
                'thumbnails': thumbnails,
                'image_info': image_info
            }
            
        except Exception as e:
            logger.error(f"Error processing image {key}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'key': key
            }
    
    def _generate_thumbnails(self, image: Image.Image, original_key: str) -> List[Dict[str, Any]]:
        """生成多种尺寸的缩略图"""
        thumbnails = []
        
        for width, height in self.thumbnail_sizes:
            try:
                # 创建缩略图（保持宽高比）
                thumbnail = image.copy()
                thumbnail.thumbnail((width, height), Image.Resampling.LANCZOS)
                
                # 如果需要固定尺寸，可以使用ImageOps.fit
                # thumbnail = ImageOps.fit(image, (width, height), Image.Resampling.LANCZOS)
                
                # 上传缩略图
                thumbnail_key = self._upload_processed_image(
                    thumbnail,
                    original_key,
                    f'thumbnail_{width}x{height}'
                )
                
                thumbnails.append({
                    'size': f'{width}x{height}',
                    'key': thumbnail_key,
                    'actual_size': thumbnail.size
                })
                
            except Exception as e:
                logger.error(f"Error creating thumbnail {width}x{height} for {original_key}: {str(e)}")
        
        return thumbnails
    
    def _optimize_image(self, image: Image.Image) -> Image.Image:
        """优化图片"""
        # 转换为RGB模式（如果需要）
        if image.mode in ('RGBA', 'LA'):
            # 创建白色背景
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        return image
    
    def _upload_processed_image(self, image: Image.Image, original_key: str, suffix: str) -> str:
        """上传处理后的图片"""
        # 生成新的key
        base_name = original_key.split('/')[-1].split('.')[0]
        directory = '/'.join(original_key.split('/')[:-1])
        new_key = f"{directory}/processed/{base_name}_{suffix}.jpg"
        
        # 将图片转换为字节流
        img_buffer = io.BytesIO()
        image.save(img_buffer, format='JPEG', quality=85, optimize=True)
        img_buffer.seek(0)
        
        # 上传到S3
        s3_client.put_object(
            Bucket=self.processed_bucket,
            Key=new_key,
            Body=img_buffer.getvalue(),
            ContentType='image/jpeg',
            Metadata={
                'original-key': original_key,
                'processing-type': suffix,
                'processed-at': datetime.utcnow().isoformat()
            }
        )
        
        return new_key

# 全局处理器实例
processor = ImageProcessor()

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """S3事件处理器"""
    
    logger.info(f"Processing {len(event['Records'])} S3 events")
    
    results = []
    
    for record in event['Records']:
        try:
            # 解析S3事件
            bucket = record['s3']['bucket']['name']
            key = unquote_plus(record['s3']['object']['key'])
            
            logger.info(f"Processing object: s3://{bucket}/{key}")
            
            # 处理图片
            result = processor.process_image(bucket, key)
            results.append(result)
            
            if result['success']:
                logger.info(f"Successfully processed {key}")
            else:
                logger.error(f"Failed to process {key}: {result['error']}")
                
        except Exception as e:
            logger.error(f"Error processing S3 record: {str(e)}")
            results.append({
                'success': False,
                'error': str(e)
            })
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'processed': len(results),
            'results': results
        }, default=str)
    }
```

## 8.4 Lambda与SQS/SNS集成

### 8.4.1 消息队列配置

```python
from aws_cdk import (
    aws_sqs as sqs,
    aws_sns as sns,
    aws_sns_subscriptions as sns_subscriptions,
    aws_lambda_event_sources as lambda_event_sources
)

class MessageProcessingStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建死信队列
        self.dlq = sqs.Queue(
            self, "ProcessingDLQ",
            queue_name="message-processing-dlq",
            retention_period=Duration.days(14)
        )
        
        # 创建主处理队列
        self.processing_queue = sqs.Queue(
            self, "ProcessingQueue",
            queue_name="message-processing-queue",
            visibility_timeout=Duration.minutes(5),
            receive_message_wait_time=Duration.seconds(20),  # 长轮询
            dead_letter_queue=sqs.DeadLetterQueue(
                max_receive_count=3,
                queue=self.dlq
            )
        )
        
        # 创建高优先级队列
        self.priority_queue = sqs.Queue(
            self, "PriorityQueue",
            queue_name="priority-processing-queue",
            visibility_timeout=Duration.minutes(2),
            dead_letter_queue=sqs.DeadLetterQueue(
                max_receive_count=5,
                queue=self.dlq
            )
        )
        
        # 创建SNS主题
        self.notification_topic = sns.Topic(
            self, "NotificationTopic",
            topic_name="processing-notifications"
        )
        
        # 消息处理Lambda函数
        self.message_processor = _lambda.Function(
            self, "MessageProcessor",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/message_processor"),
            timeout=Duration.minutes(5),
            environment={
                'NOTIFICATION_TOPIC_ARN': self.notification_topic.topic_arn,
                'DLQ_URL': self.dlq.queue_url
            }
        )
        
        # 优先级处理Lambda函数
        self.priority_processor = _lambda.Function(
            self, "PriorityProcessor",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/priority_processor"),
            timeout=Duration.minutes(2),
            reserved_concurrent_executions=10,  # 限制并发
            environment={
                'NOTIFICATION_TOPIC_ARN': self.notification_topic.topic_arn
            }
        )
        
        # 配置SQS事件源
        self.message_processor.add_event_source(
            lambda_event_sources.SqsEventSource(
                self.processing_queue,
                batch_size=10,
                max_batching_window=Duration.seconds(5),
                report_batch_item_failures=True
            )
        )
        
        self.priority_processor.add_event_source(
            lambda_event_sources.SqsEventSource(
                self.priority_queue,
                batch_size=5,
                max_batching_window=Duration.seconds(1)
            )
        )
        
        # 授予权限
        self.processing_queue.grant_consume_messages(self.message_processor)
        self.priority_queue.grant_consume_messages(self.priority_processor)
        self.notification_topic.grant_publish(self.message_processor)
        self.notification_topic.grant_publish(self.priority_processor)
        self.dlq.grant_send_messages(self.message_processor)
        
        # 添加SNS订阅（示例）
        self.notification_topic.add_subscription(
            sns_subscriptions.EmailSubscription("admin@example.com")
        )
```

### 8.4.2 消息处理Lambda函数

```python
# lambda_functions/message_processor/index.py
import json
import boto3
import os
import logging
from typing import Dict, Any, List
from datetime import datetime
import uuid

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# AWS服务客户端
sns_client = boto3.client('sns')
sqs_client = boto3.client('sqs')

class MessageProcessor:
    """消息处理器"""
    
    def __init__(self):
        self.notification_topic_arn = os.environ['NOTIFICATION_TOPIC_ARN']
        self.dlq_url = os.environ['DLQ_URL']
    
    def process_messages(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """批量处理消息"""
        successful_messages = []
        failed_messages = []
        
        for record in records:
            try:
                result = self._process_single_message(record)
                
                if result['success']:
                    successful_messages.append({
                        'messageId': record['messageId'],
                        'result': result
                    })
                else:
                    failed_messages.append({
                        'itemIdentifier': record['messageId']
                    })
                    
            except Exception as e:
                logger.error(f"Error processing message {record['messageId']}: {str(e)}")
                failed_messages.append({
                    'itemIdentifier': record['messageId']
                })
        
        # 发送处理结果通知
        self._send_batch_notification(successful_messages, failed_messages)
        
        return {
            'batchItemFailures': failed_messages,
            'successful_count': len(successful_messages),
            'failed_count': len(failed_messages)
        }
    
    def _process_single_message(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """处理单个消息"""
        try:
            # 解析消息内容
            message_body = json.loads(record['body'])
            message_type = message_body.get('type', 'unknown')
            
            logger.info(f"Processing message type: {message_type}")
            
            # 根据消息类型分发处理
            if message_type == 'user_signup':
                return self._handle_user_signup(message_body)
            elif message_type == 'order_created':
                return self._handle_order_created(message_body)
            elif message_type == 'payment_completed':
                return self._handle_payment_completed(message_body)
            elif message_type == 'data_export':
                return self._handle_data_export(message_body)
            else:
                logger.warning(f"Unknown message type: {message_type}")
                return {
                    'success': False,
                    'error': f'Unknown message type: {message_type}'
                }
                
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in message: {str(e)}")
            return {'success': False, 'error': 'Invalid JSON format'}
        
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _handle_user_signup(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """处理用户注册消息"""
        user_data = message.get('data', {})
        user_id = user_data.get('userId')
        email = user_data.get('email')
        
        if not user_id or not email:
            return {'success': False, 'error': 'Missing user data'}
        
        # 模拟处理逻辑
        processing_steps = [
            self._send_welcome_email(email),
            self._create_user_profile(user_id),
            self._setup_default_preferences(user_id),
            self._track_signup_event(user_id)
        ]
        
        # 检查所有步骤是否成功
        if all(step['success'] for step in processing_steps):
            return {
                'success': True,
                'message': 'User signup processed successfully',
                'userId': user_id,
                'steps_completed': len(processing_steps)
            }
        else:
            failed_steps = [step for step in processing_steps if not step['success']]
            return {
                'success': False,
                'error': 'Some processing steps failed',
                'failed_steps': failed_steps
            }
    
    def _handle_order_created(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """处理订单创建消息"""
        order_data = message.get('data', {})
        order_id = order_data.get('orderId')
        
        if not order_id:
            return {'success': False, 'error': 'Missing order ID'}
        
        # 处理订单逻辑
        try:
            # 验证库存
            inventory_check = self._check_inventory(order_data.get('items', []))
            if not inventory_check['success']:
                return inventory_check
            
            # 计算税费
            tax_calculation = self._calculate_taxes(order_data)
            
            # 发送确认邮件
            email_sent = self._send_order_confirmation(order_data)
            
            return {
                'success': True,
                'message': 'Order processed successfully',
                'orderId': order_id,
                'tax_amount': tax_calculation.get('tax_amount', 0),
                'email_sent': email_sent['success']
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Order processing failed: {str(e)}'}
    
    def _handle_payment_completed(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """处理支付完成消息"""
        payment_data = message.get('data', {})
        payment_id = payment_data.get('paymentId')
        order_id = payment_data.get('orderId')
        
        if not payment_id or not order_id:
            return {'success': False, 'error': 'Missing payment or order ID'}
        
        # 处理支付逻辑
        try:
            # 更新订单状态
            order_update = self._update_order_status(order_id, 'paid')
            
            # 触发发货流程
            shipping_trigger = self._trigger_shipping(order_id)
            
            # 发送支付确认
            confirmation_sent = self._send_payment_confirmation(payment_data)
            
            return {
                'success': True,
                'message': 'Payment processed successfully',
                'paymentId': payment_id,
                'orderId': order_id,
                'shipping_triggered': shipping_trigger['success']
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Payment processing failed: {str(e)}'}
    
    def _handle_data_export(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """处理数据导出消息"""
        export_data = message.get('data', {})
        export_type = export_data.get('type')
        user_id = export_data.get('userId')
        
        if not export_type or not user_id:
            return {'success': False, 'error': 'Missing export parameters'}
        
        # 模拟长时间运行的导出任务
        try:
            # 生成导出文件
            export_result = self._generate_export_file(export_type, user_id)
            
            # 上传到S3
            upload_result = self._upload_export_file(export_result['file_path'], user_id)
            
            # 发送下载链接
            notification_sent = self._send_export_notification(user_id, upload_result['download_url'])
            
            return {
                'success': True,
                'message': 'Data export completed',
                'exportType': export_type,
                'userId': user_id,
                'downloadUrl': upload_result['download_url']
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Data export failed: {str(e)}'}
    
    # 辅助方法（模拟实现）
    def _send_welcome_email(self, email: str) -> Dict[str, Any]:
        """发送欢迎邮件"""
        # 模拟邮件发送
        return {'success': True, 'email': email}
    
    def _create_user_profile(self, user_id: str) -> Dict[str, Any]:
        """创建用户档案"""
        # 模拟用户档案创建
        return {'success': True, 'userId': user_id}
    
    def _setup_default_preferences(self, user_id: str) -> Dict[str, Any]:
        """设置默认偏好"""
        return {'success': True, 'userId': user_id}
    
    def _track_signup_event(self, user_id: str) -> Dict[str, Any]:
        """跟踪注册事件"""
        return {'success': True, 'userId': user_id}
    
    def _check_inventory(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """检查库存"""
        return {'success': True, 'items_checked': len(items)}
    
    def _calculate_taxes(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """计算税费"""
        return {'tax_amount': 10.50}
    
    def _send_order_confirmation(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """发送订单确认"""
        return {'success': True}
    
    def _update_order_status(self, order_id: str, status: str) -> Dict[str, Any]:
        """更新订单状态"""
        return {'success': True, 'orderId': order_id, 'status': status}
    
    def _trigger_shipping(self, order_id: str) -> Dict[str, Any]:
        """触发发货"""
        return {'success': True, 'orderId': order_id}
    
    def _send_payment_confirmation(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """发送支付确认"""
        return {'success': True}
    
    def _generate_export_file(self, export_type: str, user_id: str) -> Dict[str, Any]:
        """生成导出文件"""
        return {'file_path': f'/tmp/{user_id}_{export_type}_export.csv'}
    
    def _upload_export_file(self, file_path: str, user_id: str) -> Dict[str, Any]:
        """上传导出文件"""
        return {'download_url': f'https://example.com/downloads/{user_id}'}
    
    def _send_export_notification(self, user_id: str, download_url: str) -> Dict[str, Any]:
        """发送导出通知"""
        return {'success': True}
    
    def _send_batch_notification(self, successful: List[Dict], failed: List[Dict]):
        """发送批处理结果通知"""
        try:
            if successful or failed:
                message = {
                    'timestamp': datetime.utcnow().isoformat(),
                    'successful_count': len(successful),
                    'failed_count': len(failed),
                    'batch_id': str(uuid.uuid4())
                }
                
                sns_client.publish(
                    TopicArn=self.notification_topic_arn,
                    Subject='Message Processing Batch Complete',
                    Message=json.dumps(message, default=str)
                )
                
        except Exception as e:
            logger.error(f"Failed to send batch notification: {str(e)}")

# 全局处理器实例
message_processor = MessageProcessor()

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """SQS消息处理主函数"""
    
    logger.info(f"Processing batch of {len(event['Records'])} messages")
    
    try:
        result = message_processor.process_messages(event['Records'])
        
        logger.info(f"Batch processing complete: {result['successful_count']} successful, {result['failed_count']} failed")
        
        return result
        
    except Exception as e:
        logger.error(f"Batch processing error: {str(e)}")
        # 返回所有消息为失败，触发重试
        return {
            'batchItemFailures': [
                {'itemIdentifier': record['messageId']} 
                for record in event['Records']
            ]
        }
```

## 8.5 Lambda与EventBridge集成

### 8.5.1 事件驱动架构配置

```python
from aws_cdk import (
    aws_events as events,
    aws_events_targets as targets,
    aws_scheduler as scheduler
)

class EventDrivenStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建自定义事件总线
        self.custom_bus = events.EventBus(
            self, "CustomEventBus",
            event_bus_name="my-application-events"
        )
        
        # 事件处理Lambda函数
        self.event_handler = _lambda.Function(
            self, "EventHandler",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/event_handler"),
            timeout=Duration.minutes(2),
            environment={
                'EVENT_BUS_NAME': self.custom_bus.event_bus_name
            }
        )
        
        # 用户事件处理器
        self.user_event_handler = _lambda.Function(
            self, "UserEventHandler",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/user_event_handler"),
            timeout=Duration.seconds(30)
        )
        
        # 订单事件处理器
        self.order_event_handler = _lambda.Function(
            self, "OrderEventHandler",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/order_event_handler"),
            timeout=Duration.seconds(30)
        )
        
        # 创建事件规则
        self._create_event_rules()
        
        # 创建定时任务
        self._create_scheduled_tasks()
        
        # 授予发布事件的权限
        self.custom_bus.grant_put_events_to(self.event_handler)
    
    def _create_event_rules(self):
        """创建事件规则"""
        
        # 用户相关事件规则
        user_events_rule = events.Rule(
            self, "UserEventsRule",
            event_bus=self.custom_bus,
            rule_name="user-events-rule",
            description="Route user-related events",
            event_pattern=events.EventPattern(
                source=["user.service"],
                detail_type=["user.created", "user.updated", "user.deleted"]
            )
        )
        
        user_events_rule.add_target(
            targets.LambdaFunction(self.user_event_handler)
        )
        
        # 订单相关事件规则
        order_events_rule = events.Rule(
            self, "OrderEventsRule",
            event_bus=self.custom_bus,
            rule_name="order-events-rule",
            description="Route order-related events",
            event_pattern=events.EventPattern(
                source=["order.service"],
                detail_type=["order.created", "order.updated", "payment.completed"],
                detail={
                    "status": ["pending", "confirmed", "paid"]
                }
            )
        )
        
        order_events_rule.add_target(
            targets.LambdaFunction(self.order_event_handler)
        )
        
        # 高价值订单特殊处理
        high_value_order_rule = events.Rule(
            self, "HighValueOrderRule",
            event_bus=self.custom_bus,
            rule_name="high-value-order-rule",
            description="Handle high-value orders",
            event_pattern=events.EventPattern(
                source=["order.service"],
                detail_type=["order.created"],
                detail={
                    "amount": events.Match.exists_check(True),
                    "currency": ["USD", "EUR"]
                }
            )
        )
        
        # 添加自定义条件（金额大于1000）
        high_value_order_rule.add_target(
            targets.LambdaFunction(
                self.order_event_handler,
                event=events.RuleTargetInput.from_object({
                    "eventType": "high-value-order",
                    "originalEvent": events.EventField.from_path("$")
                })
            )
        )
        
        # AWS服务事件规则
        aws_events_rule = events.Rule(
            self, "AWSEventsRule",
            rule_name="aws-service-events",
            description="Handle AWS service events",
            event_pattern=events.EventPattern(
                source=["aws.s3", "aws.dynamodb"],
                detail_type=["AWS API Call via CloudTrail"]
            )
        )
        
        aws_events_rule.add_target(
            targets.LambdaFunction(self.event_handler)
        )
    
    def _create_scheduled_tasks(self):
        """创建定时任务"""
        
        # 每小时数据同步任务
        hourly_sync_rule = events.Rule(
            self, "HourlySyncRule",
            rule_name="hourly-data-sync",
            description="Hourly data synchronization",
            schedule=events.Schedule.cron(
                minute="0",
                hour="*",
                day="*",
                month="*",
                year="*"
            )
        )
        
        hourly_sync_rule.add_target(
            targets.LambdaFunction(
                self.event_handler,
                event=events.RuleTargetInput.from_object({
                    "taskType": "hourly_sync",
                    "timestamp": events.EventField.from_path("$.time")
                })
            )
        )
        
        # 每日报告生成任务
        daily_report_rule = events.Rule(
            self, "DailyReportRule",
            rule_name="daily-report-generation",
            description="Generate daily reports",
            schedule=events.Schedule.cron(
                minute="0",
                hour="9",  # 每天上午9点
                day="*",
                month="*",
                year="*"
            )
        )
        
        daily_report_rule.add_target(
            targets.LambdaFunction(
                self.event_handler,
                event=events.RuleTargetInput.from_object({
                    "taskType": "daily_report",
                    "reportDate": events.EventField.from_path("$.time")
                })
            )
        )
        
        # 周末维护任务
        weekend_maintenance_rule = events.Rule(
            self, "WeekendMaintenanceRule",
            rule_name="weekend-maintenance",
            description="Weekend maintenance tasks",
            schedule=events.Schedule.cron(
                minute="0",
                hour="2",   # 凌晨2点
                day="*",
                month="*",
                year="*",
                week_day="SUN"  # 每周日
            )
        )
        
        weekend_maintenance_rule.add_target(
            targets.LambdaFunction(
                self.event_handler,
                event=events.RuleTargetInput.from_object({
                    "taskType": "maintenance",
                    "maintenanceType": "weekly_cleanup"
                })
            )
        )
```

### 8.5.2 事件处理Lambda函数

```python
# lambda_functions/event_handler/index.py
import json
import boto3
import os
import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# AWS服务客户端
eventbridge_client = boto3.client('events')

class EventHandler:
    """通用事件处理器"""
    
    def __init__(self):
        self.event_bus_name = os.environ.get('EVENT_BUS_NAME', 'default')
    
    def handle_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """处理EventBridge事件"""
        
        # 检查是否是定时任务
        if 'taskType' in event:
            return self._handle_scheduled_task(event)
        
        # 检查是否是AWS服务事件
        if event.get('source', '').startswith('aws.'):
            return self._handle_aws_service_event(event)
        
        # 处理自定义应用事件
        return self._handle_application_event(event)
    
    def _handle_scheduled_task(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """处理定时任务"""
        task_type = event.get('taskType')
        
        logger.info(f"Processing scheduled task: {task_type}")
        
        try:
            if task_type == 'hourly_sync':
                return self._perform_hourly_sync(event)
            elif task_type == 'daily_report':
                return self._generate_daily_report(event)
            elif task_type == 'maintenance':
                return self._perform_maintenance(event)
            else:
                return {
                    'success': False,
                    'error': f'Unknown task type: {task_type}'
                }
                
        except Exception as e:
            logger.error(f"Error processing scheduled task {task_type}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'task_type': task_type
            }
    
    def _handle_aws_service_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """处理AWS服务事件"""
        source = event.get('source')
        detail_type = event.get('detail-type')
        
        logger.info(f"Processing AWS service event: {source} - {detail_type}")
        
        try:
            if source == 'aws.s3':
                return self._handle_s3_event(event)
            elif source == 'aws.dynamodb':
                return self._handle_dynamodb_event(event)
            else:
                return {
                    'success': True,
                    'message': f'AWS event logged: {source}',
                    'action': 'logged_only'
                }
                
        except Exception as e:
            logger.error(f"Error processing AWS service event: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'source': source
            }
    
    def _handle_application_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """处理应用程序事件"""
        source = event.get('source', 'unknown')
        detail_type = event.get('detail-type', 'unknown')
        
        logger.info(f"Processing application event: {source} - {detail_type}")
        
        # 记录事件到日志
        self._log_application_event(event)
        
        # 发布衍生事件（如果需要）
        derived_events = self._generate_derived_events(event)
        
        return {
            'success': True,
            'message': 'Application event processed',
            'source': source,
            'detail_type': detail_type,
            'derived_events': len(derived_events)
        }
    
    def _perform_hourly_sync(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """执行每小时同步任务"""
        timestamp = event.get('timestamp', datetime.utcnow().isoformat())
        
        # 模拟数据同步操作
        sync_operations = [
            'sync_user_data',
            'sync_order_data', 
            'sync_inventory_data',
            'sync_analytics_data'
        ]
        
        completed_operations = []
        failed_operations = []
        
        for operation in sync_operations:
            try:
                # 模拟同步操作
                result = self._simulate_sync_operation(operation)
                if result['success']:
                    completed_operations.append(operation)
                else:
                    failed_operations.append({
                        'operation': operation,
                        'error': result['error']
                    })
                    
            except Exception as e:
                failed_operations.append({
                    'operation': operation,
                    'error': str(e)
                })
        
        # 发布同步完成事件
        self._publish_event('sync.service', 'sync.completed', {
            'timestamp': timestamp,
            'completed_operations': completed_operations,
            'failed_operations': failed_operations,
            'total_operations': len(sync_operations)
        })
        
        return {
            'success': len(failed_operations) == 0,
            'completed_operations': len(completed_operations),
            'failed_operations': len(failed_operations),
            'timestamp': timestamp
        }
    
    def _generate_daily_report(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """生成每日报告"""
        report_date = event.get('reportDate', datetime.utcnow().isoformat())
        
        # 模拟报告生成
        report_sections = [
            'user_metrics',
            'order_summary',
            'revenue_analysis',
            'performance_metrics'
        ]
        
        report_data = {}
        for section in report_sections:
            report_data[section] = self._generate_report_section(section)
        
        # 模拟报告保存
        report_id = f"daily_report_{datetime.utcnow().strftime('%Y%m%d')}"
        
        # 发布报告生成完成事件
        self._publish_event('report.service', 'report.generated', {
            'report_id': report_id,
            'report_type': 'daily',
            'report_date': report_date,
            'sections': list(report_data.keys())
        })
        
        return {
            'success': True,
            'report_id': report_id,
            'sections_generated': len(report_sections),
            'report_date': report_date
        }
    
    def _perform_maintenance(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """执行维护任务"""
        maintenance_type = event.get('maintenanceType', 'general')
        
        maintenance_tasks = []
        
        if maintenance_type == 'weekly_cleanup':
            maintenance_tasks = [
                'cleanup_old_logs',
                'optimize_databases',
                'update_cache',
                'backup_critical_data'
            ]
        
        completed_tasks = []
        failed_tasks = []
        
        for task in maintenance_tasks:
            try:
                result = self._execute_maintenance_task(task)
                if result['success']:
                    completed_tasks.append(task)
                else:
                    failed_tasks.append({
                        'task': task,
                        'error': result['error']
                    })
                    
            except Exception as e:
                failed_tasks.append({
                    'task': task,
                    'error': str(e)
                })
        
        # 发布维护完成事件
        self._publish_event('maintenance.service', 'maintenance.completed', {
            'maintenance_type': maintenance_type,
            'completed_tasks': completed_tasks,
            'failed_tasks': failed_tasks,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        return {
            'success': len(failed_tasks) == 0,
            'maintenance_type': maintenance_type,
            'completed_tasks': len(completed_tasks),
            'failed_tasks': len(failed_tasks)
        }
    
    def _handle_s3_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """处理S3事件"""
        detail = event.get('detail', {})
        bucket_name = detail.get('requestParameters', {}).get('bucketName')
        object_key = detail.get('requestParameters', {}).get('key')
        
        return {
            'success': True,
            'message': f'S3 event processed for {bucket_name}/{object_key}',
            'bucket': bucket_name,
            'key': object_key
        }
    
    def _handle_dynamodb_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """处理DynamoDB事件"""
        detail = event.get('detail', {})
        table_name = detail.get('requestParameters', {}).get('tableName')
        
        return {
            'success': True,
            'message': f'DynamoDB event processed for table {table_name}',
            'table': table_name
        }
    
    def _log_application_event(self, event: Dict[str, Any]):
        """记录应用程序事件"""
        logger.info(f"Application event: {json.dumps(event, default=str)}")
    
    def _generate_derived_events(self, event: Dict[str, Any]) -> List[Dict[str, Any]]:
        """生成衍生事件"""
        derived_events = []
        
        # 根据原始事件生成衍生事件的逻辑
        source = event.get('source')
        detail_type = event.get('detail-type')
        
        if source == 'user.service' and detail_type == 'user.created':
            # 用户创建后的衍生事件
            derived_events.append({
                'source': 'notification.service',
                'detail_type': 'send.welcome.email',
                'detail': event.get('detail', {})
            })
        
        # 发布衍生事件
        for derived_event in derived_events:
            self._publish_event(
                derived_event['source'],
                derived_event['detail_type'],
                derived_event['detail']
            )
        
        return derived_events
    
    def _publish_event(self, source: str, detail_type: str, detail: Dict[str, Any]):
        """发布事件到EventBridge"""
        try:
            eventbridge_client.put_events(
                Entries=[
                    {
                        'Source': source,
                        'DetailType': detail_type,
                        'Detail': json.dumps(detail, default=str),
                        'EventBusName': self.event_bus_name
                    }
                ]
            )
            logger.info(f"Published event: {source} - {detail_type}")
            
        except Exception as e:
            logger.error(f"Failed to publish event: {str(e)}")
    
    # 模拟方法
    def _simulate_sync_operation(self, operation: str) -> Dict[str, Any]:
        """模拟同步操作"""
        return {'success': True, 'operation': operation}
    
    def _generate_report_section(self, section: str) -> Dict[str, Any]:
        """生成报告部分"""
        return {'section': section, 'data': 'sample_data'}
    
    def _execute_maintenance_task(self, task: str) -> Dict[str, Any]:
        """执行维护任务"""
        return {'success': True, 'task': task}

# 全局事件处理器
event_handler = EventHandler()

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """EventBridge事件处理主函数"""
    
    logger.info(f"Processing EventBridge event: {json.dumps(event, default=str)}")
    
    try:
        result = event_handler.handle_event(event)
        
        logger.info(f"Event processing result: {result}")
        
        return {
            'statusCode': 200,
            'body': json.dumps(result, default=str)
        }
        
    except Exception as e:
        logger.error(f"Error processing EventBridge event: {str(e)}")
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }
```

## 8.6 章节总结

::: tip 关键要点
- Lambda与API Gateway的集成提供了构建RESTful API和WebSocket API的能力
- DynamoDB集成支持实时数据处理和流式数据处理
- S3集成实现了强大的文件处理和事件驱动架构
- SQS/SNS集成提供了可靠的异步消息处理能力
- EventBridge集成支持复杂的事件驱动架构模式
- 正确的权限配置和错误处理是集成成功的关键
:::

在下一章中，我们将深入探讨Lambda的性能优化和最佳实践，包括冷启动优化、内存调优、并发控制等关键主题。

## 扩展阅读

- [Lambda与API Gateway集成指南](https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway.html)
- [Lambda与DynamoDB集成最佳实践](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html)
- [Lambda与S3事件处理](https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html)
- [Lambda与EventBridge集成](https://docs.aws.amazon.com/lambda/latest/dg/services-eventbridge.html)