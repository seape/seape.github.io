import { navbar } from "vuepress-theme-hope";

export const enNavbar = navbar([
  "/",
  {
    text: "Portfolio",
    icon: "/assets/icon/unisa/unisa-logo.svg",
    prefix: "/unisa/",
    children: [
      {text: "Architecture Works", link: "architecture"},
      {text: "Hand Painting", link: "handpaint"},
      {text: "Interior Design", link: "interiordesign"},
      {text: "Landscape Works", link: "landscape"},
    ]
  },

  //All the sample below
  /*
  {
    text: "Blog Guidance",
    link: "/demo/"
  },
  {
    text: "Post Sample",
    icon: "pen-to-square",
    prefix: "/demo/posts/",
    children: [
      {
        text: "Apple",
        icon: "pen-to-square",
        prefix: "apple/",
        children: [
          { text: "Apple1", icon: "pen-to-square", link: "1" },
          { text: "Apple2", icon: "pen-to-square", link: "2" },
          "3",
          "4",
          { text: "Applexxx", icon: "author-icon", link: "xxx" },
        ],
      },
      {
        text: "Banana",
        icon: "pen-to-square",
        prefix: "banana/",
        children: [
          {
            text: "Banana 1",
            icon: "pen-to-square",
            link: "1",
          },
          {
            text: "Banana 2",
            icon: "pen-to-square",
            link: "2",
          },
          "3",
          "4",
        ],
      },
      { text: "Cherry", icon: "pen-to-square", link: "cherry" },
      { text: "Dragon Fruit", icon: "pen-to-square", link: "dragonfruit" },
      "tomato",
      "strawberry",
    ],
  }
  {
    text: "Github",
    icon: "/github.svg",
    link: "https://github.com/seamice/",
  },
  */
]);
