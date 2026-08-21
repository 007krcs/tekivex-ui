'use client';

import { type ReactNode, type CSSProperties, createElement } from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';

// ── Interface ───────────────────────────────────────────────────────────────

export interface TkxEmptyProps {
  image?: ReactNode | 'default' | 'simple';
  description?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

// ── Default SVG Illustration (empty box) ────────────────────────────────────

function DefaultImage({ color, mutedColor }: { color: string; mutedColor: string }) {
  return createElement(
    'svg',
    {
      width: 120,
      height: 100,
      viewBox: '0 0 120 100',
      fill: 'none',
      'aria-hidden': 'true',
    },
    // Box base
    createElement('path', {
      d: 'M20 40 L60 20 L100 40 L60 60 Z',
      fill: `${mutedColor}18`,
      stroke: mutedColor,
      strokeWidth: 1.5,
      strokeLinejoin: 'round',
    }),
    // Box left side
    createElement('path', {
      d: 'M20 40 L20 65 L60 85 L60 60 Z',
      fill: `${mutedColor}10`,
      stroke: mutedColor,
      strokeWidth: 1.5,
      strokeLinejoin: 'round',
    }),
    // Box right side
    createElement('path', {
      d: 'M100 40 L100 65 L60 85 L60 60 Z',
      fill: `${mutedColor}0d`,
      stroke: mutedColor,
      strokeWidth: 1.5,
      strokeLinejoin: 'round',
    }),
    // Box opening flap left
    createElement('path', {
      d: 'M20 40 L40 28 L60 40 L40 52 Z',
      fill: `${color}15`,
      stroke: color,
      strokeWidth: 1,
      strokeLinejoin: 'round',
      strokeDasharray: '3 2',
    }),
    // Box opening flap right
    createElement('path', {
      d: 'M60 40 L80 28 L100 40 L80 52 Z',
      fill: `${color}15`,
      stroke: color,
      strokeWidth: 1,
      strokeLinejoin: 'round',
      strokeDasharray: '3 2',
    }),
  );
}

// ── Simple SVG Icon (minimal) ───────────────────────────────────────────────

function SimpleImage({ mutedColor }: { mutedColor: string }) {
  return createElement(
    'svg',
    {
      width: 64,
      height: 64,
      viewBox: '0 0 64 64',
      fill: 'none',
      'aria-hidden': 'true',
    },
    // Page outline
    createElement('rect', {
      x: 16,
      y: 8,
      width: 32,
      height: 40,
      rx: 3,
      fill: `${mutedColor}12`,
      stroke: mutedColor,
      strokeWidth: 1.5,
    }),
    // Lines on page
    createElement('line', {
      x1: 24,
      y1: 20,
      x2: 40,
      y2: 20,
      stroke: mutedColor,
      strokeWidth: 1.5,
      strokeLinecap: 'round',
    }),
    createElement('line', {
      x1: 24,
      y1: 28,
      x2: 36,
      y2: 28,
      stroke: mutedColor,
      strokeWidth: 1.5,
      strokeLinecap: 'round',
    }),
    createElement('line', {
      x1: 24,
      y1: 36,
      x2: 32,
      y2: 36,
      stroke: mutedColor,
      strokeWidth: 1.5,
      strokeLinecap: 'round',
    }),
    // Circle with dash (empty indicator)
    createElement('circle', {
      cx: 32,
      cy: 54,
      r: 6,
      stroke: mutedColor,
      strokeWidth: 1.2,
      fill: 'none',
    }),
    createElement('line', {
      x1: 28,
      y1: 54,
      x2: 36,
      y2: 54,
      stroke: mutedColor,
      strokeWidth: 1.2,
      strokeLinecap: 'round',
    }),
  );
}

// ── TkxEmpty ────────────────────────────────────────────────────────────────

export function TkxEmpty({
  image = 'default',
  description = 'No data',
  children,
  style,
}: TkxEmptyProps) {
  const theme = useTheme();

  const safeDescription =
    typeof description === 'string' ? sanitizeString(description) : description;

  let imageContent: ReactNode;
  if (image === 'default') {
    imageContent = createElement(DefaultImage, {
      color: theme.css.primary,
      mutedColor: theme.css.textMuted,
    });
  } else if (image === 'simple') {
    imageContent = createElement(SimpleImage, { mutedColor: theme.css.textMuted });
  } else {
    imageContent = image;
  }

  return createElement(
    'div',
    {
      role: 'status',
      style: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        textAlign: 'center' as const,
        ...style,
      },
    },
    // Image area
    createElement(
      'div',
      {
        style: {
          marginBottom: '12px',
          opacity: 0.85,
        },
      },
      imageContent,
    ),
    // Description
    safeDescription &&
      createElement(
        'div',
        {
          style: {
            color: theme.css.textMuted,
            fontSize: '0.875rem',
            lineHeight: '1.5',
            maxWidth: '320px',
          },
        },
        safeDescription,
      ),
    // Action area (children)
    children &&
      createElement(
        'div',
        {
          style: {
            marginTop: '16px',
          },
        },
        children,
      ),
  );
}