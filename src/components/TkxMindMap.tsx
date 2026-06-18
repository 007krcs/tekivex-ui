'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxMindMap — collapsible node graph
//
// Design intent:
//   - Horizontal tidy-tree layout (root left, children fan out right). The
//     classic Reingold-Tilford-style algorithm in spirit, but simplified:
//     each subtree owns vertical space proportional to its leaf count, and
//     the parent sits at the centroid of its children.
//   - SVG-rendered links (cubic Bezier curves) for crisp scaling at any DPR
//   - HTML-rendered nodes (real text, real focus rings, real ARIA)
//   - Keyboard navigation: ←/→ moves between depths, ↑/↓ moves between
//     siblings, Enter expands/collapses
//   - Headless: parent owns the tree shape, we emit onSelect / onToggle
//   - Zero deps — no d3, no react-flow, no graph library
//
// Tree shape is intentionally minimal so consumers can adapt it to anything:
//   { id, label, children?, color?, collapsed?, data? }
// ─────────────────────────────────────────────────────────────────────────────

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { useTheme, tkxThemeVars } from '../themes';
import { sanitizeString } from '../engine/security';

// ── Public types ────────────────────────────────────────────────────────────

export interface MindMapNode {
  id: string;
  label: string;
  /** Children. Omit or pass [] for leaves. */
  children?: MindMapNode[];
  /** Node accent color (border + dot). */
  color?: string;
  /** Pre-collapsed at first render. Default false. */
  collapsed?: boolean;
  /** Free-form payload returned to your callbacks. */
  data?: unknown;
}

export interface TkxMindMapProps {
  /** The tree's root node. */
  root: MindMapNode;
  /** Selected node id (controlled). Pass null for none. */
  selectedId?: string | null;
  /** Set of collapsed node ids (controlled). If omitted, internal state is used. */
  collapsedIds?: Set<string>;
  /** Fired when the user clicks a node or moves selection via keyboard. */
  onSelect?: (id: string, node: MindMapNode) => void;
  /** Fired when the user toggles a node's expand/collapse state. */
  onToggle?: (id: string, nextCollapsed: boolean) => void;
  /** Vertical pixels reserved per leaf. Default 44. */
  leafHeight?: number;
  /** Horizontal pixels between depth levels. Default 200. */
  levelWidth?: number;
  /** Width of a node card in pixels. Default 160. */
  nodeWidth?: number;
  /** Outer style. */
  style?: CSSProperties;
  className?: string;
}

// ── Layout ──────────────────────────────────────────────────────────────────

interface LaidOut {
  node: MindMapNode;
  depth: number;
  /** Vertical center in layout-units (will be multiplied by leafHeight). */
  y: number;
  /** Span in layout-units (height of this subtree). */
  span: number;
  /** Pre-laid-out children, only populated when this node is expanded. */
  children: LaidOut[];
  /** True if the node has children, regardless of whether they're shown. */
  hasChildren: boolean;
  /** True when the node is collapsed (children not rendered). */
  collapsed: boolean;
}

/** Lay out the tree bottom-up. Each leaf takes 1 unit; an internal node's
 *  span is the sum of its visible children's spans (or 1 if collapsed/leaf).
 *  y is the center of that span relative to the local origin (top-down). */
function layout(
  node: MindMapNode,
  depth: number,
  collapsedIds: Set<string>,
  yOffset: number,
): LaidOut {
  const hasChildren = !!node.children && node.children.length > 0;
  const collapsed = collapsedIds.has(node.id);
  const showChildren = hasChildren && !collapsed;

  if (!showChildren) {
    return {
      node,
      depth,
      y: yOffset + 0.5,
      span: 1,
      children: [],
      hasChildren,
      collapsed,
    };
  }

  let cursor = yOffset;
  const laidChildren: LaidOut[] = [];
  for (const child of node.children!) {
    const c = layout(child, depth + 1, collapsedIds, cursor);
    laidChildren.push(c);
    cursor += c.span;
  }
  const span = cursor - yOffset;
  // Center y is the midpoint of the first child's center and the last child's center.
  const first = laidChildren[0];
  const last = laidChildren[laidChildren.length - 1];
  const y = (first.y + last.y) / 2;

  return {
    node,
    depth,
    y,
    span,
    children: laidChildren,
    hasChildren,
    collapsed,
  };
}

/** Walk a laid-out tree and emit a flat list of {node, x, y, parentId}. */
interface FlatNode {
  laid: LaidOut;
  x: number;
  y: number;
  parentId: string | null;
}

function flatten(
  root: LaidOut,
  levelWidth: number,
  leafHeight: number,
  out: FlatNode[] = [],
  parentId: string | null = null,
): FlatNode[] {
  out.push({
    laid: root,
    x: root.depth * levelWidth,
    y: root.y * leafHeight,
    parentId,
  });
  for (const child of root.children) {
    flatten(child, levelWidth, leafHeight, out, root.node.id);
  }
  return out;
}

// ── Keyboard navigation helpers ─────────────────────────────────────────────

/** Build parent-of and siblings-of maps for the laid-out tree. */
function buildNavMaps(root: LaidOut): {
  parents: Map<string, string | null>;
  siblings: Map<string, string[]>;
  firstChild: Map<string, string | null>;
} {
  const parents = new Map<string, string | null>();
  const siblings = new Map<string, string[]>();
  const firstChild = new Map<string, string | null>();

  function walk(n: LaidOut, parentId: string | null) {
    parents.set(n.node.id, parentId);
    firstChild.set(n.node.id, n.children[0]?.node.id ?? null);
    // Default to a singleton group so leaves still answer siblings.get()
    if (!siblings.has(n.node.id)) siblings.set(n.node.id, [n.node.id]);
    if (n.children.length) {
      const ids = n.children.map((c) => c.node.id);
      for (const c of n.children) {
        // Set siblings BEFORE recursing — otherwise walk(c) clobbers it.
        siblings.set(c.node.id, ids);
        walk(c, n.node.id);
      }
    }
  }
  walk(root, null);
  return { parents, siblings, firstChild };
}

// ── Component ───────────────────────────────────────────────────────────────

export function TkxMindMap({
  root,
  selectedId: controlledSelected,
  collapsedIds: controlledCollapsed,
  onSelect,
  onToggle,
  leafHeight = 44,
  levelWidth = 200,
  nodeWidth = 160,
  style,
  className,
}: TkxMindMapProps) {
  const theme = useTheme();
  // ── Uncontrolled fallbacks ──
  const [internalSelected, setInternalSelected] = useState<string | null>(root?.id ?? null);
  const [internalCollapsed, setInternalCollapsed] = useState<Set<string>>(() => {
    const s = new Set<string>();
    function walk(n: MindMapNode) {
      if (n.collapsed) s.add(n.id);
      n.children?.forEach(walk);
    }
    if (root) walk(root);
    return s;
  });
  const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ── Layout ──
  const laid = useMemo(() => (root ? layout(root, 0, collapsed, 0) : null), [root, collapsed]);
  const flat = useMemo(
    () => (laid ? flatten(laid, levelWidth, leafHeight) : []),
    [laid, levelWidth, leafHeight],
  );
  const navMaps = useMemo(
    () => (laid ? buildNavMaps(laid) : { parents: new Map(), siblings: new Map(), firstChild: new Map() }),
    [laid],
  );

  // SVG sizing — bounding box of all flat nodes plus padding for node width.
  const maxX = Math.max(...flat.map((f) => f.x), 0) + nodeWidth;
  const maxY = Math.max(...flat.map((f) => f.y), 0) + leafHeight;
  const minY = Math.min(...flat.map((f) => f.y), 0);
  const totalHeight = maxY - minY + leafHeight;

  // ── Selection + toggle ──
  const select = useCallback(
    (id: string) => {
      if (controlledSelected === undefined) setInternalSelected(id);
      const n = flat.find((f) => f.laid.node.id === id)?.laid.node;
      if (n) onSelect?.(id, n);
    },
    [controlledSelected, onSelect, flat],
  );

  const toggle = useCallback(
    (id: string) => {
      const isCollapsed = collapsed.has(id);
      if (controlledCollapsed === undefined) {
        setInternalCollapsed((prev) => {
          const next = new Set(prev);
          if (isCollapsed) next.delete(id);
          else next.add(id);
          return next;
        });
      }
      onToggle?.(id, !isCollapsed);
    },
    [collapsed, controlledCollapsed, onToggle],
  );

  // ── Keyboard nav ──
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!selected) return;
    const { parents, siblings, firstChild } = navMaps;
    let next: string | undefined;
    switch (e.key) {
      case 'ArrowRight': {
        if (collapsed.has(selected)) {
          // Expand on right-arrow if collapsed (common mind-map pattern)
          toggle(selected);
        } else {
          next = firstChild.get(selected) ?? undefined;
        }
        break;
      }
      case 'ArrowLeft': {
        const p = parents.get(selected);
        if (p) next = p;
        else if (!collapsed.has(selected) && firstChild.get(selected)) {
          // At root: collapse
          toggle(selected);
        }
        break;
      }
      case 'ArrowUp':
      case 'ArrowDown': {
        const sibs = siblings.get(selected);
        if (!sibs || sibs.length < 2) break;
        const i = sibs.indexOf(selected);
        const j = e.key === 'ArrowUp' ? i - 1 : i + 1;
        if (j >= 0 && j < sibs.length) next = sibs[j];
        break;
      }
      case 'Enter':
      case ' ': {
        toggle(selected);
        e.preventDefault();
        break;
      }
      default:
        return;
    }
    if (next) {
      e.preventDefault();
      select(next);
    }
  };

  // ── Empty state (no root) ──
  if (!root) {
    return (
      <div
        ref={containerRef}
        className={className}
        role="tree"
        aria-label="Mind map"
        style={{
          position: 'relative',
          width: '100%',
          ...tkxThemeVars(theme),
          background: 'var(--tkx-bg)',
          color: 'var(--tkx-fg)',
          ...style,
        }}
        data-testid="tkx-mindmap"
      />
    );
  }

  // ── Render ──
  return (
    <div
      ref={containerRef}
      className={className}
      role="tree"
      aria-label="Mind map"
      tabIndex={0}
      onKeyDown={onKeyDown}
      data-testid="tkx-mindmap"
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'auto',
        outline: 'none',
        ...tkxThemeVars(theme),
        background: 'var(--tkx-bg)',
        color: 'var(--tkx-fg)',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: maxX + 24,
          height: totalHeight + 24,
          padding: 12,
        }}
      >
        {/* SVG link layer */}
        <svg
          aria-hidden="true"
          width={maxX + 24}
          height={totalHeight + 24}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            // Shift content so y=minY lands at padding=12 inside the box.
            transform: `translate(0, ${-minY + 12}px)`,
          }}
        >
          {flat.map((f) => {
            if (!f.parentId) return null;
            const parent = flat.find((p) => p.laid.node.id === f.parentId);
            if (!parent) return null;
            const x1 = parent.x + nodeWidth;
            const y1 = parent.y + leafHeight / 2;
            const x2 = f.x;
            const y2 = f.y + leafHeight / 2;
            const midX = (x1 + x2) / 2;
            const stroke = f.laid.node.color || 'var(--tkx-accent, #00f5d4)';
            return (
              <path
                key={`${f.parentId}->${f.laid.node.id}`}
                d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                stroke={stroke}
                strokeOpacity={0.5}
                strokeWidth={1.5}
                fill="none"
              />
            );
          })}
        </svg>

        {/* Node layer */}
        {flat.map((f) => {
          const isSelected = f.laid.node.id === selected;
          const accent = f.laid.node.color || 'var(--tkx-accent, #00f5d4)';
          return (
            <div
              key={f.laid.node.id}
              role="treeitem"
              aria-selected={isSelected}
              aria-expanded={f.laid.hasChildren ? !f.laid.collapsed : undefined}
              data-testid={`mindmap-node-${f.laid.node.id}`}
              onClick={() => select(f.laid.node.id)}
              onDoubleClick={() => f.laid.hasChildren && toggle(f.laid.node.id)}
              style={{
                position: 'absolute',
                left: f.x + 12,
                top: f.y - minY + 12,
                width: nodeWidth,
                height: leafHeight - 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 8,
                border: `1px solid ${isSelected ? accent : 'var(--tkx-border, #2a2a3e)'}`,
                background: isSelected ? `${accent}1a` : 'var(--tkx-bg-subtle, #12121a)',
                cursor: 'pointer',
                fontSize: 13,
                lineHeight: 1.3,
                boxShadow: isSelected ? `0 0 0 2px ${accent}33` : 'none',
                transition: 'border-color 0.12s, box-shadow 0.12s',
                boxSizing: 'border-box',
              }}
            >
              {f.laid.hasChildren && (
                <button
                  type="button"
                  aria-label={f.laid.collapsed ? 'Expand' : 'Collapse'}
                  data-testid={`mindmap-toggle-${f.laid.node.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(f.laid.node.id);
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    flex: '0 0 20px',
                    borderRadius: 4,
                    border: 'none',
                    background: accent,
                    color: 'var(--tkx-bg)',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  {f.laid.collapsed ? '+' : '−'}
                </button>
              )}
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={sanitizeString(f.laid.node.label)}
              >
                {sanitizeString(f.laid.node.label)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
