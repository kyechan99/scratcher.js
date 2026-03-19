import { BrushStroke, ScratchEngineOptions, ScratchSnapshot } from './types';

export class ScratchEngine {
  private readonly width: number;
  private readonly height: number;
  private readonly cols: number;
  private readonly rows: number;
  private readonly cellSize: number;
  private readonly grid: Uint8Array;
  private scratchedCells: number;

  constructor(options: ScratchEngineOptions) {
    const cellSize = options.coverage ?? options.gridSize ?? 16;

    this.width = options.width;
    this.height = options.height;
    this.cellSize = Math.max(1, cellSize);
    this.cols = Math.max(1, Math.ceil(this.width / this.cellSize));
    this.rows = Math.max(1, Math.ceil(this.height / this.cellSize));
    this.grid = new Uint8Array(this.cols * this.rows);
    this.scratchedCells = 0;
  }

  applyStroke(stroke: BrushStroke): ScratchSnapshot {
    const radius = Math.max(1, stroke.size / 2);

    for (const point of stroke.points) {
      this.markCircle(point.x, point.y, radius);
    }

    return this.snapshot();
  }

  reset(): ScratchSnapshot {
    this.grid.fill(0);
    this.scratchedCells = 0;
    return this.snapshot();
  }

  snapshot(): ScratchSnapshot {
    const totalCells = this.grid.length;
    return {
      scratchedCells: this.scratchedCells,
      totalCells,
      progress: this.scratchedCells / totalCells,
    };
  }

  private markCircle(x: number, y: number, radius: number): void {
    const minX = Math.max(0, Math.floor((x - radius) / this.cellSize));
    const maxX = Math.min(this.cols - 1, Math.floor((x + radius) / this.cellSize));
    const minY = Math.max(0, Math.floor((y - radius) / this.cellSize));
    const maxY = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));
    const radiusSquared = radius * radius;

    for (let row = minY; row <= maxY; row += 1) {
      for (let col = minX; col <= maxX; col += 1) {
        const cx = col * this.cellSize + this.cellSize / 2;
        const cy = row * this.cellSize + this.cellSize / 2;
        const dx = cx - x;
        const dy = cy - y;

        if (dx * dx + dy * dy <= radiusSquared) {
          const index = row * this.cols + col;
          if (this.grid[index] === 0) {
            this.grid[index] = 1;
            this.scratchedCells += 1;
          }
        }
      }
    }
  }
}
