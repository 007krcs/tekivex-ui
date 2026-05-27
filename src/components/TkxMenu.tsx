'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type ReactNode,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';

// ── Types ──────────────────────────────────────────────────────────────────────

export type MenuPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end'
  | 'right-start'
  | 'left-start';

export interface MenuActionItem {
  type?: 'action';
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  description?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

export interface MenuCheckItem {
  type: 'check';
  id: string;
  label: string;
  checked: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

export interface MenuRadioGroup {
  type: 'radio-group';
  id: string;
  label?: string;
  value: string;
  options: { value: string; label: string; icon?: ReactNode }[];
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export interface MenuSeparator {
  type: 'separator';
  id: string;
  label?: string;
}

export interface MenuSubMenu {
  type: 'submenu';
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  items: MenuItem[];
}

export type MenuItem =
  | MenuActionItem
  | MenuCheckItem
  | MenuRadioGroup
  | MenuSeparator
  | MenuSubMenu;

export interface TkxMenuProps {
  trigger: ReactNode;
  items: MenuItem[];
  placement?: MenuPlacement;
  isDisabled?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
}

// ── Positioning ────────────────────────────────────────────────────────────────

interface PanelPosition {
  top: number;
  left: number;
  transformOrigin: string;
}

function calcMenuPosition(
  anchorRect: DOMRect,
  placement: MenuPlacement,
  menuWidth: number,
  menuHeight: number,
): PanelPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gap = 6;

  let top = 0;
  let left = 0;
  let transformOrigin = 'top left';

  switch (placement) {
    case 'bottom-start':
      top = anchorRect.bottom + gap;
      left = anchorRect.left;
      transformOrigin = 'top left';
      // flip up if no space below
      if (top + menuHeight > vh && anchorRect.top - gap - menuHeight > 0) {
        top = anchorRect.top - gap - menuHeight;
        transformOrigin = 'bottom left';
      }
      // push left if overflows right
      if (left + menuWidth > vw) left = Math.max(0, vw - menuWidth - 8);
      break;

    case 'bottom-end':
      top = anchorRect.bottom + gap;
      left = anchorRect.right - menuWidth;
      transformOrigin = 'top right';
      if (top + menuHeight > vh && anchorRect.top - gap - menuHeight > 0) {
        top = anchorRect.top - gap - menuHeight;
        transformOrigin = 'bottom right';
      }
      if (left < 0) left = 8;
      break;

    case 'top-start':
      top = anchorRect.top - gap - menuHeight;
      left = anchorRect.left;
      transformOrigin = 'bottom left';
      if (top < 0) {
        top = anchorRect.bottom + gap;
        transformOrigin = 'top left';
      }
      if (left + menuWidth > vw) left = Math.max(0, vw - menuWidth - 8);
      break;

    case 'top-end':
      top = anchorRect.top - gap - menuHeight;
      left = anchorRect.right - menuWidth;
      transformOrigin = 'bottom right';
      if (top < 0) {
        top = anchorRect.bottom + gap;
        transformOrigin = 'top right';
      }
      if (left < 0) left = 8;
      break;

    case 'right-start':
      top = anchorRect.top;
      left = anchorRect.right + gap;
      transformOrigin = 'top left';
      if (left + menuWidth > vw) {
        left = anchorRect.left - gap - menuWidth;
        transformOrigin = 'top right';
      }
      if (top + menuHeight > vh) top = Math.max(8, vh - menuHeight - 8);
      break;

    case 'left-start':
      top = anchorRect.top;
      left = anchorRect.left - gap - menuWidth;
      transformOrigin = 'top right';
      if (left < 0) {
        left = anchorRect.right + gap;
        transformOrigin = 'top left';
      }
      if (top + menuHeight > vh) top = Math.max(8, vh - menuHeight - 8);
      break;
  }

  return {
    top: top + window.scrollY,
    left: left + window.scrollX,
    transformOrigin,
  };
}

function calcSubmenuPosition(
  itemRect: DOMRect,
  menuWidth: number,
  menuHeight: number,
): PanelPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gap = 4;

  let left = itemRect.right + gap;
  let transformOrigin = 'top left';
  if (left + menuWidth > vw) {
    left = itemRect.left - gap - menuWidth;
    transformOrigin = 'top right';
  }

  let top = itemRect.top;
  if (top + menuHeight > vh) top = Math.max(8, vh - menuHeight - 8);

  return {
    top: top + window.scrollY,
    left: left + window.scrollX,
    transformOrigin,
  };
}

// ── Animation styles ───────────────────────────────────────────────────────────

const MENU_ANIMATION_IN = `
@keyframes tkxMenuIn {
  from { opacity: 0; transform: scale(0.94); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes tkxMenuInReduced {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@media (prefers-reduced-motion: no-preference) {
  .tkx-menu-panel {
    animation: tkxMenuIn 130ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tkx-menu-panel {
    animation: tkxMenuInReduced 100ms ease forwards;
  }
}
`;

// ── Shared panel styles ────────────────────────────────────────────────────────

function getPanelStyle(
  theme: ReturnType<typeof useTheme>,
  pos: PanelPosition,
): CSSProperties {
  return {
    position: 'absolute',
    top: pos.top,
    left: pos.left,
    zIndex: 9999,
    minWidth: 200,
    maxWidth: 320,
    backgroundColor: theme.surface,
    border: `1.5px solid ${theme.border}`,
    borderRadius: 10,
    boxShadow: '0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.14)',
    padding: '4px 0',
    transformOrigin: pos.transformOrigin,
    overflow: 'hidden',
  };
}

// ── Menu item row styles ───────────────────────────────────────────────────────

function useItemStyle(
  theme: ReturnType<typeof useTheme>,
  isActive: boolean,
  isDanger: boolean,
  isDisabled: boolean,
): CSSProperties {
  const baseColor = isDanger ? theme.danger : theme.text;
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 14px',
    fontSize: '14px',
    fontFamily: 'inherit',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    color: isDisabled
      ? theme.textMuted
      : isActive && isDanger
      ? theme.danger
      : isActive
      ? theme.text
      : baseColor,
    backgroundColor: isActive
      ? isDanger
        ? `${theme.danger}18`
        : `${theme.primary}18`
      : 'transparent',
    transition: 'background-color 80ms',
    opacity: isDisabled ? 0.5 : 1,
    outline: 'none',
  };
}

// ── Checkmark / radio icons ────────────────────────────────────────────────────

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function RadioDot({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" fill={color} />
      <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function ChevronRight({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

// ── Flatten items for keyboard nav (skipping separators and radio group headers) ──

type FlatItem =
  | { kind: 'action'; item: MenuActionItem; idx: number }
  | { kind: 'check'; item: MenuCheckItem; idx: number }
  | { kind: 'radio'; item: MenuRadioGroup; optionIdx: number; idx: number }
  | { kind: 'submenu'; item: MenuSubMenu; idx: number };

function flattenItems(items: MenuItem[]): FlatItem[] {
  const result: FlatItem[] = [];
  let counter = 0;
  for (const item of items) {
    if (item.type === 'separator') continue;
    if (item.type === 'radio-group') {
      for (let i = 0; i < item.options.length; i++) {
        result.push({ kind: 'radio', item, optionIdx: i, idx: counter++ });
      }
    } else if (item.type === 'check') {
      result.push({ kind: 'check', item, idx: counter++ });
    } else if (item.type === 'submenu') {
      result.push({ kind: 'submenu', item, idx: counter++ });
    } else {
      result.push({ kind: 'action', item: item as MenuActionItem, idx: counter++ });
    }
  }
  return result;
}

// ── MenuPanel ─────────────────────────────────────────────────────────────────
// Renders a single menu panel (root or submenu)

interface MenuPanelProps {
  items: MenuItem[];
  pos: PanelPosition;
  panelId: string;
  onClose: () => void;
  onCloseAll: () => void;
  isSubmenu?: boolean;
}

function MenuPanel({
  items,
  pos,
  panelId,
  onClose,
  onCloseAll,
  isSubmenu = false,
}: MenuPanelProps) {
  const theme = useTheme();
  const [activeIdx, setActiveIdx] = useState(-1);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const [submenuPos, setSubmenuPos] = useState<PanelPosition | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [typeahead, setTypeahead] = useState('');
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flat = flattenItems(items);

  // Focus panel on mount
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // Scroll active into view
  useEffect(() => {
    if (activeIdx < 0) return;
    const el = panelRef.current?.querySelector(
      `[data-midx="${activeIdx}"]`,
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const activateItem = useCallback(
    (fi: FlatItem) => {
      if (fi.kind === 'action') {
        if (fi.item.disabled) return;
        fi.item.onClick?.();
        onCloseAll();
      } else if (fi.kind === 'check') {
        if (fi.item.disabled) return;
        fi.item.onChange?.(!fi.item.checked);
      } else if (fi.kind === 'radio') {
        if (fi.item.disabled) return;
        fi.item.onChange?.(fi.item.options[fi.optionIdx].value);
      } else if (fi.kind === 'submenu') {
        if (fi.item.disabled) return;
        // Resolve the menuitem element via data-midx so we can compute the
        // submenu position. Without this, openSubmenuId is set but submenuPos
        // remains null and the panel renders empty.
        const el = panelRef.current?.querySelector<HTMLElement>(
          `[data-midx="${fi.idx}"]`,
        );
        if (el) openSubmenu(fi.item, el);
        else setOpenSubmenuId(fi.item.id);
      }
    },
    [onCloseAll],
  );

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIdx((i) => {
          const next = i + 1;
          return next < flat.length ? next : 0;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIdx((i) => {
          const prev = i - 1;
          return prev >= 0 ? prev : flat.length - 1;
        });
        break;
      case 'Home':
        e.preventDefault();
        setActiveIdx(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIdx(flat.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIdx >= 0 && flat[activeIdx]) activateItem(flat[activeIdx]);
        break;
      case 'Escape':
        e.preventDefault();
        if (isSubmenu) onClose();
        else onCloseAll();
        break;
      case 'Tab':
        e.preventDefault();
        onCloseAll();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (activeIdx >= 0 && flat[activeIdx]?.kind === 'submenu') {
          const subFlat = flat[activeIdx] as { kind: 'submenu'; item: MenuSubMenu; idx: number };
          const el = panelRef.current?.querySelector<HTMLElement>(
            `[data-midx="${subFlat.idx}"]`,
          );
          if (el) openSubmenu(subFlat.item, el);
          else setOpenSubmenuId(subFlat.item.id);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (isSubmenu) onClose();
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          handleTypeahead(e.key);
        }
    }
  };

  function handleTypeahead(char: string) {
    if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
    const next = typeahead + char.toLowerCase();
    setTypeahead(next);

    const idx = flat.findIndex((fi) => {
      const label =
        fi.kind === 'radio'
          ? fi.item.options[fi.optionIdx].label
          : fi.item.label;
      return label.toLowerCase().startsWith(next);
    });
    if (idx >= 0) setActiveIdx(idx);
    typeaheadTimer.current = setTimeout(() => setTypeahead(''), 800);
  }

  function openSubmenu(submenuItem: MenuSubMenu, itemEl: HTMLElement) {
    const rect = itemEl.getBoundingClientRect();
    setOpenSubmenuId(submenuItem.id);
    // estimate submenu height from items (52px per item approx)
    const estimatedH = Math.min(submenuItem.items.length * 38 + 12, 360);
    setSubmenuPos(calcSubmenuPosition(rect, 220, estimatedH));
  }

  function closeSubmenu() {
    setOpenSubmenuId(null);
    setSubmenuPos(null);
  }

  const renderItems = () => {
    let flatCounter = -1;

    return items.map((item) => {
      if (item.type === 'separator') {
        return (
          <div
            key={item.id}
            role="separator"
            style={{
              margin: item.label ? '4px 0' : '4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {item.label ? (
              <>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: theme.border,
                    marginLeft: 14,
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: theme.textMuted,
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sanitizeString(item.label)}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: theme.border,
                    marginRight: 14,
                  }}
                />
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: theme.border,
                  margin: '0 10px',
                }}
              />
            )}
          </div>
        );
      }

      if (item.type === 'radio-group') {
        return (
          <div key={item.id} role="group" aria-label={item.label}>
            {item.label && (
              <div
                style={{
                  padding: '6px 14px 2px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: theme.textMuted,
                  fontFamily: 'inherit',
                }}
                aria-hidden="true"
              >
                {sanitizeString(item.label)}
              </div>
            )}
            {item.options.map((opt, optionIdx) => {
              flatCounter++;
              const myFlatIdx = flatCounter;
              const isActive = myFlatIdx === activeIdx;
              const isSelected = opt.value === item.value;
              const isDisabled = !!item.disabled;
              const itemStyle = useItemStyleStatic(theme, isActive, false, isDisabled);

              return (
                <div
                  key={opt.value}
                  role="menuitemradio"
                  aria-checked={isSelected}
                  aria-disabled={isDisabled || undefined}
                  data-midx={myFlatIdx}
                  tabIndex={-1}
                  style={itemStyle}
                  onClick={() => !isDisabled && item.onChange?.(opt.value)}
                  onMouseEnter={() => !isDisabled && setActiveIdx(myFlatIdx)}
                >
                  <span style={{ width: 16, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    {isSelected ? (
                      <RadioDot color={theme.primary} />
                    ) : (
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          border: `2px solid ${theme.border}`,
                          display: 'inline-block',
                        }}
                      />
                    )}
                  </span>
                  {opt.icon && (
                    <span style={{ flexShrink: 0, display: 'flex', color: theme.textMuted }}>
                      {opt.icon}
                    </span>
                  )}
                  <span
                    style={{
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {sanitizeString(opt.label)}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }

      if (item.type === 'check') {
        flatCounter++;
        const myFlatIdx = flatCounter;
        const isActive = myFlatIdx === activeIdx;
        const isDisabled = !!item.disabled;
        const itemStyle = useItemStyleStatic(theme, isActive, false, isDisabled);

        return (
          <div
            key={item.id}
            role="menuitemcheckbox"
            aria-checked={item.checked}
            aria-disabled={isDisabled || undefined}
            data-midx={myFlatIdx}
            tabIndex={-1}
            style={itemStyle}
            onClick={() => !isDisabled && item.onChange?.(!item.checked)}
            onMouseEnter={() => !isDisabled && setActiveIdx(myFlatIdx)}
          >
            <span style={{ width: 16, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              {item.checked ? (
                <CheckIcon color={theme.primary} />
              ) : (
                <span style={{ width: 14, height: 14, display: 'inline-block' }} />
              )}
            </span>
            {item.icon && (
              <span style={{ flexShrink: 0, display: 'flex', color: theme.textMuted }}>
                {item.icon}
              </span>
            )}
            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {sanitizeString(item.label)}
            </span>
          </div>
        );
      }

      if (item.type === 'submenu') {
        flatCounter++;
        const myFlatIdx = flatCounter;
        const isActive = myFlatIdx === activeIdx;
        const isDisabled = !!item.disabled;
        const isSubmenuOpen = openSubmenuId === item.id;
        const itemStyle = useItemStyleStatic(theme, isActive || isSubmenuOpen, false, isDisabled);

        return (
          <div key={item.id} style={{ position: 'relative' }}>
            <div
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={isSubmenuOpen}
              aria-disabled={isDisabled || undefined}
              data-midx={myFlatIdx}
              tabIndex={-1}
              style={itemStyle}
              onMouseEnter={(e) => {
                if (!isDisabled) {
                  setActiveIdx(myFlatIdx);
                  openSubmenu(item, e.currentTarget as HTMLElement);
                }
              }}
              onMouseLeave={() => {
                // keep submenu open while mouse is on it
              }}
              onClick={(e) => {
                if (isDisabled) return;
                // Both openSubmenuId AND submenuPos are required for the
                // panel to render — call openSubmenu() to set both.
                if (isSubmenuOpen) closeSubmenu();
                else openSubmenu(item, e.currentTarget as HTMLElement);
              }}
            >
              <span style={{ width: 16, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {item.icon ? (
                  <span style={{ display: 'flex', color: theme.textMuted }}>{item.icon}</span>
                ) : (
                  <span style={{ width: 14 }} />
                )}
              </span>
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {sanitizeString(item.label)}
              </span>
              <ChevronRight color={theme.textMuted} />
            </div>

            {isSubmenuOpen && submenuPos &&
              createPortal(
                <MenuPanel
                  items={item.items}
                  pos={submenuPos}
                  panelId={`${panelId}-sub-${item.id}`}
                  onClose={closeSubmenu}
                  onCloseAll={onCloseAll}
                  isSubmenu
                />,
                document.body,
              )}
          </div>
        );
      }

      // action (default)
      const actionItem = item as MenuActionItem;
      flatCounter++;
      const myFlatIdx = flatCounter;
      const isActive = myFlatIdx === activeIdx;
      const isDisabled = !!actionItem.disabled;
      const isDanger = !!actionItem.danger;
      const itemStyle = useItemStyleStatic(theme, isActive, isDanger, isDisabled);

      return (
        <div
          key={actionItem.id}
          role="menuitem"
          aria-disabled={isDisabled || undefined}
          data-midx={myFlatIdx}
          tabIndex={-1}
          style={itemStyle}
          onClick={() => {
            if (isDisabled) return;
            actionItem.onClick?.();
            onCloseAll();
          }}
          onMouseEnter={() => {
            if (!isDisabled) {
              setActiveIdx(myFlatIdx);
              closeSubmenu();
            }
          }}
        >
          <span style={{ width: 16, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            {actionItem.icon ? (
              <span style={{ display: 'flex', color: isDanger ? theme.danger : theme.textMuted }}>
                {actionItem.icon}
              </span>
            ) : (
              <span style={{ width: 14 }} />
            )}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {sanitizeString(actionItem.label)}
            </span>
            {actionItem.description && (
              <span
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: theme.textMuted,
                  marginTop: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {sanitizeString(actionItem.description)}
              </span>
            )}
          </span>
          {actionItem.shortcut && (
            <span
              style={{
                fontSize: '12px',
                color: theme.textMuted,
                fontFamily: 'inherit',
                flexShrink: 0,
                marginLeft: 16,
                opacity: 0.8,
              }}
            >
              {sanitizeString(actionItem.shortcut)}
            </span>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <style>{MENU_ANIMATION_IN}</style>
      <div
        ref={panelRef}
        id={panelId}
        role="menu"
        tabIndex={-1}
        className="tkx-menu-panel"
        onKeyDown={handleKeyDown}
        style={{
          ...getPanelStyle(theme, pos),
          maxHeight: 400,
          overflowY: 'auto',
        }}
      >
        {renderItems()}
      </div>
    </>
  );
}

// Static version of item style (not a hook) for use inside render functions
function useItemStyleStatic(
  theme: ReturnType<typeof useTheme>,
  isActive: boolean,
  isDanger: boolean,
  isDisabled: boolean,
): CSSProperties {
  const baseColor = isDanger ? theme.danger : theme.text;
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 14px',
    fontSize: '14px',
    fontFamily: 'inherit',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    color: isDisabled
      ? theme.textMuted
      : isActive && isDanger
      ? theme.danger
      : baseColor,
    backgroundColor: isActive
      ? isDanger
        ? `${theme.danger}18`
        : `${theme.primary}18`
      : 'transparent',
    transition: 'background-color 80ms',
    opacity: isDisabled ? 0.5 : 1,
    outline: 'none',
  };
}

// suppress unused warning — useItemStyle is defined for external consumers
void useItemStyle;

// ── TkxMenu ────────────────────────────────────────────────────────────────────

export function TkxMenu({
  trigger,
  items,
  placement = 'bottom-start',
  isDisabled = false,
  onOpen,
  onClose,
  className,
  style,
}: TkxMenuProps) {
  const autoId = useId();
  const menuId = `tkx-menu-${autoId.replace(/:/g, '')}`;

  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<PanelPosition | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const openMenu = useCallback(() => {
    if (isDisabled) return;
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // estimate height — will reflow, but good enough for initial position
    const estimatedH = Math.min(items.length * 38 + 12, 360);
    setMenuPos(calcMenuPosition(rect, placement, 220, estimatedH));
    setIsOpen(true);
    onOpen?.();
  }, [isDisabled, items.length, onOpen, placement]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    onClose?.();
    // return focus to trigger
    (triggerRef.current?.firstElementChild as HTMLElement | null)?.focus?.();
  }, [onClose]);

  // Outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      // clicks inside portal menus won't be inside triggerRef
      // we handle those via onClose propagation in MenuPanel
      // A click outside any menu panel should close
      const allPanels = document.querySelectorAll('.tkx-menu-panel');
      for (const panel of allPanels) {
        if (panel.contains(target)) return;
      }
      closeMenu();
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [isOpen, closeMenu]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const estimatedH = Math.min(items.length * 38 + 12, 360);
      setMenuPos(calcMenuPosition(rect, placement, 220, estimatedH));
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, items.length, placement]);

  const handleTriggerKeyDown = (e: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) openMenu();
    }
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      closeMenu();
    }
  };

  return (
    <span
      ref={triggerRef}
      className={className}
      style={{ display: 'inline-flex', ...style }}
    >
      <span
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-disabled={isDisabled || undefined}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        style={{
          display: 'inline-flex',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.55 : 1,
          outline: 'none',
        }}
      >
        {trigger}
      </span>

      {isOpen && menuPos &&
        createPortal(
          <MenuPanel
            items={items}
            pos={menuPos}
            panelId={menuId}
            onClose={closeMenu}
            onCloseAll={closeMenu}
          />,
          document.body,
        )}
    </span>
  );
}

TkxMenu.displayName = 'TkxMenu';