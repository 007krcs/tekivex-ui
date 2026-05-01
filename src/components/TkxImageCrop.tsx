'use client';

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
  type CSSProperties,
  type PointerEvent,
} from 'react';

export interface TkxImageCropHandle {
  /** Produce a Blob of the cropped region. Default JPEG, configurable mime. */
  toBlob: (options?: { mimeType?: string; quality?: number }) => Promise<Blob>;
  /** Reset zoom and offset to fit the image into the crop frame. */
  reset: () => void;
}

export interface TkxImageCropProps {
  /** Source URL (data: or http) of the image to crop. */
  src: string;
  /** Aspect ratio of the crop frame — width / height. Default 1 (square). */
  aspect?: number;
  /** Display size of the editor in CSS pixels. Default 320. */
  size?: number;
  /** Output pixel dimensions. Default 800px on the long side. */
  outputPx?: number;
  /** Min and max zoom multipliers. Defaults 1 and 4. */
  minZoom?: number;
  maxZoom?: number;
  /** Called with the live offset/zoom for analytics or persistence. */
  onChange?: (state: { offsetX: number; offsetY: number; zoom: number }) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Touch + mouse photo cropper. Renders the source image inside a fixed-aspect
 * frame; the user pans by dragging and zooms with pinch (mobile) or wheel
 * (desktop). `toBlob` exports the visible region at the configured pixel size.
 */
export const TkxImageCrop = forwardRef<TkxImageCropHandle, TkxImageCropProps>(
  function TkxImageCrop(
    {
      src,
      aspect = 1,
      size = 320,
      outputPx = 800,
      minZoom = 1,
      maxZoom = 4,
      onChange,
      className,
      style,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const dragRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
    const pinchRef = useRef<{ initialDistance: number; initialZoom: number } | null>(null);
    const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());

    const frameW = size;
    const frameH = size / aspect;

    // Reset state when source changes
    useEffect(() => {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }, [src]);

    const handleImgLoad = (): void => {
      const el = imgRef.current;
      if (!el) return;
      setImgSize({ w: el.naturalWidth, h: el.naturalHeight });
    };

    const clamp = useCallback(
      (next: { x: number; y: number; zoom: number }) => {
        if (!imgSize) return next;
        const scale = (Math.min(frameW / imgSize.w, frameH / imgSize.h)) * next.zoom;
        const dispW = imgSize.w * scale;
        const dispH = imgSize.h * scale;
        const minX = Math.min(0, frameW - dispW);
        const minY = Math.min(0, frameH - dispH);
        const maxX = Math.max(0, frameW - dispW);
        const maxY = Math.max(0, frameH - dispH);
        return {
          x: Math.min(Math.max(next.x, minX), maxX),
          y: Math.min(Math.max(next.y, minY), maxY),
          zoom: next.zoom,
        };
      },
      [imgSize, frameW, frameH],
    );

    const updateState = useCallback(
      (next: { x: number; y: number; zoom: number }) => {
        const clamped = clamp(next);
        setOffset({ x: clamped.x, y: clamped.y });
        setZoom(clamped.zoom);
        onChange?.({ offsetX: clamped.x, offsetY: clamped.y, zoom: clamped.zoom });
      },
      [clamp, onChange],
    );

    const onPointerDown = (e: PointerEvent<HTMLDivElement>): void => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.current.size === 1) {
        dragRef.current = {
          x: e.clientX - offset.x,
          y: e.clientY - offset.y,
          pointerId: e.pointerId,
        };
      } else if (activePointers.current.size === 2) {
        const pts = [...activePointers.current.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        pinchRef.current = { initialDistance: dist, initialZoom: zoom };
        dragRef.current = null;
      }
    };

    const onPointerMove = (e: PointerEvent<HTMLDivElement>): void => {
      if (!activePointers.current.has(e.pointerId)) return;
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pinchRef.current && activePointers.current.size === 2) {
        const pts = [...activePointers.current.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const factor = dist / pinchRef.current.initialDistance;
        const nextZoom = Math.min(
          maxZoom,
          Math.max(minZoom, pinchRef.current.initialZoom * factor),
        );
        updateState({ x: offset.x, y: offset.y, zoom: nextZoom });
      } else if (dragRef.current && dragRef.current.pointerId === e.pointerId) {
        const x = e.clientX - dragRef.current.x;
        const y = e.clientY - dragRef.current.y;
        updateState({ x, y, zoom });
      }
    };

    const onPointerUp = (e: PointerEvent<HTMLDivElement>): void => {
      activePointers.current.delete(e.pointerId);
      if (activePointers.current.size < 2) pinchRef.current = null;
      if (activePointers.current.size === 0) dragRef.current = null;
    };

    const onWheel = (e: React.WheelEvent<HTMLDivElement>): void => {
      e.preventDefault();
      const delta = -e.deltaY / 500;
      const nextZoom = Math.min(maxZoom, Math.max(minZoom, zoom + delta));
      updateState({ x: offset.x, y: offset.y, zoom: nextZoom });
    };

    useImperativeHandle(
      ref,
      () => ({
        async toBlob(options) {
          if (!imgSize || !imgRef.current) {
            throw new Error('TkxImageCrop: image not loaded');
          }
          // Compute output dimensions (long side = outputPx)
          const outW = aspect >= 1 ? outputPx : Math.round(outputPx * aspect);
          const outH = aspect >= 1 ? Math.round(outputPx / aspect) : outputPx;
          const canvas = document.createElement('canvas');
          canvas.width = outW;
          canvas.height = outH;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('TkxImageCrop: 2D context unavailable');

          const fitScale = Math.min(frameW / imgSize.w, frameH / imgSize.h);
          const dispScale = fitScale * zoom;
          const sx = -offset.x / dispScale;
          const sy = -offset.y / dispScale;
          const sWidth = frameW / dispScale;
          const sHeight = frameH / dispScale;

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, outW, outH);
          ctx.drawImage(imgRef.current, sx, sy, sWidth, sHeight, 0, 0, outW, outH);

          return new Promise<Blob>((resolve, reject) =>
            canvas.toBlob(
              (b) => (b ? resolve(b) : reject(new Error('TkxImageCrop: toBlob null'))),
              options?.mimeType ?? 'image/jpeg',
              options?.quality ?? 0.92,
            ),
          );
        },
        reset() {
          setZoom(1);
          setOffset({ x: 0, y: 0 });
        },
      }),
      [imgSize, frameW, frameH, zoom, offset, aspect, outputPx],
    );

    const fitScale = imgSize
      ? Math.min(frameW / imgSize.w, frameH / imgSize.h) * zoom
      : 1;

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          position: 'relative',
          width: frameW,
          height: frameH,
          overflow: 'hidden',
          background: '#000',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          ...style,
        }}
        data-tkx-image-crop="armed"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <img
          ref={imgRef}
          src={src}
          alt=""
          onLoad={handleImgLoad}
          draggable={false}
          style={{
            position: 'absolute',
            left: offset.x,
            top: offset.y,
            width: imgSize ? imgSize.w * fitScale : 'auto',
            height: imgSize ? imgSize.h * fitScale : 'auto',
            pointerEvents: 'none',
          }}
        />
        {/* Crop frame outline */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px solid rgba(255,255,255,0.85)',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  },
);

TkxImageCrop.displayName = 'TkxImageCrop';
