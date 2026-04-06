import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  type ImgHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx, cx } from '../engine/tkx';

export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
export type ImageRatio = '1/1' | '4/3' | '16/9' | '3/2' | '9/16' | 'auto';

export interface TkxImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallback?: ReactNode;
  placeholder?: 'blur' | 'skeleton' | 'none';
  fit?: ImageFit;
  ratio?: ImageRatio;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  caption?: string;
  lazy?: boolean;
  preview?: boolean;
}

const RATIO_PADDING: Record<Exclude<ImageRatio, 'auto'>, string> = {
  '1/1':  '100%',
  '4/3':  '75%',
  '16/9': '56.25%',
  '3/2':  '66.666%',
  '9/16': '177.777%',
};

const RADIUS_MAP: Record<NonNullable<TkxImageProps['radius']>, string> = {
  none: '0',
  sm:   '4px',
  md:   '8px',
  lg:   '16px',
  full: '9999px',
};

function BrokenImagePlaceholder({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

export function TkxImage({
  src,
  alt,
  fallback,
  placeholder = 'skeleton',
  fit = 'cover',
  ratio = 'auto',
  radius = 'none',
  caption,
  lazy = false,
  preview = false,
  className,
  style,
  ...rest
}: TkxImageProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const safeSrc = sanitizeString(src);
  const safeAlt = alt ? sanitizeString(alt) : '';
  const safeCaption = caption ? sanitizeString(caption) : '';
  const borderRadius = RADIUS_MAP[radius];

  // Check if image is already cached / complete
  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, []);

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => setErrored(true), []);

  const openLightbox = useCallback(() => {
    if (preview && !errored) setLightboxOpen(true);
  }, [preview, errored]);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [lightboxOpen, closeLightbox]);

  const showSkeleton = placeholder === 'skeleton' && !loaded && !errored;

  const shimmerStyle = showSkeleton && !reducedMotion
    ? { animation: 'tkx-shimmer 1.5s ease-in-out infinite' }
    : {};

  const imgElement = !errored ? (
    <img
      ref={imgRef}
      src={safeSrc}
      alt={safeAlt || undefined}
      role={safeAlt ? undefined : 'img'}
      aria-label={safeAlt ? undefined : 'Image'}
      loading={lazy ? 'lazy' : undefined}
      onLoad={handleLoad}
      onError={handleError}
      onClick={preview ? openLightbox : undefined}
      className={cx(
        tkx('block w-full h-full'),
        preview && !errored ? tkx('cursor-pointer') : '',
      )}
      style={{
        objectFit: fit,
        borderRadius,
        opacity: loaded ? 1 : 0,
        transition: reducedMotion ? 'none' : 'opacity 200ms ease',
        position: ratio === 'auto' ? undefined : 'absolute',
        inset: ratio === 'auto' ? undefined : 0,
      }}
      {...rest}
    />
  ) : null;

  const errorElement = errored ? (
    fallback ? (
      <>{fallback}</>
    ) : (
      <div
        role="img"
        aria-label={safeAlt || 'Image failed to load'}
        className={tkx('flex flex-col items-center justify-center gap-2 w-full h-full')}
        style={{
          backgroundColor: theme.surfaceAlt,
          borderRadius,
          color: theme.textMuted,
          minHeight: '80px',
        }}
      >
        <BrokenImagePlaceholder color={theme.textMuted} size={32} />
        <span className={tkx('text-xs')} style={{ color: theme.textMuted }}>
          Failed to load
        </span>
      </div>
    )
  ) : null;

  const skeletonElement = showSkeleton ? (
    <div
      aria-hidden="true"
      style={{
        position: ratio === 'auto' ? undefined : 'absolute',
        inset: ratio === 'auto' ? undefined : 0,
        width: '100%',
        height: ratio === 'auto' ? '100%' : undefined,
        minHeight: ratio === 'auto' ? '80px' : undefined,
        borderRadius,
        backgroundColor: theme.surfaceAlt,
        ...shimmerStyle,
      }}
    />
  ) : null;

  const inner =
    ratio === 'auto' ? (
      <div className={tkx('relative w-full')} style={{ borderRadius }}>
        {skeletonElement}
        {imgElement}
        {errorElement}
      </div>
    ) : (
      <div
        className={tkx('relative w-full overflow-hidden')}
        style={{ paddingBottom: RATIO_PADDING[ratio as Exclude<ImageRatio, 'auto'>], borderRadius }}
      >
        {skeletonElement}
        {imgElement}
        {errorElement}
      </div>
    );

  const content = safeCaption ? (
    <figure className={tkx('m-0 p-0 flex flex-col gap-2')} style={{ borderRadius }}>
      {inner}
      <figcaption
        className={tkx('text-sm text-center')}
        style={{ color: theme.textMuted }}
      >
        {safeCaption}
      </figcaption>
    </figure>
  ) : (
    inner
  );

  const wrapped = (
    <div className={cx(tkx('inline-block w-full'), className)} style={style}>
      {content}
    </div>
  );

  const lightbox =
    lightboxOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={safeAlt || 'Image preview'}
            className={tkx('fixed inset-0 z-[9500] flex items-center justify-center p-4')}
            onClick={closeLightbox}
          >
            <div
              aria-hidden="true"
              className={tkx('absolute inset-0')}
              style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
            />
            <img
              src={safeSrc}
              alt={safeAlt || 'Full-size preview'}
              onClick={(e) => e.stopPropagation()}
              className={tkx('relative z-10 max-w-full max-h-full')}
              style={{
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              }}
            />
            <button
              aria-label="Close preview"
              onClick={closeLightbox}
              className={tkx(
                'absolute top-4 right-4 z-10 flex items-center justify-center',
                'bg-transparent border-none cursor-pointer rounded-full p-2',
              )}
              style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {wrapped}
      {lightbox}
    </>
  );
}
