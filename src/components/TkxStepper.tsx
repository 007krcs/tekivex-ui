'use client';

import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';

// ── Types ────────────────────────────────────────────────────────────────────

export type StepStatus = 'completed' | 'active' | 'error' | 'pending';
export type StepperOrientation = 'horizontal' | 'vertical';

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  status?: StepStatus;
  optional?: boolean;
  error?: string;
}

export interface TkxStepperProps {
  steps: Step[];
  activeStep?: number;
  orientation?: StepperOrientation;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  onStepClick?: (index: number) => void;
  showStepNumbers?: boolean;
  alternateLabel?: boolean;
  connector?: 'solid' | 'dashed' | 'dotted';
  className?: string;
  style?: CSSProperties;
}

// ── Size constants ────────────────────────────────────────────────────────────

const SIZE_MAP = {
  sm: { circle: 24, fontSize: '0.75rem', titleSize: '0.8rem', descSize: '0.7rem', connectorWidth: 2 },
  md: { circle: 32, fontSize: '0.875rem', titleSize: '0.9rem', descSize: '0.775rem', connectorWidth: 2 },
  lg: { circle: 40, fontSize: '1rem', titleSize: '1rem', descSize: '0.85rem', connectorWidth: 3 },
};

// ── Icon SVGs ────────────────────────────────────────────────────────────────

function CheckIcon({ size }: { size: number }) {
  const s = size * 0.55;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  );
}

function XIcon({ size }: { size: number }) {
  const s = size * 0.55;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );
}

// ── Step circle ───────────────────────────────────────────────────────────────

interface StepCircleProps {
  status: StepStatus;
  index: number;
  showStepNumbers: boolean;
  icon?: ReactNode;
  circleSize: number;
  fontSize: string;
  primary: string;
  danger: string;
  success: string;
  text: string;
  textMuted: string;
  border: string;
  surface: string;
  bg: string;
  variant: 'default' | 'outlined' | 'filled';
  reducedMotion: boolean;
  clickable: boolean;
}

function StepCircle({
  status,
  index,
  showStepNumbers,
  icon,
  circleSize,
  fontSize,
  primary,
  danger,
  success,
  text,
  textMuted,
  border,
  surface,
  bg,
  variant,
  reducedMotion,
  clickable,
}: StepCircleProps) {
  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  const isError = status === 'error';
  const isPending = status === 'pending';

  let bgColor = surface;
  let borderColor = border;
  let color = textMuted;
  let borderWidth = 2;

  if (isCompleted) {
    bgColor = variant === 'filled' ? success : surface;
    borderColor = success;
    color = variant === 'filled' ? bg : success;
  } else if (isActive) {
    bgColor = variant === 'outlined' ? surface : primary;
    borderColor = primary;
    color = variant === 'outlined' ? primary : bg;
    borderWidth = 2;
  } else if (isError) {
    bgColor = variant === 'filled' ? danger : surface;
    borderColor = danger;
    color = variant === 'filled' ? bg : danger;
  } else if (isPending) {
    bgColor = surface;
    borderColor = border;
    color = textMuted;
  }

  const pulseStyle: CSSProperties = isActive && !reducedMotion
    ? {
        boxShadow: `0 0 0 4px ${primary}30`,
        animation: 'tkxstepper-pulse 2s ease-in-out infinite',
      }
    : {};

  const hoverStyle: CSSProperties = clickable
    ? { cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }
    : {};

  let content: ReactNode;
  if (icon && !isCompleted && !isError) {
    content = <span style={{ fontSize, lineHeight: 1 }}>{icon}</span>;
  } else if (isCompleted) {
    content = <CheckIcon size={circleSize} />;
  } else if (isError) {
    content = <XIcon size={circleSize} />;
  } else if (showStepNumbers) {
    content = <span style={{ fontSize, fontWeight: 600, lineHeight: 1 }}>{index + 1}</span>;
  } else {
    content = <span style={{ fontSize: circleSize * 0.22, lineHeight: 1, background: color, borderRadius: '50%', width: circleSize * 0.22, height: circleSize * 0.22, display: 'block' }} />;
  }

  return (
    <>
      <style>{`
        @keyframes tkxstepper-pulse {
          0%, 100% { box-shadow: 0 0 0 0 ${primary}50; }
          50% { box-shadow: 0 0 0 6px ${primary}20; }
        }
      `}</style>
      <div
        style={{
          width: circleSize,
          height: circleSize,
          minWidth: circleSize,
          borderRadius: '50%',
          border: `${borderWidth}px solid ${borderColor}`,
          backgroundColor: bgColor,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: reducedMotion ? 'none' : 'background-color 0.2s, border-color 0.2s',
          ...pulseStyle,
          ...hoverStyle,
        }}
      >
        {content}
      </div>
    </>
  );
}

// ── Connector line ─────────────────────────────────────────────────────────────

interface ConnectorProps {
  completed: boolean;
  orientation: StepperOrientation;
  connectorStyle: 'solid' | 'dashed' | 'dotted';
  connectorWidth: number;
  primary: string;
  border: string;
  reducedMotion: boolean;
}

function Connector({
  completed,
  orientation,
  connectorStyle,
  connectorWidth,
  primary,
  border,
  reducedMotion,
}: ConnectorProps) {
  const color = completed ? primary : border;

  if (orientation === 'horizontal') {
    return (
      <div
        aria-hidden="true"
        style={{
          flex: 1,
          height: connectorWidth,
          backgroundColor: connectorStyle === 'solid' ? color : 'transparent',
          backgroundImage: connectorStyle !== 'solid'
            ? `repeating-linear-gradient(90deg, ${color} 0, ${color} 6px, transparent 6px, transparent ${connectorStyle === 'dashed' ? 12 : 9}px)`
            : 'none',
          borderRadius: 1,
          transition: reducedMotion ? 'none' : 'background-color 0.3s ease, background-image 0.3s ease',
          alignSelf: 'center',
          marginLeft: 4,
          marginRight: 4,
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        width: connectorWidth,
        flex: 1,
        minHeight: 20,
        backgroundColor: connectorStyle === 'solid' ? color : 'transparent',
        backgroundImage: connectorStyle !== 'solid'
          ? `repeating-linear-gradient(180deg, ${color} 0, ${color} 6px, transparent 6px, transparent ${connectorStyle === 'dashed' ? 12 : 9}px)`
          : 'none',
        borderRadius: 1,
        transition: reducedMotion ? 'none' : 'background-color 0.3s ease, background-image 0.3s ease',
        alignSelf: 'stretch',
        marginTop: 4,
        marginBottom: 4,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TkxStepper({
  steps = [],
  activeStep = 0,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  clickable = false,
  onStepClick,
  showStepNumbers = true,
  alternateLabel = false,
  connector = 'solid',
  className,
  style,
}: TkxStepperProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  const sizes = SIZE_MAP[size];

  const resolveStatus = (step: Step, index: number): StepStatus => {
    if (step.status) return step.status;
    if (index < activeStep) return 'completed';
    if (index === activeStep) return 'active';
    return 'pending';
  };

  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={className}
      role="list"
      aria-label="Steps"
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: isHorizontal ? (alternateLabel ? 'flex-start' : 'center') : 'stretch',
        width: '100%',
        gap: 0,
        ...style,
      }}
    >
      {steps.map((step, i) => {
        const status = resolveStatus(step, i);
        const isLast = i === steps.length - 1;
        const isCompleted = status === 'completed' || i < activeStep;
        const isEven = i % 2 === 0;

        const handleClick = () => {
          if (clickable) onStepClick?.(i);
        };

        // When steps are clickable, expose each step node as a real,
        // keyboard-operable control (was a plain <div onClick> → WCAG 2.1.1).
        // Non-clickable steppers keep purely presentational nodes.
        const interactiveProps = clickable
          ? {
              role: 'button' as const,
              tabIndex: 0,
              'aria-label': step.title,
              onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onStepClick?.(i);
                }
              },
            }
          : {};

        const circle = (
          <StepCircle
            status={status}
            index={i}
            showStepNumbers={showStepNumbers}
            icon={step.icon}
            circleSize={sizes.circle}
            fontSize={sizes.fontSize}
            primary={theme.primary}
            danger={theme.danger}
            success={theme.success}
            text={theme.text}
            textMuted={theme.textMuted}
            border={theme.border}
            surface={theme.surface}
            bg={theme.bg}
            variant={variant}
            reducedMotion={reducedMotion}
            clickable={clickable}
          />
        );

        const labelBlock = (
          <div
            style={{
              textAlign: isHorizontal && !alternateLabel ? 'center' : 'left',
              maxWidth: isHorizontal ? 120 : undefined,
            }}
          >
            <div
              style={{
                fontSize: sizes.titleSize,
                fontWeight: status === 'active' ? 600 : 500,
                color: status === 'pending' ? theme.textMuted : status === 'error' ? theme.danger : theme.text,
                lineHeight: 1.3,
                transition: reducedMotion ? 'none' : 'color 0.2s',
              }}
            >
              {sanitizeString(step.title)}
              {step.optional && (
                <span style={{ fontSize: sizes.descSize, color: theme.textMuted, fontWeight: 400, marginLeft: 4 }}>
                  (optional)
                </span>
              )}
            </div>
            {step.description && (
              <div
                style={{
                  fontSize: sizes.descSize,
                  color: theme.textMuted,
                  marginTop: 2,
                  lineHeight: 1.4,
                }}
              >
                {sanitizeString(step.description)}
              </div>
            )}
            {step.error && status === 'error' && (
              <div
                style={{
                  fontSize: sizes.descSize,
                  color: theme.danger,
                  marginTop: 2,
                }}
              >
                {sanitizeString(step.error)}
              </div>
            )}
          </div>
        );

        if (isHorizontal) {
          return (
            <div
              key={step.id}
              role="listitem"
              style={{ display: 'flex', flex: isLast ? 0 : 1, alignItems: 'center', minWidth: 0 }}
            >
              {/* Step node */}
              <div
                {...interactiveProps}
                onClick={handleClick}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  cursor: clickable ? 'pointer' : 'default',
                  flexShrink: 0,
                }}
                aria-current={status === 'active' ? 'step' : undefined}
              >
                {alternateLabel && !isEven && (
                  <div style={{ minHeight: sizes.circle * 1.5 + 6, display: 'flex', alignItems: 'flex-end', paddingBottom: 6 }}>
                    {labelBlock}
                  </div>
                )}
                {circle}
                {!alternateLabel && labelBlock}
                {alternateLabel && isEven && (
                  <div style={{ marginTop: 6 }}>{labelBlock}</div>
                )}
              </div>

              {/* Connector */}
              {!isLast && (
                <Connector
                  completed={isCompleted}
                  orientation="horizontal"
                  connectorStyle={connector}
                  connectorWidth={sizes.connectorWidth}
                  primary={theme.primary}
                  border={theme.border}
                  reducedMotion={reducedMotion}
                />
              )}
            </div>
          );
        }

        // Vertical
        return (
          <div key={step.id} role="listitem" style={{ display: 'flex', flexDirection: 'row', minHeight: 0 }}>
            {/* Left column: circle + connector */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginRight: 14,
                flexShrink: 0,
              }}
            >
              <div
                {...interactiveProps}
                onClick={handleClick}
                style={{ cursor: clickable ? 'pointer' : 'default' }}
                aria-current={status === 'active' ? 'step' : undefined}
              >
                {circle}
              </div>
              {!isLast && (
                <Connector
                  completed={isCompleted}
                  orientation="vertical"
                  connectorStyle={connector}
                  connectorWidth={sizes.connectorWidth}
                  primary={theme.primary}
                  border={theme.border}
                  reducedMotion={reducedMotion}
                />
              )}
            </div>

            {/* Right column: label */}
            <div
              style={{
                paddingTop: (sizes.circle - parseFloat(sizes.titleSize) * 16) / 2,
                paddingBottom: isLast ? 0 : 16,
                flex: 1,
                minWidth: 0,
              }}
            >
              {labelBlock}
            </div>
          </div>
        );
      })}
    </div>
  );
}

TkxStepper.displayName = 'TkxStepper';