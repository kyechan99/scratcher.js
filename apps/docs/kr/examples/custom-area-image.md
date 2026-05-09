---
title: Custom Area (Image)
---

# 커스텀 영역 예제 (Custom Area Example)

Scratcher.js는 전체 캔버스 영역이 아닌 **특정 영역(Area)**에서의 긁기 진행도를 측정할 수 있습니다. 사각형 영역과 이미지의 알파 채널을 기반으로 한 커스텀 도형 영역을 지원합니다.

이를 활용하면 특정 부분만 긁어야 완료되는 스크래치 게임을 만들 수 있습니다. 예를 들어, 보상 이미지의 특정 부분만 긁어야 한다거나, 특정 도형 모양만 긁어야 미션이 완료되도록 구성할 수 있습니다.

## Playground

아래 Playground에서는 이미지의 알파 채널을 기반으로 영역을 정의합니다. 이미지를 업로드하고, Alpha Threshold와 위치/크기를 조정하여 실시간으로 영역의 변화를 확인할 수 있습니다.

<ImageAreaPlayground />

## 이미지 마스크 기반 영역 (Image-based Area)

**이미지 마스크 기반 영역**은 이미지의 알파 채널(투명도)을 활용하여 임의의 도형을 정의합니다. 알파값이 일정 수준 이상인 픽셀들이 영역으로 인식됩니다.

```ts
type ImageArea = {
  imageData: ImageData; // 캔버스 API의 ImageData 객체
  alphaThreshold?: number; // 알파값 임계값 (0-255, 기본값: 128)
  x?: number; // 이미지 영역의 x 위치 (기본값: 0)
  y?: number; // 이미지 영역의 y 위치 (기본값: 0)
  scale?: number; // 이미지 크기 배율 (기본값: 1)
};
```

**알파 임계값(alphaThreshold) 설명:**

- **범위:** 0 (투명)부터 255 (불투명)
- **의미:** 픽셀의 알파값이 이 값 이상이면 영역에 포함됩니다
- **기본값:** 128 (50% 이상 불투명한 픽셀 포함)
- **활용:** 반투명한 이미지의 가장자리를 포함/제외할 수 있습니다

**사용 사례:**

- 동물, 별, 하트 등 복잡한 도형을 정의하여 긁기
- 로고나 캐릭터 모양의 특정 부분만 긁기
- 사진의 얼굴 영역 같은 불규칙한 영역 측정

## 이미지 마스크 기반 영역 예시

### 이미지 알파 채널을 이용한 도형 영역

이미지의 알파 채널을 기반으로 복잡한 도형을 정의합니다. 예를 들어, 별 모양 PNG 이미지의 투명하지 않은 부분만 영역으로 인식됩니다.

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

// 이미지를 로드하여 ImageData 추출
function loadImageAsImageData(imageUrl: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      resolve(imageData);
    };
    img.onerror = () => reject(new Error('Image loading failed'));
    img.src = imageUrl;
  });
}

// 이미지 로드 및 영역 설정
async function setupImageArea() {
  try {
    const imageData = await loadImageAsImageData('/star-shape.png');
    scratcher.setArea({
      imageData,
      alphaThreshold: 128, // 50% 이상 불투명한 픽셀만 포함
      x: 150, // x 위치
      y: 50, // y 위치
      scale: 1, // 크기 배율
    });
  } catch (error) {
    console.error('이미지 로드 실패:', error);
  }
}

setupImageArea();

// 영역 진행도 모니터링
scratcher.on('progress', ({ snapshot }) => {
  if (snapshot.area) {
    console.log(`영역 진행도: ${(snapshot.area.progress * 100).toFixed(1)}%`);
  }
});
```

== React

```tsx
import React, { useRef, useEffect, useState } from 'react';
import Scratcher from '@scratcher.js/react';

export default function ImageAreaExample() {
  const scratcherRef = useRef<any>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);

  useEffect(() => {
    // 이미지를 로드하여 ImageData 추출
    const loadImage = async () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const data = ctx.getImageData(0, 0, img.width, img.height);
          setImageData(data);
        }
      };
      img.src = '/star-shape.png';
    };

    loadImage();
  }, []);

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
      area={
        imageData
          ? {
              imageData,
              alphaThreshold: 128,
              x: 150,
              y: 50,
              scale: 1,
            }
          : undefined
      }
      onProgress={handleProgress}
    >
      <div
        style={{
          background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
          width: '100%',
          height: '100%',
        }}
      >
        별 모양을 긁으세요!
      </div>
    </Scratcher>
  );
}
```

== Vue

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Scratcher } from '@scratcher.js/vue';

const scratcherRef = ref<any>(null);
const imageData = ref<ImageData | null>(null);

onMounted(async () => {
  // 이미지를 로드하여 ImageData 추출
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      imageData.value = ctx.getImageData(0, 0, img.width, img.height);
    }
  };
  img.src = '/star-shape.png';
});

function handleProgress() {
  const snapshot = scratcherRef.value?.snapshot;
  if (snapshot?.area) {
    console.log(`영역 진행률: ${(snapshot.area.progress * 100).toFixed(1)}%`);
  }
}
</script>

<template>
  <Scratcher
    ref="scratcherRef"
    :width="400"
    :height="240"
    :brushSize="30"
    :area="
      imageData
        ? {
            imageData,
            alphaThreshold: 128,
            x: 150,
            y: 50,
            scale: 1,
          }
        : undefined
    "
    @progress="handleProgress"
  >
    <div
      style="background: linear-gradient(45deg, #FF6B6B, #4ECDC4); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;"
    >
      별 모양을 긁으세요!
    </div>
  </Scratcher>
</template>
```

== Svelte

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Scratcher } from '@scratcher.js/svelte';
  import type { ScratchSnapshot } from '@scratcher.js/core';

  let imageData: ImageData | null = $state(null);

  onMount(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        imageData = ctx.getImageData(0, 0, img.width, img.height);
      }
    };
    img.src = '/star-shape.png';
  });

  function handleProgress(snapshot: ScratchSnapshot) {
    if (snapshot.area) {
      console.log(`영역 진행률: ${(snapshot.area.progress * 100).toFixed(1)}%`);
    }
  }
</script>

<Scratcher
  width={400}
  height={240}
  brushSize={30}
  area={imageData
    ? { imageData, alphaThreshold: 128, x: 150, y: 50, scale: 1 }
    : undefined}
  onProgress={handleProgress}
>
  <div
    style="background: linear-gradient(45deg, #FF6B6B, #4ECDC4); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;"
  >
    별 모양을 긁으세요!
  </div>
</Scratcher>
```

:::
