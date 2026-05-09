# Configuration / 설정

Scratcher.js 및 각 프레임워크별 패키지의 주요 설정 방법과 옵션을 안내합니다. 모든 환경에서 거의 동일한 옵션을 사용하며, 프레임워크별로 전달 방식만 다릅니다.

## 공통 옵션 (Core)

| 옵션명              | 타입         | 설명                                       | 기본값 |
| ------------------- | ------------ | ------------------------------------------ | ------ |
| width \*            | number       | 캔버스 가로(px)                            | -      |
| height \*           | number       | 캔버스 세로(px)                            | -      |
| brushSize           | number       | 긁기 브러시 크기(px)                       | 30     |
| coverage            | number (0~1) | 초기 덮개 비율(0=없음, 1=전체 덮개)        | 1      |
| completionThreshold | number (0~1) | 긁기 완료로 간주할 퍼센트(진행률)          | 0.7    |
| revealOnCompletion  | boolean      | 긁기 완료 시 전체를 자동으로 공개할지 여부 | false  |
| cover               | string       | 덮을 색상 또는 이미지 URL                  | #ccc   |
| disabled            | boolean      | 긁기 비활성화 여부                         | false  |
| callbacks           | object       | 콜백(onProgress, onComplete 등)            | -      |

- [Area](#area): 특정 영역만 측정

### config 예시

```ts
const scratcherConfig = {
  width: 300,
  height: 150,
  brushSize: 30,
  coverage: 1, // 1=전체 덮개, 0.5=절반만 덮개 등
  completionThreshold: 0.7, // 긁기 완료 퍼센트(0~1)
  revealOnCompletion: true, // 긁기 완료 시 전체 자동 공개
  cover: '#ccc', // 덮개 색상 또는 이미지 URL
  disabled: false,
  callbacks: {
    onProgress: next => console.log(next.progress),
    onComplete: () => alert('긁기 완료!'),
  },
};
```

## 프레임워크별 전달 방식

- **Vanilla JS**: `new Scratcher(config)`
- **React**: `<Scratcher {...config} />`
- **Vue**: `<Scratcher v-bind="config" />`
- **React Native**: `useNativeScratchController(config)`

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

## area

Scratcher.js 는 전체 캔버스 영역이 아닌 **특정 영역(Area)** 에서 긁기 진행도를 측정할 수 있습니다.더 자세한 사용법은 아래 Examples 페이지에서 확인해주세요.

- [Custom Area (Rect)](/examples/custom-area-rect)
- [Custom Area (Image)](/examples/custom-area-image)
