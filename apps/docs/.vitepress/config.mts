import { defineConfig } from 'vitepress';
import { fileURLToPath } from 'node:url';
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'scratcher.js',
  description: 'scratcher.js docs',
  vite: {
    resolve: {
      alias: {
        '@scratcher/core': fileURLToPath(
          new URL('../../../packages/core/src/index.ts', import.meta.url),
        ),
        '@scratcher/react': fileURLToPath(
          new URL('../../../packages/react/src/index.tsx', import.meta.url),
        ),
        '@scratcher/react-native': fileURLToPath(
          new URL('../../../packages/react-native/src/index.tsx', import.meta.url),
        ),
        '@scratcher/vue': fileURLToPath(
          new URL('../../../packages/vue/src/index.ts', import.meta.url),
        ),
      },
    },
  },
  markdown: {
    config(md) {
      md.use(tabsMarkdownPlugin);
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/markdown-examples' },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/kyechan99/scratcher.js' }],
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
    kr: {
      label: '한국어',
      lang: 'kr',
      // link: "/kr/guide",
    },
  },
});
