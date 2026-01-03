# Astro 技术博客

基于 Astro 框架构建的现代化技术博客，参考 VuePress Theme Hope 的设计理念，使用 Vue 3、TypeScript 和 Tailwind CSS 等技术栈。

## ✨ 特性

- 🚀 **高性能**: 基于 Astro 的静态站点生成，极速加载
- 🎨 **现代设计**: 简洁美观的界面，支持明暗主题切换
- 📝 **Markdown 支持**: 完整的 Markdown 渲染和代码高亮
- 🔍 **本地搜索**: 强大的客户端搜索功能
- 🏷️ **标签分类**: 完善的标签和分类系统
- 📱 **响应式**: 完美适配桌面、平板和移动设备
- ⚡ **SEO 友好**: 自动生成 sitemap 和 meta 标签
- 🌙 **暗色模式**: 自动检测系统主题偏好

## 🛠️ 技术栈

- **框架**: [Astro](https://astro.build/) - 现代化的静态站点生成器
- **前端**: [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- **样式**: [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- **语言**: [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- **搜索**: [Fuse.js](https://fusejs.io/) - 模糊搜索库
- **Markdown**: [Marked](https://marked.js.org/) + [Prism.js](https://prismjs.com/) - 内容渲染和代码高亮

## 📁 项目结构

```
astro-tech-blog/
├── content/              # 📝 博客内容区域
│   ├── posts/           # 文章目录
│   ├── pages/           # 静态页面
│   └── assets/          # 内容相关资源
├── src/                 # 🔧 系统源代码
│   ├── components/      # Vue组件
│   │   ├── blog/       # 博客相关组件
│   │   ├── layout/     # 布局组件
│   │   └── ui/         # UI 组件
│   ├── data/           # 配置数据
│   ├── layouts/        # Astro 布局
│   ├── pages/          # 页面路由
│   ├── styles/         # 样式文件
│   ├── types/          # TypeScript 类型定义
│   └── utils/          # 工具函数
├── docs/                # 📖 项目文档
├── public/              # 静态资源
├── astro.config.mjs     # Astro 配置
└── tailwind.config.mjs  # Tailwind 配置
```

### 目录结构优势

- **内容与代码分离**: `content/` 专门存放博客内容，`src/` 存放系统代码
- **便于管理**: 内容创作者只需关注 `content/` 目录
- **文档独立**: 项目文档放在 `docs/` 目录
- **配置集中**: 主要配置文件位于根目录

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 📝 写作指南

### 创建新文章

在 `content/posts/` 目录下创建新的 Markdown 文件：

```markdown
---
title: '文章标题'
description: '文章描述'
pubDate: '2025-01-08'
updatedDate: '2025-01-08'  # 可选
tags: ['标签1', '标签2']
categories: ['分类']
author: '作者'
image: '/images/posts/cover.jpg'  # 可选
draft: false  # 可选，草稿状态
---

# 文章内容

这里是文章的正文内容...
```

### Frontmatter 字段说明

- `title`: 文章标题（必需）
- `description`: 文章描述（必需）
- `pubDate`: 发布日期（必需）
- `updatedDate`: 更新日期（可选）
- `tags`: 标签数组（可选）
- `categories`: 分类数组（可选）
- `author`: 作者（可选）
- `image`: 封面图片（可选）
- `draft`: 是否为草稿（可选，默认 false）

### 支持的 Markdown 功能

- 标准 Markdown 语法
- 代码块高亮
- 表格
- 任务列表
- 数学公式（LaTeX 语法）
- 自动目录生成

## ⚙️ 配置

### 站点配置

编辑 `src/data/config.ts` 文件来自定义站点信息：

```typescript
export const siteConfig: SiteConfig = {
  title: '您的博客标题',
  description: '您的博客描述',
  author: '您的名字',
  email: 'your-email@example.com',
  avatar: '/images/avatar.jpg',
  social: {
    github: 'https://github.com/yourusername',
    twitter: 'https://twitter.com/yourusername',
    // ...
  },
  navigation: [
    // 导航菜单配置
  ]
};
```

### Tailwind CSS 配置

可以在 `tailwind.config.mjs` 中自定义主题颜色、字体等：

```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          // 自定义主色调
        }
      }
    }
  }
}
```

## 🎨 主题定制

### 颜色主题

博客支持明暗主题切换，您可以在 `tailwind.config.mjs` 中自定义颜色：

- `primary`: 主色调（链接、按钮等）
- `secondary`: 辅助色调
- `accent`: 强调色调

### 自定义组件

可以在 `src/components/` 目录下创建自定义组件，并在页面中使用。

## 📦 部署

### 静态部署

构建后的文件在 `dist/` 目录，可以部署到任何静态托管服务：

- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
- [GitHub Pages](https://pages.github.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

### 自动部署

项目已配置好构建脚本，支持 CI/CD 自动部署。

## 🤝 贡献

欢迎贡献代码！请先 fork 项目，创建功能分支，提交 PR。

## 📄 许可证

MIT License

## 🙏 致谢

- [Astro](https://astro.build/) - 优秀的静态站点生成器
- [VuePress Theme Hope](https://theme-hope.vuejs.press/) - 设计灵感来源
- [Tailwind CSS](https://tailwindcss.com/) - 强大的 CSS 框架

---

**快乐写作！** 🎉