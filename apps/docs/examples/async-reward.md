---
title: Async-Reward
---

# Async Reward Example

An example that calls an async API on scratch completion to display win/loss results in the `.reward` area.

In this example, reward results are asynchronously displayed on completion. However, there are also cases where results are asynchronously fetched when Scratcher is created. In such cases, you can implement it in a similar way to this example.

## Playground

Below is a playground example you can try directly.

<AsyncRewardPlayground />

## Async API Function Example

Below is a temporary async API example that randomly returns win/loss results.

:::tabs

== React

```tsx
import React, { useRef, useState } from 'react';
import Scratcher from '@scratcher.js/react';

function getAsyncRewardAPI() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Math.random() > 0.5 ? 'Win!' : 'Loss');
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
      <div className="reward">{loading ? 'Checking result...' : reward || 'Scratch to check!'}</div>
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
      resolve(Math.random() > 0.5 ? 'Win!' : 'Loss');
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
      {{ loading ? 'Checking result...' : reward || 'Scratch to check!' }}
    </div>
  </Scratcher>
</template>
```

== Svelte

```svelte
<script lang="ts">
  import { Scratcher } from '@scratcher.js/svelte';

  let reward: string | null = $state(null);
  let loading = $state(false);

  function getAsyncRewardAPI(): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(Math.random() > 0.5 ? 'Win!' : 'Loss');
      }, 1000);
    });
  }

  async function handleComplete() {
    loading = true;
    reward = null;
    reward = await getAsyncRewardAPI();
    loading = false;
  }
</script>

<Scratcher width={320} height={180} callbacks={{ onComplete: handleComplete }}>
  <div class="reward">
    {loading ? 'Checking result...' : (reward ?? 'Scratch to check!')}
  </div>
</Scratcher>
```

== Vanilla

```ts
import { Scratcher } from '@scratcher.js/core';

function getAsyncRewardAPI() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Math.random() > 0.5 ? 'Win!' : 'Loss');
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
      rewardDiv.textContent = 'Checking result...';
      const result = await getAsyncRewardAPI();
      rewardDiv.textContent = result as string;
    },
  },
});
scratcher.bindCanvas(canvas);
```

:::
