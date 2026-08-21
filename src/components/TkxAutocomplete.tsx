'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  useMemo,
  type ReactNode,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { useLocale } from '../i18n';
import { sanitizeString, sanitizeUnicode } from '../engine/security';
import { useReducedMotion, useEscapeKey } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TkxAutocompleteProps {
  options: AutocompleteOption[];
  value?: string;
  onChange?: (value: string) => void;
  onInputChange?: (input: string) => void;
  placeholder?: string;
  label: string;
  isLoading?: boolean;
  emptyMessage?: string;
  filterFn?: (option: AutocompleteOption, input: string) => boolean;
  freeSolo?: boolean;
  className?: string;
  style?: CSSProperties;
}

// ── Default fuzzy filter ────────────────────────────────────────────────────

function defaultFilter(option: AutocompleteOption, input: string): boolean {
  if (!input) return true;
  const query = input.toLowerCase();
  const label = option.label.toLowerCase();
  // Fuzzy: check if all chars of query appear in order in label
  let qi = 0;
  for (let li = 0; li < label.length && qi < query.length; li++) {
    if (label[li] === query[qi]) qi++;
  }
  return qi === query.length;
}

// ── Dropdown positioning ────────────────────────────────────────────────────

interface DropdownPos {
  top: number;
  left: number;
  width: number;
  placement: 'below' | 'above';
}

function calcDropdown(triggerEl: HTMLElement, maxHeight: number): DropdownPos {
  const rect = triggerEl.getBoundingClientRect();
  const gap = 4;
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  const placement = spaceBelow >= maxHeight + gap || spaceBelow >= spaceAbove ? 'below' : 'above';

  return {
    top:
      placement === 'below'
        ? rect.bottom + window.scrollY + gap
        : rect.top + window.scrollY - maxHeight - gap,
    left: rect.left + window.scrollX,
    width: rect.width,
    placement,
  };
}

// ── Spinner ─────────────────────────────────────────────────────────────────

function Spinner({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
    >
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="2" opacity="0.3" />
      <path
        d="M14 8a6 6 0 00-6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Component ───────────────────────────────────────────────────────────────

const MAX_DROPDOWN_HEIGHT = 280;

export function TkxAutocomplete({
  options,
  value,
  onChange,
  onInputChange,
  placeholder = '',
  label,
  isLoading = false,
  emptyMessage,
  filterFn,
  freeSolo = false,
  className,
  style,
}: TkxAutocompleteProps) {
  const theme = useTheme();
  const t = useLocale();
  const resolvedEmpty = emptyMessage ?? t.noResults;
  const reducedMotion = useReducedMotion();
  const inputId = useId();
  const listboxId = useId();

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null);

  // Sync input value from controlled value
  useEffect(() => {
    if (value !== undefined) {
      const selectedOption = options.find((o) => o.value === value);
      setInputValue(selectedOption ? selectedOption.label : value);
    }
  }, [value, options]);

  const filter = filterFn ?? defaultFilter;

  const filtered = useMemo(() => {
    if (!isOpen) return [];
    return options.filter((o) => filter(o, inputValue));
  }, [options, inputValue, isOpen, filter]);

  const safeLabel = sanitizeString(label);
  const safeEmptyMessage = sanitizeString(resolvedEmpty);

  // Position the dropdown
  useEffect(() => {
    if (!isOpen || !wrapperRef.current) return;
    const update = () => {
      if (!wrapperRef.current) return;
      setDropdownPos(calcDropdown(wrapperRef.current, MAX_DROPDOWN_HEIGHT));
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: PointerEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      // check portal dropdown
      const dropdown = document.getElementById(listboxId);
      if (dropdown?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [isOpen, listboxId]);

  useEscapeKey(() => setIsOpen(false), isOpen);

  const selectOption = useCallback(
    (option: AutocompleteOption) => {
      if (option.disabled) return;
      setInputValue(option.label);
      onChange?.(option.value);
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
    [onChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = sanitizeUnicode(e.target.value);
    setInputValue(val);
    onInputChange?.(val);
    if (!isOpen) setIsOpen(true);
    setActiveIndex(-1);
    if (freeSolo) {
      onChange?.(val);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setActiveIndex((prev) => {
          let next = prev + 1;
          while (next < filtered.length && filtered[next].disabled) next++;
          return next < filtered.length ? next : prev;
        });
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setActiveIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && filtered[next].disabled) next--;
          return next >= 0 ? next : prev;
        });
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          selectOption(filtered[activeIndex]);
        } else if (freeSolo && inputValue) {
          onChange?.(inputValue);
          setIsOpen(false);
        }
        break;
      }
      case 'Escape': {
        setIsOpen(false);
        setActiveIndex(-1);
        break;
      }
    }
  };

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex < 0) return;
    const optionId = `${listboxId}-opt-${activeIndex}`;
    document.getElementById(optionId)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, listboxId]);

  const activeDescendant =
    activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined;

  const animStyle: CSSProperties = reducedMotion
    ? {}
    : { animation: 'tkxAutoFadeIn 120ms ease forwards' };

  const dropdown =
    isOpen && typeof document !== 'undefined' && dropdownPos
      ? createPortal(
          <ul
            id={listboxId}
            role="listbox"
            aria-label={safeLabel}
            className={tkx('absolute z-[9200] list-none m-0 p-1 rounded-lg overflow-y-auto font-sans')}
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              maxHeight: MAX_DROPDOWN_HEIGHT,
              backgroundColor: theme.css.surface,
              border: `1px solid ${theme.css.border}`,
              boxShadow: `0 8px 24px rgba(0,0,0,0.15)`,
              ...animStyle,
            }}
          >
            {isLoading ? (
              <li
                role="option"
                aria-selected={false}
                aria-disabled="true"
                className={tkx('flex items-center gap-2 px-3 py-2 text-sm')}
                style={{ color: theme.css.textMuted }}
              >
                <Spinner color={theme.css.primary} />
                Loading...
              </li>
            ) : filtered.length === 0 ? (
              <li
                role="option"
                aria-selected={false}
                aria-disabled="true"
                className={tkx('px-3 py-2 text-sm text-center')}
                style={{ color: theme.css.textMuted }}
              >
                {safeEmptyMessage}
              </li>
            ) : (
              filtered.map((option, idx) => {
                const isActive = idx === activeIndex;
                const safeOptionLabel = sanitizeString(option.label);
                const safeDesc = option.description
                  ? sanitizeString(option.description)
                  : null;

                return (
                  <li
                    key={option.value}
                    id={`${listboxId}-opt-${idx}`}
                    role="option"
                    aria-selected={option.value === value}
                    aria-disabled={option.disabled || undefined}
                    className={tkx(
                      'flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer',
                      option.disabled ? 'opacity-50 cursor-not-allowed' : '',
                    )}
                    style={{
                      backgroundColor: isActive ? theme.css.surfaceAlt : 'transparent',
                      color: option.disabled ? theme.css.textMuted : theme.css.text,
                      transition: reducedMotion ? 'none' : 'background-color 100ms ease',
                    }}
                    onMouseEnter={() => !option.disabled && setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault(); // keep focus on input
                      selectOption(option);
                    }}
                  >
                    {option.icon && (
                      <span aria-hidden="true" className={tkx('flex-shrink-0')}>
                        {option.icon}
                      </span>
                    )}
                    <span className={tkx('flex flex-col min-w-0')}>
                      <span className={tkx('truncate')}>{safeOptionLabel}</span>
                      {safeDesc && (
                        <span
                          className={tkx('text-xs truncate')}
                          style={{ color: theme.css.textMuted }}
                        >
                          {safeDesc}
                        </span>
                      )}
                    </span>
                    {option.value === value && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                        className={tkx('ml-auto flex-shrink-0')}
                      >
                        <path
                          d="M3 8l3.5 3.5L13 5"
                          stroke={theme.css.primary}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </li>
                );
              })
            )}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div
      ref={wrapperRef}
      className={tkx('relative font-sans', className ?? '')}
      style={style}
    >
      {/* Label */}
      <label
        htmlFor={inputId}
        className={tkx('block text-sm font-medium mb-1.5')}
        style={{ color: theme.css.text }}
      >
        {safeLabel}
      </label>

      {/* Input */}
      <div
        className={tkx('relative flex items-center')}
        style={{
          backgroundColor: theme.css.surface,
          border: `1px solid ${isOpen ? theme.css.primary : theme.css.border}`,
          borderRadius: 8,
          transition: reducedMotion ? 'none' : 'border-color 150ms ease',
        }}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          aria-label={safeLabel}
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={tkx(
            'w-full bg-transparent border-none outline-none text-sm py-2.5 px-3',
            'placeholder:opacity-50',
          )}
          style={{
            color: theme.css.text,
          }}
        />
        {isLoading && (
          <span className={tkx('pr-3')}>
            <Spinner color={theme.css.primary} />
          </span>
        )}
      </div>

      {dropdown}

      {/* Keyframes */}
      {isOpen && !reducedMotion && (
        <style>{`
          @keyframes tkxAutoFadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      )}
    </div>
  );
}

export default TkxAutocomplete;