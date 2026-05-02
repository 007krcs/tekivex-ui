// ─────────────────────────────────────────────────────────────────────────────
// ExampleShell — shared chrome for every /examples/* showcase page.
//
// Purposefully thin: a header strip with title + description + a "view source"
// link, then the example renders as the body. Each example owns its own
// background so the immersive demos (360°, AR/VR) can stay dark while content
// demos (blog, holographic gallery) can be light.
// ─────────────────────────────────────────────────────────────────────────────
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface ExampleShellProps {
  title: string;
  eyebrow: string;
  description: string;
  sourceUrl?: string;
  surface?: 'dark' | 'light';
  children: ReactNode;
}

export function ExampleShell({
  title,
  eyebrow,
  description,
  sourceUrl,
  surface = 'light',
  children,
}: ExampleShellProps) {
  const dark = surface === 'dark';
  return (
    <div
      className={dark ? 'tk-home tk-home--dark' : ''}
      style={{
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
        background: dark ? '#0a0b15' : '#ffffff',
        color: dark ? '#e8e8f4' : '#0f172a',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(28px, 5vw, 48px) 24px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 16,
          borderBottom: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e6e8ef',
        }}
      >
        <div>
          <nav
            aria-label="Breadcrumb"
            style={{
              fontSize: 12,
              color: dark ? '#a1a1aa' : '#64748b',
              marginBottom: 8,
            }}
          >
            <Link
              to="/"
              style={{ color: dark ? '#c4a8ff' : '#4f46e5', textDecoration: 'none' }}
            >
              Home
            </Link>
            <span style={{ margin: '0 8px', opacity: 0.5 }}>/</span>
            <Link
              to="/examples"
              style={{ color: dark ? '#c4a8ff' : '#4f46e5', textDecoration: 'none' }}
            >
              Examples
            </Link>
            <span style={{ margin: '0 8px', opacity: 0.5 }}>/</span>
            <span>{title}</span>
          </nav>
          <div
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: 999,
              background: dark ? 'rgba(0, 245, 212, 0.1)' : 'rgba(79, 70, 229, 0.08)',
              border: dark ? '1px solid rgba(0, 245, 212, 0.3)' : '1px solid rgba(79, 70, 229, 0.22)',
              color: dark ? '#00f5d4' : '#4f46e5',
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            {eyebrow}
          </div>
          <h1
            style={{
              margin: '0 0 6px',
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              color: dark ? '#ffffff' : '#0f172a',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              maxWidth: 720,
              color: dark ? '#b8b8d4' : '#475569',
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
        </div>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              color: dark ? '#0a0b15' : '#ffffff',
              background: dark ? '#00f5d4' : '#4f46e5',
              whiteSpace: 'nowrap',
            }}
          >
            View source ↗
          </a>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
