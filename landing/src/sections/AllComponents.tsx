// ─────────────────────────────────────────────────────────────────────────────
// AllComponents — directory of every Tkx* component grouped by family.
//
// Click flow: visitor clicks a component name → RequestAccessDialog opens
// with that component pre-filled. Primary CTA opens a pre-filled issue on
// the public issue tracker so the team can ship the latest source to npm
// for that visitor's specific use case.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { RequestAccessDialog, type RequestTarget } from '../RequestAccessDialog';

interface ComponentGroup {
  emoji: string;
  title: string;
  desc: string;
  components: { name: string; slug: string; isNew?: boolean }[];
}

const GROUPS: ComponentGroup[] = [
  {
    emoji: '🎨',
    title: 'Primitives',
    desc: 'Single-purpose UI building blocks',
    components: [
      { name: 'Alert', slug: 'alert' },
      { name: 'Avatar', slug: 'avatar' },
      { name: 'Badge', slug: 'badge' },
      { name: 'Breadcrumb', slug: 'breadcrumb' },
      { name: 'Button', slug: 'button' },
      { name: 'Card', slug: 'card' },
      { name: 'Divider', slug: 'divider' },
      { name: 'Empty', slug: 'empty' },
      { name: 'Icon', slug: 'icon' },
      { name: 'Image', slug: 'image' },
      { name: 'Logo', slug: 'logo' },
      { name: 'Pagination', slug: 'pagination' },
      { name: 'Progress', slug: 'progress' },
      { name: 'Result', slug: 'result' },
      { name: 'Skeleton', slug: 'skeleton' },
      { name: 'Spin', slug: 'spin' },
      { name: 'Tag', slug: 'tag' },
      { name: 'Tooltip', slug: 'tooltip' },
      { name: 'Typography', slug: 'typography' },
    ],
  },
  {
    emoji: '✨',
    title: 'Holographic (v3.1 → v3.12)',
    desc: '3D-tilt + iridescent foil. The full HUD-building toolkit.',
    components: [
      { name: 'HolographicSurface',  slug: 'holographic-surface' },
      { name: 'HolographicCard',     slug: 'holographic-card' },
      { name: 'HolographicAvatar',   slug: 'holographic-avatar' },
      { name: 'HolographicBadge',    slug: 'holographic-badge' },
      { name: 'HolographicButton',   slug: 'holographic-button' },
      { name: 'HolographicPanel',    slug: 'holographic-panel',    isNew: true },
      { name: 'HolographicGauge',    slug: 'holographic-gauge',    isNew: true },
      { name: 'HolographicProgress', slug: 'holographic-progress', isNew: true },
      { name: 'HolographicTerminal', slug: 'holographic-terminal', isNew: true },
    ],
  },
  {
    emoji: '🌐',
    title: '3D / 360° / AR-VR (tekivex-3d)',
    desc: 'Real WebGL primitives for spatial UI. Vanilla three.js, no reconciler.',
    components: [
      { name: 'Scene',          slug: 'scene' },
      { name: 'Card3D',         slug: 'card-3d' },
      { name: 'Panorama360',    slug: 'panorama-360' },
      { name: 'Hotspot',        slug: 'hotspot' },
      { name: 'XRSession',      slug: 'xr-session' },
      { name: 'Model3D',        slug: 'model-3d' },
      { name: 'Logo3D',         slug: 'logo-3d' },
      { name: 'ParticleField',  slug: 'particle-field' },
      { name: 'OrbitControls',  slug: 'orbit-controls' },
      { name: 'Starfield',      slug: 'starfield',     isNew: true },
      { name: 'Planet',         slug: 'planet',        isNew: true },
      { name: 'OrbitPath',      slug: 'orbit-path',    isNew: true },
    ],
  },
  {
    emoji: '🛠️',
    title: 'Productivity (v3.6 → v3.13)',
    desc: 'Spreadsheets, mind maps, gantts, kanbans, palettes — the heavy hitters.',
    components: [
      { name: 'Kanban',          slug: 'kanban',          isNew: true },
      { name: 'RichEditor',      slug: 'rich-editor',     isNew: true },
      { name: 'CalendarHeatmap', slug: 'calendar-heatmap',isNew: true },
      { name: 'FormBuilder',     slug: 'form-builder',    isNew: true },
      { name: 'MindMap',         slug: 'mind-map',        isNew: true },
      { name: 'Gantt',           slug: 'gantt',           isNew: true },
      { name: 'Spreadsheet',     slug: 'spreadsheet',     isNew: true },
      { name: 'PivotTable',      slug: 'pivot-table',     isNew: true },
      { name: 'DataExplorer',    slug: 'data-explorer',   isNew: true },
      { name: 'CommandPalette',  slug: 'command-palette', isNew: true },
      { name: 'ThemeStudio',     slug: 'theme-studio',    isNew: true },
      { name: 'AccessibilityChecker', slug: 'accessibility-checker', isNew: true },
    ],
  },
  {
    emoji: '📝',
    title: 'Form inputs',
    desc: 'Validated, accessible, sanitised',
    components: [
      { name: 'Autocomplete', slug: 'autocomplete' },
      { name: 'Checkbox', slug: 'checkbox' },
      { name: 'ColorPicker', slug: 'color-picker' },
      { name: 'CurrencyInput', slug: 'currency-input' },
      { name: 'DatePicker', slug: 'date-picker' },
      { name: 'FileUpload', slug: 'file-upload' },
      { name: 'Form', slug: 'form' },
      { name: 'Input', slug: 'input' },
      { name: 'NumberInput', slug: 'number-input' },
      { name: 'OTP', slug: 'otp' },
      { name: 'PhoneInput', slug: 'phone-input' },
      { name: 'Radio', slug: 'radio' },
      { name: 'Rating', slug: 'rating' },
      { name: 'Segmented', slug: 'segmented' },
      { name: 'Select', slug: 'select' },
      { name: 'Slider', slug: 'slider' },
      { name: 'Toggle', slug: 'toggle' },
    ],
  },
  {
    emoji: '🇮🇳',
    title: 'KYC + identity',
    desc: 'Indian + international ID inputs',
    components: [
      { name: 'AadhaarInput', slug: 'aadhaar-input' },
      { name: 'AddressInput', slug: 'address-input' },
      { name: 'KycInputs (PAN/VoterID/DL)', slug: 'kyc-inputs' },
    ],
  },
  {
    emoji: '🧭',
    title: 'Layout + navigation',
    desc: 'App shell + nav primitives',
    components: [
      { name: 'Affix', slug: 'affix' },
      { name: 'Anchor', slug: 'anchor' },
      { name: 'AppBar', slug: 'app-bar' },
      { name: 'BottomNav', slug: 'bottom-nav' },
      { name: 'ConfigProvider', slug: 'config-provider' },
      { name: 'Drawer', slug: 'drawer' },
      { name: 'Layout', slug: 'layout' },
      { name: 'Masonry', slug: 'masonry' },
      { name: 'Menu', slug: 'menu' },
      { name: 'SpeedDial', slug: 'speed-dial' },
      { name: 'Tabs', slug: 'tabs' },
      { name: 'Toolbar', slug: 'toolbar' },
      { name: 'Tour', slug: 'tour' },
    ],
  },
  {
    emoji: '📊',
    title: 'Display + content',
    desc: 'Read-mostly content',
    components: [
      { name: 'Accordion', slug: 'accordion' },
      { name: 'Carousel', slug: 'carousel' },
      { name: 'Clock', slug: 'clock' },
      { name: 'Markdown', slug: 'markdown' },
      { name: 'OrgChart', slug: 'org-chart' },
      { name: 'RichTextDisplay', slug: 'rich-text-display' },
      { name: 'Statistic', slug: 'statistic' },
      { name: 'Stepper', slug: 'stepper' },
      { name: 'Table', slug: 'table' },
      { name: 'Timeline', slug: 'timeline' },
      { name: 'Watermark', slug: 'watermark' },
    ],
  },
  {
    emoji: '💬',
    title: 'Overlays + feedback',
    desc: 'Modals, popovers, toasts',
    components: [
      { name: 'Modal', slug: 'modal' },
      { name: 'Popover', slug: 'popover' },
      { name: 'Snackbar', slug: 'snackbar' },
      { name: 'Toast', slug: 'toast' },
    ],
  },
  {
    emoji: '🗂️',
    title: 'Data widgets',
    desc: 'Selection, transfer, hierarchy',
    components: [
      { name: 'Cascader', slug: 'cascader' },
      { name: 'DataGrid', slug: 'data-grid' },
      { name: 'List', slug: 'list' },
      { name: 'Mentions', slug: 'mentions' },
      { name: 'Sortable', slug: 'sortable' },
      { name: 'TransferList', slug: 'transfer-list' },
      { name: 'TreeView', slug: 'tree-view' },
    ],
  },
  {
    emoji: '⚡',
    title: 'Real-time',
    desc: 'Timer-driven streaming widgets',
    components: [
      { name: 'LiveFeed', slug: 'live-feed' },
      { name: 'LiveLog', slug: 'live-log' },
      { name: 'LiveMetrics', slug: 'live-metrics' },
      { name: 'RealTimeChart', slug: 'real-time-chart' },
    ],
  },
  {
    emoji: '🤖',
    title: 'AI-native',
    desc: 'Built for LLM-powered UIs',
    components: [
      { name: 'AIChatBubble', slug: 'aichat-bubble' },
      { name: 'AIConfidenceBar', slug: 'aiconfidence-bar' },
      { name: 'AIThinking', slug: 'aithinking' },
      { name: 'Chat', slug: 'chat' },
    ],
  },
  {
    emoji: '📈',
    title: 'Charts',
    desc: 'recharts-powered, free',
    components: [
      { name: 'AreaChart', slug: 'area-chart' },
      { name: 'BarChart', slug: 'bar-chart' },
      { name: 'LineChart', slug: 'line-chart' },
      { name: 'PieChart', slug: 'pie-chart' },
    ],
  },
  {
    emoji: '🎬',
    title: 'Media + creative',
    desc: 'Cameras, signatures, QR',
    components: [
      { name: 'Confetti', slug: 'confetti' },
      { name: 'ImageEditor', slug: 'image-editor' },
      { name: 'QRCode', slug: 'qrcode' },
      { name: 'SignaturePad', slug: 'signature-pad' },
      { name: 'VideoPlayer', slug: 'video-player' },
    ],
  },
  {
    emoji: '💳',
    title: 'Commerce + fintech',
    desc: 'Payments, checkout, subs',
    components: [
      { name: 'Checkout', slug: 'checkout' },
      { name: 'PaymentButton', slug: 'payment-button' },
      { name: 'Subscription', slug: 'subscription' },
    ],
  },
  {
    emoji: '🛠️',
    title: 'Utility / infra',
    desc: 'Bot defense, fonts, SEO',
    components: [
      { name: 'Captcha', slug: 'captcha' },
      { name: 'Command (Cmd-K)', slug: 'command' },
      { name: 'FontProvider', slug: 'font-provider' },
      { name: 'Playground', slug: 'playground' },
      { name: 'SEO', slug: 'seo' },
      { name: 'ThemeBuilder', slug: 'theme-builder' },
    ],
  },
  {
    emoji: '🌐',
    title: '3D + 360° + AR/VR (tekivex-3d)',
    desc: 'WebGL primitives — separate package',
    components: [
      { name: 'Scene', slug: 'scene', isNew: true },
      { name: 'Card3D', slug: 'card-3d', isNew: true },
      { name: 'Panorama360', slug: 'panorama-360', isNew: true },
      { name: 'Hotspot', slug: 'hotspot', isNew: true },
      { name: 'XRSession', slug: 'xr-session', isNew: true },
    ],
  },
];

const TOTAL = GROUPS.reduce((n, g) => n + g.components.length, 0);

// Map group title hint → package name (used to pre-fill the request issue)
function pkgForGroup(title: string): string {
  if (/3D \/ 360°|tekivex-3d/i.test(title)) return 'tekivex-3d';
  return 'tekivex-ui';
}

export function AllComponents() {
  const [requested, setRequested] = useState<RequestTarget | null>(null);
  return (
    <section
      id="components"
      style={{ padding: '88px 24px 48px', maxWidth: 1280, margin: '0 auto' }}
    >
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '0 0 12px',
          }}
        >
          Browse all <span className="tk-gradient-text">{TOTAL}</span> components
        </h2>
        <p style={{ color: '#b8b8d4', maxWidth: 660, margin: '0 auto', fontSize: 16, lineHeight: 1.65 }}>
          Click any component below to request access — we publish the latest
          source to npm on demand and email setup instructions back. Browse the
          full live catalog at{' '}
          <a href="/playground/" style={{ color: '#00f5d4', fontWeight: 600 }}>
            /playground/
          </a>{' '}
          or storybook-style controls at{' '}
          <a href="/book/" style={{ color: '#00f5d4', fontWeight: 600 }}>
            /book/
          </a>
          .
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {GROUPS.map((g) => (
          <div
            key={g.title}
            style={{
              padding: 22,
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(18,18,26,0.55)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <header
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 22 }} aria-hidden="true">
                {g.emoji}
              </span>
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '-0.01em',
                }}
              >
                {g.title}
              </h3>
              <span
                style={{
                  marginLeft: 'auto',
                  color: '#666',
                  fontSize: 12,
                  fontFamily: 'monospace',
                }}
              >
                {g.components.length}
              </span>
            </header>
            <p style={{ color: '#888', fontSize: 12, margin: '0 0 14px' }}>{g.desc}</p>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              {g.components.map((c) => (
                <li key={c.slug}>
                  <button
                    type="button"
                    onClick={() =>
                      setRequested({
                        name: c.name.startsWith('Tkx') ? c.name : `Tkx${c.name}`,
                        slug: c.slug,
                        pkg: pkgForGroup(g.title),
                      })
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#dcdce8',
                      fontSize: 12,
                      fontWeight: 500,
                      transition: 'all 0.15s',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#00f5d4';
                      e.currentTarget.style.borderColor = 'rgba(0, 245, 212, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#dcdce8';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    }}
                  >
                    {c.name}
                    {c.isNew && (
                      <span
                        style={{
                          fontSize: 9,
                          color: '#00f5d4',
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: 40,
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <a
          href="/playground/"
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #00f5d4, #3a86ff)',
            color: '#0a0a0f',
            fontWeight: 700,
            borderRadius: 999,
            fontSize: 14,
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          🎮 Open the playground →
        </a>
        <a
          href="/book/"
          style={{
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 999,
            fontSize: 14,
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          📖 Open the catalog →
        </a>
      </div>

      <RequestAccessDialog target={requested} onClose={() => setRequested(null)} />
    </section>
  );
}
