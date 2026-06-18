import { useState, useMemo, type CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TKX_VERSION } from '../version';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  route: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  /** If true, items are displayed alphabetically (by label). */
  sortAlphabetically?: boolean;
}

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  theme: ThemeTokens;
}

// ── Navigation structure ──────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Overview', route: '/' },
      { label: 'Getting Started', route: '/getting-started' },
      { label: 'Bundler Integration', route: '/bundlers' },
      { label: 'v2.7 Showcase ✨', route: '/v2-7' },
      { label: 'TKX CSS System', route: '/css-system' },
      { label: '⚡ RSC Compatibility', route: '/rsc' },
    ],
  },
  {
    title: '🤖 Agent runtime',
    items: [
      { label: 'Agent overview', route: '/agent' },
    ],
  },
  {
    title: '⚛ Quantum AI',
    items: [
      { label: 'Quantum Form', route: '/quantum-form' },
      { label: 'Theme Builder', route: '/theme-builder' },
      { label: 'Live Playground', route: '/playground' },
      { label: '🤖 AI Components', route: '/ai-components' },
      { label: '  ↳ ConfidenceBar', route: '/ai-components/confidence-bar' },
      { label: '  ↳ ChatBubble', route: '/ai-components/chat-bubble' },
      { label: '  ↳ Thinking', route: '/ai-components/thinking' },
    ],
  },
  {
    title: '⚡ Real-Time',
    items: [
      { label: 'Live Feed', route: '/live-feed' },
      { label: 'Live Metrics', route: '/live-metrics' },
      { label: 'Real-Time Chart', route: '/realtime-chart' },
      { label: 'Live Log', route: '/live-log' },
      { label: 'DataGrid Infinite', route: '/datagrid-infinite' },
    ],
  },
  {
    title: 'Charts',
    items: [
      { label: 'Charts Overview', route: '/charts' },
    ],
  },
  {
    title: 'Headless Primitives',
    items: [
      { label: 'Headless Hooks', route: '/headless' },
    ],
  },
  {
    title: 'Security & A11y',
    items: [
      { label: 'Security Engine', route: '/security' },
    ],
  },
  {
    title: 'Components',
    sortAlphabetically: true,
    items: [
      { label: 'Accordion', route: '/components/accordion' },
      { label: 'Affix', route: '/components/affix' },
      { label: 'Alert', route: '/components/alert' },
      { label: 'Anchor', route: '/components/anchor' },
      { label: 'App Bar', route: '/components/app-bar' },
      { label: 'Autocomplete', route: '/components/autocomplete' },
      { label: 'Avatar', route: '/components/avatar' },
      { label: 'Badge', route: '/components/badge' },
      { label: 'Bottom Nav', route: '/components/bottom-nav' },
      { label: 'Breadcrumb', route: '/components/breadcrumb' },
      { label: 'Button', route: '/components/button' },
      { label: 'Card', route: '/components/card' },
      { label: 'Carousel', route: '/components/carousel' },
      { label: 'Cascader', route: '/components/cascader' },
      { label: 'Chat', route: '/components/chat' },
      { label: 'Checkbox', route: '/components/checkbox' },
      { label: 'Clock', route: '/components/clock' },
      { label: 'Color Picker', route: '/components/color-picker' },
      { label: 'Command', route: '/components/command' },
      { label: 'Config Provider', route: '/components/config-provider' },
      { label: 'Data Grid', route: '/components/data-grid' },
      { label: 'Date Picker', route: '/components/date-picker' },
      { label: 'Divider', route: '/components/divider' },
      { label: 'Drawer', route: '/components/drawer' },
      { label: 'Empty', route: '/components/empty' },
      { label: 'File Upload', route: '/components/file-upload' },
      { label: 'Form', route: '/components/form' },
      { label: 'Icon', route: '/components/icon' },
      { label: 'Image', route: '/components/image' },
      { label: 'Input', route: '/components/input' },
      { label: 'Layout', route: '/components/layout' },
      { label: 'Markdown', route: '/components/markdown' },
      { label: 'Masonry', route: '/components/masonry' },
      { label: 'Mentions', route: '/components/mentions' },
      { label: 'Menu', route: '/components/menu' },
      { label: 'Message Thread ✨', route: '/components/message-thread' },
      { label: 'Modal', route: '/components/modal' },
      { label: 'Number Input', route: '/components/number-input' },
      { label: 'Org Chart ✨', route: '/components/org-chart' },
      { label: 'OTP Input', route: '/components/otp' },
      { label: 'Pagination', route: '/components/pagination' },
      { label: 'Popover', route: '/components/popover' },
      { label: 'Progress', route: '/components/progress' },
      { label: 'QR Code', route: '/components/qr-code' },
      { label: 'Radio', route: '/components/radio' },
      { label: 'Rating', route: '/components/rating' },
      { label: 'Result', route: '/components/result' },
      { label: 'Rich Text', route: '/components/rich-text' },
      { label: 'Segmented', route: '/components/segmented' },
      { label: 'Select', route: '/components/select' },
      { label: 'Skeleton', route: '/components/skeleton' },
      { label: 'Slider', route: '/components/slider' },
      { label: 'Snackbar', route: '/components/snackbar' },
      { label: 'Speed Dial', route: '/components/speed-dial' },
      { label: 'Spin', route: '/components/spin' },
      { label: 'Statistic', route: '/components/statistic' },
      { label: 'Stepper', route: '/components/stepper' },
      { label: 'Table', route: '/components/table' },
      { label: 'Tabs', route: '/components/tabs' },
      { label: 'Tag', route: '/components/tag' },
      { label: 'Timeline', route: '/components/timeline' },
      { label: 'Toast', route: '/components/toast' },
      { label: 'Toggle', route: '/components/toggle' },
      { label: 'Toolbar', route: '/components/toolbar' },
      { label: 'Tooltip', route: '/components/tooltip' },
      { label: 'Tour', route: '/components/tour' },
      { label: 'Transfer List', route: '/components/transfer-list' },
      { label: 'Tree View', route: '/components/tree-view' },
      { label: 'Typography', route: '/components/typography' },
      { label: 'Video Player', route: '/components/video-player' },
      { label: 'Watermark', route: '/components/watermark' },
    ],
  },
  {
    title: 'Templates',
    items: [
      { label: 'Dashboard', route: '/templates/dashboard' },
      { label: 'Portfolio', route: '/templates/portfolio' },
      { label: 'E-commerce', route: '/templates/ecommerce' },
      { label: 'Supply Chain', route: '/templates/supply-chain' },
      { label: 'Blog / CMS', route: '/templates/blog' },
      { label: 'Admin Settings', route: '/templates/admin-settings' },
      { label: 'Landing Page', route: '/templates/landing-page' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'About Us', route: '/about' },
      { label: 'Ecosystem ✨', route: '/ecosystem' },
      { label: 'License', route: '/license' },
      { label: 'Blog', route: '/blog' },
      { label: 'Privacy Policy', route: '/privacy-policy' },
    ],
  },
];

// ── SVG icons ─────────────────────────────────────────────────────────────────

function IconChevron({ color }: { color: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 3L7 6L4 9"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSearch({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" stroke={color} strokeWidth="1.5" />
      <path d="M9.5 9.5L12.5 12.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconLogo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="6" fill="#00f5d4" fillOpacity="0.15" />
      <path
        d="M8 20L14 8L20 20"
        stroke="#00f5d4"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 16H17.5"
        stroke="#00f5d4"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Sidebar component ─────────────────────────────────────────────────────────

export function Sidebar({ currentRoute, onNavigate, theme }: SidebarProps) {
  const [query, setQuery] = useState('');

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NAV_GROUPS.map((group) => {
      const items = group.sortAlphabetically
        ? [...group.items].sort((a, b) => a.label.localeCompare(b.label))
        : group.items;
      const filtered = q
        ? items.filter(
            (item) =>
              item.label.toLowerCase().includes(q) ||
              item.route.toLowerCase().includes(q),
          )
        : items;
      return { ...group, items: filtered };
    }).filter((group) => group.items.length > 0);
  }, [query]);

  const brandStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 16px 16px',
    borderBottom: `1px solid ${theme.border}`,
    textDecoration: 'none',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const brandTextStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  };

  const brandNameStyle: CSSProperties = {
    fontSize: '15px',
    fontWeight: 700,
    color: theme.primary,
    letterSpacing: '-0.01em',
    lineHeight: '1.2',
  };

  const versionBadgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '1px 6px',
    borderRadius: '9999px',
    fontSize: '10px',
    fontWeight: 600,
    backgroundColor: `${theme.primary}20`,
    color: theme.primary,
    border: `1px solid ${theme.primary}40`,
    letterSpacing: '0.02em',
    width: 'fit-content',
  };

  const searchWrapperStyle: CSSProperties = {
    position: 'relative',
    padding: '10px 12px',
    borderBottom: `1px solid ${theme.border}`,
  };

  const searchIconStyle: CSSProperties = {
    position: 'absolute',
    left: '22px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    display: 'flex',
  };

  const searchInputStyle: CSSProperties = {
    width: '100%',
    padding: '8px 28px 8px 32px',
    fontSize: '13px',
    color: theme.text,
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };

  const clearBtnStyle: CSSProperties = {
    position: 'absolute',
    right: '22px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: theme.textMuted,
    cursor: 'pointer',
    fontSize: '14px',
    lineHeight: 1,
    padding: '2px 6px',
    borderRadius: '4px',
  };

  const navContentStyle: CSSProperties = {
    padding: '8px 0 24px',
  };

  const groupStyle: CSSProperties = {
    marginBottom: '4px',
  };

  const groupLabelStyle: CSSProperties = {
    padding: '12px 16px 4px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: theme.textMuted,
  };

  const getItemStyle = (isActive: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '9px 16px',
    minHeight: '40px',
    fontSize: '13.5px',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? theme.primary : theme.text,
    backgroundColor: isActive ? `${theme.primary}12` : 'transparent',
    cursor: 'pointer',
    borderLeft: isActive
      ? `2px solid ${theme.primary}`
      : '2px solid transparent',
    transition: 'all 0.15s ease',
    textDecoration: 'none',
    borderRadius: '0 4px 4px 0',
    marginRight: '8px',
    userSelect: 'none',
  });

  const emptyStateStyle: CSSProperties = {
    padding: '24px 16px',
    textAlign: 'center',
    color: theme.textMuted,
    fontSize: '13px',
  };

  const footerStyle: CSSProperties = {
    padding: '12px 16px',
    borderTop: `1px solid ${theme.border}`,
    marginTop: '8px',
  };

  const footerTextStyle: CSSProperties = {
    fontSize: '11px',
    color: theme.textMuted,
    lineHeight: '1.6',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div
        style={brandStyle}
        onClick={() => onNavigate('/')}
        role="link"
        aria-label="TekiVex UI home"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onNavigate('/')}
      >
        <IconLogo />
        <div style={brandTextStyle}>
          <span style={brandNameStyle}>TekiVex UI</span>
          <span style={versionBadgeStyle}>{TKX_VERSION}</span>
        </div>
      </div>

      {/* Search */}
      <div style={searchWrapperStyle}>
        <span style={searchIconStyle}>
          <IconSearch color={theme.textMuted} />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search components…"
          aria-label="Search components and pages"
          style={searchInputStyle}
          onFocus={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = theme.primary;
            (e.currentTarget as HTMLInputElement).style.boxShadow = `0 0 0 3px ${theme.primary}22`;
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = theme.border;
            (e.currentTarget as HTMLInputElement).style.boxShadow = 'none';
          }}
        />
        {query && (
          <button
            type="button"
            style={clearBtnStyle}
            aria-label="Clear search"
            onClick={() => setQuery('')}
          >
            ×
          </button>
        )}
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <nav style={navContentStyle} aria-label="Component navigation">
          {filteredGroups.length === 0 ? (
            <div style={emptyStateStyle}>
              No matches for <strong>{query}</strong>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.title} style={groupStyle}>
                <div style={groupLabelStyle} aria-hidden="true">
                  {group.title}
                </div>
                <ul role="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {group.items.map((item) => {
                    const isActive = currentRoute === item.route;
                    return (
                      <li key={item.route}>
                        <a
                          href={`#${item.route}`}
                          style={getItemStyle(isActive)}
                          aria-current={isActive ? 'page' : undefined}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(item.route);
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              (e.currentTarget as HTMLElement).style.backgroundColor =
                                `${theme.primary}08`;
                              (e.currentTarget as HTMLElement).style.color = theme.text;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              (e.currentTarget as HTMLElement).style.backgroundColor =
                                'transparent';
                              (e.currentTarget as HTMLElement).style.color = theme.text;
                            }
                          }}
                        >
                          <span>{item.label}</span>
                          {isActive && <IconChevron color={theme.primary} />}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </nav>
      </div>

      {/* Footer */}
      <div style={footerStyle}>
        <p style={footerTextStyle}>
          WCAG 2.1 AAA · WAI-ARIA 1.2
          <br />
          Zero-trust · TypeScript
        </p>
        <div style={{ marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href="#/about"
            onClick={(e) => { e.preventDefault(); onNavigate('/about'); }}
            style={{ fontSize: '11px', color: theme.textMuted, textDecoration: 'none' }}
          >
            About
          </a>
          <a
            href="#/license"
            onClick={(e) => { e.preventDefault(); onNavigate('/license'); }}
            style={{ fontSize: '11px', color: theme.textMuted, textDecoration: 'none' }}
          >
            License
          </a>
          <a
            href="#/blog"
            onClick={(e) => { e.preventDefault(); onNavigate('/blog'); }}
            style={{ fontSize: '11px', color: theme.textMuted, textDecoration: 'none' }}
          >
            Blog
          </a>
          <a
            href="#/privacy-policy"
            onClick={(e) => { e.preventDefault(); onNavigate('/privacy-policy'); }}
            style={{ fontSize: '11px', color: theme.textMuted, textDecoration: 'none' }}
          >
            Privacy
          </a>
          <a
            href="https://ui.tekivex.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '11px', color: theme.textMuted, textDecoration: 'none' }}
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/tekivex-ui"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '11px', color: theme.textMuted, textDecoration: 'none' }}
          >
            npm
          </a>
        </div>
        <p style={{ ...footerTextStyle, marginTop: '8px', fontSize: '10px' }}>
          MIT © 2026 007krcs
        </p>
      </div>
    </div>
  );
}
