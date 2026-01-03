---
title: "第5章：YOLO系列演进（v2-v5）"
date: 2025-10-02
icon: circle-dot
author: Haiyue
category:
  - YOLO
  - 图像识别
star: false
---
# 第5章：YOLO系列演进（v2-v5）

## 学习目标
1. 掌握YOLO v2的关键改进点（锚框、批归一化、多尺度训练等）
2. 理解YOLO v3的特征金字塔和多尺度检测机制
3. 了解YOLO v4的工程技巧集成和性能优化
4. 熟悉YOLO v5的实用化改进和部署优化

## 5.1 YOLO v2 (YOLO9000) - 更好更快更强

### 5.1.1 核心改进点

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class YOLOv2Improvements:
    def __init__(self):
        self.improvements = {
            "批归一化": {
                "作用": "加速收敛，提升稳定性",
                "位置": "每个卷积层后",
                "效果": "mAP提升2%，去除Dropout"
            },
            "高分辨率分类器": {
                "预训练": "448×448分类任务",
                "效果": "mAP提升4%",
                "原理": "适应高分辨率输入"
            },
            "锚框机制": {
                "思想": "预定义边界框形状",
                "数量": "5个锚框",
                "效果": "召回率从81%提升到88%"
            },
            "维度聚类": {
                "方法": "K-means聚类选择锚框",
                "距离": "1-IoU作为距离度量",
                "结果": "更适合数据集的锚框"
            },
            "直接位置预测": {
                "问题": "锚框可能出现在图像任意位置",
                "解决": "使用sigmoid约束偏移",
                "稳定": "训练更稳定"
            },
            "细粒度特征": {
                "方法": "passthrough层",
                "融合": "26×26特征与13×13特征",
                "效果": "小目标检测改善"
            },
            "多尺度训练": {
                "尺寸": "320-608像素，32像素间隔",
                "频率": "每10个batch改变尺寸",
                "泛化": "提升不同尺度泛化能力"
            }
        }
    
    def anchor_mechanism(self):
        """锚框机制详解"""
        
        class AnchorGenerator:
            def __init__(self, anchor_sizes, grid_size=13):
                self.anchor_sizes = anchor_sizes  # [(w1,h1), (w2,h2), ...]
                self.grid_size = grid_size
            
            def generate_anchors(self):
                """生成所有锚框"""
                anchors = []
                
                for i in range(self.grid_size):
                    for j in range(self.grid_size):
                        for w, h in self.anchor_sizes:
                            # 锚框中心在网格中心
                            cx = (j + 0.5) / self.grid_size
                            cy = (i + 0.5) / self.grid_size
                            
                            anchors.append([cx, cy, w, h])
                
                return np.array(anchors)
            
            def kmeans_anchors(self, boxes, k=5):
                """K-means聚类生成锚框"""
                # 提取宽高
                widths = boxes[:, 2] - boxes[:, 0]
                heights = boxes[:, 3] - boxes[:, 1]
                sizes = np.column_stack([widths, heights])
                
                # K-means聚类
                from sklearn.cluster import KMeans
                kmeans = KMeans(n_clusters=k, random_state=42)
                kmeans.fit(sizes)
                
                # 返回聚类中心作为锚框尺寸
                anchor_sizes = kmeans.cluster_centers_
                
                # 按面积排序
                areas = anchor_sizes[:, 0] * anchor_sizes[:, 1]
                sorted_indices = np.argsort(areas)
                
                return anchor_sizes[sorted_indices]
        
        # 位置预测改进
        def direct_location_prediction():
            """直接位置预测"""
            
            # YOLO v1问题：预测 (x, y) 可能不稳定
            # YOLO v2解决：预测偏移量，用sigmoid约束
            
            def predict_bbox(tx, ty, tw, th, anchor_w, anchor_h, grid_x, grid_y, grid_size):
                """
                tx, ty, tw, th: 网络预测值
                anchor_w, anchor_h: 锚框尺寸
                grid_x, grid_y: 网格坐标
                """
                # 中心点预测（sigmoid约束在网格内）
                bx = torch.sigmoid(tx) + grid_x
                by = torch.sigmoid(ty) + grid_y
                
                # 宽高预测（指数变换）
                bw = anchor_w * torch.exp(tw)
                bh = anchor_h * torch.exp(th)
                
                # 归一化到[0,1]
                bx = bx / grid_size
                by = by / grid_size
                
                return bx, by, bw, bh
            
            return predict_bbox
        
        print("YOLO v2 锚框机制:")
        print("=" * 25)
        
        # 示例锚框生成
        anchor_sizes = [(1.3221, 1.73145), (3.19275, 4.00944), (5.05587, 8.09892), 
                       (9.47112, 4.84053), (11.2364, 10.0071)]
        
        anchor_gen = AnchorGenerator(anchor_sizes)
        anchors = anchor_gen.generate_anchors()
        
        print(f"锚框数量: {len(anchors)}")
        print(f"前5个锚框: {anchors[:5]}")
        
        return AnchorGenerator, direct_location_prediction()
    
    def passthrough_layer(self):
        """Passthrough层实现"""
        
        class PassthroughLayer(nn.Module):
            def __init__(self, stride=2):
                super(PassthroughLayer, self).__init__()
                self.stride = stride
            
            def forward(self, x):
                """
                将26×26×512的特征图重新组织为13×13×2048
                """
                batch_size, channels, height, width = x.size()
                
                # 确保尺寸可以被stride整除
                assert height % self.stride == 0 and width % self.stride == 0
                
                new_height = height // self.stride
                new_width = width // self.stride
                
                # 重新组织张量
                x = x.view(batch_size, channels, new_height, self.stride, new_width, self.stride)
                x = x.permute(0, 1, 3, 5, 2, 4).contiguous()
                x = x.view(batch_size, channels * self.stride * self.stride, new_height, new_width)
                
                return x
        
        # 特征融合示例
        def feature_fusion_example():
            """特征融合示例"""
            
            # 高分辨率特征（26×26×512）
            high_res_feat = torch.randn(1, 512, 26, 26)
            
            # 低分辨率特征（13×13×1024）
            low_res_feat = torch.randn(1, 1024, 13, 13)
            
            # Passthrough层
            passthrough = PassthroughLayer(stride=2)
            transformed_feat = passthrough(high_res_feat)
            
            print(f"高分辨率特征: {high_res_feat.shape}")
            print(f"Passthrough后: {transformed_feat.shape}")
            print(f"低分辨率特征: {low_res_feat.shape}")
            
            # 特征融合
            fused_feat = torch.cat([low_res_feat, transformed_feat], dim=1)
            print(f"融合后特征: {fused_feat.shape}")
            
            return fused_feat
        
        return PassthroughLayer, feature_fusion_example
    
    def multi_scale_training(self):
        """多尺度训练"""
        
        class MultiScaleTraining:
            def __init__(self, min_size=320, max_size=608, step=32):
                self.min_size = min_size
                self.max_size = max_size
                self.step = step
                self.scales = list(range(min_size, max_size + step, step))
                self.current_scale = 416  # 默认尺寸
            
            def get_random_scale(self):
                """随机选择训练尺寸"""
                return np.random.choice(self.scales)
            
            def resize_batch(self, images, targets, new_size):
                """调整batch尺寸"""
                # 图像尺寸调整
                resized_images = F.interpolate(images, size=(new_size, new_size), 
                                             mode='bilinear', align_corners=False)
                
                # 目标坐标调整
                scale_factor = new_size / images.size(-1)
                
                if targets is not None:
                    # 假设targets格式为 [batch_idx, class, x, y, w, h]
                    targets[:, 2:] *= scale_factor
                
                return resized_images, targets
            
            def training_step(self, model, images, targets, step_count):
                """训练步骤（包含尺寸调整）"""
                
                # 每10个batch调整一次尺寸
                if step_count % 10 == 0:
                    self.current_scale = self.get_random_scale()
                    print(f"切换到尺寸: {self.current_scale}")
                
                # 调整输入尺寸
                resized_images, resized_targets = self.resize_batch(
                    images, targets, self.current_scale)
                
                # 模型前向传播
                outputs = model(resized_images)
                
                return outputs, resized_targets
        
        multi_scale_benefits = {
            "鲁棒性": "适应不同尺寸的输入",
            "泛化能力": "提升在不同分辨率下的性能",
            "实用性": "同一模型适用于多种应用场景",
            "效率": "可根据精度要求调整推理尺寸"
        }
        
        print("多尺度训练优势:")
        print("=" * 20)
        for benefit, desc in multi_scale_benefits.items():
            print(f"  {benefit}: {desc}")
        
        return MultiScaleTraining, multi_scale_benefits

# 使用示例
yolo_v2 = YOLOv2Improvements()

print("YOLO v2 主要改进:")
print("=" * 25)
for improvement, details in yolo_v2.improvements.items():
    print(f"\n{improvement}:")
    for key, value in details.items():
        print(f"  {key}: {value}")

# 锚框机制
AnchorGenerator, bbox_prediction = yolo_v2.anchor_mechanism()

# Passthrough层
PassthroughLayer, feature_fusion = yolo_v2.passthrough_layer()

# 多尺度训练
MultiScaleTraining, benefits = yolo_v2.multi_scale_training()

# 演示特征融合
print("\n特征融合演示:")
print("-" * 15)
fused_features = feature_fusion()
```

## 5.2 YOLO v3 - 多尺度预测

### 5.2.1 Darknet-53骨干网络

```python
class YOLOv3Architecture:
    def __init__(self):
        self.key_features = {
            "多尺度预测": "3个不同尺度的特征图",
            "特征金字塔": "类似FPN的特征融合",
            "Darknet-53": "残差连接的骨干网络",
            "逐点卷积": "1×1卷积降维",
            "二分类损失": "每个类别独立的sigmoid"
        }
    
    def build_darknet53(self):
        """构建Darknet-53骨干网络"""
        
        class ConvBNLeaky(nn.Module):
            def __init__(self, in_channels, out_channels, kernel_size, stride=1, padding=0):
                super(ConvBNLeaky, self).__init__()
                self.conv = nn.Conv2d(in_channels, out_channels, kernel_size, 
                                    stride, padding, bias=False)
                self.bn = nn.BatchNorm2d(out_channels)
                self.leaky = nn.LeakyReLU(0.1, inplace=True)
            
            def forward(self, x):
                return self.leaky(self.bn(self.conv(x)))
        
        class ResidualBlock(nn.Module):
            def __init__(self, channels):
                super(ResidualBlock, self).__init__()
                self.conv1 = ConvBNLeaky(channels, channels // 2, 1)
                self.conv2 = ConvBNLeaky(channels // 2, channels, 3, padding=1)
            
            def forward(self, x):
                residual = x
                out = self.conv1(x)
                out = self.conv2(out)
                return out + residual
        
        class Darknet53(nn.Module):
            def __init__(self):
                super(Darknet53, self).__init__()
                
                # 初始卷积
                self.conv1 = ConvBNLeaky(3, 32, 3, padding=1)
                self.conv2 = ConvBNLeaky(32, 64, 3, stride=2, padding=1)
                
                # 残差块组
                self.res_block1 = self._make_layer(64, 1)
                self.conv3 = ConvBNLeaky(64, 128, 3, stride=2, padding=1)
                
                self.res_block2 = self._make_layer(128, 2)
                self.conv4 = ConvBNLeaky(128, 256, 3, stride=2, padding=1)
                
                self.res_block3 = self._make_layer(256, 8)
                self.conv5 = ConvBNLeaky(256, 512, 3, stride=2, padding=1)
                
                self.res_block4 = self._make_layer(512, 8)
                self.conv6 = ConvBNLeaky(512, 1024, 3, stride=2, padding=1)
                
                self.res_block5 = self._make_layer(1024, 4)
            
            def _make_layer(self, channels, num_blocks):
                layers = []
                for _ in range(num_blocks):
                    layers.append(ResidualBlock(channels))
                return nn.Sequential(*layers)
            
            def forward(self, x):
                x = self.conv1(x)
                x = self.conv2(x)
                
                x = self.res_block1(x)
                x = self.conv3(x)
                
                x = self.res_block2(x)
                x = self.conv4(x)
                
                x = self.res_block3(x)
                route1 = x  # 52×52特征图
                x = self.conv5(x)
                
                x = self.res_block4(x)
                route2 = x  # 26×26特征图
                x = self.conv6(x)
                
                x = self.res_block5(x)  # 13×13特征图
                
                return route1, route2, x
        
        return Darknet53, ConvBNLeaky
    
    def feature_pyramid_network(self):
        """特征金字塔网络"""
        
        class YOLOv3FPN(nn.Module):
            def __init__(self, num_classes=80, num_anchors=3):
                super(YOLOv3FPN, self).__init__()
                self.num_classes = num_classes
                self.num_anchors = num_anchors
                
                # Darknet-53骨干
                Darknet53, ConvBNLeaky = self.build_darknet53()
                self.backbone = Darknet53()
                
                # 检测头
                self.detection_head1 = self._make_detection_head(1024, 512)
                self.detection_head2 = self._make_detection_head(768, 256)  # 512 + 256
                self.detection_head3 = self._make_detection_head(384, 128)  # 256 + 128
                
                # 上采样
                self.upsample1 = nn.Upsample(scale_factor=2, mode='nearest')
                self.upsample2 = nn.Upsample(scale_factor=2, mode='nearest')
                
                # 1×1卷积降维
                self.conv_reduce1 = ConvBNLeaky(512, 256, 1)
                self.conv_reduce2 = ConvBNLeaky(256, 128, 1)
            
            def _make_detection_head(self, in_channels, mid_channels):
                """创建检测头"""
                layers = []
                
                # 5个卷积层
                for i in range(5):
                    if i % 2 == 0:
                        layers.append(ConvBNLeaky(in_channels if i == 0 else mid_channels * 2, 
                                                mid_channels, 1))
                    else:
                        layers.append(ConvBNLeaky(mid_channels, mid_channels * 2, 3, padding=1))
                
                # 检测卷积
                detection_conv = nn.Conv2d(mid_channels, 
                                         self.num_anchors * (5 + self.num_classes), 
                                         1)
                layers.append(detection_conv)
                
                return nn.Sequential(*layers)
            
            def forward(self, x):
                # 骨干网络前向传播
                route1, route2, x = self.backbone(x)  # 52×52, 26×26, 13×13
                
                # 第一个尺度检测 (13×13)
                detection1 = self.detection_head1(x)
                
                # 上采样并融合 (26×26)
                x = self.conv_reduce1(x[:, :512])  # 取前512通道
                x = self.upsample1(x)
                x = torch.cat([x, route2], dim=1)
                detection2 = self.detection_head2(x)
                
                # 上采样并融合 (52×52)
                x = self.conv_reduce2(x[:, :256])  # 取前256通道  
                x = self.upsample2(x)
                x = torch.cat([x, route1], dim=1)
                detection3 = self.detection_head3(x)
                
                return detection1, detection2, detection3
        
        return YOLOv3FPN
    
    def multi_scale_anchors(self):
        """多尺度锚框设计"""
        
        # YOLOv3的9个锚框（3个尺度×3个锚框）
        anchors = {
            "大尺度 (13×13)": [(116, 90), (156, 198), (373, 326)],
            "中尺度 (26×26)": [(30, 61), (62, 45), (59, 119)],
            "小尺度 (52×52)": [(10, 13), (16, 30), (33, 23)]
        }
        
        def assign_anchors_to_scales():
            """锚框分配策略"""
            assignment_strategy = {
                "原则": "根据锚框大小分配到合适尺度",
                "大目标": "分配到低分辨率特征图 (13×13)",
                "中目标": "分配到中分辨率特征图 (26×26)",
                "小目标": "分配到高分辨率特征图 (52×52)",
                "优势": "每个尺度专注于特定大小的目标"
            }
            
            return assignment_strategy
        
        print("YOLOv3 多尺度锚框:")
        print("=" * 25)
        
        for scale, anchor_list in anchors.items():
            print(f"\n{scale}:")
            for i, (w, h) in enumerate(anchor_list):
                print(f"  锚框{i+1}: {w}×{h}")
        
        strategy = assign_anchors_to_scales()
        print(f"\n分配策略:")
        for key, value in strategy.items():
            print(f"  {key}: {value}")
        
        return anchors, strategy

# 使用示例
yolo_v3 = YOLOv3Architecture()

print("YOLO v3 关键特性:")
print("=" * 25)
for feature, description in yolo_v3.key_features.items():
    print(f"  {feature}: {description}")

# 构建Darknet-53
Darknet53, ConvBNLeaky = yolo_v3.build_darknet53()
backbone = Darknet53()

# 计算参数量
def count_parameters(model):
    return sum(p.numel() for p in model.parameters() if p.requires_grad)

print(f"\nDarknet-53参数量: {count_parameters(backbone):,}")

# 测试骨干网络
test_input = torch.randn(1, 3, 416, 416)
with torch.no_grad():
    route1, route2, output = backbone(test_input)
    print(f"\n特征图尺寸:")
    print(f"  route1 (52×52): {route1.shape}")
    print(f"  route2 (26×26): {route2.shape}")
    print(f"  output (13×13): {output.shape}")

# 多尺度锚框
anchors, strategy = yolo_v3.multi_scale_anchors()
```

## 5.3 YOLO v4 - 工程技巧集成

### 5.3.1 Bag of Freebies and Specials

```python
class YOLOv4Optimizations:
    def __init__(self):
        self.bag_of_freebies = {
            "数据增强": {
                "Mosaic": "4张图像拼接",
                "CutMix": "图像裁剪混合",
                "MixUp": "图像线性混合",
                "自对抗训练": "对抗样本增强"
            },
            "正则化": {
                "DropBlock": "结构化Dropout",
                "Label Smoothing": "标签平滑",
                "Class label smoothing": "类别标签平滑"
            },
            "损失函数": {
                "CIoU Loss": "完整IoU损失",
                "Focal Loss": "难例挖掘损失",
                "DIoU Loss": "距离IoU损失"
            }
        }
        
        self.bag_of_specials = {
            "激活函数": {
                "Mish": "自门控激活函数",
                "Swish": "自门控线性单元",
                "ReLU6": "截断ReLU"
            },
            "注意力机制": {
                "SE": "Squeeze-and-Excitation",
                "CBAM": "卷积块注意力模块",
                "ECA": "高效通道注意力"
            },
            "归一化": {
                "Cross-stage": "跨阶段部分连接",
                "Cross mini-Batch": "跨小批量归一化"
            },
            "跳跃连接": {
                "Residual": "残差连接",
                "Weighted residual": "加权残差连接",
                "Multi-input weighted": "多输入加权连接"
            }
        }
    
    def mosaic_augmentation(self):
        """Mosaic数据增强"""
        
        class MosaicAugmentation:
            def __init__(self, image_size=640):
                self.image_size = image_size
            
            def mosaic_augment(self, images, targets):
                """
                Mosaic增强：将4张图像拼接成一张
                images: 4张图像的列表
                targets: 对应的标注列表
                """
                assert len(images) == 4, "Mosaic需要4张图像"
                
                # 随机选择拼接中心点
                cut_x = np.random.randint(self.image_size // 4, 3 * self.image_size // 4)
                cut_y = np.random.randint(self.image_size // 4, 3 * self.image_size // 4)
                
                # 创建输出图像
                mosaic_image = np.zeros((self.image_size, self.image_size, 3), dtype=np.uint8)
                mosaic_targets = []
                
                # 定义4个象限的位置
                positions = [
                    (0, 0, cut_x, cut_y),           # 左上
                    (cut_x, 0, self.image_size, cut_y),     # 右上
                    (0, cut_y, cut_x, self.image_size),     # 左下
                    (cut_x, cut_y, self.image_size, self.image_size)  # 右下
                ]
                
                for i, (image, target) in enumerate(zip(images, targets)):
                    x1, y1, x2, y2 = positions[i]
                    
                    # 调整图像尺寸
                    h, w = image.shape[:2]
                    scale = min((x2 - x1) / w, (y2 - y1) / h)
                    
                    new_w = int(w * scale)
                    new_h = int(h * scale)
                    
                    resized_image = cv2.resize(image, (new_w, new_h))
                    
                    # 放置图像
                    mosaic_image[y1:y1+new_h, x1:x1+new_w] = resized_image
                    
                    # 调整标注
                    if target is not None:
                        adjusted_target = target.copy()
                        adjusted_target[:, [0, 2]] = adjusted_target[:, [0, 2]] * scale + x1
                        adjusted_target[:, [1, 3]] = adjusted_target[:, [1, 3]] * scale + y1
                        mosaic_targets.append(adjusted_target)
                
                # 合并所有标注
                if mosaic_targets:
                    mosaic_targets = np.concatenate(mosaic_targets, axis=0)
                
                return mosaic_image, mosaic_targets
            
            def cutmix_augment(self, image1, target1, image2, target2, alpha=1.0):
                """CutMix增强"""
                lam = np.random.beta(alpha, alpha)
                
                h, w = image1.shape[:2]
                cut_rat = np.sqrt(1. - lam)
                cut_w = int(w * cut_rat)
                cut_h = int(h * cut_rat)
                
                # 随机选择切割位置
                cx = np.random.randint(w)
                cy = np.random.randint(h)
                
                bbx1 = np.clip(cx - cut_w // 2, 0, w)
                bby1 = np.clip(cy - cut_h // 2, 0, h)
                bbx2 = np.clip(cx + cut_w // 2, 0, w)
                bby2 = np.clip(cy + cut_h // 2, 0, h)
                
                # 执行CutMix
                mixed_image = image1.copy()
                mixed_image[bby1:bby2, bbx1:bbx2] = image2[bby1:bby2, bbx1:bbx2]
                
                # 混合标注
                mixed_targets = []
                if target1 is not None:
                    mixed_targets.append(target1)
                if target2 is not None:
                    # 过滤在切割区域外的目标
                    valid_targets = []
                    for target in target2:
                        x1, y1, x2, y2 = target[:4]
                        if not (x2 < bbx1 or x1 > bbx2 or y2 < bby1 or y1 > bby2):
                            valid_targets.append(target)
                    if valid_targets:
                        mixed_targets.append(np.array(valid_targets))
                
                if mixed_targets:
                    mixed_targets = np.concatenate(mixed_targets, axis=0)
                
                return mixed_image, mixed_targets
        
        return MosaicAugmentation
    
    def mish_activation(self):
        """Mish激活函数"""
        
        class Mish(nn.Module):
            def __init__(self):
                super(Mish, self).__init__()
            
            def forward(self, x):
                return x * torch.tanh(F.softplus(x))
        
        def mish_vs_others():
            """Mish与其他激活函数对比"""
            x = torch.linspace(-3, 3, 1000)
            
            activations = {
                'ReLU': F.relu(x),
                'Swish': x * torch.sigmoid(x),
                'Mish': x * torch.tanh(F.softplus(x)),
                'LeakyReLU': F.leaky_relu(x, 0.1)
            }
            
            properties = {
                'ReLU': "简单快速，但存在梯度消失",
                'Swish': "平滑，自门控，性能好",
                'Mish': "更平滑，收敛更好，精度更高",
                'LeakyReLU': "缓解梯度消失，但非自门控"
            }
            
            print("激活函数特性对比:")
            print("=" * 25)
            for name, prop in properties.items():
                print(f"  {name}: {prop}")
            
            return activations, properties
        
        return Mish, mish_vs_others
    
    def ciou_loss(self):
        """Complete IoU Loss"""
        
        def ciou_loss_function(pred_boxes, target_boxes):
            """
            CIoU损失函数
            考虑重叠面积、中心距离、宽高比
            """
            # 计算IoU
            def calculate_iou(box1, box2):
                x1 = torch.max(box1[:, 0], box2[:, 0])
                y1 = torch.max(box1[:, 1], box2[:, 1])
                x2 = torch.min(box1[:, 2], box2[:, 2])
                y2 = torch.min(box1[:, 3], box2[:, 3])
                
                intersection = torch.clamp(x2 - x1, min=0) * torch.clamp(y2 - y1, min=0)
                area1 = (box1[:, 2] - box1[:, 0]) * (box1[:, 3] - box1[:, 1])
                area2 = (box2[:, 2] - box2[:, 0]) * (box2[:, 3] - box2[:, 1])
                union = area1 + area2 - intersection
                
                return intersection / (union + 1e-6)
            
            # 计算中心距离
            def center_distance(box1, box2):
                center1_x = (box1[:, 0] + box1[:, 2]) / 2
                center1_y = (box1[:, 1] + box1[:, 3]) / 2
                center2_x = (box2[:, 0] + box2[:, 2]) / 2
                center2_y = (box2[:, 1] + box2[:, 3]) / 2
                
                return (center1_x - center2_x)**2 + (center1_y - center2_y)**2
            
            # 计算最小外接矩形对角线长度
            def diagonal_length(box1, box2):
                c_x = torch.max(box1[:, 2], box2[:, 2]) - torch.min(box1[:, 0], box2[:, 0])
                c_y = torch.max(box1[:, 3], box2[:, 3]) - torch.min(box1[:, 1], box2[:, 1])
                return c_x**2 + c_y**2
            
            # 计算宽高比一致性
            def aspect_ratio_consistency(box1, box2):
                w1 = box1[:, 2] - box1[:, 0]
                h1 = box1[:, 3] - box1[:, 1]
                w2 = box2[:, 2] - box2[:, 0]
                h2 = box2[:, 3] - box2[:, 1]
                
                v = (4 / (torch.pi**2)) * torch.pow(torch.atan(w2/h2) - torch.atan(w1/h1), 2)
                return v
            
            # 计算CIoU
            iou = calculate_iou(pred_boxes, target_boxes)
            rho2 = center_distance(pred_boxes, target_boxes)
            c2 = diagonal_length(pred_boxes, target_boxes)
            v = aspect_ratio_consistency(pred_boxes, target_boxes)
            
            with torch.no_grad():
                alpha = v / (1 - iou + v + 1e-6)
            
            ciou = iou - rho2 / (c2 + 1e-6) - alpha * v
            
            return 1 - ciou  # CIoU损失
        
        loss_comparison = {
            "IoU Loss": "只考虑重叠面积",
            "GIoU Loss": "考虑最小外接矩形",
            "DIoU Loss": "额外考虑中心距离",
            "CIoU Loss": "还考虑宽高比一致性",
            "优势": "收敛更快，回归更准确"
        }
        
        print("CIoU Loss优势:")
        print("=" * 20)
        for loss_type, description in loss_comparison.items():
            print(f"  {loss_type}: {description}")
        
        return ciou_loss_function, loss_comparison
    
    def csp_darknet53(self):
        """CSPDarknet53骨干网络"""
        
        class CSPBlock(nn.Module):
            def __init__(self, in_channels, out_channels, num_blocks):
                super(CSPBlock, self).__init__()
                
                self.conv1 = nn.Conv2d(in_channels, out_channels // 2, 1, bias=False)
                self.conv2 = nn.Conv2d(in_channels, out_channels // 2, 1, bias=False)
                
                # 残差块
                self.res_blocks = nn.ModuleList()
                for _ in range(num_blocks):
                    self.res_blocks.append(nn.Sequential(
                        nn.Conv2d(out_channels // 2, out_channels // 2, 1, bias=False),
                        nn.BatchNorm2d(out_channels // 2),
                        nn.LeakyReLU(0.1, inplace=True),
                        nn.Conv2d(out_channels // 2, out_channels // 2, 3, padding=1, bias=False),
                        nn.BatchNorm2d(out_channels // 2),
                        nn.LeakyReLU(0.1, inplace=True)
                    ))
                
                self.conv3 = nn.Conv2d(out_channels, out_channels, 1, bias=False)
                self.bn = nn.BatchNorm2d(out_channels)
                self.activation = nn.LeakyReLU(0.1, inplace=True)
            
            def forward(self, x):
                # 分割特征
                x1 = self.conv1(x)
                x2 = self.conv2(x)
                
                # 残差连接
                for res_block in self.res_blocks:
                    x2 = x2 + res_block(x2)
                
                # 特征融合
                out = torch.cat([x1, x2], dim=1)
                out = self.conv3(out)
                out = self.bn(out)
                out = self.activation(out)
                
                return out
        
        csp_advantages = {
            "梯度流": "分割梯度流，减少计算量",
            "特征重用": "更好的特征重用",
            "参数效率": "相同精度下参数更少",
            "推理速度": "推理速度更快"
        }
        
        print("CSP优势:")
        print("=" * 10)
        for advantage, description in csp_advantages.items():
            print(f"  {advantage}: {description}")
        
        return CSPBlock, csp_advantages

# 使用示例
yolo_v4 = YOLOv4Optimizations()

print("YOLO v4 Bag of Freebies:")
print("=" * 30)
for category, techniques in yolo_v4.bag_of_freebies.items():
    print(f"\n{category}:")
    for technique, description in techniques.items():
        print(f"  {technique}: {description}")

print("\nYOLO v4 Bag of Specials:")
print("=" * 30)
for category, techniques in yolo_v4.bag_of_specials.items():
    print(f"\n{category}:")
    for technique, description in techniques.items():
        print(f"  {technique}: {description}")

# Mosaic增强
MosaicAugmentation = yolo_v4.mosaic_augmentation()

# Mish激活函数
Mish, mish_comparison = yolo_v4.mish_activation()
activations, properties = mish_comparison()

# CIoU损失
ciou_loss_fn, loss_comparison = yolo_v4.ciou_loss()

# CSP结构
CSPBlock, csp_advantages = yolo_v4.csp_darknet53()
```

## 5.4 YOLO v5 - 工程化优化

### 5.4.1 实用化改进

```python
class YOLOv5Improvements:
    def __init__(self):
        self.improvements = {
            "数据加载": {
                "自适应锚框": "自动计算最优锚框",
                "自适应图像缩放": "保持宽高比的缩放",
                "高效数据加载": "多进程数据加载优化"
            },
            "训练优化": {
                "自动混合精度": "FP16训练加速",
                "指数移动平均": "模型权重平滑",
                "余弦学习率": "更好的学习率调度",
                "早停机制": "防止过拟合"
            },
            "模型架构": {
                "Focus结构": "高效的下采样",
                "CSP结构": "跨阶段部分连接",
                "SPP结构": "空间金字塔池化",
                "PANet": "路径聚合网络"
            },
            "工程化": {
                "模型缩放": "不同尺寸的模型族",
                "ONNX导出": "便于部署",
                "TensorRT优化": "推理加速",
                "移动端优化": "轻量化版本"
            }
        }
    
    def focus_structure(self):
        """Focus结构"""
        
        class Focus(nn.Module):
            def __init__(self, in_channels, out_channels, kernel_size=1, stride=1, padding=0):
                super(Focus, self).__init__()
                self.conv = nn.Conv2d(in_channels * 4, out_channels, kernel_size, stride, padding, bias=False)
                self.bn = nn.BatchNorm2d(out_channels)
                self.act = nn.SiLU(inplace=True)  # Swish/SiLU激活
            
            def forward(self, x):
                # 将2x2的像素块重新排列为4倍通道数
                # 例如：(B, 3, 640, 640) -> (B, 12, 320, 320)
                return self.act(self.bn(self.conv(torch.cat([
                    x[..., ::2, ::2],    # 左上
                    x[..., 1::2, ::2],   # 右上
                    x[..., ::2, 1::2],   # 左下
                    x[..., 1::2, 1::2]   # 右下
                ], 1))))
        
        def focus_advantages():
            """Focus结构优势"""
            advantages = {
                "无信息丢失": "相比普通卷积stride=2不丢失信息",
                "计算效率": "减少计算量",
                "特征保持": "保持所有像素信息",
                "兼容性": "易于融入现有架构"
            }
            
            return advantages
        
        return Focus, focus_advantages()
    
    def adaptive_anchor(self):
        """自适应锚框"""
        
        class AdaptiveAnchor:
            def __init__(self, dataset, num_anchors=9, thr=4.0):
                self.dataset = dataset
                self.num_anchors = num_anchors
                self.thr = thr
            
            def check_anchor_order(self, anchors, targets, img_size):
                """检查锚框顺序"""
                m = len(anchors)
                bpr, aat = self.metric(anchors, targets)
                
                print(f'锚框适应性: {bpr:.3f}, 最佳可能召回率: {aat:.3f}')
                
                if bpr < 0.98:
                    print('正在运行自动锚框优化...')
                    new_anchors = self.kmean_anchors(targets, n=m, img_size=img_size, thr=self.thr)
                    new_bpr, new_aat = self.metric(new_anchors, targets)
                    
                    if new_bpr > bpr:
                        print(f'新锚框 BPR: {new_bpr:.3f}, AAT: {new_aat:.3f}')
                        return new_anchors
                    else:
                        print('保持原始锚框')
                        return anchors
                return anchors
            
            def metric(self, anchors, targets):
                """计算锚框指标"""
                if len(targets) == 0:
                    return 0, 0
                
                na = len(anchors)
                txy, twh = targets[:, 2:4], targets[:, 4:6]  # 目标中心和尺寸
                
                # 计算宽高比
                r = twh[:, None] / anchors[None]  # wh ratio
                j = torch.max(r, 1. / r).max(2)[0] < self.thr  # 比较
                
                # 最佳可能召回率和平均锚框阈值
                bpr = (j * (txy[:, None] > 0.1).all(2) * (txy[:, None] < 0.9).all(2)).float().sum(1).mean()
                aat = (j & (txy[:, None] > 0.1).all(2) & (txy[:, None] < 0.9).all(2)).float().sum(1).mean()
                
                return bpr, aat
            
            def kmean_anchors(self, targets, n=9, img_size=640, thr=4.0, gen=1000):
                """K-means锚框聚类"""
                from scipy.cluster.vq import kmeans
                
                def fitness(k):
                    _, dist = kmeans(wh, k)
                    return 1 / dist
                
                # 提取宽高
                wh = targets[:, 4:6] * img_size  # 转换到像素坐标
                
                # K-means聚类
                print(f'使用 {len(wh)} 个目标进行K-means聚类...')
                s = wh.std(0)  # 标准差
                k, dist = kmeans(wh / s, n, iter=30)  # 聚类
                k *= s
                
                # 按面积排序
                k = k[np.argsort(k.prod(1))]
                
                f = fitness(k)
                print(f'锚框适应性: {f:.3f}')
                
                return k
        
        return AdaptiveAnchor
    
    def model_scaling(self):
        """模型缩放策略"""
        
        def create_model_variants():
            """创建不同尺寸的模型变种"""
            variants = {
                'YOLOv5n': {  # nano
                    'depth_multiple': 0.33,
                    'width_multiple': 0.25,
                    'parameters': '1.9M',
                    'gflops': '4.5',
                    'speed_cpu': '6.3ms',
                    'speed_gpu': '0.6ms'
                },
                'YOLOv5s': {  # small
                    'depth_multiple': 0.33,
                    'width_multiple': 0.50,
                    'parameters': '7.2M',
                    'gflops': '16.5',
                    'speed_cpu': '11.9ms',
                    'speed_gpu': '0.9ms'
                },
                'YOLOv5m': {  # medium
                    'depth_multiple': 0.67,
                    'width_multiple': 0.75,
                    'parameters': '21.2M',
                    'gflops': '49.0',
                    'speed_cpu': '25.1ms',
                    'speed_gpu': '1.7ms'
                },
                'YOLOv5l': {  # large
                    'depth_multiple': 1.0,
                    'width_multiple': 1.0,
                    'parameters': '46.5M',
                    'gflops': '109.1',
                    'speed_cpu': '47.9ms',
                    'speed_gpu': '2.7ms'
                },
                'YOLOv5x': {  # extra large
                    'depth_multiple': 1.33,
                    'width_multiple': 1.25,
                    'parameters': '86.7M',
                    'gflops': '205.7',
                    'speed_cpu': '95.2ms',
                    'speed_gpu': '4.6ms'
                }
            }
            
            return variants
        
        def scale_model(base_channels, base_depth, width_mult, depth_mult):
            """根据缩放因子调整模型"""
            scaled_channels = int(base_channels * width_mult)
            scaled_depth = max(1, int(base_depth * depth_mult))
            
            return scaled_channels, scaled_depth
        
        variants = create_model_variants()
        
        print("YOLOv5 模型变种:")
        print("=" * 25)
        for model, specs in variants.items():
            print(f"\n{model}:")
            for key, value in specs.items():
                print(f"  {key}: {value}")
        
        return variants, scale_model
    
    def training_optimizations(self):
        """训练优化技巧"""
        
        class TrainingOptimizer:
            def __init__(self):
                self.techniques = {
                    "自动混合精度": self.setup_amp,
                    "指数移动平均": self.setup_ema,
                    "余弦学习率": self.setup_cosine_lr,
                    "早停机制": self.setup_early_stopping
                }
            
            def setup_amp(self):
                """自动混合精度"""
                from torch.cuda.amp import GradScaler, autocast
                
                scaler = GradScaler()
                
                def training_step(model, loss_fn, optimizer, inputs, targets):
                    with autocast():
                        outputs = model(inputs)
                        loss = loss_fn(outputs, targets)
                    
                    scaler.scale(loss).backward()
                    scaler.step(optimizer)
                    scaler.update()
                    optimizer.zero_grad()
                    
                    return loss
                
                return training_step
            
            def setup_ema(self, model, decay=0.9999):
                """指数移动平均"""
                class ModelEMA:
                    def __init__(self, model, decay=0.9999):
                        self.ema = {k: v.clone().detach() for k, v in model.state_dict().items()}
                        self.decay = decay
                    
                    def update(self, model):
                        with torch.no_grad():
                            for k, v in model.state_dict().items():
                                self.ema[k] = self.ema[k] * self.decay + v * (1 - self.decay)
                    
                    def apply_shadow(self, model):
                        model.load_state_dict(self.ema)
                
                return ModelEMA(model, decay)
            
            def setup_cosine_lr(self, optimizer, T_max, eta_min=0):
                """余弦学习率调度"""
                from torch.optim.lr_scheduler import CosineAnnealingLR
                
                scheduler = CosineAnnealingLR(optimizer, T_max=T_max, eta_min=eta_min)
                return scheduler
            
            def setup_early_stopping(self, patience=10, min_delta=0.001):
                """早停机制"""
                class EarlyStopping:
                    def __init__(self, patience=10, min_delta=0.001):
                        self.patience = patience
                        self.min_delta = min_delta
                        self.counter = 0
                        self.best_loss = float('inf')
                    
                    def __call__(self, val_loss):
                        if val_loss < self.best_loss - self.min_delta:
                            self.best_loss = val_loss
                            self.counter = 0
                            return False
                        else:
                            self.counter += 1
                            return self.counter >= self.patience
                
                return EarlyStopping(patience, min_delta)
        
        return TrainingOptimizer

# 使用示例
yolo_v5 = YOLOv5Improvements()

print("YOLO v5 改进点:")
print("=" * 20)
for category, improvements in yolo_v5.improvements.items():
    print(f"\n{category}:")
    for improvement, description in improvements.items():
        print(f"  {improvement}: {description}")

# Focus结构
Focus, focus_advantages = yolo_v5.focus_structure()

print(f"\nFocus结构优势:")
print("-" * 15)
for advantage, description in focus_advantages.items():
    print(f"  {advantage}: {description}")

# 模型缩放
variants, scale_model = yolo_v5.model_scaling()

# 训练优化
TrainingOptimizer = yolo_v5.training_optimizations()
optimizer = TrainingOptimizer()

# 测试Focus结构
focus_layer = Focus(3, 32)
test_input = torch.randn(1, 3, 640, 640)
with torch.no_grad():
    output = focus_layer(test_input)
    print(f"\nFocus测试:")
    print(f"  输入: {test_input.shape}")
    print(f"  输出: {output.shape}")
```

## 本章总结

### 5.5 YOLO系列演进总结

```python
class YOLOEvolutionSummary:
    def __init__(self):
        self.evolution_timeline = {
            "YOLO v2 (2017)": {
                "核心改进": ["锚框机制", "批归一化", "多尺度训练", "细粒度特征"],
                "性能": "PASCAL VOC mAP 76.8%",
                "创新": "引入锚框概念到YOLO"
            },
            "YOLO v3 (2018)": {
                "核心改进": ["多尺度预测", "Darknet-53", "特征金字塔", "二分类损失"],
                "性能": "COCO mAP 57.9%",
                "创新": "多尺度检测架构"
            },
            "YOLO v4 (2020)": {
                "核心改进": ["CSPDarknet53", "Mosaic增强", "CIoU损失", "大量tricks"],
                "性能": "COCO mAP 65.7%",
                "创新": "工程技巧大集成"
            },
            "YOLO v5 (2020)": {
                "核心改进": ["Focus结构", "自适应锚框", "模型缩放", "工程优化"],
                "性能": "COCO mAP 68.9%",
                "创新": "工程化和实用化"
            }
        }
    
    def performance_comparison(self):
        """性能对比"""
        comparison = {
            "指标": ["精度", "速度", "模型大小", "易用性"],
            "YOLO v2": ["中等", "快", "中等", "一般"],
            "YOLO v3": ["较高", "中等", "较大", "一般"],
            "YOLO v4": ["高", "较快", "大", "较好"],
            "YOLO v5": ["高", "快", "可选", "很好"]
        }
        
        return comparison
    
    def key_innovations(self):
        """关键创新总结"""
        innovations = {
            "网络架构": {
                "v2": "Darknet-19 + 锚框",
                "v3": "Darknet-53 + FPN",
                "v4": "CSPDarknet53 + SPP + PANet",
                "v5": "CSP + Focus + PANet"
            },
            "训练技巧": {
                "v2": "多尺度训练",
                "v3": "数据增强优化",
                "v4": "Mosaic + CutMix + SAT",
                "v5": "自适应训练 + AutoML"
            },
            "损失函数": {
                "v2": "改进的IoU损失",
                "v3": "二分类交叉熵",
                "v4": "CIoU + Focal Loss",
                "v5": "优化的CIoU"
            },
            "工程化": {
                "v2": "基础工程",
                "v3": "模块化改进",
                "v4": "技巧集成",
                "v5": "完全工程化"
            }
        }
        
        return innovations

# 总结展示
summary = YOLOEvolutionSummary()

print("YOLO系列演进时间线:")
print("=" * 30)
for version, details in summary.evolution_timeline.items():
    print(f"\n{version}:")
    for key, value in details.items():
        if isinstance(value, list):
            print(f"  {key}: {', '.join(value)}")
        else:
            print(f"  {key}: {value}")

# 性能对比
comparison = summary.performance_comparison()
print(f"\n性能对比:")
print("=" * 15)
metrics = comparison["指标"]
for i, metric in enumerate(metrics):
    print(f"\n{metric}:")
    for version in ["YOLO v2", "YOLO v3", "YOLO v4", "YOLO v5"]:
        print(f"  {version}: {comparison[version][i]}")

# 关键创新
innovations = summary.key_innovations()
print(f"\n关键创新总结:")
print("=" * 20)
for category, versions in innovations.items():
    print(f"\n{category}:")
    for version, innovation in versions.items():
        print(f"  {version}: {innovation}")
```

### 5.6 下章预告

下一章将学习YOLO最新版本（v6-v11）与前沿发展，了解：

- **YOLO v6-v8**: 最新架构设计和性能优化
- **YOLO v9-v11**: 前沿技术和未来发展
- **新技术**: Transformer、注意力机制、神经架构搜索
- **应用拓展**: 分割、姿态估计、3D检测

通过本章学习，我们全面了解了YOLO v2到v5的演进历程，每个版本都在前一版本基础上做出重要改进，推动了实时目标检测技术的发展。这些改进为后续版本和其他检测算法提供了重要参考。