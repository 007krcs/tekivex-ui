'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
  type ChangeEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { useFocusTrap } from '../hooks';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ColorFormat = 'hex' | 'rgb' | 'hsl';

export interface TkxColorPickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, format: ColorFormat) => void;
  format?: ColorFormat;
  showAlpha?: boolean;
  presets?: string[];
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  label?: string;
  style?: CSSProperties;
  className?: string;
}

// ── Color math ────────────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  let r = 0, g = 0, b = 0;
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length >= 6) {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function isValidHex(hex: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

function formatColor(hex: string, alpha: number, format: ColorFormat): string {
  if (format === 'hex') return alpha < 1 ? `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` : hex;
  const [r, g, b] = hexToRgb(hex);
  if (format === 'rgb') return alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})` : `rgb(${r}, ${g}, ${b})`;
  const [h, s, l] = hexToHsl(hex);
  if (format === 'hsl') return alpha < 1 ? `hsla(${h}, ${s}%, ${l}%, ${alpha.toFixed(2)})` : `hsl(${h}, ${s}%, ${l}%)`;
  return hex;
}

// ── Default presets ───────────────────────────────────────────────────────────

const DEFAULT_PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff', '#94a3b8',
  '#475569', '#0f172a',
];

// Keyboard step for the APG slider pattern: 1 by default, 10 with
// Shift+Arrow or PageUp/PageDown.
function sliderStep(e: React.KeyboardEvent): number {
  if (e.key === 'PageUp' || e.key === 'PageDown') return 10;
  return e.shiftKey ? 10 : 1;
}

// Visible focus ring for the custom slider tracks (double ring so it reads
// on any hue/alpha background).
const FOCUS_RING = '0 0 0 2px #ffffff, 0 0 0 4px #3b82f6';

// ── Saturation/Brightness picker canvas ──────────────────────────────────────

function SatBrightPicker({
  hue,
  sat,
  bright,
  onChange,
}: {
  hue: number;
  sat: number;
  bright: number;
  onChange: (s: number, b: number) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const pick = useCallback((e: MouseEvent | React.MouseEvent) => {
    const el = canvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    onChange(Math.round(x * 100), Math.round((1 - y) * 100));
  }, [onChange]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) pick(e); };
    const onUp = () => { dragging.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [pick]);

  const thumbX = `${sat}%`;
  const thumbY = `${100 - bright}%`;
  const [focused, setFocused] = useState(false);

  // 2D slider keyboard model (a11y-audit MEDIUM #18): Left/Right adjust
  // saturation, Up/Down adjust brightness, Home/End jump saturation to
  // min/max. Mirrors the mouse model, which also works in (sat, bright).
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = sliderStep(e);
    const clamp = (n: number) => Math.max(0, Math.min(100, n));
    switch (e.key) {
      case 'ArrowRight': onChange(clamp(sat + step), bright); break;
      case 'ArrowLeft': onChange(clamp(sat - step), bright); break;
      case 'ArrowUp':
      case 'PageUp': onChange(sat, clamp(bright + step)); break;
      case 'ArrowDown':
      case 'PageDown': onChange(sat, clamp(bright - step)); break;
      case 'Home': onChange(0, bright); break;
      case 'End': onChange(100, bright); break;
      default: return;
    }
    e.preventDefault();
  };

  return (
    <div
      ref={canvasRef}
      role="slider"
      tabIndex={0}
      aria-label="Saturation and brightness"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={sat}
      aria-valuetext={`Saturation ${sat}%, brightness ${bright}%`}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: '160px',
        borderRadius: '6px',
        cursor: 'crosshair',
        background: `hsl(${hue}, 100%, 50%)`,
        flexShrink: 0,
        outline: 'none',
        boxShadow: focused ? FOCUS_RING : undefined,
      }}
      onMouseDown={(e) => { dragging.current = true; pick(e); }}
    >
      {/* White gradient left→right */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '6px',
        background: 'linear-gradient(to right, #ffffff, transparent)',
      }} />
      {/* Black gradient top→bottom */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '6px',
        background: 'linear-gradient(to bottom, transparent, #000000)',
      }} />
      {/* Thumb */}
      <div style={{
        position: 'absolute',
        left: thumbX,
        top: thumbY,
        transform: 'translate(-50%, -50%)',
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        border: '2px solid white',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
        pointerEvents: 'none',
        backgroundColor: hslToHex(hue, sat, bright / 2 + 25),
      }} />
    </div>
  );
}

// ── Hue slider ────────────────────────────────────────────────────────────────

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const pick = useCallback((e: MouseEvent | React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChange(Math.round(x * 360));
  }, [onChange]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) pick(e); };
    const onUp = () => { dragging.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [pick]);

  const [focused, setFocused] = useState(false);

  // APG slider keyboard model (a11y-audit MEDIUM #18).
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = sliderStep(e);
    const clamp = (n: number) => Math.max(0, Math.min(360, n));
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
      case 'PageUp': onChange(clamp(hue + step)); break;
      case 'ArrowLeft':
      case 'ArrowDown':
      case 'PageDown': onChange(clamp(hue - step)); break;
      case 'Home': onChange(0); break;
      case 'End': onChange(360); break;
      default: return;
    }
    e.preventDefault();
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="Hue"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={hue}
      aria-valuetext={`${hue} degrees`}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        position: 'relative',
        height: '12px',
        borderRadius: '6px',
        cursor: 'pointer',
        background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
        outline: 'none',
        boxShadow: focused ? FOCUS_RING : undefined,
      }}
      onMouseDown={(e) => { dragging.current = true; pick(e); }}
    >
      <div style={{
        position: 'absolute',
        left: `${(hue / 360) * 100}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        border: '2px solid white',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
        backgroundColor: `hsl(${hue}, 100%, 50%)`,
        pointerEvents: 'none',
      }} />
    </div>
  );
}

// ── Alpha slider ──────────────────────────────────────────────────────────────

function AlphaSlider({ alpha, hex, onChange }: { alpha: number; hex: string; onChange: (a: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const pick = useCallback((e: MouseEvent | React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChange(Math.round(x * 100) / 100);
  }, [onChange]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) pick(e); };
    const onUp = () => { dragging.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [pick]);

  const [r, g, b] = hexToRgb(hex);
  const [focused, setFocused] = useState(false);

  // APG slider keyboard model (a11y-audit MEDIUM #18); exposed as 0–100%.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = sliderStep(e);
    const pct = Math.round(alpha * 100);
    const clamp = (n: number) => Math.max(0, Math.min(100, n));
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
      case 'PageUp': onChange(clamp(pct + step) / 100); break;
      case 'ArrowLeft':
      case 'ArrowDown':
      case 'PageDown': onChange(clamp(pct - step) / 100); break;
      case 'Home': onChange(0); break;
      case 'End': onChange(1); break;
      default: return;
    }
    e.preventDefault();
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Checkerboard background */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '6px',
        backgroundImage: 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%)',
        backgroundSize: '8px 8px',
      }} />
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Alpha"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(alpha * 100)}
        aria-valuetext={`${Math.round(alpha * 100)}%`}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          position: 'relative',
          height: '12px',
          borderRadius: '6px',
          cursor: 'pointer',
          background: `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1))`,
          outline: 'none',
          boxShadow: focused ? FOCUS_RING : undefined,
        }}
        onMouseDown={(e) => { dragging.current = true; pick(e); }}
      >
        <div style={{
          position: 'absolute',
          left: `${alpha * 100}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
          backgroundColor: `rgba(${r},${g},${b},${alpha})`,
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TkxColorPicker({
  value,
  defaultValue = '#3b82f6',
  onChange,
  format = 'hex',
  showAlpha = false,
  presets = DEFAULT_PRESETS,
  disabled = false,
  size = 'md',
  placeholder,
  label,
  style,
}: TkxColorPickerProps) {
  const theme = useTheme();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  // Dialog focus management (WAI-ARIA APG): while open, move focus into the
  // popover (first focusable control — the hex input), trap Tab/Shift+Tab
  // inside it, and restore focus to the previously-focused element (the
  // trigger) on every close path (Escape, outside click, selection).
  const trapRef = useFocusTrap(isOpen);
  const setPopoverRefs = useCallback((el: HTMLDivElement | null) => {
    popoverRef.current = el;
    (trapRef as React.MutableRefObject<HTMLElement | null>).current = el;
  }, [trapRef]);

  const controlled = value !== undefined;
  const [internalHex, setInternalHex] = useState<string>(
    controlled ? (value || defaultValue) : defaultValue
  );
  const hex = controlled ? (value || defaultValue) : internalHex;

  const [alpha, setAlpha] = useState(1);
  const [hexInput, setHexInput] = useState(hex);
  const [popPos, setPopPos] = useState({ top: 0, left: 0 });

  const [hue, sat, light] = hexToHsl(isValidHex(hex) ? hex : defaultValue);
  // Convert HSL lightness → brightness for SB picker
  // brightness ≈ lightness + saturation * min(lightness, 1-lightness)
  const bright = Math.round(light + (sat / 100) * Math.min(light / 100, 1 - light / 100) * 100);

  const updateColor = useCallback((newHex: string, newAlpha = alpha) => {
    if (!isValidHex(newHex)) return;
    setHexInput(newHex);
    if (!controlled) setInternalHex(newHex);
    onChange?.(formatColor(newHex, newAlpha, format), format);
  }, [alpha, controlled, format, onChange]);

  // Sync hexInput when value changes externally
  useEffect(() => {
    if (controlled && value && isValidHex(value)) {
      setHexInput(value);
    }
  }, [controlled, value]);

  // Position popover
  const openPicker = () => {
    if (disabled) return;
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow > 320 ? rect.bottom + 6 : rect.top - 326;
    setPopPos({ top: top + window.scrollY, left: rect.left + window.scrollX });
    setIsOpen(true);
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleSatBright = (s: number, b: number) => {
    // Convert SB + hue back to hex
    // Using HSL approximation: L = B * (1 - S/2/100), S_hsl = (B - L) / min(L, 1-L)
    const bNorm = b / 100;
    const sNorm = s / 100;
    const l = bNorm * (1 - sNorm / 2);
    const sHsl = l === 0 || l === 1 ? 0 : (bNorm - l) / Math.min(l, 1 - l);
    const newHex = hslToHex(hue, Math.round(sHsl * 100), Math.round(l * 100));
    updateColor(newHex);
  };

  const handleHue = (newHue: number) => {
    const newHex = hslToHex(newHue, sat, light);
    updateColor(newHex);
  };

  const handleAlpha = (a: number) => {
    setAlpha(a);
    onChange?.(formatColor(hex, a, format), format);
  };

  const handleHexInput = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setHexInput(v);
    if (isValidHex(v)) updateColor(v);
  };

  const handleRgbInput = (channel: 'r' | 'g' | 'b', v: string) => {
    const n = Math.max(0, Math.min(255, parseInt(v) || 0));
    const [r, g, b] = hexToRgb(hex);
    const newHex = channel === 'r' ? rgbToHex(n, g, b)
      : channel === 'g' ? rgbToHex(r, n, b)
      : rgbToHex(r, g, n);
    updateColor(newHex);
  };

  const sizeMap = { sm: 28, md: 34, lg: 40 };
  const swatchSize = sizeMap[size];
  const [r, g, b] = hexToRgb(isValidHex(hex) ? hex : defaultValue);

  const triggerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    height: `${swatchSize}px`,
    padding: '4px 10px 4px 6px',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surface,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    color: theme.text,
    fontSize: '13px',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
    ...style,
  };

  const swatchStyle: CSSProperties = {
    width: `${swatchSize - 8}px`,
    height: `${swatchSize - 8}px`,
    borderRadius: '4px',
    backgroundColor: `rgba(${r},${g},${b},${alpha})`,
    border: `1px solid ${theme.border}`,
    flexShrink: 0,
  };

  const popStyle: CSSProperties = {
    position: 'absolute',
    top: popPos.top,
    left: popPos.left,
    zIndex: 9999,
    width: '260px',
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '16px',
    boxShadow: `0 8px 32px rgba(0,0,0,0.24)`,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '6px 10px',
    borderRadius: '6px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.bg,
    color: theme.text,
    fontSize: '12px',
    fontFamily: 'monospace',
    outline: 'none',
  };

  const channelInputStyle: CSSProperties = {
    flex: 1,
    padding: '5px 6px',
    borderRadius: '6px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.bg,
    color: theme.text,
    fontSize: '11px',
    textAlign: 'center',
    fontFamily: 'monospace',
    outline: 'none',
  };

  const presetDotStyle = (c: string): CSSProperties => ({
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: c,
    border: c.toLowerCase() === hex.toLowerCase()
      ? `2px solid ${theme.primary}`
      : `1px solid ${theme.border}`,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'transform 0.1s',
  });

  return (
    <>
      {label && (
        <label style={{ display: 'block', fontSize: '13px', color: theme.text, marginBottom: '6px', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        style={triggerStyle}
        onClick={openPicker}
        disabled={disabled}
        aria-label={`Color picker, current color ${hex}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div style={swatchStyle} />
        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: theme.textMuted }}>
          {placeholder ?? formatColor(isValidHex(hex) ? hex : defaultValue, alpha, format)}
        </span>
      </button>

      {isOpen && createPortal(
        <div
          ref={setPopoverRefs}
          style={popStyle}
          role="dialog"
          aria-label="Color picker"
          tabIndex={-1}
        >
          {/* Saturation/Brightness picker */}
          <SatBrightPicker
            hue={hue}
            sat={sat}
            bright={light}
            onChange={handleSatBright}
          />

          {/* Hue slider */}
          <HueSlider hue={hue} onChange={handleHue} />

          {/* Alpha slider */}
          {showAlpha && (
            <AlphaSlider alpha={alpha} hex={isValidHex(hex) ? hex : defaultValue} onChange={handleAlpha} />
          )}

          {/* Hex input + preview swatch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
              backgroundColor: `rgba(${r},${g},${b},${alpha})`,
              border: `1px solid ${theme.border}`,
            }} />
            <input
              style={inputStyle}
              value={hexInput}
              onChange={handleHexInput}
              maxLength={7}
              spellCheck={false}
              aria-label="Hex color value"
            />
          </div>

          {/* RGB inputs */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {(['r', 'g', 'b'] as const).map((ch) => {
              const val = ch === 'r' ? r : ch === 'g' ? g : b;
              return (
                <div key={ch} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                  <input
                    style={channelInputStyle}
                    type="number"
                    min={0}
                    max={255}
                    value={val}
                    onChange={(e) => handleRgbInput(ch, e.target.value)}
                    aria-label={`${ch.toUpperCase()} channel`}
                  />
                  <span style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase' }}>{ch}</span>
                </div>
              );
            })}
            {showAlpha && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                <input
                  style={channelInputStyle}
                  type="number"
                  min={0}
                  max={100}
                  value={Math.round(alpha * 100)}
                  onChange={(e) => handleAlpha(Math.max(0, Math.min(1, parseInt(e.target.value) / 100 || 0)))}
                  aria-label="Alpha channel"
                />
                <span style={{ fontSize: '10px', color: theme.textMuted }}>A%</span>
              </div>
            )}
          </div>

          {/* Presets */}
          {presets.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '6px', fontWeight: 500 }}>
                Presets
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {presets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    style={presetDotStyle(c)}
                    onClick={() => updateColor(c)}
                    aria-label={`Select color ${c}`}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}