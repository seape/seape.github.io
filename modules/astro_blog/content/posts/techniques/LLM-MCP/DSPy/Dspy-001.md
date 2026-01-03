---
title: "第01章：DSPy 入门基础"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第01章：DSPy 入门基础

::: tip 学习目标
- 理解DSPy的核心理念和设计哲学
- 掌握DSPy与传统提示工程的区别
- 了解DSPy的架构组件和工作流程
- 配置DSPy开发环境
- 运行第一个DSPy程序
:::

## 知识点

### 1. DSPy 核心理念

DSPy（Declarative Self-improving Python）是一个用于编程语言模型的框架，它将传统的提示工程转变为更系统化的编程方法。

#### 核心设计哲学
- **声明式编程**：描述"要做什么"而非"如何做"
- **自动优化**：框架自动优化提示和推理链
- **模块化设计**：可组合的功能模块
- **类型安全**：强类型系统确保输入输出一致性

#### 与传统方法的对比

| 特征 | 传统提示工程 | DSPy框架 |
|------|-------------|----------|
| 方法论 | 手工调试提示 | 程序化构建 |
| 优化方式 | 人工迭代 | 自动优化 |
| 可维护性 | 难以维护 | 高度模块化 |
| 扩展性 | 受限 | 易于扩展 |
| 复用性 | 低 | 高 |

### 2. DSPy 架构组件

#### 核心组件层次结构
```
DSPy框架
├── 签名(Signatures) - 定义输入输出规范
├── 模块(Modules) - 功能组件
├── 预测器(Predictors) - 推理引擎
├── 优化器(Optimizers) - 自动调优
└── 编译器(Compilers) - 程序编译
```

#### 工作流程
1. **定义签名**：指定输入输出格式
2. **构建模块**：组合功能组件
3. **配置预测器**：选择推理方式
4. **编译优化**：自动调优性能
5. **执行程序**：运行语言模型程序

### 3. 环境配置

#### 安装DSPy

```bash
# 基础安装
pip install dspy-ai

# 安装完整功能（包括所有依赖）
pip install "dspy-ai[complete]"

# 开发环境安装
pip install "dspy-ai[dev]"
```

#### 必要依赖

```bash
# 核心依赖
pip install openai anthropic
pip install pandas numpy
pip install chromadb faiss-cpu

# 可选依赖（根据需要安装）
pip install transformers torch  # 本地模型
pip install pinecone-client     # Pinecone向量数据库
pip install weaviate-client     # Weaviate向量数据库
```

### 4. 开发环境配置

#### 配置文件设置

```python
# config.py - 配置文件
import os
from dotenv import load_dotenv

load_dotenv()

# API配置
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

# 模型配置
DEFAULT_MODEL = "gpt-3.5-turbo"
TEMPERATURE = 0.0
MAX_TOKENS = 1000

# 日志配置
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
```

#### 环境变量配置

```bash
# .env 文件
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
DSPY_CACHE_DIR=./cache
DSPY_LOG_LEVEL=INFO
```

## 示例代码

### 第一个DSPy程序

```python
import dspy

# 1. 配置语言模型
lm = dspy.OpenAI(model="gpt-3.5-turbo", max_tokens=100)
dspy.settings.configure(lm=lm)

# 2. 定义签名 - 描述任务的输入输出
class BasicQA(dspy.Signature):
    """回答用户问题的基本问答系统"""
    question = dspy.InputField()      # 输入：问题
    answer = dspy.OutputField()       # 输出：答案

# 3. 创建预测器模块
predict = dspy.Predict(BasicQA)

# 4. 使用程序
question = "什么是人工智能？"
response = predict(question=question)

print(f"问题: {question}")
print(f"答案: {response.answer}")
```

### 环境验证脚本

```python
# verify_setup.py - 验证环境配置
import dspy
import sys
import os

def verify_dspy_installation():
    """验证DSPy安装"""
    try:
        import dspy
        print("✅ DSPy安装成功")
        print(f"   版本: {dspy.__version__}")
        return True
    except ImportError as e:
        print("❌ DSPy安装失败")
        print(f"   错误: {e}")
        return False

def verify_api_keys():
    """验证API密钥配置"""
    keys_status = {}
    
    # 检查OpenAI API Key
    openai_key = os.getenv('OPENAI_API_KEY')
    if openai_key:
        keys_status['OpenAI'] = "✅ 已配置"
    else:
        keys_status['OpenAI'] = "❌ 未配置"
    
    # 检查Anthropic API Key
    anthropic_key = os.getenv('ANTHROPIC_API_KEY')
    if anthropic_key:
        keys_status['Anthropic'] = "✅ 已配置"
    else:
        keys_status['Anthropic'] = "❌ 未配置"
    
    print("\nAPI密钥状态:")
    for provider, status in keys_status.items():
        print(f"   {provider}: {status}")
    
    return any('✅' in status for status in keys_status.values())

def test_basic_functionality():
    """测试基本功能"""
    try:
        # 尝试创建模型（不实际调用API）
        if os.getenv('OPENAI_API_KEY'):
            lm = dspy.OpenAI(model="gpt-3.5-turbo", max_tokens=10)
            print("✅ 模型配置成功")
        else:
            print("⚠️  无API密钥，跳过模型测试")
        
        # 测试签名创建
        class TestSignature(dspy.Signature):
            input_text = dspy.InputField()
            output_text = dspy.OutputField()
        
        print("✅ 签名创建成功")
        
        # 测试预测器创建
        predictor = dspy.Predict(TestSignature)
        print("✅ 预测器创建成功")
        
        return True
        
    except Exception as e:
        print(f"❌ 功能测试失败: {e}")
        return False

def main():
    """主验证函数"""
    print("DSPy环境验证工具")
    print("=" * 30)
    
    # 验证安装
    if not verify_dspy_installation():
        sys.exit(1)
    
    # 验证API密钥
    if not verify_api_keys():
        print("⚠️  警告: 未检测到API密钥，部分功能将无法使用")
    
    # 测试基本功能
    if test_basic_functionality():
        print("\n🎉 环境配置验证完成！")
        print("你现在可以开始使用DSPy了")
    else:
        print("\n❌ 环境配置存在问题")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

### 完整的Hello World示例

```python
# hello_dspy.py - 完整的DSPy入门示例
import dspy
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

def setup_dspy():
    """设置DSPy环境"""
    # 配置OpenAI模型
    if os.getenv('OPENAI_API_KEY'):
        lm = dspy.OpenAI(
            model="gpt-3.5-turbo",
            max_tokens=150,
            temperature=0.1
        )
        dspy.settings.configure(lm=lm)
        print("✅ DSPy已配置OpenAI模型")
    else:
        print("❌ 未找到OpenAI API密钥")
        return False
    return True

class Greeting(dspy.Signature):
    """生成个性化问候语的签名"""
    name = dspy.InputField(desc="用户的姓名")
    language = dspy.InputField(desc="问候语的语言")
    greeting = dspy.OutputField(desc="个性化的问候语")

class Translation(dspy.Signature):
    """翻译文本的签名"""
    text = dspy.InputField(desc="需要翻译的文本")
    target_language = dspy.InputField(desc="目标语言")
    translation = dspy.OutputField(desc="翻译后的文本")

def main():
    """主程序"""
    print("DSPy Hello World 示例")
    print("=" * 25)
    
    # 设置环境
    if not setup_dspy():
        return
    
    # 示例1: 基本问候
    print("\n1. 基本问候示例:")
    greeter = dspy.Predict(Greeting)
    
    result = greeter(
        name="小明",
        language="中文"
    )
    print(f"   问候语: {result.greeting}")
    
    # 示例2: 英文问候
    print("\n2. 英文问候示例:")
    result = greeter(
        name="Alice",
        language="English"
    )
    print(f"   Greeting: {result.greeting}")
    
    # 示例3: 翻译功能
    print("\n3. 翻译功能示例:")
    translator = dspy.Predict(Translation)
    
    result = translator(
        text="Hello, how are you?",
        target_language="中文"
    )
    print(f"   原文: Hello, how are you?")
    print(f"   译文: {result.translation}")
    
    print("\n🎉 DSPy入门示例完成！")

if __name__ == "__main__":
    main()
```

## 实践练习

### 练习1: 环境配置验证

运行环境验证脚本，确保DSPy正确安装并配置了API密钥。

```bash
python verify_setup.py
```

### 练习2: 创建第一个DSPy程序

1. 创建一个简单的问答系统
2. 定义自己的签名
3. 测试不同类型的问题

```python
# 你的练习代码
class MyQA(dspy.Signature):
    """你的问答系统描述"""
    question = dspy.InputField(desc="用户问题")
    answer = dspy.OutputField(desc="系统答案")

# 实现并测试你的程序
```

### 练习3: 对比传统方法

尝试用传统的prompt engineering方法实现相同功能，对比两种方法的差异。

::: warning 注意事项
- 确保API密钥安全，不要提交到版本控制系统
- 注意API调用费用，使用适当的token限制
- 在生产环境中要处理API调用异常
:::

::: note 扩展阅读
- DSPy官方文档: https://dspy-docs.vercel.app/
- DSPy GitHub仓库: https://github.com/stanfordnlp/dspy
- 相关论文: "DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines"
:::

## 本章总结

通过本章学习，你已经：

1. **理解了DSPy的核心理念**：从手工提示工程转向程序化语言模型编程
2. **掌握了基本架构**：签名、模块、预测器等核心组件
3. **配置了开发环境**：安装DSPy并设置API密钥
4. **运行了第一个程序**：创建并运行简单的DSPy应用

下一章我们将深入学习DSPy的核心概念和组件，包括签名机制、模块系统和预测器的详细使用方法。

::: tip 学习建议
- 多动手实践，运行示例代码
- 尝试修改参数，观察输出变化
- 思考DSPy与传统方法的优势
- 为下一章的学习做好准备
:::