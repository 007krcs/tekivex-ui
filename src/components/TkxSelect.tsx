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
import { useLocale } from '../i18n';
import { sanitizeString } from '../engine/security';
import { tkx, cx } from '../engine/tkx';

// ── Types ──────────────────────────────────────────────────────────────────────

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
  disabled?: boolean;
  icon?: ReactNode;
  description?: string;
}

export interface TkxSelectProps {
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  placeholder?: string;
  size?: SelectSize;
  isDisabled?: boolean;
  isInvalid?: boolean;
  label?: string;
  hint?: string;
  errorMessage?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  isLoading?: boolean;
  onChange?: (value: string | string[]) => void;
  renderOption?: (option: SelectOption, isSelected: boolean) => ReactNode;
  maxMenuHeight?: number;
  /** Enable virtual scrolling for the dropdown. Defaults to auto (enabled when 100+ options). */
  virtualScroll?: boolean;
  /** Fixed option height in pixels for virtual scroll calculations. Default: 36 */
  optionHeight?: number;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<SelectSize, { py: string; px: string; fontSize: string; iconSize: number; tagPy: string; tagPx: string }> = {
  sm: { py: '6px',  px: '10px', fontSize: '13px', iconSize: 14, tagPy: '1px',  tagPx: '6px'  },
  md: { py: '9px',  px: '12px', fontSize: '14px', iconSize: 16, tagPy: '2px',  tagPx: '8px'  },
  lg: { py: '12px', px: '14px', fontSize: '15px', iconSize: 18, tagPy: '3px',  tagPx: '10px' },
};

function toArray(v: string | string[] | undefined): string[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

// ── Portal Dropdown positioning ────────────────────────────────────────────────

interface DropdownRect {
  top: number;
  left: number;
  width: number;
  placement: 'below' | 'above';
}

function calcDropdownRect(
  triggerEl: HTMLElement,
  dropdownHeight: number,
): DropdownRect {
  const rect = triggerEl.getBoundingClientRect();
  const viewportH = window.innerHeight;
  const gap = 6;
  const spaceBelow = viewportH - rect.bottom - gap;
  const spaceAbove = rect.top - gap;
  const placement: 'below' | 'above' =
    spaceBelow >= Math.min(dropdownHeight, 200) || spaceBelow >= spaceAbove
      ? 'below'
      : 'above';

  return {
    top:
      placement === 'below'
        ? rect.bottom + window.scrollY + gap
        : rect.top + window.scrollY - gap - Math.min(dropdownHeight, 280),
    left: rect.left + window.scrollX,
    width: rect.width,
    placement,
  };
}

// ── Spinner ────────────────────────────────────────────────────────────────────

function Spinner({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      style={{
        animation: 'tkx-spin 0.7s linear infinite',
      }}
    >
      <style>{`@keyframes tkx-spin{to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function TkxSelect({
  options = [],
  value: valueProp,
  defaultValue,
  placeholder,
  size = 'md',
  isDisabled = false,
  isInvalid = false,
  label,
  hint,
  errorMessage,
  multiple = false,
  searchable = false,
  clearable = false,
  isLoading = false,
  onChange,
  renderOption,
  maxMenuHeight = 280,
  virtualScroll,
  optionHeight = 36,
  id: idProp,
  className,
  style,
}: TkxSelectProps) {
  const theme = useTheme();
  const t = useLocale();
  const resolvedPlaceholder = placeholder ?? t.selectPlaceholder;
  const autoId = useId();
  const id = idProp ?? autoId;
  const listboxId = `${id}-listbox`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(
    toArray(defaultValue),
  );

  const selectedValues = isControlled ? toArray(valueProp) : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownRect, setDropdownRect] = useState<DropdownRect | null>(null);
  const [typeahead, setTypeahead] = useState('');
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const sz = SIZE_MAP[size];
  const hasError = isInvalid || !!errorMessage;

  // ── Virtual scroll for options ─────────────────────────────────────────

  const optionsListRef = useRef<HTMLDivElement>(null);
  const [optScrollTop, setOptScrollTop] = useState(0);
  const [optContainerHeight, setOptContainerHeight] = useState(0);

  const handleOptScroll = useCallback(() => {
    if (!optionsListRef.current) return;
    setOptScrollTop(optionsListRef.current.scrollTop);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setOptScrollTop(0);
      return;
    }
    const el = optionsListRef.current;
    if (!el) return;
    setOptContainerHeight(el.clientHeight);
    const ro = new ResizeObserver(() => {
      setOptContainerHeight(el.clientHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen]);

  // ── Filtered + grouped options ────────────────────────────────────────────

  const filteredOptions = searchable && search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  const flatEnabled = filteredOptions.filter((o) => !o.disabled);

  const hasGroups = filteredOptions.some((o) => !!o.group);
  const isVirtualSelect =
    virtualScroll !== undefined
      ? virtualScroll
      : filteredOptions.length >= 100;
  // Only virtualize when we have a flat list (no groups) for simplicity
  const useVirtual = isVirtualSelect && !hasGroups;

  const OPTION_OVERSCAN = 8;
  const virtualTotalHeight = filteredOptions.length * optionHeight;
  const vStartIndex = useVirtual
    ? Math.max(0, Math.floor(optScrollTop / optionHeight) - OPTION_OVERSCAN)
    : 0;
  const vEndIndex = useVirtual
    ? Math.min(filteredOptions.length, Math.ceil((optScrollTop + optContainerHeight) / optionHeight) + OPTION_OVERSCAN)
    : filteredOptions.length;
  const visibleOptions = useVirtual ? filteredOptions.slice(vStartIndex, vEndIndex) : filteredOptions;
  const vOffsetY = vStartIndex * optionHeight;

  const groups = filteredOptions.reduce<Record<string, SelectOption[]>>(
    (acc, opt) => {
      const g = opt.group ?? '';
      if (!acc[g]) acc[g] = [];
      acc[g].push(opt);
      return acc;
    },
    {},
  );

  // ── Commit value ──────────────────────────────────────────────────────────

  const commitValue = useCallback(
    (val: string) => {
      let next: string[];
      if (multiple) {
        next = selectedValues.includes(val)
          ? selectedValues.filter((v) => v !== val)
          : [...selectedValues, val];
      } else {
        next = [val];
      }

      if (!isControlled) setInternalValue(next);
      onChange?.(multiple ? next : next[0] ?? '');

      if (!multiple) {
        setIsOpen(false);
        setSearch('');
        setActiveIndex(-1);
        triggerRef.current?.focus();
      }
    },
    [isControlled, multiple, onChange, selectedValues],
  );

  const removeTag = useCallback(
    (val: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const next = selectedValues.filter((v) => v !== val);
      if (!isControlled) setInternalValue(next);
      onChange?.(multiple ? next : next[0] ?? '');
    },
    [isControlled, multiple, onChange, selectedValues],
  );

  const clearAll = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) setInternalValue([]);
      onChange?.(multiple ? [] : '');
    },
    [isControlled, multiple, onChange],
  );

  // ── Positioning ───────────────────────────────────────────────────────────

  const updatePosition = useCallback(() => {
    const anchor = controlRef.current ?? triggerRef.current;
    if (!anchor || !isOpen) return;
    setDropdownRect(calcDropdownRect(anchor, maxMenuHeight));
  }, [isOpen, maxMenuHeight]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  // ── Outside click ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        controlRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      )
        return;
      setIsOpen(false);
      setSearch('');
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [isOpen]);

  // ── Focus search when open ────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen, searchable]);

  // ── Scroll active item into view ──────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    if (useVirtual && optionsListRef.current) {
      // For virtual scroll, compute position directly
      const itemTop = activeIndex * optionHeight;
      const itemBottom = itemTop + optionHeight;
      const el = optionsListRef.current;
      if (itemTop < el.scrollTop) {
        el.scrollTop = itemTop;
      } else if (itemBottom > el.scrollTop + el.clientHeight) {
        el.scrollTop = itemBottom - el.clientHeight;
      }
    } else {
      const el = listRef.current?.querySelector(
        `[data-idx="${activeIndex}"]`,
      ) as HTMLElement | null;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, isOpen, useVirtual, optionHeight]);

  // ── Keyboard: trigger button ───────────────────────────────────────────────

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else if (activeIndex >= 0 && flatEnabled[activeIndex]) {
          commitValue(flatEnabled[activeIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearch('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) openDropdown();
        else setActiveIndex((i) => Math.min(i + 1, flatEnabled.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) openDropdown();
        else setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        if (isOpen) setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        if (isOpen) setActiveIndex(flatEnabled.length - 1);
        break;
      case 'Backspace':
        // Keyboard convenience: remove the last selected tag in multi-select
        if (multiple && selectedValues.length > 0) {
          e.preventDefault();
          const next = selectedValues.slice(0, -1);
          if (!isControlled) setInternalValue(next);
          onChange?.(next);
        }
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          if (!isOpen) openDropdown();
          handleTypeahead(e.key);
        }
    }
  };

  // ── Keyboard: search input ─────────────────────────────────────────────────

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearch('');
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatEnabled.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(flatEnabled.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && flatEnabled[activeIndex]) {
          commitValue(flatEnabled[activeIndex].value);
        }
        break;
    }
  };

  // ── Typeahead ─────────────────────────────────────────────────────────────

  function handleTypeahead(char: string) {
    if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
    const next = typeahead + char.toLowerCase();
    setTypeahead(next);

    const idx = flatEnabled.findIndex((o) =>
      o.label.toLowerCase().startsWith(next),
    );
    if (idx >= 0) setActiveIndex(idx);

    typeaheadTimer.current = setTimeout(() => setTypeahead(''), 800);
  }

  function openDropdown() {
    if (isDisabled || isLoading) return;
    setIsOpen(true);
    const startIdx = flatEnabled.findIndex((o) =>
      selectedValues.includes(o.value),
    );
    setActiveIndex(startIdx >= 0 ? startIdx : 0);
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  const borderColor = hasError
    ? theme.danger
    : isOpen
    ? theme.primary
    : theme.border;

  const activeOptionId =
    activeIndex >= 0 && flatEnabled[activeIndex]
      ? `${id}-opt-${flatEnabled[activeIndex].value}`
      : undefined;

  // In searchable mode the search <input> holds DOM focus while the menu is
  // open, so it must own the combobox contract (APG editable combobox). The
  // trigger button is downgraded to a plain button while that is the case to
  // avoid two competing combobox nodes.
  const searchOwnsCombobox = searchable && isOpen;

  const describedBy =
    [hint && hintId, hasError && errorId].filter(Boolean).join(' ') ||
    undefined;

  // Tags displayed in trigger when multiple
  const selectedOptionObjects = selectedValues
    .map((v) => options.find((o) => o.value === v))
    .filter(Boolean) as SelectOption[];

  // ── Dropdown element (portalled) ──────────────────────────────────────────

  const dropdownEl = isOpen && dropdownRect
    ? createPortal(
        <div
          ref={dropdownRef}
          role="listbox"
          id={listboxId}
          aria-label={label ? sanitizeString(label) : 'Options'}
          aria-multiselectable={multiple}
          style={{
            position: 'absolute',
            top: dropdownRect.top,
            left: dropdownRect.left,
            width: dropdownRect.width,
            zIndex: 9999,
            backgroundColor: theme.surface,
            border: `1.5px solid ${theme.border}`,
            borderRadius: 10,
            boxShadow: `0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.14)`,
            overflow: 'hidden',
            minWidth: dropdownRect.width,
            maxHeight: maxMenuHeight,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search */}
          {searchable && (
            <div
              style={{
                padding: '8px 10px',
                borderBottom: `1px solid ${theme.border}`,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={theme.textMuted}
                strokeWidth="2"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                role="combobox"
                aria-expanded={true}
                aria-haspopup="listbox"
                aria-controls={listboxId}
                aria-activedescendant={activeOptionId}
                aria-autocomplete="list"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={`${t.search}…`}
                aria-label={`${t.search} options`}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: theme.text,
                  fontSize: sz.fontSize,
                  fontFamily: 'inherit',
                  width: '100%',
                }}
              />
            </div>
          )}

          {/* Options list */}
          <div
            ref={(el) => {
              (listRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
              (optionsListRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }}
            onScroll={useVirtual ? handleOptScroll : undefined}
            style={{
              overflowY: 'auto',
              flexGrow: 1,
              maxHeight: maxMenuHeight - (searchable ? 48 : 0),
            }}
          >
            {useVirtual ? (
              /* Virtualized flat list (no groups) */
              <div style={{ height: virtualTotalHeight, position: 'relative' }}>
                <div style={{ position: 'absolute', top: vOffsetY, left: 0, right: 0 }}>
                  {visibleOptions.map((opt) => {
                    const flatIdx = flatEnabled.indexOf(opt);
                    const isActive = flatIdx === activeIndex;
                    const isSelected = selectedValues.includes(opt.value);

                    const optionContent = renderOption ? (
                      renderOption(opt, isSelected)
                    ) : (
                      <span
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          {opt.icon && (
                            <span style={{ flexShrink: 0, display: 'flex' }}>
                              {opt.icon}
                            </span>
                          )}
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {sanitizeString(opt.label)}
                          </span>
                        </span>
                        {opt.description && (
                          <span
                            style={{
                              fontSize: '12px',
                              color: theme.textMuted,
                              marginTop: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {sanitizeString(opt.description)}
                          </span>
                        )}
                      </span>
                    );

                    return (
                      <div
                        key={opt.value}
                        id={`${id}-opt-${opt.value}`}
                        data-idx={flatIdx >= 0 ? flatIdx : undefined}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={opt.disabled || undefined}
                        onClick={() => !opt.disabled && commitValue(opt.value)}
                        onMouseEnter={() =>
                          !opt.disabled && flatIdx >= 0 && setActiveIndex(flatIdx)
                        }
                        style={{
                          height: optionHeight,
                          boxSizing: 'border-box',
                          padding: `0 ${sz.px}`,
                          fontSize: sz.fontSize,
                          fontFamily: 'inherit',
                          color: opt.disabled ? theme.textMuted : theme.text,
                          backgroundColor: isActive
                            ? `${theme.primary}22`
                            : isSelected
                            ? `${theme.primary}12`
                            : 'transparent',
                          cursor: opt.disabled ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          transition: 'background-color 80ms',
                          opacity: opt.disabled ? 0.5 : 1,
                          userSelect: 'none',
                          touchAction: 'manipulation',
                        }}
                      >
                        {optionContent}
                        {isSelected && !renderOption && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={theme.primary}
                            strokeWidth="2.5"
                            aria-hidden="true"
                            style={{ flexShrink: 0 }}
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
                {filteredOptions.length === 0 && (
                  <div
                    style={{
                      padding: `${sz.py} ${sz.px}`,
                      fontSize: sz.fontSize,
                      fontFamily: 'inherit',
                      color: theme.textMuted,
                      textAlign: 'center',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                    }}
                  >
                    {isLoading ? (t.loading ?? 'Loading\u2026') : (t.selectNoOptions ?? 'No options found')}
                  </div>
                )}
              </div>
            ) : (
            /* Non-virtual: grouped rendering */
            <>
            {Object.entries(groups).map(([group, groupOpts]) => (
              <div key={group}>
                {group && (
                  <div
                    aria-hidden="true"
                    style={{
                      padding: '8px 12px 4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: theme.textMuted,
                      fontFamily: 'inherit',
                      position: 'sticky',
                      top: 0,
                      backgroundColor: theme.surface,
                      zIndex: 1,
                      borderBottom: `1px solid ${theme.border}`,
                    }}
                  >
                    {sanitizeString(group)}
                  </div>
                )}
                {groupOpts.map((opt) => {
                  const flatIdx = flatEnabled.indexOf(opt);
                  const isActive = flatIdx === activeIndex;
                  const isSelected = selectedValues.includes(opt.value);

                  const optionContent = renderOption ? (
                    renderOption(opt, isSelected)
                  ) : (
                    <span
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        {opt.icon && (
                          <span style={{ flexShrink: 0, display: 'flex' }}>
                            {opt.icon}
                          </span>
                        )}
                        <span
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {sanitizeString(opt.label)}
                        </span>
                      </span>
                      {opt.description && (
                        <span
                          style={{
                            fontSize: '12px',
                            color: theme.textMuted,
                            marginTop: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {sanitizeString(opt.description)}
                        </span>
                      )}
                    </span>
                  );

                  return (
                    <div
                      key={opt.value}
                      id={`${id}-opt-${opt.value}`}
                      data-idx={flatIdx >= 0 ? flatIdx : undefined}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={opt.disabled || undefined}
                      onClick={() => !opt.disabled && commitValue(opt.value)}
                      onMouseEnter={() =>
                        !opt.disabled && flatIdx >= 0 && setActiveIndex(flatIdx)
                      }
                      style={{
                        padding: `${sz.py} ${sz.px}`,
                        fontSize: sz.fontSize,
                        fontFamily: 'inherit',
                        color: opt.disabled ? theme.textMuted : theme.text,
                        backgroundColor: isActive
                          ? `${theme.primary}22`
                          : isSelected
                          ? `${theme.primary}12`
                          : 'transparent',
                        cursor: opt.disabled ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        transition: 'background-color 80ms',
                        opacity: opt.disabled ? 0.5 : 1,
                        userSelect: 'none',
                        touchAction: 'manipulation',
                      }}
                    >
                      {optionContent}
                      {isSelected && !renderOption && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={theme.primary}
                          strokeWidth="2.5"
                          aria-hidden="true"
                          style={{ flexShrink: 0 }}
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {filteredOptions.length === 0 && (
              <div
                style={{
                  padding: `${sz.py} ${sz.px}`,
                  fontSize: sz.fontSize,
                  fontFamily: 'inherit',
                  color: theme.textMuted,
                  textAlign: 'center',
                }}
              >
                {isLoading ? (t.loading ?? 'Loading…') : (t.selectNoOptions ?? 'No options found')}
              </div>
            )}
            </>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  const hasClearable =
    clearable && selectedValues.length > 0 && !isDisabled && !isLoading;

  return (
    <div
      className={cx(tkx('flex flex-col gap-1 w-full'), className)}
      style={style}
    >
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: 'inherit',
            color: theme.text,
            userSelect: 'none',
          }}
        >
          {sanitizeString(label)}
        </label>
      )}

      <div
        ref={controlRef}
        onClick={() => {
          if (isDisabled) return;
          if (isOpen) setIsOpen(false);
          else openDropdown();
        }}
        style={{
          position: 'relative',
          width: '100%',
          opacity: isDisabled ? 0.55 : 1,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 4,
          padding: multiple && selectedValues.length > 0
            ? `4px ${sz.px}`
            : `${sz.py} ${sz.px}`,
          fontSize: sz.fontSize,
          fontFamily: 'inherit',
          backgroundColor: theme.surface,
          border: `1.5px solid ${borderColor}`,
          borderRadius: 8,
          boxSizing: 'border-box',
          transition: 'border-color 150ms',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          minHeight: size === 'sm' ? 34 : size === 'lg' ? 50 : 42,
          touchAction: 'manipulation',
        }}
      >
        {/* Multi-select tags: siblings of the trigger button so each remove
            control is a real, keyboard-reachable <button> and no interactive
            element is nested inside another (WCAG 2.1.1 / content model). */}
        {multiple &&
          selectedOptionObjects.map((opt) => (
            <span
              key={opt.value}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: `${sz.tagPy} ${sz.tagPx}`,
                fontSize: `calc(${sz.fontSize} - 1px)`,
                fontFamily: 'inherit',
                backgroundColor: `${theme.primary}22`,
                color: theme.primary,
                borderRadius: 6,
                border: `1px solid ${theme.primary}44`,
                lineHeight: 1.4,
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 110,
                }}
              >
                {sanitizeString(opt.label)}
              </span>
              <button
                type="button"
                aria-label={`Remove ${sanitizeString(opt.label)}`}
                disabled={isDisabled}
                onClick={(e) => removeTag(opt.value, e)}
                style={{
                  cursor: 'pointer',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.8,
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  color: 'inherit',
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}

        <button
          ref={triggerRef}
          id={id}
          type="button"
          role={searchOwnsCombobox ? undefined : 'combobox'}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={searchOwnsCombobox ? undefined : listboxId}
          aria-activedescendant={searchOwnsCombobox ? undefined : activeOptionId}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          aria-multiselectable={searchOwnsCombobox ? undefined : multiple}
          disabled={isDisabled}
          onKeyDown={handleTriggerKeyDown}
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 0,
            margin: 0,
            fontSize: sz.fontSize,
            fontFamily: 'inherit',
            backgroundColor: 'transparent',
            color: selectedValues.length > 0 ? theme.text : theme.textMuted,
            border: 'none',
            textAlign: 'left',
            cursor: 'inherit',
            outline: 'none',
          }}
        >
          {!multiple && selectedValues.length > 0 ? (
            (() => {
              const sel = options.find((o) => o.value === selectedValues[0]);
              return (
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {sel?.icon && (
                    <span style={{ flexShrink: 0, display: 'flex' }}>
                      {sel.icon}
                    </span>
                  )}
                  {sel ? sanitizeString(sel.label) : ''}
                </span>
              );
            })()
          ) : multiple && selectedOptionObjects.length > 0 ? null : (
            <span style={{ opacity: 0.6 }}>
              {sanitizeString(resolvedPlaceholder)}
            </span>
          )}
        </button>

        {/* Right icons: clear + loading + chevron */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
            color: theme.textMuted,
          }}
        >
          {isLoading && <Spinner size={sz.iconSize} color={theme.primary} />}
          {hasClearable && !isLoading && (
            <button
              type="button"
              aria-label={t.clearSelection}
              onClick={clearAll}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                lineHeight: 1,
                opacity: 0.7,
                transition: 'opacity 120ms',
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: 'inherit',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = '1')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = '0.7')
              }
            >
              <svg
                width={sz.iconSize}
                height={sz.iconSize}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg
            width={sz.iconSize}
            height={sz.iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 150ms',
              flexShrink: 0,
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>

      {hint && !hasError && (
        <span
          id={hintId}
          style={{ fontSize: '12px', color: theme.textMuted, fontFamily: 'inherit' }}
        >
          {sanitizeString(hint)}
        </span>
      )}
      {hasError && errorMessage && (
        <span
          id={errorId}
          role="alert"
          style={{
            fontSize: '12px',
            color: theme.danger,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: 'inherit',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {sanitizeString(errorMessage)}
        </span>
      )}

      {dropdownEl}
    </div>
  );
}

TkxSelect.displayName = 'TkxSelect';