// ─────────────────────────────────────────────────────────────────────────────
// contact-mail — opens the visitor's mail client without exposing the
// recipient address in page text, in browser hover tooltips, or in
// view-source. The address is base64-encoded at build time and only
// decoded inside an onClick handler at the moment the user actually
// clicks. View-source / right-click "copy link" shows nothing useful.
//
// This is intentional obfuscation, not security — anyone who actually
// wants the address can capture it from network DevTools after a click.
// The goal is to keep the address out of casual page text, hover bars,
// browser status indicators, and source-view.
// ─────────────────────────────────────────────────────────────────────────────

// Base64 of the recipient list. Decoded as UTF-8 at click time.
//
// To rotate the recipients, run in a browser console:
//   btoa('foo@example.com,bar@example.com')
// and paste the resulting string here.
const ENCODED_RECIPIENTS = 'bmlzaHVfc2luZ2hAdGVraXZleC5jb20sbm92YWFpMDQwMUBnbWFpbC5jb20=';

function decode(b64: string): string {
  if (typeof atob === 'function') return atob(b64);
  // SSR / Node fallback (used during prerender so the call doesn't crash)
  return Buffer.from(b64, 'base64').toString('utf8');
}

export interface OpenMailOpts {
  subject?: string;
  body?: string;
}

/**
 * Opens the visitor's default mail client with the configured recipients
 * pre-filled. Subject + body are optional.
 *
 * Uses a synthetic anchor click rather than `window.location.href = ...`
 * so the navigation isn't logged in browser history and most popup blockers
 * leave it alone.
 */
export function openMail({ subject, body }: OpenMailOpts = {}) {
  if (typeof window === 'undefined') return;
  const to = decode(ENCODED_RECIPIENTS);
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body)    params.push(`body=${encodeURIComponent(body)}`);
  const href = `mailto:${to}${params.length ? '?' + params.join('&') : ''}`;
  const a = document.createElement('a');
  a.href = href;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
