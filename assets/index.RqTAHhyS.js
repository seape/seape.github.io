import { a as createComponent, m as maybeRenderHead, d as addAttribute, b as renderTemplate, r as renderComponent, c as createAstro, n as createVNode$1, F as Fragment, _ as __astro_tag_component__ } from './astro/server.CsXMQSOf.js';
import 'piccolore';
import 'clsx';
import { s as siteConfig } from './site.CxBSWjpv.js';
/* empty css                                                           */
import { g as getCollection } from './astro_content.BCsnTauC.js';
import { defineComponent, mergeProps, createVNode, resolveDynamicComponent, ref, computed, h, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrRenderVNode, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
/* empty css                                                                                 */
import { _ as _export_sfc } from './plugin-vue_export-helper.pcqpp-6-.js';
import { $ as $$PostCard } from './PostCard.D_9wZ2MM.js';

const $$Hero = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="py-16 mb-16" data-astro-cid-vva3ln22> <div class="text-center" data-astro-cid-vva3ln22> <!-- 头像 --> ${renderTemplate`<div class="mb-8" data-astro-cid-vva3ln22> <img${addAttribute(siteConfig.avatar, "src")}${addAttribute(siteConfig.author, "alt")} class="w-32 h-32 rounded-full mx-auto shadow-lg" data-astro-cid-vva3ln22> </div>`} <!-- 标题和描述 --> <h1 class="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6" data-astro-cid-vva3ln22> ${siteConfig.title} </h1> <p class="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed" data-astro-cid-vva3ln22> ${siteConfig.description} </p> <!-- 社交链接 --> ${siteConfig.social && renderTemplate`<div class="flex justify-center space-x-6 mb-12" data-astro-cid-vva3ln22> ${siteConfig.social.github && renderTemplate`<a${addAttribute(siteConfig.social.github, "href")} target="_blank" rel="noopener noreferrer" class="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors" aria-label="GitHub" data-astro-cid-vva3ln22> <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-vva3ln22> <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" data-astro-cid-vva3ln22></path> </svg> </a>`} ${siteConfig.social.twitter && renderTemplate`<a${addAttribute(siteConfig.social.twitter, "href")} target="_blank" rel="noopener noreferrer" class="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors" aria-label="Twitter" data-astro-cid-vva3ln22> <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-vva3ln22> <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" data-astro-cid-vva3ln22></path> </svg> </a>`} ${siteConfig.social.linkedin && renderTemplate`<a${addAttribute(siteConfig.social.linkedin, "href")} target="_blank" rel="noopener noreferrer" class="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors" aria-label="LinkedIn" data-astro-cid-vva3ln22> <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-vva3ln22> <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" data-astro-cid-vva3ln22></path> </svg> </a>`} ${siteConfig.social.email && renderTemplate`<a${addAttribute(siteConfig.social.email, "href")} class="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors" aria-label="Email" data-astro-cid-vva3ln22> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-vva3ln22> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" data-astro-cid-vva3ln22></path> </svg> </a>`} </div>`} <!-- 行动按钮 --> <div class="flex flex-col sm:flex-row gap-4 justify-center" data-astro-cid-vva3ln22> <a href="/posts" class="btn-primary inline-flex items-center space-x-2" data-astro-cid-vva3ln22> <span data-astro-cid-vva3ln22>浏览文章</span> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-vva3ln22> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-astro-cid-vva3ln22></path> </svg> </a> <a href="/about" class="btn-secondary inline-flex items-center space-x-2" data-astro-cid-vva3ln22> <span data-astro-cid-vva3ln22>关于我</span> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-vva3ln22> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" data-astro-cid-vva3ln22></path> </svg> </a> </div> </div> <!-- 装饰性背景 --> <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-96 -z-10 opacity-20" data-astro-cid-vva3ln22> <div class="relative w-full h-full" data-astro-cid-vva3ln22> <div class="absolute top-20 left-10 w-20 h-20 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" data-astro-cid-vva3ln22></div> <div class="absolute top-40 right-10 w-20 h-20 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" data-astro-cid-vva3ln22></div> <div class="absolute bottom-20 left-1/2 w-20 h-20 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" data-astro-cid-vva3ln22></div> </div> </div> </section> `;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/blog/Hero.astro", void 0);

const $$StatsSection = createComponent(async ($$result, $$props, $$slots) => {
  const allPosts = await getCollection("posts");
  const publishedPosts = allPosts.filter((post) => !post.data.draft);
  const totalPosts = publishedPosts.length;
  const allTags = new Set(publishedPosts.flatMap((post) => post.data.tags || []));
  const allCategories = new Set(publishedPosts.flatMap((post) => post.data.categories || []));
  const totalTags = allTags.size;
  const totalCategories = allCategories.size;
  return renderTemplate`${maybeRenderHead()}<section class="mb-16"> <div class="grid grid-cols-1 sm:grid-cols-3 gap-6"> <div class="card text-center"> <div class="text-3xl font-bold text-primary-500 mb-2"> ${totalPosts} </div> <div class="text-sm text-slate-600 dark:text-slate-400">
文章总数
</div> </div> <div class="card text-center"> <div class="text-3xl font-bold text-primary-500 mb-2"> ${totalTags} </div> <div class="text-sm text-slate-600 dark:text-slate-400">
标签数量
</div> </div> <div class="card text-center"> <div class="text-3xl font-bold text-primary-500 mb-2"> ${totalCategories} </div> <div class="text-sm text-slate-600 dark:text-slate-400">
分类数量
</div> </div> </div> </section>`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/home/StatsSection.astro", void 0);

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "NavigationTabs",
  props: {
    tags: {},
    archives: {},
    categories: {},
    timeline: {}
  },
  setup(__props, { expose: __expose }) {
    __expose();
    const props = __props;
    const activeTab = ref("tags");
    const TagIcon = {
      render() {
        return h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          })
        ]);
      }
    };
    const ArchiveIcon = {
      render() {
        return h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          })
        ]);
      }
    };
    const CategoryIcon = {
      render() {
        return h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          })
        ]);
      }
    };
    const TimelineIcon = {
      render() {
        return h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          })
        ]);
      }
    };
    const tabs = computed(() => [
      { id: "tags", name: "\u6807\u7B7E", count: props.tags.length, icon: TagIcon },
      { id: "archives", name: "\u5F52\u6863", count: props.archives.length, icon: ArchiveIcon },
      { id: "categories", name: "\u5206\u7C7B", count: props.categories.length, icon: CategoryIcon },
      { id: "timeline", name: "\u65F6\u95F4\u8F74", count: props.timeline.length, icon: TimelineIcon }
    ]);
    const encodeTag = (tag) => {
      return encodeURIComponent(tag.toLowerCase().replace(/\s+/g, "-"));
    };
    const encodeCategory = (category) => {
      return encodeURIComponent(category.toLowerCase().replace(/\s+/g, "-"));
    };
    const getTagColorClass = (count) => {
      if (count >= 10) {
        return "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50";
      } else if (count >= 5) {
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50";
      } else {
        return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600";
      }
    };
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(date);
    };
    const __returned__ = { props, activeTab, TagIcon, ArchiveIcon, CategoryIcon, TimelineIcon, tabs, encodeTag, encodeCategory, getTagColorClass, formatDate };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden" }, _attrs))} data-v-2c117388><div class="flex border-b border-slate-200 dark:border-slate-700" data-v-2c117388><!--[-->`);
  ssrRenderList($setup.tabs, (tab) => {
    _push(`<button class="${ssrRenderClass([$setup.activeTab === tab.id ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border-b-2 border-primary-500" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50", "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors"])}" data-v-2c117388>`);
    ssrRenderVNode(_push, createVNode(resolveDynamicComponent(tab.icon), { class: "w-4 h-4" }, null), _parent);
    _push(`<span data-v-2c117388>${ssrInterpolate(tab.name)}</span><span class="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400" data-v-2c117388>${ssrInterpolate(tab.count)}</span></button>`);
  });
  _push(`<!--]--></div><div class="p-4 max-h-80 overflow-y-auto" data-v-2c117388>`);
  if ($setup.activeTab === "tags") {
    _push(`<div class="flex flex-wrap gap-2" data-v-2c117388><!--[-->`);
    ssrRenderList($props.tags, (tag) => {
      _push(`<a${ssrRenderAttr("href", `/tags/${$setup.encodeTag(tag.name)}`)} class="${ssrRenderClass([$setup.getTagColorClass(tag.count), "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors"])}" data-v-2c117388><span data-v-2c117388>#${ssrInterpolate(tag.name)}</span><span class="text-xs opacity-70" data-v-2c117388>(${ssrInterpolate(tag.count)})</span></a>`);
    });
    _push(`<!--]--></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.activeTab === "archives") {
    _push(`<div class="space-y-3" data-v-2c117388><!--[-->`);
    ssrRenderList($props.archives, (archive) => {
      _push(`<a${ssrRenderAttr("href", `/archives/${archive.year}/${archive.month}`)} class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group" data-v-2c117388><div class="flex items-center gap-3" data-v-2c117388><svg class="w-4 h-4 text-slate-400 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-2c117388><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" data-v-2c117388></path></svg><span class="text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" data-v-2c117388>${ssrInterpolate(archive.year)}\u5E74${ssrInterpolate(archive.month)}\u6708 </span></div><span class="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full" data-v-2c117388>${ssrInterpolate(archive.count)}\u7BC7 </span></a>`);
    });
    _push(`<!--]--></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.activeTab === "categories") {
    _push(`<div class="space-y-2" data-v-2c117388><!--[-->`);
    ssrRenderList($props.categories, (category) => {
      _push(`<a${ssrRenderAttr("href", `/categories/${$setup.encodeCategory(category.name)}`)} class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group" data-v-2c117388><div class="flex items-center gap-3" data-v-2c117388><svg class="w-4 h-4 text-slate-400 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-2c117388><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" data-v-2c117388></path></svg><span class="text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" data-v-2c117388>${ssrInterpolate(category.name)}</span></div><span class="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full" data-v-2c117388>${ssrInterpolate(category.count)}\u7BC7 </span></a>`);
    });
    _push(`<!--]--></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.activeTab === "timeline") {
    _push(`<div class="relative" data-v-2c117388><div class="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" data-v-2c117388></div><div class="space-y-4" data-v-2c117388><!--[-->`);
    ssrRenderList($props.timeline, (item) => {
      _push(`<div class="relative pl-10" data-v-2c117388><div class="absolute left-2.5 w-3 h-3 rounded-full bg-primary-500 border-2 border-white dark:border-slate-800" data-v-2c117388></div><a${ssrRenderAttr("href", `/posts/${item.slug}`)} class="block p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group" data-v-2c117388><div class="text-xs text-slate-400 mb-1" data-v-2c117388>${ssrInterpolate($setup.formatDate(item.pubDate))}</div><div class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-1" data-v-2c117388>${ssrInterpolate(item.title)}</div></a></div>`);
    });
    _push(`<!--]--></div><a href="/archives" class="mt-4 flex items-center justify-center gap-2 py-2 text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" data-v-2c117388><span data-v-2c117388>\u67E5\u770B\u5168\u90E8\u65F6\u95F4\u8F74</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-2c117388><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-v-2c117388></path></svg></a></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/blog/NavigationTabs.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const NavigationTabs = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-2c117388"]]);

const $$QuickNavSection = createComponent(async ($$result, $$props, $$slots) => {
  const allPosts = await getCollection("posts");
  const publishedPosts = allPosts.filter((post) => !post.data.draft).sort((a, b) => (b.data.pubDate?.getTime() ?? 0) - (a.data.pubDate?.getTime() ?? 0));
  const posts = publishedPosts.map((post) => ({
    slug: post.id.toLowerCase(),
    title: post.data.title,
    pubDate: post.data.pubDate,
    tags: post.data.tags,
    categories: post.data.categories
  }));
  const tagCounts = {};
  posts.forEach((post) => {
    (post.tags || []).forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const tagsData = Object.entries(tagCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const categoryCounts = {};
  posts.forEach((post) => {
    (post.categories || []).forEach((category) => {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
  });
  const categoriesData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const archiveCounts = {};
  posts.forEach((post) => {
    if (post.pubDate) {
      const year = post.pubDate.getFullYear().toString();
      const month = (post.pubDate.getMonth() + 1).toString().padStart(2, "0");
      const key = `${year}-${month}`;
      archiveCounts[key] = (archiveCounts[key] || 0) + 1;
    }
  });
  const archivesData = Object.entries(archiveCounts).map(([key, count]) => {
    const [year, month] = key.split("-");
    return { year, month, key, count };
  }).sort((a, b) => b.key.localeCompare(a.key));
  const timelineData = posts.slice(0, 10).map((post) => ({
    slug: post.slug,
    title: post.title,
    pubDate: post.pubDate?.toISOString() || ""
  }));
  return renderTemplate`${maybeRenderHead()}<section class="mb-16"> <div class="flex items-center justify-between mb-8"> <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
快速导航
</h2> </div> ${renderComponent($$result, "NavigationTabs", NavigationTabs, { "client:load": true, "tags": tagsData, "archives": archivesData, "categories": categoriesData, "timeline": timelineData, "client:component-hydration": "load", "client:component-path": "@/components/blog/NavigationTabs.vue", "client:component-export": "default" })} </section>`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/home/QuickNavSection.astro", void 0);

const $$Astro$1 = createAstro("https://jet-w.github.io");
const $$FeaturedPostsSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$FeaturedPostsSection;
  const { count = 3 } = Astro2.props;
  const allPosts = await getCollection("posts");
  const publishedPosts = allPosts.filter((post) => !post.data.draft).sort((a, b) => (b.data.pubDate?.getTime() ?? 0) - (a.data.pubDate?.getTime() ?? 0));
  const featuredPosts = publishedPosts.slice(0, count).map((post) => ({
    slug: post.id.toLowerCase(),
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate,
    tags: post.data.tags,
    categories: post.data.categories,
    author: post.data.author,
    readingTime: 5
  }));
  return renderTemplate`${featuredPosts.length > 0 && renderTemplate`${maybeRenderHead()}<section class="mb-16"><div class="flex items-center justify-between mb-8"><h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
特色文章
</h2><a href="/posts" class="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium text-sm flex items-center space-x-1 transition-colors"><span>查看全部</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${featuredPosts.map((post) => renderTemplate`${renderComponent($$result, "PostCard", $$PostCard, { "post": post, "featured": true })}`)}</div></section>`}`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/home/FeaturedPostsSection.astro", void 0);

const $$Astro = createAstro("https://jet-w.github.io");
const $$RecentPostsSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$RecentPostsSection;
  const { count = 6 } = Astro2.props;
  const allPosts = await getCollection("posts");
  const publishedPosts = allPosts.filter((post) => !post.data.draft).sort((a, b) => (b.data.pubDate?.getTime() ?? 0) - (a.data.pubDate?.getTime() ?? 0));
  const recentPosts = publishedPosts.slice(0, count).map((post) => ({
    slug: post.id.toLowerCase(),
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate,
    tags: post.data.tags,
    categories: post.data.categories,
    author: post.data.author,
    readingTime: 5
  }));
  return renderTemplate`${maybeRenderHead()}<section class="mb-16"> <div class="flex items-center justify-between mb-8"> <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
最新文章
</h2> <a href="/posts" class="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium text-sm flex items-center space-x-1 transition-colors"> <span>查看全部</span> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </a> </div> <div class="space-y-6"> ${recentPosts.map((post) => renderTemplate`${renderComponent($$result, "PostCard", $$PostCard, { "post": post, "layout": "horizontal" })}`)} </div> </section>`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/home/RecentPostsSection.astro", void 0);

const frontmatter = {
  "title": "首页",
  "description": "1基于Astro构建的现代化技术博客，专注于分享前端开发、技术思考和学习笔记。"
};
function getHeadings() {
  return [];
}
function _createMdxContent(props) {
  return createVNode$1(Fragment, {
    children: [createVNode$1($$Hero, {}), "\n", createVNode$1($$StatsSection, {}), "\n", createVNode$1($$QuickNavSection, {}), "\n", createVNode$1($$FeaturedPostsSection, {
      count: 3
    }), "\n", createVNode$1($$RecentPostsSection, {
      count: 3
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? createVNode$1(MDXLayout, {
    ...props,
    children: createVNode$1(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent();
}

const url = "";
const file = "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/content/pages/index.mdx";
const Content = (props = {}) => MDXContent({
  ...props,
  components: { Fragment: Fragment, ...props.components, },
});
Content[Symbol.for('mdx-component')] = true;
Content[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter.layout);
Content.moduleId = "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/content/pages/index.mdx";
__astro_tag_component__(Content, 'astro:jsx');

export { Content, Content as default, file, frontmatter, getHeadings, url };
