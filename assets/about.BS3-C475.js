import { a as createComponent, c as createAstro, m as maybeRenderHead, d as addAttribute, b as renderTemplate, g as renderSlot, n as createVNode, F as Fragment, _ as __astro_tag_component__ } from './astro/server.CsXMQSOf.js';
import { s as siteConfig } from './site.M5jgWNmC.js';
import 'piccolore';
import 'clsx';
import { s as socialLinks, d as defaultIcons } from './social.C2pJwcyg.js';

const $$Astro$4 = createAstro("https://jet-w.github.io");
const $$TagCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$TagCard;
  const { title, groups } = Astro2.props;
  const colorStyles = {
    primary: { bg: "#dbeafe", text: "#1d4ed8" },
    secondary: { bg: "#e0e7ff", text: "#4338ca" },
    accent: { bg: "#ede9fe", text: "#6d28d9" },
    success: { bg: "#dcfce7", text: "#15803d" },
    warning: { bg: "#fef9c3", text: "#a16207" },
    danger: { bg: "#fee2e2", text: "#b91c1c" },
    info: { bg: "#cffafe", text: "#0e7490" }
  };
  return renderTemplate`${maybeRenderHead()}<div class="card mb-6 last:mb-0 h-full"> <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6"> ${title} </h2> <div class="space-y-1"> ${groups ? groups.map((group) => renderTemplate`<div> <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-2">${group.name}</h3> <div class="flex flex-wrap gap-2"> ${group.tags.map((tag) => renderTemplate`<span class="px-3 py-1 rounded-full text-sm"${addAttribute(`background-color: ${colorStyles[group.color || "primary"].bg}; color: ${colorStyles[group.color || "primary"].text};`, "style")}> ${tag} </span>`)} </div> </div>`) : renderTemplate`${renderSlot($$result, $$slots["default"])}`} </div> </div>`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/about/TagCard.astro", void 0);

const $$Astro$3 = createAstro("https://jet-w.github.io");
const $$IconCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$IconCard;
  const { title, items } = Astro2.props;
  const bgColorMap = {
    primary: "bg-primary-100 dark:bg-primary-900/30",
    secondary: "bg-secondary-100 dark:bg-secondary-900/30",
    accent: "bg-accent-100 dark:bg-accent-900/30"
  };
  const iconColorMap = {
    primary: "text-primary-500",
    secondary: "text-secondary-500",
    accent: "text-accent-500"
  };
  const icons = {
    code: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    music: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
    game: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    travel: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    photo: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z",
    movie: "M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z",
    sport: "M13 10V3L4 14h7v7l9-11h-7z",
    video: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
  };
  return renderTemplate`${maybeRenderHead()}<div class="card mb-6 last:mb-0 h-full"> <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6"> ${title} </h2> <div class="space-y-4"> ${items ? items.map((item) => renderTemplate`<div class="flex items-start space-x-3"> <div${addAttribute(`w-8 h-8 ${bgColorMap[item.color || "primary"]} rounded-lg flex items-center justify-center flex-shrink-0 mt-1`, "class")}> <svg${addAttribute(`w-4 h-4 ${iconColorMap[item.color || "primary"]}`, "class")} fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${addAttribute(icons[item.icon], "d")}></path> </svg> </div> <div> <h3 class="font-semibold text-slate-900 dark:text-slate-100">${item.title}</h3> <p class="text-slate-600 dark:text-slate-400 text-sm">${item.description}</p> </div> </div>`) : renderTemplate`${renderSlot($$result, $$slots["default"])}`} </div> </div>`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/about/IconCard.astro", void 0);

const $$Astro$2 = createAstro("https://jet-w.github.io");
const $$TimelineCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$TimelineCard;
  const { title, events } = Astro2.props;
  const bgColorMap = {
    primary: "bg-primary-500",
    secondary: "bg-secondary-500",
    accent: "bg-accent-500"
  };
  return renderTemplate`${maybeRenderHead()}<div class="card"> <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6"> ${title} </h2> <div class="space-y-8"> ${events.map((event) => renderTemplate`<div class="flex items-start space-x-4"> <div${addAttribute(`flex-shrink-0 w-12 h-12 ${bgColorMap[event.color || "primary"]} rounded-full flex items-center justify-center text-white font-bold`, "class")}> ${event.year} </div> <div> <h3 class="font-semibold text-slate-900 dark:text-slate-100">${event.title}</h3> <p class="text-slate-600 dark:text-slate-400 text-sm"> ${event.description} </p> </div> </div>`)} </div> </div>`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/about/TimelineCard.astro", void 0);

const $$Astro$1 = createAstro("https://jet-w.github.io");
const $$ContentCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$ContentCard;
  const { title, class: className = "" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`card ${className}`, "class")}> <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6"> ${title} </h2> <div class="prose-custom"> ${renderSlot($$result, $$slots["default"])} </div> </div>`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/about/ContentCard.astro", void 0);

const $$Astro = createAstro("https://jet-w.github.io");
const $$SocialLinks = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SocialLinks;
  const { links } = Astro2.props;
  const socialLinksData = links || socialLinks;
  function getIcon(link) {
    return link.icon || defaultIcons[link.type] || "";
  }
  return renderTemplate`${socialLinksData.length > 0 && renderTemplate`${maybeRenderHead()}<div class="flex justify-center space-x-6 mt-8">${socialLinksData.map((link) => renderTemplate`<a${addAttribute(link.url, "href")}${addAttribute(link.type === "email" ? void 0 : "_blank", "target")}${addAttribute(link.type === "email" ? void 0 : "noopener noreferrer", "rel")} class="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors"${addAttribute(link.label || link.type, "aria-label")}><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path${addAttribute(getIcon(link), "d")}></path></svg></a>`)}</div>`}`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/about/SocialLinks.astro", void 0);

/*个人介绍区域*/
/*技能和兴趣*/
/*博客信息*/
/*时间线*/
const frontmatter = {
  "title": "关于",
  "description": "了解更多关于博主和博客的信息"
};
function getHeadings() {
  return [];
}
function _createMdxContent(props) {
  const _components = {
    li: "li",
    p: "p",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return createVNode("div", {
    class: "max-w-4xl mx-auto",
    children: [createVNode("div", {
      class: "text-center mb-16",
      children: [createVNode("div", {
        class: "mb-8",
        children: createVNode("img", {
          src: siteConfig.avatar,
          alt: siteConfig.author,
          class: "w-32 h-32 rounded-full mx-auto shadow-lg border-4 border-white dark:border-slate-800"
        })
      }), createVNode("h1", {
        class: "text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4",
        children: createVNode(_components.p, {
          children: ["你好，我是 ", siteConfig.author]
        })
      }), createVNode("p", {
        class: "text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed",
        children: createVNode(_components.p, {
          children: "一名热爱技术的前端开发者，专注于现代Web开发技术栈。\n喜欢探索新技术，分享学习心得，希望通过这个博客能够帮助到更多的开发者。"
        })
      }), createVNode($$SocialLinks, {})]
    }), createVNode("div", {
      class: "grid grid-cols-1 md:grid-cols-2 mb-16",
      style: "gap: 2rem;",
      children: [createVNode($$TagCard, {
        title: "技术栈",
        groups: [{
          name: '前端技术',
          tags: ['Vue.js', 'TypeScript', 'Astro', '...'],
          color: 'primary'
        }, {
          name: '样式和工具',
          tags: ['Tailwind CSS', 'Sass', 'Vite', '...'],
          color: 'secondary'
        }, {
          name: '后端技术',
          tags: ['Node.js', 'Python', 'C++', 'C#', 'Java', 'SQL', '...'],
          color: 'accent'
        }, {
          name: '数据库',
          tags: ['PostgreSQL', 'MongoDB', 'Redis', 'DynamoDB', '...'],
          color: 'success'
        }, {
          name: '平台',
          tags: ['AWS'],
          color: 'info'
        }]
      }), createVNode($$IconCard, {
        title: "兴趣爱好",
        items: [{
          icon: 'code',
          title: '编程',
          description: '热爱探索新技术，参与开源项目',
          color: 'primary'
        }, {
          icon: 'book',
          title: '阅读',
          description: '喜欢阅读技术书籍和历史故事书',
          color: 'secondary'
        }, {
          icon: 'music',
          title: '音乐',
          description: '编程时喜欢听各种类型的音乐',
          color: 'accent'
        }, {
          icon: 'video',
          title: '视频',
          description: '喜欢看知识及故事分享的视频内容',
          color: 'accent'
        }]
      })]
    }), createVNode($$ContentCard, {
      title: "关于这个博客",
      class: "mb-16",
      children: [createVNode(_components.p, {
        children: ["这个博客基于 ", createVNode(_components.strong, {
          children: "Astro"
        }), " 框架构建，使用了 ", createVNode(_components.strong, {
          children: "Vue 3"
        }), "、", createVNode(_components.strong, {
          children: "TypeScript"
        }), " 和 ", createVNode(_components.strong, {
          children: "Tailwind CSS"
        }), " 等现代技术栈。\n设计灵感来源于 VuePress Theme Hope，追求简洁、现代的视觉体验。"]
      }), createVNode(_components.p, {
        children: "在这里，我会分享："
      }), createVNode(_components.ul, {
        children: ["\n", createVNode(_components.li, {
          children: "前端开发技术和最佳实践"
        }), "\n", createVNode(_components.li, {
          children: "新技术的学习心得和总结"
        }), "\n", createVNode(_components.li, {
          children: "项目开发过程中的经验分享"
        }), "\n", createVNode(_components.li, {
          children: "工具推荐和效率提升技巧"
        }), "\n"]
      }), createVNode(_components.p, {
        children: "如果您对文章内容有任何疑问或建议，欢迎通过社交媒体或邮件与我联系。\n也欢迎在 GitHub 上查看这个博客的源代码，如果对您有帮助，不妨给个 Star!"
      })]
    }), createVNode($$TimelineCard, {
      title: "发展历程",
      events: [{
        year: '2025',
        title: '博客创建',
        description: '使用 Astro 重新构建个人技术博客，采用现代化的技术栈和设计理念。',
        color: 'primary'
      }, {
        year: '2024',
        title: '技术成长',
        description: '深入学习 Vue 3、TypeScript 和各种前端工程化工具，参与多个项目开发。',
        color: 'secondary'
      }, {
        year: '2023',
        title: '前端入门',
        description: '开始系统学习前端开发，从 HTML、CSS、JavaScript 基础开始。',
        color: 'accent'
      }]
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? createVNode(MDXLayout, {
    ...props,
    children: createVNode(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}
const url = "/about";
const file = "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/content/pages/about.mdx";
const Content = (props = {}) => MDXContent({
  ...props,
  components: { Fragment: Fragment, ...props.components, },
});
Content[Symbol.for('mdx-component')] = true;
Content[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter.layout);
Content.moduleId = "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/content/pages/about.mdx";
__astro_tag_component__(Content, 'astro:jsx');

export { Content, Content as default, file, frontmatter, getHeadings, url };
