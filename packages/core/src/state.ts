import {
  BrushStroke,
  ScratchEngineOptions,
  ScratchSnapshot,
  ScratchStore,
  Area,
  RectArea,
  ImageArea,
  AreaSnapshot,
} from './types';

export type ScratchGridState = {
  width: number;
  height: number;
  cols: number;
  rows: number;
  cellSize: number;
  grid: Uint8Array;
  scratchedCells: number;
  area?: Area;
  areaMask?: Uint8Array; // Bitmask for cells in area
  areaTotal?: number; // Total cells in area
};

function createGridState(options: ScratchEngineOptions): ScratchGridState {
  const width = options.width;
  const height = options.height;
  const cellSize = Math.max(1, options.cellSize ?? 16);
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

function isRectArea(area: Area): area is RectArea {
  return 'x' in area && 'y' in area && 'width' in area && 'height' in area;
}

function isImageArea(area: Area): area is ImageArea {
  return 'imageData' in area;
}

function createAreaMask(state: ScratchGridState, area: Area): Uint8Array {
  const mask = new Uint8Array(state.grid.length);
  let areaTotal = 0;

  if (isRectArea(area)) {
    // Rectangular area
    const minCol = Math.max(0, Math.floor(area.x / state.cellSize));
    const maxCol = Math.min(state.cols - 1, Math.floor((area.x + area.width) / state.cellSize));
    const minRow = Math.max(0, Math.floor(area.y / state.cellSize));
    const maxRow = Math.min(state.rows - 1, Math.floor((area.y + area.height) / state.cellSize));

    for (let row = minRow; row <= maxRow; row += 1) {
      for (let col = minCol; col <= maxCol; col += 1) {
        const index = row * state.cols + col;
        mask[index] = 1;
        areaTotal += 1;
      }
    }
  } else if (isImageArea(area)) {
    // Image-based area using alpha channel
    const alphaThreshold = area.alphaThreshold ?? 128;
    const imageData = area.imageData;
    const data = imageData.data;
    const imgWidth = imageData.width;
    const imgHeight = imageData.height;
    const offsetX = area.x ?? 0;
    const offsetY = area.y ?? 0;
    const scale = Math.max(0.0001, area.scale ?? 1);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    const minCol = Math.max(0, Math.floor(offsetX / state.cellSize));
    const maxCol = Math.min(state.cols - 1, Math.floor((offsetX + scaledWidth) / state.cellSize));
    const minRow = Math.max(0, Math.floor(offsetY / state.cellSize));
    const maxRow = Math.min(state.rows - 1, Math.floor((offsetY + scaledHeight) / state.cellSize));

    for (let row = minRow; row <= maxRow; row += 1) {
      for (let col = minCol; col <= maxCol; col += 1) {
        const cellCenterX = (col + 0.5) * state.cellSize;
        const cellCenterY = (row + 0.5) * state.cellSize;

        const localX = (cellCenterX - offsetX) / scale;
        const localY = (cellCenterY - offsetY) / scale;
        const imgX = Math.floor(localX);
        const imgY = Math.floor(localY);

        if (imgX >= 0 && imgX < imgWidth && imgY >= 0 && imgY < imgHeight) {
          const pixelIndex = (imgY * imgWidth + imgX) * 4;
          const alpha = data[pixelIndex + 3]; // Alpha channel

          if (alpha >= alphaThreshold) {
            const index = row * state.cols + col;
            mask[index] = 1;
            areaTotal += 1;
          }
        }
      }
    }
  }

  state.areaMask = mask;
  state.areaTotal = areaTotal;
  return mask;
}

export function scratchSnapshot(state: ScratchGridState): ScratchSnapshot {
  const totalCells = state.grid.length;
  const snapshot: ScratchSnapshot = {
    scratchedCells: state.scratchedCells,
    totalCells,
    progress: state.scratchedCells / totalCells,
  };

  // Calculate area progress if area is set
  if (state.areaMask && state.areaTotal && state.areaTotal > 0) {
    let areaScratchedCells = 0;
    for (let i = 0; i < state.grid.length; i += 1) {
      if (state.areaMask[i] === 1 && state.grid[i] === 1) {
        areaScratchedCells += 1;
      }
    }
    snapshot.area = {
      scratchedCells: areaScratchedCells,
      totalCells: state.areaTotal,
      progress: areaScratchedCells / state.areaTotal,
    };
  }

  return snapshot;
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
    setArea: (area?: Area) => {
      if (area) {
        gridState.area = area;
        createAreaMask(gridState, area);
      } else {
        gridState.area = undefined;
        gridState.areaMask = undefined;
        gridState.areaTotal = undefined;
      }
      return scratchSnapshot(gridState);
    },
  };
}
