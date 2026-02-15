/**
 * 侧边栏配置系统
 *
 * 支持三种配置类型：
 * 1. scan - 扫描指定文件夹，自动生成树形结构
 * 2. manual - 手动配置显示特定内容
 * 3. mixed - 混合使用以上两种方式
 *
 * 路径匹配功能：
 * 所有配置类型都支持 showForPaths 和 hideForPaths 属性，用于控制在特定路径下显示或隐藏
 * 支持的路径模式：
 * - /posts/tech/** 匹配 /posts/tech 及其所有子路径
 * - /posts/tech/* 匹配 /posts/tech 的直接子路径
 * - /posts/tech 精确匹配
 *
 * 使用示例：
 *
 * // 1. 扫描文件夹
 * {
 *   type: 'scan',
 *   title: '技术文档',
 *   icon: 'folder',
 *   scanPath: 'tech/tools',  // 扫描 content/posts/tech/tools 目录
 *   collapsed: false,        // 默认展开
 * }
 *
 * // 2. 手动配置
 * {
 *   type: 'manual',
 *   title: '快速导航',
 *   icon: 'star',
 *   items: [
 *     { title: '入门指南', slug: 'getting-started' },
 *     { title: 'API 文档', slug: 'api-docs' },
 *     {
 *       title: '高级主题',
 *       children: [
 *         { title: '性能优化', slug: 'performance' },
 *         { title: '安全指南', slug: 'security' },
 *       ]
 *     }
 *   ]
 * }
 *
 * // 3. 混合配置
 * {
 *   type: 'mixed',
 *   title: '学习资源',
 *   sections: [
 *     {
 *       type: 'manual',
 *       title: '推荐阅读',
 *       items: [
 *         { title: '必读文章', slug: 'must-read' },
 *       ]
 *     },
 *     {
 *       type: 'scan',
 *       title: '教程系列',
 *       scanPath: 'tutorials',
 *     }
 *   ]
 * }
 *
 * // 4. 路径匹配示例 - 只在特定路径下显示
 * {
 *   type: 'scan',
 *   title: '博客指南',
 *   scanPath: 'blog_docs',
 *   showForPaths: ['/posts/blog_docs/**'],  // 只在 blog_docs 路径下显示
 * }
 *
 * // 5. 路径匹配示例 - 在特定路径下隐藏
 * {
 *   type: 'scan',
 *   title: '技术文档',
 *   scanPath: 'tech',
 *   hideForPaths: ['/archives/**'],  // 在归档页面隐藏
 * }
 */

// 路径匹配配置
export interface PathMatchConfig {
  // 匹配的路径模式（支持 glob 风格）
  // 例如: '/posts/tech/**', '/posts/blog_docs/*', '/archives'
  pattern: string;
  // 精确匹配（默认 false，使用前缀匹配）
  exact?: boolean;
}

// 侧边栏项目类型
export interface SidebarItem {
  title: string;
  slug?: string;           // 文章路径
  link?: string;           // 外部链接
  icon?: string;           // 图标
  badge?: string;          // 徽章文本 (如 "NEW", "HOT")
  badgeType?: 'info' | 'success' | 'warning' | 'error';
  children?: SidebarItem[];
  collapsed?: boolean;     // 子项是否默认折叠
}

// 扫描配置
export interface ScanConfig {
  type: 'scan';
  title: string;
  icon?: string;
  scanPath: string;        // 相对于 content/posts 的路径
  collapsed?: boolean;     // 默认是否折叠
  maxDepth?: number;       // 最大扫描深度，默认无限制
  exclude?: string[];      // 排除的文件/文件夹名称（支持 glob 模式）
  include?: string[];      // 只包含的文件/文件夹名称（支持 glob 模式）
  sortBy?: 'name' | 'date' | 'title' | 'custom';  // 排序方式
  sortOrder?: 'asc' | 'desc';  // 排序顺序
  // 路径匹配配置
  showForPaths?: string[];  // 只在匹配的路径下显示，支持 glob 模式
  hideForPaths?: string[];  // 在匹配的路径下隐藏，支持 glob 模式
}

// 手动配置
export interface ManualConfig {
  type: 'manual';
  title: string;
  icon?: string;
  collapsed?: boolean;
  items: SidebarItem[];
  // 路径匹配配置
  showForPaths?: string[];  // 只在匹配的路径下显示
  hideForPaths?: string[];  // 在匹配的路径下隐藏
}

// 混合配置
export interface MixedConfig {
  type: 'mixed';
  title: string;
  icon?: string;
  collapsed?: boolean;
  sections: (ScanConfig | ManualConfig)[];
  // 路径匹配配置
  showForPaths?: string[];  // 只在匹配的路径下显示
  hideForPaths?: string[];  // 在匹配的路径下隐藏
}

// 分隔符
export interface DividerConfig {
  type: 'divider';
  title?: string;          // 可选的分隔符标题
  // 路径匹配配置
  showForPaths?: string[];  // 只在匹配的路径下显示
  hideForPaths?: string[];  // 在匹配的路径下隐藏
}

// 侧边栏组配置
export type SidebarGroup = ScanConfig | ManualConfig | MixedConfig | DividerConfig;

// 完整侧边栏配置
export interface SidebarConfig {
  // 是否显示侧边栏
  enabled: boolean;

  // 侧边栏宽度
  width?: string;

  // 侧边栏位置
  position?: 'left' | 'right';

  // 是否显示搜索框
  showSearch?: boolean;

  // 是否显示最新文章
  showRecentPosts?: boolean;
  recentPostsCount?: number;

  // 是否显示热门标签
  showPopularTags?: boolean;
  popularTagsCount?: number;

  // 是否显示归档
  showArchives?: boolean;
  archivesCount?: number;

  // 是否显示友情链接
  showFriendLinks?: boolean;
  friendLinks?: Array<{
    title: string;
    url: string;
    icon?: string;
    description?: string;
  }>;

  // 侧边栏分组配置
  groups: SidebarGroup[];
}

/**
 * 默认侧边栏配置
 */
export const defaultSidebarConfig: SidebarConfig = {
  enabled: true,
  width: '280px',
  position: 'right',
  showSearch: true,
  showRecentPosts: true,
  recentPostsCount: 5,
  showPopularTags: true,
  popularTagsCount: 8,
  showArchives: true,
  archivesCount: 6,
  showFriendLinks: true,
  friendLinks: [
    { title: 'Astro 官网', url: 'https://astro.build' },
    { title: 'Tailwind CSS', url: 'https://tailwindcss.com' },
    { title: 'Vue.js', url: 'https://vuejs.org' },
  ],
  groups: [
    // 默认扫描所有文章
    {
      type: 'scan',
      title: '文档目录',
      icon: 'folder',
      scanPath: '',  // 空字符串表示扫描根目录
      collapsed: false,
    }
  ]
};

/**
 * 用户侧边栏配置
 * 在这里自定义你的侧边栏
 */
export const sidebarConfig: SidebarConfig = {
  enabled: true,
  showSearch: true,
  showRecentPosts: true,
  recentPostsCount: 5,
  showPopularTags: true,
  popularTagsCount: 8,
  showArchives: true,
  archivesCount: 6,
  showFriendLinks: false,
  friendLinks: [
    { title: 'Astro 官网', url: 'https://astro.build', icon: 'ri:rocket-line' },
    { title: 'Tailwind CSS', url: 'https://tailwindcss.com', icon: 'ri:palette-line' },
    { title: 'Vue.js', url: 'https://vuejs.org', icon: 'ri:vuejs-line' },
  ],
  groups: [
    // 分隔符
    { type: 'divider', title: '技术内容' },
    // 扫描技术文档目录
    {
      type: 'scan',
      title: 'PTE',
      icon: 'ri:folder-3-line',
      scanPath: 'PTE',
      collapsed: true,
      showForPaths: ['/posts/PTE/**']
    },
    // 示例：混合配置
    // {
    //   type: 'mixed',
    //   title: '学习资源',
    //   icon: 'ri:book-line',
    //   sections: [
    //     {
    //       type: 'manual',
    //       title: '推荐阅读',
    //       items: [
    //         { title: '入门教程', slug: 'tutorial/intro', badge: 'HOT', badgeType: 'error' },
    //       ]
    //     },
    //     {
    //       type: 'scan',
    //       title: '系列教程',
    //       scanPath: 'tutorials',
    //     }
    //   ]
    // },
    
  ]
};
