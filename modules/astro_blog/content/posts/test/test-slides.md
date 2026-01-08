---
title: Posts 中的幻灯片测试
description: 测试在 posts 目录中使用 slides 布局
pubDate: 2025-01-05
author: Test
tags:
  - 测试
  - slides
categories:
  - 测试
layout: slides
theme: white
transition: fade
slideNumber: true
---

# 欢迎

这是在 posts 目录中的幻灯片

使用 `layout: slides` 即可启用

---

## 功能演示

- 支持 Markdown 语法
- 支持代码高亮
- 支持主题切换

---

## 代码示例

```python
def hello():
    print("Hello, Slides!")

hello()
```

---

## 垂直幻灯片

按 ↓ 键查看

----

### 子页面 1

垂直幻灯片内容

----

### 子页面 2

更多内容...

---

## 配置说明

在 frontmatter 中设置：

```yaml
layout: slides
theme: white
transition: fade
slideNumber: true
```

---

# 完成！

访问 `/posts/test/test-slides` 查看效果
