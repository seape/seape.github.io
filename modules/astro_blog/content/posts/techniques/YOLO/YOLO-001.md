---
title: "第1章：计算机视觉与目标检测基础"
date: 2025-10-02
icon: circle-dot
author: Haiyue
category:
  - YOLO
  - 图像识别
star: false
---
# 第1章：计算机视觉与目标检测基础

## 学习目标
1. 理解计算机视觉的基本概念和应用场景
2. 掌握图像处理的基础知识
3. 了解目标检测任务的定义和挑战
4. 熟悉目标检测评价指标（mAP、IoU等）

## 1.1 计算机视觉基本概念

### 1.1.1 什么是计算机视觉
计算机视觉（Computer Vision, CV）是人工智能的一个重要分支，旨在让计算机能够像人类一样"看懂"图像和视频。

**核心任务包括：**
- **图像分类**：判断图像中包含什么物体
- **目标检测**：找出图像中物体的位置和类别
- **语义分割**：为图像中每个像素分配类别标签
- **实例分割**：区分同一类别的不同实例
- **姿态估计**：检测人体或物体的关键点

### 1.1.2 计算机视觉的应用场景

```python
# 计算机视觉应用领域
cv_applications = {
    "自动驾驶": {
        "任务": ["车辆检测", "行人检测", "交通标志识别", "车道线检测"],
        "技术": ["多目标检测", "深度估计", "光流计算", "SLAM"]
    },
    "医疗影像": {
        "任务": ["病灶检测", "器官分割", "疾病诊断", "手术导航"],
        "技术": ["医学图像分析", "3D重建", "图像配准", "CAD系统"]
    },
    "安防监控": {
        "任务": ["人脸识别", "行为分析", "异常检测", "车牌识别"],
        "技术": ["实时检测", "目标跟踪", "行为识别", "人群分析"]
    },
    "工业检测": {
        "任务": ["缺陷检测", "质量控制", "装配检验", "尺寸测量"],
        "技术": ["表面检测", "形状匹配", "精密测量", "自动化检测"]
    },
    "零售电商": {
        "任务": ["商品识别", "虚拟试穿", "智能推荐", "库存管理"],
        "技术": ["物体识别", "图像搜索", "AR/VR", "视觉推荐"]
    }
}
```

## 1.2 图像处理基础知识

### 1.2.1 数字图像表示

```python
import numpy as np
import cv2
from PIL import Image
import matplotlib.pyplot as plt

class ImageProcessor:
    def __init__(self):
        self.image = None
    
    def load_image(self, image_path):
        """加载图像"""
        self.image = cv2.imread(image_path)
        return self.image
    
    def image_info(self):
        """获取图像信息"""
        if self.image is not None:
            height, width, channels = self.image.shape
            print(f"图像尺寸: {width} x {height}")
            print(f"通道数: {channels}")
            print(f"数据类型: {self.image.dtype}")
            print(f"像素值范围: {self.image.min()} - {self.image.max()}")
    
    def color_space_conversion(self):
        """颜色空间转换"""
        conversions = {}
        
        # BGR to RGB
        conversions['RGB'] = cv2.cvtColor(self.image, cv2.COLOR_BGR2RGB)
        
        # BGR to Gray
        conversions['Gray'] = cv2.cvtColor(self.image, cv2.COLOR_BGR2GRAY)
        
        # BGR to HSV
        conversions['HSV'] = cv2.cvtColor(self.image, cv2.COLOR_BGR2HSV)
        
        # BGR to LAB
        conversions['LAB'] = cv2.cvtColor(self.image, cv2.COLOR_BGR2LAB)
        
        return conversions
    
    def basic_operations(self):
        """基本图像操作"""
        operations = {}
        
        # 图像缩放
        operations['resized'] = cv2.resize(self.image, (640, 480))
        
        # 图像旋转
        center = (self.image.shape[1]//2, self.image.shape[0]//2)
        rotation_matrix = cv2.getRotationMatrix2D(center, 45, 1.0)
        operations['rotated'] = cv2.warpAffine(self.image, rotation_matrix, 
                                             (self.image.shape[1], self.image.shape[0]))
        
        # 图像翻转
        operations['flipped_h'] = cv2.flip(self.image, 1)  # 水平翻转
        operations['flipped_v'] = cv2.flip(self.image, 0)  # 垂直翻转
        
        # 图像裁剪
        h, w = self.image.shape[:2]
        operations['cropped'] = self.image[h//4:3*h//4, w//4:3*w//4]
        
        return operations

# 示例使用
processor = ImageProcessor()
# image = processor.load_image('example.jpg')
# processor.image_info()
# conversions = processor.color_space_conversion()
# operations = processor.basic_operations()
```

### 1.2.2 图像预处理技术

```python
class ImagePreprocessor:
    def __init__(self):
        pass
    
    def noise_reduction(self, image):
        """噪声降低"""
        methods = {}
        
        # 高斯滤波
        methods['gaussian'] = cv2.GaussianBlur(image, (5, 5), 0)
        
        # 中值滤波
        methods['median'] = cv2.medianBlur(image, 5)
        
        # 双边滤波
        methods['bilateral'] = cv2.bilateralFilter(image, 9, 75, 75)
        
        return methods
    
    def edge_detection(self, image):
        """边缘检测"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        edges = {}
        
        # Canny边缘检测
        edges['canny'] = cv2.Canny(gray, 50, 150)
        
        # Sobel边缘检测
        edges['sobel_x'] = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        edges['sobel_y'] = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        edges['sobel'] = np.sqrt(edges['sobel_x']**2 + edges['sobel_y']**2)
        
        # Laplacian边缘检测
        edges['laplacian'] = cv2.Laplacian(gray, cv2.CV_64F)
        
        return edges
    
    def histogram_analysis(self, image):
        """直方图分析和均衡化"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # 计算直方图
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        
        # 直方图均衡化
        equalized = cv2.equalizeHist(gray)
        
        # 自适应直方图均衡化
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        adaptive_eq = clahe.apply(gray)
        
        return {
            'histogram': hist,
            'equalized': equalized,
            'adaptive_equalized': adaptive_eq
        }

# 示例使用
preprocessor = ImagePreprocessor()
# noise_methods = preprocessor.noise_reduction(image)
# edge_results = preprocessor.edge_detection(image)
# hist_results = preprocessor.histogram_analysis(image)
```

## 1.3 目标检测任务定义

### 1.3.1 什么是目标检测
目标检测（Object Detection）是计算机视觉的核心任务之一，目标是在图像中同时完成：
1. **分类（Classification）**：确定图像中存在哪些类别的物体
2. **定位（Localization）**：确定这些物体在图像中的具体位置

### 1.3.2 目标检测的挑战

```python
class ObjectDetectionChallenges:
    def __init__(self):
        self.challenges = {
            "尺度变化": {
                "描述": "同一物体在不同距离下大小不同",
                "解决方案": ["多尺度训练", "特征金字塔", "尺度增强"],
                "示例": "远处的车辆很小，近处的车辆很大"
            },
            "遮挡问题": {
                "描述": "物体被其他物体部分或完全遮挡",
                "解决方案": ["部分检测", "上下文信息", "多视角融合"],
                "示例": "人群中的人脸检测，树叶遮挡的交通标志"
            },
            "光照变化": {
                "描述": "不同光照条件下物体外观变化",
                "解决方案": ["数据增强", "光照归一化", "鲁棒特征"],
                "示例": "白天和夜晚的车辆检测，阴影下的行人"
            },
            "背景复杂": {
                "描述": "复杂背景中的目标检测困难",
                "解决方案": ["上下文建模", "背景抑制", "注意力机制"],
                "示例": "森林中的动物，街道中的行人"
            },
            "类内差异": {
                "描述": "同一类别内部物体外观差异很大",
                "解决方案": ["多样化训练数据", "特征学习", "数据增强"],
                "示例": "不同品种的狗，不同款式的车"
            },
            "实时性要求": {
                "描述": "许多应用需要实时检测性能",
                "解决方案": ["轻量化网络", "模型压缩", "硬件优化"],
                "示例": "自动驾驶，实时监控系统"
            }
        }
    
    def print_challenges(self):
        """打印所有挑战"""
        for challenge, details in self.challenges.items():
            print(f"\n{challenge}:")
            print(f"  描述: {details['描述']}")
            print(f"  解决方案: {', '.join(details['解决方案'])}")
            print(f"  示例: {details['示例']}")

# 创建实例
challenges = ObjectDetectionChallenges()
challenges.print_challenges()
```

### 1.3.3 目标检测算法分类

```python
class DetectionAlgorithmTaxonomy:
    def __init__(self):
        self.algorithms = {
            "传统方法": {
                "特点": "基于手工特征和传统机器学习",
                "代表算法": [
                    "Viola-Jones",
                    "HOG + SVM",
                    "DPM (Deformable Part Models)"
                ],
                "优点": ["理论清晰", "计算资源需求低"],
                "缺点": ["特征表达能力有限", "泛化能力差"]
            },
            "两阶段方法": {
                "特点": "先生成候选区域，再进行分类和回归",
                "代表算法": [
                    "R-CNN",
                    "Fast R-CNN",
                    "Faster R-CNN",
                    "Mask R-CNN"
                ],
                "优点": ["检测精度高", "适合复杂场景"],
                "缺点": ["速度较慢", "系统复杂"]
            },
            "一阶段方法": {
                "特点": "直接预测物体类别和位置",
                "代表算法": [
                    "YOLO系列",
                    "SSD",
                    "RetinaNet",
                    "FCOS"
                ],
                "优点": ["速度快", "端到端训练", "适合实时应用"],
                "缺点": ["精度略低于两阶段", "小物体检测困难"]
            },
            "Transformer方法": {
                "特点": "基于注意力机制的检测方法",
                "代表算法": [
                    "DETR",
                    "Deformable DETR",
                    "Sparse DETR"
                ],
                "优点": ["全局建模能力强", "无需NMS后处理"],
                "缺点": ["训练收敛慢", "计算复杂度高"]
            }
        }
    
    def compare_methods(self):
        """比较不同方法"""
        comparison = {
            "方法类型": [],
            "速度": [],
            "精度": [],
            "复杂度": [],
            "适用场景": []
        }
        
        for method, details in self.algorithms.items():
            comparison["方法类型"].append(method)
            
            if "快" in details.get("优点", []):
                comparison["速度"].append("快")
            elif method == "两阶段方法":
                comparison["速度"].append("慢")
            else:
                comparison["速度"].append("中等")
        
        return comparison

taxonomy = DetectionAlgorithmTaxonomy()
```

## 1.4 目标检测评价指标

### 1.4.1 IoU（Intersection over Union）

```python
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches

class DetectionMetrics:
    def __init__(self):
        pass
    
    def calculate_iou(self, box1, box2):
        """
        计算两个边界框的IoU
        box格式: [x1, y1, x2, y2]
        """
        # 计算交集区域的坐标
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        
        # 检查是否有交集
        if x2 <= x1 or y2 <= y1:
            return 0.0
        
        # 计算交集面积
        intersection = (x2 - x1) * (y2 - y1)
        
        # 计算各自面积
        area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
        area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
        
        # 计算并集面积
        union = area1 + area2 - intersection
        
        # 计算IoU
        iou = intersection / union
        return iou
    
    def visualize_iou(self, box1, box2):
        """可视化IoU计算过程"""
        fig, ax = plt.subplots(1, 1, figsize=(8, 8))
        
        # 绘制边界框
        rect1 = patches.Rectangle((box1[0], box1[1]), 
                                 box1[2]-box1[0], box1[3]-box1[1],
                                 linewidth=2, edgecolor='red', 
                                 facecolor='red', alpha=0.3, label='Ground Truth')
        
        rect2 = patches.Rectangle((box2[0], box2[1]), 
                                 box2[2]-box2[0], box2[3]-box2[1],
                                 linewidth=2, edgecolor='blue', 
                                 facecolor='blue', alpha=0.3, label='Prediction')
        
        ax.add_patch(rect1)
        ax.add_patch(rect2)
        
        # 计算并绘制交集
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        
        if x2 > x1 and y2 > y1:
            intersection_rect = patches.Rectangle((x1, y1), x2-x1, y2-y1,
                                                linewidth=2, edgecolor='green',
                                                facecolor='green', alpha=0.5,
                                                label='Intersection')
            ax.add_patch(intersection_rect)
        
        # 计算IoU
        iou = self.calculate_iou(box1, box2)
        
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.set_title(f'IoU = {iou:.3f}')
        ax.legend()
        ax.grid(True)
        
        return fig, iou
    
    def iou_threshold_analysis(self):
        """IoU阈值分析"""
        thresholds = {
            0.1: "很低的重叠，通常不认为是正确检测",
            0.3: "较低的重叠，可能的检测",
            0.5: "中等重叠，PASCAL VOC标准",
            0.7: "较高重叠，COCO评估标准",
            0.9: "很高的重叠，几乎完美匹配"
        }
        
        for threshold, description in thresholds.items():
            print(f"IoU = {threshold}: {description}")
        
        return thresholds

# 示例使用
metrics = DetectionMetrics()

# 示例边界框
gt_box = [2, 2, 6, 6]  # Ground Truth
pred_box = [3, 3, 7, 7]  # Prediction

iou_score = metrics.calculate_iou(gt_box, pred_box)
print(f"IoU Score: {iou_score:.3f}")

# 可视化IoU
# fig, iou = metrics.visualize_iou(gt_box, pred_box)
# plt.show()

# IoU阈值分析
thresholds = metrics.iou_threshold_analysis()
```

### 1.4.2 精确率、召回率和F1分数

```python
class PrecisionRecallMetrics:
    def __init__(self):
        pass
    
    def calculate_confusion_matrix(self, predictions, ground_truths, iou_threshold=0.5):
        """
        计算混淆矩阵组件
        predictions: [(box, confidence, class_id), ...]
        ground_truths: [(box, class_id), ...]
        """
        tp = 0  # True Positives
        fp = 0  # False Positives
        fn = 0  # False Negatives
        
        matched_gt = set()  # 已匹配的ground truth
        
        # 按置信度排序预测结果
        predictions = sorted(predictions, key=lambda x: x[1], reverse=True)
        
        for pred_box, confidence, pred_class in predictions:
            best_iou = 0
            best_gt_idx = -1
            
            # 找到最佳匹配的ground truth
            for gt_idx, (gt_box, gt_class) in enumerate(ground_truths):
                if gt_class != pred_class:
                    continue
                
                iou = self.calculate_iou(pred_box, gt_box)
                if iou > best_iou:
                    best_iou = iou
                    best_gt_idx = gt_idx
            
            # 判断是否为正确检测
            if best_iou >= iou_threshold and best_gt_idx not in matched_gt:
                tp += 1
                matched_gt.add(best_gt_idx)
            else:
                fp += 1
        
        # 计算未检测到的ground truth
        fn = len(ground_truths) - len(matched_gt)
        
        return tp, fp, fn
    
    def calculate_iou(self, box1, box2):
        """计算IoU（复用前面的函数）"""
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        
        if x2 <= x1 or y2 <= y1:
            return 0.0
        
        intersection = (x2 - x1) * (y2 - y1)
        area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
        area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
        union = area1 + area2 - intersection
        
        return intersection / union
    
    def calculate_metrics(self, tp, fp, fn):
        """计算精确率、召回率和F1分数"""
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        return {
            'precision': precision,
            'recall': recall,
            'f1_score': f1_score,
            'tp': tp,
            'fp': fp,
            'fn': fn
        }
    
    def plot_pr_curve(self, predictions, ground_truths, class_id=0):
        """绘制Precision-Recall曲线"""
        # 按置信度排序
        predictions = sorted(predictions, key=lambda x: x[1], reverse=True)
        
        precisions = []
        recalls = []
        
        for threshold in np.arange(0.1, 1.0, 0.1):
            filtered_predictions = [(box, conf, cls) for box, conf, cls in predictions if conf >= threshold]
            
            tp, fp, fn = self.calculate_confusion_matrix(filtered_predictions, ground_truths)
            metrics = self.calculate_metrics(tp, fp, fn)
            
            precisions.append(metrics['precision'])
            recalls.append(metrics['recall'])
        
        # 绘制PR曲线
        plt.figure(figsize=(8, 6))
        plt.plot(recalls, precisions, 'b-', linewidth=2)
        plt.xlabel('Recall')
        plt.ylabel('Precision')
        plt.title('Precision-Recall Curve')
        plt.grid(True)
        plt.xlim([0, 1])
        plt.ylim([0, 1])
        
        # 计算AP（Area under PR curve）
        ap = np.trapz(precisions, recalls)
        plt.text(0.6, 0.2, f'AP = {ap:.3f}', fontsize=12, 
                bbox=dict(boxstyle="round,pad=0.3", facecolor="yellow"))
        
        return precisions, recalls, ap

# 示例使用
pr_metrics = PrecisionRecallMetrics()

# 示例数据
predictions = [
    ([1, 1, 3, 3], 0.9, 0),  # (box, confidence, class_id)
    ([2, 2, 4, 4], 0.8, 0),
    ([5, 5, 7, 7], 0.7, 1)
]

ground_truths = [
    ([1, 1, 3, 3], 0),  # (box, class_id)
    ([5, 5, 7, 7], 1)
]

tp, fp, fn = pr_metrics.calculate_confusion_matrix(predictions, ground_truths)
metrics_result = pr_metrics.calculate_metrics(tp, fp, fn)

print("检测性能指标:")
print(f"True Positives: {metrics_result['tp']}")
print(f"False Positives: {metrics_result['fp']}")
print(f"False Negatives: {metrics_result['fn']}")
print(f"Precision: {metrics_result['precision']:.3f}")
print(f"Recall: {metrics_result['recall']:.3f}")
print(f"F1 Score: {metrics_result['f1_score']:.3f}")
```

### 1.4.3 mAP（mean Average Precision）

```python
class mAPCalculator:
    def __init__(self):
        pass
    
    def calculate_ap(self, precision, recall):
        """
        计算单个类别的AP（Average Precision）
        使用插值方法计算
        """
        # 添加端点
        precision = np.concatenate(([0], precision, [0]))
        recall = np.concatenate(([0], recall, [1]))
        
        # 确保precision单调递减
        for i in range(len(precision) - 1, 0, -1):
            precision[i - 1] = max(precision[i - 1], precision[i])
        
        # 找到recall变化的点
        indices = np.where(recall[1:] != recall[:-1])[0]
        
        # 计算面积
        ap = np.sum((recall[indices + 1] - recall[indices]) * precision[indices + 1])
        
        return ap
    
    def calculate_map(self, all_predictions, all_ground_truths, num_classes, iou_thresholds=None):
        """
        计算多类别的mAP
        """
        if iou_thresholds is None:
            iou_thresholds = [0.5]  # PASCAL VOC标准
        
        class_aps = {}
        
        for class_id in range(num_classes):
            # 提取当前类别的预测和ground truth
            class_predictions = [(box, conf, cls) for box, conf, cls in all_predictions if cls == class_id]
            class_ground_truths = [(box, cls) for box, cls in all_ground_truths if cls == class_id]
            
            if len(class_ground_truths) == 0:
                continue
            
            class_aps[class_id] = []
            
            for iou_threshold in iou_thresholds:
                # 计算不同置信度阈值下的precision和recall
                precisions = []
                recalls = []
                
                # 按置信度排序
                class_predictions.sort(key=lambda x: x[1], reverse=True)
                
                tp_cumsum = 0
                fp_cumsum = 0
                matched_gt = set()
                
                for pred_box, confidence, pred_class in class_predictions:
                    best_iou = 0
                    best_gt_idx = -1
                    
                    for gt_idx, (gt_box, gt_class) in enumerate(class_ground_truths):
                        iou = self.calculate_iou(pred_box, gt_box)
                        if iou > best_iou:
                            best_iou = iou
                            best_gt_idx = gt_idx
                    
                    if best_iou >= iou_threshold and best_gt_idx not in matched_gt:
                        tp_cumsum += 1
                        matched_gt.add(best_gt_idx)
                    else:
                        fp_cumsum += 1
                    
                    precision = tp_cumsum / (tp_cumsum + fp_cumsum)
                    recall = tp_cumsum / len(class_ground_truths)
                    
                    precisions.append(precision)
                    recalls.append(recall)
                
                # 计算AP
                if len(precisions) > 0:
                    ap = self.calculate_ap(np.array(precisions), np.array(recalls))
                    class_aps[class_id].append(ap)
        
        # 计算mAP
        all_aps = []
        for class_id, aps in class_aps.items():
            if len(aps) > 0:
                all_aps.extend(aps)
        
        map_score = np.mean(all_aps) if len(all_aps) > 0 else 0.0
        
        return {
            'mAP': map_score,
            'class_APs': class_aps,
            'detailed_results': {
                'per_class_ap': {cls: np.mean(aps) if len(aps) > 0 else 0 for cls, aps in class_aps.items()},
                'iou_thresholds': iou_thresholds
            }
        }
    
    def calculate_iou(self, box1, box2):
        """计算IoU"""
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        
        if x2 <= x1 or y2 <= y1:
            return 0.0
        
        intersection = (x2 - x1) * (y2 - y1)
        area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
        area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
        union = area1 + area2 - intersection
        
        return intersection / union
    
    def coco_map(self, all_predictions, all_ground_truths, num_classes):
        """
        计算COCO标准的mAP（IoU从0.5到0.95，步长0.05）
        """
        iou_thresholds = np.arange(0.5, 1.0, 0.05)
        
        results = self.calculate_map(all_predictions, all_ground_truths, 
                                   num_classes, iou_thresholds)
        
        # 额外计算mAP@0.5和mAP@0.75
        map_50 = self.calculate_map(all_predictions, all_ground_truths, 
                                  num_classes, [0.5])['mAP']
        map_75 = self.calculate_map(all_predictions, all_ground_truths, 
                                  num_classes, [0.75])['mAP']
        
        results['mAP@0.5'] = map_50
        results['mAP@0.75'] = map_75
        
        return results

# 示例使用
map_calculator = mAPCalculator()

# 示例数据（多类别）
all_predictions = [
    ([1, 1, 3, 3], 0.9, 0),  # 类别0
    ([2, 2, 4, 4], 0.8, 0),
    ([5, 5, 7, 7], 0.7, 1),  # 类别1
    ([6, 6, 8, 8], 0.6, 1)
]

all_ground_truths = [
    ([1, 1, 3, 3], 0),
    ([5, 5, 7, 7], 1),
    ([8, 8, 10, 10], 1)
]

# 计算mAP
map_results = map_calculator.calculate_map(all_predictions, all_ground_truths, num_classes=2)
print("mAP结果:")
print(f"mAP: {map_results['mAP']:.3f}")
print("各类别AP:")
for class_id, ap in map_results['detailed_results']['per_class_ap'].items():
    print(f"  类别{class_id}: {ap:.3f}")

# 计算COCO风格的mAP
coco_results = map_calculator.coco_map(all_predictions, all_ground_truths, num_classes=2)
print(f"\nCOCO风格评估:")
print(f"mAP@0.5:0.95: {coco_results['mAP']:.3f}")
print(f"mAP@0.5: {coco_results['mAP@0.5']:.3f}")
print(f"mAP@0.75: {coco_results['mAP@0.75']:.3f}")
```

## 1.5 评价指标比较与选择

```python
class MetricsComparison:
    def __init__(self):
        self.metrics_overview = {
            "IoU": {
                "用途": "衡量边界框重叠程度",
                "范围": "[0, 1]",
                "优点": ["直观易懂", "计算简单", "广泛使用"],
                "缺点": ["只考虑重叠", "不考虑类别", "阈值依赖"],
                "适用场景": "边界框质量评估"
            },
            "Precision": {
                "用途": "衡量检测结果的准确性",
                "范围": "[0, 1]",
                "优点": ["反映误检情况", "计算直观"],
                "缺点": ["不考虑漏检", "阈值敏感"],
                "适用场景": "关注误检率的应用"
            },
            "Recall": {
                "用途": "衡量检测的完整性",
                "范围": "[0, 1]",
                "优点": ["反映漏检情况", "计算直观"],
                "缺点": ["不考虑误检", "阈值敏感"],
                "适用场景": "关注漏检率的应用"
            },
            "F1-Score": {
                "用途": "平衡精确率和召回率",
                "范围": "[0, 1]",
                "优点": ["综合指标", "单一数值"],
                "缺点": ["等权重平均", "可能掩盖细节"],
                "适用场景": "需要平衡的通用评估"
            },
            "AP": {
                "用途": "单类别综合性能评估",
                "范围": "[0, 1]",
                "优点": ["考虑所有阈值", "综合评估", "标准化"],
                "缺点": ["计算复杂", "解释困难"],
                "适用场景": "单类别深度评估"
            },
            "mAP": {
                "用途": "多类别综合性能评估",
                "范围": "[0, 1]",
                "优点": ["多类别综合", "行业标准", "可比较"],
                "缺点": ["平均可能掩盖差异", "计算最复杂"],
                "适用场景": "多类别检测评估标准"
            }
        }
    
    def print_comparison(self):
        """打印指标比较"""
        print("目标检测评价指标比较:")
        print("=" * 60)
        
        for metric, details in self.metrics_overview.items():
            print(f"\n{metric}:")
            for key, value in details.items():
                if isinstance(value, list):
                    print(f"  {key}: {', '.join(value)}")
                else:
                    print(f"  {key}: {value}")
    
    def choose_metrics(self, application_type):
        """根据应用类型推荐指标"""
        recommendations = {
            "自动驾驶": {
                "主要指标": ["mAP@0.5", "Recall"],
                "原因": "安全关键，不能漏检，精度要求高",
                "额外考虑": ["实时性", "小物体检测能力"]
            },
            "工业检测": {
                "主要指标": ["Precision", "F1-Score"],
                "原因": "避免误检导致的浪费，平衡精度和完整性",
                "额外考虑": ["缺陷类型平衡", "检测一致性"]
            },
            "安防监控": {
                "主要指标": ["Recall", "mAP@0.5"],
                "原因": "不能漏报可疑目标，整体性能要好",
                "额外考虑": ["实时处理能力", "夜间性能"]
            },
            "医疗影像": {
                "主要指标": ["Recall", "Precision"],
                "原因": "不能漏诊，也要控制误诊",
                "额外考虑": ["敏感性", "特异性", "临床意义"]
            },
            "零售应用": {
                "主要指标": ["mAP", "F1-Score"],
                "原因": "多类别商品，需要平衡性能",
                "额外考虑": ["用户体验", "成本效益"]
            }
        }
        
        if application_type in recommendations:
            rec = recommendations[application_type]
            print(f"\n{application_type}应用推荐指标:")
            print(f"主要指标: {', '.join(rec['主要指标'])}")
            print(f"推荐原因: {rec['原因']}")
            print(f"额外考虑: {', '.join(rec['额外考虑'])}")
        else:
            print("未找到该应用类型的推荐，请选择通用指标：mAP")
        
        return recommendations.get(application_type)

# 使用示例
comparison = MetricsComparison()
comparison.print_comparison()

# 根据应用推荐指标
autonomous_driving_metrics = comparison.choose_metrics("自动驾驶")
industrial_metrics = comparison.choose_metrics("工业检测")
```

## 本章总结

### 1.6.1 核心概念回顾
1. **计算机视觉**是让计算机理解视觉信息的技术
2. **目标检测**同时解决分类和定位问题
3. **图像预处理**是提高检测性能的重要步骤
4. **评价指标**帮助客观评估算法性能

### 1.6.2 重要技术点
- IoU计算和阈值选择
- 精确率、召回率的平衡
- mAP的计算方法和意义
- 不同应用场景的指标选择

### 1.6.3 实践要点
- 理解数据特点，选择合适的预处理方法
- 根据应用需求选择评价指标
- 关注算法的实时性和精度平衡
- 重视小物体检测和遮挡处理

### 1.6.4 下章预告
下一章将深入学习深度学习基础和卷积神经网络，这是理解YOLO算法的重要理论基础。我们将学习：
- 深度学习的基本原理
- CNN的结构和工作机制
- 常见网络架构的演进
- 为YOLO学习做好准备

通过本章的学习，我们建立了目标检测的基础认知，为后续深入学习YOLO系列算法奠定了坚实基础。