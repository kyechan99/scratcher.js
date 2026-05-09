import { BrushStroke, ScratchEngineOptions, ScratchSnapshot, ScratchStore, Area } from './types';
export type ScratchGridState = {
  width: number;
  height: number;
  cols: number;
  rows: number;
  cellSize: number;
  grid: Uint8Array;
  scratchedCells: number;
  area?: Area;
  areaMask?: Uint8Array;
  areaTotal?: number;
};
export declare function scratchSnapshot(state: ScratchGridState): ScratchSnapshot;
export declare function resetScratchState(state: ScratchGridState): ScratchSnapshot;
export declare function revealAllScratchState(state: ScratchGridState): ScratchSnapshot;
export declare function applyStrokeToScratchState(
  state: ScratchGridState,
  stroke: BrushStroke,
): ScratchSnapshot;
export declare function createScratchStore(options: ScratchEngineOptions): ScratchStore;
//# sourceMappingURL=state.d.ts.map
