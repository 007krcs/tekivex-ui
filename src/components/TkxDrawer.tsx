'use client';

import {
  useEffect,
  useId,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useFocusTrap, useEscapeKey, useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface TkxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}

// ── Size map ──────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<DrawerSize, string> = {
  sm:   '280px',
  md:   '380px',
  lg:   '480px',
  xl:   '600px',
  full: '100%',
};

// ── Scroll lock ───────────────────────────────────────────────────────────────

let scrollLockCount = 0;
function lockScroll()   { if (++scrollLockCount === 1)  document.body.style.overflow = 'hidden'; }
function unlockScroll() { if (--scrollLockCount <= 0) { scrollLockCount = 0; document.body.style.overflow = ''; } }

// ── Transform helpers ─────────────────────────────────────────────────────────

function getClosedTransform(placement: DrawerPlacement): string {
  switch (placement) {
    case 'left':   return 'translateX(-100%)';
    case 'right':  return 'translateX(100%)';
    case 'top':    return 'translateY(-100%)';
    case 'bottom': return 'translateY(100%)';
  }
}

function getPanelPositionStyle(placement: DrawerPlacement, size: DrawerSize): React.CSSProperties {
  const dim = SIZE_MAP[size];
  const isHorizontal = placement === 'left' || placement === 'right';

  const base: React.CSSProperties = { position: 'absolute' };

  if (isHorizontal) {
    return {
      ...base,
      top: 0,
      bottom: 0,
      [placement]: 0,
      width: dim,
      maxWidth: '100vw',
      height: '100%',
    };
  } else {
    return {
      ...base,
      left: 0,
      right: 0,
      [placement]: 0,
      height: dim,
      maxHeight: '100vh',
      width: '100%',
    };
  }
}

// ── Close button icon ─────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TkxDrawer({
  isOpen,
  onClose,
  placement = 'right',
  size = 'md',
  title,
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEsc = true,
}: TkxDrawerProps) {
  const theme     = useTheme();
  const reduced   = useReducedMotion();
  const titleId   = useId();
  const trapRef   = useFocusTrap(isOpen);

  useEscapeKey(onClose, closeOnEsc && isOpen);

  useEffect(() => {
    if (isOpen) lockScroll();
    else unlockScroll();
    return () => { if (isOpen) unlockScroll(); };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  const panelPositionStyle = getPanelPositionStyle(placement, size);
  const closedTransform    = getClosedTransform(placement);
  const transition         = reduced
    ? 'none'
    : 'transform 280ms cubic-bezier(0.4,0,0.2,1), opacity 280ms ease';

  const safeTitle = typeof title === 'string' ? sanitizeString(title) : title;

  return createPortal(
    <div
      role="presentation"
      className={tkx('fixed inset-0 z-[9000]')}
      style={{
        pointerEvents: isOpen ? 'auto' : 'none',
        visibility: isOpen ? 'visible' : 'hidden',
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeOnOverlayClick ? onClose : undefined}
        className={tkx('absolute inset-0')}
        style={{
          backgroundColor: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(3px)',
          opacity: isOpen ? 1 : 0,
          transition: reduced ? 'none' : 'opacity 280ms ease',
          cursor: closeOnOverlayClick ? 'pointer' : 'default',
        }}
      />

      {/* Drawer panel */}
      <div
        ref={trapRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={tkx('absolute flex flex-col font-sans')}
        style={{
          ...panelPositionStyle,
          backgroundColor: theme.surface,
          borderLeft: placement === 'right' ? `1px solid ${theme.border}` : undefined,
          borderRight: placement === 'left' ? `1px solid ${theme.border}` : undefined,
          borderTop: placement === 'bottom' ? `1px solid ${theme.border}` : undefined,
          borderBottom: placement === 'top' ? `1px solid ${theme.border}` : undefined,
          boxShadow: `0 20px 60px ${theme.bg}99`,
          transform: isOpen ? 'translate(0,0)' : closedTransform,
          opacity: isOpen ? 1 : 0,
          transition,
          willChange: 'transform',
        }}
      >
        {/* Header */}
        {(title !== undefined) && (
          <div
            className={tkx('flex items-center justify-between px-5 py-4 shrink-0')}
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            <h2
              id={titleId}
              className={tkx('m-0 text-base font-semibold leading-snug')}
              style={{ color: theme.text }}
            >
              {safeTitle}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              className={tkx('bg-transparent border-none cursor-pointer rounded p-1 flex items-center justify-center focus-visible:focus-ring')}
              style={{ color: theme.textMuted }}
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {/* Close button when no title */}
        {title === undefined && (
          <div className={tkx('flex justify-end px-3 pt-3 shrink-0')}>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              className={tkx('bg-transparent border-none cursor-pointer rounded p-1 flex items-center justify-center focus-visible:focus-ring')}
              style={{ color: theme.textMuted }}
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {/* Body */}
        <div
          className={tkx('flex-1 overflow-y-auto px-5 py-4')}
          style={{ color: theme.text }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={tkx('flex items-center justify-end gap-2 px-5 py-4 shrink-0')}
            style={{ borderTop: `1px solid ${theme.border}` }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}