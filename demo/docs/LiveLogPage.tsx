import { useState, useEffect, useRef } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxLiveLog } from '@tekivex/ui';
import type { LogEntry, LogLevel } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const LIVE_LOG_PROPS = [
  { name: 'entries', type: 'LogEntry[]', default: '—', description: 'Array of log entries. Each entry has id, timestamp, level, message, and optional source and metadata.' },
  { name: 'maxEntries', type: 'number', default: '500', description: 'Maximum entries to render. Older entries are trimmed.' },
  { name: 'height', type: 'number | string', default: '400', description: 'Height of the log container.' },
  { name: 'autoScroll', type: 'boolean', default: 'true', description: 'Keeps the viewport scrolled to the latest entry.' },
  { name: 'showLevel', type: 'boolean', default: 'true', description: 'Displays the log level pill (DEBUG/INFO/WARN/ERROR/FATAL).' },
  { name: 'showTimestamp', type: 'boolean', default: 'true', description: 'Displays the entry timestamp.' },
  { name: 'showSource', type: 'boolean', default: 'false', description: 'Displays the source field next to the timestamp.' },
  { name: 'filterLevel', type: "'debug' | 'info' | 'warn' | 'error' | 'fatal'", default: 'undefined', description: "Hides entries below this severity. 'warn' shows warn, error, and fatal only." },
  { name: 'searchQuery', type: 'string', default: 'undefined', description: 'Highlights matching text in entry messages. Case-insensitive substring match.' },
  { name: 'monospace', type: 'boolean', default: 'true', description: 'Renders entries in a monospace font for log-style alignment.' },
  { name: 'onEntryClick', type: '(entry: LogEntry) => void', default: 'undefined', description: 'Callback when a log entry is clicked.' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

let _logId = 0;
function nextLogId() { return String(++_logId); }

const LOG_SOURCES = ['api-gateway', 'auth-service', 'db-pool', 'cache', 'job-runner', 'metrics'];

const LOG_MESSAGES: Record<LogLevel, string[]> = {
  debug: [
    'Entering handler processUserRequest() with args: { userId: 4421, action: "view" }',
    'Cache lookup: user:profile:9981 — TTL remaining: 287s',
    'SQL query prepared: SELECT * FROM orders WHERE user_id=$1 LIMIT 20',
    'Connection pool stats: active=12, idle=3, waiting=0',
    'Feature flag evaluation: dark_mode=true for user 4421',
  ],
  info: [
    'User johndoe logged in from 192.168.1.45',
    'Payment processed: $127.50 for order #8821',
    'API endpoint /v2/users responded in 234ms',
    'New signup: alice@example.com (plan: Pro)',
    'Webhook delivered to https://hooks.example.com/events',
    'Background job queue-worker-3 completed in 1.2s',
    'File upload successful: report-q4-2025.pdf (2.3 MB)',
    'Scheduled report sent to 12 recipients',
  ],
  warn: [
    'API endpoint /v2/export responded in 1840ms — threshold: 1000ms',
    'Cache miss rate elevated: 34% over last 5 minutes',
    'Connection pool near limit: active=47, max=50',
    'Memory usage at 78% — consider scaling',
    'Rate limit approaching for IP 203.0.113.7: 450/500 requests',
    'Retry attempt 2/3 for webhook delivery to https://hooks.example.com',
  ],
  error: [
    'Failed to process payment for order #8831 — gateway timeout',
    'Database query failed: deadlock detected on table transactions',
    'Unhandled exception in /api/v2/checkout: TypeError: Cannot read property "id"',
    'Email delivery failed for user bob@example.com — SMTP error 550',
  ],
  fatal: [
    'Out of memory — process terminated on node-2',
    'Database primary connection lost — failing over to replica',
    'Critical security alert: brute force detected from 192.0.2.100',
  ],
};

const LEVEL_WEIGHTS: Array<[LogLevel, number]> = [
  ['debug', 3],
  ['info', 10],
  ['warn', 4],
  ['error', 2],
  ['fatal', 1],
];

const WEIGHTED_LEVELS: LogLevel[] = LEVEL_WEIGHTS.flatMap(([l, w]) =>
  Array.from<LogLevel>({ length: w }).fill(l),
);

function randomLevel(): LogLevel {
  return WEIGHTED_LEVELS[Math.floor(Math.random() * WEIGHTED_LEVELS.length)];
}

function randomEntry(): LogEntry {
  const level = randomLevel();
  const messages = LOG_MESSAGES[level];
  return {
    id: nextLogId(),
    timestamp: Date.now(),
    level,
    message: messages[Math.floor(Math.random() * messages.length)],
    source: LOG_SOURCES[Math.floor(Math.random() * LOG_SOURCES.length)],
  };
}

// Seed initial entries
const INITIAL_ENTRIES: LogEntry[] = Array.from({ length: 30 }, () => {
  const e = randomEntry();
  return { ...e, timestamp: Date.now() - Math.random() * 30_000 };
});

// ── Page ──────────────────────────────────────────────────────────────────────

export function LiveLogPage({ theme }: { theme: ThemeTokens }) {
  // Demo 1: Streaming logs
  const [streamEntries, setStreamEntries] = useState<LogEntry[]>(() => [...INITIAL_ENTRIES]);
  const streamIndexRef = useRef(INITIAL_ENTRIES.length);

  useEffect(() => {
    const interval = setInterval(() => {
      streamIndexRef.current++;
      const entry = randomEntry();
      setStreamEntries((prev) => [...prev, entry].slice(-200));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Demo 2: Filtered logs — same data, user-selectable level
  const LEVEL_OPTIONS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
  const [filterLevel, setFilterLevel] = useState<LogLevel>('warn');

  // Demo 3: Searchable logs
  const [searchQuery, setSearchQuery] = useState('');

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  const LEVEL_COLORS: Record<LogLevel, string> = {
    debug: theme.textMuted,
    info: theme.info ?? '#3b82f6',
    warn: theme.warning,
    error: theme.danger,
    fatal: '#7c3aed',
  };

  const levelBtnStyle = (level: LogLevel, active: boolean) => ({
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600 as const,
    cursor: 'pointer' as const,
    border: `1px solid ${active ? LEVEL_COLORS[level] : theme.border}`,
    backgroundColor: active ? `${LEVEL_COLORS[level]}20` : 'transparent',
    color: active ? LEVEL_COLORS[level] : theme.textMuted,
    transition: 'all 0.15s',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>
      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxLiveLog
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 48px' }}>
        A virtual-scrolled live log viewer supporting debug/info/warn/error/fatal levels, level filtering,
        full-text search highlighting, timestamps, source labels, and auto-scroll to latest.
      </p>

      {/* ── 1. Streaming Logs ── */}
      <DemoSection
        title="Streaming Logs — autoScroll"
        description="A new log entry is appended every 800ms with a mix of debug/info/warn/error/fatal levels. autoScroll=true keeps the view pinned to the latest entry. monospace=true uses a code font."
        theme={theme}
        code={`const [entries, setEntries] = useState<LogEntry[]>(initialEntries);

useEffect(() => {
  const interval = setInterval(() => {
    setEntries(prev => [...prev, randomEntry()].slice(-200));
  }, 800);
  return () => clearInterval(interval);
}, []);

<TkxLiveLog
  entries={entries}
  height={400}
  autoScroll={true}
  showTimestamp={true}
  showSource={true}
  monospace={true}
/>`}
      >
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: theme.success }}>● STREAMING</span>
            <span style={{ fontSize: '12px', color: theme.textMuted }}>
              {streamEntries.length} entries — new entry every 800ms
            </span>
          </div>
          <TkxLiveLog
            entries={streamEntries}
            height={400}
            autoScroll={true}
            showTimestamp={true}
            showSource={true}
            monospace={true}
          />
        </div>
      </DemoSection>

      {/* ── 2. Filtered Logs ── */}
      <DemoSection
        title="Filtered Logs — filterLevel Prop"
        description="Same log stream but filtered by minimum severity. Click a level button to change the filter. filterLevel='warn' shows only warn, error, and fatal entries."
        theme={theme}
        code={`const [filterLevel, setFilterLevel] = useState<LogLevel>('warn');

// Level selector buttons
{(['debug', 'info', 'warn', 'error', 'fatal'] as LogLevel[]).map(level => (
  <button key={level} onClick={() => setFilterLevel(level)}>
    {level.toUpperCase()}
  </button>
))}

<TkxLiveLog
  entries={entries}
  height={380}
  filterLevel={filterLevel}
  showTimestamp={true}
  autoScroll={false}
/>`}
      >
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: theme.textMuted, marginRight: '4px' }}>Min level:</span>
            {LEVEL_OPTIONS.map((level) => (
              <button
                key={level}
                style={levelBtnStyle(level, filterLevel === level)}
                onClick={() => setFilterLevel(level)}
              >
                {level}
              </button>
            ))}
          </div>
          <TkxLiveLog
            entries={streamEntries}
            height={380}
            filterLevel={filterLevel}
            showTimestamp={true}
            autoScroll={false}
          />
        </div>
      </DemoSection>

      {/* ── 3. Searchable Logs ── */}
      <DemoSection
        title="Searchable Logs — searchQuery Prop"
        description="Type in the search box to highlight matching text in all log entries. The searchQuery prop accepts a plain string — the component performs a case-insensitive substring match and highlights occurrences."
        theme={theme}
        code={`const [searchQuery, setSearchQuery] = useState('');

<input
  value={searchQuery}
  onChange={e => setSearchQuery(e.target.value)}
  placeholder="Search logs..."
/>

<TkxLiveLog
  entries={entries}
  height={380}
  searchQuery={searchQuery}
  showTimestamp={true}
  autoScroll={false}
/>`}
      >
        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: '10px' }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search log messages... (e.g. 'payment', 'error', 'user')"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.surface,
                color: theme.text,
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box' as const,
              }}
            />
          </div>
          <TkxLiveLog
            entries={streamEntries}
            height={380}
            searchQuery={searchQuery}
            showTimestamp={true}
            autoScroll={false}
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <PropTable props={LIVE_LOG_PROPS} />
    </div>
  );
}
