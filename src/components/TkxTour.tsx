'use client';

import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ────────────────────────────────────────────────────────────────────

export interface TourStep {
  target: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface TkxTourProps {
  steps: TourStep[];
  isOpen?: boolean;
  onClose?: () => void;
  current?: number;
  onChange?: (step: number) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector);
  return el ? el.getBoundingClientRect() : null;
}

interface PopoverPos {
  top: number;
  left: number;
}

function computePosition(
  rect: DOMRect,
  placement: string,
  tipW: number,
  tipH: number,
): PopoverPos {
  const gap = 12;
  switch (placement) {
    case 'top':
      return { top: rect.top - tipH - gap + window.scrollY, left: rect.left + rect.width / 2 - tipW / 2 + window.scrollX };
    case 'bottom':
      return { top: rect.bottom + gap + window.scrollY, left: rect.left + rect.width / 2 - tipW / 2 + window.scrollX };
    case 'left':
      return { top: rect.top + rect.height / 2 - tipH / 2 + window.scrollY, left: rect.left - tipW - gap + window.scrollX };
    case 'right':
      return { top: rect.top + rect.height / 2 - tipH / 2 + window.scrollY, left: rect.right + gap + window.scrollX };
    default:
      return { top: rect.bottom + gap + window.scrollY, left: rect.left + window.scrollX };
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function TkxTour({
  steps,
  isOpen = false,
  onClose,
  current: controlledCurrent,
  onChange,
}: TkxTourProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [internal, setInternal] = useState(0);
  const current = controlledCurrent ?? internal;
  const tipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<PopoverPos>({ top: 0, left: 0 });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = steps[current];

  const updatePosition = useCallback(() => {
    if (!step) return;
    const rect = getRect(step.target);
    setTargetRect(rect);
    if (rect && tipRef.current) {
      const tipW = tipRef.current.offsetWidth;
      const tipH = tipRef.current.offsetHeight;
      setPos(computePosition(rect, step.placement ?? 'bottom', tipW, tipH));
    }
  }, [step]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, current, updatePosition]);

  // Focus trap: refocus popover on step change
  useEffect(() => {
    if (isOpen) tipRef.current?.focus();
  }, [isOpen, current]);

  const goTo = useCallback(
    (idx: number) => {
      setInternal(idx);
      onChange?.(idx);
    },
    [onChange],
  );

  const handleNext = useCallback(() => {
    if (current < steps.length - 1) goTo(current + 1);
    else onClose?.();
  }, [current, steps.length, goTo, onClose]);

  const handlePrev = useCallback(() => {
    if (current > 0) goTo(current - 1);
  }, [current, goTo]);

  if (!isOpen || !step) return null;

  const pad = 6;
  const safeTitle = sanitizeString(step.title);
  const safeDesc = sanitizeString(step.description);
  const TIP_W = 300;

  const overlay = (
    <div aria-hidden="true">
      {/* Dimming overlay with spotlight cutout via CSS clip-path */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          backgroundColor: 'rgba(0,0,0,0.55)',
          clipPath: targetRect
            ? `polygon(0% 0%, 0% 100%, ${targetRect.left - pad}px 100%, ${targetRect.left - pad}px ${targetRect.top - pad}px, ${targetRect.right + pad}px ${targetRect.top - pad}px, ${targetRect.right + pad}px ${targetRect.bottom + pad}px, ${targetRect.left - pad}px ${targetRect.bottom + pad}px, ${targetRect.left - pad}px 100%, 100% 100%, 100% 0%)`
            : undefined,
          transition: reducedMotion ? 'none' : 'clip-path 0.25s ease',
        }}
        onClick={onClose}
      />

      {/* Popover */}
      <div
        ref={tipRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Tour step ${current + 1} of ${steps.length}`}
        tabIndex={-1}
        style={{
          position: 'absolute',
          zIndex: 9999,
          top: pos.top,
          left: pos.left,
          width: TIP_W,
          backgroundColor: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 10,
          padding: 20,
          boxShadow: `0 8px 24px ${theme.bg}80`,
          animation: reducedMotion ? 'none' : 'tkxFadeIn 0.2s ease',
          fontFamily: 'inherit',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose?.();
        }}
      >
        <h3
          className={tkx('m-0 mb-2 text-base font-semibold')}
          style={{ color: theme.text }}
        >
          {safeTitle}
        </h3>
        <p
          className={tkx('m-0 mb-4 text-sm leading-relaxed')}
          style={{ color: theme.textMuted }}
        >
          {safeDesc}
        </p>

        {/* Step dots */}
        <div className={tkx('flex items-center gap-1 mb-4')} aria-label="Tour progress">
          {steps.map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: i === current ? theme.primary : theme.border,
                transition: reducedMotion ? 'none' : 'background-color 0.2s',
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className={tkx('flex items-center justify-between gap-2')}>
          <button
            type="button"
            aria-label="Skip tour"
            onClick={onClose}
            className={tkx('border-0 bg-transparent cursor-pointer text-sm px-2 py-1')}
            style={{ color: theme.textMuted }}
          >
            Skip
          </button>
          <div className={tkx('flex gap-2')}>
            {current > 0 && (
              <button
                type="button"
                aria-label="Previous step"
                onClick={handlePrev}
                className={tkx('rounded-md border px-3 py-1 text-sm cursor-pointer bg-transparent')}
                style={{ borderColor: theme.border, color: theme.text }}
              >
                Prev
              </button>
            )}
            <button
              type="button"
              aria-label={current === steps.length - 1 ? 'Finish tour' : 'Next step'}
              onClick={handleNext}
              className={tkx('rounded-md border-0 px-4 py-1 text-sm cursor-pointer font-medium')}
              style={{ backgroundColor: theme.primary, color: '#fff' }}
            >
              {current === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}