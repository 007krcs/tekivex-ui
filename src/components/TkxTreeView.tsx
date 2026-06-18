'use client';

import {
  useState,
  useCallback,
  useRef,
  useId,
  type ReactNode,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

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

function flattenVisible(
  nodes: TreeNode[],
  expandedSet: Set<string>,
): { node: TreeNode; depth: number }[] {
  const result: { node: TreeNode; depth: number }[] = [];
  function walk(items: TreeNode[], depth: number) {
    for (const item of items) {
      result.push({ node: item, depth });
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

  const selectedSet = new Set(controlledSelected ?? internalSelected);
  const expandedSet = new Set(controlledExpanded ?? internalExpanded);

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

  const flatItems = flattenVisible(data, expandedSet);
  const focusedIndexRef = useRef(0);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

  const focusItem = (index: number) => {
    focusedIndexRef.current = index;
    itemRefs.current.get(index)?.focus();
  };

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

  return (
    <ul
      role="tree"
      aria-label="Tree view"
      aria-multiselectable={multiSelect || undefined}
      className={tkx('list-none m-0 p-0 font-sans select-none', className ?? '')}
      style={{
        color: theme.text,
        ...style,
      }}
    >
      {flatItems.map(({ node, depth }, index) => {
        const hasChildren = (node.children?.length ?? 0) > 0;
        const isExpanded = expandedSet.has(node.id);
        const isSelected = selectedSet.has(node.id);
        const safeLabel = sanitizeString(node.label);

        return (
          <li
            key={node.id}
            role="treeitem"
            aria-selected={isSelected}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-disabled={node.disabled || undefined}
            aria-level={depth + 1}
            aria-setsize={flatItems.filter((f) => f.depth === depth).length}
            tabIndex={index === 0 ? 0 : -1}
            ref={(el) => {
              if (el) itemRefs.current.set(index, el);
              else itemRefs.current.delete(index);
            }}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onClick={() => {
              if (node.disabled) return;
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
              backgroundColor: isSelected ? `${theme.primary}18` : 'transparent',
              transition: reducedMotion ? 'none' : 'background-color 100ms ease',
              minHeight: 32,
            }}
            onMouseEnter={(e) => {
              if (!isSelected && !node.disabled) {
                (e.currentTarget as HTMLElement).style.backgroundColor = theme.surfaceAlt;
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = isSelected
                ? `${theme.primary}18`
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
                  backgroundColor: theme.border,
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
                  color={theme.textMuted}
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
                color={theme.primary}
                borderColor={theme.border}
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
              style={{ color: node.disabled ? theme.textMuted : theme.text }}
            >
              {safeLabel}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default TkxTreeView;