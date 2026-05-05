// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client';
import HomePlayground from './components/HomePlayground.vue';
import LandingSection from './components/LandingSection.vue';
import CustomCoverPlayground from './components/examples/CustomCoverPlayground.vue';
import CustomScratchPlayground from './components/examples/CustomScratchPlayground.vue';
import CompleteAnimationPlayground from './components/examples/CompleteAnimationPlayground.vue';
import AsyncRewardPlayground from './components/examples/AsyncRewardPlayground.vue';
import CustomImageCoverPlayground from './components/examples/CustomImageCoverPlayground.vue';
import CustomImageRewardPlayground from './components/examples/CustomImageRewardPlayground.vue';

import './style.css';

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app }) {
    enhanceAppWithTabs(app);
    app.component('HomePlayground', HomePlayground);
    app.component('LandingSection', LandingSection);
    app.component('CustomCoverPlayground', CustomCoverPlayground);
    app.component('CustomScratchPlayground', CustomScratchPlayground);
    app.component('CompleteAnimationPlayground', CompleteAnimationPlayground);
    app.component('AsyncRewardPlayground', AsyncRewardPlayground);
    app.component('CustomImageCoverPlayground', CustomImageCoverPlayground);
    app.component('CustomImageRewardPlayground', CustomImageRewardPlayground);
  },
} satisfies Theme;
