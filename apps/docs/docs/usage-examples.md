# Usage Examples / 사용 예제

아래는 Scratcher.js의 다양한 사용 예제입니다.

## 기본 사용법 (Vanilla JS)

```ts
import { Scratcher } from '@scratcher.js/core';
const scratcher = new Scratcher({ ...scratcherConfig });
scratcher.bindCanvas(canvas);
```

## React 예제

````tsx
import { Scratcher } from '@scratcher.js/react';
<Scratcher
  {...scratcherConfig}
  callbacks={{
    onProgress: next => console.log(next.progress),
    onComplete: () => console.log('completed'),

  ## 고급 예시

  ### 커스텀 커버 (bindingOptions)

  커버를 커스텀하게 렌더링하려면 `bindingOptions.renderCover` 콜백을 활용할 수 있습니다.

  ::: tip
  **실제 동작을 Vue 컴포넌트로 직접 테스트해보고 싶다면 [examples/custom-cover.md](../examples/custom-cover.md) 문서를 참고하세요.**
  :::

  해당 문서에는 VitePress/Vue 환경에서 바로 복사해 붙여넣고 실습할 수 있는 예시가 포함되어 있습니다.

  아래는 간단한 예시 코드입니다:

  ```js
  scratcher.bindCanvas(canvas, {
    renderCover: (canvas, cover, width, height) => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 예: 그라데이션 커버
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#ff0');
        grad.addColorStop(1, '#f0f');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    },
  });
````

더 다양한 커버 커스텀 예시는 [examples/custom-cover.md](../examples/custom-cover.md)에서 Vue 컴포넌트로 직접 테스트해볼 수 있습니다.

---

## 고급 활용 예시

### 1. bindingOptions로 커스텀 커버 렌더링 (Vanilla JS)

```js
import { Scratcher } from '@scratcher.js/core';
const canvas = document.getElementById('my-canvas');
const scratcher = new Scratcher({ ...config });
scratcher.bindCanvas(canvas, {
  renderCover: (canvas, cover, width, height) => {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 예: 그라데이션 커버
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#ff0');
      grad.addColorStop(1, '#f0f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  },
});
```

### 2. bindingOptions로 커스텀 긁기 효과 (Vanilla JS)

```js
scratcher.bindCanvas(canvas, {
  renderAtPoint: (x, y, brushSize, canvas) => {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 예: 별 모양 긁기
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(
          x + brushSize * Math.cos(((18 + 72 * i) * Math.PI) / 180),
          y - brushSize * Math.sin(((18 + 72 * i) * Math.PI) / 180),
        );
        ctx.lineTo(
          x + (brushSize / 2) * Math.cos(((54 + 72 * i) * Math.PI) / 180),
          y - (brushSize / 2) * Math.sin(((54 + 72 * i) * Math.PI) / 180),
        );
      }
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill();
      ctx.restore();
    }
  },
});
```

### 3. 긁기 완료 시 애니메이션 실행 (React)

```tsx
import { useRef } from 'react';
import { Scratcher } from '@scratcher.js/react';

function Coupon() {
  const ref = useRef();
  return (
    <Scratcher
      ref={ref}
      {...scratcherConfig}
      callbacks={{
        onComplete: () => {
          // 예: confetti 애니메이션 실행
          window.confetti?.();
        },
      }}
    >
      <div>축하합니다! 쿠폰이 공개되었습니다.</div>
    </Scratcher>
  );
}
```

## 콜백 활용 예시 (React)

```tsx
<Scratcher
  {...scratcherConfig}
  callbacks={{
    onProgress: next => console.log('진행률:', next.progress),
    onComplete: () => alert('축하합니다! 긁기 완료'),
    onReset: () => console.log('리셋됨'),
  }}
>
  <div>React: React Coupon</div>
</Scratcher>
```

## bindCanvas 함수

Scratcher.js는 긁기 동작을 실제로 활성화하려면 반드시 `bindCanvas(canvas)` 함수를 호출해야 합니다. 이 함수는 내부적으로 마우스/터치 이벤트를 바인딩하고, 긁기 효과를 렌더링합니다.

### 반드시 호출해야 하는 이유

- bindCanvas를 호출하지 않으면 긁기 동작이 동작하지 않습니다 (이벤트가 연결되지 않음)
- React/Vue 컴포넌트는 내부적으로 자동 호출하지만, Vanilla JS/직접 사용 시에는 반드시 직접 호출해야 합니다.

### 사용 예시 (Vanilla JS)

```js
import { Scratcher } from '@scratcher.js/core';
const canvas = document.getElementById('my-canvas');
const scratcher = new Scratcher({ ...config });
scratcher.bindCanvas(canvas);
```

### React/Vue/React Native에서의 동작

- React/Vue 컴포넌트는 내부적으로 bindCanvas를 자동으로 호출하므로 별도 호출이 필요 없습니다.
- 직접 커스텀 캔버스를 사용할 경우에는 ref로 캔버스 DOM을 받아 직접 bindCanvas를 호출해야 합니다.

> bindCanvas는 언바인드 함수(unbind)를 반환하므로, 필요시 언마운트 시점에 정리(cleanup)할 수 있습니다.
