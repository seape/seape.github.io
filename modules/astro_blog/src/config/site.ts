import type { SiteConfig } from '@/types';
import { menu } from './menu';

export const siteConfig: SiteConfig = {
  title: 'Jet\'s Blog',
  description: '基于Astro+Vue+Tailwind构建的个人技术博客，分享我的技术思考和学习笔记。',
  author: 'Haiyue',
  email: 'unisa.dady@gmail.com',
  avatar: '/images/avatar.svg',
  social: {
    github: 'https://github.com/jet-w',
    // twitter: 'https://twitter.com/haiyue',
    linkedin: 'https://linkedin.com/in/haiyue',
    email: 'mailto:unisa.dady@gmail.com'
  },
  menu
};

export const defaultSEO = {
  title: siteConfig.title,
  description: siteConfig.description,
  image: '/images/og-image.jpg',
  type: 'website' as const
};