'use client';

import { useState, useRef, useId, useEffect, isValidElement, type ReactElement, cloneElement } from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useEscapeKey, useClickOutside, useReducedMotion } from '../hooks';
import { getAccessibleForeground } from '../engine/wcag';
import { tkx } from '../engine/tkx';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TkxTooltipProps {
  content: string;
  children: ReactElement;
  placement?: TooltipPlacement;
  delay?: number;
}

const PLACEMENT_STYLE: Record<TooltipPlacement, React.CSSProperties> = {
  top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6 },
  bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6 },
  left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 6 },
  right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 6 },
};

export function TkxTooltip({ content, children, placement = 'top', delay = 300 }: TkxTooltipProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion();
  const safeContent = sanitizeString(content);
  const textColor = getAccessibleForeground(theme.surfaceAlt, [theme.text, '#ffffff', '#000000']);

  function show() { timerRef.current = setTimeout(() => setVisible(true), delay); }
  function hide() { if (timerRef.current) clearTimeout(timerRef.current); setVisible(false); }

  useEscapeKey(hide, visible);
  useClickOutside(wrapperRef, hide);

  // Clear any pending show-timer on unmount to avoid
  // setState-after-unmount warnings during fast navigation.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // If children is undefined or not a valid React element, cloneElement would
  // throw ("must be a React element"). Render the children as-is in that case
  // so a missing/conditional child doesn't white-screen the whole tree.
  let trigger: React.ReactNode;
  if (isValidElement(children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const child = children as ReactElement<any>;
    trigger = cloneElement(child, {
      'aria-describedby': visible ? tooltipId : undefined,
      onMouseEnter: (e: React.MouseEvent) => { child.props.onMouseEnter?.(e); show(); },
      onMouseLeave: (e: React.MouseEvent) => { child.props.onMouseLeave?.(e); hide(); },
      onFocus: (e: React.FocusEvent) => { child.props.onFocus?.(e); show(); },
      onBlur: (e: React.FocusEvent) => { child.props.onBlur?.(e); hide(); },
    });
  } else {
    trigger = children ?? null;
  }

  return (
    <span ref={wrapperRef} className={tkx('relative inline-flex')}>
      {trigger}
      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={tkx('absolute z-[9000] text-xs font-sans py-1.5 px-2.5 rounded-md whitespace-nowrap pointer-events-none', !reducedMotion && 'animate-fade-in')}
          style={{
            backgroundColor: theme.surfaceAlt,
            color: textColor,
            border: `1px solid ${theme.border}`,
            boxShadow: `0 4px 12px ${theme.bg}40`,
            maxWidth: 280,
            ...PLACEMENT_STYLE[placement],
          }}
        >
          {safeContent}
        </span>
      )}
    </span>
  );
}