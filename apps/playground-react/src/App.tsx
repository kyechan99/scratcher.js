import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Scratcher } from '@scratcher.js/react';
import type {
  Area,
  ImageArea,
  RectArea,
  ScratchControllerCallbacks,
  ScratchSnapshot,
  Scratcher as CoreScratcher,
  ScratcherCanvasType,
  ScratcherConfig,
} from '@scratcher.js/core';

const FRAME_WIDTH = 400;
const FRAME_HEIGHT = 280;
const MIN_RECT = 50;

type AreaMode = 'rect' | 'image';
type LoadedImage = { src: string; imageData: ImageData };

export function App() {
  const [brushSize, setBrushSize] = useState(30);
  const [cellSize, setCellSize] = useState(10);
  const [cover, setCover] = useState('#b9c2ce');
  const [threshold, setThreshold] = useState(0.5);
  const [revealOnCompletion, setRevealOnCompletion] = useState(false);
  const [useGradientCover, setUseGradientCover] = useState(false);

  const [areaEnabled, setAreaEnabled] = useState(false);
  const [areaMode, setAreaMode] = useState<AreaMode>('rect');
  const [areaRect, setAreaRect] = useState<RectArea>({
    x: 60,
    y: 40,
    width: 240,
    height: 160,
  });
  const [areaImage, setAreaImage] = useState<LoadedImage | null>(null);
  const [areaImageTransform, setAreaImageTransform] = useState({ x: 30, y: 30, scale: 1 });
  const [alphaThreshold, setAlphaThreshold] = useState(128);
  const [imageStatus, setImageStatus] = useState('(empty)');

  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [scratcher, setScratcher] = useState<CoreScratcher | null>(null);
  const lastImageSrc = useRef<string | null>(null);

  // Revoke any previous object URL on cleanup.
  useEffect(
    () => () => {
      if (lastImageSrc.current) URL.revokeObjectURL(lastImageSrc.current);
    },
    [],
  );

  const imageScaleMax = useMemo(() => {
    if (!areaImage) return 4;
    const fitWidth = FRAME_WIDTH / areaImage.imageData.width;
    const fitHeight = FRAME_HEIGHT / areaImage.imageData.height;
    return Math.max(0.1, Math.min(4, Math.min(fitWidth, fitHeight) * 2));
  }, [areaImage]);

  const imageXMax = useMemo(() => {
    if (!areaImage) return FRAME_WIDTH;
    return Math.max(0, FRAME_WIDTH - areaImage.imageData.width * areaImageTransform.scale);
  }, [areaImage, areaImageTransform.scale]);

  const imageYMax = useMemo(() => {
    if (!areaImage) return FRAME_HEIGHT;
    return Math.max(0, FRAME_HEIGHT - areaImage.imageData.height * areaImageTransform.scale);
  }, [areaImage, areaImageTransform.scale]);

  const area = useMemo<Area | undefined>(() => {
    if (!areaEnabled) return undefined;
    if (areaMode === 'image' && areaImage) {
      const imageArea: ImageArea = {
        imageData: areaImage.imageData,
        x: areaImageTransform.x,
        y: areaImageTransform.y,
        scale: areaImageTransform.scale,
        alphaThreshold,
      };
      return imageArea;
    }
    return areaMode === 'rect' ? areaRect : undefined;
  }, [areaEnabled, areaMode, areaRect, areaImage, areaImageTransform, alphaThreshold]);

  const callbacks = useMemo<ScratchControllerCallbacks>(
    () => ({
      onProgress: (snap: ScratchSnapshot) => setProgress(snap.area?.progress ?? snap.progress),
      onComplete: () => setCompleted(true),
    }),
    [],
  );

  const renderCover = useMemo<ScratcherConfig['renderCover']>(() => {
    if (!useGradientCover) return undefined;
    return (canvas: ScratcherCanvasType, width: number, height: number) => {
      const ctx = canvas.getContext?.('2d');
      if (!ctx) return;
      const grad = (ctx as CanvasRenderingContext2D).createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#7700ff');
      grad.addColorStop(1, '#bf4587');
      ctx.fillStyle = grad;
      ctx.fillRect?.(0, 0, width, height);
    };
  }, [useGradientCover]);

  const handleReady = useCallback((next: CoreScratcher) => {
    setScratcher(next);
    setProgress(0);
    setCompleted(false);
  }, []);

  const reset = useCallback(() => {
    if (!scratcher) return;
    scratcher.reset();
    setProgress(0);
    setCompleted(false);
  }, [scratcher]);

  const onImageChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (lastImageSrc.current) URL.revokeObjectURL(lastImageSrc.current);
      lastImageSrc.current = null;
      setAreaImage(null);
      setImageStatus('(empty)');
      return;
    }

    try {
      const loaded = await loadImageData(file);
      if (lastImageSrc.current) URL.revokeObjectURL(lastImageSrc.current);
      lastImageSrc.current = loaded.src;
      setAreaImage(loaded);
      setAreaImageTransform({ x: 30, y: 30, scale: 1 });
      setAreaMode('image');
      setAreaEnabled(true);
      setImageStatus(`${file.name} (${loaded.imageData.width}×${loaded.imageData.height})`);
    } catch (e) {
      console.error(e);
      setImageStatus('Failed to load image.');
    }
  }, []);

  // Force remount of the binding when "captured-at-mount" props change
  // (renderCover/renderAtPoint/mapPoint) — only relevant for testing.
  const mountKey = `cover:${useGradientCover ? 'gradient' : 'solid'}`;

  return (
    <div className="layout">
      <header>
        <h1>scratcher.js · React playground</h1>
        <p>
          Smoke test for <code>@scratcher.js/react</code>. Live updates: brush, callbacks, area
          (rect/image), custom render.
        </p>
      </header>

      <main className="grid">
        <section className="preview">
          <div className="frame" style={{ width: `${FRAME_WIDTH}px`, height: `${FRAME_HEIGHT}px` }}>
            <Scratcher
              key={mountKey}
              width={FRAME_WIDTH}
              height={FRAME_HEIGHT}
              cellSize={cellSize}
              brushSize={brushSize}
              cover={cover}
              area={area}
              completionThreshold={threshold}
              revealOnCompletion={revealOnCompletion}
              renderCover={renderCover}
              canvasClassName="scratch-canvas"
              onScratcherReady={handleReady}
              {...callbacks}
            >
              <div className="reward">You found it!</div>
            </Scratcher>

            {areaEnabled && areaMode === 'rect' && (
              <div
                className="area-overlay"
                style={{
                  left: `${areaRect.x}px`,
                  top: `${areaRect.y}px`,
                  width: `${areaRect.width}px`,
                  height: `${areaRect.height}px`,
                }}
              />
            )}
            {areaEnabled && areaMode === 'image' && areaImage && (
              <img
                className="area-image-overlay"
                src={areaImage.src}
                alt="Area mask preview"
                style={{
                  left: `${areaImageTransform.x}px`,
                  top: `${areaImageTransform.y}px`,
                  width: `${areaImage.imageData.width * areaImageTransform.scale}px`,
                  height: `${areaImage.imageData.height * areaImageTransform.scale}px`,
                }}
              />
            )}
          </div>
          <button type="button" className="btn" onClick={reset}>
            Reset
          </button>
        </section>

        <aside className="config">
          <Field label="Brush size" value={brushSize}>
            <input
              type="range"
              min={4}
              max={80}
              value={brushSize}
              onChange={e => setBrushSize(Number(e.target.value))}
            />
          </Field>
          <Field label="Cell size" value={`${cellSize}px`}>
            <input
              type="range"
              min={2}
              max={24}
              value={cellSize}
              onChange={e => setCellSize(Number(e.target.value))}
            />
          </Field>
          <Field label="Cover color" value={cover}>
            <input
              type="color"
              value={cover}
              disabled={useGradientCover}
              onChange={e => setCover(e.target.value)}
            />
          </Field>
          <Field label="Completion threshold" value={threshold.toFixed(2)}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
            />
          </Field>
          <Toggle
            label="Reveal on completion"
            checked={revealOnCompletion}
            onChange={setRevealOnCompletion}
          />
          <Toggle
            label="Use gradient renderCover"
            checked={useGradientCover}
            onChange={setUseGradientCover}
          />

          <hr />

          <Toggle label="Enable area mask" checked={areaEnabled} onChange={setAreaEnabled} />

          {areaEnabled && (
            <>
              <div className="mode-switcher">
                <button
                  type="button"
                  className={`mode-button ${areaMode === 'rect' ? 'active' : ''}`}
                  onClick={() => setAreaMode('rect')}
                >
                  Rectangle
                </button>
                <button
                  type="button"
                  className={`mode-button ${areaMode === 'image' ? 'active' : ''}`}
                  onClick={() => setAreaMode('image')}
                >
                  Image mask
                </button>
              </div>

              {areaMode === 'rect' && (
                <>
                  <Field label="Area X" value={areaRect.x}>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, FRAME_WIDTH - MIN_RECT)}
                      value={areaRect.x}
                      onChange={e => setAreaRect(r => ({ ...r, x: Number(e.target.value) }))}
                    />
                  </Field>
                  <Field label="Area Y" value={areaRect.y}>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, FRAME_HEIGHT - MIN_RECT)}
                      value={areaRect.y}
                      onChange={e => setAreaRect(r => ({ ...r, y: Number(e.target.value) }))}
                    />
                  </Field>
                  <Field label="Area width" value={areaRect.width}>
                    <input
                      type="range"
                      min={MIN_RECT}
                      max={FRAME_WIDTH}
                      value={areaRect.width}
                      onChange={e => setAreaRect(r => ({ ...r, width: Number(e.target.value) }))}
                    />
                  </Field>
                  <Field label="Area height" value={areaRect.height}>
                    <input
                      type="range"
                      min={MIN_RECT}
                      max={FRAME_HEIGHT}
                      value={areaRect.height}
                      onChange={e => setAreaRect(r => ({ ...r, height: Number(e.target.value) }))}
                    />
                  </Field>
                </>
              )}

              {areaMode === 'image' && (
                <>
                  <Field label="Alpha image" value={imageStatus}>
                    <input type="file" accept="image/*" onChange={onImageChange} />
                  </Field>
                  <Field label="Alpha threshold" value={alphaThreshold}>
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={alphaThreshold}
                      onChange={e => setAlphaThreshold(Number(e.target.value))}
                    />
                  </Field>
                  {areaImage && (
                    <>
                      <Field label="Image X" value={areaImageTransform.x}>
                        <input
                          type="range"
                          min={0}
                          max={imageXMax}
                          value={areaImageTransform.x}
                          onChange={e =>
                            setAreaImageTransform(t => ({
                              ...t,
                              x: clamp(Number(e.target.value), 0, imageXMax),
                            }))
                          }
                        />
                      </Field>
                      <Field label="Image Y" value={areaImageTransform.y}>
                        <input
                          type="range"
                          min={0}
                          max={imageYMax}
                          value={areaImageTransform.y}
                          onChange={e =>
                            setAreaImageTransform(t => ({
                              ...t,
                              y: clamp(Number(e.target.value), 0, imageYMax),
                            }))
                          }
                        />
                      </Field>
                      <Field label="Image scale" value={`${areaImageTransform.scale.toFixed(2)}x`}>
                        <input
                          type="range"
                          min={0.1}
                          max={imageScaleMax}
                          step={0.01}
                          value={areaImageTransform.scale}
                          onChange={e => {
                            const next = Number(e.target.value);
                            setAreaImageTransform(t => ({
                              x: clamp(t.x, 0, imageXMax),
                              y: clamp(t.y, 0, imageYMax),
                              scale: clamp(next, 0.1, imageScaleMax),
                            }));
                          }}
                        />
                      </Field>
                    </>
                  )}
                </>
              )}
            </>
          )}

          <hr />

          <ProgressBar
            label={areaEnabled ? 'Area progress' : 'Progress'}
            value={progress}
            tone={areaEnabled ? 'area' : 'main'}
          />
          <p className={`completion ${completed ? 'visible' : ''}`}>Completed 🎉</p>
        </aside>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: number | string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <div className="field-head">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
  );
}

function ProgressBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'main' | 'area';
}) {
  const pct = (value * 100).toFixed(1);
  return (
    <div className="progress-box">
      <div className="progress-head">
        <span>{label}</span>
        <strong>{pct}%</strong>
      </div>
      <div className="progress-track">
        <div
          className={`progress-fill ${tone === 'area' ? 'area' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

async function loadImageData(file: File): Promise<LoadedImage> {
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = objectUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2D canvas context');
  ctx.drawImage(img, 0, 0);

  return { src: objectUrl, imageData: ctx.getImageData(0, 0, canvas.width, canvas.height) };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
