---
title: "第02章：DSPy 核心概念和组件"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第02章：DSPy 核心概念和组件

::: tip 学习目标
- 掌握DSPy的签名（Signature）机制
- 理解模块（Module）的概念和用法
- 学习预测器（Predictor）的工作原理
- 了解DSPy中的数据类型和结构
- 掌握基本的输入输出处理
:::

## 知识点

### 1. DSPy 签名（Signatures）

签名是DSPy中最核心的概念，它定义了语言模型程序的输入输出规范。

#### 签名的基本结构

```python
class MySignature(dspy.Signature):
    """任务描述文档字符串"""
    input_field = dspy.InputField(desc="输入字段描述")
    output_field = dspy.OutputField(desc="输出字段描述")
```

#### 字段类型和属性

| 字段类型 | 用途 | 示例 |
|----------|------|------|
| `InputField` | 定义输入参数 | `question = dspy.InputField()` |
| `OutputField` | 定义输出结果 | `answer = dspy.OutputField()` |

#### 字段属性参数

```python
# 字段属性详解
field = dspy.InputField(
    desc="字段功能描述",           # 描述字段用途
    prefix="前缀:",               # 输出时的前缀
    format=lambda x: x.strip()   # 格式化函数
)
```

### 2. DSPy 模块（Modules）

模块是DSPy的基本构建块，提供了可复用的功能组件。

#### 基础模块类型

```python
# 基础预测模块
class BasicPredict(dspy.Module):
    def __init__(self, signature):
        super().__init__()
        self.predict = dspy.Predict(signature)
    
    def forward(self, **kwargs):
        return self.predict(**kwargs)
```

#### 链式模块 (ChainOfThought)

```python
# 思维链模块
class CoTModule(dspy.Module):
    def __init__(self, signature):
        super().__init__()
        self.predict = dspy.ChainOfThought(signature)
    
    def forward(self, **kwargs):
        return self.predict(**kwargs)
```

### 3. DSPy 预测器（Predictors）

预测器是执行实际推理的组件，不同类型适用于不同场景。

#### 预测器层次结构

```
预测器基类
├── Predict - 基础预测
├── ChainOfThought - 思维链推理  
├── ProgramOfThought - 程序思维
├── ReAct - 推理行动循环
└── Retrieve - 检索增强
```

### 4. 数据类型和结构

#### DSPy 内置数据类型

```python
# 基本数据类型
text_field = dspy.InputField()        # 文本类型
list_field = dspy.OutputField()       # 列表类型
dict_field = dspy.InputField()        # 字典类型

# 复杂数据类型
class ComplexData(dspy.Signature):
    structured_input = dspy.InputField(desc="结构化输入")
    json_output = dspy.OutputField(desc="JSON格式输出")
```

## 示例代码

### 签名定义示例

```python
import dspy

# 1. 简单问答签名
class SimpleQA(dspy.Signature):
    """回答用户问题"""
    question = dspy.InputField(desc="用户的问题")
    answer = dspy.OutputField(desc="简洁的答案")

# 2. 复杂分析签名
class TextAnalysis(dspy.Signature):
    """文本情感分析和关键词提取"""
    text = dspy.InputField(desc="需要分析的文本")
    sentiment = dspy.OutputField(desc="情感倾向：正面/负面/中性")
    keywords = dspy.OutputField(desc="关键词列表，用逗号分隔")
    confidence = dspy.OutputField(desc="置信度分数(0-1)")

# 3. 多步推理签名
class MathWordProblem(dspy.Signature):
    """解决数学应用题"""
    problem = dspy.InputField(desc="数学应用题")
    reasoning = dspy.OutputField(desc="解题思路和步骤")
    answer = dspy.OutputField(desc="最终答案")

# 使用签名
def demo_signatures():
    # 配置模型
    lm = dspy.OpenAI(model="gpt-3.5-turbo")
    dspy.settings.configure(lm=lm)
    
    # 简单问答
    qa_predictor = dspy.Predict(SimpleQA)
    result1 = qa_predictor(question="什么是机器学习？")
    print(f"问答结果: {result1.answer}")
    
    # 文本分析
    analysis_predictor = dspy.ChainOfThought(TextAnalysis)
    result2 = analysis_predictor(
        text="今天天气真好，我心情很愉快！"
    )
    print(f"情感分析: {result2.sentiment}")
    print(f"关键词: {result2.keywords}")
    print(f"置信度: {result2.confidence}")
```

### 模块构建示例

```python
class SmartQAModule(dspy.Module):
    """智能问答模块"""
    
    def __init__(self):
        super().__init__()
        # 定义内部组件
        self.classifier = dspy.Predict("question -> question_type")
        self.simple_qa = dspy.Predict(SimpleQA)
        self.complex_qa = dspy.ChainOfThought(MathWordProblem)
    
    def forward(self, question):
        # 1. 问题分类
        question_type = self.classifier(question=question).question_type
        
        # 2. 根据类型选择处理方式
        if "数学" in question_type or "计算" in question_type:
            # 数学问题用思维链
            result = self.complex_qa(problem=question)
            return dspy.Prediction(
                answer=result.answer,
                reasoning=result.reasoning
            )
        else:
            # 普通问题用简单预测
            result = self.simple_qa(question=question)
            return dspy.Prediction(
                answer=result.answer,
                reasoning="直接回答"
            )

# 使用模块
def demo_modules():
    smart_qa = SmartQAModule()
    
    # 测试普通问题
    result1 = smart_qa("什么是人工智能？")
    print(f"普通问答: {result1.answer}")
    
    # 测试数学问题
    result2 = smart_qa("小明有10个苹果，吃了3个，还剩多少个？")
    print(f"数学问答: {result2.answer}")
    print(f"推理过程: {result2.reasoning}")
```

### 预测器详解示例

```python
# 1. 基础预测器
class BasicPredict(dspy.Module):
    def __init__(self, signature):
        super().__init__()
        self.predict = dspy.Predict(signature)
    
    def forward(self, **kwargs):
        return self.predict(**kwargs)

# 2. 思维链预测器
class CoTPredict(dspy.Module):
    def __init__(self, signature):
        super().__init__()
        self.cot = dspy.ChainOfThought(signature)
    
    def forward(self, **kwargs):
        return self.cot(**kwargs)

# 3. 程序思维预测器
class PoTPredict(dspy.Module):
    def __init__(self, signature):
        super().__init__()
        self.pot = dspy.ProgramOfThought(signature)
    
    def forward(self, **kwargs):
        return self.pot(**kwargs)

# 比较不同预测器
def compare_predictors():
    # 定义数学问题签名
    class MathProblem(dspy.Signature):
        """解决数学问题"""
        problem = dspy.InputField()
        answer = dspy.OutputField()
    
    # 创建不同预测器
    basic = BasicPredict(MathProblem)
    cot = CoTPredict(MathProblem)
    pot = PoTPredict(MathProblem)
    
    problem = "计算 15 * 23 + 47"
    
    print("=== 预测器比较 ===")
    
    # 基础预测
    result1 = basic(problem=problem)
    print(f"基础预测: {result1.answer}")
    
    # 思维链预测
    result2 = cot(problem=problem)
    print(f"思维链预测: {result2.answer}")
    
    # 程序思维预测
    result3 = pot(problem=problem)
    print(f"程序思维预测: {result3.answer}")
```

### 数据处理和流转示例

```python
class DataProcessor(dspy.Module):
    """数据处理模块"""
    
    def __init__(self):
        super().__init__()
        self.extractor = dspy.Predict(
            "text -> entities, relationships"
        )
        self.summarizer = dspy.ChainOfThought(
            "entities, relationships -> summary"
        )
    
    def forward(self, raw_text):
        # 1. 数据提取
        extraction = self.extractor(text=raw_text)
        
        # 2. 数据处理
        processed_entities = self._process_entities(
            extraction.entities
        )
        processed_relationships = self._process_relationships(
            extraction.relationships
        )
        
        # 3. 生成摘要
        summary = self.summarizer(
            entities=processed_entities,
            relationships=processed_relationships
        )
        
        return dspy.Prediction(
            entities=processed_entities,
            relationships=processed_relationships,
            summary=summary.summary
        )
    
    def _process_entities(self, entities_text):
        """处理实体数据"""
        # 简单的文本处理
        entities = [e.strip() for e in entities_text.split(',')]
        return entities
    
    def _process_relationships(self, relationships_text):
        """处理关系数据"""
        relationships = [r.strip() for r in relationships_text.split(';')]
        return relationships

# 使用数据处理器
def demo_data_processing():
    processor = DataProcessor()
    
    text = """
    苹果公司是一家美国跨国科技公司。
    该公司由史蒂夫·乔布斯创立于1976年。
    苹果公司主要生产iPhone、iPad等产品。
    """
    
    result = processor(raw_text=text)
    
    print("实体:", result.entities)
    print("关系:", result.relationships)  
    print("摘要:", result.summary)
```

### 高级组合示例

```python
class AdvancedPipeline(dspy.Module):
    """高级处理流水线"""
    
    def __init__(self):
        super().__init__()
        
        # 多个处理阶段
        self.preprocessor = dspy.Predict(
            "raw_input -> cleaned_input, metadata"
        )
        
        self.analyzer = dspy.ChainOfThought(
            "cleaned_input, metadata -> analysis, insights"
        )
        
        self.postprocessor = dspy.Predict(
            "analysis, insights -> final_output, confidence"
        )
    
    def forward(self, raw_input, context=None):
        # 阶段1: 预处理
        stage1 = self.preprocessor(raw_input=raw_input)
        
        # 阶段2: 分析（考虑上下文）
        if context:
            analysis_input = f"{stage1.cleaned_input}\n\n上下文: {context}"
        else:
            analysis_input = stage1.cleaned_input
            
        stage2 = self.analyzer(
            cleaned_input=analysis_input,
            metadata=stage1.metadata
        )
        
        # 阶段3: 后处理
        stage3 = self.postprocessor(
            analysis=stage2.analysis,
            insights=stage2.insights
        )
        
        return dspy.Prediction(
            raw_input=raw_input,
            processed_input=stage1.cleaned_input,
            metadata=stage1.metadata,
            analysis=stage2.analysis,
            insights=stage2.insights,
            final_output=stage3.final_output,
            confidence=stage3.confidence
        )

# 使用高级流水线
def demo_advanced_pipeline():
    pipeline = AdvancedPipeline()
    
    result = pipeline(
        raw_input="    这是一个测试文本，有一些 噪音数据！！！",
        context="这是一个文本处理的示例"
    )
    
    print("原始输入:", result.raw_input)
    print("处理后输入:", result.processed_input)
    print("元数据:", result.metadata)
    print("分析结果:", result.analysis)
    print("洞察:", result.insights)
    print("最终输出:", result.final_output)
    print("置信度:", result.confidence)
```

## 实践练习

### 练习1: 自定义签名

创建一个文章摘要的签名，包含文章内容、摘要、关键词等字段。

```python
# 你的练习代码
class ArticleSummary(dspy.Signature):
    """你的文章摘要签名"""
    # 定义你的字段
    pass
```

### 练习2: 组合模块

构建一个包含多个处理步骤的复杂模块。

```python
class ComplexModule(dspy.Module):
    def __init__(self):
        super().__init__()
        # 定义你的子模块
        pass
    
    def forward(self, **kwargs):
        # 实现处理逻辑
        pass
```

### 练习3: 预测器对比

对比不同预测器在相同任务上的表现差异。

```python
def compare_my_predictors():
    # 实现你的对比实验
    pass
```

::: warning 最佳实践
- 签名描述要清晰具体，有助于模型理解任务
- 合理使用不同类型的预测器，简单任务用Predict，复杂推理用ChainOfThought
- 模块设计要考虑复用性和可维护性
- 注意数据在模块间的流转和格式转换
:::

::: note 性能提示
- 避免在循环中创建预测器实例
- 缓存重复的计算结果
- 合理设置max_tokens参数
- 考虑使用批处理提高效率
:::

## 本章总结

通过本章学习，你已经掌握了：

1. **签名机制**：定义清晰的输入输出规范
2. **模块构建**：创建可复用的功能组件
3. **预测器使用**：选择合适的推理方式
4. **数据处理**：处理不同类型的输入输出
5. **组合模式**：构建复杂的处理流水线

这些核心概念为构建更复杂的DSPy应用奠定了基础。下一章我们将深入学习各种预测器的详细用法和最佳实践。