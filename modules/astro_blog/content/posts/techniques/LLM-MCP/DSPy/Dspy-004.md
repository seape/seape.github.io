---
title: "第04章：DSPy 优化器和编译"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第04章：DSPy 优化器和编译

::: tip 学习目标
- 理解DSPy编译过程的工作机制
- 学习Bootstrap Few-Shot优化器
- 掌握LabeledFewShot优化器的使用
- 探索COPRO优化器的功能
- 理解优化器的评估和调优策略
:::

## 知识点

### 1. DSPy 编译机制概述

DSPy的编译过程是将高级DSPy程序转换为优化的提示和推理链的核心机制。编译器通过分析程序结构和训练数据，自动优化提示模板和推理策略。

#### 编译过程的核心组件

```python
# 编译过程的基本流程
import dspy

# 1. 定义语言模型
lm = dspy.OpenAI(model='gpt-3.5-turbo')
dspy.settings.configure(lm=lm)

# 2. 定义程序
class BasicQA(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generate_answer = dspy.ChainOfThought("question -> answer")
    
    def forward(self, question):
        return self.generate_answer(question=question)

# 3. 准备训练数据
trainset = [
    dspy.Example(question="What is Python?", answer="Python is a programming language").with_inputs('question'),
    dspy.Example(question="What is AI?", answer="AI is artificial intelligence").with_inputs('question')
]

# 4. 配置优化器
optimizer = dspy.BootstrapFewShot(metric=lambda example, pred, trace=None: 
                                 example.answer.lower() in pred.answer.lower())

# 5. 编译程序
compiled_qa = optimizer.compile(BasicQA(), trainset=trainset)
```

#### 编译器的工作原理

```python
# 编译器内部工作流程示例
class CompilationProcess:
    """展示DSPy编译过程的内部机制"""
    
    def __init__(self, program, optimizer, trainset):
        self.program = program
        self.optimizer = optimizer
        self.trainset = trainset
        self.compiled_program = None
    
    def analyze_program_structure(self):
        """分析程序结构，识别可优化的组件"""
        # 识别所有的预测器模块
        predictors = []
        for module in self.program.modules():
            if isinstance(module, dspy.Predict):
                predictors.append(module)
        return predictors
    
    def generate_demonstrations(self, predictors):
        """为每个预测器生成示例"""
        demonstrations = {}
        
        for predictor in predictors:
            # 使用训练数据生成high-quality的示例
            demos = []
            for example in self.trainset[:5]:  # 选择前5个作为示例
                try:
                    # 运行原始程序获取中间结果
                    with dspy.context(lm=self.optimizer.student):
                        result = self.program(example.question)
                        if self.optimizer.metric(example, result):
                            demos.append({
                                'input': example.question,
                                'output': result.answer,
                                'reasoning': getattr(result, 'rationale', '')
                            })
                except Exception as e:
                    continue
            demonstrations[predictor] = demos
        
        return demonstrations
    
    def optimize_prompts(self, demonstrations):
        """基于示例优化提示模板"""
        optimized_predictors = {}
        
        for predictor, demos in demonstrations.items():
            if demos:
                # 构建优化的few-shot提示
                few_shot_examples = []
                for demo in demos:
                    few_shot_examples.append({
                        'input': demo['input'],
                        'output': demo['output']
                    })
                
                # 创建优化后的预测器
                optimized_predictor = dspy.Predict(predictor.signature)
                optimized_predictor.demos = few_shot_examples
                optimized_predictors[predictor] = optimized_predictor
        
        return optimized_predictors
    
    def compile(self):
        """执行完整的编译过程"""
        print("🔄 开始编译程序...")
        
        # 1. 分析程序结构
        predictors = self.analyze_program_structure()
        print(f"📊 发现 {len(predictors)} 个预测器")
        
        # 2. 生成示例
        demonstrations = self.generate_demonstrations(predictors)
        print(f"🎯 生成了 {sum(len(demos) for demos in demonstrations.values())} 个示例")
        
        # 3. 优化提示
        optimized_predictors = self.optimize_prompts(demonstrations)
        print(f"⚡ 优化了 {len(optimized_predictors)} 个预测器")
        
        # 4. 重新构建程序
        self.compiled_program = self._rebuild_program_with_optimizations(optimized_predictors)
        print("✅ 编译完成!")
        
        return self.compiled_program

# 使用示例
program = BasicQA()
optimizer = dspy.BootstrapFewShot()
compiler = CompilationProcess(program, optimizer, trainset)
compiled_program = compiler.compile()
```

### 2. Bootstrap Few-Shot 优化器

Bootstrap Few-Shot是DSPy中最常用的优化器，它通过自举方法生成高质量的few-shot示例。

#### 基本原理和使用

```python
import dspy
import random
from typing import List, Callable

class AdvancedBootstrapFewShot:
    """增强版的Bootstrap Few-Shot优化器"""
    
    def __init__(self, 
                 metric: Callable,
                 teacher: dspy.LM = None,
                 max_bootstrapped_demos: int = 4,
                 max_labeled_demos: int = 16,
                 max_rounds: int = 1,
                 num_candidate_programs: int = 16,
                 num_threads: int = 6):
        
        self.metric = metric
        self.teacher = teacher
        self.max_bootstrapped_demos = max_bootstrapped_demos
        self.max_labeled_demos = max_labeled_demos
        self.max_rounds = max_rounds
        self.num_candidate_programs = num_candidate_programs
        self.num_threads = num_threads
    
    def bootstrap_one_example(self, program, example):
        """为单个示例生成bootstrap演示"""
        try:
            # 使用teacher模型（如果有）或当前模型生成预测
            with dspy.context(lm=self.teacher if self.teacher else dspy.settings.lm):
                prediction = program(**example.inputs())
                
                # 验证预测质量
                if self.metric(example, prediction):
                    # 构建演示样本
                    demo = dspy.Example()
                    demo = demo.with_inputs(**example.inputs())
                    demo = demo.with_outputs(**prediction.outputs())
                    return demo
        except Exception as e:
            print(f"Bootstrap失败: {e}")
        
        return None
    
    def bootstrap_examples(self, program, trainset):
        """批量生成bootstrap示例"""
        bootstrapped_examples = []
        
        for example in trainset:
            if len(bootstrapped_examples) >= self.max_bootstrapped_demos:
                break
                
            demo = self.bootstrap_one_example(program, example)
            if demo:
                bootstrapped_examples.append(demo)
                print(f"✅ 生成示例 {len(bootstrapped_examples)}/{self.max_bootstrapped_demos}")
        
        return bootstrapped_examples
    
    def evaluate_program(self, program, devset):
        """评估程序性能"""
        correct = 0
        total = len(devset)
        
        for example in devset:
            try:
                prediction = program(**example.inputs())
                if self.metric(example, prediction):
                    correct += 1
            except Exception:
                continue
        
        return correct / total if total > 0 else 0.0
    
    def compile(self, student_program, trainset, valset=None):
        """编译学生程序"""
        if valset is None:
            # 如果没有验证集，从训练集中随机分割
            random.shuffle(trainset)
            split_point = int(len(trainset) * 0.8)
            trainset, valset = trainset[:split_point], trainset[split_point:]
        
        print(f"🎓 开始Bootstrap优化，训练集: {len(trainset)}, 验证集: {len(valset)}")
        
        best_program = None
        best_score = 0.0
        
        for round_idx in range(self.max_rounds):
            print(f"\n🔄 第 {round_idx + 1} 轮优化")
            
            # 生成bootstrap示例
            bootstrapped_demos = self.bootstrap_examples(student_program, trainset)
            print(f"📚 生成了 {len(bootstrapped_demos)} 个bootstrap示例")
            
            # 生成多个候选程序
            candidate_programs = []
            
            for candidate_idx in range(self.num_candidate_programs):
                # 随机选择示例子集
                selected_demos = random.sample(
                    bootstrapped_demos, 
                    min(len(bootstrapped_demos), self.max_bootstrapped_demos)
                )
                
                # 创建候选程序
                candidate = student_program.deepcopy()
                
                # 为每个预测器添加示例
                for module in candidate.modules():
                    if isinstance(module, dspy.Predict):
                        module.demos = selected_demos
                
                candidate_programs.append(candidate)
            
            # 评估所有候选程序
            print("🔍 评估候选程序...")
            for i, candidate in enumerate(candidate_programs):
                score = self.evaluate_program(candidate, valset)
                print(f"候选程序 {i+1}: {score:.3f}")
                
                if score > best_score:
                    best_score = score
                    best_program = candidate
        
        print(f"\n🏆 最佳程序得分: {best_score:.3f}")
        return best_program

# 实际应用示例
class MathWordProblem(dspy.Module):
    """数学应用题求解器"""
    
    def __init__(self):
        super().__init__()
        self.solve = dspy.ChainOfThought("problem -> reasoning, answer")
    
    def forward(self, problem):
        result = self.solve(problem=problem)
        return dspy.Prediction(
            reasoning=result.reasoning,
            answer=result.answer
        )

# 准备数据
math_trainset = [
    dspy.Example(
        problem="小明有5个苹果，吃了2个，还剩多少个？",
        answer="3"
    ).with_inputs('problem'),
    dspy.Example(
        problem="一个班有30个学生，其中12个是男生，女生有多少个？",
        answer="18"
    ).with_inputs('problem'),
    # ... 更多示例
]

# 定义评估指标
def math_metric(example, prediction, trace=None):
    """数学问题的评估指标"""
    try:
        # 提取数字答案
        import re
        pred_numbers = re.findall(r'\d+', prediction.answer)
        true_numbers = re.findall(r'\d+', example.answer)
        
        if pred_numbers and true_numbers:
            return pred_numbers[-1] == true_numbers[-1]
    except:
        pass
    return False

# 使用Bootstrap优化器
math_program = MathWordProblem()
optimizer = AdvancedBootstrapFewShot(
    metric=math_metric,
    max_bootstrapped_demos=6,
    num_candidate_programs=10
)

compiled_math_program = optimizer.compile(math_program, math_trainset)
```

### 3. LabeledFewShot 优化器

LabeledFewShot优化器使用预标记的示例来优化程序性能。

```python
class LabeledFewShotOptimizer:
    """标记Few-Shot优化器的详细实现"""
    
    def __init__(self, k: int = 16):
        self.k = k  # 使用的示例数量
    
    def select_examples(self, trainset, program_signature):
        """智能选择最佳示例"""
        # 方法1: 随机选择
        random_examples = random.sample(trainset, min(self.k, len(trainset)))
        
        # 方法2: 多样性选择
        diverse_examples = self.select_diverse_examples(trainset)
        
        # 方法3: 难度平衡选择
        balanced_examples = self.select_balanced_examples(trainset)
        
        return diverse_examples
    
    def select_diverse_examples(self, trainset):
        """选择多样化的示例"""
        if len(trainset) <= self.k:
            return trainset
        
        selected = []
        remaining = trainset.copy()
        
        # 先随机选择一个
        first = random.choice(remaining)
        selected.append(first)
        remaining.remove(first)
        
        # 迭代选择最不相似的示例
        while len(selected) < self.k and remaining:
            best_candidate = None
            best_diversity_score = -1
            
            for candidate in remaining:
                # 计算与已选示例的多样性得分
                diversity_score = self.calculate_diversity(candidate, selected)
                
                if diversity_score > best_diversity_score:
                    best_diversity_score = diversity_score
                    best_candidate = candidate
            
            if best_candidate:
                selected.append(best_candidate)
                remaining.remove(best_candidate)
        
        return selected
    
    def calculate_diversity(self, candidate, selected_examples):
        """计算示例的多样性得分"""
        if not selected_examples:
            return 1.0
        
        # 简单的基于文本长度和词汇的多样性度量
        candidate_words = set(candidate.question.lower().split())
        
        diversity_scores = []
        for selected in selected_examples:
            selected_words = set(selected.question.lower().split())
            
            # Jaccard距离作为多样性度量
            intersection = len(candidate_words & selected_words)
            union = len(candidate_words | selected_words)
            
            if union == 0:
                diversity = 1.0
            else:
                diversity = 1.0 - (intersection / union)
            
            diversity_scores.append(diversity)
        
        # 返回平均多样性
        return sum(diversity_scores) / len(diversity_scores)
    
    def select_balanced_examples(self, trainset):
        """选择难度平衡的示例"""
        # 按问题复杂度分类
        simple_examples = []
        medium_examples = []
        complex_examples = []
        
        for example in trainset:
            complexity = self.estimate_complexity(example)
            if complexity < 0.3:
                simple_examples.append(example)
            elif complexity < 0.7:
                medium_examples.append(example)
            else:
                complex_examples.append(example)
        
        # 平衡选择
        selected = []
        target_simple = self.k // 3
        target_medium = self.k // 3
        target_complex = self.k - target_simple - target_medium
        
        selected.extend(random.sample(simple_examples, min(target_simple, len(simple_examples))))
        selected.extend(random.sample(medium_examples, min(target_medium, len(medium_examples))))
        selected.extend(random.sample(complex_examples, min(target_complex, len(complex_examples))))
        
        # 如果不足，从剩余中补充
        while len(selected) < self.k and len(selected) < len(trainset):
            remaining = [ex for ex in trainset if ex not in selected]
            if remaining:
                selected.append(random.choice(remaining))
        
        return selected[:self.k]
    
    def estimate_complexity(self, example):
        """估算示例复杂度"""
        question_length = len(example.question.split())
        answer_length = len(example.answer.split())
        
        # 基于长度和特殊字符的简单复杂度估算
        complexity = (question_length + answer_length) / 50.0
        
        # 添加特殊模式的权重
        if any(word in example.question.lower() for word in ['why', 'how', 'explain']):
            complexity += 0.3
        
        if any(char in example.question for char in ['?', '!', ';']):
            complexity += 0.1
        
        return min(complexity, 1.0)
    
    def compile(self, student_program, trainset):
        """编译程序使用标记的示例"""
        print(f"🏷️  使用LabeledFewShot优化器，训练集大小: {len(trainset)}")
        
        # 选择最佳示例
        selected_examples = self.select_examples(trainset, None)
        print(f"📋 选择了 {len(selected_examples)} 个示例")
        
        # 创建优化后的程序
        optimized_program = student_program.deepcopy()
        
        # 为每个预测器添加示例
        for module in optimized_program.modules():
            if isinstance(module, dspy.Predict):
                module.demos = selected_examples
                print(f"🎯 为预测器添加了 {len(selected_examples)} 个示例")
        
        return optimized_program

# 使用示例
class QuestionClassifier(dspy.Module):
    """问题分类器"""
    
    def __init__(self):
        super().__init__()
        self.classify = dspy.Predict("question -> category")
    
    def forward(self, question):
        result = self.classify(question=question)
        return result

# 准备分类训练数据
classification_trainset = [
    dspy.Example(question="What is the weather today?", category="weather").with_inputs('question'),
    dspy.Example(question="How do I cook pasta?", category="cooking").with_inputs('question'),
    dspy.Example(question="What is machine learning?", category="technology").with_inputs('question'),
    dspy.Example(question="Where is Paris?", category="geography").with_inputs('question'),
    # ... 更多示例
]

# 使用LabeledFewShot优化
classifier = QuestionClassifier()
labeled_optimizer = LabeledFewShotOptimizer(k=8)
optimized_classifier = labeled_optimizer.compile(classifier, classification_trainset)

# 测试优化后的分类器
test_questions = [
    "How is the weather in Tokyo?",
    "Recipe for chocolate cake",
    "Explain neural networks"
]

for question in test_questions:
    result = optimized_classifier(question=question)
    print(f"问题: {question}")
    print(f"分类: {result.category}\n")
```

### 4. COPRO 优化器

COPRO (Constrained Optimization with Prompt-based Reasoning) 是一个高级优化器，专注于提示优化。

```python
class COPROOptimizer:
    """COPRO优化器的实现"""
    
    def __init__(self, 
                 metric,
                 breadth: int = 10,
                 depth: int = 3,
                 init_temperature: float = 1.4,
                 verbose: bool = False):
        
        self.metric = metric
        self.breadth = breadth  # 每次生成的候选数量
        self.depth = depth      # 优化轮数
        self.init_temperature = init_temperature
        self.verbose = verbose
    
    def generate_instruction_variants(self, original_instruction, num_variants=10):
        """生成指令变体"""
        # 使用语言模型生成指令的变体
        variation_prompt = f"""
给定以下指令，请生成{num_variants}个功能等价但表述不同的变体指令。
要求：
1. 保持原始指令的核心目的不变
2. 使用不同的措辞和表达方式
3. 每个变体占一行

原始指令: {original_instruction}

变体指令:
"""
        
        # 这里需要调用语言模型
        # 为了示例，我们使用预定义的变体
        variants = [
            f"请仔细分析并{original_instruction.lower()}",
            f"根据给定信息，{original_instruction.lower()}",
            f"基于以下内容，请{original_instruction.lower()}",
            f"请详细{original_instruction.lower()}",
            f"认真考虑后，{original_instruction.lower()}",
        ]
        
        return variants[:num_variants]
    
    def optimize_signature_instructions(self, program, trainset):
        """优化签名中的指令"""
        optimized_predictors = {}
        
        for module in program.modules():
            if isinstance(module, dspy.Predict):
                signature = module.signature
                original_instructions = getattr(signature, 'instructions', '')
                
                if self.verbose:
                    print(f"🔧 优化预测器指令: {original_instructions}")
                
                best_instruction = original_instructions
                best_score = self.evaluate_instruction(
                    module, best_instruction, trainset
                )
                
                # 生成指令变体
                instruction_variants = self.generate_instruction_variants(
                    original_instructions, self.breadth
                )
                
                # 测试每个变体
                for variant in instruction_variants:
                    score = self.evaluate_instruction(module, variant, trainset)
                    
                    if self.verbose:
                        print(f"  变体: {variant[:50]}... 得分: {score:.3f}")
                    
                    if score > best_score:
                        best_score = score
                        best_instruction = variant
                
                # 保存最佳指令
                optimized_predictors[module] = {
                    'instruction': best_instruction,
                    'score': best_score
                }
        
        return optimized_predictors
    
    def evaluate_instruction(self, predictor, instruction, examples):
        """评估特定指令的性能"""
        # 创建临时预测器
        temp_predictor = predictor.deepcopy()
        
        # 更新指令
        if hasattr(temp_predictor.signature, 'instructions'):
            temp_predictor.signature.instructions = instruction
        
        # 在示例子集上评估
        correct = 0
        total = min(len(examples), 20)  # 限制评估数量以提高速度
        
        for example in examples[:total]:
            try:
                prediction = temp_predictor(**example.inputs())
                if self.metric(example, prediction):
                    correct += 1
            except Exception as e:
                if self.verbose:
                    print(f"评估错误: {e}")
                continue
        
        return correct / total if total > 0 else 0.0
    
    def progressive_optimization(self, program, trainset):
        """渐进式优化"""
        current_program = program.deepcopy()
        
        for depth_level in range(self.depth):
            print(f"\n🔄 COPRO优化第 {depth_level + 1}/{self.depth} 轮")
            
            # 优化当前程序的指令
            optimizations = self.optimize_signature_instructions(
                current_program, trainset
            )
            
            # 应用最佳优化
            improvements = 0
            for module, optimization in optimizations.items():
                if optimization['score'] > 0:
                    # 更新模块指令
                    if hasattr(module.signature, 'instructions'):
                        module.signature.instructions = optimization['instruction']
                    improvements += 1
            
            print(f"✨ 第{depth_level + 1}轮优化了 {improvements} 个模块")
            
            # 如果没有改进，提前结束
            if improvements == 0:
                print("🏁 没有进一步改进，优化结束")
                break
        
        return current_program
    
    def compile(self, student_program, trainset, valset=None):
        """编译学生程序"""
        print(f"🚀 开始COPRO优化")
        print(f"📊 训练集大小: {len(trainset)}")
        
        if valset is None:
            # 分割训练集
            random.shuffle(trainset)
            split_point = int(len(trainset) * 0.8)
            train_subset, val_subset = trainset[:split_point], trainset[split_point:]
        else:
            train_subset = trainset
            val_subset = valset
        
        # 执行渐进式优化
        optimized_program = self.progressive_optimization(student_program, train_subset)
        
        # 最终评估
        if val_subset:
            final_score = self.evaluate_program(optimized_program, val_subset)
            print(f"🎯 最终验证得分: {final_score:.3f}")
        
        return optimized_program
    
    def evaluate_program(self, program, examples):
        """评估整个程序"""
        correct = 0
        total = len(examples)
        
        for example in examples:
            try:
                prediction = program(**example.inputs())
                if self.metric(example, prediction):
                    correct += 1
            except Exception:
                continue
        
        return correct / total if total > 0 else 0.0

# 实际应用示例
class SentimentAnalyzer(dspy.Module):
    """情感分析器"""
    
    def __init__(self):
        super().__init__()
        self.analyze = dspy.ChainOfThought(
            "text -> reasoning, sentiment",
            instructions="Analyze the sentiment of the given text. Consider context, tone, and emotional indicators."
        )
    
    def forward(self, text):
        result = self.analyze(text=text)
        return dspy.Prediction(
            reasoning=result.reasoning,
            sentiment=result.sentiment
        )

# 准备情感分析数据
sentiment_trainset = [
    dspy.Example(text="I love this movie! It's amazing!", sentiment="positive").with_inputs('text'),
    dspy.Example(text="This is the worst experience ever.", sentiment="negative").with_inputs('text'),
    dspy.Example(text="The weather is okay today.", sentiment="neutral").with_inputs('text'),
    # ... 更多示例
]

def sentiment_metric(example, prediction, trace=None):
    """情感分析评估指标"""
    return example.sentiment.lower() in prediction.sentiment.lower()

# 使用COPRO优化器
sentiment_analyzer = SentimentAnalyzer()
copro_optimizer = COPROOptimizer(
    metric=sentiment_metric,
    breadth=8,
    depth=3,
    verbose=True
)

optimized_analyzer = copro_optimizer.compile(sentiment_analyzer, sentiment_trainset)
```

### 5. 优化器评估和调优策略

```python
class OptimizerEvaluator:
    """优化器评估和比较工具"""
    
    def __init__(self, base_program, trainset, testset):
        self.base_program = base_program
        self.trainset = trainset
        self.testset = testset
        self.results = {}
    
    def evaluate_optimizer(self, optimizer_name, optimizer, metric):
        """评估单个优化器"""
        print(f"\n🧪 评估优化器: {optimizer_name}")
        
        # 记录开始时间
        import time
        start_time = time.time()
        
        try:
            # 编译程序
            compiled_program = optimizer.compile(self.base_program, self.trainset)
            compilation_time = time.time() - start_time
            
            # 评估性能
            test_score = self.evaluate_program(compiled_program, self.testset, metric)
            train_score = self.evaluate_program(compiled_program, self.trainset, metric)
            
            # 记录结果
            self.results[optimizer_name] = {
                'test_score': test_score,
                'train_score': train_score,
                'compilation_time': compilation_time,
                'overfitting': abs(train_score - test_score)
            }
            
            print(f"✅ {optimizer_name}:")
            print(f"   训练得分: {train_score:.3f}")
            print(f"   测试得分: {test_score:.3f}")
            print(f"   编译时间: {compilation_time:.2f}s")
            print(f"   过拟合程度: {abs(train_score - test_score):.3f}")
            
        except Exception as e:
            print(f"❌ {optimizer_name} 评估失败: {e}")
            self.results[optimizer_name] = {
                'error': str(e)
            }
    
    def evaluate_program(self, program, examples, metric):
        """评估程序在数据集上的性能"""
        correct = 0
        total = len(examples)
        
        for example in examples:
            try:
                prediction = program(**example.inputs())
                if metric(example, prediction):
                    correct += 1
            except:
                continue
        
        return correct / total if total > 0 else 0.0
    
    def compare_optimizers(self, optimizers_config, metric):
        """比较多个优化器"""
        print("🔍 开始优化器性能比较")
        
        for name, optimizer in optimizers_config.items():
            self.evaluate_optimizer(name, optimizer, metric)
        
        # 生成比较报告
        self.generate_comparison_report()
    
    def generate_comparison_report(self):
        """生成比较报告"""
        print("\n📊 优化器比较报告")
        print("=" * 60)
        
        # 按测试得分排序
        valid_results = {k: v for k, v in self.results.items() if 'error' not in v}
        
        if not valid_results:
            print("❌ 没有成功的优化器结果")
            return
        
        sorted_results = sorted(
            valid_results.items(),
            key=lambda x: x[1]['test_score'],
            reverse=True
        )
        
        print(f"{'优化器':<20} {'测试得分':<10} {'训练得分':<10} {'编译时间':<10} {'过拟合':<10}")
        print("-" * 60)
        
        for name, result in sorted_results:
            print(f"{name:<20} {result['test_score']:<10.3f} {result['train_score']:<10.3f} "
                  f"{result['compilation_time']:<10.2f} {result['overfitting']:<10.3f}")
        
        # 推荐最佳优化器
        best_optimizer = sorted_results[0]
        print(f"\n🏆 推荐优化器: {best_optimizer[0]}")
        
        # 分析结果
        print("\n📈 分析结果:")
        if best_optimizer[1]['overfitting'] > 0.1:
            print("⚠️  最佳优化器可能存在过拟合问题，建议:")
            print("   - 增加训练数据")
            print("   - 使用正则化技术")
            print("   - 减少模型复杂度")
        
        if best_optimizer[1]['compilation_time'] > 300:  # 5分钟
            print("⏰ 编译时间较长，建议:")
            print("   - 减少候选程序数量")
            print("   - 使用更小的训练集进行快速迭代")
            print("   - 考虑并行化优化")

# 实际评估示例
def comprehensive_optimizer_evaluation():
    """综合优化器评估示例"""
    
    # 准备测试程序
    class TestProgram(dspy.Module):
        def __init__(self):
            super().__init__()
            self.generate = dspy.ChainOfThought("question -> answer")
        
        def forward(self, question):
            return self.generate(question=question)
    
    # 准备数据
    import random
    full_dataset = [
        dspy.Example(question="What is 2+2?", answer="4").with_inputs('question'),
        dspy.Example(question="What is the capital of France?", answer="Paris").with_inputs('question'),
        # ... 更多示例
    ]
    
    # 分割数据
    random.shuffle(full_dataset)
    train_size = int(len(full_dataset) * 0.6)
    test_size = int(len(full_dataset) * 0.2)
    
    trainset = full_dataset[:train_size]
    testset = full_dataset[train_size:train_size + test_size]
    
    # 定义评估指标
    def simple_metric(example, prediction, trace=None):
        return example.answer.lower() in prediction.answer.lower()
    
    # 配置优化器
    optimizers = {
        'Bootstrap': AdvancedBootstrapFewShot(metric=simple_metric, max_bootstrapped_demos=4),
        'LabeledFewShot': LabeledFewShotOptimizer(k=8),
        'COPRO': COPROOptimizer(metric=simple_metric, breadth=6, depth=2)
    }
    
    # 执行评估
    evaluator = OptimizerEvaluator(TestProgram(), trainset, testset)
    evaluator.compare_optimizers(optimizers, simple_metric)
    
    return evaluator.results

# 运行评估
# evaluation_results = comprehensive_optimizer_evaluation()
```

## 实践练习

### 练习1：自定义优化器

```python
class CustomOptimizer:
    """自定义优化器练习"""
    
    def __init__(self, metric, strategy='random'):
        self.metric = metric
        self.strategy = strategy  # 'random', 'similarity', 'difficulty'
    
    def compile(self, program, trainset):
        """实现你的优化策略"""
        # TODO: 实现自定义优化逻辑
        pass

# 练习任务：
# 1. 实现基于相似度的示例选择策略
# 2. 实现基于难度递增的示例选择策略
# 3. 比较不同策略的性能差异
```

### 练习2：多目标优化

```python
class MultiObjectiveOptimizer:
    """多目标优化器练习"""
    
    def __init__(self, metrics_config):
        """
        metrics_config: {
            'accuracy': {'metric': accuracy_func, 'weight': 0.6},
            'speed': {'metric': speed_func, 'weight': 0.2},
            'robustness': {'metric': robustness_func, 'weight': 0.2}
        }
        """
        self.metrics_config = metrics_config
    
    def compile(self, program, trainset):
        """实现多目标优化"""
        # TODO: 实现考虑多个指标的优化
        pass

# 练习任务：
# 1. 设计多个评估指标
# 2. 实现帕累托最优解选择
# 3. 分析不同权重配置的影响
```

## 最佳实践

### 1. 优化器选择指南

```python
def select_optimizer_guide():
    """优化器选择指南"""
    
    guidelines = {
        'Bootstrap Few-Shot': {
            '适用场景': [
                '数据量中等（100-1000个示例）',
                '需要自动生成高质量示例',
                '任务复杂度中等'
            ],
            '优势': [
                '自动化程度高',
                '通常能获得较好的性能',
                '不需要手工标注示例'
            ],
            '劣势': [
                '计算成本较高',
                '可能过拟合',
                '需要良好的初始程序'
            ]
        },
        
        'Labeled Few-Shot': {
            '适用场景': [
                '有高质量标注数据',
                '数据量较少（<100个示例）',
                '需要快速原型验证'
            ],
            '优势': [
                '简单直接',
                '计算成本低',
                '可控性强'
            ],
            '劣势': [
                '需要人工选择示例',
                '性能上限受限于示例质量',
                '不能自适应优化'
            ]
        },
        
        'COPRO': {
            '适用场景': [
                '提示敏感的任务',
                '需要精细调优',
                '有足够计算资源'
            ],
            '优势': [
                '能优化提示本身',
                '理论上性能上限更高',
                '适合复杂推理任务'
            ],
            '劣势': [
                '计算开销最大',
                '调优复杂',
                '可能不稳定'
            ]
        }
    }
    
    return guidelines

# 决策树
def choose_optimizer(data_size, quality, compute_budget, task_complexity):
    """优化器选择决策树"""
    
    if compute_budget == 'low':
        return 'LabeledFewShot'
    elif data_size < 50:
        return 'LabeledFewShot'
    elif data_size > 500 and compute_budget == 'high':
        if task_complexity == 'high':
            return 'COPRO'
        else:
            return 'Bootstrap'
    else:
        return 'Bootstrap'
```

### 2. 性能监控和调试

```python
class OptimizationMonitor:
    """优化过程监控器"""
    
    def __init__(self):
        self.metrics_history = []
        self.timing_info = {}
    
    def monitor_compilation(self, optimizer, program, trainset):
        """监控编译过程"""
        import time
        import memory_profiler
        
        start_time = time.time()
        start_memory = memory_profiler.memory_usage()[0]
        
        # 执行编译
        compiled_program = optimizer.compile(program, trainset)
        
        end_time = time.time()
        end_memory = memory_profiler.memory_usage()[0]
        
        # 记录性能指标
        self.timing_info = {
            'compilation_time': end_time - start_time,
            'memory_usage': end_memory - start_memory,
            'trainset_size': len(trainset)
        }
        
        print(f"📊 编译性能:")
        print(f"   时间: {self.timing_info['compilation_time']:.2f}s")
        print(f"   内存: {self.timing_info['memory_usage']:.2f}MB")
        
        return compiled_program
    
    def track_convergence(self, scores_by_iteration):
        """跟踪收敛情况"""
        import matplotlib.pyplot as plt
        
        plt.figure(figsize=(10, 6))
        plt.plot(scores_by_iteration)
        plt.title('优化器收敛曲线')
        plt.xlabel('迭代次数')
        plt.ylabel('性能得分')
        plt.grid(True)
        plt.show()
        
        # 检测收敛
        if len(scores_by_iteration) > 5:
            recent_improvement = scores_by_iteration[-1] - scores_by_iteration[-5]
            if recent_improvement < 0.01:
                print("⚠️  优化器可能已收敛，建议停止迭代")

# 使用监控器
monitor = OptimizationMonitor()
# compiled_program = monitor.monitor_compilation(optimizer, program, trainset)
```

通过本章的学习，你应该掌握了DSPy中各种优化器的原理和使用方法。优化器是DSPy框架的核心特色，能够自动提升程序性能。在实际应用中，要根据具体的任务特点、数据规模和计算资源来选择合适的优化策略。