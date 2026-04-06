import {
  forwardRef,
  useId,
  useRef,
  useState,
  useEffect,
  useCallback,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { getAccessibleForeground } from '../engine/wcag';
import { tkx, cx } from '../engine/tkx';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface TkxSelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
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
  onChange?: (value: string) => void;
  id?: string;
}

const SIZE_MAP: Record<SelectSize, { py: string; px: string; fontSize: string; iconSize: number }> = {
  sm: { py: '6px', px: '10px', fontSize: '13px', iconSize: 14 },
  md: { py: '9px', px: '12px', fontSize: '14px', iconSize: 16 },
  lg: { py: '12px', px: '14px', fontSize: '15px', iconSize: 18 },
};

export const TkxSelect = forwardRef<HTMLDivElement, TkxSelectProps>(
  (
    {
      options,
      value: valueProp,
      defaultValue,
      placeholder = 'Select an option…',
      size = 'md',
      isDisabled = false,
      isInvalid = false,
      label,
      hint,
      errorMessage,
      searchable = false,
      clearable = false,
      onChange,
      id: idProp,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const theme = useTheme();
    const autoId = useId();
    const id = idProp ?? autoId;
    const listboxId = `${id}-listbox`;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;

    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');
    const [search, setSearch] = useState('');
    const [activeIndex, setActiveIndex] = useState(-1);

    const isControlled = valueProp !== undefined;
    const selectedValue = isControlled ? valueProp : internalValue;

    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const sz = SIZE_MAP[size];
    const hasError = isInvalid || !!errorMessage;
    const selectedOption = options.find((o) => o.value === selectedValue);

    const filteredOptions = searchable && search
      ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
      : options;

    // group options
    const groups = filteredOptions.reduce<Record<string, SelectOption[]>>((acc, opt) => {
      const g = opt.group ?? '';
      if (!acc[g]) acc[g] = [];
      acc[g].push(opt);
      return acc;
    }, {});

    const flatFiltered = filteredOptions.filter((o) => !o.disabled);

    const selectValue = useCallback(
      (val: string) => {
        if (!isControlled) setInternalValue(val);
        onChange?.(val);
        setIsOpen(false);
        setSearch('');
        setActiveIndex(-1);
        triggerRef.current?.focus();
      },
      [isControlled, onChange],
    );

    const clearSelection = useCallback(() => {
      if (!isControlled) setInternalValue('');
      onChange?.('');
      setSearch('');
    }, [isControlled, onChange]);

    const openDropdown = () => {
      if (isDisabled) return;
      setIsOpen(true);
      const idx = flatFiltered.findIndex((o) => o.value === selectedValue);
      setActiveIndex(idx >= 0 ? idx : 0);
    };

    // close on outside click
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: PointerEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setSearch('');
        }
      };
      document.addEventListener('pointerdown', handler);
      return () => document.removeEventListener('pointerdown', handler);
    }, [isOpen]);

    // focus search on open
    useEffect(() => {
      if (isOpen && searchable) {
        setTimeout(() => searchRef.current?.focus(), 0);
      }
    }, [isOpen, searchable]);

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!isOpen) openDropdown();
          else if (activeIndex >= 0 && flatFiltered[activeIndex]) selectValue(flatFiltered[activeIndex].value);
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearch('');
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) openDropdown();
          else setActiveIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
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
          setActiveIndex(flatFiltered.length - 1);
          break;
      }
    };

    const borderColor = hasError ? theme.danger : isOpen ? theme.primary : theme.border;
    const activeOptionId = activeIndex >= 0 && flatFiltered[activeIndex] ? `${id}-opt-${flatFiltered[activeIndex].value}` : undefined;

    const describedBy = [hint && hintId, hasError && errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div ref={ref} className={cx(tkx('flex flex-col gap-1 w-full'), className)} style={style} {...rest}>
        {label && (
          <label htmlFor={id} className={tkx('text-sm font-medium font-sans')} style={{ color: theme.text }}>
            {sanitizeString(label)}
          </label>
        )}

        <div ref={containerRef} className={tkx('relative w-full')} style={{ opacity: isDisabled ? 0.6 : 1 }}>
          <button
            ref={triggerRef}
            id={id}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            disabled={isDisabled}
            onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
            onKeyDown={handleKeyDown}
            className={tkx('w-full flex items-center justify-between rounded-lg outline-none focus-visible:focus-ring cursor-pointer border-none')}
            style={{
              padding: `${sz.py} ${sz.px}`,
              fontSize: sz.fontSize,
              fontFamily: 'inherit',
              backgroundColor: theme.surface,
              color: selectedOption ? theme.text : theme.textMuted,
              border: `1.5px solid ${borderColor}`,
              boxSizing: 'border-box',
              transition: 'border-color 150ms',
              textAlign: 'left',
            }}
          >
            <span className={tkx('truncate flex-1')}>
              {selectedOption ? sanitizeString(selectedOption.label) : sanitizeString(placeholder)}
            </span>
            <span className={tkx('flex items-center gap-1 shrink-0 ml-2')} style={{ color: theme.textMuted }}>
              {clearable && selectedValue && (
                <span
                  role="button"
                  aria-label="Clear selection"
                  tabIndex={-1}
                  onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                  style={{ cursor: 'pointer', lineHeight: 1 }}
                >
                  <svg width={sz.iconSize} height={sz.iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </span>
              )}
              <svg
                width={sz.iconSize}
                height={sz.iconSize}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>

          {isOpen && (
            <div
              role="listbox"
              id={listboxId}
              aria-label={label ? sanitizeString(label) : 'Options'}
              className={tkx('absolute z-50 w-full rounded-lg overflow-auto shadow-lg mt-1')}
              style={{
                backgroundColor: theme.surface,
                border: `1.5px solid ${theme.border}`,
                maxHeight: '240px',
                top: '100%',
                left: 0,
              }}
            >
              {searchable && (
                <div style={{ padding: '6px 8px', borderBottom: `1px solid ${theme.border}` }}>
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setActiveIndex(0); }}
                    placeholder="Search…"
                    className={tkx('w-full border-none outline-none bg-transparent text-sm font-sans')}
                    style={{ color: theme.text, fontSize: sz.fontSize }}
                    aria-label="Search options"
                  />
                </div>
              )}

              {Object.entries(groups).map(([group, groupOpts]) => (
                <div key={group}>
                  {group && (
                    <div
                      className={tkx('px-3 text-xs font-semibold uppercase tracking-wide')}
                      style={{ color: theme.textMuted, padding: '6px 12px 2px' }}
                      aria-hidden="true"
                    >
                      {sanitizeString(group)}
                    </div>
                  )}
                  {groupOpts.map((opt) => {
                    const flatIdx = flatFiltered.indexOf(opt);
                    const isActive = flatIdx === activeIndex;
                    const isSelected = opt.value === selectedValue;
                    return (
                      <div
                        key={opt.value}
                        id={`${id}-opt-${opt.value}`}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={opt.disabled}
                        onClick={() => !opt.disabled && selectValue(opt.value)}
                        onMouseEnter={() => !opt.disabled && setActiveIndex(flatIdx)}
                        className={tkx('cursor-pointer select-none')}
                        style={{
                          padding: `${sz.py} ${sz.px}`,
                          fontSize: sz.fontSize,
                          fontFamily: 'inherit',
                          color: opt.disabled ? theme.textMuted : theme.text,
                          backgroundColor: isActive
                            ? `${theme.primary}20`
                            : isSelected
                            ? `${theme.primary}10`
                            : 'transparent',
                          cursor: opt.disabled ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{sanitizeString(opt.label)}</span>
                        {isSelected && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="2.5">
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
                  className={tkx('text-sm text-center')}
                  style={{ color: theme.textMuted, padding: `${sz.py} ${sz.px}` }}
                >
                  No options found
                </div>
              )}
            </div>
          )}
        </div>

        {hint && !hasError && (
          <span id={hintId} className={tkx('text-xs')} style={{ color: theme.textMuted }}>
            {sanitizeString(hint)}
          </span>
        )}
        {hasError && errorMessage && (
          <span id={errorId} role="alert" className={tkx('text-xs flex items-center gap-1')} style={{ color: theme.danger }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {sanitizeString(errorMessage)}
          </span>
        )}
      </div>
    );
  },
);

TkxSelect.displayName = 'TkxSelect';
