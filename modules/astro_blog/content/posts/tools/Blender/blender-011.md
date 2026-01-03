---
title: "第11章：特效与粒子系统"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第11章：特效与粒子系统

## 学习目标
1. 掌握粒子系统的基本设置
2. 学会创建火焰、烟雾、水花等效果
3. 理解力场和物理模拟
4. 掌握头发和毛发系统
5. 学会群体动画和实例化

## 11.1 粒子系统基础

### 粒子系统概念
- **粒子系统**：模拟大量小物体的系统，如雨滴、雪花、火花等
- **发射器**：产生粒子的物体
- **粒子生命周期**：出生 → 存活 → 死亡

### 粒子系统类型
1. **Emitter（发射器）**：从表面发射粒子
2. **Hair（毛发）**：创建毛发和草地效果

### 基本设置
```
属性面板 → 粒子系统属性
- Type：选择粒子类型
- Emission：控制发射参数
  - Number：粒子总数
  - Frame Start/End：发射时间范围
- Lifetime：粒子寿命
```

## 11.2 发射器粒子系统

### 发射设置
- **From（发射源）**：
  - Verts：从顶点发射
  - Faces：从面发射
  - Volume：从体积发射
- **Random（随机性）**：增加自然感

### 速度控制
- **Velocity（速度）**：
  - Normal：沿法线方向
  - Random：随机方向
  - Object：沿物体轴向
- **Physics Type（物理类型）**：
  - Newtonian：牛顿物理
  - Keyed：关键帧控制
  - Boids：群体行为

### 渲染设置
- **Render As（渲染为）**：
  - Object：渲染为指定物体
  - Halo：光晕效果
  - Line：线条
  - Path：路径

## 11.3 创建常见特效

### 11.3.1 火焰效果
1. 创建发射器平面
2. 添加粒子系统
3. 设置发射参数：
   ```
   Number: 1000
   Lifetime: 60
   Velocity → Normal: 5
   Random: 2
   ```
4. 物理设置：
   ```
   Physics Type: Fluid
   Settings → Density: 0.1
   ```
5. 力场设置：添加向上的风力

### 11.3.2 烟雾效果
1. 使用Quick Effects → Smoke
2. 调整域设置：
   ```
   Domain → Resolution: 64
   Density: 0.5
   Temperature Diff: 1.0
   ```
3. 发射器设置：
   ```
   Flow Type: Smoke
   Density: 2.0
   ```

### 11.3.3 水花效果
1. 创建水面和碰撞体
2. 设置粒子系统：
   ```
   Physics Type: Fluid
   Fluid → Stiffness: 0.8
   Viscosity: 0.2
   ```
3. 材质设置：透明度和反射

## 11.4 力场系统

### 力场类型
1. **Force（力）**：恒定方向的力
2. **Wind（风）**：风力效果
3. **Vortex（漩涡）**：旋转力场
4. **Magnetic（磁场）**：磁力吸引
5. **Turbulence（湍流）**：随机扰动

### 力场属性
- **Strength（强度）**：力场强度
- **Flow（流动）**：影响粒子流动
- **Noise（噪声）**：添加随机性
- **Absorption（吸收）**：粒子被吸收的程度

### 碰撞设置
```
物体属性 → 物理属性 → 碰撞
- Enabled：启用碰撞
- Damping：阻尼系数
- Friction：摩擦力
- Permeability：渗透性
```

## 11.5 毛发系统

### 基础毛发设置
1. 选择物体，添加粒子系统
2. Type设置为Hair：
   ```
   Hair Length: 1.0
   Segments: 5
   Children → Type: Simple
   Display Amount: 50%
   ```

### 毛发造型
1. **Comb（梳理）**：
   - 切换到粒子编辑模式
   - 使用梳子工具调整方向
2. **Cut（剪切）**：
   - 调整毛发长度
3. **Add（添加）**：
   - 增加毛发密度

### 毛发材质
```
着色器编辑器 → Hair BSDF
- Color：毛发颜色
- Roughness：粗糙度
- Radial Roughness：径向粗糙度
- Coat：光泽涂层
- IOR：折射率
```

## 11.6 群体动画与实例化

### Boids系统（群体行为）
1. 设置粒子物理类型为Boids：
   ```
   Physics Type: Boids
   Boids → Rules:
   - Goal: 目标导向
   - Avoid: 避免碰撞
   - Crowd: 聚集行为
   - Center: 中心化
   ```

### 实例化技术
1. **Object实例化**：
   ```
   Render → Object: 选择实例物体
   Scale: 1.0
   Scale Randomness: 0.2
   ```
2. **Collection实例化**：
   - 创建物体集合
   - 在粒子系统中引用集合

### 动画实例
```
Render → Extra:
- Whole Group: 使用整个组动画
- Use Count: 限制实例数量
```

## 11.7 粒子系统优化

### 性能优化
1. **显示优化**：
   ```
   Viewport Display:
   - Display: 降低显示百分比
   - Show: 只显示部分粒子
   ```
2. **渲染优化**：
   - 使用Children系统增加密度
   - LOD（细节层次）设置

### 缓存管理
```
Cache → Disk Cache:
- External: 使用外部缓存
- Index: 缓存索引
- Compression: 压缩选项
```

## 11.8 高级特效技巧

### 粒子继承
- **Inherit（继承）**：
  - Location：位置继承
  - Rotation：旋转继承
  - Scale：缩放继承

### 动态绘制
```
Dynamic Paint:
- Canvas: 画布设置
- Brush: 笔刷设置
- Effects: 效果类型
```

### 流体与粒子结合
1. 创建流体域
2. 粒子作为流体源
3. 调整交互参数

## 实践练习
1. 创建篝火效果（火焰+烟雾+火花）
2. 制作雨天场景（雨滴+水花+雾气）
3. 设计爆炸效果（碎片+烟雾+冲击波）
4. 制作草地效果（毛发系统）
5. 创建鸟群动画（Boids系统）

## 关键要点
- 粒子系统适合模拟大量相似物体
- 合理设置物理参数可以获得真实效果
- 力场系统可以创造丰富的动态效果
- 毛发系统不仅用于毛发，也可创造各种纤维效果
- 群体动画可以模拟自然界的集群行为
- 优化设置对于复杂粒子系统至关重要

## 下一章预告
下一章将学习物理模拟与动力学，包括刚体、柔体、布料和流体模拟等高级物理效果。