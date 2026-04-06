import {
  createContext,
  useContext,
  useId,
  useState,
  useRef,
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { getAccessibleForeground } from '../engine/wcag';
import { useReducedMotion } from '../hooks';
import { tkx, cx } from '../engine/tkx';

// ── Radio Group Context ───────────────────────────────────────────────────────

interface RadioGroupContextValue {
  name: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
  isInvalid: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroup() {
  return useContext(RadioGroupContext);
}

// ── Size map ──────────────────────────────────────────────────────────────────

const SIZE_MAP = {
  sm: { outer: 16, inner: 7, fontSize: '13px' },
  md: { outer: 20, inner: 9, fontSize: '14px' },
  lg: { outer: 24, inner: 11, fontSize: '15px' },
} as const;

// ── TkxRadio ─────────────────────────────────────────────────────────────────

export interface TkxRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'primary' | 'success' | 'danger';
}

export const TkxRadio = forwardRef<HTMLInputElement, TkxRadioProps>(
  (
    {
      label,
      hint,
      size = 'md',
      colorScheme = 'primary',
      value,
      checked: checkedProp,
      onChange: onChangeProp,
      disabled: disabledProp,
      name: nameProp,
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

    const group = useRadioGroup();

    const isChecked = group
      ? group.value === String(value ?? '')
      : (checkedProp ?? false);

    const isDisabled = disabledProp ?? group?.isDisabled ?? false;
    const radioName = nameProp ?? group?.name ?? '';

    const handleChange = () => {
      if (isDisabled) return;
      if (group) {
        group.onChange(String(value ?? ''));
      } else {
        onChangeProp?.({ target: { value: String(value ?? '') } } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const sz = SIZE_MAP[size];

    const schemeColor: Record<string, string> = {
      primary: theme.primary,
      success: theme.success,
      danger: theme.danger,
    };
    const accentColor = schemeColor[colorScheme] ?? theme.primary;
    const dotColor = getAccessibleForeground(accentColor);

    const outerBorder = isChecked ? accentColor : theme.border;
    const outerBg = theme.surface;

    const dotAnimStyle: React.CSSProperties =
      !reducedMotion && isChecked
        ? { animation: 'tkx-radio-dot-in 130ms ease forwards' }
        : {};

    return (
      <div
        className={cx(tkx('flex flex-col gap-0.5'), className)}
        style={{ opacity: isDisabled ? 0.5 : 1, ...style }}
      >
        <style>{`
          @keyframes tkx-radio-dot-in {
            from { transform: scale(0) translate(-50%, -50%); opacity: 0; }
            to   { transform: scale(1) translate(-50%, -50%); opacity: 1; }
          }
        `}</style>

        <label
          htmlFor={id}
          className={tkx('flex items-center gap-2 select-none')}
          style={{ cursor: isDisabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
        >
          {/* Hidden native input */}
          <input
            ref={ref}
            id={id}
            type="radio"
            name={radioName}
            value={value}
            checked={isChecked}
            onChange={handleChange}
            disabled={isDisabled}
            aria-invalid={group?.isInvalid}
            className={tkx('sr-only')}
            {...rest}
          />

          {/* Custom styled circle */}
          <span
            aria-hidden="true"
            style={{
              position: 'relative',
              width: sz.outer,
              height: sz.outer,
              minWidth: sz.outer,
              borderRadius: '50%',
              border: `2px solid ${outerBorder}`,
              backgroundColor: outerBg,
              display: 'inline-block',
              boxSizing: 'border-box',
              transition: reducedMotion ? 'none' : 'border-color 120ms',
            }}
          >
            {isChecked && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: sz.inner,
                  height: sz.inner,
                  borderRadius: '50%',
                  backgroundColor: accentColor,
                  transform: 'translate(-50%, -50%)',
                  transformOrigin: 'center',
                  ...(reducedMotion ? {} : { animation: 'tkx-radio-dot-in 130ms ease forwards' }),
                }}
              />
            )}
          </span>

          {label && (
            <span style={{ fontSize: sz.fontSize, color: theme.text, lineHeight: 1.4 }}>
              {typeof label === 'string' ? sanitizeString(label) : label}
            </span>
          )}
        </label>

        {hint && (
          <span
            className={tkx('text-xs')}
            style={{ color: theme.textMuted, marginLeft: sz.outer + 8 }}
          >
            {sanitizeString(hint)}
          </span>
        )}
      </div>
    );
  },
);

TkxRadio.displayName = 'TkxRadio';

// ── TkxRadioGroup ─────────────────────────────────────────────────────────────

export interface TkxRadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  children: ReactNode;
}

export function TkxRadioGroup({
  name,
  value: valueProp,
  defaultValue = '',
  onChange,
  label,
  orientation = 'vertical',
  isDisabled = false,
  isInvalid = false,
  errorMessage,
  children,
}: TkxRadioGroupProps) {
  const theme = useTheme();
  const groupId = useId();
  const errorId = `${groupId}-error`;

  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const currentValue = isControlled ? valueProp : internalValue;

  const handleChange = (val: string) => {
    if (!isControlled) setInternalValue(val);
    onChange?.(val);
  };

  const hasError = isInvalid || !!errorMessage;

  return (
    <RadioGroupContext.Provider
      value={{ name, value: currentValue, onChange: handleChange, isDisabled, isInvalid }}
    >
      <div
        role="radiogroup"
        aria-label={label ? sanitizeString(label) : undefined}
        aria-describedby={hasError ? errorId : undefined}
        aria-invalid={hasError}
      >
        {label && (
          <div
            className={tkx('text-sm font-medium font-sans mb-2')}
            style={{ color: theme.text }}
          >
            {sanitizeString(label)}
          </div>
        )}

        <div
          className={tkx(
            orientation === 'horizontal' ? 'flex flex-row flex-wrap gap-4' : 'flex flex-col gap-2',
          )}
        >
          {children}
        </div>

        {hasError && errorMessage && (
          <span
            id={errorId}
            role="alert"
            className={tkx('text-xs flex items-center gap-1 mt-1')}
            style={{ color: theme.danger }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {sanitizeString(errorMessage)}
          </span>
        )}
      </div>
    </RadioGroupContext.Provider>
  );
}
