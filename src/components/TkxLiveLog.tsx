'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createElement,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { tkx } from '../engine/tkx';

// ── Types ────────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  source?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface TkxLiveLogProps {
  entries: LogEntry[];
  maxEntries?: number;
  height?: number | string;
  autoScroll?: boolean;
  showLevel?: boolean;
  showTimestamp?: boolean;
  showSource?: boolean;
  filterLevel?: LogLevel;
  searchQuery?: string;
  monospace?: boolean;
  onEntryClick?: (entry: LogEntry) => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const ROW_HEIGHT = 28;
const OVERSCAN = 8;

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info:  1,
  warn:  2,
  error: 3,
  fatal: 4,
};

// ── CSS injection ────────────────────────────────────────────────────────────

let logStylesInjected = false;
function injectLogStyles() {
  if (logStylesInjected || typeof document === 'undefined') return;
  logStylesInjected = true;
  const el = document.createElement('style');
  el.id = 'tkx-live-log-styles';
  el.textContent = `
.tkx-log-row:hover { filter: brightness(1.12); }
.tkx-log-highlight { background: #ffbe0b55; border-radius: 2px; padding: 0 1px; }
  `.trim();
  document.head.appendChild(el);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatLogTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

function getLevelColor(level: LogLevel, theme: ReturnType<typeof useTheme>): string {
  switch (level) {
    case 'debug': return theme.textMuted;
    case 'info':  return theme.info;
    case 'warn':  return theme.warning;
    case 'error': return theme.danger;
    case 'fatal': return theme.danger;
    default:      return theme.textMuted;
  }
}

function getLevelBg(level: LogLevel, theme: ReturnType<typeof useTheme>): string {
  if (level === 'fatal') return `${theme.danger}22`;
  return 'transparent';
}

function getLevelLabel(level: LogLevel): string {
  return `[${level.toUpperCase().padEnd(5)}]`;
}

// ── Highlight matching text ──────────────────────────────────────────────────

function highlightText(text: string, query: string): React.ReactNode[] {
  if (!query) return [text];
  const safe = sanitizeString(text);
  const safeQ = sanitizeString(query);
  if (!safeQ) return [safe];
  try {
    const regex = new RegExp(`(${safeQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = safe.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? createElement('mark', { key: i, className: 'tkx-log-highlight' }, part)
        : part,
    );
  } catch {
    return [safe];
  }
}

// ── LogRow ───────────────────────────────────────────────────────────────────

interface LogRowProps {
  entry: LogEntry;
  showLevel: boolean;
  showTimestamp: boolean;
  showSource: boolean;
  searchQuery: string;
  monospace: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onEntryClick?: (entry: LogEntry) => void;
  theme: ReturnType<typeof useTheme>;
  style?: CSSProperties;
}

function LogRow({
  entry,
  showLevel,
  showTimestamp,
  showSource,
  searchQuery,
  monospace,
  isExpanded,
  onToggle,
  onEntryClick,
  theme,
  style,
}: LogRowProps) {
  const levelColor = getLevelColor(entry.level, theme);
  const levelBg = getLevelBg(entry.level, theme);
  const hasMetadata = entry.metadata && Object.keys(entry.metadata).length > 0;

  const rowStyle: CSSProperties = {
    ...style,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 10px',
    fontSize: 12,
    fontFamily: monospace ? '"JetBrains Mono", "Fira Mono", Consolas, monospace' : 'inherit',
    cursor: hasMetadata || onEntryClick ? 'pointer' : 'default',
    background: levelBg,
    boxSizing: 'border-box',
    height: ROW_HEIGHT,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    borderBottom: `1px solid ${theme.border}22`,
  };

  const handleClick = () => {
    if (hasMetadata) onToggle();
    if (onEntryClick) onEntryClick(entry);
  };

  return createElement(
    'div',
    {
      style: rowStyle,
      className: 'tkx-log-row',
      onClick: handleClick,
      role: hasMetadata ? 'button' : undefined,
      tabIndex: hasMetadata ? 0 : undefined,
      onKeyDown: hasMetadata
        ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }
        : undefined,
      'aria-expanded': hasMetadata ? isExpanded : undefined,
    },
    // Timestamp
    showTimestamp && createElement(
      'span',
      { style: { color: theme.textMuted, flexShrink: 0, minWidth: 84 } },
      formatLogTime(entry.timestamp),
    ),
    // Level badge
    showLevel && createElement(
      'span',
      {
        style: {
          color: levelColor,
          flexShrink: 0,
          fontWeight: entry.level === 'fatal' ? 700 : 500,
          minWidth: 56,
        },
      },
      getLevelLabel(entry.level),
    ),
    // Source badge
    showSource && entry.source && createElement(
      'span',
      {
        style: {
          background: theme.surfaceAlt,
          border: `1px solid ${theme.border}`,
          borderRadius: 10,
          padding: '0 5px',
          fontSize: 10,
          color: theme.textMuted,
          flexShrink: 0,
          maxWidth: 80,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      },
      sanitizeString(entry.source),
    ),
    // Message
    createElement(
      'span',
      { style: { flex: 1, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis' } },
      ...highlightText(entry.message, searchQuery),
    ),
    // Expand indicator
    hasMetadata && createElement(
      'span',
      { style: { color: theme.textMuted, fontSize: 10, flexShrink: 0 } },
      isExpanded ? '▲' : '▼',
    ),
  );
}

// ── MetadataPanel ────────────────────────────────────────────────────────────

function MetadataPanel({ metadata, theme, style }: {
  metadata: Record<string, string | number | boolean>;
  theme: ReturnType<typeof useTheme>;
  style?: CSSProperties;
}) {
  const panelStyle: CSSProperties = {
    ...style,
    background: theme.surfaceAlt,
    borderBottom: `1px solid ${theme.border}`,
    padding: '6px 10px 6px 56px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    boxSizing: 'border-box',
  };

  return createElement(
    'div',
    { style: panelStyle },
    ...Object.entries(metadata).map(([k, v]) =>
      createElement(
        'span',
        {
          key: k,
          style: {
            fontSize: 11,
            fontFamily: 'monospace',
            color: theme.textMuted,
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 4,
            padding: '1px 6px',
          },
        },
        createElement('span', { style: { color: theme.info } }, `${sanitizeString(k)}: `),
        sanitizeString(String(v)),
      ),
    ),
  );
}

// ── TkxLiveLog ───────────────────────────────────────────────────────────────

export function TkxLiveLog({
  entries,
  maxEntries = 500,
  height = 400,
  autoScroll = true,
  showLevel = true,
  showTimestamp = true,
  showSource = true,
  filterLevel,
  searchQuery = '',
  monospace = true,
  onEntryClick,
}: TkxLiveLogProps) {
  const theme = useTheme();
  injectLogStyles();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const prevLengthRef = useRef(entries.length);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let list = entries.slice(-maxEntries);
    if (filterLevel !== undefined) {
      const minOrder = LEVEL_ORDER[filterLevel];
      list = list.filter((e) => LEVEL_ORDER[e.level] >= minOrder);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.message.toLowerCase().includes(q) ||
          (e.source ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [entries, maxEntries, filterLevel, searchQuery]);

  const containerHeight = typeof height === 'number' ? height : 400;

  // Each entry may take ROW_HEIGHT, plus expansion panel (auto-height ~ 40px)
  const METADATA_HEIGHT = 40;

  // Compute cumulative offsets for variable-height virtualization
  const offsets = useMemo(() => {
    const arr: number[] = [];
    let acc = 0;
    for (const e of filteredEntries) {
      arr.push(acc);
      acc += ROW_HEIGHT + (expandedIds.has(e.id) ? METADATA_HEIGHT : 0);
    }
    arr.push(acc); // sentinel
    return arr;
  }, [filteredEntries, expandedIds]);

  const totalHeight = offsets[offsets.length - 1] ?? 0;

  // Auto-scroll
  useEffect(() => {
    if (!autoScroll || userScrolledUp) return;
    if (filteredEntries.length !== prevLengthRef.current) {
      prevLengthRef.current = filteredEntries.length;
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }
  }, [filteredEntries.length, autoScroll, userScrolledUp]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < ROW_HEIGHT * 2;
    setUserScrolledUp(!atBottom);
    setScrollTop(el.scrollTop);
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Binary search to find first visible entry
  function findStartIndex(st: number): number {
    let lo = 0, hi = filteredEntries.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((offsets[mid + 1] ?? 0) <= st) lo = mid + 1;
      else hi = mid;
    }
    return Math.max(0, lo - OVERSCAN);
  }

  function findEndIndex(st: number): number {
    let lo = 0, hi = filteredEntries.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if ((offsets[mid] ?? 0) >= st + containerHeight) hi = mid - 1;
      else lo = mid;
    }
    return Math.min(filteredEntries.length - 1, lo + OVERSCAN);
  }

  const startIndex = filteredEntries.length > 0 ? findStartIndex(scrollTop) : 0;
  const endIndex   = filteredEntries.length > 0 ? findEndIndex(scrollTop) : -1;

  const containerStyle: CSSProperties = {
    position: 'relative',
    overflow: 'auto',
    height: typeof height === 'number' ? `${height}px` : height,
    background: theme.bg,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    boxSizing: 'border-box',
  };

  const innerStyle: CSSProperties = {
    position: 'relative',
    height: totalHeight,
    minHeight: '100%',
  };

  if (filteredEntries.length === 0) {
    return createElement(
      'div',
      { style: { ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      createElement('span', { style: { color: theme.textMuted, fontSize: 13, fontFamily: 'monospace' } }, 'No log entries.'),
    );
  }

  const rows: React.ReactNode[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const entry = filteredEntries[i];
    if (!entry) continue;
    const top = offsets[i] ?? 0;
    const isExpanded = expandedIds.has(entry.id);
    rows.push(
      createElement(LogRow, {
        key: entry.id,
        entry,
        showLevel,
        showTimestamp,
        showSource,
        searchQuery,
        monospace,
        isExpanded,
        onToggle: () => toggleExpand(entry.id),
        onEntryClick,
        theme,
        style: { position: 'absolute', top, left: 0, right: 0 },
      }),
    );
    if (isExpanded && entry.metadata && Object.keys(entry.metadata).length > 0) {
      rows.push(
        createElement(MetadataPanel, {
          key: `${entry.id}-meta`,
          metadata: entry.metadata,
          theme,
          style: { position: 'absolute', top: top + ROW_HEIGHT, left: 0, right: 0, height: METADATA_HEIGHT },
        }),
      );
    }
  }

  return createElement(
    'div',
    {
      ref: containerRef,
      style: containerStyle,
      onScroll: handleScroll,
      role: 'log',
      'aria-live': 'polite',
      'aria-label': 'Log viewer',
    },
    createElement('div', { style: innerStyle }, ...rows),
  );
}

// Satisfy import requirement
void tkx;