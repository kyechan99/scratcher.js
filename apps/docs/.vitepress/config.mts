import { defineConfig } from 'vitepress';
import { fileURLToPath } from 'node:url';
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'scratcher.js',
  description: 'scratcher.js docs',
  head: [
    ['link', { rel: 'icon', href: '/public/favicon.ico' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    [
      'link',
      {
        href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"',
        rel: 'stylesheet',
      },
    ],
  ],
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
    logo: '/public/logo.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs/overview' },
    ],

    sidebar: [
      {
        text: 'Docs',
        items: [
          { text: 'Overview', link: '/docs/overview' },
          { text: 'Getting Started', link: '/docs/getting-started' },
          { text: 'Configuration', link: '/docs/configuration' },
          { text: 'API Reference', link: '/docs/api-reference' },
          { text: 'FAQ', link: '/docs/faq' },
        ],
      },
      {
        text: 'Examples',
        items: [
          { text: 'Custom Cover', link: '/examples/custom-cover' },
          { text: 'Custom Scratch', link: '/examples/custom-scratch' },
          { text: 'Async Reward', link: '/examples/async-reward' },
          { text: 'Using Images', link: '/examples/using-images' },
          { text: 'Custom Area (Rect)', link: '/examples/custom-area-rect' },
          { text: 'Custom Area (Image)', link: '/examples/custom-area-image' },
          // { text: 'Complete Animation', link: '/examples/complete-animation' }, // TODO: draft
        ],
      },
    ],

    outline: {
      level: [2, 3],
      label: 'On this page',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/kyechan99/scratcher.js' }],

    editLink: {
      pattern: 'https://github.com/kyechan99/scratcher.js/edit/main/apps/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
    kr: {
      label: '한국어',
      lang: 'kr',
      // link: '/kr/docs/overview',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Docs', link: '/kr/docs/overview' },
        ],
        sidebar: [
          {
            text: 'Docs',
            items: [
              { text: 'Overview', link: '/kr/docs/overview' },
              { text: 'Getting Started', link: '/kr/docs/getting-started' },
              { text: 'Configuration', link: '/kr/docs/configuration' },
              { text: 'API Reference', link: '/kr/docs/api-reference' },
              { text: 'FAQ', link: '/kr/docs/faq' },
            ],
          },
          {
            text: 'Examples',
            items: [
              { text: 'Custom Cover', link: '/kr/examples/custom-cover' },
              { text: 'Custom Scratch', link: '/kr/examples/custom-scratch' },
              { text: 'Async Reward', link: '/kr/examples/async-reward' },
              { text: 'Using Images', link: '/kr/examples/using-images' },
              { text: 'Custom Area (Rect)', link: '/kr/examples/custom-area-rect' },
              { text: 'Custom Area (Image)', link: '/kr/examples/custom-area-image' },
              // { text: 'Complete Animation', link: '/kr/examples/complete-animation' }, // TODO: draft
            ],
          },
        ],
      },
    },
  },
});
