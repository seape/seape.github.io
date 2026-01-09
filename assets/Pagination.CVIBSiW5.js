import { c as createAstro, a as createComponent, m as maybeRenderHead, d as addAttribute, b as renderTemplate, r as renderComponent, F as Fragment } from './astro/server.CsXMQSOf.js';
import 'piccolore';

const $$Astro = createAstro("https://jet-w.github.io");
const $$Pagination = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Pagination;
  const { currentPage, totalPages, baseUrl } = Astro2.props;
  const generatePageNumbers = () => {
    const pages = [];
    const showPages = 5;
    const halfShow = Math.floor(showPages / 2);
    let start = Math.max(1, currentPage - halfShow);
    let end = Math.min(totalPages, start + showPages - 1);
    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };
  const pageNumbers = generatePageNumbers();
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const getPageUrl = (page) => {
    if (page === 1) {
      return baseUrl;
    }
    return `${baseUrl}/page/${page}`;
  };
  return renderTemplate`${totalPages > 1 && renderTemplate`${maybeRenderHead()}<nav class="flex justify-center" aria-label="分页导航"><div class="flex items-center space-x-2"><!-- 上一页 -->${prevPage ? renderTemplate`<a${addAttribute(getPageUrl(prevPage), "href")} class="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" aria-label="上一页"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg><span>上一页</span></a>` : renderTemplate`<span class="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-not-allowed"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg><span>上一页</span></span>`}<!-- 第一页 -->${pageNumbers[0] > 1 && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`<a${addAttribute(getPageUrl(1), "href")} class="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
1
</a>${pageNumbers[0] > 2 && renderTemplate`<span class="px-2 py-2 text-slate-400 dark:text-slate-600">...</span>`}` })}`}<!-- 页码 -->${pageNumbers.map((page) => page === currentPage ? renderTemplate`<span class="px-3 py-2 text-sm font-medium text-white bg-primary-500 border border-primary-500 rounded-lg" aria-current="page">${page}</span>` : renderTemplate`<a${addAttribute(getPageUrl(page), "href")} class="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">${page}</a>`)}<!-- 最后一页 -->${pageNumbers[pageNumbers.length - 1] < totalPages && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${pageNumbers[pageNumbers.length - 1] < totalPages - 1 && renderTemplate`<span class="px-2 py-2 text-slate-400 dark:text-slate-600">...</span>`}<a${addAttribute(getPageUrl(totalPages), "href")} class="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">${totalPages}</a>` })}`}<!-- 下一页 -->${nextPage ? renderTemplate`<a${addAttribute(getPageUrl(nextPage), "href")} class="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" aria-label="下一页"><span>下一页</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a>` : renderTemplate`<span class="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-not-allowed"><span>下一页</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></span>`}</div><!-- 页面信息 --><div class="hidden sm:flex items-center ml-8 text-sm text-slate-600 dark:text-slate-400">
第 ${currentPage} 页，共 ${totalPages} 页
</div></nav>`}`;
}, "/home/runner/work/seape.github.io/seape.github.io/modules/astro_blog/src/components/ui/Pagination.astro", void 0);

export { $$Pagination as $ };
