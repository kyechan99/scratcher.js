---
title: Custom Area (Image)
---

# Custom Area Example

Scratcher.js can measure scratch progress in **specific areas** rather than the entire canvas. It supports rectangular areas and custom shape areas based on image alpha channels.

By using this, you can create scratch games where only specific parts need to be scratched for completion. For example, you can configure it so that only a specific part of a reward image needs to be scratched, or only a specific shape pattern needs to be scratched to complete the mission.

## Playground

In the playground below, areas are defined based on the image's alpha channel. You can upload an image and adjust the Alpha Threshold and position/size to see real-time changes in the area.

<ImageAreaPlayground />

## Image Mask-based Area

**Image mask-based areas** use the image's alpha channel (transparency) to define arbitrary shapes. Pixels with alpha values at or above a certain level are recognized as areas.

```ts
type ImageArea = {
  imageData: ImageData; // Canvas API's ImageData object
  alphaThreshold?: number; // Alpha value threshold (0-255, default: 128)
  x?: number; // X position of image area (default: 0)
  y?: number; // Y position of image area (default: 0)
  scale?: number; // Image size scale (default: 1)
};
```

**Alpha Threshold (alphaThreshold) Explanation:**

- **Range:** 0 (transparent) to 255 (opaque)
- **Meaning:** If a pixel's alpha value is at or above this value, it's included in the area
- **Default:** 128 (includes pixels 50% or more opaque)
- **Usage:** You can include/exclude edges of semi-transparent images

**Use cases:**

- Define complex shapes like animals, stars, hearts, and scratch them
- Scratch only specific parts of logo or character shapes
- Measure irregular areas like face regions in photos

## Image Mask-based Area Example

### Define Shape Area Using Image Alpha Channel

Define complex shapes based on image alpha channels. For example, only the non-transparent parts of a star-shaped PNG image are recognized as areas.

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

// Load image and extract ImageData
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

// Load image and set area
async function setupImageArea() {
  try {
    const imageData = await loadImageAsImageData('/star-shape.png');
    scratcher.setArea({
      imageData,
      alphaThreshold: 128, // Include pixels 50% or more opaque
      x: 150, // X position
      y: 50, // Y position
      scale: 1, // Size scale
    });
  } catch (error) {
    console.error('Image load failed:', error);
  }
}

setupImageArea();

// Monitor area progress
scratcher.on('progress', ({ snapshot }) => {
  if (snapshot.area) {
    console.log(`Area progress: ${(snapshot.area.progress * 100).toFixed(1)}%`);
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
    // Load image and extract ImageData
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
      console.log(`Area progress: ${(snapshot.area.progress * 100).toFixed(1)}%`);
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
        Scratch the star shape!
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
  // Load image and extract ImageData
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
    console.log(`Area Progress: ${(snapshot.area.progress * 100).toFixed(1)}%`);
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
      Scratch Here!
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
      console.log(`Area Progress: ${(snapshot.area.progress * 100).toFixed(1)}%`);
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
  callbacks={{ onProgress: handleProgress }}
>
  <div
    style="background: linear-gradient(45deg, #FF6B6B, #4ECDC4); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;"
  >
    Scratch the star shape!
  </div>
</Scratcher>
```

:::

### Fine-tuning with alpha thresholds

The inclusion range can be controlled by adjusting the alpha threshold in images with translucent edges.

```ts
// Low threshold: includes translucent parts as well (larger areas)
scratcher.setArea({
  imageData,
  alphaThreshold: 50, // Low threshold = more inclusive
  x: 150,
  y: 50,
  scale: 1,
});

// High threshold: only completely opaque areas (smaller areas)
scratcher.setArea({
  imageData,
  alphaThreshold: 200, // High threshold = more stringent
  x: 150,
  y: 50,
  scale: 1,
});
```

---

## Adjust image position and size

You can dynamically adjust the position and size of the image-based area.

```ts
// Change image position
scratcher.setArea({
  imageData,
  alphaThreshold: 128,
  x: 200, // x
  y: 100, // y
  scale: 1,
});

// Adjust image scale
scratcher.setArea({
  imageData,
  alphaThreshold: 128,
  x: 150,
  y: 50,
  scale: 0.8, // 80%
});

---
```
