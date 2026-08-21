'use client';

import { type ReactNode, type CSSProperties } from 'react';
import { useTheme } from '../themes';
import { useReducedMotion } from '../hooks';
import { cx } from '../engine/tkx';

// ── Props ──────────────────────────────────────────────────────────────────────

export type LogoVariant = 'full' | 'icon-only' | 'text-only';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type LogoOrientation = 'horizontal' | 'stacked';

export interface TkxLogoProps {
  text?: string;
  tagline?: string;
  variant?: LogoVariant;
  size?: LogoSize;
  orientation?: LogoOrientation;
  mark?: ReactNode;
  color?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

// ── Size config ────────────────────────────────────────────────────────────────

const SIZE_CONFIG: Record<LogoSize, {
  markSize: number;
  fontSize: number;
  taglineSize: number;
  gap: number;
  letterSpacing: string;
}> = {
  sm: { markSize: 24, fontSize: 14, taglineSize: 10, gap: 6, letterSpacing: '-0.01em' },
  md: { markSize: 32, fontSize: 18, taglineSize: 11, gap: 8, letterSpacing: '-0.02em' },
  lg: { markSize: 44, fontSize: 26, taglineSize: 13, gap: 12, letterSpacing: '-0.03em' },
  xl: { markSize: 60, fontSize: 36, taglineSize: 15, gap: 16, letterSpacing: '-0.04em' },
};

// ── Default SVG Mark ───────────────────────────────────────────────────────────
// Hexagonal quantum mark with a lightning bolt inside.

interface DefaultMarkProps {
  size: number;
  primaryColor: string;
  reducedMotion: boolean;
}

function DefaultMark({ size, primaryColor, reducedMotion }: DefaultMarkProps) {
  const id = 'tkx-logo-gradient';
  const glowId = 'tkx-logo-glow';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        filter: !reducedMotion ? `drop-shadow(0 0 ${size * 0.15}px ${primaryColor}60)` : undefined,
        flexShrink: 0,
      }}
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.6" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer hexagon */}
      <polygon
        points="24,3 42,13.5 42,34.5 24,45 6,34.5 6,13.5"
        stroke={primaryColor}
        strokeWidth="2"
        fill={`${primaryColor}12`}
        strokeLinejoin="round"
      />

      {/* Inner hexagon (rotated) */}
      <polygon
        points="24,9 37,16.5 37,31.5 24,39 11,31.5 11,16.5"
        stroke={primaryColor}
        strokeWidth="1"
        strokeOpacity="0.3"
        fill="none"
        strokeLinejoin="round"
      />

      {/* Lightning bolt */}
      <path
        d="M27 10 L18 26 L24 26 L21 38 L30 22 L24 22 Z"
        fill={`url(#${id})`}
        stroke={primaryColor}
        strokeWidth="0.5"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
      />

      {/* Corner accents */}
      <circle cx="24" cy="3" r="1.5" fill={primaryColor} opacity="0.7" />
      <circle cx="42" cy="13.5" r="1.5" fill={primaryColor} opacity="0.5" />
      <circle cx="42" cy="34.5" r="1.5" fill={primaryColor} opacity="0.5" />
      <circle cx="24" cy="45" r="1.5" fill={primaryColor} opacity="0.7" />
      <circle cx="6" cy="34.5" r="1.5" fill={primaryColor} opacity="0.5" />
      <circle cx="6" cy="13.5" r="1.5" fill={primaryColor} opacity="0.5" />
    </svg>
  );
}

// ── Glow animation style injection ────────────────────────────────────────────

let glowStyleInjected = false;

function injectGlowStyle() {
  if (glowStyleInjected || typeof document === 'undefined') return;
  glowStyleInjected = true;
  const style = document.createElement('style');
  style.id = 'tkx-logo-glow-anim';
  style.textContent = `
    @media (prefers-reduced-motion: no-preference) {
      .tkx-logo-glow {
        animation: tkx-logo-pulse 3s ease-in-out infinite;
      }
      @keyframes tkx-logo-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.75; }
      }
    }
  `;
  document.head.appendChild(style);
}

// ── TkxLogo Component ──────────────────────────────────────────────────────────

export function TkxLogo({
  text = 'TekiVex',
  tagline,
  variant = 'full',
  size = 'md',
  orientation = 'horizontal',
  mark,
  color,
  className,
  style,
  onClick,
}: TkxLogoProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const primaryColor = color ?? theme.css.primary;
  const config = SIZE_CONFIG[size];

  // Inject glow animation on first render
  injectGlowStyle();

  const showMark = variant !== 'text-only';
  const showText = variant !== 'icon-only';

  const isStacked = orientation === 'stacked';
  const isClickable = typeof onClick === 'function';

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: isStacked ? 'column' : 'row',
    alignItems: isStacked ? 'center' : 'center',
    gap: config.gap,
    cursor: isClickable ? 'pointer' : 'default',
    userSelect: 'none',
    textDecoration: 'none',
    ...style,
  };

  const textGroupStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: isStacked ? 'center' : 'flex-start',
    gap: 2,
  };

  const brandTextStyle: CSSProperties = {
    fontSize: config.fontSize,
    fontWeight: 800,
    letterSpacing: config.letterSpacing,
    lineHeight: 1,
    color: theme.css.text,
    fontFamily: 'inherit',
    margin: 0,
    padding: 0,
  };

  const taglineStyle: CSSProperties = {
    fontSize: config.taglineSize,
    fontWeight: 500,
    color: theme.css.textMuted,
    letterSpacing: '0.04em',
    lineHeight: 1,
    margin: 0,
    padding: 0,
  };

  // Brand name: "Teki" in theme text color, "Vex" in primary color
  const brandParts = splitBrand(text, primaryColor, theme.css.text);

  const ariaLabel = tagline
    ? `${text} — ${tagline}`
    : text;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={cx('tkx-logo-glow', className ?? '')}
      style={containerStyle}
      role="img"
      aria-label={ariaLabel}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {showMark && (
        mark ?? (
          <DefaultMark
            size={config.markSize}
            primaryColor={primaryColor}
            reducedMotion={reducedMotion}
          />
        )
      )}

      {showText && (
        <div style={textGroupStyle}>
          <span style={brandTextStyle} aria-hidden="true">
            {brandParts}
          </span>
          {tagline && (
            <span style={taglineStyle} aria-hidden="true">
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

TkxLogo.displayName = 'TkxLogo';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Splits the brand text so the last 3 characters are colored with the primary color.
 * For "TekiVex" → "Teki" (text color) + "Vex" (primary color).
 * Falls back to splitting at the midpoint for short names.
 */
function splitBrand(
  text: string,
  primaryColor: string,
  textColor: string,
): ReactNode {
  if (text.length <= 3) {
    return <span style={{ color: primaryColor }}>{text}</span>;
  }

  // Try to find a natural camelCase split point
  const camelMatch = text.match(/^([A-Za-z]+?)([A-Z][a-z]*)$/);
  if (camelMatch) {
    return (
      <>
        <span style={{ color: textColor }}>{camelMatch[1]}</span>
        <span style={{ color: primaryColor }}>{camelMatch[2]}</span>
      </>
    );
  }

  // Default: last 3 chars get primary color
  const split = text.length - 3;
  return (
    <>
      <span style={{ color: textColor }}>{text.slice(0, split)}</span>
      <span style={{ color: primaryColor }}>{text.slice(split)}</span>
    </>
  );
}