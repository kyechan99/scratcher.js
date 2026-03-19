import {
  Point,
  ScratcherConfig,
  ScratchControllerCallbacks,
  Scratcher as CoreScratcher,
  ScratchEngine,
  ScratchEngineOptions,
  ScratchSnapshot,
} from '@scratcher/core';
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  PropType,
  Ref,
  ref,
  useAttrs,
  useSlots,
  watch,
} from 'vue';

export interface UseVueScratchEngineResult {
  engine: ScratchEngine;
  snapshot: Ref<ScratchSnapshot>;
  progress: Ref<number>;
  reset: () => void;
}

export function useScratchEngine(options: ScratchEngineOptions): UseVueScratchEngineResult {
  const engine = new ScratchEngine(options);
  const snapshot = ref<ScratchSnapshot>(engine.snapshot());
  const progress = computed(() => snapshot.value.progress);

  const reset = () => {
    engine.reset();
    snapshot.value = engine.snapshot();
  };

  return {
    engine,
    snapshot,
    progress,
    reset,
  };
}

export interface UseVueScratchControllerOptions extends ScratcherConfig {}

export interface UseVueScratchControllerResult {
  scratcher: CoreScratcher;
  engine: ScratchEngine;
  snapshot: Ref<ScratchSnapshot>;
  progress: Ref<number>;
  start: (point: Point) => ScratchSnapshot;
  move: (point: Point) => ScratchSnapshot;
  end: () => ScratchSnapshot;
  reset: () => ScratchSnapshot;
  setBrushSize: (size: number) => void;
}

export function useScratchController(
  options: UseVueScratchControllerOptions,
): UseVueScratchControllerResult {
  const scratcher = new CoreScratcher({
    width: options.width,
    height: options.height,
    coverage: options.coverage,
    brushSize: options.brushSize,
    cover: options.cover,
    completionThreshold: options.completionThreshold,
  });
  const engine = scratcher.engine;
  const snapshot = ref<ScratchSnapshot>(engine.snapshot());
  const progress = computed(() => snapshot.value.progress);
  const callbacks = options.callbacks;

  scratcher.setCallbacks({
    onStrokeStart: (point, next) => callbacks?.onStrokeStart?.(point, next),
    onStrokeMove: (point, next) => callbacks?.onStrokeMove?.(point, next),
    onStrokeEnd: next => callbacks?.onStrokeEnd?.(next),
    onReset: next => callbacks?.onReset?.(next),
    onProgress: next => {
      snapshot.value = next;
      callbacks?.onProgress?.(next);
    },
    onComplete: next => callbacks?.onComplete?.(next),
  });

  const start = (point: Point) => {
    const next = scratcher.start(point);
    snapshot.value = next;
    return next;
  };

  const move = (point: Point) => {
    const next = scratcher.move(point);
    snapshot.value = next;
    return next;
  };

  const end = () => {
    const next = scratcher.end();
    snapshot.value = next;
    return next;
  };

  const reset = () => {
    const next = scratcher.reset();
    snapshot.value = next;
    return next;
  };

  const setBrushSize = (size: number) => {
    scratcher.setBrushSize(size);
  };

  return {
    scratcher,
    engine,
    snapshot,
    progress,
    start,
    move,
    end,
    reset,
    setBrushSize,
  };
}

export const Scratcher = defineComponent({
  name: 'Scratcher',
  props: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    coverage: { type: Number, required: false },
    brushSize: { type: Number, required: true },
    completionThreshold: { type: Number, required: false },
    callbacks: {
      type: Object as PropType<ScratchControllerCallbacks | undefined>,
      required: false,
    },
    cover: { type: String, required: false },
    canvasClass: { type: String, required: false },
    rewardClass: { type: String, required: false },
    onScratcherReady: {
      type: Function as PropType<((scratcher: CoreScratcher) => void) | undefined>,
      required: false,
    },
  },
  setup(props) {
    const attrs = useAttrs();
    const slots = useSlots();
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const scratcherRef = ref<CoreScratcher | null>(null);

    const initScratcher = () => {
      scratcherRef.value?.unbindCanvas();
      const scratcher = new CoreScratcher({
        width: props.width,
        height: props.height,
        coverage: props.coverage,
        brushSize: props.brushSize,
        cover: props.cover,
        completionThreshold: props.completionThreshold,
      });
      scratcherRef.value = scratcher;
      scratcher.setCallbacks(props.callbacks);
      props.onScratcherReady?.(scratcher);
      return scratcher;
    };

    const bindCanvas = () => {
      const scratcher = scratcherRef.value;
      const canvas = canvasRef.value;
      if (!scratcher || !canvas) {
        return;
      }

      scratcher.bindCanvas(canvas);
    };

    watch(
      () => [props.callbacks, props.brushSize],
      () => {
        const scratcher = scratcherRef.value;
        if (!scratcher) {
          return;
        }
        scratcher.setCallbacks(props.callbacks);
        scratcher.setBrushSize(props.brushSize);
      },
      { deep: true },
    );

    watch(
      () => [props.width, props.height, props.coverage, props.cover, props.completionThreshold],
      () => {
        initScratcher();
        bindCanvas();
      },
    );

    onMounted(() => {
      initScratcher();
      bindCanvas();
    });

    onBeforeUnmount(() => {
      scratcherRef.value?.unbindCanvas();
    });

    return () => {
      const rewardLayerStyle = {
        position: 'absolute',
        inset: 0,
      };

      return h(
        'div',
        {
          ...attrs,
          style: [
            {
              position: 'relative',
              width: `${props.width}px`,
              height: `${props.height}px`,
              overflow: 'hidden',
              touchAction: 'none',
            },
            attrs.style as object,
          ],
        },
        [
          slots.default
            ? h(
                'div',
                {
                  class: props.rewardClass,
                  style: rewardLayerStyle,
                },
                slots.default(),
              )
            : null,
          h('canvas', {
            ref: canvasRef,
            width: props.width,
            height: props.height,
            class: props.canvasClass,
            style: {
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              cursor: 'crosshair',
            },
          }),
        ],
      );
    };
  },
});
