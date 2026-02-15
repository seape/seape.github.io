/**
 * Site Configuration
 *
 * Basic site settings including title, description, author info, etc.
 */

import type { SiteConfig } from '@jet-w/astro-blog';

/**
 * Site configuration
 */
export const siteConfig: SiteConfig = {
  title: "Jet's Blog",
  description: '',
  author: 'Jet',   
  layout: {
    contentWidth: 'wide'  // 或 'narrow', '900px', '80%' 等
  },
  email: 'unisa.dady@gmail.com',
  avatar: '/images/avatar.webp',
  social: {
    github: 'https://github.com/jet-w',
    twitter: '',
    linkedin: 'https://www.linkedin.com/in/jet-w/',
    email: 'mailto:unisa.dady@gmail.com'
  },
  menu: [
    {
      name: '首页',
      href: '/',
      icon: 'home'
    },
    {
      name: '博客教学',
      href: '/posts/blog_docs',
      icon: 'posts'
    },
    {
      name: '演示',
      href: '/slides',
      icon: 'slides'
    },
    {
      name: '关于',
      href: '/about',
      icon: 'about'
    }
  ]
};

/**
 * Default SEO settings
 */
export const defaultSEO = {
  title: siteConfig.title,
  description: siteConfig.description,
  image: '/images/og-image.jpg',
  type: 'website' as const
};
