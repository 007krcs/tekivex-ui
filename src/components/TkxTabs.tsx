'use client';

import { createContext, useContext, useState, useRef, useId, useCallback, useEffect, useMemo, type ReactNode, type HTMLAttributes } from 'react';
import { useTheme } from '../themes';
import { handleTabsKeyboard } from '../engine/wcag';
import { tkx, cx } from '../engine/tkx';

interface TabsContextValue {
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  baseId: string;
  tabCount: number;
  isTabDisabled: (i: number) => boolean;
  /** Registers a tab's index + disabled state; returns an unregister fn. */
  registerTab: (index: number, disabled: boolean) => () => void;
  /**
   * Registers a tabpanel that is CURRENTLY MOUNTED; returns an unregister fn.
   * Inactive panels unmount, so this is what tells a tab whether its
   * `aria-controls` target actually exists in the document.
   */
  registerPanel: (index: number) => () => void;
  /** True when the panel for `index` is mounted right now. */
  hasPanel: (index: number) => boolean;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TkxTabsProps {
  defaultIndex?: number;
  activeIndex?: number;
  onChange?: (i: number) => void;
  children: ReactNode;
  /**
   * Optional override for the number of tabs. Normally NOT needed — the
   * count is derived from the mounted TkxTab children automatically.
   */
  tabCount?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function TkxTabs({ defaultIndex = 0, activeIndex: controlled, onChange, children, tabCount = 0, style, className }: TkxTabsProps) {
  const [internal, setInternal] = useState(defaultIndex);
  const baseId = useId();
  const active = controlled !== undefined ? controlled : internal;
  const setActive = (i: number) => { if (controlled === undefined) setInternal(i); onChange?.(i); };

  // Registry of mounted tabs: index → disabled. Keyboard navigation derives
  // its bounds and disabled-skipping from this, so Arrow/Home/End work
  // without consumers hand-passing a `tabCount` prop.
  const [registry, setRegistry] = useState<Map<number, boolean>>(() => new Map());

  const registerTab = useCallback((index: number, disabled: boolean) => {
    setRegistry(prev => {
      if (prev.has(index) && prev.get(index) === disabled) return prev;
      const next = new Map(prev);
      next.set(index, disabled);
      return next;
    });
    return () => {
      setRegistry(prev => {
        if (!prev.has(index)) return prev;
        const next = new Map(prev);
        next.delete(index);
        return next;
      });
    };
  }, []);

  const derivedTabCount = useMemo(() => {
    let max = -1;
    for (const i of registry.keys()) if (i > max) max = i;
    return max + 1;
  }, [registry]);

  // Explicit prop (legacy) wins when supplied; otherwise use the derived count.
  const effectiveTabCount = tabCount > 0 ? tabCount : derivedTabCount;

  const isTabDisabled = useCallback((i: number) => registry.get(i) === true, [registry]);

  // Registry of MOUNTED panels. Only the active panel renders, so a tab may
  // only advertise `aria-controls` once its panel is in the document —
  // WAI-ARIA 1.2 requires every IDREF to resolve, and a dangling reference is
  // silently dropped by assistive tech.
  const [panelRegistry, setPanelRegistry] = useState<Set<number>>(() => new Set());

  const registerPanel = useCallback((index: number) => {
    setPanelRegistry(prev => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    return () => {
      setPanelRegistry(prev => {
        if (!prev.has(index)) return prev;
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    };
  }, []);

  const hasPanel = useCallback((i: number) => panelRegistry.has(i), [panelRegistry]);

  return (
    <TabsContext.Provider
      value={{
        activeIndex: active,
        setActiveIndex: setActive,
        baseId,
        tabCount: effectiveTabCount,
        isTabDisabled,
        registerTab,
        registerPanel,
        hasPanel,
      }}
    >
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
      style={{ borderBottom: `2px solid ${theme.css.border}`, ...style }}
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

  // Register this tab (index + disabled state) with the parent TkxTabs so
  // keyboard navigation can derive the tab count and skip disabled tabs.
  // Must run before the ctx-null early return to keep hook order stable.
  const registerTab = ctx?.registerTab;
  useEffect(() => {
    if (!registerTab) return;
    return registerTab(index ?? 0, disabled);
  }, [registerTab, index, disabled]);

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
  const { activeIndex, setActiveIndex, baseId, tabCount, isTabDisabled, hasPanel } = ctx;
  const safeIndex = index ?? 0;
  const isActive = activeIndex === safeIndex;

  return (
    <button
      ref={tabRef}
      role="tab"
      id={`${baseId}-tab-${safeIndex}`}
      // Only advertise the association while the panel is actually mounted.
      // Inactive panels unmount, and a `aria-controls` pointing at an absent
      // id is a WAI-ARIA 1.2 idref violation (and is ignored by AT anyway).
      aria-controls={hasPanel(safeIndex) ? `${baseId}-panel-${safeIndex}` : undefined}
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
        color: isActive ? theme.css.primary : theme.css.textMuted,
        fontWeight: isActive ? 600 : 400,
        borderBottom: isActive ? `2px solid ${theme.css.primary}` : '2px solid transparent',
        marginBottom: '-2px',
        ...style,
      }}
      onClick={() => !disabled && setActiveIndex(safeIndex)}
      onKeyDown={(e) => handleTabsKeyboard(
        e as unknown as KeyboardEvent,
        safeIndex,
        tabCount,
        (ni) => {
          // Defense in depth: never select a disabled tab even if the
          // keyboard handler's skipping missed it.
          if (isTabDisabled(ni)) return;
          setActiveIndex(ni);
          document.getElementById(`${baseId}-tab-${ni}`)?.focus();
        },
        isTabDisabled,
      )}
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
  const isMounted = !!ctx && ctx.activeIndex === safeIndex;

  // Tell the parent whether this panel is in the document, so the matching
  // tab knows if it may point `aria-controls` at us. Runs before any early
  // return to keep hook order stable.
  const registerPanel = ctx?.registerPanel;
  useEffect(() => {
    if (!registerPanel || !isMounted) return;
    return registerPanel(safeIndex);
  }, [registerPanel, isMounted, safeIndex]);

  if (!ctx) {
    return (
      <div role="tabpanel" className={className} style={style}>
        {children}
      </div>
    );
  }
  const { baseId } = ctx;
  if (!isMounted) return null;
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