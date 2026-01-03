---
title: 第12章：物理模拟与动力学
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---

## 学习目标
1. 理解刚体物理模拟
2. 掌握柔体和布料模拟
3. 学会流体模拟系统
4. 掌握烟雾和火焰模拟
5. 理解碰撞检测和约束系统

## 12.1 物理模拟基础

### 物理模拟概念
- **物理引擎**：计算物体运动和交互的系统
- **时间步长**：模拟计算的时间间隔
- **碰撞检测**：判断物体是否相撞的算法
- **约束系统**：限制物体运动的规则

### Blender物理系统
```
属性面板 → 物理属性
- Rigid Body：刚体模拟
- Soft Body：柔体模拟
- Cloth：布料模拟
- Fluid：流体模拟
- Collision：碰撞检测
```

### 世界设置
```
场景属性 → 重力
- Gravity: [0, 0, -9.8] (标准重力)
- Units: 单位设置影响物理计算
```

## 12.2 刚体物理模拟

### 基本概念
- **Active（主动刚体）**：参与物理计算的动态物体
- **Passive（被动刚体）**：静态碰撞体，不受力影响
- **质心（Center of Mass）**：物体重心位置

### 刚体设置
```
物理属性 → Rigid Body:
- Type: Active/Passive
- Shape: 碰撞形状
  - Box: 盒型（快速）
  - Sphere: 球型
  - Convex Hull: 凸包
  - Mesh: 精确网格（慢）
- Mass: 质量
- Friction: 摩擦力
- Bounciness: 弹性
```

### 约束系统
1. **Fixed（固定）**：完全固定两个物体
2. **Point（点）**：在点处连接，可自由旋转
3. **Hinge（铰链）**：沿一个轴旋转
4. **Slider（滑块）**：沿一个轴滑动
5. **Spring（弹簧）**：弹性连接

### 实例：多米诺骨牌
```python
# 创建多米诺序列
import bpy
import bmesh

def create_domino_sequence(count=10, spacing=2.0):
    for i in range(count):
        # 创建立方体
        bpy.ops.mesh.primitive_cube_add(
            location=(i * spacing, 0, 1), 
            scale=(0.2, 1, 2)
        )
        
        # 设置刚体
        obj = bpy.context.active_object
        obj.rigid_body.type = 'ACTIVE'
        obj.rigid_body.mass = 1.0
        obj.rigid_body.friction = 0.5
```

## 12.3 柔体模拟

### 柔体原理
- **弹簧-质点模型**：顶点作为质点，边作为弹簧
- **内力**：维持形状的弹性力
- **外力**：重力、风力等环境力

### 基本设置
```
物理属性 → Soft Body:
- Object → Mass: 质量
- Object → Friction: 摩擦系数
- Object → Speed: 运动阻尼

Goal:
- Strength: 目标强度
- Default: 默认权重
```

### 弹簧设置
```
Edges:
- Pull: 拉伸强度
- Push: 压缩强度
- Damping: 阻尼
- Plastic: 塑性变形
- Bending: 弯曲强度
```

### 自碰撞
```
Self Collision:
- Enable: 启用自碰撞
- Size: 碰撞球半径
- Stiffness: 碰撞强度
```

## 12.4 布料模拟

### 布料物理
- **织物结构**：经纬线交织结构
- **拉伸阻力**：防止过度拉伸
- **弯曲阻力**：维持布料厚度感

### 基本设置
```
物理属性 → Cloth:
Physical Properties:
- Mass: 面密度
- Air Viscosity: 空气阻力
- Bending Stiffness: 弯曲刚度

Material:
- Structural: 结构强度
- Shear: 剪切强度
- Bending: 弯曲强度
```

### 布料预设
- **Cotton（棉布）**：中等强度
- **Silk（丝绸）**：柔软光滑
- **Denim（牛仔布）**：厚重坚韧
- **Leather（皮革）**：硬质材料
- **Rubber（橡胶）**：高弹性

### 固定点设置
```
Shape → Pin Group:
1. 在编辑模式选择固定顶点
2. 创建顶点组
3. 在布料设置中指定Pin Group
```

### 风力效果
```
添加 → Force Field → Wind
- Strength: 风力强度
- Flow: 气流效果
- Noise: 湍流噪声
```

## 12.5 流体模拟

### 流体类型
1. **Domain（域）**：计算流体的空间范围
2. **Flow（流）**：产生或吸收流体的物体
3. **Effector（效应器）**：影响流体的物体

### Mantaflow引擎
```
物理属性 → Fluid:
Type: Domain
Settings:
- Resolution: 计算精度
- Time Scale: 时间缩放
- CFL Number: 稳定性参数
- Gravity: 重力设置
```

### 液体模拟
```
Domain → Liquid:
- Viscosity: 粘度
- Surface Tension: 表面张力
- Density: 密度

Flow Object:
- Flow Type: Liquid
- Flow Behavior: Inflow/Outflow
- Initial Velocity: 初始速度
```

### 气体模拟（烟雾）
```
Domain → Gas:
- Density: 密度
- Temperature: 温度
- Vorticity: 涡流强度

Flow Object:
- Flow Type: Smoke/Fire/Both
- Density: 烟雾密度
- Temperature: 温度差
```

## 12.6 烟雾和火焰模拟

### 快速设置
```
Object → Quick Effects:
- Smoke: 烟雾效果
- Fire: 火焰效果
- Smoke + Fire: 组合效果
```

### 高级火焰设置
```
Flow Settings:
- Fuel: 燃料量
- Burn Rate: 燃烧速率
- Flame Smoke: 火焰产生的烟雾
- Temperature: 火焰温度

Domain Settings:
- Flame Vorticity: 火焰涡流
- Burning Rate: 燃烧速率
- Smoke Color: 烟雾颜色
```

### 材质设置
```
Shader Editor → Volume:
- Principled Volume: 主体积材质
- Density: 连接烟雾密度
- Color: 连接火焰颜色
- Temperature: 连接温度属性
```

## 12.7 碰撞系统

### 碰撞设置
```
物理属性 → Collision:
- Enabled: 启用碰撞
- Damping: 阻尼系数
- Thickness: 碰撞厚度
- Friction: 摩擦系数
- Permeability: 渗透性
```

### 碰撞形状优化
- **简单形状**：Box、Sphere用于性能
- **精确形状**：Mesh用于准确性
- **内外检测**：Single Sided vs Double Sided

### 碰撞组
```
Relations:
- Collision Group: 碰撞组
- Absorb Group: 吸收组
用于控制哪些物体可以碰撞
```

## 12.8 约束与连接

### 刚体约束
```
添加 → Empty → 选择约束类型
Rigid Body Constraint:
- Type: 约束类型
- Object 1/2: 连接的物体
- Breaking Threshold: 断裂阈值
```

### 约束参数
1. **Generic约束**：
   - Location: 位置限制
   - Rotation: 旋转限制
   - Springs: 弹簧设置

2. **Motor约束**：
   - Target Velocity: 目标速度
   - Max Impulse: 最大冲量

## 12.9 高级物理技巧

### 缓存管理
```
Cache:
- Start/End Frame: 缓存范围
- Disk Cache: 磁盘缓存
- Compression: 压缩选项
```

### 性能优化
1. **降低分辨率**：减少计算量
2. **使用简化碰撞**：Box代替Mesh
3. **限制影响范围**：设置Force Field距离
4. **分层计算**：将复杂场景分解

### 时间重映射
```
Scene → Time Remapping:
- Speed: 播放速度
- Frame Remapping: 帧重映射
用于创建慢动作或加速效果
```

## 12.10 实战案例

### 案例1：破碎效果
1. 使用Cell Fracture插件分割物体
2. 设置碎片为Active刚体
3. 添加爆炸力场
4. 调整质量和摩擦参数

### 案例2：布料下落
1. 创建布料平面
2. 设置Pin Group固定角落
3. 添加碰撞地面
4. 调整布料参数实现真实感

### 案例3：液体容器
1. 创建容器（设为碰撞体）
2. 设置液体域
3. 添加液体流入物体
4. 调整粘度和表面张力

## 实践练习
1. 创建保龄球游戏场景
2. 制作旗帜飘扬动画
3. 模拟水杯倒水效果
4. 设计爆炸破坏场景
5. 制作烟雾上升动画

## 关键要点
- 物理模拟需要合理的世界设置和单位
- 刚体模拟适合硬质物体的碰撞
- 柔体模拟可以创造有机变形效果
- 布料模拟需要合适的固定点和参数
- 流体模拟分辨率影响真实感和性能
- 约束系统可以创造复杂的机械运动
- 缓存管理对于复杂模拟至关重要

## 下一章预告
下一章将学习节点系统与程序化工作流，包括着色器节点、几何节点和复合节点的高级应用。