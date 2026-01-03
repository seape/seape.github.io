---
title: "第7章：YOLO环境搭建与工具使用"
date: 2025-10-02
icon: circle-dot
author: Haiyue
category:
  - YOLO
  - 图像识别
star: false
---
# 第7章：YOLO环境搭建与工具使用

## 学习目标
1. 搭建YOLO开发环境（Python、PyTorch/TensorFlow）
2. 熟悉常用的计算机视觉库（OpenCV、PIL等）
3. 掌握数据预处理和可视化工具
4. 了解GPU加速和模型部署工具

## 7.1 基础环境搭建

### 7.1.1 Python环境配置

```bash
# 创建虚拟环境
conda create -n yolo python=3.8
conda activate yolo

# 或使用pip
python -m venv yolo_env
source yolo_env/bin/activate  # Linux/Mac
# yolo_env\Scripts\activate  # Windows
```

### 7.1.2 核心依赖安装

```bash
# PyTorch安装 (CUDA版本)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# 其他核心依赖
pip install ultralytics  # YOLOv8官方包
pip install opencv-python
pip install matplotlib
pip install numpy
pip install pillow
pip install tensorboard
pip install wandb
```

## 7.2 YOLOv8环境配置

### 7.2.1 Ultralytics YOLO安装

```python
import ultralytics
from ultralytics import YOLO
import torch
import cv2
import numpy as np

# 检查安装
print(f"Ultralytics version: {ultralytics.__version__}")
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")

# 快速验证
model = YOLO('yolov8n.pt')  # 自动下载预训练模型
results = model('https://ultralytics.com/images/bus.jpg')
results[0].show()
```

### 7.2.2 配置文件管理

```python
# 创建配置管理系统
import yaml
from pathlib import Path

class YOLOConfig:
    def __init__(self, config_path='config.yaml'):
        self.config_path = Path(config_path)
        self.config = self.load_config()
    
    def load_config(self):
        """加载配置文件"""
        if self.config_path.exists():
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        else:
            return self.create_default_config()
    
    def create_default_config(self):
        """创建默认配置"""
        default_config = {
            'model': {
                'name': 'yolov8n.pt',
                'task': 'detect',
                'device': 'auto'
            },
            'data': {
                'path': './datasets',
                'train': 'train/images',
                'val': 'val/images',
                'nc': 80,
                'names': ['person', 'bicycle', ...]  # COCO classes
            },
            'train': {
                'epochs': 100,
                'batch_size': 16,
                'imgsz': 640,
                'lr0': 0.01,
                'optimizer': 'SGD'
            },
            'paths': {
                'project': './runs',
                'name': 'train',
                'weights': './weights',
                'logs': './logs'
            }
        }
        
        self.save_config(default_config)
        return default_config
    
    def save_config(self, config=None):
        """保存配置文件"""
        config = config or self.config
        with open(self.config_path, 'w', encoding='utf-8') as f:
            yaml.dump(config, f, default_flow_style=False, allow_unicode=True)
    
    def get(self, key, default=None):
        """获取配置值"""
        keys = key.split('.')
        value = self.config
        for k in keys:
            value = value.get(k, default)
            if value is None:
                return default
        return value

# 使用示例
config = YOLOConfig()
print(f"Model name: {config.get('model.name')}")
print(f"Batch size: {config.get('train.batch_size')}")
```

## 7.3 开发工具集成

### 7.3.1 Jupyter Notebook配置

```python
# 安装Jupyter相关包
# pip install jupyter ipywidgets

# Jupyter配置文件
%%writefile jupyter_setup.py

import matplotlib.pyplot as plt
import matplotlib
matplotlib.rcParams['figure.figsize'] = (12, 8)
matplotlib.rcParams['font.size'] = 12

# 自动重载模块
%load_ext autoreload
%autoreload 2

# 内联显示图像
%matplotlib inline

# 进度条支持
from tqdm.notebook import tqdm

# 设置随机种子
import random
import numpy as np
import torch

def set_random_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)

set_random_seed(42)
print("Jupyter environment configured successfully!")
```

### 7.3.2 VS Code配置

```json
// .vscode/settings.json
{
    "python.interpreter": "./yolo_env/bin/python",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "python.formatting.provider": "black",
    "python.sortImports.args": ["-rc", "--atomic"],
    "editor.formatOnSave": true,
    "editor.rulers": [88],
    "files.associations": {
        "*.yaml": "yaml"
    }
}

// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "YOLO Training",
            "type": "python",
            "request": "launch",
            "program": "train.py",
            "args": ["--config", "config.yaml"],
            "console": "integratedTerminal",
            "env": {
                "CUDA_VISIBLE_DEVICES": "0"
            }
        }
    ]
}
```

## 7.4 数据处理工具

### 7.4.1 图像处理工具类

```python
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import matplotlib.pyplot as plt
from typing import List, Tuple, Optional

class ImageProcessor:
    """图像处理工具类"""
    
    def __init__(self):
        self.supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
    
    def load_image(self, image_path: str) -> np.ndarray:
        """加载图像"""
        if isinstance(image_path, str):
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Cannot load image from {image_path}")
            return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return image_path
    
    def resize_image(self, image: np.ndarray, size: Tuple[int, int], 
                    keep_ratio: bool = True) -> np.ndarray:
        """调整图像大小"""
        if keep_ratio:
            return self._resize_keep_ratio(image, size)
        else:
            return cv2.resize(image, size)
    
    def _resize_keep_ratio(self, image: np.ndarray, 
                          size: Tuple[int, int]) -> np.ndarray:
        """保持纵横比调整大小"""
        h, w = image.shape[:2]
        target_w, target_h = size
        
        # 计算缩放比例
        scale = min(target_w / w, target_h / h)
        new_w, new_h = int(w * scale), int(h * scale)
        
        # 调整大小
        resized = cv2.resize(image, (new_w, new_h))
        
        # 创建目标大小的图像并居中放置
        result = np.zeros((target_h, target_w, 3), dtype=np.uint8)
        y_offset = (target_h - new_h) // 2
        x_offset = (target_w - new_w) // 2
        result[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = resized
        
        return result
    
    def normalize_image(self, image: np.ndarray) -> np.ndarray:
        """图像归一化"""
        return image.astype(np.float32) / 255.0
    
    def denormalize_image(self, image: np.ndarray) -> np.ndarray:
        """反归一化"""
        return (image * 255).astype(np.uint8)
    
    def apply_augmentation(self, image: np.ndarray, 
                          augmentation_type: str) -> np.ndarray:
        """应用数据增强"""
        if augmentation_type == 'flip_horizontal':
            return cv2.flip(image, 1)
        elif augmentation_type == 'flip_vertical':
            return cv2.flip(image, 0)
        elif augmentation_type == 'rotate_90':
            return cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)
        elif augmentation_type == 'blur':
            return cv2.GaussianBlur(image, (5, 5), 0)
        elif augmentation_type == 'brightness':
            return cv2.convertScaleAbs(image, alpha=1.2, beta=30)
        else:
            return image
    
    def draw_bboxes(self, image: np.ndarray, bboxes: List[List], 
                   labels: List[str] = None, 
                   colors: List[Tuple] = None) -> np.ndarray:
        """绘制边界框"""
        result = image.copy()
        
        if colors is None:
            colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255)] * 10
        
        for i, bbox in enumerate(bboxes):
            x1, y1, x2, y2 = map(int, bbox[:4])
            color = colors[i % len(colors)]
            
            # 绘制边界框
            cv2.rectangle(result, (x1, y1), (x2, y2), color, 2)
            
            # 绘制标签
            if labels and i < len(labels):
                label = labels[i]
                (text_width, text_height), _ = cv2.getTextSize(
                    label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1
                )
                cv2.rectangle(result, (x1, y1 - text_height - 5), 
                            (x1 + text_width, y1), color, -1)
                cv2.putText(result, label, (x1, y1 - 5), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        return result

# 使用示例
processor = ImageProcessor()

# 加载和处理图像
image = processor.load_image('sample.jpg')
resized = processor.resize_image(image, (640, 640))
normalized = processor.normalize_image(resized)

# 数据增强
flipped = processor.apply_augmentation(image, 'flip_horizontal')

# 绘制检测结果
bboxes = [[100, 100, 200, 200], [300, 150, 400, 250]]
labels = ['person', 'car']
result = processor.draw_bboxes(image, bboxes, labels)

print("Image processing tools configured successfully!")
```

### 7.4.2 数据集工具

```python
import os
import json
from pathlib import Path
from collections import defaultdict
import pandas as pd

class DatasetManager:
    """数据集管理工具"""
    
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)
        self.annotations = {}
        self.class_names = []
    
    def scan_dataset(self) -> dict:
        """扫描数据集结构"""
        structure = {
            'images': {'train': [], 'val': [], 'test': []},
            'labels': {'train': [], 'val': [], 'test': []},
            'statistics': {}
        }
        
        for split in ['train', 'val', 'test']:
            img_dir = self.dataset_path / split / 'images'
            label_dir = self.dataset_path / split / 'labels'
            
            if img_dir.exists():
                structure['images'][split] = list(img_dir.glob('*.jpg')) + list(img_dir.glob('*.png'))
            
            if label_dir.exists():
                structure['labels'][split] = list(label_dir.glob('*.txt'))
        
        return structure
    
    def validate_dataset(self) -> dict:
        """验证数据集完整性"""
        issues = {'missing_labels': [], 'missing_images': [], 'empty_labels': []}
        
        structure = self.scan_dataset()
        
        for split in ['train', 'val', 'test']:
            images = structure['images'][split]
            labels = structure['labels'][split]
            
            # 创建文件名映射
            image_names = {img.stem for img in images}
            label_names = {label.stem for label in labels}
            
            # 检查缺失的标签
            missing_labels = image_names - label_names
            if missing_labels:
                issues['missing_labels'].extend([
                    f"{split}/{name}" for name in missing_labels
                ])
            
            # 检查缺失的图像
            missing_images = label_names - image_names
            if missing_images:
                issues['missing_images'].extend([
                    f"{split}/{name}" for name in missing_images
                ])
            
            # 检查空标签文件
            for label_file in labels:
                if label_file.stat().st_size == 0:
                    issues['empty_labels'].append(f"{split}/{label_file.name}")
        
        return issues
    
    def analyze_dataset(self) -> dict:
        """分析数据集统计信息"""
        stats = {
            'total_images': 0,
            'total_objects': 0,
            'class_distribution': defaultdict(int),
            'bbox_sizes': [],
            'image_sizes': []
        }
        
        structure = self.scan_dataset()
        
        for split in ['train', 'val', 'test']:
            images = structure['images'][split]
            labels = structure['labels'][split]
            
            stats['total_images'] += len(images)
            
            # 分析图像尺寸
            for img_path in images:
                img = cv2.imread(str(img_path))
                if img is not None:
                    h, w = img.shape[:2]
                    stats['image_sizes'].append((w, h))
            
            # 分析标注
            for label_path in labels:
                try:
                    with open(label_path, 'r') as f:
                        lines = f.readlines()
                    
                    for line in lines:
                        parts = line.strip().split()
                        if len(parts) >= 5:
                            class_id = int(parts[0])
                            x, y, w, h = map(float, parts[1:5])
                            
                            stats['total_objects'] += 1
                            stats['class_distribution'][class_id] += 1
                            stats['bbox_sizes'].append((w, h))
                
                except Exception as e:
                    print(f"Error reading {label_path}: {e}")
        
        return stats
    
    def create_data_yaml(self, output_path: str = None):
        """创建YOLO格式的数据配置文件"""
        if output_path is None:
            output_path = self.dataset_path / 'data.yaml'
        
        config = {
            'path': str(self.dataset_path.absolute()),
            'train': 'train/images',
            'val': 'val/images',
            'test': 'test/images',
            'nc': len(self.class_names),
            'names': self.class_names
        }
        
        with open(output_path, 'w') as f:
            yaml.dump(config, f, default_flow_style=False)
        
        print(f"Data config saved to {output_path}")
    
    def visualize_statistics(self, stats: dict):
        """可视化数据集统计"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # 类别分布
        if stats['class_distribution']:
            classes = list(stats['class_distribution'].keys())
            counts = list(stats['class_distribution'].values())
            
            axes[0, 0].bar(classes, counts)
            axes[0, 0].set_title('Class Distribution')
            axes[0, 0].set_xlabel('Class ID')
            axes[0, 0].set_ylabel('Count')
        
        # 边界框尺寸分布
        if stats['bbox_sizes']:
            widths, heights = zip(*stats['bbox_sizes'])
            axes[0, 1].scatter(widths, heights, alpha=0.5)
            axes[0, 1].set_title('Bounding Box Sizes')
            axes[0, 1].set_xlabel('Width (normalized)')
            axes[0, 1].set_ylabel('Height (normalized)')
        
        # 图像尺寸分布
        if stats['image_sizes']:
            widths, heights = zip(*stats['image_sizes'])
            axes[1, 0].scatter(widths, heights, alpha=0.5)
            axes[1, 0].set_title('Image Sizes')
            axes[1, 0].set_xlabel('Width (pixels)')
            axes[1, 0].set_ylabel('Height (pixels)')
        
        # 总体统计
        axes[1, 1].text(0.1, 0.8, f"Total Images: {stats['total_images']}", 
                        transform=axes[1, 1].transAxes, fontsize=12)
        axes[1, 1].text(0.1, 0.6, f"Total Objects: {stats['total_objects']}", 
                        transform=axes[1, 1].transAxes, fontsize=12)
        axes[1, 1].text(0.1, 0.4, f"Classes: {len(stats['class_distribution'])}", 
                        transform=axes[1, 1].transAxes, fontsize=12)
        axes[1, 1].set_title('Dataset Summary')
        axes[1, 1].axis('off')
        
        plt.tight_layout()
        plt.show()

# 使用示例
dataset_manager = DatasetManager('./dataset')

# 扫描数据集
# structure = dataset_manager.scan_dataset()
# print("Dataset structure:", structure)

# 验证数据集
# issues = dataset_manager.validate_dataset()
# print("Dataset issues:", issues)

# 分析统计信息
# stats = dataset_manager.analyze_dataset()
# dataset_manager.visualize_statistics(stats)
```

## 7.5 GPU和硬件配置

### 7.5.1 GPU环境检测

```python
import torch
import subprocess
import psutil
from typing import Dict, List

class SystemInfo:
    """系统信息检测"""
    
    @staticmethod
    def check_gpu_info() -> Dict:
        """检查GPU信息"""
        info = {
            'cuda_available': torch.cuda.is_available(),
            'gpu_count': torch.cuda.device_count() if torch.cuda.is_available() else 0,
            'current_device': torch.cuda.current_device() if torch.cuda.is_available() else None,
            'gpu_details': []
        }
        
        if torch.cuda.is_available():
            for i in range(torch.cuda.device_count()):
                gpu_props = torch.cuda.get_device_properties(i)
                gpu_info = {
                    'device_id': i,
                    'name': gpu_props.name,
                    'total_memory': f"{gpu_props.total_memory / 1024**3:.1f} GB",
                    'compute_capability': f"{gpu_props.major}.{gpu_props.minor}",
                    'multiprocessors': gpu_props.multi_processor_count
                }
                info['gpu_details'].append(gpu_info)
        
        return info
    
    @staticmethod
    def check_memory_usage() -> Dict:
        """检查内存使用情况"""
        memory = psutil.virtual_memory()
        return {
            'total_ram': f"{memory.total / 1024**3:.1f} GB",
            'available_ram': f"{memory.available / 1024**3:.1f} GB",
            'used_ram': f"{memory.used / 1024**3:.1f} GB",
            'memory_percent': f"{memory.percent:.1f}%"
        }
    
    @staticmethod
    def check_disk_space(path: str = './') -> Dict:
        """检查磁盘空间"""
        disk = psutil.disk_usage(path)
        return {
            'total_space': f"{disk.total / 1024**3:.1f} GB",
            'free_space': f"{disk.free / 1024**3:.1f} GB",
            'used_space': f"{disk.used / 1024**3:.1f} GB",
            'disk_percent': f"{(disk.used / disk.total) * 100:.1f}%"
        }
    
    @staticmethod
    def print_system_info():
        """打印系统信息"""
        print("=== System Information ===")
        
        # GPU信息
        gpu_info = SystemInfo.check_gpu_info()
        print(f"\nGPU Information:")
        print(f"  CUDA Available: {gpu_info['cuda_available']}")
        print(f"  GPU Count: {gpu_info['gpu_count']}")
        
        if gpu_info['gpu_details']:
            for gpu in gpu_info['gpu_details']:
                print(f"  GPU {gpu['device_id']}: {gpu['name']}")
                print(f"    Memory: {gpu['total_memory']}")
                print(f"    Compute Capability: {gpu['compute_capability']}")
        
        # 内存信息
        memory_info = SystemInfo.check_memory_usage()
        print(f"\nMemory Information:")
        for key, value in memory_info.items():
            print(f"  {key.replace('_', ' ').title()}: {value}")
        
        # 磁盘信息
        disk_info = SystemInfo.check_disk_space()
        print(f"\nDisk Information:")
        for key, value in disk_info.items():
            print(f"  {key.replace('_', ' ').title()}: {value}")

# GPU性能测试
class GPUBenchmark:
    """GPU性能测试"""
    
    @staticmethod
    def test_gpu_speed(device_id: int = 0, iterations: int = 100):
        """测试GPU计算速度"""
        if not torch.cuda.is_available():
            print("CUDA not available")
            return
        
        device = torch.device(f'cuda:{device_id}')
        
        # 创建测试数据
        a = torch.randn(1000, 1000, device=device)
        b = torch.randn(1000, 1000, device=device)
        
        # 热身
        for _ in range(10):
            c = torch.matmul(a, b)
        
        torch.cuda.synchronize()
        
        import time
        start_time = time.time()
        
        # 性能测试
        for _ in range(iterations):
            c = torch.matmul(a, b)
        
        torch.cuda.synchronize()
        end_time = time.time()
        
        avg_time = (end_time - start_time) / iterations
        print(f"GPU {device_id} Matrix Multiplication Average Time: {avg_time*1000:.2f} ms")
    
    @staticmethod
    def test_model_inference_speed(model_name: str = 'yolov8n.pt'):
        """测试模型推理速度"""
        try:
            model = YOLO(model_name)
            
            # 创建测试图像
            test_image = torch.randn(1, 3, 640, 640)
            
            # 热身
            for _ in range(10):
                results = model(test_image, verbose=False)
            
            import time
            iterations = 100
            start_time = time.time()
            
            for _ in range(iterations):
                results = model(test_image, verbose=False)
            
            end_time = time.time()
            avg_time = (end_time - start_time) / iterations
            fps = 1 / avg_time
            
            print(f"Model {model_name} Inference:")
            print(f"  Average Time: {avg_time*1000:.2f} ms")
            print(f"  FPS: {fps:.1f}")
            
        except Exception as e:
            print(f"Error testing model inference: {e}")

# 运行系统检测
SystemInfo.print_system_info()

# GPU性能测试
if torch.cuda.is_available():
    print("\n=== GPU Performance Test ===")
    GPUBenchmark.test_gpu_speed()
    # GPUBenchmark.test_model_inference_speed()
```

## 7.6 监控和日志工具

### 7.6.1 训练监控

```python
import wandb
import tensorboard
from torch.utils.tensorboard import SummaryWriter
import logging
from datetime import datetime

class TrainingMonitor:
    """训练监控工具"""
    
    def __init__(self, project_name: str = "yolo_training", 
                 use_wandb: bool = True, use_tensorboard: bool = True):
        self.project_name = project_name
        self.use_wandb = use_wandb
        self.use_tensorboard = use_tensorboard
        
        # 初始化日志
        self.setup_logging()
        
        # 初始化监控工具
        if self.use_wandb:
            self.init_wandb()
        
        if self.use_tensorboard:
            self.init_tensorboard()
    
    def setup_logging(self):
        """设置日志"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_filename = f"training_{timestamp}.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_filename),
                logging.StreamHandler()
            ]
        )
        
        self.logger = logging.getLogger(__name__)
        self.logger.info(f"Training monitor initialized for project: {self.project_name}")
    
    def init_wandb(self):
        """初始化Weights & Biases"""
        try:
            wandb.init(project=self.project_name)
            self.logger.info("W&B initialized successfully")
        except Exception as e:
            self.logger.warning(f"Failed to initialize W&B: {e}")
            self.use_wandb = False
    
    def init_tensorboard(self):
        """初始化TensorBoard"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            log_dir = f"runs/{self.project_name}_{timestamp}"
            self.writer = SummaryWriter(log_dir)
            self.logger.info(f"TensorBoard initialized: {log_dir}")
        except Exception as e:
            self.logger.warning(f"Failed to initialize TensorBoard: {e}")
            self.use_tensorboard = False
    
    def log_metrics(self, metrics: dict, step: int):
        """记录训练指标"""
        # 记录到日志
        metrics_str = ", ".join([f"{k}: {v:.4f}" for k, v in metrics.items()])
        self.logger.info(f"Step {step} - {metrics_str}")
        
        # W&B记录
        if self.use_wandb:
            wandb.log(metrics, step=step)
        
        # TensorBoard记录
        if self.use_tensorboard:
            for key, value in metrics.items():
                self.writer.add_scalar(key, value, step)
    
    def log_images(self, images: dict, step: int):
        """记录图像"""
        if self.use_wandb:
            wandb_images = {}
            for key, img in images.items():
                if isinstance(img, np.ndarray):
                    wandb_images[key] = wandb.Image(img)
            wandb.log(wandb_images, step=step)
        
        if self.use_tensorboard:
            for key, img in images.items():
                if isinstance(img, np.ndarray):
                    # 确保图像格式正确 (C, H, W)
                    if len(img.shape) == 3 and img.shape[-1] == 3:
                        img = img.transpose(2, 0, 1)
                    self.writer.add_image(key, img, step, dataformats='CHW')
    
    def log_model(self, model_path: str):
        """记录模型"""
        if self.use_wandb:
            wandb.save(model_path)
            self.logger.info(f"Model saved to W&B: {model_path}")
    
    def close(self):
        """关闭监控器"""
        if self.use_tensorboard:
            self.writer.close()
        
        if self.use_wandb:
            wandb.finish()
        
        self.logger.info("Training monitor closed")

# 使用示例
# monitor = TrainingMonitor("yolo_experiment")
# 
# # 记录训练指标
# metrics = {
#     'train_loss': 0.5,
#     'val_loss': 0.6,
#     'mAP': 0.75
# }
# monitor.log_metrics(metrics, step=100)
# 
# # 记录图像
# sample_image = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
# monitor.log_images({'sample': sample_image}, step=100)

print("Monitoring tools configured successfully!")
```

## 7.7 章节总结

### 7.7.1 环境配置检查清单

```python
def environment_checklist():
    """环境配置检查清单"""
    checklist = {
        "Python环境": {
            "Python版本": "3.8+",
            "虚拟环境": "已创建并激活",
            "包管理": "pip或conda"
        },
        "深度学习框架": {
            "PyTorch": "已安装CUDA版本",
            "TorchVision": "已安装",
            "CUDA": "版本匹配"
        },
        "YOLO相关": {
            "Ultralytics": "已安装最新版",
            "预训练模型": "可正常下载",
            "推理测试": "成功运行"
        },
        "数据处理": {
            "OpenCV": "已安装",
            "PIL/Pillow": "已安装",
            "Matplotlib": "已安装",
            "NumPy": "已安装"
        },
        "开发工具": {
            "Jupyter Notebook": "可选安装",
            "VS Code": "推荐配置",
            "Git": "版本控制"
        },
        "监控工具": {
            "TensorBoard": "已配置",
            "W&B": "可选配置",
            "日志系统": "已设置"
        },
        "硬件配置": {
            "GPU": "CUDA兼容",
            "内存": "8GB+推荐",
            "存储": "足够的磁盘空间"
        }
    }
    
    print("YOLO开发环境配置检查清单:")
    print("=" * 50)
    
    for category, items in checklist.items():
        print(f"\n{category}:")
        for item, requirement in items.items():
            print(f"  ✓ {item}: {requirement}")
    
    print(f"\n配置完成后，请运行以下测试:")
    print("  1. 系统信息检测")
    print("  2. GPU性能测试")
    print("  3. YOLO模型推理测试")
    print("  4. 数据集工具测试")
    print("  5. 监控工具测试")

# 运行检查清单
environment_checklist()
```

### 7.7.2 常见问题解决

```python
class TroubleShooting:
    """常见问题解决方案"""
    
    @staticmethod
    def common_issues():
        issues = {
            "CUDA不可用": {
                "症状": "torch.cuda.is_available()返回False",
                "解决方案": [
                    "检查GPU驱动是否正确安装",
                    "确认PyTorch CUDA版本与驱动匹配",
                    "重新安装PyTorch CUDA版本",
                    "检查环境变量CUDA_PATH"
                ]
            },
            "内存不足": {
                "症状": "CUDA out of memory错误",
                "解决方案": [
                    "减小batch_size",
                    "降低输入图像分辨率",
                    "使用混合精度训练",
                    "清理GPU缓存torch.cuda.empty_cache()"
                ]
            },
            "模型下载失败": {
                "症状": "预训练模型无法下载",
                "解决方案": [
                    "检查网络连接",
                    "使用代理或镜像源",
                    "手动下载模型文件",
                    "配置环境变量YOLO_CONFIG_DIR"
                ]
            },
            "依赖冲突": {
                "症状": "包版本冲突错误",
                "解决方案": [
                    "创建新的虚拟环境",
                    "按照推荐版本安装依赖",
                    "使用pip check检查依赖",
                    "查看官方文档的最新要求"
                ]
            }
        }
        
        print("YOLO环境常见问题及解决方案:")
        print("=" * 50)
        
        for issue, details in issues.items():
            print(f"\n问题: {issue}")
            print(f"症状: {details['症状']}")
            print("解决方案:")
            for i, solution in enumerate(details['解决方案'], 1):
                print(f"  {i}. {solution}")

# 显示故障排除指南
TroubleShooting.common_issues()

print("\n环境搭建完成！可以开始YOLO模型的训练和部署了。")
```

完成本章学习后，你应该能够：

1. ✅ 成功搭建YOLO开发环境
2. ✅ 配置GPU和深度学习框架
3. ✅ 使用数据处理和可视化工具
4. ✅ 设置训练监控和日志系统
5. ✅ 解决常见的环境配置问题
6. ✅ 准备开始实际的模型训练

---

*本章重点：建立完整的YOLO开发环境，为后续的数据准备、模型训练和部署奠定基础。*