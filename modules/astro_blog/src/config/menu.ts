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
  { name: '文章', href: '/posts' },
  { name: '标签', href: '/tags' },
  { name: '分类', href: '/categories' },
  { name: '归档', href: '/archives' },
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
