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
import { rehypeRelativeLinks } from './src/plugins/rehype-relative-links.mjs';
import { rehypeTabs } from './src/plugins/rehype-tabs.mjs';
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
    remarkPlugins: [remarkMermaid, remarkContainers, remarkDirective, remarkMath],
    rehypePlugins: [rehypeRaw, rehypeTabs, rehypeKatex, rehypeCleanContainers, rehypeRelativeLinks],
    shikiConfig: {
      theme: 'github-dark',
      langs: [],
      wrap: true
    }
  },
  site: 'https://jet-w.github.io',
  base: '/',
  build: {
    assets: 'assets'
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          // 自定义文件命名，移除下划线前缀
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: (chunkInfo) => {
            // 替换开头的下划线
            const name = chunkInfo.name.replace(/^_/, '');
            return `assets/${name}.[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            // 替换开头的下划线
            const name = assetInfo.name.replace(/^_/, '');
            return `assets/${name}.[hash][extname]`;
          }
        }
      }
    }
  }
});