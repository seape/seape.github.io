---
title: "第03章：DSPy 预测器详解"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第03章：DSPy 预测器详解

::: tip 学习目标
- 学习Chain of Thought (CoT)预测器
- 掌握Retrieve预测器的使用
- 理解ChainOfThoughtWithHint预测器
- 探索ReAct预测器的应用
- 自定义预测器的创建方法
:::

## 知识点

### 1. 预测器体系概览

DSPy提供了多种预测器，每种都适用于不同的推理场景：

| 预测器类型 | 适用场景 | 特点 |
|------------|----------|------|
| `Predict` | 基础问答、分类 | 直接映射输入到输出 |
| `ChainOfThought` | 复杂推理 | 显式推理过程 |
| `ProgramOfThought` | 数学计算 | 程序化思维 |
| `ReAct` | 需要行动的推理 | 推理-行动循环 |
| `Retrieve` | 知识检索 | 检索相关信息 |

### 2. Chain of Thought (CoT) 预测器

CoT预测器通过显式的推理步骤来提高复杂任务的性能。

#### 工作机制
1. 将问题分解为推理步骤
2. 逐步展示思考过程
3. 基于推理得出最终答案

#### 适用场景
- 数学问题求解
- 逻辑推理
- 复杂文本分析
- 多步骤任务

### 3. Retrieve 预测器

结合检索机制增强生成能力，特别适用于知识密集型任务。

#### 核心组件
- **检索器 (Retriever)**：从知识库检索相关文档
- **生成器 (Generator)**：基于检索结果生成答案

### 4. ReAct 预测器

结合推理 (Reasoning) 和行动 (Acting) 的预测器。

#### ReAct 循环
1. **思考** (Think)：分析当前情况
2. **行动** (Act)：执行具体操作
3. **观察** (Observe)：获取行动结果
4. **重复** 直到完成任务

## 示例代码

### Chain of Thought 预测器

```python
import dspy

# 配置模型
lm = dspy.OpenAI(model="gpt-3.5-turbo", max_tokens=300)
dspy.settings.configure(lm=lm)

# 定义数学问题签名
class MathProblem(dspy.Signature):
    """解决数学应用题"""
    problem = dspy.InputField(desc="数学问题描述")
    reasoning = dspy.OutputField(desc="详细的解题步骤")
    answer = dspy.OutputField(desc="最终数值答案")

# 基础预测器 vs CoT预测器对比
def compare_basic_and_cot():
    # 基础预测器
    basic_predictor = dspy.Predict(MathProblem)
    
    # CoT预测器
    cot_predictor = dspy.ChainOfThought(MathProblem)
    
    problem = "一个班级有30个学生，其中60%是女生。如果又来了5个男生，现在男生占总人数的百分之几？"
    
    print("=== 基础预测器结果 ===")
    basic_result = basic_predictor(problem=problem)
    print(f"推理: {basic_result.reasoning}")
    print(f"答案: {basic_result.answer}")
    
    print("\n=== CoT预测器结果 ===")
    cot_result = cot_predictor(problem=problem)
    print(f"推理: {cot_result.reasoning}")
    print(f"答案: {cot_result.answer}")

# CoT预测器的高级用法
class AdvancedCoT(dspy.Module):
    def __init__(self):
        super().__init__()
        self.cot = dspy.ChainOfThought(
            "problem, context -> step_by_step_reasoning, final_answer"
        )
    
    def forward(self, problem, context=""):
        result = self.cot(problem=problem, context=context)
        
        # 后处理推理过程
        steps = self._parse_reasoning_steps(result.step_by_step_reasoning)
        
        return dspy.Prediction(
            reasoning_steps=steps,
            final_answer=result.final_answer,
            raw_reasoning=result.step_by_step_reasoning
        )
    
    def _parse_reasoning_steps(self, reasoning_text):
        """解析推理步骤"""
        lines = reasoning_text.split('\n')
        steps = []
        
        for line in lines:
            line = line.strip()
            if line and (line.startswith('步骤') or line.startswith('Step')):
                steps.append(line)
        
        return steps

# 使用高级CoT
def demo_advanced_cot():
    advanced_cot = AdvancedCoT()
    
    result = advanced_cot(
        problem="计算复利：本金10000元，年利率5%，3年后本息合计多少？",
        context="复利公式：A = P(1 + r)^t"
    )
    
    print("推理步骤:")
    for i, step in enumerate(result.reasoning_steps, 1):
        print(f"  {i}. {step}")
    
    print(f"\n最终答案: {result.final_answer}")
```

### Retrieve 预测器

```python
import dspy
from dspy.retrieve import ColBERTv2

# 配置检索模型
retriever = dspy.ColBERTv2(url='http://20.102.90.50:2017/wiki17_abstracts')
lm = dspy.OpenAI(model="gpt-3.5-turbo")

dspy.settings.configure(lm=lm, rm=retriever)

# 定义RAG签名
class RAGSignature(dspy.Signature):
    """基于检索的问答"""
    question = dspy.InputField(desc="用户问题")
    context = dspy.InputField(desc="检索到的相关文档")
    answer = dspy.OutputField(desc="基于上下文的答案")

# 简单RAG模块
class SimpleRAG(dspy.Module):
    def __init__(self, k=3):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=k)
        self.generate_answer = dspy.ChainOfThought(RAGSignature)
    
    def forward(self, question):
        # 1. 检索相关文档
        context = self.retrieve(question).passages
        
        # 2. 基于上下文生成答案
        result = self.generate_answer(
            question=question,
            context=context
        )
        
        return dspy.Prediction(
            answer=result.answer,
            context=context,
            reasoning=getattr(result, 'reasoning', '')
        )

# 高级RAG模块
class AdvancedRAG(dspy.Module):
    def __init__(self, k=5):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=k)
        self.rerank = dspy.Predict(
            "question, passages -> relevant_passages"
        )
        self.generate = dspy.ChainOfThought(RAGSignature)
    
    def forward(self, question):
        # 1. 初始检索
        initial_context = self.retrieve(question).passages
        
        # 2. 重新排序
        reranked = self.rerank(
            question=question,
            passages=initial_context
        )
        
        # 3. 生成答案
        result = self.generate(
            question=question,
            context=reranked.relevant_passages
        )
        
        return dspy.Prediction(
            answer=result.answer,
            context=initial_context,
            reranked_context=reranked.relevant_passages,
            reasoning=getattr(result, 'reasoning', '')
        )

# 使用检索预测器
def demo_retrieve_predictor():
    rag = SimpleRAG(k=3)
    
    question = "什么是人工智能？"
    result = rag(question=question)
    
    print(f"问题: {question}")
    print(f"\n检索到的上下文:")
    for i, passage in enumerate(result.context, 1):
        print(f"  {i}. {passage[:100]}...")
    
    print(f"\n答案: {result.answer}")
    if result.reasoning:
        print(f"推理: {result.reasoning}")
```

### ReAct 预测器

```python
# ReAct签名定义
class ReActSignature(dspy.Signature):
    """ReAct推理行动模式"""
    query = dspy.InputField(desc="需要解决的问题")
    thought = dspy.OutputField(desc="当前的思考")
    action = dspy.OutputField(desc="要执行的行动")
    observation = dspy.InputField(desc="行动的观察结果")
    answer = dspy.OutputField(desc="最终答案")

# 工具定义
class Calculator:
    """计算器工具"""
    def calculate(self, expression):
        try:
            result = eval(expression)
            return f"计算结果: {result}"
        except Exception as e:
            return f"计算错误: {e}"

class WebSearcher:
    """网络搜索工具（模拟）"""
    def search(self, query):
        # 模拟搜索结果
        mock_results = {
            "人工智能": "人工智能是计算机科学的一个分支...",
            "机器学习": "机器学习是人工智能的一个子领域...",
            "深度学习": "深度学习是机器学习的一种方法..."
        }
        
        for key in mock_results:
            if key in query:
                return mock_results[key]
        
        return "未找到相关信息"

# ReAct模块实现
class ReActAgent(dspy.Module):
    def __init__(self, max_iterations=5):
        super().__init__()
        self.max_iterations = max_iterations
        self.think_act = dspy.ChainOfThought(
            "query, history -> thought, action"
        )
        self.final_answer = dspy.ChainOfThought(
            "query, history -> answer"
        )
        
        # 工具
        self.tools = {
            "calculator": Calculator(),
            "search": WebSearcher()
        }
    
    def forward(self, query):
        history = []
        
        for i in range(self.max_iterations):
            # 思考和行动
            history_text = self._format_history(history)
            result = self.think_act(
                query=query,
                history=history_text
            )
            
            thought = result.thought
            action = result.action
            
            print(f"第{i+1}轮:")
            print(f"  思考: {thought}")
            print(f"  行动: {action}")
            
            # 执行行动
            observation = self._execute_action(action)
            print(f"  观察: {observation}")
            
            # 记录历史
            history.append({
                'thought': thought,
                'action': action,
                'observation': observation
            })
            
            # 检查是否完成
            if "完成" in observation or "答案是" in observation:
                break
        
        # 生成最终答案
        history_text = self._format_history(history)
        final_result = self.final_answer(
            query=query,
            history=history_text
        )
        
        return dspy.Prediction(
            answer=final_result.answer,
            history=history,
            iterations=len(history)
        )
    
    def _format_history(self, history):
        """格式化历史记录"""
        formatted = []
        for entry in history:
            formatted.append(f"思考: {entry['thought']}")
            formatted.append(f"行动: {entry['action']}")
            formatted.append(f"观察: {entry['observation']}")
            formatted.append("---")
        
        return "\n".join(formatted)
    
    def _execute_action(self, action):
        """执行行动"""
        action = action.strip()
        
        if action.startswith("计算"):
            # 提取表达式
            expression = action.replace("计算", "").strip()
            return self.tools["calculator"].calculate(expression)
        
        elif action.startswith("搜索"):
            # 提取搜索查询
            query = action.replace("搜索", "").strip()
            return self.tools["search"].search(query)
        
        elif "完成" in action:
            return "任务完成"
        
        else:
            return "无效的行动"

# 使用ReAct预测器
def demo_react_predictor():
    react_agent = ReActAgent(max_iterations=3)
    
    query = "什么是深度学习？请先搜索相关信息，然后给出详细解释"
    result = react_agent(query=query)
    
    print(f"\n问题: {query}")
    print(f"总共执行了 {result.iterations} 轮推理")
    print(f"最终答案: {result.answer}")
```

### 自定义预测器

```python
# 自定义预测器基类
class CustomPredictor(dspy.Module):
    def __init__(self, signature, strategy="default"):
        super().__init__()
        self.signature = signature
        self.strategy = strategy
        
        if strategy == "cot":
            self.predictor = dspy.ChainOfThought(signature)
        elif strategy == "multi_shot":
            self.predictor = dspy.Predict(signature)
        else:
            self.predictor = dspy.Predict(signature)
    
    def forward(self, **kwargs):
        if self.strategy == "multi_shot":
            # 多样本策略
            results = []
            for _ in range(3):  # 生成3个候选答案
                result = self.predictor(**kwargs)
                results.append(result)
            
            # 选择最佳答案（简单投票）
            return self._select_best_answer(results)
        else:
            return self.predictor(**kwargs)
    
    def _select_best_answer(self, results):
        # 简单的多数投票
        return results[0]  # 简化实现

# 专用预测器：情感分析
class SentimentAnalyzer(dspy.Module):
    def __init__(self):
        super().__init__()
        
        # 多阶段处理
        self.preprocess = dspy.Predict(
            "text -> cleaned_text, features"
        )
        self.analyze = dspy.ChainOfThought(
            "cleaned_text, features -> sentiment, confidence, reasoning"
        )
        self.postprocess = dspy.Predict(
            "sentiment, confidence, reasoning -> final_sentiment, score"
        )
    
    def forward(self, text):
        # 预处理
        prep_result = self.preprocess(text=text)
        
        # 分析
        analysis = self.analyze(
            cleaned_text=prep_result.cleaned_text,
            features=prep_result.features
        )
        
        # 后处理
        final_result = self.postprocess(
            sentiment=analysis.sentiment,
            confidence=analysis.confidence,
            reasoning=analysis.reasoning
        )
        
        return dspy.Prediction(
            sentiment=final_result.final_sentiment,
            score=final_result.score,
            reasoning=analysis.reasoning,
            features=prep_result.features
        )

# 使用自定义预测器
def demo_custom_predictor():
    # 情感分析器
    analyzer = SentimentAnalyzer()
    
    text = "今天天气真好，我心情非常愉快！"
    result = analyzer(text=text)
    
    print(f"文本: {text}")
    print(f"情感: {result.sentiment}")
    print(f"评分: {result.score}")
    print(f"推理: {result.reasoning}")
    print(f"特征: {result.features}")
```

## 实践练习

### 练习1: CoT优化

为特定领域问题优化Chain of Thought预测器。

```python
class DomainSpecificCoT(dspy.Module):
    """为特定领域优化的CoT预测器"""
    def __init__(self, domain):
        super().__init__()
        # 实现你的优化逻辑
        pass
```

### 练习2: RAG增强

实现一个多源检索的RAG系统。

```python
class MultiSourceRAG(dspy.Module):
    """多源检索系统"""
    def __init__(self):
        super().__init__()
        # 实现多源检索逻辑
        pass
```

### 练习3: ReAct工具集成

为ReAct预测器添加更多工具。

```python
class AdvancedReActAgent(dspy.Module):
    """增强的ReAct智能体"""
    def __init__(self):
        super().__init__()
        # 添加更多工具
        pass
```

::: warning 性能建议
- 根据任务复杂度选择合适的预测器
- CoT预测器消耗更多tokens，注意成本控制
- 检索预测器需要配置合适的检索器
- ReAct预测器可能需要多轮交互，设置合理的迭代上限
:::

::: tip 最佳实践
- 为每种预测器设计合适的签名
- 在复杂任务中考虑组合多种预测器
- 充分测试预测器在不同输入下的表现
- 考虑缓存机制提高性能
:::

## 本章总结

本章详细介绍了DSPy的各种预测器：

1. **Chain of Thought**：通过显式推理提升复杂任务性能
2. **Retrieve**：结合检索增强生成能力
3. **ReAct**：推理-行动循环处理需要工具的任务
4. **自定义预测器**：针对特定需求的定制化解决方案

掌握这些预测器的使用方法，将为构建高效的语言模型应用奠定坚实基础。