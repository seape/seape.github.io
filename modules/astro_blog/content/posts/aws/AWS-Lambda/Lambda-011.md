---
title: "第11章：监控、调试和故障排除"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第11章：监控、调试和故障排除

::: info 章节概述
本章将深入探讨AWS Lambda的监控、调试和故障排除技术。我们将学习如何使用CloudWatch、X-Ray、AWS Lambda Insights等工具来监控函数性能，如何进行有效的调试，以及如何快速定位和解决生产环境中的问题。
:::

## 学习目标

1. 掌握Lambda函数的全面监控策略
2. 学会使用CloudWatch Logs进行日志分析
3. 理解AWS X-Ray分布式跟踪
4. 掌握Lambda Insights性能监控
5. 学会本地和远程调试技术
6. 了解常见问题的故障排除方法

## 11.1 CloudWatch监控

### 11.1.1 基础指标监控

```python
# lambda_functions/monitoring_demo/index.py
import json
import boto3
import os
import time
import logging
from typing import Dict, Any
from datetime import datetime
import uuid

# 配置日志
logger = logging.getLogger()
logger.setLevel(os.getenv('LOG_LEVEL', 'INFO'))

# CloudWatch客户端
cloudwatch = boto3.client('cloudwatch')

class MetricsCollector:
    """自定义指标收集器"""
    
    def __init__(self, namespace: str = "CustomApp"):
        self.namespace = namespace
        self.metrics_buffer = []
    
    def put_metric(self, metric_name: str, value: float, 
                  unit: str = "Count", dimensions: Dict[str, str] = None):
        """添加自定义指标"""
        metric_data = {
            'MetricName': metric_name,
            'Value': value,
            'Unit': unit,
            'Timestamp': datetime.utcnow()
        }
        
        if dimensions:
            metric_data['Dimensions'] = [
                {'Name': k, 'Value': v} for k, v in dimensions.items()
            ]
        
        self.metrics_buffer.append(metric_data)
        
        # 批量发送指标（最多20个）
        if len(self.metrics_buffer) >= 20:
            self.flush_metrics()
    
    def flush_metrics(self):
        """批量发送指标到CloudWatch"""
        if not self.metrics_buffer:
            return
        
        try:
            cloudwatch.put_metric_data(
                Namespace=self.namespace,
                MetricData=self.metrics_buffer
            )
            logger.info(f"Sent {len(self.metrics_buffer)} metrics to CloudWatch")
            self.metrics_buffer.clear()
        except Exception as e:
            logger.error(f"Failed to send metrics: {str(e)}")
    
    def record_processing_time(self, operation: str, duration: float):
        """记录操作处理时间"""
        self.put_metric(
            f"{operation}Duration",
            duration * 1000,  # 转换为毫秒
            "Milliseconds",
            {"Operation": operation}
        )
    
    def record_business_metric(self, metric_name: str, value: float, 
                             context: Dict[str, str] = None):
        """记录业务指标"""
        dimensions = {"Environment": os.getenv("ENVIRONMENT", "dev")}
        if context:
            dimensions.update(context)
        
        self.put_metric(metric_name, value, "Count", dimensions)
    
    def record_error(self, error_type: str, operation: str = None):
        """记录错误"""
        dimensions = {"ErrorType": error_type}
        if operation:
            dimensions["Operation"] = operation
        
        self.put_metric("Errors", 1, "Count", dimensions)

class PerformanceMonitor:
    """性能监控器"""
    
    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics = metrics_collector
        self.start_time = None
        self.checkpoints = {}
    
    def start_operation(self, operation_name: str):
        """开始监控操作"""
        self.operation_name = operation_name
        self.start_time = time.time()
        logger.info(f"Starting operation: {operation_name}")
        
        # 记录操作开始
        self.metrics.record_business_metric(
            "OperationStarted", 1, 
            {"Operation": operation_name}
        )
    
    def checkpoint(self, checkpoint_name: str):
        """记录检查点"""
        if not self.start_time:
            return
        
        current_time = time.time()
        duration = current_time - self.start_time
        self.checkpoints[checkpoint_name] = duration
        
        logger.info(f"Checkpoint {checkpoint_name}: {duration:.3f}s")
        
        # 记录检查点指标
        self.metrics.put_metric(
            f"CheckpointDuration",
            duration * 1000,
            "Milliseconds",
            {
                "Operation": self.operation_name,
                "Checkpoint": checkpoint_name
            }
        )
    
    def end_operation(self, success: bool = True):
        """结束监控操作"""
        if not self.start_time:
            return
        
        total_duration = time.time() - self.start_time
        
        logger.info(f"Operation {self.operation_name} completed in {total_duration:.3f}s")
        
        # 记录总处理时间
        self.metrics.record_processing_time(self.operation_name, total_duration)
        
        # 记录操作结果
        self.metrics.record_business_metric(
            "OperationCompleted" if success else "OperationFailed",
            1,
            {"Operation": self.operation_name}
        )
        
        # 重置
        self.start_time = None
        self.checkpoints.clear()

class HealthChecker:
    """健康检查器"""
    
    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics = metrics_collector
    
    def check_dependencies(self) -> Dict[str, Any]:
        """检查依赖服务健康状态"""
        health_status = {
            "overall_healthy": True,
            "services": {}
        }
        
        # 检查DynamoDB
        health_status["services"]["dynamodb"] = self._check_dynamodb()
        
        # 检查S3
        health_status["services"]["s3"] = self._check_s3()
        
        # 检查外部API
        health_status["services"]["external_api"] = self._check_external_api()
        
        # 计算总体健康状态
        health_status["overall_healthy"] = all(
            service["healthy"] for service in health_status["services"].values()
        )
        
        # 记录健康检查指标
        for service_name, service_health in health_status["services"].items():
            self.metrics.put_metric(
                "ServiceHealth",
                1 if service_health["healthy"] else 0,
                "Count",
                {"Service": service_name}
            )
        
        return health_status
    
    def _check_dynamodb(self) -> Dict[str, Any]:
        """检查DynamoDB连接"""
        try:
            dynamodb = boto3.client('dynamodb')
            start_time = time.time()
            
            # 简单的表列表查询
            response = dynamodb.list_tables(Limit=1)
            
            latency = (time.time() - start_time) * 1000
            
            self.metrics.put_metric(
                "ServiceLatency",
                latency,
                "Milliseconds",
                {"Service": "dynamodb"}
            )
            
            return {
                "healthy": True,
                "latency_ms": latency,
                "message": "DynamoDB connection successful"
            }
        except Exception as e:
            logger.error(f"DynamoDB health check failed: {str(e)}")
            self.metrics.record_error("DynamoDBConnectionError", "health_check")
            return {
                "healthy": False,
                "error": str(e),
                "message": "DynamoDB connection failed"
            }
    
    def _check_s3(self) -> Dict[str, Any]:
        """检查S3连接"""
        try:
            s3 = boto3.client('s3')
            start_time = time.time()
            
            # 简单的存储桶列表查询
            response = s3.list_buckets()
            
            latency = (time.time() - start_time) * 1000
            
            self.metrics.put_metric(
                "ServiceLatency",
                latency,
                "Milliseconds",
                {"Service": "s3"}
            )
            
            return {
                "healthy": True,
                "latency_ms": latency,
                "message": "S3 connection successful"
            }
        except Exception as e:
            logger.error(f"S3 health check failed: {str(e)}")
            self.metrics.record_error("S3ConnectionError", "health_check")
            return {
                "healthy": False,
                "error": str(e),
                "message": "S3 connection failed"
            }
    
    def _check_external_api(self) -> Dict[str, Any]:
        """检查外部API"""
        try:
            import requests
            
            start_time = time.time()
            response = requests.get(
                "https://httpbin.org/status/200",
                timeout=5
            )
            latency = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                self.metrics.put_metric(
                    "ServiceLatency",
                    latency,
                    "Milliseconds",
                    {"Service": "external_api"}
                )
                
                return {
                    "healthy": True,
                    "latency_ms": latency,
                    "status_code": response.status_code,
                    "message": "External API connection successful"
                }
            else:
                self.metrics.record_error("ExternalAPIError", "health_check")
                return {
                    "healthy": False,
                    "status_code": response.status_code,
                    "message": f"External API returned {response.status_code}"
                }
        except Exception as e:
            logger.error(f"External API health check failed: {str(e)}")
            self.metrics.record_error("ExternalAPIConnectionError", "health_check")
            return {
                "healthy": False,
                "error": str(e),
                "message": "External API connection failed"
            }

# 全局实例
metrics_collector = MetricsCollector("BlogApp")
performance_monitor = PerformanceMonitor(metrics_collector)
health_checker = HealthChecker(metrics_collector)

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """监控演示Lambda处理器"""
    
    # 记录基本信息
    logger.info(f"Function: {context.function_name}")
    logger.info(f"Version: {context.function_version}")
    logger.info(f"Memory: {context.memory_limit_in_mb}MB")
    logger.info(f"Request ID: {context.aws_request_id}")
    logger.info(f"Remaining time: {context.get_remaining_time_in_millis()}ms")
    
    action = event.get('action', 'demo')
    
    try:
        performance_monitor.start_operation(action)
        
        if action == 'health_check':
            result = handle_health_check()
        elif action == 'performance_test':
            result = handle_performance_test(event.get('test_params', {}))
        elif action == 'error_simulation':
            result = handle_error_simulation(event.get('error_type', 'general'))
        elif action == 'business_operation':
            result = handle_business_operation(event.get('operation_data', {}))
        else:
            result = handle_demo_operation()
        
        performance_monitor.end_operation(success=True)
        
        # 确保指标被发送
        metrics_collector.flush_metrics()
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'action': action,
                'result': result,
                'request_id': context.aws_request_id,
                'function_version': context.function_version
            }, default=str)
        }
        
    except Exception as e:
        logger.error(f"Error in handler: {str(e)}", exc_info=True)
        
        # 记录错误指标
        metrics_collector.record_error("HandlerError", action)
        performance_monitor.end_operation(success=False)
        metrics_collector.flush_metrics()
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'request_id': context.aws_request_id
            })
        }

def handle_health_check() -> Dict[str, Any]:
    """处理健康检查"""
    performance_monitor.checkpoint("health_check_start")
    
    health_status = health_checker.check_dependencies()
    
    performance_monitor.checkpoint("health_check_complete")
    
    return health_status

def handle_performance_test(test_params: Dict[str, Any]) -> Dict[str, Any]:
    """处理性能测试"""
    test_type = test_params.get('type', 'cpu')
    duration = test_params.get('duration', 1)
    
    performance_monitor.checkpoint("performance_test_start")
    
    if test_type == 'cpu':
        result = _cpu_intensive_task(duration)
    elif test_type == 'memory':
        result = _memory_intensive_task(test_params.get('size_mb', 10))
    elif test_type == 'io':
        result = _io_intensive_task(test_params.get('operations', 100))
    else:
        result = {'error': f'Unknown test type: {test_type}'}
    
    performance_monitor.checkpoint("performance_test_complete")
    
    return result

def handle_error_simulation(error_type: str) -> Dict[str, Any]:
    """模拟错误情况"""
    performance_monitor.checkpoint("error_simulation_start")
    
    if error_type == 'timeout':
        time.sleep(10)  # 模拟超时
    elif error_type == 'memory_error':
        # 模拟内存错误
        data = bytearray(1024 * 1024 * 1024)  # 1GB
    elif error_type == 'division_by_zero':
        result = 1 / 0
    elif error_type == 'permission_error':
        # 模拟权限错误
        boto3.client('iam').list_users()
    else:
        raise ValueError(f"Unknown error type: {error_type}")
    
    return {'message': 'Error simulation completed'}

def handle_business_operation(operation_data: Dict[str, Any]) -> Dict[str, Any]:
    """处理业务操作"""
    operation_type = operation_data.get('type', 'create_user')
    
    performance_monitor.checkpoint("business_operation_start")
    
    if operation_type == 'create_user':
        result = _simulate_user_creation(operation_data)
    elif operation_type == 'process_order':
        result = _simulate_order_processing(operation_data)
    elif operation_type == 'generate_report':
        result = _simulate_report_generation(operation_data)
    else:
        result = {'error': f'Unknown operation type: {operation_type}'}
    
    performance_monitor.checkpoint("business_operation_complete")
    
    return result

def handle_demo_operation() -> Dict[str, Any]:
    """处理演示操作"""
    performance_monitor.checkpoint("demo_start")
    
    # 模拟一些业务逻辑
    time.sleep(0.1)  # 模拟处理时间
    
    # 记录一些业务指标
    metrics_collector.record_business_metric("DemoExecutions", 1)
    metrics_collector.record_business_metric("RandomValue", 
                                           time.time() % 100)
    
    performance_monitor.checkpoint("demo_complete")
    
    return {
        'message': 'Demo operation completed successfully',
        'timestamp': datetime.utcnow().isoformat(),
        'random_id': str(uuid.uuid4())
    }

def _cpu_intensive_task(duration: float) -> Dict[str, Any]:
    """CPU密集型任务"""
    start_time = time.time()
    end_time = start_time + duration
    
    operations = 0
    while time.time() < end_time:
        # 执行一些CPU密集型计算
        sum(i * i for i in range(1000))
        operations += 1
    
    total_time = time.time() - start_time
    
    # 记录性能指标
    metrics_collector.put_metric(
        "CPUOperationsPerSecond",
        operations / total_time,
        "Count/Second"
    )
    
    return {
        'operations_completed': operations,
        'duration': total_time,
        'ops_per_second': operations / total_time
    }

def _memory_intensive_task(size_mb: int) -> Dict[str, Any]:
    """内存密集型任务"""
    start_time = time.time()
    
    # 分配指定大小的内存
    data = bytearray(size_mb * 1024 * 1024)
    
    # 对内存进行一些操作
    for i in range(0, len(data), 1024):
        data[i] = i % 256
    
    total_time = time.time() - start_time
    
    # 记录内存使用指标
    metrics_collector.put_metric(
        "MemoryAllocated",
        size_mb,
        "Megabytes"
    )
    
    # 清理内存
    del data
    
    return {
        'memory_allocated_mb': size_mb,
        'duration': total_time
    }

def _io_intensive_task(operations: int) -> Dict[str, Any]:
    """I/O密集型任务"""
    start_time = time.time()
    
    # 模拟多个I/O操作
    s3 = boto3.client('s3')
    
    successful_operations = 0
    for i in range(operations):
        try:
            # 模拟S3操作
            s3.list_buckets()
            successful_operations += 1
        except Exception as e:
            logger.warning(f"I/O operation {i} failed: {str(e)}")
    
    total_time = time.time() - start_time
    
    # 记录I/O性能指标
    metrics_collector.put_metric(
        "IOOperationsPerSecond",
        successful_operations / total_time,
        "Count/Second"
    )
    
    return {
        'total_operations': operations,
        'successful_operations': successful_operations,
        'duration': total_time,
        'ops_per_second': successful_operations / total_time
    }

def _simulate_user_creation(data: Dict[str, Any]) -> Dict[str, Any]:
    """模拟用户创建"""
    user_count = data.get('count', 1)
    
    # 模拟数据库写入
    time.sleep(0.05 * user_count)
    
    # 记录业务指标
    metrics_collector.record_business_metric("UsersCreated", user_count)
    
    return {
        'users_created': user_count,
        'status': 'success'
    }

def _simulate_order_processing(data: Dict[str, Any]) -> Dict[str, Any]:
    """模拟订单处理"""
    order_amount = data.get('amount', 100)
    
    # 模拟订单处理逻辑
    time.sleep(0.1)
    
    # 记录业务指标
    metrics_collector.record_business_metric("OrdersProcessed", 1)
    metrics_collector.record_business_metric("OrderValue", order_amount)
    
    return {
        'order_id': str(uuid.uuid4()),
        'amount': order_amount,
        'status': 'processed'
    }

def _simulate_report_generation(data: Dict[str, Any]) -> Dict[str, Any]:
    """模拟报告生成"""
    report_type = data.get('type', 'daily')
    
    # 模拟报告生成时间
    generation_time = {
        'daily': 0.5,
        'weekly': 2.0,
        'monthly': 5.0
    }.get(report_type, 1.0)
    
    time.sleep(generation_time)
    
    # 记录业务指标
    metrics_collector.record_business_metric("ReportsGenerated", 1, 
                                           {"ReportType": report_type})
    
    return {
        'report_id': str(uuid.uuid4()),
        'type': report_type,
        'generation_time': generation_time,
        'status': 'completed'
    }
```

### 11.1.2 CloudWatch仪表板配置

```python
# stacks/dashboard_stack.py
from aws_cdk import (
    Stack,
    aws_cloudwatch as cloudwatch,
    aws_lambda as _lambda,
    Duration
)
from constructs import Construct
from typing import List, Dict

class DashboardStack(Stack):
    def __init__(self, scope: Construct, construct_id: str,
                 lambda_functions: Dict[str, _lambda.Function], **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        self.lambda_functions = lambda_functions
        
        # 创建综合监控仪表板
        self._create_comprehensive_dashboard()
        
        # 创建性能专用仪表板
        self._create_performance_dashboard()
        
        # 创建业务指标仪表板
        self._create_business_dashboard()
    
    def _create_comprehensive_dashboard(self):
        """创建综合监控仪表板"""
        
        self.main_dashboard = cloudwatch.Dashboard(
            self, "MainDashboard",
            dashboard_name="Lambda-Comprehensive-Monitoring"
        )
        
        # 概览小部件
        overview_widgets = self._create_overview_widgets()
        
        # Lambda函数详细指标
        lambda_widgets = self._create_lambda_widgets()
        
        # 错误和告警小部件
        error_widgets = self._create_error_widgets()
        
        # 添加所有小部件
        self.main_dashboard.add_widgets(*overview_widgets)
        self.main_dashboard.add_widgets(*lambda_widgets)
        self.main_dashboard.add_widgets(*error_widgets)
    
    def _create_overview_widgets(self) -> List[cloudwatch.IWidget]:
        """创建概览小部件"""
        widgets = []
        
        # 总调用次数
        total_invocations = cloudwatch.SingleValueWidget(
            title="Total Invocations (Last 24h)",
            metrics=[
                cloudwatch.MathExpression(
                    expression="SUM(METRICS())",
                    using_metrics={
                        f"m{i}": func.metric_invocations(
                            period=Duration.hours(24)
                        )
                        for i, func in enumerate(self.lambda_functions.values())
                    }
                )
            ],
            width=6,
            height=6
        )
        widgets.append(total_invocations)
        
        # 总错误数
        total_errors = cloudwatch.SingleValueWidget(
            title="Total Errors (Last 24h)",
            metrics=[
                cloudwatch.MathExpression(
                    expression="SUM(METRICS())",
                    using_metrics={
                        f"e{i}": func.metric_errors(
                            period=Duration.hours(24)
                        )
                        for i, func in enumerate(self.lambda_functions.values())
                    }
                )
            ],
            width=6,
            height=6
        )
        widgets.append(total_errors)
        
        # 平均持续时间
        avg_duration = cloudwatch.SingleValueWidget(
            title="Average Duration (Last 1h)",
            metrics=[
                cloudwatch.MathExpression(
                    expression="AVG(METRICS())",
                    using_metrics={
                        f"d{i}": func.metric_duration(
                            period=Duration.hours(1),
                            statistic="Average"
                        )
                        for i, func in enumerate(self.lambda_functions.values())
                    }
                )
            ],
            width=6,
            height=6
        )
        widgets.append(avg_duration)
        
        # 并发执行数
        concurrent_executions = cloudwatch.SingleValueWidget(
            title="Concurrent Executions",
            metrics=[
                cloudwatch.MathExpression(
                    expression="MAX(METRICS())",
                    using_metrics={
                        f"c{i}": func.metric_concurrent_executions(
                            period=Duration.minutes(5)
                        )
                        for i, func in enumerate(self.lambda_functions.values())
                    }
                )
            ],
            width=6,
            height=6
        )
        widgets.append(concurrent_executions)
        
        return widgets
    
    def _create_lambda_widgets(self) -> List[cloudwatch.IWidget]:
        """创建Lambda函数详细指标小部件"""
        widgets = []
        
        for name, function in self.lambda_functions.items():
            # 调用次数和错误
            invocation_error_widget = cloudwatch.GraphWidget(
                title=f"{name} - Invocations & Errors",
                left=[
                    function.metric_invocations(
                        period=Duration.minutes(5),
                        label="Invocations"
                    )
                ],
                right=[
                    function.metric_errors(
                        period=Duration.minutes(5),
                        label="Errors"
                    ),
                    function.metric_throttles(
                        period=Duration.minutes(5),
                        label="Throttles"
                    )
                ],
                width=12,
                height=6
            )
            widgets.append(invocation_error_widget)
            
            # 持续时间和并发
            duration_concurrency_widget = cloudwatch.GraphWidget(
                title=f"{name} - Duration & Concurrency",
                left=[
                    function.metric_duration(
                        period=Duration.minutes(5),
                        statistic="Average",
                        label="Avg Duration"
                    ),
                    function.metric_duration(
                        period=Duration.minutes(5),
                        statistic="Maximum",
                        label="Max Duration"
                    )
                ],
                right=[
                    function.metric_concurrent_executions(
                        period=Duration.minutes(5),
                        label="Concurrent Executions"
                    )
                ],
                width=12,
                height=6
            )
            widgets.append(duration_concurrency_widget)
        
        return widgets
    
    def _create_error_widgets(self) -> List[cloudwatch.IWidget]:
        """创建错误监控小部件"""
        widgets = []
        
        # 错误率趋势
        error_rate_widget = cloudwatch.GraphWidget(
            title="Error Rate by Function",
            left=[
                cloudwatch.MathExpression(
                    expression=f"errors_{i} / invocations_{i} * 100",
                    label=f"{name} Error Rate (%)",
                    using_metrics={
                        f"errors_{i}": func.metric_errors(
                            period=Duration.minutes(5)
                        ),
                        f"invocations_{i}": func.metric_invocations(
                            period=Duration.minutes(5)
                        )
                    }
                )
                for i, (name, func) in enumerate(self.lambda_functions.items())
            ],
            width=12,
            height=6
        )
        widgets.append(error_rate_widget)
        
        # 节流情况
        throttle_widget = cloudwatch.GraphWidget(
            title="Throttles by Function",
            left=[
                func.metric_throttles(
                    period=Duration.minutes(5),
                    label=name
                )
                for name, func in self.lambda_functions.items()
            ],
            width=12,
            height=6
        )
        widgets.append(throttle_widget)
        
        return widgets
    
    def _create_performance_dashboard(self):
        """创建性能专用仪表板"""
        
        self.perf_dashboard = cloudwatch.Dashboard(
            self, "PerformanceDashboard",
            dashboard_name="Lambda-Performance-Monitoring"
        )
        
        # 冷启动监控
        cold_start_widget = cloudwatch.GraphWidget(
            title="Cold Start Analysis",
            left=[
                cloudwatch.Metric(
                    namespace="AWS/Lambda",
                    metric_name="InitDuration",
                    dimensions_map={
                        "FunctionName": func.function_name
                    },
                    period=Duration.minutes(5),
                    statistic="Average",
                    label=f"{name} Init Duration"
                )
                for name, func in self.lambda_functions.items()
            ],
            width=12,
            height=6
        )
        
        # 内存使用情况
        memory_widget = cloudwatch.GraphWidget(
            title="Memory Utilization",
            left=[
                cloudwatch.MathExpression(
                    expression=f"max_memory_{i} / {func.memory_size} * 100",
                    label=f"{name} Memory Utilization (%)",
                    using_metrics={
                        f"max_memory_{i}": cloudwatch.Metric(
                            namespace="AWS/Lambda",
                            metric_name="MaxMemoryUsed",
                            dimensions_map={
                                "FunctionName": func.function_name
                            },
                            period=Duration.minutes(5),
                            statistic="Maximum"
                        )
                    }
                )
                for i, (name, func) in enumerate(self.lambda_functions.items())
            ],
            width=12,
            height=6
        )
        
        self.perf_dashboard.add_widgets(cold_start_widget, memory_widget)
    
    def _create_business_dashboard(self):
        """创建业务指标仪表板"""
        
        self.business_dashboard = cloudwatch.Dashboard(
            self, "BusinessDashboard",
            dashboard_name="Lambda-Business-Metrics"
        )
        
        # 自定义业务指标
        business_metrics_widget = cloudwatch.GraphWidget(
            title="Business Metrics",
            left=[
                cloudwatch.Metric(
                    namespace="BlogApp",
                    metric_name="UsersCreated",
                    period=Duration.hours(1),
                    statistic="Sum",
                    label="Users Created"
                ),
                cloudwatch.Metric(
                    namespace="BlogApp",
                    metric_name="OrdersProcessed",
                    period=Duration.hours(1),
                    statistic="Sum",
                    label="Orders Processed"
                ),
                cloudwatch.Metric(
                    namespace="BlogApp",
                    metric_name="ReportsGenerated",
                    period=Duration.hours(1),
                    statistic="Sum",
                    label="Reports Generated"
                )
            ],
            width=12,
            height=6
        )
        
        # 服务健康状态
        health_widget = cloudwatch.GraphWidget(
            title="Service Health Status",
            left=[
                cloudwatch.Metric(
                    namespace="BlogApp",
                    metric_name="ServiceHealth",
                    dimensions_map={"Service": "dynamodb"},
                    period=Duration.minutes(5),
                    statistic="Average",
                    label="DynamoDB Health"
                ),
                cloudwatch.Metric(
                    namespace="BlogApp",
                    metric_name="ServiceHealth",
                    dimensions_map={"Service": "s3"},
                    period=Duration.minutes(5),
                    statistic="Average",
                    label="S3 Health"
                ),
                cloudwatch.Metric(
                    namespace="BlogApp",
                    metric_name="ServiceHealth",
                    dimensions_map={"Service": "external_api"},
                    period=Duration.minutes(5),
                    statistic="Average",
                    label="External API Health"
                )
            ],
            width=12,
            height=6
        )
        
        self.business_dashboard.add_widgets(business_metrics_widget, health_widget)
```

## 11.2 CloudWatch Logs分析

### 11.2.1 结构化日志记录

```python
# lambda_functions/structured_logging/index.py
import json
import logging
import os
import sys
from typing import Dict, Any, Optional
from datetime import datetime
import traceback
import uuid

class StructuredLogger:
    """结构化日志记录器"""
    
    def __init__(self, logger_name: str, context: Dict[str, Any] = None):
        self.logger = logging.getLogger(logger_name)
        self.logger.setLevel(os.getenv('LOG_LEVEL', 'INFO'))
        
        # 移除默认处理器
        for handler in self.logger.handlers[:]:
            self.logger.removeHandler(handler)
        
        # 添加自定义处理器
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(self._get_formatter())
        self.logger.addHandler(handler)
        
        self.context = context or {}
        self.correlation_id = str(uuid.uuid4())
    
    def _get_formatter(self):
        """获取JSON格式化器"""
        return JsonFormatter()
    
    def add_context(self, **kwargs):
        """添加上下文信息"""
        self.context.update(kwargs)
    
    def info(self, message: str, **kwargs):
        """记录INFO级别日志"""
        self._log('INFO', message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """记录WARNING级别日志"""
        self._log('WARNING', message, **kwargs)
    
    def error(self, message: str, error: Exception = None, **kwargs):
        """记录ERROR级别日志"""
        extra_data = kwargs
        if error:
            extra_data.update({
                'error_type': type(error).__name__,
                'error_message': str(error),
                'stacktrace': traceback.format_exc()
            })
        self._log('ERROR', message, **extra_data)
    
    def debug(self, message: str, **kwargs):
        """记录DEBUG级别日志"""
        self._log('DEBUG', message, **kwargs)
    
    def _log(self, level: str, message: str, **kwargs):
        """内部日志记录方法"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': level,
            'message': message,
            'correlation_id': self.correlation_id,
            **self.context,
            **kwargs
        }
        
        # 使用对应的日志级别
        getattr(self.logger, level.lower())(json.dumps(log_data, default=str))

class JsonFormatter(logging.Formatter):
    """JSON格式化器"""
    
    def format(self, record):
        # 直接返回消息（已经是JSON格式）
        return record.getMessage()

class RequestTracker:
    """请求跟踪器"""
    
    def __init__(self, logger: StructuredLogger, event: Dict[str, Any], context):
        self.logger = logger
        self.event = event
        self.context = context
        self.start_time = datetime.utcnow()
        
        # 添加请求上下文
        self.logger.add_context(
            function_name=context.function_name,
            function_version=context.function_version,
            request_id=context.aws_request_id,
            memory_limit=context.memory_limit_in_mb,
            http_method=event.get('httpMethod'),
            path=event.get('path'),
            user_agent=event.get('headers', {}).get('User-Agent'),
            source_ip=event.get('requestContext', {}).get('identity', {}).get('sourceIp')
        )
        
        # 记录请求开始
        self.logger.info("Request started", 
                        event_size=len(json.dumps(event, default=str)))
    
    def log_operation(self, operation: str, **kwargs):
        """记录操作"""
        self.logger.info(f"Operation: {operation}", operation=operation, **kwargs)
    
    def log_database_operation(self, table: str, operation: str, 
                             duration_ms: float, **kwargs):
        """记录数据库操作"""
        self.logger.info("Database operation",
                        database_table=table,
                        database_operation=operation,
                        duration_ms=duration_ms,
                        **kwargs)
    
    def log_external_api_call(self, url: str, method: str, status_code: int,
                            duration_ms: float, **kwargs):
        """记录外部API调用"""
        self.logger.info("External API call",
                        api_url=url,
                        api_method=method,
                        api_status_code=status_code,
                        api_duration_ms=duration_ms,
                        **kwargs)
    
    def log_business_event(self, event_type: str, **kwargs):
        """记录业务事件"""
        self.logger.info("Business event",
                        business_event_type=event_type,
                        **kwargs)
    
    def complete_request(self, status_code: int, success: bool = True):
        """完成请求记录"""
        end_time = datetime.utcnow()
        duration = (end_time - self.start_time).total_seconds() * 1000
        
        remaining_time = self.context.get_remaining_time_in_millis()
        
        self.logger.info("Request completed",
                        status_code=status_code,
                        success=success,
                        duration_ms=duration,
                        remaining_time_ms=remaining_time,
                        memory_used_percent=self._get_memory_usage_percent())
    
    def _get_memory_usage_percent(self) -> Optional[float]:
        """获取内存使用百分比（近似值）"""
        try:
            import psutil
            process = psutil.Process()
            memory_info = process.memory_info()
            memory_used_mb = memory_info.rss / 1024 / 1024
            return (memory_used_mb / self.context.memory_limit_in_mb) * 100
        except:
            return None

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """结构化日志演示处理器"""
    
    # 初始化结构化日志记录器
    logger = StructuredLogger(__name__)
    tracker = RequestTracker(logger, event, context)
    
    try:
        action = event.get('action', 'demo')
        tracker.log_operation("action_determination", action=action)
        
        if action == 'user_registration':
            result = handle_user_registration(event.get('user_data', {}), tracker)
        elif action == 'order_processing':
            result = handle_order_processing(event.get('order_data', {}), tracker)
        elif action == 'data_export':
            result = handle_data_export(event.get('export_params', {}), tracker)
        elif action == 'error_demo':
            result = handle_error_demo(event.get('error_type', 'general'), tracker)
        else:
            result = handle_default_action(tracker)
        
        tracker.complete_request(200, success=True)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'result': result,
                'correlation_id': logger.correlation_id
            }, default=str)
        }
        
    except Exception as e:
        logger.error("Request failed", error=e)
        tracker.complete_request(500, success=False)
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'correlation_id': logger.correlation_id
            })
        }

def handle_user_registration(user_data: Dict[str, Any], 
                           tracker: RequestTracker) -> Dict[str, Any]:
    """处理用户注册"""
    import time
    
    tracker.log_business_event("user_registration_started",
                              email=user_data.get('email'),
                              registration_source=user_data.get('source', 'web'))
    
    # 模拟数据验证
    tracker.log_operation("data_validation")
    if not user_data.get('email'):
        raise ValueError("Email is required")
    
    # 模拟数据库操作
    start_time = time.time()
    time.sleep(0.1)  # 模拟数据库写入
    duration = (time.time() - start_time) * 1000
    
    tracker.log_database_operation("users", "insert", duration,
                                  user_id=str(uuid.uuid4()),
                                  email_domain=user_data.get('email', '').split('@')[-1])
    
    # 模拟外部API调用（发送欢迎邮件）
    start_time = time.time()
    time.sleep(0.05)  # 模拟API调用
    duration = (time.time() - start_time) * 1000
    
    tracker.log_external_api_call("https://api.mailservice.com/send",
                                 "POST", 200, duration,
                                 email_type="welcome")
    
    tracker.log_business_event("user_registration_completed",
                              user_id=str(uuid.uuid4()),
                              welcome_email_sent=True)
    
    return {
        'user_id': str(uuid.uuid4()),
        'status': 'registered',
        'welcome_email_sent': True
    }

def handle_order_processing(order_data: Dict[str, Any],
                          tracker: RequestTracker) -> Dict[str, Any]:
    """处理订单"""
    import time
    
    order_id = str(uuid.uuid4())
    order_amount = order_data.get('amount', 0)
    
    tracker.log_business_event("order_processing_started",
                              order_id=order_id,
                              order_amount=order_amount,
                              customer_id=order_data.get('customer_id'))
    
    # 模拟库存检查
    tracker.log_operation("inventory_check")
    start_time = time.time()
    time.sleep(0.05)
    duration = (time.time() - start_time) * 1000
    
    tracker.log_database_operation("inventory", "query", duration,
                                  items_checked=len(order_data.get('items', [])))
    
    # 模拟支付处理
    tracker.log_operation("payment_processing")
    start_time = time.time()
    time.sleep(0.1)
    duration = (time.time() - start_time) * 1000
    
    tracker.log_external_api_call("https://api.payment.com/charge",
                                 "POST", 200, duration,
                                 payment_amount=order_amount)
    
    # 模拟订单保存
    start_time = time.time()
    time.sleep(0.02)
    duration = (time.time() - start_time) * 1000
    
    tracker.log_database_operation("orders", "insert", duration,
                                  order_id=order_id,
                                  order_value=order_amount)
    
    tracker.log_business_event("order_processing_completed",
                              order_id=order_id,
                              payment_successful=True,
                              processing_time_ms=(time.time() - time.time()) * 1000)
    
    return {
        'order_id': order_id,
        'status': 'processed',
        'amount': order_amount,
        'payment_status': 'completed'
    }

def handle_data_export(export_params: Dict[str, Any],
                      tracker: RequestTracker) -> Dict[str, Any]:
    """处理数据导出"""
    import time
    
    export_type = export_params.get('type', 'user_data')
    date_range = export_params.get('date_range', '30_days')
    
    tracker.log_business_event("data_export_started",
                              export_type=export_type,
                              date_range=date_range)
    
    # 模拟数据查询
    tracker.log_operation("data_query", export_type=export_type)
    start_time = time.time()
    time.sleep(0.2)  # 模拟大数据查询
    duration = (time.time() - start_time) * 1000
    
    record_count = 1000  # 模拟记录数
    tracker.log_database_operation("analytics", "scan", duration,
                                  records_retrieved=record_count,
                                  data_size_mb=record_count * 0.01)
    
    # 模拟文件生成
    tracker.log_operation("file_generation")
    start_time = time.time()
    time.sleep(0.1)
    duration = (time.time() - start_time) * 1000
    
    file_id = str(uuid.uuid4())
    tracker.log_operation("file_upload", file_id=file_id, duration_ms=duration)
    
    tracker.log_business_event("data_export_completed",
                              export_file_id=file_id,
                              records_exported=record_count,
                              file_size_mb=record_count * 0.01)
    
    return {
        'export_id': file_id,
        'status': 'completed',
        'records_exported': record_count,
        'download_url': f'https://example.com/downloads/{file_id}'
    }

def handle_error_demo(error_type: str, tracker: RequestTracker) -> Dict[str, Any]:
    """处理错误演示"""
    tracker.log_operation("error_simulation", error_type=error_type)
    
    if error_type == 'validation_error':
        tracker.log_business_event("validation_failed", 
                                  field="email", reason="invalid_format")
        raise ValueError("Invalid email format")
    elif error_type == 'database_error':
        tracker.log_database_operation("users", "query", 0, error="connection_timeout")
        raise ConnectionError("Database connection timeout")
    elif error_type == 'external_api_error':
        tracker.log_external_api_call("https://api.external.com/data",
                                     "GET", 500, 5000, error="internal_server_error")
        raise RuntimeError("External API returned 500")
    else:
        raise Exception(f"Unknown error type: {error_type}")

def handle_default_action(tracker: RequestTracker) -> Dict[str, Any]:
    """处理默认操作"""
    tracker.log_operation("default_action")
    tracker.log_business_event("demo_operation_executed")
    
    return {
        'message': 'Default operation completed',
        'timestamp': datetime.utcnow().isoformat()
    }
```

### 11.2.2 CloudWatch Logs Insights查询

```sql
-- 查询所有错误日志
fields @timestamp, level, message, error_type, error_message, correlation_id
| filter level = "ERROR"
| sort @timestamp desc
| limit 100

-- 分析请求延迟分布
fields @timestamp, duration_ms
| filter ispresent(duration_ms)
| stats avg(duration_ms), max(duration_ms), min(duration_ms) by bin(5m)

-- 查找特定关联ID的请求链路
fields @timestamp, level, message, operation
| filter correlation_id = "your-correlation-id-here"
| sort @timestamp asc

-- 分析数据库操作性能
fields @timestamp, database_table, database_operation, duration_ms
| filter ispresent(database_table)
| stats avg(duration_ms), count() by database_table, database_operation
| sort avg desc

-- 查找外部API调用失败
fields @timestamp, api_url, api_status_code, api_duration_ms, message
| filter ispresent(api_url) and api_status_code >= 400
| sort @timestamp desc

-- 分析业务事件趋势
fields @timestamp, business_event_type
| filter ispresent(business_event_type)
| stats count() by business_event_type, bin(1h)
| sort @timestamp desc

-- 查找内存使用率高的请求
fields @timestamp, memory_used_percent, duration_ms, function_name
| filter ispresent(memory_used_percent) and memory_used_percent > 80
| sort memory_used_percent desc

-- 分析冷启动影响
fields @timestamp, message, duration_ms
| filter message like /Request started/
| stats avg(duration_ms), count() by bin(1h)
| sort @timestamp desc

-- 查找慢查询
fields @timestamp, database_table, database_operation, duration_ms
| filter ispresent(duration_ms) and duration_ms > 1000
| sort duration_ms desc

-- 错误类型统计
fields @timestamp, error_type, error_message
| filter ispresent(error_type)
| stats count() by error_type
| sort count desc

-- 用户操作分析
fields @timestamp, business_event_type, email, user_id
| filter business_event_type like /user_/
| stats count() by business_event_type, bin(1d)
```

## 11.3 AWS X-Ray分布式跟踪

### 11.3.1 X-Ray集成配置

```python
# lambda_functions/xray_tracing/index.py
import json
import time
import boto3
from typing import Dict, Any
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all
from aws_xray_sdk.core.models import subsegment

# 自动patch AWS SDK和第三方库
patch_all()

# 手动patch requests（如果使用）
import requests
from aws_xray_sdk.core.patch import patch
patch(['requests'])

class XRayTracing:
    """X-Ray跟踪工具类"""
    
    @staticmethod
    def create_subsegment(name: str, metadata: Dict[str, Any] = None):
        """创建子段"""
        def decorator(func):
            def wrapper(*args, **kwargs):
                with xray_recorder.in_subsegment(name) as subsegment:
                    if metadata:
                        subsegment.put_metadata("function_metadata", metadata)
                    
                    # 添加注解
                    subsegment.put_annotation("operation", name)
                    
                    try:
                        result = func(*args, **kwargs)
                        subsegment.put_metadata("result", {"success": True})
                        return result
                    except Exception as e:
                        subsegment.put_metadata("error", {
                            "error_type": type(e).__name__,
                            "error_message": str(e)
                        })
                        subsegment.add_exception(e)
                        raise
            return wrapper
        return decorator
    
    @staticmethod
    def add_user_info(user_id: str, email: str = None):
        """添加用户信息到跟踪"""
        segment = xray_recorder.current_segment()
        if segment:
            segment.set_user(user_id)
            if email:
                segment.put_annotation("user_email", email)
    
    @staticmethod
    def add_business_context(operation: str, resource_id: str = None):
        """添加业务上下文"""
        segment = xray_recorder.current_segment()
        if segment:
            segment.put_annotation("business_operation", operation)
            if resource_id:
                segment.put_annotation("resource_id", resource_id)

@XRayTracing.create_subsegment("database_operations")
def database_operation(table_name: str, operation: str, item_id: str = None):
    """数据库操作"""
    # 添加数据库相关注解
    subsegment = xray_recorder.current_subsegment()
    subsegment.put_annotation("db_table", table_name)
    subsegment.put_annotation("db_operation", operation)
    
    if item_id:
        subsegment.put_annotation("item_id", item_id)
    
    # 模拟数据库操作
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)
    
    start_time = time.time()
    
    try:
        if operation == 'get':
            response = table.get_item(Key={'id': item_id})
            result = response.get('Item')
        elif operation == 'put':
            item = {'id': item_id, 'timestamp': str(time.time())}
            table.put_item(Item=item)
            result = item
        elif operation == 'scan':
            response = table.scan(Limit=10)
            result = response.get('Items', [])
        else:
            raise ValueError(f"Unknown operation: {operation}")
        
        duration = time.time() - start_time
        
        # 添加性能指标
        subsegment.put_metadata("performance", {
            "duration_ms": duration * 1000,
            "records_processed": len(result) if isinstance(result, list) else 1
        })
        
        return result
        
    except Exception as e:
        # 记录错误信息
        subsegment.put_metadata("error_details", {
            "table": table_name,
            "operation": operation,
            "item_id": item_id
        })
        raise

@XRayTracing.create_subsegment("external_api_call")
def external_api_call(url: str, method: str = 'GET', data: Dict = None):
    """外部API调用"""
    subsegment = xray_recorder.current_subsegment()
    subsegment.put_annotation("api_url", url)
    subsegment.put_annotation("http_method", method)
    
    # 添加HTTP信息
    subsegment.put_http("url", url)
    subsegment.put_http("method", method)
    
    start_time = time.time()
    
    try:
        if method == 'GET':
            response = requests.get(url, timeout=10)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        duration = time.time() - start_time
        
        # 添加响应信息
        subsegment.put_http("status", response.status_code)
        subsegment.put_http("content_length", len(response.content))
        
        # 添加性能和响应元数据
        subsegment.put_metadata("response", {
            "status_code": response.status_code,
            "duration_ms": duration * 1000,
            "response_size": len(response.content)
        })
        
        response.raise_for_status()
        return response.json()
        
    except requests.RequestException as e:
        subsegment.put_metadata("error_details", {
            "url": url,
            "method": method,
            "error_type": type(e).__name__
        })
        raise

@XRayTracing.create_subsegment("business_logic")
def process_user_order(user_id: str, order_data: Dict[str, Any]):
    """处理用户订单业务逻辑"""
    XRayTracing.add_user_info(user_id)
    XRayTracing.add_business_context("order_processing", order_data.get('order_id'))
    
    # 验证订单
    with xray_recorder.in_subsegment("order_validation") as validation_segment:
        validation_segment.put_annotation("validation_type", "order_data")
        
        if not order_data.get('items'):
            raise ValueError("Order must contain items")
        
        validation_segment.put_metadata("validation_result", {
            "valid": True,
            "item_count": len(order_data.get('items', []))
        })
    
    # 检查库存
    with xray_recorder.in_subsegment("inventory_check") as inventory_segment:
        inventory_segment.put_annotation("check_type", "availability")
        
        # 模拟库存检查
        time.sleep(0.1)
        available_items = order_data.get('items', [])
        
        inventory_segment.put_metadata("inventory_result", {
            "available_items": len(available_items),
            "all_available": True
        })
    
    # 计算价格
    with xray_recorder.in_subsegment("price_calculation") as price_segment:
        price_segment.put_annotation("calculation_type", "order_total")
        
        total_amount = sum(item.get('price', 0) for item in order_data.get('items', []))
        
        price_segment.put_metadata("pricing", {
            "total_amount": total_amount,
            "currency": "USD",
            "discount_applied": False
        })
    
    # 保存订单
    order_id = order_data.get('order_id', f"order_{int(time.time())}")
    database_operation("orders", "put", order_id)
    
    # 发送确认邮件
    external_api_call("https://httpbin.org/post", "POST", {
        "to": f"user_{user_id}@example.com",
        "template": "order_confirmation",
        "order_id": order_id
    })
    
    return {
        "order_id": order_id,
        "status": "processed",
        "total_amount": total_amount
    }

@XRayTracing.create_subsegment("data_analytics")
def generate_user_report(user_id: str, report_type: str):
    """生成用户报告"""
    XRayTracing.add_user_info(user_id)
    XRayTracing.add_business_context("report_generation", report_type)
    
    # 获取用户数据
    user_data = database_operation("users", "get", user_id)
    
    # 获取用户订单历史
    orders = database_operation("orders", "scan")
    
    # 调用分析服务
    analytics_data = external_api_call("https://httpbin.org/json")
    
    # 生成报告
    with xray_recorder.in_subsegment("report_compilation") as report_segment:
        report_segment.put_annotation("report_type", report_type)
        
        # 模拟报告生成
        time.sleep(0.2)
        
        report = {
            "user_id": user_id,
            "report_type": report_type,
            "order_count": len(orders),
            "generated_at": time.time()
        }
        
        report_segment.put_metadata("report_stats", {
            "orders_analyzed": len(orders),
            "data_points": 100,
            "generation_time_ms": 200
        })
        
        return report

@xray_recorder.capture('lambda_handler')
def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """X-Ray跟踪演示Lambda处理器"""
    
    # 添加Lambda上下文信息
    segment = xray_recorder.current_segment()
    segment.put_annotation("function_name", context.function_name)
    segment.put_annotation("function_version", context.function_version)
    segment.put_annotation("memory_limit", context.memory_limit_in_mb)
    
    # 添加请求信息
    segment.put_metadata("request", {
        "event_size": len(json.dumps(event, default=str)),
        "remaining_time_ms": context.get_remaining_time_in_millis()
    })
    
    try:
        action = event.get('action', 'demo')
        segment.put_annotation("request_action", action)
        
        if action == 'process_order':
            user_id = event.get('user_id')
            order_data = event.get('order_data', {})
            
            if not user_id:
                raise ValueError("user_id is required")
            
            result = process_user_order(user_id, order_data)
            
        elif action == 'generate_report':
            user_id = event.get('user_id')
            report_type = event.get('report_type', 'summary')
            
            if not user_id:
                raise ValueError("user_id is required")
            
            result = generate_user_report(user_id, report_type)
            
        elif action == 'database_test':
            table_name = event.get('table_name', 'test-table')
            operation = event.get('operation', 'scan')
            item_id = event.get('item_id')
            
            result = database_operation(table_name, operation, item_id)
            
        elif action == 'api_test':
            url = event.get('url', 'https://httpbin.org/json')
            method = event.get('method', 'GET')
            
            result = external_api_call(url, method)
            
        else:
            # 默认操作
            with xray_recorder.in_subsegment("default_operation") as default_segment:
                default_segment.put_annotation("operation_type", "demo")
                
                # 模拟一些处理
                time.sleep(0.05)
                
                result = {
                    "message": "Demo operation completed",
                    "timestamp": time.time()
                }
                
                default_segment.put_metadata("demo_result", result)
        
        # 添加成功响应元数据
        segment.put_metadata("response", {
            "success": True,
            "result_size": len(json.dumps(result, default=str))
        })
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'result': result,
                'trace_id': segment.trace_id
            }, default=str)
        }
        
    except Exception as e:
        # 记录错误信息
        segment.put_metadata("error", {
            "error_type": type(e).__name__,
            "error_message": str(e)
        })
        
        segment.add_exception(e)
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'trace_id': segment.trace_id
            })
        }
```

### 11.3.2 CDK中启用X-Ray

```python
# stacks/xray_tracing_stack.py
from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_iam as iam,
    Duration
)
from constructs import Construct

class XRayTracingStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # 创建启用X-Ray的Lambda函数
        self.xray_function = _lambda.Function(
            self, "XRayFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/xray_tracing"),
            timeout=Duration.minutes(2),
            memory_size=512,
            tracing=_lambda.Tracing.ACTIVE,  # 启用X-Ray跟踪
            environment={
                '_X_AMZN_TRACE_ID': 'Root=1-5e6722a8-1e67750a0b28a8a32c0b58f8',
                'AWS_XRAY_TRACING_NAME': 'XRayDemoFunction',
                'AWS_XRAY_CONTEXT_MISSING': 'LOG_ERROR'
            }
        )
        
        # 添加X-Ray权限
        self.xray_function.add_to_role_policy(
            iam.PolicyStatement(
                effect=iam.Effect.ALLOW,
                actions=[
                    "xray:PutTraceSegments",
                    "xray:PutTelemetryRecords"
                ],
                resources=["*"]
            )
        )
        
        # 添加DynamoDB访问权限（用于演示）
        self.xray_function.add_to_role_policy(
            iam.PolicyStatement(
                effect=iam.Effect.ALLOW,
                actions=[
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                    "dynamodb:Scan",
                    "dynamodb:Query"
                ],
                resources=["*"]  # 在生产环境中应该限制到具体资源
            )
        )
```

## 11.4 Lambda Insights监控

### 11.4.1 启用Lambda Insights

```python
# stacks/lambda_insights_stack.py
from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    Duration
)
from constructs import Construct

class LambdaInsightsStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # Lambda Insights Layer ARN (根据区域不同)
        insights_layer_arn = f"arn:aws:lambda:{self.region}:580247275435:layer:LambdaInsightsExtension:14"
        
        # 创建启用Lambda Insights的函数
        self.insights_function = _lambda.Function(
            self, "InsightsFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda_functions/insights_demo"),
            timeout=Duration.minutes(1),
            memory_size=512,
            layers=[
                _lambda.LayerVersion.from_layer_version_arn(
                    self, "InsightsLayer",
                    layer_version_arn=insights_layer_arn
                )
            ],
            environment={
                'AWS_LAMBDA_EXEC_WRAPPER': '/opt/otel-instrument',
                'OTEL_PROPAGATORS': 'tracecontext',
                'OTEL_PYTHON_DISABLED_INSTRUMENTATIONS': 'urllib3'
            }
        )
        
        # 添加CloudWatch Insights权限
        self.insights_function.add_to_role_policy(
            iam.PolicyStatement(
                effect=iam.Effect.ALLOW,
                actions=[
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                resources=["*"]
            )
        )
```

### 11.4.2 Lambda Insights演示函数

```python
# lambda_functions/insights_demo/index.py
import json
import time
import boto3
import psutil
import os
from typing import Dict, Any
from datetime import datetime

def get_system_metrics():
    """获取系统指标"""
    try:
        # CPU使用率
        cpu_percent = psutil.cpu_percent(interval=0.1)
        
        # 内存使用情况
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        memory_used_mb = memory.used / 1024 / 1024
        
        # 进程信息
        process = psutil.Process()
        process_memory = process.memory_info()
        process_memory_mb = process_memory.rss / 1024 / 1024
        
        return {
            'cpu_percent': cpu_percent,
            'memory_percent': memory_percent,
            'memory_used_mb': memory_used_mb,
            'process_memory_mb': process_memory_mb,
            'available_memory_mb': memory.available / 1024 / 1024
        }
    except Exception as e:
        return {'error': str(e)}

def memory_intensive_operation(size_mb: int = 10):
    """内存密集型操作"""
    start_time = time.time()
    
    # 分配内存
    data = bytearray(size_mb * 1024 * 1024)
    
    # 对内存进行操作
    for i in range(0, len(data), 1024):
        data[i] = i % 256
    
    # 统计操作
    checksum = sum(data[::1024])
    
    duration = time.time() - start_time
    
    # 清理内存
    del data
    
    return {
        'size_mb': size_mb,
        'duration': duration,
        'checksum': checksum,
        'operations_per_second': size_mb / duration if duration > 0 else 0
    }

def cpu_intensive_operation(iterations: int = 100000):
    """CPU密集型操作"""
    start_time = time.time()
    
    # 执行计算密集型任务
    result = 0
    for i in range(iterations):
        result += i * i
        if i % 10000 == 0:
            # 检查CPU使用率
            cpu_percent = psutil.cpu_percent()
    
    duration = time.time() - start_time
    
    return {
        'iterations': iterations,
        'result': result,
        'duration': duration,
        'operations_per_second': iterations / duration if duration > 0 else 0
    }

def io_intensive_operation(operations: int = 10):
    """I/O密集型操作"""
    start_time = time.time()
    
    s3_client = boto3.client('s3')
    
    successful_ops = 0
    for i in range(operations):
        try:
            # 执行S3操作
            response = s3_client.list_buckets()
            successful_ops += 1
            
            # 模拟处理延迟
            time.sleep(0.01)
            
        except Exception as e:
            print(f"S3 operation {i} failed: {str(e)}")
    
    duration = time.time() - start_time
    
    return {
        'total_operations': operations,
        'successful_operations': successful_ops,
        'duration': duration,
        'operations_per_second': successful_ops / duration if duration > 0 else 0
    }

def database_operations():
    """数据库操作"""
    start_time = time.time()
    
    try:
        dynamodb = boto3.resource('dynamodb')
        
        # 模拟表操作
        operations = []
        
        # 1. 列出表
        try:
            client = boto3.client('dynamodb')
            response = client.list_tables(Limit=5)
            operations.append({
                'operation': 'list_tables',
                'success': True,
                'table_count': len(response.get('TableNames', []))
            })
        except Exception as e:
            operations.append({
                'operation': 'list_tables',
                'success': False,
                'error': str(e)
            })
        
        # 2. 模拟读取操作
        for i in range(3):
            try:
                # 这里只是模拟，实际需要存在的表
                time.sleep(0.01)  # 模拟数据库延迟
                operations.append({
                    'operation': f'read_{i}',
                    'success': True,
                    'duration_ms': 10
                })
            except Exception as e:
                operations.append({
                    'operation': f'read_{i}',
                    'success': False,
                    'error': str(e)
                })
        
        duration = time.time() - start_time
        
        return {
            'total_operations': len(operations),
            'successful_operations': sum(1 for op in operations if op['success']),
            'duration': duration,
            'operations': operations
        }
        
    except Exception as e:
        return {
            'error': str(e),
            'duration': time.time() - start_time
        }

def performance_benchmark():
    """综合性能基准测试"""
    benchmark_start = time.time()
    
    results = {
        'start_time': datetime.utcnow().isoformat(),
        'system_metrics_before': get_system_metrics(),
        'tests': {}
    }
    
    # CPU测试
    print("Running CPU intensive test...")
    results['tests']['cpu'] = cpu_intensive_operation(50000)
    results['tests']['cpu']['system_metrics_after'] = get_system_metrics()
    
    # 内存测试
    print("Running memory intensive test...")
    results['tests']['memory'] = memory_intensive_operation(20)
    results['tests']['memory']['system_metrics_after'] = get_system_metrics()
    
    # I/O测试
    print("Running I/O intensive test...")
    results['tests']['io'] = io_intensive_operation(5)
    results['tests']['io']['system_metrics_after'] = get_system_metrics()
    
    # 数据库测试
    print("Running database operations test...")
    results['tests']['database'] = database_operations()
    results['tests']['database']['system_metrics_after'] = get_system_metrics()
    
    results['total_duration'] = time.time() - benchmark_start
    results['system_metrics_final'] = get_system_metrics()
    
    return results

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Lambda Insights演示处理器"""
    
    print(f"Function: {context.function_name}")
    print(f"Memory limit: {context.memory_limit_in_mb}MB")
    print(f"Remaining time: {context.get_remaining_time_in_millis()}ms")
    
    action = event.get('action', 'benchmark')
    
    try:
        if action == 'benchmark':
            # 运行综合基准测试
            result = performance_benchmark()
        
        elif action == 'memory_test':
            size_mb = event.get('size_mb', 10)
            result = memory_intensive_operation(size_mb)
        
        elif action == 'cpu_test':
            iterations = event.get('iterations', 100000)
            result = cpu_intensive_operation(iterations)
        
        elif action == 'io_test':
            operations = event.get('operations', 10)
            result = io_intensive_operation(operations)
        
        elif action == 'db_test':
            result = database_operations()
        
        elif action == 'system_metrics':
            result = get_system_metrics()
        
        else:
            result = {'error': f'Unknown action: {action}'}
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'action': action,
                'result': result,
                'lambda_context': {
                    'function_name': context.function_name,
                    'function_version': context.function_version,
                    'memory_limit_mb': context.memory_limit_in_mb,
                    'remaining_time_ms': context.get_remaining_time_in_millis(),
                    'request_id': context.aws_request_id
                }
            }, default=str)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'action': action
            })
        }
```

## 11.5 调试技术

### 11.5.1 本地调试设置

```python
# tools/local_debugger.py
import json
import os
import sys
from typing import Dict, Any
import logging

# 添加Lambda函数路径
sys.path.append('../lambda_functions')

class LocalLambdaSimulator:
    """本地Lambda模拟器"""
    
    def __init__(self, function_name: str, memory_limit: int = 512):
        self.function_name = function_name
        self.memory_limit = memory_limit
        self.request_id = "local-" + str(int(time.time()))
        
        # 设置环境变量
        os.environ.update({
            'AWS_LAMBDA_FUNCTION_NAME': function_name,
            'AWS_LAMBDA_FUNCTION_VERSION': '1',
            'AWS_LAMBDA_FUNCTION_MEMORY_SIZE': str(memory_limit),
            'AWS_REGION': 'us-east-1',
            'AWS_DEFAULT_REGION': 'us-east-1'
        })
        
        # 配置日志
        logging.basicConfig(
            level=logging.DEBUG,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    def create_context(self, timeout_ms: int = 30000):
        """创建模拟的Lambda上下文"""
        import time
        
        class LambdaContext:
            def __init__(self, function_name: str, memory_limit: int, 
                        request_id: str, timeout_ms: int):
                self.function_name = function_name
                self.function_version = "1"
                self.invoked_function_arn = f"arn:aws:lambda:us-east-1:123456789012:function:{function_name}"
                self.memory_limit_in_mb = memory_limit
                self.aws_request_id = request_id
                self.log_group_name = f"/aws/lambda/{function_name}"
                self.log_stream_name = f"2023/01/01/[1]{request_id}"
                self.identity = None
                self.client_context = None
                
                self.start_time = time.time()
                self.timeout_ms = timeout_ms
            
            def get_remaining_time_in_millis(self):
                elapsed = (time.time() - self.start_time) * 1000
                return max(0, self.timeout_ms - elapsed)
        
        return LambdaContext(self.function_name, self.memory_limit, 
                           self.request_id, timeout_ms)
    
    def invoke_function(self, handler_module: str, event: Dict[str, Any]):
        """调用Lambda函数"""
        try:
            # 动态导入处理器模块
            module = __import__(handler_module)
            handler = getattr(module, 'handler')
            
            # 创建上下文
            context = self.create_context()
            
            print(f"Invoking function: {self.function_name}")
            print(f"Event: {json.dumps(event, indent=2)}")
            print("-" * 50)
            
            # 调用处理器
            result = handler(event, context)
            
            print("-" * 50)
            print(f"Result: {json.dumps(result, indent=2)}")
            
            return result
            
        except Exception as e:
            print(f"Error invoking function: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                'statusCode': 500,
                'body': json.dumps({'error': str(e)})
            }

def debug_lambda_function():
    """调试Lambda函数的主函数"""
    simulator = LocalLambdaSimulator("DebugFunction", 512)
    
    # 测试事件
    test_events = [
        {
            'action': 'health_check'
        },
        {
            'action': 'process_order',
            'user_id': 'user123',
            'order_data': {
                'order_id': 'order456',
                'items': [
                    {'id': 'item1', 'price': 29.99},
                    {'id': 'item2', 'price': 19.99}
                ]
            }
        },
        {
            'action': 'error_simulation',
            'error_type': 'validation_error'
        }
    ]
    
    # 执行测试
    for i, event in enumerate(test_events):
        print(f"\n{'='*20} Test {i+1} {'='*20}")
        result = simulator.invoke_function('monitoring_demo.index', event)
        print(f"Test {i+1} completed\n")

if __name__ == "__main__":
    debug_lambda_function()
```

### 11.5.2 远程调试配置

```python
# tools/remote_debugger.py
import boto3
import json
import time
from typing import Dict, Any, List

class RemoteLambdaDebugger:
    """远程Lambda调试器"""
    
    def __init__(self, function_name: str, region: str = 'us-east-1'):
        self.function_name = function_name
        self.region = region
        self.lambda_client = boto3.client('lambda', region_name=region)
        self.logs_client = boto3.client('logs', region_name=region)
    
    def invoke_and_debug(self, event: Dict[str, Any], 
                        invocation_type: str = 'RequestResponse'):
        """调用函数并收集调试信息"""
        print(f"Invoking function: {self.function_name}")
        print(f"Event: {json.dumps(event, indent=2)}")
        
        start_time = time.time()
        
        try:
            # 调用函数
            response = self.lambda_client.invoke(
                FunctionName=self.function_name,
                InvocationType=invocation_type,
                Payload=json.dumps(event)
            )
            
            invocation_time = time.time() - start_time
            
            # 解析响应
            payload = json.loads(response['Payload'].read())
            
            # 收集执行信息
            execution_info = {
                'status_code': response['StatusCode'],
                'invocation_time_ms': invocation_time * 1000,
                'log_result': response.get('LogResult'),
                'executed_version': response.get('ExecutedVersion'),
                'payload': payload
            }
            
            # 获取最新日志
            logs = self.get_recent_logs()
            execution_info['logs'] = logs
            
            # 检查错误
            if 'FunctionError' in response:
                execution_info['error_type'] = response['FunctionError']
                execution_info['error_message'] = response.get('LogResult', '')
            
            self.print_debug_info(execution_info)
            
            return execution_info
            
        except Exception as e:
            print(f"Error invoking function: {str(e)}")
            return {
                'error': str(e),
                'invocation_time_ms': (time.time() - start_time) * 1000
            }
    
    def get_recent_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """获取最近的日志"""
        try:
            log_group = f"/aws/lambda/{self.function_name}"
            
            # 获取最新的日志流
            streams_response = self.logs_client.describe_log_streams(
                logGroupName=log_group,
                orderBy='LastEventTime',
                descending=True,
                limit=1
            )
            
            if not streams_response['logStreams']:
                return []
            
            latest_stream = streams_response['logStreams'][0]['logStreamName']
            
            # 获取日志事件
            events_response = self.logs_client.get_log_events(
                logGroupName=log_group,
                logStreamName=latest_stream,
                limit=limit,
                startFromHead=False
            )
            
            return events_response['events']
            
        except Exception as e:
            print(f"Error getting logs: {str(e)}")
            return []
    
    def print_debug_info(self, execution_info: Dict[str, Any]):
        """打印调试信息"""
        print("\n" + "="*60)
        print("EXECUTION RESULTS")
        print("="*60)
        
        print(f"Status Code: {execution_info['status_code']}")
        print(f"Invocation Time: {execution_info['invocation_time_ms']:.2f}ms")
        print(f"Executed Version: {execution_info.get('executed_version', 'N/A')}")
        
        if 'error_type' in execution_info:
            print(f"Error Type: {execution_info['error_type']}")
            print(f"Error Message: {execution_info.get('error_message', 'N/A')}")
        
        print("\nPAYLOAD:")
        print(json.dumps(execution_info['payload'], indent=2))
        
        print("\nRECENT LOGS:")
        for log_event in execution_info.get('logs', [])[-10:]:  # 最后10条日志
            timestamp = time.strftime('%Y-%m-%d %H:%M:%S', 
                                    time.localtime(log_event['timestamp'] / 1000))
            print(f"[{timestamp}] {log_event['message'].strip()}")
        
        print("="*60)
    
    def monitor_function(self, duration_minutes: int = 5):
        """监控函数执行"""
        print(f"Monitoring function {self.function_name} for {duration_minutes} minutes...")
        
        end_time = time.time() + (duration_minutes * 60)
        last_log_time = time.time() - 300  # 从5分钟前开始
        
        while time.time() < end_time:
            try:
                # 获取新日志
                log_group = f"/aws/lambda/{self.function_name}"
                
                response = self.logs_client.filter_log_events(
                    logGroupName=log_group,
                    startTime=int(last_log_time * 1000),
                    limit=100
                )
                
                for event in response['events']:
                    timestamp = time.strftime('%Y-%m-%d %H:%M:%S', 
                                            time.localtime(event['timestamp'] / 1000))
                    print(f"[{timestamp}] {event['message'].strip()}")
                    last_log_time = max(last_log_time, event['timestamp'] / 1000)
                
                time.sleep(10)  # 每10秒检查一次
                
            except KeyboardInterrupt:
                print("\nMonitoring stopped by user")
                break
            except Exception as e:
                print(f"Error monitoring logs: {str(e)}")
                time.sleep(10)
    
    def run_load_test(self, event: Dict[str, Any], 
                     concurrent_invocations: int = 5, 
                     total_invocations: int = 20):
        """运行负载测试"""
        import concurrent.futures
        import threading
        
        print(f"Running load test: {concurrent_invocations} concurrent, {total_invocations} total")
        
        results = []
        
        def invoke_function():
            return self.invoke_and_debug(event, 'RequestResponse')
        
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent_invocations) as executor:
            futures = [executor.submit(invoke_function) for _ in range(total_invocations)]
            
            for future in concurrent.futures.as_completed(futures):
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    results.append({'error': str(e)})
        
        total_time = time.time() - start_time
        
        # 分析结果
        successful = sum(1 for r in results if r.get('status_code') == 200)
        failed = len(results) - successful
        
        durations = [r.get('invocation_time_ms', 0) for r in results if 'invocation_time_ms' in r]
        avg_duration = sum(durations) / len(durations) if durations else 0
        
        print(f"\nLOAD TEST RESULTS:")
        print(f"Total invocations: {total_invocations}")
        print(f"Successful: {successful}")
        print(f"Failed: {failed}")
        print(f"Total time: {total_time:.2f}s")
        print(f"Requests per second: {total_invocations / total_time:.2f}")
        print(f"Average duration: {avg_duration:.2f}ms")
        
        return {
            'total_invocations': total_invocations,
            'successful': successful,
            'failed': failed,
            'total_time': total_time,
            'rps': total_invocations / total_time,
            'avg_duration_ms': avg_duration,
            'results': results
        }

def main():
    """主调试函数"""
    debugger = RemoteLambdaDebugger("your-function-name")
    
    test_event = {
        'action': 'health_check'
    }
    
    # 单次调用测试
    debugger.invoke_and_debug(test_event)
    
    # 负载测试
    # debugger.run_load_test(test_event, concurrent_invocations=3, total_invocations=10)
    
    # 监控模式
    # debugger.monitor_function(duration_minutes=2)

if __name__ == "__main__":
    main()
```

## 11.6 常见问题故障排除

### 11.6.1 故障排除指南

```python
# tools/troubleshooter.py
import boto3
import json
import time
from typing import Dict, Any, List
from datetime import datetime, timedelta

class LambdaTroubleshooter:
    """Lambda故障排除工具"""
    
    def __init__(self, function_name: str, region: str = 'us-east-1'):
        self.function_name = function_name
        self.region = region
        self.lambda_client = boto3.client('lambda', region_name=region)
        self.logs_client = boto3.client('logs', region_name=region)
        self.cloudwatch = boto3.client('cloudwatch', region_name=region)
    
    def diagnose_function(self) -> Dict[str, Any]:
        """全面诊断Lambda函数"""
        diagnosis = {
            'function_name': self.function_name,
            'timestamp': datetime.utcnow().isoformat(),
            'issues': [],
            'recommendations': [],
            'function_config': {},
            'recent_errors': [],
            'metrics_analysis': {}
        }
        
        try:
            # 获取函数配置
            diagnosis['function_config'] = self._get_function_config()
            
            # 检查配置问题
            config_issues = self._check_configuration_issues(diagnosis['function_config'])
            diagnosis['issues'].extend(config_issues)
            
            # 获取最近的错误
            diagnosis['recent_errors'] = self._get_recent_errors()
            
            # 分析指标
            diagnosis['metrics_analysis'] = self._analyze_metrics()
            
            # 检查性能问题
            performance_issues = self._check_performance_issues(diagnosis['metrics_analysis'])
            diagnosis['issues'].extend(performance_issues)
            
            # 生成建议
            diagnosis['recommendations'] = self._generate_recommendations(diagnosis)
            
        except Exception as e:
            diagnosis['issues'].append({
                'type': 'DIAGNOSIS_ERROR',
                'severity': 'HIGH',
                'message': f"Failed to diagnose function: {str(e)}"
            })
        
        return diagnosis
    
    def _get_function_config(self) -> Dict[str, Any]:
        """获取函数配置"""
        response = self.lambda_client.get_function(FunctionName=self.function_name)
        return response['Configuration']
    
    def _check_configuration_issues(self, config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """检查配置问题"""
        issues = []
        
        # 检查超时设置
        timeout = config.get('Timeout', 3)
        if timeout < 10:
            issues.append({
                'type': 'LOW_TIMEOUT',
                'severity': 'MEDIUM',
                'message': f"Timeout is very low ({timeout}s). Consider increasing for better reliability.",
                'current_value': timeout,
                'suggested_value': 30
            })
        elif timeout > 600:
            issues.append({
                'type': 'HIGH_TIMEOUT',
                'severity': 'LOW',
                'message': f"Timeout is very high ({timeout}s). Consider reducing to avoid long-running processes.",
                'current_value': timeout,
                'suggested_value': 300
            })
        
        # 检查内存设置
        memory = config.get('MemorySize', 128)
        if memory < 256:
            issues.append({
                'type': 'LOW_MEMORY',
                'severity': 'MEDIUM',
                'message': f"Memory allocation is low ({memory}MB). This may cause performance issues.",
                'current_value': memory,
                'suggested_value': 512
            })
        
        # 检查运行时版本
        runtime = config.get('Runtime', '')
        deprecated_runtimes = ['python2.7', 'python3.6', 'nodejs8.10', 'nodejs10.x']
        if runtime in deprecated_runtimes:
            issues.append({
                'type': 'DEPRECATED_RUNTIME',
                'severity': 'HIGH',
                'message': f"Runtime {runtime} is deprecated. Update to a supported version.",
                'current_value': runtime,
                'suggested_value': 'python3.9' if 'python' in runtime else 'nodejs14.x'
            })
        
        # 检查环境变量大小
        env_vars = config.get('Environment', {}).get('Variables', {})
        env_size = len(json.dumps(env_vars))
        if env_size > 3000:  # 接近4KB限制
            issues.append({
                'type': 'LARGE_ENV_VARS',
                'severity': 'MEDIUM',
                'message': f"Environment variables are large ({env_size} bytes). Consider using Parameter Store.",
                'current_value': env_size,
                'limit': 4096
            })
        
        # 检查预留并发
        reserved_concurrency = config.get('ReservedConcurrencyConfig')
        if reserved_concurrency:
            reserved = reserved_concurrency.get('ReservedConcurrencyConfig', 0)
            if reserved < 5:
                issues.append({
                    'type': 'LOW_RESERVED_CONCURRENCY',
                    'severity': 'MEDIUM',
                    'message': f"Reserved concurrency is very low ({reserved}). This may cause throttling.",
                    'current_value': reserved
                })
        
        return issues
    
    def _get_recent_errors(self, hours: int = 24) -> List[Dict[str, Any]]:
        """获取最近的错误"""
        try:
            log_group = f"/aws/lambda/{self.function_name}"
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(hours=hours)
            
            response = self.logs_client.filter_log_events(
                logGroupName=log_group,
                startTime=int(start_time.timestamp() * 1000),
                endTime=int(end_time.timestamp() * 1000),
                filterPattern="ERROR",
                limit=100
            )
            
            errors = []
            for event in response['events']:
                errors.append({
                    'timestamp': datetime.fromtimestamp(event['timestamp'] / 1000).isoformat(),
                    'message': event['message'].strip()
                })
            
            return errors
            
        except Exception as e:
            return [{'error': f"Failed to get error logs: {str(e)}"}]
    
    def _analyze_metrics(self, hours: int = 24) -> Dict[str, Any]:
        """分析函数指标"""
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        metrics = {}
        
        # 获取各种指标
        metric_queries = [
            ('Invocations', 'Sum'),
            ('Errors', 'Sum'),
            ('Throttles', 'Sum'),
            ('Duration', 'Average'),
            ('Duration', 'Maximum'),
            ('ConcurrentExecutions', 'Maximum')
        ]
        
        for metric_name, statistic in metric_queries:
            try:
                response = self.cloudwatch.get_metric_statistics(
                    Namespace='AWS/Lambda',
                    MetricName=metric_name,
                    Dimensions=[
                        {
                            'Name': 'FunctionName',
                            'Value': self.function_name
                        }
                    ],
                    StartTime=start_time,
                    EndTime=end_time,
                    Period=3600,  # 1小时间隔
                    Statistics=[statistic]
                )
                
                datapoints = response['Datapoints']
                if datapoints:
                    key = f"{metric_name}_{statistic}".lower()
                    metrics[key] = {
                        'latest_value': datapoints[-1][statistic],
                        'average': sum(dp[statistic] for dp in datapoints) / len(datapoints),
                        'datapoints': len(datapoints)
                    }
                
            except Exception as e:
                metrics[f"{metric_name}_error"] = str(e)
        
        return metrics
    
    def _check_performance_issues(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """检查性能问题"""
        issues = []
        
        # 检查错误率
        invocations = metrics.get('invocations_sum', {}).get('latest_value', 0)
        errors = metrics.get('errors_sum', {}).get('latest_value', 0)
        
        if invocations > 0:
            error_rate = (errors / invocations) * 100
            if error_rate > 5:
                issues.append({
                    'type': 'HIGH_ERROR_RATE',
                    'severity': 'HIGH',
                    'message': f"High error rate: {error_rate:.2f}%",
                    'current_value': error_rate,
                    'threshold': 5
                })
        
        # 检查节流
        throttles = metrics.get('throttles_sum', {}).get('latest_value', 0)
        if throttles > 0:
            issues.append({
                'type': 'THROTTLING_DETECTED',
                'severity': 'HIGH',
                'message': f"Function is being throttled ({throttles} throttles detected)",
                'current_value': throttles
            })
        
        # 检查平均持续时间
        avg_duration = metrics.get('duration_average', {}).get('average', 0)
        if avg_duration > 10000:  # 10秒
            issues.append({
                'type': 'SLOW_EXECUTION',
                'severity': 'MEDIUM',
                'message': f"Average execution time is high ({avg_duration:.0f}ms)",
                'current_value': avg_duration,
                'threshold': 10000
            })
        
        # 检查最大持续时间
        max_duration = metrics.get('duration_maximum', {}).get('latest_value', 0)
        function_config = self._get_function_config()
        timeout_ms = function_config.get('Timeout', 3) * 1000
        
        if max_duration > (timeout_ms * 0.9):
            issues.append({
                'type': 'NEAR_TIMEOUT',
                'severity': 'HIGH',
                'message': f"Function execution approaching timeout ({max_duration:.0f}ms of {timeout_ms}ms)",
                'current_value': max_duration,
                'timeout': timeout_ms
            })
        
        return issues
    
    def _generate_recommendations(self, diagnosis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """生成改进建议"""
        recommendations = []
        issues = diagnosis['issues']
        
        # 基于问题生成建议
        for issue in issues:
            if issue['type'] == 'LOW_TIMEOUT':
                recommendations.append({
                    'category': 'CONFIGURATION',
                    'action': 'INCREASE_TIMEOUT',
                    'description': 'Increase function timeout to prevent premature termination',
                    'priority': 'MEDIUM'
                })
            
            elif issue['type'] == 'LOW_MEMORY':
                recommendations.append({
                    'category': 'PERFORMANCE',
                    'action': 'INCREASE_MEMORY',
                    'description': 'Increase memory allocation to improve performance and get more CPU',
                    'priority': 'MEDIUM'
                })
            
            elif issue['type'] == 'HIGH_ERROR_RATE':
                recommendations.append({
                    'category': 'RELIABILITY',
                    'action': 'INVESTIGATE_ERRORS',
                    'description': 'Review error logs and implement proper error handling',
                    'priority': 'HIGH'
                })
            
            elif issue['type'] == 'THROTTLING_DETECTED':
                recommendations.append({
                    'category': 'SCALING',
                    'action': 'INCREASE_CONCURRENCY',
                    'description': 'Increase reserved concurrency or optimize function performance',
                    'priority': 'HIGH'
                })
            
            elif issue['type'] == 'DEPRECATED_RUNTIME':
                recommendations.append({
                    'category': 'SECURITY',
                    'action': 'UPDATE_RUNTIME',
                    'description': 'Update to a supported runtime version',
                    'priority': 'HIGH'
                })
        
        # 通用建议
        recommendations.extend([
            {
                'category': 'MONITORING',
                'action': 'ENABLE_XRAY',
                'description': 'Enable X-Ray tracing for better debugging capabilities',
                'priority': 'LOW'
            },
            {
                'category': 'MONITORING',
                'action': 'SETUP_ALERTS',
                'description': 'Set up CloudWatch alarms for error rate and duration',
                'priority': 'MEDIUM'
            },
            {
                'category': 'OPTIMIZATION',
                'action': 'REVIEW_DEPENDENCIES',
                'description': 'Review and optimize function dependencies to reduce cold start time',
                'priority': 'LOW'
            }
        ])
        
        return recommendations
    
    def print_diagnosis_report(self, diagnosis: Dict[str, Any]):
        """打印诊断报告"""
        print(f"\n{'='*60}")
        print(f"LAMBDA FUNCTION DIAGNOSIS REPORT")
        print(f"{'='*60}")
        print(f"Function: {diagnosis['function_name']}")
        print(f"Generated: {diagnosis['timestamp']}")
        
        # 函数配置
        config = diagnosis['function_config']
        print(f"\nFUNCTION CONFIGURATION:")
        print(f"  Runtime: {config.get('Runtime')}")
        print(f"  Memory: {config.get('MemorySize')}MB")
        print(f"  Timeout: {config.get('Timeout')}s")
        print(f"  Handler: {config.get('Handler')}")
        
        # 问题列表
        issues = diagnosis['issues']
        if issues:
            print(f"\nISSUES FOUND ({len(issues)}):")
            for i, issue in enumerate(issues, 1):
                severity_icon = {"HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🟢"}.get(issue['severity'], "⚪")
                print(f"  {i}. {severity_icon} [{issue['severity']}] {issue['type']}")
                print(f"     {issue['message']}")
        else:
            print(f"\n✅ No issues found!")
        
        # 最近的错误
        errors = diagnosis['recent_errors']
        if errors:
            print(f"\nRECENT ERRORS ({len(errors)} in last 24h):")
            for error in errors[-5:]:  # 显示最后5个错误
                print(f"  • {error.get('timestamp', 'Unknown')}: {error.get('message', error)[:100]}...")
        
        # 建议
        recommendations = diagnosis['recommendations']
        if recommendations:
            print(f"\nRECOMMENDations:")
            high_priority = [r for r in recommendations if r['priority'] == 'HIGH']
            medium_priority = [r for r in recommendations if r['priority'] == 'MEDIUM']
            
            if high_priority:
                print("  High Priority:")
                for rec in high_priority:
                    print(f"    🔴 {rec['action']}: {rec['description']}")
            
            if medium_priority:
                print("  Medium Priority:")
                for rec in medium_priority[:3]:  # 显示前3个
                    print(f"    🟡 {rec['action']}: {rec['description']}")
        
        print(f"\n{'='*60}")

def main():
    """主诊断函数"""
    function_name = input("Enter Lambda function name: ").strip()
    
    troubleshooter = LambdaTroubleshooter(function_name)
    diagnosis = troubleshooter.diagnose_function()
    troubleshooter.print_diagnosis_report(diagnosis)
    
    # 保存报告
    with open(f"{function_name}_diagnosis.json", 'w') as f:
        json.dump(diagnosis, f, indent=2, default=str)
    
    print(f"\nDiagnosis report saved to {function_name}_diagnosis.json")

if __name__ == "__main__":
    main()
```

## 11.7 章节总结

::: tip 关键要点
**监控策略**：
- 使用CloudWatch指标监控基础性能
- 实施结构化日志记录提高可观测性
- 利用X-Ray进行分布式跟踪
- 启用Lambda Insights获得深入洞察

**调试技术**：
- 本地模拟器加速开发调试
- 远程调试工具诊断生产问题
- 系统化的故障排除方法

**最佳实践**：
- 建立完整的监控仪表板
- 设置合适的告警阈值
- 定期进行性能分析
- 维护故障排除手册
:::

有效的监控和调试是Lambda应用成功的关键。通过本章学到的技术，您可以快速识别和解决生产环境中的问题，确保应用的高可用性和性能。

在下一章中，我们将学习Lambda的安全与合规，包括权限管理、数据加密、安全审计等重要主题。

## 扩展阅读

- [CloudWatch Lambda监控](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-functions.html)
- [X-Ray分布式跟踪](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html)
- [Lambda Insights监控](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights.html)
- [Lambda故障排除指南](https://docs.aws.amazon.com/lambda/latest/dg/troubleshooting.html)