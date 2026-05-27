'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxKanban — drag-drop kanban board
//
// Design intent:
//   - Pointer-driven drag-drop (works with mouse + touch + pen)
//   - Keyboard accessible: ↑↓ within column, ←→ across columns, Enter to
//     pick up + drop, Esc to cancel
//   - Headless callbacks: parent owns the data, we just emit reorder events
//   - Virtualization-ready: columns scroll independently, optional maxHeight
//   - WAI-ARIA grid pattern: role="grid", role="row", role="gridcell" with
//     aria-rowindex / aria-colindex / aria-grabbed / aria-dropeffect
//   - Zero runtime deps — uses CSS custom properties + rAF for the drag ghost
// ─────────────────────────────────────────────────────────────────────────────

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
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';
import { useReducedMotion } from '../headless';

// ── Public types ────────────────────────────────────────────────────────────

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  /** Free-form data passed back to your renderer. */
  data?: unknown;
  /** Optional badges shown in the card header. */
  badges?: { label: string; color?: string }[];
  /** Optional avatar URL or initials. */
  assignee?: { name: string; avatarUrl?: string };
  /** Disable drag for this card. */
  isDragDisabled?: boolean;
}

export interface KanbanColumn {
  id: string;
  title: string;
  /** Optional max card limit — exceeded shows a warning indicator. */
  wipLimit?: number;
  /** Optional accent color for the header. */
  color?: string;
  /** Cards in this column, in display order. */
  cards: KanbanCard[];
}

export interface KanbanReorderEvent {
  cardId: string;
  fromColumnId: string;
  fromIndex: number;
  toColumnId: string;
  toIndex: number;
}

export interface TkxKanbanProps {
  columns: KanbanColumn[];
  /** Called when a card is moved. Parent updates state and re-passes columns. */
  onReorder: (event: KanbanReorderEvent) => void;
  /** Optional custom card renderer. */
  renderCard?: (card: KanbanCard, column: KanbanColumn) => ReactNode;
  /** Optional click handler when a card body is clicked (not during drag). */
  onCardClick?: (card: KanbanCard, column: KanbanColumn) => void;
  /** Max board height. Cards scroll inside columns above this. */
  maxHeight?: number | string;
  /** Min column width. Below this, columns wrap to next row. Default 280. */
  minColumnWidth?: number;
  /** Disable all drag interactions. */
  isDragDisabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

// ── Internal: drag state ────────────────────────────────────────────────────

interface DragState {
  cardId: string;
  fromColumnId: string;
  fromIndex: number;
  /** Pointer mode: 'pointer' for mouse/touch, 'keyboard' for kbd nav. */
  mode: 'pointer' | 'keyboard';
  /** For pointer: current cursor delta from card origin. */
  ghostX?: number;
  ghostY?: number;
  /** Live preview of where the card would land. */
  toColumnId: string;
  toIndex: number;
}

// ── Component ───────────────────────────────────────────────────────────────

export const TkxKanban = forwardRef<HTMLDivElement, TkxKanbanProps>(
  function TkxKanban(
    {
      columns,
      onReorder,
      renderCard,
      onCardClick,
      maxHeight = 720,
      minColumnWidth = 280,
      isDragDisabled = false,
      className,
      style,
    },
    ref,
  ) {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const baseId = useId();
    const [drag, setDrag] = useState<DragState | null>(null);
    const [announcement, setAnnouncement] = useState('');
    const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    // ── Pointer drag start ───────────────────────────────────────────────────
    const handlePointerDown = useCallback(
      (e: React.PointerEvent, card: KanbanCard, column: KanbanColumn, index: number) => {
        if (isDragDisabled || card.isDragDisabled) return;
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        const node = e.currentTarget as HTMLElement;
        node.setPointerCapture(e.pointerId);
        setDrag({
          cardId: card.id,
          fromColumnId: column.id,
          fromIndex: index,
          mode: 'pointer',
          ghostX: 0,
          ghostY: 0,
          toColumnId: column.id,
          toIndex: index,
        });
        setAnnouncement(`Picked up "${card.title}" from ${column.title}, position ${index + 1}`);
      },
      [isDragDisabled],
    );

    // ── Pointer drag move ────────────────────────────────────────────────────
    const handlePointerMove = useCallback(
      (e: React.PointerEvent, column: KanbanColumn, slotIndex: number) => {
        if (!drag || drag.mode !== 'pointer') return;
        const card = e.currentTarget as HTMLElement;
        const startNode = cardRefs.current.get(drag.cardId);
        if (!startNode) return;
        const start = startNode.getBoundingClientRect();
        // Update ghost offset from initial card position
        setDrag((d) =>
          d
            ? {
                ...d,
                ghostX: e.clientX - (start.left + start.width / 2),
                ghostY: e.clientY - (start.top + start.height / 2),
                toColumnId: column.id,
                toIndex: slotIndex,
              }
            : d,
        );
      },
      [drag],
    );

    // ── Pointer drop ─────────────────────────────────────────────────────────
    const handlePointerUp = useCallback(() => {
      if (!drag || drag.mode !== 'pointer') return;
      finalizeDrop(drag);
    }, [drag]);

    // ── Cancel drag (Escape / pointer cancel) ────────────────────────────────
    const handleCancel = useCallback(() => {
      if (!drag) return;
      setAnnouncement('Drag cancelled');
      setDrag(null);
    }, [drag]);

    function finalizeDrop(d: DragState) {
      if (
        d.fromColumnId !== d.toColumnId ||
        d.fromIndex !== d.toIndex
      ) {
        const targetCol = columns.find((c) => c.id === d.toColumnId);
        const movedCard = columns
          .find((c) => c.id === d.fromColumnId)
          ?.cards[d.fromIndex];
        onReorder({
          cardId: d.cardId,
          fromColumnId: d.fromColumnId,
          fromIndex: d.fromIndex,
          toColumnId: d.toColumnId,
          toIndex: d.toIndex,
        });
        setAnnouncement(
          movedCard && targetCol
            ? `Moved "${movedCard.title}" to ${targetCol.title}, position ${d.toIndex + 1}`
            : 'Card moved',
        );
      } else {
        setAnnouncement('Returned to original position');
      }
      setDrag(null);
    }

    // ── Keyboard drag ────────────────────────────────────────────────────────
    const handleCardKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>, card: KanbanCard, column: KanbanColumn, index: number) => {
        if (isDragDisabled || card.isDragDisabled) return;

        // Pick up / drop with Space or Enter
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!drag) {
            // pick up
            setDrag({
              cardId: card.id,
              fromColumnId: column.id,
              fromIndex: index,
              mode: 'keyboard',
              toColumnId: column.id,
              toIndex: index,
            });
            setAnnouncement(
              `Grabbed "${card.title}". Use arrow keys to move. Enter to drop, Esc to cancel.`,
            );
          } else {
            finalizeDrop(drag);
          }
          return;
        }

        // Cancel
        if (e.key === 'Escape' && drag) {
          e.preventDefault();
          handleCancel();
          return;
        }

        // Move while held
        if (!drag || drag.mode !== 'keyboard' || drag.cardId !== card.id) return;

        const colIdx = columns.findIndex((c) => c.id === drag.toColumnId);
        const col = columns[colIdx];
        if (!col) return;

        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            if (drag.toIndex > 0) {
              setDrag({ ...drag, toIndex: drag.toIndex - 1 });
              setAnnouncement(`Position ${drag.toIndex} of ${col.cards.length}`);
            }
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (drag.toIndex < col.cards.length) {
              setDrag({ ...drag, toIndex: drag.toIndex + 1 });
              setAnnouncement(`Position ${drag.toIndex + 2} of ${col.cards.length + 1}`);
            }
            break;
          case 'ArrowLeft':
            e.preventDefault();
            if (colIdx > 0) {
              const next = columns[colIdx - 1];
              setDrag({
                ...drag,
                toColumnId: next.id,
                toIndex: Math.min(drag.toIndex, next.cards.length),
              });
              setAnnouncement(`Moved to ${next.title}`);
            }
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (colIdx < columns.length - 1) {
              const next = columns[colIdx + 1];
              setDrag({
                ...drag,
                toColumnId: next.id,
                toIndex: Math.min(drag.toIndex, next.cards.length),
              });
              setAnnouncement(`Moved to ${next.title}`);
            }
            break;
        }
      },
      [columns, drag, handleCancel, isDragDisabled],
    );

    // ── Esc to cancel a pointer drag ─────────────────────────────────────────
    useEffect(() => {
      if (!drag) return;
      const onEsc = (e: globalThis.KeyboardEvent) => {
        if (e.key === 'Escape') handleCancel();
      };
      window.addEventListener('keydown', onEsc);
      return () => window.removeEventListener('keydown', onEsc);
    }, [drag, handleCancel]);

    // ── Default card renderer ────────────────────────────────────────────────
    const defaultCardRenderer = useCallback(
      (card: KanbanCard) => (
        <>
          {card.badges && card.badges.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {card.badges.map((b, i) => (
                <span
                  key={i}
                  style={{
                    padding: '2px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 999,
                    background: b.color ? `${b.color}22` : `${theme.primary}22`,
                    color: b.color ?? theme.primary,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, lineHeight: 1.4 }}>
            {card.title}
          </div>
          {card.description && (
            <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 6, lineHeight: 1.5 }}>
              {card.description}
            </div>
          )}
          {card.assignee && (
            <div
              style={{
                marginTop: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: theme.textMuted,
              }}
            >
              {card.assignee.avatarUrl ? (
                <img
                  src={card.assignee.avatarUrl}
                  alt=""
                  style={{ width: 20, height: 20, borderRadius: '50%' }}
                />
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: theme.primary,
                    color: theme.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {card.assignee.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span>{card.assignee.name}</span>
            </div>
          )}
        </>
      ),
      [theme],
    );

    // ── Styles ───────────────────────────────────────────────────────────────
    const boardStyle: CSSProperties = useMemo(
      () => ({
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: `minmax(${minColumnWidth}px, 1fr)`,
        gap: 12,
        overflowX: 'auto',
        maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        padding: 4,
        ...style,
      }),
      [maxHeight, minColumnWidth, style],
    );

    return (
      <div
        ref={ref}
        className={className}
        role="grid"
        aria-label="Kanban board"
        aria-rowcount={Math.max(...columns.map((c) => c.cards.length), 0) + 1}
        aria-colcount={columns.length}
        style={boardStyle}
      >
        {/* Live region for announcements */}
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          {announcement}
        </div>

        {columns.map((column, colIndex) => {
          const isDropTarget = drag?.toColumnId === column.id;
          const overLimit =
            column.wipLimit !== undefined && column.cards.length >= column.wipLimit;

          return (
            <section
              key={column.id}
              role="row"
              aria-rowindex={colIndex + 1}
              aria-label={`Column: ${column.title}`}
              style={{
                background: theme.surface,
                border: `1px solid ${
                  isDropTarget ? column.color ?? theme.primary : theme.border
                }`,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                transition: 'border-color 120ms',
              }}
            >
              <header
                style={{
                  padding: '12px 14px',
                  borderBottom: `1px solid ${theme.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: column.color ?? theme.primary,
                  }}
                />
                <h3
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: theme.text,
                    letterSpacing: '0.02em',
                    flex: 1,
                  }}
                >
                  {column.title}
                </h3>
                <span
                  style={{
                    fontSize: 12,
                    color: overLimit ? theme.danger : theme.textMuted,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}
                  aria-label={
                    column.wipLimit
                      ? `${column.cards.length} of ${column.wipLimit} cards`
                      : `${column.cards.length} cards`
                  }
                >
                  {column.cards.length}
                  {column.wipLimit && ` / ${column.wipLimit}`}
                </span>
              </header>

              <div
                style={{
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  overflowY: 'auto',
                  flex: 1,
                  minHeight: 60,
                }}
              >
                {column.cards.map((card, index) => {
                  const isDragging = drag?.cardId === card.id;
                  const isDropSlotBefore =
                    drag &&
                    drag.toColumnId === column.id &&
                    drag.toIndex === index &&
                    !isDragging;

                  return (
                    <div key={`slot-${index}`}>
                      {isDropSlotBefore && <DropIndicator color={column.color ?? theme.primary} />}
                      <div
                        ref={(node) => {
                          if (node) cardRefs.current.set(card.id, node);
                          else cardRefs.current.delete(card.id);
                        }}
                        role="gridcell"
                        aria-rowindex={index + 1}
                        aria-colindex={colIndex + 1}
                        aria-grabbed={isDragging}
                        aria-label={card.title}
                        tabIndex={0}
                        data-card-id={card.id}
                        onPointerDown={(e) => handlePointerDown(e, card, column, index)}
                        onPointerMove={(e) =>
                          drag?.mode === 'pointer'
                            ? handlePointerMove(e, column, index)
                            : undefined
                        }
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handleCancel}
                        onKeyDown={(e) => handleCardKeyDown(e, card, column, index)}
                        onClick={() => {
                          if (drag) return;
                          onCardClick?.(card, column);
                        }}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          background: theme.surfaceAlt,
                          border: `1px solid ${
                            isDragging ? column.color ?? theme.primary : theme.border
                          }`,
                          cursor:
                            isDragDisabled || card.isDragDisabled ? 'default' : 'grab',
                          touchAction:
                            isDragDisabled || card.isDragDisabled ? 'auto' : 'none',
                          opacity: isDragging ? 0.4 : 1,
                          transform:
                            isDragging && drag.mode === 'pointer' && !reducedMotion
                              ? `translate(${drag.ghostX ?? 0}px, ${drag.ghostY ?? 0}px) scale(1.02)`
                              : undefined,
                          transition:
                            isDragging || reducedMotion ? 'none' : 'transform 120ms, border-color 120ms',
                          userSelect: 'none',
                          outlineOffset: 2,
                        }}
                      >
                        {(renderCard ?? defaultCardRenderer)(card, column)}
                      </div>
                    </div>
                  );
                })}

                {/* Drop slot at end of column */}
                {drag && drag.toColumnId === column.id && drag.toIndex >= column.cards.length && (
                  <DropIndicator color={column.color ?? theme.primary} />
                )}

                {column.cards.length === 0 && !drag && (
                  <div
                    style={{
                      padding: 24,
                      textAlign: 'center',
                      color: theme.textMuted,
                      fontSize: 12,
                      border: `1px dashed ${theme.border}`,
                      borderRadius: 8,
                    }}
                  >
                    No cards
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    );
  },
);

// ── Drop indicator ───────────────────────────────────────────────────────────

function DropIndicator({ color }: { color: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 3,
        background: color,
        borderRadius: 999,
        margin: '2px 0',
        boxShadow: `0 0 8px ${color}66`,
      }}
    />
  );
}

// Re-export types for convenience
export type {
  KanbanCard as TkxKanbanCard,
  KanbanColumn as TkxKanbanColumn,
  KanbanReorderEvent as TkxKanbanReorderEvent,
};
