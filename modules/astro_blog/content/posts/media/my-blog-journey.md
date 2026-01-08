---
title: 我的博客之旅
description: 从博客创建动机到自建博客系统的历程分享
pubDate: 2025-01-05
author: Jet
tags:
  - 博客
  - 个人成长
  - 技术分享
categories:
  - 分享
layout: slides
theme: night
transition: fade
slideNumber: true
controls: true
progress: true
---

# 我的博客之旅

从想法到实践的历程

---

## 目录

1. **为什么要创建博客**
2. **我之前用的博客系统**
3. **我自建的博客系统**
4. **将来的计划**

---

# 第一章

## 为什么要创建博客

----

## 知识沉淀

<p class="fragment">学习过程中产生大量笔记</p>
<p class="fragment">零散的笔记难以系统化</p>
<p class="fragment">需要一个地方整理和归档</p>

----

## 费曼学习法

> "如果你不能简单地解释一件事，说明你还没有真正理解它。"
>
> — 理查德·费曼

<p class="fragment">写博客是最好的"教"的过程</p>

----

## 分享与交流

- 帮助遇到同样问题的人
- 获得反馈和建议
- 结识志同道合的朋友

----

## 个人品牌

<p class="fragment">技术积累的可视化展示</p>
<p class="fragment">求职时的加分项</p>
<p class="fragment">持续学习的证明</p>

----

## 总结：为什么写博客

| 原因 | 收益 |
|------|------|
| 知识沉淀 | 系统化学习成果 |
| 费曼学习 | 深入理解知识 |
| 分享交流 | 社区连接 |
| 个人品牌 | 职业发展 |

---

# 第二章

## 我之前用的博客系统

----

## 博客平台的尝试

使用过的平台：

<p class="fragment">📝 CSDN / 博客园</p>
<p class="fragment">📘 知乎专栏</p>
<p class="fragment">🐙 GitHub + Jekyll</p>
<p class="fragment">📖 Hexo</p>
<p class="fragment">📚 VuePress / VitePress</p>

----

## 第三方平台

<div style="display: flex; gap: 2em;">
<div style="flex: 1; background: rgba(76, 175, 80, 0.1); padding: 1em; border-radius: 8px; border-left: 4px solid #4CAF50;">

### ✅ 优点

- 零成本上手
- 自带流量和曝光
- 无需维护服务器

</div>
<div style="flex: 1; background: rgba(244, 67, 54, 0.1); padding: 1em; border-radius: 8px; border-left: 4px solid #F44336;">

### ❌ 缺点

- 广告干扰
- 样式不可控
- 数据不完全属于自己
- 可能被限流或审核

</div>
</div>

----

## 静态博客生成器

**Jekyll / Hexo / Hugo**

<div style="display: flex; gap: 2em;">
<div style="flex: 1; background: rgba(76, 175, 80, 0.1); padding: 1em; border-radius: 8px; border-left: 4px solid #4CAF50;">

### ✅ 优点

- 完全掌控内容
- Markdown 写作
- 免费托管 (GitHub Pages)

</div>
<div style="flex: 1; background: rgba(244, 67, 54, 0.1); padding: 1em; border-radius: 8px; border-left: 4px solid #F44336;">

### ❌ 缺点

- 主题定制复杂
- 功能扩展受限
- 部分框架生态老旧

</div>
</div>

----

## 文档工具

**VuePress / VitePress**

<div style="display: flex; gap: 2em;">
<div style="flex: 1; background: rgba(76, 175, 80, 0.1); padding: 1em; border-radius: 8px; border-left: 4px solid #4CAF50;">

### ✅ 优点

- Vue 生态，扩展性强
- 适合技术文档

</div>
<div style="flex: 1; background: rgba(244, 67, 54, 0.1); padding: 1em; border-radius: 8px; border-left: 4px solid #F44336;">

### ❌ 缺点

- 博客功能需要额外配置
- 更偏向文档而非博客

</div>
</div>

----

## 痛点总结

<p class="fragment">🎨 主题难以满足个性化需求</p>
<p class="fragment">📊 缺少数学公式、图表支持</p>
<p class="fragment">🎬 想要幻灯片演示功能</p>
<p class="fragment">⚡ 追求更好的性能和开发体验</p>

---

# 第三章

## 我自建的博客系统

----

## 为什么选择 Astro

| 特性 | 说明 |
|------|------|
| **岛屿架构** | 按需加载 JS，极致性能 |
| **框架无关** | 支持 Vue/React/Svelte |
| **内容优先** | 专为内容站点设计 |
| **现代工具链** | Vite 驱动，开发体验好 |

----

## 技术栈

```
Astro 5        静态站点生成
Vue 3          交互式组件
TypeScript     类型安全
Tailwind CSS   原子化样式
Reveal.js      幻灯片演示
```

----

## 核心功能

<p class="fragment">✅ Markdown / MDX 支持</p>
<p class="fragment">✅ 代码高亮 (100+ 语言)</p>
<p class="fragment">✅ 数学公式 (KaTeX)</p>
<p class="fragment">✅ 流程图 (Mermaid)</p>
<p class="fragment">✅ 数据可视化 (ECharts)</p>
<p class="fragment">✅ 幻灯片演示 (Reveal.js)</p>

----

## 内容组织

```
content/
├── posts/           # 博客文章
│   ├── math/       # 数学笔记
│   ├── tools/      # 工具教程
│   └── media/      # 演示文稿
├── pages/          # 静态页面
└── slides/         # 独立幻灯片
```

----

## 特色：提示容器

```markdown
::: tip 提示
这是一个提示
:::

::: warning 警告
这是警告信息
:::

::: danger 危险
这是危险警告
:::
```

----

## 特色：Mermaid 图表

支持多种图表类型：

- 流程图
- 时序图
- 类图
- 甘特图
- 状态图

----

## 特色：幻灯片

三种使用方式：

| 方式 | 说明 |
|------|------|
| 独立幻灯片 | `content/slides/` |
| 文章转幻灯片 | `layout: slides` |
| 嵌入式 | `<Slides>` 组件 |

就像你现在看到的这样！

----

## 开发体验

- 🔥 热更新，实时预览
- 📦 组件化开发
- 🎨 Tailwind 快速样式
- 📝 纯 Markdown 写作

---

# 第四章

## 将来的计划

----

## 内容计划

<p class="fragment">📐 完善数学笔记系列</p>
<p class="fragment">🛠️ 更多工具使用教程</p>
<p class="fragment">💻 编程技术分享</p>
<p class="fragment">📊 数据分析案例</p>

----

## 功能增强

<p class="fragment">🔍 全文搜索优化</p>
<p class="fragment">💬 评论系统集成</p>
<p class="fragment">📈 访问统计分析</p>
<p class="fragment">🌐 多语言支持</p>

----

## 性能优化

- 图片懒加载和优化
- 更好的 SEO 支持
- PWA 离线访问
- 更快的构建速度

----

## 社区建设

<p class="fragment">开源博客主题</p>
<p class="fragment">编写使用文档</p>
<p class="fragment">帮助更多人搭建博客</p>

----

## 长期愿景

> 持续学习，持续输出
>
> 用文字记录成长的每一步

---

# 总结

----

## 回顾

| 阶段 | 内容 |
|------|------|
| 动机 | 知识沉淀、学习、分享、品牌 |
| 过去 | 平台博客 → 静态生成器 |
| 现在 | Astro 自建博客系统 |
| 未来 | 持续优化、丰富内容 |

----

## 给想写博客的你

<p class="fragment">不要等到"准备好"才开始</p>
<p class="fragment">从记录一个小知识点开始</p>
<p class="fragment">坚持比完美更重要</p>
<p class="fragment">选择适合自己的工具</p>

---

# 谢谢！

欢迎交流讨论

按 `Esc` 查看幻灯片概览
