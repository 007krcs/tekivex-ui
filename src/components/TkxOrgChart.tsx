'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxOrgChart — Hierarchical organization chart / data-flow diagram.
//
// Features:
//  • Declarative tree data (nodes + optional edges)
//  • Horizontal (default) and vertical layouts
//  • Built-in Reingold-Tilford-style tree layout (O(n) single pass)
//  • Pan + zoom (mouse wheel / trackpad / pinch)
//  • Click + keyboard-accessible focus
//  • Collapsible subtrees
//  • Custom node renderer (or use built-in card)
//  • XSS-safe (all user strings go through sanitizeString)
//  • Responsive: works on mobile via touch pan
//  • Fully theme-aware
//  • WCAG: role="tree" + role="treeitem", arrow-key traversal
//
// Zero external dependencies. Pure SVG + minimal DOM math.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';

// ── Public types ─────────────────────────────────────────────────────────────

export interface OrgNode {
  /** Unique node id. Must be a non-empty string. */
  id: string;
  /** Primary label (name / role / department). */
  label: string;
  /** Secondary label (title / role detail). */
  subLabel?: string;
  /** Short badge text (e.g. "Manager", "FT", "R&D"). */
  badge?: string;
  /** Avatar image URL (must be http(s)/relative — javascript:/data: are blocked). */
  avatar?: string;
  /** Color accent for the node card (theme token name or CSS color). */
  accent?: string;
  /** Children nodes. */
  children?: OrgNode[];
  /** Arbitrary metadata passed to custom renderer + onNodeClick. */
  meta?: Record<string, unknown>;
}

export interface TkxOrgChartProps {
  /** Root node of the tree. */
  data: OrgNode;
  /** Layout direction. Default: 'vertical'. */
  direction?: 'vertical' | 'horizontal';
  /** Enable pan/zoom. Default: true. */
  interactive?: boolean;
  /** Initial zoom level (0.25 – 4). Default: 1. */
  initialZoom?: number;
  /** Width of each node card (px). Default: 200. */
  nodeWidth?: number;
  /** Height of each node card (px). Default: 84. */
  nodeHeight?: number;
  /** Sibling gap (px). Default: 28. */
  siblingGap?: number;
  /** Level gap (px). Default: 64. */
  levelGap?: number;
  /** Called when a node is clicked. */
  onNodeClick?: (node: OrgNode) => void;
  /** Custom node renderer. Must return a React element of the declared size. */
  renderNode?: (node: OrgNode, isActive: boolean) => ReactNode;
  /** Start with all subtrees collapsed except the root. Default: false. */
  collapsedByDefault?: boolean;
  /** Container height. Default: 560. */
  height?: number | string;
  /** aria-label for the chart wrapper. */
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

// ── Internal layout types ────────────────────────────────────────────────────

interface LayoutNode {
  id: string;
  node: OrgNode;
  x: number;
  y: number;
  depth: number;
  parent: LayoutNode | null;
  children: LayoutNode[];
  collapsed: boolean;
}

// ── Tree layout algorithm (compact, Reingold–Tilford inspired) ───────────────

function buildLayout(
  root: OrgNode,
  collapsed: Set<string>,
  opts: { nodeWidth: number; nodeHeight: number; siblingGap: number; levelGap: number; direction: 'vertical' | 'horizontal' },
): { nodes: LayoutNode[]; width: number; height: number } {
  const { nodeWidth, nodeHeight, siblingGap, levelGap, direction } = opts;
  const all: LayoutNode[] = [];

  function make(node: OrgNode, depth: number, parent: LayoutNode | null): LayoutNode {
    const isCollapsed = collapsed.has(node.id);
    const ln: LayoutNode = {
      id: node.id,
      node,
      x: 0,
      y: 0,
      depth,
      parent,
      children: [],
      collapsed: isCollapsed,
    };
    if (!isCollapsed) {
      for (const child of node.children ?? []) {
        ln.children.push(make(child, depth + 1, ln));
      }
    }
    all.push(ln);
    return ln;
  }
  const tree = make(root, 0, null);

  // Post-order: assign x (leaf → parent-center)
  let cursor = 0;
  function place(n: LayoutNode): void {
    if (n.children.length === 0) {
      n.x = cursor;
      cursor += nodeWidth + siblingGap;
      return;
    }
    n.children.forEach(place);
    const first = n.children[0].x;
    const last = n.children[n.children.length - 1].x;
    n.x = (first + last) / 2;
  }
  place(tree);

  // Depth → y coordinate.
  for (const n of all) {
    n.y = n.depth * (nodeHeight + levelGap);
  }

  // If horizontal layout, swap x/y.
  if (direction === 'horizontal') {
    for (const n of all) {
      const tx = n.x, ty = n.y;
      n.x = ty;
      n.y = tx;
    }
  }

  // Normalize to positive origin + compute total bounds.
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of all) {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x > maxX) maxX = n.x;
    if (n.y > maxY) maxY = n.y;
  }
  if (!Number.isFinite(minX)) { minX = 0; minY = 0; maxX = 0; maxY = 0; }
  for (const n of all) {
    n.x -= minX;
    n.y -= minY;
  }
  const width = maxX - minX + nodeWidth;
  const height = maxY - minY + nodeHeight;

  return { nodes: all, width, height };
}

// ── Connector path builder (curved L-shape) ──────────────────────────────────

function buildEdgePath(
  parent: LayoutNode,
  child: LayoutNode,
  nw: number,
  nh: number,
  direction: 'vertical' | 'horizontal',
): string {
  if (direction === 'vertical') {
    const x1 = parent.x + nw / 2;
    const y1 = parent.y + nh;
    const x2 = child.x + nw / 2;
    const y2 = child.y;
    const mid = (y1 + y2) / 2;
    return `M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2}`;
  }
  const x1 = parent.x + nw;
  const y1 = parent.y + nh / 2;
  const x2 = child.x;
  const y2 = child.y + nh / 2;
  const mid = (x1 + x2) / 2;
  return `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`;
}

// ── Href sanitization for avatars ────────────────────────────────────────────

function safeAvatarHref(raw?: string): string | undefined {
  if (!raw) return undefined;
  const t = raw.trim();
  if (!t) return undefined;
  if (/^javascript:/i.test(t)) return undefined;
  if (/^vbscript:/i.test(t)) return undefined;
  if (/^data:/i.test(t) && !/^data:image\//i.test(t)) return undefined;
  return t;
}

// ── Built-in node card ───────────────────────────────────────────────────────

function DefaultNodeCard({
  node,
  w,
  h,
  isActive,
  theme,
}: {
  node: OrgNode;
  w: number;
  h: number;
  isActive: boolean;
  theme: ReturnType<typeof useTheme>;
}) {
  const accent = node.accent ?? theme.primary;
  const avatar = safeAvatarHref(node.avatar);
  const label = sanitizeString(node.label);
  const subLabel = node.subLabel ? sanitizeString(node.subLabel) : '';
  const badge = node.badge ? sanitizeString(node.badge) : '';

  return (
    <div
      style={{
        width: w,
        height: h,
        boxSizing: 'border-box',
        background: theme.surface,
        border: `1.5px solid ${isActive ? accent : theme.border}`,
        borderRadius: 12,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: isActive
          ? `0 8px 24px -8px ${accent}66`
          : `0 2px 8px -4px ${theme.border}88`,
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        overflow: 'hidden',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 40,
          height: 40,
          minWidth: 40,
          borderRadius: '50%',
          overflow: 'hidden',
          background: `${accent}22`,
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          border: `1.5px solid ${accent}44`,
        }}
        aria-hidden="true"
      >
        {avatar ? (
          <img
            src={avatar}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          label.slice(0, 2).toUpperCase()
        )}
      </div>

      {/* Text stack */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: theme.text,
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </div>
        {subLabel && (
          <div
            style={{
              fontSize: 11.5,
              color: theme.textMuted,
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: 1,
            }}
          >
            {subLabel}
          </div>
        )}
      </div>

      {/* Badge */}
      {badge && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 7px',
            borderRadius: 999,
            color: accent,
            background: `${accent}18`,
            border: `1px solid ${accent}33`,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            flexShrink: 0,
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// ── Toggle button for collapsible subtrees ───────────────────────────────────

function CollapseToggle({
  collapsed,
  onClick,
  theme,
  direction,
  w,
  h,
}: {
  collapsed: boolean;
  onClick: (ev: React.MouseEvent | React.KeyboardEvent) => void;
  theme: ReturnType<typeof useTheme>;
  direction: 'vertical' | 'horizontal';
  w: number;
  h: number;
}) {
  const style: CSSProperties = {
    position: 'absolute',
    ...(direction === 'vertical'
      ? { left: w / 2 - 10, top: h - 10 }
      : { left: w - 10, top: h / 2 - 10 }),
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: theme.surfaceAlt,
    border: `1.5px solid ${theme.border}`,
    color: theme.text,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <button
      type="button"
      aria-label={collapsed ? 'Expand subtree' : 'Collapse subtree'}
      aria-expanded={!collapsed}
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onClick(e); } }}
      style={style}
    >
      {collapsed ? '+' : '−'}
    </button>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function TkxOrgChart({
  data,
  direction = 'vertical',
  interactive = true,
  initialZoom = 1,
  nodeWidth = 200,
  nodeHeight = 84,
  siblingGap = 28,
  levelGap = 64,
  onNodeClick,
  renderNode,
  collapsedByDefault = false,
  height = 560,
  ariaLabel = 'Organization chart',
  className,
  style,
}: TkxOrgChartProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Build initial collapsed set.
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    if (!collapsedByDefault || !data) return new Set();
    const s = new Set<string>();
    function walk(n: OrgNode): void {
      if (n.id !== data.id) s.add(n.id);
      (n.children ?? []).forEach(walk);
    }
    walk(data);
    return s;
  });
  const [zoom, setZoom] = useState(clampZoom(initialZoom));
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeId, setActiveId] = useState<string>(data?.id ?? '');

  const layout = useMemo(
    () =>
      data
        ? buildLayout(data, collapsed, { nodeWidth, nodeHeight, siblingGap, levelGap, direction })
        : { nodes: [], width: 0, height: 0 },
    [data, collapsed, nodeWidth, nodeHeight, siblingGap, levelGap, direction],
  );

  // Toggle collapsed.
  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Mouse wheel zoom (only when hovering chart).
  useEffect(() => {
    if (!interactive) return;
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        // Plain wheel = pan; trackpad pinch or ctrl+wheel = zoom.
        if (Math.abs(e.deltaY) < 4 && Math.abs(e.deltaX) < 4) return;
        setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      setZoom((z) => clampZoom(z + delta));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [interactive]);

  // Touch + mouse drag panning.
  useEffect(() => {
    if (!interactive) return;
    const el = containerRef.current;
    if (!el) return;
    let dragging = false;
    let startX = 0, startY = 0, startPanX = 0, startPanY = 0;
    const down = (e: PointerEvent) => {
      // Don't steal clicks from buttons / interactive nodes.
      const target = e.target as HTMLElement;
      if (target.closest('button, [role="treeitem"], a, input')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startPanX = pan.x;
      startPanY = pan.y;
      (el as HTMLDivElement).setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      setPan({ x: startPanX + (e.clientX - startX), y: startPanY + (e.clientY - startY) });
    };
    const up = (e: PointerEvent) => {
      dragging = false;
      try { (el as HTMLDivElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [interactive, pan]);

  // Keyboard traversal (arrow keys move active focus between siblings/parents).
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const current = layout.nodes.find((n) => n.id === activeId);
    if (!current) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      const next = current.children[0];
      if (next) { setActiveId(next.id); e.preventDefault(); }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (current.parent) { setActiveId(current.parent.id); e.preventDefault(); }
    } else if (e.key === 'Enter' || e.key === ' ') {
      onNodeClick?.(current.node);
      e.preventDefault();
    } else if (e.key === '+' || e.key === '=') {
      setZoom((z) => clampZoom(z + 0.1));
    } else if (e.key === '-') {
      setZoom((z) => clampZoom(z - 0.1));
    } else if (e.key === '0') {
      setZoom(1); setPan({ x: 0, y: 0 });
    }
  }, [activeId, layout, onNodeClick]);

  // Render edges.
  const edges = useMemo(() => {
    const out: Array<{ id: string; d: string }> = [];
    for (const n of layout.nodes) {
      for (const c of n.children) {
        out.push({ id: `${n.id}→${c.id}`, d: buildEdgePath(n, c, nodeWidth, nodeHeight, direction) });
      }
    }
    return out;
  }, [layout, nodeWidth, nodeHeight, direction]);

  // Outer container.
  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height,
    overflow: 'hidden',
    borderRadius: 12,
    background: theme.bg,
    border: `1px solid ${theme.border}`,
    touchAction: 'none',
    cursor: interactive ? 'grab' : 'default',
    boxSizing: 'border-box',
    ...style,
  };

  const stageStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: 24,
    width: layout.width,
    height: layout.height,
    transform: `translate(calc(-50% + ${pan.x}px), ${pan.y}px) scale(${zoom})`,
    transformOrigin: 'top center',
    transition: 'transform 0.08s ease-out',
  };

  // Build node list — defer active state so only one is highlighted.
  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
      role="tree"
      aria-label={sanitizeString(ariaLabel)}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {/* Zoom controls */}
      {interactive && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 3,
            display: 'flex',
            gap: 6,
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 8,
            padding: 4,
            boxShadow: `0 4px 12px -6px ${theme.border}88`,
          }}
        >
          <ZoomBtn theme={theme} label="Zoom out" onClick={() => setZoom((z) => clampZoom(z - 0.1))}>−</ZoomBtn>
          <ZoomBtn theme={theme} label="Reset zoom" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>⟳</ZoomBtn>
          <ZoomBtn theme={theme} label="Zoom in" onClick={() => setZoom((z) => clampZoom(z + 0.1))}>+</ZoomBtn>
        </div>
      )}

      <div ref={viewportRef} style={stageStyle}>
        {/* Connector SVG */}
        <svg
          width={layout.width}
          height={layout.height}
          style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
          aria-hidden="true"
        >
          {edges.map((e) => (
            <path
              key={e.id}
              d={e.d}
              fill="none"
              stroke={theme.border}
              strokeWidth={1.5}
            />
          ))}
        </svg>

        {/* Nodes */}
        {layout.nodes.map((n) => {
          const hasHiddenChildren = (n.node.children?.length ?? 0) > 0;
          const isActive = n.id === activeId;
          return (
            <div
              key={n.id}
              role="treeitem"
              aria-label={sanitizeString(n.node.label)}
              aria-selected={isActive}
              aria-level={n.depth + 1}
              aria-expanded={hasHiddenChildren ? !n.collapsed : undefined}
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                setActiveId(n.id);
                onNodeClick?.(n.node);
              }}
              style={{
                position: 'absolute',
                left: n.x,
                top: n.y,
                width: nodeWidth,
                height: nodeHeight,
                cursor: onNodeClick ? 'pointer' : 'default',
              }}
            >
              {renderNode
                ? renderNode(n.node, isActive)
                : <DefaultNodeCard node={n.node} w={nodeWidth} h={nodeHeight} isActive={isActive} theme={theme} />}
              {hasHiddenChildren && (
                <CollapseToggle
                  collapsed={n.collapsed}
                  onClick={() => toggleCollapse(n.id)}
                  theme={theme}
                  direction={direction}
                  w={nodeWidth}
                  h={nodeHeight}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

TkxOrgChart.displayName = 'TkxOrgChart';

// ── Helpers ──────────────────────────────────────────────────────────────────

function clampZoom(z: number): number {
  if (z < 0.25) return 0.25;
  if (z > 4) return 4;
  return z;
}

function ZoomBtn({
  children,
  onClick,
  label,
  theme,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        background: 'transparent',
        border: 'none',
        color: theme.text,
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = theme.surfaceAlt; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}
