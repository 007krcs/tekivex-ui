'use client';

import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useFocusTrap, useEscapeKey, useAnnounce, useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

export interface TkxModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

const SIZE_W: Record<ModalSize, string> = { sm: '400px', md: '560px', lg: '720px', full: '100vw' };

let scrollLockCount = 0;
function lockScroll() { if (++scrollLockCount === 1) document.body.style.overflow = 'hidden'; }
function unlockScroll() { if (--scrollLockCount <= 0) { scrollLockCount = 0; document.body.style.overflow = ''; } }

export function TkxModal({ isOpen, onClose, title, size = 'md', closeOnOverlayClick = true, closeOnEscape = true, children, footer }: TkxModalProps) {
  const theme = useTheme();
  const titleId = useId();
  const trapRef = useFocusTrap(isOpen);
  const reducedMotion = useReducedMotion();
  const announce = useAnnounce();
  const safeTitle = sanitizeString(title);
  const isFull = size === 'full';

  useEscapeKey(onClose, closeOnEscape && isOpen);

  useEffect(() => {
    if (isOpen) { lockScroll(); announce(safeTitle, 'polite'); }
    else { unlockScroll(); }
    return () => { if (isOpen) unlockScroll(); };
  }, [isOpen, safeTitle, announce]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="presentation"
      className={tkx('fixed inset-0 z-[9000] flex', isFull ? 'items-stretch' : 'items-center justify-center', isFull ? '' : 'p-4')}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeOnOverlayClick ? onClose : undefined}
        className={tkx('absolute inset-0', !reducedMotion && 'animate-fade-in')}
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />

      {/* Dialog */}
      <div
        ref={trapRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={tkx('relative z-10 flex flex-col overflow-hidden', !reducedMotion && 'animate-slide-up', isFull ? '' : 'rounded-xl')}
        style={{
          backgroundColor: theme.surface,
          border: `1px solid ${theme.border}`,
          width: SIZE_W[size],
          maxWidth: '100%',
          maxHeight: isFull ? '100vh' : '90vh',
          boxShadow: `0 20px 60px ${theme.bg}80`,
        }}
      >
        {/* Header */}
        <div
          className={tkx('flex items-center justify-between px-6 py-5 shrink-0')}
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <h2
            id={titleId}
            className={tkx('m-0 text-lg font-semibold font-sans')}
            style={{ color: theme.text }}
          >
            {safeTitle}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className={tkx('bg-transparent border-none cursor-pointer rounded p-1 flex items-center justify-center focus-visible:focus-ring')}
            style={{ color: theme.textMuted }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          className={tkx('flex-1 overflow-y-auto px-6 py-6 font-sans')}
          style={{ color: theme.text }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={tkx('flex justify-end gap-2 px-6 py-4 shrink-0')}
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