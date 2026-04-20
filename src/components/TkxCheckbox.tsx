'use client';

import {
  forwardRef,
  useId,
  useRef,
  useEffect,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { getAccessibleForeground } from '../engine/wcag';
import { useReducedMotion } from '../hooks';
import { tkx, cx } from '../engine/tkx';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface TkxCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: ReactNode;
  hint?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  isIndeterminate?: boolean;
  size?: CheckboxSize;
  colorScheme?: 'primary' | 'success' | 'danger' | 'warning';
}

const SIZE_MAP: Record<CheckboxSize, { box: number; fontSize: string; iconStroke: number }> = {
  sm: { box: 16, fontSize: '13px', iconStroke: 2.5 },
  md: { box: 20, fontSize: '14px', iconStroke: 2.5 },
  lg: { box: 24, fontSize: '15px', iconStroke: 2 },
};

export const TkxCheckbox = forwardRef<HTMLInputElement, TkxCheckboxProps>(
  (
    {
      label,
      hint,
      isInvalid,
      errorMessage,
      isIndeterminate = false,
      size = 'md',
      colorScheme = 'primary',
      checked,
      defaultChecked,
      onChange,
      disabled,
      className,
      style,
      id: idProp,
      ...rest
    },
    ref,
  ) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const autoId = useId();
    const id = idProp ?? autoId;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;

    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocusVisible, setIsFocusVisible] = useState(false);

    const sz = SIZE_MAP[size];
    const hasError = isInvalid || !!errorMessage;

    const schemeColor: Record<string, string> = {
      primary: theme.primary,
      success: theme.success,
      danger: theme.danger,
      warning: theme.warning,
    };
    const accentColor = schemeColor[colorScheme] ?? theme.primary;

    const isChecked = checked !== undefined ? checked : undefined;

    // Set indeterminate imperatively — only supported via JS ref
    useEffect(() => {
      const el = (ref as React.RefObject<HTMLInputElement>)?.current ?? inputRef.current;
      if (el) el.indeterminate = isIndeterminate;
    }, [isIndeterminate, ref]);

    const isVisuallyChecked = isIndeterminate || (isChecked ?? false);
    const boxBg = isVisuallyChecked ? accentColor : theme.surface;
    const boxBorder = hasError ? theme.danger : isVisuallyChecked ? accentColor : theme.border;
    const checkColor = getAccessibleForeground(accentColor);

    const focusRingStyle: React.CSSProperties = isFocusVisible
      ? { outline: `2px solid ${accentColor}`, outlineOffset: '2px' }
      : {};

    const describedBy = [hint && hintId, hasError && errorId].filter(Boolean).join(' ') || undefined;

    const animStyle: React.CSSProperties =
      !reducedMotion && isVisuallyChecked
        ? { animation: 'tkx-check-scale-in 120ms ease forwards' }
        : {};

    return (
      <div
        className={cx(tkx('flex flex-col gap-1'), className)}
        style={{ opacity: disabled ? 0.5 : 1, ...style }}
      >
        <style>{`
          @keyframes tkx-check-scale-in {
            from { transform: scale(0.4); opacity: 0; }
            to   { transform: scale(1);   opacity: 1; }
          }
        `}</style>

        <label
          htmlFor={id}
          className={tkx('flex items-center gap-2 select-none')}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
        >
          {/* Hidden native input */}
          <input
            ref={(el) => {
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
              if (typeof ref === 'function') ref(el);
              else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }}
            id={id}
            type="checkbox"
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            onFocus={(e) => {
              if (e.target.matches(':focus-visible')) setIsFocusVisible(true);
            }}
            onBlur={() => setIsFocusVisible(false)}
            className={tkx('sr-only')}
            {...rest}
          />

          {/* Custom styled box */}
          <span
            aria-hidden="true"
            style={{
              width: sz.box,
              height: sz.box,
              minWidth: sz.box,
              borderRadius: '4px',
              border: `2px solid ${boxBorder}`,
              backgroundColor: boxBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: reducedMotion ? 'none' : 'background-color 120ms, border-color 120ms',
              boxSizing: 'border-box',
              ...focusRingStyle,
            }}
          >
            {isIndeterminate ? (
              <span
                aria-hidden="true"
                style={{
                  display: 'block',
                  width: sz.box * 0.5,
                  height: 2,
                  backgroundColor: checkColor,
                  borderRadius: '1px',
                  ...animStyle,
                }}
              />
            ) : isVisuallyChecked ? (
              <svg
                width={sz.box * 0.6}
                height={sz.box * 0.6}
                viewBox="0 0 24 24"
                fill="none"
                stroke={checkColor}
                strokeWidth={sz.iconStroke}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={animStyle}
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : null}
          </span>

          {label && (
            <span style={{ fontSize: sz.fontSize, color: theme.text, lineHeight: 1.4 }}>
              {typeof label === 'string' ? sanitizeString(label) : label}
            </span>
          )}
        </label>

        {hint && !hasError && (
          <span id={hintId} className={tkx('text-xs ml-7')} style={{ color: theme.textMuted, marginLeft: sz.box + 8 }}>
            {sanitizeString(hint)}
          </span>
        )}
        {hasError && errorMessage && (
          <span
            id={errorId}
            role="alert"
            className={tkx('text-xs flex items-center gap-1')}
            style={{ color: theme.danger, marginLeft: sz.box + 8 }}
          >
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

TkxCheckbox.displayName = 'TkxCheckbox';