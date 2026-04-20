'use client';

import React, {
  useState,
  useEffect,
  useRef,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';

// ── Types ────────────────────────────────────────────────────────────────────

export type ClockVariant = 'analog' | 'digital' | 'both';
export type DigitalFormat = '12h' | '24h';
export type AnalogStyle = 'classic' | 'minimal' | 'modern';

export interface TkxClockProps {
  variant?: ClockVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSeconds?: boolean;
  showDate?: boolean;
  format?: DigitalFormat;
  timezone?: string;
  timezone2?: string;
  label?: string;
  theme?: 'auto' | 'light' | 'dark';
  analogStyle?: AnalogStyle;
  className?: string;
  style?: CSSProperties;
}

// ── Size map ─────────────────────────────────────────────────────────────────

const SIZE_PX = { sm: 120, md: 180, lg: 240, xl: 320 } as const;

// ── Time helpers ─────────────────────────────────────────────────────────────

interface ClockTime {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  dateString: string;
}

function getTimeInZone(timezone?: string): ClockTime {
  const now = new Date();

  if (timezone) {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
        weekday: 'long',
        month: 'long',
        day: '2-digit',
        year: 'numeric',
      }).formatToParts(now);

      const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';

      let hours = parseInt(get('hour'), 10);
      if (hours === 24) hours = 0;
      const minutes = parseInt(get('minute'), 10);
      const seconds = parseInt(get('second'), 10);
      const weekday = get('weekday');
      const month = get('month');
      const day = get('day');
      const year = get('year');
      const dateString = `${weekday}, ${month} ${day}, ${year}`;

      return { hours, minutes, seconds, milliseconds: now.getMilliseconds(), dateString };
    } catch {
      // fall through to local
    }
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });

  return { hours, minutes, seconds, milliseconds: now.getMilliseconds(), dateString };
}

// ── Analog face ───────────────────────────────────────────────────────────────

interface AnalogFaceProps {
  time: ClockTime;
  size: number;
  analogStyle: AnalogStyle;
  showSeconds: boolean;
  reducedMotion: boolean;
  primary: string;
  danger: string;
  text: string;
  textMuted: string;
  border: string;
  surface: string;
  bg: string;
}

function AnalogFace({
  time,
  size,
  analogStyle,
  showSeconds,
  reducedMotion,
  primary,
  danger,
  text,
  textMuted,
  border,
  surface,
  bg,
}: AnalogFaceProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  const { hours, minutes, seconds, milliseconds } = time;

  const smoothMs = reducedMotion ? 0 : milliseconds;

  const secondAngle = ((seconds + smoothMs / 1000) / 60) * 360;
  const minuteAngle = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

  const handPoint = (angle: number, length: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + Math.cos(rad) * length,
      y: cy + Math.sin(rad) * length,
    };
  };

  const transition = reducedMotion ? 'none' : 'transform 0.15s cubic-bezier(0.4, 2.08, 0.55, 0.44)';

  if (analogStyle === 'modern') {
    // Arc-based progress indicators
    const describeArc = (percent: number, radius: number) => {
      const startAngle = -90;
      const endAngle = startAngle + percent * 360;
      const start = {
        x: cx + Math.cos((startAngle * Math.PI) / 180) * radius,
        y: cy + Math.sin((startAngle * Math.PI) / 180) * radius,
      };
      const end = {
        x: cx + Math.cos((endAngle * Math.PI) / 180) * radius,
        y: cy + Math.sin((endAngle * Math.PI) / 180) * radius,
      };
      const largeArc = percent > 0.5 ? 1 : 0;
      return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
    };

    const hourPct = ((hours % 12) / 12) + (minutes / 60) / 12;
    const minPct = minutes / 60 + seconds / 3600;
    const secPct = (seconds + (reducedMotion ? 0 : milliseconds / 1000)) / 60;

    const outerR = r - 2;
    const midR = r - 10;
    const innerR = r - 18;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {/* Background rings */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={border} strokeWidth={4} />
        <circle cx={cx} cy={cy} r={midR} fill="none" stroke={border} strokeWidth={4} />
        {showSeconds && <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={border} strokeWidth={3} />}

        {/* Hour arc */}
        <path d={describeArc(hourPct, outerR)} fill="none" stroke={primary} strokeWidth={4} strokeLinecap="round" />
        {/* Minute arc */}
        <path d={describeArc(minPct, midR)} fill="none" stroke={text} strokeWidth={4} strokeLinecap="round" />
        {/* Second arc */}
        {showSeconds && (
          <path d={describeArc(secPct, innerR)} fill="none" stroke={danger} strokeWidth={3} strokeLinecap="round" />
        )}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={4} fill={primary} />

        {/* Time digits in center */}
        <text
          x={cx}
          y={cy + 20}
          textAnchor="middle"
          fontSize={size * 0.12}
          fill={textMuted}
          fontFamily="monospace"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
        </text>
      </svg>
    );
  }

  // Classic and Minimal styles use hands
  const hourEnd = handPoint(hourAngle, r * 0.5);
  const minuteEnd = handPoint(minuteAngle, r * 0.75);
  const secondEnd = handPoint(secondAngle, r * 0.85);
  const secondTailEnd = handPoint(secondAngle + 180, r * 0.2);

  const tickMarks: React.JSX.Element[] = [];

  if (analogStyle === 'classic') {
    // 12 hour ticks + minor ticks
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * 360;
      const isHour = i % 5 === 0;
      const rad = ((angle - 90) * Math.PI) / 180;
      const innerR = isHour ? r - 10 : r - 6;
      const x1 = cx + Math.cos(rad) * r;
      const y1 = cy + Math.sin(rad) * r;
      const x2 = cx + Math.cos(rad) * innerR;
      const y2 = cy + Math.sin(rad) * innerR;
      tickMarks.push(
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={isHour ? text : textMuted}
          strokeWidth={isHour ? 2 : 1}
          strokeLinecap="round"
        />,
      );
    }

    // Numbers 12, 3, 6, 9
    const numberPositions = [
      { n: 12, angle: 0 },
      { n: 3, angle: 90 },
      { n: 6, angle: 180 },
      { n: 9, angle: 270 },
    ];
    for (const { n, angle } of numberPositions) {
      const rad = ((angle - 90) * Math.PI) / 180;
      const nr = r - 20;
      tickMarks.push(
        <text
          key={`n${n}`}
          x={cx + Math.cos(rad) * nr}
          y={cy + Math.sin(rad) * nr}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.09}
          fill={text}
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
        >
          {n}
        </text>,
      );
    }
  } else {
    // Minimal: just dots at hour positions
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * 360;
      const rad = ((angle - 90) * Math.PI) / 180;
      const dr = r - 8;
      tickMarks.push(
        <circle
          key={i}
          cx={cx + Math.cos(rad) * dr}
          cy={cy + Math.sin(rad) * dr}
          r={i % 3 === 0 ? 3 : 2}
          fill={i % 3 === 0 ? text : textMuted}
        />,
      );
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Face background */}
      <circle cx={cx} cy={cy} r={r} fill={surface} stroke={border} strokeWidth={2} />

      {/* Tick marks / numbers */}
      {tickMarks}

      {/* Hour hand */}
      <line
        x1={cx}
        y1={cy}
        x2={hourEnd.x}
        y2={hourEnd.y}
        stroke={primary}
        strokeWidth={analogStyle === 'minimal' ? 3 : 4}
        strokeLinecap="round"
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          transition,
        }}
      />

      {/* Minute hand */}
      <line
        x1={cx}
        y1={cy}
        x2={minuteEnd.x}
        y2={minuteEnd.y}
        stroke={text}
        strokeWidth={analogStyle === 'minimal' ? 2 : 3}
        strokeLinecap="round"
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          transition,
        }}
      />

      {/* Second hand */}
      {showSeconds && (
        <>
          <line
            x1={secondTailEnd.x}
            y1={secondTailEnd.y}
            x2={secondEnd.x}
            y2={secondEnd.y}
            stroke={danger}
            strokeWidth={1.5}
            strokeLinecap="round"
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transition: reducedMotion ? 'none' : 'none', // second hand: no CSS transition, update via state
            }}
          />
          <circle cx={cx} cy={cy} r={3} fill={danger} />
        </>
      )}

      {/* Center cap */}
      <circle cx={cx} cy={cy} r={analogStyle === 'minimal' ? 3 : 5} fill={primary} />
    </svg>
  );
}

// ── Digital display ───────────────────────────────────────────────────────────

interface DigitalDisplayProps {
  time: ClockTime;
  format: DigitalFormat;
  showSeconds: boolean;
  showDate: boolean;
  label?: string;
  size: number;
  primary: string;
  text: string;
  textMuted: string;
  colonVisible: boolean;
}

function DigitalDisplay({
  time,
  format,
  showSeconds,
  showDate,
  label,
  size,
  primary,
  text,
  textMuted,
  colonVisible,
}: DigitalDisplayProps) {
  const { hours, minutes, seconds, dateString } = time;

  let displayHours = hours;
  let ampm = '';

  if (format === '12h') {
    ampm = hours >= 12 ? 'PM' : 'AM';
    displayHours = hours % 12 || 12;
  }

  const fontSize = size * 0.2;
  const colonStyle: CSSProperties = {
    opacity: colonVisible ? 1 : 0,
    transition: 'opacity 0.1s',
    display: 'inline-block',
    minWidth: '0.5ch',
    textAlign: 'center',
  };

  return (
    <div
      style={{
        textAlign: 'center',
        fontFamily: "'Courier New', Courier, monospace",
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
      }}
    >
      <div
        style={{
          fontSize,
          color: primary,
          fontWeight: 700,
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}
      >
        <span>{String(displayHours).padStart(2, '0')}</span>
        <span style={colonStyle}>:</span>
        <span>{String(minutes).padStart(2, '0')}</span>
        {showSeconds && (
          <>
            <span style={colonStyle}>:</span>
            <span>{String(seconds).padStart(2, '0')}</span>
          </>
        )}
        {format === '12h' && (
          <span
            style={{
              fontSize: fontSize * 0.45,
              color: textMuted,
              marginLeft: '0.4ch',
              alignSelf: 'flex-end',
              marginBottom: fontSize * 0.05,
            }}
          >
            {ampm}
          </span>
        )}
      </div>

      {showDate && (
        <div
          style={{
            fontSize: size * 0.072,
            color: textMuted,
            marginTop: size * 0.025,
            letterSpacing: '0.03em',
          }}
        >
          {dateString}
        </div>
      )}

      {label && (
        <div
          style={{
            fontSize: size * 0.065,
            color: textMuted,
            marginTop: size * 0.015,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {sanitizeString(label)}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TkxClock({
  variant = 'both',
  size = 'md',
  showSeconds = true,
  showDate = false,
  format = '24h',
  timezone,
  timezone2,
  label,
  analogStyle = 'classic',
  className,
  style,
}: TkxClockProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  const [time, setTime] = useState<ClockTime>(() => getTimeInZone(timezone));
  const [time2, setTime2] = useState<ClockTime | null>(() =>
    timezone2 ? getTimeInZone(timezone2) : null,
  );
  const [colonVisible, setColonVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  const colonRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const tick = () => {
      setTime(getTimeInZone(timezone));
      if (timezone2) setTime2(getTimeInZone(timezone2));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezone, timezone2]);

  useEffect(() => {
    colonRef.current = setInterval(() => {
      setColonVisible((v) => !v);
    }, 500);
    return () => {
      if (colonRef.current) clearInterval(colonRef.current);
    };
  }, []);

  const sizePx = SIZE_PX[size];
  const isAnalog = variant === 'analog' || variant === 'both';
  const isDigital = variant === 'digital' || variant === 'both';

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: variant === 'both' ? `${sizePx * 0.06}px` : 0,
    opacity: mounted ? 1 : 0,
    transition: reducedMotion ? 'none' : 'opacity 0.4s ease',
    ...style,
  };

  return (
    <div className={className} style={containerStyle} role="timer" aria-live="off">
      {isAnalog && (
        <AnalogFace
          time={time}
          size={sizePx}
          analogStyle={analogStyle}
          showSeconds={showSeconds}
          reducedMotion={reducedMotion}
          primary={theme.primary}
          danger={theme.danger}
          text={theme.text}
          textMuted={theme.textMuted}
          border={theme.border}
          surface={theme.surface}
          bg={theme.bg}
        />
      )}

      {isDigital && (
        <DigitalDisplay
          time={time}
          format={format}
          showSeconds={showSeconds}
          showDate={showDate}
          label={label}
          size={sizePx}
          primary={theme.primary}
          text={theme.text}
          textMuted={theme.textMuted}
          colonVisible={colonVisible}
        />
      )}

      {/* Dual timezone display */}
      {time2 && timezone2 && (
        <div
          style={{
            marginTop: sizePx * 0.04,
            padding: `${sizePx * 0.03}px ${sizePx * 0.06}px`,
            borderTop: `1px solid ${theme.border}`,
            textAlign: 'center',
          }}
        >
          <DigitalDisplay
            time={time2}
            format={format}
            showSeconds={false}
            showDate={false}
            label={timezone2}
            size={sizePx * 0.7}
            primary={theme.secondary}
            text={theme.text}
            textMuted={theme.textMuted}
            colonVisible={colonVisible}
          />
        </div>
      )}
    </div>
  );
}

TkxClock.displayName = 'TkxClock';