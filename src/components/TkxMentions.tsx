import { type ReactNode, useState, useRef, useCallback, useEffect } from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ────────────────────────────────────────────────────────────────────

export interface MentionOption {
  value: string;
  label: string;
  avatar?: string;
}

export interface TkxMentionsProps {
  options: MentionOption[];
  value?: string;
  onChange?: (value: string) => void;
  trigger?: string;
  placeholder?: string;
  label?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export function TkxMentions({
  options,
  value = '',
  onChange,
  trigger = '@',
  placeholder,
  label,
}: TkxMentionsProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const [text, setText] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [triggerPos, setTriggerPos] = useState(-1);

  useEffect(() => {
    if (value !== undefined) setText(value);
  }, [value]);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setText(val);
      onChange?.(val);

      const cursorPos = e.target.selectionStart ?? val.length;
      const beforeCursor = val.slice(0, cursorPos);
      const lastTrigger = beforeCursor.lastIndexOf(trigger);

      if (lastTrigger >= 0) {
        const afterTrigger = beforeCursor.slice(lastTrigger + trigger.length);
        if (!/\s/.test(afterTrigger)) {
          setQuery(afterTrigger);
          setTriggerPos(lastTrigger);
          setShowDropdown(true);
          setActiveIdx(0);
          return;
        }
      }
      setShowDropdown(false);
    },
    [trigger, onChange],
  );

  const insertMention = useCallback(
    (opt: MentionOption) => {
      const before = text.slice(0, triggerPos);
      const after = text.slice(
        triggerPos + trigger.length + query.length,
      );
      const newText = `${before}${trigger}${opt.value} ${after}`;
      setText(newText);
      onChange?.(newText);
      setShowDropdown(false);
      inputRef.current?.focus();
    },
    [text, triggerPos, trigger, query, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => (i + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter' && filtered[activeIdx]) {
        e.preventDefault();
        insertMention(filtered[activeIdx]);
      } else if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    },
    [showDropdown, filtered, activeIdx, insertMention],
  );

  // Scroll active option into view
  useEffect(() => {
    if (!showDropdown || !dropdownRef.current) return;
    const active = dropdownRef.current.children[activeIdx] as HTMLElement;
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx, showDropdown]);

  const safeLabel = label ? sanitizeString(label) : undefined;
  const safePlaceholder = placeholder ? sanitizeString(placeholder) : undefined;

  return (
    <div className={tkx('relative font-sans')} style={{ width: '100%' }}>
      {safeLabel && (
        <label
          className={tkx('block text-sm font-medium mb-1')}
          style={{ color: theme.text }}
        >
          {safeLabel}
        </label>
      )}

      <textarea
        ref={inputRef}
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-label={safeLabel ?? 'Mentions input'}
        value={text}
        placeholder={safePlaceholder}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className={tkx('w-full rounded-lg border px-3 py-2 text-sm resize-y')}
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.text,
          minHeight: 80,
          outline: 'none',
        }}
        rows={3}
      />

      {showDropdown && filtered.length > 0 && (
        <ul
          ref={dropdownRef}
          role="listbox"
          aria-label="Mention suggestions"
          className={tkx('absolute left-0 right-0 z-50 rounded-lg border overflow-auto')}
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            maxHeight: 200,
            top: '100%',
            marginTop: 4,
            listStyle: 'none',
            padding: 0,
            boxShadow: `0 4px 12px ${theme.bg}80`,
            animation: reducedMotion ? 'none' : 'tkxFadeIn 0.15s ease',
          }}
        >
          {filtered.map((opt, idx) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={idx === activeIdx}
              className={tkx('flex items-center gap-3 px-3 py-2 cursor-pointer text-sm')}
              style={{
                backgroundColor: idx === activeIdx ? theme.surfaceAlt : 'transparent',
                color: theme.text,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(opt);
              }}
              onMouseEnter={() => setActiveIdx(idx)}
            >
              {opt.avatar && (
                <img
                  src={sanitizeString(opt.avatar)}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  className={tkx('rounded-full')}
                  style={{ objectFit: 'cover' }}
                />
              )}
              <span>{sanitizeString(opt.label)}</span>
              <span style={{ color: theme.textMuted, marginLeft: 'auto' }}>
                {trigger}{sanitizeString(opt.value)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
