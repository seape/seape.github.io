import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/zh/",
  {
    text: "作品集",
    icon: "/assets/icon/unisa/unisa-logo.svg",
    prefix: "/",
    children: [
      {text: "建筑作品", link: "architecture"},
      {text: "手绘作品", link: "handpaint"},
      {text: "室内设计", link: "interiordesign"},
      {text: "景观作品", link: "landscape"},
    ]
  }
]);
