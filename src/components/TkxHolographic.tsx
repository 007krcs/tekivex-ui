// ─────────────────────────────────────────────────────────────────────────────
// TkxHolographic — 3D-tilt + iridescent-foil component family
//
// Design intent:
//   - Pointer-tracked 3D rotation (rotateX/rotateY) like Pokemon-card holos
//   - Iridescent conic-gradient "foil" overlay that shifts hue with cursor
//   - Optional scan-line overlay for the cyber/neo-brutalist look
//   - Glass-blur background via backdrop-filter
//   - 60 FPS via CSS variables + rAF (no React re-renders during pointer move)
//   - Respects prefers-reduced-motion: disables tilt, keeps the static foil
//   - Touch + keyboard accessible (Tab focus shows a subtle outline; no
//     interaction required to render the visual)
//   - Zero runtime dependencies — pure CSS + a tiny rAF loop
//
// Public surface:
//   TkxHolographicSurface  — primitive: any node + holographic effect
//   TkxHolographicCard     — Card variant with header / body slots
//   TkxHolographicAvatar   — circular profile-photo variant
//   TkxHolographicBadge    — small badge / tag variant
//   TkxHolographicButton   — button variant with click-spark
//
// Theming: reads tekivex-ui theme tokens; falls back to sane dark defaults.
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';
import { useReducedMotion } from '../headless';

// ── Shared CSS injection (single <style> per page) ──────────────────────────

let stylesInjected = false;
const STYLE_ID = 'tkx-holographic-styles';

export function injectHolographicStyles(): void {
  injectStyles();
}

function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) {
    stylesInjected = true;
    return;
  }
  stylesInjected = true;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
@keyframes tkx-holo-shimmer {
  0%   { background-position:   0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position:   0% 50%; }
}
@keyframes tkx-holo-snapback {
  to { --tkx-holo-rx: 0deg; --tkx-holo-ry: 0deg; --tkx-holo-mx: 50%; --tkx-holo-my: 50%; }
}
.tkx-holo-root {
  --tkx-holo-rx: 0deg;
  --tkx-holo-ry: 0deg;
  --tkx-holo-mx: 50%;
  --tkx-holo-my: 50%;
  position: relative;
  transform-style: preserve-3d;
  transform: perspective(1000px) rotateX(var(--tkx-holo-rx)) rotateY(var(--tkx-holo-ry));
  transition: transform 280ms cubic-bezier(.2,.8,.2,1);
  will-change: transform;
  isolation: isolate;
}
.tkx-holo-root.tkx-holo-tracking {
  transition: none;
}
.tkx-holo-foil {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background:
    radial-gradient(circle at var(--tkx-holo-mx) var(--tkx-holo-my),
      rgba(255,255,255,0.32) 0%,
      rgba(255,255,255,0.08) 22%,
      transparent 55%),
    conic-gradient(from calc(var(--tkx-holo-mx) * 3.6deg) at 50% 50%,
      #ff006e, #ffbe0b, #06d6a0, #00f5d4, #3a86ff, #7b2ff7, #ff006e);
  background-size: 100% 100%, 280% 280%;
  background-position: 0 0, var(--tkx-holo-mx) var(--tkx-holo-my);
  mix-blend-mode: color-dodge;
  opacity: 0.55;
  filter: saturate(1.4) contrast(1.1);
}
.tkx-holo-foil.tkx-holo-foil-soft {
  mix-blend-mode: overlay;
  opacity: 0.35;
}
.tkx-holo-scan {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: repeating-linear-gradient(
    180deg,
    rgba(255,255,255,0.06) 0px,
    rgba(255,255,255,0.06) 1px,
    transparent 1px,
    transparent 3px
  );
  mix-blend-mode: overlay;
  opacity: 0.5;
}
.tkx-holo-content {
  position: relative;
  z-index: 1;
  transform: translateZ(20px);
}
.tkx-holo-root:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}
@media (prefers-reduced-motion: reduce) {
  .tkx-holo-root, .tkx-holo-root.tkx-holo-tracking {
    transform: none !important;
    transition: none;
  }
  .tkx-holo-content { transform: none !important; }
  .tkx-holo-foil { animation: tkx-holo-shimmer 8s ease infinite; }
}`;
  document.head.appendChild(el);
}

// ── Pointer-tracking hook (CSS variables, no React re-renders) ──────────────

interface UseHoloTrackingOptions {
  /** Maximum tilt in degrees on either axis. Default 14. */
  maxTilt?: number;
  /** Disable interaction entirely. Default false. */
  disabled?: boolean;
}

function useHoloTracking(opts: UseHoloTrackingOptions = {}) {
  const { maxTilt = 14, disabled = false } = opts;
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ rx: 0, ry: 0, mx: 50, my: 50 });

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || disabled || reduced) return;

    function setVars() {
      if (!node) return;
      const { rx, ry, mx, my } = targetRef.current;
      node.style.setProperty('--tkx-holo-rx', `${rx}deg`);
      node.style.setProperty('--tkx-holo-ry', `${ry}deg`);
      node.style.setProperty('--tkx-holo-mx', `${mx}%`);
      node.style.setProperty('--tkx-holo-my', `${my}%`);
      rafRef.current = null;
    }

    function schedule() {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(setVars);
    }

    function onMove(e: PointerEvent) {
      const rect = node!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      // Clamp 0..1 then map to ±maxTilt; invert Y so cursor pushes "into" surface
      const cx = Math.max(0, Math.min(1, x));
      const cy = Math.max(0, Math.min(1, y));
      targetRef.current = {
        rx: (0.5 - cy) * maxTilt * 2,
        ry: (cx - 0.5) * maxTilt * 2,
        mx: cx * 100,
        my: cy * 100,
      };
      node!.classList.add('tkx-holo-tracking');
      schedule();
    }

    function onLeave() {
      targetRef.current = { rx: 0, ry: 0, mx: 50, my: 50 };
      node!.classList.remove('tkx-holo-tracking');
      schedule();
    }

    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', onLeave);
    return () => {
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', onLeave);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [maxTilt, disabled, reduced]);

  return ref;
}

// ── TkxHolographicSurface — primitive ───────────────────────────────────────

export interface TkxHolographicSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Maximum tilt in degrees on each axis. Default 14. */
  maxTilt?: number;
  /** Show scan-line overlay. Default true. */
  scanLines?: boolean;
  /** Foil intensity. 'strong' uses color-dodge; 'soft' uses overlay. Default 'strong'. */
  foilIntensity?: 'strong' | 'soft' | 'none';
  /** Border-radius. Default 16. */
  radius?: number | string;
  /** Disable pointer tilt + foil shifting. Default false. */
  disabled?: boolean;
}

export const TkxHolographicSurface = forwardRef<HTMLDivElement, TkxHolographicSurfaceProps>(
  function TkxHolographicSurface(
    {
      children,
      maxTilt = 14,
      scanLines = true,
      foilIntensity = 'strong',
      radius = 16,
      disabled = false,
      className,
      style,
      ...rest
    },
    forwardedRef,
  ) {
    const theme = useTheme();
    const trackingRef = useHoloTracking({ maxTilt, disabled });

    // Merge forwarded ref + internal ref
    useEffect(() => {
      if (!forwardedRef) return;
      const node = trackingRef.current;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else (forwardedRef as { current: HTMLDivElement | null }).current = node;
    }, [forwardedRef, trackingRef]);

    const rootStyle: CSSProperties = {
      borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
      background: `linear-gradient(135deg, ${theme.surface}cc, ${theme.surfaceAlt}cc)`,
      border: `1px solid ${theme.border}`,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: theme.text,
      ...style,
    };

    return (
      <div
        ref={trackingRef}
        className={['tkx-holo-root', className].filter(Boolean).join(' ')}
        style={rootStyle}
        {...rest}
      >
        {foilIntensity !== 'none' && (
          <div
            className={`tkx-holo-foil ${foilIntensity === 'soft' ? 'tkx-holo-foil-soft' : ''}`}
            aria-hidden="true"
          />
        )}
        {scanLines && <div className="tkx-holo-scan" aria-hidden="true" />}
        <div className="tkx-holo-content">{children}</div>
      </div>
    );
  },
);

// ── TkxHolographicCard — card with title + body ─────────────────────────────

export interface TkxHolographicCardProps
  extends Omit<TkxHolographicSurfaceProps, 'children' | 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  children?: ReactNode;
  /** Card padding. Default 24. */
  padding?: number | string;
}

export const TkxHolographicCard = forwardRef<HTMLDivElement, TkxHolographicCardProps>(
  function TkxHolographicCard(
    { title, subtitle, badge, children, padding = 24, ...rest },
    ref,
  ) {
    const theme = useTheme();
    const headerId = useId();
    const padStr = typeof padding === 'number' ? `${padding}px` : padding;

    return (
      <TkxHolographicSurface
        ref={ref}
        role="article"
        aria-labelledby={title ? headerId : undefined}
        {...rest}
        style={{ minHeight: 200, ...rest.style }}
      >
        <div style={{ padding: padStr }}>
          {(title || badge) && (
            <header
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
                marginBottom: subtitle ? 4 : 12,
              }}
            >
              {title && (
                <h3
                  id={headerId}
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: theme.text,
                  }}
                >
                  {title}
                </h3>
              )}
              {badge}
            </header>
          )}
          {subtitle && (
            <p style={{ margin: '0 0 16px', color: theme.textMuted, fontSize: 14 }}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </TkxHolographicSurface>
    );
  },
);

// ── TkxHolographicAvatar — circular profile-photo variant ──────────────────

export interface TkxHolographicAvatarProps
  extends Omit<TkxHolographicSurfaceProps, 'children' | 'radius'> {
  /** Image src URL. */
  src?: string;
  /** Alt text. Required for accessibility. */
  alt: string;
  /** Avatar size in px. Default 96. */
  size?: number;
  /** Initials shown when src is missing. */
  initials?: string;
}

export const TkxHolographicAvatar = forwardRef<HTMLDivElement, TkxHolographicAvatarProps>(
  function TkxHolographicAvatar(
    { src, alt, size = 96, initials, scanLines = false, ...rest },
    ref,
  ) {
    const theme = useTheme();
    return (
      <TkxHolographicSurface
        ref={ref}
        radius="50%"
        scanLines={scanLines}
        {...rest}
        style={{ width: size, height: size, ...rest.style }}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            role="img"
            aria-label={alt}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: size * 0.36,
              fontWeight: 700,
              color: theme.text,
            }}
          >
            {initials ?? alt.charAt(0).toUpperCase()}
          </div>
        )}
      </TkxHolographicSurface>
    );
  },
);

// ── TkxHolographicBadge — small chip variant ───────────────────────────────

export interface TkxHolographicBadgeProps
  extends Omit<TkxHolographicSurfaceProps, 'children' | 'radius' | 'maxTilt'> {
  children: ReactNode;
  /** Badge size. Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Semantic tone — controls accent + border color. Default 'neutral'. */
  tone?: 'neutral' | 'success' | 'info' | 'warning' | 'danger';
}

const BADGE_PADDING = { sm: '4px 10px', md: '6px 14px', lg: '8px 18px' };
const BADGE_FONT = { sm: 11, md: 13, lg: 15 };

const TONE_COLORS: Record<NonNullable<TkxHolographicBadgeProps['tone']>, { fg: string; bg: string; bd: string }> = {
  neutral: { fg: '#c4a8ff', bg: 'rgba(196,168,255,0.10)', bd: 'rgba(196,168,255,0.30)' },
  success: { fg: '#00f5d4', bg: 'rgba(0,245,212,0.10)',   bd: 'rgba(0,245,212,0.40)' },
  info:    { fg: '#7b8eff', bg: 'rgba(123,142,255,0.10)', bd: 'rgba(123,142,255,0.40)' },
  warning: { fg: '#ffbe0b', bg: 'rgba(255,190,11,0.10)',  bd: 'rgba(255,190,11,0.40)' },
  danger:  { fg: '#ff7eaf', bg: 'rgba(255,0,110,0.10)',   bd: 'rgba(255,0,110,0.40)' },
};

export const TkxHolographicBadge = forwardRef<HTMLDivElement, TkxHolographicBadgeProps>(
  function TkxHolographicBadge({ children, size = 'md', tone = 'neutral', scanLines = false, ...rest }, ref) {
    const t = TONE_COLORS[tone];
    return (
      <TkxHolographicSurface
        ref={ref}
        radius={999}
        scanLines={scanLines}
        maxTilt={6}
        {...rest}
        style={{
          display: 'inline-flex',
          padding: BADGE_PADDING[size],
          fontSize: BADGE_FONT[size],
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: t.fg,
          background: t.bg,
          border: `1px solid ${t.bd}`,
          ...rest.style,
        }}
      >
        {children}
      </TkxHolographicSurface>
    );
  },
);

// ── TkxHolographicButton — interactive button variant ──────────────────────

export interface TkxHolographicButtonProps
  extends Omit<TkxHolographicSurfaceProps, 'children' | 'radius' | 'onClick'> {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Disable click + tilt. */
  isDisabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const TkxHolographicButton = forwardRef<HTMLButtonElement, TkxHolographicButtonProps>(
  function TkxHolographicButton(
    { children, onClick, isDisabled = false, type = 'button', maxTilt = 8, ...rest },
    forwardedRef,
  ) {
    const theme = useTheme();
    const reduced = useReducedMotion();
    const btnRef = useRef<HTMLButtonElement>(null);
    const trackingRef = useHoloTracking({ maxTilt, disabled: isDisabled });

    // Merge refs onto the same node
    useEffect(() => {
      const node = btnRef.current;
      if (!node) return;
      // Apply tracking ref to the button itself
      (trackingRef as { current: HTMLDivElement | null }).current =
        node as unknown as HTMLDivElement;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef)
        (forwardedRef as { current: HTMLButtonElement | null }).current = node;
    }, [forwardedRef, trackingRef]);

    return (
      <button
        ref={btnRef}
        type={type}
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        className="tkx-holo-root"
        style={{
          position: 'relative',
          padding: '14px 28px',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: theme.text,
          background: `linear-gradient(135deg, ${theme.surface}, ${theme.surfaceAlt})`,
          border: `1px solid ${theme.primary}55`,
          borderRadius: 12,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.5 : 1,
          minHeight: 44,
          transformStyle: 'preserve-3d',
          ...rest.style,
        }}
        {...(rest as unknown as HTMLAttributes<HTMLButtonElement>)}
      >
        <span className="tkx-holo-foil" aria-hidden="true" />
        <span className="tkx-holo-content" style={{ display: 'inline-block' }}>
          {children}
        </span>
        {!reduced && !isDisabled && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: -1,
              borderRadius: 12,
              border: `1px solid ${theme.primary}88`,
              boxShadow: `0 0 24px ${theme.primary}44`,
              pointerEvents: 'none',
              opacity: 0.6,
            }}
          />
        )}
      </button>
    );
  },
);
