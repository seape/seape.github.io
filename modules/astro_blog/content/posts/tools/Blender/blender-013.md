---
title: "第13章：节点系统与程序化工作流"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第13章：节点系统与程序化工作流

## 学习目标
1. 深入理解着色器节点系统
2. 掌握几何节点的使用
3. 学会程序化建模和分布
4. 理解复合节点的制作
5. 掌握节点组的创建和管理

## 13.1 节点系统基础

### 节点编程概念
- **节点（Node）**：执行特定功能的计算单元
- **套接字（Socket）**：节点间的连接点
- **节点树（Node Tree）**：节点网络的整体结构
- **数据流**：从输入到输出的数据传递

### Blender节点类型
1. **Shader Nodes（着色器节点）**：材质和光照
2. **Geometry Nodes（几何节点）**：程序化建模
3. **Compositor Nodes（复合节点）**：后期合成
4. **Texture Nodes（纹理节点）**：程序化纹理

### 节点编辑器界面
```
节点编辑器操作：
- Shift+A: 添加节点
- Ctrl+G: 创建节点组
- Tab: 进入/退出节点组
- Ctrl+J: 连接选中节点
- Alt+D: 复制节点（共享数据）
```

## 13.2 着色器节点深入

### 核心着色器节点
1. **Principled BSDF**：
   ```
   主要输入：
   - Base Color: 基础颜色
   - Metallic: 金属度
   - Roughness: 粗糙度
   - IOR: 折射率
   - Alpha: 透明度
   - Normal: 法线贴图
   ```

2. **Mix节点**：
   ```
   类型：
   - Mix: 混合颜色
   - Add: 相加
   - Multiply: 相乘
   - Overlay: 叠加
   - Color Burn: 颜色加深
   ```

3. **ColorRamp节点**：
   ```
   用途：
   - 颜色梯度映射
   - 遮罩控制
   - 数值重映射
   - 自定义衰减
   ```

### 程序化纹理节点
1. **Noise Texture**：
   ```
   参数：
   - Scale: 噪声尺度
   - Detail: 细节层次
   - Roughness: 粗糙度
   - Distortion: 扭曲
   ```

2. **Wave Texture**：
   ```
   类型：
   - Bands: 条纹波
   - Rings: 环形波
   Profile: 波形轮廓
   ```

3. **Voronoi Texture**：
   ```
   距离度量：
   - Euclidean: 欧几里得
   - Manhattan: 曼哈顿
   - Chebychev: 切比雪夫
   Feature: 特征类型
   ```

### 高级材质技术
```python
# Python节点树操作示例
import bpy

def create_procedural_material(name):
    # 创建新材质
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    
    # 清除默认节点
    nodes.clear()
    
    # 添加节点
    output = nodes.new('ShaderNodeOutputMaterial')
    principled = nodes.new('ShaderNodeBsdfPrincipled')
    noise = nodes.new('ShaderNodeTexNoise')
    colorramp = nodes.new('ShaderNodeValToRGB')
    
    # 设置位置
    output.location = (300, 0)
    principled.location = (0, 0)
    noise.location = (-400, 200)
    colorramp.location = (-200, 200)
    
    # 连接节点
    links.new(noise.outputs['Fac'], colorramp.inputs['Fac'])
    links.new(colorramp.outputs['Color'], principled.inputs['Base Color'])
    links.new(principled.outputs['BSDF'], output.inputs['Surface'])
    
    return mat
```

## 13.3 几何节点系统

### 几何节点概念
- **几何数据**：网格、曲线、点云等几何信息
- **属性系统**：存储在几何上的数据（位置、颜色、法线等）
- **实例化**：高效复制和分布几何体
- **程序化建模**：通过算法生成几何形状

### 基础几何节点
1. **Mesh Primitive（网格基元）**：
   ```
   - Cube: 立方体
   - Cylinder: 圆柱体
   - Ico Sphere: 二十面体球
   - Plane: 平面
   ```

2. **Transform（变换）**：
   ```
   - Transform: 变换几何体
   - Rotate: 旋转
   - Scale: 缩放
   - Translate: 平移
   ```

3. **Instance（实例）**：
   ```
   - Instance on Points: 在点上实例化
   - Rotate Instances: 旋转实例
   - Scale Instances: 缩放实例
   ```

### 属性系统
```
属性类型：
- Float: 浮点数
- Integer: 整数
- Vector: 向量（位置、速度等）
- Color: 颜色
- Boolean: 布尔值

常用属性：
- Position: 位置
- Normal: 法线
- Index: 索引
- ID: 标识符
```

### 分布和散射
1. **Distribute Points on Faces**：
   ```
   输入：
   - Mesh: 目标网格
   - Density: 密度
   - Seed: 随机种子
   
   输出：
   - Points: 分布的点
   - Normal: 法线方向
   ```

2. **Random Value**：
   ```
   类型：
   - Float: 随机浮点数
   - Integer: 随机整数
   - Vector: 随机向量
   - Boolean: 随机布尔值
   ```

### 实例：程序化森林
```
森林生成流程：
1. 地形网格 → Distribute Points on Faces
2. Random Value → 生成随机缩放和旋转
3. Collection Info → 获取树木模型
4. Instance on Points → 在点上实例化树木
5. Rotate/Scale Instances → 应用随机变换
```

## 13.4 几何节点高级技术

### 几何体操作
1. **Mesh Operations**：
   ```
   - Join Geometry: 合并几何体
   - Separate Geometry: 分离几何体
   - Mesh to Points: 网格转点
   - Points to Volume: 点转体积
   ```

2. **Curve Operations**：
   ```
   - Curve to Mesh: 曲线转网格
   - Curve Length: 曲线长度
   - Sample Curve: 采样曲线
   - Trim Curve: 修剪曲线
   ```

### 场(Field)系统
```
场的概念：
- 在每个点/元素上计算的值
- 可以是位置相关的函数
- 支持数学运算和条件判断

常用场节点：
- Position: 位置场
- Index: 索引场
- Random Value: 随机值场
- Noise Texture: 噪声场
```

### 选择和遮罩
```
Selection系统：
- Compare: 比较操作
- Boolean Math: 布尔运算
- Switch: 条件切换

应用示例：
选择 Z > 0 的点 → 只在上半部分实例化
```

## 13.5 复合节点系统

### 复合概念
- **通道（Pass）**：渲染的不同层次信息
- **多通道渲染**：分别输出颜色、深度、法线等
- **后期合成**：组合多个渲染通道

### 基础复合节点
1. **Input Nodes**：
   ```
   - Render Layers: 渲染层输入
   - Image: 图像输入
   - Movie Clip: 视频剪辑
   - Mask: 遮罩输入
   ```

2. **Output Nodes**：
   ```
   - Composite: 最终输出
   - Viewer: 预览节点
   - File Output: 文件输出
   - Split Viewer: 分割预览
   ```

### 颜色校正
```
Color节点：
- Bright/Contrast: 亮度对比度
- Hue Saturation Value: 色相饱和度
- Color Balance: 色彩平衡
- Curves: 曲线调节
- Gamma: 伽马校正
```

### 滤镜效果
1. **Blur（模糊）**：
   ```
   类型：
   - Gaussian: 高斯模糊
   - Bokeh: 散景模糊
   - Motion: 运动模糊
   - Bilateral: 双边滤波
   ```

2. **Filter（滤镜）**：
   ```
   - Sharpen: 锐化
   - Laplacian: 拉普拉斯
   - Sobel: Sobel边缘检测
   - Prewitt: Prewitt算子
   ```

## 13.6 节点组管理

### 创建节点组
```
创建步骤：
1. 选择要组合的节点
2. Ctrl+G 创建节点组
3. 设置输入输出接口
4. 命名和保存节点组
```

### 节点组接口
```
Group Input/Output:
- 添加输入参数
- 设置默认值
- 命名参数
- 设置数据类型
```

### 节点组库
```
节点组管理：
- 保存到.blend文件
- Asset Browser集成
- 跨项目复用
- 版本控制
```

## 13.7 实用节点模板

### 金属材质节点组
```
金属材质构成：
- Base Color: 金属颜色
- Metallic: 1.0
- Roughness: 低值(0.1-0.3)
- Normal: 细节法线
- 添加划痕和污垢效果
```

### 布料材质节点组
```
布料特征：
- Subsurface: 次表面散射
- Roughness: 较高值(0.7-1.0)
- Sheen: 织物光泽
- Normal: 织物纹理
```

### 程序化建筑
```
建筑生成流程：
1. 基础几何体(立方体)
2. 随机分割为楼层
3. 在表面生成窗户
4. 添加细节装饰
5. 材质和纹理应用
```

## 13.8 性能优化

### 节点树优化
```
优化策略：
- 避免不必要的计算
- 合并相似操作
- 使用简化版本预览
- 缓存复杂计算结果
```

### 几何节点优化
```
性能考虑：
- 实例化优于复制
- 点云优于密集网格
- LOD(细节层次)系统
- 视锥体剔除
```

## 13.9 实战项目

### 项目1：程序化城市
```
技术要点：
- 道路网络生成
- 建筑物分布
- 细节实例化
- 材质变化
```

### 项目2：程序化地形
```
实现步骤：
1. Noise纹理生成高度图
2. Displace修改器应用地形
3. 根据高度/坡度分布植被
4. 添加道路和建筑
```

### 项目3：程序化材质库
```
材质类型：
- 木材纹理系列
- 金属表面系列
- 石材纹理系列
- 布料材质系列
```

## 实践练习
1. 创建程序化草地系统
2. 制作动态材质动画
3. 构建模块化建筑系统
4. 设计复合后期流程
5. 开发节点工具库

## 关键要点
- 节点系统是Blender的核心技术之一
- 着色器节点控制材质的外观表现
- 几何节点实现程序化建模和分布
- 复合节点处理渲染后期合成
- 节点组提高工作效率和代码复用
- 属性和场系统提供强大的数据处理能力
- 程序化工作流适合大规模场景制作

## 下一章预告
下一章将学习合成与后期处理，深入了解多通道渲染、色彩校正和视觉效果的制作技术。