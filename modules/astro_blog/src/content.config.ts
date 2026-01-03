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

export const collections = {
  posts,
  pages,
};