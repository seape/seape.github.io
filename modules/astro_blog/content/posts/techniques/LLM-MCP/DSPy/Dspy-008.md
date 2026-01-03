---
title: "第08章：DSPy 与语言模型集成"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第08章：DSPy 与语言模型集成

::: tip 学习目标
- 配置不同的语言模型后端
- 学习OpenAI、Claude、本地模型的集成
- 实现多模型协作和切换
- 掌握模型配置和参数调优
- 理解模型选择策略
:::

## 知识点

### 1. 语言模型后端配置

DSPy支持多种语言模型后端，提供统一的接口来使用不同的模型服务。

#### 基础模型配置

```python
import dspy
import os
from typing import Dict, Any, List, Optional, Union, Callable
import json
import time
import asyncio
from abc import ABC, abstractmethod

class BaseModelConfig:
    """基础模型配置类"""
    
    def __init__(self, 
                 model_name: str,
                 api_key: str = None,
                 api_base: str = None,
                 max_tokens: int = 1000,
                 temperature: float = 0.7,
                 **kwargs):
        
        self.model_name = model_name
        self.api_key = api_key
        self.api_base = api_base
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.additional_params = kwargs
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            'model_name': self.model_name,
            'api_key': self.api_key,
            'api_base': self.api_base,
            'max_tokens': self.max_tokens,
            'temperature': self.temperature,
            **self.additional_params
        }

class ModelConfigManager:
    """模型配置管理器"""
    
    def __init__(self):
        self.configs = {}
        self.active_models = {}
        self.model_metrics = {}
    
    def add_openai_config(self, 
                         config_name: str,
                         model_name: str = "gpt-3.5-turbo",
                         api_key: str = None,
                         **kwargs) -> BaseModelConfig:
        """添加OpenAI配置"""
        
        if not api_key:
            api_key = os.getenv('OPENAI_API_KEY')
        
        if not api_key:
            raise ValueError("需要提供OpenAI API密钥")
        
        config = BaseModelConfig(
            model_name=model_name,
            api_key=api_key,
            api_base=kwargs.get('api_base', 'https://api.openai.com/v1'),
            **kwargs
        )
        
        self.configs[config_name] = {
            'type': 'openai',
            'config': config,
            'status': 'configured'
        }
        
        print(f"✅ 已配置OpenAI模型: {config_name} ({model_name})")
        return config
    
    def add_anthropic_config(self,
                            config_name: str,
                            model_name: str = "claude-3-sonnet-20240229",
                            api_key: str = None,
                            **kwargs) -> BaseModelConfig:
        """添加Anthropic(Claude)配置"""
        
        if not api_key:
            api_key = os.getenv('ANTHROPIC_API_KEY')
        
        if not api_key:
            raise ValueError("需要提供Anthropic API密钥")
        
        config = BaseModelConfig(
            model_name=model_name,
            api_key=api_key,
            api_base=kwargs.get('api_base', 'https://api.anthropic.com'),
            **kwargs
        )
        
        self.configs[config_name] = {
            'type': 'anthropic',
            'config': config,
            'status': 'configured'
        }
        
        print(f"✅ 已配置Anthropic模型: {config_name} ({model_name})")
        return config
    
    def add_local_model_config(self,
                              config_name: str,
                              model_path: str,
                              model_type: str = "huggingface",
                              **kwargs) -> BaseModelConfig:
        """添加本地模型配置"""
        
        config = BaseModelConfig(
            model_name=model_path,
            api_base="local",
            model_type=model_type,
            **kwargs
        )
        
        self.configs[config_name] = {
            'type': 'local',
            'config': config,
            'status': 'configured'
        }
        
        print(f"✅ 已配置本地模型: {config_name} ({model_path})")
        return config
    
    def initialize_model(self, config_name: str) -> dspy.LM:
        """初始化模型"""
        
        if config_name not in self.configs:
            raise ValueError(f"配置 {config_name} 不存在")
        
        config_info = self.configs[config_name]
        config = config_info['config']
        model_type = config_info['type']
        
        try:
            if model_type == 'openai':
                model = dspy.OpenAI(
                    model=config.model_name,
                    api_key=config.api_key,
                    api_base=config.api_base,
                    max_tokens=config.max_tokens,
                    temperature=config.temperature
                )
            
            elif model_type == 'anthropic':
                # 注意：实际使用时需要确保DSPy支持Anthropic
                model = self.create_anthropic_model(config)
            
            elif model_type == 'local':
                model = self.create_local_model(config)
            
            else:
                raise ValueError(f"不支持的模型类型: {model_type}")
            
            self.active_models[config_name] = model
            self.configs[config_name]['status'] = 'active'
            
            print(f"🚀 模型已激活: {config_name}")
            return model
            
        except Exception as e:
            self.configs[config_name]['status'] = 'failed'
            print(f"❌ 模型初始化失败: {config_name} - {str(e)}")
            raise
    
    def create_anthropic_model(self, config: BaseModelConfig):
        """创建Anthropic模型（自定义实现）"""
        
        class AnthropicModel(dspy.LM):
            def __init__(self, config):
                self.config = config
                self.history = []
            
            def basic_request(self, prompt: str, **kwargs):
                # 这里需要实际的Anthropic API调用
                # 为了演示，返回模拟响应
                return [f"模拟Anthropic响应: {prompt[:50]}..."]
            
            def __call__(self, prompt, **kwargs):
                return self.basic_request(prompt, **kwargs)
        
        return AnthropicModel(config)
    
    def create_local_model(self, config: BaseModelConfig):
        """创建本地模型"""
        
        class LocalModel(dspy.LM):
            def __init__(self, config):
                self.config = config
                self.model = None
                self.tokenizer = None
                self._load_model()
            
            def _load_model(self):
                # 模拟本地模型加载
                print(f"📥 加载本地模型: {self.config.model_name}")
                # 实际实现中需要加载真实模型
                pass
            
            def basic_request(self, prompt: str, **kwargs):
                # 模拟本地模型推理
                return [f"本地模型响应: {prompt[:30]}..."]
            
            def __call__(self, prompt, **kwargs):
                return self.basic_request(prompt, **kwargs)
        
        return LocalModel(config)
    
    def get_model(self, config_name: str) -> dspy.LM:
        """获取模型实例"""
        if config_name not in self.active_models:
            return self.initialize_model(config_name)
        
        return self.active_models[config_name]
    
    def list_configs(self) -> Dict[str, Dict]:
        """列出所有配置"""
        return {
            name: {
                'type': info['type'],
                'status': info['status'],
                'model_name': info['config'].model_name
            }
            for name, info in self.configs.items()
        }
    
    def switch_default_model(self, config_name: str):
        """切换默认模型"""
        model = self.get_model(config_name)
        dspy.settings.configure(lm=model)
        print(f"🔄 已切换默认模型为: {config_name}")

# 使用示例
def demonstrate_model_configuration():
    """演示模型配置"""
    
    config_manager = ModelConfigManager()
    
    # 配置多个模型
    try:
        # OpenAI配置
        config_manager.add_openai_config(
            "gpt-3.5",
            model_name="gpt-3.5-turbo",
            temperature=0.5,
            max_tokens=500
        )
        
        config_manager.add_openai_config(
            "gpt-4",
            model_name="gpt-4",
            temperature=0.3,
            max_tokens=1000
        )
        
        # Anthropic配置
        config_manager.add_anthropic_config(
            "claude-3-sonnet",
            model_name="claude-3-sonnet-20240229"
        )
        
        # 本地模型配置
        config_manager.add_local_model_config(
            "local-llama",
            model_path="/path/to/llama-model"
        )
        
    except ValueError as e:
        print(f"⚠️ 配置跳过（缺少API密钥）: {e}")
    
    # 列出配置
    configs = config_manager.list_configs()
    print(f"\n📋 已配置的模型:")
    for name, info in configs.items():
        print(f"  {name}: {info['type']} - {info['model_name']} ({info['status']})")
    
    return config_manager

# demo_config_manager = demonstrate_model_configuration()
```

### 2. 多模型协作策略

在复杂应用中，往往需要多个模型协作完成任务。

```python
class MultiModelOrchestrator:
    """多模型协调器"""
    
    def __init__(self, config_manager: ModelConfigManager):
        self.config_manager = config_manager
        self.model_capabilities = {}
        self.routing_rules = {}
        self.fallback_chains = {}
    
    def define_model_capabilities(self, 
                                 config_name: str, 
                                 capabilities: List[str],
                                 strengths: Dict[str, float] = None,
                                 cost_per_token: float = 0.0):
        """定义模型能力"""
        
        self.model_capabilities[config_name] = {
            'capabilities': capabilities,
            'strengths': strengths or {},
            'cost_per_token': cost_per_token,
            'usage_stats': {
                'total_requests': 0,
                'successful_requests': 0,
                'avg_response_time': 0.0,
                'total_cost': 0.0
            }
        }
        
        print(f"📝 已定义模型能力: {config_name}")
        print(f"   能力: {', '.join(capabilities)}")
    
    def add_routing_rule(self, 
                        task_type: str, 
                        model_selector: Callable[[Dict], str]):
        """添加路由规则"""
        
        self.routing_rules[task_type] = model_selector
        print(f"🛤️ 已添加路由规则: {task_type}")
    
    def set_fallback_chain(self, 
                          primary_model: str, 
                          fallback_models: List[str]):
        """设置失败回退链"""
        
        self.fallback_chains[primary_model] = fallback_models
        print(f"🔄 已设置回退链: {primary_model} -> {fallback_models}")
    
    def route_request(self, 
                     task_type: str, 
                     context: Dict[str, Any] = None) -> str:
        """路由请求到合适的模型"""
        
        if task_type in self.routing_rules:
            selected_model = self.routing_rules[task_type](context or {})
            print(f"🎯 任务路由: {task_type} -> {selected_model}")
            return selected_model
        
        # 默认路由逻辑
        return self.default_model_selection(task_type, context)
    
    def default_model_selection(self, 
                               task_type: str, 
                               context: Dict[str, Any]) -> str:
        """默认模型选择逻辑"""
        
        # 基于能力匹配
        suitable_models = []
        
        for model_name, info in self.model_capabilities.items():
            if task_type in info['capabilities']:
                strength = info['strengths'].get(task_type, 0.5)
                cost = info['cost_per_token']
                
                # 计算综合得分（可以根据需要调整权重）
                score = strength * 0.7 - cost * 0.3
                
                suitable_models.append((model_name, score))
        
        if suitable_models:
            # 选择得分最高的模型
            selected_model = max(suitable_models, key=lambda x: x[1])[0]
            return selected_model
        
        # 如果没有合适的模型，返回第一个可用模型
        available_models = list(self.model_capabilities.keys())
        return available_models[0] if available_models else "default"
    
    def execute_with_fallback(self, 
                             model_name: str, 
                             task_func: Callable,
                             *args, **kwargs) -> Dict[str, Any]:
        """执行任务，支持失败回退"""
        
        models_to_try = [model_name]
        
        # 添加回退模型
        if model_name in self.fallback_chains:
            models_to_try.extend(self.fallback_chains[model_name])
        
        last_error = None
        
        for attempt, current_model in enumerate(models_to_try):
            try:
                print(f"🔄 尝试模型: {current_model} (尝试 {attempt + 1})")
                
                # 获取模型实例
                model = self.config_manager.get_model(current_model)
                
                # 设置模型并执行任务
                dspy.settings.configure(lm=model)
                start_time = time.time()
                
                result = task_func(*args, **kwargs)
                
                execution_time = time.time() - start_time
                
                # 更新统计信息
                self.update_usage_stats(current_model, True, execution_time)
                
                return {
                    'result': result,
                    'model_used': current_model,
                    'attempt': attempt + 1,
                    'execution_time': execution_time,
                    'success': True
                }
                
            except Exception as e:
                last_error = e
                print(f"❌ 模型 {current_model} 执行失败: {str(e)}")
                
                # 更新统计信息
                self.update_usage_stats(current_model, False, 0.0)
                
                if attempt < len(models_to_try) - 1:
                    print(f"⏭️ 尝试下一个模型...")
                    continue
                else:
                    print(f"🚨 所有模型都失败了")
                    break
        
        return {
            'result': None,
            'model_used': None,
            'attempt': len(models_to_try),
            'error': str(last_error),
            'success': False
        }
    
    def update_usage_stats(self, 
                          model_name: str, 
                          success: bool, 
                          execution_time: float):
        """更新使用统计"""
        
        if model_name not in self.model_capabilities:
            return
        
        stats = self.model_capabilities[model_name]['usage_stats']
        
        stats['total_requests'] += 1
        if success:
            stats['successful_requests'] += 1
        
        # 更新平均响应时间
        if stats['total_requests'] > 1:
            current_avg = stats['avg_response_time']
            stats['avg_response_time'] = (
                (current_avg * (stats['total_requests'] - 1) + execution_time) 
                / stats['total_requests']
            )
        else:
            stats['avg_response_time'] = execution_time
    
    def get_performance_report(self) -> Dict[str, Any]:
        """获取性能报告"""
        
        report = {
            'models': {},
            'summary': {
                'total_requests': 0,
                'total_successful': 0,
                'avg_success_rate': 0.0
            }
        }
        
        total_requests = 0
        total_successful = 0
        
        for model_name, info in self.model_capabilities.items():
            stats = info['usage_stats']
            
            success_rate = (
                stats['successful_requests'] / stats['total_requests'] 
                if stats['total_requests'] > 0 else 0.0
            )
            
            report['models'][model_name] = {
                'total_requests': stats['total_requests'],
                'success_rate': success_rate,
                'avg_response_time': stats['avg_response_time'],
                'total_cost': stats['total_cost']
            }
            
            total_requests += stats['total_requests']
            total_successful += stats['successful_requests']
        
        if total_requests > 0:
            report['summary']['total_requests'] = total_requests
            report['summary']['total_successful'] = total_successful
            report['summary']['avg_success_rate'] = total_successful / total_requests
        
        return report

class SpecializedModelEnsemble:
    """专门化模型集成"""
    
    def __init__(self, orchestrator: MultiModelOrchestrator):
        self.orchestrator = orchestrator
        
        # 定义专门化模型
        self.setup_specialized_models()
    
    def setup_specialized_models(self):
        """设置专门化模型"""
        
        # 定义模型能力
        self.orchestrator.define_model_capabilities(
            "gpt-4",
            capabilities=["reasoning", "analysis", "complex_questions"],
            strengths={"reasoning": 0.9, "analysis": 0.85, "complex_questions": 0.9},
            cost_per_token=0.03
        )
        
        self.orchestrator.define_model_capabilities(
            "gpt-3.5",
            capabilities=["general", "summarization", "simple_questions"],
            strengths={"general": 0.8, "summarization": 0.85, "simple_questions": 0.8},
            cost_per_token=0.002
        )
        
        self.orchestrator.define_model_capabilities(
            "claude-3-sonnet",
            capabilities=["creative_writing", "analysis", "long_context"],
            strengths={"creative_writing": 0.9, "analysis": 0.85, "long_context": 0.95},
            cost_per_token=0.015
        )
        
        # 设置路由规则
        self.orchestrator.add_routing_rule(
            "complex_reasoning",
            lambda ctx: self.select_reasoning_model(ctx)
        )
        
        self.orchestrator.add_routing_rule(
            "text_generation",
            lambda ctx: self.select_generation_model(ctx)
        )
        
        # 设置回退链
        self.orchestrator.set_fallback_chain("gpt-4", ["claude-3-sonnet", "gpt-3.5"])
        self.orchestrator.set_fallback_chain("claude-3-sonnet", ["gpt-4", "gpt-3.5"])
    
    def select_reasoning_model(self, context: Dict[str, Any]) -> str:
        """选择推理模型"""
        
        complexity = context.get('complexity', 'medium')
        budget = context.get('budget', 'medium')
        
        if complexity == 'high' and budget == 'high':
            return "gpt-4"
        elif complexity == 'high' and budget == 'medium':
            return "claude-3-sonnet"
        else:
            return "gpt-3.5"
    
    def select_generation_model(self, context: Dict[str, Any]) -> str:
        """选择生成模型"""
        
        text_type = context.get('text_type', 'general')
        length = context.get('length', 'medium')
        
        if text_type == 'creative' or length == 'long':
            return "claude-3-sonnet"
        elif text_type == 'technical':
            return "gpt-4"
        else:
            return "gpt-3.5"

# 使用示例
def demonstrate_multi_model_orchestration():
    """演示多模型协调"""
    
    # 假设已有配置管理器
    config_manager = ModelConfigManager()
    
    # 添加一些模拟配置（在实际使用中需要真实的API密钥）
    try:
        config_manager.add_openai_config("gpt-4", "gpt-4")
        config_manager.add_openai_config("gpt-3.5", "gpt-3.5-turbo")
        config_manager.add_anthropic_config("claude-3-sonnet")
    except ValueError:
        print("⚠️ 跳过实际模型配置（演示模式）")
    
    # 创建协调器和集成
    orchestrator = MultiModelOrchestrator(config_manager)
    ensemble = SpecializedModelEnsemble(orchestrator)
    
    # 测试任务路由
    test_contexts = [
        {
            'task_type': 'complex_reasoning',
            'context': {'complexity': 'high', 'budget': 'high'}
        },
        {
            'task_type': 'text_generation',
            'context': {'text_type': 'creative', 'length': 'long'}
        }
    ]
    
    for test in test_contexts:
        selected_model = orchestrator.route_request(
            test['task_type'], 
            test['context']
        )
        
        print(f"任务类型: {test['task_type']}")
        print(f"上下文: {test['context']}")
        print(f"选择模型: {selected_model}\n")
    
    return orchestrator, ensemble

# demo_orchestration = demonstrate_multi_model_orchestration()
```

### 3. 模型性能监控和优化

为了确保模型的高效使用，需要实施全面的性能监控。

```python
class ModelPerformanceMonitor:
    """模型性能监控器"""
    
    def __init__(self):
        self.metrics = {}
        self.alerts = {}
        self.thresholds = {
            'response_time': 5.0,  # 5秒
            'error_rate': 0.05,    # 5%
            'cost_per_request': 0.1  # $0.1
        }
    
    def track_request(self, 
                     model_name: str,
                     request_info: Dict[str, Any]):
        """跟踪单个请求"""
        
        if model_name not in self.metrics:
            self.metrics[model_name] = {
                'requests': [],
                'hourly_stats': {},
                'daily_stats': {}
            }
        
        # 添加时间戳
        request_info['timestamp'] = time.time()
        
        self.metrics[model_name]['requests'].append(request_info)
        
        # 检查告警条件
        self.check_alerts(model_name, request_info)
    
    def check_alerts(self, model_name: str, request_info: Dict[str, Any]):
        """检查告警条件"""
        
        # 响应时间告警
        if request_info.get('response_time', 0) > self.thresholds['response_time']:
            self.trigger_alert(
                model_name, 
                'high_response_time',
                f"响应时间过长: {request_info['response_time']:.2f}s"
            )
        
        # 错误率告警
        recent_requests = self.get_recent_requests(model_name, minutes=10)
        if recent_requests:
            error_rate = sum(1 for r in recent_requests if not r.get('success', True)) / len(recent_requests)
            if error_rate > self.thresholds['error_rate']:
                self.trigger_alert(
                    model_name,
                    'high_error_rate',
                    f"错误率过高: {error_rate:.1%}"
                )
    
    def trigger_alert(self, model_name: str, alert_type: str, message: str):
        """触发告警"""
        
        alert_key = f"{model_name}_{alert_type}"
        current_time = time.time()
        
        # 避免重复告警（5分钟内不重复）
        if alert_key in self.alerts:
            last_alert_time = self.alerts[alert_key]['last_triggered']
            if current_time - last_alert_time < 300:  # 5分钟
                return
        
        self.alerts[alert_key] = {
            'model_name': model_name,
            'alert_type': alert_type,
            'message': message,
            'last_triggered': current_time
        }
        
        print(f"🚨 告警: {model_name} - {message}")
    
    def get_recent_requests(self, model_name: str, minutes: int = 60) -> List[Dict]:
        """获取最近的请求记录"""
        
        if model_name not in self.metrics:
            return []
        
        cutoff_time = time.time() - (minutes * 60)
        recent_requests = [
            req for req in self.metrics[model_name]['requests']
            if req['timestamp'] > cutoff_time
        ]
        
        return recent_requests
    
    def calculate_model_statistics(self, model_name: str, hours: int = 24) -> Dict[str, Any]:
        """计算模型统计信息"""
        
        recent_requests = self.get_recent_requests(model_name, minutes=hours * 60)
        
        if not recent_requests:
            return {'status': 'no_data'}
        
        # 基础统计
        total_requests = len(recent_requests)
        successful_requests = sum(1 for r in recent_requests if r.get('success', True))
        failed_requests = total_requests - successful_requests
        
        # 响应时间统计
        response_times = [r.get('response_time', 0) for r in recent_requests if 'response_time' in r]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        # 成本统计
        total_cost = sum(r.get('cost', 0) for r in recent_requests)
        avg_cost_per_request = total_cost / total_requests if total_requests > 0 else 0
        
        # 令牌统计
        total_tokens = sum(r.get('tokens_used', 0) for r in recent_requests)
        avg_tokens_per_request = total_tokens / total_requests if total_requests > 0 else 0
        
        return {
            'status': 'active',
            'time_window_hours': hours,
            'total_requests': total_requests,
            'successful_requests': successful_requests,
            'failed_requests': failed_requests,
            'success_rate': successful_requests / total_requests if total_requests > 0 else 0,
            'avg_response_time': avg_response_time,
            'total_cost': total_cost,
            'avg_cost_per_request': avg_cost_per_request,
            'total_tokens': total_tokens,
            'avg_tokens_per_request': avg_tokens_per_request
        }
    
    def generate_performance_report(self, model_names: List[str] = None) -> str:
        """生成性能报告"""
        
        if model_names is None:
            model_names = list(self.metrics.keys())
        
        report_lines = []
        report_lines.append("📊 模型性能监控报告")
        report_lines.append("=" * 50)
        
        for model_name in model_names:
            stats = self.calculate_model_statistics(model_name)
            
            if stats['status'] == 'no_data':
                report_lines.append(f"\n🔍 {model_name}: 无数据")
                continue
            
            report_lines.append(f"\n🤖 {model_name}:")
            report_lines.append(f"   请求总数: {stats['total_requests']}")
            report_lines.append(f"   成功率: {stats['success_rate']:.1%}")
            report_lines.append(f"   平均响应时间: {stats['avg_response_time']:.2f}s")
            report_lines.append(f"   总成本: ${stats['total_cost']:.4f}")
            report_lines.append(f"   平均单次成本: ${stats['avg_cost_per_request']:.4f}")
            report_lines.append(f"   平均令牌数: {stats['avg_tokens_per_request']:.0f}")
        
        # 添加活跃告警
        if self.alerts:
            report_lines.append(f"\n🚨 活跃告警:")
            for alert_key, alert_info in self.alerts.items():
                report_lines.append(f"   {alert_info['model_name']}: {alert_info['message']}")
        
        return "\n".join(report_lines)

class AdaptiveModelSelector:
    """自适应模型选择器"""
    
    def __init__(self, 
                 monitor: ModelPerformanceMonitor,
                 orchestrator: MultiModelOrchestrator):
        
        self.monitor = monitor
        self.orchestrator = orchestrator
        self.selection_history = []
        self.learning_rate = 0.1
    
    def select_optimal_model(self, 
                           task_type: str, 
                           context: Dict[str, Any]) -> str:
        """基于历史性能选择最优模型"""
        
        # 获取候选模型
        candidate_models = self.get_candidate_models(task_type)
        
        if not candidate_models:
            return "gpt-3.5"  # 默认模型
        
        # 计算每个模型的综合得分
        model_scores = {}
        
        for model_name in candidate_models:
            score = self.calculate_model_score(model_name, context)
            model_scores[model_name] = score
        
        # 选择得分最高的模型
        best_model = max(model_scores, key=model_scores.get)
        
        # 记录选择历史
        selection_record = {
            'timestamp': time.time(),
            'task_type': task_type,
            'context': context,
            'selected_model': best_model,
            'candidate_models': candidate_models,
            'model_scores': model_scores
        }
        
        self.selection_history.append(selection_record)
        
        print(f"🎯 自适应选择: {task_type} -> {best_model}")
        print(f"   候选模型得分: {model_scores}")
        
        return best_model
    
    def get_candidate_models(self, task_type: str) -> List[str]:
        """获取任务类型的候选模型"""
        
        candidate_models = []
        
        for model_name, info in self.orchestrator.model_capabilities.items():
            if task_type in info['capabilities']:
                candidate_models.append(model_name)
        
        return candidate_models
    
    def calculate_model_score(self, 
                             model_name: str, 
                             context: Dict[str, Any]) -> float:
        """计算模型综合得分"""
        
        # 获取历史性能统计
        stats = self.monitor.calculate_model_statistics(model_name, hours=24)
        
        if stats['status'] == 'no_data':
            return 0.5  # 默认中等分数
        
        # 性能因子（成功率、响应时间）
        performance_factor = (
            stats['success_rate'] * 0.4 +
            (1.0 / max(stats['avg_response_time'], 0.1)) * 0.1
        )
        
        # 成本因子
        cost_factor = 1.0 / (1.0 + stats['avg_cost_per_request'] * 10)
        
        # 任务适配因子
        model_info = self.orchestrator.model_capabilities.get(model_name, {})
        task_type = context.get('task_type', 'general')
        task_strength = model_info.get('strengths', {}).get(task_type, 0.5)
        
        # 综合得分
        total_score = (
            performance_factor * 0.4 +
            cost_factor * 0.3 +
            task_strength * 0.3
        )
        
        return total_score
    
    def update_model_performance(self, 
                                model_name: str, 
                                task_result: Dict[str, Any]):
        """更新模型性能数据"""
        
        # 提取性能指标
        request_info = {
            'success': task_result.get('success', False),
            'response_time': task_result.get('execution_time', 0),
            'tokens_used': task_result.get('tokens_used', 0),
            'cost': task_result.get('cost', 0),
            'task_type': task_result.get('task_type', 'unknown')
        }
        
        # 提交到监控器
        self.monitor.track_request(model_name, request_info)
        
        # 学习调整（简单的强化学习）
        self.adjust_selection_strategy(model_name, task_result)
    
    def adjust_selection_strategy(self, 
                                 model_name: str, 
                                 task_result: Dict[str, Any]):
        """调整选择策略"""
        
        # 根据结果调整模型能力评估
        success = task_result.get('success', False)
        task_type = task_result.get('task_type', 'unknown')
        
        if model_name in self.orchestrator.model_capabilities:
            strengths = self.orchestrator.model_capabilities[model_name]['strengths']
            
            if task_type in strengths:
                # 基于结果更新强度评估
                current_strength = strengths[task_type]
                
                if success:
                    # 成功时略微提升评分
                    new_strength = min(1.0, current_strength + self.learning_rate * 0.1)
                else:
                    # 失败时略微降低评分
                    new_strength = max(0.1, current_strength - self.learning_rate * 0.1)
                
                strengths[task_type] = new_strength

# 使用示例
def demonstrate_performance_monitoring():
    """演示性能监控"""
    
    monitor = ModelPerformanceMonitor()
    
    # 模拟一些请求数据
    models_data = {
        'gpt-4': [
            {'success': True, 'response_time': 2.5, 'tokens_used': 150, 'cost': 0.045},
            {'success': True, 'response_time': 3.2, 'tokens_used': 200, 'cost': 0.06},
            {'success': False, 'response_time': 8.0, 'tokens_used': 0, 'cost': 0.0},
        ],
        'gpt-3.5': [
            {'success': True, 'response_time': 1.8, 'tokens_used': 180, 'cost': 0.0036},
            {'success': True, 'response_time': 1.5, 'tokens_used': 160, 'cost': 0.0032},
            {'success': True, 'response_time': 2.0, 'tokens_used': 190, 'cost': 0.0038},
        ]
    }
    
    # 提交监控数据
    for model_name, requests in models_data.items():
        for request in requests:
            monitor.track_request(model_name, request)
    
    # 生成性能报告
    report = monitor.generate_performance_report()
    print(report)
    
    return monitor

# demo_monitoring = demonstrate_performance_monitoring()
```

### 4. 模型参数调优

不同的任务需要不同的模型参数配置来获得最佳效果。

```python
class ModelParameterOptimizer:
    """模型参数优化器"""
    
    def __init__(self):
        self.parameter_history = {}
        self.optimization_results = {}
        
        # 定义参数搜索空间
        self.parameter_space = {
            'temperature': [0.0, 0.3, 0.5, 0.7, 0.9, 1.0],
            'max_tokens': [100, 250, 500, 1000, 2000],
            'top_p': [0.8, 0.9, 0.95, 1.0],
            'frequency_penalty': [0.0, 0.1, 0.2, 0.5],
            'presence_penalty': [0.0, 0.1, 0.2, 0.5]
        }
    
    def optimize_parameters(self, 
                           model_config_name: str,
                           task_type: str,
                           test_examples: List[dspy.Example],
                           evaluation_metric: Callable,
                           max_iterations: int = 10) -> Dict[str, Any]:
        """优化模型参数"""
        
        print(f"🔧 开始参数优化: {model_config_name} - {task_type}")
        
        best_params = None
        best_score = 0.0
        optimization_history = []
        
        # 使用网格搜索进行参数优化
        for iteration in range(max_iterations):
            print(f"\n🔄 优化迭代 {iteration + 1}/{max_iterations}")
            
            # 生成参数组合
            if iteration == 0:
                # 第一次使用默认参数
                params = self.get_default_parameters()
            else:
                # 后续迭代使用随机搜索或贝叶斯优化
                params = self.generate_parameter_combination(
                    best_params if best_params else {}
                )
            
            print(f"📋 测试参数: {params}")
            
            # 评估参数组合
            score = self.evaluate_parameter_combination(
                model_config_name,
                params,
                test_examples,
                evaluation_metric
            )
            
            optimization_history.append({
                'iteration': iteration + 1,
                'parameters': params.copy(),
                'score': score
            })
            
            print(f"📊 得分: {score:.3f}")
            
            # 更新最佳参数
            if score > best_score:
                best_score = score
                best_params = params.copy()
                print(f"🏆 发现更好参数! 得分: {score:.3f}")
        
        # 保存优化结果
        optimization_key = f"{model_config_name}_{task_type}"
        self.optimization_results[optimization_key] = {
            'best_parameters': best_params,
            'best_score': best_score,
            'optimization_history': optimization_history,
            'total_iterations': max_iterations
        }
        
        print(f"\n✅ 参数优化完成")
        print(f"🎯 最佳得分: {best_score:.3f}")
        print(f"🔧 最佳参数: {best_params}")
        
        return self.optimization_results[optimization_key]
    
    def get_default_parameters(self) -> Dict[str, Any]:
        """获取默认参数"""
        return {
            'temperature': 0.7,
            'max_tokens': 500,
            'top_p': 0.9,
            'frequency_penalty': 0.0,
            'presence_penalty': 0.0
        }
    
    def generate_parameter_combination(self, 
                                      base_params: Dict[str, Any] = None) -> Dict[str, Any]:
        """生成参数组合"""
        import random
        
        if base_params is None:
            base_params = self.get_default_parameters()
        
        new_params = base_params.copy()
        
        # 随机选择1-2个参数进行调整
        params_to_adjust = random.sample(
            list(self.parameter_space.keys()), 
            random.randint(1, 2)
        )
        
        for param_name in params_to_adjust:
            if param_name in self.parameter_space:
                new_params[param_name] = random.choice(
                    self.parameter_space[param_name]
                )
        
        return new_params
    
    def evaluate_parameter_combination(self, 
                                      model_config_name: str,
                                      parameters: Dict[str, Any],
                                      test_examples: List[dspy.Example],
                                      evaluation_metric: Callable) -> float:
        """评估参数组合"""
        
        # 创建带参数的模型配置
        test_model = self.create_parameterized_model(model_config_name, parameters)
        
        # 临时设置模型
        original_model = dspy.settings.lm
        dspy.settings.configure(lm=test_model)
        
        try:
            scores = []
            
            # 在测试样本上评估
            for example in test_examples[:20]:  # 限制测试样本数量
                try:
                    # 创建简单的测试程序
                    predictor = dspy.Predict("question -> answer")
                    prediction = predictor(**example.inputs())
                    
                    score = evaluation_metric(example, prediction)
                    scores.append(float(score))
                    
                except Exception as e:
                    print(f"⚠️ 评估样本失败: {e}")
                    scores.append(0.0)
            
            # 计算平均分数
            average_score = sum(scores) / len(scores) if scores else 0.0
            
        finally:
            # 恢复原模型
            dspy.settings.configure(lm=original_model)
        
        return average_score
    
    def create_parameterized_model(self, 
                                   model_config_name: str, 
                                   parameters: Dict[str, Any]):
        """创建参数化模型"""
        
        # 这里需要根据实际的模型配置系统创建模型
        # 为演示目的，返回一个模拟模型
        
        class ParameterizedModel(dspy.LM):
            def __init__(self, config_name, params):
                self.config_name = config_name
                self.parameters = params
            
            def basic_request(self, prompt, **kwargs):
                # 模拟带参数的请求
                return [f"参数化响应 (temp={self.parameters.get('temperature', 0.7)}): {prompt[:30]}..."]
            
            def __call__(self, prompt, **kwargs):
                return self.basic_request(prompt, **kwargs)
        
        return ParameterizedModel(model_config_name, parameters)
    
    def get_optimized_parameters(self, 
                                model_config_name: str, 
                                task_type: str) -> Dict[str, Any]:
        """获取优化后的参数"""
        
        optimization_key = f"{model_config_name}_{task_type}"
        
        if optimization_key in self.optimization_results:
            return self.optimization_results[optimization_key]['best_parameters']
        
        return self.get_default_parameters()
    
    def apply_optimized_parameters(self, 
                                  model_config: BaseModelConfig,
                                  task_type: str):
        """应用优化参数到模型配置"""
        
        optimized_params = self.get_optimized_parameters(
            model_config.model_name, 
            task_type
        )
        
        # 更新配置参数
        for param_name, param_value in optimized_params.items():
            if hasattr(model_config, param_name):
                setattr(model_config, param_name, param_value)
            else:
                model_config.additional_params[param_name] = param_value
        
        print(f"✅ 已应用优化参数到 {model_config.model_name}")

class TaskSpecificOptimizer:
    """任务特定优化器"""
    
    def __init__(self, parameter_optimizer: ModelParameterOptimizer):
        self.parameter_optimizer = parameter_optimizer
        self.task_templates = {}
    
    def register_task_template(self, 
                              task_type: str, 
                              template_config: Dict[str, Any]):
        """注册任务模板"""
        
        self.task_templates[task_type] = template_config
        print(f"📝 已注册任务模板: {task_type}")
    
    def optimize_for_task(self, 
                         model_name: str,
                         task_type: str,
                         training_data: List[dspy.Example]) -> Dict[str, Any]:
        """为特定任务优化模型"""
        
        print(f"🎯 为任务优化模型: {task_type}")
        
        # 获取任务模板
        if task_type in self.task_templates:
            template = self.task_templates[task_type]
            base_params = template.get('base_parameters', {})
            
            print(f"📋 使用任务模板: {base_params}")
        else:
            base_params = {}
        
        # 定义评估指标
        def task_evaluation_metric(example, prediction):
            if task_type == 'summarization':
                return self.evaluate_summarization(example, prediction)
            elif task_type == 'question_answering':
                return self.evaluate_qa(example, prediction)
            elif task_type == 'creative_writing':
                return self.evaluate_creativity(example, prediction)
            else:
                return self.evaluate_general(example, prediction)
        
        # 执行参数优化
        optimization_result = self.parameter_optimizer.optimize_parameters(
            model_name,
            task_type,
            training_data,
            task_evaluation_metric,
            max_iterations=5  # 减少迭代次数以节省时间
        )
        
        return optimization_result
    
    def evaluate_summarization(self, example, prediction) -> float:
        """评估摘要质量"""
        # 简化的摘要评估
        expected = getattr(example, 'summary', '') or getattr(example, 'answer', '')
        actual = getattr(prediction, 'answer', '') or str(prediction)
        
        # 长度适中评分
        length_score = 0.5
        if 50 <= len(actual) <= 200:
            length_score = 1.0
        elif len(actual) < 20 or len(actual) > 400:
            length_score = 0.0
        
        # 内容相似度评分（简化）
        expected_words = set(expected.lower().split())
        actual_words = set(actual.lower().split())
        
        if expected_words and actual_words:
            overlap = len(expected_words & actual_words)
            union = len(expected_words | actual_words)
            similarity_score = overlap / union if union > 0 else 0.0
        else:
            similarity_score = 0.0
        
        return (length_score * 0.3 + similarity_score * 0.7)
    
    def evaluate_qa(self, example, prediction) -> float:
        """评估问答质量"""
        expected = getattr(example, 'answer', '')
        actual = getattr(prediction, 'answer', '') or str(prediction)
        
        # 简单的包含匹配
        if expected.lower() in actual.lower() or actual.lower() in expected.lower():
            return 1.0
        else:
            return 0.0
    
    def evaluate_creativity(self, example, prediction) -> float:
        """评估创意写作质量"""
        actual = getattr(prediction, 'answer', '') or str(prediction)
        
        # 长度评分
        length_score = min(len(actual) / 500, 1.0)  # 鼓励较长的创意内容
        
        # 词汇多样性评分
        words = actual.lower().split()
        unique_words = len(set(words))
        diversity_score = unique_words / len(words) if words else 0.0
        
        return (length_score * 0.4 + diversity_score * 0.6)
    
    def evaluate_general(self, example, prediction) -> float:
        """通用评估"""
        expected = getattr(example, 'answer', '') or getattr(example, 'output', '')
        actual = getattr(prediction, 'answer', '') or str(prediction)
        
        if not expected or not actual:
            return 0.5
        
        # 简单的相似度评估
        expected_words = set(expected.lower().split())
        actual_words = set(actual.lower().split())
        
        if expected_words and actual_words:
            overlap = len(expected_words & actual_words)
            return overlap / max(len(expected_words), len(actual_words))
        
        return 0.0

# 使用示例
def demonstrate_parameter_optimization():
    """演示参数优化"""
    
    optimizer = ModelParameterOptimizer()
    task_optimizer = TaskSpecificOptimizer(optimizer)
    
    # 注册任务模板
    task_optimizer.register_task_template(
        'summarization',
        {
            'base_parameters': {
                'temperature': 0.3,
                'max_tokens': 200
            },
            'evaluation_criteria': ['length', 'coherence', 'coverage']
        }
    )
    
    # 创建测试数据
    test_examples = [
        dspy.Example(
            text="人工智能是计算机科学的一个分支...",
            summary="AI是计算机科学分支"
        ).with_inputs('text'),
        dspy.Example(
            text="机器学习通过算法让计算机从数据中学习...",
            summary="机器学习让计算机从数据学习"
        ).with_inputs('text')
    ]
    
    # 为摘要任务优化参数
    result = task_optimizer.optimize_for_task(
        'gpt-3.5',
        'summarization',
        test_examples
    )
    
    print(f"\n🎊 优化结果:")
    print(f"最佳参数: {result['best_parameters']}")
    print(f"最佳得分: {result['best_score']:.3f}")
    
    return optimizer, task_optimizer

# demo_optimization = demonstrate_parameter_optimization()
```

## 实践练习

### 练习1：实现自定义模型适配器

```python
class CustomModelAdapter:
    """自定义模型适配器练习"""
    
    def __init__(self, model_endpoint: str):
        self.model_endpoint = model_endpoint
    
    def adapt_custom_api(self):
        """适配自定义API"""
        # TODO: 实现对自定义API的适配
        pass
    
    def implement_retry_logic(self):
        """实现重试逻辑"""
        # TODO: 实现智能重试机制
        pass
    
    def add_rate_limiting(self):
        """添加速率限制"""
        # TODO: 实现API调用速率控制
        pass

# 练习任务：
# 1. 选择一个第三方API，实现DSPy适配器
# 2. 添加错误处理和重试机制
# 3. 实现请求速率限制
```

### 练习2：构建模型性能基准测试

```python
class ModelBenchmark:
    """模型性能基准测试练习"""
    
    def __init__(self):
        self.benchmark_suites = {}
        self.results = {}
    
    def create_benchmark_suite(self, suite_name: str, tasks: List[Dict]):
        """创建基准测试套件"""
        # TODO: 实现基准测试套件
        pass
    
    def run_benchmark(self, models: List[str], suite_name: str):
        """运行基准测试"""
        # TODO: 实现自动化基准测试
        pass
    
    def generate_comparison_report(self):
        """生成对比报告"""
        # TODO: 实现详细的性能对比报告
        pass

# 练习任务：
# 1. 设计多维度性能评估指标
# 2. 实现自动化基准测试流程
# 3. 生成可视化性能对比报告
```

## 最佳实践

### 1. 模型选择策略

```python
def model_selection_guidelines():
    """模型选择指南"""
    
    guidelines = {
        '任务复杂度匹配': [
            '简单任务使用轻量级模型',
            '复杂推理使用高性能模型',
            '创意任务选择擅长生成的模型'
        ],
        
        '成本效益优化': [
            '根据预算约束选择合适模型',
            '实施智能缓存减少重复调用',
            '使用流量分配优化成本'
        ],
        
        '性能与延迟平衡': [
            '实时应用优先考虑响应速度',
            '批处理任务优先考虑准确性',
            '实施多层回退策略'
        ],
        
        '可靠性保证': [
            '设置多个模型备选方案',
            '实施健康检查和监控',
            '建立异常处理机制'
        ]
    }
    
    return guidelines

class ModelGovernance:
    """模型治理框架"""
    
    def __init__(self):
        self.policies = {}
        self.compliance_checks = []
        self.audit_logs = []
    
    def define_usage_policy(self, policy_name: str, rules: Dict[str, Any]):
        """定义使用策略"""
        self.policies[policy_name] = {
            'rules': rules,
            'created_at': time.time(),
            'active': True
        }
    
    def enforce_policies(self, request_context: Dict[str, Any]) -> bool:
        """执行策略检查"""
        for policy_name, policy in self.policies.items():
            if policy['active']:
                if not self.check_policy_compliance(request_context, policy['rules']):
                    self.log_policy_violation(policy_name, request_context)
                    return False
        return True
    
    def check_policy_compliance(self, context: Dict, rules: Dict) -> bool:
        """检查策略合规性"""
        # 实现具体的策略检查逻辑
        return True
    
    def log_policy_violation(self, policy_name: str, context: Dict):
        """记录策略违规"""
        violation_log = {
            'timestamp': time.time(),
            'policy': policy_name,
            'context': context,
            'action': 'blocked'
        }
        self.audit_logs.append(violation_log)
```

### 2. 安全和隐私保护

```python
class ModelSecurityManager:
    """模型安全管理器"""
    
    def __init__(self):
        self.security_policies = {}
        self.data_filters = []
        self.audit_enabled = True
    
    def add_input_filter(self, filter_func: Callable[[str], bool]):
        """添加输入过滤器"""
        self.data_filters.append(filter_func)
    
    def sanitize_input(self, user_input: str) -> str:
        """清理用户输入"""
        sanitized_input = user_input
        
        # 移除敏感信息
        import re
        
        # 移除可能的注入尝试
        injection_patterns = [
            r'<script.*?</script>',
            r'javascript:',
            r'eval\s*\(',
            r'exec\s*\('
        ]
        
        for pattern in injection_patterns:
            sanitized_input = re.sub(pattern, '', sanitized_input, flags=re.IGNORECASE)
        
        # 应用自定义过滤器
        for filter_func in self.data_filters:
            if not filter_func(sanitized_input):
                raise ValueError("输入未通过安全检查")
        
        return sanitized_input
    
    def protect_sensitive_output(self, model_output: str) -> str:
        """保护敏感输出"""
        protected_output = model_output
        
        # 移除潜在的敏感信息
        sensitive_patterns = [
            (r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b', '****-****-****-****'),  # 信用卡号
            (r'\b\d{3}-\d{2}-\d{4}\b', '***-**-****'),  # SSN
            (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '****@****.***')  # 邮箱
        ]
        
        for pattern, replacement in sensitive_patterns:
            protected_output = re.sub(pattern, replacement, protected_output)
        
        return protected_output
    
    def audit_request(self, request_info: Dict[str, Any]):
        """审计请求"""
        if self.audit_enabled:
            audit_entry = {
                'timestamp': time.time(),
                'user_id': request_info.get('user_id', 'anonymous'),
                'model_used': request_info.get('model', 'unknown'),
                'input_length': len(request_info.get('input', '')),
                'output_length': len(request_info.get('output', '')),
                'success': request_info.get('success', False)
            }
            
            # 记录到审计日志
            print(f"📝 审计记录: {audit_entry}")
```

通过本章的学习，你应该掌握了如何在DSPy中集成和管理多种语言模型。这些技能可以帮助你构建更加灵活、高效和可靠的AI应用系统。