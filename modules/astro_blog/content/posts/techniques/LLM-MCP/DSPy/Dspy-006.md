---
title: "第06章：DSPy 数据处理和评估"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第06章：DSPy 数据处理和评估

::: tip 学习目标
- 掌握DSPy中的数据集处理方法
- 学习评估指标的定义和使用
- 实现自定义评估函数
- 进行模型性能对比分析
- 设计A/B测试框架
:::

## 知识点

### 1. DSPy 数据集处理

DSPy提供了强大的数据处理工具，能够处理各种格式的数据集并进行预处理。

#### 数据集基础操作

```python
import dspy
import json
import pandas as pd
from typing import List, Dict, Any, Optional, Union
import random
import numpy as np
from pathlib import Path

class DSPyDataProcessor:
    """DSPy数据处理器"""
    
    def __init__(self):
        self.processed_datasets = {}
        self.statistics = {}
    
    def create_examples_from_dict(self, data_list: List[Dict]) -> List[dspy.Example]:
        """从字典列表创建DSPy Examples"""
        examples = []
        
        for item in data_list:
            # 创建Example对象
            example = dspy.Example(**item)
            examples.append(example)
        
        return examples
    
    def create_examples_from_csv(self, 
                                csv_path: str,
                                input_columns: List[str],
                                output_columns: List[str]) -> List[dspy.Example]:
        """从CSV文件创建DSPy Examples"""
        
        df = pd.read_csv(csv_path)
        examples = []
        
        for _, row in df.iterrows():
            # 构建example数据
            example_data = {}
            
            # 添加输入字段
            for col in input_columns:
                if col in df.columns:
                    example_data[col] = row[col]
            
            # 添加输出字段
            for col in output_columns:
                if col in df.columns:
                    example_data[col] = row[col]
            
            # 创建Example并设置输入字段
            example = dspy.Example(**example_data)
            example = example.with_inputs(*input_columns)
            
            examples.append(example)
        
        print(f"📊 从CSV加载了 {len(examples)} 个样本")
        return examples
    
    def create_examples_from_json(self, 
                                 json_path: str,
                                 input_key: str = "inputs",
                                 output_key: str = "outputs") -> List[dspy.Example]:
        """从JSON文件创建DSPy Examples"""
        
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        examples = []
        
        if isinstance(data, list):
            for item in data:
                example_data = {}
                
                # 处理输入
                if input_key in item:
                    if isinstance(item[input_key], dict):
                        example_data.update(item[input_key])
                    else:
                        example_data['input'] = item[input_key]
                
                # 处理输出
                if output_key in item:
                    if isinstance(item[output_key], dict):
                        example_data.update(item[output_key])
                    else:
                        example_data['output'] = item[output_key]
                
                # 处理其他字段
                for key, value in item.items():
                    if key not in [input_key, output_key]:
                        example_data[key] = value
                
                example = dspy.Example(**example_data)
                examples.append(example)
        
        print(f"📊 从JSON加载了 {len(examples)} 个样本")
        return examples
    
    def split_dataset(self, 
                     examples: List[dspy.Example],
                     train_ratio: float = 0.7,
                     dev_ratio: float = 0.15,
                     test_ratio: float = 0.15,
                     random_seed: int = 42) -> Dict[str, List[dspy.Example]]:
        """分割数据集"""
        
        # 验证比例
        total_ratio = train_ratio + dev_ratio + test_ratio
        if abs(total_ratio - 1.0) > 1e-6:
            raise ValueError("训练、验证和测试集比例之和必须等于1.0")
        
        # 设置随机种子
        random.seed(random_seed)
        
        # 随机打乱数据
        shuffled_examples = examples.copy()
        random.shuffle(shuffled_examples)
        
        # 计算分割点
        total_size = len(shuffled_examples)
        train_size = int(total_size * train_ratio)
        dev_size = int(total_size * dev_ratio)
        
        # 分割数据
        train_set = shuffled_examples[:train_size]
        dev_set = shuffled_examples[train_size:train_size + dev_size]
        test_set = shuffled_examples[train_size + dev_size:]
        
        split_info = {
            'train': train_set,
            'dev': dev_set,
            'test': test_set
        }
        
        # 打印分割信息
        print(f"📊 数据集分割完成:")
        print(f"   训练集: {len(train_set)} 样本 ({len(train_set)/total_size:.1%})")
        print(f"   验证集: {len(dev_set)} 样本 ({len(dev_set)/total_size:.1%})")
        print(f"   测试集: {len(test_set)} 样本 ({len(test_set)/total_size:.1%})")
        
        return split_info
    
    def analyze_dataset(self, examples: List[dspy.Example], name: str = "dataset") -> Dict:
        """分析数据集统计信息"""
        
        if not examples:
            return {'error': 'Empty dataset'}
        
        # 基本统计
        stats = {
            'name': name,
            'total_samples': len(examples),
            'field_stats': {},
            'data_quality': {}
        }
        
        # 获取所有字段
        all_fields = set()
        for example in examples:
            all_fields.update(example.__dict__.keys())
        
        # 分析每个字段
        for field in all_fields:
            field_values = []
            non_null_count = 0
            
            for example in examples:
                value = getattr(example, field, None)
                if value is not None and value != '':
                    field_values.append(value)
                    non_null_count += 1
            
            # 字段统计
            field_stat = {
                'total_count': len(examples),
                'non_null_count': non_null_count,
                'null_ratio': (len(examples) - non_null_count) / len(examples),
                'data_type': self.detect_data_type(field_values)
            }
            
            # 文本字段的额外统计
            if field_stat['data_type'] == 'text':
                if field_values:
                    lengths = [len(str(v)) for v in field_values]
                    field_stat.update({
                        'avg_length': sum(lengths) / len(lengths),
                        'min_length': min(lengths),
                        'max_length': max(lengths),
                        'total_chars': sum(lengths)
                    })
            
            stats['field_stats'][field] = field_stat
        
        # 数据质量检查
        stats['data_quality'] = self.check_data_quality(examples)
        
        self.statistics[name] = stats
        
        # 打印统计摘要
        self.print_dataset_summary(stats)
        
        return stats
    
    def detect_data_type(self, values: List) -> str:
        """检测数据类型"""
        if not values:
            return 'unknown'
        
        sample_values = values[:100]  # 采样检测
        
        # 检查数字类型
        numeric_count = 0
        for value in sample_values:
            try:
                float(str(value))
                numeric_count += 1
            except (ValueError, TypeError):
                pass
        
        if numeric_count / len(sample_values) > 0.8:
            return 'numeric'
        
        # 检查文本类型
        return 'text'
    
    def check_data_quality(self, examples: List[dspy.Example]) -> Dict:
        """检查数据质量"""
        quality_issues = {
            'duplicate_count': 0,
            'missing_inputs': 0,
            'empty_outputs': 0,
            'unusual_lengths': 0
        }
        
        # 检查重复
        seen_inputs = set()
        for example in examples:
            input_str = str(example.inputs() if hasattr(example, 'inputs') else example.__dict__)
            if input_str in seen_inputs:
                quality_issues['duplicate_count'] += 1
            else:
                seen_inputs.add(input_str)
        
        # 检查缺失和异常
        for example in examples:
            # 检查缺失输入
            try:
                inputs = example.inputs()
                if not any(inputs.values()):
                    quality_issues['missing_inputs'] += 1
            except:
                quality_issues['missing_inputs'] += 1
            
            # 检查空输出
            for key, value in example.__dict__.items():
                if 'answer' in key.lower() or 'output' in key.lower():
                    if not value or len(str(value).strip()) == 0:
                        quality_issues['empty_outputs'] += 1
                        break
            
            # 检查异常长度
            for key, value in example.__dict__.items():
                if isinstance(value, str):
                    if len(value) > 10000 or len(value) < 2:  # 过长或过短
                        quality_issues['unusual_lengths'] += 1
                        break
        
        return quality_issues
    
    def print_dataset_summary(self, stats: Dict):
        """打印数据集摘要"""
        print(f"\n📋 数据集 '{stats['name']}' 分析报告")
        print("=" * 50)
        print(f"总样本数: {stats['total_samples']}")
        
        print(f"\n📊 字段统计:")
        for field, field_stat in stats['field_stats'].items():
            print(f"  {field}:")
            print(f"    类型: {field_stat['data_type']}")
            print(f"    非空率: {(1-field_stat['null_ratio']):.1%}")
            
            if field_stat['data_type'] == 'text' and 'avg_length' in field_stat:
                print(f"    平均长度: {field_stat['avg_length']:.1f} 字符")
        
        print(f"\n🔍 数据质量:")
        quality = stats['data_quality']
        print(f"  重复样本: {quality['duplicate_count']}")
        print(f"  缺失输入: {quality['missing_inputs']}")
        print(f"  空输出: {quality['empty_outputs']}")
        print(f"  异常长度: {quality['unusual_lengths']}")

# 数据增强工具
class DataAugmentor:
    """数据增强器"""
    
    def __init__(self):
        self.augmentation_methods = {
            'paraphrase': self.paraphrase_augmentation,
            'synonym': self.synonym_replacement,
            'back_translation': self.back_translation,
            'template': self.template_based_augmentation
        }
    
    def augment_dataset(self, 
                       examples: List[dspy.Example], 
                       methods: List[str] = ['paraphrase'],
                       target_ratio: float = 1.5) -> List[dspy.Example]:
        """增强数据集"""
        
        original_size = len(examples)
        target_size = int(original_size * target_ratio)
        augmented_examples = examples.copy()
        
        print(f"🔄 开始数据增强: {original_size} -> {target_size}")
        
        while len(augmented_examples) < target_size:
            for method in methods:
                if method in self.augmentation_methods:
                    # 随机选择一个原始样本进行增强
                    original_example = random.choice(examples)
                    augmented_example = self.augmentation_methods[method](original_example)
                    
                    if augmented_example:
                        augmented_examples.append(augmented_example)
                        
                        if len(augmented_examples) >= target_size:
                            break
        
        print(f"✅ 数据增强完成: {len(augmented_examples)} 个样本")
        return augmented_examples[:target_size]
    
    def paraphrase_augmentation(self, example: dspy.Example) -> Optional[dspy.Example]:
        """释义增强"""
        # 使用DSPy进行释义
        paraphraser = dspy.ChainOfThought(
            "original_text -> reasoning, paraphrased_text",
            instructions="对给定文本进行释义，保持原意但改变表达方式。"
        )
        
        try:
            # 选择一个文本字段进行释义
            text_fields = []
            for key, value in example.__dict__.items():
                if isinstance(value, str) and len(value) > 10:
                    text_fields.append((key, value))
            
            if not text_fields:
                return None
            
            field_name, original_text = random.choice(text_fields)
            
            # 生成释义
            result = paraphraser(original_text=original_text)
            
            # 创建新的example
            new_example_data = example.__dict__.copy()
            new_example_data[field_name] = result.paraphrased_text
            
            new_example = dspy.Example(**new_example_data)
            
            # 保持输入输出设置
            if hasattr(example, '_input_keys'):
                new_example = new_example.with_inputs(*example._input_keys)
            
            return new_example
            
        except Exception as e:
            print(f"释义增强失败: {e}")
            return None
    
    def synonym_replacement(self, example: dspy.Example) -> Optional[dspy.Example]:
        """同义词替换"""
        # 简化的同义词替换实现
        synonym_dict = {
            '好的': ['不错的', '优秀的', '良好的'],
            '问题': ['疑问', '难题', '议题'],
            '方法': ['方式', '途径', '手段'],
            '重要': ['关键', '重大', '紧要'],
            '简单': ['容易', '轻松', '便捷']
        }
        
        try:
            new_example_data = example.__dict__.copy()
            
            # 对文本字段进行同义词替换
            for key, value in new_example_data.items():
                if isinstance(value, str):
                    modified_text = value
                    for original, synonyms in synonym_dict.items():
                        if original in modified_text:
                            replacement = random.choice(synonyms)
                            modified_text = modified_text.replace(original, replacement, 1)
                    new_example_data[key] = modified_text
            
            new_example = dspy.Example(**new_example_data)
            
            if hasattr(example, '_input_keys'):
                new_example = new_example.with_inputs(*example._input_keys)
            
            return new_example
            
        except Exception as e:
            print(f"同义词替换失败: {e}")
            return None
    
    def back_translation(self, example: dspy.Example) -> Optional[dspy.Example]:
        """回译增强"""
        # 这里简化实现，实际应用中需要调用翻译API
        print("回译增强需要外部翻译服务，此处跳过")
        return None
    
    def template_based_augmentation(self, example: dspy.Example) -> Optional[dspy.Example]:
        """基于模板的增强"""
        templates = {
            'question': [
                "请问{}？",
                "能否告诉我{}？",
                "我想了解{}。",
                "{}是什么？"
            ]
        }
        
        try:
            new_example_data = example.__dict__.copy()
            
            # 查找问题字段并应用模板
            for key, value in new_example_data.items():
                if 'question' in key.lower() and isinstance(value, str):
                    # 提取核心内容（简化处理）
                    core_content = value.replace('什么是', '').replace('？', '').replace('?', '')
                    if core_content.strip():
                        template = random.choice(templates['question'])
                        new_example_data[key] = template.format(core_content.strip())
            
            new_example = dspy.Example(**new_example_data)
            
            if hasattr(example, '_input_keys'):
                new_example = new_example.with_inputs(*example._input_keys)
            
            return new_example
            
        except Exception as e:
            print(f"模板增强失败: {e}")
            return None

# 使用示例
def demonstrate_data_processing():
    """演示数据处理功能"""
    
    # 创建示例数据
    sample_data = [
        {
            'question': '什么是机器学习？',
            'answer': '机器学习是人工智能的一个分支，让计算机能够从数据中学习。',
            'category': 'AI',
            'difficulty': 'basic'
        },
        {
            'question': '深度学习有什么特点？',
            'answer': '深度学习使用多层神经网络，能够自动提取特征。',
            'category': 'AI',
            'difficulty': 'intermediate'
        },
        {
            'question': '如何优化神经网络？',
            'answer': '可以通过调整学习率、使用正则化、批量归一化等方法优化神经网络。',
            'category': 'AI',
            'difficulty': 'advanced'
        }
    ]
    
    # 初始化数据处理器
    processor = DSPyDataProcessor()
    
    # 创建Examples
    examples = processor.create_examples_from_dict(sample_data)
    
    # 设置输入输出
    examples = [ex.with_inputs('question') for ex in examples]
    
    # 分析数据集
    stats = processor.analyze_dataset(examples, "示例数据集")
    
    # 分割数据集
    splits = processor.split_dataset(examples, train_ratio=0.6, dev_ratio=0.2, test_ratio=0.2)
    
    # 数据增强
    augmentor = DataAugmentor()
    augmented_train = augmentor.augment_dataset(
        splits['train'], 
        methods=['paraphrase', 'synonym'], 
        target_ratio=2.0
    )
    
    return {
        'original_examples': examples,
        'statistics': stats,
        'splits': splits,
        'augmented_train': augmented_train
    }

# 运行演示
# demo_results = demonstrate_data_processing()
```

### 2. 评估指标系统

DSPy支持多种评估指标，可以全面评估模型性能。

```python
class DSPyEvaluationSystem:
    """DSPy评估系统"""
    
    def __init__(self):
        self.metrics = {}
        self.evaluation_results = {}
        
        # 注册基础指标
        self.register_basic_metrics()
    
    def register_basic_metrics(self):
        """注册基础评估指标"""
        
        # 精确匹配
        self.metrics['exact_match'] = self.exact_match_metric
        
        # 包含匹配
        self.metrics['contains_match'] = self.contains_match_metric
        
        # 语义相似度
        self.metrics['semantic_similarity'] = self.semantic_similarity_metric
        
        # BLEU分数
        self.metrics['bleu_score'] = self.bleu_score_metric
        
        # ROUGE分数
        self.metrics['rouge_score'] = self.rouge_score_metric
        
        # 自定义评分
        self.metrics['custom_score'] = self.custom_score_metric
    
    def exact_match_metric(self, example, prediction, trace=None) -> bool:
        """精确匹配指标"""
        try:
            expected = getattr(example, 'answer', '') or getattr(example, 'output', '')
            actual = getattr(prediction, 'answer', '') or getattr(prediction, 'output', '')
            
            return str(expected).strip().lower() == str(actual).strip().lower()
        except Exception:
            return False
    
    def contains_match_metric(self, example, prediction, trace=None) -> bool:
        """包含匹配指标"""
        try:
            expected = getattr(example, 'answer', '') or getattr(example, 'output', '')
            actual = getattr(prediction, 'answer', '') or getattr(prediction, 'output', '')
            
            expected_lower = str(expected).strip().lower()
            actual_lower = str(actual).strip().lower()
            
            return expected_lower in actual_lower or actual_lower in expected_lower
        except Exception:
            return False
    
    def semantic_similarity_metric(self, example, prediction, trace=None) -> float:
        """语义相似度指标"""
        try:
            expected = str(getattr(example, 'answer', '') or getattr(example, 'output', ''))
            actual = str(getattr(prediction, 'answer', '') or getattr(prediction, 'output', ''))
            
            # 简化的语义相似度计算（实际应用中应使用更复杂的方法）
            expected_words = set(expected.lower().split())
            actual_words = set(actual.lower().split())
            
            if not expected_words and not actual_words:
                return 1.0
            elif not expected_words or not actual_words:
                return 0.0
            
            intersection = len(expected_words.intersection(actual_words))
            union = len(expected_words.union(actual_words))
            
            return intersection / union if union > 0 else 0.0
            
        except Exception:
            return 0.0
    
    def bleu_score_metric(self, example, prediction, trace=None) -> float:
        """BLEU分数指标"""
        try:
            from nltk.translate.bleu_score import sentence_bleu
            from nltk.tokenize import word_tokenize
            
            expected = str(getattr(example, 'answer', '') or getattr(example, 'output', ''))
            actual = str(getattr(prediction, 'answer', '') or getattr(prediction, 'output', ''))
            
            reference = [word_tokenize(expected.lower())]
            candidate = word_tokenize(actual.lower())
            
            score = sentence_bleu(reference, candidate)
            return score
            
        except ImportError:
            print("NLTK未安装，使用简化BLEU计算")
            return self.simple_bleu(example, prediction)
        except Exception:
            return 0.0
    
    def simple_bleu(self, example, prediction) -> float:
        """简化的BLEU计算"""
        try:
            expected = str(getattr(example, 'answer', '') or getattr(example, 'output', ''))
            actual = str(getattr(prediction, 'answer', '') or getattr(prediction, 'output', ''))
            
            expected_words = expected.lower().split()
            actual_words = actual.lower().split()
            
            if not actual_words:
                return 0.0
            
            # 1-gram精确率
            matches = sum(1 for word in actual_words if word in expected_words)
            precision = matches / len(actual_words)
            
            # 长度惩罚
            length_penalty = min(1.0, len(expected_words) / len(actual_words))
            
            return precision * length_penalty
            
        except Exception:
            return 0.0
    
    def rouge_score_metric(self, example, prediction, trace=None) -> float:
        """ROUGE分数指标"""
        try:
            expected = str(getattr(example, 'answer', '') or getattr(example, 'output', ''))
            actual = str(getattr(prediction, 'answer', '') or getattr(prediction, 'output', ''))
            
            expected_words = expected.lower().split()
            actual_words = actual.lower().split()
            
            if not expected_words:
                return 1.0 if not actual_words else 0.0
            
            # ROUGE-1 (unigram overlap)
            overlap = sum(1 for word in expected_words if word in actual_words)
            recall = overlap / len(expected_words)
            precision = overlap / len(actual_words) if actual_words else 0.0
            
            # F1-score
            if recall + precision == 0:
                return 0.0
            
            f1 = 2 * (recall * precision) / (recall + precision)
            return f1
            
        except Exception:
            return 0.0
    
    def custom_score_metric(self, example, prediction, trace=None) -> float:
        """自定义评分指标"""
        # 使用DSPy模块进行智能评分
        scorer = dspy.ChainOfThought(
            "question, expected_answer, actual_answer -> reasoning, score",
            instructions="""评估答案质量，考虑以下因素：
            1. 准确性：答案是否正确
            2. 完整性：答案是否完整
            3. 相关性：答案是否相关
            4. 清晰度：答案是否清晰易懂
            给出0-10的评分。"""
        )
        
        try:
            question = getattr(example, 'question', '') or getattr(example, 'input', '')
            expected = getattr(example, 'answer', '') or getattr(example, 'output', '')
            actual = getattr(prediction, 'answer', '') or getattr(prediction, 'output', '')
            
            result = scorer(
                question=question,
                expected_answer=expected,
                actual_answer=actual
            )
            
            # 提取数字评分
            import re
            score_match = re.search(r'(\d+(?:\.\d+)?)', result.score)
            if score_match:
                score = float(score_match.group(1))
                return min(max(score / 10.0, 0.0), 1.0)  # 归一化到0-1
            
        except Exception as e:
            print(f"自定义评分失败: {e}")
        
        return 0.5  # 默认中等分数
    
    def evaluate_program(self, 
                        program,
                        test_examples: List[dspy.Example],
                        metrics: List[str] = None,
                        verbose: bool = True) -> Dict[str, Any]:
        """评估程序性能"""
        
        if metrics is None:
            metrics = ['exact_match', 'semantic_similarity']
        
        print(f"🔍 开始评估，测试样本数: {len(test_examples)}")
        print(f"📊 评估指标: {', '.join(metrics)}")
        
        results = {
            'total_examples': len(test_examples),
            'successful_predictions': 0,
            'failed_predictions': 0,
            'metric_scores': {metric: [] for metric in metrics},
            'detailed_results': []
        }
        
        for i, example in enumerate(test_examples):
            if verbose and (i + 1) % 10 == 0:
                print(f"  处理进度: {i + 1}/{len(test_examples)}")
            
            try:
                # 执行预测
                prediction = program(**example.inputs())
                results['successful_predictions'] += 1
                
                # 计算各项指标
                example_scores = {}
                for metric_name in metrics:
                    if metric_name in self.metrics:
                        score = self.metrics[metric_name](example, prediction)
                        example_scores[metric_name] = float(score)
                        results['metric_scores'][metric_name].append(float(score))
                
                # 记录详细结果
                detailed_result = {
                    'example_id': i,
                    'input': example.inputs(),
                    'expected_output': {k: v for k, v in example.__dict__.items() 
                                      if k not in example.inputs()},
                    'actual_output': prediction.__dict__ if hasattr(prediction, '__dict__') 
                                   else str(prediction),
                    'scores': example_scores
                }
                
                results['detailed_results'].append(detailed_result)
                
            except Exception as e:
                results['failed_predictions'] += 1
                if verbose:
                    print(f"  预测失败 (样本 {i}): {e}")
                
                # 记录失败结果
                detailed_result = {
                    'example_id': i,
                    'input': example.inputs(),
                    'error': str(e),
                    'scores': {metric: 0.0 for metric in metrics}
                }
                
                results['detailed_results'].append(detailed_result)
                
                # 为失败案例添加0分
                for metric_name in metrics:
                    results['metric_scores'][metric_name].append(0.0)
        
        # 计算总体统计
        results['summary'] = self.calculate_summary_statistics(results)
        
        # 打印评估结果
        if verbose:
            self.print_evaluation_results(results)
        
        return results
    
    def calculate_summary_statistics(self, results: Dict) -> Dict:
        """计算汇总统计信息"""
        summary = {
            'success_rate': results['successful_predictions'] / results['total_examples'],
            'metric_averages': {},
            'metric_std': {},
            'metric_ranges': {}
        }
        
        for metric_name, scores in results['metric_scores'].items():
            if scores:
                summary['metric_averages'][metric_name] = sum(scores) / len(scores)
                
                # 计算标准差
                mean = summary['metric_averages'][metric_name]
                variance = sum((x - mean) ** 2 for x in scores) / len(scores)
                summary['metric_std'][metric_name] = variance ** 0.5
                
                # 计算范围
                summary['metric_ranges'][metric_name] = {
                    'min': min(scores),
                    'max': max(scores)
                }
        
        return summary
    
    def print_evaluation_results(self, results: Dict):
        """打印评估结果"""
        print(f"\n📈 评估结果摘要")
        print("=" * 50)
        
        summary = results['summary']
        
        print(f"成功率: {summary['success_rate']:.1%} "
              f"({results['successful_predictions']}/{results['total_examples']})")
        
        print(f"\n📊 指标表现:")
        for metric_name, avg_score in summary['metric_averages'].items():
            std_score = summary['metric_std'][metric_name]
            range_info = summary['metric_ranges'][metric_name]
            
            print(f"  {metric_name}:")
            print(f"    平均: {avg_score:.3f} (±{std_score:.3f})")
            print(f"    范围: {range_info['min']:.3f} - {range_info['max']:.3f}")
    
    def compare_programs(self, 
                        programs: Dict[str, Any],
                        test_examples: List[dspy.Example],
                        metrics: List[str] = None) -> Dict:
        """比较多个程序的性能"""
        
        print(f"🏆 开始程序性能对比")
        print(f"参与对比的程序: {list(programs.keys())}")
        
        comparison_results = {}
        
        for program_name, program in programs.items():
            print(f"\n📊 评估程序: {program_name}")
            
            results = self.evaluate_program(program, test_examples, metrics, verbose=False)
            comparison_results[program_name] = results
        
        # 生成对比报告
        comparison_summary = self.generate_comparison_report(comparison_results)
        
        return {
            'individual_results': comparison_results,
            'comparison_summary': comparison_summary
        }
    
    def generate_comparison_report(self, results: Dict) -> Dict:
        """生成对比报告"""
        if not results:
            return {}
        
        metrics = list(next(iter(results.values()))['summary']['metric_averages'].keys())
        
        comparison = {
            'program_rankings': {},
            'best_program': {},
            'performance_gaps': {}
        }
        
        # 为每个指标排名
        for metric in metrics:
            program_scores = []
            for program_name, program_results in results.items():
                avg_score = program_results['summary']['metric_averages'][metric]
                program_scores.append((program_name, avg_score))
            
            # 按分数排序
            program_scores.sort(key=lambda x: x[1], reverse=True)
            comparison['program_rankings'][metric] = program_scores
            comparison['best_program'][metric] = program_scores[0]
            
            # 计算性能差距
            if len(program_scores) > 1:
                best_score = program_scores[0][1]
                worst_score = program_scores[-1][1]
                comparison['performance_gaps'][metric] = best_score - worst_score
        
        # 打印对比结果
        self.print_comparison_results(comparison)
        
        return comparison
    
    def print_comparison_results(self, comparison: Dict):
        """打印对比结果"""
        print(f"\n🏆 程序性能对比结果")
        print("=" * 60)
        
        for metric, rankings in comparison['program_rankings'].items():
            print(f"\n📊 {metric} 排名:")
            for i, (program_name, score) in enumerate(rankings, 1):
                print(f"  {i}. {program_name}: {score:.3f}")
            
            # 显示性能差距
            if metric in comparison['performance_gaps']:
                gap = comparison['performance_gaps'][metric]
                print(f"  性能差距: {gap:.3f}")
        
        print(f"\n🥇 各指标最佳程序:")
        for metric, (best_program, best_score) in comparison['best_program'].items():
            print(f"  {metric}: {best_program} ({best_score:.3f})")

# 使用示例
def demonstrate_evaluation_system():
    """演示评估系统"""
    
    # 创建测试数据
    test_examples = [
        dspy.Example(question="什么是AI?", answer="人工智能").with_inputs('question'),
        dspy.Example(question="ML是什么?", answer="机器学习").with_inputs('question'),
    ]
    
    # 创建模拟程序
    class MockProgram1:
        def __call__(self, **kwargs):
            return dspy.Prediction(answer="人工智能是模拟人类智能的技术")
    
    class MockProgram2:
        def __call__(self, **kwargs):
            return dspy.Prediction(answer="AI就是人工智能")
    
    # 初始化评估系统
    evaluator = DSPyEvaluationSystem()
    
    # 单程序评估
    program1 = MockProgram1()
    results = evaluator.evaluate_program(
        program1, 
        test_examples, 
        metrics=['exact_match', 'semantic_similarity', 'custom_score']
    )
    
    # 多程序对比
    programs = {
        'Program A': MockProgram1(),
        'Program B': MockProgram2()
    }
    
    comparison = evaluator.compare_programs(programs, test_examples)
    
    return results, comparison

# demo_eval_results = demonstrate_evaluation_system()
```

### 3. A/B测试框架

A/B测试是评估不同模型或策略效果的重要方法。

```python
import time
from datetime import datetime
import statistics
from typing import Callable

class ABTestFramework:
    """A/B测试框架"""
    
    def __init__(self):
        self.experiments = {}
        self.results = {}
    
    def create_experiment(self,
                         experiment_name: str,
                         control_program,
                         treatment_program,
                         traffic_split: float = 0.5,
                         success_metrics: List[str] = None,
                         minimum_sample_size: int = 100) -> str:
        """创建A/B测试实验"""
        
        experiment_id = f"{experiment_name}_{int(time.time())}"
        
        self.experiments[experiment_id] = {
            'name': experiment_name,
            'control_program': control_program,
            'treatment_program': treatment_program,
            'traffic_split': traffic_split,
            'success_metrics': success_metrics or ['success_rate'],
            'minimum_sample_size': minimum_sample_size,
            'start_time': datetime.now(),
            'status': 'active',
            'control_results': [],
            'treatment_results': [],
            'control_count': 0,
            'treatment_count': 0
        }
        
        print(f"✅ 创建A/B测试实验: {experiment_id}")
        print(f"   对照组程序: {type(control_program).__name__}")
        print(f"   实验组程序: {type(treatment_program).__name__}")
        print(f"   流量分配: {traffic_split:.1%} 实验组")
        
        return experiment_id
    
    def run_single_test(self, 
                       experiment_id: str, 
                       test_example: dspy.Example,
                       evaluator: DSPyEvaluationSystem) -> Dict:
        """执行单次测试"""
        
        if experiment_id not in self.experiments:
            raise ValueError(f"实验 {experiment_id} 不存在")
        
        experiment = self.experiments[experiment_id]
        
        # 决定使用哪个程序（流量分配）
        use_treatment = random.random() < experiment['traffic_split']
        
        program = experiment['treatment_program'] if use_treatment else experiment['control_program']
        program_type = 'treatment' if use_treatment else 'control'
        
        # 执行预测
        start_time = time.time()
        try:
            prediction = program(**test_example.inputs())
            execution_time = time.time() - start_time
            success = True
            error = None
        except Exception as e:
            execution_time = time.time() - start_time
            prediction = None
            success = False
            error = str(e)
        
        # 评估结果
        evaluation_scores = {}
        if success and prediction:
            for metric in experiment['success_metrics']:
                if hasattr(evaluator, 'metrics') and metric in evaluator.metrics:
                    score = evaluator.metrics[metric](test_example, prediction)
                    evaluation_scores[metric] = score
        
        # 记录结果
        result = {
            'timestamp': datetime.now(),
            'program_type': program_type,
            'success': success,
            'execution_time': execution_time,
            'evaluation_scores': evaluation_scores,
            'error': error,
            'example_id': id(test_example)
        }
        
        # 添加到对应的结果列表
        if program_type == 'treatment':
            experiment['treatment_results'].append(result)
            experiment['treatment_count'] += 1
        else:
            experiment['control_results'].append(result)
            experiment['control_count'] += 1
        
        return result
    
    def run_batch_test(self, 
                      experiment_id: str,
                      test_examples: List[dspy.Example],
                      evaluator: DSPyEvaluationSystem,
                      verbose: bool = True) -> Dict:
        """执行批量测试"""
        
        print(f"🧪 执行A/B测试: {experiment_id}")
        print(f"📊 测试样本数: {len(test_examples)}")
        
        batch_results = []
        
        for i, example in enumerate(test_examples):
            if verbose and (i + 1) % 20 == 0:
                print(f"  进度: {i + 1}/{len(test_examples)}")
            
            result = self.run_single_test(experiment_id, example, evaluator)
            batch_results.append(result)
        
        # 检查是否达到最小样本量
        experiment = self.experiments[experiment_id]
        total_samples = experiment['control_count'] + experiment['treatment_count']
        
        if total_samples >= experiment['minimum_sample_size']:
            print(f"✅ 达到最小样本量，可以进行统计分析")
        else:
            needed = experiment['minimum_sample_size'] - total_samples
            print(f"⏳ 还需要 {needed} 个样本达到最小样本量")
        
        return {
            'batch_results': batch_results,
            'experiment_summary': self.get_experiment_summary(experiment_id)
        }
    
    def get_experiment_summary(self, experiment_id: str) -> Dict:
        """获取实验摘要"""
        
        if experiment_id not in self.experiments:
            return {}
        
        experiment = self.experiments[experiment_id]
        
        # 计算对照组统计
        control_stats = self._calculate_group_statistics(experiment['control_results'])
        
        # 计算实验组统计
        treatment_stats = self._calculate_group_statistics(experiment['treatment_results'])
        
        # 计算统计显著性
        significance_results = self._calculate_statistical_significance(
            experiment['control_results'], 
            experiment['treatment_results'],
            experiment['success_metrics']
        )
        
        summary = {
            'experiment_name': experiment['name'],
            'experiment_id': experiment_id,
            'duration': datetime.now() - experiment['start_time'],
            'control_count': experiment['control_count'],
            'treatment_count': experiment['treatment_count'],
            'control_stats': control_stats,
            'treatment_stats': treatment_stats,
            'significance_results': significance_results,
            'recommendations': self._generate_recommendations(
                control_stats, treatment_stats, significance_results
            )
        }
        
        return summary
    
    def _calculate_group_statistics(self, results: List[Dict]) -> Dict:
        """计算组统计信息"""
        
        if not results:
            return {
                'sample_size': 0,
                'success_rate': 0.0,
                'avg_execution_time': 0.0,
                'metric_averages': {}
            }
        
        # 基本统计
        sample_size = len(results)
        successful_results = [r for r in results if r['success']]
        success_rate = len(successful_results) / sample_size
        
        # 执行时间统计
        execution_times = [r['execution_time'] for r in results]
        avg_execution_time = statistics.mean(execution_times)
        
        # 指标统计
        metric_averages = {}
        
        if successful_results:
            # 收集所有指标
            all_metrics = set()
            for result in successful_results:
                all_metrics.update(result['evaluation_scores'].keys())
            
            for metric in all_metrics:
                metric_scores = []
                for result in successful_results:
                    if metric in result['evaluation_scores']:
                        metric_scores.append(result['evaluation_scores'][metric])
                
                if metric_scores:
                    metric_averages[metric] = {
                        'mean': statistics.mean(metric_scores),
                        'std': statistics.stdev(metric_scores) if len(metric_scores) > 1 else 0.0,
                        'min': min(metric_scores),
                        'max': max(metric_scores)
                    }
        
        return {
            'sample_size': sample_size,
            'success_rate': success_rate,
            'avg_execution_time': avg_execution_time,
            'execution_time_std': statistics.stdev(execution_times) if len(execution_times) > 1 else 0.0,
            'metric_averages': metric_averages
        }
    
    def _calculate_statistical_significance(self, 
                                          control_results: List[Dict],
                                          treatment_results: List[Dict],
                                          metrics: List[str]) -> Dict:
        """计算统计显著性"""
        
        significance_results = {}
        
        # 成功率的显著性检验
        significance_results['success_rate'] = self._two_proportion_z_test(
            control_results, treatment_results
        )
        
        # 各指标的显著性检验
        for metric in metrics:
            if metric != 'success_rate':
                significance_results[metric] = self._two_sample_t_test(
                    control_results, treatment_results, metric
                )
        
        return significance_results
    
    def _two_proportion_z_test(self, control_results: List[Dict], treatment_results: List[Dict]) -> Dict:
        """双比例Z检验"""
        
        if not control_results or not treatment_results:
            return {'test': 'two_proportion_z', 'p_value': 1.0, 'significant': False}
        
        # 计算成功率
        n1 = len(control_results)
        n2 = len(treatment_results)
        x1 = sum(1 for r in control_results if r['success'])
        x2 = sum(1 for r in treatment_results if r['success'])
        
        p1 = x1 / n1
        p2 = x2 / n2
        
        # 合并比例
        p = (x1 + x2) / (n1 + n2)
        
        # 标准误差
        se = (p * (1 - p) * (1/n1 + 1/n2)) ** 0.5
        
        if se == 0:
            return {'test': 'two_proportion_z', 'p_value': 1.0, 'significant': False}
        
        # Z统计量
        z = (p2 - p1) / se
        
        # 简化的p值计算（实际应用中应使用更精确的方法）
        p_value = 2 * (1 - abs(z) / 2)  # 非常简化的近似
        p_value = max(0.0, min(1.0, p_value))
        
        return {
            'test': 'two_proportion_z',
            'z_statistic': z,
            'p_value': p_value,
            'significant': p_value < 0.05,
            'control_rate': p1,
            'treatment_rate': p2,
            'effect_size': p2 - p1
        }
    
    def _two_sample_t_test(self, control_results: List[Dict], treatment_results: List[Dict], metric: str) -> Dict:
        """双样本t检验"""
        
        # 提取指标数据
        control_scores = []
        treatment_scores = []
        
        for result in control_results:
            if result['success'] and metric in result['evaluation_scores']:
                control_scores.append(result['evaluation_scores'][metric])
        
        for result in treatment_results:
            if result['success'] and metric in result['evaluation_scores']:
                treatment_scores.append(result['evaluation_scores'][metric])
        
        if len(control_scores) < 2 or len(treatment_scores) < 2:
            return {'test': 'two_sample_t', 'p_value': 1.0, 'significant': False}
        
        # 计算统计量
        mean1 = statistics.mean(control_scores)
        mean2 = statistics.mean(treatment_scores)
        std1 = statistics.stdev(control_scores)
        std2 = statistics.stdev(treatment_scores)
        n1 = len(control_scores)
        n2 = len(treatment_scores)
        
        # 合并标准差
        pooled_std = ((n1 - 1) * std1**2 + (n2 - 1) * std2**2) / (n1 + n2 - 2)
        pooled_std = pooled_std ** 0.5
        
        if pooled_std == 0:
            return {'test': 'two_sample_t', 'p_value': 1.0, 'significant': False}
        
        # t统计量
        t = (mean2 - mean1) / (pooled_std * (1/n1 + 1/n2)**0.5)
        
        # 自由度
        df = n1 + n2 - 2
        
        # 简化的p值计算
        p_value = 2 * (1 - abs(t) / (df**0.5 + 2))  # 非常简化的近似
        p_value = max(0.0, min(1.0, p_value))
        
        return {
            'test': 'two_sample_t',
            't_statistic': t,
            'degrees_of_freedom': df,
            'p_value': p_value,
            'significant': p_value < 0.05,
            'control_mean': mean1,
            'treatment_mean': mean2,
            'effect_size': mean2 - mean1
        }
    
    def _generate_recommendations(self, 
                                 control_stats: Dict, 
                                 treatment_stats: Dict, 
                                 significance_results: Dict) -> List[str]:
        """生成建议"""
        
        recommendations = []
        
        # 检查样本量
        if control_stats['sample_size'] < 30 or treatment_stats['sample_size'] < 30:
            recommendations.append("⚠️ 样本量较小，建议收集更多数据以提高统计可靠性")
        
        # 检查成功率
        if 'success_rate' in significance_results:
            sig_result = significance_results['success_rate']
            if sig_result['significant']:
                if sig_result['effect_size'] > 0:
                    recommendations.append("✅ 实验组成功率显著高于对照组，建议采用实验组方案")
                else:
                    recommendations.append("❌ 实验组成功率显著低于对照组，建议保持对照组方案")
            else:
                recommendations.append("➖ 实验组与对照组成功率无显著差异")
        
        # 检查执行时间
        if treatment_stats['avg_execution_time'] > control_stats['avg_execution_time'] * 1.2:
            recommendations.append("⏱️ 实验组执行时间明显更长，需考虑性能成本")
        elif treatment_stats['avg_execution_time'] < control_stats['avg_execution_time'] * 0.8:
            recommendations.append("🚀 实验组执行时间更短，有性能优势")
        
        # 检查其他指标
        for metric, sig_result in significance_results.items():
            if metric != 'success_rate' and sig_result.get('significant', False):
                effect_size = sig_result.get('effect_size', 0)
                if effect_size > 0:
                    recommendations.append(f"📈 {metric}指标实验组表现显著更好")
                else:
                    recommendations.append(f"📉 {metric}指标对照组表现显著更好")
        
        if not recommendations:
            recommendations.append("🤔 实验结果无明显差异，建议延长测试时间或调整实验设计")
        
        return recommendations
    
    def generate_report(self, experiment_id: str) -> str:
        """生成实验报告"""
        
        summary = self.get_experiment_summary(experiment_id)
        
        if not summary:
            return f"实验 {experiment_id} 不存在或无数据"
        
        report = []
        report.append(f"📊 A/B测试实验报告")
        report.append("=" * 60)
        report.append(f"实验名称: {summary['experiment_name']}")
        report.append(f"实验ID: {summary['experiment_id']}")
        report.append(f"测试时长: {summary['duration']}")
        report.append(f"样本量: 对照组 {summary['control_count']}, 实验组 {summary['treatment_count']}")
        
        report.append(f"\n📈 对照组表现:")
        control_stats = summary['control_stats']
        report.append(f"  成功率: {control_stats['success_rate']:.1%}")
        report.append(f"  平均执行时间: {control_stats['avg_execution_time']:.3f}s")
        
        report.append(f"\n📈 实验组表现:")
        treatment_stats = summary['treatment_stats']
        report.append(f"  成功率: {treatment_stats['success_rate']:.1%}")
        report.append(f"  平均执行时间: {treatment_stats['avg_execution_time']:.3f}s")
        
        report.append(f"\n🔬 统计显著性:")
        for metric, sig_result in summary['significance_results'].items():
            significance = "显著" if sig_result.get('significant', False) else "不显著"
            p_value = sig_result.get('p_value', 1.0)
            report.append(f"  {metric}: {significance} (p={p_value:.3f})")
        
        report.append(f"\n💡 建议:")
        for rec in summary['recommendations']:
            report.append(f"  {rec}")
        
        return "\n".join(report)

# 使用示例
def demonstrate_ab_testing():
    """演示A/B测试框架"""
    
    # 创建模拟程序
    class ControlProgram:
        def __call__(self, **kwargs):
            # 模拟较简单的回答
            time.sleep(0.1)  # 模拟执行时间
            return dspy.Prediction(answer="基本回答")
    
    class TreatmentProgram:
        def __call__(self, **kwargs):
            # 模拟更复杂但更好的回答
            time.sleep(0.15)  # 稍长的执行时间
            if random.random() > 0.1:  # 90%成功率
                return dspy.Prediction(answer="详细准确的回答")
            else:
                raise Exception("处理失败")
    
    # 创建测试数据
    test_examples = [
        dspy.Example(question=f"问题{i}", answer="标准答案").with_inputs('question')
        for i in range(50)
    ]
    
    # 初始化A/B测试框架和评估器
    ab_test = ABTestFramework()
    evaluator = DSPyEvaluationSystem()
    
    # 创建实验
    experiment_id = ab_test.create_experiment(
        experiment_name="回答质量改进测试",
        control_program=ControlProgram(),
        treatment_program=TreatmentProgram(),
        traffic_split=0.5,
        success_metrics=['exact_match', 'semantic_similarity'],
        minimum_sample_size=30
    )
    
    # 运行批量测试
    batch_results = ab_test.run_batch_test(experiment_id, test_examples, evaluator)
    
    # 生成报告
    report = ab_test.generate_report(experiment_id)
    print(report)
    
    return batch_results, report

# demo_ab_results = demonstrate_ab_testing()
```

## 实践练习

### 练习1：自定义评估指标

```python
class CustomMetricExercise:
    """自定义评估指标练习"""
    
    def __init__(self):
        pass
    
    def domain_specific_metric(self, example, prediction, trace=None):
        """实现领域特定的评估指标"""
        # TODO: 实现你的自定义指标
        # 例如：医疗领域的安全性评估、法律领域的准确性评估等
        pass
    
    def multi_dimensional_metric(self, example, prediction, trace=None):
        """实现多维度评估指标"""
        # TODO: 实现考虑多个维度的综合评估
        # 例如：准确性、流畅性、创新性的综合评分
        pass

# 练习任务：
# 1. 选择一个应用领域，设计领域特定的评估指标
# 2. 实现多维度的综合评估函数
# 3. 比较自定义指标与标准指标的差异
```

### 练习2：在线评估系统

```python
class OnlineEvaluationSystem:
    """在线评估系统练习"""
    
    def __init__(self):
        self.real_time_metrics = {}
        self.alert_thresholds = {}
    
    def setup_monitoring(self, metrics, thresholds):
        """设置监控指标和阈值"""
        # TODO: 实现实时监控设置
        pass
    
    def process_online_feedback(self, feedback_data):
        """处理在线反馈数据"""
        # TODO: 实现在线反馈处理
        pass
    
    def trigger_alerts(self, metric_name, current_value):
        """触发告警"""
        # TODO: 实现告警机制
        pass

# 练习任务：
# 1. 实现实时性能监控
# 2. 设计用户反馈收集机制
# 3. 构建自动告警系统
```

## 最佳实践

### 1. 数据质量保证

```python
def data_quality_guidelines():
    """数据质量保证指南"""
    
    guidelines = {
        '数据收集': [
            '确保数据来源的可靠性和多样性',
            '建立标准化的数据收集流程',
            '记录数据收集的上下文和元信息'
        ],
        
        '数据清洗': [
            '识别和处理重复数据',
            '检查数据完整性和一致性',
            '处理异常值和噪声数据'
        ],
        
        '数据标注': [
            '建立清晰的标注指南',
            '实施多人标注和质量检查',
            '定期评估标注质量'
        ],
        
        '数据分割': [
            '确保训练、验证、测试集的代表性',
            '避免数据泄露',
            '考虑时间序列数据的特殊性'
        ]
    }
    
    return guidelines

class DataQualityChecker:
    """数据质量检查器"""
    
    def __init__(self):
        self.quality_checks = [
            self.check_duplicates,
            self.check_completeness,
            self.check_consistency,
            self.check_distribution
        ]
    
    def run_quality_checks(self, examples: List[dspy.Example]) -> Dict:
        """运行质量检查"""
        results = {}
        
        for check in self.quality_checks:
            check_name = check.__name__
            try:
                result = check(examples)
                results[check_name] = result
            except Exception as e:
                results[check_name] = {'error': str(e)}
        
        return results
    
    def check_duplicates(self, examples: List[dspy.Example]) -> Dict:
        """检查重复数据"""
        # TODO: 实现重复检查逻辑
        pass
    
    def check_completeness(self, examples: List[dspy.Example]) -> Dict:
        """检查数据完整性"""
        # TODO: 实现完整性检查
        pass
    
    def check_consistency(self, examples: List[dspy.Example]) -> Dict:
        """检查数据一致性"""
        # TODO: 实现一致性检查
        pass
    
    def check_distribution(self, examples: List[dspy.Example]) -> Dict:
        """检查数据分布"""
        # TODO: 实现分布检查
        pass
```

### 2. 评估最佳实践

```python
def evaluation_best_practices():
    """评估最佳实践指南"""
    
    practices = {
        '指标选择': [
            '选择与业务目标一致的指标',
            '使用多个互补的评估指标',
            '考虑任务特定的评估标准'
        ],
        
        '测试集设计': [
            '确保测试集的代表性',
            '包含边界情况和困难样本',
            '定期更新测试集以反映数据漂移'
        ],
        
        '统计分析': [
            '报告置信区间而不仅仅是点估计',
            '进行显著性检验',
            '考虑多重比较问题'
        ],
        
        '结果解释': [
            '提供错误分析和案例研究',
            '考虑不同用户群体的表现',
            '分析模型的局限性'
        ]
    }
    
    return practices

class EvaluationReportGenerator:
    """评估报告生成器"""
    
    def generate_comprehensive_report(self, 
                                    evaluation_results: Dict,
                                    model_info: Dict = None,
                                    dataset_info: Dict = None) -> str:
        """生成综合评估报告"""
        
        report_sections = [
            self._generate_executive_summary(evaluation_results),
            self._generate_model_info_section(model_info),
            self._generate_dataset_info_section(dataset_info),
            self._generate_performance_metrics_section(evaluation_results),
            self._generate_error_analysis_section(evaluation_results),
            self._generate_recommendations_section(evaluation_results)
        ]
        
        return "\n\n".join(filter(None, report_sections))
    
    def _generate_executive_summary(self, results: Dict) -> str:
        """生成执行摘要"""
        # TODO: 实现摘要生成
        pass
    
    def _generate_model_info_section(self, model_info: Dict) -> str:
        """生成模型信息部分"""
        # TODO: 实现模型信息生成
        pass
    
    # ... 其他报告生成方法
```

通过本章的学习，你应该掌握了DSPy中数据处理和评估的完整方法。良好的数据处理和科学的评估体系是构建高质量AI系统的基础。在实际应用中，要根据具体的业务需求选择合适的评估指标，并建立完善的质量保证机制。