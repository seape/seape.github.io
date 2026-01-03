---
title: "第2章：深度学习基础与卷积神经网络"
date: 2025-10-02
icon: circle-dot
author: Haiyue
category:
  - YOLO
  - 图像识别
star: false
---
# 第2章：深度学习基础与卷积神经网络

## 学习目标
1. 掌握深度学习的基本原理
2. 理解卷积神经网络（CNN）的结构和工作原理
3. 熟悉常见的CNN架构（LeNet、AlexNet、VGG、ResNet等）
4. 了解反向传播算法和梯度下降优化

## 2.1 深度学习基本原理

### 2.1.1 从机器学习到深度学习

```python
import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import torchvision.transforms as transforms

class DeepLearningFoundation:
    def __init__(self):
        self.learning_paradigms = {
            "传统机器学习": {
                "特征工程": "手工设计特征",
                "模型": "浅层模型（SVM、决策树等）",
                "优点": ["可解释性强", "训练快速", "数据需求少"],
                "缺点": ["特征设计困难", "表达能力有限", "泛化能力差"]
            },
            "深度学习": {
                "特征工程": "自动学习特征表示",
                "模型": "多层神经网络",
                "优点": ["端到端学习", "强大表达能力", "自动特征提取"],
                "缺点": ["需要大量数据", "计算资源消耗大", "黑盒模型"]
            }
        }
    
    def compare_paradigms(self):
        """比较学习范式"""
        print("机器学习范式比较:")
        print("=" * 50)
        
        for paradigm, details in self.learning_paradigms.items():
            print(f"\n{paradigm}:")
            for key, value in details.items():
                if isinstance(value, list):
                    print(f"  {key}: {', '.join(value)}")
                else:
                    print(f"  {key}: {value}")
    
    def deep_learning_workflow(self):
        """深度学习工作流程"""
        workflow = {
            "1. 数据准备": [
                "数据收集和清理",
                "数据增强和预处理",
                "训练/验证/测试集划分"
            ],
            "2. 模型设计": [
                "网络架构设计",
                "损失函数选择",
                "优化器配置"
            ],
            "3. 模型训练": [
                "前向传播",
                "损失计算",
                "反向传播",
                "参数更新"
            ],
            "4. 模型评估": [
                "验证集性能评估",
                "过拟合检测",
                "超参数调优"
            ],
            "5. 模型部署": [
                "模型优化",
                "推理加速",
                "生产环境部署"
            ]
        }
        
        print("\n深度学习工作流程:")
        print("=" * 30)
        for stage, steps in workflow.items():
            print(f"\n{stage}:")
            for step in steps:
                print(f"  - {step}")
        
        return workflow

# 示例使用
foundation = DeepLearningFoundation()
foundation.compare_paradigms()
workflow = foundation.deep_learning_workflow()
```

### 2.1.2 神经元和多层感知器

```python
class NeuralNetworkBasics:
    def __init__(self):
        pass
    
    def artificial_neuron(self, inputs, weights, bias, activation='sigmoid'):
        """
        人工神经元模拟
        """
        # 线性组合
        z = np.dot(inputs, weights) + bias
        
        # 激活函数
        if activation == 'sigmoid':
            output = 1 / (1 + np.exp(-z))
        elif activation == 'tanh':
            output = np.tanh(z)
        elif activation == 'relu':
            output = np.maximum(0, z)
        elif activation == 'leaky_relu':
            output = np.where(z > 0, z, 0.01 * z)
        else:
            output = z  # linear activation
        
        return output, z
    
    def activation_functions(self):
        """常用激活函数"""
        x = np.linspace(-5, 5, 100)
        
        activations = {
            'Sigmoid': 1 / (1 + np.exp(-x)),
            'Tanh': np.tanh(x),
            'ReLU': np.maximum(0, x),
            'Leaky ReLU': np.where(x > 0, x, 0.01 * x),
            'ELU': np.where(x > 0, x, np.exp(x) - 1),
            'Swish': x * (1 / (1 + np.exp(-x)))
        }
        
        # 可视化激活函数
        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        axes = axes.flatten()
        
        for i, (name, y) in enumerate(activations.items()):
            axes[i].plot(x, y, linewidth=2)
            axes[i].set_title(name)
            axes[i].grid(True)
            axes[i].set_xlabel('x')
            axes[i].set_ylabel('f(x)')
        
        plt.tight_layout()
        return fig, activations
    
    def multilayer_perceptron(self):
        """多层感知器实现"""
        class MLP(nn.Module):
            def __init__(self, input_size, hidden_sizes, output_size, activation='relu'):
                super(MLP, self).__init__()
                
                layers = []
                prev_size = input_size
                
                # 隐藏层
                for hidden_size in hidden_sizes:
                    layers.append(nn.Linear(prev_size, hidden_size))
                    
                    if activation == 'relu':
                        layers.append(nn.ReLU())
                    elif activation == 'sigmoid':
                        layers.append(nn.Sigmoid())
                    elif activation == 'tanh':
                        layers.append(nn.Tanh())
                    
                    prev_size = hidden_size
                
                # 输出层
                layers.append(nn.Linear(prev_size, output_size))
                
                self.network = nn.Sequential(*layers)
            
            def forward(self, x):
                return self.network(x)
        
        return MLP
    
    def gradient_descent_demo(self):
        """梯度下降演示"""
        # 简单的二次函数优化
        def quadratic_function(x):
            return x**2 + 2*x + 1
        
        def gradient(x):
            return 2*x + 2
        
        # 梯度下降过程
        x_history = []
        loss_history = []
        
        x = 5.0  # 初始点
        learning_rate = 0.1
        
        for i in range(20):
            loss = quadratic_function(x)
            grad = gradient(x)
            
            x_history.append(x)
            loss_history.append(loss)
            
            # 参数更新
            x = x - learning_rate * grad
        
        # 可视化优化过程
        x_range = np.linspace(-3, 6, 100)
        y_range = quadratic_function(x_range)
        
        plt.figure(figsize=(12, 5))
        
        plt.subplot(1, 2, 1)
        plt.plot(x_range, y_range, 'b-', label='f(x) = x² + 2x + 1')
        plt.plot(x_history, [quadratic_function(x) for x in x_history], 
                'ro-', label='Optimization Path')
        plt.xlabel('x')
        plt.ylabel('f(x)')
        plt.title('Gradient Descent Optimization')
        plt.legend()
        plt.grid(True)
        
        plt.subplot(1, 2, 2)
        plt.plot(loss_history, 'r-o')
        plt.xlabel('Iteration')
        plt.ylabel('Loss')
        plt.title('Loss vs Iteration')
        plt.grid(True)
        
        plt.tight_layout()
        
        return x_history, loss_history

# 示例使用
nn_basics = NeuralNetworkBasics()

# 演示神经元
inputs = np.array([1, 2, 3])
weights = np.array([0.5, -0.2, 0.1])
bias = 0.3

output, z = nn_basics.artificial_neuron(inputs, weights, bias, 'relu')
print(f"神经元输出: {output:.3f}")

# 激活函数可视化
# fig, activations = nn_basics.activation_functions()
# plt.show()

# 创建MLP
MLP = nn_basics.multilayer_perceptron()
model = MLP(input_size=784, hidden_sizes=[128, 64], output_size=10)
print(f"MLP架构:\n{model}")

# 梯度下降演示
x_hist, loss_hist = nn_basics.gradient_descent_demo()
print(f"最终x值: {x_hist[-1]:.3f}")
```

## 2.2 卷积神经网络基础

### 2.2.1 卷积操作原理

```python
class ConvolutionBasics:
    def __init__(self):
        pass
    
    def convolution_2d(self, input_image, kernel, stride=1, padding=0):
        """
        2D卷积操作实现
        """
        # 添加padding
        if padding > 0:
            input_image = np.pad(input_image, padding, mode='constant')
        
        input_h, input_w = input_image.shape
        kernel_h, kernel_w = kernel.shape
        
        # 计算输出尺寸
        output_h = (input_h - kernel_h) // stride + 1
        output_w = (input_w - kernel_w) // stride + 1
        
        output = np.zeros((output_h, output_w))
        
        # 执行卷积
        for i in range(0, output_h):
            for j in range(0, output_w):
                h_start = i * stride
                h_end = h_start + kernel_h
                w_start = j * stride
                w_end = w_start + kernel_w
                
                # 逐元素相乘并求和
                output[i, j] = np.sum(input_image[h_start:h_end, w_start:w_end] * kernel)
        
        return output
    
    def common_kernels(self):
        """常用卷积核"""
        kernels = {
            'Identity': np.array([[0, 0, 0],
                                [0, 1, 0],
                                [0, 0, 0]]),
            
            'Edge Detection (Horizontal)': np.array([[-1, -1, -1],
                                                   [ 0,  0,  0],
                                                   [ 1,  1,  1]]),
            
            'Edge Detection (Vertical)': np.array([[-1, 0, 1],
                                                 [-1, 0, 1],
                                                 [-1, 0, 1]]),
            
            'Sharpen': np.array([[ 0, -1,  0],
                               [-1,  5, -1],
                               [ 0, -1,  0]]),
            
            'Blur': np.array([[1, 1, 1],
                            [1, 1, 1],
                            [1, 1, 1]]) / 9,
            
            'Gaussian Blur': np.array([[1, 2, 1],
                                     [2, 4, 2],
                                     [1, 2, 1]]) / 16
        }
        
        return kernels
    
    def visualize_convolution(self, input_image, kernel, title="Convolution"):
        """可视化卷积过程"""
        output = self.convolution_2d(input_image, kernel, padding=1)
        
        fig, axes = plt.subplots(1, 3, figsize=(15, 5))
        
        # 输入图像
        axes[0].imshow(input_image, cmap='gray')
        axes[0].set_title('Input Image')
        axes[0].axis('off')
        
        # 卷积核
        im = axes[1].imshow(kernel, cmap='RdBu')
        axes[1].set_title('Kernel')
        for i in range(kernel.shape[0]):
            for j in range(kernel.shape[1]):
                axes[1].text(j, i, f'{kernel[i,j]:.1f}', 
                           ha='center', va='center', fontsize=12)
        
        # 输出特征图
        axes[2].imshow(output, cmap='gray')
        axes[2].set_title('Output Feature Map')
        axes[2].axis('off')
        
        plt.tight_layout()
        return fig, output
    
    def convolution_properties(self):
        """卷积的重要性质"""
        properties = {
            "平移不变性": {
                "定义": "输入平移，输出也相应平移",
                "意义": "对物体位置变化具有鲁棒性",
                "应用": "目标检测中物体可以出现在图像任意位置"
            },
            "参数共享": {
                "定义": "同一卷积核在整个图像上重复使用",
                "意义": "大幅减少参数数量",
                "应用": "使网络可以处理不同尺寸的输入"
            },
            "局部连接": {
                "定义": "每个神经元只与局部区域连接",
                "意义": "保持空间结构信息",
                "应用": "提取局部特征，如边缘、纹理等"
            },
            "层次特征": {
                "定义": "浅层提取基础特征，深层提取复杂特征",
                "意义": "构建特征层次结构",
                "应用": "从边缘到形状到物体的特征提取"
            }
        }
        
        print("卷积的重要性质:")
        print("=" * 40)
        for prop, details in properties.items():
            print(f"\n{prop}:")
            for key, value in details.items():
                print(f"  {key}: {value}")
        
        return properties

# 示例使用
conv_basics = ConvolutionBasics()

# 创建示例图像
input_img = np.array([[1, 2, 3, 0, 1],
                     [0, 1, 2, 3, 0],
                     [0, 0, 1, 2, 3],
                     [1, 0, 0, 1, 2],
                     [2, 1, 0, 0, 1]])

# 获取常用卷积核
kernels = conv_basics.common_kernels()

# 应用边缘检测卷积核
edge_kernel = kernels['Edge Detection (Horizontal)']
output = conv_basics.convolution_2d(input_img, edge_kernel, padding=1)

print("输入图像:")
print(input_img)
print(f"\n卷积核 (Edge Detection):")
print(edge_kernel)
print(f"\n输出特征图:")
print(output)

# 卷积性质
properties = conv_basics.convolution_properties()
```

### 2.2.2 池化操作和其他操作

```python
class CNNOperations:
    def __init__(self):
        pass
    
    def max_pooling(self, input_feature, pool_size=2, stride=2):
        """最大池化"""
        input_h, input_w = input_feature.shape
        output_h = (input_h - pool_size) // stride + 1
        output_w = (input_w - pool_size) // stride + 1
        
        output = np.zeros((output_h, output_w))
        
        for i in range(output_h):
            for j in range(output_w):
                h_start = i * stride
                h_end = h_start + pool_size
                w_start = j * stride
                w_end = w_start + pool_size
                
                # 取最大值
                output[i, j] = np.max(input_feature[h_start:h_end, w_start:w_end])
        
        return output
    
    def average_pooling(self, input_feature, pool_size=2, stride=2):
        """平均池化"""
        input_h, input_w = input_feature.shape
        output_h = (input_h - pool_size) // stride + 1
        output_w = (input_w - pool_size) // stride + 1
        
        output = np.zeros((output_h, output_w))
        
        for i in range(output_h):
            for j in range(output_w):
                h_start = i * stride
                h_end = h_start + pool_size
                w_start = j * stride
                w_end = w_start + pool_size
                
                # 取平均值
                output[i, j] = np.mean(input_feature[h_start:h_end, w_start:w_end])
        
        return output
    
    def batch_normalization_concept(self):
        """批归一化概念"""
        class BatchNormalization:
            def __init__(self, num_features, eps=1e-5, momentum=0.1):
                self.num_features = num_features
                self.eps = eps
                self.momentum = momentum
                
                # 可学习参数
                self.gamma = np.ones(num_features)  # 缩放参数
                self.beta = np.zeros(num_features)   # 平移参数
                
                # 移动平均
                self.running_mean = np.zeros(num_features)
                self.running_var = np.ones(num_features)
            
            def forward(self, x, training=True):
                if training:
                    # 计算批次统计量
                    batch_mean = np.mean(x, axis=0)
                    batch_var = np.var(x, axis=0)
                    
                    # 更新移动平均
                    self.running_mean = (1 - self.momentum) * self.running_mean + self.momentum * batch_mean
                    self.running_var = (1 - self.momentum) * self.running_var + self.momentum * batch_var
                    
                    # 归一化
                    x_norm = (x - batch_mean) / np.sqrt(batch_var + self.eps)
                else:
                    # 推理时使用移动平均
                    x_norm = (x - self.running_mean) / np.sqrt(self.running_var + self.eps)
                
                # 缩放和平移
                output = self.gamma * x_norm + self.beta
                return output
        
        return BatchNormalization
    
    def dropout_concept(self):
        """Dropout概念"""
        def dropout(x, drop_rate=0.5, training=True):
            if not training:
                return x
            
            # 生成随机掩码
            keep_prob = 1 - drop_rate
            mask = np.random.rand(*x.shape) < keep_prob
            
            # 应用掩码并缩放
            output = x * mask / keep_prob
            return output
        
        return dropout
    
    def receptive_field_calculation(self):
        """感受野计算"""
        def calculate_receptive_field(layers_info):
            """
            计算CNN中每层的感受野大小
            layers_info: [(layer_type, kernel_size, stride, padding), ...]
            """
            rf = 1  # 初始感受野
            jump = 1  # 跳跃距离
            
            results = [{'layer': 'input', 'receptive_field': rf, 'jump': jump}]
            
            for i, (layer_type, kernel_size, stride, padding) in enumerate(layers_info):
                if layer_type in ['conv', 'pool']:
                    # 更新感受野和跳跃距离
                    rf = rf + (kernel_size - 1) * jump
                    jump = jump * stride
                
                results.append({
                    'layer': f'{layer_type}_{i+1}',
                    'kernel_size': kernel_size,
                    'stride': stride,
                    'receptive_field': rf,
                    'jump': jump
                })
            
            return results
        
        # 示例：典型CNN架构的感受野计算
        example_layers = [
            ('conv', 3, 1, 1),  # 3x3卷积，stride=1
            ('pool', 2, 2, 0),  # 2x2池化，stride=2
            ('conv', 3, 1, 1),  # 3x3卷积，stride=1
            ('conv', 3, 1, 1),  # 3x3卷积，stride=1
            ('pool', 2, 2, 0),  # 2x2池化，stride=2
        ]
        
        rf_results = calculate_receptive_field(example_layers)
        
        print("感受野计算结果:")
        print("-" * 50)
        for result in rf_results:
            layer = result['layer']
            rf = result['receptive_field']
            jump = result['jump']
            
            if 'kernel_size' in result:
                kernel = result['kernel_size']
                stride = result['stride']
                print(f"{layer:10} | Kernel:{kernel} Stride:{stride} | RF:{rf:2d} Jump:{jump}")
            else:
                print(f"{layer:10} | {'':15} | RF:{rf:2d} Jump:{jump}")
        
        return rf_results

# 示例使用
cnn_ops = CNNOperations()

# 池化操作示例
test_feature = np.array([[1, 3, 2, 4],
                        [5, 6, 1, 8],
                        [2, 1, 4, 3],
                        [7, 2, 6, 5]])

max_pooled = cnn_ops.max_pooling(test_feature, pool_size=2, stride=2)
avg_pooled = cnn_ops.average_pooling(test_feature, pool_size=2, stride=2)

print("原始特征图:")
print(test_feature)
print(f"\n最大池化结果 (2x2):")
print(max_pooled)
print(f"\n平均池化结果 (2x2):")
print(avg_pooled)

# 感受野计算
rf_calculation = cnn_ops.receptive_field_calculation()

# 批归一化示例
BatchNorm = cnn_ops.batch_normalization_concept()
bn = BatchNorm(num_features=3)

# 示例数据 (batch_size=4, features=3)
test_data = np.array([[1.0, 2.0, 3.0],
                     [4.0, 5.0, 6.0],
                     [7.0, 8.0, 9.0],
                     [2.0, 3.0, 4.0]])

normalized = bn.forward(test_data, training=True)
print(f"\n批归一化前:")
print(test_data)
print(f"\n批归一化后:")
print(normalized)
```

## 2.3 经典CNN架构

### 2.3.1 LeNet-5

```python
class LeNet5:
    def __init__(self):
        self.architecture_info = {
            "年份": "1998",
            "作者": "Yann LeCun",
            "应用": "手写数字识别",
            "特点": ["首个成功的CNN", "确立了CNN基本结构", "卷积-池化-全连接模式"]
        }
    
    def build_lenet5(self, num_classes=10):
        """构建LeNet-5模型"""
        class LeNet5Model(nn.Module):
            def __init__(self, num_classes):
                super(LeNet5Model, self).__init__()
                
                # 特征提取层
                self.features = nn.Sequential(
                    # C1: 卷积层
                    nn.Conv2d(1, 6, kernel_size=5, stride=1),  # 32x32 -> 28x28
                    nn.Tanh(),
                    
                    # S2: 池化层
                    nn.AvgPool2d(kernel_size=2, stride=2),     # 28x28 -> 14x14
                    
                    # C3: 卷积层
                    nn.Conv2d(6, 16, kernel_size=5, stride=1), # 14x14 -> 10x10
                    nn.Tanh(),
                    
                    # S4: 池化层
                    nn.AvgPool2d(kernel_size=2, stride=2),     # 10x10 -> 5x5
                    
                    # C5: 卷积层（等价于全连接）
                    nn.Conv2d(16, 120, kernel_size=5, stride=1), # 5x5 -> 1x1
                    nn.Tanh()
                )
                
                # 分类层
                self.classifier = nn.Sequential(
                    nn.Linear(120, 84),
                    nn.Tanh(),
                    nn.Linear(84, num_classes)
                )
            
            def forward(self, x):
                x = self.features(x)
                x = x.view(x.size(0), -1)  # 展平
                x = self.classifier(x)
                return x
        
        return LeNet5Model(num_classes)
    
    def architecture_analysis(self):
        """架构分析"""
        layers = {
            "输入层": {
                "尺寸": "32x32x1",
                "说明": "单通道灰度图像"
            },
            "C1卷积": {
                "参数": "6个5x5卷积核",
                "输出": "28x28x6",
                "参数量": "(5*5+1)*6 = 156"
            },
            "S2池化": {
                "操作": "2x2平均池化",
                "输出": "14x14x6",
                "参数量": "0"
            },
            "C3卷积": {
                "参数": "16个5x5卷积核",
                "输出": "10x10x16",
                "参数量": "(5*5*6+1)*16 = 2416"
            },
            "S4池化": {
                "操作": "2x2平均池化",
                "输出": "5x5x16",
                "参数量": "0"
            },
            "C5卷积": {
                "参数": "120个5x5x16卷积核",
                "输出": "1x1x120",
                "参数量": "(5*5*16+1)*120 = 48120"
            },
            "F6全连接": {
                "参数": "120->84",
                "输出": "84",
                "参数量": "(120+1)*84 = 10164"
            },
            "输出层": {
                "参数": "84->10",
                "输出": "10",
                "参数量": "(84+1)*10 = 850"
            }
        }
        
        total_params = 156 + 2416 + 48120 + 10164 + 850
        
        print("LeNet-5 架构详细分析:")
        print("=" * 50)
        for layer, info in layers.items():
            print(f"\n{layer}:")
            for key, value in info.items():
                print(f"  {key}: {value}")
        
        print(f"\n总参数量: {total_params:,}")
        
        return layers, total_params

# 使用示例
lenet = LeNet5()
model = lenet.build_lenet5(num_classes=10)

print("LeNet-5 模型结构:")
print(model)

# 架构分析
layers_analysis, total_params = lenet.architecture_analysis()

# 计算一个样本的前向传播
sample_input = torch.randn(1, 1, 32, 32)
with torch.no_grad():
    output = model(sample_input)
    print(f"\n输入尺寸: {sample_input.shape}")
    print(f"输出尺寸: {output.shape}")
    print(f"输出值: {output.squeeze()}")
```

### 2.3.2 AlexNet

```python
class AlexNet:
    def __init__(self):
        self.architecture_info = {
            "年份": "2012",
            "作者": "Alex Krizhevsky",
            "突破": "ImageNet竞赛获胜，深度学习复兴",
            "创新点": ["ReLU激活", "Dropout", "数据增强", "GPU训练"]
        }
    
    def build_alexnet(self, num_classes=1000):
        """构建AlexNet模型"""
        class AlexNetModel(nn.Module):
            def __init__(self, num_classes):
                super(AlexNetModel, self).__init__()
                
                self.features = nn.Sequential(
                    # Conv1: 96个11x11卷积核，stride=4
                    nn.Conv2d(3, 96, kernel_size=11, stride=4, padding=2),
                    nn.ReLU(inplace=True),
                    nn.MaxPool2d(kernel_size=3, stride=2),
                    
                    # Conv2: 256个5x5卷积核
                    nn.Conv2d(96, 256, kernel_size=5, padding=2),
                    nn.ReLU(inplace=True),
                    nn.MaxPool2d(kernel_size=3, stride=2),
                    
                    # Conv3: 384个3x3卷积核
                    nn.Conv2d(256, 384, kernel_size=3, padding=1),
                    nn.ReLU(inplace=True),
                    
                    # Conv4: 384个3x3卷积核
                    nn.Conv2d(384, 384, kernel_size=3, padding=1),
                    nn.ReLU(inplace=True),
                    
                    # Conv5: 256个3x3卷积核
                    nn.Conv2d(384, 256, kernel_size=3, padding=1),
                    nn.ReLU(inplace=True),
                    nn.MaxPool2d(kernel_size=3, stride=2),
                )
                
                self.avgpool = nn.AdaptiveAvgPool2d((6, 6))
                
                self.classifier = nn.Sequential(
                    nn.Dropout(0.5),
                    nn.Linear(256 * 6 * 6, 4096),
                    nn.ReLU(inplace=True),
                    nn.Dropout(0.5),
                    nn.Linear(4096, 4096),
                    nn.ReLU(inplace=True),
                    nn.Linear(4096, num_classes),
                )
            
            def forward(self, x):
                x = self.features(x)
                x = self.avgpool(x)
                x = torch.flatten(x, 1)
                x = self.classifier(x)
                return x
        
        return AlexNetModel(num_classes)
    
    def key_innovations(self):
        """关键创新点分析"""
        innovations = {
            "ReLU激活函数": {
                "替代": "Sigmoid/Tanh",
                "优势": ["缓解梯度消失", "计算简单", "稀疏激活"],
                "影响": "成为深度网络标准激活函数"
            },
            "Dropout正则化": {
                "位置": "全连接层",
                "作用": "防止过拟合",
                "机制": "随机置零神经元",
                "dropout_rate": 0.5
            },
            "数据增强": {
                "方法": ["随机裁剪", "水平翻转", "颜色抖动"],
                "效果": "增加数据多样性，提升泛化能力",
                "重要性": "现代训练必备技术"
            },
            "GPU并行训练": {
                "硬件": "NVIDIA GTX 580",
                "策略": "模型并行 + 数据并行",
                "意义": "开启深度学习GPU时代"
            },
            "局部响应归一化": {
                "位置": "卷积层后",
                "作用": "增强泛化能力",
                "现状": "已被Batch Normalization替代"
            }
        }
        
        print("AlexNet 关键创新点:")
        print("=" * 40)
        for innovation, details in innovations.items():
            print(f"\n{innovation}:")
            for key, value in details.items():
                if isinstance(value, list):
                    print(f"  {key}: {', '.join(value)}")
                else:
                    print(f"  {key}: {value}")
        
        return innovations
    
    def performance_analysis(self):
        """性能分析"""
        performance = {
            "ImageNet2012结果": {
                "Top-1错误率": "15.3%",
                "Top-5错误率": "15.3%",
                "排名": "第1名",
                "领先优势": "相比第二名降低10.9个百分点"
            },
            "模型规模": {
                "参数数量": "60M",
                "模型大小": "240MB",
                "FLOPs": "714M"
            },
            "训练细节": {
                "训练时间": "6天",
                "GPU数量": "2块GTX 580",
                "批大小": "128",
                "学习率": "0.01"
            }
        }
        
        return performance

# 使用示例
alexnet = AlexNet()
model = alexnet.build_alexnet(num_classes=1000)

# 打印模型信息
def count_parameters(model):
    return sum(p.numel() for p in model.parameters() if p.requires_grad)

print("AlexNet 模型信息:")
print(f"总参数量: {count_parameters(model):,}")

# 关键创新分析
innovations = alexnet.key_innovations()

# 性能分析
performance = alexnet.performance_analysis()
print("\nAlexNet 性能表现:")
for category, metrics in performance.items():
    print(f"\n{category}:")
    for metric, value in metrics.items():
        print(f"  {metric}: {value}")

# 测试前向传播
sample_input = torch.randn(1, 3, 224, 224)
with torch.no_grad():
    output = model(sample_input)
    print(f"\n输入尺寸: {sample_input.shape}")
    print(f"输出尺寸: {output.shape}")
```

### 2.3.3 VGG网络

```python
class VGGNet:
    def __init__(self):
        self.architecture_info = {
            "年份": "2014",
            "作者": "Karen Simonyan & Andrew Zisserman",
            "贡献": "证明网络深度的重要性",
            "特点": ["小卷积核(3x3)", "深层网络", "简单架构"]
        }
    
    def build_vgg(self, vgg_type='VGG16', num_classes=1000):
        """构建VGG模型"""
        
        # VGG配置
        cfg = {
            'VGG11': [64, 'M', 128, 'M', 256, 256, 'M', 512, 512, 'M', 512, 512, 'M'],
            'VGG13': [64, 64, 'M', 128, 128, 'M', 256, 256, 'M', 512, 512, 'M', 512, 512, 'M'],
            'VGG16': [64, 64, 'M', 128, 128, 'M', 256, 256, 256, 'M', 512, 512, 512, 'M', 512, 512, 512, 'M'],
            'VGG19': [64, 64, 'M', 128, 128, 'M', 256, 256, 256, 256, 'M', 512, 512, 512, 512, 'M', 512, 512, 512, 512, 'M'],
        }
        
        class VGGModel(nn.Module):
            def __init__(self, vgg_type, num_classes):
                super(VGGModel, self).__init__()
                self.features = self._make_layers(cfg[vgg_type])
                self.avgpool = nn.AdaptiveAvgPool2d((7, 7))
                self.classifier = nn.Sequential(
                    nn.Linear(512 * 7 * 7, 4096),
                    nn.ReLU(True),
                    nn.Dropout(),
                    nn.Linear(4096, 4096),
                    nn.ReLU(True),
                    nn.Dropout(),
                    nn.Linear(4096, num_classes),
                )
            
            def _make_layers(self, cfg):
                layers = []
                in_channels = 3
                for v in cfg:
                    if v == 'M':
                        layers += [nn.MaxPool2d(kernel_size=2, stride=2)]
                    else:
                        conv2d = nn.Conv2d(in_channels, v, kernel_size=3, padding=1)
                        layers += [conv2d, nn.ReLU(inplace=True)]
                        in_channels = v
                return nn.Sequential(*layers)
            
            def forward(self, x):
                x = self.features(x)
                x = self.avgpool(x)
                x = torch.flatten(x, 1)
                x = self.classifier(x)
                return x
        
        return VGGModel(vgg_type, num_classes)
    
    def architecture_comparison(self):
        """不同VGG架构比较"""
        architectures = {
            'VGG11': {
                '卷积层数': 8,
                '全连接层数': 3,
                '总层数': 11,
                '参数量': '132M',
                '特点': '最轻量的VGG'
            },
            'VGG13': {
                '卷积层数': 10,
                '全连接层数': 3,
                '总层数': 13,
                '参数量': '133M',
                '特点': '在VGG11基础上增加卷积层'
            },
            'VGG16': {
                '卷积层数': 13,
                '全连接层数': 3,
                '总层数': 16,
                '参数量': '138M',
                '特点': '最常用的VGG版本'
            },
            'VGG19': {
                '卷积层数': 16,
                '全连接层数': 3,
                '总层数': 19,
                '参数量': '144M',
                '特点': '最深的VGG，性能略有提升'
            }
        }
        
        print("VGG 架构比较:")
        print("=" * 60)
        
        for arch, info in architectures.items():
            print(f"\n{arch}:")
            for key, value in info.items():
                print(f"  {key}: {value}")
        
        return architectures
    
    def design_principles(self):
        """设计原则分析"""
        principles = {
            "3x3卷积核": {
                "原理": "用多个3x3卷积替代大卷积核",
                "优势": [
                    "参数更少：2个3x3 < 1个5x5",
                    "非线性更强：每层都有ReLU",
                    "感受野相同：两个3x3 = 一个5x5"
                ],
                "计算": "3x3x2 = 18 < 5x5 = 25"
            },
            "深度递增": {
                "策略": "逐渐增加网络深度",
                "效果": "提升表达能力和性能",
                "验证": "VGG11 < VGG13 < VGG16 < VGG19"
            },
            "通道翻倍": {
                "模式": "64->128->256->512->512",
                "原理": "随着空间尺寸减小，增加特征维度",
                "平衡": "计算量和特征表达的平衡"
            },
            "统一架构": {
                "特点": "所有卷积都是3x3，所有池化都是2x2",
                "好处": "架构简单，易于理解和实现",
                "影响": "建立了CNN设计规范"
            }
        }
        
        print("\nVGG 设计原则:")
        print("=" * 40)
        
        for principle, details in principles.items():
            print(f"\n{principle}:")
            for key, value in details.items():
                if isinstance(value, list):
                    print(f"  {key}:")
                    for item in value:
                        print(f"    - {item}")
                else:
                    print(f"  {key}: {value}")
        
        return principles
    
    def receptive_field_analysis(self):
        """感受野分析"""
        # VGG16为例
        layers = [
            ("conv1_1", 3, 1, 1),
            ("conv1_2", 3, 1, 1),
            ("pool1", 2, 2, 0),
            ("conv2_1", 3, 1, 1),
            ("conv2_2", 3, 1, 1),
            ("pool2", 2, 2, 0),
            ("conv3_1", 3, 1, 1),
            ("conv3_2", 3, 1, 1),
            ("conv3_3", 3, 1, 1),
            ("pool3", 2, 2, 0),
            ("conv4_1", 3, 1, 1),
            ("conv4_2", 3, 1, 1),
            ("conv4_3", 3, 1, 1),
            ("pool4", 2, 2, 0),
            ("conv5_1", 3, 1, 1),
            ("conv5_2", 3, 1, 1),
            ("conv5_3", 3, 1, 1),
            ("pool5", 2, 2, 0)
        ]
        
        rf = 1
        jump = 1
        results = []
        
        for name, kernel, stride, padding in layers:
            if 'conv' in name:
                rf = rf + (kernel - 1) * jump
            elif 'pool' in name:
                rf = rf + (kernel - 1) * jump
                jump = jump * stride
            
            results.append({
                'layer': name,
                'receptive_field': rf,
                'jump': jump
            })
        
        print("\nVGG16 感受野分析:")
        print("-" * 40)
        for result in results:
            print(f"{result['layer']:10} | RF: {result['receptive_field']:3d} | Jump: {result['jump']:2d}")
        
        return results

# 使用示例
vgg = VGGNet()

# 构建VGG16
model_vgg16 = vgg.build_vgg('VGG16', num_classes=1000)

print("VGG16 模型结构:")
print(model_vgg16)

# 架构比较
arch_comparison = vgg.architecture_comparison()

# 设计原则
design_principles = vgg.design_principles()

# 感受野分析
rf_analysis = vgg.receptive_field_analysis()

# 参数统计
def detailed_parameter_count(model):
    total = 0
    for name, param in model.named_parameters():
        if param.requires_grad:
            num_params = param.numel()
            total += num_params
            print(f"{name:30} | Shape: {str(list(param.shape)):20} | Params: {num_params:,}")
    
    print(f"\n总参数量: {total:,}")
    return total

print(f"\nVGG16 详细参数统计:")
print("-" * 80)
total_params = detailed_parameter_count(model_vgg16)
```

### 2.3.4 ResNet残差网络

```python
class ResNet:
    def __init__(self):
        self.architecture_info = {
            "年份": "2015",
            "作者": "Kaiming He et al.",
            "突破": "解决深层网络退化问题",
            "核心": "残差连接(Skip Connection)"
        }
    
    def residual_block_concept(self):
        """残差块概念解释"""
        concept = {
            "传统网络问题": {
                "现象": "网络越深，性能反而下降",
                "原因": ["梯度消失", "梯度爆炸", "优化困难"],
                "例子": "56层网络比20层网络性能差"
            },
            "残差学习": {
                "思想": "学习残差函数而非直接映射",
                "公式": "H(x) = F(x) + x",
                "优势": "即使F(x)=0，也有恒等映射x"
            },
            "跳跃连接": {
                "机制": "输入直接加到输出上",
                "作用": ["缓解梯度消失", "促进信息流动", "使网络更容易优化"],
                "实现": "element-wise addition"
            }
        }
        
        print("ResNet 残差块概念:")
        print("=" * 40)
        
        for key, details in concept.items():
            print(f"\n{key}:")
            for k, v in details.items():
                if isinstance(v, list):
                    print(f"  {k}:")
                    for item in v:
                        print(f"    - {item}")
                else:
                    print(f"  {k}: {v}")
        
        return concept
    
    def build_resnet(self, layers=[3, 4, 6, 3], num_classes=1000):
        """构建ResNet模型"""
        
        class BasicBlock(nn.Module):
            expansion = 1
            
            def __init__(self, in_planes, planes, stride=1):
                super(BasicBlock, self).__init__()
                self.conv1 = nn.Conv2d(in_planes, planes, kernel_size=3, 
                                     stride=stride, padding=1, bias=False)
                self.bn1 = nn.BatchNorm2d(planes)
                self.conv2 = nn.Conv2d(planes, planes, kernel_size=3, 
                                     stride=1, padding=1, bias=False)
                self.bn2 = nn.BatchNorm2d(planes)
                
                self.shortcut = nn.Sequential()
                if stride != 1 or in_planes != self.expansion * planes:
                    self.shortcut = nn.Sequential(
                        nn.Conv2d(in_planes, self.expansion * planes,
                                kernel_size=1, stride=stride, bias=False),
                        nn.BatchNorm2d(self.expansion * planes)
                    )
            
            def forward(self, x):
                out = torch.relu(self.bn1(self.conv1(x)))
                out = self.bn2(self.conv2(out))
                out += self.shortcut(x)  # 残差连接
                out = torch.relu(out)
                return out
        
        class Bottleneck(nn.Module):
            expansion = 4
            
            def __init__(self, in_planes, planes, stride=1):
                super(Bottleneck, self).__init__()
                self.conv1 = nn.Conv2d(in_planes, planes, kernel_size=1, bias=False)
                self.bn1 = nn.BatchNorm2d(planes)
                self.conv2 = nn.Conv2d(planes, planes, kernel_size=3, 
                                     stride=stride, padding=1, bias=False)
                self.bn2 = nn.BatchNorm2d(planes)
                self.conv3 = nn.Conv2d(planes, self.expansion * planes, 
                                     kernel_size=1, bias=False)
                self.bn3 = nn.BatchNorm2d(self.expansion * planes)
                
                self.shortcut = nn.Sequential()
                if stride != 1 or in_planes != self.expansion * planes:
                    self.shortcut = nn.Sequential(
                        nn.Conv2d(in_planes, self.expansion * planes,
                                kernel_size=1, stride=stride, bias=False),
                        nn.BatchNorm2d(self.expansion * planes)
                    )
            
            def forward(self, x):
                out = torch.relu(self.bn1(self.conv1(x)))
                out = torch.relu(self.bn2(self.conv2(out)))
                out = self.bn3(self.conv3(out))
                out += self.shortcut(x)  # 残差连接
                out = torch.relu(out)
                return out
        
        class ResNetModel(nn.Module):
            def __init__(self, block, layers, num_classes):
                super(ResNetModel, self).__init__()
                self.in_planes = 64
                
                # 初始卷积层
                self.conv1 = nn.Conv2d(3, 64, kernel_size=7, stride=2, 
                                     padding=3, bias=False)
                self.bn1 = nn.BatchNorm2d(64)
                self.maxpool = nn.MaxPool2d(kernel_size=3, stride=2, padding=1)
                
                # 残差块组
                self.layer1 = self._make_layer(block, 64, layers[0], stride=1)
                self.layer2 = self._make_layer(block, 128, layers[1], stride=2)
                self.layer3 = self._make_layer(block, 256, layers[2], stride=2)
                self.layer4 = self._make_layer(block, 512, layers[3], stride=2)
                
                # 全局平均池化和分类器
                self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
                self.fc = nn.Linear(512 * block.expansion, num_classes)
            
            def _make_layer(self, block, planes, blocks, stride):
                strides = [stride] + [1] * (blocks - 1)
                layers = []
                for stride in strides:
                    layers.append(block(self.in_planes, planes, stride))
                    self.in_planes = planes * block.expansion
                return nn.Sequential(*layers)
            
            def forward(self, x):
                x = torch.relu(self.bn1(self.conv1(x)))
                x = self.maxpool(x)
                
                x = self.layer1(x)
                x = self.layer2(x)
                x = self.layer3(x)
                x = self.layer4(x)
                
                x = self.avgpool(x)
                x = torch.flatten(x, 1)
                x = self.fc(x)
                return x
        
        # 根据层数选择块类型
        if layers == [2, 2, 2, 2]:  # ResNet18
            return ResNetModel(BasicBlock, layers, num_classes)
        elif layers == [3, 4, 6, 3]:  # ResNet34
            return ResNetModel(BasicBlock, layers, num_classes)
        else:  # ResNet50/101/152 使用Bottleneck
            return ResNetModel(Bottleneck, layers, num_classes)
    
    def resnet_variants(self):
        """ResNet变种"""
        variants = {
            "ResNet18": {
                "结构": [2, 2, 2, 2],
                "块类型": "BasicBlock",
                "参数量": "11.7M",
                "特点": "轻量级，适合资源受限环境"
            },
            "ResNet34": {
                "结构": [3, 4, 6, 3],
                "块类型": "BasicBlock", 
                "参数量": "21.8M",
                "特点": "中等规模，性能平衡"
            },
            "ResNet50": {
                "结构": [3, 4, 6, 3],
                "块类型": "Bottleneck",
                "参数量": "25.6M",
                "特点": "经典版本，广泛使用"
            },
            "ResNet101": {
                "结构": [3, 4, 23, 3],
                "块类型": "Bottleneck",
                "参数量": "44.5M",
                "特点": "更深网络，更好性能"
            },
            "ResNet152": {
                "结构": [3, 8, 36, 3],
                "块类型": "Bottleneck",
                "参数量": "60.2M",
                "特点": "最深版本，ImageNet最佳"
            }
        }
        
        print("ResNet 变种比较:")
        print("=" * 50)
        
        for variant, info in variants.items():
            print(f"\n{variant}:")
            for key, value in info.items():
                print(f"  {key}: {value}")
        
        return variants
    
    def gradient_flow_analysis(self):
        """梯度流动分析"""
        def simulate_gradient_flow():
            # 模拟不同深度下的梯度流动
            depths = [10, 20, 50, 100, 152]
            
            # 普通网络的梯度衰减（简化模拟）
            vanilla_gradients = []
            resnet_gradients = []
            
            for depth in depths:
                # 假设每层梯度衰减率
                vanilla_decay = 0.9 ** depth
                resnet_decay = 0.95 ** depth  # 残差连接缓解衰减
                
                vanilla_gradients.append(vanilla_decay)
                resnet_gradients.append(resnet_decay)
            
            # 可视化梯度流动
            plt.figure(figsize=(10, 6))
            plt.plot(depths, vanilla_gradients, 'r-o', label='Vanilla CNN')
            plt.plot(depths, resnet_gradients, 'b-o', label='ResNet')
            plt.xlabel('Network Depth')
            plt.ylabel('Gradient Magnitude (simulated)')
            plt.title('Gradient Flow Comparison')
            plt.legend()
            plt.grid(True)
            plt.yscale('log')
            
            return depths, vanilla_gradients, resnet_gradients
        
        depths, vanilla_grad, resnet_grad = simulate_gradient_flow()
        
        print("梯度流动分析:")
        print("-" * 30)
        for i, depth in enumerate(depths):
            print(f"深度{depth:3d}: 普通网络={vanilla_grad[i]:.6f}, ResNet={resnet_grad[i]:.6f}")
        
        return depths, vanilla_grad, resnet_grad

# 使用示例
resnet = ResNet()

# 残差块概念
concept = resnet.residual_block_concept()

# 构建ResNet50
model_resnet50 = resnet.build_resnet(layers=[3, 4, 6, 3], num_classes=1000)

print(f"\nResNet50 模型结构:")
print(model_resnet50)

# ResNet变种
variants = resnet.resnet_variants()

# 梯度流动分析
gradient_analysis = resnet.gradient_flow_analysis()

# 测试前向传播
sample_input = torch.randn(1, 3, 224, 224)
with torch.no_grad():
    output = model_resnet50(sample_input)
    print(f"\n输入尺寸: {sample_input.shape}")
    print(f"输出尺寸: {output.shape}")

# 参数量统计
def count_parameters(model):
    total = sum(p.numel() for p in model.parameters() if p.requires_grad)
    return total

resnet50_params = count_parameters(model_resnet50)
print(f"\nResNet50 参数量: {resnet50_params:,}")
```

## 2.4 反向传播和优化算法

### 2.4.1 反向传播算法

```python
class BackpropagationDemo:
    def __init__(self):
        pass
    
    def simple_network_example(self):
        """简单网络的反向传播演示"""
        
        class SimpleNet:
            def __init__(self):
                # 权重初始化
                self.W1 = np.random.randn(2, 3) * 0.01  # 输入层到隐藏层
                self.b1 = np.zeros((1, 3))
                self.W2 = np.random.randn(3, 1) * 0.01  # 隐藏层到输出层  
                self.b2 = np.zeros((1, 1))
                
                # 保存中间变量用于反向传播
                self.z1 = None
                self.a1 = None
                self.z2 = None
                self.a2 = None
            
            def sigmoid(self, z):
                """Sigmoid激活函数"""
                return 1 / (1 + np.exp(-np.clip(z, -500, 500)))
            
            def sigmoid_derivative(self, z):
                """Sigmoid导数"""
                s = self.sigmoid(z)
                return s * (1 - s)
            
            def forward(self, X):
                """前向传播"""
                self.z1 = np.dot(X, self.W1) + self.b1
                self.a1 = self.sigmoid(self.z1)
                self.z2 = np.dot(self.a1, self.W2) + self.b2
                self.a2 = self.sigmoid(self.z2)
                return self.a2
            
            def compute_cost(self, Y, A2):
                """计算损失"""
                m = Y.shape[0]
                cost = -np.sum(Y * np.log(A2 + 1e-8) + (1 - Y) * np.log(1 - A2 + 1e-8)) / m
                return cost
            
            def backward(self, X, Y):
                """反向传播"""
                m = X.shape[0]
                
                # 输出层梯度
                dZ2 = self.a2 - Y  # 对于sigmoid + cross-entropy
                dW2 = np.dot(self.a1.T, dZ2) / m
                db2 = np.sum(dZ2, axis=0, keepdims=True) / m
                
                # 隐藏层梯度
                dA1 = np.dot(dZ2, self.W2.T)
                dZ1 = dA1 * self.sigmoid_derivative(self.z1)
                dW1 = np.dot(X.T, dZ1) / m
                db1 = np.sum(dZ1, axis=0, keepdims=True) / m
                
                gradients = {
                    "dW1": dW1, "db1": db1,
                    "dW2": dW2, "db2": db2
                }
                
                return gradients
            
            def update_parameters(self, gradients, learning_rate):
                """更新参数"""
                self.W1 -= learning_rate * gradients["dW1"]
                self.b1 -= learning_rate * gradients["db1"]
                self.W2 -= learning_rate * gradients["dW2"]
                self.b2 -= learning_rate * gradients["db2"]
            
            def train(self, X, Y, epochs, learning_rate):
                """训练过程"""
                costs = []
                
                for i in range(epochs):
                    # 前向传播
                    A2 = self.forward(X)
                    
                    # 计算损失
                    cost = self.compute_cost(Y, A2)
                    costs.append(cost)
                    
                    # 反向传播
                    gradients = self.backward(X, Y)
                    
                    # 更新参数
                    self.update_parameters(gradients, learning_rate)
                    
                    if i % 100 == 0:
                        print(f"Cost after epoch {i}: {cost:.6f}")
                
                return costs
        
        return SimpleNet
    
    def gradient_checking(self):
        """梯度检验"""
        def numerical_gradient(f, x, h=1e-5):
            """数值梯度计算"""
            grad = np.zeros_like(x)
            it = np.nditer(x, flags=['multi_index'], op_flags=['readwrite'])
            
            while not it.finished:
                idx = it.multi_index
                old_value = x[idx]
                
                x[idx] = old_value + h
                fxh_pos = f(x)
                
                x[idx] = old_value - h
                fxh_neg = f(x)
                
                grad[idx] = (fxh_pos - fxh_neg) / (2 * h)
                x[idx] = old_value
                it.iternext()
            
            return grad
        
        def gradient_check_example():
            """梯度检验示例"""
            # 简单的二次函数 f(x) = x^2 + 2x + 1
            def f(x):
                return np.sum(x**2 + 2*x + 1)
            
            def analytical_grad(x):
                return 2*x + 2
            
            x = np.array([1.0, 2.0, -1.0])
            
            # 解析梯度
            grad_analytical = analytical_grad(x)
            
            # 数值梯度
            grad_numerical = numerical_gradient(f, x)
            
            # 计算差异
            diff = np.linalg.norm(grad_analytical - grad_numerical) / \
                   (np.linalg.norm(grad_analytical) + np.linalg.norm(grad_numerical))
            
            print("梯度检验结果:")
            print(f"解析梯度: {grad_analytical}")
            print(f"数值梯度: {grad_numerical}")
            print(f"相对误差: {diff:.10f}")
            
            if diff < 1e-7:
                print("✓ 梯度检验通过")
            else:
                print("✗ 梯度检验失败")
            
            return diff
        
        return gradient_check_example
    
    def backprop_intuition(self):
        """反向传播直觉理解"""
        intuition = {
            "链式法则": {
                "数学基础": "复合函数求导的基本规则",
                "公式": "∂L/∂w = (∂L/∂y) × (∂y/∂z) × (∂z/∂w)",
                "含义": "损失对权重的梯度等于各层导数的乘积"
            },
            "计算图": {
                "概念": "将计算过程表示为有向无环图",
                "前向": "按图的方向计算输出",
                "反向": "逆图的方向计算梯度",
                "优势": "可以自动化求导过程"
            },
            "梯度消失": {
                "原因": "深层网络中梯度逐层相乘",
                "问题": "浅层参数更新很小，学习困难",
                "解决": ["ReLU激活", "残差连接", "BatchNorm"]
            },
            "梯度爆炸": {
                "原因": "梯度在传播过程中指数级增长",
                "问题": "参数更新过大，训练不稳定",
                "解决": ["梯度裁剪", "权重初始化", "学习率调整"]
            }
        }
        
        print("反向传播直觉理解:")
        print("=" * 40)
        
        for concept, details in intuition.items():
            print(f"\n{concept}:")
            for key, value in details.items():
                if isinstance(value, list):
                    print(f"  {key}:")
                    for item in value:
                        print(f"    - {item}")
                else:
                    print(f"  {key}: {value}")
        
        return intuition

# 使用示例
backprop_demo = BackpropagationDemo()

# 简单网络示例
SimpleNet = backprop_demo.simple_network_example()
net = SimpleNet()

# 生成训练数据（XOR问题）
np.random.seed(42)
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
Y = np.array([[0], [1], [1], [0]])

print("训练简单神经网络解决XOR问题:")
print("=" * 40)

# 训练网络
costs = net.train(X, Y, epochs=5000, learning_rate=1.0)

# 测试结果
predictions = net.forward(X)
print(f"\n最终预测结果:")
for i in range(len(X)):
    print(f"输入: {X[i]} -> 预测: {predictions[i][0]:.6f}, 真实: {Y[i][0]}")

# 梯度检验
gradient_checker = backprop_demo.gradient_checking()
gradient_checker()

# 反向传播直觉
intuition = backprop_demo.backprop_intuition()
```

### 2.4.2 优化算法

```python
class OptimizationAlgorithms:
    def __init__(self):
        pass
    
    def gradient_descent_variants(self):
        """梯度下降变种"""
        
        class SGD:
            def __init__(self, learning_rate=0.01):
                self.learning_rate = learning_rate
            
            def update(self, params, gradients):
                """随机梯度下降更新"""
                updated_params = {}
                for key in params:
                    updated_params[key] = params[key] - self.learning_rate * gradients[key]
                return updated_params
        
        class MomentumSGD:
            def __init__(self, learning_rate=0.01, momentum=0.9):
                self.learning_rate = learning_rate
                self.momentum = momentum
                self.velocity = {}
            
            def update(self, params, gradients):
                """动量梯度下降"""
                updated_params = {}
                
                for key in params:
                    if key not in self.velocity:
                        self.velocity[key] = np.zeros_like(params[key])
                    
                    # 更新速度
                    self.velocity[key] = self.momentum * self.velocity[key] - self.learning_rate * gradients[key]
                    
                    # 更新参数
                    updated_params[key] = params[key] + self.velocity[key]
                
                return updated_params
        
        class AdaGrad:
            def __init__(self, learning_rate=0.01, eps=1e-8):
                self.learning_rate = learning_rate
                self.eps = eps
                self.accumulator = {}
            
            def update(self, params, gradients):
                """AdaGrad优化器"""
                updated_params = {}
                
                for key in params:
                    if key not in self.accumulator:
                        self.accumulator[key] = np.zeros_like(params[key])
                    
                    # 累积梯度平方
                    self.accumulator[key] += gradients[key] ** 2
                    
                    # 自适应学习率更新
                    adapted_lr = self.learning_rate / (np.sqrt(self.accumulator[key]) + self.eps)
                    updated_params[key] = params[key] - adapted_lr * gradients[key]
                
                return updated_params
        
        class Adam:
            def __init__(self, learning_rate=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
                self.learning_rate = learning_rate
                self.beta1 = beta1
                self.beta2 = beta2
                self.eps = eps
                self.m = {}  # 一阶矩估计
                self.v = {}  # 二阶矩估计
                self.t = 0   # 时间步
            
            def update(self, params, gradients):
                """Adam优化器"""
                self.t += 1
                updated_params = {}
                
                for key in params:
                    if key not in self.m:
                        self.m[key] = np.zeros_like(params[key])
                        self.v[key] = np.zeros_like(params[key])
                    
                    # 更新一阶和二阶矩估计
                    self.m[key] = self.beta1 * self.m[key] + (1 - self.beta1) * gradients[key]
                    self.v[key] = self.beta2 * self.v[key] + (1 - self.beta2) * (gradients[key] ** 2)
                    
                    # 偏差修正
                    m_hat = self.m[key] / (1 - self.beta1 ** self.t)
                    v_hat = self.v[key] / (1 - self.beta2 ** self.t)
                    
                    # 参数更新
                    updated_params[key] = params[key] - self.learning_rate * m_hat / (np.sqrt(v_hat) + self.eps)
                
                return updated_params
        
        return {
            'SGD': SGD,
            'MomentumSGD': MomentumSGD,
            'AdaGrad': AdaGrad,
            'Adam': Adam
        }
    
    def optimizer_comparison(self):
        """优化器比较实验"""
        
        # 定义优化问题：Rosenbrock函数
        def rosenbrock(x, y):
            return (1 - x)**2 + 100 * (y - x**2)**2
        
        def rosenbrock_gradient(x, y):
            dx = -2 * (1 - x) - 400 * x * (y - x**2)
            dy = 200 * (y - x**2)
            return np.array([dx, dy])
        
        # 初始化优化器
        optimizers = self.gradient_descent_variants()
        
        sgd = optimizers['SGD'](learning_rate=0.001)
        momentum = optimizers['MomentumSGD'](learning_rate=0.001)
        adagrad = optimizers['AdaGrad'](learning_rate=0.1)
        adam = optimizers['Adam'](learning_rate=0.01)
        
        # 优化过程
        def optimize_function(optimizer, steps=1000):
            params = {'xy': np.array([0.0, 0.0])}  # 起始点
            trajectory = [params['xy'].copy()]
            losses = []
            
            for i in range(steps):
                x, y = params['xy']
                loss = rosenbrock(x, y)
                losses.append(loss)
                
                gradients = {'xy': rosenbrock_gradient(x, y)}
                params = optimizer.update(params, gradients)
                trajectory.append(params['xy'].copy())
                
                # 防止发散
                if loss > 1e6:
                    break
            
            return np.array(trajectory), losses
        
        # 运行比较
        results = {}
        opt_instances = {
            'SGD': sgd,
            'Momentum': momentum, 
            'AdaGrad': adagrad,
            'Adam': adam
        }
        
        print("优化器性能比较 (Rosenbrock函数):")
        print("=" * 50)
        
        for name, opt in opt_instances.items():
            trajectory, losses = optimize_function(opt, 1000)
            final_loss = losses[-1]
            results[name] = {
                'trajectory': trajectory,
                'losses': losses,
                'final_loss': final_loss,
                'converged': final_loss < 1.0
            }
            
            print(f"{name:10} | 最终损失: {final_loss:8.6f} | 收敛: {'✓' if final_loss < 1.0 else '✗'}")
        
        # 可视化优化路径
        def plot_optimization_paths():
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
            
            # 绘制Rosenbrock函数等高线
            x = np.linspace(-0.5, 1.5, 100)
            y = np.linspace(-0.5, 1.5, 100)
            X, Y = np.meshgrid(x, y)
            Z = rosenbrock(X, Y)
            
            colors = ['red', 'blue', 'green', 'orange']
            
            for i, (name, result) in enumerate(results.items()):
                trajectory = result['trajectory']
                losses = result['losses']
                
                # 优化路径
                if i == 0:
                    ax1.contour(X, Y, Z, levels=50, alpha=0.3, colors='gray')
                ax1.plot(trajectory[:, 0], trajectory[:, 1], 
                        color=colors[i], label=name, linewidth=2)
                ax1.plot(trajectory[0, 0], trajectory[0, 1], 
                        'o', color=colors[i], markersize=8)
                ax1.plot(trajectory[-1, 0], trajectory[-1, 1], 
                        's', color=colors[i], markersize=8)
                
                # 损失曲线
                ax2.plot(losses[:min(500, len(losses))], 
                        color=colors[i], label=name, linewidth=2)
            
            ax1.plot(1, 1, 'k*', markersize=15, label='Global Minimum')
            ax1.set_xlabel('x')
            ax1.set_ylabel('y')
            ax1.set_title('Optimization Paths')
            ax1.legend()
            ax1.grid(True)
            
            ax2.set_xlabel('Iterations')
            ax2.set_ylabel('Loss')
            ax2.set_title('Loss Curves')
            ax2.set_yscale('log')
            ax2.legend()
            ax2.grid(True)
            
            plt.tight_layout()
            return fig
        
        return results, plot_optimization_paths
    
    def learning_rate_scheduling(self):
        """学习率调度策略"""
        
        class LRScheduler:
            def __init__(self):
                pass
            
            def step_decay(self, initial_lr, epoch, drop_rate=0.5, epochs_drop=10):
                """阶梯衰减"""
                return initial_lr * (drop_rate ** (epoch // epochs_drop))
            
            def exponential_decay(self, initial_lr, epoch, decay_rate=0.95):
                """指数衰减"""
                return initial_lr * (decay_rate ** epoch)
            
            def cosine_annealing(self, initial_lr, epoch, max_epochs):
                """余弦退火"""
                return initial_lr * (1 + np.cos(np.pi * epoch / max_epochs)) / 2
            
            def warm_up_cosine(self, initial_lr, epoch, warmup_epochs, max_epochs):
                """热身 + 余弦退火"""
                if epoch < warmup_epochs:
                    return initial_lr * epoch / warmup_epochs
                else:
                    return self.cosine_annealing(initial_lr, epoch - warmup_epochs, 
                                               max_epochs - warmup_epochs)
            
            def visualize_schedules(self, initial_lr=0.1, max_epochs=100):
                """可视化不同调度策略"""
                epochs = np.arange(max_epochs)
                
                schedules = {
                    'Constant': [initial_lr] * max_epochs,
                    'Step Decay': [self.step_decay(initial_lr, e) for e in epochs],
                    'Exponential': [self.exponential_decay(initial_lr, e) for e in epochs],
                    'Cosine': [self.cosine_annealing(initial_lr, e, max_epochs) for e in epochs],
                    'Warm-up Cosine': [self.warm_up_cosine(initial_lr, e, 10, max_epochs) for e in epochs]
                }
                
                plt.figure(figsize=(12, 8))
                for name, schedule in schedules.items():
                    plt.plot(epochs, schedule, label=name, linewidth=2)
                
                plt.xlabel('Epoch')
                plt.ylabel('Learning Rate')
                plt.title('Learning Rate Scheduling Strategies')
                plt.legend()
                plt.grid(True)
                plt.yscale('log')
                
                return schedules
        
        return LRScheduler()

# 使用示例
opt_algorithms = OptimizationAlgorithms()

# 获取优化器类
optimizers = opt_algorithms.gradient_descent_variants()

# 优化器比较
results, plot_function = opt_algorithms.optimizer_comparison()

# 可视化结果（如果需要）
# fig = plot_function()
# plt.show()

# 学习率调度
lr_scheduler = opt_algorithms.learning_rate_scheduling()
schedules = lr_scheduler.visualize_schedules()

print(f"\n学习率调度示例 (前10个epoch):")
print("-" * 40)
for name, schedule in schedules.items():
    print(f"{name:15}: {schedule[:10]}")
```

## 本章总结

### 2.5.1 核心概念回顾
1. **深度学习**通过多层网络自动学习特征表示
2. **卷积神经网络**利用卷积操作提取空间特征
3. **经典架构**展现了CNN的发展历程和设计思想
4. **反向传播**是深度网络训练的核心算法
5. **优化算法**决定了网络的收敛性能

### 2.5.2 重要技术要点
- **卷积操作**：参数共享、局部连接、平移不变性
- **池化操作**：降维、减少计算、增强鲁棒性
- **激活函数**：引入非线性、ReLU缓解梯度消失
- **残差连接**：解决深层网络退化问题
- **批归一化**：加速收敛、提升稳定性

### 2.5.3 架构演进启示
- **LeNet**：确立CNN基本结构
- **AlexNet**：证明深度学习的威力
- **VGG**：小卷积核的优势
- **ResNet**：残差学习的突破

### 2.5.4 优化算法选择
- **SGD**：简单有效，适合大批量
- **Momentum**：加速收敛，跨越鞍点
- **Adam**：自适应学习率，广泛适用
- **学习率调度**：训练过程的关键技巧

### 2.5.5 下章预告
下一章将学习目标检测发展历程与经典算法，了解从传统方法到深度学习方法的演进，为深入理解YOLO算法做好准备。我们将学习：
- 传统目标检测方法
- 两阶段检测算法（R-CNN系列）
- 一阶段检测算法的优势
- 为YOLO学习奠定基础

通过本章学习，我们掌握了深度学习和CNN的基础理论，为后续学习YOLO算法提供了坚实的技术基础。