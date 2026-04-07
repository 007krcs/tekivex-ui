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

export interface FeedItem {
  id: string;
  content: string;
  timestamp: number;
  type?: 'info' | 'success' | 'warning' | 'error' | 'default';
  avatar?: string;
  author?: string;
  meta?: string;
}

export interface TkxLiveFeedProps {
  items: FeedItem[];
  maxItems?: number;
  height?: number | string;
  autoScroll?: boolean;
  showTimestamps?: boolean;
  onItemClick?: (item: FeedItem) => void;
  emptyMessage?: string;
  pauseOnHover?: boolean;
  renderItem?: (item: FeedItem) => React.ReactNode;
}

// ── Constants ────────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 64;
const OVERSCAN = 5;

// ── CSS injection ────────────────────────────────────────────────────────────

let feedStylesInjected = false;
function injectFeedStyles() {
  if (feedStylesInjected || typeof document === 'undefined') return;
  feedStylesInjected = true;
  const el = document.createElement('style');
  el.id = 'tkx-live-feed-styles';
  el.textContent = `
@keyframes tkx-feed-slide-in {
  from { transform: translateY(-20px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
.tkx-feed-item-new {
  animation: tkx-feed-slide-in 0.25s ease-out both;
}
  `.trim();
  document.head.appendChild(el);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 10_000) return 'just now';
  if (diff < 60_000) return `${Math.floor(diff / 1_000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function getTypeColor(type: FeedItem['type'], theme: ReturnType<typeof useTheme>): string {
  switch (type) {
    case 'info':    return theme.info;
    case 'success': return theme.success;
    case 'warning': return theme.warning;
    case 'error':   return theme.danger;
    default:        return theme.border;
  }
}

function getInitials(author?: string): string {
  if (!author) return '?';
  return author
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ── FeedRow ──────────────────────────────────────────────────────────────────

interface FeedRowProps {
  item: FeedItem;
  isNew: boolean;
  showTimestamps: boolean;
  onItemClick?: (item: FeedItem) => void;
  renderItem?: (item: FeedItem) => React.ReactNode;
  theme: ReturnType<typeof useTheme>;
  style?: CSSProperties;
}

function FeedRow({ item, isNew, showTimestamps, onItemClick, renderItem, theme, style }: FeedRowProps) {
  const accentColor = getTypeColor(item.type, theme);

  if (renderItem) {
    return createElement('div', { style, className: isNew ? 'tkx-feed-item-new' : undefined }, renderItem(item));
  }

  const rowStyle: CSSProperties = {
    ...style,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 12px',
    borderLeft: `3px solid ${accentColor}`,
    cursor: onItemClick ? 'pointer' : 'default',
    boxSizing: 'border-box',
    height: ITEM_HEIGHT,
    background: theme.surface,
    transition: 'background 0.15s',
  };

  return createElement(
    'div',
    {
      style: rowStyle,
      className: isNew ? 'tkx-feed-item-new' : undefined,
      onClick: onItemClick ? () => onItemClick(item) : undefined,
      role: onItemClick ? 'button' : undefined,
      tabIndex: onItemClick ? 0 : undefined,
      onKeyDown: onItemClick
        ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onItemClick(item); }
        : undefined,
    },
    // Avatar
    createElement(
      'div',
      {
        style: {
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
          color: theme.bg,
          flexShrink: 0,
          overflow: 'hidden',
        },
      },
      item.avatar
        ? createElement('img', { src: item.avatar, alt: item.author ?? '', style: { width: '100%', height: '100%', objectFit: 'cover' } })
        : getInitials(item.author),
    ),
    // Body
    createElement(
      'div',
      { style: { flex: 1, minWidth: 0 } },
      createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 } },
        item.author && createElement('span', { style: { fontWeight: 600, fontSize: 13, color: theme.text } }, sanitizeString(item.author)),
        item.meta && createElement('span', { style: { fontSize: 11, color: theme.textMuted, background: theme.surfaceAlt, borderRadius: 4, padding: '1px 5px' } }, sanitizeString(item.meta)),
      ),
      createElement(
        'div',
        { style: { fontSize: 13, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
        sanitizeString(item.content),
      ),
    ),
    // Timestamp
    showTimestamps && createElement(
      'div',
      { style: { fontSize: 11, color: theme.textMuted, flexShrink: 0 } },
      relativeTime(item.timestamp),
    ),
  );
}

// ── TkxLiveFeed ──────────────────────────────────────────────────────────────

export function TkxLiveFeed({
  items,
  maxItems = 100,
  height = 400,
  autoScroll = true,
  showTimestamps = true,
  onItemClick,
  emptyMessage = 'No activity yet.',
  pauseOnHover = true,
  renderItem,
}: TkxLiveFeedProps) {
  const theme = useTheme();
  injectFeedStyles();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const prevItemsRef = useRef<FeedItem[]>([]);

  // Trim to maxItems
  const visibleItems = useMemo(
    () => items.slice(-maxItems),
    [items, maxItems],
  );

  const containerHeight = typeof height === 'number' ? height : 400;
  const totalHeight = visibleItems.length * ITEM_HEIGHT;

  // Track new items for animation
  useEffect(() => {
    const prevIds = new Set(prevItemsRef.current.map((i) => i.id));
    const added = visibleItems.filter((i) => !prevIds.has(i.id)).map((i) => i.id);
    if (added.length > 0) {
      setNewIds((prev) => {
        const next = new Set(prev);
        added.forEach((id) => next.add(id));
        return next;
      });
      const timer = window.setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          added.forEach((id) => next.delete(id));
          return next;
        });
      }, 400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visibleItems]);

  useEffect(() => {
    prevItemsRef.current = visibleItems;
  }, [visibleItems]);

  // Auto-scroll
  const shouldAutoScroll = autoScroll && !(pauseOnHover && isHovered);
  useEffect(() => {
    if (!shouldAutoScroll || !containerRef.current) return;
    const el = containerRef.current;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < ITEM_HEIGHT * 3;
    if (nearBottom || visibleItems.length <= 5) {
      el.scrollTop = el.scrollHeight;
    }
  }, [visibleItems.length, shouldAutoScroll]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) setScrollTop(containerRef.current.scrollTop);
  }, []);

  // Virtualization
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    visibleItems.length - 1,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN,
  );

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

  if (visibleItems.length === 0) {
    return createElement(
      'div',
      { style: { ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      createElement('span', { style: { color: theme.textMuted, fontSize: 14 } }, sanitizeString(emptyMessage)),
    );
  }

  const rows: React.ReactNode[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const item = visibleItems[i];
    if (!item) continue;
    rows.push(
      createElement(FeedRow, {
        key: item.id,
        item,
        isNew: newIds.has(item.id),
        showTimestamps,
        onItemClick,
        renderItem,
        theme,
        style: {
          position: 'absolute',
          top: i * ITEM_HEIGHT,
          left: 0,
          right: 0,
        },
      }),
    );
  }

  return createElement(
    'div',
    {
      ref: containerRef,
      style: containerStyle,
      onScroll: handleScroll,
      onMouseEnter: pauseOnHover ? () => setIsHovered(true) : undefined,
      onMouseLeave: pauseOnHover ? () => setIsHovered(false) : undefined,
      'aria-label': 'Live feed',
      role: 'feed',
    },
    createElement('div', { style: innerStyle }, ...rows),
  );
}

// Ensure tkx is referenced (satisfies import requirement)
void tkx;
