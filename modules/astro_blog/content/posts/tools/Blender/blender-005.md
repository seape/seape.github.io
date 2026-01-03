---
title: 第5章 材质系统与着色器
icon: palette
date: 2024-01-05
category:
  - Blender
  - 材质制作
tag:
  - 着色器节点
  - PBR材质
  - 程序化材质
---

# 第5章 材质系统与着色器

::: tip 学习目标
- 理解材质和着色器节点系统
- 掌握 PBR（基于物理渲染）材质制作
- 学会纹理映射和 UV 展开
- 掌握程序化材质制作
- 理解光照模型和材质交互
:::

## 知识点详解

### 5.1 材质系统基础

#### 5.1.1 材质与着色器概念

```
材质 (Material) = 描述物体表面属性的集合
着色器 (Shader) = 计算光线与表面交互的算法
```

**材质属性包括：**
- 颜色 (Color)
- 反射率 (Reflectance) 
- 粗糙度 (Roughness)
- 金属度 (Metallic)
- 透明度 (Transparency)
- 发光 (Emission)

#### 5.1.2 Blender 材质工作流

```python
# 材质创建流程
1. 选择物体
2. 切换到 Shading 工作区
3. 点击 "New" 创建材质
4. 使用节点编辑器编辑材质
5. 在3D视口查看效果 (Material Preview/Rendered)
```

### 5.2 着色器节点系统

#### 5.2.1 节点编辑器界面

**节点编辑器组成：**
```
┌─────────────────────────────────────┐
│ 工具栏    标题栏    菜单栏        │
├─────────────────────────────────────┤
│                                     │
│        节点网络编辑区域            │
│                                     │
├─────────────────────────────────────┤
│ 节点库               属性面板      │
└─────────────────────────────────────┘
```

**节点操作基础：**
```python
# 添加节点
Shift + A  # 添加节点菜单

# 节点连接
左键拖拽  # 连接输出到输入插槽

# 节点操作
X / Delete  # 删除节点
Ctrl + C/V  # 复制粘贴节点
Tab        # 编辑节点组
Ctrl + J   # 合并节点
```

#### 5.2.2 核心着色器节点

**原理化BSDF (Principled BSDF)：**
这是最重要的着色器节点，基于迪士尼的PBR标准：

```python
Principled BSDF 参数：
├── Base Color: 基础颜色
├── Metallic: 金属度 (0=绝缘体, 1=金属)
├── Roughness: 粗糙度 (0=镜面, 1=完全粗糙)
├── IOR: 折射率
├── Alpha: 透明度
├── Subsurface: 次表面散射
├── Specular: 镜面反射强度
├── Transmission: 透射
├── Emission: 发光
└── Normal: 法线贴图输入
```

**其他重要着色器：**

| 着色器类型 | 用途 | 特点 |
|------------|------|------|
| Diffuse BSDF | 漫反射 | 理想漫反射表面 |
| Glossy BSDF | 镜面反射 | 金属和光滑表面 |
| Glass BSDF | 玻璃 | 透明折射材质 |
| Emission | 发光 | 自发光材质 |
| Mix Shader | 混合着色器 | 组合多种材质 |

### 5.3 PBR 材质制作

#### 5.3.1 PBR 工作流程

**基于物理的渲染 (PBR) 原理：**
- 能量守恒：反射+吸收+透射 = 1
- 菲涅尔效应：视角影响反射强度
- 微表面理论：表面粗糙度影响反射

**PBR 贴图类型：**

```python
PBR 标准贴图集：
├── Albedo/Diffuse: 固有色贴图
├── Normal: 法线贴图 (表面细节)
├── Roughness: 粗糙度贴图
├── Metallic: 金属度贴图  
├── AO: 环境遮蔽贴图
├── Height/Displacement: 高度贴图
└── Emission: 发光贴图
```

#### 5.3.2 常见材质类型制作

**金属材质：**
```python
# 黄金材质设置
Principled BSDF:
├── Base Color: RGB(1.0, 0.766, 0.336)
├── Metallic: 1.0
├── Roughness: 0.1-0.3
├── IOR: 0.47 (金的折射率)
└── Specular: 1.0

# 不锈钢材质
├── Base Color: RGB(0.672, 0.672, 0.672)  
├── Metallic: 1.0
├── Roughness: 0.2-0.5
└── IOR: 2.9
```

**塑料材质：**
```python
# 光滑塑料
Principled BSDF:
├── Base Color: 任意颜色
├── Metallic: 0.0
├── Roughness: 0.1-0.3
├── IOR: 1.45 (典型塑料折射率)
└── Specular: 0.5
```

**玻璃材质：**
```python
# 透明玻璃
Principled BSDF:
├── Base Color: RGB(1.0, 1.0, 1.0)
├── Metallic: 0.0
├── Roughness: 0.0
├── IOR: 1.52 (玻璃折射率)
├── Transmission: 1.0
└── Alpha: 0.0 (完全透明)
```

### 5.4 纹理映射基础

#### 5.4.1 UV 坐标系统

**UV 坐标概念：**
```
U 轴: 水平方向 (0-1)
V 轴: 垂直方向 (0-1)

3D网格 → UV展开 → 2D纹理空间
```

#### 5.4.2 纹理坐标节点

**Texture Coordinate 节点输出：**

```python
Generated: 自动生成坐标
UV: UV贴图坐标  
Object: 物体坐标
Camera: 摄像机坐标
Window: 窗口坐标
Normal: 法向坐标
Reflection: 反射坐标
```

**Mapping 节点：**
用于变换纹理坐标

```python
Mapping 参数:
├── Location: 位置偏移
├── Rotation: 旋转角度
├── Scale: 缩放比例
└── Vector Type: 向量类型
   ├── Texture: 纹理
   ├── Point: 点
   ├── Vector: 向量
   └── Normal: 法向
```

### 5.5 程序化材质制作

#### 5.5.1 噪波纹理节点

**Noise Texture 噪波纹理：**
```python
参数设置:
├── Scale: 噪波缩放
├── Detail: 细节层数  
├── Roughness: 粗糙度
├── Lacunarity: 间隙度
├── Distortion: 扭曲度
└── Dimension: 维度

输出:
├── Fac: 灰度值 (0-1)
└── Color: 彩色噪波
```

**其他程序化纹理：**

| 纹理类型 | 用途 | 特点 |
|----------|------|------|
| Wave Texture | 波形纹理 | 规律的波纹图案 |
| Voronoi Texture | 泰森多边形 | 细胞状图案 |
| Musgrave Texture | 分形噪波 | 复杂地形纹理 |
| Gradient Texture | 渐变纹理 | 线性/径向渐变 |
| Magic Texture | 魔法纹理 | 迷幻图案 |
| Brick Texture | 砖块纹理 | 砖墙图案 |

#### 5.5.2 ColorRamp 节点

ColorRamp 用于重新映射颜色值：

```python
# ColorRamp 应用
噪波纹理 → ColorRamp → 材质参数

常用技巧:
1. 控制对比度 (调节色标位置)
2. 创建遮罩 (黑白输出)
3. 颜色分层 (多个色标)
4. 平滑过渡 (插值类型)
```

### 5.6 高级着色技术

#### 5.6.1 分层材质

使用 Mix Shader 混合多种材质：

```python
# 分层材质示例：生锈金属
金属层 (Principled BSDF - 金属参数)
     ↓
混合着色器 (Mix Shader)
     ↓  
锈迹层 (Principled BSDF - 绝缘体参数)

# 混合因子由纹理控制
噪波纹理 → ColorRamp → Mix Shader.Fac
```

#### 5.6.2 次表面散射

模拟光线在材质内部的散射：

```python
# 皮肤材质
Principled BSDF:
├── Subsurface: 0.1-0.5
├── Subsurface Radius: RGB(1.0, 0.2, 0.1)
├── Subsurface Color: 皮肤底色
└── Base Color: 皮肤表面色

# 蜡烛材质  
├── Subsurface: 0.3
├── Subsurface Color: 暖黄色
└── Transmission: 0.9
```

#### 5.6.3 置换贴图

使用高度信息改变几何体形状：

```python
# 置换设置流程
1. 在材质输出节点连接 Displacement
2. 图像纹理 → ColorRamp → 置换
3. 在修改器添加 Subdivision Surface
4. 启用 Adaptive Subdivision (实验性功能)

# 置换强度控制
Math 节点调节置换强度:
Height Map → Math(Multiply) → Displacement
```

### 5.7 材质优化和管理

#### 5.7.1 材质库管理

```python
# 材质保存和复用
1. 创建材质后点击 "Fake User" 按钮
2. File → Append/Link 导入其他文件的材质
3. 使用 Asset Browser 管理材质库
4. 创建材质节点组便于复用

# 节点组创建
1. 选择要群组的节点
2. Ctrl + G 创建节点组
3. Tab 进入节点组编辑
4. 添加输入/输出节点定义接口
```

#### 5.7.2 渲染优化

```python
# 材质渲染优化技巧
1. 合理使用纹理分辨率
   - 远景物体: 512x512 或更低
   - 近景物体: 2048x2048 或更高

2. 避免过度复杂的节点网络
   - 使用节点组简化
   - 删除未使用的节点

3. 启用GPU渲染加速
   - Cycles: CUDA/OpenCL/OptiX
   - 合理设置采样数
```

### 5.8 实战练习

#### 练习1：木材质制作

::: note 练习目标
掌握程序化材质制作和节点组合技巧
:::

```python
# 程序化木材质制作
# 第一步：创建基础木纹
1. 添加 Wave Texture 节点
2. Type: Bands, Profile: Saw
3. Scale: 20, Distortion: 2

# 第二步：添加木纹变化  
4. 添加 Noise Texture
5. Scale: 5, Detail: 10
6. 连接到 Wave Texture 的 Distortion

# 第三步：颜色调节
7. Wave Texture → ColorRamp
8. 设置两个色标：浅木色和深木色
9. ColorRamp → Principled BSDF Base Color

# 第四步：表面细节
10. 复制噪波纹理用于粗糙度
11. 调节强度: Math节点 × 0.3
12. 连接到 Roughness 输入

# 第五步：法线细节
13. 添加另一个 Noise Texture (更小尺度)
14. 连接到 Normal Map 节点
15. Normal Map → Principled BSDF Normal
```

#### 练习2：车漆材质

```python
# 汽车金属漆材质
# 第一步：基础车漆
1. Principled BSDF 设置:
   - Base Color: 选择汽车颜色
   - Metallic: 0.0 (车漆是绝缘体)
   - Roughness: 0.1 (光滑)
   - IOR: 1.5

# 第二步：金属粉效果
2. 添加 Noise Texture (Scale: 1000)
3. ColorRamp 调节对比度
4. Math节点调节强度 × 0.1
5. 连接到 Metallic 输入

# 第三步：清漆层效果
6. 添加 Mix Shader
7. 第一个输入: 上面的车漆材质
8. 第二个输入: Glossy BSDF (Roughness: 0.05)
9. Factor: 0.1 (10%的清漆层)

# 第四步：环境反射增强
10. 添加 Layer Weight 节点
11. Fresnel 输出 → Mix Shader Factor
12. 增强边缘反射效果
```

#### 练习3：复杂织物材质

::: warning 注意事项
- 织物材质需要合适的UV展开
- 注意纤维的各向异性反射
- 使用次表面散射模拟光线透射
:::

```python
# 毛衣织物材质
# 第一步：基础织物颜色
1. 选择合适的织物固有色
2. Principled BSDF Base Color

# 第二步：织物纹理
3. 使用 Brick Texture 模拟编织纹理
4. Scale: 50, Mortar: 0.02
5. Color1/Color2 设置不同深浅

# 第三步：表面绒毛效果
6. 添加 Hair BSDF
7. Mix Shader 混合 Principled 和 Hair
8. Factor 由纹理控制 (约0.3)

# 第四步：次表面散射
9. 启用 Subsurface: 0.1
10. Subsurface Color: 略暖于 Base Color

# 第五步：法线细节
11. 使用 Noise Texture 创建细微凹凸
12. Normal Map 强度: 0.5
13. 模拟纤维表面纹理
```

### 5.9 节点快捷键和技巧

#### 5.9.1 节点编辑快捷键

| 操作 | 快捷键 | 说明 |
|------|-------|------|
| 添加节点 | Shift + A | 打开添加菜单 |
| 删除节点 | X / Delete | 删除选中节点 |
| 复制节点 | Shift + D | 复制并移动 |
| 切断连线 | Ctrl + 右键拖拽 | 切断节点连接 |
| 预览节点 | Ctrl + Shift + 左键 | 预览节点输出 |
| 静音节点 | M | 禁用节点 |
| 隐藏节点 | H | 隐藏选中节点 |
| 节点组 | Ctrl + G | 创建节点组 |
| 进入节点组 | Tab | 编辑节点组 |
| 搜索节点 | Ctrl + A | 智能添加节点 |

#### 5.9.2 高效节点编辑技巧

```python
# 快速节点连接
1. Node Wrangler 插件 (内置)
   - Ctrl + Shift + T: 添加纹理设置节点
   - Ctrl + T: 添加 Mapping + Texture Coordinate

# 节点对齐
2. 选择多个节点后:
   - Shift + = : 对齐节点

# 快速预览
3. Ctrl + Shift + 左键: 临时输出到材质输出
   方便快速查看中间节点效果

# 节点搜索添加
4. Shift + A 后直接输入节点名称
   如: "noise" 快速找到 Noise Texture
```

### 5.10 渲染引擎差异

#### 5.10.1 Cycles vs Eevee 材质差异

**Cycles (离线渲染)：**
- 完整支持所有节点类型
- 物理准确的光线追踪
- 支持复杂的体积渲染
- 渲染质量高但速度较慢

**Eevee (实时渲染)：**
- 部分节点支持有限
- 基于栅格化的实时渲染
- 需要预处理 (烘焙) 某些效果
- 速度快但质量有所妥协

**材质兼容性：**

| 功能 | Cycles | Eevee | 备注 |
|------|--------|-------|------|
| Principled BSDF | ✓ | ✓ | 完全支持 |
| 体积散射 | ✓ | 部分 | Eevee需开启体积 |
| 置换贴图 | ✓ | ✗ | Eevee不支持 |
| 次表面散射 | ✓ | ✓ | 都支持 |
| IOR折射 | ✓ | 近似 | Eevee使用屏幕空间 |

::: tip 学习建议
1. **从基础开始**：先掌握Principled BSDF的各个参数
2. **观察现实**：多观察真实材质的光影变化
3. **实验精神**：尝试不同的节点组合
4. **参考学习**：研究优秀作品的材质制作
5. **保持整洁**：使用Frame和Reroute节点整理复杂网络
:::

通过本章学习，你应该能够：
- 熟练使用着色器节点系统
- 制作各种类型的PBR材质
- 理解程序化材质制作方法
- 掌握材质优化和管理技巧

材质制作是3D艺术的重要组成部分，需要技术知识和艺术感觉的结合。