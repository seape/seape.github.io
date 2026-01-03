---
title: "第14章：合成与后期处理"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第14章：合成与后期处理

## 学习目标
1. 理解合成节点系统
2. 掌握多通道渲染和分层合成
3. 学会色彩校正和色调映射
4. 掌握景深、运动模糊等效果
5. 理解视频编辑和输出流程

## 14.1 合成基础概念

### 合成原理
- **图层合成**：将多个图像层组合成最终图像
- **Alpha通道**：透明度信息
- **混合模式**：不同图层的合成方式
- **遮罩**：控制效果应用的区域

### Blender合成工作流
```
渲染 → 多通道输出 → 节点合成 → 最终输出
Scene → Render Layers → Compositor → Output
```

### 启用合成
```
渲染属性 → Post Processing:
- Compositing: 启用合成
- Sequencer: 启用序列编辑器

切换到Compositing工作空间
- Use Nodes: 启用节点合成
```

## 14.2 多通道渲染

### 渲染通道类型
1. **Beauty Pass（美观通道）**：完整渲染结果
2. **Diffuse Pass（漫反射通道）**：漫反射颜色
3. **Glossy Pass（光泽通道）**：镜面反射
4. **Transmission Pass（透射通道）**：透明物体
5. **Emission Pass（发光通道）**：自发光
6. **Environment Pass（环境通道）**：环境光照

### 数据通道
```
Passes → Data:
- Z (Depth): 深度信息
- Normal: 法线信息
- Object Index: 物体ID
- Material Index: 材质ID
- UV: UV坐标
- Vector (Motion): 运动矢量
```

### 渲染层设置
```
View Layer Properties → Passes:
- Combined: 合成结果
- Diffuse → Direct/Indirect/Color
- Glossy → Direct/Indirect/Color
- Transmission → Direct/Indirect/Color
- Subsurface → Direct/Indirect/Color
- Volume → Direct/Indirect
```

### 加密遮罩（Cryptomatte）
```
View Layer → Cryptomatte:
- Object: 物体遮罩
- Material: 材质遮罩
- Asset: 资产遮罩
用于精确选择和遮罩特定物体或材质
```

## 14.3 合成节点详解

### 输入节点
1. **Render Layers**：
   ```
   输出：
   - Image: 主图像
   - Alpha: 透明通道
   - Z: 深度
   - Normal: 法线
   - 各种Pass通道
   ```

2. **Image节点**：
   ```
   用途：
   - 导入外部图像
   - 作为纹理输入
   - 参考图片叠加
   ```

### 输出节点
1. **Composite**：
   ```
   最终合成输出
   - Image: 主图像输入
   - Alpha: 透明度输入
   - Z: 深度输入
   ```

2. **Viewer**：
   ```
   实时预览节点
   - 预览中间结果
   - 调试节点连接
   ```

3. **File Output**：
   ```
   文件输出节点
   - 输出多个通道到不同文件
   - 支持各种图像格式
   - 可设置文件命名规则
   ```

## 14.4 颜色校正技术

### 基础颜色调整
1. **Bright/Contrast**：
   ```
   参数：
   - Bright: 亮度调整
   - Contrast: 对比度调整
   简单但有效的基础调整
   ```

2. **Hue Saturation Value**：
   ```
   参数：
   - Hue: 色相偏移
   - Saturation: 饱和度
   - Value: 明度
   可以分别调整不同颜色通道
   ```

3. **Color Balance**：
   ```
   三个区域独立调整：
   - Lift (Shadows): 阴影区域
   - Gamma (Midtones): 中间调
   - Gain (Highlights): 高光区域
   ```

### 高级颜色校正
1. **RGB Curves**：
   ```
   功能：
   - 精确控制色调响应
   - 分别调整RGB通道
   - 创建电影级色彩
   - S曲线增加对比度
   ```

2. **Color Correction**：
   ```
   专业色彩校正节点：
   - Lift: 黑场调整
   - Gamma: 中间调调整
   - Gain: 白场调整
   - Offset: 整体偏移
   - Power: 幂函数调整
   - Slope: 斜率调整
   ```

### 色调映射
```
Tonemap节点：
- Type: 
  - Reinhard: 适合HDR
  - Filmic: 电影风格
  - ACES: 学院标准
- Intensity: 强度
- Contrast: 对比度
- Adaptation: 适应性
```

## 14.5 滤镜和特效

### 模糊效果
1. **Blur**：
   ```
   类型：
   - Flat: 平面模糊
   - Tent: 帐篷滤波
   - Quadratic: 二次滤波
   - Cubic: 三次滤波
   - Gaussian: 高斯模糊
   - Fast Gaussian: 快速高斯
   ```

2. **Bokeh Blur**：
   ```
   散景模糊：
   - Max Blur: 最大模糊半径
   - Use Z-Buffer: 使用深度缓冲
   - Bokeh Type: 散景形状
   ```

3. **Directional Blur**：
   ```
   方向模糊：
   - Iterations: 迭代次数
   - Wrap: 边界处理
   - Center: 模糊中心
   - Distance: 模糊距离
   - Angle: 模糊角度
   ```

### 滤镜效果
1. **Filter节点**：
   ```
   类型：
   - Soften: 柔化
   - Sharpen: 锐化
   - Laplacian: 拉普拉斯
   - Sobel: 边缘检测
   - Prewitt: Prewitt算子
   - Kirsch: Kirsch算子
   ```

2. **Dilate/Erode**：
   ```
   形态学操作：
   - Dilate: 膨胀（扩张白色区域）
   - Erode: 腐蚀（缩小白色区域）
   用于遮罩处理和边缘修饰
   ```

## 14.6 景深和运动模糊

### 景深效果
1. **深度合成景深**：
   ```
   使用Defocus节点：
   - Image: 输入图像
   - Z: 深度信息
   - Max Blur: 最大模糊量
   - Threshold: 对焦阈值
   - Preview: 预览模式
   - Samples: 采样质量
   - No Z-Buffer: 忽略深度
   ```

2. **景深参数控制**：
   ```
   - F-Stop: 光圈值（小值=浅景深）
   - Focus Distance: 对焦距离
   - Blur Max: 最大模糊半径
   - Threshold: 变化阈值
   ```

### 运动模糊
1. **Vector Blur**：
   ```
   输入：
   - Image: 输入图像
   - Z: 深度信息
   - Speed: 运动矢量
   
   参数：
   - Samples: 采样数量
   - Blur: 模糊强度
   - Speed Max: 最大速度
   - Speed Min: 最小速度
   ```

2. **运动矢量设置**：
   ```
   渲染属性 → Motion Blur:
   - Enable: 启用运动模糊
   - Shutter: 快门时间
   - Rolling Shutter: 卷帘快门
   
   通道设置：
   - Vector Pass: 启用运动矢量通道
   ```

## 14.7 遮罩和抠像

### ID遮罩
```
ID Mask节点：
- Index: 物体或材质索引
- Anti-Aliasing: 抗锯齿
输出精确的物体选择遮罩
```

### Cryptomatte遮罩
```
Cryptomatte节点：
- Image: Cryptomatte图像
- Matte ID: 选择的ID
支持精确的物体和材质选择
```

### 键控抠像
1. **Keying**：
   ```
   绿屏/蓝屏抠像：
   - Key Color: 键控颜色
   - Tolerance: 容差
   - Edge: 边缘处理
   ```

2. **Keying Screen**：
   ```
   屏幕键控：
   - Smoothness: 平滑度
   - Screen Balance: 屏幕平衡
   ```

## 14.8 特效合成

### 光效合成
1. **Glare**：
   ```
   光辉效果：
   - Type: 光辉类型
     - Ghosts: 鬼影
     - Streaks: 光线
     - Fog Glow: 雾化发光
     - Simple Star: 简单星形
   - Quality: 质量
   - Mix: 混合强度
   ```

2. **Lens Distortion**：
   ```
   镜头畸变：
   - Distortion: 畸变程度
   - Dispersion: 色散
   - Fit: 适配模式
   ```

### 大气效果
1. **Sun Beams**：
   ```
   阳光射线：
   - Source: 光源位置
   - Ray Length: 射线长度
   ```

2. **Fog Glow**：
   ```
   雾化发光：
   - Threshold: 阈值
   - Size: 尺寸
   ```

## 14.9 合成工作流程

### 标准合成流程
```
1. 渲染设置多通道输出
2. 导入Render Layers节点
3. 分别处理不同通道：
   - Beauty Pass: 主要颜色校正
   - Z-Depth: 景深效果
   - Normal: 重新照明
   - Vector: 运动模糊
4. 合成各个通道
5. 应用最终调色
6. 输出最终结果
```

### 分层合成策略
```
图层组织：
- Background: 背景层
- Main Objects: 主要物体
- Foreground: 前景元素
- Effects: 特效层
- Color Correction: 调色层
```

### 节点组织技巧
```
节点管理：
- Frame: 组织相关节点
- Node Groups: 复用常用效果
- Labels: 给节点添加标签
- Color Coding: 颜色编码分类
```

## 14.10 输出和渲染

### 输出格式选择
```
常用格式：
- EXR: 高动态范围，支持多通道
- PNG: 支持透明度，无损压缩
- JPEG: 小文件大小，有损压缩
- TIFF: 无损，支持16位
- DPX: 电影工业标准
```

### 序列输出
```
Animation → Output:
- File Format: 图像序列格式
- Frame Range: 帧范围
- Frame Step: 帧步长
- Use File Extensions: 自动扩展名
```

### 渲染设置优化
```
Performance:
- Samples: 采样数量
- Denoising: 降噪设置
- Tiles: 瓦片大小（CPU）
- OptiX/CUDA: GPU加速
```

## 14.11 实际案例

### 案例1：电影级调色
```
流程：
1. 基础曝光校正
2. 颜色平衡调整
3. 创建电影Look
4. 添加暗角效果
5. 最终锐化
```

### 案例2：合成虚拟场景
```
技术要点：
- 绿屏抠像
- 光照匹配
- 阴影合成
- 景深统一
- 颜色匹配
```

### 案例3：特效镜头
```
效果组合：
- 粒子特效渲染
- 运动模糊添加
- 光效合成
- 镜头畸变
- 最终调色
```

## 实践练习
1. 制作多通道渲染工作流程
2. 创建电影级色彩校正
3. 合成绿屏素材
4. 制作光效特写镜头
5. 设计运动模糊动画

## 关键要点
- 多通道渲染提供了更大的后期调整空间
- 合成节点系统提供了强大的图像处理能力
- 颜色校正是获得专业外观的关键
- 景深和运动模糊增强画面真实感
- 遮罩技术实现精确的区域控制
- 合理的工作流程提高效率和质量

## 下一章预告
下一章将学习虚幻引擎集成与实时渲染，了解如何将Blender作品导入游戏引擎进行实时应用。