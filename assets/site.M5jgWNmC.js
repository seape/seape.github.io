const menu = [
  {
    name: "首页",
    href: "/",
    icon: "home"
  },
  {
    name: "博客教学",
    href: "/posts/blog_docs",
    icon: "posts"
  },
  {
    name: "数学",
    href: "/posts/math",
    icon: "posts"
  },
  {
    name: "工具",
    href: "/posts/tools",
    icon: "categories"
  },
  {
    name: "量化",
    href: "/posts/qt-model",
    icon: "archives"
  },
  {
    name: "技术",
    href: "/posts/techniques",
    icon: "archives"
  },
  {
    name: "演示",
    href: "/slides",
    icon: "slides"
  },
  {
    name: "PTE",
    href: "/posts/pte",
    icon: "about"
  },
  {
    name: "关于",
    href: "/about",
    icon: "about"
  }
];

const siteConfig = {
  title: "Jet's Blog",
  description: "基于Astro+Vue+Tailwind构建的个人技术博客，分享我的技术思考和学习笔记。",
  author: "Haiyue",
  avatar: "/images/avatar.svg",
  social: {
    github: "https://github.com/jet-w",
    twitter: "https://twitter.com/haiyue",
    linkedin: "https://linkedin.com/in/haiyue",
    email: "mailto:unisa.dady@gmail.com"
  },
  menu
};
const defaultSEO = {
  title: siteConfig.title,
  description: siteConfig.description,
  image: "/images/og-image.jpg"};

export { defaultSEO as d, siteConfig as s };
