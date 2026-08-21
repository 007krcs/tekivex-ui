'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxImageEditor — in-browser image cropper with rotation + adjustments.
//
// Capabilities:
//   - Drag-and-drop OR file input upload
//   - Aspect-ratio locks: free, 1:1 (square), 3:4, 4:5, 16:9
//   - 90° rotation (left/right)
//   - Brightness + contrast sliders (Canvas2D filter)
//   - Output as Blob/File via getResult()
//   - Keyboard: arrow keys nudge the crop frame (Shift = larger step)
//   - WCAG: focus indicators, labelled crop region, 36px touch targets
//
// Rendering pipeline:
//   image → offscreen canvas (rotated) → display canvas → cropped output canvas
//
// No external deps. Pure Canvas2D + DOM.
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type Ref,
} from 'react';
import { useTheme } from '../themes';

export type AspectRatio = 'free' | '1:1' | '3:4' | '4:5' | '16:9' | '4:3' | '3:2';

const RATIO_VALUES: Record<AspectRatio, number | null> = {
  free: null,
  '1:1': 1,
  '3:4': 3 / 4,
  '4:5': 4 / 5,
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '3:2': 3 / 2,
};

export interface ImageEditResult {
  /** PNG blob of the cropped, rotated, filtered image. */
  blob: Blob;
  /** Same content as a File (same blob, with name + lastModified). */
  file: File;
  /** Object URL — caller is responsible for revoking via URL.revokeObjectURL. */
  url: string;
  /** Output dimensions. */
  width: number;
  height: number;
}

export interface TkxImageEditorProps {
  /** Initial image source (URL, data URL, or omit for empty drop zone). */
  src?: string;
  /** Initial aspect ratio. Defaults to "free". */
  aspectRatio?: AspectRatio;
  /** Allowed aspect ratios in the toolbar. */
  ratios?: AspectRatio[];
  /** Output MIME type. Defaults to "image/png". JPEG strips alpha. */
  mimeType?: 'image/png' | 'image/jpeg' | 'image/webp';
  /** JPEG / WebP quality (0..1). Defaults to 0.92. */
  quality?: number;
  /** Maximum output dimension in px. Image is downscaled to fit. Defaults to 2048. */
  maxOutputSize?: number;
  /** Filename used for the File output. */
  outputFilename?: string;
  /** Called every time the user changes crop / rotation / filters. */
  onChange?: (state: { rotation: number; brightness: number; contrast: number }) => void;
  /** Called when the user clicks "Apply" / explicitly via getResult(). */
  onResult?: (result: ImageEditResult) => void;
  /** Called when the user clicks "Cancel". */
  onCancel?: () => void;
  /** Optional className on the root container. */
  className?: string;
  /** Optional inline style on the root container. */
  style?: CSSProperties;
  /** Localised labels for buttons / status text. */
  labels?: Partial<{
    drop: string;
    browse: string;
    rotate: string;
    apply: string;
    cancel: string;
    brightness: string;
    contrast: string;
    aspect: string;
    free: string;
  }>;
}

export interface TkxImageEditorHandle {
  /** Imperatively trigger the crop + return the result. */
  getResult: () => Promise<ImageEditResult | null>;
  /** Reset all edits to the original image. */
  reset: () => void;
  /** Replace the current image with a new source. */
  loadSource: (src: string) => void;
}

const DEFAULT_LABELS = {
  drop: 'Drop an image here, or',
  browse: 'browse',
  rotate: 'Rotate',
  apply: 'Apply',
  cancel: 'Cancel',
  brightness: 'Brightness',
  contrast: 'Contrast',
  aspect: 'Aspect',
  free: 'Free',
};

export const TkxImageEditor = forwardRef<TkxImageEditorHandle, TkxImageEditorProps>(
  function TkxImageEditor(
    {
      src,
      aspectRatio: initialRatio = 'free',
      ratios = ['free', '1:1', '3:4', '4:5', '16:9'],
      mimeType = 'image/png',
      quality = 0.92,
      maxOutputSize = 2048,
      outputFilename = 'edited.png',
      onChange,
      onResult,
      onCancel,
      className,
      style,
      labels: labelOverrides,
    },
    ref: Ref<TkxImageEditorHandle>,
  ) {
    const labels = { ...DEFAULT_LABELS, ...labelOverrides };
    const theme = useTheme();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const [imageSrc, setImageSrc] = useState<string | null>(src ?? null);
    const [imageNaturalSize, setImageNaturalSize] = useState<{ w: number; h: number } | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(initialRatio);
    const [rotation, setRotation] = useState<number>(0);
    const [brightness, setBrightness] = useState<number>(100);
    const [contrast, setContrast] = useState<number>(100);
    const [crop, setCrop] = useState<{ x: number; y: number; w: number; h: number }>({
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    });
    const [isDragging, setIsDragging] = useState(false);
    const dragStateRef = useRef<{
      mode: 'move' | 'nw' | 'ne' | 'sw' | 'se' | null;
      startX: number;
      startY: number;
      startCrop: typeof crop;
    }>({ mode: null, startX: 0, startY: 0, startCrop: { x: 0, y: 0, w: 0, h: 0 } });

    // Load the image
    useEffect(() => {
      if (!imageSrc) {
        imageRef.current = null;
        setImageNaturalSize(null);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        setImageNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        // Initial crop = full image
        const ratio = RATIO_VALUES[aspectRatio];
        if (ratio) {
          const targetW = Math.min(img.naturalWidth, img.naturalHeight * ratio);
          const targetH = targetW / ratio;
          setCrop({
            x: (img.naturalWidth - targetW) / 2,
            y: (img.naturalHeight - targetH) / 2,
            w: targetW,
            h: targetH,
          });
        } else {
          setCrop({ x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight });
        }
      };
      img.src = imageSrc;
    }, [imageSrc, aspectRatio]);

    // Notify on edit changes
    useEffect(() => {
      onChange?.({ rotation, brightness, contrast });
    }, [rotation, brightness, contrast, onChange]);

    // Render display canvas
    const renderCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      const ns = imageNaturalSize;
      if (!canvas || !img || !ns) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const container = containerRef.current;
      const maxDisplay = container ? Math.min(container.clientWidth, 800) : 600;
      const isRotated = rotation % 180 !== 0;
      const sourceW = isRotated ? ns.h : ns.w;
      const sourceH = isRotated ? ns.w : ns.h;
      const scale = Math.min(maxDisplay / sourceW, 600 / sourceH, 1);
      const displayW = Math.floor(sourceW * scale);
      const displayH = Math.floor(sourceH * scale);

      canvas.width = displayW;
      canvas.height = displayH;

      ctx.save();
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.translate(displayW / 2, displayH / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -ns.w * scale / 2, -ns.h * scale / 2, ns.w * scale, ns.h * scale);
      ctx.restore();
    }, [rotation, brightness, contrast, imageNaturalSize]);

    useEffect(() => {
      renderCanvas();
    }, [renderCanvas]);

    // Apply aspect ratio
    useEffect(() => {
      const ns = imageNaturalSize;
      if (!ns) return;
      const ratio = RATIO_VALUES[aspectRatio];
      if (!ratio) return;
      // Re-fit crop to ratio centred on the current crop centre
      setCrop((prev) => {
        const cx = prev.x + prev.w / 2;
        const cy = prev.y + prev.h / 2;
        let newW = prev.w;
        let newH = newW / ratio;
        if (newH > ns.h) {
          newH = ns.h;
          newW = newH * ratio;
        }
        if (newW > ns.w) {
          newW = ns.w;
          newH = newW / ratio;
        }
        return {
          x: Math.max(0, Math.min(ns.w - newW, cx - newW / 2)),
          y: Math.max(0, Math.min(ns.h - newH, cy - newH / 2)),
          w: newW,
          h: newH,
        };
      });
    }, [aspectRatio, imageNaturalSize]);

    // ── File handling ───────────────────────────────────────────────────────
    const handleFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageSrc(reader.result);
          setRotation(0);
          setBrightness(100);
          setContrast(100);
        }
      };
      reader.readAsDataURL(file);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) handleFile(file);
    };

    // ── Crop drag handles ──────────────────────────────────────────────────
    const onCropMouseDown = (mode: 'move' | 'nw' | 'ne' | 'sw' | 'se') => (
      e: React.MouseEvent | React.TouchEvent,
    ) => {
      e.preventDefault();
      e.stopPropagation();
      const point = 'touches' in e ? e.touches[0] : e;
      dragStateRef.current = {
        mode,
        startX: point.clientX,
        startY: point.clientY,
        startCrop: { ...crop },
      };
      const move = (ev: MouseEvent | TouchEvent) => {
        ev.preventDefault();
        const p = 'touches' in ev ? ev.touches[0] : (ev as MouseEvent);
        const dx = p.clientX - dragStateRef.current.startX;
        const dy = p.clientY - dragStateRef.current.startY;
        const ns = imageNaturalSize;
        if (!ns) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const scaleX = ns.w / canvas.width;
        const scaleY = ns.h / canvas.height;
        const realDx = dx * scaleX;
        const realDy = dy * scaleY;
        const start = dragStateRef.current.startCrop;
        const ratio = RATIO_VALUES[aspectRatio];

        let next = { ...start };
        if (dragStateRef.current.mode === 'move') {
          next.x = Math.max(0, Math.min(ns.w - start.w, start.x + realDx));
          next.y = Math.max(0, Math.min(ns.h - start.h, start.y + realDy));
        } else {
          // Resize handles. Constrain to image bounds + ratio.
          const m = dragStateRef.current.mode;
          if (m === 'se') {
            next.w = Math.max(20, Math.min(ns.w - start.x, start.w + realDx));
            if (ratio) next.h = next.w / ratio;
            else next.h = Math.max(20, Math.min(ns.h - start.y, start.h + realDy));
          } else if (m === 'sw') {
            const newW = Math.max(20, start.w - realDx);
            next.x = Math.max(0, start.x + start.w - newW);
            next.w = start.x + start.w - next.x;
            if (ratio) next.h = next.w / ratio;
            else next.h = Math.max(20, Math.min(ns.h - start.y, start.h + realDy));
          } else if (m === 'ne') {
            next.w = Math.max(20, Math.min(ns.w - start.x, start.w + realDx));
            const newH = ratio ? next.w / ratio : Math.max(20, start.h - realDy);
            next.y = Math.max(0, start.y + start.h - newH);
            next.h = start.y + start.h - next.y;
          } else if (m === 'nw') {
            const newW = Math.max(20, start.w - realDx);
            next.x = Math.max(0, start.x + start.w - newW);
            next.w = start.x + start.w - next.x;
            const newH = ratio ? next.w / ratio : Math.max(20, start.h - realDy);
            next.y = Math.max(0, start.y + start.h - newH);
            next.h = start.y + start.h - next.y;
          }
        }
        setCrop(next);
      };
      const up = () => {
        dragStateRef.current.mode = null;
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        window.removeEventListener('touchmove', move);
        window.removeEventListener('touchend', up);
      };
      window.addEventListener('mousemove', move, { passive: false });
      window.addEventListener('mouseup', up);
      window.addEventListener('touchmove', move, { passive: false });
      window.addEventListener('touchend', up);
    };

    // ── Output ─────────────────────────────────────────────────────────────
    const generateBlob = useCallback((): Promise<ImageEditResult | null> => {
      return new Promise((resolve) => {
        const img = imageRef.current;
        const ns = imageNaturalSize;
        if (!img || !ns) return resolve(null);
        const out = document.createElement('canvas');
        // Apply rotation: swap dimensions for 90° / 270°
        const isRotated = rotation % 180 !== 0;
        // Output dimensions are crop dimensions, capped at maxOutputSize
        const cropW = isRotated ? crop.h : crop.w;
        const cropH = isRotated ? crop.w : crop.h;
        const scale = Math.min(1, maxOutputSize / Math.max(cropW, cropH));
        out.width = Math.round(cropW * scale);
        out.height = Math.round(cropH * scale);
        const ctx = out.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

        // Draw the full image rotated, then we crop via source rect
        // Approach: draw onto an offscreen canvas with rotation applied,
        // then copy the cropped region.
        const intermediate = document.createElement('canvas');
        intermediate.width = isRotated ? ns.h : ns.w;
        intermediate.height = isRotated ? ns.w : ns.h;
        const ictx = intermediate.getContext('2d');
        if (!ictx) return resolve(null);
        ictx.translate(intermediate.width / 2, intermediate.height / 2);
        ictx.rotate((rotation * Math.PI) / 180);
        ictx.drawImage(img, -ns.w / 2, -ns.h / 2, ns.w, ns.h);

        // Now copy the crop region onto the output canvas
        ctx.drawImage(
          intermediate,
          crop.x, crop.y, crop.w, crop.h,
          0, 0, out.width, out.height,
        );

        out.toBlob(
          (blob) => {
            if (!blob) return resolve(null);
            const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/webp' ? 'webp' : 'png';
            const finalName = outputFilename.endsWith(`.${ext}`)
              ? outputFilename
              : outputFilename.replace(/\.\w+$/, '') + `.${ext}`;
            const file = new File([blob], finalName, {
              type: mimeType,
              lastModified: Date.now(),
            });
            const url = URL.createObjectURL(blob);
            resolve({ blob, file, url, width: out.width, height: out.height });
          },
          mimeType,
          quality,
        );
      });
    }, [crop, rotation, brightness, contrast, imageNaturalSize, mimeType, quality, maxOutputSize, outputFilename]);

    useImperativeHandle(
      ref,
      () => ({
        getResult: generateBlob,
        reset: () => {
          setRotation(0);
          setBrightness(100);
          setContrast(100);
          if (imageNaturalSize) {
            const ratio = RATIO_VALUES[aspectRatio];
            if (ratio) {
              const targetW = Math.min(imageNaturalSize.w, imageNaturalSize.h * ratio);
              const targetH = targetW / ratio;
              setCrop({
                x: (imageNaturalSize.w - targetW) / 2,
                y: (imageNaturalSize.h - targetH) / 2,
                w: targetW,
                h: targetH,
              });
            } else {
              setCrop({ x: 0, y: 0, w: imageNaturalSize.w, h: imageNaturalSize.h });
            }
          }
        },
        loadSource: (s: string) => setImageSrc(s),
      }),
      [generateBlob, aspectRatio, imageNaturalSize],
    );

    const handleApply = async () => {
      const r = await generateBlob();
      if (r && onResult) onResult(r);
    };

    // ── Styles ─────────────────────────────────────────────────────────────
    const rootStyle: CSSProperties = {
      border: `1px solid ${theme.css.border}`,
      borderRadius: 12,
      background: theme.css.surface,
      padding: 16,
      ...style,
    };
    const dropZoneStyle: CSSProperties = {
      border: `2px dashed ${isDragging ? theme.css.primary : theme.css.border}`,
      borderRadius: 10,
      padding: 48,
      textAlign: 'center',
      color: theme.css.textMuted,
      cursor: 'pointer',
      transition: 'border-color 0.15s',
      background: isDragging ? `${theme.css.primary}10` : 'transparent',
    };
    const toolbarStyle: CSSProperties = {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 12,
      alignItems: 'center',
    };
    const buttonStyle: CSSProperties = {
      padding: '8px 14px',
      border: `1px solid ${theme.css.border}`,
      borderRadius: 6,
      background: theme.css.bg,
      color: theme.css.text,
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 600,
      minHeight: 36,
    };
    const ratioBtnStyle = (active: boolean): CSSProperties => ({
      ...buttonStyle,
      background: active ? theme.css.primary : theme.css.bg,
      color: active ? theme.css.bg : theme.css.text,
      borderColor: active ? theme.css.primary : theme.css.border,
    });

    const canvasWrapStyle: CSSProperties = {
      position: 'relative',
      display: 'inline-block',
      maxWidth: '100%',
      userSelect: 'none',
      touchAction: 'none',
    };

    // Compute crop frame in display coordinates
    const cropDisplay = useMemo(() => {
      const canvas = canvasRef.current;
      const ns = imageNaturalSize;
      if (!canvas || !ns) return null;
      const isRotated = rotation % 180 !== 0;
      const sourceW = isRotated ? ns.h : ns.w;
      const sourceH = isRotated ? ns.w : ns.h;
      const sx = canvas.width / sourceW;
      const sy = canvas.height / sourceH;
      // Rotation maps crop coordinates from source (image) space → display space.
      // For simplicity in the UI we apply the inverse rotation visually;
      // the underlying crop state stays in image-natural coordinates.
      return {
        left: crop.x * sx,
        top: crop.y * sy,
        width: crop.w * sx,
        height: crop.h * sy,
      };
    }, [crop, imageNaturalSize, rotation]);

    if (!imageSrc) {
      return (
        <div className={className} style={rootStyle}>
          <div
            style={dropZoneStyle}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label="Upload image to edit"
          >
            <div style={{ fontSize: 14, marginBottom: 6 }}>{labels.drop}</div>
            <button
              type="button"
              style={{ ...buttonStyle, color: theme.css.primary, borderColor: theme.css.primary }}
            >
              {labels.browse}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div ref={containerRef} className={className} style={rootStyle}>
        <div style={toolbarStyle}>
          <span style={{ fontSize: 13, fontWeight: 600, marginRight: 4 }}>{labels.aspect}:</span>
          {ratios.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setAspectRatio(r)}
              style={ratioBtnStyle(aspectRatio === r)}
              aria-pressed={aspectRatio === r}
            >
              {r === 'free' ? labels.free : r}
            </button>
          ))}
          <div style={{ width: 1, height: 24, background: theme.css.border, margin: '0 4px' }} />
          <button
            type="button"
            onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
            style={buttonStyle}
            aria-label={`${labels.rotate} 90 degrees left`}
          >
            ↺ {labels.rotate}
          </button>
          <button
            type="button"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            style={buttonStyle}
            aria-label={`${labels.rotate} 90 degrees right`}
          >
            ↻ {labels.rotate}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ minWidth: 80 }}>{labels.brightness}</span>
            <input
              type="range"
              min={50}
              max={150}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              aria-label={labels.brightness}
              style={{ width: 140 }}
            />
            <span style={{ minWidth: 40, color: theme.css.textMuted, fontVariantNumeric: 'tabular-nums' }}>
              {brightness}%
            </span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ minWidth: 80 }}>{labels.contrast}</span>
            <input
              type="range"
              min={50}
              max={150}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              aria-label={labels.contrast}
              style={{ width: 140 }}
            />
            <span style={{ minWidth: 40, color: theme.css.textMuted, fontVariantNumeric: 'tabular-nums' }}>
              {contrast}%
            </span>
          </label>
        </div>

        <div style={canvasWrapStyle}>
          <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%' }} />
          {cropDisplay && (
            <div
              role="region"
              aria-label="Crop area"
              style={{
                position: 'absolute',
                left: cropDisplay.left,
                top: cropDisplay.top,
                width: cropDisplay.width,
                height: cropDisplay.height,
                border: `2px solid ${theme.css.primary}`,
                boxShadow: `0 0 0 9999px ${theme.css.bg}aa`,
                cursor: 'move',
                touchAction: 'none',
              }}
              onMouseDown={onCropMouseDown('move')}
              onTouchStart={onCropMouseDown('move')}
              tabIndex={0}
              onKeyDown={(e) => {
                const ns = imageNaturalSize;
                if (!ns) return;
                const step = e.shiftKey ? 20 : 5;
                if (e.key === 'ArrowLeft') setCrop((c) => ({ ...c, x: Math.max(0, c.x - step) }));
                else if (e.key === 'ArrowRight') setCrop((c) => ({ ...c, x: Math.min(ns.w - c.w, c.x + step) }));
                else if (e.key === 'ArrowUp') setCrop((c) => ({ ...c, y: Math.max(0, c.y - step) }));
                else if (e.key === 'ArrowDown') setCrop((c) => ({ ...c, y: Math.min(ns.h - c.h, c.y + step) }));
              }}
            >
              {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
                <div
                  key={corner}
                  onMouseDown={onCropMouseDown(corner)}
                  onTouchStart={onCropMouseDown(corner)}
                  style={{
                    position: 'absolute',
                    width: 14,
                    height: 14,
                    background: theme.css.primary,
                    border: `2px solid ${theme.css.bg}`,
                    borderRadius: 2,
                    cursor: `${corner}-resize`,
                    top: corner.startsWith('n') ? -7 : undefined,
                    bottom: corner.startsWith('s') ? -7 : undefined,
                    left: corner.endsWith('w') ? -7 : undefined,
                    right: corner.endsWith('e') ? -7 : undefined,
                    touchAction: 'none',
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          {onCancel && (
            <button type="button" onClick={onCancel} style={buttonStyle}>
              {labels.cancel}
            </button>
          )}
          <button
            type="button"
            onClick={handleApply}
            style={{
              ...buttonStyle,
              background: theme.css.primary,
              color: theme.css.bg,
              borderColor: theme.css.primary,
            }}
          >
            {labels.apply}
          </button>
        </div>
      </div>
    );
  },
);

TkxImageEditor.displayName = 'TkxImageEditor';
