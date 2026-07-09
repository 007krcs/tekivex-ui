'use client';

import {
  useState,
  useRef,
  useId,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useTheme } from '../themes';
import { tkx } from '../engine/tkx';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';

export interface TkxSliderProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  rangeValue?: [number, number];
  onRangeChange?: (range: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  isRange?: boolean;
  label?: string;
  showValue?: boolean;
  showTicks?: boolean;
  tickCount?: number;
  isDisabled?: boolean;
  colorScheme?: 'primary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  marks?: { value: number; label: string }[];
  orientation?: 'horizontal' | 'vertical';
  showTooltip?: boolean | 'hover' | 'always';
  formatValue?: (value: number) => string;
  onChangeEnd?: (value: number) => void;
  onRangeChangeEnd?: (range: [number, number]) => void;
  gradient?: boolean;
}

const SIZE_MAP = {
  sm: { track: 4, thumb: 14, fontSize: '0.75rem' },
  md: { track: 6, thumb: 18, fontSize: '0.875rem' },
  lg: { track: 8, thumb: 22, fontSize: '1rem' },
};

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

function snapToStep(v: number, min: number, step: number): number {
  return Math.round((v - min) / step) * step + min;
}

function toPercent(v: number, min: number, max: number): number {
  return ((v - min) / (max - min)) * 100;
}

interface ThumbProps {
  value: number;
  min: number;
  max: number;
  step: number;
  isDisabled: boolean;
  trackColor: string;
  surfaceColor: string;
  disabledColor: string;
  trackHeight: number;
  thumbSize: number;
  ariaLabel: string;
  /**
   * Id of the visible <label> element. A `label[for]` can't activate a
   * role="slider" div, so the association is made via aria-labelledby
   * instead. When set it wins over ariaLabel (single-thumb case); the two
   * range thumbs keep aria-label so "start"/"end" stay distinguishable.
   */
  labelledById?: string;
  tooltipMode: false | 'hover' | 'always';
  formatValue: (v: number) => string;
  /**
   * When the consumer supplied a custom `formatValue`, this mirrors it so
   * the thumb can expose the formatted label via `aria-valuetext`.
   * Undefined when no custom formatter exists (raw aria-valuenow suffices).
   */
  formatValueText?: (v: number) => string;
  orientation: 'horizontal' | 'vertical';
  onChange: (v: number) => void;
  onChangeEnd?: () => void;
}

function Thumb({ value, min, max, step, isDisabled, trackColor, surfaceColor, disabledColor, thumbSize, ariaLabel, labelledById, tooltipMode, formatValue, formatValueText, orientation, onChange, onChangeEnd }: ThumbProps) {
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDisabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(clamp(snapToStep(value + step, min, step), min, max));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(clamp(snapToStep(value - step, min, step), min, max));
    } else if (e.key === 'Home') {
      e.preventDefault(); onChange(min);
    } else if (e.key === 'End') {
      e.preventDefault(); onChange(max);
    }
  };

  const isVertical = orientation === 'vertical';
  const percent = toPercent(value, min, max);
  const showTip =
    tooltipMode === 'always' ||
    (tooltipMode === 'hover' && (hovered || dragging || focused));

  const positionStyle: React.CSSProperties = isVertical
    ? {
        position: 'absolute',
        bottom: `${percent}%`,
        transform: 'translateY(50%)',
        left: '50%',
        marginLeft: `-${thumbSize / 2}px`,
        zIndex: 2,
        cursor: isDisabled ? 'not-allowed' : 'grab',
      }
    : {
        position: 'absolute',
        left: `${percent}%`,
        transform: 'translateX(-50%)',
        top: '50%',
        marginTop: `-${thumbSize / 2}px`,
        zIndex: 2,
        cursor: isDisabled ? 'not-allowed' : 'grab',
      };

  const tooltipStyle: React.CSSProperties = isVertical
    ? {
        position: 'absolute',
        left: thumbSize + 6,
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: trackColor,
        color: '#fff',
        borderRadius: '4px',
        padding: '2px 6px',
        fontSize: '0.75rem',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }
    : {
        position: 'absolute',
        bottom: thumbSize + 6,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: trackColor,
        color: '#fff',
        borderRadius: '4px',
        padding: '2px 6px',
        fontSize: '0.75rem',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      };

  return (
    <div style={positionStyle}>
      {showTip && (
        <div style={tooltipStyle}>
          {formatValue(value)}
        </div>
      )}
      <div
        role="slider"
        tabIndex={isDisabled ? -1 : 0}
        aria-label={labelledById ? undefined : ariaLabel}
        aria-labelledby={labelledById}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={formatValueText ? formatValueText(value) : undefined}
        aria-disabled={isDisabled}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={(e) => { if (!isDisabled) { setDragging(true); (e.target as HTMLElement).setPointerCapture(e.pointerId); }}}
        onPointerUp={() => { setDragging(false); onChangeEnd?.(); }}
        style={{
          width: thumbSize,
          height: thumbSize,
          borderRadius: '50%',
          backgroundColor: isDisabled ? disabledColor : trackColor,
          border: `3px solid ${surfaceColor}`,
          boxShadow: focused ? `0 0 0 3px ${trackColor}44` : '0 1px 4px rgba(0,0,0,0.3)',
          outline: 'none',
          display: 'block',
          transition: 'box-shadow 150ms ease',
        }}
      />
    </div>
  );
}

export function TkxSlider({
  value,
  defaultValue = 0,
  onChange,
  rangeValue,
  onRangeChange,
  min = 0,
  max = 100,
  step = 1,
  isRange = false,
  label,
  showValue = false,
  showTicks = false,
  tickCount = 5,
  isDisabled = false,
  colorScheme = 'primary',
  size = 'md',
  marks,
  orientation = 'horizontal',
  showTooltip = false,
  formatValue: formatValueProp,
  onChangeEnd,
  onRangeChangeEnd,
  gradient = false,
}: TkxSliderProps) {
  const theme = useTheme();
  const id = useId();
  const labelId = `${id}-label`;
  const reducedMotion = useReducedMotion();

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const singleValue = isControlled ? value! : internalValue;

  const isRangeControlled = rangeValue !== undefined;
  const [internalRange, setInternalRange] = useState<[number, number]>([min, max]);
  const rangeVal = isRangeControlled ? rangeValue! : internalRange;

  const trackRef = useRef<HTMLDivElement>(null);
  const singleValueRef = useRef(singleValue);
  singleValueRef.current = singleValue;
  const rangeValRef = useRef(rangeVal);
  rangeValRef.current = rangeVal;

  const trackColor = {
    primary: theme.primary,
    success: theme.success,
    danger: theme.danger,
    warning: theme.warning,
  }[colorScheme];

  const sizes = SIZE_MAP[size];
  const isVertical = orientation === 'vertical';

  const tooltipMode: false | 'hover' | 'always' =
    showTooltip === true ? 'hover' :
    showTooltip === false ? false :
    showTooltip; // 'hover' | 'always'

  const formatVal = formatValueProp ?? ((v: number) => String(v));

  const trackColorLight = trackColor + '66'; // 40% opacity variant for gradient end

  const getValueFromPointer = useCallback((clientX: number, clientY?: number): number => {
    const track = trackRef.current;
    if (!track) return min;
    const rect = track.getBoundingClientRect();
    let ratio: number;
    if (isVertical) {
      // vertical: bottom = min, top = max
      ratio = clamp((rect.bottom - (clientY ?? 0)) / rect.height, 0, 1);
    } else {
      ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    }
    const raw = ratio * (max - min) + min;
    return clamp(snapToStep(raw, min, step), min, max);
  }, [min, max, step, isVertical]);

  const handleTrackPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    const v = getValueFromPointer(e.clientX, e.clientY);

    if (!isRange) {
      if (!isControlled) setInternalValue(v);
      onChange?.(v);
    } else {
      const [lo, hi] = rangeVal;
      const distLo = Math.abs(v - lo);
      const distHi = Math.abs(v - hi);
      const newRange: [number, number] = distLo <= distHi ? [v, hi] : [lo, v];
      if (!isRangeControlled) setInternalRange(newRange);
      onRangeChange?.(newRange);
    }
  }, [isDisabled, isRange, isControlled, isRangeControlled, getValueFromPointer, onChange, onRangeChange, rangeVal]);

  const setSingleValue = (v: number) => {
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
  };

  const setRangeStart = (v: number) => {
    const newRange: [number, number] = [clamp(v, min, rangeVal[1]), rangeVal[1]];
    if (!isRangeControlled) setInternalRange(newRange);
    onRangeChange?.(newRange);
  };

  const setRangeEnd = (v: number) => {
    const newRange: [number, number] = [rangeVal[0], clamp(v, rangeVal[0], max)];
    if (!isRangeControlled) setInternalRange(newRange);
    onRangeChange?.(newRange);
  };

  const fillLeft = isRange ? toPercent(rangeVal[0], min, max) : 0;
  const fillRight = isRange ? toPercent(rangeVal[1], min, max) : toPercent(singleValue, min, max);

  const ticks = showTicks
    ? Array.from({ length: tickCount }, (_, i) => min + (i / (tickCount - 1)) * (max - min))
    : [];

  const safeLabel = label ? sanitizeString(label) : undefined;
  const transition = reducedMotion ? 'none' : 'background 150ms ease';

  return (
    <div className={tkx('flex flex-col gap-2')} style={{ opacity: isDisabled ? 0.55 : 1, ...(isVertical ? { height: 200, width: 'auto', display: 'inline-flex' } : { width: '100%' }) }}>
      {(safeLabel || showValue) && (
        <div className={tkx('flex items-center justify-between')}>
          {safeLabel && (
            <label
              id={labelId}
              className={tkx('text-sm font-medium')}
              style={{ color: theme.text, fontSize: sizes.fontSize }}
            >
              {safeLabel}
            </label>
          )}
          {showValue && !isRange && (
            <span className={tkx('text-sm tabular-nums')} style={{ color: theme.textMuted, fontSize: sizes.fontSize }}>
              {formatVal(singleValue)}
            </span>
          )}
          {showValue && isRange && (
            <span className={tkx('text-sm tabular-nums')} style={{ color: theme.textMuted, fontSize: sizes.fontSize }}>
              {formatVal(rangeVal[0])} – {formatVal(rangeVal[1])}
            </span>
          )}
        </div>
      )}

      {/* Track container */}
      <div style={{
        position: 'relative',
        ...(isVertical
          ? { paddingLeft: sizes.thumb / 2, paddingRight: sizes.thumb / 2, flex: 1 }
          : { paddingTop: sizes.thumb / 2, paddingBottom: sizes.thumb / 2 }),
      }}>
        <div
          ref={trackRef}
          onPointerDown={handleTrackPointerDown}
          style={{
            position: 'relative',
            ...(isVertical
              ? { width: sizes.track, height: '100%' }
              : { height: sizes.track }),
            borderRadius: 9999,
            backgroundColor: theme.border,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          {/* Fill */}
          <div
            style={{
              position: 'absolute',
              ...(isVertical
                ? { left: 0, bottom: `${fillLeft}%`, height: `${fillRight - fillLeft}%`, width: '100%' }
                : { top: 0, left: `${fillLeft}%`, width: `${fillRight - fillLeft}%`, height: '100%' }),
              borderRadius: 9999,
              ...(isDisabled
                ? { backgroundColor: theme.textMuted }
                : gradient
                  ? { background: isVertical
                      ? `linear-gradient(to top, ${trackColorLight}, ${trackColor})`
                      : `linear-gradient(to right, ${trackColorLight}, ${trackColor})` }
                  : { backgroundColor: trackColor }),
              transition,
            }}
          />

          {/* Tick marks */}
          {ticks.map((t, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                ...(isVertical
                  ? { bottom: `${toPercent(t, min, max)}%`, left: '50%', transform: 'translate(-50%, 50%)', height: 3, width: sizes.track + 4 }
                  : { left: `${toPercent(t, min, max)}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 3, height: sizes.track + 4 }),
                backgroundColor: theme.surface,
                borderRadius: 9999,
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Thumbs */}
          {!isRange ? (
            <Thumb
              value={singleValue}
              min={min}
              max={max}
              step={step}
              isDisabled={isDisabled}
              trackColor={trackColor}
              surfaceColor={theme.surface}
              disabledColor={theme.textMuted}
              trackHeight={sizes.track}
              thumbSize={sizes.thumb}
              ariaLabel={safeLabel ?? 'Slider'}
              labelledById={safeLabel ? labelId : undefined}
              tooltipMode={tooltipMode}
              formatValue={formatVal}
              formatValueText={formatValueProp}
              orientation={orientation}
              onChange={setSingleValue}
              onChangeEnd={onChangeEnd ? () => onChangeEnd(singleValueRef.current) : undefined}
            />
          ) : (
            <>
              <Thumb
                value={rangeVal[0]}
                min={min}
                max={rangeVal[1]}
                step={step}
                isDisabled={isDisabled}
                trackColor={trackColor}
                surfaceColor={theme.surface}
                disabledColor={theme.textMuted}
                trackHeight={sizes.track}
                thumbSize={sizes.thumb}
                ariaLabel={`${safeLabel ?? 'Range'} start`}
                tooltipMode={tooltipMode}
                formatValue={formatVal}
                formatValueText={formatValueProp}
                orientation={orientation}
                onChange={setRangeStart}
                onChangeEnd={onRangeChangeEnd ? () => onRangeChangeEnd(rangeValRef.current) : undefined}
              />
              <Thumb
                value={rangeVal[1]}
                min={rangeVal[0]}
                max={max}
                step={step}
                isDisabled={isDisabled}
                trackColor={trackColor}
                surfaceColor={theme.surface}
                disabledColor={theme.textMuted}
                trackHeight={sizes.track}
                thumbSize={sizes.thumb}
                ariaLabel={`${safeLabel ?? 'Range'} end`}
                tooltipMode={tooltipMode}
                formatValue={formatVal}
                formatValueText={formatValueProp}
                orientation={orientation}
                onChange={setRangeEnd}
                onChangeEnd={onRangeChangeEnd ? () => onRangeChangeEnd(rangeValRef.current) : undefined}
              />
            </>
          )}
        </div>

        {/* Mark labels */}
        {marks && marks.length > 0 && (
          <div style={{ position: isVertical ? 'absolute' : 'relative', ...(isVertical ? { left: '100%', top: 0, bottom: 0, marginLeft: 8 } : { marginTop: 8 }) }}>
            {marks.map((mark, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  ...(isVertical
                    ? { bottom: `${toPercent(mark.value, min, max)}%`, transform: 'translateY(50%)', left: 0 }
                    : { left: `${toPercent(mark.value, min, max)}%`, transform: 'translateX(-50%)' }),
                  fontSize: '0.6875rem',
                  color: theme.textMuted,
                  whiteSpace: 'nowrap',
                }}
              >
                {sanitizeString(mark.label)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tick labels when no marks */}
      {showTicks && !marks && !isVertical && (
        <div style={{ position: 'relative', height: '1rem' }}>
          {ticks.map((t, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${toPercent(t, min, max)}%`,
                transform: 'translateX(-50%)',
                fontSize: '0.6875rem',
                color: theme.textMuted,
              }}
            >
              {formatVal(Math.round(t))}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

TkxSlider.displayName = 'TkxSlider';