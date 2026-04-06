import type { CSSProperties } from 'react';
import { useTheme } from '@tekivex/ui';

// ── Types ─────────────────────────────────────────────────────────────────────

interface WCAGBadgeProps {
  criterion: string;
  level: 'AA' | 'AAA';
  status?: 'PASS' | 'FAIL';
}

// ── WCAGBadge component ───────────────────────────────────────────────────────

export function WCAGBadge({ criterion, level, status = 'PASS' }: WCAGBadgeProps) {
  const theme = useTheme();

  const isPassing = status === 'PASS';
  const isAAA = level === 'AAA';

  // Color scheme based on status and level
  const statusColor = isPassing
    ? theme.success
    : theme.danger;

  const levelColor = isAAA ? theme.primary : theme.info;

  const wrapperStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'stretch',
    borderRadius: '6px',
    overflow: 'hidden',
    border: `1px solid ${isPassing ? statusColor : theme.danger}30`,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.03em',
    userSelect: 'none',
  };

  const criterionStyle: CSSProperties = {
    padding: '3px 7px',
    backgroundColor: `${theme.surfaceAlt}`,
    color: theme.textMuted,
    borderRight: `1px solid ${theme.border}`,
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    whiteSpace: 'nowrap',
  };

  const levelStyle: CSSProperties = {
    padding: '3px 6px',
    backgroundColor: `${levelColor}18`,
    color: levelColor,
    borderRight: `1px solid ${levelColor}25`,
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  };

  const statusStyle: CSSProperties = {
    padding: '3px 7px',
    backgroundColor: isPassing
      ? `${statusColor}15`
      : `${statusColor}12`,
    color: statusColor,
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '11px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  };

  const dotStyle: CSSProperties = {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: statusColor,
    flexShrink: 0,
  };

  const ariaLabel = `WCAG ${criterion} Level ${level}: ${status}`;

  return (
    <span
      style={wrapperStyle}
      role="status"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <span style={criterionStyle}>{criterion}</span>
      <span style={levelStyle}>{level}</span>
      <span style={statusStyle}>
        <span style={dotStyle} aria-hidden="true" />
        {status}
      </span>
    </span>
  );
}

// ── WCAGBadgeGroup — displays multiple badges in a row ─────────────────────────

interface WCAGBadgeGroupProps {
  badges: WCAGBadgeProps[];
  label?: string;
}

export function WCAGBadgeGroup({ badges, label = 'WCAG Compliance' }: WCAGBadgeGroupProps) {
  const theme = useTheme();

  const groupStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    alignItems: 'center',
  };

  const labelStyle: CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: theme.textMuted,
    marginRight: '4px',
  };

  return (
    <div
      style={groupStyle}
      role="group"
      aria-label={label}
    >
      <span style={labelStyle} aria-hidden="true">
        {label}:
      </span>
      {badges.map((badge) => (
        <WCAGBadge
          key={`${badge.criterion}-${badge.level}`}
          criterion={badge.criterion}
          level={badge.level}
          status={badge.status}
        />
      ))}
    </div>
  );
}
