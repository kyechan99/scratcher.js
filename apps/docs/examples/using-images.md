# Using Images with Cover and Reward

Scratcher.js allows you to freely apply images to reward (what's revealed after scratching) and cover (the overlay before scratching). Below are the methods for each, playgrounds, and code examples for each environment.

::: info
Scratcher's cover internally adjusts the `globalCompositeOperation` value to implement the scratching effect and reward reveal. In most cases, no special settings are needed in the `renderCover` function.

However, when directly implementing images or complex cover effects, the cover may not display properly or the scratching effect may not work correctly. In such cases, you can get the desired result by explicitly setting `globalCompositeOperation`.
:::

## Cover Image

<CustomImageCoverPlayground />

### Cover Image Example

To add an image to the cover, use the `renderCover` option to draw the image on the canvas.

This works similarly to the [examples/Custom-Cover](/examples/custom-cover) example.

```ts
function renderCover(canvas: HTMLCanvasElement, width: number, height: number, _cover: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    ctx.globalCompositeOperation = prev;
  };
  img.src = 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=300';
}
```

---

Below are examples of applying image covers/rewards for each environment (Vanilla JS, React, Vue).

:::tabs

== Vanilla

```ts
import { Scratcher } from '@scratcher.js/core';

const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
const scratcher = new Scratcher({
  width: 400,
  height: 240,
  brushSize: 30,
  renderCover, // Image cover function
});
scratcher.bindCanvas(canvas);
```

== React

```tsx
<Scratcher
  width={400}
  height={240}
  brushSize={30}
  renderCover={renderCover} // Image cover function
>
  <img
    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300"
    alt="reward"
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
</Scratcher>
```

== Vue

```vue
<Scratcher :width="400" :height="240" :brushSize="30" :renderCover="renderCover">
  <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300" alt="reward" style="width: 100%; height: 100%; object-fit: cover;" />
</Scratcher>
```

== Svelte

```svelte
<Scratcher width={400} height={240} brushSize={30} {renderCover}>
  <img
    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300"
    alt="reward"
    style="width: 100%; height: 100%; object-fit: cover;"
  />
</Scratcher>
```

:::

## Reward Image

<CustomImageRewardPlayground/>

### Reward Image Example

For the reward, simply use an `<img>` tag.

```tsx
<Scratcher {...config}>
  <img
    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300"
    alt="reward"
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
</Scratcher>
```
