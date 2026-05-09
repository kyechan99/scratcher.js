---
title: Custom Area (Rect)
---

# 커스텀 영역 예제 (Custom Area Example)

Scratcher.js는 전체 캔버스 영역이 아닌 **특정 영역(Area)**에서의 긁기 진행도를 측정할 수 있습니다. 사각형 영역과 이미지의 알파 채널을 기반으로 한 커스텀 도형 영역을 지원합니다.

이를 활용하면 특정 부분만 긁어야 완료되는 스크래치 게임을 만들 수 있습니다. 예를 들어, 보상 이미지의 특정 부분만 긁어야 한다거나, 특정 도형 모양만 긁어야 미션이 완료되도록 구성할 수 있습니다.

## Playground

아래 Playground에서는 녹색 점선 박스로 표시된 사각형 영역만 측정하는 예시입니다. 파란 박스 부분을 긁어서 진행도를 확인해보세요.

<RectAreaPlayground />

## 사각형 영역 (Rectangular Area)

**사각형 영역**은 가장 간단한 방식으로, x, y, width, height로 정의되는 사각형 영역에서만 진행도를 측정합니다.

```ts
type RectArea = {
  x: number; // 영역의 왼쪽 x 좌표 (픽셀)
  y: number; // 영역의 위쪽 y 좌표 (픽셀)
  width: number; // 영역의 너비 (픽셀)
  height: number; // 영역의 높이 (픽셀)
};
```

**사용 사례:**

- 카드 게임에서 카드의 특정 부분만 긁기
- 스크래치 복권에서 당첨 번호가 있는 박스 부분만 측정
- 특정 구역 내에서만 긁기 완료로 인정

## 사각형 영역 예시

### 기본 사각형 영역

캔버스 내에서 (50, 50) 위치부터 너비 150, 높이 150인 사각형 영역을 정의합니다.

:::tabs

== Vanilla

```ts
import { Scratcher } from '@scratcher.js/core';

const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
const scratcher = new Scratcher({
  width: 400,
  height: 240,
  brushSize: 30,
});

scratcher.bindCanvas(canvas);

// 사각형 영역 설정
scratcher.setArea({
  x: 50,
  y: 50,
  width: 150,
  height: 150,
});

// 영역 진행도 모니터링
scratcher.on('progress', ({ snapshot }) => {
  if (snapshot.area) {
    console.log(`영역 진행도: ${(snapshot.area.progress * 100).toFixed(1)}%`);
    console.log(`긁힌 셀 수: ${snapshot.area.scratchedCells} / ${snapshot.area.totalCells}`);
  }
});

scratcher.on('complete', ({ snapshot }) => {
  if (snapshot.area) {
    console.log('영역이 완전히 긁혔습니다!');
  }
});
```

== React

```tsx
import React, { useRef } from 'react';
import Scratcher from '@scratcher.js/react';

export default function RectAreaExample() {
  const scratcherRef = useRef<any>(null);

  const handleComplete = () => {
    const snapshot = scratcherRef.current?.snapshot;
    if (snapshot?.area) {
      console.log(`영역 진행도: ${(snapshot.area.progress * 100).toFixed(1)}%`);
      console.log('영역이 완전히 긁혔습니다!');
    }
  };

  const handleProgress = () => {
    const snapshot = scratcherRef.current?.snapshot;
    if (snapshot?.area) {
      console.log(`영역 진행도: ${(snapshot.area.progress * 100).toFixed(1)}%`);
    }
  };

  return (
    <Scratcher
      ref={scratcherRef}
      width={400}
      height={240}
      brushSize={30}
      area={{
        x: 50,
        y: 50,
        width: 150,
        height: 150,
      }}
      onProgress={handleProgress}
      onComplete={handleComplete}
    >
      <div
        style={{
          background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
          width: '100%',
          height: '100%',
        }}
      >
        긁어서 결과를 확인하세요!
      </div>
    </Scratcher>
  );
}
```

== Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Scratcher } from '@scratcher.js/vue';

const scratcherRef = ref<any>(null);

function handleProgress() {
  const snapshot = scratcherRef.value?.snapshot;
  if (snapshot?.area) {
    console.log(`영역 진행도: ${(snapshot.area.progress * 100).toFixed(1)}%`);
  }
}

function handleComplete() {
  const snapshot = scratcherRef.value?.snapshot;
  if (snapshot?.area) {
    console.log('영역이 완전히 긁혔습니다!');
  }
}
</script>

<template>
  <Scratcher
    ref="scratcherRef"
    :width="400"
    :height="240"
    :brushSize="30"
    :area="{
      x: 50,
      y: 50,
      width: 150,
      height: 150,
    }"
    @progress="handleProgress"
    @complete="handleComplete"
  >
    <div
      style="background: linear-gradient(45deg, #FF6B6B, #4ECDC4); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;"
    >
      긁어서 결과를 확인하세요!
    </div>
  </Scratcher>
</template>
```

== Svelte

```svelte
<script lang="ts">
  import { Scratcher } from '@scratcher.js/svelte';
  import type {
    Scratcher as CoreScratcher,
    ScratchSnapshot,
  } from '@scratcher.js/core';

  let scratcher: CoreScratcher | null = null;

  function handleReady(s: CoreScratcher) {
    scratcher = s;
  }

  function handleProgress(snapshot: ScratchSnapshot) {
    if (snapshot.area) {
      console.log(`영역 진행률: ${(snapshot.area.progress * 100).toFixed(1)}%`);
    }
  }

  function handleComplete(snapshot: ScratchSnapshot) {
    if (snapshot.area) {
      console.log('영역이 완전히 긁혔습니다!');
    }
  }
</script>

<Scratcher
  width={400}
  height={240}
  brushSize={30}
  area={{ x: 50, y: 50, width: 150, height: 150 }}
  callbacks={{ onProgress: handleProgress, onComplete: handleComplete }}
  onScratcherReady={handleReady}
>
  <div
    style="background: linear-gradient(45deg, #FF6B6B, #4ECDC4); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;"
  >
    긁어서 결과를 확인하세요!
  </div>
</Scratcher>
```

:::

---

## 영역 해제

언제든지 `setArea()`에 아무 인자도 전달하지 않으면 영역 측정을 해제할 수 있습니다.

```ts
// 영역 측정 해제 - 전체 캔버스에 대한 진행도만 계산됨
scratcher.setArea();

// 또는 명시적으로 undefined 전달
scratcher.setArea(undefined);
```

---

## 진행도 정보

영역이 설정되면 `snapshot.area`에 영역별 진행도 정보가 포함됩니다.

```ts
scratcher.on('progress', ({ snapshot }) => {
  // 전체 캔버스 진행도
  console.log(`전체: ${snapshot.progress.toFixed(2)}`);

  // 영역 진행도 (area가 설정된 경우에만)
  if (snapshot.area) {
    console.log(`영역 진행도: ${snapshot.area.progress.toFixed(2)}`);
    console.log(`영역 긁힌 셀: ${snapshot.area.scratchedCells}`);
    console.log(`영역 전체 셀: ${snapshot.area.totalCells}`);
  }
});
```

---
