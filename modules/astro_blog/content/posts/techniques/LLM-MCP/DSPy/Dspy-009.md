---
title: "第09章：DSPy 高级模式和技巧"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第09章：DSPy 高级模式和技巧

::: tip 学习目标
- 实现程序合成和自动编程
- 学习元学习和few-shot学习技巧
- 掌握提示优化的高级策略
- 探索self-consistency和投票机制
- 实现动态提示生成
:::

## 知识点

### 1. 程序合成和自动编程

DSPy能够实现程序的自动生成和合成，这是AI编程的前沿技术。

#### 程序合成基础框架

```python
import dspy
from typing import List, Dict, Any, Optional, Union, Callable
import ast
import inspect
import json
import re
from dataclasses import dataclass
from abc import ABC, abstractmethod

class ProgramComponent(ABC):
    """程序组件基类"""
    
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.inputs = []
        self.outputs = []
        self.dependencies = []
    
    @abstractmethod
    def generate_code(self, context: Dict[str, Any]) -> str:
        """生成代码"""
        pass
    
    @abstractmethod
    def get_signature(self) -> str:
        """获取函数签名"""
        pass

class DSPyComponent(ProgramComponent):
    """DSPy组件"""
    
    def __init__(self, name: str, signature: str, instructions: str = ""):
        super().__init__(name, f"DSPy module: {signature}")
        self.signature = signature
        self.instructions = instructions
        self.module_type = "ChainOfThought"  # 默认类型
    
    def generate_code(self, context: Dict[str, Any]) -> str:
        """生成DSPy模块代码"""
        
        code_template = f"""
# {self.description}
self.{self.name} = dspy.{self.module_type}(
    "{self.signature}",
    instructions=\"\"\"{self.instructions}\"\"\"
)
"""
        
        return code_template.strip()
    
    def get_signature(self) -> str:
        return self.signature

class ProgramSynthesizer(dspy.Module):
    """程序合成器"""
    
    def __init__(self):
        super().__init__()
        
        # 需求分析模块
        self.requirement_analyzer = dspy.ChainOfThought(
            "task_description -> reasoning, requirements",
            instructions="分析任务描述，识别具体的功能需求和约束条件。"
        )
        
        # 架构设计模块
        self.architecture_designer = dspy.ChainOfThought(
            "requirements -> reasoning, architecture",
            instructions="基于需求设计程序架构，确定需要的组件和它们的关系。"
        )
        
        # 代码生成模块
        self.code_generator = dspy.ChainOfThought(
            "architecture, component_spec -> reasoning, code",
            instructions="根据架构和组件规格生成Python代码。"
        )
        
        # 代码优化模块
        self.code_optimizer = dspy.ChainOfThought(
            "raw_code, optimization_goals -> reasoning, optimized_code",
            instructions="优化生成的代码，提高效率和可读性。"
        )
        
        # 组件库
        self.component_library = {
            'text_processor': DSPyComponent(
                "text_processor",
                "text -> processed_text",
                "处理和清理输入文本"
            ),
            'question_answerer': DSPyComponent(
                "question_answerer",
                "question, context -> answer",
                "基于上下文回答问题"
            ),
            'summarizer': DSPyComponent(
                "summarizer",
                "long_text -> summary",
                "生成文本摘要"
            ),
            'classifier': DSPyComponent(
                "classifier",
                "text -> category",
                "对文本进行分类"
            )
        }
    
    def forward(self, task_description: str):
        """自动合成程序"""
        
        print(f"🎯 开始程序合成: {task_description}")
        
        # 1. 需求分析
        requirements_result = self.requirement_analyzer(
            task_description=task_description
        )
        
        print(f"📋 需求分析: {requirements_result.requirements}")
        
        # 2. 架构设计
        architecture_result = self.architecture_designer(
            requirements=requirements_result.requirements
        )
        
        print(f"🏗️ 架构设计: {architecture_result.architecture}")
        
        # 3. 选择和组合组件
        selected_components = self.select_components(
            requirements_result.requirements,
            architecture_result.architecture
        )
        
        print(f"🧩 选择组件: {[comp.name for comp in selected_components]}")
        
        # 4. 生成代码
        synthesized_program = self.synthesize_program(
            task_description,
            selected_components,
            architecture_result.architecture
        )
        
        # 5. 优化代码
        optimized_program = self.optimize_program(synthesized_program)
        
        return dspy.Prediction(
            task_description=task_description,
            requirements=requirements_result.requirements,
            architecture=architecture_result.architecture,
            selected_components=[comp.name for comp in selected_components],
            synthesized_program=synthesized_program,
            optimized_program=optimized_program
        )
    
    def select_components(self, 
                         requirements: str, 
                         architecture: str) -> List[ProgramComponent]:
        """选择合适的组件"""
        
        # 基于关键词匹配选择组件
        requirement_text = (requirements + " " + architecture).lower()
        
        selected_components = []
        
        # 检查是否需要各种组件
        if any(keyword in requirement_text for keyword in ['问答', 'question', 'answer', 'qa']):
            selected_components.append(self.component_library['question_answerer'])
        
        if any(keyword in requirement_text for keyword in ['摘要', 'summary', 'summarize']):
            selected_components.append(self.component_library['summarizer'])
        
        if any(keyword in requirement_text for keyword in ['分类', 'classify', 'category']):
            selected_components.append(self.component_library['classifier'])
        
        if any(keyword in requirement_text for keyword in ['处理', 'process', 'clean']):
            selected_components.append(self.component_library['text_processor'])
        
        # 如果没有选择任何组件，默认添加文本处理器
        if not selected_components:
            selected_components.append(self.component_library['text_processor'])
        
        return selected_components
    
    def synthesize_program(self, 
                          task_description: str,
                          components: List[ProgramComponent],
                          architecture: str) -> str:
        """合成程序"""
        
        # 生成类定义
        class_name = "SynthesizedProgram"
        
        program_parts = [
            f"import dspy\n",
            f"class {class_name}(dspy.Module):",
            f'    """自动合成的程序: {task_description}"""',
            f"    ",
            f"    def __init__(self):",
            f"        super().__init__()",
            f"        "
        ]
        
        # 生成组件初始化代码
        for component in components:
            component_code = component.generate_code({})
            program_parts.extend([
                f"        {component_code}",
                f"        "
            ])
        
        # 生成forward方法
        program_parts.extend([
            f"    def forward(self, **kwargs):",
            f"        # 自动生成的执行逻辑",
            f"        "
        ])
        
        # 生成执行逻辑
        forward_logic = self.generate_forward_logic(components, architecture)
        program_parts.extend([
            f"        {forward_logic}",
            f"        ",
            f"        return dspy.Prediction(**results)"
        ])
        
        return "\n".join(program_parts)
    
    def generate_forward_logic(self, 
                              components: List[ProgramComponent],
                              architecture: str) -> str:
        """生成forward方法逻辑"""
        
        if len(components) == 1:
            comp = components[0]
            return f"""
result = self.{comp.name}(**kwargs)
results = {{'output': result}}
""".strip()
        
        # 多组件的顺序执行逻辑
        logic_parts = [
            "results = {}",
            "intermediate_results = {}"
        ]
        
        for i, comp in enumerate(components):
            if i == 0:
                logic_parts.append(f"result_{i} = self.{comp.name}(**kwargs)")
            else:
                logic_parts.append(f"result_{i} = self.{comp.name}(**intermediate_results)")
            
            logic_parts.append(f"intermediate_results.update(result_{i}.__dict__)")
        
        logic_parts.append(f"results['final_output'] = result_{len(components)-1}")
        
        return "\n        ".join(logic_parts)
    
    def optimize_program(self, raw_program: str) -> str:
        """优化生成的程序"""
        
        optimization_goals = "提高代码可读性，优化性能，添加错误处理"
        
        optimization_result = self.code_optimizer(
            raw_code=raw_program,
            optimization_goals=optimization_goals
        )
        
        return optimization_result.optimized_code

class MetaProgramming:
    """元编程工具"""
    
    def __init__(self):
        self.program_templates = {}
        self.generated_programs = {}
    
    def register_template(self, 
                         template_name: str, 
                         template_code: str,
                         parameters: List[str]):
        """注册程序模板"""
        
        self.program_templates[template_name] = {
            'code': template_code,
            'parameters': parameters,
            'usage_count': 0
        }
        
        print(f"📝 注册程序模板: {template_name}")
    
    def instantiate_template(self, 
                            template_name: str, 
                            parameter_values: Dict[str, Any]) -> str:
        """实例化模板"""
        
        if template_name not in self.program_templates:
            raise ValueError(f"模板 {template_name} 不存在")
        
        template = self.program_templates[template_name]
        template_code = template['code']
        
        # 参数替换
        for param, value in parameter_values.items():
            placeholder = f"{{{{{param}}}}}"
            template_code = template_code.replace(placeholder, str(value))
        
        # 更新使用计数
        template['usage_count'] += 1
        
        # 生成唯一的程序ID
        program_id = f"{template_name}_{template['usage_count']}"
        self.generated_programs[program_id] = template_code
        
        print(f"🔧 实例化模板: {template_name} -> {program_id}")
        
        return template_code
    
    def create_program_from_examples(self, 
                                   examples: List[dspy.Example],
                                   program_type: str = "classifier") -> str:
        """从示例创建程序"""
        
        example_analyzer = dspy.ChainOfThought(
            "examples -> reasoning, program_structure",
            instructions="分析给定的示例，推断出程序应该具有的结构和逻辑。"
        )
        
        examples_text = self.format_examples_for_analysis(examples)
        
        analysis_result = example_analyzer(examples=examples_text)
        
        # 基于分析结果生成程序
        if program_type == "classifier":
            return self.generate_classifier_program(analysis_result.program_structure)
        elif program_type == "qa":
            return self.generate_qa_program(analysis_result.program_structure)
        else:
            return self.generate_generic_program(analysis_result.program_structure)
    
    def format_examples_for_analysis(self, examples: List[dspy.Example]) -> str:
        """格式化示例用于分析"""
        
        formatted_examples = []
        
        for i, example in enumerate(examples, 1):
            inputs = example.inputs()
            outputs = {k: v for k, v in example.__dict__.items() if k not in inputs}
            
            formatted_examples.append(f"示例 {i}:")
            formatted_examples.append(f"  输入: {inputs}")
            formatted_examples.append(f"  输出: {outputs}")
        
        return "\n".join(formatted_examples)
    
    def generate_classifier_program(self, structure_description: str) -> str:
        """生成分类器程序"""
        
        template = """
import dspy

class AutoGeneratedClassifier(dspy.Module):
    def __init__(self):
        super().__init__()
        self.classifier = dspy.ChainOfThought(
            "{{input_fields}} -> reasoning, category",
            instructions="{{classification_instructions}}"
        )
    
    def forward(self, **kwargs):
        result = self.classifier(**kwargs)
        return dspy.Prediction(category=result.category, reasoning=result.reasoning)
"""
        
        # 这里可以基于structure_description进一步定制模板
        return template
    
    def generate_qa_program(self, structure_description: str) -> str:
        """生成问答程序"""
        
        template = """
import dspy

class AutoGeneratedQA(dspy.Module):
    def __init__(self):
        super().__init__()
        self.qa = dspy.ChainOfThought(
            "question, context -> reasoning, answer",
            instructions="根据给定的上下文回答问题。"
        )
    
    def forward(self, question, context=None, **kwargs):
        result = self.qa(question=question, context=context or "")
        return dspy.Prediction(answer=result.answer, reasoning=result.reasoning)
"""
        
        return template
    
    def generate_generic_program(self, structure_description: str) -> str:
        """生成通用程序"""
        
        template = """
import dspy

class AutoGeneratedProgram(dspy.Module):
    def __init__(self):
        super().__init__()
        self.processor = dspy.ChainOfThought(
            "input -> reasoning, output",
            instructions="处理输入并生成相应的输出。"
        )
    
    def forward(self, **kwargs):
        result = self.processor(**kwargs)
        return result
"""
        
        return template

# 使用示例
def demonstrate_program_synthesis():
    """演示程序合成"""
    
    synthesizer = ProgramSynthesizer()
    
    # 测试任务描述
    task_descriptions = [
        "创建一个文本分类系统，能够将新闻文章分为体育、科技、政治等类别",
        "构建一个问答系统，可以根据给定的文档回答用户问题",
        "开发一个文本摘要工具，能够将长文本压缩为简短摘要"
    ]
    
    for task_desc in task_descriptions:
        print(f"\n{'='*60}")
        result = synthesizer(task_desc)
        
        print(f"📊 合成结果:")
        print(f"需求: {result.requirements}")
        print(f"架构: {result.architecture}")
        print(f"组件: {result.selected_components}")
        
        print(f"\n🔍 生成的程序:")
        print(result.optimized_program[:500] + "..." if len(result.optimized_program) > 500 else result.optimized_program)
    
    return synthesizer

# demo_synthesis = demonstrate_program_synthesis()
```

### 2. 元学习和Few-Shot学习

元学习让模型能够快速适应新任务，few-shot学习在少量示例下取得好效果。

```python
class MetaLearner(dspy.Module):
    """元学习器"""
    
    def __init__(self):
        super().__init__()
        
        # 任务理解模块
        self.task_analyzer = dspy.ChainOfThought(
            "task_examples -> reasoning, task_pattern",
            instructions="分析任务示例，识别任务的模式和规律。"
        )
        
        # 策略生成模块
        self.strategy_generator = dspy.ChainOfThought(
            "task_pattern, available_examples -> reasoning, learning_strategy",
            instructions="基于任务模式和可用示例，制定最佳的学习策略。"
        )
        
        # 快速适应模块
        self.fast_adaptor = dspy.ChainOfThought(
            "new_example, learned_pattern, strategy -> reasoning, adapted_response",
            instructions="基于学习到的模式和策略，快速适应处理新示例。"
        )
        
        # 元知识库
        self.meta_knowledge = {
            'task_patterns': {},
            'successful_strategies': {},
            'adaptation_history': []
        }
    
    def learn_from_tasks(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """从多个任务中学习"""
        
        print(f"🎓 开始元学习，任务数量: {len(tasks)}")
        
        learned_patterns = {}
        successful_strategies = {}
        
        for i, task in enumerate(tasks):
            print(f"\n📚 学习任务 {i+1}: {task.get('name', f'Task_{i+1}')}")
            
            # 分析任务模式
            examples_text = self.format_task_examples(task['examples'])
            
            pattern_result = self.task_analyzer(task_examples=examples_text)
            
            # 生成学习策略
            strategy_result = self.strategy_generator(
                task_pattern=pattern_result.task_pattern,
                available_examples=examples_text
            )
            
            # 存储学习结果
            task_type = task.get('type', f'task_{i}')
            learned_patterns[task_type] = pattern_result.task_pattern
            successful_strategies[task_type] = strategy_result.learning_strategy
            
            print(f"🔍 任务模式: {pattern_result.task_pattern[:100]}...")
            print(f"📋 学习策略: {strategy_result.learning_strategy[:100]}...")
        
        # 更新元知识库
        self.meta_knowledge['task_patterns'].update(learned_patterns)
        self.meta_knowledge['successful_strategies'].update(successful_strategies)
        
        # 提取共同模式
        common_patterns = self.extract_common_patterns(learned_patterns)
        
        return {
            'learned_patterns': learned_patterns,
            'successful_strategies': successful_strategies,
            'common_patterns': common_patterns,
            'meta_insights': self.generate_meta_insights(learned_patterns, successful_strategies)
        }
    
    def format_task_examples(self, examples: List[dspy.Example]) -> str:
        """格式化任务示例"""
        
        formatted_examples = []
        
        for i, example in enumerate(examples[:5]):  # 限制示例数量
            inputs = example.inputs()
            outputs = {k: v for k, v in example.__dict__.items() if k not in inputs}
            
            formatted_examples.append(f"示例 {i+1}:")
            formatted_examples.append(f"  输入: {inputs}")
            formatted_examples.append(f"  输出: {outputs}")
        
        return "\n".join(formatted_examples)
    
    def extract_common_patterns(self, patterns: Dict[str, str]) -> List[str]:
        """提取共同模式"""
        
        # 简化的模式提取（实际应用中可能需要更复杂的NLP分析）
        all_patterns_text = " ".join(patterns.values()).lower()
        
        # 寻找频繁出现的关键词和短语
        words = all_patterns_text.split()
        word_freq = {}
        
        for word in words:
            if len(word) > 3:  # 忽略短词
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # 提取高频词汇作为共同模式
        common_patterns = [
            word for word, freq in word_freq.items() 
            if freq >= len(patterns) * 0.5  # 出现在至少一半的模式中
        ]
        
        return common_patterns[:10]  # 返回前10个共同模式
    
    def generate_meta_insights(self, 
                              patterns: Dict[str, str], 
                              strategies: Dict[str, str]) -> str:
        """生成元洞察"""
        
        meta_insight_generator = dspy.ChainOfThought(
            "patterns, strategies -> reasoning, meta_insights",
            instructions="基于学习到的模式和策略，生成关于任务类型和学习方法的元洞察。"
        )
        
        result = meta_insight_generator(
            patterns=json.dumps(patterns, ensure_ascii=False),
            strategies=json.dumps(strategies, ensure_ascii=False)
        )
        
        return result.meta_insights
    
    def adapt_to_new_task(self, 
                         new_examples: List[dspy.Example],
                         task_type_hint: str = None) -> Dict[str, Any]:
        """适应新任务"""
        
        print(f"🎯 快速适应新任务")
        
        # 分析新任务
        new_examples_text = self.format_task_examples(new_examples)
        new_pattern_result = self.task_analyzer(task_examples=new_examples_text)
        
        # 查找相似的已知模式
        similar_pattern = self.find_similar_pattern(
            new_pattern_result.task_pattern,
            task_type_hint
        )
        
        if similar_pattern:
            print(f"🔍 发现相似模式: {similar_pattern['type']}")
            
            # 使用相似模式的策略
            adaptation_strategy = similar_pattern['strategy']
        else:
            print(f"🆕 这是全新的任务模式")
            
            # 为新模式生成策略
            strategy_result = self.strategy_generator(
                task_pattern=new_pattern_result.task_pattern,
                available_examples=new_examples_text
            )
            adaptation_strategy = strategy_result.learning_strategy
        
        # 创建适应后的处理器
        adapted_processor = self.create_adapted_processor(
            new_pattern_result.task_pattern,
            adaptation_strategy,
            new_examples
        )
        
        return {
            'task_pattern': new_pattern_result.task_pattern,
            'adaptation_strategy': adaptation_strategy,
            'adapted_processor': adapted_processor,
            'confidence': self.calculate_adaptation_confidence(similar_pattern)
        }
    
    def find_similar_pattern(self, 
                            new_pattern: str, 
                            hint: str = None) -> Optional[Dict[str, Any]]:
        """查找相似模式"""
        
        if not self.meta_knowledge['task_patterns']:
            return None
        
        # 如果有提示，优先查找对应的模式
        if hint and hint in self.meta_knowledge['task_patterns']:
            return {
                'type': hint,
                'pattern': self.meta_knowledge['task_patterns'][hint],
                'strategy': self.meta_knowledge['successful_strategies'].get(hint, "")
            }
        
        # 简化的相似度计算（基于关键词重叠）
        best_similarity = 0.0
        most_similar = None
        
        new_words = set(new_pattern.lower().split())
        
        for task_type, pattern in self.meta_knowledge['task_patterns'].items():
            pattern_words = set(pattern.lower().split())
            
            if new_words and pattern_words:
                overlap = len(new_words & pattern_words)
                union = len(new_words | pattern_words)
                similarity = overlap / union if union > 0 else 0.0
                
                if similarity > best_similarity and similarity > 0.3:  # 阈值
                    best_similarity = similarity
                    most_similar = {
                        'type': task_type,
                        'pattern': pattern,
                        'strategy': self.meta_knowledge['successful_strategies'].get(task_type, ""),
                        'similarity': similarity
                    }
        
        return most_similar
    
    def create_adapted_processor(self, 
                               pattern: str, 
                               strategy: str,
                               examples: List[dspy.Example]) -> dspy.Module:
        """创建适应后的处理器"""
        
        class AdaptedProcessor(dspy.Module):
            def __init__(self, pattern, strategy, examples):
                super().__init__()
                
                self.pattern = pattern
                self.strategy = strategy
                self.examples = examples
                
                # 根据模式和策略选择合适的DSPy模块
                self.processor = self.select_processor_type(pattern, strategy)
                
                # 如果有示例，设置为demonstrations
                if examples:
                    self.processor.demos = examples[:5]  # 最多使用5个示例
            
            def select_processor_type(self, pattern, strategy):
                """根据模式选择处理器类型"""
                
                pattern_lower = pattern.lower()
                
                if any(word in pattern_lower for word in ['分类', 'classify', 'category']):
                    return dspy.ChainOfThought("input -> reasoning, category")
                elif any(word in pattern_lower for word in ['问答', 'question', 'answer']):
                    return dspy.ChainOfThought("question, context -> reasoning, answer")
                elif any(word in pattern_lower for word in ['摘要', 'summary']):
                    return dspy.ChainOfThought("text -> reasoning, summary")
                else:
                    return dspy.ChainOfThought("input -> reasoning, output")
            
            def forward(self, **kwargs):
                return self.processor(**kwargs)
        
        return AdaptedProcessor(pattern, strategy, examples)
    
    def calculate_adaptation_confidence(self, similar_pattern: Optional[Dict]) -> float:
        """计算适应置信度"""
        
        if similar_pattern is None:
            return 0.3  # 新任务的基础置信度
        
        similarity = similar_pattern.get('similarity', 0.0)
        
        # 基于相似度计算置信度
        confidence = min(0.3 + similarity * 0.7, 0.9)
        
        return confidence

class FewShotLearningOptimizer:
    """Few-Shot学习优化器"""
    
    def __init__(self):
        self.example_selectors = {
            'diversity': self.select_diverse_examples,
            'similarity': self.select_similar_examples,
            'difficulty': self.select_progressive_examples,
            'uncertainty': self.select_uncertain_examples
        }
    
    def optimize_few_shot_examples(self, 
                                  candidate_examples: List[dspy.Example],
                                  target_task: dspy.Example,
                                  k: int = 5,
                                  selection_strategy: str = 'diversity') -> List[dspy.Example]:
        """优化Few-Shot示例选择"""
        
        print(f"🎯 优化Few-Shot示例选择，策略: {selection_strategy}")
        
        if selection_strategy not in self.example_selectors:
            raise ValueError(f"不支持的选择策略: {selection_strategy}")
        
        selected_examples = self.example_selectors[selection_strategy](
            candidate_examples, target_task, k
        )
        
        print(f"📋 选择了 {len(selected_examples)} 个示例")
        
        return selected_examples
    
    def select_diverse_examples(self, 
                               candidates: List[dspy.Example],
                               target: dspy.Example,
                               k: int) -> List[dspy.Example]:
        """选择多样化的示例"""
        
        if len(candidates) <= k:
            return candidates
        
        selected = []
        remaining = candidates.copy()
        
        # 随机选择第一个示例
        import random
        first_example = random.choice(remaining)
        selected.append(first_example)
        remaining.remove(first_example)
        
        # 迭代选择最多样化的示例
        while len(selected) < k and remaining:
            best_candidate = None
            best_diversity_score = -1
            
            for candidate in remaining:
                diversity_score = self.calculate_diversity_score(candidate, selected)
                
                if diversity_score > best_diversity_score:
                    best_diversity_score = diversity_score
                    best_candidate = candidate
            
            if best_candidate:
                selected.append(best_candidate)
                remaining.remove(best_candidate)
        
        return selected
    
    def calculate_diversity_score(self, 
                                 candidate: dspy.Example,
                                 selected: List[dspy.Example]) -> float:
        """计算多样性得分"""
        
        if not selected:
            return 1.0
        
        # 简化的多样性计算（基于文本内容）
        candidate_text = " ".join(str(v) for v in candidate.__dict__.values())
        candidate_words = set(candidate_text.lower().split())
        
        diversity_scores = []
        
        for selected_example in selected:
            selected_text = " ".join(str(v) for v in selected_example.__dict__.values())
            selected_words = set(selected_text.lower().split())
            
            # 计算Jaccard距离
            if candidate_words and selected_words:
                intersection = len(candidate_words & selected_words)
                union = len(candidate_words | selected_words)
                similarity = intersection / union if union > 0 else 0.0
                diversity = 1.0 - similarity
            else:
                diversity = 1.0
            
            diversity_scores.append(diversity)
        
        # 返回平均多样性
        return sum(diversity_scores) / len(diversity_scores)
    
    def select_similar_examples(self,
                               candidates: List[dspy.Example],
                               target: dspy.Example,
                               k: int) -> List[dspy.Example]:
        """选择与目标相似的示例"""
        
        # 计算每个候选示例与目标的相似度
        similarity_scores = []
        
        target_text = " ".join(str(v) for v in target.inputs().values())
        target_words = set(target_text.lower().split())
        
        for candidate in candidates:
            candidate_text = " ".join(str(v) for v in candidate.inputs().values())
            candidate_words = set(candidate_text.lower().split())
            
            if target_words and candidate_words:
                intersection = len(target_words & candidate_words)
                union = len(target_words | candidate_words)
                similarity = intersection / union if union > 0 else 0.0
            else:
                similarity = 0.0
            
            similarity_scores.append((candidate, similarity))
        
        # 按相似度排序并选择top-k
        similarity_scores.sort(key=lambda x: x[1], reverse=True)
        
        return [candidate for candidate, _ in similarity_scores[:k]]
    
    def select_progressive_examples(self,
                                   candidates: List[dspy.Example],
                                   target: dspy.Example,
                                   k: int) -> List[dspy.Example]:
        """选择渐进难度的示例"""
        
        # 估算示例难度
        difficulty_scores = []
        
        for candidate in candidates:
            difficulty = self.estimate_example_difficulty(candidate)
            difficulty_scores.append((candidate, difficulty))
        
        # 按难度排序
        difficulty_scores.sort(key=lambda x: x[1])
        
        # 选择难度渐进的示例
        if len(difficulty_scores) <= k:
            return [candidate for candidate, _ in difficulty_scores]
        
        # 均匀分布选择
        step = len(difficulty_scores) // k
        selected_indices = [i * step for i in range(k)]
        
        return [difficulty_scores[i][0] for i in selected_indices]
    
    def estimate_example_difficulty(self, example: dspy.Example) -> float:
        """估算示例难度"""
        
        # 基于文本长度和复杂性的简化难度估算
        text_content = " ".join(str(v) for v in example.__dict__.values())
        
        # 长度因素
        length_factor = len(text_content) / 1000.0  # 标准化
        
        # 词汇复杂度因素
        words = text_content.split()
        unique_words = len(set(words))
        vocabulary_complexity = unique_words / len(words) if words else 0.0
        
        # 句法复杂度因素（简化）
        sentence_complexity = text_content.count('.') + text_content.count('?') + text_content.count('!')
        sentence_complexity = sentence_complexity / 10.0  # 标准化
        
        # 综合难度得分
        difficulty = (length_factor * 0.3 + 
                     vocabulary_complexity * 0.4 + 
                     sentence_complexity * 0.3)
        
        return min(difficulty, 1.0)
    
    def select_uncertain_examples(self,
                                 candidates: List[dspy.Example],
                                 target: dspy.Example,
                                 k: int) -> List[dspy.Example]:
        """选择不确定性高的示例"""
        
        # 这里需要一个预训练的模型来估算不确定性
        # 简化实现：基于示例的"特殊性"
        
        uncertainty_scores = []
        
        for candidate in candidates:
            uncertainty = self.estimate_example_uncertainty(candidate, candidates)
            uncertainty_scores.append((candidate, uncertainty))
        
        # 选择不确定性最高的示例
        uncertainty_scores.sort(key=lambda x: x[1], reverse=True)
        
        return [candidate for candidate, _ in uncertainty_scores[:k]]
    
    def estimate_example_uncertainty(self, 
                                    example: dspy.Example,
                                    all_examples: List[dspy.Example]) -> float:
        """估算示例不确定性"""
        
        # 基于示例在整个集合中的"独特性"
        example_text = " ".join(str(v) for v in example.__dict__.values())
        example_words = set(example_text.lower().split())
        
        similarities = []
        
        for other_example in all_examples:
            if other_example == example:
                continue
            
            other_text = " ".join(str(v) for v in other_example.__dict__.values())
            other_words = set(other_text.lower().split())
            
            if example_words and other_words:
                intersection = len(example_words & other_words)
                union = len(example_words | other_words)
                similarity = intersection / union if union > 0 else 0.0
                similarities.append(similarity)
        
        # 不确定性与相似度成反比
        avg_similarity = sum(similarities) / len(similarities) if similarities else 0.0
        uncertainty = 1.0 - avg_similarity
        
        return uncertainty

# 使用示例
def demonstrate_meta_learning():
    """演示元学习"""
    
    meta_learner = MetaLearner()
    
    # 创建多个学习任务
    tasks = [
        {
            'name': '情感分析',
            'type': 'classification',
            'examples': [
                dspy.Example(text="这部电影太棒了", label="positive").with_inputs('text'),
                dspy.Example(text="这部电影很糟糕", label="negative").with_inputs('text'),
            ]
        },
        {
            'name': '主题分类',
            'type': 'classification',
            'examples': [
                dspy.Example(text="股市今日上涨", label="finance").with_inputs('text'),
                dspy.Example(text="新款手机发布", label="technology").with_inputs('text'),
            ]
        }
    ]
    
    # 元学习过程
    meta_learning_result = meta_learner.learn_from_tasks(tasks)
    
    print(f"\n📊 元学习结果:")
    print(f"共同模式: {meta_learning_result['common_patterns']}")
    print(f"元洞察: {meta_learning_result['meta_insights']}")
    
    # 适应新任务
    new_task_examples = [
        dspy.Example(text="这家餐厅的服务很好", rating="4").with_inputs('text'),
        dspy.Example(text="这家餐厅环境不错", rating="5").with_inputs('text'),
    ]
    
    adaptation_result = meta_learner.adapt_to_new_task(
        new_task_examples, 
        task_type_hint='classification'
    )
    
    print(f"\n🎯 新任务适应:")
    print(f"置信度: {adaptation_result['confidence']:.2f}")
    print(f"任务模式: {adaptation_result['task_pattern'][:100]}...")
    
    return meta_learner, adaptation_result

# demo_meta_learning = demonstrate_meta_learning()
```

### 3. 提示优化高级策略

提示优化是提升DSPy程序性能的关键技术。

```python
class AdvancedPromptOptimizer:
    """高级提示优化器"""
    
    def __init__(self):
        self.optimization_strategies = {
            'evolutionary': self.evolutionary_optimization,
            'gradient_based': self.gradient_based_optimization,
            'bayesian': self.bayesian_optimization,
            'reinforcement': self.reinforcement_optimization
        }
        
        self.prompt_mutations = [
            self.add_examples,
            self.modify_instructions,
            self.adjust_structure,
            self.add_constraints,
            self.modify_tone
        ]
    
    def optimize_prompt(self,
                       base_prompt: str,
                       evaluation_data: List[dspy.Example],
                       evaluation_metric: Callable,
                       strategy: str = 'evolutionary',
                       max_iterations: int = 20) -> Dict[str, Any]:
        """高级提示优化"""
        
        print(f"🧬 开始提示优化，策略: {strategy}")
        
        if strategy not in self.optimization_strategies:
            raise ValueError(f"不支持的优化策略: {strategy}")
        
        optimization_result = self.optimization_strategies[strategy](
            base_prompt, evaluation_data, evaluation_metric, max_iterations
        )
        
        return optimization_result
    
    def evolutionary_optimization(self,
                                 base_prompt: str,
                                 eval_data: List[dspy.Example],
                                 metric: Callable,
                                 max_iter: int) -> Dict[str, Any]:
        """进化式提示优化"""
        
        print(f"🧬 执行进化式优化")
        
        # 初始化种群
        population_size = 10
        population = [base_prompt]
        
        # 生成初始种群
        for _ in range(population_size - 1):
            mutated_prompt = self.mutate_prompt(base_prompt)
            population.append(mutated_prompt)
        
        best_prompt = base_prompt
        best_score = self.evaluate_prompt(base_prompt, eval_data, metric)
        optimization_history = []
        
        for generation in range(max_iter):
            print(f"🔄 第 {generation + 1} 代")
            
            # 评估种群
            population_scores = []
            for prompt in population:
                score = self.evaluate_prompt(prompt, eval_data, metric)
                population_scores.append((prompt, score))
            
            # 排序
            population_scores.sort(key=lambda x: x[1], reverse=True)
            
            # 更新最佳结果
            current_best_prompt, current_best_score = population_scores[0]
            if current_best_score > best_score:
                best_score = current_best_score
                best_prompt = current_best_prompt
                print(f"🏆 发现更好的提示! 得分: {best_score:.3f}")
            
            # 记录历史
            optimization_history.append({
                'generation': generation + 1,
                'best_score': current_best_score,
                'population_diversity': self.calculate_population_diversity(population)
            })
            
            # 选择和繁殖
            if generation < max_iter - 1:
                population = self.evolve_population(population_scores)
        
        return {
            'best_prompt': best_prompt,
            'best_score': best_score,
            'optimization_history': optimization_history,
            'strategy': 'evolutionary'
        }
    
    def mutate_prompt(self, prompt: str) -> str:
        """突变提示"""
        
        import random
        
        # 随机选择突变方式
        mutation_func = random.choice(self.prompt_mutations)
        
        try:
            mutated_prompt = mutation_func(prompt)
            return mutated_prompt
        except Exception as e:
            print(f"⚠️ 突变失败: {e}")
            return prompt
    
    def add_examples(self, prompt: str) -> str:
        """添加示例"""
        
        example_prompts = [
            "\n\n例如：\n输入：这是一个示例输入\n输出：这是对应的输出",
            "\n\n参考示例：\n- 案例1：简单情况的处理\n- 案例2：复杂情况的处理",
            "\n\n具体示例：\n问：示例问题？\n答：详细的示例答案。"
        ]
        
        import random
        return prompt + random.choice(example_prompts)
    
    def modify_instructions(self, prompt: str) -> str:
        """修改指令"""
        
        instruction_modifiers = [
            "请仔细分析并",
            "逐步思考并",
            "详细考虑后",
            "基于上下文信息",
            "准确地"
        ]
        
        import random
        modifier = random.choice(instruction_modifiers)
        
        # 在提示开头添加修饰符
        return f"{modifier}{prompt.lower()}"
    
    def adjust_structure(self, prompt: str) -> str:
        """调整结构"""
        
        structure_templates = [
            f"任务：{prompt}\n\n步骤：\n1. 分析输入\n2. 处理信息\n3. 生成输出",
            f"目标：{prompt}\n\n要求：\n- 准确性\n- 完整性\n- 清晰性",
            f"问题：{prompt}\n\n解决方案：\n首先...\n然后...\n最后..."
        ]
        
        import random
        return random.choice(structure_templates)
    
    def add_constraints(self, prompt: str) -> str:
        """添加约束"""
        
        constraints = [
            "\n\n约束：回答应简洁明了。",
            "\n\n要求：必须提供理由和依据。",
            "\n\n限制：答案长度不超过100字。",
            "\n\n注意：考虑多个角度和可能性。"
        ]
        
        import random
        return prompt + random.choice(constraints)
    
    def modify_tone(self, prompt: str) -> str:
        """修改语调"""
        
        tone_modifiers = [
            ("请", "kindly "),
            ("必须", "should "),
            ("需要", "need to "),
            ("确保", "make sure to "),
            ("仔细", "carefully ")
        ]
        
        import random
        original, modified = random.choice(tone_modifiers)
        
        return prompt.replace(original, modified) if original in prompt else f"{modified}{prompt}"
    
    def evaluate_prompt(self,
                       prompt: str,
                       eval_data: List[dspy.Example],
                       metric: Callable) -> float:
        """评估提示性能"""
        
        # 创建临时模块进行测试
        class TempModule(dspy.Module):
            def __init__(self, test_prompt):
                super().__init__()
                self.predictor = dspy.ChainOfThought("input -> output", instructions=test_prompt)
            
            def forward(self, **kwargs):
                return self.predictor(**kwargs)
        
        temp_module = TempModule(prompt)
        
        # 在评估数据上测试
        scores = []
        test_data = eval_data[:10]  # 限制测试数据量以提高速度
        
        for example in test_data:
            try:
                prediction = temp_module(**example.inputs())
                score = metric(example, prediction)
                scores.append(float(score))
            except Exception as e:
                scores.append(0.0)
        
        return sum(scores) / len(scores) if scores else 0.0
    
    def calculate_population_diversity(self, population: List[str]) -> float:
        """计算种群多样性"""
        
        if len(population) <= 1:
            return 0.0
        
        similarities = []
        
        for i in range(len(population)):
            for j in range(i + 1, len(population)):
                similarity = self.calculate_prompt_similarity(population[i], population[j])
                similarities.append(similarity)
        
        avg_similarity = sum(similarities) / len(similarities)
        diversity = 1.0 - avg_similarity
        
        return diversity
    
    def calculate_prompt_similarity(self, prompt1: str, prompt2: str) -> float:
        """计算提示相似度"""
        
        words1 = set(prompt1.lower().split())
        words2 = set(prompt2.lower().split())
        
        if not words1 and not words2:
            return 1.0
        elif not words1 or not words2:
            return 0.0
        
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        
        return intersection / union if union > 0 else 0.0
    
    def evolve_population(self, population_scores: List[tuple]) -> List[str]:
        """进化种群"""
        
        # 选择前50%作为父代
        num_parents = len(population_scores) // 2
        parents = [prompt for prompt, _ in population_scores[:num_parents]]
        
        # 生成新种群
        new_population = parents.copy()  # 保留父代
        
        # 通过交叉和突变生成子代
        while len(new_population) < len(population_scores):
            import random
            
            # 随机选择两个父代
            parent1, parent2 = random.sample(parents, 2)
            
            # 交叉
            child = self.crossover_prompts(parent1, parent2)
            
            # 突变
            if random.random() < 0.3:  # 30%突变率
                child = self.mutate_prompt(child)
            
            new_population.append(child)
        
        return new_population
    
    def crossover_prompts(self, prompt1: str, prompt2: str) -> str:
        """交叉两个提示"""
        
        # 简单的交叉：随机选择每个提示的部分
        sentences1 = prompt1.split('.')
        sentences2 = prompt2.split('.')
        
        import random
        
        # 随机组合句子
        combined_sentences = []
        min_length = min(len(sentences1), len(sentences2))
        
        for i in range(min_length):
            if random.random() < 0.5:
                combined_sentences.append(sentences1[i])
            else:
                combined_sentences.append(sentences2[i])
        
        return '.'.join(combined_sentences)
    
    def gradient_based_optimization(self, base_prompt, eval_data, metric, max_iter):
        """基于梯度的优化（简化实现）"""
        
        print("📈 执行梯度优化（简化版）")
        
        current_prompt = base_prompt
        current_score = self.evaluate_prompt(current_prompt, eval_data, metric)
        
        optimization_history = []
        learning_rate = 0.1
        
        for iteration in range(max_iter):
            print(f"🔄 迭代 {iteration + 1}")
            
            # 生成梯度近似（通过小的变化）
            gradients = []
            
            for mutation_func in self.prompt_mutations:
                try:
                    modified_prompt = mutation_func(current_prompt)
                    modified_score = self.evaluate_prompt(modified_prompt, eval_data, metric)
                    
                    gradient = modified_score - current_score
                    gradients.append((mutation_func, modified_prompt, gradient))
                    
                except Exception:
                    continue
            
            # 选择最佳梯度
            if gradients:
                best_mutation, best_prompt, best_gradient = max(gradients, key=lambda x: x[2])
                
                if best_gradient > 0:
                    # 应用改进
                    current_prompt = best_prompt
                    current_score = current_score + best_gradient
                    
                    print(f"🏆 改进! 新得分: {current_score:.3f}")
            
            optimization_history.append({
                'iteration': iteration + 1,
                'score': current_score
            })
        
        return {
            'best_prompt': current_prompt,
            'best_score': current_score,
            'optimization_history': optimization_history,
            'strategy': 'gradient_based'
        }
    
    def bayesian_optimization(self, base_prompt, eval_data, metric, max_iter):
        """贝叶斯优化（简化实现）"""
        
        print("🎲 执行贝叶斯优化（简化版）")
        
        # 简化的贝叶斯优化：基于历史数据选择下一个候选
        evaluated_prompts = {}
        current_best_prompt = base_prompt
        current_best_score = self.evaluate_prompt(base_prompt, eval_data, metric)
        
        evaluated_prompts[base_prompt] = current_best_score
        optimization_history = []
        
        for iteration in range(max_iter):
            print(f"🔄 迭代 {iteration + 1}")
            
            # 生成候选提示（基于不确定性和期望改进）
            candidate_prompts = []
            
            for _ in range(5):  # 生成5个候选
                candidate = self.generate_candidate_prompt(evaluated_prompts)
                if candidate not in evaluated_prompts:
                    candidate_prompts.append(candidate)
            
            # 评估候选提示
            for candidate in candidate_prompts:
                score = self.evaluate_prompt(candidate, eval_data, metric)
                evaluated_prompts[candidate] = score
                
                if score > current_best_score:
                    current_best_score = score
                    current_best_prompt = candidate
                    print(f"🏆 发现更好的提示! 得分: {score:.3f}")
            
            optimization_history.append({
                'iteration': iteration + 1,
                'best_score': current_best_score,
                'evaluated_count': len(evaluated_prompts)
            })
        
        return {
            'best_prompt': current_best_prompt,
            'best_score': current_best_score,
            'optimization_history': optimization_history,
            'strategy': 'bayesian'
        }
    
    def generate_candidate_prompt(self, evaluated_prompts: Dict[str, float]) -> str:
        """生成候选提示"""
        
        # 基于已评估提示的表现，生成新的候选
        if not evaluated_prompts:
            return "Default prompt"
        
        # 选择表现最好的提示进行变异
        best_prompt = max(evaluated_prompts, key=evaluated_prompts.get)
        
        return self.mutate_prompt(best_prompt)
    
    def reinforcement_optimization(self, base_prompt, eval_data, metric, max_iter):
        """强化学习优化（简化实现）"""
        
        print("🎮 执行强化学习优化（简化版）")
        
        # 动作空间：不同的提示修改策略
        actions = list(self.prompt_mutations)
        action_values = {action.__name__: 0.0 for action in actions}
        action_counts = {action.__name__: 0 for action in actions}
        
        current_prompt = base_prompt
        current_score = self.evaluate_prompt(current_prompt, eval_data, metric)
        
        optimization_history = []
        epsilon = 0.3  # 探索率
        
        for iteration in range(max_iter):
            print(f"🔄 迭代 {iteration + 1}")
            
            # 选择动作（ε-贪婪策略）
            import random
            
            if random.random() < epsilon:
                # 探索：随机选择动作
                chosen_action = random.choice(actions)
            else:
                # 利用：选择价值最高的动作
                best_action_name = max(action_values, key=action_values.get)
                chosen_action = next(action for action in actions if action.__name__ == best_action_name)
            
            # 执行动作
            try:
                new_prompt = chosen_action(current_prompt)
                new_score = self.evaluate_prompt(new_prompt, eval_data, metric)
                
                # 计算奖励
                reward = new_score - current_score
                
                # 更新动作价值
                action_name = chosen_action.__name__
                action_counts[action_name] += 1
                
                # 使用增量平均更新价值
                alpha = 1.0 / action_counts[action_name]  # 学习率
                action_values[action_name] += alpha * (reward - action_values[action_name])
                
                # 如果有改进，更新当前状态
                if new_score > current_score:
                    current_prompt = new_prompt
                    current_score = new_score
                    print(f"🏆 改进! 新得分: {new_score:.3f}, 动作: {action_name}")
                
            except Exception as e:
                # 失败的动作给予负奖励
                reward = -0.1
                action_name = chosen_action.__name__
                action_counts[action_name] += 1
                
                alpha = 1.0 / action_counts[action_name]
                action_values[action_name] += alpha * (reward - action_values[action_name])
            
            optimization_history.append({
                'iteration': iteration + 1,
                'score': current_score,
                'action_values': action_values.copy()
            })
            
            # 衰减探索率
            epsilon = max(0.1, epsilon * 0.95)
        
        return {
            'best_prompt': current_prompt,
            'best_score': current_score,
            'optimization_history': optimization_history,
            'action_values': action_values,
            'strategy': 'reinforcement'
        }

# 使用示例
def demonstrate_advanced_prompt_optimization():
    """演示高级提示优化"""
    
    optimizer = AdvancedPromptOptimizer()
    
    # 基础提示
    base_prompt = "请回答以下问题"
    
    # 评估数据
    eval_data = [
        dspy.Example(question="什么是AI？", answer="人工智能").with_inputs('question'),
        dspy.Example(question="什么是ML？", answer="机器学习").with_inputs('question'),
    ]
    
    # 评估指标
    def simple_metric(example, prediction):
        expected = getattr(example, 'answer', '')
        actual = getattr(prediction, 'output', '') or str(prediction)
        return 1.0 if expected.lower() in actual.lower() else 0.0
    
    # 测试不同的优化策略
    strategies = ['evolutionary', 'gradient_based', 'bayesian', 'reinforcement']
    
    results = {}
    
    for strategy in strategies:
        print(f"\n{'='*50}")
        print(f"测试策略: {strategy}")
        
        try:
            result = optimizer.optimize_prompt(
                base_prompt,
                eval_data,
                simple_metric,
                strategy=strategy,
                max_iterations=5  # 减少迭代次数以节省时间
            )
            
            results[strategy] = result
            
            print(f"🎯 最佳得分: {result['best_score']:.3f}")
            print(f"📝 最佳提示: {result['best_prompt'][:100]}...")
            
        except Exception as e:
            print(f"❌ 策略 {strategy} 失败: {e}")
            results[strategy] = {'error': str(e)}
    
    # 比较结果
    print(f"\n📊 优化结果比较:")
    for strategy, result in results.items():
        if 'error' not in result:
            print(f"  {strategy}: {result['best_score']:.3f}")
        else:
            print(f"  {strategy}: 失败")
    
    return optimizer, results

# demo_prompt_optimization = demonstrate_advanced_prompt_optimization()
```

### 4. Self-Consistency和投票机制

Self-consistency通过多次推理并投票来提高答案的可靠性。

```python
class SelfConsistencyFramework:
    """Self-Consistency框架"""
    
    def __init__(self, base_module: dspy.Module, num_samples: int = 5):
        self.base_module = base_module
        self.num_samples = num_samples
        self.voting_strategies = {
            'majority': self.majority_voting,
            'weighted': self.weighted_voting,
            'confidence': self.confidence_voting,
            'ensemble': self.ensemble_voting
        }
    
    def generate_consistent_response(self,
                                   input_data: Dict[str, Any],
                                   voting_strategy: str = 'majority',
                                   temperature_range: tuple = (0.3, 0.9)) -> Dict[str, Any]:
        """生成一致性响应"""
        
        print(f"🎯 生成Self-Consistency响应，采样数: {self.num_samples}")
        
        # 生成多个候选响应
        candidates = self.generate_candidate_responses(
            input_data, temperature_range
        )
        
        print(f"📊 生成了 {len(candidates)} 个候选响应")
        
        # 应用投票策略
        if voting_strategy not in self.voting_strategies:
            raise ValueError(f"不支持的投票策略: {voting_strategy}")
        
        final_response = self.voting_strategies[voting_strategy](candidates)
        
        return {
            'final_response': final_response,
            'candidates': candidates,
            'voting_strategy': voting_strategy,
            'confidence_score': self.calculate_confidence_score(candidates, final_response)
        }
    
    def generate_candidate_responses(self,
                                   input_data: Dict[str, Any],
                                   temperature_range: tuple) -> List[Dict[str, Any]]:
        """生成候选响应"""
        
        candidates = []
        min_temp, max_temp = temperature_range
        
        for i in range(self.num_samples):
            # 为每次采样设置不同的温度
            temperature = min_temp + (max_temp - min_temp) * i / (self.num_samples - 1)
            
            print(f"🔄 采样 {i+1}/{self.num_samples}, 温度: {temperature:.2f}")
            
            try:
                # 这里应该设置模型温度，但为了演示简化处理
                response = self.base_module(**input_data)
                
                candidate = {
                    'response': response,
                    'temperature': temperature,
                    'sample_id': i,
                    'confidence': self.estimate_response_confidence(response)
                }
                
                candidates.append(candidate)
                
            except Exception as e:
                print(f"⚠️ 采样 {i+1} 失败: {e}")
                continue
        
        return candidates
    
    def estimate_response_confidence(self, response) -> float:
        """估计响应置信度"""
        
        # 简化的置信度估计
        response_text = getattr(response, 'answer', '') or str(response)
        
        # 基于响应长度和特定词汇的置信度估计
        confidence_indicators = [
            '确实', '肯定', '明确', '显然', 'clearly', 'definitely', 'certainly'
        ]
        
        uncertainty_indicators = [
            '可能', '也许', '大概', '似乎', 'maybe', 'perhaps', 'probably'
        ]
        
        confidence_score = 0.5  # 基础分数
        
        # 长度因子
        if len(response_text) > 100:
            confidence_score += 0.1
        elif len(response_text) < 20:
            confidence_score -= 0.2
        
        # 词汇指标
        text_lower = response_text.lower()
        for indicator in confidence_indicators:
            if indicator in text_lower:
                confidence_score += 0.1
        
        for indicator in uncertainty_indicators:
            if indicator in text_lower:
                confidence_score -= 0.1
        
        return max(0.0, min(1.0, confidence_score))
    
    def majority_voting(self, candidates: List[Dict[str, Any]]) -> Any:
        """多数投票"""
        
        print("🗳️ 执行多数投票")
        
        # 提取响应文本
        responses = []
        for candidate in candidates:
            response_text = getattr(candidate['response'], 'answer', '') or str(candidate['response'])
            responses.append(response_text)
        
        # 计算每个响应的频率
        response_counts = {}
        for response in responses:
            # 简化的相似性匹配
            matched = False
            for existing_response in response_counts:
                if self.responses_similar(response, existing_response):
                    response_counts[existing_response] += 1
                    matched = True
                    break
            
            if not matched:
                response_counts[response] = 1
        
        # 选择最频繁的响应
        if response_counts:
            most_common_response = max(response_counts, key=response_counts.get)
            
            # 找到对应的完整候选
            for candidate in candidates:
                response_text = getattr(candidate['response'], 'answer', '') or str(candidate['response'])
                if self.responses_similar(response_text, most_common_response):
                    return candidate['response']
        
        # 如果没有找到，返回第一个响应
        return candidates[0]['response'] if candidates else None
    
    def weighted_voting(self, candidates: List[Dict[str, Any]]) -> Any:
        """加权投票"""
        
        print("⚖️ 执行加权投票")
        
        if not candidates:
            return None
        
        # 计算权重（基于置信度）
        total_weight = sum(candidate['confidence'] for candidate in candidates)
        
        if total_weight == 0:
            return self.majority_voting(candidates)
        
        # 加权选择
        response_weights = {}
        
        for candidate in candidates:
            response_text = getattr(candidate['response'], 'answer', '') or str(candidate['response'])
            weight = candidate['confidence'] / total_weight
            
            # 寻找相似响应
            matched = False
            for existing_response in response_weights:
                if self.responses_similar(response_text, existing_response):
                    response_weights[existing_response] += weight
                    matched = True
                    break
            
            if not matched:
                response_weights[response_text] = weight
        
        # 选择权重最高的响应
        best_response_text = max(response_weights, key=response_weights.get)
        
        # 返回对应的完整响应
        for candidate in candidates:
            response_text = getattr(candidate['response'], 'answer', '') or str(candidate['response'])
            if self.responses_similar(response_text, best_response_text):
                return candidate['response']
        
        return candidates[0]['response']
    
    def confidence_voting(self, candidates: List[Dict[str, Any]]) -> Any:
        """基于置信度的投票"""
        
        print("🎯 执行置信度投票")
        
        if not candidates:
            return None
        
        # 选择置信度最高的响应
        best_candidate = max(candidates, key=lambda x: x['confidence'])
        
        return best_candidate['response']
    
    def ensemble_voting(self, candidates: List[Dict[str, Any]]) -> Any:
        """集成投票"""
        
        print("🤝 执行集成投票")
        
        # 结合多种策略
        majority_result = self.majority_voting(candidates)
        confidence_result = self.confidence_voting(candidates)
        weighted_result = self.weighted_voting(candidates)
        
        # 如果多数投票和置信度投票一致，选择该结果
        if self.responses_similar(
            str(majority_result), 
            str(confidence_result)
        ):
            return majority_result
        
        # 否则选择加权投票的结果
        return weighted_result
    
    def responses_similar(self, response1: str, response2: str, threshold: float = 0.7) -> bool:
        """判断两个响应是否相似"""
        
        # 简化的相似度计算
        words1 = set(response1.lower().split())
        words2 = set(response2.lower().split())
        
        if not words1 and not words2:
            return True
        elif not words1 or not words2:
            return False
        
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        
        similarity = intersection / union if union > 0 else 0.0
        
        return similarity >= threshold
    
    def calculate_confidence_score(self, 
                                  candidates: List[Dict[str, Any]], 
                                  final_response: Any) -> float:
        """计算最终响应的置信度"""
        
        if not candidates:
            return 0.0
        
        final_response_text = getattr(final_response, 'answer', '') or str(final_response)
        
        # 计算有多少候选响应与最终响应相似
        similar_count = 0
        total_confidence = 0.0
        
        for candidate in candidates:
            candidate_text = getattr(candidate['response'], 'answer', '') or str(candidate['response'])
            
            if self.responses_similar(candidate_text, final_response_text):
                similar_count += 1
                total_confidence += candidate['confidence']
        
        if similar_count == 0:
            return 0.0
        
        # 综合置信度：相似响应比例 * 平均置信度
        consistency_score = similar_count / len(candidates)
        average_confidence = total_confidence / similar_count
        
        return consistency_score * average_confidence

class VotingEnsemble(dspy.Module):
    """投票集成模块"""
    
    def __init__(self, modules: List[dspy.Module], voting_method: str = 'majority'):
        super().__init__()
        
        self.modules = modules
        self.voting_method = voting_method
        self.module_weights = [1.0] * len(modules)  # 默认等权重
    
    def set_module_weights(self, weights: List[float]):
        """设置模块权重"""
        if len(weights) != len(self.modules):
            raise ValueError("权重数量必须与模块数量一致")
        
        self.module_weights = weights
        print(f"⚖️ 设置模块权重: {weights}")
    
    def forward(self, **kwargs):
        """集成前向传播"""
        
        print(f"🤝 执行投票集成，模块数: {len(self.modules)}")
        
        # 收集所有模块的响应
        module_responses = []
        
        for i, module in enumerate(self.modules):
            try:
                response = module(**kwargs)
                module_responses.append({
                    'module_id': i,
                    'response': response,
                    'weight': self.module_weights[i]
                })
                
                print(f"✅ 模块 {i+1} 响应完成")
                
            except Exception as e:
                print(f"❌ 模块 {i+1} 失败: {e}")
                continue
        
        if not module_responses:
            raise RuntimeError("所有模块都失败了")
        
        # 应用投票策略
        if self.voting_method == 'majority':
            final_response = self.majority_vote(module_responses)
        elif self.voting_method == 'weighted':
            final_response = self.weighted_vote(module_responses)
        elif self.voting_method == 'unanimous':
            final_response = self.unanimous_vote(module_responses)
        else:
            raise ValueError(f"不支持的投票方法: {self.voting_method}")
        
        return final_response
    
    def majority_vote(self, responses: List[Dict]) -> dspy.Prediction:
        """多数投票"""
        
        # 提取响应内容
        response_texts = []
        for resp in responses:
            text = getattr(resp['response'], 'answer', '') or str(resp['response'])
            response_texts.append(text)
        
        # 寻找最常见的响应
        response_counts = {}
        for text in response_texts:
            matched = False
            for existing in response_counts:
                if self.text_similarity(text, existing) > 0.7:
                    response_counts[existing] += 1
                    matched = True
                    break
            
            if not matched:
                response_counts[text] = 1
        
        if response_counts:
            most_common = max(response_counts, key=response_counts.get)
            
            # 找到对应的原始响应
            for resp in responses:
                resp_text = getattr(resp['response'], 'answer', '') or str(resp['response'])
                if self.text_similarity(resp_text, most_common) > 0.7:
                    return resp['response']
        
        return responses[0]['response']
    
    def weighted_vote(self, responses: List[Dict]) -> dspy.Prediction:
        """加权投票"""
        
        # 计算加权得分
        response_scores = {}
        
        for resp in responses:
            text = getattr(resp['response'], 'answer', '') or str(resp['response'])
            weight = resp['weight']
            
            matched = False
            for existing_text in response_scores:
                if self.text_similarity(text, existing_text) > 0.7:
                    response_scores[existing_text] += weight
                    matched = True
                    break
            
            if not matched:
                response_scores[text] = weight
        
        if response_scores:
            best_text = max(response_scores, key=response_scores.get)
            
            # 找到对应的原始响应
            for resp in responses:
                resp_text = getattr(resp['response'], 'answer', '') or str(resp['response'])
                if self.text_similarity(resp_text, best_text) > 0.7:
                    return resp['response']
        
        return responses[0]['response']
    
    def unanimous_vote(self, responses: List[Dict]) -> dspy.Prediction:
        """一致性投票"""
        
        if len(responses) <= 1:
            return responses[0]['response']
        
        # 检查所有响应是否一致
        first_response_text = getattr(responses[0]['response'], 'answer', '') or str(responses[0]['response'])
        
        all_consistent = True
        for resp in responses[1:]:
            resp_text = getattr(resp['response'], 'answer', '') or str(resp['response'])
            if self.text_similarity(first_response_text, resp_text) < 0.8:
                all_consistent = False
                break
        
        if all_consistent:
            return responses[0]['response']
        else:
            # 如果不一致，退回到加权投票
            print("⚠️ 响应不一致，退回到加权投票")
            return self.weighted_vote(responses)
    
    def text_similarity(self, text1: str, text2: str) -> float:
        """计算文本相似度"""
        
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 and not words2:
            return 1.0
        elif not words1 or not words2:
            return 0.0
        
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        
        return intersection / union if union > 0 else 0.0

# 使用示例
def demonstrate_self_consistency():
    """演示Self-Consistency"""
    
    # 创建基础模块
    class BaseQA(dspy.Module):
        def __init__(self):
            super().__init__()
            self.qa = dspy.ChainOfThought("question -> answer")
        
        def forward(self, question):
            return self.qa(question=question)
    
    base_module = BaseQA()
    
    # 创建Self-Consistency框架
    sc_framework = SelfConsistencyFramework(base_module, num_samples=5)
    
    # 测试问题
    test_question = "什么是人工智能的主要应用领域？"
    
    print(f"🎯 测试问题: {test_question}")
    
    # 生成一致性响应
    result = sc_framework.generate_consistent_response(
        {'question': test_question},
        voting_strategy='majority'
    )
    
    print(f"\n📊 Self-Consistency结果:")
    print(f"最终响应: {result['final_response']}")
    print(f"置信度: {result['confidence_score']:.3f}")
    print(f"候选响应数: {len(result['candidates'])}")
    
    # 创建投票集成
    modules = [BaseQA() for _ in range(3)]
    voting_ensemble = VotingEnsemble(modules, voting_method='weighted')
    voting_ensemble.set_module_weights([1.0, 0.8, 1.2])  # 给第三个模块更高权重
    
    print(f"\n🤝 投票集成测试:")
    ensemble_result = voting_ensemble(question=test_question)
    print(f"集成结果: {ensemble_result}")
    
    return sc_framework, voting_ensemble

# demo_self_consistency = demonstrate_self_consistency()
```

## 实践练习

### 练习1：构建自适应程序生成器

```python
class AdaptiveProgramGenerator:
    """自适应程序生成器练习"""
    
    def __init__(self):
        self.domain_knowledge = {}
        self.program_templates = {}
    
    def learn_domain_patterns(self, domain_examples):
        """学习领域模式"""
        # TODO: 分析领域特定的模式
        pass
    
    def generate_domain_specific_program(self, task_description, domain):
        """生成领域特定程序"""
        # TODO: 基于领域知识生成程序
        pass
    
    def adaptive_optimization(self, program, feedback):
        """自适应优化"""
        # TODO: 根据反馈自适应调整程序
        pass

# 练习任务：
# 1. 实现领域模式学习算法
# 2. 设计自适应程序生成策略
# 3. 构建反馈学习机制
```

### 练习2：高级一致性验证

```python
class AdvancedConsistencyValidator:
    """高级一致性验证器练习"""
    
    def __init__(self):
        self.consistency_metrics = {}
        self.validation_strategies = {}
    
    def semantic_consistency_check(self, responses):
        """语义一致性检查"""
        # TODO: 实现基于语义的一致性验证
        pass
    
    def logical_consistency_verification(self, reasoning_chain):
        """逻辑一致性验证"""
        # TODO: 验证推理链的逻辑一致性
        pass
    
    def cross_modal_consistency(self, text_response, code_response):
        """跨模态一致性"""
        # TODO: 验证不同模态响应的一致性
        pass

# 练习任务：
# 1. 实现多层次一致性检查
# 2. 设计交叉验证机制
# 3. 构建一致性度量体系
```

## 最佳实践

### 1. 高级模式使用指南

```python
def advanced_patterns_guide():
    """高级模式使用指南"""
    
    guidelines = {
        '程序合成最佳实践': [
            '从简单模式开始，逐步增加复杂度',
            '使用模板和组件库加速开发',
            '实施自动化测试验证生成的程序',
            '建立质量评估和反馈机制'
        ],
        
        '元学习策略': [
            '收集多样化的任务样本',
            '识别任务间的共同模式',
            '建立任务相似性度量',
            '实现快速适应机制'
        ],
        
        'Self-Consistency技巧': [
            '选择合适的采样数量',
            '使用多样化的采样策略',
            '设计有效的投票机制',
            '监控一致性质量'
        ],
        
        '提示优化原则': [
            '使用多种优化策略',
            '平衡探索和利用',
            '建立自动化评估',
            '持续监控和改进'
        ]
    }
    
    return guidelines

class AdvancedPatternMonitor:
    """高级模式监控器"""
    
    def __init__(self):
        self.performance_metrics = {}
        self.pattern_usage_stats = {}
        self.optimization_history = {}
    
    def track_pattern_performance(self, pattern_name, metrics):
        """跟踪模式性能"""
        if pattern_name not in self.performance_metrics:
            self.performance_metrics[pattern_name] = []
        
        self.performance_metrics[pattern_name].append({
            'timestamp': time.time(),
            'metrics': metrics
        })
    
    def analyze_pattern_trends(self, pattern_name):
        """分析模式趋势"""
        if pattern_name not in self.performance_metrics:
            return None
        
        metrics_history = self.performance_metrics[pattern_name]
        
        # 计算趋势
        recent_metrics = metrics_history[-10:]  # 最近10次记录
        
        if len(recent_metrics) < 2:
            return {'trend': 'insufficient_data'}
        
        # 简单的趋势分析
        values = [m['metrics'].get('accuracy', 0) for m in recent_metrics]
        
        if values[-1] > values[0]:
            trend = 'improving'
        elif values[-1] < values[0]:
            trend = 'declining'
        else:
            trend = 'stable'
        
        return {
            'trend': trend,
            'recent_average': sum(values) / len(values),
            'sample_count': len(recent_metrics)
        }
    
    def generate_optimization_recommendations(self):
        """生成优化建议"""
        recommendations = []
        
        for pattern_name in self.performance_metrics:
            trend_analysis = self.analyze_pattern_trends(pattern_name)
            
            if trend_analysis and trend_analysis['trend'] == 'declining':
                recommendations.append({
                    'pattern': pattern_name,
                    'issue': 'performance_decline',
                    'recommendation': f'{pattern_name}性能下降，建议重新优化参数或更新策略'
                })
            elif trend_analysis and trend_analysis['recent_average'] < 0.5:
                recommendations.append({
                    'pattern': pattern_name,
                    'issue': 'low_performance',
                    'recommendation': f'{pattern_name}性能较低，建议考虑替代方案'
                })
        
        return recommendations
```

通过本章的学习，你应该掌握了DSPy的高级模式和技巧。这些技术代表了AI编程的前沿方向，能够帮助你构建更加智能、自适应和可靠的AI应用系统。在实际应用中，要根据具体需求选择合适的技术组合。