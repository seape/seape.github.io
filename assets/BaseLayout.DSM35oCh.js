import { c as createAstro, a as createComponent, b as renderTemplate, e as renderScript, g as renderSlot, h as renderHead, d as addAttribute } from './astro/server.CsXMQSOf.js';
import 'piccolore';
import 'clsx';
import { d as defaultSEO, s as siteConfig } from './site.M5jgWNmC.js';
/* empty css                        */
import fs from 'node:fs';
import path from 'node:path';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://jet-w.github.io");
const $$BaseLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title = defaultSEO.title,
    description = defaultSEO.description,
    image = defaultSEO.image,
    type = "website",
    publishedTime,
    modifiedTime,
    tags
  } = Astro2.props;
  const canonicalURL = new URL(Astro2.url.pathname, Astro2.site);
  const fullTitle = title === siteConfig.title ? title : `${title} | ${siteConfig.title}`;
  const fullImage = new URL(image, Astro2.site);
  const publicDir = path.join(process.cwd(), "public");
  const faviconSvgExists = fs.existsSync(path.join(publicDir, "favicon.svg"));
  const faviconIcoExists = fs.existsSync(path.join(publicDir, "favicon.ico"));
  const faviconHref = faviconSvgExists ? "/favicon.svg" : faviconIcoExists ? "/favicon.ico" : siteConfig.avatar;
  const faviconType = faviconSvgExists ? "image/svg+xml" : faviconIcoExists ? "image/x-icon" : "image/jpeg";
  return renderTemplate(_a || (_a = __template(['<html lang="zh-CN" class="scroll-smooth"> <head><meta charset="UTF-8"><meta name="description"', '><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon"', "", '><meta name="generator"', "><!-- SEO --><title>", '</title><link rel="canonical"', '><!-- Open Graph --><meta property="og:type"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:url"', '><meta property="og:image"', '><meta property="og:site_name"', ">", "", "", '<!-- Twitter --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"', '><meta name="twitter:description"', '><meta name="twitter:image"', '><!-- RSS --><link rel="alternate" type="application/rss+xml"', ` href="/rss.xml"><!-- \u9884\u52A0\u8F7D\u5173\u952E\u8D44\u6E90 --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><!-- \u56FE\u6807\u5E93 --><!-- Font Awesome --><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous"><!-- Material Icons --><link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round"><!-- Bootstrap Icons --><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"><!-- Remix Icon --><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css"><!-- KaTeX for LaTeX math rendering --><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous"><!-- Ionicons --><script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"><\/script><!-- \u4E3B\u9898\u68C0\u6D4B\u811A\u672C --><script>
      // \u5728\u9875\u9762\u52A0\u8F7D\u524D\u68C0\u6D4B\u4E3B\u9898\uFF0C\u907F\u514D\u95EA\u70C1
      // \u9ED8\u8BA4\u4F7F\u7528\u6DF1\u8272\u6A21\u5F0F
      const theme = (() => {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
          return localStorage.getItem('theme');
        }
        // \u9ED8\u8BA4\u6DF1\u8272\u6A21\u5F0F\uFF0C\u9664\u975E\u7528\u6237\u7CFB\u7EDF\u504F\u597D\u6D45\u8272
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          return 'light';
        }
        return 'dark';
      })();

      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
      window.__theme = theme;
    <\/script>`, '</head> <body class="min-h-screen"> <div id="app" class="flex flex-col min-h-screen"> ', ' </div> <!-- Mermaid \u5BB9\u5668\u6E32\u67D3 --> <script src="/js/mermaid-container.js"><\/script> <!-- Tabs \u7EC4\u4EF6\u521D\u59CB\u5316 --> <script src="/js/tabs-init.js"><\/script> <!-- \u5168\u5C40\u811A\u672C --> ', " </body> </html>"])), addAttribute(description, "content"), addAttribute(faviconType, "type"), addAttribute(faviconHref, "href"), addAttribute(Astro2.generator, "content"), fullTitle, addAttribute(canonicalURL, "href"), addAttribute(type, "content"), addAttribute(fullTitle, "content"), addAttribute(description, "content"), addAttribute(canonicalURL, "content"), addAttribute(fullImage, "content"), addAttribute(siteConfig.title, "content"), publishedTime && renderTemplate`<meta property="article:published_time"${addAttribute(publishedTime, "content")}>`, modifiedTime && renderTemplate`<meta property="article:modified_time"${addAttribute(modifiedTime, "content")}>`, tags && tags.map((tag) => renderTemplate`<meta property="article:tag"${addAttribute(tag, "content")}>`), addAttribute(fullTitle, "content"), addAttribute(description, "content"), addAttribute(fullImage, "content"), addAttribute(siteConfig.title, "title"), renderHead(), renderSlot($$result, $$slots["default"]), renderScript($$result, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts"));
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
