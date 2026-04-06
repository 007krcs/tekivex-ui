import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxTabs, TkxTabList, TkxTab, TkxTabPanels, TkxTabPanel,
  TkxBadge, TkxButton, TkxCard,
} from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';
import type { CSSProperties } from 'react';

interface Props { theme: ThemeTokens }

// ── Small reusable helpers ────────────────────────────────────────────────────

function PanelContent({ title, body, theme }: { title: string; body: string; theme: ThemeTokens }) {
  return (
    <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: theme.surfaceAlt + '60', border: `1px solid ${theme.border}` }}>
      <p style={{ margin: 0, fontWeight: 600, color: theme.text, fontSize: '14px', marginBottom: 6 }}>{title}</p>
      <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px', lineHeight: '1.6' }}>{body}</p>
    </div>
  );
}

// ── Controlled Tabs Demo ──────────────────────────────────────────────────────

function ControlledTabsDemo({ theme }: { theme: ThemeTokens }) {
  const [active, setActive] = useState(0);
  const labels = ['Tab One', 'Tab Two', 'Tab Three'];
  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        {labels.map((l, i) => (
          <TkxButton key={i} size="sm" variant={active === i ? 'primary' : 'ghost'} onClick={() => setActive(i)}>
            Jump to {l}
          </TkxButton>
        ))}
      </div>
      <TkxTabs activeIndex={active} onChange={setActive} tabCount={3}>
        <TkxTabList>
          {labels.map((l, i) => <TkxTab key={i} index={i}>{l}</TkxTab>)}
        </TkxTabList>
        <TkxTabPanels>
          {labels.map((l, i) => (
            <TkxTabPanel key={i} index={i}>
              <PanelContent title={l} body={`This is the content for ${l}. The active tab is controlled externally via the activeIndex prop.`} theme={theme} />
            </TkxTabPanel>
          ))}
        </TkxTabPanels>
      </TkxTabs>
    </div>
  );
}

// ── Tabs with Icons ───────────────────────────────────────────────────────────

function IconHome() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconCreditCard() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

// ── Settings Page Content ─────────────────────────────────────────────────────

function SettingsField({ label, value, theme }: { label: string; value: string; theme: ThemeTokens }) {
  const labelStyle: CSSProperties = { fontSize: '12px', fontWeight: 600, color: theme.textMuted, marginBottom: 4 };
  const inputStyle: CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.border}`,
    backgroundColor: theme.bg, color: theme.text, fontSize: '14px', boxSizing: 'border-box',
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={labelStyle}>{label}</div>
      <input style={inputStyle} defaultValue={value} />
    </div>
  );
}

function GeneralSettings({ theme }: { theme: ThemeTokens }) {
  return (
    <div style={{ maxWidth: 480 }}>
      <SettingsField label="Display Name" value="Jane Doe" theme={theme} />
      <SettingsField label="Email Address" value="jane.doe@company.com" theme={theme} />
      <SettingsField label="Username" value="janedoe" theme={theme} />
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <TkxButton variant="primary" size="sm">Save Changes</TkxButton>
        <TkxButton variant="ghost" size="sm">Discard</TkxButton>
      </div>
    </div>
  );
}

function SecuritySettings({ theme }: { theme: ThemeTokens }) {
  const itemStyle: CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: `1px solid ${theme.border}`,
  };
  const items = [
    { label: 'Two-Factor Authentication', sub: 'Protect your account with 2FA', enabled: true },
    { label: 'Login Notifications', sub: 'Get notified of new sign-ins', enabled: true },
    { label: 'API Keys', sub: 'Manage your developer API keys', enabled: false },
  ];
  return (
    <div>
      {items.map((item) => (
        <div key={item.label} style={itemStyle}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: theme.text }}>{item.label}</div>
            <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: 2 }}>{item.sub}</div>
          </div>
          <TkxButton variant={item.enabled ? 'primary' : 'outline'} size="sm">
            {item.enabled ? 'Manage' : 'Enable'}
          </TkxButton>
        </div>
      ))}
    </div>
  );
}

function NotificationsSettings({ theme }: { theme: ThemeTokens }) {
  const items = [
    { label: 'Email Notifications', sub: 'Receive updates via email', on: true },
    { label: 'Push Notifications', sub: 'Browser push alerts', on: false },
    { label: 'Weekly Digest', sub: 'Summary of weekly activity', on: true },
    { label: 'Marketing Emails', sub: 'Product news and announcements', on: false },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: theme.text }}>{item.label}</div>
            <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: 2 }}>{item.sub}</div>
          </div>
          <TkxBadge variant={item.on ? 'success' : 'default'} size="sm">{item.on ? 'On' : 'Off'}</TkxBadge>
        </div>
      ))}
    </div>
  );
}

function BillingSettings({ theme }: { theme: ThemeTokens }) {
  return (
    <div>
      <div style={{ padding: '16px', borderRadius: 8, border: `1px solid ${theme.border}`, marginBottom: 16, backgroundColor: theme.surfaceAlt + '50' }}>
        <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: 4 }}>Current Plan</div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: theme.text }}>Pro Plan</div>
        <div style={{ fontSize: '13px', color: theme.textMuted, marginTop: 4 }}>$29 / month · Renews April 6, 2027</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <TkxButton variant="primary" size="sm">Upgrade Plan</TkxButton>
        <TkxButton variant="ghost" size="sm">View Invoices</TkxButton>
      </div>
    </div>
  );
}

// ── Dashboard Analytics content ───────────────────────────────────────────────

function StatCard({ label, value, change, theme }: { label: string; value: string; change: string; positive: boolean; theme: ThemeTokens }) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: 8, border: `1px solid ${theme.border}`, flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: theme.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: theme.text, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: '12px', color: theme.textMuted }}>{change}</div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function TabsPage({ theme }: Props) {
  const pageStyle: CSSProperties = { maxWidth: '860px', margin: '0 auto', padding: '48px 32px 80px' };
  const h1Style: CSSProperties = { fontSize: '2rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em' };
  const descStyle: CSSProperties = { fontSize: '15px', color: theme.textMuted, lineHeight: '1.7', maxWidth: '620px', margin: '0 0 24px' };
  const h2Style: CSSProperties = { fontSize: '1.2rem', fontWeight: 700, color: theme.text, margin: '48px 0 16px', letterSpacing: '-0.02em' };
  const noteStyle: CSSProperties = { fontSize: '13px', color: theme.textMuted, lineHeight: '1.7', padding: '16px', borderRadius: 8, border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt + '50' };
  const badgeStyle: CSSProperties = {
    display: 'inline-block', padding: '3px 10px', borderRadius: '9999px',
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
    backgroundColor: theme.primary + '18', color: theme.primary,
    border: '1px solid ' + theme.primary + '35', marginBottom: '24px',
  };

  // Scrollable tabs demo (10 tabs)
  const manyTabs = ['Overview', 'Analytics', 'Reports', 'Users', 'Roles', 'Permissions', 'Billing', 'Integrations', 'Audit Log', 'Developer'];

  return (
    <div style={pageStyle}>
      {/* Hero */}
      <span style={badgeStyle}>Component Docs</span>
      <h1 style={h1Style}>TkxTabs</h1>
      <p style={descStyle}>
        <strong>TkxTabs</strong> implements the WAI-ARIA <em>tablist</em> pattern. It supports uncontrolled and controlled modes,
        keyboard navigation (Arrow keys, Home/End), disabled tabs, and composable content panels.
        All focus management follows the roving tabindex strategy.
      </p>
      <WCAGBadgeGroup
        label="WCAG Compliance"
        badges={[
          { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
          { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
          { criterion: '4.1.2 Name, Role, Value', level: 'AA', status: 'PASS' },
        ]}
      />

      {/* 1. Basic Tabs */}
      <DemoSection
        theme={theme}
        title="Basic Tabs"
        description="Three uncontrolled tabs. The first tab is active by default (defaultIndex=0)."
        code={`<TkxTabs tabCount={3}>
  <TkxTabList>
    <TkxTab index={0}>Profile</TkxTab>
    <TkxTab index={1}>Projects</TkxTab>
    <TkxTab index={2}>Activity</TkxTab>
  </TkxTabList>
  <TkxTabPanels>
    <TkxTabPanel index={0}>Profile panel content</TkxTabPanel>
    <TkxTabPanel index={1}>Projects panel content</TkxTabPanel>
    <TkxTabPanel index={2}>Activity panel content</TkxTabPanel>
  </TkxTabPanels>
</TkxTabs>`}
      >
        <div style={{ width: '100%' }}>
          <TkxTabs tabCount={3}>
            <TkxTabList>
              <TkxTab index={0}>Profile</TkxTab>
              <TkxTab index={1}>Projects</TkxTab>
              <TkxTab index={2}>Activity</TkxTab>
            </TkxTabList>
            <TkxTabPanels>
              <TkxTabPanel index={0}><PanelContent title="Profile" body="Manage your personal information, avatar, and account preferences." theme={theme} /></TkxTabPanel>
              <TkxTabPanel index={1}><PanelContent title="Projects" body="View and manage all projects you are a member of or that you own." theme={theme} /></TkxTabPanel>
              <TkxTabPanel index={2}><PanelContent title="Activity" body="A timeline of your recent contributions, comments, and reviews." theme={theme} /></TkxTabPanel>
            </TkxTabPanels>
          </TkxTabs>
        </div>
      </DemoSection>

      {/* 2. Controlled Tabs */}
      <DemoSection
        theme={theme}
        title="Controlled Tabs"
        description="Use activeIndex + onChange to drive the tab state from outside the component. The buttons above jump to specific tabs."
        code={`const [active, setActive] = useState(0);

<TkxTabs activeIndex={active} onChange={setActive} tabCount={3}>
  <TkxTabList>
    <TkxTab index={0}>Tab One</TkxTab>
    <TkxTab index={1}>Tab Two</TkxTab>
    <TkxTab index={2}>Tab Three</TkxTab>
  </TkxTabList>
  <TkxTabPanels>
    <TkxTabPanel index={0}>Content One</TkxTabPanel>
    <TkxTabPanel index={1}>Content Two</TkxTabPanel>
    <TkxTabPanel index={2}>Content Three</TkxTabPanel>
  </TkxTabPanels>
</TkxTabs>`}
      >
        <ControlledTabsDemo theme={theme} />
      </DemoSection>

      {/* 3. Disabled Tab */}
      <DemoSection
        theme={theme}
        title="Disabled Tab"
        description="Pass disabled to any TkxTab to prevent selection. Disabled tabs are skipped by keyboard navigation."
        code={`<TkxTabs tabCount={4}>
  <TkxTabList>
    <TkxTab index={0}>Available</TkxTab>
    <TkxTab index={1} disabled>Disabled</TkxTab>
    <TkxTab index={2}>Available</TkxTab>
    <TkxTab index={3} disabled>Disabled</TkxTab>
  </TkxTabList>
  <TkxTabPanels>
    <TkxTabPanel index={0}>First available panel</TkxTabPanel>
    <TkxTabPanel index={2}>Second available panel</TkxTabPanel>
  </TkxTabPanels>
</TkxTabs>`}
      >
        <div style={{ width: '100%' }}>
          <TkxTabs tabCount={4}>
            <TkxTabList>
              <TkxTab index={0}>Available</TkxTab>
              <TkxTab index={1} disabled>Disabled</TkxTab>
              <TkxTab index={2}>Available</TkxTab>
              <TkxTab index={3} disabled>Coming Soon</TkxTab>
            </TkxTabList>
            <TkxTabPanels>
              <TkxTabPanel index={0}><PanelContent title="Available" body="This tab is fully interactive and accessible." theme={theme} /></TkxTabPanel>
              <TkxTabPanel index={2}><PanelContent title="Second Available" body="The disabled tabs cannot be focused or activated." theme={theme} /></TkxTabPanel>
            </TkxTabPanels>
          </TkxTabs>
        </div>
      </DemoSection>

      {/* 4. Tabs with Icons */}
      <DemoSection
        theme={theme}
        title="Tabs with Icons"
        description="Inline SVG icons placed before the label text. Icons are aria-hidden since the label already describes the tab."
        code={`<TkxTab index={0}>
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
    <HomeIcon aria-hidden /> Home
  </span>
</TkxTab>`}
      >
        <div style={{ width: '100%' }}>
          <TkxTabs tabCount={3}>
            <TkxTabList>
              <TkxTab index={0}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconHome /> Home</span>
              </TkxTab>
              <TkxTab index={1}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconUser /> Account</span>
              </TkxTab>
              <TkxTab index={2}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconSettings /> Settings</span>
              </TkxTab>
            </TkxTabList>
            <TkxTabPanels>
              <TkxTabPanel index={0}><PanelContent title="Home" body="Your dashboard overview with recent activity and key metrics." theme={theme} /></TkxTabPanel>
              <TkxTabPanel index={1}><PanelContent title="Account" body="Profile details, email preferences, and security options." theme={theme} /></TkxTabPanel>
              <TkxTabPanel index={2}><PanelContent title="Settings" body="Application configuration, integrations, and advanced options." theme={theme} /></TkxTabPanel>
            </TkxTabPanels>
          </TkxTabs>
        </div>
      </DemoSection>

      {/* 5. Tabs with Badges */}
      <DemoSection
        theme={theme}
        title="Tabs with Badges"
        description="Notification counts displayed as inline badges inside the tab label. Useful for inbox-style UIs."
        code={`<TkxTab index={0}>
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    Inbox
    <TkxBadge variant="danger" size="sm">12</TkxBadge>
  </span>
</TkxTab>`}
      >
        <div style={{ width: '100%' }}>
          <TkxTabs tabCount={4}>
            <TkxTabList>
              <TkxTab index={0}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <IconBell /> Inbox <TkxBadge variant="danger" size="sm">12</TkxBadge>
                </span>
              </TkxTab>
              <TkxTab index={1}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Requests <TkxBadge variant="warning" size="sm">3</TkxBadge>
                </span>
              </TkxTab>
              <TkxTab index={2}>Sent</TkxTab>
              <TkxTab index={3}>Archive</TkxTab>
            </TkxTabList>
            <TkxTabPanels>
              <TkxTabPanel index={0}><PanelContent title="Inbox (12 unread)" body="Your 12 unread messages are waiting for your attention." theme={theme} /></TkxTabPanel>
              <TkxTabPanel index={1}><PanelContent title="Requests (3 pending)" body="3 collaboration requests require your review." theme={theme} /></TkxTabPanel>
              <TkxTabPanel index={2}><PanelContent title="Sent" body="Messages you have sent to colleagues and contacts." theme={theme} /></TkxTabPanel>
              <TkxTabPanel index={3}><PanelContent title="Archive" body="All archived conversations are stored here." theme={theme} /></TkxTabPanel>
            </TkxTabPanels>
          </TkxTabs>
        </div>
      </DemoSection>

      {/* 6. Settings Page Pattern */}
      <DemoSection
        theme={theme}
        title="Settings Page Pattern"
        description="Real-world settings layout with General, Security, Notifications, and Billing tabs. Each panel contains interactive form elements."
        code={`<TkxTabs tabCount={4}>
  <TkxTabList>
    <TkxTab index={0}><IconUser /> General</TkxTab>
    <TkxTab index={1}><IconShield /> Security</TkxTab>
    <TkxTab index={2}><IconBell /> Notifications</TkxTab>
    <TkxTab index={3}><IconCreditCard /> Billing</TkxTab>
  </TkxTabList>
  <TkxTabPanels>
    <TkxTabPanel index={0}><GeneralSettings /></TkxTabPanel>
    ...
  </TkxTabPanels>
</TkxTabs>`}
      >
        <div style={{ width: '100%' }}>
          <TkxTabs tabCount={4}>
            <TkxTabList>
              <TkxTab index={0}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconUser /> General</span></TkxTab>
              <TkxTab index={1}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconSettings /> Security</span></TkxTab>
              <TkxTab index={2}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconBell /> Notifications</span></TkxTab>
              <TkxTab index={3}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconCreditCard /> Billing</span></TkxTab>
            </TkxTabList>
            <TkxTabPanels>
              <TkxTabPanel index={0}><GeneralSettings theme={theme} /></TkxTabPanel>
              <TkxTabPanel index={1}><SecuritySettings theme={theme} /></TkxTabPanel>
              <TkxTabPanel index={2}><NotificationsSettings theme={theme} /></TkxTabPanel>
              <TkxTabPanel index={3}><BillingSettings theme={theme} /></TkxTabPanel>
            </TkxTabPanels>
          </TkxTabs>
        </div>
      </DemoSection>

      {/* 7. Dashboard Analytics Tabs */}
      <DemoSection
        theme={theme}
        title="Dashboard Analytics Tabs"
        description="Overview, Users, Revenue, and Performance tabs illustrating a metrics dashboard layout."
        code={`<TkxTabs tabCount={4}>
  <TkxTabList>
    <TkxTab index={0}>Overview</TkxTab>
    <TkxTab index={1}>Users</TkxTab>
    <TkxTab index={2}>Revenue</TkxTab>
    <TkxTab index={3}>Performance</TkxTab>
  </TkxTabList>
  ...
</TkxTabs>`}
      >
        <div style={{ width: '100%' }}>
          <TkxTabs tabCount={4}>
            <TkxTabList>
              <TkxTab index={0}>Overview</TkxTab>
              <TkxTab index={1}>Users</TkxTab>
              <TkxTab index={2}>Revenue</TkxTab>
              <TkxTab index={3}>Performance</TkxTab>
            </TkxTabList>
            <TkxTabPanels>
              <TkxTabPanel index={0}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <StatCard label="Total Revenue" value="$84,231" change="+12.4% vs last month" positive theme={theme} />
                  <StatCard label="Active Users" value="3,847" change="+5.1% vs last month" positive theme={theme} />
                  <StatCard label="Conversions" value="2.8%" change="-0.3% vs last month" positive={false} theme={theme} />
                </div>
              </TkxTabPanel>
              <TkxTabPanel index={1}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <StatCard label="New Users" value="1,204" change="+8.9% this week" positive theme={theme} />
                  <StatCard label="Returning" value="2,643" change="+3.2% this week" positive theme={theme} />
                  <StatCard label="Churn Rate" value="1.2%" change="-0.1% this week" positive theme={theme} />
                </div>
              </TkxTabPanel>
              <TkxTabPanel index={2}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <StatCard label="MRR" value="$28,410" change="+6.7% this month" positive theme={theme} />
                  <StatCard label="ARR" value="$340,920" change="+6.7% annualized" positive theme={theme} />
                  <StatCard label="ARPU" value="$7.39" change="+1.4% this month" positive theme={theme} />
                </div>
              </TkxTabPanel>
              <TkxTabPanel index={3}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <StatCard label="Avg Load Time" value="1.2s" change="-80ms vs last week" positive theme={theme} />
                  <StatCard label="API Latency" value="48ms" change="-12ms vs last week" positive theme={theme} />
                  <StatCard label="Error Rate" value="0.04%" change="-0.01% vs last week" positive theme={theme} />
                </div>
              </TkxTabPanel>
            </TkxTabPanels>
          </TkxTabs>
        </div>
      </DemoSection>

      {/* 8. Scrollable Tabs */}
      <DemoSection
        theme={theme}
        title="Scrollable Tabs"
        description="When there are many tabs, wrap the TkxTabList in an overflow-x: auto container. The tab list remains keyboard-navigable."
        code={`<div style={{ overflowX: 'auto' }}>
  <TkxTabList style={{ minWidth: 'max-content' }}>
    {tabs.map((t, i) => <TkxTab key={i} index={i}>{t}</TkxTab>)}
  </TkxTabList>
</div>`}
      >
        <div style={{ width: '100%' }}>
          <TkxTabs tabCount={manyTabs.length}>
            <div style={{ overflowX: 'auto' }}>
              <TkxTabList style={{ minWidth: 'max-content' }}>
                {manyTabs.map((t, i) => <TkxTab key={i} index={i}>{t}</TkxTab>)}
              </TkxTabList>
            </div>
            <TkxTabPanels>
              {manyTabs.map((t, i) => (
                <TkxTabPanel key={i} index={i}>
                  <PanelContent title={t} body={`This is the ${t} section. Scroll the tab list to reveal all available tabs.`} theme={theme} />
                </TkxTabPanel>
              ))}
            </TkxTabPanels>
          </TkxTabs>
        </div>
      </DemoSection>

      {/* Props */}
      <h2 style={h2Style}>TkxTabs Props</h2>
      <PropTable props={[
        { name: 'defaultIndex', type: 'number', default: '0', description: 'Initial active tab index in uncontrolled mode.' },
        { name: 'activeIndex', type: 'number', description: 'Controlled active index. Pass together with onChange.' },
        { name: 'onChange', type: '(index: number) => void', description: 'Callback fired when the active tab changes.' },
        { name: 'tabCount', type: 'number', default: '0', description: 'Total number of tabs. Used for keyboard wrap-around navigation.' },
        { name: 'children', type: 'ReactNode', required: true, description: 'TkxTabList and TkxTabPanels.' },
        { name: 'style', type: 'CSSProperties', description: 'Inline styles for the wrapper div.' },
        { name: 'className', type: 'string', description: 'Additional class names for the wrapper div.' },
      ]} />

      <h2 style={{ ...h2Style, marginTop: 32 }}>TkxTab Props</h2>
      <PropTable props={[
        { name: 'index', type: 'number', required: true, description: 'Zero-based index of this tab. Must match the corresponding TkxTabPanel index.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents the tab from being selected. Skipped by keyboard navigation.' },
        { name: 'children', type: 'ReactNode', required: true, description: 'Tab label. May contain text, icons, or badges.' },
        { name: 'style', type: 'CSSProperties', description: 'Inline styles for the tab button.' },
        { name: 'className', type: 'string', description: 'Additional class names for the tab button.' },
      ]} />

      {/* WCAG Notes */}
      <h2 style={h2Style}>Accessibility Notes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={noteStyle}><strong>Keyboard:</strong> <kbd>Arrow Left / Right</kbd> moves focus between tabs. <kbd>Home</kbd> focuses the first tab; <kbd>End</kbd> focuses the last. <kbd>Space</kbd> / <kbd>Enter</kbd> activate the focused tab.</div>
        <div style={noteStyle}><strong>Roving tabindex:</strong> Only the active tab has <code>tabIndex=0</code>; all others are <code>tabIndex=-1</code>. This keeps the tab list as a single stop in the page tab order.</div>
        <div style={noteStyle}><strong>ARIA roles:</strong> <code>role="tablist"</code> on the list container, <code>role="tab"</code> on each button, <code>role="tabpanel"</code> on each panel. <code>aria-selected</code> reflects the active state. <code>aria-controls</code> links each tab to its panel.</div>
        <div style={noteStyle}><strong>Disabled tabs:</strong> Rendered with the native <code>disabled</code> attribute so they are excluded from tab order and clearly inoperable to assistive technologies.</div>
      </div>
    </div>
  );
}
