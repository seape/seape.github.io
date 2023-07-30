import { sidebar } from "vuepress-theme-hope";

export const enSidebar = sidebar({
  "/": [
    "",
    {
      text: "Architecture Works",
      icon: "landmark",
      prefix: "architecture/",
      children: "structure",
    },
    {
      text: "Landscape Works",
      icon: "panorama",
      prefix: "landscape/",
      children: "structure",
    },
    {
      text: "Hand Painting",
      icon: "paintbrush",
      prefix: "landscape/",
      children: "structure",
    },
    {
      text: "Interior Design",
      icon: "door-open",
      prefix: "landscape/",
      children: "structure",
    },
    {
      text: "Techniques",
      icon: "gear",
      prefix: "technique/",
      children: "structure",
    },
    "intro"
  ],
});
