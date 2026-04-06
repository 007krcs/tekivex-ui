import type { CSSProperties } from 'react';
import type { ThemeTokens } from '@tekivex/ui';

// ── Types ─────────────────────────────────────────────────────────────────────

interface HeaderProps {
  currentRoute: string;
  isDark: boolean;
  onToggleTheme: () => void;
  theme: ThemeTokens;
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

function IconGitHub({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// ── Header component ──────────────────────────────────────────────────────────

export function Header({ currentRoute, isDark, onToggleTheme, theme }: HeaderProps) {
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
        <span style={wcagBadgeStyle} title="Meets WCAG 2.1 Level AAA">
          WCAG AAA
        </span>

        <span style={versionTextStyle}>v2.0.0</span>

        <div style={dividerStyle} aria-hidden="true" />

        {/* GitHub link */}
        <a
          href="https://github.com/tekivex/ui"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...iconButtonStyle,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="View on GitHub"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = theme.primary;
            (e.currentTarget as HTMLElement).style.color = theme.primary;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = theme.border;
            (e.currentTarget as HTMLElement).style.color = theme.textMuted;
          }}
        >
          <IconGitHub color="currentColor" />
        </a>

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
