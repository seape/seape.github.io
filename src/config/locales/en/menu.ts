/**
 * English navigation menu configuration
 *
 * When English is the default locale (prefixDefaultLocale: false),
 * paths should NOT have /en/ prefix
 */
export const menu = [
  { name: 'Home', href: '/', icon: 'home'},
  { name: 'Posts', href: '/en/posts' },
  { name: 'Tags', href: '/en/tags' },
  { name: 'Categories', href: '/en/categories' },
  { name: 'Archives', href: '/en/archives' },
  {
    name: 'About',
    href: '/about',
    icon: 'about'
  }
];
