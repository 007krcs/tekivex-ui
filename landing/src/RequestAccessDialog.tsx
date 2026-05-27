// ─────────────────────────────────────────────────────────────────────────────
// RequestAccessDialog — gate that opens whenever a visitor clicks a component
//
// Marketing flow:
//   1. Visitor browses the components directory.
//   2. Clicks the one they want.
//   3. Modal explains: components ship on demand. Send a one-line note about
//      what you're building and you get access (latest source published to
//      npm, setup instructions, support).
//   4. Primary CTA opens a pre-filled issue on the public issue tracker.
//   5. Secondary CTA copies a one-line install snippet (so curious visitors
//      can try the source build themselves without filing).
//
// Tracks which component triggered the dialog so the issue body comes
// pre-filled with the right name.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PREVIEWS } from './component-previews';

const ISSUE_BASE = 'https://github.com/007krcs/tekivex-ui/issues/new';

export interface RequestTarget {
  /** Display name shown to the user, e.g. "TkxCommandPalette". */
  name: string;
  /** Slug for analytics / deep-link, e.g. "command-palette". */
  slug: string;
  /** Which package to mention. */
  pkg?: string;
}

export interface RequestAccessDialogProps {
  target: RequestTarget | null;
  onClose: () => void;
}

function buildIssueUrl(t: RequestTarget): string {
  const title = `Access request: ${t.name}`;
  const body = [
    `Hi! I'd like to use \`${t.name}\` from \`${t.pkg ?? 'tekivex-ui'}\`.`,
    '',
    '**What I\'m building:**',
    '<!-- One line is fine -->',
    '',
    '**Stack:** React 18+ / Next / Vite / etc.',
    '',
    '**Anything you need from me:**',
    '<!-- Repo link, deadline, etc. -->',
  ].join('\n');
  return `${ISSUE_BASE}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

export function RequestAccessDialog({ target, onClose }: RequestAccessDialogProps) {
  // ESC closes
  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [target, onClose]);

  if (!target) return null;
  if (typeof document === 'undefined') return null;

  const issueUrl = buildIssueUrl(target);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-access-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(8, 10, 25, 0.7)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: PREVIEWS[target.slug] ? 880 : 520,
          maxHeight: '92vh',
          overflowY: 'auto',
          background:
            'linear-gradient(180deg, rgba(22, 24, 44, 0.96), rgba(14, 16, 30, 0.96))',
          backdropFilter: 'blur(24px) saturate(140%)',
          border: '1px solid rgba(196,168,255,0.28)',
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,245,212,0.08)',
          color: '#e8e8f4',
          position: 'relative',
        }}
      >
        {/* Close X */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'transparent',
            color: '#c4a8ff',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Lock-icon flourish */}
        <div
          aria-hidden="true"
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background:
              'radial-gradient(circle at 30% 30%, rgba(196,168,255,0.4), rgba(0,245,212,0.15) 70%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            marginBottom: 18,
            boxShadow: '0 0 32px rgba(196,168,255,0.25)',
          }}
        >
          🔐
        </div>

        <h2
          id="request-access-title"
          style={{
            margin: '0 0 8px',
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          Access to{' '}
          <span
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              color: '#00f5d4',
            }}
          >
            {target.name}
          </span>
        </h2>

        <p style={{ margin: '0 0 18px', color: '#b8b8d4', fontSize: 14, lineHeight: 1.65 }}>
          Components ship on demand. Send a one-line note about what you're
          building — we'll publish the latest source to npm under your name,
          send setup instructions, and stay on call for any wiring questions.
        </p>

        {PREVIEWS[target.slug] && (
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#c4a8ff',
                marginBottom: 8,
              }}
            >
              Live preview · interact with realistic dummy data
            </div>
            <PreviewBoundary>
              {(() => {
                const Comp = PREVIEWS[target.slug];
                return <Comp />;
              })()}
            </PreviewBoundary>
          </div>
        )}

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            color: '#dcdce8',
            fontSize: 13,
          }}
        >
          <Bullet>Latest source published to npm within 24 hours</Bullet>
          <Bullet>Setup walkthrough emailed back to you</Bullet>
          <Bullet>Optional Slack/Discord channel for integration help</Bullet>
          <Bullet>No paywall, no contract — just visibility into who needs what</Bullet>
        </ul>

        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(196,168,255,0.08)',
            border: '1px solid rgba(196,168,255,0.25)',
            color: '#c4a8ff',
            fontSize: 12,
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span aria-hidden="true">🔒</span>
          <span>
            <strong>View-only preview.</strong> The latest source isn't on
            npm yet — releases are demand-driven. Send a one-line note and
            we'll publish under your name within 24 hours.
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <a
            href={issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            style={primaryBtn}
          >
            Send my requirement →
          </a>
        </div>

        <p
          style={{
            margin: '20px 0 0',
            paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            fontSize: 12,
            color: '#888',
            textAlign: 'center',
          }}
        >
          Or browse the catalog while you decide ·{' '}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#c4a8ff',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              padding: 0,
              fontFamily: 'inherit',
            }}
          >
            keep looking
          </button>
        </p>
      </div>
    </div>,
    document.body,
  );
}

// Defensive wrapper so a bug in any single preview doesn't break the
// whole dialog. We can't catch render errors with hooks, so use a tiny
// class-based ErrorBoundary.
import { Component, type ReactNode as ReactNodeT } from 'react';

class PreviewBoundary extends Component<{ children: ReactNodeT }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    // Surface in dev console without breaking prod.
    // eslint-disable-next-line no-console
    console.warn('Preview crashed:', err);
  }
  render() {
    if (this.state.failed) {
      return (
        <div
          style={{
            padding: 16,
            borderRadius: 10,
            border: '1px dashed rgba(255,0,110,0.4)',
            background: 'rgba(255,0,110,0.06)',
            color: '#ff7eaf',
            fontSize: 13,
          }}
        >
          Preview failed to render. The component itself works — this is a
          sandbox issue with the dummy-data demo. Click "Send my requirement →"
          to request access and we'll send a stable example with your setup.
        </div>
      );
    }
    return this.props.children;
  }
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span aria-hidden="true" style={{ color: '#00f5d4', flex: '0 0 16px', lineHeight: 1.6 }}>
        ✓
      </span>
      <span style={{ flex: 1, lineHeight: 1.55 }}>{children}</span>
    </li>
  );
}

const primaryBtn: React.CSSProperties = {
  flex: '1 1 auto',
  minWidth: 200,
  padding: '12px 20px',
  borderRadius: 10,
  border: 'none',
  background: 'linear-gradient(135deg, #00f5d4, #7b8eff, #c4a8ff)',
  backgroundSize: '200% 200%',
  color: '#0a0a0f',
  fontWeight: 800,
  textAlign: 'center',
  textDecoration: 'none',
  cursor: 'pointer',
  fontSize: 14,
  letterSpacing: '0.01em',
  boxShadow: '0 8px 24px rgba(0,245,212,0.3)',
};

