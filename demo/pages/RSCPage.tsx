import type { ThemeTokens } from '@tekivex/ui';

interface Props { theme: ThemeTokens }

const RSC_SAFE = [
  'TkxBadge', 'TkxButton', 'TkxCard', 'TkxDivider',
  'TkxEmpty', 'TkxIcon', 'TkxInput', 'TkxList',
  'TkxProgress', 'TkxResult', 'TkxSkeleton', 'TkxStepper', 'TkxToggle',
];

const CLIENT_ONLY = [
  'TkxAccordion', 'TkxAffix', 'TkxAlert', 'TkxAnchor', 'TkxAppBar',
  'TkxAutocomplete', 'TkxAvatar', 'TkxBottomNav', 'TkxBreadcrumb',
  'TkxCarousel', 'TkxCascader', 'TkxChat', 'TkxCheckbox',
  'TkxClock', 'TkxColorPicker', 'TkxCommand', 'TkxConfigProvider',
  'TkxDataGrid', 'TkxDatePicker', 'TkxDrawer', 'TkxDropdown',
  'TkxFileUpload', 'TkxForm', 'TkxImage', 'TkxLayout',
  'TkxLiveFeed', 'TkxLiveLog', 'TkxLiveMetrics',
  'TkxMasonry', 'TkxMentions', 'TkxMenu', 'TkxModal',
  'TkxNumberInput', 'TkxOTP', 'TkxPagination', 'TkxPlayground',
  'TkxPopover', 'TkxQRCode', 'TkxQuantumForm', 'TkxRadio',
  'TkxRating', 'TkxRealTimeChart', 'TkxRichTextDisplay',
  'TkxSegmented', 'TkxSelect', 'TkxSlider', 'TkxSnackbar',
  'TkxSpeedDial', 'TkxSpin', 'TkxStatistic', 'TkxTable',
  'TkxTabs', 'TkxTag', 'TkxThemeBuilder', 'TkxTimeline',
  'TkxToast', 'TkxToolbar', 'TkxTooltip', 'TkxTour',
  'TkxTransferList', 'TkxTreeView', 'TkxTypography',
  'TkxVideoPlayer', 'TkxWatermark',
  'TkxAIConfidenceBar', 'TkxAIChatBubble', 'TkxAIThinking',
];

const CODE_NEXTJS = `// app/layout.tsx — Server Component ✅
import { TkxBadge, TkxCard, TkxButton } from 'tekivex-ui';

export default function Layout({ children }) {
  return (
    <div>
      <TkxBadge count={3}>          {/* ✅ RSC-safe */}
        <TkxButton>Notifications</TkxButton>
      </TkxBadge>
      {children}
    </div>
  );
}`;

const CODE_CLIENT = `// app/components/SearchBar.tsx
'use client';  // ← required for interactive components

import { TkxAutocomplete, TkxModal, TkxSelect } from 'tekivex-ui';

export function SearchBar() {
  return <TkxAutocomplete options={[...]} placeholder="Search…" />;
}`;

const CODE_THEME = `// app/providers.tsx
'use client';  // ThemeProvider uses context (requires client)

import { ThemeProvider, quantumDark } from 'tekivex-ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

// app/layout.tsx (Server Component)
import { Providers } from './providers';
export default function RootLayout({ children }) {
  return (
    <html>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}`;

export function RSCPage({ theme }: Props) {
  const s = {
    page: { maxWidth: 900, margin: '0 auto', padding: '40px 32px' },
    h1: { fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em', color: theme.text },
    h2: { fontSize: '1.3rem', fontWeight: 800, margin: '0 0 12px', color: theme.text },
    p: { fontSize: 15, color: theme.textMuted, lineHeight: 1.75, margin: '0 0 24px' },
    pre: {
      margin: 0, padding: '20px 24px', fontFamily: 'monospace', fontSize: 13,
      lineHeight: 1.7, color: theme.text, overflowX: 'auto' as const,
      background: `${theme.surface}cc`, borderRadius: 12,
      border: `1px solid ${theme.border}`,
    },
    badge: (ok: boolean) => ({
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: ok ? '#10b98120' : `${theme.primary}18`,
      color: ok ? '#10b981' : theme.primary,
      border: `1px solid ${ok ? '#10b98144' : theme.primary + '44'}`,
    }),
    chip: { padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${theme.border}`, background: `${theme.surface}cc`, color: theme.text },
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          display: 'inline-block', padding: '4px 14px', borderRadius: 999,
          background: `${theme.primary}18`, border: `1px solid ${theme.primary}33`,
          color: theme.primary, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.06em', marginBottom: 16,
        }}>
          ⚡ RSC COMPATIBILITY — FULLY AUDITED
        </div>
        <h1 style={s.h1}>React Server Components</h1>
        <p style={s.p}>
          TekiVex UI is audited for RSC compatibility. 13 components render entirely on the server —
          no JavaScript bundle, instant HTML. The remaining 65 components require <code style={{ background: `${theme.primary}18`, padding: '1px 6px', borderRadius: 4, fontSize: 13, color: theme.primary }}>"use client"</code> because
          they use state, effects, or browser APIs. ThemeProvider uses React context so it also needs a client boundary.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
          <div style={{ padding: '16px 24px', borderRadius: 12, background: '#10b98114', border: '1px solid #10b98133', textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981' }}>13</div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>RSC-safe components</div>
          </div>
          <div style={{ padding: '16px 24px', borderRadius: 12, background: `${theme.primary}12`, border: `1px solid ${theme.primary}33`, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: theme.primary }}>65</div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>Require "use client"</div>
          </div>
          <div style={{ padding: '16px 24px', borderRadius: 12, background: `${theme.surface}cc`, border: `1px solid ${theme.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: theme.text }}>78</div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>Total components</div>
          </div>
        </div>
      </div>

      {/* RSC-safe list */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={s.badge(true)}>✅ RSC-safe</span>
          <h2 style={{ ...s.h2, margin: 0 }}>Render in Server Components</h2>
        </div>
        <p style={{ ...s.p, marginBottom: 16 }}>
          These components have no hooks, no browser APIs, and no event listeners. They render to static HTML on the server — zero client JavaScript.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {RSC_SAFE.map(name => (
            <span key={name} style={s.chip}>{name}</span>
          ))}
        </div>
      </div>

      {/* Client-only list */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={s.badge(false)}>🖥 "use client"</span>
          <h2 style={{ ...s.h2, margin: 0 }}>Require a client boundary</h2>
        </div>
        <p style={{ ...s.p, marginBottom: 16 }}>
          These components use React hooks (useState, useEffect, useRef) or browser APIs (window, document, IntersectionObserver). They must be inside a <code style={{ background: `${theme.primary}18`, padding: '1px 6px', borderRadius: 4, fontSize: 13, color: theme.primary }}>"use client"</code> boundary.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {CLIENT_ONLY.map(name => (
            <span key={name} style={{ ...s.chip, color: theme.textMuted }}>{name}</span>
          ))}
        </div>
      </div>

      {/* Usage patterns */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={s.h2}>Next.js App Router pattern</h2>
        <p style={s.p}>Use RSC-safe components directly in Server Components. Wrap interactive components in a <code style={{ background: `${theme.primary}18`, padding: '1px 6px', borderRadius: 4, fontSize: 13, color: theme.primary }}>"use client"</code> file.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: '✅ Server Component (no "use client" needed)', code: CODE_NEXTJS },
            { label: '🖥 Client Component wrapper', code: CODE_CLIENT },
            { label: '🖥 ThemeProvider in a client boundary', code: CODE_THEME },
          ].map(({ label, code }) => (
            <div key={label}>
              <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>{label}</div>
              <pre style={s.pre}>{code}</pre>
            </div>
          ))}
        </div>
      </div>

      {/* Note on ThemeProvider */}
      <div style={{ padding: '20px 24px', borderRadius: 12, background: `${theme.primary}10`, border: `1px solid ${theme.primary}33`, marginBottom: 40 }}>
        <p style={{ margin: 0, fontSize: 14, color: theme.text, lineHeight: 1.7 }}>
          <strong style={{ color: theme.primary }}>Note on ThemeProvider:</strong> ThemeProvider uses React Context under the hood, which requires a client boundary.
          Wrap it in a <code style={{ background: `${theme.primary}18`, padding: '1px 5px', borderRadius: 4, color: theme.primary }}>providers.tsx</code> client component
          at the root of your app (see example above). This is the standard Next.js App Router pattern used by MUI, shadcn/ui, and others.
        </p>
      </div>

      {/* llms.txt callout */}
      <div style={{ padding: '20px 24px', borderRadius: 12, background: `${theme.surface}cc`, border: `1px solid ${theme.border}` }}>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: theme.primary }}>🤖 AI coding tools</p>
        <p style={{ margin: 0, fontSize: 13, color: theme.textMuted, lineHeight: 1.7 }}>
          TekiVex UI ships a <code style={{ color: theme.text }}>llms.txt</code> manifest at{' '}
          <a href="/llms.txt" target="_blank" rel="noreferrer" style={{ color: theme.primary }}>ui.tekivex.com/llms.txt</a>{' '}
          listing all 78 components with props, usage examples, and RSC status. Cursor, Copilot, and Claude Code
          use this to generate correct TekiVex code automatically.
        </p>
      </div>
    </div>
  );
}
