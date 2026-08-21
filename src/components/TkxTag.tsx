'use client';

import {
  useState,
  useRef,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import { useTheme } from '../themes';
import { tkx, cx } from '../engine/tkx';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TagVariant = 'solid' | 'subtle' | 'outline';
export type TagSize = 'sm' | 'md' | 'lg';
export type TagColorScheme = 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface TkxTagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  size?: TagSize;
  colorScheme?: TagColorScheme;
  onRemove?: () => void;
  leftIcon?: ReactNode;
  isDisabled?: boolean;
  clickable?: boolean;
}

export interface TkxTagInputProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  allowDuplicates?: boolean;
  validate?: (tag: string) => boolean | string;
  colorScheme?: TagColorScheme;
  size?: TagSize;
  label?: string;
  hint?: string;
  isDisabled?: boolean;
}

// ── Size maps ─────────────────────────────────────────────────────────────────

const SIZE_TEXT: Record<TagSize, string> = {
  sm: 'text-[11px]',
  md: 'text-xs',
  lg: 'text-sm',
};
const SIZE_PAD: Record<TagSize, string> = {
  sm: 'px-2 py-0.5',
  md: 'px-2.5 py-1',
  lg: 'px-3 py-1.5',
};
const SIZE_GAP: Record<TagSize, string> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-2',
};
const SIZE_REMOVE: Record<TagSize, number> = { sm: 12, md: 14, lg: 16 };

// ── Color resolver ────────────────────────────────────────────────────────────

function useTagColors(colorScheme: TagColorScheme, variant: TagVariant) {
  const theme = useTheme();

  const baseColor: Record<TagColorScheme, string> = {
    default: theme.css.textMuted,
    primary: theme.css.primary,
    secondary: theme.css.secondary,
    success: theme.css.success,
    danger: theme.css.danger,
    warning: theme.css.warning,
    info: theme.css.info,
  };

  const accent = baseColor[colorScheme];

  if (variant === 'solid') {
    return { bg: accent, color: theme.css.bg, border: 'transparent' };
  }
  if (variant === 'subtle') {
    return { bg: `${accent}22`, color: accent, border: 'transparent' };
  }
  // outline
  return { bg: 'transparent', color: accent, border: accent };
}

// ── TkxTag ────────────────────────────────────────────────────────────────────

export function TkxTag({
  variant = 'subtle',
  size = 'md',
  colorScheme = 'default',
  onRemove,
  leftIcon,
  isDisabled = false,
  clickable = false,
  children,
  className,
  style,
  onClick,
  ...rest
}: TkxTagProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const colors = useTagColors(colorScheme, variant);
  const safeLabel = typeof children === 'string' ? sanitizeString(children) : children;

  const removeSize = SIZE_REMOVE[size];

  const base = tkx(
    'inline-flex items-center font-medium rounded-full select-none',
    SIZE_TEXT[size],
    SIZE_PAD[size],
    SIZE_GAP[size],
    isDisabled ? 'opacity-50 cursor-not-allowed' : clickable ? 'cursor-pointer' : 'cursor-default',
    clickable && !reducedMotion && 'transition-opacity duration-150',
  );

  const tagBody = (
    <>
      {leftIcon && <span aria-hidden="true" className={tkx('shrink-0 flex items-center')}>{leftIcon}</span>}
      <span>{safeLabel}</span>
    </>
  );

  const removeButton = onRemove && !isDisabled && (
    <button
      type="button"
      aria-label={`Remove ${typeof children === 'string' ? children : 'tag'}`}
      onClick={(e) => { e.stopPropagation(); onRemove(); }}
      className={tkx('shrink-0 flex items-center justify-center rounded-full cursor-pointer')}
      style={{
        width: removeSize + 4,
        height: removeSize + 4,
        color: colors.color,
        backgroundColor: 'transparent',
        border: 'none',
        padding: 0,
      }}
      tabIndex={0}
    >
      <svg width={removeSize} height={removeSize} viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );

  // When the tag is clickable AND removable, nesting the remove <button>
  // inside a role="button" span puts one interactive control inside another
  // (invalid interactive-content nesting, ambiguous focus/activation). So for
  // clickable tags the outer span is a plain container, the tag body becomes
  // a real inner <button>, and the remove control is its sibling.
  if (clickable) {
    return (
      <span
        className={cx(base, className)}
        style={{
          backgroundColor: colors.bg,
          color: colors.color,
          border: `1px solid ${colors.border === 'transparent' ? 'transparent' : colors.border}`,
          ...style,
        }}
        {...rest}
      >
        <button
          type="button"
          disabled={isDisabled}
          onClick={!isDisabled ? onClick : undefined}
          className={cx(tkx('inline-flex items-center'), SIZE_GAP[size])}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            margin: 0,
            font: 'inherit',
            color: 'inherit',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {tagBody}
        </button>
        {removeButton}
      </span>
    );
  }

  return (
    <span
      aria-disabled={isDisabled || undefined}
      className={cx(base, className)}
      style={{
        backgroundColor: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border === 'transparent' ? 'transparent' : colors.border}`,
        ...style,
      }}
      onClick={!isDisabled ? onClick : undefined}
      {...rest}
    >
      {tagBody}
      {removeButton}
    </span>
  );
}

// ── TkxTagInput ───────────────────────────────────────────────────────────────

export function TkxTagInput({
  value,
  defaultValue = [],
  onChange,
  placeholder = 'Add tag…',
  maxTags,
  allowDuplicates = false,
  validate,
  colorScheme = 'primary',
  size = 'md',
  label,
  hint,
  isDisabled = false,
}: TkxTagInputProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [internalTags, setInternalTags] = useState<string[]>(defaultValue);
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const tags = isControlled ? value : internalTags;

  const updateTags = useCallback((next: string[]) => {
    if (!isControlled) setInternalTags(next);
    onChange?.(next);
  }, [isControlled, onChange]);

  const addTag = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    if (maxTags !== undefined && tags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    if (!allowDuplicates && tags.includes(trimmed)) {
      setError('Duplicate tags are not allowed');
      return;
    }

    if (validate) {
      const result = validate(trimmed);
      if (result === false) { setError('Invalid tag'); return; }
      if (typeof result === 'string') { setError(result); return; }
    }

    setError(null);
    updateTags([...tags, trimmed]);
    setInputVal('');
  }, [tags, maxTags, allowDuplicates, validate, updateTags]);

  const removeTag = useCallback((index: number) => {
    const next = tags.filter((_, i) => i !== index);
    updateTags(next);
    setError(null);
  }, [tags, updateTags]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === 'Backspace' && inputVal === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }, [inputVal, tags, addTag, removeTag]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.endsWith(',')) {
      addTag(val.slice(0, -1));
    } else {
      setInputVal(val);
      if (error) setError(null);
    }
  }, [addTag, error]);

  const containerPad = size === 'sm' ? '6px 8px' : size === 'lg' ? '10px 12px' : '8px 10px';
  const inputFontSize = size === 'sm' ? 11 : size === 'lg' ? 14 : 12;

  return (
    <div className={tkx('flex flex-col gap-1.5')}>
      {label && (
        <label
          className={tkx('text-sm font-medium')}
          style={{ color: theme.css.text }}
          onClick={() => inputRef.current?.focus()}
        >
          {sanitizeString(label)}
        </label>
      )}
      <div
        className={tkx(
          'flex flex-wrap items-center gap-1.5 rounded-lg cursor-text',
          !reducedMotion && 'transition-colors duration-150',
        )}
        style={{
          padding: containerPad,
          backgroundColor: theme.css.surface,
          border: `1.5px solid ${error ? theme.css.danger : theme.css.border}`,
          opacity: isDisabled ? 0.55 : 1,
          minHeight: size === 'sm' ? 36 : size === 'lg' ? 48 : 40,
        }}
        onClick={() => !isDisabled && inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <TkxTag
            key={`${tag}-${i}`}
            size={size}
            variant="subtle"
            colorScheme={colorScheme}
            onRemove={isDisabled ? undefined : () => removeTag(i)}
            isDisabled={isDisabled}
          >
            {tag}
          </TkxTag>
        ))}
        {(!maxTags || tags.length < maxTags) && !isDisabled && (
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? sanitizeString(placeholder) : ''}
            disabled={isDisabled}
            className={tkx('flex-1 bg-transparent outline-none min-w-[80px]')}
            style={{ fontSize: inputFontSize, color: theme.css.text, caretColor: theme.css.primary }}
            aria-label={label ?? 'Tag input'}
          />
        )}
      </div>
      {error && (
        <p className={tkx('text-xs')} style={{ color: theme.css.danger }} role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className={tkx('text-xs')} style={{ color: theme.css.textMuted }}>
          {sanitizeString(hint)}
        </p>
      )}
    </div>
  );
}