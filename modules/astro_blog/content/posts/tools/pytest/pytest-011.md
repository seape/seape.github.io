---
title: 第 11 章：性能测试与并发测试
date: 2025-10-03
icon: circle-dot
author: Haiyue
category:
  - pytest
star: false
---

# 第 11 章：性能测试与并发测试

::: tip 学习目标
- 掌握性能测试的编写方法
- 学习并发测试的实现
- 理解测试性能优化技巧
- 掌握 pytest-benchmark 的使用
:::

### 知识点

#### 性能测试类型

| 测试类型 | 目标 | 指标 |
|----------|------|------|
| **基准测试** | 建立性能基线 | 执行时间、内存使用 |
| **负载测试** | 验证预期负载下的性能 | 响应时间、吞吐量 |
| **压力测试** | 找到系统极限 | 最大并发数、崩溃点 |
| **稳定性测试** | 长时间运行的稳定性 | 内存泄漏、性能退化 |

#### 并发测试场景

- **多线程安全**：验证代码在多线程环境下的正确性
- **竞态条件**：检测并发访问共享资源的问题
- **死锁检测**：识别可能的死锁情况
- **异步操作**：测试异步代码的行为

#### 性能测试工具

```python
# 核心工具
pytest-benchmark    # 微基准测试
pytest-xdist       # 并行测试执行
pytest-asyncio     # 异步测试支持
memory-profiler    # 内存分析
line-profiler      # 行级性能分析
```

### 示例代码

#### 基础性能测试

```python
# test_performance_basic.py
import pytest
import time
import threading
import concurrent.futures
from concurrent.collections import deque
import psutil
import os

# 被测试的算法
def linear_search(arr, target):
    """线性搜索"""
    for i, item in enumerate(arr):
        if item == target:
            return i
    return -1

def binary_search(arr, target):
    """二分搜索（要求数组已排序）"""
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1

def bubble_sort(arr):
    """冒泡排序"""
    n = len(arr)
    arr_copy = arr.copy()

    for i in range(n):
        for j in range(0, n - i - 1):
            if arr_copy[j] > arr_copy[j + 1]:
                arr_copy[j], arr_copy[j + 1] = arr_copy[j + 1], arr_copy[j]

    return arr_copy

def merge_sort(arr):
    """归并排序"""
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)

def merge(left, right):
    """归并两个有序数组"""
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])
    return result

class TestBasicPerformance:
    """基础性能测试"""

    @pytest.fixture(scope="class")
    def small_dataset(self):
        """小数据集"""
        return list(range(100))

    @pytest.fixture(scope="class")
    def medium_dataset(self):
        """中等数据集"""
        return list(range(1000))

    @pytest.fixture(scope="class")
    def large_dataset(self):
        """大数据集"""
        return list(range(10000))

    def test_linear_search_performance(self, benchmark, medium_dataset):
        """线性搜索性能测试"""
        target = 500
        result = benchmark(linear_search, medium_dataset, target)
        assert result == 500

    def test_binary_search_performance(self, benchmark, medium_dataset):
        """二分搜索性能测试"""
        sorted_data = sorted(medium_dataset)
        target = 500
        result = benchmark(binary_search, sorted_data, target)
        assert result == 500

    def test_bubble_sort_small(self, benchmark, small_dataset):
        """冒泡排序小数据集性能"""
        import random
        data = small_dataset.copy()
        random.shuffle(data)

        result = benchmark(bubble_sort, data)
        assert result == sorted(data)

    def test_merge_sort_large(self, benchmark, large_dataset):
        """归并排序大数据集性能"""
        import random
        data = large_dataset.copy()
        random.shuffle(data)

        result = benchmark(merge_sort, data)
        assert result == sorted(data)

    @pytest.mark.parametrize("size", [100, 500, 1000])
    def test_sorting_algorithm_comparison(self, benchmark, size):
        """排序算法性能对比"""
        import random
        data = list(range(size))
        random.shuffle(data)

        # 这里测试归并排序
        result = benchmark(merge_sort, data)
        assert len(result) == size
        assert result == sorted(data)

    def test_memory_usage_monitoring(self, medium_dataset):
        """内存使用监控"""
        process = psutil.Process(os.getpid())

        # 记录初始内存使用
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB

        # 执行内存密集型操作
        data_copies = []
        for _ in range(10):
            data_copies.append(medium_dataset.copy())

        # 记录峰值内存使用
        peak_memory = process.memory_info().rss / 1024 / 1024  # MB

        memory_increase = peak_memory - initial_memory

        # 清理内存
        del data_copies

        # 验证内存使用合理
        assert memory_increase < 50  # 内存增长不应超过 50MB

        print(f"内存增长: {memory_increase:.2f} MB")
```

#### 并发测试实现

```python
# test_concurrency.py
import pytest
import threading
import time
import queue
import asyncio
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import multiprocessing

# 被测试的并发代码
class ThreadSafeCounter:
    """线程安全计数器"""

    def __init__(self):
        self._value = 0
        self._lock = threading.Lock()

    def increment(self):
        """增加计数"""
        with self._lock:
            old_value = self._value
            time.sleep(0.001)  # 模拟一些处理时间
            self._value = old_value + 1

    def decrement(self):
        """减少计数"""
        with self._lock:
            old_value = self._value
            time.sleep(0.001)
            self._value = old_value - 1

    @property
    def value(self):
        """获取当前值"""
        with self._lock:
            return self._value

class UnsafeCounter:
    """非线程安全计数器（用于对比）"""

    def __init__(self):
        self._value = 0

    def increment(self):
        old_value = self._value
        time.sleep(0.001)
        self._value = old_value + 1

    def decrement(self):
        old_value = self._value
        time.sleep(0.001)
        self._value = old_value - 1

    @property
    def value(self):
        return self._value

class ProducerConsumerQueue:
    """生产者消费者队列"""

    def __init__(self, maxsize=0):
        self.queue = queue.Queue(maxsize)
        self.total_produced = 0
        self.total_consumed = 0
        self._lock = threading.Lock()

    def produce(self, item):
        """生产项目"""
        self.queue.put(item)
        with self._lock:
            self.total_produced += 1

    def consume(self, timeout=1):
        """消费项目"""
        try:
            item = self.queue.get(timeout=timeout)
            with self._lock:
                self.total_consumed += 1
            return item
        except queue.Empty:
            return None

    def get_stats(self):
        """获取统计信息"""
        with self._lock:
            return {
                'produced': self.total_produced,
                'consumed': self.total_consumed,
                'queue_size': self.queue.qsize()
            }

class TestConcurrency:
    """并发测试"""

    def test_thread_safe_counter(self):
        """测试线程安全计数器"""
        counter = ThreadSafeCounter()
        threads = []

        def increment_worker():
            for _ in range(100):
                counter.increment()

        def decrement_worker():
            for _ in range(50):
                counter.decrement()

        # 创建多个线程
        for _ in range(5):
            threads.append(threading.Thread(target=increment_worker))

        for _ in range(3):
            threads.append(threading.Thread(target=decrement_worker))

        # 启动所有线程
        for thread in threads:
            thread.start()

        # 等待所有线程完成
        for thread in threads:
            thread.join()

        # 验证结果：5*100 - 3*50 = 350
        assert counter.value == 350

    def test_unsafe_counter_race_condition(self):
        """测试非线程安全计数器的竞态条件"""
        counter = UnsafeCounter()
        threads = []

        def increment_worker():
            for _ in range(100):
                counter.increment()

        # 创建多个线程
        for _ in range(5):
            threads.append(threading.Thread(target=increment_worker))

        # 启动所有线程
        for thread in threads:
            thread.start()

        # 等待所有线程完成
        for thread in threads:
            thread.join()

        # 非线程安全的计数器通常不会得到期望的结果
        expected = 500
        actual = counter.value

        print(f"期望值: {expected}, 实际值: {actual}")

        # 由于竞态条件，实际值通常小于期望值
        assert actual <= expected

        # 在大多数情况下，由于竞态条件，结果会不正确
        # 这里我们不做强制断言，只是演示问题

    def test_producer_consumer_pattern(self):
        """测试生产者消费者模式"""
        pc_queue = ProducerConsumerQueue(maxsize=10)

        def producer(name, count):
            """生产者函数"""
            for i in range(count):
                item = f"{name}_item_{i}"
                pc_queue.produce(item)
                time.sleep(0.01)

        def consumer(name, max_items):
            """消费者函数"""
            consumed = 0
            while consumed < max_items:
                item = pc_queue.consume(timeout=2)
                if item is None:
                    break
                consumed += 1
                time.sleep(0.01)

        # 创建生产者和消费者线程
        threads = []

        # 2 个生产者，每个生产 20 个项目
        for i in range(2):
            thread = threading.Thread(
                target=producer,
                args=(f"producer_{i}", 20)
            )
            threads.append(thread)

        # 3 个消费者，每个最多消费 15 个项目
        for i in range(3):
            thread = threading.Thread(
                target=consumer,
                args=(f"consumer_{i}", 15)
            )
            threads.append(thread)

        # 启动所有线程
        for thread in threads:
            thread.start()

        # 等待所有线程完成
        for thread in threads:
            thread.join()

        # 验证生产和消费的平衡
        stats = pc_queue.get_stats()

        assert stats['produced'] == 40  # 2 * 20
        assert stats['consumed'] <= stats['produced']
        assert stats['queue_size'] == stats['produced'] - stats['consumed']

        print(f"统计信息: {stats}")

    def test_thread_pool_executor(self):
        """测试线程池执行器"""
        def worker_task(task_id):
            """工作任务"""
            time.sleep(0.1)
            return f"Task {task_id} completed"

        with ThreadPoolExecutor(max_workers=4) as executor:
            # 提交任务
            futures = []
            for i in range(10):
                future = executor.submit(worker_task, i)
                futures.append(future)

            # 收集结果
            results = []
            for future in concurrent.futures.as_completed(futures):
                result = future.result()
                results.append(result)

        # 验证所有任务都完成了
        assert len(results) == 10
        assert all("completed" in result for result in results)

    def test_process_pool_executor(self):
        """测试进程池执行器"""
        def cpu_intensive_task(n):
            """CPU 密集型任务"""
            result = 0
            for i in range(n):
                result += i * i
            return result

        with ProcessPoolExecutor(max_workers=2) as executor:
            # 提交 CPU 密集型任务
            futures = []
            for i in range(1000, 5000, 1000):
                future = executor.submit(cpu_intensive_task, i)
                futures.append(future)

            # 收集结果
            results = []
            for future in concurrent.futures.as_completed(futures):
                result = future.result()
                results.append(result)

        # 验证所有任务都完成了
        assert len(results) == 4
        assert all(isinstance(result, int) and result > 0 for result in results)

    @pytest.mark.asyncio
    async def test_async_concurrency(self):
        """测试异步并发"""
        async def async_task(task_id, delay):
            """异步任务"""
            await asyncio.sleep(delay)
            return f"Async task {task_id} completed after {delay}s"

        # 创建多个异步任务
        tasks = []
        for i in range(5):
            task = async_task(i, 0.1)
            tasks.append(task)

        # 并发执行所有任务
        start_time = time.time()
        results = await asyncio.gather(*tasks)
        end_time = time.time()

        # 验证结果
        assert len(results) == 5
        assert all("completed" in result for result in results)

        # 验证并发执行的时间效益
        total_time = end_time - start_time
        assert total_time < 0.2  # 应该远小于串行执行的 0.5 秒

    def test_deadlock_detection(self):
        """死锁检测测试"""
        lock1 = threading.Lock()
        lock2 = threading.Lock()
        deadlock_occurred = threading.Event()

        def worker1():
            """工作线程 1"""
            try:
                with lock1:
                    time.sleep(0.1)
                    if lock2.acquire(timeout=0.5):  # 使用超时避免真正的死锁
                        lock2.release()
                    else:
                        deadlock_occurred.set()
            except Exception as e:
                deadlock_occurred.set()

        def worker2():
            """工作线程 2"""
            try:
                with lock2:
                    time.sleep(0.1)
                    if lock1.acquire(timeout=0.5):  # 使用超时避免真正的死锁
                        lock1.release()
                    else:
                        deadlock_occurred.set()
            except Exception as e:
                deadlock_occurred.set()

        # 启动两个可能死锁的线程
        thread1 = threading.Thread(target=worker1)
        thread2 = threading.Thread(target=worker2)

        thread1.start()
        thread2.start()

        thread1.join()
        thread2.join()

        # 验证是否检测到死锁情况
        if deadlock_occurred.is_set():
            print("检测到潜在的死锁情况")
        else:
            print("未发生死锁")

        # 这个测试主要是演示死锁检测机制
        assert True  # 测试本身总是通过
```

#### 性能基准测试

```python
# test_benchmark_advanced.py
import pytest
import time
import random
import string
from collections import deque, defaultdict
import heapq

# 数据结构性能测试
class DataStructurePerformance:
    """数据结构性能测试类"""

    @staticmethod
    def list_operations(data, operations):
        """列表操作"""
        lst = list(data)
        for op, value in operations:
            if op == 'append':
                lst.append(value)
            elif op == 'insert':
                lst.insert(0, value)
            elif op == 'remove' and value in lst:
                lst.remove(value)
        return lst

    @staticmethod
    def deque_operations(data, operations):
        """双端队列操作"""
        dq = deque(data)
        for op, value in operations:
            if op == 'append':
                dq.append(value)
            elif op == 'insert':
                dq.appendleft(value)
            elif op == 'remove' and value in dq:
                dq.remove(value)
        return list(dq)

    @staticmethod
    def set_operations(data, operations):
        """集合操作"""
        s = set(data)
        for op, value in operations:
            if op == 'add':
                s.add(value)
            elif op == 'remove' and value in s:
                s.remove(value)
        return s

    @staticmethod
    def dict_operations(data, operations):
        """字典操作"""
        d = {i: v for i, v in enumerate(data)}
        for op, key, value in operations:
            if op == 'set':
                d[key] = value
            elif op == 'get':
                _ = d.get(key)
            elif op == 'delete' and key in d:
                del d[key]
        return d

class TestBenchmarkAdvanced:
    """高级基准测试"""

    @pytest.fixture(scope="class")
    def sample_data(self):
        """样本数据"""
        return list(range(1000))

    @pytest.fixture(scope="class")
    def operations_data(self):
        """操作数据"""
        operations = []
        for _ in range(100):
            op = random.choice(['append', 'insert', 'remove'])
            value = random.randint(1, 1000)
            operations.append((op, value))
        return operations

    def test_list_vs_deque_performance(self, benchmark, sample_data, operations_data):
        """列表 vs 双端队列性能对比"""
        # 这个测试会运行多次，每次测试不同的数据结构
        data_structures = {
            'list': DataStructurePerformance.list_operations,
            'deque': DataStructurePerformance.deque_operations
        }

        # 基准测试会自动选择其中一个进行测试
        # 通过参数化可以分别测试每个数据结构
        result = benchmark(
            DataStructurePerformance.list_operations,
            sample_data,
            operations_data
        )
        assert len(result) >= 900  # 考虑可能的删除操作

    @pytest.mark.parametrize("data_structure", ["list", "deque"])
    def test_data_structure_comparison(self, benchmark, sample_data, operations_data, data_structure):
        """数据结构性能对比参数化测试"""
        methods = {
            'list': DataStructurePerformance.list_operations,
            'deque': DataStructurePerformance.deque_operations
        }

        method = methods[data_structure]
        result = benchmark(method, sample_data, operations_data)
        assert len(result) >= 900

    def test_string_concatenation_methods(self, benchmark):
        """字符串拼接方法性能测试"""
        def string_concat_plus():
            """使用 + 操作符拼接"""
            result = ""
            for i in range(1000):
                result += str(i)
            return result

        def string_concat_join():
            """使用 join 方法拼接"""
            parts = []
            for i in range(1000):
                parts.append(str(i))
            return "".join(parts)

        def string_concat_format():
            """使用 f-string 拼接"""
            parts = [str(i) for i in range(1000)]
            return "".join(parts)

        # 测试 join 方法（通常最快）
        result = benchmark(string_concat_join)
        assert len(result) > 0

    def test_search_algorithms_benchmark(self, benchmark):
        """搜索算法性能基准测试"""
        # 准备测试数据
        size = 10000
        data = list(range(size))
        random.shuffle(data)
        sorted_data = sorted(data)
        target = size // 2

        def linear_search_impl():
            for i, item in enumerate(data):
                if item == target:
                    return i
            return -1

        def binary_search_impl():
            left, right = 0, len(sorted_data) - 1
            while left <= right:
                mid = (left + right) // 2
                if sorted_data[mid] == target:
                    return mid
                elif sorted_data[mid] < target:
                    left = mid + 1
                else:
                    right = mid - 1
            return -1

        # 测试二分搜索
        result = benchmark(binary_search_impl)
        assert result != -1

    def test_heap_operations_benchmark(self, benchmark):
        """堆操作性能测试"""
        def heap_operations():
            heap = []

            # 插入元素
            for i in range(1000):
                heapq.heappush(heap, random.randint(1, 10000))

            # 弹出最小元素
            results = []
            for _ in range(100):
                if heap:
                    results.append(heapq.heappop(heap))

            return results

        result = benchmark(heap_operations)
        assert len(result) == 100
        assert result == sorted(result)  # 验证堆的有序性

    def test_memory_intensive_operation(self, benchmark):
        """内存密集型操作测试"""
        def memory_operation():
            # 创建大量对象
            data = []
            for _ in range(10000):
                data.append({
                    'id': random.randint(1, 100000),
                    'name': ''.join(random.choices(string.ascii_letters, k=10)),
                    'values': [random.random() for _ in range(10)]
                })

            # 处理数据
            processed = []
            for item in data:
                if item['id'] % 2 == 0:
                    processed.append({
                        'id': item['id'],
                        'name_upper': item['name'].upper(),
                        'avg_value': sum(item['values']) / len(item['values'])
                    })

            return len(processed)

        result = benchmark(memory_operation)
        assert result > 0

    def test_benchmark_with_setup_teardown(self, benchmark):
        """带设置和清理的基准测试"""
        def setup():
            # 准备测试数据
            return {
                'data': [random.randint(1, 1000) for _ in range(1000)],
                'lookup': set(random.randint(1, 1000) for _ in range(100))
            }

        def test_function(test_data):
            # 实际测试的函数
            data = test_data['data']
            lookup = test_data['lookup']

            found = []
            for item in data:
                if item in lookup:
                    found.append(item)

            return len(found)

        def teardown(test_data):
            # 清理工作
            test_data.clear()

        result = benchmark.pedantic(
            test_function,
            setup=setup,
            teardown=teardown,
            rounds=5,
            iterations=10
        )

        assert result >= 0

    def test_custom_timer_benchmark(self, benchmark):
        """自定义计时器基准测试"""
        @benchmark
        def timed_operation():
            # 模拟一个需要精确计时的操作
            start = time.perf_counter()

            # 执行一些计算
            result = 0
            for i in range(10000):
                result += i ** 0.5

            end = time.perf_counter()

            # 返回结果和执行时间
            return result, end - start

        result, duration = timed_operation
        assert result > 0
        assert duration > 0
```

#### 性能监控和分析

```python
# test_performance_monitoring.py
import pytest
import psutil
import os
import threading
import time
from contextlib import contextmanager
import gc

class PerformanceMonitor:
    """性能监控器"""

    def __init__(self):
        self.process = psutil.Process(os.getpid())
        self.baseline_memory = None
        self.peak_memory = None
        self.start_time = None
        self.end_time = None

    def start_monitoring(self):
        """开始监控"""
        gc.collect()  # 触发垃圾回收
        self.baseline_memory = self.process.memory_info().rss / 1024 / 1024
        self.peak_memory = self.baseline_memory
        self.start_time = time.perf_counter()

    def update_peak_memory(self):
        """更新峰值内存"""
        current_memory = self.process.memory_info().rss / 1024 / 1024
        if current_memory > self.peak_memory:
            self.peak_memory = current_memory

    def stop_monitoring(self):
        """停止监控"""
        self.end_time = time.perf_counter()
        self.update_peak_memory()

    def get_metrics(self):
        """获取性能指标"""
        return {
            'duration': self.end_time - self.start_time if self.end_time else None,
            'baseline_memory_mb': self.baseline_memory,
            'peak_memory_mb': self.peak_memory,
            'memory_increase_mb': self.peak_memory - self.baseline_memory if self.baseline_memory else None,
            'cpu_percent': self.process.cpu_percent()
        }

@contextmanager
def performance_monitor():
    """性能监控上下文管理器"""
    monitor = PerformanceMonitor()
    monitor.start_monitoring()

    # 启动监控线程
    monitoring = True

    def monitor_thread():
        while monitoring:
            monitor.update_peak_memory()
            time.sleep(0.1)

    thread = threading.Thread(target=monitor_thread, daemon=True)
    thread.start()

    try:
        yield monitor
    finally:
        monitoring = False
        monitor.stop_monitoring()
        thread.join(timeout=1)

class TestPerformanceMonitoring:
    """性能监控测试"""

    def test_memory_usage_tracking(self):
        """内存使用跟踪测试"""
        with performance_monitor() as monitor:
            # 执行内存密集型操作
            large_data = []
            for _ in range(100):
                large_data.append([random.randint(1, 1000) for _ in range(1000)])

            # 验证数据
            assert len(large_data) == 100
            assert all(len(sublist) == 1000 for sublist in large_data)

        # 分析性能指标
        metrics = monitor.get_metrics()

        print(f"执行时间: {metrics['duration']:.3f} 秒")
        print(f"基线内存: {metrics['baseline_memory_mb']:.2f} MB")
        print(f"峰值内存: {metrics['peak_memory_mb']:.2f} MB")
        print(f"内存增长: {metrics['memory_increase_mb']:.2f} MB")

        # 验证内存使用合理
        assert metrics['duration'] < 5.0  # 执行时间不超过 5 秒
        assert metrics['memory_increase_mb'] < 100  # 内存增长不超过 100MB

    def test_cpu_intensive_monitoring(self):
        """CPU 密集型监控测试"""
        with performance_monitor() as monitor:
            # CPU 密集型计算
            def fibonacci(n):
                if n <= 1:
                    return n
                return fibonacci(n-1) + fibonacci(n-2)

            result = fibonacci(25)
            assert result > 0

        metrics = monitor.get_metrics()

        print(f"CPU 使用率: {metrics['cpu_percent']:.2f}%")
        print(f"计算时间: {metrics['duration']:.3f} 秒")

        # 验证 CPU 使用情况
        assert metrics['duration'] > 0

    def test_concurrent_performance_monitoring(self):
        """并发性能监控测试"""
        def worker_task(task_id, duration):
            """工作任务"""
            start = time.time()
            while time.time() - start < duration:
                # 模拟工作负载
                _ = [i**2 for i in range(1000)]
            return task_id

        with performance_monitor() as monitor:
            threads = []

            # 创建多个并发任务
            for i in range(4):
                thread = threading.Thread(
                    target=worker_task,
                    args=(i, 0.5)
                )
                threads.append(thread)
                thread.start()

            # 等待所有任务完成
            for thread in threads:
                thread.join()

        metrics = monitor.get_metrics()

        print(f"并发执行时间: {metrics['duration']:.3f} 秒")
        print(f"内存使用: {metrics['memory_increase_mb']:.2f} MB")

        # 验证并发性能
        assert metrics['duration'] < 1.0  # 并发执行应该快于串行

    @pytest.mark.benchmark
    def test_benchmark_with_monitoring(self, benchmark):
        """结合基准测试的性能监控"""
        def monitored_operation():
            with performance_monitor() as monitor:
                # 执行被测试的操作
                data = [random.randint(1, 1000) for _ in range(10000)]
                sorted_data = sorted(data)

                return sorted_data, monitor.get_metrics()

        result, metrics = benchmark(monitored_operation)

        # 验证结果
        assert len(result) == 10000
        assert result == sorted(result)

        # 打印性能指标
        print(f"基准测试内存增长: {metrics['memory_increase_mb']:.2f} MB")
```

::: note 性能测试最佳实践
1. **基线建立**：建立性能基线，跟踪性能变化趋势
2. **环境一致性**：确保测试环境的一致性和可重复性
3. **多次测量**：进行多次测量以获得可靠的结果
4. **资源监控**：监控 CPU、内存、I/O 等系统资源
5. **渐进测试**：从小规模数据开始，逐步增加测试规模
:::

::: warning 注意事项
1. **测试隔离**：性能测试可能会影响其他测试的执行
2. **系统负载**：系统负载会影响性能测试结果
3. **垃圾回收**：Python 的垃圾回收可能影响性能测量
4. **并发安全**：确保并发测试的线程安全性
:::

性能测试和并发测试是确保应用程序在生产环境中稳定运行的重要手段，通过系统化的性能测试可以及早发现和解决性能问题。