# 커스텀 긁기 예제 (Custom Scratch Example)

Scratcher.js는 기본적으로 원형 브러시로 긁는 효과를 제공하지만, `renderAtPoint` 옵션을 활용하면 긁는 방식을 자유롭게 커스텀할 수 있습니다.

예를 들어, 별 모양, 사각형, 이미지 등 다양한 긁기 효과를 직접 구현할 수 있습니다. 아래 예시들은 각 환경(Vanilla JS, React, Vue)에서 커스텀 긁기 효과를 적용하는 방법을 보여줍니다.

## Playground

아래 Playground는 직접 실습해볼 수 있는 예시입니다.

<CustomScratchPlayground />

## renderAtPoint 함수 예시

`renderAtPoint`를 사용하면, 긁는 모양을 원하는 대로 그릴 수 있습니다. 아래는 별 모양으로 긁는 예시입니다.

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

아래는 환경별(바닐라 JS, React, Vue) 커스텀 긁기 적용 예시입니다.

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

:::
