---
title: "第10章：DSPy 生产环境部署"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第10章：DSPy 生产环境部署

::: tip 学习目标
- 设计DSPy应用的架构模式
- 实现缓存和性能优化
- 配置监控和日志系统
- 处理并发和扩展性问题
- 部署和维护最佳实践
:::

## 知识点

### 1. 生产环境架构设计

在生产环境中部署DSPy应用需要考虑架构设计、性能优化、可靠性等多个方面。

#### 微服务架构模式

```python
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import dspy
import asyncio
import redis
import json
import time
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from abc import ABC, abstractmethod
import threading
import queue
import uuid
from contextlib import asynccontextmanager

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DSPyServiceConfig:
    """DSPy服务配置"""
    service_name: str
    model_config: Dict[str, Any]
    cache_config: Dict[str, Any]
    monitoring_config: Dict[str, Any]
    scaling_config: Dict[str, Any]

class DSPyBaseService(ABC):
    """DSPy基础服务类"""
    
    def __init__(self, config: DSPyServiceConfig):
        self.config = config
        self.service_id = str(uuid.uuid4())
        self.is_healthy = True
        self.request_count = 0
        self.error_count = 0
        self.last_request_time = None
        
        # 初始化缓存
        self.cache = self._init_cache()
        
        # 初始化DSPy程序
        self.dspy_program = self._init_dspy_program()
        
        # 初始化监控
        self._init_monitoring()
        
        logger.info(f"DSPy服务初始化完成: {config.service_name} ({self.service_id})")
    
    @abstractmethod
    def _init_dspy_program(self):
        """初始化DSPy程序"""
        pass
    
    def _init_cache(self):
        """初始化缓存系统"""
        cache_config = self.config.cache_config
        
        if cache_config.get('type') == 'redis':
            try:
                cache = redis.Redis(
                    host=cache_config.get('host', 'localhost'),
                    port=cache_config.get('port', 6379),
                    db=cache_config.get('db', 0),
                    decode_responses=True
                )
                # 测试连接
                cache.ping()
                logger.info("Redis缓存连接成功")
                return cache
            except Exception as e:
                logger.warning(f"Redis连接失败，使用内存缓存: {e}")
                return {}
        else:
            return {}  # 内存缓存
    
    def _init_monitoring(self):
        """初始化监控"""
        self.metrics = {
            'requests_total': 0,
            'requests_successful': 0,
            'requests_failed': 0,
            'response_times': [],
            'cache_hits': 0,
            'cache_misses': 0
        }
    
    def get_cache_key(self, **kwargs) -> str:
        """生成缓存键"""
        # 创建确定性的缓存键
        sorted_kwargs = sorted(kwargs.items())
        cache_key = f"{self.config.service_name}:{hash(str(sorted_kwargs))}"
        return cache_key
    
    def get_from_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """从缓存获取数据"""
        try:
            if isinstance(self.cache, dict):
                # 内存缓存
                result = self.cache.get(cache_key)
            else:
                # Redis缓存
                result_str = self.cache.get(cache_key)
                result = json.loads(result_str) if result_str else None
            
            if result:
                self.metrics['cache_hits'] += 1
                logger.debug(f"缓存命中: {cache_key}")
                return result
            else:
                self.metrics['cache_misses'] += 1
                return None
                
        except Exception as e:
            logger.error(f"缓存获取失败: {e}")
            self.metrics['cache_misses'] += 1
            return None
    
    def set_to_cache(self, cache_key: str, data: Dict[str, Any], ttl: int = 3600):
        """设置缓存数据"""
        try:
            if isinstance(self.cache, dict):
                # 内存缓存（简化实现，不支持TTL）
                self.cache[cache_key] = data
            else:
                # Redis缓存
                self.cache.setex(cache_key, ttl, json.dumps(data))
            
            logger.debug(f"数据已缓存: {cache_key}")
            
        except Exception as e:
            logger.error(f"缓存设置失败: {e}")
    
    async def process_request(self, **kwargs) -> Dict[str, Any]:
        """处理请求的主要逻辑"""
        
        start_time = time.time()
        request_id = str(uuid.uuid4())
        
        try:
            self.request_count += 1
            self.metrics['requests_total'] += 1
            self.last_request_time = start_time
            
            logger.info(f"处理请求开始: {request_id}")
            
            # 检查缓存
            cache_key = self.get_cache_key(**kwargs)
            cached_result = self.get_from_cache(cache_key)
            
            if cached_result:
                logger.info(f"返回缓存结果: {request_id}")
                self.metrics['requests_successful'] += 1
                return cached_result
            
            # 执行DSPy程序
            result = await self._execute_dspy_program(**kwargs)
            
            # 缓存结果
            cache_ttl = self.config.cache_config.get('ttl', 3600)
            self.set_to_cache(cache_key, result, cache_ttl)
            
            self.metrics['requests_successful'] += 1
            
            logger.info(f"请求处理完成: {request_id}")
            return result
            
        except Exception as e:
            self.error_count += 1
            self.metrics['requests_failed'] += 1
            logger.error(f"请求处理失败: {request_id} - {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
        
        finally:
            # 记录响应时间
            response_time = time.time() - start_time
            self.metrics['response_times'].append(response_time)
            
            # 保持响应时间列表大小
            if len(self.metrics['response_times']) > 1000:
                self.metrics['response_times'] = self.metrics['response_times'][-1000:]
    
    async def _execute_dspy_program(self, **kwargs) -> Dict[str, Any]:
        """执行DSPy程序"""
        # 在异步环境中运行DSPy程序
        loop = asyncio.get_event_loop()
        
        def run_dspy():
            return self.dspy_program(**kwargs)
        
        # 使用线程池执行同步的DSPy程序
        result = await loop.run_in_executor(None, run_dspy)
        
        # 转换结果为字典格式
        if hasattr(result, '__dict__'):
            return result.__dict__
        else:
            return {'result': str(result)}
    
    def get_health_status(self) -> Dict[str, Any]:
        """获取健康状态"""
        avg_response_time = (
            sum(self.metrics['response_times']) / len(self.metrics['response_times'])
            if self.metrics['response_times'] else 0
        )
        
        error_rate = (
            self.metrics['requests_failed'] / self.metrics['requests_total']
            if self.metrics['requests_total'] > 0 else 0
        )
        
        cache_hit_rate = (
            self.metrics['cache_hits'] / (self.metrics['cache_hits'] + self.metrics['cache_misses'])
            if (self.metrics['cache_hits'] + self.metrics['cache_misses']) > 0 else 0
        )
        
        return {
            'service_id': self.service_id,
            'service_name': self.config.service_name,
            'is_healthy': self.is_healthy,
            'uptime': time.time() - (self.last_request_time or time.time()),
            'metrics': {
                'requests_total': self.metrics['requests_total'],
                'requests_successful': self.metrics['requests_successful'],
                'requests_failed': self.metrics['requests_failed'],
                'error_rate': error_rate,
                'avg_response_time': avg_response_time,
                'cache_hit_rate': cache_hit_rate
            }
        }

class QuestionAnsweringService(DSPyBaseService):
    """问答服务实现"""
    
    def _init_dspy_program(self):
        """初始化问答DSPy程序"""
        
        class QAProgram(dspy.Module):
            def __init__(self):
                super().__init__()
                self.qa = dspy.ChainOfThought(
                    "question, context -> reasoning, answer",
                    instructions="基于给定的上下文信息回答问题，如果上下文中没有相关信息，请说明无法回答。"
                )
            
            def forward(self, question, context=""):
                result = self.qa(question=question, context=context)
                return dspy.Prediction(
                    question=question,
                    answer=result.answer,
                    reasoning=result.reasoning
                )
        
        return QAProgram()

class TextSummarizationService(DSPyBaseService):
    """文本摘要服务实现"""
    
    def _init_dspy_program(self):
        """初始化摘要DSPy程序"""
        
        class SummaryProgram(dspy.Module):
            def __init__(self):
                super().__init__()
                self.summarizer = dspy.ChainOfThought(
                    "text, max_length -> reasoning, summary",
                    instructions="将给定文本压缩为简洁的摘要，保持核心信息。"
                )
            
            def forward(self, text, max_length=100):
                result = self.summarizer(text=text, max_length=str(max_length))
                return dspy.Prediction(
                    original_text=text,
                    summary=result.summary,
                    reasoning=result.reasoning
                )
        
        return SummaryProgram()

# API模型定义
class QuestionRequest(BaseModel):
    question: str
    context: str = ""

class SummaryRequest(BaseModel):
    text: str
    max_length: int = 100

class HealthResponse(BaseModel):
    status: str
    details: Dict[str, Any]

# 服务工厂
class DSPyServiceFactory:
    """DSPy服务工厂"""
    
    @staticmethod
    def create_service(service_type: str, config: DSPyServiceConfig) -> DSPyBaseService:
        """创建服务实例"""
        
        if service_type == "qa":
            return QuestionAnsweringService(config)
        elif service_type == "summary":
            return TextSummarizationService(config)
        else:
            raise ValueError(f"不支持的服务类型: {service_type}")

# FastAPI应用
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    
    # 启动时初始化服务
    logger.info("初始化DSPy服务...")
    
    # 配置DSPy
    lm = dspy.OpenAI(model="gpt-3.5-turbo", max_tokens=500)
    dspy.settings.configure(lm=lm)
    
    # 创建服务配置
    qa_config = DSPyServiceConfig(
        service_name="question_answering",
        model_config={"model": "gpt-3.5-turbo"},
        cache_config={"type": "memory", "ttl": 3600},
        monitoring_config={"enabled": True},
        scaling_config={"max_workers": 4}
    )
    
    summary_config = DSPyServiceConfig(
        service_name="text_summarization",
        model_config={"model": "gpt-3.5-turbo"},
        cache_config={"type": "memory", "ttl": 3600},
        monitoring_config={"enabled": True},
        scaling_config={"max_workers": 4}
    )
    
    # 创建服务实例
    app.state.qa_service = DSPyServiceFactory.create_service("qa", qa_config)
    app.state.summary_service = DSPyServiceFactory.create_service("summary", summary_config)
    
    logger.info("DSPy服务初始化完成")
    
    yield
    
    # 关闭时清理资源
    logger.info("清理DSPy服务资源...")

# 创建FastAPI应用
app = FastAPI(
    title="DSPy生产环境API",
    description="DSPy应用的生产环境部署示例",
    version="1.0.0",
    lifespan=lifespan
)

@app.post("/qa", response_model=Dict[str, Any])
async def question_answering(request: QuestionRequest):
    """问答接口"""
    
    result = await app.state.qa_service.process_request(
        question=request.question,
        context=request.context
    )
    
    return result

@app.post("/summary", response_model=Dict[str, Any])
async def text_summarization(request: SummaryRequest):
    """摘要接口"""
    
    result = await app.state.summary_service.process_request(
        text=request.text,
        max_length=request.max_length
    )
    
    return result

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """健康检查接口"""
    
    qa_health = app.state.qa_service.get_health_status()
    summary_health = app.state.summary_service.get_health_status()
    
    overall_healthy = qa_health['is_healthy'] and summary_health['is_healthy']
    
    return HealthResponse(
        status="healthy" if overall_healthy else "unhealthy",
        details={
            "qa_service": qa_health,
            "summary_service": summary_health
        }
    )

@app.get("/metrics")
async def get_metrics():
    """获取指标接口"""
    
    return {
        "qa_service": app.state.qa_service.get_health_status()['metrics'],
        "summary_service": app.state.summary_service.get_health_status()['metrics']
    }

# 如果直接运行此文件，启动服务器
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 2. 缓存和性能优化

缓存是提高生产环境性能的关键技术。

```python
import hashlib
import pickle
import time
from functools import wraps
from typing import Callable, Any, Optional, Dict, Union
import asyncio

class AdvancedCacheManager:
    """高级缓存管理器"""
    
    def __init__(self, 
                 cache_type: str = "memory",
                 default_ttl: int = 3600,
                 max_size: int = 10000):
        
        self.cache_type = cache_type
        self.default_ttl = default_ttl
        self.max_size = max_size
        
        # 初始化缓存后端
        self.cache_backend = self._init_cache_backend()
        
        # 缓存统计
        self.stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'evictions': 0,
            'total_requests': 0
        }
        
        logger.info(f"缓存管理器初始化完成: {cache_type}")
    
    def _init_cache_backend(self):
        """初始化缓存后端"""
        
        if self.cache_type == "redis":
            return self._init_redis_backend()
        elif self.cache_type == "memcached":
            return self._init_memcached_backend()
        else:
            return self._init_memory_backend()
    
    def _init_memory_backend(self):
        """初始化内存缓存后端"""
        
        class MemoryCache:
            def __init__(self, max_size):
                self.cache = {}
                self.access_times = {}
                self.max_size = max_size
            
            def get(self, key):
                if key in self.cache:
                    item, expiry = self.cache[key]
                    if expiry > time.time():
                        self.access_times[key] = time.time()
                        return item
                    else:
                        # 过期，删除
                        del self.cache[key]
                        if key in self.access_times:
                            del self.access_times[key]
                return None
            
            def set(self, key, value, ttl):
                # 检查是否需要淘汰
                if len(self.cache) >= self.max_size and key not in self.cache:
                    self._evict_lru()
                
                expiry = time.time() + ttl
                self.cache[key] = (value, expiry)
                self.access_times[key] = time.time()
            
            def _evict_lru(self):
                """淘汰最近最少使用的项"""
                if self.access_times:
                    lru_key = min(self.access_times, key=self.access_times.get)
                    del self.cache[lru_key]
                    del self.access_times[lru_key]
                    return True
                return False
            
            def delete(self, key):
                if key in self.cache:
                    del self.cache[key]
                if key in self.access_times:
                    del self.access_times[key]
            
            def clear(self):
                self.cache.clear()
                self.access_times.clear()
        
        return MemoryCache(self.max_size)
    
    def _init_redis_backend(self):
        """初始化Redis缓存后端"""
        try:
            import redis
            return redis.Redis(
                host='localhost',
                port=6379,
                db=0,
                decode_responses=True
            )
        except ImportError:
            logger.warning("Redis不可用，回退到内存缓存")
            return self._init_memory_backend()
    
    def _init_memcached_backend(self):
        """初始化Memcached缓存后端"""
        try:
            import pymemcache.client.base as memcache
            return memcache.Client(('localhost', 11211))
        except ImportError:
            logger.warning("Memcached不可用，回退到内存缓存")
            return self._init_memory_backend()
    
    def generate_cache_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """生成缓存键"""
        
        # 创建参数的哈希
        serializable_args = []
        
        for arg in args:
            if hasattr(arg, '__dict__'):
                serializable_args.append(str(sorted(arg.__dict__.items())))
            else:
                serializable_args.append(str(arg))
        
        serializable_kwargs = sorted(kwargs.items())
        
        # 组合所有参数
        key_data = {
            'function': func_name,
            'args': serializable_args,
            'kwargs': serializable_kwargs
        }
        
        # 生成哈希
        key_string = json.dumps(key_data, sort_keys=True)
        key_hash = hashlib.md5(key_string.encode()).hexdigest()
        
        return f"dspy:{func_name}:{key_hash}"
    
    def get(self, key: str) -> Optional[Any]:
        """从缓存获取数据"""
        
        self.stats['total_requests'] += 1
        
        try:
            if self.cache_type in ['redis', 'memcached']:
                # 外部缓存系统
                data = self.cache_backend.get(key)
                
                if data:
                    # Redis返回字符串，需要反序列化
                    if self.cache_type == 'redis':
                        result = pickle.loads(data.encode('latin-1'))
                    else:
                        result = pickle.loads(data)
                    
                    self.stats['hits'] += 1
                    return result
            else:
                # 内存缓存
                result = self.cache_backend.get(key)
                if result is not None:
                    self.stats['hits'] += 1
                    return result
            
            self.stats['misses'] += 1
            return None
            
        except Exception as e:
            logger.error(f"缓存获取失败: {e}")
            self.stats['misses'] += 1
            return None
    
    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """设置缓存数据"""
        
        if ttl is None:
            ttl = self.default_ttl
        
        try:
            self.stats['sets'] += 1
            
            if self.cache_type == 'redis':
                # Redis缓存
                serialized_data = pickle.dumps(value).decode('latin-1')
                self.cache_backend.setex(key, ttl, serialized_data)
                
            elif self.cache_type == 'memcached':
                # Memcached缓存
                serialized_data = pickle.dumps(value)
                self.cache_backend.set(key, serialized_data, expire=ttl)
                
            else:
                # 内存缓存
                self.cache_backend.set(key, value, ttl)
            
            return True
            
        except Exception as e:
            logger.error(f"缓存设置失败: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """删除缓存数据"""
        
        try:
            if self.cache_type in ['redis', 'memcached']:
                result = self.cache_backend.delete(key)
                return bool(result)
            else:
                self.cache_backend.delete(key)
                return True
                
        except Exception as e:
            logger.error(f"缓存删除失败: {e}")
            return False
    
    def clear(self) -> bool:
        """清空缓存"""
        
        try:
            if self.cache_type == 'redis':
                self.cache_backend.flushdb()
            elif self.cache_type == 'memcached':
                self.cache_backend.flush_all()
            else:
                self.cache_backend.clear()
            
            # 重置统计
            self.stats = {
                'hits': 0,
                'misses': 0,
                'sets': 0,
                'evictions': 0,
                'total_requests': 0
            }
            
            return True
            
        except Exception as e:
            logger.error(f"缓存清空失败: {e}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """获取缓存统计信息"""
        
        hit_rate = (
            self.stats['hits'] / self.stats['total_requests']
            if self.stats['total_requests'] > 0 else 0
        )
        
        return {
            **self.stats,
            'hit_rate': hit_rate,
            'miss_rate': 1 - hit_rate,
            'cache_type': self.cache_type
        }

# 缓存装饰器
def dspy_cache(ttl: int = 3600, 
               cache_manager: AdvancedCacheManager = None,
               cache_condition: Callable = None):
    """DSPy缓存装饰器"""
    
    if cache_manager is None:
        cache_manager = AdvancedCacheManager()
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            
            # 检查缓存条件
            if cache_condition and not cache_condition(*args, **kwargs):
                return func(*args, **kwargs)
            
            # 生成缓存键
            cache_key = cache_manager.generate_cache_key(func.__name__, args, kwargs)
            
            # 尝试从缓存获取
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                logger.debug(f"缓存命中: {func.__name__}")
                return cached_result
            
            # 执行函数
            result = func(*args, **kwargs)
            
            # 存储到缓存
            cache_manager.set(cache_key, result, ttl)
            
            return result
        
        # 异步版本
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            
            # 检查缓存条件
            if cache_condition and not cache_condition(*args, **kwargs):
                return await func(*args, **kwargs)
            
            # 生成缓存键
            cache_key = cache_manager.generate_cache_key(func.__name__, args, kwargs)
            
            # 尝试从缓存获取
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                logger.debug(f"缓存命中: {func.__name__}")
                return cached_result
            
            # 执行异步函数
            result = await func(*args, **kwargs)
            
            # 存储到缓存
            cache_manager.set(cache_key, result, ttl)
            
            return result
        
        # 根据函数类型返回相应的包装器
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return wrapper
    
    return decorator

# 性能优化工具
class DSPyPerformanceOptimizer:
    """DSPy性能优化器"""
    
    def __init__(self):
        self.optimization_strategies = {
            'batch_processing': self.enable_batch_processing,
            'request_deduplication': self.enable_request_deduplication,
            'response_streaming': self.enable_response_streaming,
            'connection_pooling': self.enable_connection_pooling
        }
        
        self.active_optimizations = set()
    
    def optimize_dspy_program(self, 
                            program: dspy.Module,
                            strategies: List[str] = None) -> dspy.Module:
        """优化DSPy程序"""
        
        if strategies is None:
            strategies = ['batch_processing', 'request_deduplication']
        
        optimized_program = program
        
        for strategy in strategies:
            if strategy in self.optimization_strategies:
                optimized_program = self.optimization_strategies[strategy](optimized_program)
                self.active_optimizations.add(strategy)
                logger.info(f"应用优化策略: {strategy}")
        
        return optimized_program
    
    def enable_batch_processing(self, program: dspy.Module) -> dspy.Module:
        """启用批处理"""
        
        class BatchProcessor:
            def __init__(self, base_program, batch_size=10, timeout=1.0):
                self.base_program = base_program
                self.batch_size = batch_size
                self.timeout = timeout
                self.pending_requests = []
                self.request_timer = None
            
            async def process_request(self, **kwargs):
                """处理单个请求"""
                
                # 创建请求对象
                request = {
                    'kwargs': kwargs,
                    'future': asyncio.Future(),
                    'timestamp': time.time()
                }
                
                self.pending_requests.append(request)
                
                # 检查是否需要立即处理批次
                if len(self.pending_requests) >= self.batch_size:
                    await self._process_batch()
                elif self.request_timer is None:
                    # 设置超时处理
                    self.request_timer = asyncio.create_task(
                        self._timeout_batch_processing()
                    )
                
                return await request['future']
            
            async def _timeout_batch_processing(self):
                """超时批处理"""
                await asyncio.sleep(self.timeout)
                await self._process_batch()
            
            async def _process_batch(self):
                """处理批次"""
                if not self.pending_requests:
                    return
                
                # 取出当前批次
                batch = self.pending_requests[:self.batch_size]
                self.pending_requests = self.pending_requests[self.batch_size:]
                
                # 取消定时器
                if self.request_timer:
                    self.request_timer.cancel()
                    self.request_timer = None
                
                # 批量处理
                try:
                    results = []
                    for request in batch:
                        result = self.base_program(**request['kwargs'])
                        results.append(result)
                    
                    # 返回结果
                    for request, result in zip(batch, results):
                        request['future'].set_result(result)
                        
                except Exception as e:
                    # 所有请求都标记为失败
                    for request in batch:
                        request['future'].set_exception(e)
        
        return BatchProcessor(program)
    
    def enable_request_deduplication(self, program: dspy.Module) -> dspy.Module:
        """启用请求去重"""
        
        class DeduplicationWrapper:
            def __init__(self, base_program):
                self.base_program = base_program
                self.in_flight_requests = {}
            
            async def process_request(self, **kwargs):
                """处理请求并去重"""
                
                # 生成请求键
                request_key = hashlib.md5(
                    json.dumps(kwargs, sort_keys=True).encode()
                ).hexdigest()
                
                # 检查是否有进行中的相同请求
                if request_key in self.in_flight_requests:
                    logger.debug(f"请求去重: {request_key}")
                    return await self.in_flight_requests[request_key]
                
                # 创建新的请求处理任务
                async def handle_request():
                    try:
                        result = self.base_program(**kwargs)
                        return result
                    finally:
                        # 清理进行中的请求记录
                        if request_key in self.in_flight_requests:
                            del self.in_flight_requests[request_key]
                
                # 记录进行中的请求
                task = asyncio.create_task(handle_request())
                self.in_flight_requests[request_key] = task
                
                return await task
        
        return DeduplicationWrapper(program)
    
    def enable_response_streaming(self, program: dspy.Module) -> dspy.Module:
        """启用响应流式传输"""
        
        class StreamingWrapper:
            def __init__(self, base_program):
                self.base_program = base_program
            
            async def process_request_stream(self, **kwargs):
                """流式处理请求"""
                
                # 这是一个简化的流式实现示例
                # 实际实现需要根据模型API的流式支持
                
                yield {"status": "processing", "progress": 0}
                
                # 模拟处理进度
                for progress in [25, 50, 75]:
                    await asyncio.sleep(0.1)
                    yield {"status": "processing", "progress": progress}
                
                # 获取最终结果
                result = self.base_program(**kwargs)
                
                yield {
                    "status": "completed", 
                    "progress": 100,
                    "result": result.__dict__ if hasattr(result, '__dict__') else str(result)
                }
        
        return StreamingWrapper(program)
    
    def enable_connection_pooling(self, program: dspy.Module) -> dspy.Module:
        """启用连接池"""
        
        # 这里需要根据具体的模型API实现连接池
        # 示例：为OpenAI API创建连接池
        
        logger.info("连接池优化已启用（需要具体实现）")
        return program

# 使用示例
def demonstrate_production_optimization():
    """演示生产环境优化"""
    
    # 创建缓存管理器
    cache_manager = AdvancedCacheManager(
        cache_type="memory",
        default_ttl=3600,
        max_size=1000
    )
    
    # 创建性能优化器
    optimizer = DSPyPerformanceOptimizer()
    
    # 创建测试程序
    class TestProgram(dspy.Module):
        def __init__(self):
            super().__init__()
            self.processor = dspy.Predict("input -> output")
        
        @dspy_cache(ttl=300, cache_manager=cache_manager)
        def forward(self, input_text):
            # 模拟处理延迟
            time.sleep(0.1)
            return self.processor(input=input_text)
    
    # 应用优化
    base_program = TestProgram()
    optimized_program = optimizer.optimize_dspy_program(
        base_program, 
        strategies=['batch_processing', 'request_deduplication']
    )
    
    print("🚀 生产环境优化演示")
    print(f"缓存类型: {cache_manager.cache_type}")
    print(f"应用的优化策略: {optimizer.active_optimizations}")
    
    # 测试缓存效果
    test_input = "测试输入"
    
    # 第一次调用（缓存未命中）
    start_time = time.time()
    result1 = base_program(test_input)
    first_call_time = time.time() - start_time
    
    # 第二次调用（缓存命中）
    start_time = time.time()
    result2 = base_program(test_input)
    second_call_time = time.time() - start_time
    
    print(f"\n⚡ 缓存性能测试:")
    print(f"第一次调用时间: {first_call_time:.3f}s")
    print(f"第二次调用时间: {second_call_time:.3f}s")
    print(f"性能提升: {(first_call_time - second_call_time) / first_call_time * 100:.1f}%")
    
    # 显示缓存统计
    cache_stats = cache_manager.get_stats()
    print(f"\n📊 缓存统计: {cache_stats}")
    
    return cache_manager, optimizer

# demo_production_opt = demonstrate_production_optimization()
```

### 3. 监控和日志系统

完善的监控和日志系统对生产环境至关重要。

```python
import logging
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import threading
from collections import defaultdict, deque
import statistics

class LogLevel(Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"

@dataclass
class DSPyLogEntry:
    """DSPy日志条目"""
    timestamp: datetime
    level: LogLevel
    service_name: str
    request_id: str
    user_id: Optional[str]
    operation: str
    duration_ms: Optional[float]
    input_data: Optional[Dict[str, Any]]
    output_data: Optional[Dict[str, Any]]
    error_message: Optional[str]
    model_info: Optional[Dict[str, Any]]
    cache_hit: Optional[bool]
    
    def to_dict(self):
        """转换为字典"""
        return asdict(self)
    
    def to_json(self):
        """转换为JSON"""
        data = self.to_dict()
        # 处理datetime序列化
        data['timestamp'] = self.timestamp.isoformat()
        data['level'] = self.level.value
        return json.dumps(data, ensure_ascii=False)

class DSPyLogger:
    """DSPy专用日志器"""
    
    def __init__(self, 
                 service_name: str,
                 log_level: LogLevel = LogLevel.INFO,
                 enable_structured_logging: bool = True,
                 enable_performance_logging: bool = True):
        
        self.service_name = service_name
        self.log_level = log_level
        self.enable_structured_logging = enable_structured_logging
        self.enable_performance_logging = enable_performance_logging
        
        # 设置标准日志器
        self.logger = logging.getLogger(f"dspy.{service_name}")
        self.logger.setLevel(getattr(logging, log_level.value))
        
        # 创建处理器
        self._setup_handlers()
        
        # 结构化日志存储
        if enable_structured_logging:
            self.structured_logs = deque(maxlen=10000)
            self.log_lock = threading.Lock()
    
    def _setup_handlers(self):
        """设置日志处理器"""
        
        # 控制台处理器
        console_handler = logging.StreamHandler()
        console_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)
        
        # 文件处理器
        file_handler = logging.FileHandler(f"dspy_{self.service_name}.log")
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        file_handler.setFormatter(file_formatter)
        self.logger.addHandler(file_handler)
    
    def log_request(self,
                   request_id: str,
                   operation: str,
                   input_data: Dict[str, Any],
                   output_data: Dict[str, Any] = None,
                   duration_ms: float = None,
                   error_message: str = None,
                   user_id: str = None,
                   model_info: Dict[str, Any] = None,
                   cache_hit: bool = None):
        """记录请求日志"""
        
        # 确定日志级别
        if error_message:
            level = LogLevel.ERROR
        else:
            level = LogLevel.INFO
        
        # 创建日志条目
        log_entry = DSPyLogEntry(
            timestamp=datetime.now(),
            level=level,
            service_name=self.service_name,
            request_id=request_id,
            user_id=user_id,
            operation=operation,
            duration_ms=duration_ms,
            input_data=input_data,
            output_data=output_data,
            error_message=error_message,
            model_info=model_info,
            cache_hit=cache_hit
        )
        
        # 记录到结构化日志
        if self.enable_structured_logging:
            with self.log_lock:
                self.structured_logs.append(log_entry)
        
        # 记录到标准日志
        log_message = f"Request {request_id} - {operation}"
        if duration_ms is not None:
            log_message += f" - {duration_ms:.2f}ms"
        if cache_hit is not None:
            log_message += f" - Cache: {'HIT' if cache_hit else 'MISS'}"
        if error_message:
            log_message += f" - Error: {error_message}"
        
        self.logger.log(getattr(logging, level.value), log_message)
    
    def log_performance(self,
                       operation: str,
                       metrics: Dict[str, float]):
        """记录性能指标"""
        
        if not self.enable_performance_logging:
            return
        
        perf_message = f"Performance - {operation}: "
        perf_details = []
        
        for metric, value in metrics.items():
            perf_details.append(f"{metric}={value:.3f}")
        
        perf_message += ", ".join(perf_details)
        
        self.logger.info(perf_message)
    
    def get_logs(self, 
                 start_time: datetime = None,
                 end_time: datetime = None,
                 level: LogLevel = None,
                 operation: str = None,
                 limit: int = 100) -> List[DSPyLogEntry]:
        """获取日志"""
        
        if not self.enable_structured_logging:
            return []
        
        with self.log_lock:
            logs = list(self.structured_logs)
        
        # 应用过滤器
        filtered_logs = []
        
        for log_entry in logs:
            # 时间过滤
            if start_time and log_entry.timestamp < start_time:
                continue
            if end_time and log_entry.timestamp > end_time:
                continue
            
            # 级别过滤
            if level and log_entry.level != level:
                continue
            
            # 操作过滤
            if operation and log_entry.operation != operation:
                continue
            
            filtered_logs.append(log_entry)
        
        # 按时间倒序排序并限制数量
        filtered_logs.sort(key=lambda x: x.timestamp, reverse=True)
        
        return filtered_logs[:limit]

class DSPyMetricsCollector:
    """DSPy指标收集器"""
    
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.metrics = defaultdict(list)
        self.counters = defaultdict(int)
        self.gauges = defaultdict(float)
        self.histograms = defaultdict(lambda: deque(maxlen=1000))
        self.start_time = time.time()
        
        # 线程安全
        self.metrics_lock = threading.Lock()
    
    def increment_counter(self, name: str, value: int = 1, tags: Dict[str, str] = None):
        """增加计数器"""
        
        with self.metrics_lock:
            key = self._make_key(name, tags)
            self.counters[key] += value
    
    def set_gauge(self, name: str, value: float, tags: Dict[str, str] = None):
        """设置仪表值"""
        
        with self.metrics_lock:
            key = self._make_key(name, tags)
            self.gauges[key] = value
    
    def record_histogram(self, name: str, value: float, tags: Dict[str, str] = None):
        """记录直方图数据"""
        
        with self.metrics_lock:
            key = self._make_key(name, tags)
            self.histograms[key].append(value)
    
    def record_timer(self, name: str, duration_ms: float, tags: Dict[str, str] = None):
        """记录计时数据"""
        
        self.record_histogram(f"{name}.duration", duration_ms, tags)
        self.increment_counter(f"{name}.count", 1, tags)
    
    def _make_key(self, name: str, tags: Dict[str, str] = None) -> str:
        """创建指标键"""
        
        key = f"{self.service_name}.{name}"
        
        if tags:
            tag_parts = [f"{k}={v}" for k, v in sorted(tags.items())]
            key += f"[{','.join(tag_parts)}]"
        
        return key
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """获取指标摘要"""
        
        with self.metrics_lock:
            summary = {
                'service_name': self.service_name,
                'uptime_seconds': time.time() - self.start_time,
                'counters': dict(self.counters),
                'gauges': dict(self.gauges),
                'histograms': {}
            }
            
            # 计算直方图统计
            for key, values in self.histograms.items():
                if values:
                    summary['histograms'][key] = {
                        'count': len(values),
                        'min': min(values),
                        'max': max(values),
                        'mean': statistics.mean(values),
                        'median': statistics.median(values),
                        'p95': self._percentile(values, 95),
                        'p99': self._percentile(values, 99)
                    }
        
        return summary
    
    def _percentile(self, values: List[float], percentile: int) -> float:
        """计算百分位数"""
        
        if not values:
            return 0.0
        
        sorted_values = sorted(values)
        k = (len(sorted_values) - 1) * percentile / 100
        f = int(k)
        c = k - f
        
        if f >= len(sorted_values) - 1:
            return sorted_values[-1]
        
        return sorted_values[f] * (1 - c) + sorted_values[f + 1] * c

class DSPyMonitoringDashboard:
    """DSPy监控仪表板"""
    
    def __init__(self, services: List[str]):
        self.services = services
        self.loggers = {service: DSPyLogger(service) for service in services}
        self.metrics_collectors = {service: DSPyMetricsCollector(service) for service in services}
        
        # 告警规则
        self.alert_rules = []
        self.active_alerts = []
    
    def add_alert_rule(self,
                      name: str,
                      condition: Callable[[Dict[str, Any]], bool],
                      severity: str = "warning",
                      description: str = ""):
        """添加告警规则"""
        
        self.alert_rules.append({
            'name': name,
            'condition': condition,
            'severity': severity,
            'description': description,
            'last_triggered': None
        })
    
    def check_alerts(self):
        """检查告警条件"""
        
        current_time = time.time()
        
        for rule in self.alert_rules:
            try:
                # 获取所有服务的指标
                all_metrics = {}
                for service_name, collector in self.metrics_collectors.items():
                    all_metrics[service_name] = collector.get_metrics_summary()
                
                # 检查告警条件
                if rule['condition'](all_metrics):
                    # 避免重复告警（5分钟内不重复）
                    if (rule['last_triggered'] is None or 
                        current_time - rule['last_triggered'] > 300):
                        
                        alert = {
                            'rule_name': rule['name'],
                            'severity': rule['severity'],
                            'description': rule['description'],
                            'triggered_at': current_time,
                            'metrics_snapshot': all_metrics
                        }
                        
                        self.active_alerts.append(alert)
                        rule['last_triggered'] = current_time
                        
                        logger.warning(f"告警触发: {rule['name']} - {rule['description']}")
                        
            except Exception as e:
                logger.error(f"告警检查失败: {rule['name']} - {str(e)}")
    
    def generate_dashboard_data(self) -> Dict[str, Any]:
        """生成仪表板数据"""
        
        dashboard_data = {
            'timestamp': datetime.now().isoformat(),
            'services': {},
            'alerts': self.active_alerts[-10:],  # 最近10个告警
            'summary': {
                'total_services': len(self.services),
                'healthy_services': 0,
                'active_alerts': len([a for a in self.active_alerts if time.time() - a['triggered_at'] < 3600])
            }
        }
        
        # 收集每个服务的数据
        for service_name in self.services:
            logger_instance = self.loggers[service_name]
            metrics_collector = self.metrics_collectors[service_name]
            
            # 获取最近的日志
            recent_logs = logger_instance.get_logs(
                start_time=datetime.now() - timedelta(hours=1),
                limit=50
            )
            
            # 获取指标摘要
            metrics_summary = metrics_collector.get_metrics_summary()
            
            # 计算健康状态
            error_logs = [log for log in recent_logs if log.level == LogLevel.ERROR]
            error_rate = len(error_logs) / max(len(recent_logs), 1)
            
            is_healthy = error_rate < 0.05  # 错误率小于5%认为健康
            if is_healthy:
                dashboard_data['summary']['healthy_services'] += 1
            
            dashboard_data['services'][service_name] = {
                'health_status': 'healthy' if is_healthy else 'unhealthy',
                'error_rate': error_rate,
                'recent_logs_count': len(recent_logs),
                'error_logs_count': len(error_logs),
                'metrics': metrics_summary,
                'last_activity': recent_logs[0].timestamp.isoformat() if recent_logs else None
            }
        
        return dashboard_data
    
    def export_metrics_prometheus(self) -> str:
        """导出Prometheus格式指标"""
        
        metrics_lines = []
        
        for service_name, collector in self.metrics_collectors.items():
            summary = collector.get_metrics_summary()
            
            # 计数器
            for key, value in summary['counters'].items():
                clean_key = key.replace('.', '_').replace('[', '{').replace(']', '}')
                metrics_lines.append(f'dspy_{clean_key} {value}')
            
            # 仪表
            for key, value in summary['gauges'].items():
                clean_key = key.replace('.', '_').replace('[', '{').replace(']', '}')
                metrics_lines.append(f'dspy_{clean_key} {value}')
            
            # 直方图
            for key, stats in summary['histograms'].items():
                clean_key = key.replace('.', '_').replace('[', '{').replace(']', '}')
                metrics_lines.append(f'dspy_{clean_key}_count {stats["count"]}')
                metrics_lines.append(f'dspy_{clean_key}_sum {stats["mean"] * stats["count"]}')
                
                for percentile in [50, 95, 99]:
                    p_key = f'p{percentile}' if percentile in stats else 'median' if percentile == 50 else f'p{percentile}'
                    if p_key in stats:
                        metrics_lines.append(f'dspy_{clean_key}{{quantile="0.{percentile:02d}"}} {stats[p_key]}')
        
        return '\n'.join(metrics_lines)

# 使用示例
def demonstrate_monitoring_system():
    """演示监控系统"""
    
    # 创建监控仪表板
    dashboard = DSPyMonitoringDashboard(['qa_service', 'summary_service'])
    
    # 添加告警规则
    def high_error_rate_alert(metrics):
        """高错误率告警"""
        for service_name, service_metrics in metrics.items():
            counters = service_metrics.get('counters', {})
            error_count = sum(v for k, v in counters.items() if 'error' in k.lower())
            total_count = sum(v for k, v in counters.items() if 'request' in k.lower())
            
            if total_count > 0 and error_count / total_count > 0.1:  # 10%错误率
                return True
        return False
    
    def high_response_time_alert(metrics):
        """高响应时间告警"""
        for service_name, service_metrics in metrics.items():
            histograms = service_metrics.get('histograms', {})
            for key, stats in histograms.items():
                if 'response_time' in key and stats.get('p95', 0) > 5000:  # 5秒
                    return True
        return False
    
    dashboard.add_alert_rule(
        name="high_error_rate",
        condition=high_error_rate_alert,
        severity="critical",
        description="服务错误率过高"
    )
    
    dashboard.add_alert_rule(
        name="high_response_time",
        condition=high_response_time_alert,
        severity="warning",
        description="服务响应时间过长"
    )
    
    # 模拟一些指标数据
    qa_metrics = dashboard.metrics_collectors['qa_service']
    summary_metrics = dashboard.metrics_collectors['summary_service']
    
    # 模拟请求
    for i in range(100):
        # QA服务请求
        qa_metrics.increment_counter('requests.total')
        qa_metrics.record_timer('requests.response_time', random.uniform(100, 2000))
        
        if i % 20 == 0:  # 5%错误率
            qa_metrics.increment_counter('requests.errors')
        else:
            qa_metrics.increment_counter('requests.success')
        
        # Summary服务请求
        summary_metrics.increment_counter('requests.total')
        summary_metrics.record_timer('requests.response_time', random.uniform(200, 1500))
        
        if i % 25 == 0:  # 4%错误率
            summary_metrics.increment_counter('requests.errors')
        else:
            summary_metrics.increment_counter('requests.success')
    
    # 检查告警
    dashboard.check_alerts()
    
    # 生成仪表板数据
    dashboard_data = dashboard.generate_dashboard_data()
    
    print("📊 监控仪表板数据:")
    print(f"总服务数: {dashboard_data['summary']['total_services']}")
    print(f"健康服务数: {dashboard_data['summary']['healthy_services']}")
    print(f"活跃告警数: {dashboard_data['summary']['active_alerts']}")
    
    print("\n🚨 服务状态:")
    for service_name, service_data in dashboard_data['services'].items():
        print(f"  {service_name}: {service_data['health_status']} (错误率: {service_data['error_rate']:.1%})")
    
    # 导出Prometheus指标
    prometheus_metrics = dashboard.export_metrics_prometheus()
    print(f"\n📈 Prometheus指标示例:")
    print(prometheus_metrics[:500] + "..." if len(prometheus_metrics) > 500 else prometheus_metrics)
    
    return dashboard

# demo_monitoring = demonstrate_monitoring_system()
```

## 实践练习

### 练习1：构建多租户DSPy服务

```python
class MultiTenantDSPyService:
    """多租户DSPy服务练习"""
    
    def __init__(self):
        self.tenant_configs = {}
        self.tenant_quotas = {}
        self.tenant_usage = {}
    
    def register_tenant(self, tenant_id, config, quota):
        """注册租户"""
        # TODO: 实现租户注册逻辑
        pass
    
    def route_request_by_tenant(self, tenant_id, request):
        """按租户路由请求"""
        # TODO: 实现租户级别的请求路由
        pass
    
    def enforce_tenant_limits(self, tenant_id):
        """执行租户限制"""
        # TODO: 实现租户配额和限流
        pass

# 练习任务：
# 1. 设计多租户架构
# 2. 实现租户隔离机制
# 3. 构建租户级别的监控和计费
```

### 练习2：实现自动扩缩容系统

```python
class AutoScalingSystem:
    """自动扩缩容系统练习"""
    
    def __init__(self):
        self.scaling_policies = {}
        self.instance_pool = {}
        self.load_balancer = None
    
    def define_scaling_policy(self, service_name, policy):
        """定义扩缩容策略"""
        # TODO: 实现扩缩容策略配置
        pass
    
    def monitor_system_load(self):
        """监控系统负载"""
        # TODO: 实现负载监控逻辑
        pass
    
    def execute_scaling_action(self, action):
        """执行扩缩容动作"""
        # TODO: 实现实际的扩缩容操作
        pass

# 练习任务：
# 1. 设计负载评估算法
# 2. 实现预测性扩缩容
# 3. 构建成本优化的扩缩容策略
```

## 最佳实践

### 1. 生产环境部署检查清单

```python
def production_deployment_checklist():
    """生产环境部署检查清单"""
    
    checklist = {
        '安全性': [
            '✓ API密钥和敏感信息已加密存储',
            '✓ 实施了访问控制和身份验证',
            '✓ 启用了HTTPS和SSL/TLS',
            '✓ 配置了防火墙和安全组',
            '✓ 实施了输入验证和输出过滤'
        ],
        
        '性能': [
            '✓ 启用了缓存机制',
            '✓ 配置了连接池',
            '✓ 实施了请求限流',
            '✓ 优化了数据库查询',
            '✓ 启用了压缩和CDN'
        ],
        
        '可靠性': [
            '✓ 配置了健康检查',
            '✓ 实施了熔断器模式',
            '✓ 设置了自动重试机制',
            '✓ 配置了多副本部署',
            '✓ 实施了灰度发布策略'
        ],
        
        '监控': [
            '✓ 配置了日志收集',
            '✓ 设置了性能监控',
            '✓ 配置了告警规则',
            '✓ 实施了分布式追踪',
            '✓ 设置了仪表板展示'
        ],
        
        '维护': [
            '✓ 建立了备份策略',
            '✓ 制定了灾难恢复计划',
            '✓ 设置了自动化部署',
            '✓ 建立了版本控制流程',
            '✓ 制定了运维手册'
        ]
    }
    
    return checklist

class ProductionReadinessValidator:
    """生产环境就绪性验证器"""
    
    def __init__(self):
        self.validation_rules = {}
        self.validation_results = {}
    
    def add_validation_rule(self, name, validator_func, severity='error'):
        """添加验证规则"""
        self.validation_rules[name] = {
            'validator': validator_func,
            'severity': severity
        }
    
    def validate_deployment(self, config):
        """验证部署配置"""
        
        results = {
            'passed': [],
            'warnings': [],
            'errors': [],
            'overall_status': 'unknown'
        }
        
        for rule_name, rule_config in self.validation_rules.items():
            try:
                is_valid, message = rule_config['validator'](config)
                
                result_entry = {
                    'rule': rule_name,
                    'status': 'passed' if is_valid else 'failed',
                    'message': message
                }
                
                if is_valid:
                    results['passed'].append(result_entry)
                elif rule_config['severity'] == 'warning':
                    results['warnings'].append(result_entry)
                else:
                    results['errors'].append(result_entry)
                    
            except Exception as e:
                results['errors'].append({
                    'rule': rule_name,
                    'status': 'error',
                    'message': f'验证失败: {str(e)}'
                })
        
        # 确定总体状态
        if results['errors']:
            results['overall_status'] = 'failed'
        elif results['warnings']:
            results['overall_status'] = 'warning'
        else:
            results['overall_status'] = 'passed'
        
        return results
    
    def generate_readiness_report(self, validation_results):
        """生成就绪性报告"""
        
        report_lines = [
            "🔍 生产环境就绪性评估报告",
            "=" * 50
        ]
        
        # 总体状态
        status_emoji = {
            'passed': '✅',
            'warning': '⚠️',
            'failed': '❌'
        }
        
        overall_status = validation_results['overall_status']
        report_lines.append(f"{status_emoji[overall_status]} 总体状态: {overall_status}")
        
        # 统计信息
        report_lines.append(f"通过: {len(validation_results['passed'])}")
        report_lines.append(f"警告: {len(validation_results['warnings'])}")
        report_lines.append(f"错误: {len(validation_results['errors'])}")
        
        # 详细结果
        if validation_results['errors']:
            report_lines.append("\n❌ 错误:")
            for error in validation_results['errors']:
                report_lines.append(f"  - {error['rule']}: {error['message']}")
        
        if validation_results['warnings']:
            report_lines.append("\n⚠️ 警告:")
            for warning in validation_results['warnings']:
                report_lines.append(f"  - {warning['rule']}: {warning['message']}")
        
        return "\n".join(report_lines)

# 示例验证规则
def create_production_validator():
    """创建生产环境验证器"""
    
    validator = ProductionReadinessValidator()
    
    # API密钥验证
    def validate_api_keys(config):
        api_key = config.get('api_key')
        if not api_key:
            return False, "缺少API密钥配置"
        if api_key.startswith('sk-') and len(api_key) > 20:
            return True, "API密钥格式正确"
        return False, "API密钥格式不正确"
    
    # 缓存配置验证
    def validate_cache_config(config):
        cache_config = config.get('cache', {})
        if not cache_config:
            return False, "缺少缓存配置", "warning"
        return True, "缓存配置已设置"
    
    # 监控配置验证
    def validate_monitoring(config):
        monitoring = config.get('monitoring', {})
        if not monitoring.get('enabled'):
            return False, "监控未启用"
        return True, "监控已启用"
    
    validator.add_validation_rule('api_keys', validate_api_keys, 'error')
    validator.add_validation_rule('cache_config', validate_cache_config, 'warning')
    validator.add_validation_rule('monitoring', validate_monitoring, 'error')
    
    return validator
```

### 2. 容器化和编排

```python
def generate_docker_configuration():
    """生成Docker配置"""
    
    dockerfile_content = '''
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 设置环境变量
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
'''
    
    docker_compose_content = '''
version: '3.8'

services:
  dspy-app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - dspy-app
    restart: unless-stopped

volumes:
  redis_data:
'''
    
    kubernetes_deployment = '''
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dspy-app
  labels:
    app: dspy-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dspy-app
  template:
    metadata:
      labels:
        app: dspy-app
    spec:
      containers:
      - name: dspy-app
        image: dspy-app:latest
        ports:
        - containerPort: 8000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: dspy-secrets
              key: openai-api-key
        resources:
          limits:
            memory: "1Gi"
            cpu: "500m"
          requests:
            memory: "512Mi"
            cpu: "250m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: dspy-app-service
spec:
  selector:
    app: dspy-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: LoadBalancer
'''
    
    return {
        'dockerfile': dockerfile_content,
        'docker_compose': docker_compose_content,
        'kubernetes': kubernetes_deployment
    }
```

通过本章的学习，你应该掌握了将DSPy应用部署到生产环境的完整方法。从架构设计到性能优化，从监控告警到容器化部署，这些技能将帮助你构建稳定、高效、可扩展的生产级AI应用系统。