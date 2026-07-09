'use client';

import {
  cloneElement,
  isValidElement,
  useId,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { tkx, cx } from '../engine/tkx';

// ─────────────────────────────────────────────────────────────────────────────
// TkxField — the standalone form-control wrapper.
//
// TkxInput / TkxTextarea ship this chrome built in, but every OTHER control —
// a custom widget, a third-party input, TkxSlider, a plain <select> — had to
// re-implement label + hint + error + aria wiring by hand. TkxField extracts it:
//
//   <TkxField label="Amount" hint="In INR" error={errors.amount}>
//     <MyCustomInput />
//   </TkxField>
//
// The child receives `id`, `aria-describedby`, `aria-invalid`, and
// `aria-required` automatically (via cloneElement), or use the function-child
// form to spread them wherever you want:
//
//   <TkxField label="Amount">{(field) => <input {...field} />}</TkxField>
// ─────────────────────────────────────────────────────────────────────────────

/** The accessibility props TkxField injects into its child control. */
export interface TkxFieldChildProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

export interface TkxFieldProps {
  /** Visible, accessible label — wired to the child via htmlFor/id. */
  label: string;
  /** Explicit control id; defaults to the child's own id, else an auto id. */
  id?: string;
  /** Helper text below the control (hidden while an error shows). */
  hint?: string;
  /** Error message; sets aria-invalid on the child + role="alert" text. */
  error?: string;
  /** Force the invalid state without an error string. */
  isInvalid?: boolean;
  /** Adds aria-required + a visual (aria-hidden) asterisk. */
  isRequired?: boolean;
  /**
   * The control. A single element gets the field props injected via
   * cloneElement; a function child receives them to spread manually.
   */
  children?: ReactElement<TkxFieldChildProps> | ((field: TkxFieldChildProps) => ReactNode);
  className?: string;
  style?: CSSProperties;
}

export function TkxField({
  label,
  id: idProp,
  hint,
  error,
  isInvalid,
  isRequired,
  children,
  className,
  style,
}: TkxFieldProps) {
  const theme = useTheme();
  const autoId = useId();

  // Respect an id the child already carries so external wiring keeps working.
  const childId =
    isValidElement(children) && typeof children.props.id === 'string'
      ? children.props.id
      : undefined;
  const id = idProp ?? childId ?? autoId;

  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const hasError = isInvalid || !!error;

  const safeLabel = sanitizeString(label);
  const safeHint = hint ? sanitizeString(hint) : undefined;
  const safeError = error ? sanitizeString(error) : undefined;

  // Idrefs must mirror the render gates below exactly: the hint span only
  // renders without an error, and the error span only renders with an error
  // string (isInvalid alone renders none) — otherwise describedBy dangles.
  const describedBy =
    [safeHint && !safeError && hintId, safeError && errorId].filter(Boolean).join(' ') ||
    undefined;

  const fieldProps: TkxFieldChildProps = {
    id,
    'aria-describedby': describedBy,
    'aria-invalid': hasError || undefined,
    'aria-required': isRequired || undefined,
  };

  let control: ReactNode = null;
  if (typeof children === 'function') {
    control = children(fieldProps);
  } else if (isValidElement(children)) {
    control = cloneElement(children, fieldProps);
  }
  // children undefined / invalid → chrome-only render, never a crash.

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

      {control}

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
  );
}
