import { useState, type CSSProperties, type ReactNode } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxBottomNav } from 'tekivex-ui';
import type { BottomNavItem } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props { theme: ThemeTokens }

// ── Sample icons ─────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ── Item sets ────────────────────────────────────────────────────────────────

const BASIC_ITEMS: BottomNavItem[] = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'search', label: 'Search', icon: <SearchIcon /> },
  { id: 'favorites', label: 'Favorites', icon: <HeartIcon /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon /> },
];

const BADGE_ITEMS: BottomNavItem[] = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'search', label: 'Search', icon: <SearchIcon /> },
  { id: 'favorites', label: 'Favorites', icon: <HeartIcon />, badge: 3 },
  { id: 'cart', label: 'Cart', icon: <CartIcon />, badge: 12 },
  { id: 'profile', label: 'Profile', icon: <UserIcon /> },
];

// ── Basic Demo ───────────────────────────────────────────────────────────────

function BasicDemo() {
  const [active, setActive] = useState('home');
  return (
    <TkxBottomNav
      items={BASIC_ITEMS}
      activeId={active}
      onChange={setActive}
    />
  );
}

// ── Badge Demo ───────────────────────────────────────────────────────────────

function BadgeDemo() {
  const [active, setActive] = useState('home');
  return (
    <TkxBottomNav
      items={BADGE_ITEMS}
      activeId={active}
      onChange={setActive}
    />
  );
}

// ── No Labels Demo ───────────────────────────────────────────────────────────

function NoLabelsDemo() {
  const [active, setActive] = useState('home');
  return (
    <TkxBottomNav
      items={BASIC_ITEMS}
      activeId={active}
      onChange={setActive}
      showLabels={false}
    />
  );
}

// ── BottomNavPage ────────────────────────────────────────────────────────────

export function BottomNavPage({ theme }: Props) {
  const pageStyle: CSSProperties = {
    maxWidth: 900,
    margin: '0 auto',
    padding: '48px 32px 80px',
  };

  const h1Style: CSSProperties = {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: theme.text,
    margin: '0 0 12px',
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
  };

  const leadStyle: CSSProperties = {
    fontSize: 15,
    color: theme.textMuted,
    lineHeight: 1.75,
    maxWidth: 640,
    margin: '0 0 48px',
  };

  const dividerStyle: CSSProperties = {
    border: 'none',
    borderTop: `1px solid ${theme.border}`,
    margin: '40px 0',
  };

  const sectionHeadStyle: CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: theme.text,
    margin: '0 0 16px',
    letterSpacing: '-0.02em',
  };

  const demoBoxStyle: CSSProperties = {
    borderRadius: 12,
    border: `1px solid ${theme.border}`,
    overflow: 'hidden',
    backgroundColor: theme.surfaceAlt,
    maxWidth: 420,
  };

  const phoneBodyStyle: CSSProperties = {
    padding: 24,
    minHeight: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    color: theme.textMuted,
  };

  return (
    <div style={pageStyle}>
      {/* ── Hero ── */}
      <h1 style={h1Style}>TkxBottomNav</h1>
      <p style={leadStyle}>
        A mobile-style bottom navigation bar with icon and label support.
        Accepts up to five items, each with an optional numeric badge.
        Full keyboard navigation with arrow keys and animated active indicator.
      </p>

      {/* ── Basic ── */}
      <DemoSection
        title="Basic Bottom Navigation"
        description="A four-item bottom navigation bar. Click an item to change the active tab. The active indicator animates between items."
        theme={theme}
        code={`const [active, setActive] = useState('home');

const items = [
  { id: 'home',      label: 'Home',      icon: <HomeIcon /> },
  { id: 'search',    label: 'Search',    icon: <SearchIcon /> },
  { id: 'favorites', label: 'Favorites', icon: <HeartIcon /> },
  { id: 'profile',   label: 'Profile',   icon: <UserIcon /> },
];

<TkxBottomNav
  items={items}
  activeId={active}
  onChange={setActive}
/>`}
      >
        <div style={demoBoxStyle}>
          <div style={phoneBodyStyle}>Tap items below to navigate</div>
          <BasicDemo />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Badges ── */}
      <DemoSection
        title="With Badges"
        description="Add a numeric badge to any item via the badge property. Useful for showing unread counts, cart quantities, or notification counts."
        theme={theme}
        code={`const items = [
  { id: 'home',      label: 'Home',      icon: <HomeIcon /> },
  { id: 'search',    label: 'Search',    icon: <SearchIcon /> },
  { id: 'favorites', label: 'Favorites', icon: <HeartIcon />, badge: 3 },
  { id: 'cart',      label: 'Cart',      icon: <CartIcon />,  badge: 12 },
  { id: 'profile',   label: 'Profile',   icon: <UserIcon /> },
];

<TkxBottomNav items={items} activeId={active} onChange={setActive} />`}
      >
        <div style={demoBoxStyle}>
          <div style={phoneBodyStyle}>Items with badge counts</div>
          <BadgeDemo />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Without Labels ── */}
      <DemoSection
        title="Without Labels"
        description="Set showLabels to false for an icon-only navigation bar. The labels are still present in the accessibility tree for screen readers."
        theme={theme}
        code={`<TkxBottomNav
  items={items}
  activeId={active}
  onChange={setActive}
  showLabels={false}
/>`}
      >
        <div style={demoBoxStyle}>
          <div style={phoneBodyStyle}>Icon-only navigation</div>
          <NoLabelsDemo />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props ── */}
      <section aria-labelledby="props-heading">
        <h2 id="props-heading" style={sectionHeadStyle}>Props</h2>
        <PropTable
          props={[
            { name: 'items', type: 'BottomNavItem[]', required: true, description: 'Array of navigation items (max 5). Each has id, label, icon, and optional badge count.' },
            { name: 'activeId', type: 'string', description: 'The id of the currently active item. Controls the highlighted state.' },
            { name: 'onChange', type: '(id: string) => void', description: 'Callback fired when the user selects a navigation item.' },
            { name: 'showLabels', type: 'boolean', default: 'true', description: 'Whether to display text labels beneath the icons. Labels remain in the accessibility tree when hidden.' },
          ]}
        />
      </section>
    </div>
  );
}
