const menu = [
  {
    name: "首页",
    href: "/",
    icon: "home"
  },
  { name: "文章", href: "/posts" },
  { name: "标签", href: "/tags" },
  { name: "分类", href: "/categories" },
  { name: "归档", href: "/archives" },
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
  title: "Vicky's Blog",
  description: "我的个人技术博客，分享我的思考和学习笔记。",
  author: "Vicky",
  avatar: "/images/avatar.png",
  social: {
    github: "https://github.com/seape"
    // twitter: 'https://twitter.com/haiyue',
    // linkedin: 'https://linkedin.com/in/haiyue',
    // email: 'mailto:unisa.dady@gmail.com'
  },
  menu
};
const defaultSEO = {
  title: siteConfig.title,
  description: siteConfig.description,
  image: "/images/og-image.jpg"};

export { defaultSEO as d, siteConfig as s };
