'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useId,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion, useEscapeKey } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TkxAppBarProps {
  title?: ReactNode;
  /**
   * Slot rendered at the absolute start of the bar, before the logo. Used
   * for back arrows, drawer toggles, or any single "go up a level" affordance.
   * For full navigation menus use `navigation` instead.
   */
  leading?: ReactNode;
  logo?: ReactNode;
  actions?: ReactNode;
  navigation?: ReactNode;
  position?: 'fixed' | 'sticky' | 'static';
  variant?: 'default' | 'transparent' | 'elevated';
  color?: 'primary' | 'surface';
  className?: string;
  style?: CSSProperties;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MOBILE_BREAKPOINT = 768;
const BAR_HEIGHT = 56;

// ── Hamburger icon ──────────────────────────────────────────────────────────

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
  );
}

// ── Breakpoint hook ─────────────────────────────────────────────────────────

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isMobile;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TkxAppBar({
  title,
  leading,
  logo,
  actions,
  navigation,
  position = 'sticky',
  variant = 'default',
  color = 'surface',
  className,
  style,
}: TkxAppBarProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navId = useId();

  // Close mobile menu on escape
  useEscapeKey(() => setMenuOpen(false), menuOpen);

  // Close on resize to desktop
  useEffect(() => {
    if (!isMobile && menuOpen) setMenuOpen(false);
  }, [isMobile, menuOpen]);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [menuOpen]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  // ── Color resolution ────────────────────────────────────────────────────

  const bgColor = color === 'primary' ? theme.css.primary : theme.css.surface;
  const textColor = color === 'primary' ? theme.css.bg : theme.css.text;

  // ── Variant styles ──────────────────────────────────────────────────────

  const variantStyles: Record<string, CSSProperties> = {
    default: {
      backgroundColor: bgColor,
      borderBottom: `1px solid ${theme.css.border}`,
    },
    transparent: {
      backgroundColor: 'transparent',
      borderBottom: 'none',
    },
    elevated: {
      backgroundColor: bgColor,
      boxShadow: `0 2px 8px ${theme.css.bg}66`,
      borderBottom: 'none',
    },
  };

  // ── Position styles ─────────────────────────────────────────────────────

  const positionStyles: Record<string, CSSProperties> = {
    fixed: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100 },
    sticky: { position: 'sticky', top: 0, zIndex: 1100 },
    static: { position: 'static' },
  };

  const safeTitle = typeof title === 'string' ? sanitizeString(title) : title;

  // ── Transition ──────────────────────────────────────────────────────────

  const slideTransition = reduced
    ? 'none'
    : 'max-height 300ms cubic-bezier(0.4,0,0.2,1), opacity 300ms ease';

  return (
    <header
      role="banner"
      className={tkx('font-sans w-full', className ?? '')}
      style={{
        ...positionStyles[position],
        ...variantStyles[variant],
        color: textColor,
        height: BAR_HEIGHT,
        ...style,
      }}
    >
      <div
        ref={menuRef}
        className={tkx('flex items-center h-full px-4')}
        style={{ maxWidth: 1440, margin: '0 auto' }}
      >
        {/* Leading area (back arrow, drawer toggle, etc.) — sits before logo. */}
        {leading && (
          <div className={tkx('flex items-center shrink-0 mr-2')}>
            {leading}
          </div>
        )}

        {/* Logo area */}
        {logo && (
          <div
            className={tkx('flex items-center shrink-0 mr-3')}
            aria-hidden="true"
          >
            {logo}
          </div>
        )}

        {/* Title */}
        {safeTitle && (
          <div
            className={tkx('text-base font-semibold shrink-0 mr-4 leading-snug')}
            style={{ color: textColor }}
          >
            {safeTitle}
          </div>
        )}

        {/* Desktop navigation */}
        {!isMobile && navigation && (
          <nav
            id={navId}
            aria-label="Main navigation"
            className={tkx('flex items-center flex-1 gap-1')}
          >
            {navigation}
          </nav>
        )}

        {/* Spacer for mobile */}
        {isMobile && <div className={tkx('flex-1')} />}

        {/* Desktop actions */}
        {actions && (
          <div className={tkx('flex items-center gap-2 ml-auto shrink-0')}>
            {actions}
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && navigation && (
          <button
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls={navId}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={tkx(
              'bg-transparent border-none cursor-pointer p-2 ml-2 rounded flex items-center justify-center',
              'focus-visible:focus-ring',
            )}
            style={{ color: textColor }}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && navigation && (
        <nav
          id={navId}
          aria-label="Main navigation"
          style={{
            maxHeight: menuOpen ? 400 : 0,
            opacity: menuOpen ? 1 : 0,
            overflow: 'hidden',
            transition: slideTransition,
            backgroundColor: theme.css.surface,
            borderBottom: menuOpen ? `1px solid ${theme.css.border}` : 'none',
          }}
        >
          <div
            className={tkx('flex flex-col gap-1 px-4 py-3')}
            role="menu"
          >
            {navigation}
          </div>
        </nav>
      )}
    </header>
  );
}