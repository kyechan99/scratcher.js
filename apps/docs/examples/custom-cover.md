# 커스텀 커버 예제 (Custom Cover Example)

Scratcher.js는 기본적으로 단색 또는 이미지 커버를 지원하지만, `renderCover` 옵션을 활용하면 캔버스에 원하는 방식으로 커버를 자유롭게 그릴 수 있습니다.

예를 들어, 그라데이션, 패턴, 동적 효과 등 다양한 커버를 직접 구현할 수 있습니다. 아래 예시들은 각 환경(Vanilla JS, React, Vue)에서 커스텀 커버를 적용하는 방법을 보여줍니다.

## Playground

아래 Playground는 직접 실습해볼 수 있는 Vue 예시입니다.

<CustomCoverPlayground />
 
## renderCover 함수 예시

`renderCover` 를 통해 커스텀 커버를 사용하게 되면, 단색 커버를 제공하는 `cover` 는 사용하지 않게됩니다.
다만 `renderCover` 의 매개변수로 `cover` 값을 제공하기 때문에, 사용이 필요할 경우 활용하세요.

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

아래는 환경별(바닐라 JS, React, Vue) 커스텀 커버 적용 예시입니다.

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

:::
