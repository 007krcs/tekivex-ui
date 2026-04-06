import {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AccordionVariant = 'default' | 'bordered' | 'separated' | 'ghost' | 'flush';
export type AccordionSize = 'sm' | 'md' | 'lg';

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  subtitle?: string;
  disabled?: boolean;
  className?: string;
}

export interface TkxAccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpen?: string | string[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  variant?: AccordionVariant;
  size?: AccordionSize;
  iconPosition?: 'left' | 'right';
  iconStyle?: 'chevron' | 'plus' | 'arrow';
  flush?: boolean;
  className?: string;
  style?: CSSProperties;
}

// ── Size config ───────────────────────────────────────────────────────────────

const SIZE_CONFIG: Record<AccordionSize, {
  triggerPadding: string;
  contentPadding: string;
  fontSize: string;
  subtitleSize: string;
  iconSize: number;
}> = {
  sm: {
    triggerPadding: '10px 12px',
    contentPadding: '0 12px 10px 12px',
    fontSize: '13px',
    subtitleSize: '11px',
    iconSize: 14,
  },
  md: {
    triggerPadding: '14px 16px',
    contentPadding: '0 16px 14px 16px',
    fontSize: '14px',
    subtitleSize: '12px',
    iconSize: 16,
  },
  lg: {
    triggerPadding: '18px 20px',
    contentPadding: '0 20px 18px 20px',
    fontSize: '16px',
    subtitleSize: '13px',
    iconSize: 18,
  },
};

// ── Icon Components ───────────────────────────────────────────────────────────

interface AccordionIconProps {
  open: boolean;
  reduced: boolean;
  iconStyle: 'chevron' | 'plus' | 'arrow';
  size: number;
  color: string;
}

function AccordionIcon({ open, reduced, iconStyle, size, color }: AccordionIconProps) {
  const transition = reduced ? 'none' : 'transform 240ms cubic-bezier(0.4, 0, 0.2, 1)';

  if (iconStyle === 'chevron') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition,
          flexShrink: 0,
        }}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    );
  }

  if (iconStyle === 'plus') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition,
          flexShrink: 0,
        }}
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );
  }

  // arrow style: → rotates to ↓
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        transition,
        flexShrink: 0,
      }}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ── Animated Panel ────────────────────────────────────────────────────────────

interface AnimatedPanelProps {
  isOpen: boolean;
  reduced: boolean;
  children: ReactNode;
  id: string;
  triggerId: string;
}

function AnimatedPanel({ isOpen, reduced, children, id, triggerId }: AnimatedPanelProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(isOpen);
  const isAnimatingRef = useRef(false);

  // Initial render — set immediately without animation
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    if (isOpen) {
      el.style.height = 'auto';
      el.style.overflow = 'visible';
    } else {
      el.style.height = '0px';
      el.style.overflow = 'hidden';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prevOpenRef.current === isOpen) return;
    prevOpenRef.current = isOpen;

    const el = outerRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;

    if (reduced) {
      el.style.height = isOpen ? 'auto' : '0px';
      el.style.overflow = isOpen ? 'visible' : 'hidden';
      return;
    }

    if (isAnimatingRef.current) {
      // Cancel mid-animation: snapshot current rendered height
      const currentHeight = el.getBoundingClientRect().height;
      el.style.transition = 'none';
      el.style.height = `${currentHeight}px`;
      // Force reflow
      void el.offsetHeight;
    }

    isAnimatingRef.current = true;
    el.style.overflow = 'hidden';

    if (isOpen) {
      // Animate 0 → scrollHeight
      el.style.height = '0px';
      el.style.transition = 'height 280ms cubic-bezier(0.4, 0, 0.2, 1)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.height = `${inner.scrollHeight}px`;
        });
      });
    } else {
      // Animate scrollHeight → 0
      el.style.height = `${inner.scrollHeight}px`;
      el.style.transition = 'height 280ms cubic-bezier(0.4, 0, 0.2, 1)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.height = '0px';
        });
      });
    }
  }, [isOpen, reduced]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== 'height') return;
    isAnimatingRef.current = false;
    const el = outerRef.current;
    if (!el) return;
    if (isOpen) {
      el.style.height = 'auto';
      el.style.overflow = 'visible';
    } else {
      el.style.overflow = 'hidden';
    }
  };

  return (
    <div
      ref={outerRef}
      id={id}
      role="region"
      aria-labelledby={triggerId}
      onTransitionEnd={handleTransitionEnd}
      style={{ willChange: 'height' }}
    >
      <div ref={innerRef}>
        {children}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TkxAccordion({
  items,
  multiple = false,
  defaultOpen,
  value: valueProp,
  onChange,
  variant = 'default',
  size = 'md',
  iconPosition = 'right',
  iconStyle = 'chevron',
  flush = false,
  className,
  style,
}: TkxAccordionProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const baseId = useId();

  // Controlled vs uncontrolled
  const isControlled = valueProp !== undefined;

  const normalizeInitial = (v: string | string[] | undefined): Set<string> => {
    if (!v) return new Set();
    if (Array.isArray(v)) return new Set(v);
    return new Set([v]);
  };

  const [internalOpen, setInternalOpen] = useState<Set<string>>(() =>
    normalizeInitial(defaultOpen)
  );

  const openIds: Set<string> = isControlled
    ? normalizeInitial(valueProp)
    : internalOpen;

  const toggle = useCallback(
    (id: string, disabled?: boolean) => {
      if (disabled) return;

      let next: Set<string>;
      if (isControlled) {
        const current = normalizeInitial(valueProp);
        next = new Set(current);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (!multiple) next.clear();
          next.add(id);
        }
      } else {
        setInternalOpen((prev) => {
          next = new Set(prev);
          if (next.has(id)) {
            next.delete(id);
          } else {
            if (!multiple) next.clear();
            next.add(id);
          }
          const arr = [...next];
          onChange?.(multiple ? arr : arr[0] ?? '');
          return next;
        });
        return;
      }

      const arr = [...next];
      onChange?.(multiple ? arr : arr[0] ?? '');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [multiple, onChange, isControlled, valueProp]
  );

  const sz = SIZE_CONFIG[size];

  // Variant-specific wrapper styles
  const getWrapperStyle = (): CSSProperties => {
    if (flush) return {};
    switch (variant) {
      case 'bordered':
        return {
          border: `1px solid ${theme.border}`,
          borderRadius: '10px',
          overflow: 'hidden',
        };
      case 'separated':
        return {};
      case 'ghost':
      case 'flush':
        return {};
      default: // 'default'
        return {};
    }
  };

  // Item wrapper styles
  const getItemStyle = (idx: number, isOpen: boolean, isLast: boolean): CSSProperties => {
    if (flush) return {};
    switch (variant) {
      case 'default':
        return {
          borderBottom: isLast ? 'none' : `1px solid ${theme.border}`,
        };
      case 'bordered':
        return {
          borderBottom: isLast ? 'none' : `1px solid ${theme.border}`,
        };
      case 'separated':
        return {
          border: `1px solid ${theme.border}`,
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`,
        };
      case 'ghost':
        return {};
      default:
        return {};
    }
    void idx; void isOpen;
  };

  // Trigger hover style
  const getTriggerHoverBg = (isOpen: boolean): string => {
    if (variant === 'ghost' || variant === 'flush') {
      return isOpen ? `${theme.primary}10` : `${theme.surfaceAlt}80`;
    }
    return isOpen ? `${theme.primary}0d` : `${theme.surfaceAlt}60`;
  };

  const isSeparatedVariant = variant === 'separated';

  return (
    <div
      className={tkx(className ?? '')}
      style={{
        ...getWrapperStyle(),
        display: isSeparatedVariant ? 'flex' : undefined,
        flexDirection: isSeparatedVariant ? 'column' : undefined,
        gap: isSeparatedVariant ? '8px' : undefined,
        ...style,
      }}
    >
      {items.map((item, idx) => {
        const isOpen = openIds.has(item.id);
        const isLast = idx === items.length - 1;
        const triggerId = `${baseId}-trigger-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className={item.className}
            style={getItemStyle(idx, isOpen, isLast)}
          >
            {/* Trigger button */}
            <button
              id={triggerId}
              type="button"
              role="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              disabled={item.disabled}
              onClick={() => toggle(item.id, item.disabled)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: item.subtitle ? 'flex-start' : 'center',
                gap: '8px',
                padding: sz.triggerPadding,
                border: 'none',
                background: 'transparent',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                fontSize: sz.fontSize,
                fontWeight: 500,
                color: item.disabled ? theme.textMuted : theme.text,
                opacity: item.disabled ? 0.5 : 1,
                transition: reduced ? 'none' : 'background-color 160ms ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (!item.disabled) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = getTriggerHoverBg(isOpen);
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = isOpen ? `${theme.primary}0d` : 'transparent';
              }}
              onFocus={(e) => {
                if (!item.disabled) {
                  e.currentTarget.style.outline = `2px solid ${theme.primary}`;
                  e.currentTarget.style.outlineOffset = '2px';
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
            >
              {/* Left icon (item icon) */}
              {item.icon && (
                <span
                  aria-hidden="true"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    color: theme.primary,
                    marginTop: item.subtitle ? '1px' : undefined,
                  }}
                >
                  {item.icon}
                </span>
              )}

              {/* Left chevron position */}
              {iconPosition === 'left' && (
                <span
                  aria-hidden="true"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    color: isOpen ? theme.primary : theme.textMuted,
                    marginTop: item.subtitle ? '1px' : undefined,
                  }}
                >
                  <AccordionIcon
                    open={isOpen}
                    reduced={reduced}
                    iconStyle={iconStyle}
                    size={sz.iconSize}
                    color={isOpen ? theme.primary : theme.textMuted}
                  />
                </span>
              )}

              {/* Title + subtitle block */}
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', lineHeight: 1.4 }}>{item.title}</span>
                {item.subtitle && (
                  <span
                    style={{
                      display: 'block',
                      fontSize: sz.subtitleSize,
                      color: theme.textMuted,
                      fontWeight: 400,
                      marginTop: '2px',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.subtitle}
                  </span>
                )}
              </span>

              {/* Badge */}
              {item.badge && (
                <span
                  aria-hidden="true"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.badge}
                </span>
              )}

              {/* Right chevron position (default) */}
              {iconPosition === 'right' && (
                <span
                  aria-hidden="true"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    color: isOpen ? theme.primary : theme.textMuted,
                    marginTop: item.subtitle ? '1px' : undefined,
                  }}
                >
                  <AccordionIcon
                    open={isOpen}
                    reduced={reduced}
                    iconStyle={iconStyle}
                    size={sz.iconSize}
                    color={isOpen ? theme.primary : theme.textMuted}
                  />
                </span>
              )}
            </button>

            {/* Animated content panel */}
            <AnimatedPanel
              isOpen={isOpen}
              reduced={reduced}
              id={panelId}
              triggerId={triggerId}
            >
              <div
                style={{
                  padding: sz.contentPadding,
                  fontSize: sz.fontSize,
                  lineHeight: 1.6,
                  color: theme.textMuted,
                  fontFamily: 'inherit',
                }}
              >
                {item.content}
              </div>
            </AnimatedPanel>
          </div>
        );
      })}
    </div>
  );
}

TkxAccordion.displayName = 'TkxAccordion';
