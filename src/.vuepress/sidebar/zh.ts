import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/zh/": [
    "",
    {
      text: "建筑作品",
      icon: "laptop-code",
      prefix: "architecture/",
      children: "structure",
    },
    {
      text: "景观作品",
      icon: "book",
      prefix: "landscape/",
      children: "structure",
    },
    {
      text: "手绘作品",
      icon: "book",
      prefix: "landscape/",
      children: "structure",
    },
    {
      text: "室内作品",
      icon: "book",
      prefix: "landscape/",
      children: "structure",
    },
  ],
});
