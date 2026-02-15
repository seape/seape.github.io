/**
 * Footer 配置
 */

import type { SocialLink } from './social';
import { socialLinks } from './social';

export interface FooterLink {
  name: string;
  href: string;
}

export interface FooterConfig {
  /** 快速链接标题 */
  quickLinksTitle: string;
  /** 快速链接列表 */
  quickLinks: FooterLink[];
  /** 联系方式标题 */
  contactTitle: string;
  /** 社交链接 */
  socialLinks: SocialLink[];
  /** 是否显示 RSS 链接 */
  showRss: boolean;
  /** RSS 链接地址 */
  rssUrl: string;
  /** 版权信息模板，{year} 会被替换为当前年份，{author} 会被替换为作者名 */
  copyright: string;
  /** Powered by 文字 */
  poweredBy: {
    text: string;
    url: string;
  };
}

export const footerConfig: FooterConfig = {
  quickLinksTitle: '快速链接',
  quickLinks: [
    { name: '首页', href: '/' },
    { name: '文章', href: '/posts' },
    { name: '标签', href: '/tags' },
    { name: '分类', href: '/categories' },
    { name: '归档', href: '/archives' },
    { name: '关于', href: '/about' }
  ],
  contactTitle: '联系方式',
  socialLinks: socialLinks,
  showRss: true,
  rssUrl: '/rss.xml',
  copyright: '© {year} {author}. All rights reserved.',
  poweredBy: {
    text: 'Astro',
    url: 'https://astro.build'
  }
};
