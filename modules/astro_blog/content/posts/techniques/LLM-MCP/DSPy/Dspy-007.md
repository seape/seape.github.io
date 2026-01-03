---
title: "第07章：多步推理和复杂任务分解"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第07章：多步推理和复杂任务分解

::: tip 学习目标
- 设计多步推理的DSPy程序
- 实现任务分解和子任务协调
- 构建条件执行和分支逻辑
- 学习错误处理和异常恢复
- 优化复杂推理链的性能
:::

## 知识点

### 1. 多步推理基础

多步推理是解决复杂问题的关键技术，通过将复杂问题分解为多个简单步骤来提高求解精度。

#### 推理链设计原则

```python
import dspy
from typing import List, Dict, Any, Optional, Union, Callable
from dataclasses import dataclass
from enum import Enum
import time
import json

class ReasoningStep:
    """推理步骤基类"""
    
    def __init__(self, step_name: str, description: str = ""):
        self.step_name = step_name
        self.description = description
        self.inputs = {}
        self.outputs = {}
        self.execution_time = 0.0
        self.success = False
        self.error_message = ""
    
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """执行推理步骤"""
        start_time = time.time()
        
        try:
            self.inputs = self.extract_inputs(context)
            result = self.process(self.inputs)
            self.outputs = result
            self.success = True
            
        except Exception as e:
            self.success = False
            self.error_message = str(e)
            self.outputs = {}
        
        finally:
            self.execution_time = time.time() - start_time
        
        return self.outputs
    
    def extract_inputs(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """从上下文中提取输入"""
        # 子类需要实现
        raise NotImplementedError
    
    def process(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """处理逻辑"""
        # 子类需要实现
        raise NotImplementedError
    
    def get_summary(self) -> Dict[str, Any]:
        """获取步骤摘要"""
        return {
            'step_name': self.step_name,
            'description': self.description,
            'success': self.success,
            'execution_time': self.execution_time,
            'error_message': self.error_message,
            'inputs': self.inputs,
            'outputs': self.outputs
        }

class MultiStepReasoner(dspy.Module):
    """多步推理器"""
    
    def __init__(self):
        super().__init__()
        
        self.reasoning_steps = []
        self.context = {}
        self.execution_trace = []
        
        # DSPy 模块用于不同类型的推理
        self.problem_analyzer = dspy.ChainOfThought(
            "problem -> analysis, sub_problems",
            instructions="分析问题的复杂性，识别需要解决的子问题。"
        )
        
        self.step_planner = dspy.ChainOfThought(
            "problem, analysis -> reasoning, plan",
            instructions="基于问题分析，制定详细的解决步骤计划。"
        )
        
        self.step_executor = dspy.ChainOfThought(
            "step_description, available_info -> reasoning, result",
            instructions="执行特定的推理步骤，基于可用信息得出结果。"
        )
        
        self.result_synthesizer = dspy.ChainOfThought(
            "original_problem, step_results -> reasoning, final_answer",
            instructions="综合各步骤的结果，形成对原问题的完整答案。"
        )
    
    def add_step(self, step: ReasoningStep):
        """添加推理步骤"""
        self.reasoning_steps.append(step)
    
    def forward(self, problem: str):
        """执行多步推理"""
        
        print(f"🧠 开始多步推理: {problem}")
        
        # 1. 问题分析
        analysis_result = self.problem_analyzer(problem=problem)
        self.context['original_problem'] = problem
        self.context['analysis'] = analysis_result.analysis
        self.context['sub_problems'] = analysis_result.sub_problems
        
        print(f"📋 问题分析: {analysis_result.analysis}")
        
        # 2. 制定计划
        plan_result = self.step_planner(
            problem=problem,
            analysis=analysis_result.analysis
        )
        self.context['plan'] = plan_result.plan
        
        print(f"📝 执行计划: {plan_result.plan}")
        
        # 3. 执行推理步骤
        step_results = []
        
        for i, step in enumerate(self.reasoning_steps):
            print(f"\n🔄 执行步骤 {i+1}: {step.step_name}")
            
            # 执行步骤
            step_output = step.execute(self.context)
            
            # 更新上下文
            self.context[f'step_{i+1}_result'] = step_output
            
            # 记录执行轨迹
            step_summary = step.get_summary()
            self.execution_trace.append(step_summary)
            step_results.append(step_summary)
            
            if step.success:
                print(f"✅ 步骤 {i+1} 完成")
            else:
                print(f"❌ 步骤 {i+1} 失败: {step.error_message}")
                
                # 可以选择是否继续执行后续步骤
                if self.should_continue_after_error(step, i):
                    print("⚠️ 继续执行后续步骤")
                    continue
                else:
                    print("🛑 终止执行")
                    break
        
        # 4. 结果综合
        final_result = self.result_synthesizer(
            original_problem=problem,
            step_results=json.dumps(step_results, ensure_ascii=False, indent=2)
        )
        
        return dspy.Prediction(
            problem=problem,
            analysis=analysis_result.analysis,
            plan=plan_result.plan,
            step_results=step_results,
            execution_trace=self.execution_trace,
            final_answer=final_result.final_answer,
            reasoning=final_result.reasoning
        )
    
    def should_continue_after_error(self, failed_step: ReasoningStep, step_index: int) -> bool:
        """决定是否在错误后继续执行"""
        # 可以实现更复杂的错误处理逻辑
        # 例如：某些步骤是可选的，某些步骤是必需的
        return False

# 具体的推理步骤实现
class FactExtractionStep(ReasoningStep):
    """事实提取步骤"""
    
    def __init__(self):
        super().__init__("fact_extraction", "从输入中提取关键事实")
        self.extractor = dspy.ChainOfThought(
            "text -> reasoning, facts",
            instructions="从给定文本中提取关键事实和信息。"
        )
    
    def extract_inputs(self, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'text': context.get('original_problem', '') + ' ' + context.get('analysis', '')
        }
    
    def process(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        result = self.extractor(text=inputs['text'])
        return {
            'extracted_facts': result.facts,
            'reasoning': result.reasoning
        }

class LogicalInferenceStep(ReasoningStep):
    """逻辑推理步骤"""
    
    def __init__(self):
        super().__init__("logical_inference", "基于已知事实进行逻辑推理")
        self.inferencer = dspy.ChainOfThought(
            "facts, rules -> reasoning, inferences",
            instructions="基于给定的事实和规则，进行逻辑推理得出新的结论。"
        )
    
    def extract_inputs(self, context: Dict[str, Any]) -> Dict[str, Any]:
        facts = context.get('step_1_result', {}).get('extracted_facts', '')
        return {
            'facts': facts,
            'rules': "使用常识和逻辑规则进行推理"
        }
    
    def process(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        result = self.inferencer(
            facts=inputs['facts'],
            rules=inputs['rules']
        )
        return {
            'inferences': result.inferences,
            'reasoning': result.reasoning
        }

class CalculationStep(ReasoningStep):
    """计算步骤"""
    
    def __init__(self):
        super().__init__("calculation", "执行数学计算")
        self.calculator = dspy.ChainOfThought(
            "problem, values -> reasoning, calculation, result",
            instructions="识别需要计算的数学问题，执行计算并给出结果。"
        )
    
    def extract_inputs(self, context: Dict[str, Any]) -> Dict[str, Any]:
        # 从之前的步骤中提取数值信息
        problem = context.get('original_problem', '')
        inferences = context.get('step_2_result', {}).get('inferences', '')
        
        return {
            'problem': problem,
            'values': inferences
        }
    
    def process(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        result = self.calculator(
            problem=inputs['problem'],
            values=inputs['values']
        )
        return {
            'calculation_steps': result.calculation,
            'final_result': result.result,
            'reasoning': result.reasoning
        }

# 使用示例
def demonstrate_multi_step_reasoning():
    """演示多步推理"""
    
    # 创建多步推理器
    reasoner = MultiStepReasoner()
    
    # 添加推理步骤
    reasoner.add_step(FactExtractionStep())
    reasoner.add_step(LogicalInferenceStep())
    reasoner.add_step(CalculationStep())
    
    # 测试复杂问题
    complex_problem = """
    小明有50元，买了3支笔，每支笔12元。然后他又买了2本书，每本书的价格是剩余钱数的1/4。
    请问小明最后还剩多少钱？
    """
    
    result = reasoner(complex_problem)
    
    print(f"\n📊 推理结果:")
    print(f"原问题: {result.problem}")
    print(f"分析: {result.analysis}")
    print(f"计划: {result.plan}")
    print(f"最终答案: {result.final_answer}")
    
    print(f"\n🔍 执行轨迹:")
    for i, step in enumerate(result.step_results):
        print(f"  步骤 {i+1} ({step['step_name']}): {'✅' if step['success'] else '❌'}")
        if step['success']:
            print(f"    输出: {step['outputs']}")
        else:
            print(f"    错误: {step['error_message']}")
    
    return result

# demo_result = demonstrate_multi_step_reasoning()
```

### 2. 任务分解和子任务协调

复杂任务需要合理的分解策略和有效的子任务协调机制。

```python
class TaskDecomposer(dspy.Module):
    """任务分解器"""
    
    def __init__(self):
        super().__init__()
        
        # 任务分解模块
        self.decomposer = dspy.ChainOfThought(
            "complex_task -> reasoning, subtasks",
            instructions="""将复杂任务分解为多个独立的子任务：
            1. 每个子任务应该是相对独立的
            2. 子任务之间的依赖关系要明确
            3. 每个子任务都有清晰的输入和输出
            4. 按执行顺序排列子任务"""
        )
        
        # 依赖分析模块
        self.dependency_analyzer = dspy.ChainOfThought(
            "subtasks -> reasoning, dependencies",
            instructions="分析子任务之间的依赖关系，确定执行顺序。"
        )
        
        # 子任务执行器
        self.subtask_executor = dspy.ChainOfThought(
            "subtask, context -> reasoning, result",
            instructions="执行特定的子任务，基于上下文信息产生结果。"
        )
    
    def forward(self, complex_task: str):
        """分解和执行复杂任务"""
        
        print(f"🎯 开始任务分解: {complex_task}")
        
        # 1. 任务分解
        decomposition_result = self.decomposer(complex_task=complex_task)
        
        # 解析子任务
        subtasks = self.parse_subtasks(decomposition_result.subtasks)
        
        print(f"📋 分解出 {len(subtasks)} 个子任务:")
        for i, subtask in enumerate(subtasks, 1):
            print(f"  {i}. {subtask['name']}: {subtask['description']}")
        
        # 2. 分析依赖关系
        dependency_result = self.dependency_analyzer(
            subtasks=decomposition_result.subtasks
        )
        
        dependencies = self.parse_dependencies(dependency_result.dependencies)
        
        print(f"\n🔗 依赖关系: {dependencies}")
        
        # 3. 按依赖顺序执行子任务
        execution_order = self.determine_execution_order(subtasks, dependencies)
        
        print(f"\n📅 执行顺序: {[task['name'] for task in execution_order]}")
        
        context = {'original_task': complex_task}
        subtask_results = []
        
        for subtask in execution_order:
            print(f"\n🔄 执行子任务: {subtask['name']}")
            
            try:
                # 执行子任务
                result = self.subtask_executor(
                    subtask=subtask['description'],
                    context=json.dumps(context, ensure_ascii=False)
                )
                
                # 记录结果
                subtask_result = {
                    'name': subtask['name'],
                    'description': subtask['description'],
                    'result': result.result,
                    'reasoning': result.reasoning,
                    'success': True
                }
                
                # 更新上下文
                context[subtask['name']] = result.result
                
                print(f"✅ 子任务完成: {result.result}")
                
            except Exception as e:
                subtask_result = {
                    'name': subtask['name'],
                    'description': subtask['description'],
                    'error': str(e),
                    'success': False
                }
                
                print(f"❌ 子任务失败: {str(e)}")
            
            subtask_results.append(subtask_result)
        
        # 4. 整合结果
        final_result = self.integrate_results(complex_task, subtask_results, context)
        
        return dspy.Prediction(
            complex_task=complex_task,
            subtasks=subtasks,
            dependencies=dependencies,
            execution_order=[task['name'] for task in execution_order],
            subtask_results=subtask_results,
            final_result=final_result
        )
    
    def parse_subtasks(self, subtasks_text: str) -> List[Dict[str, str]]:
        """解析子任务"""
        import re
        
        # 简单的解析逻辑（实际应用中可能需要更复杂的解析）
        tasks = []
        lines = subtasks_text.strip().split('\n')
        
        for line in lines:
            # 匹配格式如 "1. 任务名称: 任务描述"
            match = re.match(r'(\d+)\.\s*([^:]+):\s*(.+)', line.strip())
            if match:
                tasks.append({
                    'id': match.group(1),
                    'name': match.group(2).strip(),
                    'description': match.group(3).strip()
                })
        
        return tasks
    
    def parse_dependencies(self, dependencies_text: str) -> Dict[str, List[str]]:
        """解析依赖关系"""
        # 简化的依赖解析
        # 实际应用中需要更复杂的解析逻辑
        return {}
    
    def determine_execution_order(self, subtasks: List[Dict], dependencies: Dict) -> List[Dict]:
        """确定执行顺序"""
        # 简化版：如果没有复杂依赖，按原顺序执行
        return subtasks
    
    def integrate_results(self, original_task: str, subtask_results: List[Dict], context: Dict) -> str:
        """整合子任务结果"""
        
        integrator = dspy.ChainOfThought(
            "original_task, subtask_results -> reasoning, integrated_result",
            instructions="基于各子任务的执行结果，整合出对原始任务的完整解答。"
        )
        
        result = integrator(
            original_task=original_task,
            subtask_results=json.dumps(subtask_results, ensure_ascii=False, indent=2)
        )
        
        return result.integrated_result

class ParallelTaskExecutor:
    """并行任务执行器"""
    
    def __init__(self, max_workers: int = 3):
        self.max_workers = max_workers
        self.task_queue = []
        self.completed_tasks = {}
        self.failed_tasks = {}
    
    def add_task(self, task_id: str, task_func: Callable, dependencies: List[str] = None):
        """添加任务"""
        self.task_queue.append({
            'id': task_id,
            'func': task_func,
            'dependencies': dependencies or [],
            'status': 'pending'
        })
    
    def execute_tasks(self) -> Dict[str, Any]:
        """执行所有任务"""
        print(f"🚀 开始并行任务执行，最大并发数: {self.max_workers}")
        
        while self.task_queue:
            # 找到可以执行的任务（依赖已完成）
            ready_tasks = self.get_ready_tasks()
            
            if not ready_tasks:
                # 检查是否有循环依赖或无法满足的依赖
                if self.has_unresolvable_dependencies():
                    print("❌ 存在无法解决的依赖关系")
                    break
                else:
                    print("⏳ 等待依赖任务完成...")
                    continue
            
            # 执行准备好的任务
            self.execute_ready_tasks(ready_tasks)
        
        return {
            'completed': self.completed_tasks,
            'failed': self.failed_tasks,
            'remaining': [task['id'] for task in self.task_queue]
        }
    
    def get_ready_tasks(self) -> List[Dict]:
        """获取可以执行的任务"""
        ready_tasks = []
        
        for task in self.task_queue:
            if task['status'] == 'pending':
                # 检查依赖是否都已完成
                dependencies_met = all(
                    dep in self.completed_tasks 
                    for dep in task['dependencies']
                )
                
                if dependencies_met:
                    ready_tasks.append(task)
        
        return ready_tasks[:self.max_workers]  # 限制并发数
    
    def execute_ready_tasks(self, ready_tasks: List[Dict]):
        """执行准备好的任务"""
        for task in ready_tasks:
            print(f"🔄 执行任务: {task['id']}")
            task['status'] = 'running'
            
            try:
                # 准备依赖任务的结果作为输入
                dependency_results = {
                    dep: self.completed_tasks[dep] 
                    for dep in task['dependencies']
                }
                
                # 执行任务
                result = task['func'](dependency_results)
                
                # 记录成功结果
                self.completed_tasks[task['id']] = result
                self.task_queue.remove(task)
                
                print(f"✅ 任务完成: {task['id']}")
                
            except Exception as e:
                # 记录失败结果
                self.failed_tasks[task['id']] = str(e)
                self.task_queue.remove(task)
                
                print(f"❌ 任务失败: {task['id']} - {str(e)}")
    
    def has_unresolvable_dependencies(self) -> bool:
        """检查是否有无法解决的依赖"""
        remaining_task_ids = {task['id'] for task in self.task_queue}
        
        for task in self.task_queue:
            for dep in task['dependencies']:
                # 依赖的任务既不在完成列表中，也不在剩余任务中
                if dep not in self.completed_tasks and dep not in remaining_task_ids:
                    return True
        
        return False

# 使用示例
def demonstrate_task_decomposition():
    """演示任务分解"""
    
    decomposer = TaskDecomposer()
    
    complex_task = """
    为一家新开的咖啡店制定完整的营销策略，包括市场调研、品牌定位、
    推广渠道选择、预算分配和效果评估方案。
    """
    
    result = decomposer(complex_task)
    
    print(f"📊 任务分解结果:")
    print(f"原始任务: {result.complex_task}")
    print(f"最终结果: {result.final_result}")
    
    return result

def demonstrate_parallel_execution():
    """演示并行任务执行"""
    
    executor = ParallelTaskExecutor(max_workers=2)
    
    # 定义示例任务函数
    def market_research(deps):
        time.sleep(1)  # 模拟执行时间
        return "市场调研报告：目标客群为年轻白领，偏好高品质咖啡"
    
    def competitor_analysis(deps):
        time.sleep(1)
        return "竞争对手分析：周边有3家咖啡店，价格中等"
    
    def brand_positioning(deps):
        # 需要市场调研的结果
        market_info = deps.get('market_research', '')
        time.sleep(1)
        return f"品牌定位：基于{market_info}，定位为精品咖啡品牌"
    
    def promotion_strategy(deps):
        # 需要品牌定位和竞争分析的结果
        brand = deps.get('brand_positioning', '')
        competitor = deps.get('competitor_analysis', '')
        time.sleep(1)
        return f"推广策略：结合{brand}和{competitor}，采用社交媒体营销"
    
    # 添加任务
    executor.add_task('market_research', market_research)
    executor.add_task('competitor_analysis', competitor_analysis)
    executor.add_task('brand_positioning', brand_positioning, ['market_research'])
    executor.add_task('promotion_strategy', promotion_strategy, 
                     ['brand_positioning', 'competitor_analysis'])
    
    # 执行任务
    results = executor.execute_tasks()
    
    print(f"\n📈 并行执行结果:")
    for task_id, result in results['completed'].items():
        print(f"  {task_id}: {result}")
    
    return results

# demo_decomposition = demonstrate_task_decomposition()
# demo_parallel = demonstrate_parallel_execution()
```

### 3. 条件执行和分支逻辑

复杂推理经常需要根据中间结果做出决策，实现条件执行。

```python
class ConditionalReasoner(dspy.Module):
    """条件推理器"""
    
    def __init__(self):
        super().__init__()
        
        # 条件判断模块
        self.condition_evaluator = dspy.ChainOfThought(
            "context, condition -> reasoning, evaluation_result",
            instructions="评估给定条件是否满足，返回true或false，并说明理由。"
        )
        
        # 决策制定模块
        self.decision_maker = dspy.ChainOfThought(
            "context, options -> reasoning, decision",
            instructions="基于当前情况从多个选项中选择最佳决策。"
        )
    
    def evaluate_condition(self, context: Dict[str, Any], condition: str) -> bool:
        """评估条件"""
        result = self.condition_evaluator(
            context=json.dumps(context, ensure_ascii=False),
            condition=condition
        )
        
        # 解析布尔结果
        evaluation = result.evaluation_result.lower()
        return 'true' in evaluation or '是' in evaluation or '满足' in evaluation
    
    def make_decision(self, context: Dict[str, Any], options: List[str]) -> str:
        """做出决策"""
        options_text = '\n'.join([f"{i+1}. {opt}" for i, opt in enumerate(options)])
        
        result = self.decision_maker(
            context=json.dumps(context, ensure_ascii=False),
            options=options_text
        )
        
        return result.decision

class BranchingWorkflow:
    """分支工作流"""
    
    def __init__(self):
        self.nodes = {}  # 工作流节点
        self.edges = {}  # 节点间的连接
        self.conditional_reasoner = ConditionalReasoner()
    
    def add_node(self, node_id: str, node_type: str, processor: Callable, 
                 conditions: List[Dict] = None):
        """添加工作流节点"""
        self.nodes[node_id] = {
            'id': node_id,
            'type': node_type,  # 'process', 'condition', 'decision'
            'processor': processor,
            'conditions': conditions or [],
            'next_nodes': []
        }
    
    def add_edge(self, from_node: str, to_node: str, condition: str = None):
        """添加节点间的连接"""
        if from_node not in self.edges:
            self.edges[from_node] = []
        
        self.edges[from_node].append({
            'to': to_node,
            'condition': condition
        })
    
    def execute_workflow(self, start_node: str, initial_context: Dict[str, Any]) -> Dict[str, Any]:
        """执行工作流"""
        print(f"🌟 开始执行工作流，起始节点: {start_node}")
        
        current_node = start_node
        context = initial_context.copy()
        execution_path = []
        
        while current_node:
            print(f"\n📍 当前节点: {current_node}")
            
            if current_node not in self.nodes:
                print(f"❌ 节点 {current_node} 不存在")
                break
            
            node = self.nodes[current_node]
            execution_path.append(current_node)
            
            # 执行节点处理逻辑
            try:
                if node['type'] == 'process':
                    result = node['processor'](context)
                    context.update(result)
                    print(f"🔄 处理结果: {result}")
                
                elif node['type'] == 'condition':
                    # 条件节点
                    for condition_spec in node['conditions']:
                        condition_met = self.conditional_reasoner.evaluate_condition(
                            context, condition_spec['condition']
                        )
                        
                        print(f"🔍 条件评估: {condition_spec['condition']} -> {condition_met}")
                        
                        if condition_met:
                            current_node = condition_spec['next_node']
                            break
                    else:
                        # 所有条件都不满足，使用默认路径
                        current_node = node.get('default_next', None)
                    
                    continue  # 跳过下面的next_node选择逻辑
                
                elif node['type'] == 'decision':
                    # 决策节点
                    options = [edge['to'] for edge in self.edges.get(current_node, [])]
                    if options:
                        decision = self.conditional_reasoner.make_decision(context, options)
                        print(f"🎯 决策结果: {decision}")
                        
                        # 根据决策选择下一个节点
                        for option in options:
                            if option in decision or decision in option:
                                current_node = option
                                break
                        else:
                            current_node = options[0]  # 默认选择第一个选项
                    else:
                        current_node = None
                    
                    continue
            
            except Exception as e:
                print(f"❌ 节点执行失败: {str(e)}")
                break
            
            # 确定下一个节点
            next_node = None
            
            if current_node in self.edges:
                edges = self.edges[current_node]
                
                if len(edges) == 1 and edges[0]['condition'] is None:
                    # 单一无条件边
                    next_node = edges[0]['to']
                
                else:
                    # 多条边或有条件边，需要评估条件
                    for edge in edges:
                        if edge['condition'] is None:
                            next_node = edge['to']  # 默认路径
                        else:
                            condition_met = self.conditional_reasoner.evaluate_condition(
                                context, edge['condition']
                            )
                            if condition_met:
                                next_node = edge['to']
                                break
            
            current_node = next_node
        
        print(f"\n✅ 工作流执行完成")
        print(f"🛤️ 执行路径: {' -> '.join(execution_path)}")
        
        return {
            'final_context': context,
            'execution_path': execution_path,
            'success': True
        }

# 实际应用示例：智能客服分支逻辑
class IntelligentCustomerService:
    """智能客服系统"""
    
    def __init__(self):
        self.workflow = BranchingWorkflow()
        self.setup_workflow()
    
    def setup_workflow(self):
        """设置客服工作流"""
        
        # 节点处理函数
        def classify_inquiry(context):
            classifier = dspy.ChainOfThought(
                "customer_message -> reasoning, category",
                instructions="将客户咨询分类：技术问题、账单问题、产品咨询、投诉建议等。"
            )
            
            result = classifier(customer_message=context['customer_message'])
            return {'inquiry_category': result.category, 'classification_reasoning': result.reasoning}
        
        def handle_technical_issue(context):
            handler = dspy.ChainOfThought(
                "technical_problem -> reasoning, solution",
                instructions="为技术问题提供解决方案。"
            )
            
            result = handler(technical_problem=context['customer_message'])
            return {'solution': result.solution, 'solution_reasoning': result.reasoning}
        
        def handle_billing_inquiry(context):
            handler = dspy.ChainOfThought(
                "billing_question -> reasoning, response",
                instructions="处理账单相关问题。"
            )
            
            result = handler(billing_question=context['customer_message'])
            return {'response': result.response, 'response_reasoning': result.reasoning}
        
        def escalate_to_human(context):
            return {
                'escalation': True,
                'escalation_reason': '问题复杂，需要人工处理',
                'context_for_agent': context
            }
        
        def generate_final_response(context):
            generator = dspy.ChainOfThought(
                "context, solution -> reasoning, customer_response",
                instructions="基于处理结果生成最终的客户回复。"
            )
            
            result = generator(
                context=json.dumps(context, ensure_ascii=False),
                solution=context.get('solution', context.get('response', ''))
            )
            
            return {'final_response': result.customer_response}
        
        # 添加节点
        self.workflow.add_node('classify', 'process', classify_inquiry)
        self.workflow.add_node('technical_handler', 'process', handle_technical_issue)
        self.workflow.add_node('billing_handler', 'process', handle_billing_inquiry)
        self.workflow.add_node('escalation', 'process', escalate_to_human)
        self.workflow.add_node('final_response', 'process', generate_final_response)
        
        # 添加条件分支
        self.workflow.add_edge('classify', 'technical_handler', '技术问题')
        self.workflow.add_edge('classify', 'billing_handler', '账单问题')
        self.workflow.add_edge('classify', 'escalation', '投诉建议')
        
        self.workflow.add_edge('technical_handler', 'final_response')
        self.workflow.add_edge('billing_handler', 'final_response')
        # 升级不需要最终回复
    
    def handle_customer_inquiry(self, customer_message: str) -> Dict[str, Any]:
        """处理客户咨询"""
        initial_context = {'customer_message': customer_message}
        result = self.workflow.execute_workflow('classify', initial_context)
        return result

# 使用示例
def demonstrate_conditional_reasoning():
    """演示条件推理"""
    
    # 创建智能客服
    customer_service = IntelligentCustomerService()
    
    # 测试不同类型的咨询
    test_inquiries = [
        "我的软件打不开了，怎么办？",
        "为什么这个月的账单比上个月多了50元？",
        "你们的服务太差了，我要投诉！"
    ]
    
    for inquiry in test_inquiries:
        print(f"\n" + "="*60)
        print(f"客户咨询: {inquiry}")
        
        result = customer_service.handle_customer_inquiry(inquiry)
        
        final_context = result['final_context']
        execution_path = result['execution_path']
        
        print(f"执行路径: {' -> '.join(execution_path)}")
        
        if 'final_response' in final_context:
            print(f"客服回复: {final_context['final_response']}")
        elif 'escalation' in final_context:
            print(f"升级处理: {final_context['escalation_reason']}")
    
    return result

# demo_conditional = demonstrate_conditional_reasoning()
```

### 4. 错误处理和异常恢复

健壮的多步推理系统需要完善的错误处理机制。

```python
class RobustReasoner(dspy.Module):
    """健壮的推理器，具备错误处理能力"""
    
    def __init__(self):
        super().__init__()
        
        self.error_analyzer = dspy.ChainOfThought(
            "error_info, context -> reasoning, error_type, recovery_strategy",
            instructions="分析错误类型并提出恢复策略。"
        )
        
        self.recovery_planner = dspy.ChainOfThought(
            "original_plan, error_info, recovery_strategy -> reasoning, revised_plan",
            instructions="基于错误信息和恢复策略，修订原计划。"
        )
        
        self.alternative_solver = dspy.ChainOfThought(
            "problem, failed_approach, context -> reasoning, alternative_solution",
            instructions="在原方法失败时，寻找替代解决方案。"
        )
    
    def handle_error(self, error: Exception, context: Dict[str, Any], 
                    current_step: str) -> Dict[str, Any]:
        """处理推理过程中的错误"""
        
        error_info = {
            'error_type': type(error).__name__,
            'error_message': str(error),
            'failed_step': current_step,
            'context_state': context
        }
        
        print(f"🚨 错误处理: {error_info['error_type']} - {error_info['error_message']}")
        
        # 分析错误
        analysis_result = self.error_analyzer(
            error_info=json.dumps(error_info, ensure_ascii=False),
            context=json.dumps(context, ensure_ascii=False)
        )
        
        recovery_strategy = {
            'error_type': analysis_result.error_type,
            'recovery_strategy': analysis_result.recovery_strategy,
            'analysis_reasoning': analysis_result.reasoning
        }
        
        print(f"📋 恢复策略: {recovery_strategy['recovery_strategy']}")
        
        return recovery_strategy
    
    def attempt_recovery(self, recovery_strategy: Dict[str, Any], 
                        context: Dict[str, Any]) -> Dict[str, Any]:
        """尝试错误恢复"""
        
        strategy_type = recovery_strategy['recovery_strategy'].lower()
        
        if 'retry' in strategy_type or '重试' in strategy_type:
            return self.retry_with_modification(context)
        
        elif 'alternative' in strategy_type or '替代' in strategy_type:
            return self.find_alternative_approach(context)
        
        elif 'skip' in strategy_type or '跳过' in strategy_type:
            return self.skip_step_and_continue(context)
        
        elif 'backtrack' in strategy_type or '回退' in strategy_type:
            return self.backtrack_and_retry(context)
        
        else:
            return {'recovery_action': 'no_recovery', 'success': False}
    
    def retry_with_modification(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """修改后重试"""
        print("🔄 尝试修改参数后重试...")
        
        # 实现具体的修改逻辑
        modified_context = context.copy()
        modified_context['retry_count'] = modified_context.get('retry_count', 0) + 1
        modified_context['modified'] = True
        
        return {
            'recovery_action': 'retry',
            'modified_context': modified_context,
            'success': True
        }
    
    def find_alternative_approach(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """寻找替代方法"""
        print("🔍 寻找替代解决方案...")
        
        original_problem = context.get('original_problem', '')
        failed_approach = context.get('current_approach', '')
        
        alternative_result = self.alternative_solver(
            problem=original_problem,
            failed_approach=failed_approach,
            context=json.dumps(context, ensure_ascii=False)
        )
        
        return {
            'recovery_action': 'alternative',
            'alternative_solution': alternative_result.alternative_solution,
            'reasoning': alternative_result.reasoning,
            'success': True
        }
    
    def skip_step_and_continue(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """跳过当前步骤并继续"""
        print("⏭️ 跳过当前步骤...")
        
        return {
            'recovery_action': 'skip',
            'skipped_step': context.get('current_step', ''),
            'success': True
        }
    
    def backtrack_and_retry(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """回退并重试"""
        print("⬅️ 回退到上一步...")
        
        # 实现回退逻辑
        previous_state = context.get('previous_states', [])
        
        if previous_state:
            restored_context = previous_state[-1]
            return {
                'recovery_action': 'backtrack',
                'restored_context': restored_context,
                'success': True
            }
        else:
            return {
                'recovery_action': 'backtrack',
                'success': False,
                'reason': 'no_previous_state'
            }

class ResilientMultiStepReasoner(MultiStepReasoner):
    """具备恢复能力的多步推理器"""
    
    def __init__(self, max_retries: int = 3):
        super().__init__()
        self.max_retries = max_retries
        self.robust_reasoner = RobustReasoner()
        self.step_history = []
    
    def forward(self, problem: str):
        """执行具备错误恢复能力的多步推理"""
        
        print(f"🛡️ 开始健壮多步推理: {problem}")
        
        self.context['original_problem'] = problem
        self.step_history = []
        
        # 问题分析（带错误处理）
        try:
            analysis_result = self.problem_analyzer(problem=problem)
            self.context['analysis'] = analysis_result.analysis
            self.context['sub_problems'] = analysis_result.sub_problems
        except Exception as e:
            print(f"❌ 问题分析失败: {e}")
            return dspy.Prediction(
                problem=problem,
                error="问题分析失败",
                final_answer="无法分析问题"
            )
        
        # 执行推理步骤（带错误处理和恢复）
        step_results = []
        
        for i, step in enumerate(self.reasoning_steps):
            retry_count = 0
            step_success = False
            
            while retry_count <= self.max_retries and not step_success:
                print(f"\n🔄 执行步骤 {i+1} (尝试 {retry_count+1}): {step.step_name}")
                
                # 保存当前状态
                self.step_history.append(self.context.copy())
                
                try:
                    # 执行步骤
                    step_output = step.execute(self.context)
                    
                    if step.success:
                        # 步骤成功
                        self.context[f'step_{i+1}_result'] = step_output
                        step_success = True
                        
                        step_summary = step.get_summary()
                        step_results.append(step_summary)
                        
                        print(f"✅ 步骤 {i+1} 成功完成")
                        
                    else:
                        # 步骤失败，尝试错误处理
                        raise Exception(step.error_message)
                
                except Exception as e:
                    print(f"⚠️ 步骤 {i+1} 失败: {e}")
                    
                    if retry_count < self.max_retries:
                        # 尝试错误恢复
                        recovery_strategy = self.robust_reasoner.handle_error(
                            e, self.context, step.step_name
                        )
                        
                        recovery_result = self.robust_reasoner.attempt_recovery(
                            recovery_strategy, self.context
                        )
                        
                        if recovery_result['success']:
                            print(f"🔧 应用恢复策略: {recovery_result['recovery_action']}")
                            
                            if 'modified_context' in recovery_result:
                                self.context.update(recovery_result['modified_context'])
                            elif 'restored_context' in recovery_result:
                                self.context = recovery_result['restored_context']
                            
                            retry_count += 1
                        else:
                            print(f"❌ 无法恢复，跳过步骤 {i+1}")
                            break
                    else:
                        print(f"❌ 达到最大重试次数，步骤 {i+1} 最终失败")
                        
                        # 记录失败的步骤
                        failed_summary = {
                            'step_name': step.step_name,
                            'success': False,
                            'error_message': str(e),
                            'retry_count': retry_count
                        }
                        step_results.append(failed_summary)
                        break
        
        # 结果综合（考虑部分失败的情况）
        try:
            final_result = self.result_synthesizer(
                original_problem=problem,
                step_results=json.dumps(step_results, ensure_ascii=False, indent=2)
            )
            final_answer = final_result.final_answer
        except Exception as e:
            print(f"⚠️ 结果综合出现问题: {e}")
            final_answer = "部分步骤失败，无法给出完整答案"
        
        return dspy.Prediction(
            problem=problem,
            step_results=step_results,
            final_answer=final_answer,
            step_history=self.step_history,
            recovery_attempts=sum(1 for result in step_results if result.get('retry_count', 0) > 0)
        )

# 使用示例
def demonstrate_error_handling():
    """演示错误处理和恢复"""
    
    # 创建容易失败的推理步骤
    class UnreliableStep(ReasoningStep):
        def __init__(self, failure_rate: float = 0.7):
            super().__init__("unreliable_step", "容易失败的步骤")
            self.failure_rate = failure_rate
        
        def extract_inputs(self, context: Dict[str, Any]) -> Dict[str, Any]:
            return {'input': context.get('original_problem', '')}
        
        def process(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
            import random
            
            if random.random() < self.failure_rate:
                raise Exception("模拟的随机失败")
            
            return {'output': f"处理结果: {inputs['input']}"}
    
    # 创建健壮推理器
    reasoner = ResillientMultiStepReasoner(max_retries=2)
    
    # 添加不可靠的步骤
    reasoner.add_step(UnreliableStep(failure_rate=0.6))
    reasoner.add_step(FactExtractionStep())
    
    # 测试错误处理
    test_problem = "测试错误处理和恢复机制"
    
    result = reasoner(test_problem)
    
    print(f"\n📊 错误处理测试结果:")
    print(f"问题: {result.problem}")
    print(f"恢复尝试次数: {result.recovery_attempts}")
    print(f"最终答案: {result.final_answer}")
    
    print(f"\n🔍 步骤执行情况:")
    for i, step in enumerate(result.step_results):
        status = "✅ 成功" if step.get('success', False) else "❌ 失败"
        retry_info = f" (重试{step.get('retry_count', 0)}次)" if step.get('retry_count', 0) > 0 else ""
        print(f"  步骤{i+1}: {step.get('step_name', 'Unknown')} - {status}{retry_info}")
    
    return result

# demo_error_handling = demonstrate_error_handling()
```

## 实践练习

### 练习1：设计领域特定的多步推理

```python
class DomainSpecificReasoner:
    """领域特定推理器练习"""
    
    def __init__(self, domain: str):
        self.domain = domain
        # TODO: 实现领域特定的推理逻辑
    
    def create_domain_steps(self):
        """创建领域特定的推理步骤"""
        # TODO: 根据领域特点设计推理步骤
        pass
    
    def validate_domain_constraints(self, result):
        """验证领域约束"""
        # TODO: 实现领域特定的结果验证
        pass

# 练习任务：
# 1. 选择一个具体领域（如医疗诊断、法律推理、工程设计）
# 2. 设计该领域的多步推理流程
# 3. 实现领域特定的约束验证
```

### 练习2：优化推理性能

```python
class OptimizedReasoner:
    """优化推理器练习"""
    
    def __init__(self):
        self.cache = {}
        self.parallel_executor = None
    
    def implement_caching(self):
        """实现结果缓存"""
        # TODO: 实现推理结果的缓存机制
        pass
    
    def enable_parallel_execution(self):
        """启用并行执行"""
        # TODO: 实现独立步骤的并行执行
        pass
    
    def optimize_step_order(self, steps):
        """优化步骤顺序"""
        # TODO: 根据依赖关系优化执行顺序
        pass

# 练习任务：
# 1. 实现智能缓存机制
# 2. 识别可并行的推理步骤
# 3. 实现动态步骤顺序优化
```

## 最佳实践

### 1. 推理链设计原则

```python
def reasoning_design_principles():
    """推理链设计原则"""
    
    principles = {
        '模块化设计': [
            '每个推理步骤职责单一',
            '步骤间接口清晰',
            '便于独立测试和调试'
        ],
        
        '错误处理': [
            '预见可能的失败点',
            '设计优雅的降级策略',
            '保存足够的恢复信息'
        ],
        
        '性能优化': [
            '识别可并行的步骤',
            '实现结果缓存',
            '避免不必要的重复计算'
        ],
        
        '可解释性': [
            '记录详细的推理过程',
            '提供中间结果的解释',
            '支持推理路径可视化'
        ]
    }
    
    return principles

class ReasoningPatternLibrary:
    """推理模式库"""
    
    @staticmethod
    def sequential_reasoning():
        """顺序推理模式"""
        return """
        适用场景：步骤间有严格的依赖关系
        特点：简单直观，易于理解和调试
        注意：需要良好的错误处理机制
        """
    
    @staticmethod
    def parallel_reasoning():
        """并行推理模式"""
        return """
        适用场景：多个独立的子问题
        特点：提高执行效率
        注意：需要考虑资源竞争和结果同步
        """
    
    @staticmethod
    def iterative_reasoning():
        """迭代推理模式"""
        return """
        适用场景：需要逐步细化的问题
        特点：支持渐进式求解
        注意：需要设计合适的收敛条件
        """
    
    @staticmethod
    def hierarchical_reasoning():
        """层次推理模式"""
        return """
        适用场景：具有层次结构的复杂问题
        特点：支持不同抽象层次的推理
        注意：需要合理设计层次间的信息传递
        """
```

### 2. 性能监控和调试

```python
class ReasoningProfiler:
    """推理性能分析器"""
    
    def __init__(self):
        self.performance_data = {}
        self.debugging_info = {}
    
    def profile_reasoning_step(self, step_func):
        """推理步骤性能分析装饰器"""
        import functools
        import time
        import tracemalloc
        
        @functools.wraps(step_func)
        def wrapper(*args, **kwargs):
            step_name = getattr(step_func, '__name__', 'unknown')
            
            # 开始性能监控
            start_time = time.time()
            tracemalloc.start()
            
            try:
                result = step_func(*args, **kwargs)
                success = True
                error = None
            except Exception as e:
                result = None
                success = False
                error = str(e)
            finally:
                # 记录性能数据
                end_time = time.time()
                current, peak = tracemalloc.get_traced_memory()
                tracemalloc.stop()
                
                self.performance_data[step_name] = {
                    'execution_time': end_time - start_time,
                    'memory_current': current,
                    'memory_peak': peak,
                    'success': success,
                    'error': error
                }
            
            return result
        
        return wrapper
    
    def generate_performance_report(self) -> str:
        """生成性能报告"""
        if not self.performance_data:
            return "无性能数据"
        
        report = ["🔍 推理性能分析报告", "=" * 40]
        
        total_time = sum(data['execution_time'] for data in self.performance_data.values())
        total_memory = sum(data['memory_peak'] for data in self.performance_data.values())
        
        report.append(f"总执行时间: {total_time:.3f}秒")
        report.append(f"总内存使用: {total_memory / 1024 / 1024:.2f}MB")
        
        report.append("\n📊 步骤详情:")
        for step_name, data in self.performance_data.items():
            status = "✅" if data['success'] else "❌"
            report.append(f"  {step_name} {status}")
            report.append(f"    时间: {data['execution_time']:.3f}s")
            report.append(f"    内存: {data['memory_peak'] / 1024 / 1024:.2f}MB")
            
            if not data['success']:
                report.append(f"    错误: {data['error']}")
        
        return "\n".join(report)

# 推理系统监控
class ReasoningMonitor:
    """推理系统监控器"""
    
    def __init__(self):
        self.metrics = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'average_response_time': 0.0,
            'step_failure_rates': {}
        }
    
    def record_request(self, success: bool, response_time: float, step_failures: Dict[str, bool]):
        """记录请求指标"""
        self.metrics['total_requests'] += 1
        
        if success:
            self.metrics['successful_requests'] += 1
        else:
            self.metrics['failed_requests'] += 1
        
        # 更新平均响应时间
        current_avg = self.metrics['average_response_time']
        total_requests = self.metrics['total_requests']
        
        self.metrics['average_response_time'] = (
            (current_avg * (total_requests - 1) + response_time) / total_requests
        )
        
        # 更新步骤失败率
        for step_name, failed in step_failures.items():
            if step_name not in self.metrics['step_failure_rates']:
                self.metrics['step_failure_rates'][step_name] = {'total': 0, 'failures': 0}
            
            self.metrics['step_failure_rates'][step_name]['total'] += 1
            if failed:
                self.metrics['step_failure_rates'][step_name]['failures'] += 1
    
    def get_health_status(self) -> Dict[str, Any]:
        """获取系统健康状态"""
        if self.metrics['total_requests'] == 0:
            return {'status': 'unknown', 'reason': 'no_data'}
        
        success_rate = self.metrics['successful_requests'] / self.metrics['total_requests']
        
        if success_rate >= 0.95:
            status = 'healthy'
        elif success_rate >= 0.80:
            status = 'warning'
        else:
            status = 'critical'
        
        return {
            'status': status,
            'success_rate': success_rate,
            'average_response_time': self.metrics['average_response_time'],
            'total_requests': self.metrics['total_requests']
        }
```

通过本章的学习，你应该掌握了如何使用DSPy构建复杂的多步推理系统。这些技术可以帮助你处理需要分解和协调的复杂问题，构建更加智能和健壮的AI应用。