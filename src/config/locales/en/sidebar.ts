/**
 * English sidebar configuration
 *
 * When English is the default locale (prefixDefaultLocale: false),
 * paths should NOT have /en/ prefix
 */
export const sidebar = {
  groups: [
    // 扫描技术文档目录
    {
      type: 'scan',
      title: 'Math',
      icon: 'ri:folder-3-line',
      scanPath: 'blog_docs_en/math',
      collapsed: true,
      showForPaths: ['/posts/blog_docs_en/math/**']
    },

    // 扫描技术文档目录
    {
      type: 'scan',
      title: 'Tools',
      icon: 'ri:folder-3-line',
      scanPath: 'blog_docs_en/tools',
      collapsed: true,
      showForPaths: ['/posts/blog_docs_en/tools/**']
    },

    // 扫描技术文档目录
    {
      type: 'scan',
      title: 'Quantitative Trading',
      icon: 'ri:folder-3-line',
      scanPath: 'blog_docs_en/qt-model',
      collapsed: true,
      showForPaths: ['/posts/blog_docs_en/qt-model/**']
    },

    // 扫描技术文档目录
    {
      type: 'scan',
      title: 'Technology',
      icon: 'ri:folder-3-line',
      scanPath: 'blog_docs_en/techniques',
      collapsed: true,
      showForPaths: ['/posts/blog_docs_en/techniques/**']
    },

    // 扫描技术文档目录
    {
      type: 'scan',
      title: 'Media',
      icon: 'ri:folder-3-line',
      scanPath: 'blog_docs_en/media',
      collapsed: true,
      showForPaths: ['/posts/blog_docs_en/media/**']
    },
  ],
};
