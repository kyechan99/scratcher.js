# Getting Started / 시작하기

## 설치 / Installation

Scratcher.js는 모노레포 구조로, core(공통), react, vue, react-native 패키지가 분리되어 있습니다.
pnpm, npm, yarn 등 원하는 패키지 매니저로 설치할 수 있습니다.

:::tabs
== Vanilla

```bash
npm i @scratcher.js/core
```

== React

```bash
npm i @scratcher.js/react
```

== Vue

```bash
npm i @scratcher.js/vue
```

== React Native

```bash
npm i @scratcher.js/react-native
```

:::

## 빠른 시작 / Quick Start

아래는 각 환경별 기본 사용 예시입니다. 실제 사용 시, config 객체에 필수 옵션(캔버스 크기, 커버/배경 등)을 지정해야 하며, 콜백 등 추가 옵션도 자유롭게 활용할 수 있습니다.

config 값에 대한 자세한 설명은 [Configuration](/docs/configuration) 에서 확인해주세요.

### config 예시 및 주요 옵션

```ts
const scratcherConfig = {
  width: 300, // 캔버스 가로
  height: 150, // 캔버스 세로
  brushSize: 30, // 브러시 크기
  threshold: 0.7, // 긁기 완료 퍼센트(0~1)
  cover: '#ccc', // 덮개 색상 또는 이미지
  background: '/img/coupon.png', // 배경 이미지
  // 콜백 예시
  callbacks: {
    onProgress: next => console.log('진행률:', next.progress),
    onComplete: () => alert('긁기 완료!'),
  },
};
```

> width/height는 필수, cover/background는 색상 또는 이미지 모두 지원, 콜백은 필요에 따라 추가

### Vanilla JS

```ts
import { Scratcher } from '@scratcher.js/core';
const scratcher = new Scratcher(scratcherConfig);
```

### React

```tsx
import { Scratcher } from '@scratcher.js/react';
<Scratcher {...scratcherConfig} />;
```

### Vue

```vue
<Scratcher v-bind="scratcherConfig" />
```

### React Native

```ts
import { useNativeScratchController } from '@scratcher.js/react-native';
const { scratcher } = useNativeScratchController(scratcherConfig);
```

## 통합 팁

- config, 콜백, 커버/배경 등은 모든 환경에서 거의 동일하게 사용 가능
- 프레임워크별 문법만 맞추면 쉽게 이식 가능
- 더 다양한 예제와 고급 사용법은 [Usage Examples](./usage-examples) 문서를 참고하세요.
