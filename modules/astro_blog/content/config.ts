import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    image: z.string().optional(),
    icon: z.string().optional(),
    author: z.string().default('作者'),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    category: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    index: z.boolean().default(true),
    star: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
  }),
});

const assets = defineCollection({
  type: 'content',
});

export const collections = {
  posts,
  pages,
  assets,
};
