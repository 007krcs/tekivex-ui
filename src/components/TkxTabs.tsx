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

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TkxTab must be used inside TkxTabs');
  return ctx;
}

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
  const { activeIndex, setActiveIndex, baseId, tabCount } = useTabsContext();
  const tabRef = useRef<HTMLButtonElement>(null);
  const isActive = activeIndex === index;

  return (
    <button
      ref={tabRef}
      role="tab"
      id={`${baseId}-tab-${index}`}
      aria-controls={`${baseId}-panel-${index}`}
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
      onClick={() => !disabled && setActiveIndex(index)}
      onKeyDown={(e) => handleTabsKeyboard(e as unknown as KeyboardEvent, index, tabCount, (ni) => {
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
  const { activeIndex, baseId } = useTabsContext();
  if (activeIndex !== index) return null;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${index}`}
      aria-labelledby={`${baseId}-tab-${index}`}
      tabIndex={0}
      className={cx(tkx('pt-4'), className)}
      style={style}
    >
      {children}
    </div>
  );
}