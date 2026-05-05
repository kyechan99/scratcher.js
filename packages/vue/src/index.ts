import { ScratchControllerCallbacks, Scratcher as CoreScratcher, Area } from '@scratcher/core';
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
    coverage: { type: Number, required: false },
    brushSize: { type: Number, required: true },
    completionThreshold: { type: Number, required: false },
    revealOnCompletion: { type: Boolean, required: false },
    callbacks: {
      type: Object as PropType<ScratchControllerCallbacks | undefined>,
      required: false,
    },
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

    const initScratcher = () => {
      scratcherRef.value?.unbindCanvas();
      const scratcher = new CoreScratcher({
        width: props.width,
        height: props.height,
        coverage: props.coverage,
        brushSize: props.brushSize,
        cover: props.cover,
        area: props.area,
        completionThreshold: props.completionThreshold,
        revealOnCompletion: props.revealOnCompletion,
        mapPoint: props.mapPoint,
        renderAtPoint: props.renderAtPoint,
        renderCover: props.renderCover,
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
        props.coverage,
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
