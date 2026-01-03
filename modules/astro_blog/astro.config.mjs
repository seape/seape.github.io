import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkContainers } from './src/plugins/remark-containers.mjs';
import { remarkMermaid } from './src/plugins/remark-mermaid.mjs';
import { rehypeCleanContainers } from './src/plugins/rehype-clean-containers.mjs';
import rehypeRaw from 'rehype-raw';

// https://astro.build/config
export default defineConfig({
  integrations: [
    vue(),
    mdx(),
    tailwind({
      applyBaseStyles: false,
    })
  ],
  markdown: {
    remarkPlugins: [remarkMermaid, remarkDirective, remarkContainers, remarkMath],
    rehypePlugins: [rehypeRaw, rehypeKatex, rehypeCleanContainers],
    shikiConfig: {
      theme: 'github-dark',
      langs: [],
      wrap: true
    }
  },
  site: 'https://localhost:4321'
});