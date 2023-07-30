import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/zh/": [
    "",
    {
      text: "建筑作品",
      icon: "landmark",
      prefix: "architecture/",
      children: "structure",
    },
    {
      text: "景观作品",
      icon: "panorama",
      prefix: "landscape/",
      children: "structure",
    },
    {
      text: "手绘作品",
      icon: "paintbrush",
      prefix: "landscape/",
      children: "structure",
    },
    {
      text: "室内作品",
      icon: "door-open",
      prefix: "landscape/",
      children: "structure",
    },
    {
      text: "技术相关",
      icon: "gear",
      prefix: "technique/",
      children: "structure",
    },
  ],
});
