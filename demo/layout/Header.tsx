import type { CSSProperties } from 'react';
import type { ThemeTokens } from '@tekivex/ui';

// ── Types ─────────────────────────────────────────────────────────────────────

interface HeaderProps {
  currentRoute: string;
  isDark: boolean;
  onToggleTheme: () => void;
  theme: ThemeTokens;
  isMobile?: boolean;
  onMenuToggle?: () => void;
}

// ── Route → page title map ────────────────────────────────────────────────────

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/getting-started': 'Getting Started',
  '/css-system': 'TKX CSS System',
  '/components/button': 'Button',
  '/components/card': 'Card',
  '/components/input': 'Input',
  '/components/badge': 'Badge',
  '/components/progress': 'Progress',
  '/components/toggle': 'Toggle',
  '/components/alert': 'Alert',
  '/components/modal': 'Modal',
  '/components/tabs': 'Tabs',
  '/components/tooltip': 'Tooltip',
  '/components/skeleton': 'Skeleton',
  '/components/avatar': 'Avatar',
  '/components/table': 'Table',
  '/components/divider': 'Divider',
  '/templates/dashboard': 'Dashboard Template',
  '/templates/portfolio': 'Portfolio Template',
  '/templates/ecommerce': 'E-commerce Template',
  '/templates/supply-chain': 'Supply Chain Template',
  '/components/select': 'Select',
  '/components/checkbox': 'Checkbox',
  '/components/radio': 'Radio',
  '/components/toast': 'Toast',
  '/components/accordion': 'Accordion',
  '/components/drawer': 'Drawer',
  '/components/date-picker': 'Date Picker',
  '/components/slider': 'Slider',
  '/components/pagination': 'Pagination',
  '/components/image': 'Image',
  '/components/file-upload': 'File Upload',
  '/components/rating': 'Rating',
  '/components/chat': 'Chat',
  '/components/tag': 'Tag',
  '/components/timeline': 'Timeline',
  '/components/menu': 'Menu',
  '/components/clock': 'Clock',
  '/components/video-player': 'Video Player',
  '/components/stepper': 'Stepper',
  '/components/color-picker': 'Color Picker',
  '/components/number-input': 'Number Input',
  '/components/otp': 'OTP Input',
  '/components/command': 'Command',
  '/components/carousel': 'Carousel',
  '/components/icon': 'Icon',
  '/components/breadcrumb': 'Breadcrumb',
  '/components/popover': 'Popover',
  '/components/autocomplete': 'Autocomplete',
  '/components/tree-view': 'Tree View',
  '/components/toolbar': 'Toolbar',
  '/components/transfer-list': 'Transfer List',
  '/components/speed-dial': 'Speed Dial',
  '/components/app-bar': 'App Bar',
  '/components/bottom-nav': 'Bottom Navigation',
  '/components/snackbar': 'Snackbar',
  '/components/data-grid': 'Data Grid',
  '/components/masonry': 'Masonry',
  '/components/rich-text': 'Rich Text Display',
  '/components/form': 'Form',
  '/components/layout': 'Layout',
  '/components/typography': 'Typography',
  '/components/spin': 'Spin',
  '/components/empty': 'Empty',
  '/components/statistic': 'Statistic',
  '/components/config-provider': 'Config Provider',
  '/components/affix': 'Affix',
  '/components/anchor': 'Anchor',
  '/components/cascader': 'Cascader',
  '/components/mentions': 'Mentions',
  '/components/qr-code': 'QR Code',
  '/components/result': 'Result',
  '/components/segmented': 'Segmented',
  '/components/tour': 'Tour',
  '/components/watermark': 'Watermark',
  '/charts': 'Charts',
  '/headless': 'Headless Primitives',
  '/security': 'Security',
  '/live-feed': 'Live Feed',
  '/live-metrics': 'Live Metrics',
  '/realtime-chart': 'Realtime Chart',
  '/live-log': 'Live Log',
  '/datagrid-infinite': 'DataGrid Infinite',
  '/quantum-form': 'Quantum Form',
  '/theme-builder': 'Theme Builder',
  '/playground': 'Playground',
  '/templates/blog': 'Blog / CMS Template',
  '/templates/admin-settings': 'Admin Settings Template',
  '/templates/landing-page': 'Landing Page Template',
  '/about': 'About Us',
  '/license': 'License',
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconMoon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M14 10.5A6.5 6.5 0 015.5 2a.5.5 0 00-.663.653A7 7 0 1013.347 14.163.5.5 0 0014 10.5z"
        fill={color}
      />
    </svg>
  );
}

function IconSun({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.5" />
      <path
        d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.22 3.22l1.06 1.06M11.72 11.72l1.06 1.06M11.72 4.28l1.06-1.06M3.22 12.78l1.06-1.06"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMenu({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 4h14M2 9h14M2 14h14" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

// ── Header component ──────────────────────────────────────────────────────────

export function Header({ currentRoute, isDark, onToggleTheme, theme, isMobile, onMenuToggle }: HeaderProps) {
  const pageTitle = ROUTE_TITLES[currentRoute] ?? 'TekiVex UI';
  const isComponentPage = currentRoute.startsWith('/components/');
  const isTemplatePage = currentRoute.startsWith('/templates/');

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '56px',
    gap: '16px',
  };

  const leftStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
    flex: 1,
  };

  const breadcrumbStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: theme.textMuted,
    flexShrink: 0,
  };

  const breadcrumbSepStyle: CSSProperties = {
    color: theme.border,
    fontSize: '16px',
    lineHeight: '1',
    userSelect: 'none',
  };

  const titleStyle: CSSProperties = {
    fontSize: '15px',
    fontWeight: 600,
    color: theme.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const rightStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  };

  const wcagBadgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: `${theme.success}18`,
    color: theme.success,
    border: `1px solid ${theme.success}40`,
    letterSpacing: '0.03em',
  };

  const versionTextStyle: CSSProperties = {
    fontSize: '12px',
    color: theme.textMuted,
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
  };

  const iconButtonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: '6px',
    border: `1px solid ${theme.border}`,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: theme.textMuted,
    transition: 'all 0.15s ease',
    padding: 0,
  };

  const dividerStyle: CSSProperties = {
    width: '1px',
    height: '20px',
    backgroundColor: theme.border,
    flexShrink: 0,
  };

  return (
    <header style={headerStyle} role="banner">
      {/* Hamburger — mobile only */}
      {isMobile && (
        <button
          type="button"
          style={{ ...iconButtonStyle, marginRight: 4, flexShrink: 0 }}
          onClick={onMenuToggle}
          aria-label="Open navigation menu"
          aria-expanded={false}
        >
          <IconMenu color={theme.textMuted} />
        </button>
      )}

      {/* Left: breadcrumb + title */}
      <div style={leftStyle}>
        <nav aria-label="Breadcrumb">
          <ol
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            <li>
              <a
                href="#/"
                style={{
                  ...breadcrumbStyle,
                  textDecoration: 'none',
                  color: theme.textMuted,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = '/';
                }}
              >
                TekiVex UI
              </a>
            </li>

            {isComponentPage && (
              <>
                <li aria-hidden="true">
                  <span style={breadcrumbSepStyle}>/</span>
                </li>
                <li>
                  <span style={{ ...breadcrumbStyle, color: theme.textMuted }}>
                    Components
                  </span>
                </li>
              </>
            )}

            {isTemplatePage && (
              <>
                <li aria-hidden="true">
                  <span style={breadcrumbSepStyle}>/</span>
                </li>
                <li>
                  <span style={{ ...breadcrumbStyle, color: theme.textMuted }}>
                    Templates
                  </span>
                </li>
              </>
            )}

            {currentRoute !== '/' && (
              <>
                <li aria-hidden="true">
                  <span style={breadcrumbSepStyle}>/</span>
                </li>
                <li aria-current="page">
                  <span style={titleStyle}>{pageTitle}</span>
                </li>
              </>
            )}

            {currentRoute === '/' && (
              <li aria-current="page">
                <span style={titleStyle}>Overview</span>
              </li>
            )}
          </ol>
        </nav>
      </div>

      {/* Right: controls */}
      <div style={rightStyle}>
        {!isMobile && (
          <>
            <span style={wcagBadgeStyle} title="Meets WCAG 2.1 Level AAA">
              WCAG AAA
            </span>
            <span style={versionTextStyle}>v2.5.11</span>
            <div style={dividerStyle} aria-hidden="true" />
          </>
        )}

        {/* Theme toggle */}
        <button
          type="button"
          style={iconButtonStyle}
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to Aurora Light theme' : 'Switch to Quantum Dark theme'}
          title={isDark ? 'Switch to Aurora Light' : 'Switch to Quantum Dark'}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = theme.primary;
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${theme.primary}10`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = theme.border;
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          }}
        >
          {isDark ? (
            <IconSun color={theme.textMuted} />
          ) : (
            <IconMoon color={theme.textMuted} />
          )}
        </button>
      </div>
    </header>
  );
}
