'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type CSSProperties,
  type ReactNode,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';
import { useTheme } from '../themes';
import { tkx, cx } from '../engine/tkx';
import { sanitizeString } from '../engine/security';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TkxOTPProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  type?: 'number' | 'alphanumeric' | 'alpha';
  mask?: boolean;
  autoFocus?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  separator?: ReactNode;
  separatorPosition?: number;
  className?: string;
  style?: CSSProperties;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SIZE_MAP = {
  sm: { box: '36px', fontSize: '1rem',  gap: '6px' },
  md: { box: '44px', fontSize: '1.25rem', gap: '8px' },
  lg: { box: '52px', fontSize: '1.5rem',  gap: '10px' },
};

const TYPE_PATTERN: Record<NonNullable<TkxOTPProps['type']>, RegExp> = {
  number:       /^\d$/,
  alphanumeric: /^[a-zA-Z0-9]$/,
  alpha:        /^[a-zA-Z]$/,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function filterByType(char: string, type: NonNullable<TkxOTPProps['type']>): string {
  return TYPE_PATTERN[type].test(char) ? char.toUpperCase() : '';
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TkxOTP({
  length = 6,
  value,
  onChange,
  onComplete,
  type = 'number',
  mask = false,
  autoFocus = false,
  isDisabled = false,
  isInvalid = false,
  errorMessage,
  hint,
  size = 'md',
  separator,
  separatorPosition,
  className,
  style,
}: TkxOTPProps) {
  const theme = useTheme();
  const groupId = useId();
  const hintId = `${groupId}-hint`;
  const errorId = `${groupId}-error`;

  const isControlled = value !== undefined;

  const toArr = (v: string): string[] => {
    const arr = v.split('').slice(0, length);
    while (arr.length < length) arr.push('');
    return arr;
  };

  const [internalDigits, setInternalDigits] = useState<string[]>(() =>
    toArr(isControlled ? value! : ''),
  );

  const digits = isControlled ? toArr(value!) : internalDigits;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sz = SIZE_MAP[size];
  const hasError = isInvalid || !!errorMessage;
  const isComplete = digits.every((d) => d !== '');

  const safeHint = hint ? sanitizeString(hint) : undefined;
  const safeError = errorMessage ? sanitizeString(errorMessage) : undefined;

  // Compute success/error state colours
  const boxBorder = (idx: number): string => {
    if (hasError) return theme.danger;
    if (isComplete) return theme.success;
    return theme.border;
  };

  // Auto focus first input
  useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDigits = useCallback((next: string[]) => {
    if (!isControlled) setInternalDigits(next);
    const joined = next.join('');
    onChange?.(joined);
    if (next.every((d) => d !== '')) {
      onComplete?.(joined);
    }
  }, [isControlled, onChange, onComplete]);

  const focusAt = (idx: number) => {
    const clamped = Math.max(0, Math.min(length - 1, idx));
    inputRefs.current[clamped]?.focus();
  };

  const handleKeyDown = (idx: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (isDisabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[idx] !== '') {
        const next = [...digits];
        next[idx] = '';
        setDigits(next);
      } else if (idx > 0) {
        const next = [...digits];
        next[idx - 1] = '';
        setDigits(next);
        focusAt(idx - 1);
      }
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      const next = [...digits];
      next[idx] = '';
      setDigits(next);
      return;
    }

    if (e.key === 'ArrowLeft') { e.preventDefault(); focusAt(idx - 1); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); focusAt(idx + 1); return; }
    if (e.key === 'Home') { e.preventDefault(); focusAt(0); return; }
    if (e.key === 'End') { e.preventDefault(); focusAt(length - 1); return; }
  };

  const handleInput = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    // The value might be empty (deletion handled by keydown) or contain a char
    const raw = e.target.value;
    // Take only the last character typed (handles replacement)
    const char = raw.slice(-1);
    if (!char) return;

    const filtered = filterByType(char, type);
    if (!filtered) return;

    const next = [...digits];
    next[idx] = filtered;
    setDigits(next);

    // Advance focus
    if (idx < length - 1) focusAt(idx + 1);
  };

  const handlePaste = (idx: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isDisabled) return;
    const pasted = e.clipboardData.getData('text');
    const chars = pasted.split('').map((c) => filterByType(c, type)).filter(Boolean);
    if (!chars.length) return;

    const next = [...digits];
    let cursor = idx;
    for (const ch of chars) {
      if (cursor >= length) break;
      next[cursor] = ch;
      cursor++;
    }
    setDigits(next);
    focusAt(Math.min(cursor, length - 1));
  };

  const describedBy = [safeHint && hintId, hasError && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cx(tkx('flex flex-col gap-2 w-fit'), className)} style={style}>
      <div
        role="group"
        aria-label="One-time password"
        aria-describedby={describedBy}
        className={tkx('flex items-center')}
        style={{ gap: sz.gap }}
      >
        {Array.from({ length }, (_, idx) => {
          const borderCol = boxBorder(idx);
          const isFocusedEl = typeof document !== 'undefined' && document.activeElement === inputRefs.current[idx];

          return (
            <div key={idx} className={tkx('flex items-center')} style={{ gap: sz.gap }}>
              {/* Separator before this index (when separatorPosition === idx) */}
              {separator && separatorPosition === idx && idx !== 0 && (
                <span
                  aria-hidden="true"
                  style={{ color: theme.textMuted, userSelect: 'none', flexShrink: 0 }}
                >
                  {separator}
                </span>
              )}

              <input
                ref={(el) => { inputRefs.current[idx] = el; }}
                type={mask ? 'password' : 'text'}
                inputMode={type === 'number' ? 'numeric' : 'text'}
                maxLength={1}
                value={digits[idx]}
                disabled={isDisabled}
                aria-label={`Digit ${idx + 1} of ${length}`}
                autoComplete="one-time-code"
                spellCheck={false}
                onChange={handleInput(idx)}
                onKeyDown={handleKeyDown(idx)}
                onPaste={handlePaste(idx)}
                onFocus={(e) => e.target.select()}
                style={{
                  width: sz.box,
                  height: sz.box,
                  textAlign: 'center',
                  fontSize: sz.fontSize,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  border: `1.5px solid ${borderCol}`,
                  borderRadius: '8px',
                  backgroundColor: isDisabled ? theme.surfaceAlt : theme.surface,
                  color: theme.text,
                  outline: 'none',
                  boxShadow: 'none',
                  cursor: isDisabled ? 'not-allowed' : 'text',
                  transition: 'border-color 150ms ease, box-shadow 150ms ease',
                  opacity: isDisabled ? 0.6 : 1,
                  // Focus ring applied via style since we can't rely on :focus in inline styles
                }}
                onFocusCapture={(e) => {
                  if (!isDisabled) {
                    (e.currentTarget as HTMLInputElement).style.borderColor = hasError ? theme.danger : theme.primary;
                    (e.currentTarget as HTMLInputElement).style.boxShadow = `0 0 0 3px ${hasError ? theme.danger : theme.primary}33`;
                  }
                }}
                onBlurCapture={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = boxBorder(idx);
                  (e.currentTarget as HTMLInputElement).style.boxShadow = 'none';
                }}
              />
            </div>
          );
        })}
      </div>

      {safeHint && !safeError && (
        <span id={hintId} className={tkx('text-xs')} style={{ color: theme.textMuted }}>
          {safeHint}
        </span>
      )}
      {safeError && (
        <span id={errorId} role="alert" className={tkx('text-xs flex items-center gap-1')} style={{ color: theme.danger }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {safeError}
        </span>
      )}
    </div>
  );
}

TkxOTP.displayName = 'TkxOTP';