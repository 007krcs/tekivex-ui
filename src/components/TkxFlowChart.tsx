'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxFlowChart — node-edge graph editor
//
// What it gives you:
//   - A 2D canvas you can pan + zoom
//   - Nodes you can drag (pointer + touch)
//   - Edges drawn as cubic Beziers between node sides
//   - Click-to-select (or Tab/Shift-Tab keyboard navigation)
//   - Arrow keys nudge the selected node (shift = 10x), Delete removes it
//   - Wheel zoom on desktop; pinch zoom on touch (two-finger)
//   - Headless: parent owns the nodes + edges arrays, builder fires
//     onChange / onSelect / onConnect; nothing is implicit.
//
// Responsive design notes:
//   - Width is 100% of the parent container; height is configurable
//   - Pointer Events handle mouse / pen / touch uniformly
//   - Pinch-zoom uses two simultaneous pointers; falls back to wheel zoom
//     on devices that don't support multi-touch
//   - Hit-targets on the +/- zoom buttons are 44×44 (WCAG 2.1 AAA)
//   - Background grid scales with zoom level so it reads at any scale
//
// What it does NOT do (yet):
//   - Edge editing (deleting an edge, dragging an edge endpoint)
//     → consumer can call onChange({nodes, edges}) themselves
//   - Multi-node selection (rubber-band select)
//   - Auto-layout — the parent provides positions
//   - Minimap — would be additive; lives outside this component
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
} from 'react';

// ── Public types ────────────────────────────────────────────────────────────

export interface FlowNode {
  id: string;
  /** Top-left corner in graph-space coordinates. */
  x: number;
  y: number;
  /** Width in graph-space pixels. Default 160. */
  width?: number;
  /** Height in graph-space pixels. Default 60. */
  height?: number;
  /** Display label. */
  label: string;
  /** Optional accent color (border + edge endpoints). */
  color?: string;
  /** Free-form payload returned to your callbacks. */
  data?: unknown;
}

export interface FlowEdge {
  id: string;
  /** Source node id. */
  from: string;
  /** Target node id. */
  to: string;
  /** Optional label drawn at the midpoint. */
  label?: string;
  /** Optional accent color (defaults to source-node color). */
  color?: string;
}

export interface FlowChartData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface TkxFlowChartProps {
  /** Controlled graph state. */
  data: FlowChartData;
  /** Fired with the new graph state on any change. */
  onChange: (next: FlowChartData) => void;
  /** Currently-selected node id (controlled). Pass null for none. */
  selectedId?: string | null;
  /** Fired on selection change. */
  onSelect?: (id: string | null) => void;
  /** Initial viewport. Default { x: 0, y: 0, scale: 1 }. */
  initialViewport?: Viewport;
  /** Allow node drag. Default true. */
  draggable?: boolean;
  /** Allow canvas pan. Default true. */
  pannable?: boolean;
  /** Allow wheel/pinch zoom. Default true. */
  zoomable?: boolean;
  /** Min zoom factor. Default 0.25. */
  minZoom?: number;
  /** Max zoom factor. Default 3. */
  maxZoom?: number;
  /** Canvas height in pixels. Default 480. */
  height?: number;
  /** Render the background grid. Default true. */
  showGrid?: boolean;
  /** Show the +/- / fit zoom controls. Default true. */
  showControls?: boolean;
  /** Custom node renderer. */
  renderNode?: (node: FlowNode, isSelected: boolean) => ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ── Edge geometry (pure, easily testable) ──────────────────────────────────

/** Compute the right-port (out) and left-port (in) anchor of a node, in
 *  graph-space coordinates. We always route from right-of-source to
 *  left-of-target — predictable for left-to-right reading flows. */
export function nodeAnchors(n: FlowNode): { out: [number, number]; in: [number, number] } {
  const w = n.width ?? 160;
  const h = n.height ?? 60;
  return {
    out: [n.x + w, n.y + h / 2],
    in: [n.x, n.y + h / 2],
  };
}

/** Build the SVG path data for an edge between two nodes. Cubic Bezier with
 *  control points pulled along the X axis so straight horizontal edges stay
 *  straight and longer-distance edges curve gently. */
export function edgePath(from: FlowNode, to: FlowNode): string {
  const a = nodeAnchors(from).out;
  const b = nodeAnchors(to).in;
  const dx = Math.max(40, Math.abs(b[0] - a[0]) / 2);
  const c1: [number, number] = [a[0] + dx, a[1]];
  const c2: [number, number] = [b[0] - dx, b[1]];
  return `M ${a[0]} ${a[1]} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${b[0]} ${b[1]}`;
}

// ── Component ───────────────────────────────────────────────────────────────

const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, scale: 1 };

export const TkxFlowChart = forwardRef<HTMLDivElement, TkxFlowChartProps>(
  function TkxFlowChart(
    {
      data,
      onChange,
      selectedId: controlledSelected,
      onSelect,
      initialViewport,
      draggable = true,
      pannable = true,
      zoomable = true,
      minZoom = 0.25,
      maxZoom = 3,
      height = 480,
      showGrid = true,
      showControls = true,
      renderNode,
      className,
      style,
    },
    forwardedRef,
  ) {
    const [viewport, setViewport] = useState<Viewport>(initialViewport ?? DEFAULT_VIEWPORT);
    const [internalSelected, setInternalSelected] = useState<string | null>(null);
    const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;

    // ── Edit-mode state (PR #11: full editor) ──
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
    const [showInspector, setShowInspector] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const id = useId();

    const select = useCallback(
      (next: string | null) => {
        if (controlledSelected === undefined) setInternalSelected(next);
        onSelect?.(next);
      },
      [controlledSelected, onSelect],
    );

    // ── Drag state (one ref so renders don't fire mid-drag) ─────────────
    const dragRef = useRef<
      | { kind: 'node'; id: string; pointerId: number; startX: number; startY: number; nodeStartX: number; nodeStartY: number }
      | { kind: 'pan'; pointerId: number; startX: number; startY: number; vpStartX: number; vpStartY: number }
      | { kind: 'edge'; pointerId: number; fromNodeId: string }
      | null
    >(null);
    // Active pointers for pinch-zoom
    const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
    const pinchRef = useRef<{ startDist: number; startScale: number; centerX: number; centerY: number } | null>(null);

    const ENGAGED_NODE_IDS = useRef<Set<string>>(new Set());

    // Edge-draw cursor in graph space, lives in state so the SVG draft line
    // re-renders when it moves. null = no draft in progress.
    const [edgeDraft, setEdgeDraft] = useState<{ fromNodeId: string; gx: number; gy: number } | null>(null);

    // ── Node drag handlers (registered per node) ────────────────────────
    const onNodePointerDown = (e: PointerEvent<HTMLDivElement>, node: FlowNode) => {
      if (!draggable) return;
      // Don't fire when interactive children are clicked
      e.stopPropagation();
      select(node.id);
      ENGAGED_NODE_IDS.current.add(node.id);
      // setPointerCapture is undefined in jsdom; tolerate it.
      try {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      } catch { /* jsdom or pointer-events not supported here */ }
      dragRef.current = {
        kind: 'node',
        id: node.id,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        nodeStartX: node.x,
        nodeStartY: node.y,
      };
    };

    const onNodePointerMove = (e: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.kind !== 'node' || drag.pointerId !== e.pointerId) return;
      const dx = (e.clientX - drag.startX) / viewport.scale;
      const dy = (e.clientY - drag.startY) / viewport.scale;
      const nx = drag.nodeStartX + dx;
      const ny = drag.nodeStartY + dy;
      onChange({
        ...data,
        nodes: data.nodes.map((n) => (n.id === drag.id ? { ...n, x: nx, y: ny } : n)),
      });
    };

    const onNodePointerUp = (e: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (drag && drag.kind === 'node' && drag.pointerId === e.pointerId) {
        ENGAGED_NODE_IDS.current.delete(drag.id);
        dragRef.current = null;
      }
    };

    // Convert screen-space pointer coordinates to graph-space (accounting for
    // viewport translate + scale). Used by the edge-draw preview line.
    const screenToGraph = useCallback(
      (clientX: number, clientY: number): [number, number] => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return [0, 0];
        const x = (clientX - rect.left - viewport.x) / viewport.scale;
        const y = (clientY - rect.top  - viewport.y) / viewport.scale;
        return [x, y];
      },
      [viewport.x, viewport.y, viewport.scale],
    );

    // ── Edge-creation handlers ──────────────────────────────────────────
    //
    // Earlier this used onPointerMove / onPointerUp on the port button +
    // setPointerCapture. Problem in real browsers: combinations of React's
    // synthetic event delegation, e.preventDefault, and pointer-capture
    // sometimes drop the pointermove events once the cursor leaves the
    // button, so the draft line never tracks the cursor and the up-handler
    // never fires.
    //
    // Robust fix: when the user presses on the port, attach a window-level
    // pointermove + pointerup pair that owns the drag. They dispatch
    // unconditionally regardless of which element is under the cursor,
    // so the draft line tracks correctly and the drop can land anywhere.
    // Cleanup happens inside pointerup.

    const onPortPointerDown = (e: PointerEvent<HTMLButtonElement>, fromNodeId: string) => {
      e.stopPropagation();
      e.preventDefault();

      const startedPointerId = e.pointerId;
      const [gx, gy] = screenToGraph(e.clientX, e.clientY);
      dragRef.current = { kind: 'edge', pointerId: startedPointerId, fromNodeId };
      setEdgeDraft({ fromNodeId, gx, gy });

      const onWindowMove = (ev: globalThis.PointerEvent) => {
        const drag = dragRef.current;
        if (!drag || drag.kind !== 'edge' || drag.pointerId !== ev.pointerId) return;
        const [mx, my] = screenToGraph(ev.clientX, ev.clientY);
        setEdgeDraft({ fromNodeId: drag.fromNodeId, gx: mx, gy: my });
      };

      const onWindowUp = (ev: globalThis.PointerEvent) => {
        const drag = dragRef.current;
        if (!drag || drag.kind !== 'edge' || drag.pointerId !== ev.pointerId) return;

        // Find the node under the pointer (excluding the source).
        let toNodeId: string | undefined;
        try {
          const target = document.elementFromPoint?.(ev.clientX, ev.clientY);
          const nodeEl = (target as Element | null)?.closest('[data-tkx-node-id]') as HTMLElement | null;
          toNodeId = nodeEl?.dataset.tkxNodeId;
        } catch { /* */ }

        if (toNodeId && toNodeId !== drag.fromNodeId) {
          const exists = data.edges.some(
            (ed) => ed.from === drag.fromNodeId && ed.to === toNodeId,
          );
          if (!exists) {
            const newEdge: FlowEdge = {
              id: `e-${drag.fromNodeId}-${toNodeId}-${Date.now().toString(36)}`,
              from: drag.fromNodeId,
              to: toNodeId,
            };
            onChange({ ...data, edges: [...data.edges, newEdge] });
          }
        }

        dragRef.current = null;
        setEdgeDraft(null);
        window.removeEventListener('pointermove', onWindowMove);
        window.removeEventListener('pointerup',   onWindowUp);
        window.removeEventListener('pointercancel', onWindowUp);
      };

      window.addEventListener('pointermove', onWindowMove);
      window.addEventListener('pointerup',   onWindowUp);
      window.addEventListener('pointercancel', onWindowUp);
    };

    // The following two stay registered on the React port-button for jsdom
    // tests that fire synthetic pointer events directly — real browsers go
    // through the window listeners above.
    const onPortPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.kind !== 'edge' || drag.pointerId !== e.pointerId) return;
      const [gx, gy] = screenToGraph(e.clientX, e.clientY);
      setEdgeDraft({ fromNodeId: drag.fromNodeId, gx, gy });
    };

    const onPortPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.kind !== 'edge' || drag.pointerId !== e.pointerId) return;
      e.stopPropagation();
      let toNodeId: string | undefined;
      try {
        const target = document.elementFromPoint?.(e.clientX, e.clientY);
        const nodeEl = (target as Element | null)?.closest('[data-tkx-node-id]') as HTMLElement | null;
        toNodeId = nodeEl?.dataset.tkxNodeId;
      } catch { /* */ }
      if (toNodeId && toNodeId !== drag.fromNodeId) {
        const exists = data.edges.some(
          (ed) => ed.from === drag.fromNodeId && ed.to === toNodeId,
        );
        if (!exists) {
          const newEdge: FlowEdge = {
            id: `e-${drag.fromNodeId}-${toNodeId}-${Date.now().toString(36)}`,
            from: drag.fromNodeId,
            to: toNodeId,
          };
          onChange({ ...data, edges: [...data.edges, newEdge] });
        }
      }
      dragRef.current = null;
      setEdgeDraft(null);
    };

    // ── Canvas-level pan / pinch / zoom ─────────────────────────────────
    const onCanvasPointerDown = (e: PointerEvent<HTMLDivElement>) => {
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Two-finger pinch start
      if (zoomable && activePointers.current.size === 2) {
        const [a, b] = Array.from(activePointers.current.values());
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        pinchRef.current = {
          startDist: dist,
          startScale: viewport.scale,
          centerX: (a.x + b.x) / 2,
          centerY: (a.y + b.y) / 2,
        };
        return;
      }

      // Click on empty canvas → deselect + start pan
      if (e.target === e.currentTarget && pannable) {
        select(null);
        try {
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        } catch { /* jsdom */ }
        dragRef.current = {
          kind: 'pan',
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          vpStartX: viewport.x,
          vpStartY: viewport.y,
        };
      }
    };

    const onCanvasPointerMove = (e: PointerEvent<HTMLDivElement>) => {
      // Update pointer position
      if (activePointers.current.has(e.pointerId)) {
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // Pinch zoom takes precedence
      const pinch = pinchRef.current;
      if (pinch && activePointers.current.size === 2) {
        const [a, b] = Array.from(activePointers.current.values());
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        const factor = dist / pinch.startDist;
        const nextScale = clamp(pinch.startScale * factor, minZoom, maxZoom);
        // Zoom around the pinch center
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          zoomTo(nextScale, pinch.centerX - rect.left, pinch.centerY - rect.top);
        }
        return;
      }

      const drag = dragRef.current;
      if (drag && drag.kind === 'pan' && drag.pointerId === e.pointerId) {
        setViewport({
          x: drag.vpStartX + (e.clientX - drag.startX),
          y: drag.vpStartY + (e.clientY - drag.startY),
          scale: viewport.scale,
        });
      }
    };

    const onCanvasPointerUp = (e: PointerEvent<HTMLDivElement>) => {
      activePointers.current.delete(e.pointerId);
      if (activePointers.current.size < 2) pinchRef.current = null;
      const drag = dragRef.current;
      if (drag && drag.kind === 'pan' && drag.pointerId === e.pointerId) {
        dragRef.current = null;
      }
    };

    function clamp(v: number, lo: number, hi: number) {
      return Math.max(lo, Math.min(hi, v));
    }

    /** Zoom to `nextScale`, anchored on the screen-space point [px, py] so
     *  the spot under the cursor / pinch-center stays put. */
    const zoomTo = useCallback(
      (nextScale: number, px: number, py: number) => {
        setViewport((vp) => {
          const s = clamp(nextScale, minZoom, maxZoom);
          // Convert anchor from screen → graph space at the OLD scale,
          // then re-translate so it lands at the same screen position
          // under the NEW scale.
          const gx = (px - vp.x) / vp.scale;
          const gy = (py - vp.y) / vp.scale;
          return {
            x: px - gx * s,
            y: py - gy * s,
            scale: s,
          };
        });
      },
      [minZoom, maxZoom],
    );

    const onWheel = (e: WheelEvent<HTMLDivElement>) => {
      if (!zoomable) return;
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const factor = Math.exp(-e.deltaY * 0.0015);
      zoomTo(viewport.scale * factor, e.clientX - rect.left, e.clientY - rect.top);
    };

    // ── Keyboard ────────────────────────────────────────────────────────
    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      // Edge takes priority — if an edge is selected and the user hits
      // Delete, remove just that edge (not the connected nodes).
      if (selectedEdgeId && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        onChange({
          ...data,
          edges: data.edges.filter((ed) => ed.id !== selectedEdgeId),
        });
        setSelectedEdgeId(null);
        return;
      }

      if (!selected) {
        // Tab / Shift+Tab cycles through nodes when nothing selected
        if (e.key === 'Tab' && data.nodes.length > 0) {
          e.preventDefault();
          select(data.nodes[0].id);
        }
        return;
      }
      const idx = data.nodes.findIndex((n) => n.id === selected);
      switch (e.key) {
        case 'Tab': {
          e.preventDefault();
          const dir = e.shiftKey ? -1 : 1;
          const nextIdx = (idx + dir + data.nodes.length) % data.nodes.length;
          select(data.nodes[nextIdx].id);
          break;
        }
        case 'Delete':
        case 'Backspace': {
          e.preventDefault();
          onChange({
            nodes: data.nodes.filter((n) => n.id !== selected),
            edges: data.edges.filter((ed) => ed.from !== selected && ed.to !== selected),
          });
          select(null);
          break;
        }
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown': {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const dx = e.key === 'ArrowRight' ? step : e.key === 'ArrowLeft' ? -step : 0;
          const dy = e.key === 'ArrowDown' ? step : e.key === 'ArrowUp' ? -step : 0;
          onChange({
            ...data,
            nodes: data.nodes.map((n) => (n.id === selected ? { ...n, x: n.x + dx, y: n.y + dy } : n)),
          });
          break;
        }
      }
    };

    // ── "Fit to view" button ────────────────────────────────────────────
    const fitToView = useCallback(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || data.nodes.length === 0) {
        setViewport(DEFAULT_VIEWPORT);
        return;
      }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of data.nodes) {
        const w = n.width ?? 160;
        const h = n.height ?? 60;
        if (n.x < minX) minX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.x + w > maxX) maxX = n.x + w;
        if (n.y + h > maxY) maxY = n.y + h;
      }
      const padding = 40;
      const gw = (maxX - minX) + padding * 2;
      const gh = (maxY - minY) + padding * 2;
      const sx = rect.width / gw;
      const sy = rect.height / gh;
      const s = clamp(Math.min(sx, sy), minZoom, maxZoom);
      setViewport({
        x: -minX * s + (rect.width - (maxX - minX) * s) / 2,
        y: -minY * s + (rect.height - (maxY - minY) * s) / 2,
        scale: s,
      });
    }, [data.nodes, minZoom, maxZoom]);

    // ── Render ──────────────────────────────────────────────────────────
    const transform = `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.scale})`;
    const nodeMap = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data.nodes]);

    return (
      <div
        ref={(el) => {
          containerRef.current = el;
          if (typeof forwardedRef === 'function') forwardedRef(el);
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className={className}
        role="application"
        aria-label="Flow chart editor"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerUp}
        onPointerCancel={onCanvasPointerUp}
        onWheel={onWheel}
        data-testid="tkx-flowchart"
        style={{
          position: 'relative',
          width: '100%',
          height,
          overflow: 'hidden',
          background: 'var(--tkx-bg, #0a0a0f)',
          color: 'var(--tkx-fg, #e8e8f4)',
          border: '1px solid var(--tkx-border, #2a2a3e)',
          borderRadius: 12,
          touchAction: zoomable || pannable ? 'none' : 'auto',
          outline: 'none',
          ...style,
        }}
      >
        {/* Background grid — purely visual, scales with viewport */}
        {showGrid && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: `${24 * viewport.scale}px ${24 * viewport.scale}px`,
              backgroundPosition: `${viewport.x}px ${viewport.y}px`,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Edge layer (SVG) — sits in graph space so paths transform with viewport */}
        <svg
          aria-hidden="true"
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          <g style={{ transform, transformOrigin: '0 0' }}>
            <defs>
              <marker
                id={`tkx-flow-arrow-${id}`}
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 z" fill="currentColor" />
              </marker>
            </defs>
            {/* Live "draft" edge while the user is dragging from a port */}
            {edgeDraft && (() => {
              const from = nodeMap.get(edgeDraft.fromNodeId);
              if (!from) return null;
              const a = nodeAnchors(from).out;
              const b: [number, number] = [edgeDraft.gx, edgeDraft.gy];
              const dx = Math.max(40, Math.abs(b[0] - a[0]) / 2);
              const d = `M ${a[0]} ${a[1]} C ${a[0] + dx} ${a[1]}, ${b[0] - dx} ${b[1]}, ${b[0]} ${b[1]}`;
              return (
                <path
                  data-testid="flow-edge-draft"
                  d={d}
                  stroke="var(--tkx-accent, #00f5d4)"
                  strokeWidth={1.6 / viewport.scale}
                  strokeDasharray={`${4 / viewport.scale} ${4 / viewport.scale}`}
                  fill="none"
                  strokeOpacity={0.85}
                />
              );
            })()}

            {data.edges.map((e) => {
              const from = nodeMap.get(e.from);
              const to = nodeMap.get(e.to);
              if (!from || !to) return null;
              const stroke = e.color ?? from.color ?? 'var(--tkx-accent, #00f5d4)';
              const isEdgeSelected = e.id === selectedEdgeId;
              return (
                <g key={e.id} data-testid={`flow-edge-${e.id}`} style={{ color: stroke, pointerEvents: 'auto', cursor: 'pointer' }}>
                  {/* Wide invisible hit-target so the edge is easy to click
                      even at small widths. */}
                  <path
                    d={edgePath(from, to)}
                    stroke="transparent"
                    strokeWidth={12 / viewport.scale}
                    fill="none"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setSelectedEdgeId(e.id);
                      // Deselect any node when picking an edge so Delete
                      // routes to the edge.
                      select(null);
                    }}
                  />
                  {/* Visible stroke */}
                  <path
                    d={edgePath(from, to)}
                    stroke={stroke}
                    strokeWidth={(isEdgeSelected ? 2.5 : 1.5) / viewport.scale}
                    fill="none"
                    markerEnd={`url(#tkx-flow-arrow-${id})`}
                    strokeOpacity={isEdgeSelected ? 1 : 0.8}
                    style={{
                      filter: isEdgeSelected ? `drop-shadow(0 0 4px ${stroke})` : 'none',
                      pointerEvents: 'none',
                    }}
                  />
                  {e.label && (
                    <text
                      x={(nodeAnchors(from).out[0] + nodeAnchors(to).in[0]) / 2}
                      y={(nodeAnchors(from).out[1] + nodeAnchors(to).in[1]) / 2 - 6}
                      textAnchor="middle"
                      fill={stroke}
                      fontSize={11 / viewport.scale}
                      fontFamily="ui-monospace, monospace"
                    >
                      {e.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Node layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform,
            transformOrigin: '0 0',
            pointerEvents: 'none',
          }}
        >
          {data.nodes.map((n) => {
            const isSelected = n.id === selected;
            const w = n.width ?? 160;
            const h = n.height ?? 60;
            const accent = n.color ?? 'var(--tkx-accent, #00f5d4)';
            return (
              <div
                key={n.id}
                role="button"
                aria-pressed={isSelected}
                tabIndex={-1}
                data-testid={`flow-node-${n.id}`}
                data-tkx-node-id={n.id}
                onPointerDown={(e) => onNodePointerDown(e, n)}
                onPointerMove={onNodePointerMove}
                onPointerUp={onNodePointerUp}
                onPointerCancel={onNodePointerUp}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  // Custom render swallows the double-click — only use
                  // inline-rename when the default text renderer is active.
                  if (!renderNode) {
                    select(n.id);
                    setEditingNodeId(n.id);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  select(n.id);
                  setContextMenu({ x: e.clientX, y: e.clientY, nodeId: n.id });
                }}
                style={{
                  position: 'absolute',
                  left: n.x,
                  top: n.y,
                  width: w,
                  height: h,
                  pointerEvents: 'auto',
                  borderRadius: 8,
                  background: isSelected ? `${accent}1f` : 'rgba(18, 20, 38, 0.9)',
                  border: `2px solid ${isSelected ? accent : 'rgba(255,255,255,0.12)'}`,
                  boxShadow: isSelected ? `0 0 0 3px ${accent}33` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 10px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--tkx-fg, #e8e8f4)',
                  textAlign: 'center',
                  cursor: 'grab',
                  userSelect: 'none',
                  touchAction: 'none',
                }}
              >
                {editingNodeId === n.id ? (
                  <input
                    autoFocus
                    data-testid={`flow-node-rename-${n.id}`}
                    defaultValue={n.label}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      const next = e.currentTarget.value.trim();
                      if (next && next !== n.label) {
                        onChange({
                          ...data,
                          nodes: data.nodes.map((x) => (x.id === n.id ? { ...x, label: next } : x)),
                        });
                      }
                      setEditingNodeId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                      else if (e.key === 'Escape') {
                        e.currentTarget.value = n.label;
                        setEditingNodeId(null);
                      }
                      e.stopPropagation();
                    }}
                    style={{
                      width: '100%',
                      padding: '4px 6px',
                      borderRadius: 4,
                      border: `1px solid ${accent}`,
                      background: 'rgba(8,10,25,0.95)',
                      color: '#fff',
                      textAlign: 'center',
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                ) : renderNode ? renderNode(n, isSelected) : n.label}
                {/* Input port (left) — visual only; this is the "drop target" */}
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: -6,
                    top: '50%',
                    width: 10,
                    height: 10,
                    transform: 'translateY(-50%)',
                    borderRadius: '50%',
                    background: accent,
                    boxShadow: `0 0 8px ${accent}88`,
                    pointerEvents: 'none',
                  }}
                />
                {/* Output port (right) — drag from here to create an edge.
                    Discoverable affordances: 22 × 22 hit target (vs 10px for
                    the static input port), glowing pulse on hover, "+" glyph
                    inside, and a `title` tooltip + aria-label for AT users. */}
                <button
                  type="button"
                  aria-label={`Connect from ${n.label} — drag to another node`}
                  title="Drag to connect to another node"
                  data-testid={`flow-port-${n.id}`}
                  onPointerDown={(e) => onPortPointerDown(e, n.id)}
                  onPointerMove={onPortPointerMove}
                  onPointerUp={onPortPointerUp}
                  onPointerCancel={onPortPointerUp}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.25)';
                    e.currentTarget.style.boxShadow = `0 0 18px ${accent}, 0 0 6px ${accent}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    e.currentTarget.style.boxShadow = `0 0 12px ${accent}aa`;
                  }}
                  style={{
                    position: 'absolute',
                    right: -11,
                    top: '50%',
                    width: 22,
                    height: 22,
                    transform: 'translateY(-50%)',
                    borderRadius: '50%',
                    background: accent,
                    boxShadow: `0 0 12px ${accent}aa`,
                    border: '2px solid rgba(8,10,25,0.95)',
                    cursor: 'crosshair',
                    padding: 0,
                    touchAction: 'none',
                    color: '#0a0a0f',
                    fontSize: 12,
                    fontWeight: 900,
                    fontFamily: 'inherit',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    zIndex: 2,
                  }}
                >
                  <span aria-hidden="true">+</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Zoom controls */}
        {showControls && (
          <div
            role="toolbar"
            aria-label="Flow chart controls"
            style={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              display: 'flex',
              gap: 4,
              padding: 4,
              borderRadius: 999,
              background: 'rgba(8, 10, 25, 0.7)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <CtrlButton
              label="Zoom out"
              onClick={() => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) zoomTo(viewport.scale * 0.8, rect.width / 2, rect.height / 2);
              }}
              testId="flow-zoom-out"
            >
              −
            </CtrlButton>
            <CtrlButton
              label="Reset zoom"
              onClick={fitToView}
              testId="flow-fit"
            >
              ⤢
            </CtrlButton>
            <CtrlButton
              label="Zoom in"
              onClick={() => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) zoomTo(viewport.scale * 1.25, rect.width / 2, rect.height / 2);
              }}
              testId="flow-zoom-in"
            >
              +
            </CtrlButton>
            <span
              data-testid="flow-zoom-readout"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 10px',
                color: '#aaa',
                fontSize: 11,
                fontFamily: 'ui-monospace, monospace',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {Math.round(viewport.scale * 100)}%
            </span>
            <CtrlButton
              label="Toggle inspector"
              onClick={() => setShowInspector((v) => !v)}
              testId="flow-toggle-inspector"
            >
              ☰
            </CtrlButton>
          </div>
        )}

        {/* Right-click context menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            containerEl={containerRef.current}
            onClose={() => setContextMenu(null)}
            actions={[
              {
                id: 'rename',
                label: 'Rename',
                icon: '✏️',
                run: () => { setEditingNodeId(contextMenu.nodeId); },
              },
              {
                id: 'duplicate',
                label: 'Duplicate',
                icon: '⎘',
                run: () => {
                  const src = data.nodes.find((n) => n.id === contextMenu.nodeId);
                  if (!src) return;
                  const newId = `${src.id}-copy-${Date.now().toString(36)}`;
                  onChange({
                    ...data,
                    nodes: [
                      ...data.nodes,
                      { ...src, id: newId, x: src.x + 20, y: src.y + 20 },
                    ],
                  });
                  select(newId);
                },
              },
              {
                id: 'bring-to-front',
                label: 'Bring to front',
                icon: '⬆',
                run: () => {
                  const idx = data.nodes.findIndex((n) => n.id === contextMenu.nodeId);
                  if (idx < 0) return;
                  const reordered = [
                    ...data.nodes.slice(0, idx),
                    ...data.nodes.slice(idx + 1),
                    data.nodes[idx],
                  ];
                  onChange({ ...data, nodes: reordered });
                },
              },
              {
                id: 'delete',
                label: 'Delete',
                icon: '🗑',
                danger: true,
                run: () => {
                  onChange({
                    nodes: data.nodes.filter((n) => n.id !== contextMenu.nodeId),
                    edges: data.edges.filter(
                      (ed) => ed.from !== contextMenu.nodeId && ed.to !== contextMenu.nodeId,
                    ),
                  });
                  if (selected === contextMenu.nodeId) select(null);
                },
              },
            ]}
          />
        )}

        {/* Properties inspector */}
        {showInspector && selected && (() => {
          const node = data.nodes.find((n) => n.id === selected);
          if (!node) return null;
          const accent = node.color ?? '#00f5d4';
          const w = node.width ?? 160;
          const h = node.height ?? 60;
          const patch = (next: Partial<FlowNode>) => {
            onChange({
              ...data,
              nodes: data.nodes.map((x) => (x.id === selected ? { ...x, ...next } : x)),
            });
          };
          return (
            <div
              role="region"
              aria-label="Node properties"
              data-testid="flow-inspector"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 220,
                padding: 12,
                borderRadius: 10,
                background: 'rgba(8, 10, 25, 0.92)',
                border: '1px solid rgba(196,168,255,0.3)',
                color: '#dcdce8',
                fontSize: 12,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
                zIndex: 5,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>
                Properties
              </div>
              <InspectorField label="Label">
                <input
                  data-testid="inspector-label"
                  value={node.label}
                  onChange={(e) => patch({ label: e.target.value })}
                  style={inspectorInputStyle}
                />
              </InspectorField>
              <InspectorField label="Color">
                <input
                  type="color"
                  data-testid="inspector-color"
                  value={hexFromColor(accent)}
                  onChange={(e) => patch({ color: e.target.value })}
                  style={{ ...inspectorInputStyle, padding: 0, height: 32 }}
                />
              </InspectorField>
              <InspectorField label={`Width (${w}px)`}>
                <input
                  type="range"
                  min={80} max={320}
                  value={w}
                  onChange={(e) => patch({ width: +e.target.value })}
                  style={{ width: '100%' }}
                />
              </InspectorField>
              <InspectorField label={`Height (${h}px)`}>
                <input
                  type="range"
                  min={40} max={200}
                  value={h}
                  onChange={(e) => patch({ height: +e.target.value })}
                  style={{ width: '100%' }}
                />
              </InspectorField>
            </div>
          );
        })()}
      </div>
    );
  },
);

// ── Inspector helpers ──────────────────────────────────────────────────────

function InspectorField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8, fontSize: 11, color: '#aaa' }}>
      {label}
      {children}
    </label>
  );
}

const inspectorInputStyle: CSSProperties = {
  padding: '6px 8px',
  minHeight: 30,
  borderRadius: 5,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(13, 13, 20, 0.6)',
  color: '#e8e8f4',
  fontSize: 12,
  fontFamily: 'inherit',
  width: '100%',
};

function hexFromColor(c: string): string {
  // Accept hex (with/without #), rgb(...), or named — fallback white.
  if (c.startsWith('#')) return c.length === 7 ? c : '#00f5d4';
  if (c.startsWith('rgb')) {
    const m = c.match(/\d+/g);
    if (!m || m.length < 3) return '#00f5d4';
    return '#' + m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('');
  }
  return '#00f5d4';
}

// ── Context menu ───────────────────────────────────────────────────────────

interface MenuAction {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
  run: () => void;
}

function ContextMenu({
  x, y, containerEl, actions, onClose,
}: {
  x: number;
  y: number;
  containerEl: HTMLDivElement | null;
  actions: MenuAction[];
  onClose: () => void;
}) {
  // Close on Esc + outside click
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.('[data-tkx-context-menu]')) onClose();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Convert screen coords to relative coords inside the FlowChart container
  const rect = containerEl?.getBoundingClientRect();
  const relX = rect ? x - rect.left : x;
  const relY = rect ? y - rect.top : y;

  return (
    <div
      role="menu"
      aria-label="Node actions"
      data-testid="flow-context-menu"
      data-tkx-context-menu=""
      style={{
        position: 'absolute',
        left: Math.max(4, Math.min(relX, (rect?.width ?? 600) - 180)),
        top: Math.max(4, Math.min(relY, (rect?.height ?? 400) - 200)),
        minWidth: 180,
        padding: 4,
        borderRadius: 8,
        background: 'rgba(8, 10, 25, 0.96)',
        border: '1px solid rgba(196,168,255,0.3)',
        color: '#dcdce8',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
        zIndex: 10,
      }}
    >
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          role="menuitem"
          data-testid={`flow-menu-${a.id}`}
          onClick={() => {
            a.run();
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '8px 12px',
            minHeight: 36,
            border: 'none',
            background: 'transparent',
            color: a.danger ? '#ff7eaf' : '#dcdce8',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'inherit',
            textAlign: 'left',
            borderRadius: 5,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(196,168,255,0.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span aria-hidden="true">{a.icon}</span>
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
}

function CtrlButton({
  children,
  label,
  onClick,
  testId,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      data-testid={testId}
      style={{
        width: 44,
        height: 44,
        minWidth: 44,
        minHeight: 44,
        borderRadius: 999,
        border: 'none',
        background: 'transparent',
        color: '#dcdce8',
        cursor: 'pointer',
        fontSize: 18,
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}
