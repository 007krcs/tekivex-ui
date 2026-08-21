'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type CSSProperties,
  type KeyboardEvent,
  type WheelEvent,
} from 'react';
import { useTheme } from '../themes';
import { useLocale } from '../i18n';
import { tkx, cx } from '../engine/tkx';
import { sanitizeString, sanitizeUnicode } from '../engine/security';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TkxNumberInputProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  prefix?: string;
  suffix?: string;
  format?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  locale?: string;
  clampOnBlur?: boolean;
  allowMouseWheel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  /**
   * Accessible name used when no visible `label` is supplied. role="spinbutton"
   * is not named from content, so the control would otherwise be nameless.
   * Defaults to the visible label, else "Number".
   */
  ariaLabel?: string;
  hint?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

// ── Size maps ─────────────────────────────────────────────────────────────────

const SIZE_MAP = {
  sm: { height: '32px', fontSize: '0.8125rem', px: '8px', btnW: '28px', iconSz: 14 },
  md: { height: '40px', fontSize: '0.875rem',  px: '12px', btnW: '34px', iconSz: 16 },
  lg: { height: '48px', fontSize: '1rem',       px: '14px', btnW: '40px', iconSz: 18 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, min?: number, max?: number): number {
  let result = v;
  if (min !== undefined) result = Math.max(result, min);
  if (max !== undefined) result = Math.min(result, max);
  return result;
}

function roundToPrecision(v: number, precision?: number): number {
  if (precision === undefined) return v;
  const factor = Math.pow(10, precision);
  return Math.round(v * factor) / factor;
}

function formatValue(
  value: number,
  format?: TkxNumberInputProps['format'],
  currency?: string,
  locale?: string,
  precision?: number,
): string {
  const loc = locale ?? 'en-US';
  if (format === 'currency') {
    return new Intl.NumberFormat(loc, {
      style: 'currency',
      currency: currency ?? 'USD',
      minimumFractionDigits: precision ?? 2,
      maximumFractionDigits: precision ?? 2,
    }).format(value);
  }
  if (format === 'percent') {
    return new Intl.NumberFormat(loc, {
      style: 'percent',
      minimumFractionDigits: precision ?? 0,
      maximumFractionDigits: precision ?? 0,
    }).format(value / 100);
  }
  if (format === 'decimal' || precision !== undefined) {
    return new Intl.NumberFormat(loc, {
      minimumFractionDigits: precision ?? 0,
      maximumFractionDigits: precision ?? 20,
    }).format(value);
  }
  return String(value);
}

// ── Stepper button ────────────────────────────────────────────────────────────

interface StepperBtnProps {
  direction: 'inc' | 'dec';
  isDisabled: boolean;
  btnW: string;
  height: string;
  primaryColor: string;
  borderColor: string;
  textMuted: string;
  iconSz: number;
  onStep: (dir: 1 | -1) => void;
  incrementLabel: string;
  decrementLabel: string;
}

function StepperBtn({ direction, isDisabled, btnW, height, primaryColor, borderColor, textMuted, iconSz, onStep, incrementLabel, decrementLabel }: StepperBtnProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dir = direction === 'inc' ? 1 : -1;

  const startHold = useCallback(() => {
    onStep(dir);
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => onStep(dir), 60);
    }, 400);
  }, [dir, onStep]);

  const stopHold = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  useEffect(() => () => stopHold(), [stopHold]);

  const isInc = direction === 'inc';

  return (
    <button
      type="button"
      aria-label={isInc ? incrementLabel : decrementLabel}
      disabled={isDisabled}
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
      onTouchStart={(e) => { e.preventDefault(); startHold(); }}
      onTouchEnd={stopHold}
      style={{
        width: btnW,
        height,
        minWidth: btnW,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        borderRight: isInc ? undefined : `1px solid ${borderColor}`,
        borderLeft: isInc ? `1px solid ${borderColor}` : undefined,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        color: isDisabled ? textMuted : primaryColor,
        transition: 'color 120ms ease, background 120ms ease',
        outline: 'none',
      }}
      onFocus={(e) => { if (!isDisabled) (e.currentTarget as HTMLElement).style.background = `${primaryColor}12`; }}
      onBlur={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {isInc ? (
        <svg width={iconSz} height={iconSz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ) : (
        <svg width={iconSz} height={iconSz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TkxNumberInput({
  value,
  defaultValue = 0,
  onChange,
  min,
  max,
  step = 1,
  precision,
  prefix,
  suffix,
  format,
  currency,
  locale,
  clampOnBlur = true,
  allowMouseWheel = false,
  size = 'md',
  label,
  ariaLabel,
  hint,
  isDisabled = false,
  isReadOnly = false,
  isInvalid = false,
  errorMessage,
  id: idProp,
  className,
  style,
}: TkxNumberInputProps) {
  const theme = useTheme();
  const t = useLocale();
  const incrementLabel = t.increment ?? 'Increment';
  const decrementLabel = t.decrement ?? 'Decrement';
  const autoId = useId();
  const id = idProp ?? autoId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<number>(defaultValue);
  const numericValue = isControlled ? value! : internalValue;

  const [focused, setFocused] = useState(false);
  const [rawInput, setRawInput] = useState('');

  const sz = SIZE_MAP[size];
  const hasError = isInvalid || !!errorMessage;
  const borderColor = hasError ? theme.css.danger : focused ? theme.css.primary : theme.css.border;
  const describedBy = [hint && hintId, hasError && errorId].filter(Boolean).join(' ') || undefined;

  const safeLabel = label ? sanitizeString(label) : undefined;
  // The visible <label> only renders when `label` is set; without it the
  // spinbutton has no accessible name at all, so always supply one.
  const accessibleName = safeLabel
    ? undefined
    : (ariaLabel ? sanitizeString(ariaLabel) : 'Number');
  const safeHint = hint ? sanitizeString(hint) : undefined;
  const safeError = errorMessage ? sanitizeString(errorMessage) : undefined;
  const safePrefix = prefix ? sanitizeString(prefix) : undefined;
  const safeSuffix = suffix ? sanitizeString(suffix) : undefined;

  const setVal = useCallback((v: number) => {
    const rounded = roundToPrecision(v, precision);
    if (!isControlled) setInternalValue(rounded);
    onChange?.(rounded);
  }, [isControlled, onChange, precision]);

  const step_ = useCallback((dir: 1 | -1) => {
    if (isDisabled || isReadOnly) return;
    const next = clamp(roundToPrecision(numericValue + dir * step, precision), min, max);
    setVal(next);
  }, [isDisabled, isReadOnly, numericValue, step, precision, min, max, setVal]);

  const handleFocus = () => {
    setFocused(true);
    setRawInput(String(numericValue));
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseFloat(rawInput);
    if (isNaN(parsed)) {
      onChange?.(null);
      setRawInput(String(numericValue));
      return;
    }
    let next = roundToPrecision(parsed, precision);
    if (clampOnBlur) next = clamp(next, min, max);
    setVal(next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip bidi-override / zero-width chars before they reach parseFloat —
    // numeric input shouldn't carry them but they're a known smuggling vector.
    setRawInput(sanitizeUnicode(e.target.value));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); step_(1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); step_(-1); }
  };

  const handleWheel = (e: WheelEvent<HTMLInputElement>) => {
    if (!allowMouseWheel || !focused) return;
    e.preventDefault();
    step_(e.deltaY < 0 ? 1 : -1);
  };

  const displayValue = focused ? rawInput : formatValue(numericValue, format, currency, locale, precision);

  const showAdornment = (safePrefix || safeSuffix) && !focused;

  return (
    <div className={cx(tkx('flex flex-col gap-1 w-full'), className)} style={style}>
      {safeLabel && (
        <label
          htmlFor={id}
          className={tkx('text-sm font-medium font-sans')}
          style={{ color: theme.css.text }}
        >
          {safeLabel}
        </label>
      )}

      <div
        className={tkx('flex items-stretch overflow-hidden rounded-lg transition-colors duration-150')}
        style={{
          border: `1.5px solid ${borderColor}`,
          backgroundColor: isDisabled ? theme.css.surfaceAlt : theme.css.surface,
          opacity: isDisabled ? 0.65 : 1,
          height: sz.height,
        }}
      >
        {/* Decrement */}
        <StepperBtn
          direction="dec"
          isDisabled={isDisabled || isReadOnly}
          btnW={sz.btnW}
          height={sz.height}
          primaryColor={theme.css.primary}
          borderColor={theme.css.border}
          textMuted={theme.css.textMuted}
          iconSz={sz.iconSz}
          onStep={step_}
          incrementLabel={incrementLabel}
          decrementLabel={decrementLabel}
        />

        {/* Input area */}
        <div className={tkx('relative flex-1 flex items-center overflow-hidden')}>
          {showAdornment && safePrefix && (
            <span
              style={{
                position: 'absolute',
                left: sz.px,
                fontSize: sz.fontSize,
                color: theme.css.textMuted,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {safePrefix}
            </span>
          )}
          <input
            id={id}
            type="text"
            // spinbutton makes the aria-value* range attributes valid — on the
            // implicit textbox role AT ignores them entirely.
            role="spinbutton"
            aria-label={accessibleName}
            inputMode="decimal"
            value={focused ? rawInput : displayValue}
            readOnly={isReadOnly}
            disabled={isDisabled}
            aria-invalid={hasError}
            aria-readonly={isReadOnly || undefined}
            aria-describedby={describedBy}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={numericValue}
            aria-valuetext={!focused && displayValue !== '' ? String(displayValue) : undefined}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              textAlign: 'center',
              fontSize: sz.fontSize,
              fontFamily: 'inherit',
              color: theme.css.text,
              paddingLeft: showAdornment && safePrefix ? `calc(${sz.px} + 1.2em)` : sz.px,
              paddingRight: showAdornment && safeSuffix ? `calc(${sz.px} + 1.2em)` : sz.px,
              cursor: isDisabled ? 'not-allowed' : isReadOnly ? 'default' : 'text',
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onWheel={handleWheel}
          />
          {showAdornment && safeSuffix && (
            <span
              style={{
                position: 'absolute',
                right: sz.px,
                fontSize: sz.fontSize,
                color: theme.css.textMuted,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {safeSuffix}
            </span>
          )}
        </div>

        {/* Increment */}
        <StepperBtn
          direction="inc"
          isDisabled={isDisabled || isReadOnly}
          btnW={sz.btnW}
          height={sz.height}
          primaryColor={theme.css.primary}
          borderColor={theme.css.border}
          textMuted={theme.css.textMuted}
          iconSz={sz.iconSz}
          onStep={step_}
          incrementLabel={incrementLabel}
          decrementLabel={decrementLabel}
        />
      </div>

      {safeHint && !safeError && (
        <span id={hintId} className={tkx('text-xs')} style={{ color: theme.css.textMuted }}>
          {safeHint}
        </span>
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
}

TkxNumberInput.displayName = 'TkxNumberInput';