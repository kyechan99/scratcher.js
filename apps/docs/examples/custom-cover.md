# Custom Cover Example

Scratcher.js basically supports solid colors or image covers, but by using the `renderCover` option, you can freely draw covers on the canvas in any way you want.

For example, you can implement various covers such as gradients, patterns, and dynamic effects. The examples below show how to apply custom covers in each environment (Vanilla JS, React, Vue).

## Playground

Below is a playground example you can try directly.

<CustomCoverPlayground />
 
## renderCover Function Example

When you use a custom cover through `renderCover`, the solid color cover provided by the `cover` option is not used. However, since the `cover` value is provided as a parameter to `renderCover`, you can use it if needed.

```ts
function renderCover(canvas: HTMLCanvasElement, cover: string, width: number, height: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  // custom Gradient cover
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#7700ff');
  grad.addColorStop(1, '#bf4587');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}
```

---

Below are examples of applying custom covers for each environment (Vanilla JS, React, Vue).

:::tabs

== Vanilla

```ts
import { Scratcher } from '@scratcher.js/core';

const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
const scratcher = new Scratcher({
  width: 400,
  height: 240,
  brushSize: 30,
  renderCover,
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
  renderCover={renderCover}
>
  <div class="reward">Custom Cover Example</div>
</Scratcher>
```

== Vue

```tsx
<Scratcher
  class="vue-scratch-card"
  :width="400"
  :height="240"
  :brushSize="30"
  :renderCover="renderCover"
>
  <div class="reward">Custom Cover Example</div>
</Scratcher>
```

== Svelte

```svelte
<Scratcher
  class="svelte-scratch-card"
  width={400}
  height={240}
  brushSize={30}
  {renderCover}
>
  <div class="reward">Custom Cover Example</div>
</Scratcher>
```

:::
