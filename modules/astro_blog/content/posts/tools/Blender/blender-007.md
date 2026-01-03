---
title: 第7章：光照与渲染设置
date: 2024-01-01
category:
  - Blender
  - 3D建模
  - 动画
tag:
  - 光照
  - 渲染
  - Cycles
  - Eevee
---

# 第7章：光照与渲染设置

## 学习目标

1. 理解3D光照的基本原理和类型
2. 掌握Blender中各种光源的使用方法
3. 学会设置室内外光照场景
4. 熟练使用Cycles和Eevee渲染引擎
5. 掌握渲染设置的优化技巧
6. 学会创建真实感的光影效果

::: tip 本章重点
光照是3D渲染的灵魂，决定了场景的氛围、真实感和视觉冲击力。本章将深入学习光照理论和渲染技术。
:::

## 7.1 光照基础理论

### 7.1.1 光的物理特性

::: note 光的基本属性
- **颜色（Color）**：光的波长决定颜色
- **强度（Intensity）**：光的亮度程度
- **方向（Direction）**：光线传播方向
- **衰减（Falloff）**：光强度随距离衰减
- **散射（Scattering）**：光线与介质相互作用
:::

```python
# 光照物理模型
class LightPhysics:
    def __init__(self):
        self.wavelength = 550  # 纳米（绿光）
        self.intensity = 100   # 流明
        self.temperature = 5500  # 开尔文
        self.falloff_type = 'inverse_square'
    
    def calculate_illumination(self, distance):
        """计算指定距离的光照强度"""
        return self.intensity / (distance ** 2)
```

### 7.1.2 光照模型分类

| 光照类型 | 特点描述 | 应用场景 | 计算复杂度 |
|---------|---------|---------|-----------|
| 直接光照 | 光源直接照射 | 主要光源 | 低 |
| 间接光照 | 反射和散射光 | 环境光照 | 高 |
| 全局光照 | 直接+间接光照 | 真实感渲染 | 很高 |
| 体积光照 | 体积散射效果 | 大气效果 | 高 |

### 7.1.3 色温与光色

```python
# 常见光源色温参考
color_temperatures = {
    'candle': 1900,           # 蜡烛
    'tungsten': 3200,         # 钨丝灯
    'fluorescent': 4000,      # 荧光灯
    'daylight': 5500,         # 日光
    'overcast': 6500,         # 阴天
    'blue_sky': 10000         # 蓝天
}
```

## 7.2 Blender光源类型详解

### 7.2.1 点光源（Point Light）

**特性**：向四面八方均匀发光的点光源

```python
# 点光源设置参数
point_light_settings = {
    'energy': 100.0,          # 光源强度
    'color': (1.0, 1.0, 1.0), # 光源颜色
    'shadow_soft_size': 0.1,  # 阴影柔和度
    'use_custom_distance': False,  # 自定义距离
    'cutoff_distance': 40.0   # 截止距离
}
```

::: tip 点光源应用场景
- 灯泡、蜡烛等小型光源
- 室内照明补光
- 特效光源（魔法光球等）
:::

### 7.2.2 聚光灯（Spot Light）

**特性**：锥形光束，可控制照射角度和边缘柔和度

```python
# 聚光灯参数配置
spot_light_settings = {
    'energy': 100.0,
    'spot_size': math.radians(45),  # 光锥角度（弧度）
    'spot_blend': 0.15,             # 光锥边缘混合
    'show_cone': True,              # 显示光锥
    'use_square': False,            # 使用方形光锥
    'shadow_soft_size': 0.1
}
```

**应用技巧**：
- **戏剧性照明**：创造强烈明暗对比
- **聚焦照明**：突出特定物体或区域
- **建筑照明**：模拟射灯、车灯效果

### 7.2.3 区域光（Area Light）

**特性**：面状光源，产生柔和阴影

```python
# 区域光设置类型
area_light_types = {
    'RECTANGLE': {
        'size_x': 2.0,        # X方向尺寸
        'size_y': 1.0,        # Y方向尺寸
        'shape': 'RECTANGLE'   # 矩形
    },
    'SQUARE': {
        'size': 1.0,          # 正方形边长
        'shape': 'SQUARE'
    },
    'DISK': {
        'size': 1.0,          # 圆盘半径
        'shape': 'DISK'
    },
    'ELLIPSE': {
        'size_x': 2.0,
        'size_y': 1.0,
        'shape': 'ELLIPSE'    # 椭圆
    }
}
```

::: note 区域光优势
- 产生自然的软阴影
- 模拟窗户、显示器等面光源
- 创造摄影棚级别的照明效果
:::

### 7.2.4 太阳光（Sun Light）

**特性**：平行光，模拟遥远光源（如太阳）

```python
# 太阳光配置
sun_light_settings = {
    'energy': 5.0,            # 太阳强度
    'angle': math.radians(0.533),  # 太阳角直径
    'color': (1.0, 0.95, 0.8),     # 暖色调
    'shadow_soft_size': 0.1
}
```

## 7.3 环境光照设置

### 7.3.1 世界材质配置

::: warning 世界材质重要性
世界材质不仅影响背景，还提供全局环境光照，是场景氛围的重要组成部分。
:::

```python
# 世界材质节点设置
world_material_nodes = {
    'background_shader': {
        'type': 'ShaderNodeBackground',
        'color': (0.05, 0.05, 0.1, 1.0),  # 深蓝夜空
        'strength': 1.0
    },
    'environment_texture': {
        'type': 'ShaderNodeTexEnvironment',
        'image': 'hdri_sky.exr',
        'interpolation': 'Linear'
    }
}
```

### 7.3.2 HDRI环境贴图

#### HDRI选择指南

| HDRI类型 | 特点 | 适用场景 | 文件大小 |
|---------|------|---------|---------|
| 室外天空 | 自然光照 | 产品展示 | 大 |
| 室内环境 | 柔和光照 | 角色渲染 | 中 |
| 工作室 | 均匀照明 | 专业摄影 | 小 |
| 特殊环境 | 创意效果 | 艺术作品 | 变化 |

```python
# HDRI设置优化
hdri_settings = {
    'rotation_z': 0.0,        # Z轴旋转调整光照方向
    'strength': 1.0,          # 环境光强度
    'saturation': 1.0,        # 颜色饱和度
    'hue': 0.5,              # 色相调整
    'gamma': 1.0,            # 伽马校正
    'exposure': 0.0          # 曝光调整
}
```

### 7.3.3 天空纹理节点

```python
# 程序化天空设置
sky_texture_settings = {
    'sky_type': 'NISHITA',    # 大气散射模型
    'sun_elevation': 0.26,    # 太阳高度角
    'sun_rotation': 0.0,      # 太阳方位角
    'altitude': 0.0,          # 观察高度
    'air_density': 1.0,       # 大气密度
    'dust_density': 1.0,      # 尘埃密度
    'ozone_density': 1.0      # 臭氧密度
}
```

## 7.4 三点布光经典设置

### 7.4.1 主光（Key Light）

**作用**：提供主要照明，建立场景的基调

```python
# 主光设置参数
key_light = {
    'type': 'AREA',           # 区域光
    'energy': 100.0,          # 高强度
    'size': 2.0,              # 大面积柔化
    'location': (2, -2, 3),   # 45度角位置
    'rotation': (math.radians(45), 0, math.radians(45))
}
```

### 7.4.2 补光（Fill Light）

**作用**：填补阴影区域，减少对比度

```python
# 补光设置参数
fill_light = {
    'type': 'AREA',
    'energy': 30.0,           # 较低强度
    'size': 3.0,              # 更大面积
    'location': (-2, -2, 2),  # 主光对侧
    'color': (0.8, 0.9, 1.0)  # 冷色调平衡
}
```

### 7.4.3 轮廓光（Rim Light）

**作用**：勾勒物体轮廓，增强立体感

```python
# 轮廓光设置参数
rim_light = {
    'type': 'SPOT',
    'energy': 50.0,
    'spot_size': math.radians(60),
    'location': (0, 3, 2),    # 背后位置
    'color': (1.0, 0.9, 0.7)  # 暖色轮廓
}
```

::: tip 三点布光进阶
根据场景需要，可以添加背景光、发光、踢脚光等额外光源来丰富光影效果。
:::

## 7.5 渲染引擎对比

### 7.5.1 Cycles渲染引擎

#### 技术特点
- **路径追踪**：物理准确的光线计算
- **全局光照**：真实的光线反弹
- **无偏渲染**：理论上无限接近真实

```python
# Cycles渲染设置
cycles_settings = {
    'samples': 128,           # 采样数量
    'max_bounces': 12,        # 最大反弹次数
    'diffuse_bounces': 4,     # 漫反射反弹
    'glossy_bounces': 4,      # 光泽反弹
    'transmission_bounces': 12, # 透射反弹
    'volume_bounces': 0,      # 体积反弹
    'transparent_max_bounces': 8, # 透明反弹
    'use_denoising': True,    # 使用降噪
    'denoiser': 'OPTIX'       # 降噪器类型
}
```

#### 优化技巧

::: code-tabs
@tab 样本优化

```python
# 自适应采样
adaptive_sampling = {
    'use_adaptive_sampling': True,
    'adaptive_threshold': 0.01,    # 阈值
    'adaptive_min_samples': 0,     # 最小样本
    'adaptive_samples': 128        # 自适应样本
}
```

@tab 光线剔除

```python
# 光线剔除设置
light_paths = {
    'caustics_reflective': False,  # 关闭反射焦散
    'caustics_refractive': False,  # 关闭折射焦散
    'filter_glossy': 1.0          # 光泽滤波
}
```
:::

### 7.5.2 Eevee渲染引擎

#### 技术特点
- **实时渲染**：基于OpenGL的快速渲染
- **屏幕空间效果**：高效的近似算法
- **游戏引擎级别**：适合交互和预览

```python
# Eevee渲染设置
eevee_settings = {
    'taa_render_samples': 64,     # TAA渲染样本
    'taa_samples': 16,            # TAA视口样本
    'use_bloom': True,            # 辉光效果
    'bloom_threshold': 0.8,       # 辉光阈值
    'bloom_intensity': 0.05,      # 辉光强度
    'use_ssr': True,              # 屏幕空间反射
    'ssr_quality': 0.25,          # SSR质量
    'use_gtao': True,             # 环境遮蔽
    'gtao_distance': 0.2          # AO距离
}
```

### 7.5.3 引擎选择指南

| 场景类型 | 推荐引擎 | 理由 | 注意事项 |
|---------|---------|------|---------|
| 产品渲染 | Cycles | 物理准确 | 渲染时间长 |
| 建筑可视化 | Cycles | 真实光照 | 需要降噪 |
| 角色动画 | Eevee | 实时预览 | 光照限制 |
| 概念设计 | Eevee | 快速迭代 | 效果近似 |
| 游戏资产 | Eevee | 实时渲染 | 优化设置 |

## 7.6 高级光照技术

### 7.6.1 体积光效果

::: note 体积光应用
体积光模拟光线在大气中的散射效果，常用于创造戏剧性的光束效果。
:::

```python
# 体积光设置
volume_lighting = {
    'principled_volume': {
        'density': 0.1,           # 密度
        'anisotropy': 0.0,        # 各向异性
        'absorption_color': (1.0, 1.0, 1.0),  # 吸收颜色
        'scattering_color': (1.0, 1.0, 1.0),  # 散射颜色
        'emission_strength': 0.0  # 发光强度
    }
}
```

### 7.6.2 光线追踪效果

#### 反射和折射
```python
# 光线追踪材质设置
ray_tracing_material = {
    'use_screen_refraction': True,  # 屏幕空间折射
    'refraction_depth': 0.1,        # 折射深度
    'use_backface_culling': False,  # 背面剔除
    'blend_method': 'ALPHA_HASHED', # 混合方法
    'shadow_method': 'HASHED'       # 阴影方法
}
```

### 7.6.3 光照组（Light Groups）

```python
# 光照组设置
light_groups = {
    'key_lights': ['Key_Light', 'Fill_Light'],
    'rim_lights': ['Rim_Light', 'Hair_Light'],
    'environment': ['HDRI_World', 'Sky_Light'],
    'effects': ['Magic_Orb', 'Fire_Glow']
}
```

## 7.7 室内外光照场景

### 7.7.1 室外日景光照

```python
# 日景光照配置
daylight_setup = {
    'sun_light': {
        'energy': 5.0,
        'angle': math.radians(0.533),
        'color': (1.0, 0.95, 0.8)
    },
    'sky_texture': {
        'sun_elevation': math.radians(60),  # 中午太阳高度
        'atmosphere_turbidity': 2.0,       # 大气浑浊度
        'ground_albedo': 0.3               # 地面反照率
    }
}
```

### 7.7.2 室外夜景光照

```python
# 夜景光照配置
night_setup = {
    'moon_light': {
        'energy': 0.5,
        'color': (0.8, 0.9, 1.0)  # 冷月光
    },
    'street_lights': {
        'energy': 50.0,
        'color': (1.0, 0.8, 0.6),  # 暖街灯
        'falloff_type': 'INVERSE_SQUARE'
    },
    'world_background': {
        'color': (0.02, 0.02, 0.05, 1.0)  # 深蓝夜空
    }
}
```

### 7.7.3 室内自然光照

::: tip 室内光照原则
- 主光源：窗户自然光
- 辅助光源：室内灯具
- 反射光：墙面和地面反射
:::

```python
# 室内光照设置
interior_lighting = {
    'window_light': {
        'type': 'AREA',
        'size_x': 2.0,
        'size_y': 3.0,
        'energy': 20.0,
        'color': (0.9, 0.95, 1.0)  # 冷日光
    },
    'ceiling_light': {
        'type': 'AREA',
        'size': 1.0,
        'energy': 15.0,
        'color': (1.0, 0.9, 0.8)   # 暖室内光
    }
}
```

## 7.8 阴影控制技术

### 7.8.1 阴影类型对比

| 阴影类型 | 计算方式 | 质量 | 性能 | 适用场景 |
|---------|---------|------|------|---------|
| Ray Traced | 光线追踪 | 最高 | 最低 | 最终渲染 |
| Shadow Map | 阴影贴图 | 中等 | 高 | 实时预览 |
| Contact | 接触阴影 | 低 | 最高 | 细节补充 |

### 7.8.2 阴影优化设置

```python
# 阴影优化配置
shadow_optimization = {
    'cascade_size': 1024,      # 级联阴影大小
    'high_bitdepth': True,     # 高位深度
    'soft_shadows': True,      # 软阴影
    'contact_shadows': {
        'use': True,
        'distance': 0.2,       # 接触距离
        'bias': 0.001,         # 偏移值
        'thickness': 0.2       # 厚度
    }
}
```

## 7.9 渲染优化策略

### 7.9.1 分层渲染

::: note 分层渲染优势
- 后期调整灵活性
- 减少重复渲染
- 便于问题排查
:::

```python
# 渲染层设置
render_layers = {
    'beauty': ['Combined'],           # 主美观层
    'lighting': ['DiffDir', 'DiffInd', 'GlossDir'],  # 光照分解
    'utility': ['Normal', 'UV', 'ObjectID'],         # 工具层
    'effects': ['Emission', 'Environment']           # 效果层
}
```

### 7.9.2 区域渲染

```python
# 区域渲染设置
region_render = {
    'use_border': True,        # 使用边界
    'border_min_x': 0.25,      # 最小X
    'border_max_x': 0.75,      # 最大X
    'border_min_y': 0.25,      # 最小Y
    'border_max_y': 0.75,      # 最大Y
    'use_crop_to_border': True # 裁剪到边界
}
```

### 7.9.3 网络渲染

```python
# 网络渲染配置
network_render = {
    'server_address': '192.168.1.100',
    'server_port': 8000,
    'chunk_size': 64,          # 分块大小
    'priority': 50,            # 优先级
    'use_compositing': False   # 分布式合成
}
```

## 7.10 色彩管理

### 7.10.1 色彩空间设置

::: warning 色彩管理重要性
正确的色彩管理确保从建模到最终输出的色彩一致性。
:::

```python
# 色彩空间配置
color_management = {
    'view_transform': 'Filmic',    # 视图变换
    'look': 'None',                # 外观
    'exposure': 0.0,               # 曝光
    'gamma': 1.0,                  # 伽马
    'sequencer_colorspace': 'sRGB' # 序列编辑器色彩空间
}
```

### 7.10.2 色调映射

```python
# 色调映射参数
tone_mapping = {
    'filmic_contrast': 1.0,    # 对比度
    'filmic_saturation': 1.0,  # 饱和度
    'filmic_whitepoint': 1.0,  # 白点
    'filmic_shadows': 1.0,     # 阴影
    'filmic_midtones': 1.0,    # 中间调
    'filmic_highlights': 1.0   # 高光
}
```

## 7.11 实战项目案例

### 7.11.1 产品展示光照

**目标**：创建专业的产品展示光照效果

**设置要点**：
1. 主光：大面积柔光
2. 填充光：减少阴影对比
3. 背景光：干净的背景分离
4. 轮廓光：突出产品边缘

```python
# 产品展示光照设置
product_lighting = {
    'key_light': {
        'type': 'AREA',
        'size': 3.0,
        'energy': 100.0,
        'location': (2, -3, 4)
    },
    'fill_light': {
        'type': 'AREA', 
        'size': 4.0,
        'energy': 30.0,
        'location': (-2, -2, 2)
    },
    'rim_light': {
        'type': 'AREA',
        'size': 1.0,
        'energy': 80.0,
        'location': (0, 4, 3)
    }
}
```

### 7.11.2 建筑可视化光照

**目标**：创建真实的建筑室内外光照

**技术要点**：
- HDRI环境光照
- 太阳光模拟
- 室内人工光源
- 材质配合光照

### 7.11.3 角色打光设置

**目标**：为3D角色创建电影级打光

**关键技术**：
- 三点布光基础
- 肤色适配光色
- 头发独立光照
- 眼部高光强调

## 7.12 快捷键与工作流

### 7.12.1 光照相关快捷键

| 快捷键 | 功能 | 使用场景 |
|-------|------|---------|
| `Shift + A` | 添加光源 | 创建光照 |
| `Ctrl + L` | 选择所有光源 | 批量调整 |
| `Shift + L` | 选择类似光源 | 同类调整 |
| `H` | 隐藏选中项 | 简化视图 |
| `Alt + H` | 显示隐藏项 | 恢复显示 |

### 7.12.2 渲染相关快捷键

| 快捷键 | 功能 | 说明 |
|-------|------|------|
| `F12` | 开始渲染 | 全图渲染 |
| `Ctrl + F12` | 渲染动画 | 序列渲染 |
| `F11` | 显示渲染结果 | 查看结果 |
| `Shift + Z` | 切换渲染视图 | 实时预览 |
| `Z` | 视图切换 | 显示模式 |

## 7.13 疑难问题解决

### 7.13.1 渲染噪点问题

::: warning 常见噪点来源
- 采样数量不足
- 光照设置不当
- 材质反射过于复杂
- 间接光照计算不足
:::

```python
# 降噪设置优化
denoising_setup = {
    'use_denoising': True,
    'denoiser': 'OPTIX',       # 或 'OPENIMAGEDENOISE'
    'denoise_pass': 'COMBINED', # 降噪通道
    'denoising_prefilter': 'ACCURATE',  # 预滤波
    'use_denoising_start_sample': True,  # 起始采样
    'denoising_start_sample': 1    # 起始样本数
}
```

### 7.13.2 光照过曝问题

```python
# 曝光控制方法
exposure_control = {
    'method_1': '降低光源强度',
    'method_2': '调整世界曝光值',
    'method_3': '使用色调映射',
    'method_4': '增加填充光平衡'
}
```

### 7.13.3 阴影伪影处理

```python
# 阴影问题解决
shadow_fixes = {
    'acne': '增加阴影偏移值',
    'peter_panning': '减少偏移值',
    'soft_shadows': '增大光源面积',
    'cascade_shadow': '调整级联设置'
}
```

## 本章小结

本章系统学习了3D光照与渲染的核心技术：

1. **光照理论**：理解了光的物理特性和光照模型
2. **光源使用**：掌握了各类光源的特点和应用
3. **环境光照**：学会了HDRI和程序化天空的使用
4. **渲染引擎**：对比了Cycles和Eevee的优劣
5. **高级技术**：掌握了体积光、光线追踪等效果
6. **实战应用**：通过项目练习提升了实际操作能力

光照是3D艺术的核心技能，需要大量的实践和观察来培养光影感觉。在下一章中，我们将开始学习动画制作的基础知识。

::: tip 持续提升
多观察现实世界中的光影变化，分析不同时间、天气下的光照特点，这将极大提升你的光照设计能力。
:::