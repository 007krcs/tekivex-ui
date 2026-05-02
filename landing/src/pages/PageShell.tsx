// ─────────────────────────────────────────────────────────────────────────────
// PageShell — common typography + layout for every text-heavy route.
//
// Used by Privacy, Terms, About, Contact, blog posts, and docs pages.
// Provides comfortable reading width, clean heading scale, and a
// breadcrumb trail back to home.
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export interface PageShellProps {
  /** Page title (also rendered as <h1>). */
  title: string;
  /** One-line subtitle under the title. */
  subtitle?: string;
  /** Eyebrow tag above the title (e.g. "Article", "Documentation"). */
  eyebrow?: string;
  /** Breadcrumb trail. The Home link is always prepended. */
  breadcrumbs?: { label: string; href?: string }[];
  /** Last-updated date string. */
  updated?: string;
  children: ReactNode;
}

export function PageShell({
  title,
  subtitle,
  eyebrow,
  breadcrumbs,
  updated,
  children,
}: PageShellProps) {
  return (
    <article
      style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 760,
        margin: '0 auto',
        padding: 'clamp(48px, 7vw, 88px) 24px',
        fontSize: 'clamp(15px, 1.1vw, 17px)',
        lineHeight: 1.7,
        color: '#dcdce8',
      }}
    >
      <nav
        aria-label="Breadcrumb"
        style={{ fontSize: 12, color: '#888', marginBottom: 18 }}
      >
        <Link to="/" style={breadcrumbLink}>Home</Link>
        {breadcrumbs?.map((c, i) => (
          <span key={i}>
            <span style={{ margin: '0 8px', color: '#555' }}>/</span>
            {c.href ? (
              <Link to={c.href} style={breadcrumbLink}>{c.label}</Link>
            ) : (
              <span style={{ color: '#aaa' }}>{c.label}</span>
            )}
          </span>
        ))}
      </nav>

      {eyebrow && (
        <div
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 999,
            background: 'rgba(196,168,255,0.1)',
            border: '1px solid rgba(196,168,255,0.3)',
            color: '#c4a8ff',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 18,
          }}
        >
          {eyebrow}
        </div>
      )}

      <h1
        style={{
          margin: '0 0 8px',
          fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          color: '#fff',
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          style={{
            margin: '0 0 24px',
            color: '#b8b8d4',
            fontSize: 'clamp(16px, 1.3vw, 19px)',
            lineHeight: 1.55,
          }}
        >
          {subtitle}
        </p>
      )}

      {updated && (
        <p style={{ color: '#666', fontSize: 13, margin: '0 0 32px' }}>
          Last updated <time>{updated}</time>
        </p>
      )}

      <div
        className="tk-prose"
        style={{
          /* Spacing scale for prose elements */
        }}
      >
        {children}
      </div>

      <hr
        style={{
          border: 'none',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          margin: '48px 0 24px',
        }}
      />
      <p style={{ color: '#888', fontSize: 13 }}>
        Spotted an error or want to contribute?{' '}
        <a
          href="https://github.com/novaai0401-ui/tekivex-issue-report/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#00f5d4' }}
        >
          Open an issue
        </a>
        .
      </p>
    </article>
  );
}

const breadcrumbLink: React.CSSProperties = {
  color: '#c4a8ff',
  textDecoration: 'none',
};
