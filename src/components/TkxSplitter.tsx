'use client';

import {
  forwardRef,
  useRef,
  useState,
  useImperativeHandle,
  Children,
  isValidElement,
  cloneElement,
  type ReactNode,
  type ReactElement,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useTheme } from '../themes';
import { cx } from '../engine/tkx';
import { useReducedMotion } from '../hooks';

// ─────────────────────────────────────────────────────────────────────────────
// TkxSplitter — resizable split panes (horizontal/vertical).
//
// Compose TkxSplitterPane children inside a TkxSplitter; each adjacent pair of
// panes gets a drag gutter between them (classic splitter: a gutter resizes
// only its two neighbours). Uncontrolled by default (pane `defaultSize`),
// fully controlled via the `sizes` prop.
//
// Accessibility follows the WAI-ARIA window-splitter pattern: every gutter is
// a focusable role="separator" whose aria-valuenow reflects the preceding
// pane's percentage; arrow keys move the divider, Home/End snap to min/max.
//
// SSR-safe: no window/document access at module scope — all pointer math is
// derived from getBoundingClientRect inside event handlers.
// ─────────────────────────────────────────────────────────────────────────────

export interface TkxSplitterPaneProps {
  /** Initial size as a percentage. Unspecified panes share the remainder equally. */
  defaultSize?: number;
  /** Minimum size in percent. Default 10. */
  minSize?: number;
  /** Maximum size in percent. */
  maxSize?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Private prop injected by TkxSplitter via cloneElement. */
interface PaneInjectedProps {
  __size?: number;
}

export interface TkxSplitterProps {
  /** 'horizontal' = panes side-by-side (default); 'vertical' = stacked. */
  direction?: 'horizontal' | 'vertical';
  /** Controlled sizes (percentages, one per pane). Omit for uncontrolled mode. */
  sizes?: number[];
  /** Fired continuously while a gutter is dragged (and on keyboard resize). */
  onResize?: (sizes: number[]) => void;
  /** Fired when a drag ends (pointer release) or after a keyboard resize. */
  onResizeEnd?: (sizes: number[]) => void;
  /** Gutter thickness in px. Default 6. */
  gutterSize?: number;
  /** Disable all resizing (drag + keyboard). */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

interface PaneMeta {
  defaultSize?: number;
  minSize: number;
  maxSize?: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

/**
 * Turn per-pane defaultSize declarations into a percentage array summing to
 * 100. Unspecified panes split whatever the specified ones leave over; if the
 * declared total over/undershoots 100 with no room left, everything is scaled
 * proportionally.
 */
function computeInitialSizes(metas: PaneMeta[]): number[] {
  const n = metas.length;
  if (n === 0) return [];
  const declared = metas.map((m) => m.defaultSize);
  const declaredSum = declared.reduce<number>((s, v) => s + (v ?? 0), 0);
  const unspecified = declared.filter((v) => v == null).length;

  let sizes: number[];
  if (unspecified > 0) {
    const remainder = Math.max(0, 100 - declaredSum);
    sizes = declared.map((v) => (v == null ? remainder / unspecified : v));
  } else {
    sizes = declared.map((v) => v ?? 0);
  }

  const total = sizes.reduce((s, v) => s + v, 0);
  if (total <= 0) return metas.map(() => 100 / n);
  return sizes.map((v) => (v * 100) / total);
}

/**
 * Move the boundary between pane `index` and pane `index + 1` by `deltaPct`
 * percentage points, clamped to both panes' min/max constraints. The pair's
 * combined size is preserved (classic splitter behaviour).
 */
function resizePair(
  sizes: number[],
  index: number,
  deltaPct: number,
  metas: PaneMeta[],
): number[] {
  const a = sizes[index];
  const b = sizes[index + 1];
  const mA = metas[index];
  const mB = metas[index + 1];
  if (a == null || b == null || !mA || !mB) return sizes;

  const total = a + b;
  let maxA = total - Math.min(mB.minSize, total);
  if (mA.maxSize != null) maxA = Math.min(maxA, mA.maxSize);
  let minA = Math.min(mA.minSize, total);
  if (mB.maxSize != null) minA = Math.max(minA, total - mB.maxSize);

  let newA = clamp(a + deltaPct, minA, maxA);
  newA = clamp(newA, 0, total); // guard over-constrained pairs

  const next = sizes.slice();
  next[index] = newA;
  next[index + 1] = total - newA;
  return next;
}

// ─── Gutter ──────────────────────────────────────────────────────────────────

interface GutterProps {
  horizontal: boolean;
  gutterSize: number;
  disabled: boolean;
  valueNow: number;
  valueMin: number;
  valueMax: number;
  label: string;
  onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>) => void;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onDoubleClick: () => void;
}

function Gutter({
  horizontal,
  gutterSize,
  disabled,
  valueNow,
  valueMin,
  valueMax,
  label,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onDoubleClick,
}: GutterProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const [focused, setFocused] = useState(false);

  const highlight = !disabled && (hovered || active || focused);

  return (
    <div
      role="separator"
      tabIndex={disabled ? -1 : 0}
      // A separator between side-by-side panes is a vertical bar, and vice versa.
      aria-orientation={horizontal ? 'vertical' : 'horizontal'}
      aria-valuenow={Math.round(valueNow)}
      aria-valuemin={Math.round(valueMin)}
      aria-valuemax={Math.round(valueMax)}
      aria-disabled={disabled || undefined}
      aria-label={label}
      onKeyDown={onKeyDown}
      onDoubleClick={disabled ? undefined : onDoubleClick}
      onPointerDown={(e) => {
        if (disabled) return;
        setActive(true);
        onPointerDown(e);
      }}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => {
        setActive(false);
        onPointerUp(e);
      }}
      onPointerCancel={(e) => {
        setActive(false);
        onPointerUp(e);
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        flex: `0 0 ${gutterSize}px`,
        alignSelf: 'stretch',
        backgroundColor: highlight ? theme.primary : theme.border,
        cursor: disabled ? 'default' : horizontal ? 'col-resize' : 'row-resize',
        touchAction: 'none',
        userSelect: 'none',
        outline: 'none',
        borderRadius: 2,
        boxShadow: focused && !disabled ? `0 0 0 2px ${theme.primary}55` : undefined,
        transition: reducedMotion ? 'none' : 'background-color 120ms ease',
      }}
    />
  );
}

// ─── TkxSplitterPane ─────────────────────────────────────────────────────────

export function TkxSplitterPane(props: TkxSplitterPaneProps) {
  const { className, style, children } = props;
  const size = (props as TkxSplitterPaneProps & PaneInjectedProps).__size;

  return (
    <div
      data-tkx-splitter-pane=""
      className={cx(className)}
      style={{
        // Percentage flex-basis so pane sizes are container-relative; when
        // rendered outside a TkxSplitter (no injected size) just fill space.
        flexGrow: size == null ? 1 : 0,
        flexShrink: 1,
        flexBasis: size == null ? 'auto' : `${size}%`,
        overflow: 'auto',
        minWidth: 0,
        minHeight: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

TkxSplitterPane.displayName = 'TkxSplitterPane';

// ─── TkxSplitter ─────────────────────────────────────────────────────────────

interface DragState {
  index: number;
  startPos: number;
  startSizes: number[];
  containerPx: number;
  moved: boolean;
  latest: number[];
}

const KEYBOARD_STEP = 2; // percent per arrow-key press

export const TkxSplitter = forwardRef<HTMLDivElement, TkxSplitterProps>(
  (
    {
      direction = 'horizontal',
      sizes: sizesProp,
      onResize,
      onResizeEnd,
      gutterSize = 6,
      disabled = false,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const horizontal = direction === 'horizontal';
    const isControlled = sizesProp !== undefined;

    const containerRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement, []);

    // Separate pane children from anything else. Non-pane children render
    // as-is; a bare or arbitrary-children mount must never throw.
    const childArray = Children.toArray(children);
    const panes = childArray.filter(
      (c): c is ReactElement<TkxSplitterPaneProps> =>
        isValidElement(c) && c.type === TkxSplitterPane,
    );

    const metas: PaneMeta[] = panes.map((p) => ({
      defaultSize: p.props.defaultSize,
      minSize: p.props.minSize ?? 10,
      maxSize: p.props.maxSize,
    }));

    const initialSizes = computeInitialSizes(metas);

    const [internalSizes, setInternalSizes] = useState<number[]>(initialSizes);
    // If the pane count changed since state was initialised, fall back to the
    // freshly computed initial sizes for this render.
    const uncontrolledSizes =
      internalSizes.length === panes.length ? internalSizes : initialSizes;

    const currentSizes = isControlled
      ? panes.map((_, i) => sizesProp?.[i] ?? initialSizes[i])
      : uncontrolledSizes;

    const currentSizesRef = useRef(currentSizes);
    currentSizesRef.current = currentSizes;

    const dragRef = useRef<DragState | null>(null);

    const commit = (next: number[], end: boolean) => {
      if (!isControlled) setInternalSizes(next);
      onResize?.(next);
      if (end) onResizeEnd?.(next);
    };

    // ── Keyboard (WAI-ARIA window-splitter) ─────────────────────────────────
    const handleKeyDown = (index: number, e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const sizes = currentSizesRef.current;
      const decKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
      const incKey = horizontal ? 'ArrowRight' : 'ArrowDown';

      let next: number[] | null = null;
      if (e.key === incKey) next = resizePair(sizes, index, KEYBOARD_STEP, metas);
      else if (e.key === decKey) next = resizePair(sizes, index, -KEYBOARD_STEP, metas);
      // Home/End snap the preceding pane to its min/max (resizePair clamps).
      else if (e.key === 'Home') next = resizePair(sizes, index, -100, metas);
      else if (e.key === 'End') next = resizePair(sizes, index, 100, metas);

      if (next) {
        e.preventDefault();
        commit(next, true);
      }
    };

    // ── Pointer drag (mouse + touch via Pointer Events) ─────────────────────
    const handlePointerDown = (index: number, e: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      dragRef.current = {
        index,
        startPos: horizontal ? e.clientX : e.clientY,
        startSizes: currentSizesRef.current,
        containerPx: horizontal ? rect.width : rect.height,
        moved: false,
        latest: currentSizesRef.current,
      };
      const target = e.currentTarget;
      if (typeof target.setPointerCapture === 'function') {
        try {
          target.setPointerCapture(e.pointerId);
        } catch {
          /* jsdom / detached element */
        }
      }
    };

    const handlePointerMove = (index: number, e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.index !== index || drag.containerPx <= 0) return;
      const pos = horizontal ? e.clientX : e.clientY;
      const deltaPct = ((pos - drag.startPos) / drag.containerPx) * 100;
      const next = resizePair(drag.startSizes, index, deltaPct, metas);
      drag.moved = true;
      drag.latest = next;
      commit(next, false);
    };

    const handlePointerUp = (index: number, e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.index !== index) return;
      dragRef.current = null;
      const target = e.currentTarget;
      if (typeof target.releasePointerCapture === 'function') {
        try {
          target.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
      }
      if (drag.moved) onResizeEnd?.(drag.latest);
    };

    // ── Double-click: reset the two adjacent panes to their initial sizes ───
    const handleDoubleClick = (index: number) => {
      if (disabled) return;
      const next = currentSizesRef.current.slice();
      if (initialSizes[index] == null || initialSizes[index + 1] == null) return;
      next[index] = initialSizes[index];
      next[index + 1] = initialSizes[index + 1];
      commit(next, true);
    };

    // ── Render: interleave gutters between consecutive panes ────────────────
    const output: ReactNode[] = [];
    let paneIndex = 0;
    if (panes.length < 2) {
      // 0 or 1 pane (or arbitrary children): nothing to split — render as-is.
      output.push(...childArray);
    } else {
      for (const child of childArray) {
        const isPane = isValidElement(child) && child.type === TkxSplitterPane;
        if (!isPane) {
          output.push(child);
          continue;
        }
        if (paneIndex > 0) {
          const gi = paneIndex - 1; // gutter between pane gi and pane gi+1
          const a = currentSizes[gi] ?? 0;
          const b = currentSizes[gi + 1] ?? 0;
          const mA = metas[gi];
          const valueMax = Math.min(
            mA.maxSize ?? 100,
            a + b - (metas[gi + 1]?.minSize ?? 0),
          );
          output.push(
            <Gutter
              key={`tkx-splitter-gutter-${gi}`}
              horizontal={horizontal}
              gutterSize={gutterSize}
              disabled={disabled}
              valueNow={a}
              valueMin={Math.min(mA.minSize, a + b)}
              valueMax={Math.max(valueMax, 0)}
              label={`Resize panes ${gi + 1} and ${gi + 2}`}
              onKeyDown={(e) => handleKeyDown(gi, e)}
              onPointerDown={(e) => handlePointerDown(gi, e)}
              onPointerMove={(e) => handlePointerMove(gi, e)}
              onPointerUp={(e) => handlePointerUp(gi, e)}
              onDoubleClick={() => handleDoubleClick(gi)}
            />,
          );
        }
        output.push(
          cloneElement(
            child as ReactElement<TkxSplitterPaneProps & PaneInjectedProps>,
            { __size: currentSizes[paneIndex] },
          ),
        );
        paneIndex += 1;
      }
    }

    return (
      <div
        ref={containerRef}
        data-tkx-splitter=""
        className={cx(className)}
        style={{
          display: 'flex',
          flexDirection: horizontal ? 'row' : 'column',
          alignItems: 'stretch',
          width: '100%',
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          ...style,
        }}
      >
        {output}
      </div>
    );
  },
);

TkxSplitter.displayName = 'TkxSplitter';
