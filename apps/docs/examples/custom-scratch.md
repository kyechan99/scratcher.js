# Custom Scratch Example

Scratcher.js basically provides a circular brush scratching effect, but by using the `renderAtPoint` option, you can freely customize the scratching method.

For example, you can implement various scratching effects such as star shapes, rectangles, and images. The examples below show how to apply custom scratching effects in each environment (Vanilla JS, React, Vue).

## Playground

Below is a playground example you can try directly.

<CustomScratchPlayground />

## renderAtPoint Function Example

With `renderAtPoint`, you can draw the scratching shape as desired. Below is an example of scratching with a star shape.

```ts
function renderAtPoint(x: number, y: number, brushSize: number, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(
      Math.cos(((18 + i * 72) / 180) * Math.PI) * brushSize,
      -Math.sin(((18 + i * 72) / 180) * Math.PI) * brushSize,
    );
    ctx.lineTo(
      Math.cos(((54 + i * 72) / 180) * Math.PI) * (brushSize / 2),
      -Math.sin(((54 + i * 72) / 180) * Math.PI) * (brushSize / 2),
    );
  }
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fill();
  ctx.restore();
}
```

---

Below are examples of applying custom scratching effects for each environment (Vanilla JS, React, Vue).

:::tabs

== Vanilla

```ts
import { Scratcher } from '@scratcher.js/core';

const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
const scratcher = new Scratcher({
  width: 400,
  height: 240,
  brushSize: 30,
  renderAtPoint,
});
scratcher.bindCanvas(canvas);
```

== React

```tsx
<Scratcher
  class="react-scratch-card"
  width={400}
  height={240}
  brushSize={30}
  renderAtPoint={renderAtPoint}
>
  <div class="reward">Custom Scratch Example</div>
</Scratcher>
```

== Vue

```tsx
<Scratcher
  class="vue-scratch-card"
  :width="400"
  :height="240"
  :brushSize="30"
  :renderAtPoint="renderAtPoint"
>
  <div class="reward">Custom Scratch Example</div>
</Scratcher>
```

== Svelte

```svelte
<Scratcher
  class="svelte-scratch-card"
  width={400}
  height={240}
  brushSize={30}
  {renderAtPoint}
>
  <div class="reward">Custom Scratch Example</div>
</Scratcher>
```

:::
