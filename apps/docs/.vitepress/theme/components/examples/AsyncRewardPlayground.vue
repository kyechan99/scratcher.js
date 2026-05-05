<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue';
import { type Scratcher as CoreScratcher } from '@scratcher/core';
import { Scratcher as VueScratcher } from '@scratcher/vue';
import PlaygroundFrame from './PlaygroundFrame.vue';

const reward = ref<string | null>(null);
const loading = ref(false);
let scratcher: CoreScratcher | null = null;

function fakeAsyncRewardAPI() {
  return new Promise<string>(resolve => {
    setTimeout(() => {
      resolve(Math.random() > 0.5 ? '당첨!' : '미당첨');
    }, 1000);
  });
}

function resetCanvas() {
  if (!scratcher) return;
  scratcher.reset();
  reward.value = null;
  loading.value = false;
}

function handleScratcherReady(nextScratcher: CoreScratcher) {
  scratcher = nextScratcher;
}

async function handleComplete() {
  loading.value = true;
  reward.value = null;
  reward.value = await fakeAsyncRewardAPI();
  loading.value = false;
  console.log('handleComplete', reward.value);
}
</script>

<template>
  <PlaygroundFrame @reset="resetCanvas">
    <template #main>
      <VueScratcher
        class="scratch-card"
        :width="400"
        :height="240"
        :brush-size="50"
        canvas-class="scratch-canvas"
        :completion-threshold="0.3"
        :reveal-on-completion="true"
        :on-scratcher-ready="handleScratcherReady"
        :callbacks="{ onComplete: handleComplete }"
      >
        <div class="reward">
          {{ loading ? '결과 확인 중...' : reward || '긁어서 결과 확인!' }}
        </div>
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
