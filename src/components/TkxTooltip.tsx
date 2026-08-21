'use client';

import {
  useState,
  useRef,
  useId,
  useEffect,
  useLayoutEffect,
  useCallback,
  isValidElement,
  cloneElement,
  type ReactElement,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useEscapeKey, useClickOutside, useReducedMotion } from '../hooks';
import { getAccessibleForeground } from '../engine/wcag';
import { tkx } from '../engine/tkx';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TkxTooltipProps {
  /** Tooltip content. Strings are sanitized; arbitrary ReactNode is rendered as-is. */
  content: ReactNode;
  children: ReactElement;
  placement?: TooltipPlacement;
  delay?: number;
  /** Controlled open state. When provided, hover/focus only report via onOpenChange. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true the tooltip never opens (even in controlled mode). */
  disabled?: boolean;
}

const GAP = 6;
const VIEWPORT_PADDING = 8;

const FLIP: Record<TooltipPlacement, TooltipPlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

interface TooltipPosition {
  top: number;
  left: number;
}

/**
 * Compute a fixed-position (viewport-relative) placement for the tooltip.
 * Flips to the opposite side when the preferred side would overflow the
 * viewport, then shifts to stay inside it (basic collision handling).
 */
function calcTooltipPosition(
  triggerRect: DOMRect,
  tooltipEl: HTMLElement,
  placement: TooltipPlacement,
): TooltipPosition {
  const tipRect = tooltipEl.getBoundingClientRect();
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  const fits: Record<TooltipPlacement, boolean> = {
    top: triggerRect.top - tipRect.height - GAP >= 0,
    bottom: triggerRect.bottom + tipRect.height + GAP <= viewH,
    left: triggerRect.left - tipRect.width - GAP >= 0,
    right: triggerRect.right + tipRect.width + GAP <= viewW,
  };

  let resolved = placement;
  if (!fits[placement] && fits[FLIP[placement]]) resolved = FLIP[placement];

  let top = 0;
  let left = 0;
  switch (resolved) {
    case 'top':
      top = triggerRect.top - tipRect.height - GAP;
      left = triggerRect.left + triggerRect.width / 2 - tipRect.width / 2;
      break;
    case 'bottom':
      top = triggerRect.bottom + GAP;
      left = triggerRect.left + triggerRect.width / 2 - tipRect.width / 2;
      break;
    case 'left':
      top = triggerRect.top + triggerRect.height / 2 - tipRect.height / 2;
      left = triggerRect.left - tipRect.width - GAP;
      break;
    case 'right':
      top = triggerRect.top + triggerRect.height / 2 - tipRect.height / 2;
      left = triggerRect.right + GAP;
      break;
  }

  // Shift to keep the tooltip inside the viewport.
  left = Math.max(VIEWPORT_PADDING, Math.min(left, viewW - tipRect.width - VIEWPORT_PADDING));
  top = Math.max(VIEWPORT_PADDING, Math.min(top, viewH - tipRect.height - VIEWPORT_PADDING));

  return { top, left };
}

export function TkxTooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
}: TkxTooltipProps) {
  const theme = useTheme();
  const isControlled = controlledOpen !== undefined;
  const [internalVisible, setInternalVisible] = useState(false);
  const visible = !disabled && (isControlled ? controlledOpen : internalVisible);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion();
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  // SSR guard: nothing is portaled until after the first client render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const safeContent = typeof content === 'string' ? sanitizeString(content) : content;
  const textColor = getAccessibleForeground(theme.css.surfaceAlt, [theme.css.text, '#ffffff', '#000000']);

  const setOpen = useCallback(
    (value: boolean) => {
      if (disabled) return;
      if (!isControlled) setInternalVisible(value);
      onOpenChange?.(value);
    },
    [disabled, isControlled, onOpenChange],
  );

  const show = useCallback(() => {
    if (disabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), delay);
  }, [disabled, delay, setOpen]);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (visible) setOpen(false);
  }, [visible, setOpen]);

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

  // Position the portaled tooltip from the trigger's viewport rect, and
  // reposition while open on scroll/resize (passive listeners).
  useLayoutEffect(() => {
    if (!visible || !mounted) return;

    const update = () => {
      const triggerEl = wrapperRef.current;
      const tipEl = tooltipRef.current;
      if (!triggerEl || !tipEl) return;
      setPosition(calcTooltipPosition(triggerEl.getBoundingClientRect(), tipEl, placement));
    };

    update();

    window.addEventListener('scroll', update, { passive: true, capture: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update, { capture: true });
      window.removeEventListener('resize', update);
      setPosition(null);
    };
  }, [visible, mounted, placement]);

  // If children is undefined or not a valid React element, cloneElement would
  // throw ("must be a React element"). Render the children as-is in that case
  // so a missing/conditional child doesn't white-screen the whole tree.
  let trigger: ReactNode;
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

  const tooltipStyle: CSSProperties = {
    position: 'fixed',
    top: position?.top ?? -9999,
    left: position?.left ?? -9999,
    backgroundColor: theme.css.surfaceAlt,
    color: textColor,
    border: `1px solid ${theme.css.border}`,
    boxShadow: `0 4px 12px ${theme.css.bg}40`,
    maxWidth: 280,
  };

  const portal =
    mounted && visible && typeof document !== 'undefined'
      ? createPortal(
          <span
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            className={tkx(
              'z-[9000] text-xs font-sans py-1.5 px-2.5 rounded-md whitespace-nowrap pointer-events-none',
              !reducedMotion && 'animate-fade-in',
            )}
            style={tooltipStyle}
          >
            {safeContent}
          </span>,
          document.body,
        )
      : null;

  return (
    <span ref={wrapperRef} className={tkx('relative inline-flex')}>
      {trigger}
      {portal}
    </span>
  );
}

export default TkxTooltip;
