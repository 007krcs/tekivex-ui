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
  trackHeight: number;
  thumbSize: number;
  ariaLabel: string;
  tooltip: string | null;
  onChange: (v: number) => void;
}

function Thumb({ value, min, max, step, isDisabled, trackColor, thumbSize, ariaLabel, tooltip, onChange }: ThumbProps) {
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);

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

  const showTooltip = (focused || dragging) && tooltip !== null;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${toPercent(value, min, max)}%`,
        transform: 'translateX(-50%)',
        top: '50%',
        marginTop: `-${thumbSize / 2}px`,
        zIndex: 2,
        cursor: isDisabled ? 'not-allowed' : 'grab',
      }}
    >
      {showTooltip && (
        <div
          style={{
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
          }}
        >
          {tooltip}
        </div>
      )}
      <div
        role="slider"
        tabIndex={isDisabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={isDisabled}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPointerDown={(e) => { if (!isDisabled) { setDragging(true); (e.target as HTMLElement).setPointerCapture(e.pointerId); }}}
        onPointerUp={() => setDragging(false)}
        style={{
          width: thumbSize,
          height: thumbSize,
          borderRadius: '50%',
          backgroundColor: isDisabled ? '#888' : trackColor,
          border: `3px solid #fff`,
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
}: TkxSliderProps) {
  const theme = useTheme();
  const id = useId();
  const reducedMotion = useReducedMotion();

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const singleValue = isControlled ? value! : internalValue;

  const isRangeControlled = rangeValue !== undefined;
  const [internalRange, setInternalRange] = useState<[number, number]>([min, max]);
  const rangeVal = isRangeControlled ? rangeValue! : internalRange;

  const trackRef = useRef<HTMLDivElement>(null);

  const trackColor = {
    primary: theme.primary,
    success: theme.success,
    danger: theme.danger,
    warning: theme.warning,
  }[colorScheme];

  const sizes = SIZE_MAP[size];

  const getValueFromPointer = useCallback((clientX: number): number => {
    const track = trackRef.current;
    if (!track) return min;
    const rect = track.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const raw = ratio * (max - min) + min;
    return clamp(snapToStep(raw, min, step), min, max);
  }, [min, max, step]);

  const handleTrackPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    const v = getValueFromPointer(e.clientX);

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
    <div className={tkx('flex flex-col gap-2 w-full')} style={{ opacity: isDisabled ? 0.55 : 1 }}>
      {(safeLabel || showValue) && (
        <div className={tkx('flex items-center justify-between')}>
          {safeLabel && (
            <label
              htmlFor={id}
              className={tkx('text-sm font-medium')}
              style={{ color: theme.text, fontSize: sizes.fontSize }}
            >
              {safeLabel}
            </label>
          )}
          {showValue && !isRange && (
            <span className={tkx('text-sm tabular-nums')} style={{ color: theme.textMuted, fontSize: sizes.fontSize }}>
              {singleValue}
            </span>
          )}
          {showValue && isRange && (
            <span className={tkx('text-sm tabular-nums')} style={{ color: theme.textMuted, fontSize: sizes.fontSize }}>
              {rangeVal[0]} – {rangeVal[1]}
            </span>
          )}
        </div>
      )}

      {/* Track container */}
      <div style={{ position: 'relative', paddingTop: sizes.thumb / 2, paddingBottom: sizes.thumb / 2 }}>
        <div
          ref={trackRef}
          onPointerDown={handleTrackPointerDown}
          style={{
            position: 'relative',
            height: sizes.track,
            borderRadius: 9999,
            backgroundColor: theme.border,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            userSelect: 'none',
          }}
        >
          {/* Fill */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${fillLeft}%`,
              width: `${fillRight - fillLeft}%`,
              height: '100%',
              borderRadius: 9999,
              backgroundColor: isDisabled ? theme.textMuted : trackColor,
              transition,
            }}
          />

          {/* Tick marks */}
          {ticks.map((t, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${toPercent(t, min, max)}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 3,
                height: sizes.track + 4,
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
              trackHeight={sizes.track}
              thumbSize={sizes.thumb}
              ariaLabel={safeLabel ?? 'Slider'}
              tooltip={showValue ? null : String(singleValue)}
              onChange={setSingleValue}
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
                trackHeight={sizes.track}
                thumbSize={sizes.thumb}
                ariaLabel={`${safeLabel ?? 'Range'} start`}
                tooltip={showValue ? null : String(rangeVal[0])}
                onChange={setRangeStart}
              />
              <Thumb
                value={rangeVal[1]}
                min={rangeVal[0]}
                max={max}
                step={step}
                isDisabled={isDisabled}
                trackColor={trackColor}
                trackHeight={sizes.track}
                thumbSize={sizes.thumb}
                ariaLabel={`${safeLabel ?? 'Range'} end`}
                tooltip={showValue ? null : String(rangeVal[1])}
                onChange={setRangeEnd}
              />
            </>
          )}
        </div>

        {/* Mark labels */}
        {marks && marks.length > 0 && (
          <div style={{ position: 'relative', marginTop: 8 }}>
            {marks.map((mark, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${toPercent(mark.value, min, max)}%`,
                  transform: 'translateX(-50%)',
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
      {showTicks && !marks && (
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
              {Math.round(t)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

TkxSlider.displayName = 'TkxSlider';
