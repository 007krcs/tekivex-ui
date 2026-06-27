'use client';

import {
  forwardRef,
  useId,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useImperativeHandle,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString, sanitizeUnicode } from '../engine/security';
import { tkx, cx } from '../engine/tkx';

// ─────────────────────────────────────────────────────────────────────────────
// TkxTextarea — the multi-line counterpart to TkxInput.
//
// Same label / hint / error / isInvalid / isRequired surface as TkxInput, plus
// the things people actually want from a textarea:
//   - autoResize: grow with content between minRows and maxRows
//   - showCount + maxLength: live "n / max" character counter
//   - unicodeSafe: strip Trojan-Source / zero-width chars on input (default on)
//
// Forwards a ref to the underlying <textarea>.
// ─────────────────────────────────────────────────────────────────────────────

export interface TkxTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'rows'> {
  label: string;
  id?: string;
  error?: string;
  hint?: string;
  isInvalid?: boolean;
  isRequired?: boolean;
  /** Grow the textarea with its content (disables manual resize). Default false. */
  autoResize?: boolean;
  /** Minimum visible rows. Default 3. */
  minRows?: number;
  /** Maximum rows before the textarea scrolls (autoResize only). Default 8. */
  maxRows?: number;
  /** Show a live character counter (pairs with maxLength). Default false. */
  showCount?: boolean;
  /**
   * Strip zero-width and bidi-override Unicode on input (homograph /
   * Trojan-Source defence). Default true; set false only for inputs that
   * legitimately need such characters (e.g. translation UIs).
   */
  unicodeSafe?: boolean;
}

export const TkxTextarea = forwardRef<HTMLTextAreaElement, TkxTextareaProps>(
  (
    {
      label,
      id: idProp,
      error,
      hint,
      isInvalid,
      isRequired,
      autoResize = false,
      minRows = 3,
      maxRows = 8,
      showCount = false,
      maxLength,
      disabled,
      className,
      style,
      unicodeSafe = true,
      value,
      defaultValue,
      onChange,
      ...rest
    },
    ref,
  ) => {
    const theme = useTheme();
    const autoId = useId();
    const id = idProp ?? autoId;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const countId = `${id}-count`;
    const hasError = isInvalid || !!error;

    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement, []);

    // Track length for the counter in uncontrolled mode too.
    const [count, setCount] = useState(
      () => String(value ?? defaultValue ?? '').length,
    );

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoResize) return;
      el.style.height = 'auto';
      const cs = window.getComputedStyle(el);
      const lineHeight = parseFloat(cs.lineHeight) || 20;
      const padding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
      const maxH = lineHeight * maxRows + padding + border;
      const next = Math.min(el.scrollHeight, maxH);
      el.style.height = `${next}px`;
      el.style.overflowY = el.scrollHeight > maxH ? 'auto' : 'hidden';
    }, [autoResize, maxRows]);

    // Resize on mount + whenever the controlled value changes.
    useLayoutEffect(() => {
      resize();
    }, [resize, value]);

    const describedBy =
      [hint && hintId, hasError && errorId, showCount && countId]
        .filter(Boolean)
        .join(' ') || undefined;

    const safeLabel = sanitizeString(label);
    const safeError = error ? sanitizeString(error) : undefined;
    const safeHint = hint ? sanitizeString(hint) : undefined;
    const borderColor = hasError ? theme.danger : theme.border;

    return (
      <div className={cx(tkx('flex flex-col gap-1 w-full'), className)} style={style}>
        <label
          htmlFor={id}
          className={tkx('text-sm font-medium font-sans')}
          style={{ color: theme.text }}
        >
          {safeLabel}
          {isRequired && (
            <span aria-hidden="true" className={tkx('ml-1')} style={{ color: theme.danger }}>
              *
            </span>
          )}
        </label>

        <textarea
          ref={innerRef}
          id={id}
          rows={minRows}
          maxLength={maxLength}
          aria-invalid={hasError}
          aria-required={isRequired}
          aria-describedby={describedBy}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          className={tkx(
            'w-full rounded-lg text-sm font-sans py-2.5 px-3 outline-none',
            'transition-colors duration-150 focus-visible:focus-ring',
            disabled ? 'opacity-60' : '',
          )}
          style={{
            color: theme.text,
            backgroundColor: theme.surface,
            border: `1.5px solid ${borderColor}`,
            resize: autoResize ? 'none' : 'vertical',
            minHeight: autoResize ? undefined : `calc(${minRows} * 1.5em + 1.25rem)`,
            boxSizing: 'border-box',
          }}
          onChange={(e) => {
            if (unicodeSafe) {
              const clean = sanitizeUnicode(e.target.value);
              if (clean !== e.target.value) e.target.value = clean;
            }
            setCount(e.target.value.length);
            resize();
            onChange?.(e);
          }}
          {...rest}
        />

        <div className={tkx('flex items-start justify-between gap-2')}>
          <div className={tkx('flex-1 min-w-0')}>
            {safeHint && !safeError && (
              <span id={hintId} className={tkx('text-xs')} style={{ color: theme.textMuted }}>
                {safeHint}
              </span>
            )}
            {safeError && (
              <span
                id={errorId}
                role="alert"
                className={tkx('text-xs flex items-center gap-1')}
                style={{ color: theme.danger }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {safeError}
              </span>
            )}
          </div>
          {showCount && (
            <span
              id={countId}
              className={tkx('text-xs tabular-nums shrink-0')}
              style={{ color: maxLength && count >= maxLength ? theme.danger : theme.textMuted }}
            >
              {count}
              {maxLength ? ` / ${maxLength}` : ''}
            </span>
          )}
        </div>
      </div>
    );
  },
);

TkxTextarea.displayName = 'TkxTextarea';
