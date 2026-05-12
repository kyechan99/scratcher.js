import {
  ScratchControllerCallbacks,
  Scratcher as CoreScratcher,
  Area,
  Point,
  ScratchSnapshot,
} from '@scratcher.js/core';
import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  useAttrs,
  useSlots,
  watch,
} from 'vue';

export const Scratcher = defineComponent({
  name: 'Scratcher',
  props: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    cellSize: { type: Number, required: false },
    brushSize: { type: Number, required: true },
    completionThreshold: { type: Number, required: false },
    revealOnCompletion: { type: Boolean, required: false },
    cover: { type: String, required: false },
    area: {
      type: Object as PropType<Area | undefined>,
      required: false,
    },
    canvasClass: { type: String, required: false },
    rewardClass: { type: String, required: false },
    onScratcherReady: {
      type: Function as PropType<((scratcher: CoreScratcher) => void) | undefined>,
      required: false,
    },
    onScratchStart: {
      type: Function as PropType<((point: Point, snapshot: ScratchSnapshot) => void) | undefined>,
      required: false,
    },
    onScratchMove: {
      type: Function as PropType<((point: Point, snapshot: ScratchSnapshot) => void) | undefined>,
      required: false,
    },
    onScratchEnd: {
      type: Function as PropType<((snapshot: ScratchSnapshot) => void) | undefined>,
      required: false,
    },
    onReset: {
      type: Function as PropType<((snapshot: ScratchSnapshot) => void) | undefined>,
      required: false,
    },
    onProgress: {
      type: Function as PropType<((snapshot: ScratchSnapshot) => void) | undefined>,
      required: false,
    },
    onComplete: {
      type: Function as PropType<((snapshot: ScratchSnapshot) => void) | undefined>,
      required: false,
    },
    mapPoint: {
      type: Function as PropType<((e: any, canvas: any) => any) | undefined>,
      required: false,
    },
    renderAtPoint: {
      type: Function as PropType<
        ((x: number, y: number, brushSize: number, canvas: any) => void) | undefined
      >,
      required: false,
    },
    renderCover: {
      type: Function as PropType<
        ((canvas: any, width: number, height: number, cover: any) => void) | undefined
      >,
      required: false,
    },
  },
  setup(props) {
    const attrs = useAttrs();
    const slots = useSlots();
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const scratcherRef = ref<CoreScratcher | null>(null);
    const isCoverReady = ref(false);
    let offCoverReady: (() => void) | null = null;

    const collectCallbacks = (): ScratchControllerCallbacks => ({
      onScratchStart: props.onScratchStart,
      onScratchMove: props.onScratchMove,
      onScratchEnd: props.onScratchEnd,
      onReset: props.onReset,
      onProgress: props.onProgress,
      onComplete: props.onComplete,
    });

    const detachCoverReady = () => {
      offCoverReady?.();
      offCoverReady = null;
    };

    const initScratcher = () => {
      detachCoverReady();
      scratcherRef.value?.unbindCanvas();
      isCoverReady.value = false;
      const scratcher = new CoreScratcher({
        width: props.width,
        height: props.height,
        cellSize: props.cellSize,
        brushSize: props.brushSize,
        cover: props.cover,
        area: props.area,
        completionThreshold: props.completionThreshold,
        revealOnCompletion: props.revealOnCompletion,
        ...collectCallbacks(),
        mapPoint: props.mapPoint,
        renderAtPoint: props.renderAtPoint,
        renderCover: props.renderCover,
      });
      scratcherRef.value = scratcher;
      props.onScratcherReady?.(scratcher);
      return scratcher;
    };

    const bindCanvas = () => {
      const scratcher = scratcherRef.value;
      const canvas = canvasRef.value;
      if (!scratcher || !canvas) {
        return;
      }
      // Subscribe before bind so the synchronous coverReady emit (default
      // cover render is sync) is observed and the reward layer never flashes
      // through an empty canvas on first paint.
      detachCoverReady();
      isCoverReady.value = scratcher.isCoverReady;
      offCoverReady = scratcher.on('coverReady', () => {
        isCoverReady.value = true;
      });
      scratcher.bindCanvas(canvas);
    };

    watch(
      () => [
        props.onScratchStart,
        props.onScratchMove,
        props.onScratchEnd,
        props.onReset,
        props.onProgress,
        props.onComplete,
        props.brushSize,
      ],
      () => {
        const scratcher = scratcherRef.value;
        if (!scratcher) {
          return;
        }
        scratcher.setCallbacks(collectCallbacks());
        scratcher.setBrushSize(props.brushSize);
      },
    );

    watch(
      () => props.area,
      area => {
        const scratcher = scratcherRef.value;
        if (!scratcher) {
          return;
        }

        scratcher.setArea(area);
      },
      { deep: true },
    );

    watch(
      () => [
        props.width,
        props.height,
        props.cellSize,
        props.cover,
        props.completionThreshold,
        props.revealOnCompletion,
      ],
      () => {
        initScratcher();
        bindCanvas();
      },
      { flush: 'post' },
    );

    onMounted(() => {
      initScratcher();
      bindCanvas();
    });

    onBeforeUnmount(() => {
      detachCoverReady();
      scratcherRef.value?.unbindCanvas();
      isCoverReady.value = false;
    });

    return () => {
      const rewardLayerStyle = {
        position: 'absolute',
        inset: 0,
        visibility: isCoverReady.value ? 'visible' : 'hidden',
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
                  'aria-hidden': !isCoverReady.value,
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
            },
          }),
        ],
      );
    };
  },
});
