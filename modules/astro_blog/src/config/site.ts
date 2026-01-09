import type { SiteConfig } from '@/types';
import { menu } from './menu';

export const siteConfig: SiteConfig = {
  title: 'Vicky\'s Blog',
  description: '我的个人技术博客，分享我的思考和学习笔记。',
  author: 'Vicky',
  email: '',
  avatar: '/images/avatar.png',
  social: {
    github: 'https://github.com/seape',
    // twitter: 'https://twitter.com/haiyue',
    // linkedin: 'https://linkedin.com/in/haiyue',
    // email: 'mailto:unisa.dady@gmail.com'
  },
  menu
};

export const defaultSEO = {
  title: siteConfig.title,
  description: siteConfig.description,
  image: '/images/og-image.jpg',
  type: 'website' as const
};