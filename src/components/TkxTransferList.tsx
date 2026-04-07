import {
  useState,
  useMemo,
  useCallback,
  useId,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TransferItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TkxTransferListProps {
  sourceItems: TransferItem[];
  targetItems: TransferItem[];
  onTransfer: (source: TransferItem[], target: TransferItem[]) => void;
  sourceTitle?: string;
  targetTitle?: string;
  searchable?: boolean;
  height?: number;
  className?: string;
  style?: CSSProperties;
}

// ── Search icon ─────────────────────────────────────────────────────────────

function SearchIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="4.5" stroke={color} strokeWidth="1.5" />
      <path d="M9.5 9.5L13 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Checkbox ────────────────────────────────────────────────────────────────

function Checkbox({
  checked,
  primaryColor,
  borderColor,
}: {
  checked: boolean;
  primaryColor: string;
  borderColor: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={tkx('inline-flex items-center justify-center flex-shrink-0')}
      style={{
        width: 16,
        height: 16,
        borderRadius: 3,
        border: `1.5px solid ${checked ? primaryColor : borderColor}`,
        backgroundColor: checked ? primaryColor : 'transparent',
        transition: 'all 100ms ease',
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 5l2.5 2.5L8 3"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

// ── Arrow icons ─────────────────────────────────────────────────────────────

function ArrowRightIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeftIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13 8H3M7 4l-4 4 4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Internal list panel ─────────────────────────────────────────────────────

interface ListPanelProps {
  title: string;
  items: TransferItem[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  onToggleAll: () => void;
  search: string;
  onSearchChange: (s: string) => void;
  searchable: boolean;
  height: number;
  listId: string;
}

function ListPanel({
  title,
  items,
  selected,
  onToggle,
  onToggleAll,
  search,
  onSearchChange,
  searchable,
  height,
  listId,
}: ListPanelProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  const safeTitle = sanitizeString(title);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, search]);

  const enabledItems = filtered.filter((i) => !i.disabled);
  const allSelected = enabledItems.length > 0 && enabledItems.every((i) => selected.has(i.value));
  const someSelected = enabledItems.some((i) => selected.has(i.value));

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>, value: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(value);
    }
  };

  return (
    <div
      className={tkx('flex flex-col rounded-lg overflow-hidden flex-1 min-w-0')}
      style={{
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.surface,
      }}
    >
      {/* Header */}
      <div
        className={tkx('flex items-center gap-2 px-3 py-2 border-b')}
        style={{ borderColor: theme.border, backgroundColor: theme.surfaceAlt }}
      >
        <button
          type="button"
          aria-label={allSelected ? `Deselect all ${safeTitle}` : `Select all ${safeTitle}`}
          onClick={onToggleAll}
          className={tkx('border-none bg-transparent cursor-pointer p-0 outline-none focus-visible:ring-2')}
        >
          <Checkbox
            checked={allSelected}
            primaryColor={theme.primary}
            borderColor={theme.border}
          />
        </button>
        <span
          className={tkx('text-sm font-medium flex-1 truncate')}
          style={{ color: theme.text }}
        >
          {safeTitle}
        </span>
        <span
          className={tkx('text-xs')}
          style={{ color: theme.textMuted }}
        >
          {selected.size}/{items.length}
        </span>
      </div>

      {/* Search */}
      {searchable && (
        <div
          className={tkx('flex items-center gap-1.5 px-3 py-1.5 border-b')}
          style={{ borderColor: theme.border }}
        >
          <SearchIcon color={theme.textMuted} />
          <input
            type="text"
            aria-label={`Search ${safeTitle}`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className={tkx('flex-1 bg-transparent border-none outline-none text-xs')}
            style={{ color: theme.text }}
          />
        </div>
      )}

      {/* Items list */}
      <ul
        id={listId}
        role="listbox"
        aria-label={safeTitle}
        aria-multiselectable="true"
        className={tkx('list-none m-0 p-1 overflow-y-auto')}
        style={{ height, minHeight: 100 }}
      >
        {filtered.length === 0 ? (
          <li
            className={tkx('text-xs text-center py-4')}
            style={{ color: theme.textMuted }}
            aria-disabled="true"
          >
            No items
          </li>
        ) : (
          filtered.map((item) => {
            const isChecked = selected.has(item.value);
            const safeLabel = sanitizeString(item.label);

            return (
              <li
                key={item.value}
                role="option"
                aria-selected={isChecked}
                aria-disabled={item.disabled || undefined}
                tabIndex={0}
                onClick={() => !item.disabled && onToggle(item.value)}
                onKeyDown={(e) => !item.disabled && handleKeyDown(e, item.value)}
                className={tkx(
                  'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm',
                  'outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                  item.disabled ? 'opacity-50 cursor-not-allowed' : '',
                )}
                style={{
                  color: item.disabled ? theme.textMuted : theme.text,
                  backgroundColor: isChecked ? `${theme.primary}10` : 'transparent',
                  transition: reducedMotion ? 'none' : 'background-color 100ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!item.disabled && !isChecked) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = theme.surfaceAlt;
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = isChecked
                    ? `${theme.primary}10`
                    : 'transparent';
                }}
              >
                <Checkbox
                  checked={isChecked}
                  primaryColor={theme.primary}
                  borderColor={theme.border}
                />
                <span className={tkx('truncate')}>{safeLabel}</span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function TkxTransferList({
  sourceItems,
  targetItems,
  onTransfer,
  sourceTitle = 'Available',
  targetTitle = 'Selected',
  searchable = false,
  height = 300,
  className,
  style,
}: TkxTransferListProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const sourceListId = useId();
  const targetListId = useId();

  const [sourceSelected, setSourceSelected] = useState<Set<string>>(new Set());
  const [targetSelected, setTargetSelected] = useState<Set<string>>(new Set());
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');

  const toggleSourceItem = useCallback((value: string) => {
    setSourceSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }, []);

  const toggleTargetItem = useCallback((value: string) => {
    setTargetSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }, []);

  const toggleAllSource = useCallback(() => {
    const enabledValues = sourceItems.filter((i) => !i.disabled).map((i) => i.value);
    const allSelected = enabledValues.every((v) => sourceSelected.has(v));
    if (allSelected) {
      setSourceSelected(new Set());
    } else {
      setSourceSelected(new Set(enabledValues));
    }
  }, [sourceItems, sourceSelected]);

  const toggleAllTarget = useCallback(() => {
    const enabledValues = targetItems.filter((i) => !i.disabled).map((i) => i.value);
    const allSelected = enabledValues.every((v) => targetSelected.has(v));
    if (allSelected) {
      setTargetSelected(new Set());
    } else {
      setTargetSelected(new Set(enabledValues));
    }
  }, [targetItems, targetSelected]);

  // Transfer selected items to target
  const moveToTarget = useCallback(() => {
    if (sourceSelected.size === 0) return;
    const toMove = sourceItems.filter((i) => sourceSelected.has(i.value) && !i.disabled);
    const remainingSource = sourceItems.filter((i) => !sourceSelected.has(i.value) || i.disabled);
    const newTarget = [...targetItems, ...toMove];
    onTransfer(remainingSource, newTarget);
    setSourceSelected(new Set());
  }, [sourceItems, targetItems, sourceSelected, onTransfer]);

  // Transfer selected items back to source
  const moveToSource = useCallback(() => {
    if (targetSelected.size === 0) return;
    const toMove = targetItems.filter((i) => targetSelected.has(i.value) && !i.disabled);
    const remainingTarget = targetItems.filter((i) => !targetSelected.has(i.value) || i.disabled);
    const newSource = [...sourceItems, ...toMove];
    onTransfer(newSource, remainingTarget);
    setTargetSelected(new Set());
  }, [sourceItems, targetItems, targetSelected, onTransfer]);

  const transferButtonStyle = (disabled: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 8,
    border: `1px solid ${theme.border}`,
    backgroundColor: disabled ? theme.surface : theme.surfaceAlt,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: reducedMotion ? 'none' : 'all 100ms ease',
    outline: 'none',
  });

  return (
    <div
      className={tkx(
        'flex gap-3 font-sans',
        // Responsive: stack vertically on narrow containers
        'flex-col sm:flex-row',
        className ?? '',
      )}
      style={{
        color: theme.text,
        ...style,
      }}
    >
      {/* Source list */}
      <ListPanel
        title={sourceTitle}
        items={sourceItems}
        selected={sourceSelected}
        onToggle={toggleSourceItem}
        onToggleAll={toggleAllSource}
        search={sourceSearch}
        onSearchChange={setSourceSearch}
        searchable={searchable}
        height={height}
        listId={sourceListId}
      />

      {/* Transfer buttons */}
      <div
        className={tkx(
          'flex items-center justify-center gap-2',
          'flex-row sm:flex-col',
        )}
        style={{ padding: '8px 0' }}
      >
        <button
          type="button"
          aria-label="Move selected items to target list"
          disabled={sourceSelected.size === 0}
          onClick={moveToTarget}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              moveToTarget();
            }
          }}
          className={tkx('focus-visible:ring-2 focus-visible:ring-offset-1')}
          style={transferButtonStyle(sourceSelected.size === 0)}
          onMouseEnter={(e) => {
            if (sourceSelected.size > 0) {
              (e.currentTarget as HTMLElement).style.backgroundColor = theme.primary;
              (e.currentTarget as HTMLElement).style.borderColor = theme.primary;
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              sourceSelected.size === 0 ? theme.surface : theme.surfaceAlt;
            (e.currentTarget as HTMLElement).style.borderColor = theme.border;
          }}
        >
          <ArrowRightIcon color={theme.text} />
        </button>

        <button
          type="button"
          aria-label="Move selected items to source list"
          disabled={targetSelected.size === 0}
          onClick={moveToSource}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              moveToSource();
            }
          }}
          className={tkx('focus-visible:ring-2 focus-visible:ring-offset-1')}
          style={transferButtonStyle(targetSelected.size === 0)}
          onMouseEnter={(e) => {
            if (targetSelected.size > 0) {
              (e.currentTarget as HTMLElement).style.backgroundColor = theme.primary;
              (e.currentTarget as HTMLElement).style.borderColor = theme.primary;
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              targetSelected.size === 0 ? theme.surface : theme.surfaceAlt;
            (e.currentTarget as HTMLElement).style.borderColor = theme.border;
          }}
        >
          <ArrowLeftIcon color={theme.text} />
        </button>
      </div>

      {/* Target list */}
      <ListPanel
        title={targetTitle}
        items={targetItems}
        selected={targetSelected}
        onToggle={toggleTargetItem}
        onToggleAll={toggleAllTarget}
        search={targetSearch}
        onSearchChange={setTargetSearch}
        searchable={searchable}
        height={height}
        listId={targetListId}
      />
    </div>
  );
}

export default TkxTransferList;
