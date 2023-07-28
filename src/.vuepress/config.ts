import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { searchProPlugin } from "vuepress-plugin-search-pro";

export default defineUserConfig({
  base: "/",
  locales: {
    "/": {
      lang: "en-US",
      title: "Haiyue's Blog",
      description: "Haiyue's page",
    },
    "/zh/": {
      lang: "zh-CN",
      title: "郑彬个人博客",
      description: "个人作品记录",
    },
  },
  theme,
  // Enable it with pwa
  // shouldPrefetch: false,
});
