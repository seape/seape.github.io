/**
 * 配置文件统一导出
 *
 * 配置文件结构：
 * - site.ts       - 站点基础配置（标题、描述、作者等）
 * - menu.ts       - 菜单配置
 * - sidebar.ts    - 侧边栏配置
 * - social.ts     - 社交链接配置
 * - footer.ts     - 页脚配置
 */

export { siteConfig, defaultSEO } from './site';
export { menu } from './menu';
export { sidebarConfig, defaultSidebarConfig } from './sidebar';
export { socialLinks, defaultIcons } from './social';
export { footerConfig } from './footer';
export type {
  SidebarConfig,
  SidebarGroup,
  SidebarItem,
  ScanConfig,
  ManualConfig,
  MixedConfig,
  DividerConfig,
  PathMatchConfig
} from './sidebar';
export type { SocialLink } from './social';
export type { FooterConfig, FooterLink } from './footer';
