'use client';

import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import { useTheme } from '../themes';
import { tkx, cx } from '../engine/tkx';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TimelineVariant = 'default' | 'compact' | 'alternating';
export type TimelineItemStatus = 'completed' | 'active' | 'pending' | 'error';

export interface TimelineItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  timestamp?: string;
  status?: TimelineItemStatus;
  icon?: ReactNode;
  badge?: ReactNode;
}

export interface TkxTimelineProps {
  items: TimelineItem[];
  variant?: TimelineVariant;
  orientation?: 'vertical' | 'horizontal';
  connectorStyle?: 'solid' | 'dashed' | 'dotted';
  className?: string;
  style?: CSSProperties;
}

// ── Animation injection ───────────────────────────────────────────────────────

let _timelineStyleInjected = false;
function injectTimelineStyles() {
  if (_timelineStyleInjected || typeof document === 'undefined') return;
  _timelineStyleInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes tkx-pulse-dot { 0%,100% { box-shadow:0 0 0 0 currentColor; opacity:1; } 70% { box-shadow:0 0 0 8px transparent; opacity:0.7; } }
    @keyframes tkx-draw-line { from { transform:scaleY(0); transform-origin:top center; } to { transform:scaleY(1); } }
    @keyframes tkx-draw-line-h { from { transform:scaleX(0); transform-origin:left center; } to { transform:scaleX(1); } }
    .tkx-pulse-dot { animation: tkx-pulse-dot 1.5s ease-in-out infinite; }
    .tkx-draw-v { animation: tkx-draw-line 0.6s ease forwards; }
    .tkx-draw-h { animation: tkx-draw-line-h 0.6s ease forwards; }
  `;
  document.head.appendChild(style);
}

// ── Status color helper ───────────────────────────────────────────────────────

function useStatusColor(status: TimelineItemStatus = 'pending') {
  const theme = useTheme();
  const map: Record<TimelineItemStatus, string> = {
    completed: theme.success,
    active: theme.primary,
    pending: theme.border,
    error: theme.danger,
  };
  return map[status];
}

// ── Dot component ─────────────────────────────────────────────────────────────

function TimelineDot({
  status = 'pending',
  icon,
  size = 28,
}: {
  status?: TimelineItemStatus;
  icon?: ReactNode;
  size?: number;
}) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const color = useStatusColor(status);
  const isActive = status === 'active';

  return (
    <div
      className={cx(
        tkx('relative flex items-center justify-center rounded-full shrink-0 z-10'),
        isActive && !reducedMotion ? 'tkx-pulse-dot' : '',
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: status === 'pending' ? theme.surface : color,
        border: `2px solid ${color}`,
        color: status === 'pending' ? color : theme.bg,
      }}
      aria-hidden="true"
    >
      {icon ? (
        <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>{icon}</span>
      ) : (
        <span
          style={{
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: '50%',
            backgroundColor: status === 'pending' ? color : theme.bg,
            display: 'block',
          }}
        />
      )}
    </div>
  );
}

// ── Connector segment ─────────────────────────────────────────────────────────

function VerticalConnector({
  style: lineStyle,
  color,
  animate,
}: {
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  animate: boolean;
}) {
  const theme = useTheme();
  return (
    <div
      className={cx(tkx('w-0.5 flex-1 min-h-[24px]'), animate ? 'tkx-draw-v' : '')}
      style={{
        borderLeft: `2px ${lineStyle} ${color}`,
        backgroundColor: 'transparent',
        alignSelf: 'stretch',
        borderColor: color,
        marginLeft: 1,
      }}
      aria-hidden="true"
    />
  );
}

function HorizontalConnector({
  style: lineStyle,
  color,
  animate,
}: {
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  animate: boolean;
}) {
  return (
    <div
      className={cx(tkx('h-0.5 flex-1 min-w-[24px]'), animate ? 'tkx-draw-h' : '')}
      style={{
        borderTop: `2px ${lineStyle} ${color}`,
        borderColor: color,
      }}
      aria-hidden="true"
    />
  );
}

// ── Item content block ────────────────────────────────────────────────────────

function ItemContent({
  item,
  compact,
}: {
  item: TimelineItem;
  compact: boolean;
}) {
  const theme = useTheme();
  const safeTimestamp = item.timestamp ? sanitizeString(item.timestamp) : null;

  return (
    <div className={tkx('flex flex-col gap-0.5', compact ? 'pb-3' : 'pb-5')}>
      <div className={tkx('flex items-center gap-2 flex-wrap')}>
        <span
          className={tkx('text-sm font-semibold leading-snug')}
          style={{ color: theme.text }}
        >
          {typeof item.title === 'string' ? sanitizeString(item.title) : item.title}
        </span>
        {item.badge && (
          <span>{item.badge}</span>
        )}
        {safeTimestamp && (
          <span className={tkx('text-[11px] ml-auto')} style={{ color: theme.textMuted }}>
            {safeTimestamp}
          </span>
        )}
      </div>
      {item.description && !compact && (
        <div className={tkx('text-xs leading-relaxed mt-0.5')} style={{ color: theme.textMuted }}>
          {typeof item.description === 'string' ? sanitizeString(item.description) : item.description}
        </div>
      )}
    </div>
  );
}

// ── Main TkxTimeline ──────────────────────────────────────────────────────────

export function TkxTimeline({
  items = [],
  variant = 'default',
  orientation = 'vertical',
  connectorStyle = 'solid',
  className,
  style,
}: TkxTimelineProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const mounted = useRef(false);

  useEffect(() => {
    injectTimelineStyles();
    mounted.current = true;
  }, []);

  const animate = !reducedMotion;
  const isCompact = variant === 'compact';
  const isAlternating = variant === 'alternating' && orientation === 'vertical';
  const isHorizontal = orientation === 'horizontal';

  if (isHorizontal) {
    return (
      <div role="list" aria-label="Timeline" className={tkx('flex items-start w-full overflow-x-auto', className ?? '')} style={style}>
        {items.map((item, idx) => {
          const status = item.status ?? 'pending';
          const connColor = status === 'completed' ? theme.success : theme.border;
          const isLast = idx === items.length - 1;

          return (
            <div key={item.id} role="listitem" className={tkx('flex items-start flex-1 min-w-0')}>
              <div className={tkx('flex flex-col items-center flex-1 min-w-0')}>
                <div className={tkx('flex items-center w-full')}>
                  {idx > 0 && (
                    <HorizontalConnector style={connectorStyle} color={connColor} animate={animate} />
                  )}
                  <TimelineDot status={status} icon={item.icon} size={24} />
                  {!isLast && (
                    <HorizontalConnector style={connectorStyle} color={connColor} animate={animate} />
                  )}
                </div>
                <div className={tkx('mt-2 px-1 text-center min-w-0 w-full')}>
                  <div className={tkx('text-xs font-semibold truncate')} style={{ color: theme.text }}>
                    {typeof item.title === 'string' ? sanitizeString(item.title) : item.title}
                  </div>
                  {item.timestamp && (
                    <div className={tkx('text-[10px] mt-0.5')} style={{ color: theme.textMuted }}>
                      {sanitizeString(item.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical layouts
  return (
    <div role="list" aria-label="Timeline" className={tkx('flex flex-col', className ?? '')} style={style}>
      {items.map((item, idx) => {
        const status = item.status ?? 'pending';
        const isLast = idx === items.length - 1;
        const connColor = status === 'completed' ? theme.success : theme.border;
        const isRight = isAlternating && idx % 2 === 0;

        if (isAlternating) {
          return (
            <div key={item.id} role="listitem" className={tkx('flex items-stretch gap-0')}>
              {/* Left content (even indexes) */}
              <div className={tkx('flex-1 flex flex-col items-end pr-4', !isRight ? 'invisible' : '')}>
                {isRight && <ItemContent item={item} compact={isCompact} />}
              </div>
              {/* Center axis */}
              <div className={tkx('flex flex-col items-center')}>
                <TimelineDot status={status} icon={item.icon} size={28} />
                {!isLast && (
                  <VerticalConnector style={connectorStyle} color={connColor} animate={animate} />
                )}
              </div>
              {/* Right content (odd indexes) */}
              <div className={tkx('flex-1 flex flex-col items-start pl-4', isRight ? 'invisible' : '')}>
                {!isRight && <ItemContent item={item} compact={isCompact} />}
              </div>
            </div>
          );
        }

        // Default / compact — left-side connector
        return (
          <div key={item.id} role="listitem" className={tkx('flex gap-3 items-stretch')}>
            <div className={tkx('flex flex-col items-center')}>
              <TimelineDot status={status} icon={item.icon} size={isCompact ? 22 : 28} />
              {!isLast && (
                <VerticalConnector style={connectorStyle} color={connColor} animate={animate} />
              )}
            </div>
            <div className={tkx('flex-1 min-w-0 pt-0.5')}>
              <ItemContent item={item} compact={isCompact} />
            </div>
          </div>
        );
      })}
    </div>
  );
}