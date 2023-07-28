import { sidebar } from "vuepress-theme-hope";

export const enSidebar = sidebar({
  "/": [
    "",
    {
      text: "Architecture Works",
      icon: "laptop-code",
      prefix: "architecture/",
      children: "structure",
    },
    {
      text: "Landscape Works",
      icon: "book",
      prefix: "landscape/",
      children: "structure",
    },
    {
      text: "Hand Painting",
      icon: "book",
      prefix: "landscape/",
      children: "structure",
    },
    {
      text: "Interior Design",
      icon: "book",
      prefix: "landscape/",
      children: "structure",
    },
    "intro"
  ],
});
