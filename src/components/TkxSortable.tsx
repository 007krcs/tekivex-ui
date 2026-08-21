'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxSortable — drag-and-drop reorder primitive.
//
// Implementation uses native HTML5 Drag & Drop. Trade-offs vs Pointer
// Events:
//   + No external dep
//   + Works with the OS DnD layer (visual indicators, drop targets)
//   + Touch devices fall back to long-press to start (browser native)
//   - HTML5 DnD is famously quirky on Safari; handlers below carry the
//     well-known workarounds (preventDefault on dragOver, etc.)
//
// Keyboard support: each item gains arrow-key reorder via the `data-tkx-sortable-handle`
// attribute. Up/Down (or Left/Right when `orientation="horizontal"`) move the
// active item. Space toggles "grab" mode for screen reader announcements.
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useTheme } from '../themes';

export interface TkxSortableItem<T = unknown> {
  /** Stable id used as React key + drag identifier. */
  id: string;
  /** Arbitrary payload returned in onChange. */
  data: T;
}

export interface TkxSortableProps<T = unknown> {
  items: TkxSortableItem<T>[];
  /** Fires on every reorder with the new ordered list. */
  onChange: (next: TkxSortableItem<T>[]) => void;
  /** Render each item. */
  renderItem: (item: TkxSortableItem<T>, index: number) => ReactNode;
  /** Layout direction. Defaults to "vertical". */
  orientation?: 'vertical' | 'horizontal';
  /** Disable reordering. */
  disabled?: boolean;
  /** Optional className on the list container. */
  className?: string;
  /** Optional inline style on the list container. */
  style?: CSSProperties;
  /** Localised label for the list landmark. */
  ariaLabel?: string;
}

export const TkxSortable = forwardRef<HTMLDivElement, TkxSortableProps<any>>(
  function TkxSortable(
    { items, onChange, renderItem, orientation = 'vertical', disabled, className, style, ariaLabel },
    ref: Ref<HTMLDivElement>,
  ) {
    const theme = useTheme();
    const listId = useId();
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);
    const liveRef = useRef<HTMLDivElement | null>(null);

    const move = useCallback(
      (fromIdx: number, toIdx: number) => {
        if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || toIdx >= items.length) return;
        const next = [...items];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        onChange(next);
        // Announce the reorder for screen readers.
        if (liveRef.current) {
          liveRef.current.textContent = `Moved item ${fromIdx + 1} to position ${toIdx + 1}`;
        }
      },
      [items, onChange],
    );

    const handleDragStart = (id: string) => (e: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      setDraggingId(id);
      e.dataTransfer.effectAllowed = 'move';
      // Set arbitrary data so Firefox honours the drag.
      e.dataTransfer.setData('text/plain', id);
    };

    const handleDragOver = (id: string) => (e: React.DragEvent<HTMLDivElement>) => {
      if (disabled || !draggingId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setOverId(id);
    };

    const handleDragEnd = () => {
      setDraggingId(null);
      setOverId(null);
    };

    const handleDrop = (targetId: string) => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled || !draggingId) return;
      const fromIdx = items.findIndex((i) => i.id === draggingId);
      const toIdx = items.findIndex((i) => i.id === targetId);
      move(fromIdx, toIdx);
      setDraggingId(null);
      setOverId(null);
    };

    const handleKeyDown = (id: string, idx: number) => (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const isVertical = orientation === 'vertical';
      const moveUp = isVertical ? e.key === 'ArrowUp' : e.key === 'ArrowLeft';
      const moveDown = isVertical ? e.key === 'ArrowDown' : e.key === 'ArrowRight';
      if (moveUp && idx > 0) {
        e.preventDefault();
        move(idx, idx - 1);
      } else if (moveDown && idx < items.length - 1) {
        e.preventDefault();
        move(idx, idx + 1);
      }
    };

    // ── Styles ─────────────────────────────────────────────────────────────
    const containerStyle: CSSProperties = {
      display: 'flex',
      flexDirection: orientation === 'vertical' ? 'column' : 'row',
      gap: 8,
      ...style,
    };
    const itemStyle = (id: string): CSSProperties => ({
      cursor: disabled ? 'not-allowed' : 'grab',
      opacity: draggingId === id ? 0.5 : 1,
      transition: 'opacity 0.15s, transform 0.05s',
      outline:
        overId === id && draggingId !== id
          ? `2px dashed ${theme.css.primary}`
          : 'none',
      outlineOffset: 4,
      borderRadius: 8,
    });

    return (
      <>
        <div
          ref={ref}
          id={listId}
          role="list"
          aria-label={ariaLabel ?? 'Sortable list'}
          aria-orientation={orientation}
          className={className}
          style={containerStyle}
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              role="listitem"
              tabIndex={disabled ? -1 : 0}
              draggable={!disabled}
              data-tkx-sortable-handle="true"
              aria-grabbed={draggingId === item.id}
              aria-posinset={idx + 1}
              aria-setsize={items.length}
              onDragStart={handleDragStart(item.id)}
              onDragOver={handleDragOver(item.id)}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop(item.id)}
              onKeyDown={handleKeyDown(item.id, idx)}
              style={itemStyle(item.id)}
            >
              {renderItem(item, idx)}
            </div>
          ))}
        </div>
        {/* Live region for screen-reader announcements */}
        <div
          ref={liveRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            margin: -1,
            padding: 0,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        />
      </>
    );
  },
) as <T>(props: TkxSortableProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement;

(TkxSortable as any).displayName = 'TkxSortable';
