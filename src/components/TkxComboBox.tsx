'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString, sanitizeUnicode } from '../engine/security';
import { tkx, cx } from '../engine/tkx';

// ─────────────────────────────────────────────────────────────────────────────
// TkxComboBox — a multi-select combobox with token chips.
//
// TkxAutocomplete is single-select; this fills the multi-select gap
// (recipients, tags, filters). Selected values render as removable chips
// before the text input; typing filters the option list; Enter toggles the
// active option without closing the list (multi-select convention).
//
// Same label / hint / error / isInvalid / isRequired chrome as TkxInput.
// Forwards a ref to the inner <input>.
// ─────────────────────────────────────────────────────────────────────────────

export interface ComboBoxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TkxComboBoxProps {
  label: string;
  /** Selectable options. Defaults to [] — a bare mount must not crash. */
  options?: ComboBoxOption[];
  /** Controlled selection. */
  value?: string[];
  /** Uncontrolled initial selection. */
  defaultValue?: string[];
  onChange?: (values: string[], selectedOptions: ComboBoxOption[]) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  isInvalid?: boolean;
  isRequired?: boolean;
  disabled?: boolean;
  /** Show a "clear all" affordance when something is selected. Default true. */
  clearable?: boolean;
  /** Cap the number of selected values; remaining options become aria-disabled. */
  maxSelected?: number;
  id?: string;
  /** Renders a hidden input joining values with ',' for plain form posts. */
  name?: string;
  className?: string;
  style?: CSSProperties;
}

export const TkxComboBox = forwardRef<HTMLInputElement, TkxComboBoxProps>(
  (
    {
      label,
      options = [],
      value,
      defaultValue,
      onChange,
      placeholder,
      hint,
      error,
      isInvalid,
      isRequired,
      disabled,
      clearable = true,
      maxSelected,
      id: idProp,
      name,
      className,
      style,
    },
    ref,
  ) => {
    const theme = useTheme();
    const autoId = useId();
    const id = idProp ?? autoId;
    const listboxId = `${id}-listbox`;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const hasError = isInvalid || !!error;
    const describedBy =
      [hint && hintId, hasError && errorId].filter(Boolean).join(' ') || undefined;

    const safeLabel = sanitizeString(label);
    const safeError = error ? sanitizeString(error) : undefined;
    const safeHint = hint ? sanitizeString(hint) : undefined;

    const inputRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    // Controlled / uncontrolled selection
    const isControlled = value !== undefined;
    const [internalValues, setInternalValues] = useState<string[]>(
      () => defaultValue ?? [],
    );
    const values = isControlled ? value : internalValues;

    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const atMax = maxSelected !== undefined && values.length >= maxSelected;

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return options;
      return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [options, query]);

    /** An option that cannot currently be toggled. Already-selected options
     *  stay interactive at the cap so they can be deselected. */
    const isBlocked = useCallback(
      (option: ComboBoxOption) =>
        !!option.disabled || (atMax && !values.includes(option.value)),
      [atMax, values],
    );

    const commit = useCallback(
      (next: string[]) => {
        if (!isControlled) setInternalValues(next);
        const selectedOptions = next
          .map((v) => options.find((o) => o.value === v))
          .filter((o): o is ComboBoxOption => !!o);
        onChange?.(next, selectedOptions);
      },
      [isControlled, onChange, options],
    );

    const toggleOption = useCallback(
      (option: ComboBoxOption) => {
        if (isBlocked(option)) return;
        const next = values.includes(option.value)
          ? values.filter((v) => v !== option.value)
          : [...values, option.value];
        commit(next);
        // Multi-select convention: keep the list open, clear the query.
        setQuery('');
      },
      [commit, isBlocked, values],
    );

    const removeValue = useCallback(
      (val: string) => {
        commit(values.filter((v) => v !== val));
      },
      [commit, values],
    );

    // Close on click outside.
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: PointerEvent) => {
        if (wrapperRef.current?.contains(e.target as Node)) return;
        setIsOpen(false);
        setActiveIndex(-1);
      };
      document.addEventListener('pointerdown', handler);
      return () => document.removeEventListener('pointerdown', handler);
    }, [isOpen]);

    // Keep the active option visible while arrowing through a long list.
    useEffect(() => {
      if (activeIndex < 0) return;
      document
        .getElementById(`${listboxId}-opt-${activeIndex}`)
        ?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex, listboxId]);

    const moveActive = (dir: 1 | -1) => {
      setActiveIndex((prev) => {
        let next = prev + dir;
        while (
          next >= 0 &&
          next < filtered.length &&
          filtered[next].disabled
        ) {
          next += dir;
        }
        return next >= 0 && next < filtered.length ? next : prev;
      });
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setActiveIndex(-1);
            return;
          }
          moveActive(1);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            return;
          }
          moveActive(-1);
          break;
        }
        case 'Enter': {
          if (isOpen) {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < filtered.length) {
              toggleOption(filtered[activeIndex]);
            }
          }
          break;
        }
        case 'Escape': {
          if (isOpen) {
            setIsOpen(false);
            setActiveIndex(-1);
          }
          break;
        }
        case 'Backspace': {
          if (query === '' && values.length > 0) {
            removeValue(values[values.length - 1]);
          }
          break;
        }
      }
    };

    const chips = values.map((val) => {
      const option = options.find((o) => o.value === val);
      const chipLabel = sanitizeString(option ? option.label : val);
      return (
        <span
          key={val}
          className={tkx(
            'inline-flex items-center gap-1 rounded-md text-xs font-sans px-1.5 py-0.5 shrink-0',
          )}
          style={{
            backgroundColor: theme.css.surfaceAlt,
            color: theme.css.text,
            border: `1px solid ${theme.css.border}`,
          }}
        >
          {chipLabel}
          <button
            type="button"
            aria-label={`Remove ${chipLabel}`}
            disabled={disabled}
            tabIndex={-1}
            className={tkx(
              'inline-flex items-center justify-center border-none bg-transparent p-0 cursor-pointer rounded-sm',
              disabled ? 'cursor-not-allowed' : '',
            )}
            style={{ color: theme.css.textMuted, lineHeight: 1 }}
            onClick={() => removeValue(val)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M3 3l6 6M9 3l-6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </span>
      );
    });

    const borderColor = hasError ? theme.css.danger : isOpen ? theme.css.primary : theme.css.border;

    return (
      <div
        ref={wrapperRef}
        className={cx(tkx('relative flex flex-col gap-1 w-full font-sans'), className)}
        style={style}
      >
        <label
          htmlFor={id}
          className={tkx('text-sm font-medium font-sans')}
          style={{ color: theme.css.text }}
        >
          {safeLabel}
          {isRequired && (
            <span aria-hidden="true" className={tkx('ml-1')} style={{ color: theme.css.danger }}>
              *
            </span>
          )}
        </label>

        <div className={tkx('relative')}>
          <div
            className={tkx(
              'flex items-center flex-wrap gap-1 rounded-lg py-1.5 px-2',
              'transition-colors duration-150',
              disabled ? 'opacity-60' : 'cursor-text',
            )}
            style={{ border: `1.5px solid ${borderColor}`, backgroundColor: theme.css.surface }}
            onMouseDown={(e) => {
              // Clicking the chrome (not a chip button) focuses the input.
              if (e.target === e.currentTarget) {
                e.preventDefault();
                inputRef.current?.focus();
              }
            }}
          >
            {chips}

            <input
              ref={inputRef}
              id={id}
              type="text"
              role="combobox"
              aria-expanded={isOpen}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                isOpen && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
              }
              aria-invalid={hasError}
              aria-required={isRequired}
              aria-describedby={describedBy}
              autoComplete="off"
              disabled={disabled}
              placeholder={values.length === 0 ? placeholder : undefined}
              value={query}
              onChange={(e) => {
                const clean = sanitizeUnicode(e.target.value);
                setQuery(clean);
                setActiveIndex(-1);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => {
                if (!disabled) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              className={tkx(
                'flex-1 border-none bg-transparent text-sm font-sans py-1 px-1 outline-none min-w-0',
                'placeholder:opacity-50',
              )}
              style={{ color: theme.css.text, minWidth: 60 }}
            />

            {clearable && values.length > 0 && !disabled && (
              <button
                type="button"
                aria-label="Clear all"
                tabIndex={-1}
                className={tkx(
                  'inline-flex items-center justify-center border-none bg-transparent p-1 cursor-pointer rounded-md shrink-0',
                )}
                style={{ color: theme.css.textMuted }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  commit([]);
                  setQuery('');
                  inputRef.current?.focus();
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.25" />
                  <path
                    d="M4.5 4.5l5 5M9.5 4.5l-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>

          {isOpen && (
            <ul
              id={listboxId}
              role="listbox"
              aria-multiselectable="true"
              aria-label={safeLabel}
              className={tkx(
                'absolute left-0 right-0 z-50 list-none m-0 mt-1 p-1 rounded-lg overflow-y-auto font-sans',
              )}
              style={{
                top: '100%',
                maxHeight: 280,
                backgroundColor: theme.css.surface,
                border: `1px solid ${theme.css.border}`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
            >
              {filtered.length === 0 ? (
                <li
                  role="option"
                  aria-selected={false}
                  aria-disabled="true"
                  className={tkx('px-3 py-2 text-sm text-center')}
                  style={{ color: theme.css.textMuted }}
                >
                  No results
                </li>
              ) : (
                filtered.map((option, idx) => {
                  const isSelected = values.includes(option.value);
                  const blocked = isBlocked(option);
                  const isActive = idx === activeIndex;
                  return (
                    <li
                      key={option.value}
                      id={`${listboxId}-opt-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={blocked || undefined}
                      className={tkx(
                        'flex items-center gap-2 px-3 py-2 text-sm rounded-md',
                        blocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                      )}
                      style={{
                        backgroundColor: isActive ? theme.css.surfaceAlt : 'transparent',
                        color: blocked ? theme.css.textMuted : theme.css.text,
                      }}
                      onMouseEnter={() => {
                        if (!option.disabled) setActiveIndex(idx);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault(); // keep focus on the input
                        toggleOption(option);
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className={tkx(
                          'inline-flex items-center justify-center rounded-sm shrink-0',
                        )}
                        style={{
                          width: 16,
                          height: 16,
                          border: `1.5px solid ${isSelected ? theme.css.primary : theme.css.border}`,
                          backgroundColor: isSelected ? theme.css.primary : 'transparent',
                        }}
                      >
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path
                              d="M2 5l2.2 2.2L8 2.8"
                              stroke={theme.css.surface}
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span className={tkx('truncate')}>{sanitizeString(option.label)}</span>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>

        {name && <input type="hidden" name={name} value={values.join(',')} />}

        {safeHint && !safeError && (
          <span id={hintId} className={tkx('text-xs')} style={{ color: theme.css.textMuted }}>
            {safeHint}
          </span>
        )}
        {safeError && (
          <span
            id={errorId}
            role="alert"
            className={tkx('text-xs flex items-center gap-1')}
            style={{ color: theme.css.danger }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {safeError}
          </span>
        )}
      </div>
    );
  },
);

TkxComboBox.displayName = 'TkxComboBox';

export default TkxComboBox;
