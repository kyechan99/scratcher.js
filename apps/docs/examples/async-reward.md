---
title: Async-Reward
---

# Async Reward 예제 (Async Reward Example)

스크래치 완료 시 비동기 API를 호출하여 `.reward` 영역에 당첨/미당첨 결과를 표시하는 예제입니다.

이 예제에서는 완료 시 보상 결과를 비동기적으로 표시하지만, Scratcher가 생성될 때 이미 비동기적으로 결과가 검색된 경우도 있습니다. 이러한 경우에도 이 예제와 유사한 방식으로 구현할 수 있습니다.

## Playground

아래 Playground는 직접 실습해볼 수 있는 예시입니다.

<AsyncRewardPlayground />

## 비동기 API 함수 예시

아래는 당첨/미당첨 결과를 랜덤으로 반환하는 임시 비동기 API 예시입니다.

:::tabs

== React

```tsx
import React, { useRef, useState } from 'react';
import Scratcher from '@scratcher.js/react';

function getAsyncRewardAPI() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Math.random() > 0.5 ? '당첨!' : '미당첨');
    }, 1000);
  });
}

export default function AsyncRewardExample() {
  const [reward, setReward] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    const result = await getAsyncRewardAPI();
    setReward(result as string);
    setLoading(false);
  };

  return (
    <Scratcher width={320} height={180} onComplete={handleComplete}>
      <div className="reward">{loading ? '결과 확인 중...' : reward || '긁어서 결과 확인!'}</div>
    </Scratcher>
  );
}
```

== Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Scratcher } from '@scratcher.js/vue';

const reward = ref<string | null>(null);
const loading = ref(false);

function getAsyncRewardAPI() {
  return new Promise<string>(resolve => {
    setTimeout(() => {
      resolve(Math.random() > 0.5 ? '당첨!' : '미당첨');
    }, 1000);
  });
}

async function handleComplete() {
  loading.value = true;
  reward.value = null;
  reward.value = await getAsyncRewardAPI();
  loading.value = false;
}
</script>

<template>
  <Scratcher :width="320" :height="180" @complete="handleComplete">
    <div class="reward">
      {{ loading ? '결과 확인 중...' : reward || '긁어서 결과 확인!' }}
    </div>
  </Scratcher>
</template>
```

== Vanilla

```ts
import { Scratcher } from '@scratcher.js/core';

function getAsyncRewardAPI() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Math.random() > 0.5 ? '당첨!' : '미당첨');
    }, 1000);
  });
}

const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
const rewardDiv = document.getElementById('reward')!;

const scratcher = new Scratcher({
  width: 320,
  height: 180,
  callbacks: {
    onComplete: async () => {
      rewardDiv.textContent = '결과 확인 중...';
      const result = await getAsyncRewardAPI();
      rewardDiv.textContent = result as string;
    },
  },
});
scratcher.bindCanvas(canvas);
```

:::
