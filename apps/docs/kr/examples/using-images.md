# 이미지 커버와 리워드 예시 (Custom Image Example)

Scratcher.js는 reward(긁힌 후 보상)와 cover(긁기 전 덮개)에 이미지를 자유롭게 적용할 수 있습니다. 아래는 각각의 방식과 Playground, 그리고 환경별 코드 예시입니다.

::: info
Scratcher의 cover는 내부적으로 `globalCompositeOperation` 값을 조정하여 긁기 효과와 보상 노출을 구현합니다. 대부분의 경우, `renderCover` 함수에서는 별도의 설정이 필요하지 않습니다.

하지만 이미지나 복잡한 커버 효과를 직접 구현할 때, cover가 정상적으로 보이지 않거나 긁기 효과가 작동하지 않게 렌더링되는 경우가 있을 수 있습니다. 이럴 때는 `globalCompositeOperation`를 명시적으로 설정해주면 원하는 결과를 얻을 수 있습니다.
:::

## cover 이미지

<CustomImageCoverPlayground />

### cover 이미지 예시

cover에 이미지를 넣으려면 `renderCover` 옵션을 사용해 캔버스에 이미지를 그릴 수 있습니다.

이는 [examples/Custom-Cover](/kr/examples/custom-cover) 예시와 유사하게 작동합니다.

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

아래는 환경별(바닐라 JS, React, Vue) 이미지 커버/리워드 적용 예시입니다.

:::tabs

== Vanilla

```ts
import { Scratcher } from '@scratcher.js/core';

const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
const scratcher = new Scratcher({
  width: 400,
  height: 240,
  brushSize: 30,
  renderCover, // 이미지 커버 함수
});
scratcher.bindCanvas(canvas);
```

== React

```tsx
<Scratcher
  width={400}
  height={240}
  brushSize={30}
  renderCover={renderCover} // 이미지 커버 함수
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

## reward 이미지

<CustomImageRewardPlayground/>

### reward 이미지 예시

reward에는 단순히 `<img>` 태그를 넣으면 됩니다.

```tsx
<Scratcher {...config}>
  <img
    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300"
    alt="reward"
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
</Scratcher>
```
