/**
 * 中文侧边栏配置
 *
 * 当英文是默认语言且 prefixDefaultLocale: false 时，
 * 中文路径需要包含 /zh-CN/ 前缀
 */
export const sidebar = {
  groups: [
    // 博客使用指南（置顶）
    // 分隔符
    // { type: 'divider', title: '技术内容' },

    // 扫描技术文档目录
    {
      type: 'scan',
      title: '数学',
      icon: 'ri:folder-3-line',
      scanPath: 'blog_docs_zh/PTE',
      collapsed: true,
      showForPaths: ['/posts/blog_docs_zh/PTE/**']
    },

  ]
};
