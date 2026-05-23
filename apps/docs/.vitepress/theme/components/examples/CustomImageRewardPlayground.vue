<script setup lang="ts">
import { ref, computed } from 'vue';
import { type Scratcher as CoreScratcher } from '@scratcher.js/core';
import { Scratcher as VueScratcher } from '@scratcher.js/vue';
import PlaygroundFrame from './PlaygroundFrame.vue';

const rewardImg = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300';
let scratcher: CoreScratcher | null = null;

function resetCanvas() {
  if (!scratcher) return;
  scratcher.reset();
}
</script>

<template>
  <PlaygroundFrame @reset="resetCanvas">
    <template #main>
      <VueScratcher responsive :width="300" :height="200" cover="#bbb" :brush-size="50">
        <img :src="rewardImg" alt="reward" style="width: 100%; height: 100%; object-fit: cover" />
      </VueScratcher>
    </template>
  </PlaygroundFrame>
</template>

<style scoped>
.reward {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 1.2rem;
  font-weight: 800;
  text-align: center;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
}

.scratch-card {
  position: relative;
  border-radius: 0.875rem;
  overflow: hidden;
  touch-action: none;
  max-width: 100%;
  box-shadow: 0 1rem 2.5rem var(--vp-c-gray-soft);
}
</style>
