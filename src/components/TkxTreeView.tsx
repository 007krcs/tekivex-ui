'use client';

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useLayoutEffect,
  useId,
  type ReactNode,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion, useVariableVirtualList } from '../hooks';
import { tkx } from '../engine/tkx';

// useLayoutEffect warns during SSR; fall back to useEffect on the server. The
// pending-focus effect it drives is a client-only concern (there is no DOM to
// focus on the server), so the fallback never does layout work.
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Virtualize only once the flattened, visible-node count exceeds this. Below it,
// TreeView renders the exact all-rendered path it always has (no scroll
// container, no windowing, no measurement) so small-tree behaviour is unchanged.
const VIRTUALIZE_THRESHOLD = 50;
// Estimated row height fed to the variable-height hook (matches the row
// minHeight below). Real heights are measured and cached by node id.
const ROW_ESTIMATE_PX = 32;
// Default scroll-viewport height when windowing kicks in; overridable via style.
const DEFAULT_VIEWPORT_PX = 400;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TreeNode {
  id: string;
  label: string;
  icon?: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
}

export interface TkxTreeViewProps {
  data: TreeNode[];
  selected?: string[];
  onSelect?: (ids: string[]) => void;
  expanded?: string[];
  onExpand?: (ids: string[]) => void;
  multiSelect?: boolean;
  showCheckboxes?: boolean;
  showLines?: boolean;
  className?: string;
  style?: CSSProperties;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

interface FlatItem {
  node: TreeNode;
  depth: number;
  /** 1-based position within this node's sibling group (for aria-posinset). */
  posinset: number;
  /** Total number of siblings in this node's group (for aria-setsize). */
  setsize: number;
}

function flattenVisible(
  nodes: TreeNode[],
  expandedSet: Set<string>,
): FlatItem[] {
  const result: FlatItem[] = [];
  function walk(items: TreeNode[], depth: number) {
    const setsize = items.length;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      result.push({ node: item, depth, posinset: i + 1, setsize });
      if (item.children?.length && expandedSet.has(item.id)) {
        walk(item.children, depth + 1);
      }
    }
  }
  walk(nodes, 0);
  return result;
}

function getAllIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  function walk(items: TreeNode[]) {
    for (const item of items) {
      ids.push(item.id);
      if (item.children) walk(item.children);
    }
  }
  walk(nodes);
  return ids;
}

// ── Chevron icon ────────────────────────────────────────────────────────────

function ChevronIcon({
  expanded,
  color,
  reducedMotion,
}: {
  expanded: boolean;
  color: string;
  reducedMotion: boolean;
}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: reducedMotion ? 'none' : 'transform 150ms ease',
        flexShrink: 0,
      }}
    >
      <path
        d="M6 3l5 5-5 5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Checkbox ────────────────────────────────────────────────────────────────

function TreeCheckbox({
  checked,
  color,
  borderColor,
}: {
  checked: boolean;
  color: string;
  borderColor: string;
}) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={tkx('inline-flex items-center justify-center flex-shrink-0')}
      style={{
        width: 16,
        height: 16,
        borderRadius: 3,
        border: `1.5px solid ${checked ? color : borderColor}`,
        backgroundColor: checked ? color : 'transparent',
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

// ── Component ───────────────────────────────────────────────────────────────

const INDENT_PX = 24;

export function TkxTreeView({
  data = [],
  selected: controlledSelected,
  onSelect,
  expanded: controlledExpanded,
  onExpand,
  multiSelect = false,
  showCheckboxes = false,
  showLines = false,
  className,
  style,
}: TkxTreeViewProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const treeId = useId();

  // Internal state fallbacks
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [internalExpanded, setInternalExpanded] = useState<string[]>([]);

  const selectedList = controlledSelected ?? internalSelected;
  const expandedList = controlledExpanded ?? internalExpanded;
  const selectedSet = useMemo(() => new Set(selectedList), [selectedList]);
  const expandedSet = useMemo(() => new Set(expandedList), [expandedList]);

  const setExpanded = useCallback(
    (ids: string[]) => {
      if (controlledExpanded === undefined) setInternalExpanded(ids);
      onExpand?.(ids);
    },
    [controlledExpanded, onExpand],
  );

  const setSelected = useCallback(
    (ids: string[]) => {
      if (controlledSelected === undefined) setInternalSelected(ids);
      onSelect?.(ids);
    },
    [controlledSelected, onSelect],
  );

  const toggleExpand = useCallback(
    (id: string) => {
      const arr = Array.from(expandedSet);
      if (expandedSet.has(id)) {
        setExpanded(arr.filter((x) => x !== id));
      } else {
        setExpanded([...arr, id]);
      }
    },
    [expandedSet, setExpanded],
  );

  const toggleSelect = useCallback(
    (id: string) => {
      if (multiSelect) {
        const arr = Array.from(selectedSet);
        if (selectedSet.has(id)) {
          setSelected(arr.filter((x) => x !== id));
        } else {
          setSelected([...arr, id]);
        }
      } else {
        setSelected(selectedSet.has(id) ? [] : [id]);
      }
    },
    [multiSelect, selectedSet, setSelected],
  );

  const flatItems = useMemo(
    () => flattenVisible(data, expandedSet),
    [data, expandedSet],
  );

  // Windowing turns on only past the threshold; small trees keep the exact
  // all-rendered path (byte-for-byte identical markup) with zero measurement.
  const virtualized = flatItems.length > VIRTUALIZE_THRESHOLD;

  // Fast id → index lookup over the FULL model (not the rendered slice) — drives
  // roving-tabindex placement and off-window focus.
  const indexOfId = useMemo(() => {
    const m = new Map<string, number>();
    for (let i = 0; i < flatItems.length; i++) m.set(flatItems[i].node.id, i);
    return m;
  }, [flatItems]);

  // getItemKey must change identity when the ordered id list changes so the hook
  // rebuilds its prefix array; flatItems is memoized, so this is stable per order.
  const getItemKey = useCallback(
    (index: number) => flatItems[index]?.node.id ?? '',
    [flatItems],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const v = useVariableVirtualList({
    itemCount: flatItems.length,
    getItemKey,
    estimateHeight: ROW_ESTIMATE_PX,
    enabled: virtualized,
    containerRef,
    // TreeView anchors nothing: no prepend, no pin-to-bottom.
    maintainVisibleContentPosition: false,
    pinToBottom: false,
  });

  // ── Focus + roving tabindex, keyed by node.id (survives windowing/reorder) ──
  // itemRefs is keyed by node id, NOT index: an index-keyed map smears one
  // node's DOM node onto whatever node later lands at that index after an
  // expand/collapse. focusedId tracks the roving tab stop; pendingFocusId defers
  // focus until an off-window row is scrolled into the DOM.
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const pendingFocusIdRef = useRef<string | null>(null);

  // v.measureRef is stable-per-key, but reach it through a ref so the combined
  // row ref below can stay identity-stable across renders (an inline ref would
  // thrash observe/unobserve and re-register itemRefs every render).
  const measureRefRef = useRef(v.measureRef);
  measureRefRef.current = v.measureRef;
  const rowRefCbs = useRef<Map<string, (el: HTMLElement | null) => void>>(new Map());
  const getRowRef = useCallback((id: string) => {
    let cb = rowRefCbs.current.get(id);
    if (!cb) {
      cb = (el: HTMLElement | null) => {
        if (el) itemRefs.current.set(id, el);
        else itemRefs.current.delete(id);
        // Chain to the hook's per-key measuring ref (a no-op when disabled).
        measureRefRef.current(id)(el);
      };
      rowRefCbs.current.set(id, cb);
    }
    return cb;
  }, []);

  const focusItem = useCallback(
    (index: number) => {
      const entry = flatItems[index];
      if (!entry) return;
      const id = entry.node.id;
      setFocusedId(id);
      const el = itemRefs.current.get(id);
      if (el) {
        el.focus();
      } else {
        // Off-window (no DOM node): scroll it into view, focus after it mounts.
        pendingFocusIdRef.current = id;
        v.scrollToIndex(index, 'auto');
      }
    },
    [flatItems, v],
  );

  // Focus a deferred (previously off-window) row once the scroll-driven
  // re-render has committed it to the DOM.
  useIsomorphicLayoutEffect(() => {
    const id = pendingFocusIdRef.current;
    if (id == null) return;
    const el = itemRefs.current.get(id);
    if (el) {
      el.focus();
      pendingFocusIdRef.current = null;
    }
  });

  const findNodeById = (id: string, nodes: TreeNode[]): TreeNode | undefined => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const found = findNodeById(id, n.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>, index: number) => {
    const item = flatItems[index];
    if (!item) return;
    const { node } = item;
    const hasChildren = (node.children?.length ?? 0) > 0;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (index < flatItems.length - 1) focusItem(index + 1);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (index > 0) focusItem(index - 1);
        break;
      }
      case 'ArrowRight': {
        e.preventDefault();
        if (hasChildren && !expandedSet.has(node.id)) {
          toggleExpand(node.id);
        } else if (hasChildren && expandedSet.has(node.id)) {
          // Move to first child
          if (index < flatItems.length - 1) focusItem(index + 1);
        }
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        if (hasChildren && expandedSet.has(node.id)) {
          toggleExpand(node.id);
        } else {
          // Move to parent: find the item at depth - 1
          for (let i = index - 1; i >= 0; i--) {
            if (flatItems[i].depth < item.depth) {
              focusItem(i);
              break;
            }
          }
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (!node.disabled) toggleSelect(node.id);
        break;
      }
      case 'Home': {
        e.preventDefault();
        focusItem(0);
        break;
      }
      case 'End': {
        e.preventDefault();
        focusItem(flatItems.length - 1);
        break;
      }
    }
  };

  // Rendered range: the whole model when not virtualized, the hook's window
  // otherwise. When windowing, the DOM is a slice but the flatItems MODEL stays
  // complete — keyboard arithmetic and aria set counts read the full model.
  const renderStart = virtualized ? v.startIndex : 0;
  const renderEnd = virtualized ? v.endIndex : flatItems.length;

  // Roving tab stop: the focused row when it is in-window; otherwise the first
  // rendered row is the fallback tab stop so the tree never drops out of the tab
  // order while scrolled away from the focused node.
  //
  // CRITICAL: resolve tabStopId to a node that STILL EXISTS in flatItems. When
  // an ancestor of the focused node is collapsed (chevron click does not run
  // setFocusedId), or a controlled data/expanded change removes it, `focusedId`
  // dangles. If we kept it as the tab stop, no rendered row would match
  // `node.id === tabStopId` and EVERY treeitem would get tabIndex=-1 — the whole
  // tree drops out of the tab order. Falling back to the first node keeps
  // exactly one tab stop always.
  const tabStopId =
    focusedId != null && indexOfId.has(focusedId)
      ? focusedId
      : flatItems[0]?.node.id ?? null;
  const tabStopIndex = tabStopId != null ? indexOfId.get(tabStopId) ?? 0 : 0;
  const tabStopInWindow = tabStopIndex >= renderStart && tabStopIndex < renderEnd;

  const renderRow = (item: FlatItem, index: number) => {
    const { node, depth, posinset, setsize } = item;
    const hasChildren = (node.children?.length ?? 0) > 0;
    const isExpanded = expandedSet.has(node.id);
    const isSelected = selectedSet.has(node.id);
    const safeLabel = sanitizeString(node.label);

    let tabIndex: number;
    if (tabStopInWindow) tabIndex = node.id === tabStopId ? 0 : -1;
    else tabIndex = index === renderStart ? 0 : -1;

    return (
          <li
            key={node.id}
            role="treeitem"
            aria-selected={isSelected}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-disabled={node.disabled || undefined}
            aria-level={depth + 1}
            aria-setsize={setsize}
            aria-posinset={posinset}
            tabIndex={tabIndex}
            ref={getRowRef(node.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onClick={() => {
              if (node.disabled) return;
              setFocusedId(node.id);
              if (hasChildren) toggleExpand(node.id);
              toggleSelect(node.id);
            }}
            className={tkx(
              'relative flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer',
              'outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
              node.disabled ? 'opacity-50 cursor-not-allowed' : '',
            )}
            style={{
              paddingLeft: depth * INDENT_PX + 8,
              backgroundColor: isSelected ? `${theme.css.primary}18` : 'transparent',
              transition: reducedMotion ? 'none' : 'background-color 100ms ease',
              minHeight: 32,
            }}
            onMouseEnter={(e) => {
              if (!isSelected && !node.disabled) {
                (e.currentTarget as HTMLElement).style.backgroundColor = theme.css.surfaceAlt;
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = isSelected
                ? `${theme.css.primary}18`
                : 'transparent';
            }}
          >
            {/* Connecting lines */}
            {showLines && depth > 0 && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: (depth - 1) * INDENT_PX + 16,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  backgroundColor: theme.css.border,
                }}
              />
            )}

            {/* Expand/collapse chevron */}
            {hasChildren ? (
              <span
                role="presentation"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
                className={tkx('inline-flex items-center justify-center cursor-pointer')}
                style={{ width: 20, height: 20 }}
              >
                <ChevronIcon
                  expanded={isExpanded}
                  color={theme.css.textMuted}
                  reducedMotion={reducedMotion}
                />
              </span>
            ) : (
              <span style={{ width: 20, height: 20 }} aria-hidden="true" />
            )}

            {/* Checkbox */}
            {showCheckboxes && (
              <TreeCheckbox
                checked={isSelected}
                color={theme.css.primary}
                borderColor={theme.css.border}
              />
            )}

            {/* Icon */}
            {node.icon && (
              <span aria-hidden="true" className={tkx('flex-shrink-0')}>
                {node.icon}
              </span>
            )}

            {/* Label */}
            <span
              className={tkx('text-sm truncate')}
              style={{ color: node.disabled ? theme.css.textMuted : theme.css.text }}
            >
              {safeLabel}
            </span>
          </li>
    );
  };

  const rows = flatItems
    .slice(renderStart, renderEnd)
    .map((item, i) => renderRow(item, renderStart + i));

  // ── Small tree: exact all-rendered path (unchanged markup/behaviour) ────────
  if (!virtualized) {
    return (
      <ul
        role="tree"
        aria-label="Tree view"
        aria-multiselectable={multiSelect || undefined}
        className={tkx('list-none m-0 p-0 font-sans select-none', className ?? '')}
        style={{
          color: theme.css.text,
          ...style,
        }}
      >
        {rows}
      </ul>
    );
  }

  // ── Large tree: windowed. The scroll container is role="tree"; the spacer +
  // translateY wrappers carry role="presentation" so the tree's owned structure
  // (role=treeitem descendants) stays valid, and `overflow-anchor: none` keeps
  // the browser's native anchoring from fighting windowed re-layout. ──────────
  return (
    <div
      ref={containerRef}
      role="tree"
      aria-label="Tree view"
      aria-multiselectable={multiSelect || undefined}
      onScroll={v.onScroll}
      className={tkx('font-sans select-none', className ?? '')}
      style={{
        overflowY: 'auto',
        overflowAnchor: 'none',
        maxHeight: DEFAULT_VIEWPORT_PX,
        color: theme.css.text,
        ...style,
      }}
    >
      <div role="presentation" style={{ height: v.totalHeight, position: 'relative' }}>
        <ul
          role="presentation"
          className={tkx('list-none m-0 p-0')}
          style={{ transform: `translateY(${v.offsetY}px)` }}
        >
          {rows}
        </ul>
      </div>
    </div>
  );
}

export default TkxTreeView;