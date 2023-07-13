import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/blog/",
  locales: {
    "/": {
      lang: "en-US",
      title: "Haiyue's Blog",
      description: "A blog demo for vuepress-theme-hope",
    },
    //"/zh/": {
    //  lang: "zh-CN",
    //  title: "海越个人博客",
    //  description: "个人技术生活记录",
    //},
  },
  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
