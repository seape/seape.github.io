---
title: "第15章：虚幻引擎集成与实时渲染"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第15章：虚幻引擎集成与实时渲染

## 学习目标
1. 理解实时渲染与离线渲染的区别
2. 掌握模型导出和优化技术
3. 学会Blender到UE的工作流程
4. 理解LOD（细节层次）系统
5. 掌握实时光照和材质调整

## 15.1 实时渲染基础

### 实时渲染概念
- **实时渲染**：每秒渲染30-120帧的交互式渲染
- **光栅化渲染**：基于GPU的快速几何处理
- **延迟渲染**：分离几何和光照计算
- **前向渲染**：传统的渲染管线

### 离线vs实时渲染
```
离线渲染（Cycles）：
- 路径追踪算法
- 物理准确性
- 无时间限制
- 高质量输出

实时渲染（游戏引擎）：
- 光栅化+技巧
- 性能优先
- 固定时间预算
- 交互式体验
```

### 实时渲染限制
1. **多边形预算**：场景总面数限制
2. **纹理内存**：贴图大小和数量限制
3. **光源数量**：动态光源数量限制
4. **绘制调用**：批次渲染优化

## 15.2 模型导出准备

### 几何体优化
1. **拓扑清理**：
   ```
   - 删除重复顶点
   - 合并共面
   - 移除内部几何体
   - 确保法线正确
   ```

2. **面数优化**：
   ```
   - 使用Decimate修改器
   - 保持轮廓重要边
   - 平面区域简化
   - 细节保留策略
   ```

3. **UV展开**：
   ```
   - 单个UV集合
   - 充分利用UV空间
   - 避免拉伸变形
   - 缝合线隐藏在不明显处
   ```

### 材质准备
```
PBR材质标准：
- Base Color: 漫反射颜色（RGB）
- Normal: 法线贴图（切线空间）
- Roughness: 粗糙度（灰度）
- Metallic: 金属度（灰度）
- Ambient Occlusion: 环境遮蔽（可选）
- Height/Displacement: 高度信息（可选）
```

### 纹理优化
```
纹理规格：
- 分辨率: 2的幂次方（512, 1024, 2048）
- 格式: DXT/BC压缩格式
- Mipmap: 生成多级渐远纹理
- 通道打包: 合并单通道贴图
```

## 15.3 导出设置

### FBX导出设置
```
文件 → 导出 → FBX (.fbx)

几何体:
- Apply Modifiers: 应用修改器
- Smoothing: Face（面平滑）
- Export Subdivided Mesh: 导出细分网格

材质:
- Path Mode: Copy（复制贴图文件）
- Embed Textures: 嵌入纹理（可选）

动画:
- Export Animations: 导出动画
- Key All Bones: 所有骨骼关键帧
- NLA Strips: NLA动画条
- Force Start/End Keying: 强制首尾关键帧
```

### glTF导出（推荐）
```
文件 → 导出 → glTF 2.0 (.glb/.gltf)

优势:
- 开放标准格式
- 完整PBR支持
- 动画和骨骼支持
- 压缩效果好
- 元数据支持

设置:
- Format: Binary (.glb) 或 Separate (.gltf)
- Include: Selected Objects
- Transform: +Y Up
- Materials: Export materials
- Compression: Draco（可选）
```

### USD导出（新标准）
```
Pixar USD格式：
- 场景描述语言
- 分层合成
- 变体系统
- 时间采样
- 跨软件标准
```

## 15.4 虚幻引擎导入

### UE项目设置
```
项目创建：
- Template: Third Person 或 Blank
- Target Hardware: Desktop/Console
- Graphics: Maximum Quality
- Starter Content: 包含基础资源
```

### 导入流程
1. **内容浏览器导入**：
   ```
   - 拖拽FBX/glTF文件
   - Import Options对话框
   - Mesh → Auto Generate Collision
   - Material → Create Material
   - Texture → Import Textures
   ```

2. **FBX导入设置**：
   ```
   Mesh:
   - Import Mesh: 导入网格
   - Generate Lightmap UVs: 生成光照贴图UV
   - Normal Import Method: Import Normals
   
   Material:
   - Import Materials: 导入材质
   - Import Textures: 导入纹理
   - Material Search Location: 材质搜索位置
   ```

### 骨骼和动画导入
```
Skeleton:
- Import Mesh: 导入骨骼网格
- Update Skeleton Reference Pose: 更新参考姿势
- Use T0 As Ref Pose: 使用T0作为参考

Animation:
- Import Bone Tracks: 导入骨骼轨道
- Import Custom Attribute: 导入自定义属性
- Delete Existing Morph Target Curves: 删除现有形态目标曲线
```

## 15.5 LOD系统

### LOD概念
- **Level of Detail**：根据距离显示不同精度的模型
- **性能优化**：远距离使用低面数模型
- **平滑过渡**：避免LOD切换时的突兀感

### 在Blender中准备LOD
```python
# LOD生成脚本
import bpy

def generate_lod_levels(obj_name, ratios=[1.0, 0.5, 0.25, 0.125]):
    source_obj = bpy.data.objects[obj_name]
    
    for i, ratio in enumerate(ratios):
        # 复制源对象
        new_obj = source_obj.copy()
        new_obj.data = source_obj.data.copy()
        new_obj.name = f"{obj_name}_LOD{i}"
        
        # 添加到场景
        bpy.context.collection.objects.link(new_obj)
        
        if i > 0:  # LOD0是原始模型
            # 添加Decimate修改器
            decimate = new_obj.modifiers.new(name="Decimate", type='DECIMATE')
            decimate.ratio = ratio
            
            # 应用修改器
            bpy.context.view_layer.objects.active = new_obj
            bpy.ops.object.modifier_apply(modifier="Decimate")
```

### UE中的LOD设置
```
静态网格编辑器 → LOD Settings:
- Auto Generate LODs: 自动生成
- LOD Group: LOD组设置
- Reduction Settings: 简化设置
  - Percent Triangles: 三角形百分比
  - Max Deviation: 最大偏差
  - Welding Threshold: 焊接阈值
  - Hard Edge Angle: 硬边角度
```

## 15.6 材质转换

### PBR材质映射
```
Blender → UE4 映射:
- Base Color → Base Color
- Roughness → Roughness
- Metallic → Metallic
- Normal → Normal
- Alpha → Opacity
- Emission → Emissive Color
```

### 材质实例
```
UE材质系统:
- Master Material: 主材质模板
- Material Instance: 材质实例（参数化）
- Material Functions: 材质函数（可复用）
- Material Parameter Collections: 全局参数集合
```

### 纹理采样优化
```
纹理设置:
- Compression Settings: 压缩设置
  - BC1 (DXT1): 无Alpha的漫反射
  - BC3 (DXT5): 有Alpha的漫反射
  - BC5 (3Dc): 法线贴图
  - BC7: 高质量压缩
- Generate Mipmaps: 生成Mipmap
- sRGB: 颜色空间设置（漫反射启用）
```

## 15.7 光照设置

### 实时光照类型
1. **Directional Light（方向光）**：
   ```
   特点:
   - 模拟太阳光
   - 平行光线
   - 影响整个场景
   - 支持级联阴影
   ```

2. **Point Light（点光源）**：
   ```
   特点:
   - 从点向四周发光
   - 有衰减范围
   - 动态阴影可选
   - 适合局部照明
   ```

3. **Spot Light（聚光灯）**：
   ```
   特点:
   - 锥形光束
   - Inner/Outer Cone角度
   - 光源纹理投影
   - 戏剧性照明
   ```

### 全局光照
```
World Settings → Lightmass:
- Force No Precomputed Lighting: 强制动态
- Static Lighting Level Scale: 静态光照缩放
- Num Indirect Lighting Bounces: 间接光反弹次数
- Indirect Lighting Quality: 间接光质量
- Indirect Lighting Smoothness: 间接光平滑度
```

### 光照烘焙
```
静态光照烘焙:
1. 设置光源为Static
2. 网格设置Lightmap Resolution
3. Build → Lighting Quality → Production
4. 等待Lightmass计算完成

优势:
- 高质量全局光照
- 性能消耗低
- 支持复杂光影效果

限制:
- 无法动态改变
- 需要重新烘焙
- 占用额外存储空间
```

## 15.8 动画和绑定

### 骨骼网格导入
```
骨骼导入选项:
- Skeleton: 选择现有骨骼或创建新的
- Update Skeleton Reference Pose: 更新参考姿势
- Use T0 As Ref Pose: 使用T0姿势
- Preserve Smoothing Groups: 保持平滑组
```

### 动画蓝图
```
Animation Blueprint:
- State Machine: 状态机
- Blend Space: 混合空间
- Animation Graph: 动画图表
- Event Graph: 事件图表

常用节点:
- Play Animation: 播放动画
- Blend Poses: 混合姿势
- Apply Additive: 应用附加动画
```

### 动画重定向
```
Animation Retargeting:
- Skeleton: 共享相同骨骼结构
- Rig: 使用中间绑定进行重定向
- Base Poses: 设置基础姿势匹配

步骤:
1. 设置Rig Asset
2. 配置骨骼映射
3. 调整基础姿势
4. 重定向动画资源
```

## 15.9 性能优化

### 渲染优化
```
性能分析工具:
- Stat FPS: 显示帧率
- Stat RHI: 渲染硬件接口统计
- Stat SceneRendering: 场景渲染统计
- ProfileGPU: GPU性能分析
```

### LOD优化
```
自动LOD设置:
- LOD0: 100% 三角形（0-50米）
- LOD1: 50% 三角形（50-100米）
- LOD2: 25% 三角形（100-200米）
- LOD3: 12.5% 三角形（200米+）
```

### 批处理优化
```
Static Batching:
- 相同材质的静态物体
- 合并DrawCall
- 减少CPU开销

Dynamic Batching:
- 动态物体批处理
- 小型网格优化
- 实时合并
```

## 15.10 实际案例

### 案例1：建筑可视化
```
工作流程:
1. Blender建筑建模
2. UV展开和纹理制作
3. LOD层级创建
4. FBX导出设置
5. UE导入和材质调整
6. 光照烘焙设置
7. 后期效果调整
```

### 案例2：角色集成
```
技术要点:
- 角色建模和绑定
- 动画制作和导出
- 材质PBR转换
- 骨骼重定向
- 动画状态机
- LOD设置
```

### 案例3：场景优化
```
优化策略:
- Culling Distance设置
- LOD自动切换
- 光照图分辨率优化
- 纹理流送设置
- 几何体合并
```

## 实践练习
1. 创建完整的资产导出流程
2. 制作多LOD级别的模型
3. 设置PBR材质转换
4. 配置动态光照系统
5. 优化场景渲染性能

## 关键要点
- 实时渲染需要在质量和性能间取得平衡
- 合适的拓扑结构对实时渲染至关重要
- LOD系统是性能优化的核心技术
- PBR材质工作流程提供一致的视觉效果
- 光照烘焙可以获得高质量的静态光照
- 性能分析和优化是实时渲染的重要环节

## 下一章预告
下一章将学习VR/AR内容制作，探索沉浸式体验的设计和技术实现。