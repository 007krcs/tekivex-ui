import { useMemo } from 'react';
import {
  TkxSecurityDashboard,
  sanitizeString,
  sanitizeUnicode,
  scrubPII,
  audit,
  createRateLimiter,
} from 'tekivex-ui';
import { Preview } from '../Preview';

const btn: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid var(--sl-color-gray-5)',
  background: 'var(--sl-color-gray-6)',
  color: 'var(--sl-color-text)',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
};

/**
 * Live demo: click a button to make the kernel block a real threat, then
 * watch it appear in the dashboard below. Every action calls the SAME
 * primitives your app calls — nothing here is faked.
 */
export function SecurityDashboardLive() {
  // One rate limiter per mount so repeated "Trip rate limiter" clicks exhaust it.
  const limiter = useMemo(() => createRateLimiter(3, 60_000), []);

  return (
    <Preview style={{ flexDirection: 'column', gap: 16, alignItems: 'stretch' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button
          type="button"
          style={btn}
          onClick={() => sanitizeString('<img src=x onerror=alert(1)>')}
        >
          Block XSS payload
        </button>
        <button
          type="button"
          style={btn}
          // U+202E RIGHT-TO-LEFT OVERRIDE — the Trojan-Source vector.
          onClick={() => sanitizeUnicode('transfer‮1000‬now')}
        >
          Strip Trojan-Source unicode
        </button>
        <button
          type="button"
          style={btn}
          onClick={() => scrubPII('email jane@example.com, card 4111 1111 1111 1111')}
        >
          Redact PII
        </button>
        <button
          type="button"
          style={btn}
          onClick={() => audit('export', 'BillingReport', { rows: 42 })}
        >
          Write audit entry
        </button>
        <button
          type="button"
          style={btn}
          onClick={() => limiter.check()}
        >
          Trip rate limiter (3/min)
        </button>
      </div>

      <TkxSecurityDashboard />
    </Preview>
  );
}

/** Compact variant — summary tiles only, no scrolling log. */
export function SecurityDashboardCompact() {
  return (
    <Preview label="compact" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <TkxSecurityDashboard compact hideExport />
    </Preview>
  );
}
