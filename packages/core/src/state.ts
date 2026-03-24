import { BrushStroke, ScratchEngineOptions, ScratchSnapshot, ScratchStore } from './types';

export type ScratchGridState = {
  width: number;
  height: number;
  cols: number;
  rows: number;
  cellSize: number;
  grid: Uint8Array;
  scratchedCells: number;
};

function createGridState(options: ScratchEngineOptions): ScratchGridState {
  const width = options.width;
  const height = options.height;
  const cellSize = Math.max(1, options.coverage ?? 16);
  const cols = Math.max(1, Math.ceil(width / cellSize));
  const rows = Math.max(1, Math.ceil(height / cellSize));

  return {
    width,
    height,
    cols,
    rows,
    cellSize,
    grid: new Uint8Array(cols * rows),
    scratchedCells: 0,
  };
}

export function scratchSnapshot(state: ScratchGridState): ScratchSnapshot {
  const totalCells = state.grid.length;

  return {
    scratchedCells: state.scratchedCells,
    totalCells,
    progress: state.scratchedCells / totalCells,
  };
}

export function resetScratchState(state: ScratchGridState): ScratchSnapshot {
  state.grid.fill(0);
  state.scratchedCells = 0;
  return scratchSnapshot(state);
}

export function revealAllScratchState(state: ScratchGridState): ScratchSnapshot {
  const totalCells = state.grid.length;

  for (let i = 0; i < totalCells; i += 1) {
    if (state.grid[i] === 0) {
      state.grid[i] = 1;
      state.scratchedCells += 1;
    }
  }

  return scratchSnapshot(state);
}

export function applyStrokeToScratchState(
  state: ScratchGridState,
  stroke: BrushStroke,
): ScratchSnapshot {
  const radius = Math.max(1, stroke.size / 2);

  for (const point of stroke.points) {
    markScratchCircle(state, point.x, point.y, radius);
  }

  return scratchSnapshot(state);
}

function markScratchCircle(state: ScratchGridState, x: number, y: number, radius: number): void {
  const minX = Math.max(0, Math.floor((x - radius) / state.cellSize));
  const maxX = Math.min(state.cols - 1, Math.floor((x + radius) / state.cellSize));
  const minY = Math.max(0, Math.floor((y - radius) / state.cellSize));
  const maxY = Math.min(state.rows - 1, Math.floor((y + radius) / state.cellSize));
  const radiusSquared = radius * radius;

  for (let row = minY; row <= maxY; row += 1) {
    for (let col = minX; col <= maxX; col += 1) {
      const cx = col * state.cellSize + state.cellSize / 2;
      const cy = row * state.cellSize + state.cellSize / 2;
      const dx = cx - x;
      const dy = cy - y;

      if (dx * dx + dy * dy <= radiusSquared) {
        const index = row * state.cols + col;
        if (state.grid[index] === 0) {
          state.grid[index] = 1;
          state.scratchedCells += 1;
        }
      }
    }
  }
}

export function createScratchStore(options: ScratchEngineOptions): ScratchStore {
  const gridState = createGridState(options);

  return {
    applyStroke: stroke => applyStrokeToScratchState(gridState, stroke),
    reset: () => resetScratchState(gridState),
    snapshot: () => scratchSnapshot(gridState),
    revealAll: () => revealAllScratchState(gridState),
  };
}
