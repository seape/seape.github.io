---
title: "第8章：数据集准备与标注"
date: 2025-10-02
icon: circle-dot
author: Haiyue
category:
  - YOLO
  - 图像识别
star: false
---
# 第8章：数据集准备与标注

## 学习目标
1. 了解常用的目标检测数据集（COCO、VOC、ImageNet等）
2. 掌握数据标注工具的使用（LabelImg、CVAT等）
3. 学习数据增强技术
4. 熟悉数据格式转换和预处理流程

## 8.1 数据集概述

### 8.1.1 常用公开数据集

```python
import os
import json
import xml.etree.ElementTree as ET
from pathlib import Path
import numpy as np
import cv2

class DatasetInfo:
    """数据集信息管理"""
    
    def __init__(self):
        self.datasets = {
            "COCO": {
                "description": "Common Objects in Context",
                "classes": 80,
                "train_images": 118287,
                "val_images": 5000,
                "annotation_format": "JSON",
                "download_size": "~20GB",
                "use_case": "通用目标检测、分割"
            },
            "PASCAL VOC": {
                "description": "Visual Object Classes",
                "classes": 20,
                "train_images": 16551,
                "val_images": 4952,
                "annotation_format": "XML",
                "download_size": "~2GB",
                "use_case": "经典目标检测基准"
            },
            "Open Images": {
                "description": "Google开源大规模数据集",
                "classes": 600,
                "train_images": 1743042,
                "val_images": 41620,
                "annotation_format": "CSV",
                "download_size": "~500GB",
                "use_case": "大规模预训练"
            }
        }
    
    def print_dataset_info(self):
        """打印数据集信息"""
        print("常用目标检测数据集:")
        print("=" * 60)
        
        for name, info in self.datasets.items():
            print(f"\n{name}:")
            print(f"  描述: {info['description']}")
            print(f"  类别数: {info['classes']}")
            print(f"  训练图像: {info['train_images']:,}")
            print(f"  验证图像: {info['val_images']:,}")
            print(f"  标注格式: {info['annotation_format']}")
            print(f"  数据大小: {info['download_size']}")
            print(f"  使用场景: {info['use_case']}")

# COCO类别定义
COCO_CLASSES = [
    'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus',
    'train', 'truck', 'boat', 'traffic light', 'fire hydrant',
    'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog',
    'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe',
    'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
    'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat',
    'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
    'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl',
    'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot',
    'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
    'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop',
    'mouse', 'remote', 'keyboard', 'cell phone', 'microwave',
    'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock',
    'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
]

# VOC类别定义
VOC_CLASSES = [
    'aeroplane', 'bicycle', 'bird', 'boat', 'bottle', 'bus', 'car',
    'cat', 'chair', 'cow', 'diningtable', 'dog', 'horse',
    'motorbike', 'person', 'pottedplant', 'sheep', 'sofa',
    'train', 'tvmonitor'
]

dataset_info = DatasetInfo()
dataset_info.print_dataset_info()
```

## 8.2 数据标注工具

### 8.2.1 LabelImg使用指南

```python
# 安装LabelImg
# pip install labelImg

class LabelImgGuide:
    """LabelImg使用指南"""
    
    def __init__(self):
        self.shortcuts = {
            "打开图像": "Ctrl+O",
            "保存": "Ctrl+S",
            "创建矩形框": "W",
            "下一张图像": "D",
            "上一张图像": "A",
            "验证图像": "Space",
            "删除选中框": "Delete",
            "复制框": "Ctrl+D",
            "撤销": "Ctrl+Z"
        }
        
        self.workflow = [
            "1. 启动LabelImg: labelImg",
            "2. 打开图像文件夹",
            "3. 设置保存目录",
            "4. 选择标注格式(YOLO/Pascal VOC)",
            "5. 创建类别文件classes.txt",
            "6. 开始标注: 按W创建边界框",
            "7. 选择类别并确认",
            "8. 保存并继续下一张",
            "9. 定期检查标注质量"
        ]
    
    def print_guide(self):
        """打印使用指南"""
        print("LabelImg使用指南:")
        print("=" * 40)
        
        print("\n工作流程:")
        for step in self.workflow:
            print(f"  {step}")
        
        print(f"\n常用快捷键:")
        for action, key in self.shortcuts.items():
            print(f"  {action}: {key}")
        
        print(f"\n注意事项:")
        print("  • 确保边界框紧贴目标")
        print("  • 避免遗漏小目标")
        print("  • 处理遮挡情况要谨慎")
        print("  • 定期备份标注文件")

labelimg_guide = LabelImgGuide()
labelimg_guide.print_guide()
```

### 8.2.2 标注质量控制

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from collections import Counter

class AnnotationQualityControl:
    """标注质量控制工具"""
    
    def __init__(self):
        self.quality_metrics = {}
    
    def check_annotation_consistency(self, annotation_dir: str):
        """检查标注一致性"""
        issues = {
            'invalid_bbox': [],
            'missing_class': [],
            'duplicate_bbox': [],
            'size_anomaly': []
        }
        
        annotation_files = list(Path(annotation_dir).glob('*.txt'))
        
        for file_path in annotation_files:
            try:
                with open(file_path, 'r') as f:
                    lines = f.readlines()
                
                bboxes = []
                for line_idx, line in enumerate(lines):
                    parts = line.strip().split()
                    if len(parts) < 5:
                        continue
                    
                    class_id = int(parts[0])
                    x, y, w, h = map(float, parts[1:5])
                    
                    # 检查边界框有效性
                    if not (0 <= x <= 1 and 0 <= y <= 1 and 0 < w <= 1 and 0 < h <= 1):
                        issues['invalid_bbox'].append(f"{file_path.name}:{line_idx+1}")
                    
                    # 检查尺寸异常
                    if w < 0.01 or h < 0.01:  # 太小的框
                        issues['size_anomaly'].append(f"{file_path.name}:{line_idx+1} - too small")
                    elif w > 0.9 or h > 0.9:  # 太大的框
                        issues['size_anomaly'].append(f"{file_path.name}:{line_idx+1} - too large")
                    
                    bboxes.append((class_id, x, y, w, h))
                
                # 检查重复边界框
                if len(bboxes) != len(set(bboxes)):
                    issues['duplicate_bbox'].append(file_path.name)
                
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
        
        return issues
    
    def analyze_class_distribution(self, annotation_dir: str):
        """分析类别分布"""
        class_counts = Counter()
        bbox_sizes = []
        
        annotation_files = list(Path(annotation_dir).glob('*.txt'))
        
        for file_path in annotation_files:
            try:
                with open(file_path, 'r') as f:
                    lines = f.readlines()
                
                for line in lines:
                    parts = line.strip().split()
                    if len(parts) >= 5:
                        class_id = int(parts[0])
                        w, h = float(parts[3]), float(parts[4])
                        
                        class_counts[class_id] += 1
                        bbox_sizes.append((w, h))
            
            except Exception as e:
                print(f"Error analyzing {file_path}: {e}")
        
        return class_counts, bbox_sizes
    
    def visualize_annotations(self, image_path: str, annotation_path: str, 
                            class_names: list = None):
        """可视化标注"""
        # 读取图像
        image = cv2.imread(image_path)
        if image is None:
            print(f"Cannot load image: {image_path}")
            return
        
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        h, w = image.shape[:2]
        
        # 读取标注
        annotations = []
        try:
            with open(annotation_path, 'r') as f:
                lines = f.readlines()
            
            for line in lines:
                parts = line.strip().split()
                if len(parts) >= 5:
                    class_id = int(parts[0])
                    x_center, y_center, width, height = map(float, parts[1:5])
                    
                    # 转换为像素坐标
                    x_center *= w
                    y_center *= h
                    width *= w
                    height *= h
                    
                    x1 = x_center - width / 2
                    y1 = y_center - height / 2
                    x2 = x_center + width / 2
                    y2 = y_center + height / 2
                    
                    annotations.append((class_id, x1, y1, x2, y2))
        
        except Exception as e:
            print(f"Error reading annotations: {e}")
            return
        
        # 绘制图像和标注
        fig, ax = plt.subplots(1, 1, figsize=(12, 8))
        ax.imshow(image)
        
        colors = plt.cm.tab10(np.linspace(0, 1, 10))
        
        for class_id, x1, y1, x2, y2 in annotations:
            color = colors[class_id % len(colors)]
            
            # 绘制边界框
            rect = patches.Rectangle((x1, y1), x2-x1, y2-y1, 
                                   linewidth=2, edgecolor=color, 
                                   facecolor='none')
            ax.add_patch(rect)
            
            # 添加类别标签
            if class_names and class_id < len(class_names):
                label = class_names[class_id]
            else:
                label = f"Class {class_id}"
            
            ax.text(x1, y1-5, label, color=color, fontsize=12, 
                   bbox=dict(facecolor='white', alpha=0.8))
        
        ax.set_title(f"Annotations: {Path(image_path).name}")
        ax.axis('off')
        plt.tight_layout()
        plt.show()
    
    def generate_quality_report(self, annotation_dir: str):
        """生成质量报告"""
        print("标注质量检查报告")
        print("=" * 40)
        
        # 检查一致性问题
        issues = self.check_annotation_consistency(annotation_dir)
        
        print(f"\n一致性检查:")
        for issue_type, issue_list in issues.items():
            print(f"  {issue_type}: {len(issue_list)}个问题")
            if issue_list and len(issue_list) <= 5:
                for issue in issue_list:
                    print(f"    - {issue}")
            elif len(issue_list) > 5:
                print(f"    - 显示前5个: {issue_list[:5]}")
        
        # 分析类别分布
        class_counts, bbox_sizes = self.analyze_class_distribution(annotation_dir)
        
        print(f"\n类别分布:")
        for class_id, count in sorted(class_counts.items()):
            print(f"  类别 {class_id}: {count}个实例")
        
        if bbox_sizes:
            widths, heights = zip(*bbox_sizes)
            print(f"\n边界框统计:")
            print(f"  平均宽度: {np.mean(widths):.3f}")
            print(f"  平均高度: {np.mean(heights):.3f}")
            print(f"  最小面积: {min(w*h for w, h in bbox_sizes):.6f}")
            print(f"  最大面积: {max(w*h for w, h in bbox_sizes):.6f}")

# 使用示例
qc = AnnotationQualityControl()
# qc.generate_quality_report('./annotations')
# qc.visualize_annotations('./images/sample.jpg', './annotations/sample.txt', COCO_CLASSES)
```

## 8.3 数据格式转换

### 8.3.1 常见格式转换器

```python
class FormatConverter:
    """数据格式转换器"""
    
    def __init__(self):
        self.supported_formats = ['yolo', 'coco', 'voc', 'csv']
    
    def voc_to_yolo(self, xml_path: str, image_width: int, image_height: int):
        """VOC XML格式转YOLO格式"""
        tree = ET.parse(xml_path)
        root = tree.getroot()
        
        yolo_annotations = []
        
        for obj in root.findall('object'):
            class_name = obj.find('name').text
            
            # 这里需要类别名到ID的映射
            if class_name in VOC_CLASSES:
                class_id = VOC_CLASSES.index(class_name)
            else:
                continue
            
            bbox = obj.find('bndbox')
            x1 = float(bbox.find('xmin').text)
            y1 = float(bbox.find('ymin').text)
            x2 = float(bbox.find('xmax').text)
            y2 = float(bbox.find('ymax').text)
            
            # 转换为YOLO格式 (归一化的中心点坐标和宽高)
            x_center = (x1 + x2) / 2.0 / image_width
            y_center = (y1 + y2) / 2.0 / image_height
            width = (x2 - x1) / image_width
            height = (y2 - y1) / image_height
            
            yolo_annotations.append(f"{class_id} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}")
        
        return yolo_annotations
    
    def yolo_to_voc(self, yolo_line: str, image_width: int, image_height: int, 
                    class_names: list):
        """YOLO格式转VOC格式"""
        parts = yolo_line.strip().split()
        if len(parts) < 5:
            return None
        
        class_id = int(parts[0])
        x_center = float(parts[1])
        y_center = float(parts[2])
        width = float(parts[3])
        height = float(parts[4])
        
        # 转换为VOC格式的绝对坐标
        x1 = int((x_center - width/2) * image_width)
        y1 = int((y_center - height/2) * image_height)
        x2 = int((x_center + width/2) * image_width)
        y2 = int((y_center + height/2) * image_height)
        
        class_name = class_names[class_id] if class_id < len(class_names) else f"class_{class_id}"
        
        return {
            'class_name': class_name,
            'xmin': max(0, x1),
            'ymin': max(0, y1),
            'xmax': min(image_width, x2),
            'ymax': min(image_height, y2)
        }
    
    def coco_to_yolo(self, coco_annotation: dict, image_width: int, image_height: int):
        """COCO格式转YOLO格式"""
        bbox = coco_annotation['bbox']  # [x, y, width, height]
        x, y, w, h = bbox
        
        # COCO的坐标是左上角坐标，转换为中心点坐标
        x_center = (x + w/2) / image_width
        y_center = (y + h/2) / image_height
        width = w / image_width
        height = h / image_height
        
        class_id = coco_annotation['category_id']
        
        return f"{class_id} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}"
    
    def batch_convert(self, input_dir: str, output_dir: str, 
                     input_format: str, output_format: str):
        """批量格式转换"""
        input_dir = Path(input_dir)
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"Converting from {input_format} to {output_format}")
        print(f"Input: {input_dir}")
        print(f"Output: {output_dir}")
        
        if input_format == 'voc' and output_format == 'yolo':
            self._convert_voc_to_yolo_batch(input_dir, output_dir)
        elif input_format == 'yolo' and output_format == 'voc':
            self._convert_yolo_to_voc_batch(input_dir, output_dir)
        else:
            print(f"Conversion from {input_format} to {output_format} not implemented")
    
    def _convert_voc_to_yolo_batch(self, input_dir: Path, output_dir: Path):
        """批量VOC转YOLO"""
        xml_files = list(input_dir.glob('*.xml'))
        
        for xml_file in xml_files:
            try:
                # 获取对应的图像文件
                img_extensions = ['.jpg', '.jpeg', '.png', '.bmp']
                img_file = None
                
                for ext in img_extensions:
                    potential_img = input_dir / f"{xml_file.stem}{ext}"
                    if potential_img.exists():
                        img_file = potential_img
                        break
                
                if img_file is None:
                    print(f"Image file not found for {xml_file}")
                    continue
                
                # 读取图像尺寸
                image = cv2.imread(str(img_file))
                if image is None:
                    continue
                
                h, w = image.shape[:2]
                
                # 转换标注
                yolo_annotations = self.voc_to_yolo(str(xml_file), w, h)
                
                # 保存YOLO格式文件
                output_file = output_dir / f"{xml_file.stem}.txt"
                with open(output_file, 'w') as f:
                    f.write('\n'.join(yolo_annotations))
                
                print(f"Converted: {xml_file.name} -> {output_file.name}")
                
            except Exception as e:
                print(f"Error converting {xml_file}: {e}")

# 数据集分割工具
class DatasetSplitter:
    """数据集分割工具"""
    
    def __init__(self):
        pass
    
    def split_dataset(self, image_dir: str, annotation_dir: str, 
                     output_dir: str, split_ratios: dict = None):
        """分割数据集"""
        if split_ratios is None:
            split_ratios = {'train': 0.7, 'val': 0.2, 'test': 0.1}
        
        image_dir = Path(image_dir)
        annotation_dir = Path(annotation_dir)
        output_dir = Path(output_dir)
        
        # 获取所有图像文件
        image_extensions = ['.jpg', '.jpeg', '.png', '.bmp']
        image_files = []
        for ext in image_extensions:
            image_files.extend(list(image_dir.glob(f'*{ext}')))
            image_files.extend(list(image_dir.glob(f'*{ext.upper()}')))
        
        # 过滤有对应标注文件的图像
        valid_images = []
        for img_file in image_files:
            ann_file = annotation_dir / f"{img_file.stem}.txt"
            if ann_file.exists():
                valid_images.append(img_file)
        
        print(f"Found {len(valid_images)} valid image-annotation pairs")
        
        # 打乱数据
        np.random.shuffle(valid_images)
        
        # 计算分割点
        total = len(valid_images)
        train_end = int(total * split_ratios['train'])
        val_end = train_end + int(total * split_ratios['val'])
        
        splits = {
            'train': valid_images[:train_end],
            'val': valid_images[train_end:val_end],
            'test': valid_images[val_end:]
        }
        
        # 创建目录结构并复制文件
        for split_name, files in splits.items():
            if not files:
                continue
            
            # 创建目录
            split_img_dir = output_dir / split_name / 'images'
            split_ann_dir = output_dir / split_name / 'labels'
            split_img_dir.mkdir(parents=True, exist_ok=True)
            split_ann_dir.mkdir(parents=True, exist_ok=True)
            
            # 复制文件
            for img_file in files:
                ann_file = annotation_dir / f"{img_file.stem}.txt"
                
                # 复制图像
                import shutil
                shutil.copy2(img_file, split_img_dir / img_file.name)
                
                # 复制标注
                if ann_file.exists():
                    shutil.copy2(ann_file, split_ann_dir / ann_file.name)
            
            print(f"{split_name}: {len(files)} files")
        
        # 生成数据配置文件
        self._create_dataset_yaml(output_dir, list(splits.keys()))
        
        print(f"Dataset split completed. Output: {output_dir}")
    
    def _create_dataset_yaml(self, dataset_dir: Path, splits: list):
        """创建数据集配置文件"""
        config = {
            'path': str(dataset_dir.absolute()),
            'train': 'train/images' if 'train' in splits else None,
            'val': 'val/images' if 'val' in splits else None,
            'test': 'test/images' if 'test' in splits else None,
            'nc': 80,  # 根据实际情况修改
            'names': COCO_CLASSES  # 根据实际情况修改
        }
        
        # 移除None值
        config = {k: v for k, v in config.items() if v is not None}
        
        import yaml
        with open(dataset_dir / 'data.yaml', 'w') as f:
            yaml.dump(config, f, default_flow_style=False)

# 使用示例
converter = FormatConverter()
splitter = DatasetSplitter()

print("数据格式转换和数据集分割工具已初始化")
```

## 8.4 数据增强技术

### 8.4.1 几何变换增强

```python
import albumentations as A
from albumentations.pytorch import ToTensorV2
import random

class DataAugmentation:
    """数据增强工具"""
    
    def __init__(self):
        self.geometric_transforms = A.Compose([
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.1),
            A.RandomRotate90(p=0.5),
            A.Rotate(limit=15, p=0.5),
            A.ShiftScaleRotate(
                shift_limit=0.1,
                scale_limit=0.2,
                rotate_limit=15,
                p=0.5
            ),
            A.Perspective(scale=(0.05, 0.1), p=0.3),
        ], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))
        
        self.color_transforms = A.Compose([
            A.RandomBrightnessContrast(p=0.5),
            A.HueSaturationValue(p=0.5),
            A.RGBShift(p=0.3),
            A.RandomGamma(p=0.3),
            A.CLAHE(p=0.2),
        ], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))
        
        self.noise_transforms = A.Compose([
            A.GaussNoise(p=0.3),
            A.MotionBlur(p=0.2),
            A.GaussianBlur(p=0.2),
            A.ImageCompression(quality_lower=85, quality_upper=100, p=0.3),
        ], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))
        
        self.weather_transforms = A.Compose([
            A.RandomRain(p=0.1),
            A.RandomSnow(p=0.1),
            A.RandomFog(p=0.1),
            A.RandomSunFlare(p=0.1),
        ], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))
    
    def apply_augmentation(self, image: np.ndarray, bboxes: list, 
                          class_labels: list, aug_type: str = 'all'):
        """应用数据增强"""
        if aug_type == 'geometric':
            transform = self.geometric_transforms
        elif aug_type == 'color':
            transform = self.color_transforms
        elif aug_type == 'noise':
            transform = self.noise_transforms
        elif aug_type == 'weather':
            transform = self.weather_transforms
        elif aug_type == 'all':
            # 随机选择一种变换类型
            transforms = [
                self.geometric_transforms,
                self.color_transforms,
                self.noise_transforms,
                self.weather_transforms
            ]
            transform = random.choice(transforms)
        else:
            return image, bboxes, class_labels
        
        try:
            transformed = transform(
                image=image,
                bboxes=bboxes,
                class_labels=class_labels
            )
            return transformed['image'], transformed['bboxes'], transformed['class_labels']
        except Exception as e:
            print(f"Augmentation error: {e}")
            return image, bboxes, class_labels
    
    def create_training_transform(self, image_size: int = 640):
        """创建训练时的变换管道"""
        return A.Compose([
            A.LongestMaxSize(max_size=image_size),
            A.PadIfNeeded(min_height=image_size, min_width=image_size, 
                         border_mode=cv2.BORDER_CONSTANT, value=0),
            
            # 几何变换
            A.HorizontalFlip(p=0.5),
            A.ShiftScaleRotate(
                shift_limit=0.1,
                scale_limit=0.2,
                rotate_limit=10,
                p=0.5
            ),
            
            # 颜色变换
            A.RandomBrightnessContrast(
                brightness_limit=0.2,
                contrast_limit=0.2,
                p=0.5
            ),
            A.HueSaturationValue(
                hue_shift_limit=10,
                sat_shift_limit=20,
                val_shift_limit=20,
                p=0.5
            ),
            
            # 噪声和模糊
            A.OneOf([
                A.GaussNoise(var_limit=(10, 50)),
                A.GaussianBlur(blur_limit=(1, 3)),
                A.MotionBlur(blur_limit=(1, 3)),
            ], p=0.3),
            
            # 归一化
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2(),
        ], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))
    
    def create_validation_transform(self, image_size: int = 640):
        """创建验证时的变换管道"""
        return A.Compose([
            A.LongestMaxSize(max_size=image_size),
            A.PadIfNeeded(min_height=image_size, min_width=image_size, 
                         border_mode=cv2.BORDER_CONSTANT, value=0),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2(),
        ], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))

# Mosaic增强实现
class MosaicAugmentation:
    """Mosaic数据增强"""
    
    def __init__(self, image_size: int = 640):
        self.image_size = image_size
    
    def apply_mosaic(self, images: list, annotations_list: list):
        """应用Mosaic增强"""
        if len(images) != 4 or len(annotations_list) != 4:
            raise ValueError("Mosaic requires exactly 4 images and annotations")
        
        # 创建mosaic画布
        mosaic_image = np.zeros((self.image_size, self.image_size, 3), dtype=np.uint8)
        mosaic_boxes = []
        mosaic_labels = []
        
        # 随机确定分割点
        xc = random.randint(self.image_size // 4, 3 * self.image_size // 4)
        yc = random.randint(self.image_size // 4, 3 * self.image_size // 4)
        
        # 四个位置的坐标
        positions = [
            (0, 0, xc, yc),           # 左上
            (xc, 0, self.image_size, yc),      # 右上
            (0, yc, xc, self.image_size),      # 左下
            (xc, yc, self.image_size, self.image_size)  # 右下
        ]
        
        for i, (image, annotations) in enumerate(zip(images, annotations_list)):
            x1a, y1a, x2a, y2a = positions[i]
            
            # 调整图像大小以适应区域
            h, w = image.shape[:2]
            scale = min((x2a - x1a) / w, (y2a - y1a) / h)
            new_w, new_h = int(w * scale), int(h * scale)
            
            if new_w > 0 and new_h > 0:
                resized_image = cv2.resize(image, (new_w, new_h))
                
                # 计算放置位置
                x_offset = (x2a - x1a - new_w) // 2
                y_offset = (y2a - y1a - new_h) // 2
                
                x1b, y1b = x1a + x_offset, y1a + y_offset
                x2b, y2b = x1b + new_w, y1b + new_h
                
                # 放置图像
                mosaic_image[y1b:y2b, x1b:x2b] = resized_image
                
                # 调整标注坐标
                for annotation in annotations:
                    class_id, x_center, y_center, width, height = annotation
                    
                    # 转换到新的坐标系统
                    x_center = x1b + x_center * new_w
                    y_center = y1b + y_center * new_h
                    width *= new_w
                    height *= new_h
                    
                    # 归一化到mosaic图像
                    x_center /= self.image_size
                    y_center /= self.image_size
                    width /= self.image_size
                    height /= self.image_size
                    
                    # 检查边界框是否在图像内
                    if 0 < x_center < 1 and 0 < y_center < 1 and width > 0 and height > 0:
                        mosaic_boxes.append([x_center, y_center, width, height])
                        mosaic_labels.append(class_id)
        
        return mosaic_image, mosaic_boxes, mosaic_labels

# 使用示例
data_aug = DataAugmentation()
mosaic_aug = MosaicAugmentation()

print("数据增强工具初始化完成")
```

## 8.5 数据预处理流程

### 8.5.1 完整的数据处理管道

```python
class DataProcessingPipeline:
    """完整的数据处理管道"""
    
    def __init__(self, config: dict):
        self.config = config
        self.augmentation = DataAugmentation()
        self.format_converter = FormatConverter()
        self.quality_controller = AnnotationQualityControl()
    
    def process_raw_dataset(self, input_dir: str, output_dir: str):
        """处理原始数据集"""
        print("开始处理原始数据集...")
        
        # 1. 检查数据质量
        print("1. 检查数据质量...")
        issues = self.quality_controller.check_annotation_consistency(
            os.path.join(input_dir, 'annotations')
        )
        
        if any(len(issue_list) > 0 for issue_list in issues.values()):
            print("发现数据质量问题，请检查:")
            for issue_type, issue_list in issues.items():
                if issue_list:
                    print(f"  {issue_type}: {len(issue_list)}个问题")
        
        # 2. 格式转换（如需要）
        print("2. 检查并转换数据格式...")
        if self.config.get('convert_format'):
            self.format_converter.batch_convert(
                os.path.join(input_dir, 'annotations'),
                os.path.join(output_dir, 'annotations'),
                self.config['input_format'],
                self.config['output_format']
            )
        
        # 3. 数据分割
        print("3. 分割数据集...")
        splitter = DatasetSplitter()
        splitter.split_dataset(
            os.path.join(input_dir, 'images'),
            os.path.join(input_dir, 'annotations'),
            output_dir,
            self.config.get('split_ratios', {'train': 0.7, 'val': 0.2, 'test': 0.1})
        )
        
        # 4. 生成统计报告
        print("4. 生成统计报告...")
        self._generate_dataset_statistics(output_dir)
        
        print("数据处理完成!")
    
    def _generate_dataset_statistics(self, dataset_dir: str):
        """生成数据集统计报告"""
        dataset_dir = Path(dataset_dir)
        
        stats = {}
        
        for split in ['train', 'val', 'test']:
            split_dir = dataset_dir / split
            if not split_dir.exists():
                continue
            
            img_dir = split_dir / 'images'
            label_dir = split_dir / 'labels'
            
            # 统计图像数量
            img_count = len(list(img_dir.glob('*.jpg')) + list(img_dir.glob('*.png')))
            
            # 统计标注数量和类别分布
            class_counts = Counter()
            obj_count = 0
            
            for label_file in label_dir.glob('*.txt'):
                try:
                    with open(label_file, 'r') as f:
                        lines = f.readlines()
                    
                    for line in lines:
                        parts = line.strip().split()
                        if len(parts) >= 5:
                            class_id = int(parts[0])
                            class_counts[class_id] += 1
                            obj_count += 1
                
                except Exception as e:
                    print(f"Error reading {label_file}: {e}")
            
            stats[split] = {
                'images': img_count,
                'objects': obj_count,
                'classes': len(class_counts),
                'class_distribution': dict(class_counts)
            }
        
        # 保存统计报告
        report_path = dataset_dir / 'dataset_statistics.json'
        with open(report_path, 'w') as f:
            json.dump(stats, f, indent=2)
        
        # 打印统计信息
        print(f"\n数据集统计:")
        print("=" * 40)
        
        total_images = sum(split_stats['images'] for split_stats in stats.values())
        total_objects = sum(split_stats['objects'] for split_stats in stats.values())
        
        print(f"总图像数: {total_images:,}")
        print(f"总目标数: {total_objects:,}")
        
        for split, split_stats in stats.items():
            print(f"\n{split.upper()}集:")
            print(f"  图像: {split_stats['images']:,}")
            print(f"  目标: {split_stats['objects']:,}")
            print(f"  类别: {split_stats['classes']}")
        
        print(f"\n统计报告已保存至: {report_path}")

# 配置示例
config = {
    'convert_format': False,
    'input_format': 'voc',
    'output_format': 'yolo',
    'split_ratios': {'train': 0.7, 'val': 0.2, 'test': 0.1},
    'image_size': 640,
    'augmentation_prob': 0.5
}

# 使用示例
pipeline = DataProcessingPipeline(config)
print("数据处理管道已初始化")
```

## 8.6 章节总结

### 8.6.1 数据准备最佳实践

```python
def data_preparation_best_practices():
    """数据准备最佳实践"""
    
    best_practices = {
        "数据质量": [
            "确保标注准确性和一致性",
            "处理边界框重叠和遮挡情况",
            "避免标注错误和遗漏",
            "定期进行质量检查和验证"
        ],
        
        "数据平衡": [
            "保持类别分布相对均衡",
            "收集各种场景和条件的数据",
            "包含不同尺度的目标",
            "考虑困难样本的比例"
        ],
        
        "数据增强": [
            "选择适合任务的增强策略",
            "避免过度增强导致的失真",
            "保持增强后的标注准确性",
            "验证增强效果的有效性"
        ],
        
        "格式管理": [
            "使用标准化的数据格式",
            "保持良好的目录结构",
            "建立版本控制机制",
            "提供详细的数据描述文档"
        ],
        
        "处理流程": [
            "建立自动化的处理管道",
            "实施数据验证和测试",
            "保留原始数据的备份",
            "记录所有处理步骤和参数"
        ]
    }
    
    print("数据准备最佳实践:")
    print("=" * 50)
    
    for category, practices in best_practices.items():
        print(f"\n{category}:")
        for practice in practices:
            print(f"  • {practice}")
    
    print(f"\n数据准备检查清单:")
    checklist = [
        "□ 数据格式正确且一致",
        "□ 标注质量检查通过",
        "□ 类别分布合理",
        "□ 数据集分割完成",
        "□ 增强策略已验证",
        "□ 统计报告已生成",
        "□ 配置文件已创建",
        "□ 备份和版本控制已建立"
    ]
    
    for item in checklist:
        print(f"  {item}")

# 运行最佳实践指南
data_preparation_best_practices()

print("\n数据集准备与标注工具使用完成！")
print("下一步：开始模型训练")
```

完成本章学习后，你应该能够：

1. ✅ 了解常用目标检测数据集的特点和用途
2. ✅ 熟练使用LabelImg等标注工具
3. ✅ 实施有效的标注质量控制措施
4. ✅ 进行各种数据格式之间的转换
5. ✅ 应用多种数据增强技术
6. ✅ 构建完整的数据处理管道
7. ✅ 遵循数据准备的最佳实践

数据是深度学习成功的基础。高质量的数据集准备是YOLO模型训练成功的关键因素。通过本章的学习，你已经掌握了从数据收集、标注、处理到增强的完整流程，为后续的模型训练奠定了坚实的基础。

---

*本章重点：掌握高质量数据集的准备方法，建立完整的数据处理工作流，确保训练数据的质量和多样性。*