// ── WCAG Accessibility Engine ────────────────────────────────────────────────
// Contrast calculation, focus management, keyboard patterns, screen reader

// ── Color Contrast ───────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  if (!hex || typeof hex !== 'string') return [0, 0, 0];
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return [isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsAA(fg: string, bg: string, largeText = false): boolean {
  return contrastRatio(fg, bg) >= (largeText ? 3 : 4.5);
}

export function meetsAAA(fg: string, bg: string, largeText = false): boolean {
  return contrastRatio(fg, bg) >= (largeText ? 4.5 : 7);
}

export function getAccessibleForeground(bg: string, candidates?: string[]): string {
  const defaults = ['#ffffff', '#000000'];
  const pool = candidates ?? defaults;
  return pool.reduce((best, candidate) => {
    return contrastRatio(candidate, bg) > contrastRatio(best, bg) ? candidate : best;
  }, pool[0]);
}

// ── LiveRegion Announcer ─────────────────────────────────────────────────────

export interface Announcer {
  announce(message: string, politeness?: 'polite' | 'assertive'): void;
  destroy(): void;
}

export function createAnnouncer(): Announcer {
  const politeEl = document.createElement('div');
  const assertiveEl = document.createElement('div');

  for (const el of [politeEl, assertiveEl]) {
    el.setAttribute('aria-atomic', 'true');
    el.style.cssText =
      'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    document.body.appendChild(el);
  }

  politeEl.setAttribute('aria-live', 'polite');
  assertiveEl.setAttribute('aria-live', 'assertive');

  return {
    announce(message, politeness = 'polite') {
      const el = politeness === 'assertive' ? assertiveEl : politeEl;
      el.textContent = '';
      setTimeout(() => {
        el.textContent = message;
      }, 0);
    },
    destroy() {
      politeEl.remove();
      assertiveEl.remove();
    },
  };
}

// ── Focus Trap ───────────────────────────────────────────────────────────────

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
].join(', ');

export interface FocusTrap {
  activate(): void;
  deactivate(): void;
}

export function createFocusTrap(container: HTMLElement): FocusTrap {
  let previousFocus: Element | null = null;
  let keyHandler: ((e: KeyboardEvent) => void) | null = null;

  function getFocusable(): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
      (el) => !el.closest('[hidden]') && !el.closest('[aria-hidden="true"]'),
    );
  }

  return {
    activate() {
      previousFocus = document.activeElement;
      const focusable = getFocusable();
      if (focusable.length > 0) focusable[0].focus();

      keyHandler = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        const focusable = getFocusable();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      container.addEventListener('keydown', keyHandler);
    },
    deactivate() {
      if (keyHandler) container.removeEventListener('keydown', keyHandler);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
      previousFocus = null;
      keyHandler = null;
    },
  };
}

// ── WAI-ARIA Keyboard Handlers ───────────────────────────────────────────────

export function handleTabsKeyboard(
  e: KeyboardEvent,
  currentIndex: number,
  tabCount: number,
  onSelect: (index: number) => void,
): void {
  let next = currentIndex;

  switch (e.key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      next = currentIndex === 0 ? tabCount - 1 : currentIndex - 1;
      break;
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault();
      next = currentIndex === tabCount - 1 ? 0 : currentIndex + 1;
      break;
    case 'Home':
      e.preventDefault();
      next = 0;
      break;
    case 'End':
      e.preventDefault();
      next = tabCount - 1;
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      onSelect(currentIndex);
      return;
    default:
      return;
  }

  onSelect(next);
}

export function handleMenuKeyboard(
  e: KeyboardEvent,
  currentIndex: number,
  itemCount: number,
  onSelect: (index: number) => void,
  onClose?: () => void,
): void {
  let next = currentIndex;

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      next = currentIndex === 0 ? itemCount - 1 : currentIndex - 1;
      break;
    case 'ArrowDown':
      e.preventDefault();
      next = currentIndex === itemCount - 1 ? 0 : currentIndex + 1;
      break;
    case 'Home':
      e.preventDefault();
      next = 0;
      break;
    case 'End':
      e.preventDefault();
      next = itemCount - 1;
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      onSelect(currentIndex);
      return;
    case 'Escape':
      e.preventDefault();
      onClose?.();
      return;
    default:
      return;
  }

  onSelect(next);
}

// ── Media Query Detection ────────────────────────────────────────────────────

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(forced-colors: active)').matches;
}

export function announceToScreenReader(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return;
  let el = document.getElementById('tkx-live-region');
  if (!el) {
    el = document.createElement('div');
    el.id = 'tkx-live-region';
    el.setAttribute('aria-live', politeness);
    el.setAttribute('aria-atomic', 'true');
    el.style.cssText =
      'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    document.body.appendChild(el);
  }
  el.textContent = '';
  setTimeout(() => {
    if (el) el.textContent = message;
  }, 0);
}

export const WCAGEngine = {
  contrastRatio,
  meetsAA,
  meetsAAA,
  getAccessibleForeground,
  createAnnouncer,
  createFocusTrap,
  handleTabsKeyboard,
  handleMenuKeyboard,
  prefersReducedMotion,
  prefersHighContrast,
  announce: announceToScreenReader,
};
