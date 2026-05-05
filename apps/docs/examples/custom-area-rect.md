---
title: Custom Area (Rect)
---

# Custom Area Example

Scratcher.js can measure scratch progress in **specific areas** rather than the entire canvas. It supports rectangular areas and custom shape areas based on image alpha channels.

By using this, you can create scratch games where only specific parts need to be scratched for completion. For example, you can configure it so that only a specific part of a reward image needs to be scratched, or only a specific shape pattern needs to be scratched to complete the mission.

## Playground

In the playground below, only a rectangular area marked with a green dashed box is measured. Try scratching the blue box area to check the progress.

<RectAreaPlayground />

## Rectangular Area

**Rectangular areas** are the simplest method, measuring progress only in a rectangular area defined by x, y, width, and height.

```ts
type RectArea = {
  x: number; // Left x coordinate of the area (pixels)
  y: number; // Top y coordinate of the area (pixels)
  width: number; // Width of the area (pixels)
  height: number; // Height of the area (pixels)
};
```

**Use cases:**

- Scratch only a specific part of a card in a card game
- Measure only the box area containing winning numbers in scratch lottery
- Recognize scratch completion only within specific zones

## Rectangular Area Example

### Basic Rectangular Area

Define a rectangular area starting from position (50, 50) with width 150 and height 150 within the canvas.

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

// Set rectangular area
scratcher.setArea({
  x: 50,
  y: 50,
  width: 150,
  height: 150,
});

// Monitor area progress
scratcher.on('progress', ({ snapshot }) => {
  if (snapshot.area) {
    console.log(`Area progress: ${(snapshot.area.progress * 100).toFixed(1)}%`);
    console.log(`Scratched cells: ${snapshot.area.scratchedCells} / ${snapshot.area.totalCells}`);
  }
});

scratcher.on('complete', ({ snapshot }) => {
  if (snapshot.area) {
    console.log('Area completely scratched!');
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
      console.log(`Area progress: ${(snapshot.area.progress * 100).toFixed(1)}%`);
      console.log('Area completely scratched!');
    }
  };

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
        Scratch to check the result!
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
    console.log(`Area progress: ${(snapshot.area.progress * 100).toFixed(1)}%`);
  }
}

function handleComplete() {
  const snapshot = scratcherRef.value?.snapshot;
  if (snapshot?.area) {
    console.log('Area completely scratched!');
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
      Scratch to check the result!
    </div>
  </Scratcher>
</template>
```

:::

---

## Remove Area

You can remove area measurement at any time by calling `setArea()` without arguments.

```ts
// Remove area measurement - only calculate progress for the entire canvas
scratcher.setArea();

// Or explicitly pass undefined
scratcher.setArea(undefined);
```

---

## Progress Information

When an area is set, area-specific progress information is included in `snapshot.area`.

```ts
scratcher.on('progress', ({ snapshot }) => {
  // Overall canvas progress
  console.log(`Overall: ${snapshot.progress.toFixed(2)}`);

  // Area progress (only if area is set)
  if (snapshot.area) {
    console.log(`Area progress: ${snapshot.area.progress.toFixed(2)}`);
    console.log(`Area scratched cells: ${snapshot.area.scratchedCells}`);
    console.log(`Area total cells: ${snapshot.area.totalCells}`);
  }
});
```

---
