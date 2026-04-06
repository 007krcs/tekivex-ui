import {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface TkxAccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpen?: string[];
  variant?: 'default' | 'bordered' | 'separated';
  size?: 'sm' | 'md' | 'lg';
  onChange?: (openIds: string[]) => void;
}

// ── Size config ───────────────────────────────────────────────────────────────

const SIZE_PADDING: Record<NonNullable<TkxAccordionProps['size']>, string> = {
  sm: tkx('px-3 py-2'),
  md: tkx('px-4 py-3'),
  lg: tkx('px-5 py-4'),
};

const SIZE_TEXT: Record<NonNullable<TkxAccordionProps['size']>, string> = {
  sm: tkx('text-sm'),
  md: tkx('text-base'),
  lg: tkx('text-lg'),
};

const SIZE_CONTENT_PADDING: Record<NonNullable<TkxAccordionProps['size']>, string> = {
  sm: tkx('px-3 pb-2'),
  md: tkx('px-4 pb-3'),
  lg: tkx('px-5 pb-4'),
};

// ── Animated panel ────────────────────────────────────────────────────────────

interface AnimatedPanelProps {
  isOpen: boolean;
  reduced: boolean;
  children: ReactNode;
  id: string;
  triggerId: string;
}

function AnimatedPanel({ isOpen, reduced, children, id, triggerId }: AnimatedPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<string>(isOpen ? 'none' : '0px');
  const [overflow, setOverflow] = useState<'hidden' | 'visible'>(isOpen ? 'visible' : 'hidden');
  const prevOpenRef = useRef(isOpen);

  useEffect(() => {
    if (reduced) {
      setMaxHeight(isOpen ? 'none' : '0px');
      setOverflow(isOpen ? 'visible' : 'hidden');
      prevOpenRef.current = isOpen;
      return;
    }

    if (prevOpenRef.current === isOpen) return;
    prevOpenRef.current = isOpen;

    const el = contentRef.current;
    if (!el) return;

    if (isOpen) {
      setOverflow('hidden');
      setMaxHeight('0px');
      // Force reflow then animate to scrollHeight
      requestAnimationFrame(() => {
        setMaxHeight(`${el.scrollHeight}px`);
      });
    } else {
      setOverflow('hidden');
      setMaxHeight(`${el.scrollHeight}px`);
      requestAnimationFrame(() => {
        setMaxHeight('0px');
      });
    }
  }, [isOpen, reduced]);

  const handleTransitionEnd = () => {
    if (isOpen) {
      setMaxHeight('none');
      setOverflow('visible');
    }
  };

  return (
    <div
      id={id}
      role="region"
      aria-labelledby={triggerId}
      hidden={!isOpen && maxHeight === '0px' && !reduced ? undefined : undefined}
      style={{
        maxHeight,
        overflow,
        transition: reduced ? 'none' : 'max-height 260ms cubic-bezier(0.4,0,0.2,1)',
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
}

// ── Chevron icon ──────────────────────────────────────────────────────────────

function ChevronIcon({ open, reduced }: { open: boolean; reduced: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: reduced ? 'none' : 'transform 240ms cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0,
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TkxAccordion({
  items,
  multiple = false,
  defaultOpen = [],
  variant = 'default',
  size = 'md',
  onChange,
}: TkxAccordionProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const baseId = useId();
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(defaultOpen));

  const toggle = useCallback((id: string, disabled?: boolean) => {
    if (disabled) return;
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      onChange?.([...next]);
      return next;
    });
  }, [multiple, onChange]);

  const isSeparated = variant === 'separated';
  const isBordered  = variant === 'bordered';

  const wrapperStyle: React.CSSProperties = isBordered
    ? { border: `1px solid ${theme.border}`, borderRadius: 8 }
    : {};

  return (
    <div
      style={wrapperStyle}
      className={tkx(isSeparated ? 'flex flex-col gap-2' : '')}
    >
      {items.map((item, idx) => {
        const isOpen     = openIds.has(item.id);
        const triggerId  = `${baseId}-trigger-${item.id}`;
        const panelId    = `${baseId}-panel-${item.id}`;
        const isFirst    = idx === 0;
        const isLast     = idx === items.length - 1;

        const itemBorderStyle: React.CSSProperties = isBordered
          ? {
              borderBottom: isLast && !isOpen ? 'none' : `1px solid ${theme.border}`,
            }
          : isSeparated
          ? {
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              overflow: 'hidden',
            }
          : {
              borderBottom: isLast ? 'none' : `1px solid ${theme.border}`,
            };

        const itemRadiusStyle: React.CSSProperties = isBordered
          ? {
              borderRadius: isFirst ? '8px 8px 0 0' : isLast && !isOpen ? '0 0 8px 8px' : 0,
            }
          : {};

        return (
          <div
            key={item.id}
            style={itemBorderStyle}
          >
            {/* Trigger */}
            <button
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              disabled={item.disabled}
              onClick={() => toggle(item.id, item.disabled)}
              className={tkx(
                'w-full flex items-center gap-2 border-none bg-transparent cursor-pointer text-left font-sans font-medium focus-visible:focus-ring',
                SIZE_PADDING[size],
                SIZE_TEXT[size],
                item.disabled ? 'opacity-50 cursor-not-allowed' : '',
              )}
              style={{
                color: theme.text,
                backgroundColor: isOpen ? `${theme.primary}0d` : 'transparent',
                transition: reduced ? 'none' : 'background-color 160ms ease',
                ...itemRadiusStyle,
              }}
            >
              {item.icon && (
                <span className={tkx('shrink-0')} style={{ color: theme.primary }}>
                  {item.icon}
                </span>
              )}
              <span className={tkx('flex-1 min-w-0')}>{item.title}</span>
              <span style={{ color: isOpen ? theme.primary : theme.textMuted }}>
                <ChevronIcon open={isOpen} reduced={reduced} />
              </span>
            </button>

            {/* Animated panel */}
            <AnimatedPanel
              isOpen={isOpen}
              reduced={reduced}
              id={panelId}
              triggerId={triggerId}
            >
              <div
                className={tkx(SIZE_CONTENT_PADDING[size], 'text-sm leading-relaxed font-sans')}
                style={{ color: theme.textMuted }}
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
