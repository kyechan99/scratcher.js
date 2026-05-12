import {
  ScratcherConfig,
  ScratchControllerCallbacks,
  Scratcher as CoreScratcher,
} from '@scratcher.js/core';
import {
  CSSProperties,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// Avoid the `useLayoutEffect` SSR warning while still painting the cover in
// the same frame as the canvas commit on the client.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface ScratcherProps extends ScratcherConfig {
  className?: string;
  style?: CSSProperties;
  canvasClassName?: string;
  rewardClassName?: string;
  onScratcherReady?: (scratcher: CoreScratcher) => void;
  children?: ReactNode;
}

export function Scratcher({
  width,
  height,
  cellSize,
  brushSize,
  completionThreshold,
  revealOnCompletion,
  cover,
  area,
  onScratchStart,
  onScratchMove,
  onScratchEnd,
  onReset,
  onProgress,
  onComplete,
  mapPoint,
  renderAtPoint,
  renderCover,
  className,
  style,
  canvasClassName,
  rewardClassName,
  onScratcherReady,
  children,
}: ScratcherProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCoverReady, setIsCoverReady] = useState(false);
  const scratcher = useMemo(
    () =>
      new CoreScratcher({
        width,
        height,
        cellSize,
        brushSize,
        cover,
        area,
        completionThreshold,
        revealOnCompletion,
        onScratchStart,
        onScratchMove,
        onScratchEnd,
        onReset,
        onProgress,
        onComplete,
        mapPoint,
        renderAtPoint,
        renderCover,
      }),
    // area / callbacks / mapPoint / renderAtPoint / renderCover are intentionally
    // excluded — area is updated via setArea, callbacks are updated via
    // setCallbacks, and the render fns are captured at construction time to
    // match the Vue binding's behavior.
    [width, height, cellSize, cover, completionThreshold, revealOnCompletion],
  );

  useEffect(() => {
    const callbacks: ScratchControllerCallbacks = {
      onScratchStart,
      onScratchMove,
      onScratchEnd,
      onReset,
      onProgress,
      onComplete,
    };
    scratcher.setCallbacks(callbacks);
  }, [scratcher, onScratchStart, onScratchMove, onScratchEnd, onReset, onProgress, onComplete]);

  useEffect(() => {
    scratcher.setBrushSize(brushSize);
  }, [scratcher, brushSize]);

  useEffect(() => {
    scratcher.setArea(area);
  }, [scratcher, area]);

  useEffect(() => {
    onScratcherReady?.(scratcher);
  }, [onScratcherReady, scratcher]);

  useIsomorphicLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // Subscribe before bind so the synchronous coverReady emit (default cover
    // render is sync) is observed and the reward layer never flashes through
    // an empty canvas on first paint.
    setIsCoverReady(scratcher.isCoverReady);
    const offCoverReady = scratcher.on('coverReady', () => setIsCoverReady(true));
    const cleanup = scratcher.bindCanvas(canvas);

    return () => {
      offCoverReady();
      cleanup();
      scratcher.unbindCanvas();
      setIsCoverReady(false);
    };
  }, [scratcher]);

  const wrapperStyle: CSSProperties = {
    position: 'relative',
    width,
    height,
    overflow: 'hidden',
    touchAction: 'none',
    ...style,
  };

  const canvasStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  };

  const rewardLayerStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    visibility: isCoverReady ? 'visible' : 'hidden',
  };

  return (
    <div className={className} style={wrapperStyle}>
      {children && (
        <div className={rewardClassName} style={rewardLayerStyle} aria-hidden={!isCoverReady}>
          {children}
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={canvasClassName}
        style={canvasStyle}
      />
    </div>
  );
}
