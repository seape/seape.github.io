import { c as createAstro, a as createComponent, b as renderTemplate, f as defineScriptVars, g as renderSlot, h as renderHead, d as addAttribute } from './astro/server.CsXMQSOf.js';
import 'piccolore';
import 'clsx';
import { s as siteConfig } from './site.CxBSWjpv.js';
/* empty css                        */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://jet-w.github.io");
const $$SlidesLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SlidesLayout;
  const {
    title,
    description = "",
    theme = "black",
    transition = "slide",
    controls = true,
    progress = true,
    center = true,
    hash = true,
    slideNumber = false,
    showBackButton = true
  } = Astro2.props;
  const fullTitle = `${title} | ${siteConfig.title}`;
  const revealConfig = JSON.stringify({
    hash,
    controls,
    progress,
    center,
    transition,
    slideNumber,
    // Markdown 配置
    markdown: {
      smartypants: true
    },
    // 插件配置
    plugins: ["RevealMarkdown", "RevealHighlight", "RevealNotes", "RevealMath"]
  });
  return renderTemplate(_a || (_a = __template(['<html lang="zh-CN" data-astro-cid-or65tpjo> <head><meta charset="UTF-8"><meta name="description"', '><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"', "><title>", '</title><!-- Open Graph --><meta property="og:type" content="article"><meta property="og:title"', '><meta property="og:description"', '><!-- Reveal.js CSS --><link rel="stylesheet" href="/slides/reveal.css"><link rel="stylesheet"', ' id="theme"><!-- Reveal.js \u4EE3\u7801\u9AD8\u4EAE\u4E3B\u9898 --><link rel="stylesheet" href="/slides/plugin/highlight/monokai.css"><!-- KaTeX for math --><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"><!-- Mermaid \u548C ECharts \u5728\u5E7B\u706F\u7247\u4E2D\u7684\u6837\u5F0F -->', '</head> <body data-astro-cid-or65tpjo> <div class="reveal" data-astro-cid-or65tpjo> <div class="slides" data-astro-cid-or65tpjo> ', ` </div> </div> <!-- \u8FD4\u56DE\u6309\u94AE\uFF08\u4EC5\u5728\u72EC\u7ACB\u9875\u9762\u663E\u793A\uFF0C\u5D4C\u5165\u6A21\u5F0F\u901A\u8FC7 JS \u9690\u85CF\uFF09 --> <a href="#" class="slides-back-btn" id="slides-back-btn" title="\u8FD4\u56DE\u4E0A\u4E00\u7EA7" data-astro-cid-or65tpjo> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-or65tpjo> <path d="M19 12H5M12 19l-7-7 7-7" data-astro-cid-or65tpjo></path> </svg> </a> <!-- \u68C0\u6D4B\u5D4C\u5165\u6A21\u5F0F\u5E76\u9690\u85CF\u8FD4\u56DE\u6309\u94AE\uFF0C\u8BBE\u7F6E\u8FD4\u56DE\u94FE\u63A5\u4E3A\u7236\u8DEF\u5F84 --> <script>
      (function() {
        var btn = document.getElementById('slides-back-btn');
        if (!btn) return;

        // \u68C0\u67E5\u662F\u5426\u5728 iframe \u4E2D\u6216 URL \u5305\u542B embed=true
        var isEmbed = window.self !== window.top ||
                      window.location.search.indexOf('embed=true') !== -1;
        if (isEmbed) {
          btn.style.display = 'none';
          return;
        }

        // \u8BBE\u7F6E\u8FD4\u56DE\u94FE\u63A5\u4E3A\u7236\u8DEF\u5F84
        var path = window.location.pathname;
        // \u79FB\u9664\u672B\u5C3E\u7684\u659C\u6760
        if (path.endsWith('/')) {
          path = path.slice(0, -1);
        }
        // \u83B7\u53D6\u7236\u8DEF\u5F84
        var parentPath = path.substring(0, path.lastIndexOf('/'));
        // \u5982\u679C\u7236\u8DEF\u5F84\u4E3A\u7A7A\uFF0C\u8FD4\u56DE\u9996\u9875
        btn.href = parentPath || '/';
      })();
    <\/script> <!-- Reveal.js --> <script src="/slides/reveal.js"><\/script> <script src="/slides/plugin/markdown/markdown.js"><\/script> <script src="/slides/plugin/highlight/highlight.js"><\/script> <script src="/slides/plugin/notes/notes.js"><\/script> <script src="/slides/plugin/math/math.js"><\/script> <!-- Mermaid --> <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"><\/script> <!-- ECharts --> <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"><\/script> <!-- \u521D\u59CB\u5316 Reveal.js --> <script>(function(){`, "\n      document.addEventListener('DOMContentLoaded', function() {\n        const config = JSON.parse(revealConfig);\n\n        Reveal.initialize({\n          hash: config.hash,\n          controls: config.controls,\n          progress: config.progress,\n          center: config.center,\n          transition: config.transition,\n          slideNumber: config.slideNumber,\n\n          // Markdown \u914D\u7F6E\n          markdown: config.markdown,\n\n          // \u6570\u5B66\u516C\u5F0F\u914D\u7F6E\n          math: {\n            mathjax: null,\n            katex: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',\n            katexScript: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js',\n          },\n\n          // \u63D2\u4EF6\n          plugins: [RevealMarkdown, RevealHighlight, RevealNotes, RevealMath.KaTeX]\n        }).then(function() {\n          // Reveal.js \u521D\u59CB\u5316\u5B8C\u6210\u540E\uFF0C\u6E32\u67D3 Mermaid \u548C ECharts\n          var mermaidContainers = [];\n          var echartsInstances = [];\n\n          // \u521D\u59CB\u5316 Mermaid\n          if (typeof mermaid !== 'undefined') {\n            mermaid.initialize({\n              startOnLoad: false,\n              theme: 'default',\n              securityLevel: 'loose'\n            });\n\n            // \u67E5\u627E\u6240\u6709 mermaid \u4EE3\u7801\u5757\u5E76\u51C6\u5907\u5BB9\u5668\n            document.querySelectorAll('pre code.language-mermaid, pre code.mermaid').forEach(function(block, index) {\n              var code = block.textContent;\n              var container = document.createElement('div');\n              container.className = 'mermaid';\n              container.id = 'mermaid-slide-' + index;\n              container.setAttribute('data-mermaid-code', code);\n              container.style.minHeight = '100px';\n\n              // \u66FF\u6362\u4EE3\u7801\u5757\n              var pre = block.parentElement;\n              pre.parentElement.insertBefore(container, pre);\n              pre.style.display = 'none';\n\n              mermaidContainers.push({\n                container: container,\n                code: code,\n                rendered: false\n              });\n            });\n\n            // \u6E32\u67D3\u5F53\u524D\u53EF\u89C1\u5E7B\u706F\u7247\u4E2D\u7684 Mermaid\n            async function renderVisibleMermaid() {\n              var needsLayout = false;\n\n              mermaidContainers.forEach(function(item) {\n                if (item.rendered) return;\n\n                var section = item.container.closest('section');\n                if (section && (section.classList.contains('present') || section.closest('.present'))) {\n                  item.container.textContent = item.code;\n                  item.rendered = true;\n                  needsLayout = true;\n                }\n              });\n\n              // \u6E32\u67D3\u6240\u6709\u5DF2\u6807\u8BB0\u7684 Mermaid\n              var toRender = mermaidContainers.filter(function(item) {\n                return item.rendered && item.container.textContent;\n              }).map(function(item) {\n                return item.container;\n              });\n\n              if (toRender.length > 0) {\n                try {\n                  await mermaid.run({ nodes: toRender });\n                  // Mermaid \u6E32\u67D3\u5B8C\u6210\u540E\uFF0C\u901A\u77E5 Reveal.js \u91CD\u65B0\u8BA1\u7B97\u5E03\u5C40\n                  if (needsLayout) {\n                    Reveal.layout();\n                  }\n                } catch(e) {\n                  console.warn('Mermaid render warning:', e);\n                }\n              }\n            }\n\n            // \u521D\u59CB\u6E32\u67D3 - \u4F7F\u7528\u66F4\u957F\u7684\u5EF6\u8FDF\u786E\u4FDD Reveal.js \u5B8C\u5168\u521D\u59CB\u5316\n            setTimeout(renderVisibleMermaid, 200);\n\n            // \u5E7B\u706F\u7247\u5207\u6362\u65F6\u6E32\u67D3\n            Reveal.on('slidechanged', function() {\n              setTimeout(renderVisibleMermaid, 50);\n            });\n          }\n\n          // \u521D\u59CB\u5316 ECharts\n          if (typeof echarts !== 'undefined') {\n            document.querySelectorAll('pre code.language-echarts, pre code.echarts').forEach(function(block, index) {\n              try {\n                var code = block.textContent.trim();\n                var option = JSON.parse(code);\n\n                // \u521B\u5EFA ECharts \u5BB9\u5668\n                var container = document.createElement('div');\n                container.className = 'echarts-container';\n                container.id = 'echarts-slide-' + index;\n                container.style.height = '400px';\n                container.style.width = '100%';\n\n                // \u66FF\u6362\u4EE3\u7801\u5757\n                var pre = block.parentElement;\n                pre.parentElement.insertBefore(container, pre);\n                pre.style.display = 'none';\n\n                echartsInstances.push({\n                  container: container,\n                  option: option,\n                  chart: null,\n                  initialized: false\n                });\n              } catch (e) {\n                console.error('ECharts parsing error:', e);\n              }\n            });\n\n            // \u6E32\u67D3\u5F53\u524D\u53EF\u89C1\u5E7B\u706F\u7247\u4E2D\u7684 ECharts\n            function renderVisibleEcharts() {\n              echartsInstances.forEach(function(item) {\n                var section = item.container.closest('section');\n                var isVisible = section && (section.classList.contains('present') || section.closest('.present'));\n\n                if (isVisible) {\n                  if (!item.initialized) {\n                    item.chart = echarts.init(item.container);\n                    item.chart.setOption(item.option);\n                    item.initialized = true;\n                  } else if (item.chart) {\n                    item.chart.resize();\n                  }\n                }\n              });\n            }\n\n            // \u521D\u59CB\u6E32\u67D3\n            setTimeout(renderVisibleEcharts, 100);\n\n            // \u5E7B\u706F\u7247\u5207\u6362\u65F6\u6E32\u67D3/\u8C03\u6574\u5927\u5C0F\n            Reveal.on('slidechanged', function() {\n              setTimeout(renderVisibleEcharts, 50);\n            });\n\n            // \u76D1\u542C\u7A97\u53E3\u5927\u5C0F\u53D8\u5316\n            window.addEventListener('resize', function() {\n              echartsInstances.forEach(function(item) {\n                if (item.chart) {\n                  item.chart.resize();\n                }\n              });\n            });\n          }\n\n        });\n      });\n    })();<\/script> </body> </html>"])), addAttribute(description, "content"), addAttribute(Astro2.generator, "content"), fullTitle, addAttribute(fullTitle, "content"), addAttribute(description, "content"), addAttribute(`/slides/theme/${theme}.css`, "href"), renderHead(), renderSlot($$result, $$slots["default"]), defineScriptVars({ revealConfig }));
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/layouts/SlidesLayout.astro", void 0);

export { $$SlidesLayout as $ };
