import { a as createComponent, c as createAstro, b as renderTemplate, m as maybeRenderHead, d as addAttribute, f as defineScriptVars, n as createVNode, F as Fragment, _ as __astro_tag_component__ } from './astro/server.CsXMQSOf.js';
import 'piccolore';
import 'clsx';
/* empty css                                                             */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://jet-w.github.io");
const $$Slides = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Slides;
  const {
    src,
    height,
    aspectRatio = "16/9",
    theme = "black",
    transition = "slide",
    controls = true,
    progress = true,
    center = true,
    slideNumber = false,
    embedded = true,
    title = "\u5E7B\u706F\u7247\u6F14\u793A"
  } = Astro2.props;
  const slidesId = `slides-${Math.random().toString(36).substr(2, 9)}`;
  const revealConfig = JSON.stringify({
    hash: false,
    controls,
    progress,
    center,
    transition,
    slideNumber,
    embedded,
    keyboard: true,
    overview: true,
    touch: true
  });
  const slotContent = await Astro2.slots.render("default");
  const hasInlineContent = slotContent && slotContent.trim().length > 0;
  function parseSlides(markdown) {
    const cleanMarkdown = markdown.replace(/<!--[\s\S]*?-->/g, "").trim();
    const horizontalSlides = cleanMarkdown.split(/\n---\n/);
    return horizontalSlides.map((hSlide) => {
      return hSlide.split(/\n----\n/).map((s) => s.trim());
    });
  }
  const slidesData = hasInlineContent ? parseSlides(slotContent) : [];
  return renderTemplate`${src ? renderTemplate`<!-- iframe 嵌入模式 -->
  ${maybeRenderHead()}<div class="slides-embed-container"${addAttribute(height ? `height: ${height};` : `aspect-ratio: ${aspectRatio};`, "style")} data-astro-cid-nvltc4vc><iframe${addAttribute(`${src}${src.includes("?") ? "&" : "?"}embed=true`, "src")}${addAttribute(title, "title")} class="slides-iframe" allowfullscreen loading="lazy" data-astro-cid-nvltc4vc></iframe><a${addAttribute(src, "href")} target="_blank" class="slides-fullscreen-btn" title="在新窗口打开" data-astro-cid-nvltc4vc><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-nvltc4vc><polyline points="15 3 21 3 21 9" data-astro-cid-nvltc4vc></polyline><polyline points="9 21 3 21 3 15" data-astro-cid-nvltc4vc></polyline><line x1="21" y1="3" x2="14" y2="10" data-astro-cid-nvltc4vc></line><line x1="3" y1="21" x2="10" y2="14" data-astro-cid-nvltc4vc></line></svg></a></div>` : hasInlineContent ? renderTemplate(_a || (_a = __template(['<!-- \u5185\u8054\u5185\u5BB9\u6A21\u5F0F -->\n  <div class="slides-inline-container"', ' data-astro-cid-nvltc4vc><div class="reveal"', ' data-astro-cid-nvltc4vc><div class="slides" data-astro-cid-nvltc4vc>', '</div></div><!-- \u5168\u5C4F\u6309\u94AE --><button class="slides-fullscreen-btn" title="\u5168\u5C4F"', ' data-astro-cid-nvltc4vc><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-nvltc4vc><polyline points="15 3 21 3 21 9" data-astro-cid-nvltc4vc></polyline><polyline points="9 21 3 21 3 15" data-astro-cid-nvltc4vc></polyline><line x1="21" y1="3" x2="14" y2="10" data-astro-cid-nvltc4vc></line><line x1="3" y1="21" x2="10" y2="14" data-astro-cid-nvltc4vc></line></svg></button></div>\n\n  <!-- Reveal.js \u8D44\u6E90 -->\n  <link rel="stylesheet" href="/slides/reveal.css">\n  <link rel="stylesheet"', '>\n  <link rel="stylesheet" href="/slides/plugin/highlight/monokai.css">\n\n  <script src="/slides/reveal.js"><\/script>\n  <script src="/slides/plugin/markdown/markdown.js"><\/script>\n  <script src="/slides/plugin/highlight/highlight.js"><\/script>\n\n  <script>(function(){', "\n    (function() {\n      function initSlides() {\n        const element = document.getElementById(slidesId);\n        if (!element || element.dataset.initialized) return;\n\n        const config = JSON.parse(revealConfig);\n\n        // \u4F7F\u7528 Reveal \u6784\u9020\u51FD\u6570\u521B\u5EFA\u72EC\u7ACB\u5B9E\u4F8B\n        const deck = new Reveal(element, {\n          hash: config.hash,\n          controls: config.controls,\n          progress: config.progress,\n          center: config.center,\n          transition: config.transition,\n          slideNumber: config.slideNumber,\n          embedded: config.embedded,\n          keyboard: config.keyboard,\n          overview: config.overview,\n          touch: config.touch,\n          plugins: [RevealMarkdown, RevealHighlight]\n        });\n\n        deck.initialize();\n        element.dataset.initialized = 'true';\n      }\n\n      if (document.readyState === 'loading') {\n        document.addEventListener('DOMContentLoaded', initSlides);\n      } else {\n        // \u5EF6\u8FDF\u521D\u59CB\u5316\u786E\u4FDD Reveal.js \u5DF2\u52A0\u8F7D\n        setTimeout(initSlides, 100);\n      }\n    })();\n  })();<\/script>"])), addAttribute(height ? `height: ${height};` : `aspect-ratio: ${aspectRatio};`, "style"), addAttribute(slidesId, "id"), slidesData.map((verticalSlides) => renderTemplate`<section data-astro-cid-nvltc4vc>${verticalSlides.map((slideContent) => renderTemplate`<section data-markdown data-astro-cid-nvltc4vc><textarea data-template data-astro-cid-nvltc4vc>${slideContent}</textarea></section>`)}</section>`), addAttribute(`document.getElementById('${slidesId}').requestFullscreen()`, "onclick"), addAttribute(`/slides/theme/${theme}.css`, "href"), defineScriptVars({ slidesId, revealConfig })) : renderTemplate`<!-- 无内容提示 -->
  <div class="slides-empty" data-astro-cid-nvltc4vc><p data-astro-cid-nvltc4vc>请提供 <code data-astro-cid-nvltc4vc>src</code> 属性或内联 Markdown 内容</p></div>`}`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/media/Slides.astro", void 0);

const frontmatter = {
  "title": "幻灯片演示",
  "description": "使用 Reveal.js 创建专业的演示文稿",
  "pubDate": "2025-01-05T00:00:00.000Z",
  "author": "Astro Blog",
  "categories": ["博客教程"],
  "tags": ["幻灯片", "Reveal.js", "演示"]
};
function getHeadings() {
  return [{
    "depth": 1,
    "slug": "幻灯片演示",
    "text": "幻灯片演示"
  }, {
    "depth": 2,
    "slug": "两种使用方式",
    "text": "两种使用方式"
  }, {
    "depth": 2,
    "slug": "方式一独立幻灯片",
    "text": "方式一：独立幻灯片"
  }, {
    "depth": 3,
    "slug": "基础演示",
    "text": "基础演示"
  }, {
    "depth": 2,
    "slug": "方式二文章内幻灯片",
    "text": "方式二：文章内幻灯片"
  }, {
    "depth": 2,
    "slug": "frontmatter-配置",
    "text": "Frontmatter 配置"
  }, {
    "depth": 3,
    "slug": "独立幻灯片-contentslides",
    "text": "独立幻灯片 (content/slides/)"
  }, {
    "depth": 3,
    "slug": "文章内幻灯片-contentposts",
    "text": "文章内幻灯片 (content/posts/)"
  }, {
    "depth": 3,
    "slug": "完整配置示例",
    "text": "完整配置示例"
  }, {
    "depth": 2,
    "slug": "可用主题",
    "text": "可用主题"
  }, {
    "depth": 3,
    "slug": "主题演示",
    "text": "主题演示"
  }, {
    "depth": 2,
    "slug": "过渡动画",
    "text": "过渡动画"
  }, {
    "depth": 2,
    "slug": "幻灯片语法",
    "text": "幻灯片语法"
  }, {
    "depth": 3,
    "slug": "水平幻灯片",
    "text": "水平幻灯片"
  }, {
    "depth": 3,
    "slug": "垂直幻灯片",
    "text": "垂直幻灯片"
  }, {
    "depth": 3,
    "slug": "垂直幻灯片演示",
    "text": "垂直幻灯片演示"
  }, {
    "depth": 2,
    "slug": "代码高亮",
    "text": "代码高亮"
  }, {
    "depth": 3,
    "slug": "代码演示",
    "text": "代码演示"
  }, {
    "depth": 2,
    "slug": "数学公式",
    "text": "数学公式"
  }, {
    "depth": 3,
    "slug": "数学公式演示",
    "text": "数学公式演示"
  }, {
    "depth": 2,
    "slug": "mermaid-图表",
    "text": "Mermaid 图表"
  }, {
    "depth": 3,
    "slug": "mermaid-演示",
    "text": "Mermaid 演示"
  }, {
    "depth": 2,
    "slug": "echarts-图表",
    "text": "ECharts 图表"
  }, {
    "depth": 3,
    "slug": "echarts-演示",
    "text": "ECharts 演示"
  }, {
    "depth": 2,
    "slug": "表格",
    "text": "表格"
  }, {
    "depth": 2,
    "slug": "分栏布局",
    "text": "分栏布局"
  }, {
    "depth": 2,
    "slug": "fragment-动画",
    "text": "Fragment 动画"
  }, {
    "depth": 3,
    "slug": "fragment-演示",
    "text": "Fragment 演示"
  }, {
    "depth": 2,
    "slug": "演讲者备注",
    "text": "演讲者备注"
  }, {
    "depth": 2,
    "slug": "键盘快捷键",
    "text": "键盘快捷键"
  }, {
    "depth": 2,
    "slug": "在文章中嵌入幻灯片",
    "text": "在文章中嵌入幻灯片"
  }, {
    "depth": 3,
    "slug": "使用-slides-组件",
    "text": "使用 Slides 组件"
  }, {
    "depth": 3,
    "slug": "slides-组件属性",
    "text": "Slides 组件属性"
  }, {
    "depth": 3,
    "slug": "内联幻灯片内容",
    "text": "内联幻灯片内容"
  }, {
    "depth": 2,
    "slug": "完整幻灯片示例",
    "text": "完整幻灯片示例"
  }, {
    "depth": 2,
    "slug": "目录结构",
    "text": "目录结构"
  }, {
    "depth": 2,
    "slug": "常见问题",
    "text": "常见问题"
  }, {
    "depth": 3,
    "slug": "幻灯片不显示",
    "text": "幻灯片不显示？"
  }, {
    "depth": 3,
    "slug": "layout-slides-不生效",
    "text": "layout: slides 不生效？"
  }, {
    "depth": 3,
    "slug": "代码高亮不工作",
    "text": "代码高亮不工作？"
  }, {
    "depth": 3,
    "slug": "数学公式不渲染",
    "text": "数学公式不渲染？"
  }, {
    "depth": 2,
    "slug": "相关示例",
    "text": "相关示例"
  }, {
    "depth": 2,
    "slug": "下一步",
    "text": "下一步"
  }];
}
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    div: "div",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    table: "table",
    tbody: "tbody",
    td: "td",
    th: "th",
    thead: "thead",
    tr: "tr",
    ul: "ul",
    ...props.components
  };
  return createVNode(Fragment, {
    children: [createVNode(_components.h1, {
      id: "幻灯片演示",
      children: "幻灯片演示"
    }), "\n", createVNode(_components.p, {
      children: ["博客系统集成了 ", createVNode(_components.a, {
        href: "https://revealjs.com/",
        children: "Reveal.js"
      }), "，让你可以直接使用 Markdown 创建专业的演示文稿。"]
    }), "\n", createVNode(_components.h2, {
      id: "两种使用方式",
      children: "两种使用方式"
    }), "\n", createVNode(_components.p, {
      children: "博客系统提供了两种创建幻灯片的方式："
    }), "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", createVNode(_components.table, {
      children: [createVNode(_components.thead, {
        children: createVNode(_components.tr, {
          children: [createVNode(_components.th, {
            children: "方式"
          }), createVNode(_components.th, {
            children: "目录"
          }), createVNode(_components.th, {
            children: "说明"
          }), createVNode(_components.th, {
            children: "适用场景"
          })]
        })
      }), createVNode(_components.tbody, {
        children: [createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.strong, {
              children: "独立幻灯片"
            })
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "content/slides/"
            })
          }), createVNode(_components.td, {
            children: "专门的幻灯片页面"
          }), createVNode(_components.td, {
            children: "独立演示、可复用内容"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.strong, {
              children: "文章内幻灯片"
            })
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "content/posts/"
            })
          }), createVNode(_components.td, {
            children: ["在文章中使用 ", createVNode(_components.code, {
              children: "layout: slides"
            })]
          }), createVNode(_components.td, {
            children: "与博客内容结合"
          })]
        })]
      })]
    }), "\n", createVNode(_components.h2, {
      id: "方式一独立幻灯片",
      children: "方式一：独立幻灯片"
    }), "\n", createVNode(_components.p, {
      children: ["在 ", createVNode(_components.code, {
        children: "content/slides/"
      }), " 目录下创建 ", createVNode(_components.code, {
        children: ".md"
      }), " 文件："]
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "markdown",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "---"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "title: 我的演示"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "description: 演示描述"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "pubDate: 2025-01-05"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "theme: black"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "slideNumber: true"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "---"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "# 欢迎"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "这是第一页"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "---"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "## 第二页"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "使用 "
          }), createVNode(_components.span, {
            style: {
              color: "#79B8FF"
            },
            children: "`---`"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: " 分隔幻灯片"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "---"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "# 完成！"
          })
        })]
      })
    }), "\n", createVNode(_components.p, {
      children: ["访问路径：", createVNode(_components.code, {
        children: "/slides/我的演示"
      })]
    }), "\n", createVNode(_components.div, {
      class: "container-tip custom-container",
      "data-container-type": "tip",
      children: ["\n", createVNode(_components.div, {
        class: "container-title",
        children: "幻灯片列表"
      }), "\n", createVNode(_components.div, {
        class: "container-content",
        children: ["\n", createVNode(_components.p, {
          children: "访问"
        }), "\n", createVNode(_components.h3, {
          id: "基础演示",
          children: "基础演示"
        }), "\n", createVNode($$Slides, {
          src: "/slides/docs/basic-demo",
          height: "400px"
        }), "\n", createVNode(_components.h2, {
          id: "方式二文章内幻灯片",
          children: "方式二：文章内幻灯片"
        }), "\n", createVNode(_components.p, {
          children: ["在 ", createVNode(_components.code, {
            children: "content/posts/"
          }), " 目录下的任何位置创建 ", createVNode(_components.code, {
            children: ".md"
          }), " 文件，添加 ", createVNode(_components.code, {
            children: "layout: slides"
          }), " 即可："]
        }), "\n", createVNode(_components.pre, {
          class: "astro-code github-dark",
          style: {
            backgroundColor: "#24292e",
            color: "#e1e4e8",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word"
          },
          tabindex: "0",
          "data-language": "markdown",
          children: createVNode(_components.code, {
            children: [createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#79B8FF",
                  fontWeight: "bold"
                },
                children: "---"
              })
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: "title: 技术分享"
              })
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: "description: 在文章目录中的幻灯片"
              })
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: "pubDate: 2025-01-05"
              })
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: "tags:"
              })
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: [createVNode(_components.span, {
                style: {
                  color: "#FFAB70"
                },
                children: "  -"
              }), createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: " 技术"
              })]
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: [createVNode(_components.span, {
                style: {
                  color: "#FFAB70"
                },
                children: "  -"
              }), createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: " 分享"
              })]
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: "categories:"
              })
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: [createVNode(_components.span, {
                style: {
                  color: "#FFAB70"
                },
                children: "  -"
              }), createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: " 演示"
              })]
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: "layout: slides"
              })
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: "theme: white"
              })
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: "transition: fade"
              })
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: "slideNumber: true"
              })
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#79B8FF",
                  fontWeight: "bold"
                },
                children: "---"
              })
            }), "\n", createVNode(_components.span, {
              class: "line"
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#79B8FF",
                  fontWeight: "bold"
                },
                children: "# 技术分享"
              })
            }), "\n", createVNode(_components.span, {
              class: "line"
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: "这是在 posts 目录中的幻灯片"
              })
            }), "\n", createVNode(_components.span, {
              class: "line"
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#79B8FF",
                  fontWeight: "bold"
                },
                children: "---"
              })
            }), "\n", createVNode(_components.span, {
              class: "line"
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: createVNode(_components.span, {
                style: {
                  color: "#79B8FF",
                  fontWeight: "bold"
                },
                children: "## 功能特点"
              })
            }), "\n", createVNode(_components.span, {
              class: "line"
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: [createVNode(_components.span, {
                style: {
                  color: "#FFAB70"
                },
                children: "-"
              }), createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: " 与博客文章在同一目录"
              })]
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: [createVNode(_components.span, {
                style: {
                  color: "#FFAB70"
                },
                children: "-"
              }), createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: " 支持分类和标签"
              })]
            }), "\n", createVNode(_components.span, {
              class: "line",
              children: [createVNode(_components.span, {
                style: {
                  color: "#FFAB70"
                },
                children: "-"
              }), createVNode(_components.span, {
                style: {
                  color: "#E1E4E8"
                },
                children: " 会出现在文章列表中"
              })]
            })]
          })
        }), "\n", createVNode(_components.p, {
          children: ["访问路径：", createVNode(_components.code, {
            children: "/posts/目录/文件名"
          })]
        }), "\n"]
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: [createVNode(_components.a, {
        href: "/posts/test/test-slides",
        children: "/posts/test/test-slides"
      }), " 查看实际效果。\n"]
    }), "\n", createVNode(_components.h2, {
      id: "frontmatter-配置",
      children: "Frontmatter 配置"
    }), "\n", createVNode(_components.h3, {
      id: "独立幻灯片-contentslides",
      children: "独立幻灯片 (content/slides/)"
    }), "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", createVNode(_components.table, {
      children: [createVNode(_components.thead, {
        children: createVNode(_components.tr, {
          children: [createVNode(_components.th, {
            children: "字段"
          }), createVNode(_components.th, {
            children: "类型"
          }), createVNode(_components.th, {
            children: "默认值"
          }), createVNode(_components.th, {
            children: "说明"
          })]
        })
      }), createVNode(_components.tbody, {
        children: [createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "title"
            })
          }), createVNode(_components.td, {
            children: "string"
          }), createVNode(_components.td, {
            children: "-"
          }), createVNode(_components.td, {
            children: [createVNode(_components.strong, {
              children: "必填"
            }), "，演示标题"]
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "description"
            })
          }), createVNode(_components.td, {
            children: "string"
          }), createVNode(_components.td, {
            children: "-"
          }), createVNode(_components.td, {
            children: "演示描述"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "pubDate"
            })
          }), createVNode(_components.td, {
            children: "date"
          }), createVNode(_components.td, {
            children: "-"
          }), createVNode(_components.td, {
            children: "发布日期"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "author"
            })
          }), createVNode(_components.td, {
            children: "string"
          }), createVNode(_components.td, {
            children: "-"
          }), createVNode(_components.td, {
            children: "作者"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "tags"
            })
          }), createVNode(_components.td, {
            children: "array"
          }), createVNode(_components.td, {
            children: "[]"
          }), createVNode(_components.td, {
            children: "标签列表"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "theme"
            })
          }), createVNode(_components.td, {
            children: "string"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "black"
            })
          }), createVNode(_components.td, {
            children: "Reveal.js 主题"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "transition"
            })
          }), createVNode(_components.td, {
            children: "string"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "slide"
            })
          }), createVNode(_components.td, {
            children: "过渡动画"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "controls"
            })
          }), createVNode(_components.td, {
            children: "boolean"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "true"
            })
          }), createVNode(_components.td, {
            children: "显示控制箭头"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "progress"
            })
          }), createVNode(_components.td, {
            children: "boolean"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "true"
            })
          }), createVNode(_components.td, {
            children: "显示进度条"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "center"
            })
          }), createVNode(_components.td, {
            children: "boolean"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "true"
            })
          }), createVNode(_components.td, {
            children: "内容垂直居中"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "slideNumber"
            })
          }), createVNode(_components.td, {
            children: "boolean"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "false"
            })
          }), createVNode(_components.td, {
            children: "显示页码"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "hash"
            })
          }), createVNode(_components.td, {
            children: "boolean"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "true"
            })
          }), createVNode(_components.td, {
            children: "URL 包含 hash"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "draft"
            })
          }), createVNode(_components.td, {
            children: "boolean"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "false"
            })
          }), createVNode(_components.td, {
            children: "草稿状态"
          })]
        })]
      })]
    }), "\n", createVNode(_components.h3, {
      id: "文章内幻灯片-contentposts",
      children: "文章内幻灯片 (content/posts/)"
    }), "\n", createVNode(_components.p, {
      children: "除了上述字段外，还支持："
    }), "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", createVNode(_components.table, {
      children: [createVNode(_components.thead, {
        children: createVNode(_components.tr, {
          children: [createVNode(_components.th, {
            children: "字段"
          }), createVNode(_components.th, {
            children: "类型"
          }), createVNode(_components.th, {
            children: "默认值"
          }), createVNode(_components.th, {
            children: "说明"
          })]
        })
      }), createVNode(_components.tbody, {
        children: [createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "layout"
            })
          }), createVNode(_components.td, {
            children: "string"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "default"
            })
          }), createVNode(_components.td, {
            children: ["设为 ", createVNode(_components.code, {
              children: "slides"
            }), " 启用幻灯片"]
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "categories"
            })
          }), createVNode(_components.td, {
            children: "array"
          }), createVNode(_components.td, {
            children: "[]"
          }), createVNode(_components.td, {
            children: "分类（会出现在博客分类中）"
          })]
        })]
      })]
    }), "\n", createVNode(_components.h3, {
      id: "完整配置示例",
      children: "完整配置示例"
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "yaml",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#B392F0"
            },
            children: "---"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "title"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ": "
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "产品发布会"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "description"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ": "
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "2025年新产品发布演示"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "pubDate"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ": "
          }), createVNode(_components.span, {
            style: {
              color: "#79B8FF"
            },
            children: "2025-01-05"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "author"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ": "
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "产品经理"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "tags"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ":"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "  - "
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "产品"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "  - "
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "发布"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "categories"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ":"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "  - "
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "演示"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "layout"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ": "
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "slides"
          }), createVNode(_components.span, {
            style: {
              color: "#6A737D"
            },
            children: "        # 关键：启用幻灯片布局"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "theme"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ": "
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "night"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "transition"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ": "
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "fade"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "controls"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ": "
          }), createVNode(_components.span, {
            style: {
              color: "#79B8FF"
            },
            children: "true"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "progress"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ": "
          }), createVNode(_components.span, {
            style: {
              color: "#79B8FF"
            },
            children: "true"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "center"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ": "
          }), createVNode(_components.span, {
            style: {
              color: "#79B8FF"
            },
            children: "true"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "slideNumber"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ": "
          }), createVNode(_components.span, {
            style: {
              color: "#79B8FF"
            },
            children: "true"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "draft"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ": "
          }), createVNode(_components.span, {
            style: {
              color: "#79B8FF"
            },
            children: "false"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#B392F0"
            },
            children: "---"
          })
        })]
      })
    }), "\n", createVNode(_components.h2, {
      id: "可用主题",
      children: "可用主题"
    }), "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", createVNode(_components.table, {
      children: [createVNode(_components.thead, {
        children: createVNode(_components.tr, {
          children: [createVNode(_components.th, {
            children: "主题"
          }), createVNode(_components.th, {
            children: "说明"
          }), createVNode(_components.th, {
            children: "适用场景"
          })]
        })
      }), createVNode(_components.tbody, {
        children: [createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "black"
            })
          }), createVNode(_components.td, {
            children: "黑色背景，白色文字"
          }), createVNode(_components.td, {
            children: "通用演示（默认）"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "white"
            })
          }), createVNode(_components.td, {
            children: "白色背景，黑色文字"
          }), createVNode(_components.td, {
            children: "正式场合、打印"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "league"
            })
          }), createVNode(_components.td, {
            children: "深灰色背景"
          }), createVNode(_components.td, {
            children: "商务演示"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "beige"
            })
          }), createVNode(_components.td, {
            children: "米色背景"
          }), createVNode(_components.td, {
            children: "温馨风格"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "night"
            })
          }), createVNode(_components.td, {
            children: "深蓝色背景"
          }), createVNode(_components.td, {
            children: "夜间模式"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "serif"
            })
          }), createVNode(_components.td, {
            children: "衬线字体风格"
          }), createVNode(_components.td, {
            children: "学术演示"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "simple"
            })
          }), createVNode(_components.td, {
            children: "极简白色"
          }), createVNode(_components.td, {
            children: "简约风格"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "solarized"
            })
          }), createVNode(_components.td, {
            children: "Solarized 配色"
          }), createVNode(_components.td, {
            children: "开发者演示"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "blood"
            })
          }), createVNode(_components.td, {
            children: "深红色强调"
          }), createVNode(_components.td, {
            children: "有冲击力的演示"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "moon"
            })
          }), createVNode(_components.td, {
            children: "深蓝月光风格"
          }), createVNode(_components.td, {
            children: "创意演示"
          })]
        })]
      })]
    }), "\n", createVNode(_components.h3, {
      id: "主题演示",
      children: "主题演示"
    }), "\n", createVNode($$Slides, {
      src: "/slides/docs/theme-demo",
      height: "400px"
    }), "\n", createVNode(_components.h2, {
      id: "过渡动画",
      children: "过渡动画"
    }), "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", createVNode(_components.table, {
      children: [createVNode(_components.thead, {
        children: createVNode(_components.tr, {
          children: [createVNode(_components.th, {
            children: "值"
          }), createVNode(_components.th, {
            children: "效果"
          })]
        })
      }), createVNode(_components.tbody, {
        children: [createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "none"
            })
          }), createVNode(_components.td, {
            children: "无动画"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "fade"
            })
          }), createVNode(_components.td, {
            children: "淡入淡出"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "slide"
            })
          }), createVNode(_components.td, {
            children: "滑动（默认）"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "convex"
            })
          }), createVNode(_components.td, {
            children: "凸面翻转"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "concave"
            })
          }), createVNode(_components.td, {
            children: "凹面翻转"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "zoom"
            })
          }), createVNode(_components.td, {
            children: "缩放"
          })]
        })]
      })]
    }), "\n", createVNode(_components.h2, {
      id: "幻灯片语法",
      children: "幻灯片语法"
    }), "\n", createVNode(_components.h3, {
      id: "水平幻灯片",
      children: "水平幻灯片"
    }), "\n", createVNode(_components.p, {
      children: ["使用 ", createVNode(_components.code, {
        children: "---"
      }), " 分隔水平幻灯片（主线内容）："]
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "markdown",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "# 第一页"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "内容..."
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "---"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "# 第二页"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "按 → 键切换"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "---"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "# 第三页"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "继续..."
          })
        })]
      })
    }), "\n", createVNode(_components.h3, {
      id: "垂直幻灯片",
      children: "垂直幻灯片"
    }), "\n", createVNode(_components.p, {
      children: ["使用 ", createVNode(_components.code, {
        children: "----"
      }), " 分隔垂直幻灯片（章节子内容）："]
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "markdown",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "# 第一章"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "概述内容"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "----"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "## 1.1 详细说明"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "按 ↓ 键查看"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "----"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "## 1.2 更多内容"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "按 → 返回主线"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "---"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "# 第二章"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "新的章节"
          })
        })]
      })
    }), "\n", createVNode(_components.h3, {
      id: "垂直幻灯片演示",
      children: "垂直幻灯片演示"
    }), "\n", createVNode($$Slides, {
      src: "/slides/docs/vertical-demo",
      height: "400px"
    }), "\n", createVNode(_components.div, {
      class: "container-tip custom-container",
      "data-container-type": "tip",
      children: ["\n", createVNode(_components.div, {
        class: "container-title",
        children: "垂直幻灯片用途"
      }), "\n", createVNode(_components.div, {
        class: "container-content",
        children: ["\n", createVNode(_components.p, {
          children: "垂直幻灯片适合："
        }), "\n", createVNode(_components.ul, {
          children: ["\n", createVNode(_components.li, {
            children: "章节下的详细展开"
          }), "\n", createVNode(_components.li, {
            children: "可选的补充内容"
          }), "\n", createVNode(_components.li, {
            children: "深入解释某个概念"
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", createVNode(_components.h2, {
      id: "代码高亮",
      children: "代码高亮"
    }), "\n", createVNode(_components.p, {
      children: "支持所有主流编程语言："
    }), "\n", createVNode(_components.h3, {
      id: "代码演示",
      children: "代码演示"
    }), "\n", createVNode($$Slides, {
      src: "/slides/docs/code-demo",
      height: "400px"
    }), "\n", createVNode(_components.h2, {
      id: "数学公式",
      children: "数学公式"
    }), "\n", createVNode(_components.p, {
      children: "支持 LaTeX 语法："
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "markdown",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "## 数学公式"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "行内公式：$E = mc^2$"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "块级公式："
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "$$"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "$$"
          })
        })]
      })
    }), "\n", createVNode(_components.h3, {
      id: "数学公式演示",
      children: "数学公式演示"
    }), "\n", createVNode($$Slides, {
      src: "/slides/docs/math-demo",
      height: "400px"
    }), "\n", createVNode(_components.h2, {
      id: "mermaid-图表",
      children: "Mermaid 图表"
    }), "\n", createVNode(_components.p, {
      children: "幻灯片支持 Mermaid 图表，可绘制流程图、时序图、类图等："
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "markdown",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "## 流程图"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "​```mermaid"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "graph TD"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "    A["
          }), createVNode(_components.span, {
            style: {
              color: "#DBEDFF",
              textDecoration: "underline"
            },
            children: "开始"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "] --> B{条件判断}"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "    B -->|是| C["
          }), createVNode(_components.span, {
            style: {
              color: "#DBEDFF",
              textDecoration: "underline"
            },
            children: "执行操作"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "]"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "    B -->|否| D["
          }), createVNode(_components.span, {
            style: {
              color: "#DBEDFF",
              textDecoration: "underline"
            },
            children: "跳过"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "]"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "    C --> E["
          }), createVNode(_components.span, {
            style: {
              color: "#DBEDFF",
              textDecoration: "underline"
            },
            children: "结束"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "]"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "    D --> E"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "​```"
          })
        })]
      })
    }), "\n", createVNode(_components.h3, {
      id: "mermaid-演示",
      children: "Mermaid 演示"
    }), "\n", createVNode($$Slides, {
      src: "/slides/docs/mermaid-demo",
      height: "400px"
    }), "\n", createVNode(_components.h2, {
      id: "echarts-图表",
      children: "ECharts 图表"
    }), "\n", createVNode(_components.p, {
      children: "幻灯片支持 ECharts 交互式图表："
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "markdown",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "## 折线图"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "​```echarts"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "{"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "  \"xAxis\": {"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "    \"type\": \"category\","
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "    \"data\": [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\"]"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "  },"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "  \"yAxis\": { \"type\": \"value\" },"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "  \"series\": [{"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "    \"data\": [150, 230, 224, 218, 135],"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "    \"type\": \"line\""
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "  }]"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "}"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "​```"
          })
        })]
      })
    }), "\n", createVNode(_components.h3, {
      id: "echarts-演示",
      children: "ECharts 演示"
    }), "\n", createVNode($$Slides, {
      src: "/slides/docs/echarts-demo",
      height: "400px"
    }), "\n", createVNode(_components.h2, {
      id: "表格",
      children: "表格"
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "markdown",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "## 功能对比"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "| 功能 | 免费版 | 专业版 |"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "|------|:------:|:------:|"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "| 基础功能 | ✓ | ✓ |"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "| 高级分析 | ✗ | ✓ |"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "| API 访问 | ✗ | ✓ |"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "| 技术支持 | 邮件 | 24/7 |"
          })
        })]
      })
    }), "\n", createVNode(_components.h2, {
      id: "分栏布局",
      children: "分栏布局"
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "markdown",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "## 对比展示"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "<div style=\"display: flex; gap: 2em;\">"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "<div style=\"flex: 1;\">"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "### 方案 A"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#FFAB70"
            },
            children: "-"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: " 成本低"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#FFAB70"
            },
            children: "-"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: " 实现快"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#FFAB70"
            },
            children: "-"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: " 风险小"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "</div>"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "<div style=\"flex: 1;\">"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "### 方案 B"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#FFAB70"
            },
            children: "-"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: " 性能高"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#FFAB70"
            },
            children: "-"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: " 扩展性好"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#FFAB70"
            },
            children: "-"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: " 长期收益"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "</div>"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "</div>"
          })
        })]
      })
    }), "\n", createVNode(_components.h2, {
      id: "fragment-动画",
      children: "Fragment 动画"
    }), "\n", createVNode(_components.p, {
      children: "逐步显示内容："
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "markdown",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "## 核心功能"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "<p class=\"fragment\">1. 智能分析</p>"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "<p class=\"fragment\">2. 自动化处理</p>"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "<p class=\"fragment\">3. 可视化报表</p>"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "<p class=\"fragment fade-up\">4. 实时监控</p>"
          })
        })]
      })
    }), "\n", createVNode(_components.h3, {
      id: "fragment-演示",
      children: "Fragment 演示"
    }), "\n", createVNode($$Slides, {
      src: "/slides/docs/fragment-demo",
      height: "400px"
    }), "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", createVNode(_components.table, {
      children: [createVNode(_components.thead, {
        children: createVNode(_components.tr, {
          children: [createVNode(_components.th, {
            children: "类名"
          }), createVNode(_components.th, {
            children: "效果"
          })]
        })
      }), createVNode(_components.tbody, {
        children: [createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "fragment"
            })
          }), createVNode(_components.td, {
            children: "默认淡入"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "fragment fade-out"
            })
          }), createVNode(_components.td, {
            children: "淡出"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "fragment fade-up"
            })
          }), createVNode(_components.td, {
            children: "从下方淡入"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "fragment fade-down"
            })
          }), createVNode(_components.td, {
            children: "从上方淡入"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "fragment highlight-red"
            })
          }), createVNode(_components.td, {
            children: "高亮红色"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "fragment highlight-green"
            })
          }), createVNode(_components.td, {
            children: "高亮绿色"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "fragment highlight-blue"
            })
          }), createVNode(_components.td, {
            children: "高亮蓝色"
          })]
        })]
      })]
    }), "\n", createVNode(_components.h2, {
      id: "演讲者备注",
      children: "演讲者备注"
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "markdown",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "## 重要观点"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "这是观众看到的内容"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "Note:"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "这是演讲者备注，只在演讲者视图中显示。"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#FFAB70"
            },
            children: "-"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: " 记得强调这一点"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#FFAB70"
            },
            children: "-"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: " 准备回答相关问题"
          })]
        })]
      })
    }), "\n", createVNode(_components.p, {
      children: ["按 ", createVNode(_components.code, {
        children: "S"
      }), " 键打开演讲者视图。"]
    }), "\n", createVNode(_components.h2, {
      id: "键盘快捷键",
      children: "键盘快捷键"
    }), "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", createVNode(_components.table, {
      children: [createVNode(_components.thead, {
        children: createVNode(_components.tr, {
          children: [createVNode(_components.th, {
            children: "快捷键"
          }), createVNode(_components.th, {
            children: "功能"
          })]
        })
      }), createVNode(_components.tbody, {
        children: [createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: [createVNode(_components.code, {
              children: "→"
            }), " / ", createVNode(_components.code, {
              children: "Space"
            })]
          }), createVNode(_components.td, {
            children: "下一页"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "←"
            })
          }), createVNode(_components.td, {
            children: "上一页"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "↑"
            })
          }), createVNode(_components.td, {
            children: "上一个垂直页"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "↓"
            })
          }), createVNode(_components.td, {
            children: "下一个垂直页"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: [createVNode(_components.code, {
              children: "Esc"
            }), " / ", createVNode(_components.code, {
              children: "O"
            })]
          }), createVNode(_components.td, {
            children: "概览模式"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "F"
            })
          }), createVNode(_components.td, {
            children: "全屏模式"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "S"
            })
          }), createVNode(_components.td, {
            children: "演讲者视图"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: [createVNode(_components.code, {
              children: "B"
            }), " / ", createVNode(_components.code, {
              children: "."
            })]
          }), createVNode(_components.td, {
            children: "黑屏暂停"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "Home"
            })
          }), createVNode(_components.td, {
            children: "第一页"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "End"
            })
          }), createVNode(_components.td, {
            children: "最后一页"
          })]
        })]
      })]
    }), "\n", createVNode(_components.h2, {
      id: "在文章中嵌入幻灯片",
      children: "在文章中嵌入幻灯片"
    }), "\n", createVNode(_components.p, {
      children: ["除了独立的幻灯片页面，还可以在普通文章（", createVNode(_components.code, {
        children: ".mdx"
      }), "）中嵌入幻灯片。"]
    }), "\n", createVNode(_components.h3, {
      id: "使用-slides-组件",
      children: "使用 Slides 组件"
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "mdx",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "---"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#85E89D"
            },
            children: "title"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: ": "
          }), createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "我的文章"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#9ECBFF"
            },
            children: "---"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "import Slides from '@/components/media/Slides.astro';"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "# 文章内容"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "下面是嵌入的幻灯片："
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "<Slides src=\"/slides/demo\" height=\"500px\" />"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "继续阅读..."
          })
        })]
      })
    }), "\n", createVNode(_components.h3, {
      id: "slides-组件属性",
      children: "Slides 组件属性"
    }), "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", createVNode(_components.table, {
      children: [createVNode(_components.thead, {
        children: createVNode(_components.tr, {
          children: [createVNode(_components.th, {
            children: "属性"
          }), createVNode(_components.th, {
            children: "类型"
          }), createVNode(_components.th, {
            children: "默认值"
          }), createVNode(_components.th, {
            children: "说明"
          })]
        })
      }), createVNode(_components.tbody, {
        children: [createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "src"
            })
          }), createVNode(_components.td, {
            children: "string"
          }), createVNode(_components.td, {
            children: "-"
          }), createVNode(_components.td, {
            children: "幻灯片 URL"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "height"
            })
          }), createVNode(_components.td, {
            children: "string"
          }), createVNode(_components.td, {
            children: "-"
          }), createVNode(_components.td, {
            children: "容器高度"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "aspectRatio"
            })
          }), createVNode(_components.td, {
            children: "string"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "\"16/9\""
            })
          }), createVNode(_components.td, {
            children: "宽高比"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "theme"
            })
          }), createVNode(_components.td, {
            children: "string"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "\"black\""
            })
          }), createVNode(_components.td, {
            children: "主题"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "transition"
            })
          }), createVNode(_components.td, {
            children: "string"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "\"slide\""
            })
          }), createVNode(_components.td, {
            children: "过渡效果"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "controls"
            })
          }), createVNode(_components.td, {
            children: "boolean"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "true"
            })
          }), createVNode(_components.td, {
            children: "控制箭头"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "progress"
            })
          }), createVNode(_components.td, {
            children: "boolean"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "true"
            })
          }), createVNode(_components.td, {
            children: "进度条"
          })]
        }), createVNode(_components.tr, {
          children: [createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "slideNumber"
            })
          }), createVNode(_components.td, {
            children: "boolean"
          }), createVNode(_components.td, {
            children: createVNode(_components.code, {
              children: "false"
            })
          }), createVNode(_components.td, {
            children: "页码"
          })]
        })]
      })]
    }), "\n", createVNode(_components.h3, {
      id: "内联幻灯片内容",
      children: "内联幻灯片内容"
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "mdx",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "import Slides from '@/components/media/Slides.astro';"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "<Slides height=\"400px\" theme=\"white\">"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "# 欢迎"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "内嵌幻灯片"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "---"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "## 第二页"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#FFAB70"
            },
            children: "-"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: " 要点一"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#FFAB70"
            },
            children: "-"
          }), createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: " 要点二"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "---"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#79B8FF",
              fontWeight: "bold"
            },
            children: "# 完成！"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "</Slides>"
          })
        })]
      })
    }), "\n", createVNode(_components.h2, {
      id: "完整幻灯片示例",
      children: "完整幻灯片示例"
    }), "\n", createVNode(_components.p, {
      children: "点击下方幻灯片查看完整演示："
    }), "\n", createVNode($$Slides, {
      src: "/slides/demo",
      height: "500px"
    }), "\n", createVNode(_components.h2, {
      id: "目录结构",
      children: "目录结构"
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "plaintext",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "content/"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "├── slides/                    # 独立幻灯片目录"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "│   ├── demo.md               # 示例演示"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "│   ├── product-intro.md      # 产品介绍"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "│   └── docs/                 # 文档演示幻灯片"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "│       ├── basic-demo.md     # 基础演示"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "│       ├── code-demo.md      # 代码高亮"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "│       ├── vertical-demo.md  # 垂直幻灯片"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "│       ├── math-demo.md      # 数学公式"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "│       ├── fragment-demo.md  # Fragment 动画"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "│       ├── theme-demo.md     # 主题演示"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "│       ├── mermaid-demo.md   # Mermaid 图表"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "│       └── echarts-demo.md   # ECharts 图表"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "└── posts/                     # 博客文章目录"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "    └── test/"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            children: "        └── test-slides.md    # layout: slides 的文章"
          })
        })]
      })
    }), "\n", createVNode(_components.h2, {
      id: "常见问题",
      children: "常见问题"
    }), "\n", createVNode(_components.h3, {
      id: "幻灯片不显示",
      children: "幻灯片不显示？"
    }), "\n", createVNode(_components.p, {
      children: "检查："
    }), "\n", createVNode(_components.ol, {
      children: ["\n", createVNode(_components.li, {
        children: ["独立幻灯片：文件在 ", createVNode(_components.code, {
          children: "content/slides/"
        }), " 目录"]
      }), "\n", createVNode(_components.li, {
        children: ["文章幻灯片：添加了 ", createVNode(_components.code, {
          children: "layout: slides"
        })]
      }), "\n", createVNode(_components.li, {
        children: ["Frontmatter 格式正确（", createVNode(_components.code, {
          children: "---"
        }), " 包围）"]
      }), "\n", createVNode(_components.li, {
        children: [createVNode(_components.code, {
          children: "draft"
        }), " 不是 ", createVNode(_components.code, {
          children: "true"
        })]
      }), "\n"]
    }), "\n", createVNode(_components.h3, {
      id: "layout-slides-不生效",
      children: "layout: slides 不生效？"
    }), "\n", createVNode(_components.p, {
      children: "确保："
    }), "\n", createVNode(_components.ol, {
      children: ["\n", createVNode(_components.li, {
        children: ["文件在 ", createVNode(_components.code, {
          children: "content/posts/"
        }), " 目录下"]
      }), "\n", createVNode(_components.li, {
        children: ["frontmatter 中 ", createVNode(_components.code, {
          children: "layout: slides"
        }), " 正确设置"]
      }), "\n", createVNode(_components.li, {
        children: "重启开发服务器清理缓存"
      }), "\n"]
    }), "\n", createVNode(_components.h3, {
      id: "代码高亮不工作",
      children: "代码高亮不工作？"
    }), "\n", createVNode(_components.p, {
      children: "确保代码块指定了语言："
    }), "\n", createVNode(_components.pre, {
      class: "astro-code github-dark",
      style: {
        backgroundColor: "#24292e",
        color: "#e1e4e8",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "markdown",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "```javascript"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "// 正确：指定语言"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "const x = 1;"
          })
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#E1E4E8"
            },
            children: "```"
          })
        })]
      })
    }), "\n", createVNode(_components.h3, {
      id: "数学公式不渲染",
      children: "数学公式不渲染？"
    }), "\n", createVNode(_components.p, {
      children: "使用正确的 LaTeX 语法："
    }), "\n", createVNode(_components.ul, {
      children: ["\n", createVNode(_components.li, {
        children: ["行内：", createVNode(_components.code, {
          children: "$E = mc^2$"
        })]
      }), "\n", createVNode(_components.li, {
        children: ["块级：", createVNode(_components.code, {
          children: "$$公式$$"
        })]
      }), "\n"]
    }), "\n", createVNode(_components.h2, {
      id: "相关示例",
      children: "相关示例"
    }), "\n", createVNode(_components.ul, {
      children: ["\n", createVNode(_components.li, {
        children: [createVNode(_components.a, {
          href: "/slides/demo",
          children: "独立幻灯片示例"
        }), " - 查看 ", createVNode(_components.code, {
          children: "content/slides/demo.md"
        })]
      }), "\n", createVNode(_components.li, {
        children: [createVNode(_components.a, {
          href: "/posts/test/test-slides",
          children: "文章内幻灯片"
        }), " - 查看 ", createVNode(_components.code, {
          children: "content/posts/test/test-slides.md"
        })]
      }), "\n"]
    }), "\n", createVNode(_components.h2, {
      id: "下一步",
      children: "下一步"
    }), "\n", createVNode(_components.ul, {
      children: ["\n", createVNode(_components.li, {
        children: ["阅读 ", createVNode(_components.a, {
          href: "https://revealjs.com/",
          children: "Reveal.js 官方文档"
        }), " 了解更多高级功能"]
      }), "\n", createVNode(_components.li, {
        children: ["查看 ", createVNode(_components.a, {
          href: "/posts/blog_docs/03-markdown-basic",
          children: "Markdown 基础"
        }), " 复习语法"]
      }), "\n", createVNode(_components.li, {
        children: ["了解 ", createVNode(_components.a, {
          href: "/posts/blog_docs/05-code-blocks",
          children: "代码块"
        }), " 使用技巧"]
      }), "\n"]
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

const url = "content/posts/blog_docs/12-slides.mdx";
const file = "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/content/posts/blog_docs/12-slides.mdx";
const Content = (props = {}) => MDXContent({
  ...props,
  components: { Fragment: Fragment, ...props.components, },
});
Content[Symbol.for('mdx-component')] = true;
Content[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter.layout);
Content.moduleId = "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/content/posts/blog_docs/12-slides.mdx";
__astro_tag_component__(Content, 'astro:jsx');

export { Content, Content as default, file, frontmatter, getHeadings, url };
