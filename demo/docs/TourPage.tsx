import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxTour, TkxButton, TkxBadge } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

const TOUR_PROPS = [
  { name: 'steps', type: 'TourStep[]', default: '—', description: 'Array of tour steps. Each step has target (CSS selector), title, description, and optional placement.', required: true },
  { name: 'isOpen', type: 'boolean', default: 'false', description: 'Controls whether the tour is active and visible.' },
  { name: 'onClose', type: '() => void', default: 'undefined', description: 'Called when the user closes the tour (via the X button or completing all steps).' },
  { name: 'current', type: 'number', default: '0', description: 'Controlled current step index.' },
  { name: 'onChange', type: '(step: number) => void', default: 'undefined', description: 'Called when the step changes, providing the new step index.' },
];

const TOUR_STEP_PROPS = [
  { name: 'target', type: 'string', default: '—', description: 'CSS selector string pointing to the element to highlight (e.g. "#my-button", ".feature-card").', required: true },
  { name: 'title', type: 'string', default: '—', description: 'Short heading for the tour step popover.', required: true },
  { name: 'description', type: 'string', default: '—', description: 'Detailed explanation text shown below the title.', required: true },
  { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'bottom'", description: 'Where to position the popover relative to the target element.' },
];

export function TourPage({ theme }: { theme: ThemeTokens }) {
  const [basicOpen, setBasicOpen] = useState(false);
  const [featureOpen, setFeatureOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const divider = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  const BASIC_STEPS = [
    {
      target: '#tour-search-btn',
      title: 'Search Anything',
      description: 'Use the search bar to quickly find components, pages, or settings across the entire application.',
      placement: 'bottom' as const,
    },
    {
      target: '#tour-notifications',
      title: 'Notification Center',
      description: 'Click the bell icon to see your latest alerts, mentions, and system updates in real time.',
      placement: 'bottom' as const,
    },
    {
      target: '#tour-new-project',
      title: 'Create a Project',
      description: 'Hit this button to start a new project. You can choose from 7 templates or begin from scratch.',
      placement: 'bottom' as const,
    },
  ];

  const FEATURE_STEPS = [
    {
      target: '#tour-stats-card',
      title: 'Live Statistics',
      description: 'These cards show real-time metrics. Data refreshes every 30 seconds automatically.',
      placement: 'bottom' as const,
    },
    {
      target: '#tour-action-bar',
      title: 'Quick Actions',
      description: 'Export your data as CSV, filter by date range, or share reports with your team from here.',
      placement: 'top' as const,
    },
    {
      target: '#tour-help-link',
      title: 'Need Help?',
      description: 'Access the full documentation, video tutorials, and community forum from this menu.',
      placement: 'left' as const,
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* ── Basic Onboarding Tour ─────────────────────────────────────── */}
      <DemoSection
        title="Onboarding Tour"
        description="Step-by-step guided tour for new users. TkxTour highlights target elements with a spotlight overlay and a positioned popover."
        theme={theme}
        code={`const [open, setOpen] = useState(false);

<TkxTour
  isOpen={open}
  onClose={() => setOpen(false)}
  steps={[
    {
      target: '#search-btn',
      title: 'Search Anything',
      description: 'Use the search bar to quickly find components.',
      placement: 'bottom',
    },
    {
      target: '#notifications',
      title: 'Notification Center',
      description: 'See your latest alerts and mentions.',
      placement: 'bottom',
    },
  ]}
/>

<TkxButton onClick={() => setOpen(true)}>Start Tour</TkxButton>`}
      >
        {/* Tour target elements */}
        <div style={{ padding: 24, borderRadius: 12, border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.text }}>Dashboard</h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                id="tour-search-btn"
                style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt, color: theme.text, cursor: 'pointer', fontSize: 13 }}
              >
                🔍 Search
              </button>
              <button
                id="tour-notifications"
                style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt, color: theme.text, cursor: 'pointer', fontSize: 16 }}
              >
                🔔
              </button>
              <TkxButton id="tour-new-project" size="sm" onClick={() => {}}>+ New Project</TkxButton>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
            <TkxButton onClick={() => { setCurrentStep(0); setBasicOpen(true); }}>
              🚀 Start Onboarding Tour
            </TkxButton>
          </div>
        </div>

        <TkxTour
          isOpen={basicOpen}
          onClose={() => setBasicOpen(false)}
          current={currentStep}
          onChange={setCurrentStep}
          steps={BASIC_STEPS}
        />
      </DemoSection>

      <hr style={divider} />

      {/* ── Feature Discovery Tour ────────────────────────────────────── */}
      <DemoSection
        title="Feature Discovery Tour"
        description="Point users to specific features they may not have noticed. Great for post-release announcements."
        theme={theme}
        code={`<TkxTour
  isOpen={open}
  onClose={() => setOpen(false)}
  steps={[
    { target: '#stats-card', title: 'Live Statistics', description: '...', placement: 'bottom' },
    { target: '#action-bar', title: 'Quick Actions', description: '...', placement: 'top' },
    { target: '#help-link', title: 'Need Help?', description: '...', placement: 'left' },
  ]}
/>`}
      >
        <div style={{ padding: 24, borderRadius: 12, border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
          <div id="tour-stats-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Users', value: '12,845', color: theme.primary },
              { label: 'Revenue', value: '$48.2K', color: '#10b981' },
              { label: 'Uptime', value: '99.97%', color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: '14px 16px', borderRadius: 8, border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: theme.textMuted }}>{label}</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color }}>{value}</p>
              </div>
            ))}
          </div>

          <div id="tour-action-bar" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <TkxButton size="sm" variant="outline">Export CSV</TkxButton>
            <TkxButton size="sm" variant="outline">Filter</TkxButton>
            <TkxButton size="sm" variant="outline">Share Report</TkxButton>
            <div style={{ marginLeft: 'auto' }}>
              <TkxBadge variant="primary">New Features</TkxBadge>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TkxButton onClick={() => setFeatureOpen(true)}>✨ Show New Features</TkxButton>
            <a id="tour-help-link" href="#" style={{ fontSize: 13, color: theme.primary }} onClick={(e) => e.preventDefault()}>
              Documentation & Help →
            </a>
          </div>
        </div>

        <TkxTour
          isOpen={featureOpen}
          onClose={() => setFeatureOpen(false)}
          steps={FEATURE_STEPS}
        />
      </DemoSection>

      <hr style={divider} />

      {/* ── Best Practices ───────────────────────────────────────────────── */}
      <div style={{ padding: '28px 32px', borderRadius: 12, border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: theme.text }}>🎯 Tour Best Practices</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            { icon: '3️⃣', title: 'Keep it short', desc: '3–7 steps max. Users lose attention quickly — focus on essential features only.' },
            { icon: '🎯', title: 'Target real elements', desc: 'Each step should point to an actual interactive element, not decorative content.' },
            { icon: '⏭️', title: 'Always allow skip', desc: 'Never force a tour. Let users exit at any step and restart when they need it.' },
            { icon: '🔔', title: 'Trigger contextually', desc: 'Launch tours on first login, after feature releases, or when users enable a feature.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: theme.text }}>{title}</p>
                <p style={{ margin: 0, fontSize: 12, color: theme.textMuted }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr style={divider} />

      {/* ── Props ──────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>TkxTour Props</h3>
        <PropTable props={TOUR_PROPS} />
      </div>
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>TourStep Props</h3>
        <PropTable props={TOUR_STEP_PROPS} />
      </div>
    </div>
  );
}
