import { useState, type ReactNode, type CSSProperties } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { CodeBlock } from './CodeBlock';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DemoSectionProps {
  title: string;
  description?: string;
  code: string;
  language?: string;
  children: ReactNode;
  theme: ThemeTokens;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconCode({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M9 2L12 5L9 8"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 2L2 5L5 8"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEye({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M1 7C1 7 3.5 3 7 3C10.5 3 13 7 13 7C13 7 10.5 11 7 11C3.5 11 1 7 1 7Z"
        stroke={color}
        strokeWidth="1.4"
      />
      <circle cx="7" cy="7" r="1.5" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}

// ── DemoSection component ─────────────────────────────────────────────────────

export function DemoSection({
  title,
  description,
  code,
  language = 'tsx',
  children,
  theme,
}: DemoSectionProps) {
  const [showCode, setShowCode] = useState(false);

  const sectionStyle: CSSProperties = {
    marginBottom: '40px',
  };

  const headerStyle: CSSProperties = {
    marginBottom: '12px',
  };

  const titleStyle: CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: theme.text,
    margin: '0 0 4px',
    lineHeight: '1.3',
  };

  const descStyle: CSSProperties = {
    fontSize: '14px',
    color: theme.textMuted,
    margin: 0,
    lineHeight: '1.6',
  };

  const demoAreaStyle: CSSProperties = {
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surface,
    overflow: 'hidden',
  };

  const previewAreaStyle: CSSProperties = {
    padding: '28px 24px',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: '12px',
    minHeight: '80px',
    backgroundColor: theme.surface,
    overflow: 'auto',
  };

  const toolbarStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 14px',
    backgroundColor: theme.surfaceAlt,
    borderTop: `1px solid ${theme.border}`,
  };

  const toolbarLabelStyle: CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    color: theme.textMuted,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const toggleBtnStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '6px',
    border: `1px solid ${showCode ? theme.primary : theme.border}`,
    backgroundColor: showCode ? `${theme.primary}12` : 'transparent',
    color: showCode ? theme.primary : theme.textMuted,
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
  };

  const codeAreaStyle: CSSProperties = {
    borderTop: `1px solid ${theme.border}`,
  };

  return (
    <section style={sectionStyle} aria-labelledby={`demo-section-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      {/* Section header */}
      <div style={headerStyle}>
        <h3
          id={`demo-section-${title.replace(/\s+/g, '-').toLowerCase()}`}
          style={titleStyle}
        >
          {title}
        </h3>
        {description && <p style={descStyle}>{description}</p>}
      </div>

      {/* Demo area */}
      <div style={demoAreaStyle}>
        {/* Live preview */}
        <div style={previewAreaStyle} role="region" aria-label={`Live demo: ${title}`}>
          {children}
        </div>

        {/* Toolbar */}
        <div style={toolbarStyle}>
          <span style={toolbarLabelStyle} aria-hidden="true">
            Live Preview
          </span>

          <button
            type="button"
            style={toggleBtnStyle}
            onClick={() => setShowCode((s) => !s)}
            aria-expanded={showCode}
            aria-controls={`code-${title.replace(/\s+/g, '-').toLowerCase()}`}
            onMouseEnter={(e) => {
              if (!showCode) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = theme.primary;
                (e.currentTarget as HTMLButtonElement).style.color = theme.primary;
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${theme.primary}08`;
              }
            }}
            onMouseLeave={(e) => {
              if (!showCode) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = theme.border;
                (e.currentTarget as HTMLButtonElement).style.color = theme.textMuted;
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            {showCode ? (
              <>
                <IconEye color="currentColor" />
                Hide Code
              </>
            ) : (
              <>
                <IconCode color="currentColor" />
                View Code
              </>
            )}
          </button>
        </div>

        {/* Code block */}
        {showCode && (
          <div
            id={`code-${title.replace(/\s+/g, '-').toLowerCase()}`}
            style={codeAreaStyle}
            role="region"
            aria-label={`Source code for ${title}`}
          >
            <CodeBlock code={code} language={language} />
          </div>
        )}
      </div>
    </section>
  );
}
