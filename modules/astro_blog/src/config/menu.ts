import type { NavigationItem } from '@/types';

/**
 * 菜单配置
 *
 * 配置项说明：
 * - name: 显示的菜单名称
 * - href: 链接地址
 * - icon: 图标标识（可选）
 *
 * 使用示例：
 * {
 *   name: '首页',
 *   href: '/',
 *   icon: 'home'
 * }
 */
export const menu: NavigationItem[] = [
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
    name: '数学',
    href: '/posts/math',
    icon: 'posts'
  },
  {
    name: '工具',
    href: '/posts/tools',
    icon: 'categories'
  },
  {
    name: '量化',
    href: '/posts/qt-model',
    icon: 'archives'
  },
  {
    name: '技术',
    href: '/posts/techniques',
    icon: 'archives'
  },
  {
    name: '演示',
    href: '/slides',
    icon: 'slides'
  },
  {
    name: 'PTE',
    href: '/posts/pte',
    icon: 'about'
  },
  {
    name: '关于',
    href: '/about',
    icon: 'about'
  }
];
