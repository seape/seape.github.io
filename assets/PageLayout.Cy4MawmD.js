import { c as createAstro, a as createComponent, m as maybeRenderHead, r as renderComponent, d as addAttribute, b as renderTemplate, e as renderScript, g as renderSlot } from './astro/server.CsXMQSOf.js';
import 'piccolore';
import { $ as $$BaseLayout } from './BaseLayout.D1HhaYqB.js';
import { s as siteConfig } from './site.CxBSWjpv.js';
import { defineComponent, useSSRContext, ref, onMounted, mergeProps, onUnmounted, watch } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderList, ssrInterpolate, ssrRenderTeleport, ssrRenderComponent, ssrRenderClass } from 'vue/server-renderer';
/* empty css                        */
import { _ as _export_sfc } from './plugin-vue_export-helper.pcqpp-6-.js';
import 'clsx';
import { g as getCollection } from './astro_content.aKWqVD7u.js';

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ThemeToggle",
  setup(__props, { expose: __expose }) {
    __expose();
    const isDark = ref(false);
    const toggleTheme = () => {
      isDark.value = !isDark.value;
      if (isDark.value) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    };
    onMounted(() => {
      const savedTheme = localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      isDark.value = savedTheme === "dark" || !savedTheme && systemPrefersDark;
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          isDark.value = e.matches;
          if (e.matches) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      });
    });
    const __returned__ = { isDark, toggleTheme };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<button${ssrRenderAttrs(mergeProps({
    class: "p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors",
    "aria-label": $setup.isDark ? "\u5207\u6362\u5230\u6D45\u8272\u6A21\u5F0F" : "\u5207\u6362\u5230\u6DF1\u8272\u6A21\u5F0F"
  }, _attrs))} data-v-80f0f4d3>`);
  if ($setup.isDark) {
    _push(`<svg class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-80f0f4d3><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" data-v-80f0f4d3></path></svg>`);
  } else {
    _push(`<svg class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-80f0f4d3><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" data-v-80f0f4d3></path></svg>`);
  }
  _push(`</button>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/ui/ThemeToggle.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const ThemeToggle = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender$3], ["__scopeId", "data-v-80f0f4d3"]]);

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "SearchBox",
  setup(__props, { expose: __expose }) {
    __expose();
    const searchQuery = ref("");
    const searchResults = ref([]);
    const showResults = ref(false);
    const searchIndex = ref([]);
    const isLoading = ref(false);
    const isLoaded = ref(false);
    const loadSearchIndex = async () => {
      if (isLoaded.value || isLoading.value) return;
      isLoading.value = true;
      try {
        const response = await fetch("/search-index.json");
        if (response.ok) {
          searchIndex.value = await response.json();
          isLoaded.value = true;
        }
      } catch (error) {
        console.error("Failed to load search index:", error);
      } finally {
        isLoading.value = false;
      }
    };
    const handleInput = async () => {
      if (!isLoaded.value) {
        await loadSearchIndex();
      }
      if (searchQuery.value.length === 0) {
        searchResults.value = [];
        return;
      }
      const query = searchQuery.value.toLowerCase();
      searchResults.value = searchIndex.value.filter(
        (item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query) || item.content.toLowerCase().includes(query) || item.tags.some((tag) => tag.toLowerCase().includes(query))
      ).slice(0, 8);
    };
    const handleFocus = async () => {
      showResults.value = true;
      if (!isLoaded.value) {
        await loadSearchIndex();
      }
    };
    const handleBlur = () => {
      setTimeout(() => {
        showResults.value = false;
      }, 200);
    };
    const handleResultClick = () => {
      showResults.value = false;
      searchQuery.value = "";
      searchResults.value = [];
    };
    const highlightText = (text) => {
      if (!searchQuery.value || !text) return text || "";
      try {
        const escapedQuery = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${escapedQuery})`, "gi");
        return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
      } catch {
        return text;
      }
    };
    onMounted(() => {
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
          e.preventDefault();
          const input = document.querySelector('input[placeholder="\u641C\u7D22\u6587\u7AE0..."]');
          if (input) {
            input.focus();
          }
        }
      });
    });
    const __returned__ = { searchQuery, searchResults, showResults, searchIndex, isLoading, isLoaded, loadSearchIndex, handleInput, handleFocus, handleBlur, handleResultClick, highlightText };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative" }, _attrs))} data-v-26639f78><div class="relative" data-v-26639f78><input${ssrRenderAttr("value", $setup.searchQuery)} type="text" placeholder="\u641C\u7D22\u6587\u7AE0..." class="w-64 pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" data-v-26639f78><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-v-26639f78><svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-26639f78><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-v-26639f78></path></svg></div></div>`);
  if ($setup.showResults && ($setup.searchResults.length > 0 || $setup.searchQuery.length > 0)) {
    _push(`<div class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto" data-v-26639f78>`);
    if ($setup.searchResults.length === 0 && $setup.searchQuery.length > 0) {
      _push(`<div class="p-4 text-center text-slate-500 dark:text-slate-400" data-v-26639f78> \u6CA1\u6709\u627E\u5230\u76F8\u5173\u6587\u7AE0 </div>`);
    } else {
      _push(`<div class="py-2" data-v-26639f78><!--[-->`);
      ssrRenderList($setup.searchResults, (result) => {
        _push(`<a${ssrRenderAttr("href", result.url)} class="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0" data-v-26639f78><h4 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1" data-v-26639f78>${$setup.highlightText(result.title) ?? ""}</h4><p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2" data-v-26639f78>${$setup.highlightText(result.description) ?? ""}</p><div class="flex flex-wrap gap-1 mt-2" data-v-26639f78><!--[-->`);
        ssrRenderList(result.tags.slice(0, 3), (tag) => {
          _push(`<span class="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full" data-v-26639f78>${ssrInterpolate(tag)}</span>`);
        });
        _push(`<!--]--></div></a>`);
      });
      _push(`<!--]--></div>`);
    }
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/ui/SearchBox.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const SearchBox = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender$2], ["__scopeId", "data-v-26639f78"]]);

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "MobileMenu",
  props: {
    navigation: {}
  },
  setup(__props, { expose: __expose }) {
    __expose();
    const props = __props;
    const isOpen = ref(false);
    const currentPath = ref("");
    const isMounted = ref(false);
    const isActive = (href) => {
      return currentPath.value === href || href !== "/" && currentPath.value.startsWith(href);
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        isOpen.value = false;
      }
    };
    onMounted(() => {
      isMounted.value = true;
      currentPath.value = window.location.pathname;
      document.addEventListener("keydown", handleEscape);
      window.addEventListener("popstate", () => {
        currentPath.value = window.location.pathname;
      });
    });
    onUnmounted(() => {
      document.removeEventListener("keydown", handleEscape);
    });
    const __returned__ = { props, isOpen, currentPath, isMounted, isActive, handleEscape, SearchBox, ThemeToggle };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)} data-v-8bfa2f99><button class="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors" aria-label="\u83DC\u5355" data-v-8bfa2f99>`);
  if (!$setup.isOpen) {
    _push(`<svg class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8bfa2f99><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" data-v-8bfa2f99></path></svg>`);
  } else {
    _push(`<svg class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8bfa2f99><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-8bfa2f99></path></svg>`);
  }
  _push(`</button>`);
  if ($setup.isMounted) {
    ssrRenderTeleport(_push, (_push2) => {
      if ($setup.isOpen) {
        _push2(`<div class="mobile-menu-overlay" data-v-8bfa2f99></div>`);
      } else {
        _push2(`<!---->`);
      }
      if ($setup.isOpen) {
        _push2(`<div class="mobile-menu-panel" data-v-8bfa2f99><div class="p-6" data-v-8bfa2f99><div class="flex items-center justify-between mb-8" data-v-8bfa2f99><h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100" data-v-8bfa2f99>\u83DC\u5355</h2><button class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" data-v-8bfa2f99><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8bfa2f99><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-8bfa2f99></path></svg></button></div><div class="mb-8 sm:hidden" data-v-8bfa2f99>`);
        _push2(ssrRenderComponent($setup["SearchBox"], null, null, _parent));
        _push2(`</div><nav class="space-y-2" data-v-8bfa2f99><!--[-->`);
        ssrRenderList($props.navigation, (item) => {
          _push2(`<a${ssrRenderAttr("href", item.href)} class="${ssrRenderClass([{ "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400": $setup.isActive(item.href) }, "flex items-center px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"])}" data-v-8bfa2f99><span class="font-medium" data-v-8bfa2f99>${ssrInterpolate(item.name)}</span></a>`);
        });
        _push2(`<!--]--></nav><hr class="my-8 border-slate-200 dark:border-slate-700" data-v-8bfa2f99><div class="space-y-4" data-v-8bfa2f99><div class="flex items-center justify-between" data-v-8bfa2f99><span class="text-sm font-medium text-slate-700 dark:text-slate-300" data-v-8bfa2f99>\u6DF1\u8272\u6A21\u5F0F</span>`);
        _push2(ssrRenderComponent($setup["ThemeToggle"], null, null, _parent));
        _push2(`</div></div></div></div>`);
      } else {
        _push2(`<!---->`);
      }
    }, "body", false, _parent);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/ui/MobileMenu.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const MobileMenu = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-8bfa2f99"]]);

const $$Astro$3 = createAstro("https://jet-w.github.io");
const $$Header = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Header;
  const currentPath = Astro2.url.pathname;
  return renderTemplate`${maybeRenderHead()}<header class="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700"> <div class="container mx-auto px-4"> <nav class="flex items-center justify-between h-16"> <!-- Logo 和站点名称 --> <div class="flex items-center space-x-4"> <a href="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity"> ${renderTemplate`<img${addAttribute(siteConfig.avatar, "src")}${addAttribute(siteConfig.title, "alt")} class="w-8 h-8 rounded-full">`} <div class="hidden sm:block"> <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100"> ${siteConfig.title} </h1> <p class="text-xs text-slate-600 dark:text-slate-400 -mt-1">
技术博客
</p> </div> </a> </div> <!-- 桌面端导航 --> <div class="hidden md:flex items-center space-x-8"> ${siteConfig.menu.map((item) => renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute(`text-sm font-medium transition-colors hover:text-primary-500 ${currentPath === item.href || item.href !== "/" && currentPath.startsWith(item.href) ? "text-primary-500" : "text-slate-700 dark:text-slate-300"}`, "class")}> ${item.name} </a>`)} </div> <!-- 右侧功能区 --> <div class="flex items-center"> <!-- 搜索框 --> <div class="hidden sm:block mr-2"> ${renderComponent($$result, "SearchBox", SearchBox, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/ui/SearchBox.vue", "client:component-export": "default" })} </div> <div class="hidden sm:block mr-2"> <!-- 主题切换 --> ${renderComponent($$result, "ThemeToggle", ThemeToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/ui/ThemeToggle.vue", "client:component-export": "default" })} </div> <!-- 移动端菜单 --> <div class="md:hidden"> ${renderComponent($$result, "MobileMenu", MobileMenu, { "client:load": true, "navigation": siteConfig.menu, "client:component-hydration": "load", "client:component-path": "@/components/ui/MobileMenu.vue", "client:component-export": "default" })} </div> </div> </nav> </div> </header>`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/layout/Header.astro", void 0);

const sidebarConfig = {
  recentPostsCount: 5,
  popularTagsCount: 8,
  archivesCount: 6,
  showFriendLinks: false,
  groups: [
    // 分隔符
    { type: "divider", title: "技术内容" },
    // 扫描技术文档目录
    {
      type: "scan",
      title: "PTE",
      icon: "ri:folder-3-line",
      scanPath: "PTE",
      collapsed: true,
      showForPaths: ["/posts/PTE/**"]
    }
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

const defaultIcons = {
  github: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z",
  twitter: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  email: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  discord: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z",
  weibo: "M16.074 8.756c.192-.603.104-1.14-.26-1.604-.358-.457-.887-.682-1.582-.682-1.15 0-2.438.652-3.83 1.94-1.041.963-1.908 2.05-2.591 3.252-.683 1.2-1.027 2.323-1.027 3.37 0 .963.314 1.724.936 2.291.621.566 1.46.852 2.522.852 1.41 0 2.938-.47 4.584-1.406 1.233-.7 2.26-1.566 3.08-2.594.82-1.028 1.23-2.008 1.23-2.937 0-.553-.18-.988-.54-1.311-.36-.322-.84-.484-1.44-.484-.264 0-.523.036-.778.104l-.09.024c-.12.037-.204.061-.254.079a.608.608 0 01-.196.033c-.192 0-.324-.091-.396-.274a.603.603 0 01-.036-.276c.024-.146.091-.281.204-.408l.056-.064.204-.243c.492-.575.739-1.123.739-1.642z",
  zhihu: "M5.721 0C2.251 0 0 2.25 0 5.719V18.28C0 21.751 2.252 24 5.721 24h12.56C21.751 24 24 21.75 24 18.281V5.72C24 2.249 21.75 0 18.281 0z"
};
const socialLinks = [
  { type: "github", url: "https://github.com/seape", label: "GitHub" }
  // { type: 'twitter', url: 'https://twitter.com/haiyue', label: 'Twitter' },
  // { type: 'linkedin', url: 'https://www.linkedin.com/in/haiyue-wang-9b5410103/', label: 'LinkedIn' },
  // { type: 'email', url: 'mailto:unisa.dady@gmail.com', label: 'Email' }
];

const footerConfig = {
  quickLinksTitle: "快速链接",
  quickLinks: [
    { name: "首页", href: "/" },
    { name: "文章", href: "/posts" },
    { name: "标签", href: "/tags" },
    { name: "分类", href: "/categories" },
    { name: "归档", href: "/archives" },
    { name: "关于", href: "/about" }
  ],
  contactTitle: "联系方式",
  socialLinks,
  rssUrl: "/rss.xml",
  copyright: "© {year} {author}. All rights reserved.",
  poweredBy: {
    text: "Astro",
    url: "https://astro.build"
  }
};

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  function getIcon(link) {
    return link.icon || defaultIcons[link.type] || "";
  }
  const copyright = footerConfig.copyright.replace("{year}", String(currentYear)).replace("{author}", siteConfig.author);
  return renderTemplate`${maybeRenderHead()}<footer class="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto"> <div class="container mx-auto px-4 py-6"> <div class="grid grid-cols-1 md:grid-cols-3 gap-6"> <!-- 站点信息 --> <div> <div class="flex items-center space-x-3 mb-3"> ${renderTemplate`<img${addAttribute(siteConfig.avatar, "src")}${addAttribute(siteConfig.title, "alt")} class="w-8 h-8 rounded-full">`} <div> <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100"> ${siteConfig.title} </h3> <p class="text-xs text-slate-600 dark:text-slate-400"> ${siteConfig.description} </p> </div> </div> </div> <!-- 快速链接 --> <div> <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3"> ${footerConfig.quickLinksTitle} </h4> <div class="flex flex-wrap gap-x-4 gap-y-1"> ${footerConfig.quickLinks.map((item) => renderTemplate`<a${addAttribute(item.href, "href")} class="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors"> ${item.name} </a>`)} </div> </div> <!-- 社交链接 --> <div> <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3"> ${footerConfig.contactTitle} </h4> <div class="flex space-x-4"> ${footerConfig.socialLinks.map((link) => renderTemplate`<a${addAttribute(link.url, "href")}${addAttribute(link.type === "email" ? void 0 : "_blank", "target")}${addAttribute(link.type === "email" ? void 0 : "noopener noreferrer", "rel")} class="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors"${addAttribute(link.label || link.type, "aria-label")}> <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"> <path${addAttribute(getIcon(link), "d")}></path> </svg> </a>`)} ${renderTemplate`<a${addAttribute(footerConfig.rssUrl, "href")} class="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors" aria-label="RSS订阅"> <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"> <path d="M3.429 2.486c9.36 0 16.943 7.583 16.943 16.943h-3.257c0-7.563-6.123-13.686-13.686-13.686V2.486zM3.429 9.114c5.647 0 10.229 4.581 10.229 10.229h-3.257c0-3.844-3.128-6.972-6.972-6.972V9.114zM6.686 16.486c0 1.8-1.457 3.257-3.257 3.257S0.172 18.286 0.172 16.486s1.457-3.257 3.257-3.257 3.257 1.457 3.257 3.257z"></path> </svg> </a>`} </div> </div> </div> <!-- 版权信息 --> <div class="border-t border-slate-200 dark:border-slate-700 pt-4 mt-6"> <div class="flex flex-col sm:flex-row justify-between items-center text-sm text-slate-600 dark:text-slate-400"> <p>${copyright}</p> <p class="mt-2 sm:mt-0">
Powered by <a${addAttribute(footerConfig.poweredBy.url, "href")} class="link" target="_blank" rel="noopener noreferrer">${footerConfig.poweredBy.text}</a> </p> </div> </div> </div> </footer>`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/layout/Footer.astro", void 0);

const $$Astro$2 = createAstro("https://jet-w.github.io");
const $$Icon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Icon;
  const { icon, class: className = "", size = "1em" } = Astro2.props;
  function parseIcon(iconStr) {
    if (!iconStr) return { type: "none", value: "" };
    const hasPrefix = /^[a-z-]+:/i.test(iconStr);
    if (!hasPrefix) {
      const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(iconStr);
      if (isEmoji) {
        return { type: "emoji", value: iconStr };
      }
      return { type: "fa", style: "solid", value: iconStr };
    }
    const [prefix, ...rest] = iconStr.split(":");
    const value = rest.join(":");
    switch (prefix.toLowerCase()) {
      // Font Awesome
      case "fa":
        return { type: "fa", style: "solid", value };
      case "fa-solid":
      case "fas":
        return { type: "fa", style: "solid", value };
      case "fa-regular":
      case "far":
        return { type: "fa", style: "regular", value };
      case "fa-brands":
      case "fab":
        return { type: "fa", style: "brands", value };
      case "fa-light":
      case "fal":
        return { type: "fa", style: "light", value };
      case "fa-thin":
      case "fat":
        return { type: "fa", style: "thin", value };
      case "fa-duotone":
      case "fad":
        return { type: "fa", style: "duotone", value };
      // Material Icons
      case "mi":
      case "material":
        return { type: "material", style: "filled", value };
      case "mi-outlined":
      case "material-outlined":
        return { type: "material", style: "outlined", value };
      case "mi-round":
      case "material-round":
        return { type: "material", style: "round", value };
      // Bootstrap Icons
      case "bi":
      case "bootstrap":
        return { type: "bootstrap", value };
      // Remix Icon
      case "ri":
      case "remix":
        return { type: "remix", value };
      // Ionicons
      case "ion":
      case "ionicon":
        return { type: "ionicon", value };
      default:
        return { type: "emoji", value: iconStr };
    }
  }
  const parsed = parseIcon(icon);
  return renderTemplate`${parsed.type === "emoji" && renderTemplate`${maybeRenderHead()}<span${addAttribute(["icon-emoji", className], "class:list")}${addAttribute(`font-size: ${size};`, "style")} data-astro-cid-4ckhetd2>${parsed.value}</span>`}${parsed.type === "fa" && renderTemplate`<i${addAttribute([`fa-${parsed.style}`, `fa-${parsed.value}`, className], "class:list")}${addAttribute(`font-size: ${size};`, "style")} data-astro-cid-4ckhetd2></i>`}${parsed.type === "material" && parsed.style === "filled" && renderTemplate`<span${addAttribute(["material-icons", className], "class:list")}${addAttribute(`font-size: ${size};`, "style")} data-astro-cid-4ckhetd2>${parsed.value}</span>`}${parsed.type === "material" && parsed.style === "outlined" && renderTemplate`<span${addAttribute(["material-icons-outlined", className], "class:list")}${addAttribute(`font-size: ${size};`, "style")} data-astro-cid-4ckhetd2>${parsed.value}</span>`}${parsed.type === "material" && parsed.style === "round" && renderTemplate`<span${addAttribute(["material-icons-round", className], "class:list")}${addAttribute(`font-size: ${size};`, "style")} data-astro-cid-4ckhetd2>${parsed.value}</span>`}${parsed.type === "bootstrap" && renderTemplate`<i${addAttribute(["bi", `bi-${parsed.value}`, className], "class:list")}${addAttribute(`font-size: ${size};`, "style")} data-astro-cid-4ckhetd2></i>`}${parsed.type === "remix" && renderTemplate`<i${addAttribute([`ri-${parsed.value}`, className], "class:list")}${addAttribute(`font-size: ${size};`, "style")} data-astro-cid-4ckhetd2></i>`}${parsed.type === "ionicon" && renderTemplate`${renderComponent($$result, "ion-icon", "ion-icon", { "name": parsed.value, "class": className, "style": `font-size: ${size};`, "data-astro-cid-4ckhetd2": true })}`}`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/ui/Icon.astro", void 0);

function buildTreeFromPosts(posts, scanPath = "", options = {}) {
  const { maxDepth, exclude = [], include = [], sortBy = "name", sortOrder = "asc" } = options;
  const filteredPosts = posts.filter((post) => {
    const postPath = post.id.toLowerCase();
    const targetPath = scanPath.toLowerCase();
    if (targetPath && !postPath.startsWith(targetPath + "/") && postPath !== targetPath) {
      return false;
    }
    const pathParts = post.id.split("/");
    for (const part of pathParts) {
      if (exclude.some((pattern) => matchPattern(part, pattern))) {
        return false;
      }
    }
    if (include.length > 0) {
      const matchesInclude = pathParts.some(
        (part) => include.some((pattern) => matchPattern(part, pattern))
      );
      if (!matchesInclude) {
        return false;
      }
    }
    return true;
  });
  const folderTitles = {};
  const folderIcons = {};
  filteredPosts.forEach((post) => {
    const pathParts = post.id.split("/");
    const fileName = pathParts[pathParts.length - 1].toLowerCase();
    if (fileName === "readme" || fileName === "readme.md") {
      const folderPath = pathParts.slice(0, -1).join("/");
      if (folderPath) {
        if (post.data.title) {
          folderTitles[folderPath] = post.data.title;
        }
        if (post.data.icon) {
          folderIcons[folderPath] = post.data.icon;
        }
      }
    }
  });
  const tree = [];
  filteredPosts.forEach((post) => {
    let relativePath = post.id;
    if (scanPath) {
      const scanPathLower = scanPath.toLowerCase();
      const postIdLower = post.id.toLowerCase();
      if (postIdLower.startsWith(scanPathLower + "/")) {
        relativePath = post.id.slice(scanPath.length + 1);
      } else if (postIdLower === scanPathLower) {
        relativePath = post.id.split("/").pop() || post.id;
      }
    }
    const pathParts = relativePath.split("/");
    if (maxDepth !== void 0 && pathParts.length > maxDepth) {
      return;
    }
    let currentLevel = tree;
    pathParts.forEach((part, index) => {
      const isLast = index === pathParts.length - 1;
      const existing = currentLevel.find((n) => n.name.toLowerCase() === part.toLowerCase());
      const isReadme = isLast && (part.toLowerCase() === "readme" || part.toLowerCase() === "readme.md");
      if (existing) {
        if (isLast) {
          existing.slug = post.id;
          existing.title = post.data.title;
          existing.icon = post.data.icon;
          existing.isReadme = isReadme;
        } else {
          const folderPath = scanPath ? `${scanPath}/${pathParts.slice(0, index + 1).join("/")}` : pathParts.slice(0, index + 1).join("/");
          if (folderTitles[folderPath]) {
            existing.displayName = folderTitles[folderPath];
          }
          if (folderIcons[folderPath]) {
            existing.icon = folderIcons[folderPath];
          }
        }
        currentLevel = existing.children;
      } else {
        const folderPath = scanPath ? `${scanPath}/${pathParts.slice(0, index + 1).join("/")}` : pathParts.slice(0, index + 1).join("/");
        const newNode = {
          name: part,
          slug: isLast ? post.id : void 0,
          title: isLast ? post.data.title : void 0,
          displayName: isLast ? post.data.title : folderTitles[folderPath],
          icon: isLast ? post.data.icon : folderIcons[folderPath],
          children: [],
          isFolder: !isLast,
          isReadme
        };
        currentLevel.push(newNode);
        currentLevel = newNode.children;
      }
    });
  });
  return sortTree(tree, sortBy, sortOrder);
}
function sortTree(nodes, sortBy = "name", sortOrder = "asc") {
  const filtered = nodes.filter((node) => !node.isReadme);
  const sorted = filtered.sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    let comparison = 0;
    switch (sortBy) {
      case "title":
        comparison = (a.displayName || a.title || a.name).localeCompare(
          b.displayName || b.title || b.name,
          "zh-CN"
        );
        break;
      case "name":
      default:
        comparison = a.name.localeCompare(b.name, "zh-CN", { numeric: true });
        break;
    }
    return sortOrder === "desc" ? -comparison : comparison;
  });
  return sorted.map((node) => ({
    ...node,
    children: sortTree(node.children, sortBy, sortOrder)
  }));
}
function matchPattern(str, pattern) {
  if (pattern === "*") return true;
  if (pattern.includes("*")) {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$", "i");
    return regex.test(str);
  }
  return str.toLowerCase() === pattern.toLowerCase();
}
function matchPathPattern(currentPath, pattern) {
  const normalizedPath = currentPath.replace(/\/$/, "").toLowerCase();
  const normalizedPattern = pattern.replace(/\/$/, "").toLowerCase();
  if (normalizedPattern.endsWith("/**")) {
    const basePath = normalizedPattern.slice(0, -3);
    return normalizedPath === basePath || normalizedPath.startsWith(basePath + "/");
  }
  if (normalizedPattern.endsWith("/*")) {
    const basePath = normalizedPattern.slice(0, -2);
    if (normalizedPath === basePath) return true;
    if (normalizedPath.startsWith(basePath + "/")) {
      const remaining = normalizedPath.slice(basePath.length + 1);
      return !remaining.includes("/");
    }
    return false;
  }
  return normalizedPath === normalizedPattern;
}
function shouldShowGroup(group, currentPath) {
  if (!group.showForPaths && !group.hideForPaths) {
    return true;
  }
  if (group.hideForPaths && group.hideForPaths.length > 0) {
    for (const pattern of group.hideForPaths) {
      if (matchPathPattern(currentPath, pattern)) {
        return false;
      }
    }
  }
  if (group.showForPaths && group.showForPaths.length > 0) {
    for (const pattern of group.showForPaths) {
      if (matchPathPattern(currentPath, pattern)) {
        return true;
      }
    }
    return false;
  }
  return true;
}
function filterGroupsByPath(groups, currentPath) {
  return groups.filter((group) => shouldShowGroup(group, currentPath));
}
function manualItemsToTree(items) {
  return items.map((item) => ({
    name: item.title,
    slug: item.slug,
    title: item.title,
    displayName: item.title,
    icon: item.icon,
    badge: item.badge,
    badgeType: item.badgeType,
    link: item.link,
    children: item.children ? manualItemsToTree(item.children) : [],
    isFolder: !!(item.children && item.children.length > 0),
    collapsed: item.collapsed
  }));
}
async function processSidebarConfig(config, posts) {
  const processedGroups = [];
  for (const group of config.groups) {
    const processed = await processGroup(group, posts);
    if (processed) {
      processedGroups.push(processed);
    }
  }
  return processedGroups;
}
async function processGroup(group, posts) {
  switch (group.type) {
    case "scan": {
      const scanConfig = group;
      const tree = buildTreeFromPosts(posts, scanConfig.scanPath, {
        maxDepth: scanConfig.maxDepth,
        exclude: scanConfig.exclude,
        include: scanConfig.include,
        sortBy: scanConfig.sortBy,
        sortOrder: scanConfig.sortOrder
      });
      return {
        type: "tree",
        title: scanConfig.title,
        icon: scanConfig.icon,
        collapsed: scanConfig.collapsed,
        tree
      };
    }
    case "manual": {
      const manualConfig = group;
      const tree = manualItemsToTree(manualConfig.items);
      return {
        type: "tree",
        title: manualConfig.title,
        icon: manualConfig.icon,
        collapsed: manualConfig.collapsed,
        tree
      };
    }
    case "mixed": {
      const mixedConfig = group;
      const combinedTree = [];
      for (const section of mixedConfig.sections) {
        const processed = await processGroup(section, posts);
        if (processed && processed.tree) {
          combinedTree.push({
            name: section.title,
            displayName: section.title,
            icon: section.icon,
            children: processed.tree,
            isFolder: true,
            collapsed: section.collapsed
          });
        }
      }
      return {
        type: "tree",
        title: mixedConfig.title,
        icon: mixedConfig.icon,
        collapsed: mixedConfig.collapsed,
        tree: combinedTree
      };
    }
    case "divider": {
      return {
        type: "divider",
        title: group.title || ""
      };
    }
    default:
      return null;
  }
}
function getRecentPosts(posts, count = 5) {
  return posts.filter((p) => p.data.pubDate).sort((a, b) => (b.data.pubDate?.getTime() ?? 0) - (a.data.pubDate?.getTime() ?? 0)).slice(0, count);
}
function getPopularTags(posts, count = 8) {
  const tagCounts = {};
  posts.forEach((post) => {
    (post.data.tags || []).forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, count).map(([name, count2]) => ({
    name,
    count: count2,
    slug: name.toLowerCase().replace(/\s+/g, "-")
  }));
}
function getArchives(posts, count = 6) {
  const archiveMap = {};
  posts.forEach((post) => {
    if (post.data.pubDate) {
      const date = new Date(post.data.pubDate);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      archiveMap[key] = (archiveMap[key] || 0) + 1;
    }
  });
  return Object.entries(archiveMap).sort((a, b) => b[0].localeCompare(a[0])).slice(0, count).map(([key, count2]) => {
    const [year, month] = key.split("-").map(Number);
    return { year, month, count: count2 };
  });
}

const $$Astro$1 = createAstro("https://jet-w.github.io");
const $$Sidebar = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Sidebar;
  const { currentPath = Astro2.url.pathname } = Astro2.props;
  const allPosts = await getCollection("posts", ({ data }) => !data.draft);
  const filteredGroups = filterGroupsByPath(sidebarConfig.groups, currentPath);
  const filteredConfig = { groups: filteredGroups };
  const processedGroups = await processSidebarConfig(filteredConfig, allPosts);
  const recentPosts = getRecentPosts(allPosts, sidebarConfig.recentPostsCount) ;
  const popularTags = getPopularTags(allPosts, sidebarConfig.popularTagsCount) ;
  const archives = getArchives(allPosts, sidebarConfig.archivesCount) ;
  return renderTemplate`${maybeRenderHead()}<div class="space-y-8 p-6" data-astro-cid-k4cmclh2>  ${processedGroups.map((group) => group.type === "divider" ? renderTemplate`<div class="sidebar-divider" data-astro-cid-k4cmclh2> ${group.title && renderTemplate`<span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" data-astro-cid-k4cmclh2> ${group.title} </span>`} <div class="border-b border-slate-200 dark:border-slate-700 mt-2" data-astro-cid-k4cmclh2></div> </div>` : renderTemplate`<section class="doc-tree-section" data-astro-cid-k4cmclh2> <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2" data-astro-cid-k4cmclh2> ${group.icon ? renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "icon": group.icon, "size": "1.25em", "class": "text-primary-500", "data-astro-cid-k4cmclh2": true })}` : renderTemplate`<svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" data-astro-cid-k4cmclh2></path> </svg>`} ${group.title} </h3> <nav class="doc-tree text-sm"${addAttribute(group.collapsed, "data-collapsed")} data-astro-cid-k4cmclh2> <ul class="space-y-1" data-astro-cid-k4cmclh2> ${group.tree?.map((node) => renderTemplate`<li class="tree-node" data-astro-cid-k4cmclh2> ${node.isFolder ? renderTemplate`<div class="tree-folder" data-astro-cid-k4cmclh2> <button class="tree-folder-toggle w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"${addAttribute(node.name, "data-folder-name")}${addAttribute(node.collapsed, "data-default-collapsed")} data-astro-cid-k4cmclh2> <svg class="tree-chevron w-4 h-4 text-slate-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-astro-cid-k4cmclh2></path> </svg> ${node.icon ? renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "icon": node.icon, "size": "1.1em", "class": "flex-shrink-0", "data-astro-cid-k4cmclh2": true })}` : renderTemplate`<svg class="tree-folder-icon w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" data-astro-cid-k4cmclh2></path> </svg>`} <span class="text-slate-700 dark:text-slate-300 font-medium truncate" data-astro-cid-k4cmclh2> ${node.displayName || node.name} </span> ${node.badge && renderTemplate`<span${addAttribute(`ml-1 px-1.5 py-0.5 text-xs rounded ${node.badgeType === "error" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : node.badgeType === "warning" ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" : node.badgeType === "success" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`, "class")} data-astro-cid-k4cmclh2> ${node.badge} </span>`} <span class="text-xs text-slate-400 ml-auto" data-astro-cid-k4cmclh2>${node.children.length}</span> </button> <ul class="tree-children ml-4 mt-1 space-y-1 hidden" data-astro-cid-k4cmclh2> ${node.children.map((child) => renderTemplate`<li class="tree-node" data-astro-cid-k4cmclh2> ${child.isFolder ? renderTemplate`<div class="tree-folder" data-astro-cid-k4cmclh2> <button class="tree-folder-toggle w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"${addAttribute(child.name, "data-folder-name")}${addAttribute(child.collapsed, "data-default-collapsed")} data-astro-cid-k4cmclh2> <svg class="tree-chevron w-4 h-4 text-slate-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-astro-cid-k4cmclh2></path> </svg> ${child.icon ? renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "icon": child.icon, "size": "1.1em", "class": "flex-shrink-0", "data-astro-cid-k4cmclh2": true })}` : renderTemplate`<svg class="tree-folder-icon w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" data-astro-cid-k4cmclh2></path> </svg>`} <span class="text-slate-700 dark:text-slate-300 font-medium truncate" data-astro-cid-k4cmclh2> ${child.displayName || child.name} </span> ${child.badge && renderTemplate`<span${addAttribute(`ml-1 px-1.5 py-0.5 text-xs rounded ${child.badgeType === "error" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : child.badgeType === "warning" ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" : child.badgeType === "success" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`, "class")} data-astro-cid-k4cmclh2> ${child.badge} </span>`} <span class="text-xs text-slate-400 ml-auto" data-astro-cid-k4cmclh2>${child.children.length}</span> </button> <ul class="tree-children ml-4 mt-1 space-y-1 hidden" data-astro-cid-k4cmclh2> ${child.children.map((grandChild) => renderTemplate`<li class="tree-node" data-astro-cid-k4cmclh2> ${grandChild.isFolder ? renderTemplate`<div class="tree-folder" data-astro-cid-k4cmclh2> <button class="tree-folder-toggle w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"${addAttribute(grandChild.name, "data-folder-name")} data-astro-cid-k4cmclh2> <svg class="tree-chevron w-4 h-4 text-slate-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-astro-cid-k4cmclh2></path> </svg> ${grandChild.icon ? renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "icon": grandChild.icon, "size": "1.1em", "class": "flex-shrink-0", "data-astro-cid-k4cmclh2": true })}` : renderTemplate`<svg class="tree-folder-icon w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" data-astro-cid-k4cmclh2></path> </svg>`} <span class="text-slate-700 dark:text-slate-300 font-medium truncate" data-astro-cid-k4cmclh2> ${grandChild.displayName || grandChild.name} </span> <span class="text-xs text-slate-400 ml-auto" data-astro-cid-k4cmclh2>${grandChild.children.length}</span> </button> <ul class="tree-children ml-4 mt-1 space-y-1 hidden" data-astro-cid-k4cmclh2> ${grandChild.children.map((item) => renderTemplate`<li class="tree-node" data-astro-cid-k4cmclh2> ${item.link ? renderTemplate`<a${addAttribute(item.link, "href")} target="_blank" rel="noopener noreferrer" class="tree-file flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"${addAttribute(item.title, "title")} data-astro-cid-k4cmclh2> ${item.icon ? renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "icon": item.icon, "size": "1em", "class": "flex-shrink-0", "data-astro-cid-k4cmclh2": true })}` : renderTemplate`<svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" data-astro-cid-k4cmclh2></path> </svg>`} <span class="text-slate-600 dark:text-slate-400 truncate hover:text-primary-500" data-astro-cid-k4cmclh2> ${item.title || item.name} </span> </a>` : renderTemplate`<a${addAttribute(`/posts/${item.slug?.toLowerCase()}`, "href")} class="tree-file flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"${addAttribute(item.title, "title")} data-astro-cid-k4cmclh2> ${item.icon ? renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "icon": item.icon, "size": "1em", "class": "flex-shrink-0", "data-astro-cid-k4cmclh2": true })}` : renderTemplate`<svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-astro-cid-k4cmclh2></path> </svg>`} <span class="text-slate-600 dark:text-slate-400 truncate hover:text-primary-500" data-astro-cid-k4cmclh2> ${item.title || item.name} </span> </a>`} </li>`)} </ul> </div>` : grandChild.link ? renderTemplate`<a${addAttribute(grandChild.link, "href")} target="_blank" rel="noopener noreferrer" class="tree-file flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"${addAttribute(grandChild.title, "title")} data-astro-cid-k4cmclh2> ${grandChild.icon ? renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "icon": grandChild.icon, "size": "1em", "class": "flex-shrink-0", "data-astro-cid-k4cmclh2": true })}` : renderTemplate`<svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" data-astro-cid-k4cmclh2></path> </svg>`} <span class="text-slate-600 dark:text-slate-400 truncate hover:text-primary-500" data-astro-cid-k4cmclh2> ${grandChild.title || grandChild.name} </span> </a>` : renderTemplate`<a${addAttribute(`/posts/${grandChild.slug?.toLowerCase()}`, "href")} class="tree-file flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"${addAttribute(grandChild.title, "title")} data-astro-cid-k4cmclh2> ${grandChild.icon ? renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "icon": grandChild.icon, "size": "1em", "class": "flex-shrink-0", "data-astro-cid-k4cmclh2": true })}` : renderTemplate`<svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-astro-cid-k4cmclh2></path> </svg>`} <span class="text-slate-600 dark:text-slate-400 truncate hover:text-primary-500" data-astro-cid-k4cmclh2> ${grandChild.title || grandChild.name} </span> ${grandChild.badge && renderTemplate`<span${addAttribute(`ml-1 px-1.5 py-0.5 text-xs rounded ${grandChild.badgeType === "error" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : grandChild.badgeType === "warning" ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" : grandChild.badgeType === "success" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`, "class")} data-astro-cid-k4cmclh2> ${grandChild.badge} </span>`} </a>`} </li>`)} </ul> </div>` : child.link ? renderTemplate`<a${addAttribute(child.link, "href")} target="_blank" rel="noopener noreferrer" class="tree-file flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"${addAttribute(child.title, "title")} data-astro-cid-k4cmclh2> ${child.icon ? renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "icon": child.icon, "size": "1em", "class": "flex-shrink-0", "data-astro-cid-k4cmclh2": true })}` : renderTemplate`<svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" data-astro-cid-k4cmclh2></path> </svg>`} <span class="text-slate-600 dark:text-slate-400 truncate hover:text-primary-500" data-astro-cid-k4cmclh2> ${child.title || child.name} </span> </a>` : renderTemplate`<a${addAttribute(`/posts/${child.slug?.toLowerCase()}`, "href")} class="tree-file flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"${addAttribute(child.title, "title")} data-astro-cid-k4cmclh2> ${child.icon ? renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "icon": child.icon, "size": "1em", "class": "flex-shrink-0", "data-astro-cid-k4cmclh2": true })}` : renderTemplate`<svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-astro-cid-k4cmclh2></path> </svg>`} <span class="text-slate-600 dark:text-slate-400 truncate hover:text-primary-500" data-astro-cid-k4cmclh2> ${child.title || child.name} </span> ${child.badge && renderTemplate`<span${addAttribute(`ml-1 px-1.5 py-0.5 text-xs rounded ${child.badgeType === "error" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : child.badgeType === "warning" ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" : child.badgeType === "success" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`, "class")} data-astro-cid-k4cmclh2> ${child.badge} </span>`} </a>`} </li>`)} </ul> </div>` : node.link ? renderTemplate`<a${addAttribute(node.link, "href")} target="_blank" rel="noopener noreferrer" class="tree-file flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"${addAttribute(node.title, "title")} data-astro-cid-k4cmclh2> ${node.icon ? renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "icon": node.icon, "size": "1em", "class": "flex-shrink-0", "data-astro-cid-k4cmclh2": true })}` : renderTemplate`<svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" data-astro-cid-k4cmclh2></path> </svg>`} <span class="text-slate-600 dark:text-slate-400 truncate hover:text-primary-500" data-astro-cid-k4cmclh2> ${node.title || node.name} </span> </a>` : renderTemplate`<a${addAttribute(`/posts/${node.slug?.toLowerCase()}`, "href")} class="tree-file flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"${addAttribute(node.title, "title")} data-astro-cid-k4cmclh2> ${node.icon ? renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "icon": node.icon, "size": "1em", "class": "flex-shrink-0", "data-astro-cid-k4cmclh2": true })}` : renderTemplate`<svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-k4cmclh2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-astro-cid-k4cmclh2></path> </svg>`} <span class="text-slate-600 dark:text-slate-400 truncate hover:text-primary-500" data-astro-cid-k4cmclh2> ${node.title || node.name} </span> ${node.badge && renderTemplate`<span${addAttribute(`ml-1 px-1.5 py-0.5 text-xs rounded ${node.badgeType === "error" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : node.badgeType === "warning" ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" : node.badgeType === "success" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`, "class")} data-astro-cid-k4cmclh2> ${node.badge} </span>`} </a>`} </li>`)} </ul> </nav> </section>`)}  ${recentPosts.length > 0 && renderTemplate`<section data-astro-cid-k4cmclh2> <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2" data-astro-cid-k4cmclh2>
最新文章
</h3> <div class="space-y-3" data-astro-cid-k4cmclh2> ${recentPosts.map((post) => renderTemplate`<article class="group" data-astro-cid-k4cmclh2> <a${addAttribute(`/posts/${post.id.toLowerCase()}`, "href")} class="block p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" data-astro-cid-k4cmclh2> <h4 class="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-primary-500 line-clamp-2 mb-1" data-astro-cid-k4cmclh2> ${post.data.title} </h4> ${post.data.pubDate && renderTemplate`<time class="text-xs text-slate-500 dark:text-slate-400" data-astro-cid-k4cmclh2> ${new Date(post.data.pubDate).toLocaleDateString("zh-CN")} </time>`} </a> </article>`)} </div> </section>`}  ${popularTags.length > 0 && renderTemplate`<section data-astro-cid-k4cmclh2> <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2" data-astro-cid-k4cmclh2>
热门标签
</h3> <div class="flex flex-wrap gap-2" data-astro-cid-k4cmclh2> ${popularTags.map((tag) => renderTemplate`<a${addAttribute(`/tags/${tag.slug}`, "href")} class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"${addAttribute(`font-size: ${Math.min(14, 10 + tag.count * 0.5)}px`, "style")} data-astro-cid-k4cmclh2> ${tag.name} <span class="ml-1 text-primary-500" data-astro-cid-k4cmclh2>(${tag.count})</span> </a>`)} </div> </section>`}  ${archives.length > 0 && renderTemplate`<section data-astro-cid-k4cmclh2> <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2" data-astro-cid-k4cmclh2>
文章归档
</h3> <div class="space-y-2" data-astro-cid-k4cmclh2> ${archives.map((archive) => renderTemplate`<a${addAttribute(`/archives/${archive.year}/${String(archive.month).padStart(2, "0")}`, "href")} class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group" data-astro-cid-k4cmclh2> <span class="text-sm text-slate-700 dark:text-slate-300 group-hover:text-primary-500" data-astro-cid-k4cmclh2> ${archive.year}年${archive.month}月
</span> <span class="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full" data-astro-cid-k4cmclh2> ${archive.count} </span> </a>`)} </div> </section>`}  ${sidebarConfig.showFriendLinks} </div>  ${renderScript($$result, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/layout/Sidebar.astro", void 0);

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SidebarToggle",
  setup(__props, { expose: __expose }) {
    __expose();
    const isCollapsed = ref(false);
    onMounted(() => {
      setTimeout(() => {
        const saved = localStorage.getItem("sidebar-collapsed");
        if (saved) {
          isCollapsed.value = JSON.parse(saved);
        }
        applySidebarState();
      }, 100);
    });
    watch(isCollapsed, (newValue) => {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(newValue));
      applySidebarState();
    });
    function toggleSidebar() {
      isCollapsed.value = !isCollapsed.value;
    }
    function applySidebarState() {
      if (isCollapsed.value) {
        document.body.classList.add("sidebar-collapsed");
      } else {
        document.body.classList.remove("sidebar-collapsed");
      }
    }
    const __returned__ = { isCollapsed, toggleSidebar, applySidebarState };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<button${ssrRenderAttrs(mergeProps({
    title: $setup.isCollapsed ? "\u663E\u793A\u4FA7\u8FB9\u680F" : "\u9690\u85CF\u4FA7\u8FB9\u680F",
    class: "p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400"
  }, _attrs))}><svg class="${ssrRenderClass([{ "rotate-180": $setup.isCollapsed }, "w-4 h-4 transition-transform duration-200"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg></button>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/ui/SidebarToggle.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const SidebarToggle = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

const $$Astro = createAstro("https://jet-w.github.io");
const $$PageLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PageLayout;
  const {
    title,
    description,
    image,
    type,
    publishedTime,
    modifiedTime,
    tags,
    showSidebar = true,
    showToc = false
  } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description, "image": image, "type": type, "publishedTime": publishedTime, "modifiedTime": modifiedTime, "tags": tags, "data-astro-cid-3zbxo6iv": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, { "data-astro-cid-3zbxo6iv": true })} ${maybeRenderHead()}<main class="flex-1 flex" data-astro-cid-3zbxo6iv> <!-- 左侧边栏 - 桌面端 --> ${showSidebar && renderTemplate`<aside class="hidden lg:block shrink-0 transition-all duration-300 relative" data-sidebar style="width: var(--sidebar-width, 256px);" data-astro-cid-3zbxo6iv> <div class="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto" data-astro-cid-3zbxo6iv> ${renderComponent($$result2, "Sidebar", $$Sidebar, { "data-astro-cid-3zbxo6iv": true })} </div> <!-- 拖拽调整宽度的手柄 --> <div class="absolute top-0 right-0 w-1 h-full cursor-col-resize group z-10" data-sidebar-resizer data-astro-cid-3zbxo6iv> <div class="absolute top-0 right-0 w-4 h-full -mr-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" data-astro-cid-3zbxo6iv> <div class="w-1 h-16 bg-primary-400 dark:bg-primary-500 rounded-full" data-astro-cid-3zbxo6iv></div> </div> </div> </aside>`} <!-- 移动端侧边栏遮罩 --> ${showSidebar && renderTemplate`<div class="lg:hidden fixed inset-0 bg-black/50 z-40 hidden" data-sidebar-overlay onclick="this.classList.add('hidden'); document.querySelector('[data-mobile-sidebar]').classList.add('-translate-x-full');" data-astro-cid-3zbxo6iv></div>`} <!-- 移动端侧边栏 --> ${showSidebar && renderTemplate`<aside class="lg:hidden fixed top-16 left-0 w-72 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 z-50 transform -translate-x-full transition-transform duration-300 shadow-xl overflow-y-auto" data-mobile-sidebar data-astro-cid-3zbxo6iv> <div class="p-4" data-astro-cid-3zbxo6iv> ${renderComponent($$result2, "Sidebar", $$Sidebar, { "data-astro-cid-3zbxo6iv": true })} </div> </aside>`} <!-- 主内容区 --> <div${addAttribute(`flex-1 transition-all duration-300 ${showSidebar ? "lg:px-8" : ""} ${showToc ? "xl:pr-64" : ""} relative`, "class")} data-main-content data-astro-cid-3zbxo6iv> <!-- 侧边栏切换按钮 - 桌面端固定位置 --> ${showSidebar && renderTemplate`<div class="hidden lg:block fixed top-20 left-1 z-40 transition-all duration-300" data-sidebar-toggle data-astro-cid-3zbxo6iv> ${renderComponent($$result2, "SidebarToggle", SidebarToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/ui/SidebarToggle.vue", "client:component-export": "default", "data-astro-cid-3zbxo6iv": true })} </div>`} <!-- 侧边栏切换按钮 - 移动端浮动按钮 --> ${showSidebar && renderTemplate`<button class="lg:hidden fixed bottom-20 left-4 z-40 p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg transition-colors" data-mobile-sidebar-toggle aria-label="打开侧边栏" onclick="document.querySelector('[data-sidebar-overlay]').classList.remove('hidden'); document.querySelector('[data-mobile-sidebar]').classList.remove('-translate-x-full');" data-astro-cid-3zbxo6iv> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-3zbxo6iv> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" data-astro-cid-3zbxo6iv></path> </svg> </button>`} <div class="container mx-auto px-4 py-8 max-w-4xl" data-astro-cid-3zbxo6iv> ${renderSlot($$result2, $$slots["default"])} </div> </div> <!-- 右侧TOC --> ${showToc && renderTemplate`<aside class="hidden xl:block w-64 shrink-0" data-astro-cid-3zbxo6iv> <div class="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto" data-astro-cid-3zbxo6iv> ${renderSlot($$result2, $$slots["toc"])} </div> </aside>`} </main> ${renderComponent($$result2, "Footer", $$Footer, { "data-astro-cid-3zbxo6iv": true })}  <button class="back-to-top" aria-label="回到顶部" data-astro-cid-3zbxo6iv> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-3zbxo6iv> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" data-astro-cid-3zbxo6iv></path> </svg> </button> ` })} ${renderScript($$result, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/layouts/PageLayout.astro?astro&type=script&index=0&lang.ts")} `;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/layouts/PageLayout.astro", void 0);

export { $$PageLayout as $ };
