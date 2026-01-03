import type { SiteConfig } from '@/types';
import { menu } from './menu';

export const siteConfig: SiteConfig = {
  title: 'Astro Tech Blog',
  description: '基于Astro构建的现代化技术博客，专注于分享前端开发、技术思考和学习笔记。',
  author: 'Haiyue',
  email: 'haiyue@example.com',
  avatar: '/images/avatar.jpg',
  social: {
    github: 'https://github.com/haiyue',
    twitter: 'https://twitter.com/haiyue',
    linkedin: 'https://linkedin.com/in/haiyue',
    email: 'mailto:haiyue@example.com'
  },
  menu
};

export const defaultSEO = {
  title: siteConfig.title,
  description: siteConfig.description,
  image: '/images/og-image.jpg',
  type: 'website' as const
};