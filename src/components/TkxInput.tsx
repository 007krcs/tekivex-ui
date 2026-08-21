'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../themes';
import { sanitizeString, sanitizeUnicode } from '../engine/security';
import { tkx, cx } from '../engine/tkx';

export interface TkxInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  id?: string;
  error?: string;
  hint?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  isInvalid?: boolean;
  isRequired?: boolean;
  /**
   * Strip zero-width and bidi-override Unicode characters on input. Blocks
   * homograph / Trojan-Source attacks. Default: true. Set false only for
   * specialized inputs (e.g. translation UIs) that legitimately need them.
   */
  unicodeSafe?: boolean;
}

export const TkxInput = forwardRef<HTMLInputElement, TkxInputProps>(
  ({ label, id: idProp, error, hint, leftAddon, rightAddon, isInvalid, isRequired, disabled, className, style, unicodeSafe = true, onChange, ...rest }, ref) => {
    const theme = useTheme();
    const autoId = useId();
    const id = idProp ?? autoId;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const hasError = isInvalid || !!error;
    const safeLabel = sanitizeString(label);
    const safeError = error ? sanitizeString(error) : undefined;
    const safeHint = hint ? sanitizeString(hint) : undefined;

    // Idrefs must mirror the render gates below exactly: the hint renders only
    // without an error, and the error span renders only when there IS an error
    // string (isInvalid alone renders none) — otherwise describedBy dangles.
    const describedBy =
      [safeHint && !safeError && hintId, safeError && errorId].filter(Boolean).join(' ') ||
      undefined;

    const borderColor = hasError ? theme.css.danger : theme.css.border;

    return (
      <div className={cx(tkx('flex flex-col gap-1 w-full'), className)} style={style}>
        <label
          htmlFor={id}
          className={tkx('text-sm font-medium font-sans')}
          style={{ color: theme.css.text }}
        >
          {safeLabel}
          {isRequired && <span aria-hidden="true" className={tkx('ml-1')} style={{ color: theme.css.danger }}>*</span>}
        </label>

        <div
          className={tkx(
            'flex items-center rounded-lg overflow-hidden',
            'transition-colors duration-150',
            disabled ? 'opacity-60' : '',
          )}
          style={{ border: `1.5px solid ${borderColor}`, backgroundColor: theme.css.surface }}
        >
          {leftAddon && (
            <div
              className={tkx('px-2.5 self-stretch flex items-center text-sm shrink-0')}
              style={{ backgroundColor: theme.css.surfaceAlt, color: theme.css.textMuted, borderRight: `1px solid ${theme.css.border}` }}
            >
              {leftAddon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            aria-invalid={hasError}
            aria-required={isRequired}
            aria-describedby={describedBy}
            disabled={disabled}
            className={cx(
              tkx('flex-1 border-none bg-transparent text-sm font-sans py-2.5 px-3 outline-none min-w-0 focus-visible:focus-ring'),
            )}
            style={{ color: theme.css.text }}
            onChange={unicodeSafe
              ? (e) => {
                  const clean = sanitizeUnicode(e.target.value);
                  if (clean !== e.target.value) {
                    e.target.value = clean;
                  }
                  onChange?.(e);
                }
              : onChange}
            {...rest}
          />

          {rightAddon && (
            <div
              className={tkx('px-2.5 self-stretch flex items-center text-sm shrink-0')}
              style={{ backgroundColor: theme.css.surfaceAlt, color: theme.css.textMuted, borderLeft: `1px solid ${theme.css.border}` }}
            >
              {rightAddon}
            </div>
          )}
        </div>

        {safeHint && !safeError && (
          <span id={hintId} className={tkx('text-xs')} style={{ color: theme.css.textMuted }}>{safeHint}</span>
        )}
        {safeError && (
          <span id={errorId} role="alert" className={tkx('text-xs flex items-center gap-1')} style={{ color: theme.css.danger }}>
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

TkxInput.displayName = 'TkxInput';