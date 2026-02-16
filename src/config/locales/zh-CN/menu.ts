/**
 * 中文导航菜单配置
 *
 * 当英文是默认语言且 prefixDefaultLocale: false 时，
 * 中文路径需要包含 /zh-CN/ 前缀
 */
export const menu = [
  { name: '首页', href: '/', icon: 'home'},
  { name: '文章', href: '/posts' },
  { name: '标签', href: '/tags' },
  { name: '分类', href: '/categories' },
  { name: '归档', href: '/archives' },
  {
    name: 'PTE',
    href: '/posts/blog_docs_zh/pte',
    icon: 'about'
  },
  {
    name: '关于',
    href: '/about',
    icon: 'about'
  }

];
