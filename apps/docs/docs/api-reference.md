# API Reference

Documentation for the main classes, options, methods, and callbacks of Scratcher.js.

The core class `Scratcher` of Scratcher.js handles all scratch engine operations. Below are public constructors, properties, methods, and usage examples.

## snapshot

An object that contains the scratch state (progress, scratched cells count, etc.).

**Return value**

| Type            | Description                                                     |
| --------------- | --------------------------------------------------------------- |
| ScratchSnapshot | `{ scratchedCells, totalCells, progress }` Scratch state object |

**Example**

```js
const progress = scratcher.snapshot.progress; // 0~1
```

## isDrawing

Whether scratching is currently in progress.

**Return value**

| Type    | Description        |
| ------- | ------------------ |
| boolean | true if scratching |

**Example**

```js
if (scratcher.isDrawing) {
  // Currently scratching
}
```

## isCompleted

Whether scratching is complete (completionThreshold reached).

**Return value**

| Type    | Description      |
| ------- | ---------------- |
| boolean | true if complete |

**Example**

```js
if (scratcher.isCompleted) alert('Complete!');
```

## shouldRevealOnCompletion

Whether to auto-reveal all on scratch completion.

**Return value**

| Type    | Description                      |
| ------- | -------------------------------- |
| boolean | Auto-reveal on completion option |

## currentBrushSize

Current brush size (px).

**Return value**

| Type   | Description             |
| ------ | ----------------------- |
| number | Current brush size (px) |

**Example**

```js
scratcher.setBrushSize(40);
console.log(scratcher.currentBrushSize); // 40
```

See below for detailed descriptions of each method/property.

## start

Start scratching operation. (e.g., mouse/touch down)

**Parameters**

| Name  | Type       | Description              |
| ----- | ---------- | ------------------------ |
| point | `{ x, y }` | Scratch start coordinate |

**Return value**

| Type            | Description                  |
| --------------- | ---------------------------- |
| ScratchSnapshot | Current scratch state object |

**Example**

```js
scratcher.start({ x: 10, y: 20 });
```

## move

Called during scratching (mouse/touch move).

**Parameters**

| Name  | Type       | Description             |
| ----- | ---------- | ----------------------- |
| point | `{ x, y }` | Scratch move coordinate |

**Return value**

| Type            | Description                  |
| --------------- | ---------------------------- |
| ScratchSnapshot | Current scratch state object |

## end

End scratching operation. (mouse/touch up)

**Return value**

| Type            | Description                  |
| --------------- | ---------------------------- |
| ScratchSnapshot | Current scratch state object |

## reset

Reset scratching state and redraw cover.

**Return value**

| Type            | Description                |
| --------------- | -------------------------- |
| ScratchSnapshot | Reset scratch state object |

## setBrushSize

Dynamically change brush size.

**Parameters**

| Name | Type   | Description               |
| ---- | ------ | ------------------------- |
| size | number | Brush size to change (px) |

**Return value**

| Type | Description     |
| ---- | --------------- |
| void | No return value |

## setCallbacks

Register/change scratch event callbacks.

**Parameters**

| Name      | Type   | Description                      |
| --------- | ------ | -------------------------------- |
| callbacks | object | Callback object (event handlers) |

**Return value**

| Type | Description     |
| ---- | --------------- |
| void | No return value |

## bindCanvas

Bind scratching events to canvas. Must be called for scratching to be active.

**Parameters**

| Name    | Type   | Description                |
| ------- | ------ | -------------------------- |
| canvas  | Canvas | Canvas element             |
| options | object | (Optional) Binding options |

**Return value**

| Type     | Description            |
| -------- | ---------------------- |
| function | Return unbind function |

## unbindCanvas

Unbind the canvas.

**Return value**

| Type | Description     |
| ---- | --------------- |
| void | No return value |

## on

Subscribe to custom events (scratchStart, progress, etc.).

**Parameters**

| Name      | Type     | Description                                                                               |
| --------- | -------- | ----------------------------------------------------------------------------------------- |
| eventname | string   | Event name (`scratchStart`, `scratchMove`, `scratchEnd`, `reset`, `progress`, `complete`) |
| listener  | function | Event handler function                                                                    |

**Return value**

| Type     | Description            |
| -------- | ---------------------- |
| function | Return unbind function |
