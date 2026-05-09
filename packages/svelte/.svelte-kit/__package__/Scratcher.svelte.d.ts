import { type Snippet } from 'svelte';
import {
  Scratcher as CoreScratcher,
  type Area,
  type ScratchControllerCallbacks,
  type ScratcherConfig,
} from '@scratcher/core';
type Props = {
  width: number;
  height: number;
  coverage?: number;
  brushSize: number;
  completionThreshold?: number;
  revealOnCompletion?: boolean;
  callbacks?: ScratchControllerCallbacks;
  cover?: string;
  area?: Area;
  mapPoint?: ScratcherConfig['mapPoint'];
  renderAtPoint?: ScratcherConfig['renderAtPoint'];
  renderCover?: ScratcherConfig['renderCover'];
  class?: string;
  canvasClass?: string;
  rewardClass?: string;
  onScratcherReady?: (scratcher: CoreScratcher) => void;
  children?: Snippet;
};
declare const Scratcher: import('svelte').Component<Props, {}, ''>;
type Scratcher = ReturnType<typeof Scratcher>;
export default Scratcher;
//# sourceMappingURL=Scratcher.svelte.d.ts.map
