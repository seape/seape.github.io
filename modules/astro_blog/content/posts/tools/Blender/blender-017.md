---
title: "第17章：Python脚本与插件开发"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第17章：Python脚本与插件开发

## 学习目标
1. 理解Blender的Python API
2. 掌握基本脚本编写技能
3. 学会自动化工作流程
4. 理解插件开发框架
5. 掌握自定义工具和面板制作

## 17.1 Blender Python API基础

### API架构概览
```python
# Blender主要模块
import bpy          # 主API模块
import bmesh        # 网格操作
import mathutils    # 数学工具
import bpy_extras   # 额外工具
import gpu          # GPU绘制
import bl_ui        # UI组件

# 核心数据结构
bpy.context    # 当前上下文
bpy.data       # 数据块
bpy.ops        # 操作符
bpy.types      # 类型定义
bpy.props      # 属性定义
bpy.utils      # 实用工具
```

### 基础概念
1. **Context（上下文）**：
   ```python
   # 当前场景
   scene = bpy.context.scene
   
   # 选中对象
   selected = bpy.context.selected_objects
   
   # 活动对象
   active = bpy.context.active_object
   
   # 当前模式
   mode = bpy.context.mode
   ```

2. **Data（数据）**：
   ```python
   # 访问数据块
   objects = bpy.data.objects
   meshes = bpy.data.meshes
   materials = bpy.data.materials
   textures = bpy.data.textures
   images = bpy.data.images
   ```

3. **Ops（操作）**：
   ```python
   # 添加对象
   bpy.ops.mesh.primitive_cube_add()
   
   # 进入编辑模式
   bpy.ops.object.mode_set(mode='EDIT')
   
   # 选择所有
   bpy.ops.mesh.select_all(action='SELECT')
   ```

### 脚本编辑器使用
```python
# 在Blender脚本编辑器中运行
# 查看所有可用属性和方法
dir(bpy.context.active_object)

# 获取帮助信息
help(bpy.ops.mesh.primitive_cube_add)

# 查看当前场景信息
print(f"场景名称: {bpy.context.scene.name}")
print(f"选中对象数量: {len(bpy.context.selected_objects)}")
```

## 17.2 基础脚本编写

### 创建和操作对象
```python
import bpy
import bmesh
from mathutils import Vector

def create_basic_scene():
    """创建基础场景"""
    
    # 清除现有对象
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # 添加立方体
    bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))
    cube = bpy.context.active_object
    cube.name = "MainCube"
    
    # 添加球体
    bpy.ops.mesh.primitive_uv_sphere_add(location=(3, 0, 0))
    sphere = bpy.context.active_object
    sphere.name = "MainSphere"
    
    # 添加圆柱
    bpy.ops.mesh.primitive_cylinder_add(location=(-3, 0, 0))
    cylinder = bpy.context.active_object
    cylinder.name = "MainCylinder"
    
    # 添加灯光
    bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
    light = bpy.context.active_object
    light.name = "MainLight"
    light.data.energy = 5.0
    
    # 添加相机
    bpy.ops.object.camera_add(location=(7, -7, 5))
    camera = bpy.context.active_object
    camera.name = "MainCamera"
    
    # 设置相机为活动相机
    bpy.context.scene.camera = camera
    
    print("基础场景创建完成")

# 执行函数
create_basic_scene()
```

### 材质和纹理操作
```python
def create_material_with_nodes(obj_name, mat_name):
    """为对象创建节点材质"""
    
    # 获取对象
    obj = bpy.data.objects[obj_name]
    
    # 创建材质
    mat = bpy.data.materials.new(name=mat_name)
    mat.use_nodes = True
    
    # 获取节点树
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    
    # 清除默认节点
    nodes.clear()
    
    # 创建节点
    output = nodes.new('ShaderNodeOutputMaterial')
    principled = nodes.new('ShaderNodeBsdfPrincipled')
    noise = nodes.new('ShaderNodeTexNoise')
    colorramp = nodes.new('ShaderNodeValToRGB')
    
    # 设置节点位置
    output.location = (300, 0)
    principled.location = (0, 0)
    noise.location = (-400, 200)
    colorramp.location = (-200, 200)
    
    # 连接节点
    links.new(noise.outputs['Fac'], colorramp.inputs['Fac'])
    links.new(colorramp.outputs['Color'], principled.inputs['Base Color'])
    links.new(principled.outputs['BSDF'], output.inputs['Surface'])
    
    # 设置参数
    noise.inputs['Scale'].default_value = 5.0
    principled.inputs['Roughness'].default_value = 0.3
    
    # 设置颜色渐变
    colorramp.color_ramp.elements[0].color = (0.2, 0.1, 0.8, 1.0)  # 蓝色
    colorramp.color_ramp.elements[1].color = (0.8, 0.2, 0.1, 1.0)  # 红色
    
    # 分配材质给对象
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    
    print(f"材质 {mat_name} 已创建并分配给 {obj_name}")

# 为场景中的对象创建材质
create_material_with_nodes("MainCube", "CubeMaterial")
create_material_with_nodes("MainSphere", "SphereMaterial")
```

### 动画操作
```python
def create_rotation_animation(obj_name, frames=120):
    """创建旋转动画"""
    
    obj = bpy.data.objects[obj_name]
    
    # 清除现有关键帧
    obj.animation_data_clear()
    
    # 设置关键帧
    obj.rotation_euler = (0, 0, 0)
    obj.keyframe_insert(data_path="rotation_euler", frame=1)
    
    obj.rotation_euler = (0, 0, 6.28)  # 2*pi弧度 = 360度
    obj.keyframe_insert(data_path="rotation_euler", frame=frames)
    
    # 设置插值模式为线性
    if obj.animation_data and obj.animation_data.action:
        for fcurve in obj.animation_data.action.fcurves:
            for keyframe in fcurve.keyframe_points:
                keyframe.interpolation = 'LINEAR'
    
    print(f"{obj_name} 旋转动画已创建，总帧数: {frames}")

def create_bounce_animation(obj_name, height=3, frames=60):
    """创建弹跳动画"""
    
    obj = bpy.data.objects[obj_name]
    
    # 记录原始位置
    orig_z = obj.location.z
    
    # 创建弹跳关键帧
    obj.location.z = orig_z
    obj.keyframe_insert(data_path="location", frame=1)
    
    obj.location.z = orig_z + height
    obj.keyframe_insert(data_path="location", frame=frames//2)
    
    obj.location.z = orig_z
    obj.keyframe_insert(data_path="location", frame=frames)
    
    # 设置插值为贝塞尔，产生自然的弹跳效果
    if obj.animation_data and obj.animation_data.action:
        for fcurve in obj.animation_data.action.fcurves:
            if 'location' in fcurve.data_path and fcurve.array_index == 2:
                for keyframe in fcurve.keyframe_points:
                    keyframe.interpolation = 'BEZIER'
                    keyframe.handle_left_type = 'AUTO'
                    keyframe.handle_right_type = 'AUTO'
    
    print(f"{obj_name} 弹跳动画已创建")

# 创建动画
create_rotation_animation("MainCube")
create_bounce_animation("MainSphere")
```

## 17.3 Bmesh网格操作

### Bmesh基础
```python
import bmesh

def mesh_operations_example():
    """Bmesh网格操作示例"""
    
    # 创建新的bmesh实例
    bm = bmesh.new()
    
    # 创建基础几何体
    bmesh.ops.create_cube(bm, size=2.0)
    
    # 细分
    bmesh.ops.subdivide_edges(
        bm,
        edges=bm.edges[:],
        cuts=2,
        use_grid_fill=True
    )
    
    # 应用随机噪声
    for vert in bm.verts:
        noise_factor = 0.2
        vert.co.x += (random.random() - 0.5) * noise_factor
        vert.co.y += (random.random() - 0.5) * noise_factor
        vert.co.z += (random.random() - 0.5) * noise_factor
    
    # 创建新的网格对象
    mesh = bpy.data.meshes.new("ProcMesh")
    bm.to_mesh(mesh)
    bm.free()
    
    # 创建对象
    obj = bpy.data.objects.new("ProcObject", mesh)
    bpy.context.collection.objects.link(obj)
    
    print("程序化网格已创建")

mesh_operations_example()
```

### 高级网格操作
```python
def create_spiral_mesh():
    """创建螺旋网格"""
    
    import math
    
    bm = bmesh.new()
    
    # 螺旋参数
    turns = 5
    points_per_turn = 20
    radius = 2.0
    height = 10.0
    
    vertices = []
    
    # 创建螺旋顶点
    for i in range(turns * points_per_turn):
        angle = (i / points_per_turn) * 2 * math.pi
        z = (i / (turns * points_per_turn)) * height
        
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        
        vert = bm.verts.new((x, y, z))
        vertices.append(vert)
    
    # 确保索引有效
    bm.verts.ensure_lookup_table()
    
    # 创建边
    for i in range(len(vertices) - 1):
        bm.edges.new([vertices[i], vertices[i + 1]])
    
    # 转换为网格
    mesh = bpy.data.meshes.new("SpiralMesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("SpiralObject", mesh)
    bpy.context.collection.objects.link(obj)
    
    print("螺旋网格已创建")

create_spiral_mesh()
```

## 17.4 插件开发基础

### 插件结构
```python
# __init__.py - 主插件文件
bl_info = {
    "name": "My Awesome Plugin",
    "author": "Your Name",
    "version": (1, 0),
    "blender": (2, 80, 0),
    "location": "View3D > Sidebar > My Tab",
    "description": "A simple example plugin",
    "warning": "",
    "wiki_url": "",
    "category": "Add Mesh",
}

import bpy
from bpy.types import Operator, Panel, PropertyGroup
from bpy.props import StringProperty, BoolProperty, FloatProperty

class MY_OT_simple_operator(Operator):
    """简单操作符示例"""
    bl_idname = "my.simple_operator"
    bl_label = "Simple Operator"
    bl_description = "A simple operator that creates a cube"
    bl_options = {'REGISTER', 'UNDO'}
    
    # 属性
    size: FloatProperty(
        name="Size",
        description="Cube size",
        default=2.0,
        min=0.1,
        max=10.0
    )
    
    def execute(self, context):
        bpy.ops.mesh.primitive_cube_add(size=self.size)
        self.report({'INFO'}, f"Created cube with size {self.size}")
        return {'FINISHED'}

class MY_PT_panel(Panel):
    """侧边栏面板"""
    bl_label = "My Plugin Panel"
    bl_idname = "MY_PT_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "My Tab"
    
    def draw(self, context):
        layout = self.layout
        
        # 添加操作符按钮
        op = layout.operator("my.simple_operator", text="Create Cube")
        op.size = 3.0
        
        # 添加属性
        layout.prop(context.scene, "my_custom_prop", text="Custom Property")

def register():
    # 注册自定义属性
    bpy.types.Scene.my_custom_prop = StringProperty(
        name="Custom Prop",
        default="Hello World"
    )
    
    # 注册类
    bpy.utils.register_class(MY_OT_simple_operator)
    bpy.utils.register_class(MY_PT_panel)

def unregister():
    # 注销类
    bpy.utils.unregister_class(MY_OT_simple_operator)
    bpy.utils.unregister_class(MY_PT_panel)
    
    # 删除属性
    del bpy.types.Scene.my_custom_prop

if __name__ == "__main__":
    register()
```

### 复杂操作符示例
```python
class MY_OT_batch_rename(Operator):
    """批量重命名操作符"""
    bl_idname = "my.batch_rename"
    bl_label = "Batch Rename"
    bl_description = "Rename selected objects with prefix and numbering"
    bl_options = {'REGISTER', 'UNDO'}
    
    prefix: StringProperty(
        name="Prefix",
        description="Prefix for object names",
        default="Object"
    )
    
    start_number: bpy.props.IntProperty(
        name="Start Number",
        description="Starting number for numbering",
        default=1,
        min=0
    )
    
    def execute(self, context):
        selected = context.selected_objects
        
        if not selected:
            self.report({'WARNING'}, "No objects selected")
            return {'CANCELLED'}
        
        for i, obj in enumerate(selected):
            old_name = obj.name
            new_name = f"{self.prefix}_{self.start_number + i:03d}"
            obj.name = new_name
            print(f"Renamed {old_name} to {new_name}")
        
        self.report({'INFO'}, f"Renamed {len(selected)} objects")
        return {'FINISHED'}
    
    def invoke(self, context, event):
        # 显示属性对话框
        return context.window_manager.invoke_props_dialog(self)
```

## 17.5 UI开发

### 自定义面板
```python
class MY_PT_advanced_panel(Panel):
    """高级面板示例"""
    bl_label = "Advanced Tools"
    bl_idname = "MY_PT_advanced_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Advanced"
    
    def draw(self, context):
        layout = self.layout
        scene = context.scene
        
        # 创建盒子布局
        box = layout.box()
        box.label(text="Object Operations:")
        
        row = box.row()
        row.operator("my.batch_rename", icon='OUTLINER_OB_FONT')
        
        # 分隔符
        layout.separator()
        
        # 属性组
        col = layout.column(align=True)
        col.label(text="Settings:")
        col.prop(scene, "my_float_prop", text="Float Value")
        col.prop(scene, "my_bool_prop", text="Enable Feature")
        
        # 条件显示
        if scene.my_bool_prop:
            col.prop(scene, "my_int_prop", text="Integer Value")
        
        # 进度条示例
        if hasattr(scene, 'my_progress'):
            col.prop(scene, 'my_progress', text="Progress", slider=True)
```

### 菜单集成
```python
def menu_func(self, context):
    self.layout.operator("my.simple_operator")

def register():
    # 注册到添加菜单
    bpy.types.VIEW3D_MT_mesh_add.append(menu_func)
    
    # 注册到对象菜单
    bpy.types.VIEW3D_MT_object.append(menu_func)

def unregister():
    bpy.types.VIEW3D_MT_mesh_add.remove(menu_func)
    bpy.types.VIEW3D_MT_object.remove(menu_func)
```

## 17.6 高级脚本技术

### 模态操作符（交互式操作）
```python
class MY_OT_modal_operator(Operator):
    """模态操作符示例 - 鼠标交互"""
    bl_idname = "my.modal_operator"
    bl_label = "Modal Operator"
    bl_description = "Interactive mouse operator"
    
    def __init__(self):
        self.initial_mouse_x = None
        self.initial_value = None
        self.obj = None
    
    def modal(self, context, event):
        if event.type == 'MOUSEMOVE':
            # 根据鼠标移动调整对象大小
            delta = self.initial_mouse_x - event.mouse_x
            scale_factor = 1.0 + delta * 0.01
            
            if self.obj:
                self.obj.scale = (scale_factor, scale_factor, scale_factor)
            
            context.area.tag_redraw()
        
        elif event.type == 'LEFTMOUSE':
            return {'FINISHED'}
        
        elif event.type in {'RIGHTMOUSE', 'ESC'}:
            # 取消操作，恢复原始值
            if self.obj:
                self.obj.scale = (1, 1, 1)
            return {'CANCELLED'}
        
        return {'RUNNING_MODAL'}
    
    def invoke(self, context, event):
        if context.object:
            self.obj = context.object
            self.initial_mouse_x = event.mouse_x
            context.window_manager.modal_handler_add(self)
            return {'RUNNING_MODAL'}
        else:
            self.report({'WARNING'}, "No active object")
            return {'CANCELLED'}
```

### 文件I/O操作
```python
def export_selected_objects(filepath):
    """导出选中对象的信息"""
    
    import json
    
    selected = bpy.context.selected_objects
    export_data = {
        "version": "1.0",
        "objects": []
    }
    
    for obj in selected:
        obj_data = {
            "name": obj.name,
            "type": obj.type,
            "location": list(obj.location),
            "rotation": list(obj.rotation_euler),
            "scale": list(obj.scale),
        }
        
        if obj.type == 'MESH':
            obj_data["vertices"] = len(obj.data.vertices)
            obj_data["faces"] = len(obj.data.polygons)
        
        export_data["objects"].append(obj_data)
    
    with open(filepath, 'w') as f:
        json.dump(export_data, f, indent=2)
    
    print(f"Exported {len(selected)} objects to {filepath}")

class MY_OT_export_data(Operator):
    """导出数据操作符"""
    bl_idname = "my.export_data"
    bl_label = "Export Object Data"
    bl_description = "Export selected objects data to JSON"
    
    filepath: StringProperty(
        name="File Path",
        description="Path to save the file",
        default="//object_data.json",
        maxlen=1024,
        subtype='FILE_PATH'
    )
    
    def execute(self, context):
        export_selected_objects(self.filepath)
        return {'FINISHED'}
    
    def invoke(self, context, event):
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}
```

## 17.7 性能优化

### 批处理操作
```python
def batch_process_objects(operation_func):
    """批处理对象的装饰器"""
    
    def wrapper(*args, **kwargs):
        # 暂停视图更新
        bpy.context.view_layer.update()
        
        # 保存当前模式
        original_mode = bpy.context.mode
        
        # 确保在物体模式
        if original_mode != 'OBJECT':
            bpy.ops.object.mode_set(mode='OBJECT')
        
        try:
            # 执行操作
            result = operation_func(*args, **kwargs)
            
            # 批量更新
            bpy.context.view_layer.update()
            
            return result
        
        finally:
            # 恢复原始模式
            if original_mode != 'OBJECT':
                bpy.ops.object.mode_set(mode=original_mode)
    
    return wrapper

@batch_process_objects
def optimize_selected_meshes():
    """优化选中的网格"""
    
    selected = bpy.context.selected_objects
    mesh_objects = [obj for obj in selected if obj.type == 'MESH']
    
    for obj in mesh_objects:
        # 应用修改器
        bpy.context.view_layer.objects.active = obj
        
        # 移除双重顶点
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.remove_doubles()
        bpy.ops.object.mode_set(mode='OBJECT')
        
        print(f"Optimized mesh: {obj.name}")
    
    return len(mesh_objects)
```

### 内存管理
```python
def cleanup_unused_data():
    """清理未使用的数据块"""
    
    # 清理网格
    for mesh in bpy.data.meshes:
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)
    
    # 清理材质
    for material in bpy.data.materials:
        if material.users == 0:
            bpy.data.materials.remove(material)
    
    # 清理纹理
    for texture in bpy.data.textures:
        if texture.users == 0:
            bpy.data.textures.remove(texture)
    
    # 清理图像
    for image in bpy.data.images:
        if image.users == 0:
            bpy.data.images.remove(image)
    
    print("Cleanup completed")
```

## 17.8 调试和测试

### 调试技术
```python
import logging

# 设置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def debug_object_info(obj):
    """调试对象信息"""
    
    logger.debug(f"Object: {obj.name}")
    logger.debug(f"Type: {obj.type}")
    logger.debug(f"Location: {obj.location}")
    logger.debug(f"Bound Box: {obj.bound_box}")
    
    if obj.type == 'MESH':
        logger.debug(f"Vertices: {len(obj.data.vertices)}")
        logger.debug(f"Faces: {len(obj.data.polygons)}")

# 异常处理
def safe_operation(func):
    """安全操作装饰器"""
    
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {func.__name__}: {str(e)}")
            return None
    
    return wrapper

@safe_operation
def risky_operation():
    """可能出错的操作"""
    obj = bpy.context.active_object
    return obj.data.vertices  # 如果不是网格对象会出错
```

### 单元测试
```python
import unittest

class BlenderScriptTest(unittest.TestCase):
    
    def setUp(self):
        """测试前准备"""
        # 清理场景
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()
    
    def test_create_cube(self):
        """测试立方体创建"""
        initial_count = len(bpy.data.objects)
        bpy.ops.mesh.primitive_cube_add()
        final_count = len(bpy.data.objects)
        
        self.assertEqual(final_count, initial_count + 1)
        self.assertEqual(bpy.context.active_object.type, 'MESH')
    
    def test_material_creation(self):
        """测试材质创建"""
        mat_name = "TestMaterial"
        mat = bpy.data.materials.new(name=mat_name)
        
        self.assertIsNotNone(mat)
        self.assertEqual(mat.name, mat_name)

if __name__ == '__main__':
    unittest.main()
```

## 实践练习
1. 创建自动化建模脚本
2. 开发批处理工具插件
3. 制作自定义UI面板
4. 实现文件导入导出功能
5. 构建工作流自动化系统

## 关键要点
- Python API提供了Blender的完全编程控制
- 了解bpy模块结构是脚本开发的基础
- Bmesh提供了强大的网格操作能力
- 插件开发需要遵循Blender的架构规范
- 模态操作符可以实现复杂的交互功能
- 性能优化和错误处理是生产级脚本的必要考虑
- 测试和调试确保脚本的稳定性和可靠性

## 下一章预告
下一章将学习项目管理与团队协作，了解如何在团队环境中有效使用Blender进行协作开发。