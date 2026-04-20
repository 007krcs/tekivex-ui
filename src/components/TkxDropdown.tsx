'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type ReactNode,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DropdownItem {
  key: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
  danger?: boolean;
  shortcut?: string;
  divider?: boolean;
  children?: DropdownItem[];
  badge?: string | number;
}

export interface DropdownGroup {
  label?: string;
  items: DropdownItem[];
}

export type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right' | 'left';

export interface TkxDropdownProps {
  trigger: ReactNode;
  items?: DropdownItem[];
  groups?: DropdownGroup[];
  placement?: DropdownPlacement;
  onSelect?: (key: string, item: DropdownItem) => void;
  selectedKeys?: string[];
  multiSelect?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  closeOnSelect?: boolean;
  disabled?: boolean;
  maxHeight?: number;
  minWidth?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  portal?: boolean;
  offset?: number;
  renderItem?: (item: DropdownItem, selected: boolean) => ReactNode;
}

// ── Positioning helpers ────────────────────────────────────────────────────────

interface MenuPosition {
  top: number;
  left: number;
  minWidth: number;
}

function calcPosition(
  triggerEl: HTMLElement,
  menuEl: HTMLElement | null,
  placement: DropdownPlacement,
  offset: number,
): MenuPosition {
  const tr = triggerEl.getBoundingClientRect();
  const mh = menuEl ? menuEl.offsetHeight : 320;
  const mw = menuEl ? menuEl.offsetWidth : 200;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  let top = 0;
  let left = 0;

  switch (placement) {
    case 'bottom-start':
      top = tr.bottom + scrollY + offset;
      left = tr.left + scrollX;
      break;
    case 'bottom-end':
      top = tr.bottom + scrollY + offset;
      left = tr.right + scrollX - mw;
      break;
    case 'top-start':
      top = tr.top + scrollY - offset - mh;
      left = tr.left + scrollX;
      break;
    case 'top-end':
      top = tr.top + scrollY - offset - mh;
      left = tr.right + scrollX - mw;
      break;
    case 'right':
      top = tr.top + scrollY;
      left = tr.right + scrollX + offset;
      break;
    case 'left':
      top = tr.top + scrollY;
      left = tr.left + scrollX - offset - mw;
      break;
    default:
      top = tr.bottom + scrollY + offset;
      left = tr.left + scrollX;
  }

  // Flip if overflows viewport
  if (placement.startsWith('bottom') && tr.bottom + mh > vh) {
    top = tr.top + scrollY - offset - mh;
  }
  if (placement.startsWith('top') && tr.top - mh < 0) {
    top = tr.bottom + scrollY + offset;
  }
  if (left + mw > vw + scrollX) {
    left = vw + scrollX - mw - 8;
  }
  if (left < scrollX) {
    left = scrollX + 8;
  }

  return { top, left, minWidth: tr.width };
}

// ── Text highlight helper ──────────────────────────────────────────────────────

function highlightText(text: string, query: string): ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'rgba(0,245,212,0.3)', color: 'inherit', borderRadius: 2 }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Flatten items for keyboard nav ────────────────────────────────────────────

function flattenItems(groups: DropdownGroup[], query: string): DropdownItem[] {
  const flat: DropdownItem[] = [];
  for (const g of groups) {
    for (const item of g.items) {
      if (!item.disabled) {
        if (!query || item.label.toLowerCase().includes(query.toLowerCase())) {
          flat.push(item);
        }
        // Do not include submenu items in the top-level flat list for keyboard nav
      }
    }
  }
  return flat;
}

// ── DropdownMenu (the actual menu panel) ──────────────────────────────────────

interface DropdownMenuProps {
  groups: DropdownGroup[];
  position: MenuPosition;
  maxHeight: number;
  minWidth: number;
  selectedKeys: string[];
  multiSelect: boolean;
  searchable: boolean;
  searchPlaceholder: string;
  onSelect: (key: string, item: DropdownItem) => void;
  onClose: () => void;
  renderItem?: (item: DropdownItem, selected: boolean) => ReactNode;
  menuRef: React.RefObject<HTMLDivElement | null>;
  isPortal: boolean;
  menuId: string;
}

function DropdownMenu({
  groups,
  position,
  maxHeight,
  minWidth: propMinWidth,
  selectedKeys,
  multiSelect,
  searchable,
  searchPlaceholder,
  onSelect,
  onClose,
  renderItem,
  menuRef,
  isPortal,
  menuId,
}: DropdownMenuProps) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [openSubmenuKey, setOpenSubmenuKey] = useState<string | null>(null);
  const [submenuFocusedIndex, setSubmenuFocusedIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const submenuItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredGroups: DropdownGroup[] = query
    ? groups
        .map((g) => ({
          ...g,
          items: g.items.filter(
            (item) =>
              item.label.toLowerCase().includes(query.toLowerCase()) ||
              item.description?.toLowerCase().includes(query.toLowerCase()) ||
              item.children?.some((c) => c.label.toLowerCase().includes(query.toLowerCase())),
          ),
        }))
        .filter((g) => g.items.length > 0)
    : groups;

  const flatNavigable = flattenItems(filteredGroups, query);

  useEffect(() => {
    if (searchable && searchRef.current) {
      searchRef.current.focus();
    } else {
      itemRefs.current[0]?.focus();
    }
    setFocusedIndex(0);
  }, [searchable]);

  // Sync focus to DOM
  useEffect(() => {
    if (!searchable || query !== '') {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, searchable, query]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (openSubmenuKey) {
            const submenuItems = flatNavigable.find((i) => i.key === openSubmenuKey)?.children ?? [];
            const enabledSub = submenuItems.filter((i) => !i.disabled);
            setSubmenuFocusedIndex((idx) => Math.min(idx + 1, enabledSub.length - 1));
          } else {
            setFocusedIndex((idx) => Math.min(idx + 1, flatNavigable.length - 1));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (openSubmenuKey) {
            setSubmenuFocusedIndex((idx) => Math.max(idx - 1, 0));
          } else {
            setFocusedIndex((idx) => Math.max(idx - 1, 0));
          }
          break;
        case 'ArrowRight': {
          e.preventDefault();
          const cur = flatNavigable[focusedIndex];
          if (cur?.children?.length) {
            setOpenSubmenuKey(cur.key);
            setSubmenuFocusedIndex(0);
          }
          break;
        }
        case 'ArrowLeft':
          e.preventDefault();
          setOpenSubmenuKey(null);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (openSubmenuKey) {
            const submenuItems = flatNavigable.find((i) => i.key === openSubmenuKey)?.children ?? [];
            const enabledSub = submenuItems.filter((i) => !i.disabled);
            const subItem = enabledSub[submenuFocusedIndex];
            if (subItem) onSelect(subItem.key, subItem);
          } else {
            const item = flatNavigable[focusedIndex];
            if (item) onSelect(item.key, item);
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (openSubmenuKey) {
            setOpenSubmenuKey(null);
          } else {
            onClose();
          }
          break;
        case 'Tab':
          onClose();
          break;
        default:
          break;
      }
    },
    [flatNavigable, focusedIndex, onClose, onSelect, openSubmenuKey, submenuFocusedIndex],
  );

  // Sync submenu focus
  useEffect(() => {
    if (openSubmenuKey) {
      submenuItemRefs.current[submenuFocusedIndex]?.focus();
    }
  }, [submenuFocusedIndex, openSubmenuKey]);

  const menuStyle: CSSProperties = {
    position: isPortal ? 'fixed' : 'absolute',
    top: isPortal ? position.top : undefined,
    left: isPortal ? position.left : undefined,
    minWidth: Math.max(propMinWidth, position.minWidth),
    maxHeight,
    overflowY: 'auto',
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
    zIndex: 9999,
    outline: 'none',
    transformOrigin: 'top left',
    animation: 'tkx-dropdown-in 150ms ease forwards',
  };

  let navIdx = 0;

  return (
    <div
      ref={menuRef as React.RefObject<HTMLDivElement>}
      id={menuId}
      role="menu"
      aria-label="Dropdown menu"
      tabIndex={-1}
      style={menuStyle}
      onKeyDown={handleKeyDown}
    >
      <style>{`
        @keyframes tkx-dropdown-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {searchable && (
        <div style={{ padding: '8px 8px 4px' }}>
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setFocusedIndex(0);
            }}
            placeholder={searchPlaceholder}
            aria-label="Search items"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '6px 10px',
              background: theme.surfaceAlt,
              border: `1px solid ${theme.border}`,
              borderRadius: 6,
              color: theme.text,
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
      )}

      {filteredGroups.length === 0 && (
        <div
          style={{
            padding: '12px 16px',
            color: theme.textMuted,
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          No results found
        </div>
      )}

      {filteredGroups.map((group, gi) => (
        <div key={gi} role="group" aria-label={group.label}>
          {group.label && (
            <div
              style={{
                padding: '8px 12px 4px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: theme.textMuted,
              }}
            >
              {sanitizeString(group.label)}
            </div>
          )}

          {group.items.map((item) => {
            const currentNavIdx = navIdx;
            if (!item.disabled) navIdx++;

            const isSelected = selectedKeys.includes(item.key);
            const isFocused = currentNavIdx === focusedIndex && !item.disabled;
            const hasSubmenu = !!item.children?.length;
            const isSubmenuOpen = openSubmenuKey === item.key;

            const itemContent = renderItem ? (
              renderItem(item, isSelected)
            ) : (
              <DefaultItemContent
                item={item}
                isSelected={isSelected}
                isFocused={isFocused}
                multiSelect={multiSelect}
                query={query}
                theme={theme}
                hasSubmenu={hasSubmenu}
              />
            );

            return (
              <div key={item.key}>
                {item.divider && (
                  <div
                    role="separator"
                    style={{
                      height: 1,
                      background: theme.border,
                      margin: '4px 0',
                    }}
                  />
                )}
                <div
                  ref={(el) => {
                    itemRefs.current[currentNavIdx] = el;
                  }}
                  role="menuitem"
                  aria-disabled={item.disabled}
                  aria-checked={multiSelect ? isSelected : undefined}
                  aria-selected={!multiSelect ? isSelected : undefined}
                  aria-haspopup={hasSubmenu ? 'menu' : undefined}
                  aria-expanded={hasSubmenu ? isSubmenuOpen : undefined}
                  tabIndex={item.disabled ? -1 : 0}
                  style={{
                    position: 'relative',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    opacity: item.disabled ? 0.5 : 1,
                  }}
                  onClick={() => {
                    if (item.disabled) return;
                    if (hasSubmenu) {
                      setOpenSubmenuKey(isSubmenuOpen ? null : item.key);
                      setSubmenuFocusedIndex(0);
                    } else {
                      onSelect(item.key, item);
                    }
                  }}
                  onMouseEnter={() => {
                    if (!item.disabled) {
                      setFocusedIndex(currentNavIdx);
                      if (hasSubmenu) {
                        setOpenSubmenuKey(item.key);
                        setSubmenuFocusedIndex(0);
                      } else {
                        setOpenSubmenuKey(null);
                      }
                    }
                  }}
                  onFocus={() => {
                    if (!item.disabled) setFocusedIndex(currentNavIdx);
                  }}
                >
                  {itemContent}

                  {/* Submenu panel */}
                  {hasSubmenu && isSubmenuOpen && (
                    <div
                      role="menu"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '100%',
                        minWidth: 180,
                        background: theme.surface,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 8,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        zIndex: 10000,
                        animation: 'tkx-dropdown-in 120ms ease forwards',
                      }}
                    >
                      {item.children!.map((child, ci) => {
                        const isChildSelected = selectedKeys.includes(child.key);
                        const isChildFocused = ci === submenuFocusedIndex;
                        return (
                          <div
                            key={child.key}
                            ref={(el) => {
                              submenuItemRefs.current[ci] = el;
                            }}
                            role="menuitem"
                            aria-disabled={child.disabled}
                            aria-selected={isChildSelected}
                            tabIndex={child.disabled ? -1 : 0}
                            style={{ cursor: child.disabled ? 'not-allowed' : 'pointer', opacity: child.disabled ? 0.5 : 1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!child.disabled) onSelect(child.key, child);
                            }}
                            onMouseEnter={() => setSubmenuFocusedIndex(ci)}
                          >
                            <DefaultItemContent
                              item={child}
                              isSelected={isChildSelected}
                              isFocused={isChildFocused}
                              multiSelect={multiSelect}
                              query={query}
                              theme={theme}
                              hasSubmenu={false}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Default Item Content ───────────────────────────────────────────────────────

interface DefaultItemContentProps {
  item: DropdownItem;
  isSelected: boolean;
  isFocused: boolean;
  multiSelect: boolean;
  query: string;
  theme: import('../themes').ThemeTokens;
  hasSubmenu: boolean;
}

function DefaultItemContent({ item, isSelected, isFocused, multiSelect, query, theme, hasSubmenu }: DefaultItemContentProps) {
  const bg = isFocused
    ? item.danger
      ? `${theme.danger}20`
      : `${theme.primary}18`
    : 'transparent';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: bg,
        transition: 'background 80ms',
        color: item.danger ? theme.danger : theme.text,
        fontSize: 14,
        userSelect: 'none',
      }}
    >
      {/* Checkmark for multi-select */}
      {multiSelect && (
        <div
          style={{
            width: 16,
            height: 16,
            border: `2px solid ${isSelected ? theme.primary : theme.border}`,
            borderRadius: 4,
            background: isSelected ? theme.primary : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 120ms',
          }}
        >
          {isSelected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l3 3L9 1" stroke={theme.bg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      )}

      {/* Icon */}
      {item.icon && (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: item.danger ? theme.danger : theme.textMuted }}>
          {item.icon}
        </span>
      )}

      {/* Label + description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: isSelected && !multiSelect ? 600 : 400 }}>
          {highlightText(item.label, query)}
        </div>
        {item.description && (
          <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 1 }}>
            {highlightText(item.description, query)}
          </div>
        )}
      </div>

      {/* Badge */}
      {item.badge !== undefined && (
        <span
          style={{
            background: theme.primary,
            color: theme.bg,
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 10,
            padding: '1px 7px',
            flexShrink: 0,
          }}
        >
          {item.badge}
        </span>
      )}

      {/* Shortcut */}
      {item.shortcut && !hasSubmenu && (
        <span style={{ fontSize: 12, color: theme.textMuted, flexShrink: 0 }}>
          {item.shortcut}
        </span>
      )}

      {/* Submenu chevron */}
      {hasSubmenu && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <path d="M4 2l4 4-4 4" stroke={theme.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {/* Selected indicator (single-select) */}
      {!multiSelect && isSelected && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M2 7l4 4L12 3" stroke={theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

// ── Main TkxDropdown ──────────────────────────────────────────────────────────

export function TkxDropdown({
  trigger,
  items,
  groups,
  placement = 'bottom-start',
  onSelect,
  selectedKeys: controlledSelectedKeys,
  multiSelect = false,
  searchable = false,
  searchPlaceholder = 'Search…',
  closeOnSelect,
  disabled = false,
  maxHeight = 320,
  minWidth = 200,
  open: controlledOpen,
  onOpenChange,
  portal = true,
  offset = 6,
  renderItem,
}: TkxDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ top: 0, left: 0, minWidth });

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const selectedKeys = controlledSelectedKeys !== undefined ? controlledSelectedKeys : internalSelectedKeys;

  const shouldCloseOnSelect = closeOnSelect !== undefined ? closeOnSelect : !multiSelect;

  // Normalize to groups
  const resolvedGroups: DropdownGroup[] = groups ?? (items ? [{ items }] : [{ items: [] }]);

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const handleSelect = useCallback(
    (key: string, item: DropdownItem) => {
      if (multiSelect && controlledSelectedKeys === undefined) {
        setInternalSelectedKeys((prev) =>
          prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
        );
      }
      onSelect?.(key, item);
      if (shouldCloseOnSelect) {
        setOpen(false);
      }
    },
    [multiSelect, controlledSelectedKeys, onSelect, shouldCloseOnSelect, setOpen],
  );

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  // Calculate position when opening
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const pos = calcPosition(triggerRef.current, menuRef.current, placement, offset);
      setMenuPosition(pos);
    }
  }, [isOpen, placement, offset]);

  // Recalculate after menu mounts (to get actual dimensions)
  useEffect(() => {
    if (isOpen && triggerRef.current && menuRef.current) {
      const pos = calcPosition(triggerRef.current, menuRef.current, placement, offset);
      setMenuPosition(pos);
    }
  }, [isOpen, placement, offset]);

  // Outside click to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, setOpen]);

  const toggleOpen = () => {
    if (!disabled) setOpen(!isOpen);
  };

  const menuContent = isOpen ? (
    <DropdownMenu
      groups={resolvedGroups}
      position={menuPosition}
      maxHeight={maxHeight}
      minWidth={minWidth}
      selectedKeys={selectedKeys}
      multiSelect={multiSelect}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      onSelect={handleSelect}
      onClose={handleClose}
      renderItem={renderItem}
      menuRef={menuRef as React.RefObject<HTMLDivElement | null>}
      isPortal={portal}
      menuId={menuId}
    />
  ) : null;

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <div
        ref={triggerRef}
        onClick={toggleOpen}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-disabled={disabled}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, display: 'inline-block' }}
      >
        {trigger}
      </div>

      {portal && typeof document !== 'undefined'
        ? createPortal(menuContent, document.body)
        : menuContent}
    </div>
  );
}

export default TkxDropdown;