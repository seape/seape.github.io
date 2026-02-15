import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // 支持 date 和 pubDate 两种字段名，统一转换为 pubDate
    date: z.coerce.date().optional(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    // 支持 tag 和 tags 两种字段名
    tag: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    category: z.union([z.string(), z.array(z.string())]).optional(),
    author: z.string().optional(),
    image: z.string().optional(),
    icon: z.string().optional(),
    draft: z.boolean().default(false),
    index: z.boolean().default(true),
    star: z.boolean().default(false),
    // Slides 布局支持
    layout: z.enum(['default', 'slides']).default('default'),
    // Reveal.js 配置（当 layout: slides 时生效）
    theme: z.string().default('black'),
    transition: z.string().default('slide'),
    controls: z.boolean().default(true),
    progress: z.boolean().default(true),
    center: z.boolean().default(true),
    slideNumber: z.boolean().default(false),
  }).transform((data) => {
    // 将 date 合并到 pubDate（优先使用 pubDate，如果没有则使用 date）
    const pubDate = data.pubDate ?? data.date;
    // 将 category 转换为数组并合并到 categories
    let categories = data.categories;
    if (data.category) {
      const categoryArray = Array.isArray(data.category) ? data.category : [data.category];
      categories = categories.length > 0 ? categories : categoryArray;
    }
    // 将 tag 合并到 tags
    const tags = data.tags.length > 0 ? data.tags : data.tag;

    return {
      title: data.title,
      description: data.description,
      pubDate,
      date: data.date,  // 保留原始字段供调试
      updatedDate: data.updatedDate,
      tags,
      categories,
      author: data.author,
      image: data.image,
      icon: data.icon,
      draft: data.draft,
      index: data.index,
      star: data.star,
      // Slides 相关
      layout: data.layout,
      theme: data.theme,
      transition: data.transition,
      controls: data.controls,
      progress: data.progress,
      center: data.center,
      slideNumber: data.slideNumber,
    };
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
  }),
});

const slides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/slides' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // Reveal.js 配置
    theme: z.string().default('black'), // Reveal.js 主题: black, white, league, beige, night, serif, simple, solarized, blood, moon
    transition: z.string().default('slide'), // 过渡效果: none, fade, slide, convex, concave, zoom
    controls: z.boolean().default(true), // 显示控制箭头
    progress: z.boolean().default(true), // 显示进度条
    center: z.boolean().default(true), // 垂直居中
    hash: z.boolean().default(true), // URL 包含 hash
    slideNumber: z.boolean().default(false), // 显示页码
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  posts,
  pages,
  slides,
};