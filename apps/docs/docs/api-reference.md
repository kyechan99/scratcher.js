# API Reference / API 문서

Scratcher.js의 주요 클래스, 옵션, 메서드, 콜백에 대한 문서입니다.

Scratcher.js의 핵심 클래스인 `Scratcher`는 긁기 엔진의 모든 동작을 담당합니다. 아래는 public 생성자, 프로퍼티, 메서드, 사용 예시입니다.

## snapshot

긁기 상태(진행률, 긁힌 셀 수 등)를 담고 있는 객체입니다.

**Return value**

| Type            | Description                                               |
| --------------- | --------------------------------------------------------- |
| ScratchSnapshot | `{ scratchedCells, totalCells, progress }` 긁기 상태 객체 |

**Example**

```js
const progress = scratcher.snapshot.progress; // 0~1
```

## isDrawing

현재 긁기 동작이 진행 중인지 여부입니다.

**Return value**

| Type    | Description      |
| ------- | ---------------- |
| boolean | 긁기 중이면 true |

**Example**

```js
if (scratcher.isDrawing) {
  // 긁기 중
}
```

## isCompleted

긁기 완료(설정한 completionThreshold 도달) 여부입니다.

**Return value**

| Type    | Description      |
| ------- | ---------------- |
| boolean | 긁기 완료면 true |

**Example**

```js
if (scratcher.isCompleted) alert('완료!');
```

## shouldRevealOnCompletion

긁기 완료 시 전체를 자동으로 공개할지 여부입니다.

**Return value**

| Type    | Description                 |
| ------- | --------------------------- |
| boolean | 긁기 완료 시 전체 공개 옵션 |

## currentBrushSize

현재 브러시 크기(px)입니다.

**Return value**

| Type   | Description          |
| ------ | -------------------- |
| number | 현재 브러시 크기(px) |

**Example**

```js
scratcher.setBrushSize(40);
console.log(scratcher.currentBrushSize); // 40
```

각 메서드/프로퍼티의 상세 설명은 아래를 참고하세요.

## start

긁기 동작을 시작합니다. (예: 마우스/터치 다운)

**Parameters**

| Name  | Type       | Description    |
| ----- | ---------- | -------------- |
| point | `{ x, y }` | 긁기 시작 좌표 |

**Return value**

| Type            | Description         |
| --------------- | ------------------- |
| ScratchSnapshot | 현재 긁기 상태 객체 |

**Example**

```js
scratcher.start({ x: 10, y: 20 });
```

## move

긁는 중(마우스/터치 이동) 호출합니다.

**Parameters**

| Name  | Type       | Description    |
| ----- | ---------- | -------------- |
| point | `{ x, y }` | 긁기 이동 좌표 |

**Return value**

| Type            | Description         |
| --------------- | ------------------- |
| ScratchSnapshot | 현재 긁기 상태 객체 |

## end

긁기 동작을 종료합니다. (마우스/터치 업)

**Return value**

| Type            | Description         |
| --------------- | ------------------- |
| ScratchSnapshot | 현재 긁기 상태 객체 |

## reset

긁기 상태를 초기화하고 커버를 다시 그립니다.

**Return value**

| Type            | Description             |
| --------------- | ----------------------- |
| ScratchSnapshot | 초기화된 긁기 상태 객체 |

## setBrushSize

브러시 크기를 동적으로 변경합니다.

**Parameters**

| Name | Type   | Description            |
| ---- | ------ | ---------------------- |
| size | number | 변경할 브러시 크기(px) |

**Return value**

| Type | Description |
| ---- | ----------- |
| void | 반환값 없음 |

## setCallbacks

긁기 이벤트 콜백을 등록/변경합니다.

**Parameters**

| Name      | Type   | Description               |
| --------- | ------ | ------------------------- |
| callbacks | object | 콜백 객체 (이벤트 핸들러) |

**Return value**

| Type | Description |
| ---- | ----------- |
| void | 반환값 없음 |

## bindCanvas

캔버스에 긁기 이벤트를 바인딩합니다. 반드시 호출해야 긁기 동작이 활성화됩니다.

**Parameters**

| Name    | Type   | Description        |
| ------- | ------ | ------------------ |
| canvas  | Canvas | 캔버스 요소        |
| options | object | (선택) 바인딩 옵션 |

**Return value**

| Type     | Description        |
| -------- | ------------------ |
| function | 언바인드 함수 반환 |

## unbindCanvas

바인딩된 캔버스를 해제합니다.

**Return value**

| Type | Description |
| ---- | ----------- |
| void | 반환값 없음 |

## on

커스텀 이벤트(scratchStart, progress 등)를 직접 구독할 수 있습니다.

**Parameters**

| Name      | Type     | Description                                                                             |
| --------- | -------- | --------------------------------------------------------------------------------------- |
| eventname | string   | 이벤트명 (`scratchStart`, `scratchMove`, `scratchEnd`, `reset`, `progress`, `complete`) |
| listener  | function | 이벤트 핸들러 함수                                                                      |

**Return value**

| Type     | Description        |
| -------- | ------------------ |
| function | 언바인드 함수 반환 |
