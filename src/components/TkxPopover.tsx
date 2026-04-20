'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { useReducedMotion, useEscapeKey, useClickOutside } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TkxPopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  placement?: PopoverPlacement;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnClickOutside?: boolean;
  className?: string;
  style?: CSSProperties;
}

// ── Arrow dimensions ────────────────────────────────────────────────────────

const ARROW_SIZE = 8;
const GAP = 8;

// ── Position calculator ─────────────────────────────────────────────────────

interface PopoverPosition {
  top: number;
  left: number;
  arrowStyle: CSSProperties;
  resolvedPlacement: PopoverPlacement;
}

function calcPosition(
  triggerRect: DOMRect,
  popoverEl: HTMLElement,
  placement: PopoverPlacement,
): PopoverPosition {
  const popRect = popoverEl.getBoundingClientRect();
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  let top = 0;
  let left = 0;
  let resolved = placement;

  // Attempt requested placement, flip if insufficient space
  const fits = {
    top: triggerRect.top - popRect.height - GAP - ARROW_SIZE > 0,
    bottom: triggerRect.bottom + popRect.height + GAP + ARROW_SIZE < viewH,
    left: triggerRect.left - popRect.width - GAP - ARROW_SIZE > 0,
    right: triggerRect.right + popRect.width + GAP + ARROW_SIZE < viewW,
  };

  if (!fits[placement]) {
    const flip: Record<PopoverPlacement, PopoverPlacement> = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    };
    if (fits[flip[placement]]) resolved = flip[placement];
  }

  switch (resolved) {
    case 'top':
      top = triggerRect.top + scrollY - popRect.height - GAP - ARROW_SIZE;
      left = triggerRect.left + scrollX + triggerRect.width / 2 - popRect.width / 2;
      break;
    case 'bottom':
      top = triggerRect.bottom + scrollY + GAP + ARROW_SIZE;
      left = triggerRect.left + scrollX + triggerRect.width / 2 - popRect.width / 2;
      break;
    case 'left':
      top = triggerRect.top + scrollY + triggerRect.height / 2 - popRect.height / 2;
      left = triggerRect.left + scrollX - popRect.width - GAP - ARROW_SIZE;
      break;
    case 'right':
      top = triggerRect.top + scrollY + triggerRect.height / 2 - popRect.height / 2;
      left = triggerRect.right + scrollX + GAP + ARROW_SIZE;
      break;
  }

  // Clamp to viewport
  left = Math.max(8, Math.min(left, viewW + scrollX - popRect.width - 8));
  top = Math.max(8, Math.min(top, viewH + scrollY - popRect.height - 8));

  // Arrow style
  const arrowStyle: CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: ARROW_SIZE,
  };

  switch (resolved) {
    case 'top':
      Object.assign(arrowStyle, {
        bottom: -ARROW_SIZE * 2,
        left: '50%',
        transform: 'translateX(-50%)',
        borderColor: 'var(--tkx-popover-bg) transparent transparent transparent',
      });
      break;
    case 'bottom':
      Object.assign(arrowStyle, {
        top: -ARROW_SIZE * 2,
        left: '50%',
        transform: 'translateX(-50%)',
        borderColor: 'transparent transparent var(--tkx-popover-bg) transparent',
      });
      break;
    case 'left':
      Object.assign(arrowStyle, {
        right: -ARROW_SIZE * 2,
        top: '50%',
        transform: 'translateY(-50%)',
        borderColor: 'transparent transparent transparent var(--tkx-popover-bg)',
      });
      break;
    case 'right':
      Object.assign(arrowStyle, {
        left: -ARROW_SIZE * 2,
        top: '50%',
        transform: 'translateY(-50%)',
        borderColor: 'transparent var(--tkx-popover-bg) transparent transparent',
      });
      break;
  }

  return { top, left, arrowStyle, resolvedPlacement: resolved };
}

// ── Component ───────────────────────────────────────────────────────────────

export function TkxPopover({
  trigger,
  content,
  placement = 'bottom',
  isOpen: controlledOpen,
  onOpenChange,
  closeOnClickOutside = true,
  className,
  style,
}: TkxPopoverProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const popoverId = useId();

  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<PopoverPosition | null>(null);

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!open), [setOpen, open]);

  useEscapeKey(close, open);

  // Click outside
  useEffect(() => {
    if (!open || !closeOnClickOutside) return;
    const handler = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open, closeOnClickOutside, close]);

  // Calculate position
  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !popoverRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      setPosition(calcPosition(triggerRect, popoverRef.current, placement));
    };

    // Initial calc after portal mount
    requestAnimationFrame(updatePosition);

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, placement]);

  const animationStyle: CSSProperties = reducedMotion
    ? { opacity: 1 }
    : {
        animation: 'tkxPopoverFadeIn 150ms ease forwards',
        opacity: 0,
      };

  const portalContent = open && typeof document !== 'undefined' ? (
    createPortal(
      <div
        ref={popoverRef}
        id={popoverId}
        role="dialog"
        aria-modal="false"
        className={tkx(
          'absolute z-[9100] rounded-lg font-sans',
          className ?? '',
        )}
        style={{
          '--tkx-popover-bg': theme.surface,
          top: position?.top ?? -9999,
          left: position?.left ?? -9999,
          backgroundColor: theme.surface,
          border: `1px solid ${theme.border}`,
          boxShadow: `0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`,
          minWidth: 200,
          maxWidth: 420,
          padding: '12px 16px',
          color: theme.text,
          ...animationStyle,
          ...style,
        } as CSSProperties}
      >
        {/* Arrow */}
        {position && <span style={position.arrowStyle} aria-hidden="true" />}
        {content}
      </div>,
      document.body,
    )
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        className={tkx('inline-flex')}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? popoverId : undefined}
      >
        {trigger}
      </div>
      {portalContent}
      {/* Inject animation keyframes */}
      {open && !reducedMotion && (
        <style>{`
          @keyframes tkxPopoverFadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      )}
    </>
  );
}

export default TkxPopover;