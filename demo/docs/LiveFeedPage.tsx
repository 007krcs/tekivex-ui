import { useState, useEffect, useRef } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxLiveFeed } from '../../src/realtime';
import type { FeedItem } from '../../src/realtime';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const LIVE_FEED_PROPS = [
  { name: 'items', type: 'FeedItem[]', default: '—', description: 'Array of feed items to display. Each item has id, content, timestamp, and optional type/avatar/author/meta.' },
  { name: 'maxItems', type: 'number', default: '100', description: 'Maximum number of items to render. Older items are trimmed from the bottom.' },
  { name: 'height', type: 'number | string', default: '400', description: 'Height of the feed container. Accepts pixel numbers or CSS strings like "50vh".' },
  { name: 'autoScroll', type: 'boolean', default: 'false', description: 'Automatically scrolls to the top when new items are prepended.' },
  { name: 'showTimestamps', type: 'boolean', default: 'false', description: 'Displays a formatted timestamp next to each feed item.' },
  { name: 'onItemClick', type: '(item: FeedItem) => void', default: 'undefined', description: 'Callback invoked when the user clicks a feed item. Makes items focusable and keyboard-navigable.' },
  { name: 'emptyMessage', type: 'string', default: "'No items'", description: 'Message shown when the items array is empty.' },
  { name: 'pauseOnHover', type: 'boolean', default: 'false', description: 'Pauses auto-scroll while the user hovers over the feed.' },
  { name: 'renderItem', type: '(item: FeedItem) => ReactNode', default: 'undefined', description: 'Custom render function for each item. When provided, overrides the default item layout completely.' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

let _idCounter = 1000;
function nextId() { return String(++_idCounter); }

type FeedType = 'success' | 'error' | 'info' | 'warning' | 'default';
const TYPE_CYCLE: FeedType[] = ['success', 'error', 'info', 'warning', 'default'];

const ACTIVITY_MESSAGES = [
  'User johndoe logged in from 192.168.1.45',
  'Payment processed: $127.50 for order #8821',
  'API endpoint /v2/users responded in 234ms',
  'Cache miss for key: user:profile:9981',
  'New signup: alice@example.com (plan: Pro)',
  'Webhook delivered to https://hooks.example.com/events',
  'Background job queue-worker-3 completed in 1.2s',
  'Database query took 87ms — table: transactions',
  'Rate limit exceeded for IP 203.0.113.7',
  'File upload successful: report-q4-2025.pdf (2.3 MB)',
  'Password reset requested by user #4421',
  'Session expired for user bob@example.com',
  'Order #9204 shipped — tracking: TRK-XZ882910',
  'Feature flag dark_mode enabled for 15% of users',
  'Scheduled report sent to 12 recipients',
];

function randomMessage() {
  return ACTIVITY_MESSAGES[Math.floor(Math.random() * ACTIVITY_MESSAGES.length)];
}

function makeItem(index: number): FeedItem {
  return {
    id: nextId(),
    content: randomMessage(),
    timestamp: Date.now(),
    type: TYPE_CYCLE[index % TYPE_CYCLE.length],
  };
}

const SYSTEM_EVENTS: FeedItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  content: ACTIVITY_MESSAGES[i % ACTIVITY_MESSAGES.length],
  timestamp: Date.now() - (20 - i) * 30_000,
  type: TYPE_CYCLE[i % TYPE_CYCLE.length],
  author: ['sys-monitor', 'api-gateway', 'auth-service', 'job-runner'][i % 4],
  meta: `node-${(i % 3) + 1}`,
}));

const CUSTOM_ITEMS: FeedItem[] = [
  { id: 'c1', content: 'Deployment pipeline started for branch main', timestamp: Date.now() - 5000, type: 'info', author: 'CI/CD', meta: 'v2.5.3' },
  { id: 'c2', content: 'All 142 tests passed successfully', timestamp: Date.now() - 3000, type: 'success', author: 'Test Runner', meta: '142/142' },
  { id: 'c3', content: 'Docker image built: tekivex-ui:2.5.3', timestamp: Date.now() - 1000, type: 'success', author: 'Docker', meta: '1.2 GB' },
  { id: 'c4', content: 'Memory usage spike detected on node-2', timestamp: Date.now(), type: 'warning', author: 'Monitor', meta: '87% RAM' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function LiveFeedPage({ theme }: { theme: ThemeTokens }) {
  // Demo 1: Activity feed with live items
  const [activityItems, setActivityItems] = useState<FeedItem[]>(() =>
    Array.from({ length: 5 }, (_, i) => makeItem(i)),
  );
  const activityIndexRef = useRef(5);

  useEffect(() => {
    const interval = setInterval(() => {
      const item = makeItem(activityIndexRef.current++);
      setActivityItems((prev) => [item, ...prev].slice(0, 50));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Demo 2: System events — click tracking
  const [lastClicked, setLastClicked] = useState<string | null>(null);

  // Demo 3: Custom render items (static)
  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  const badgeStyle = (color: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 600 as const,
    backgroundColor: `${color}20`,
    color: color,
    border: `1px solid ${color}40`,
  });

  const typeColors: Record<string, string> = {
    info: theme.info ?? '#3b82f6',
    success: theme.success,
    warning: theme.warning,
    error: theme.danger,
    default: theme.textMuted,
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>
      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxLiveFeed
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 48px' }}>
        A virtualized real-time activity feed component that streams new items with slide-in animations.
        Supports auto-scroll, timestamps, item click handlers, and a fully custom render function.
      </p>

      {/* ── 1. Activity Feed ── */}
      <DemoSection
        title="Activity Feed — Live Updates"
        description="New items are prepended every 2 seconds via setInterval. autoScroll=true keeps the feed pinned to the newest item. Items cycle through success/error/info/warning/default types."
        theme={theme}
        code={`const [items, setItems] = useState<FeedItem[]>(initialItems);

useEffect(() => {
  const interval = setInterval(() => {
    const newItem: FeedItem = {
      id: String(Date.now()),
      content: 'User johndoe logged in from 192.168.1.45',
      timestamp: Date.now(),
      type: 'success',
    };
    setItems(prev => [newItem, ...prev].slice(0, 50));
  }, 2000);
  return () => clearInterval(interval);
}, []);

<TkxLiveFeed
  items={items}
  height={360}
  autoScroll={true}
  maxItems={50}
/>`}
      >
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: theme.success }}>● LIVE</span>
            <span style={{ fontSize: '12px', color: theme.textMuted }}>New item every 2s — {activityItems.length} total</span>
          </div>
          <TkxLiveFeed
            items={activityItems}
            height={360}
            autoScroll={true}
            maxItems={50}
          />
        </div>
      </DemoSection>

      {/* ── 2. System Events Feed ── */}
      <DemoSection
        title="System Events Feed — Timestamps & Click Handler"
        description="Pre-populated with 20 items. showTimestamps=true renders relative timestamps. Click any item to see the onItemClick callback in action."
        theme={theme}
        code={`const [lastClicked, setLastClicked] = useState<string | null>(null);

<TkxLiveFeed
  items={systemEvents}
  height={400}
  showTimestamps={true}
  onItemClick={(item) => setLastClicked(item.content)}
/>`}
      >
        <div style={{ width: '100%' }}>
          {lastClicked && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: `${theme.primary}12`,
              border: `1px solid ${theme.primary}30`,
              fontSize: '12px',
              color: theme.primary,
              marginBottom: '8px',
              wordBreak: 'break-all' as const,
            }}>
              Clicked: {lastClicked}
            </div>
          )}
          <TkxLiveFeed
            items={SYSTEM_EVENTS}
            height={400}
            showTimestamps={true}
            onItemClick={(item) => setLastClicked(item.content)}
          />
        </div>
      </DemoSection>

      {/* ── 3. Custom Render ── */}
      <DemoSection
        title="Custom Render — renderItem Prop"
        description="Pass a renderItem function to completely replace the default item layout. This example renders a CI/CD pipeline card with author, meta badge, and colored type indicator."
        theme={theme}
        code={`<TkxLiveFeed
  items={items}
  height={320}
  renderItem={(item) => (
    <div style={{
      padding: '10px 14px',
      borderRadius: '8px',
      border: \`1px solid \${theme.border}\`,
      backgroundColor: theme.surfaceAlt,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: theme.text }}>{item.author}</span>
        <span style={{ fontSize: '11px', color: theme.textMuted }}>{item.meta}</span>
      </div>
      <span style={{ fontSize: '13.5px', color: theme.text }}>{item.content}</span>
    </div>
  )}
/>`}
      >
        <div style={{ width: '100%' }}>
          <TkxLiveFeed
            items={CUSTOM_ITEMS}
            height={320}
            renderItem={(item) => (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.surfaceAlt,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                width: '100%',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: theme.text }}>{item.author}</span>
                  <span style={badgeStyle(typeColors[item.type ?? 'default'])}>{item.meta}</span>
                </div>
                <span style={{ fontSize: '13.5px', color: theme.text }}>{item.content}</span>
                <span style={{ fontSize: '11px', color: theme.textMuted }}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <PropTable props={LIVE_FEED_PROPS} />
    </div>
  );
}
