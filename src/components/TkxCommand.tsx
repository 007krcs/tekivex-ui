'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
  type CSSProperties,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { useLocale } from '../i18n';
import { tkx, cx } from '../engine/tkx';
import { sanitizeString } from '../engine/security';

// ── Inline hooks ──────────────────────────────────────────────────────────────

function useEscapeKey(onEscape: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onEscape, enabled]);
}

function useFocusTrap(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    // WAI-ARIA dialog pattern: return focus to the opener when the palette
    // closes instead of dropping it to <body>.
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    el.addEventListener('keydown', trap);
    return () => {
      el.removeEventListener('keydown', trap);
      if (previouslyFocused && previouslyFocused.isConnected) previouslyFocused.focus();
    };
  }, [enabled]);
  return ref;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
  group?: string;
  keywords?: string[];
  disabled?: boolean;
  onSelect?: () => void;
}

export interface TkxCommandProps {
  items: CommandItem[];
  isOpen?: boolean;
  onClose?: () => void;
  placeholder?: string;
  emptyMessage?: string;
  maxItems?: number;
  onItemSelect?: (item: CommandItem) => void;
  className?: string;
  style?: CSSProperties;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTkxCommand(): { isOpen: boolean; open: () => void; close: () => void; toggle: () => void } {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  return { isOpen, open, close, toggle };
}

// ── Fuzzy search ──────────────────────────────────────────────────────────────

interface MatchResult {
  item: CommandItem;
  score: number;
  labelRanges: [number, number][];
}

function fuzzyMatch(query: string, text: string): { matched: boolean; ranges: [number, number][]; score: number } {
  if (!query) return { matched: true, ranges: [], score: 0 };
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  // Try substring match first (highest score)
  const subIdx = t.indexOf(q);
  if (subIdx !== -1) {
    return {
      matched: true,
      ranges: [[subIdx, subIdx + q.length - 1]],
      score: subIdx === 0 ? 100 : 80,
    };
  }

  // Fuzzy character-by-character match
  const ranges: [number, number][] = [];
  let qi = 0;
  let start = -1;
  let prevIdx = -1;

  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      if (prevIdx === -1 || i !== prevIdx + 1) {
        if (start !== -1) ranges.push([start, prevIdx]);
        start = i;
      }
      prevIdx = i;
      qi++;
    }
  }
  if (start !== -1 && prevIdx !== -1) ranges.push([start, prevIdx]);

  if (qi < q.length) return { matched: false, ranges: [], score: 0 };
  return { matched: true, ranges, score: 40 };
}

function searchItems(query: string, items: CommandItem[]): MatchResult[] {
  if (!query.trim()) {
    return items
      .filter((item) => !item.disabled)
      .map((item) => ({ item, score: 0, labelRanges: [] }));
  }

  const results: MatchResult[] = [];

  for (const item of items) {
    if (item.disabled) continue;

    const labelMatch = fuzzyMatch(query, item.label);
    const descMatch = item.description ? fuzzyMatch(query, item.description) : { matched: false, score: 0 };
    const kwMatch = (item.keywords ?? []).some((kw) => fuzzyMatch(query, kw).matched);

    if (labelMatch.matched) {
      results.push({ item, score: labelMatch.score + 20, labelRanges: labelMatch.ranges });
    } else if (descMatch.matched) {
      results.push({ item, score: descMatch.score, labelRanges: [] });
    } else if (kwMatch) {
      results.push({ item, score: 20, labelRanges: [] });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

// ── Highlighted label ─────────────────────────────────────────────────────────

function HighlightedText({ text, ranges, color }: { text: string; ranges: [number, number][]; color: string }) {
  if (!ranges.length) return <>{text}</>;

  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const [start, end] of ranges) {
    if (cursor < start) parts.push(<span key={`t-${cursor}`}>{text.slice(cursor, start)}</span>);
    parts.push(
      <span key={`h-${start}`} style={{ color, fontWeight: 700 }}>
        {text.slice(start, end + 1)}
      </span>,
    );
    cursor = end + 1;
  }
  if (cursor < text.length) parts.push(<span key={`t-end`}>{text.slice(cursor)}</span>);

  return <>{parts}</>;
}

// ── Skeleton shimmer items ────────────────────────────────────────────────────

function SkeletonItem({ surface, border }: { surface: string; border: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: `linear-gradient(90deg, ${border} 25%, ${surface} 50%, ${border} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'tkx-shimmer 1.4s ease-in-out infinite',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div
          style={{
            height: 13,
            borderRadius: 4,
            width: '60%',
            background: `linear-gradient(90deg, ${border} 25%, ${surface} 50%, ${border} 75%)`,
            backgroundSize: '200% 100%',
            animation: 'tkx-shimmer 1.4s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 10,
            borderRadius: 4,
            width: '40%',
            background: `linear-gradient(90deg, ${border} 25%, ${surface} 50%, ${border} 75%)`,
            backgroundSize: '200% 100%',
            animation: 'tkx-shimmer 1.4s ease-in-out 0.2s infinite',
          }}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TkxCommand({
  items = [],
  isOpen = false,
  onClose,
  placeholder,
  emptyMessage,
  maxItems = 8,
  onItemSelect,
  className,
  style,
}: TkxCommandProps) {
  const theme = useTheme();
  const t = useLocale();
  const resolvedPlaceholder = placeholder ?? t.commandSearch ?? 'Type a command or search…';
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const trapRef = useFocusTrap(isOpen);

  const results = searchItems(query, items).slice(0, maxItems);

  // Group results
  const grouped: { group: string | undefined; items: MatchResult[] }[] = [];
  for (const r of results) {
    const group = r.item.group;
    const existing = grouped.find((g) => g.group === group);
    if (existing) existing.items.push(r);
    else grouped.push({ group, items: [r] });
  }

  const flatResults = grouped.flatMap((g) => g.items);

  useEscapeKey(() => { onClose?.(); }, isOpen);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  // Clamp activeIdx when results change
  useEffect(() => {
    if (activeIdx >= flatResults.length) setActiveIdx(Math.max(0, flatResults.length - 1));
  }, [flatResults.length, activeIdx]);

  const scrollActiveIntoView = useCallback((idx: number) => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelectorAll<HTMLElement>('[data-command-item]')[idx];
    active?.scrollIntoView({ block: 'nearest' });
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(flatResults.length - 1, activeIdx + 1);
      setActiveIdx(next);
      scrollActiveIntoView(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.max(0, activeIdx - 1);
      setActiveIdx(next);
      scrollActiveIntoView(next);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = flatResults[activeIdx];
      if (selected) selectItem(selected.item);
    }
  };

  const selectItem = (item: CommandItem) => {
    if (item.disabled) return;
    item.onSelect?.();
    onItemSelect?.(item);
    onClose?.();
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const safePlaceholder = sanitizeString(resolvedPlaceholder);
  const fallbackEmpty = t.noCommandsFound ?? `No results for "${sanitizeString(query)}"`;
  const safeEmptyMsg = emptyMessage ? sanitizeString(emptyMessage) : fallbackEmpty;

  // Shimmer CSS injection (idempotent)
  if (typeof document !== 'undefined' && !document.getElementById('tkx-shimmer-style')) {
    const s = document.createElement('style');
    s.id = 'tkx-shimmer-style';
    s.textContent = `@keyframes tkx-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`;
    document.head.appendChild(s);
  }

  return createPortal(
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          animation: 'tkx-fade-in 120ms ease',
        }}
      />

      {/* Panel */}
      <div
        ref={trapRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        id={panelId}
        className={cx(className)}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 560,
          backgroundColor: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${theme.border}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '70vh',
          ...style,
        }}
      >
        {/* Search bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={theme.textMuted}
            strokeWidth={2}
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={true}
            aria-autocomplete="list"
            aria-controls={`${panelId}-list`}
            aria-activedescendant={flatResults[activeIdx] ? `${panelId}-item-${flatResults[activeIdx].item.id}` : undefined}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
            onKeyDown={handleKeyDown}
            placeholder={safePlaceholder}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 16,
              fontFamily: 'inherit',
              color: theme.text,
            }}
          />
          {query && (
            <button
              type="button"
              aria-label={t.clearSelection}
              onClick={() => { setQuery(''); setActiveIdx(0); inputRef.current?.focus(); }}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: theme.textMuted,
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Results */}
        <div
          id={`${panelId}-list`}
          ref={listRef}
          role="listbox"
          aria-label="Command results"
          style={{ overflowY: 'auto', flex: 1, padding: '6px 8px' }}
        >
          {loading ? (
            Array.from({ length: 4 }, (_, i) => (
              <SkeletonItem key={i} surface={theme.surface} border={theme.border} />
            ))
          ) : flatResults.length === 0 ? (
            /* Empty state */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '32px 16px',
                color: theme.textMuted,
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <span style={{ fontSize: '0.875rem' }}>{safeEmptyMsg}</span>
            </div>
          ) : (
            grouped.map(({ group, items: groupItems }, gi) => {
              // Build flat index offset for this group
              const offset = grouped.slice(0, gi).reduce((acc, g) => acc + g.items.length, 0);

              return (
                <div key={group ?? '__default__'}>
                  {group && (
                    <div
                      role="presentation"
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: theme.textMuted,
                        padding: '10px 12px 4px',
                      }}
                    >
                      {sanitizeString(group)}
                    </div>
                  )}
                  {groupItems.map((r, localIdx) => {
                    const flatIdx = offset + localIdx;
                    const isActive = flatIdx === activeIdx;
                    const item = r.item;

                    return (
                      <div
                        key={item.id}
                        id={`${panelId}-item-${item.id}`}
                        role="option"
                        aria-selected={isActive}
                        aria-disabled={item.disabled}
                        data-command-item
                        onClick={() => selectItem(item)}
                        onMouseEnter={() => setActiveIdx(flatIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '9px 12px',
                          borderRadius: 8,
                          cursor: item.disabled ? 'not-allowed' : 'pointer',
                          opacity: item.disabled ? 0.45 : 1,
                          backgroundColor: isActive ? `${theme.primary}18` : 'transparent',
                          borderLeft: isActive ? `2px solid ${theme.primary}` : '2px solid transparent',
                          transition: 'background 80ms ease',
                          userSelect: 'none',
                        }}
                      >
                        {/* Icon */}
                        {item.icon && (
                          <span
                            style={{
                              width: 20,
                              height: 20,
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isActive ? theme.primary : theme.textMuted,
                            }}
                          >
                            {item.icon}
                          </span>
                        )}

                        {/* Label + description */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: isActive ? theme.text : theme.text,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            <HighlightedText
                              text={item.label}
                              ranges={r.labelRanges}
                              color={theme.primary}
                            />
                          </div>
                          {item.description && (
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: theme.textMuted,
                                marginTop: 1,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {sanitizeString(item.description)}
                            </div>
                          )}
                        </div>

                        {/* Shortcut badge */}
                        {item.shortcut && (
                          <span
                            style={{
                              flexShrink: 0,
                              fontSize: '0.6875rem',
                              fontWeight: 500,
                              color: theme.textMuted,
                              backgroundColor: theme.surfaceAlt,
                              border: `1px solid ${theme.border}`,
                              borderRadius: 6,
                              padding: '2px 6px',
                              fontFamily: 'monospace',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {sanitizeString(item.shortcut)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        {flatResults.length > 0 && (
          <div
            aria-hidden="true"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 16px',
              borderTop: `1px solid ${theme.border}`,
              fontSize: '0.6875rem',
              color: theme.textMuted,
            }}
          >
            <span>
              <kbd style={{ fontFamily: 'monospace' }}>↑↓</kbd> navigate
            </span>
            <span>
              <kbd style={{ fontFamily: 'monospace' }}>↵</kbd> select
            </span>
            <span>
              <kbd style={{ fontFamily: 'monospace' }}>Esc</kbd> close
            </span>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

TkxCommand.displayName = 'TkxCommand';