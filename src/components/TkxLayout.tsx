import {
  forwardRef,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { useTheme } from '../themes';
import { useReducedMotion } from '../hooks';
import { tkx, cx } from '../engine/tkx';

// ══════════════════════════════════════════════════════════════════════════════
// TkxLayout — Enterprise layout system with Header, Sider, Content, Footer
// plus a 24-column responsive Grid (TkxRow / TkxCol).
// ══════════════════════════════════════════════════════════════════════════════

// ── Layout Props ─────────────────────────────────────────────────────────────

export interface TkxLayoutProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** When true the layout flows horizontally (used when Sider is present). */
  hasSider?: boolean;
  style?: CSSProperties;
  className?: string;
}

export interface TkxHeaderProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Header height in px or CSS string. Default 64. */
  height?: number | string;
  /** Stick to top of viewport. */
  fixed?: boolean;
  style?: CSSProperties;
}

export interface TkxSiderProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Expanded width. Default 240. */
  width?: number | string;
  /** Width when collapsed. Default 64. */
  collapsedWidth?: number;
  /** Controlled collapsed state. */
  collapsed?: boolean;
  /** Callback fired when collapsed state changes. */
  onCollapse?: (collapsed: boolean) => void;
  /** Show built-in collapse trigger at the bottom. */
  collapsible?: boolean;
  /** Auto-collapse when viewport is narrower than this breakpoint. */
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  /** Custom trigger node. Pass null to hide the default trigger entirely. */
  trigger?: ReactNode | null;
  style?: CSSProperties;
}

export interface TkxContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  style?: CSSProperties;
}

export interface TkxFooterProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  style?: CSSProperties;
}

// ── Grid Props ───────────────────────────────────────────────────────────────

export interface TkxRowProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Gutter in px — single number or [horizontal, vertical]. */
  gutter?: number | [number, number];
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'top' | 'middle' | 'bottom' | 'stretch';
  /** Allow wrapping. Default true. */
  wrap?: boolean;
  style?: CSSProperties;
}

interface ColSpanConfig {
  span: number;
  offset?: number;
}

export interface TkxColProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Column span out of 24. */
  span?: number;
  /** Left offset in columns. */
  offset?: number;
  /** Push columns to the right via relative positioning. */
  push?: number;
  /** Pull columns to the left via relative positioning. */
  pull?: number;
  /** Flex order override. */
  order?: number;
  /** Responsive config at >= 576px. */
  sm?: number | ColSpanConfig;
  /** Responsive config at >= 768px. */
  md?: number | ColSpanConfig;
  /** Responsive config at >= 992px. */
  lg?: number | ColSpanConfig;
  /** Responsive config at >= 1200px. */
  xl?: number | ColSpanConfig;
  style?: CSSProperties;
}

// ── Constants ────────────────────────────────────────────────────────────────

const BREAKPOINTS: Record<string, number> = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// ── Utility ──────────────────────────────────────────────────────────────────

function normDim(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

// ── Gutter Context (Row -> Col communication) ────────────────────────────────

interface GutterValue {
  h: number;
  v: number;
}

const GutterContext = createContext<GutterValue>({ h: 0, v: 0 });

// ══════════════════════════════════════════════════════════════════════════════
// TkxLayout
// ══════════════════════════════════════════════════════════════════════════════

export const TkxLayout = forwardRef<HTMLElement, TkxLayoutProps>(
  ({ children, hasSider = false, className, style, ...rest }, ref) => {
    const theme = useTheme();

    const base = tkx('flex min-h-0 w-full font-sans');
    const direction: CSSProperties = hasSider
      ? { flexDirection: 'row' }
      : { flexDirection: 'column' };

    return (
      <section
        ref={ref}
        className={cx('tkx-layout', base, className)}
        style={{
          minHeight: '100%',
          color: theme.text,
          backgroundColor: theme.bg,
          ...direction,
          ...style,
        }}
        {...rest}
      >
        {children}
      </section>
    );
  },
);

TkxLayout.displayName = 'TkxLayout';

// ══════════════════════════════════════════════════════════════════════════════
// TkxHeader
// ══════════════════════════════════════════════════════════════════════════════

export const TkxHeader = forwardRef<HTMLElement, TkxHeaderProps>(
  ({ children, height = 64, fixed = false, className, style, ...rest }, ref) => {
    const theme = useTheme();
    const h = normDim(height);

    const base = tkx('flex items-center px-6 shrink-0 w-full');

    const fixedStyles: CSSProperties = fixed
      ? { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }
      : {};

    return (
      <header
        ref={ref}
        className={cx('tkx-layout-header', base, className)}
        style={{
          height: h,
          minHeight: h,
          backgroundColor: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          ...fixedStyles,
          ...style,
        }}
        {...rest}
      >
        {children}
      </header>
    );
  },
);

TkxHeader.displayName = 'TkxHeader';

// ══════════════════════════════════════════════════════════════════════════════
// TkxSider
// ══════════════════════════════════════════════════════════════════════════════

/** Default chevron trigger for collapsible sidebars. */
function DefaultTrigger({
  collapsed,
  onClick,
  color,
}: {
  collapsed: boolean;
  onClick: () => void;
  color: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <button
      type="button"
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      onClick={onClick}
      className={tkx(
        'flex items-center justify-center w-full py-3 cursor-pointer',
        'border-0 bg-transparent',
      )}
      style={{ color }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        style={{
          transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: reducedMotion ? 'none' : 'transform 200ms ease',
        }}
        aria-hidden="true"
      >
        <path
          d="M6 3l5 5-5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export const TkxSider = forwardRef<HTMLElement, TkxSiderProps>(
  (
    {
      children,
      width = 240,
      collapsedWidth = 64,
      collapsed: controlledCollapsed,
      onCollapse,
      collapsible = false,
      breakpoint,
      trigger,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();

    // Internal collapsed state (uncontrolled fallback).
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const isCollapsed = controlledCollapsed ?? internalCollapsed;

    const handleCollapse = useCallback(
      (next: boolean) => {
        if (controlledCollapsed === undefined) {
          setInternalCollapsed(next);
        }
        onCollapse?.(next);
      },
      [controlledCollapsed, onCollapse],
    );

    // Breakpoint-based auto-collapse.
    useEffect(() => {
      if (!breakpoint) return;
      const bp = BREAKPOINTS[breakpoint];
      if (!bp) return;

      const mq = window.matchMedia(`(max-width: ${bp - 1}px)`);

      const handler = (e: MediaQueryListEvent) => {
        handleCollapse(e.matches);
      };

      // Set initial state based on current viewport.
      handleCollapse(mq.matches);

      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }, [breakpoint, handleCollapse]);

    const expandedWidth = normDim(width);
    const currentWidth = isCollapsed ? `${collapsedWidth}px` : expandedWidth;

    const showTrigger = collapsible && trigger !== null;

    const transitionCSS = reducedMotion
      ? 'none'
      : 'width 200ms ease, min-width 200ms ease, max-width 200ms ease';

    return (
      <aside
        ref={ref}
        className={cx(
          'tkx-layout-sider',
          tkx('shrink-0 overflow-hidden flex flex-col'),
          className,
        )}
        style={{
          width: currentWidth,
          minWidth: currentWidth,
          maxWidth: currentWidth,
          backgroundColor: theme.surface,
          borderRight: `1px solid ${theme.border}`,
          transition: transitionCSS,
          ...style,
        }}
        {...rest}
      >
        <div
          className={tkx('flex-1 overflow-y-auto overflow-x-hidden')}
          style={{ width: currentWidth, transition: transitionCSS }}
        >
          {children}
        </div>

        {showTrigger && (
          <div
            className={tkx('shrink-0')}
            style={{ borderTop: `1px solid ${theme.border}` }}
          >
            {trigger !== undefined ? (
              trigger
            ) : (
              <DefaultTrigger
                collapsed={isCollapsed}
                onClick={() => handleCollapse(!isCollapsed)}
                color={theme.textMuted}
              />
            )}
          </div>
        )}
      </aside>
    );
  },
);

TkxSider.displayName = 'TkxSider';

// ══════════════════════════════════════════════════════════════════════════════
// TkxContent
// ══════════════════════════════════════════════════════════════════════════════

export const TkxContent = forwardRef<HTMLDivElement, TkxContentProps>(
  ({ children, className, style, ...rest }, ref) => {
    const theme = useTheme();

    return (
      <main
        ref={ref}
        className={cx('tkx-layout-content', tkx('flex-1 min-w-0 min-h-0'), className)}
        style={{
          backgroundColor: theme.bg,
          padding: '24px',
          ...style,
        }}
        {...rest}
      >
        {children}
      </main>
    );
  },
);

TkxContent.displayName = 'TkxContent';

// ══════════════════════════════════════════════════════════════════════════════
// TkxFooter
// ══════════════════════════════════════════════════════════════════════════════

export const TkxFooter = forwardRef<HTMLElement, TkxFooterProps>(
  ({ children, className, style, ...rest }, ref) => {
    const theme = useTheme();

    return (
      <footer
        ref={ref}
        className={cx('tkx-layout-footer', tkx('flex items-center px-6 py-4 shrink-0'), className)}
        style={{
          backgroundColor: theme.surface,
          borderTop: `1px solid ${theme.border}`,
          color: theme.textMuted,
          ...style,
        }}
        {...rest}
      >
        {children}
      </footer>
    );
  },
);

TkxFooter.displayName = 'TkxFooter';

// ══════════════════════════════════════════════════════════════════════════════
// TkxRow — 24-column flexbox grid row
// ══════════════════════════════════════════════════════════════════════════════

const JUSTIFY_MAP: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
};

const ALIGN_MAP: Record<string, string> = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
  stretch: 'stretch',
};

export const TkxRow = forwardRef<HTMLDivElement, TkxRowProps>(
  (
    {
      children,
      gutter,
      justify = 'start',
      align = 'top',
      wrap = true,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const [hGutter, vGutter] = Array.isArray(gutter)
      ? gutter
      : [gutter ?? 0, 0];

    const halfH = hGutter / 2;
    const halfV = vGutter / 2;

    // Negative margins on the row compensate for column padding,
    // keeping the outer edges flush with the layout.
    const marginStyle: CSSProperties =
      hGutter || vGutter
        ? { marginLeft: -halfH, marginRight: -halfH, marginTop: -halfV, marginBottom: -halfV }
        : {};

    const gutterValue: GutterValue = { h: halfH, v: halfV };

    return (
      <GutterContext.Provider value={gutterValue}>
        <div
          ref={ref}
          className={cx('tkx-row', tkx('flex w-full'), className)}
          style={{
            flexWrap: wrap ? 'wrap' : 'nowrap',
            justifyContent: JUSTIFY_MAP[justify] ?? 'flex-start',
            alignItems: ALIGN_MAP[align] ?? 'flex-start',
            ...marginStyle,
            ...style,
          }}
          {...rest}
        >
          {children}
        </div>
      </GutterContext.Provider>
    );
  },
);

TkxRow.displayName = 'TkxRow';

// ══════════════════════════════════════════════════════════════════════════════
// TkxCol — 24-column flexbox grid column
// ══════════════════════════════════════════════════════════════════════════════

/** Inject responsive media-query classes once into the document head. */
let responsiveStyleInjected = false;

function injectResponsiveStyles(): void {
  if (responsiveStyleInjected || typeof document === 'undefined') return;
  responsiveStyleInjected = true;

  const rules: string[] = [];

  for (const [bp, minWidth] of Object.entries(BREAKPOINTS)) {
    // Span classes: .tkx-col-{bp}-{1..24}
    for (let i = 1; i <= 24; i++) {
      const pct = `${(i / 24) * 100}%`;
      rules.push(
        `@media (min-width: ${minWidth}px) { .tkx-col-${bp}-${i} { flex: 0 0 ${pct} !important; max-width: ${pct} !important; } }`,
      );
    }
    // Offset classes: .tkx-col-{bp}-offset-{0..24}
    for (let i = 0; i <= 24; i++) {
      const pct = `${(i / 24) * 100}%`;
      rules.push(
        `@media (min-width: ${minWidth}px) { .tkx-col-${bp}-offset-${i} { margin-left: ${pct} !important; } }`,
      );
    }
  }

  const el = document.createElement('style');
  el.id = 'tkx-col-responsive';
  el.textContent = rules.join('\n');
  document.head.appendChild(el);
}

function normaliseBreakpointProp(
  value: number | ColSpanConfig | undefined,
): ColSpanConfig | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? { span: value } : value;
}

export const TkxCol = forwardRef<HTMLDivElement, TkxColProps>(
  (
    {
      children,
      span,
      offset = 0,
      push,
      pull,
      order,
      sm,
      md,
      lg,
      xl,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    // Inject responsive stylesheet on first render.
    useEffect(() => {
      injectResponsiveStyles();
    }, []);

    // Read gutter from parent TkxRow via context.
    const gutter = useContext(GutterContext);

    // Base span/offset (no breakpoint).
    const baseWidth = span !== undefined ? `${(span / 24) * 100}%` : undefined;
    const baseOffset = offset ? `${(offset / 24) * 100}%` : undefined;

    // Build responsive class list.
    const responsiveClasses: string[] = [];

    const bpEntries: [string, number | ColSpanConfig | undefined][] = [
      ['sm', sm],
      ['md', md],
      ['lg', lg],
      ['xl', xl],
    ];

    for (const [bp, raw] of bpEntries) {
      const cfg = normaliseBreakpointProp(raw);
      if (!cfg) continue;
      responsiveClasses.push(`tkx-col-${bp}-${cfg.span}`);
      if (cfg.offset !== undefined && cfg.offset > 0) {
        responsiveClasses.push(`tkx-col-${bp}-offset-${cfg.offset}`);
      }
    }

    // Positional overrides (push/pull/order).
    const positional: CSSProperties = {};
    if (push !== undefined) {
      positional.left = `${(push / 24) * 100}%`;
      positional.position = 'relative';
    }
    if (pull !== undefined) {
      positional.right = `${(pull / 24) * 100}%`;
      positional.position = 'relative';
    }
    if (order !== undefined) {
      positional.order = order;
    }

    return (
      <div
        ref={ref}
        className={cx(
          'tkx-col',
          tkx('box-border min-h-[1px]'),
          ...responsiveClasses,
          className,
        )}
        style={{
          flex: baseWidth ? `0 0 ${baseWidth}` : '1',
          maxWidth: baseWidth ?? '100%',
          marginLeft: baseOffset,
          paddingLeft: gutter.h || undefined,
          paddingRight: gutter.h || undefined,
          paddingTop: gutter.v || undefined,
          paddingBottom: gutter.v || undefined,
          ...positional,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

TkxCol.displayName = 'TkxCol';

// ══════════════════════════════════════════════════════════════════════════════
// Usage example:
//
// <TkxLayout>
//   <TkxHeader fixed>Logo / Nav</TkxHeader>
//   <TkxLayout hasSider>
//     <TkxSider collapsible breakpoint="md">Menu</TkxSider>
//     <TkxContent>
//       <TkxRow gutter={[16, 16]}>
//         <TkxCol span={12} md={8}>Column A</TkxCol>
//         <TkxCol span={12} md={16}>Column B</TkxCol>
//       </TkxRow>
//     </TkxContent>
//   </TkxLayout>
//   <TkxFooter>Footer</TkxFooter>
// </TkxLayout>
// ══════════════════════════════════════════════════════════════════════════════
