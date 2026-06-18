'use client';

import { createContext, useContext, useState, useRef, useId, type ReactNode, type HTMLAttributes } from 'react';
import { useTheme } from '../themes';
import { handleTabsKeyboard } from '../engine/wcag';
import { tkx, cx } from '../engine/tkx';

interface TabsContextValue {
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  baseId: string;
  tabCount: number;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TkxTabsProps {
  defaultIndex?: number;
  activeIndex?: number;
  onChange?: (i: number) => void;
  children: ReactNode;
  tabCount?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function TkxTabs({ defaultIndex = 0, activeIndex: controlled, onChange, children, tabCount = 0, style, className }: TkxTabsProps) {
  const [internal, setInternal] = useState(defaultIndex);
  const baseId = useId();
  const active = controlled !== undefined ? controlled : internal;
  const setActive = (i: number) => { if (controlled === undefined) setInternal(i); onChange?.(i); };

  return (
    <TabsContext.Provider value={{ activeIndex: active, setActiveIndex: setActive, baseId, tabCount }}>
      <div className={className} style={style}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TkxTabListProps extends HTMLAttributes<HTMLDivElement> { children: ReactNode; }

export function TkxTabList({ children, className, style, ...rest }: TkxTabListProps) {
  const theme = useTheme();
  return (
    <div
      role="tablist"
      className={cx(tkx('flex gap-1'), className)}
      style={{ borderBottom: `2px solid ${theme.border}`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface TkxTabProps { index: number; children: ReactNode; disabled?: boolean; className?: string; style?: React.CSSProperties; }

export function TkxTab({ index, children, disabled = false, className, style }: TkxTabProps) {
  const theme = useTheme();
  // Used outside a TkxTabs provider? Render a minimal, inert tab rather than
  // throwing and white-screening the tree.
  const ctx = useContext(TabsContext);
  const tabRef = useRef<HTMLButtonElement>(null);
  if (!ctx) {
    return (
      <button
        ref={tabRef}
        role="tab"
        type="button"
        disabled={disabled}
        className={className}
        style={style}
      >
        {children}
      </button>
    );
  }
  const { activeIndex, setActiveIndex, baseId, tabCount } = ctx;
  const safeIndex = index ?? 0;
  const isActive = activeIndex === safeIndex;

  return (
    <button
      ref={tabRef}
      role="tab"
      id={`${baseId}-tab-${safeIndex}`}
      aria-controls={`${baseId}-panel-${safeIndex}`}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      className={cx(
        tkx(
          'border-none bg-transparent font-sans text-sm rounded-t cursor-pointer select-none',
          'py-2.5 px-4 transition-colors duration-150 focus-visible:focus-ring',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ),
        className,
      )}
      style={{
        color: isActive ? theme.primary : theme.textMuted,
        fontWeight: isActive ? 600 : 400,
        borderBottom: isActive ? `2px solid ${theme.primary}` : '2px solid transparent',
        marginBottom: '-2px',
        ...style,
      }}
      onClick={() => !disabled && setActiveIndex(safeIndex)}
      onKeyDown={(e) => handleTabsKeyboard(e as unknown as KeyboardEvent, safeIndex, tabCount, (ni) => {
        setActiveIndex(ni);
        document.getElementById(`${baseId}-tab-${ni}`)?.focus();
      })}
    >
      {children}
    </button>
  );
}

export function TkxTabPanels({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...rest}>{children}</div>;
}

export interface TkxTabPanelProps { index: number; children: ReactNode; style?: React.CSSProperties; className?: string; }

export function TkxTabPanel({ index, children, style, className }: TkxTabPanelProps) {
  // Used outside a TkxTabs provider? Render children in a minimal panel
  // instead of throwing.
  const ctx = useContext(TabsContext);
  const safeIndex = index ?? 0;
  if (!ctx) {
    return (
      <div role="tabpanel" className={className} style={style}>
        {children}
      </div>
    );
  }
  const { activeIndex, baseId } = ctx;
  if (activeIndex !== safeIndex) return null;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${safeIndex}`}
      aria-labelledby={`${baseId}-tab-${safeIndex}`}
      tabIndex={0}
      className={cx(tkx('pt-4'), className)}
      style={style}
    >
      {children}
    </div>
  );
}