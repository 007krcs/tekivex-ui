'use client';

import {
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type CSSProperties,
  createElement,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';

// ── Interface ───────────────────────────────────────────────────────────────

export interface TkxSpinProps {
  spinning?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tip?: string;
  indicator?: ReactNode;
  children?: ReactNode;
  fullscreen?: boolean;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

// ── Size Config ─────────────────────────────────────────────────────────────

const SIZE_MAP: Record<string, { dimension: number; borderWidth: number; fontSize: string }> = {
  sm: { dimension: 20, borderWidth: 2, fontSize: '0.75rem' },
  md: { dimension: 32, borderWidth: 3, fontSize: '0.875rem' },
  lg: { dimension: 48, borderWidth: 4, fontSize: '1rem' },
};

// ── Keyframes Injection ─────────────────────────────────────────────────────

let stylesInjected = false;

function injectSpinStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;
  const styleEl = document.createElement('style');
  styleEl.id = 'tkx-spin-styles';
  styleEl.textContent = `
    @keyframes tkx-spin-rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleEl);
}

// ── Static Indicator (reduced motion) ───────────────────────────────────────

function StaticIndicator({ size, color }: { size: number; color: string }) {
  return createElement(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      role: 'img',
      'aria-label': 'Loading',
    },
    createElement('circle', {
      cx: 12,
      cy: 12,
      r: 10,
      stroke: `${color}33`,
      strokeWidth: 2.5,
      fill: 'none',
    }),
    createElement('path', {
      d: 'M12 2a10 10 0 0 1 10 10',
      stroke: color,
      strokeWidth: 2.5,
      strokeLinecap: 'round',
      fill: 'none',
    }),
  );
}

// ── Default Spinner ─────────────────────────────────────────────────────────

function DefaultSpinner({
  size,
  borderWidth,
  color,
  reducedMotion,
}: {
  size: number;
  borderWidth: number;
  color: string;
  reducedMotion: boolean;
}) {
  if (reducedMotion) {
    return createElement(StaticIndicator, { size, color });
  }

  injectSpinStyles();

  return createElement('div', {
    role: 'img',
    'aria-label': 'Loading',
    style: {
      width: `${size}px`,
      height: `${size}px`,
      border: `${borderWidth}px solid ${color}33`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'tkx-spin-rotate 0.8s linear infinite',
      boxSizing: 'border-box',
    },
  });
}

// ── TkxSpin ─────────────────────────────────────────────────────────────────

export function TkxSpin({
  spinning = true,
  size = 'md',
  tip,
  indicator,
  children,
  fullscreen = false,
  delay = 0,
  className,
  style,
}: TkxSpinProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(delay === 0 && spinning);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (spinning && delay > 0) {
      timerRef.current = setTimeout(() => setVisible(true), delay);
    } else {
      setVisible(spinning);
    }
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [spinning, delay]);

  if (!visible) {
    return children ? createElement('div', { className, style }, children) : null;
  }

  const sizeConfig = SIZE_MAP[size];
  const safeTip = tip ? sanitizeString(tip) : undefined;

  const spinnerContent = createElement(
    'div',
    {
      role: 'status',
      'aria-live': 'polite',
      'aria-label': safeTip ?? 'Loading',
      style: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      },
    },
    indicator ??
      createElement(DefaultSpinner, {
        size: sizeConfig.dimension,
        borderWidth: sizeConfig.borderWidth,
        color: theme.css.primary,
        reducedMotion,
      }),
    safeTip &&
      createElement(
        'span',
        {
          style: {
            color: theme.css.primary,
            fontSize: sizeConfig.fontSize,
            marginTop: '4px',
          },
        },
        safeTip,
      ),
  );

  // Fullscreen overlay
  if (fullscreen) {
    return createElement(
      'div',
      {
        className,
        style: {
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${theme.css.bg}cc`,
          zIndex: 9999,
          ...style,
        },
      },
      spinnerContent,
    );
  }

  // Wrapper mode: overlay on children
  if (children) {
    return createElement(
      'div',
      {
        className,
        style: {
          position: 'relative',
          ...style,
        },
      },
      createElement(
        'div',
        {
          style: {
            filter: 'blur(1px)',
            opacity: 0.5,
            pointerEvents: 'none',
            userSelect: 'none',
            transition: reducedMotion ? 'none' : 'opacity 0.2s, filter 0.2s',
          },
        },
        children,
      ),
      createElement(
        'div',
        {
          style: {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${theme.css.bg}66`,
            borderRadius: '4px',
          },
        },
        spinnerContent,
      ),
    );
  }

  // Standalone spinner
  return createElement(
    'div',
    {
      className,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      },
    },
    spinnerContent,
  );
}