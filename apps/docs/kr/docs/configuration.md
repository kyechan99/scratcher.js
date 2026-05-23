# Configuration / 설정

Scratcher.js 및 각 프레임워크별 패키지의 주요 설정 방법과 옵션을 안내합니다. 모든 환경에서 거의 동일한 옵션을 사용하며, 프레임워크별로 전달 방식만 다릅니다.

## 공통 옵션 (Core)

| 옵션명              | 타입         | 설명                                                                                                                         | 기본값 |
| ------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------ |
| width \*            | number       | 캔버스 가로(px). 드로잉 버퍼 크기이며, 래퍼에선 표시 폭(또는 [`responsive`](#responsive-sizing) 사용 시 최대 폭)을 겸합니다. | -      |
| height \*           | number       | 캔버스 세로(px). 드로잉 버퍼 크기이며, 래퍼가 [`responsive`](#responsive-sizing)일 때 표시 높이는 자동 계산됩니다.           | -      |
| brushSize           | number       | 긁기 브러시 크기(px)                                                                                                         | 30     |
| cellSize            | number       | 진행률 추적용 격자 셀 크기(px). 작을수록 세밀함.                                                                             | 16     |
| completionThreshold | number (0~1) | 긁기 완료로 간주할 퍼센트(진행률)                                                                                            | 0.7    |
| revealOnCompletion  | boolean      | 긁기 완료 시 전체를 자동으로 공개할지 여부                                                                                   | false  |
| cover               | string       | 덮을 색상 또는 이미지 URL                                                                                                    | #ccc   |
| disabled            | boolean      | 긁기 비활성화 여부                                                                                                           | false  |
| callbacks           | function     | 자세히보기 : [Callbacks](#callbacks-option-details)                                                                          | -      |

- [Area](#area-영역): 특정 영역만 측정

### config 예시

```ts
const scratcherConfig = {
  width: 300,
  height: 150,
  brushSize: 30,
  cellSize: 16, // 진행률 추적용 격자 셀 크기(px). 작을수록 세밀함.
  completionThreshold: 0.7, // 긁기 완료 퍼센트(0~1)
  revealOnCompletion: true, // 긁기 완료 시 전체 자동 공개
  cover: '#ccc', // 덮개 색상 또는 이미지 URL
  disabled: false,
  onProgress: next => console.log(next.progress),
  onComplete: () => alert('긁기 완료!'),
};
```

## 프레임워크별 전달 방식

- **Vanilla JS**: `new Scratcher(config)`
- **React**: `<Scratcher {...config} />`
- **Vue**: `<Scratcher v-bind="config" />`
- **Svelte**: `<Scratcher {...config} />`

## 콜백(callbacks) 옵션 상세

콜백은 긁기 동작의 다양한 시점에 실행되는 함수로, 아래와 같이 설정할 수 있습니다.

| 콜백명         | 호출 시점 및 인자 설명                                   |
| -------------- | -------------------------------------------------------- |
| onScratchStart | 긁기 시작 시 (point, snapshot)                           |
| onScratchMove  | 긁는 중 (point, snapshot)                                |
| onScratchEnd   | 긁기 끝났을 때(마우스/터치 뗄 때) (snapshot)             |
| onReset        | 긁기 상태가 리셋될 때 (snapshot)                         |
| onProgress     | 긁기 진행률이 변할 때 (snapshot)                         |
| onComplete     | 긁기 완료(설정한 completionThreshold 도달) 시 (snapshot) |

각 콜백의 인자:

- `point`: { x, y } (2D 좌표)
- `snapshot`: { scratchedCells, totalCells, progress } (현재 긁기 상태)

## area (영역)

Scratcher.js 는 전체 캔버스 영역이 아닌 **특정 영역(Area)** 에서 긁기 진행도를 측정할 수 있습니다.더 자세한 사용법은 아래 Examples 페이지에서 확인해주세요.

- [Custom Area (Rect)](/kr/examples/custom-area-rect)
- [Custom Area (Image)](/kr/examples/custom-area-image)

## 반응형 크기 조정

React, Vue, Svelte 래퍼는 기본적으로 `width × height` 고정 크기로 렌더링됩니다. `responsive` prop을 켜면 부모 컨테이너가 좁아질 때 비율을 유지하며 축소됩니다:

```tsx
// React
<Scratcher {...config} responsive />
```

```vue
<!-- Vue -->
<Scratcher v-bind="config" responsive />
```

```svelte
<!-- Svelte -->
<Scratcher {...config} responsive />
```

`responsive`가 켜지면 래퍼는 `width: ${width}px; max-width: 100%; min-width: 0; aspect-ratio: ${width} / ${height}` 스타일로 렌더링됩니다:

- 부모가 `width` 이상: 지정한 `width × height` 그대로 렌더링 (기본 고정 크기와 동일).
- 부모가 `width` 미만: 부모 폭에 맞춰 비율을 유지하며 축소.

포인터 좌표는 `responsive` 여부와 무관하게 Core 엔진이 자동 보정하므로, 캔버스가 CSS로 축소되어도 스크래치 위치가 정확히 따라옵니다. Vanilla JS에서 직접 캔버스 CSS 크기를 조정하는 경우에도 동일하게 적용됩니다.

`responsive` 래퍼 안에 커스텀 오버레이(영역 마커 등)를 배치한다면 픽셀 좌표 대신 % 좌표를 사용하는 것을 권장합니다. 그래야 캔버스가 축소될 때 함께 움직입니다.

### Vanilla JS

Core 엔진은 `<canvas>` 요소의 CSS를 건드리지 않으므로, 반응형은 전적으로 사용자가 처리합니다. 원하는 대로 캔버스 스타일을 지정하세요 — 엔진이 포인터 좌표를 드로잉 버퍼 좌표로 자동 보정하므로 스크래치 위치가 손가락을 정확히 따라옵니다:

```html
<canvas
  id="my-canvas"
  width="400"
  height="240"
  style="width: 100%; max-width: 400px; aspect-ratio: 400 / 240;"
></canvas>
```

```ts
import { Scratcher } from '@scratcher.js/core';

const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
const scratcher = new Scratcher({
  width: 400, // 드로잉 버퍼 크기 (해상도)
  height: 240,
  brushSize: 30,
  cover: '#ccc',
});
scratcher.bindCanvas(canvas);
```

HTML의 `width`/`height` 속성은 드로잉 버퍼를, CSS는 표시 크기를 정합니다. 둘이 같지 않아도 됩니다.
