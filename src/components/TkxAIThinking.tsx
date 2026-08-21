'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import { useTheme } from '../themes';
import { cx, tkx } from '../engine/tkx';

export interface TkxAIThinkingProps {
  /** Text shown while thinking */
  label?: string;
  /** What steps the AI is working through (optional animated list) */
  steps?: string[];
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual style */
  variant?: 'dots' | 'pulse' | 'wave' | 'orbit';
  /** Whether actively thinking (false = done) */
  active?: boolean;
  className?: string;
  style?: CSSProperties;
}

function DotsIndicator({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: color,
          animation: `tkx-thinking-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
    </div>
  );
}

function PulseIndicator({ color }: { color: string }) {
  return (
    <div style={{ position: 'relative', width: 24, height: 24 }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: color, opacity: 0.15,
        animation: 'tkx-thinking-pulse 1.5s ease-out infinite',
      }} />
      <div style={{
        position: 'absolute', inset: 4, borderRadius: '50%',
        background: color, opacity: 0.6,
        animation: 'tkx-thinking-pulse 1.5s ease-out 0.3s infinite',
      }} />
      <div style={{
        position: 'absolute', inset: 8, borderRadius: '50%',
        background: color,
      }} />
    </div>
  );
}

function WaveIndicator({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 20 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{
          width: 3, borderRadius: 3,
          background: color,
          animation: `tkx-thinking-wave 1s ease-in-out ${i * 0.1}s infinite`,
        }} />
      ))}
    </div>
  );
}

function OrbitIndicator({ color }: { color: string }) {
  return (
    <div style={{ position: 'relative', width: 28, height: 28 }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: `2px solid ${color}33`,
      }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: `2px solid transparent`,
        borderTopColor: color,
        animation: 'tkx-thinking-orbit 0.8s linear infinite',
      }} />
      <div style={{
        position: 'absolute', inset: '38%', borderRadius: '50%',
        background: color, opacity: 0.8,
      }} />
    </div>
  );
}

const FONT: Record<NonNullable<TkxAIThinkingProps['size']>, number> = {
  sm: 12, md: 14, lg: 16,
};

export function TkxAIThinking({
  label = 'Thinking…',
  steps,
  size = 'md',
  variant = 'dots',
  active = true,
  className,
  style,
}: TkxAIThinkingProps) {
  const theme = useTheme();
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!steps?.length || !active) return;
    const id = setInterval(() => {
      setStepIdx(i => (i + 1) % steps.length);
    }, 1800);
    return () => clearInterval(id);
  }, [steps, active]);

  const color = theme.css.primary;
  const fs = FONT[size];

  const indicator = {
    dots: <DotsIndicator color={color} />,
    pulse: <PulseIndicator color={color} />,
    wave: <WaveIndicator color={color} />,
    orbit: <OrbitIndicator color={color} />,
  }[variant];

  return (
    <div
      className={cx(tkx('inline-flex flex-col gap-2'), className)}
      style={style}
      role="status"
      aria-live="polite"
      aria-label={active ? label : 'Done thinking'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Indicator */}
        <div style={{ opacity: active ? 1 : 0.35, transition: 'opacity 0.3s' }}>
          {active ? indicator : (
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: theme.css.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: theme.css.bg, fontSize: 11, fontWeight: 900 }}>✓</span>
            </div>
          )}
        </div>

        {/* Label / step text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{
            fontSize: fs, fontWeight: 600,
            color: active ? theme.css.text : theme.css.textMuted,
            transition: 'color 0.3s',
          }}>
            {active ? (steps ? steps[stepIdx] : label) : 'Done'}
          </span>
        </div>
      </div>

      {/* Step progress dots */}
      {steps && steps.length > 1 && (
        <div style={{ display: 'flex', gap: 4, paddingLeft: 2 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === stepIdx ? 16 : 6, height: 4, borderRadius: 4,
              background: i === stepIdx ? color : `${color}44`,
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes tkx-thinking-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @keyframes tkx-thinking-pulse {
          0%   { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2);   opacity: 0;   }
        }
        @keyframes tkx-thinking-wave {
          0%, 100% { height: 6px;  }
          50%      { height: 18px; }
        }
        @keyframes tkx-thinking-orbit {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}