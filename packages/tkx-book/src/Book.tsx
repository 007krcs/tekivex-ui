// ─────────────────────────────────────────────────────────────────────────────
// Book — root component for tkx-book.
//
// Layout:
//   ┌─ sidebar ──────────────┬─ canvas ──────────────────────────────────┐
//   │ search                 │  story render area                        │
//   │ list of stories        │                                           │
//   │                        ├─ controls panel ──────────────────────────┤
//   │                        │  per-control inputs                       │
//   └────────────────────────┴───────────────────────────────────────────┘
//
// URL state: ?component=button&story=variants&theme=dark&viewport=mobile
// All persisted via URLSearchParams so URLs are shareable.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { ThemeProvider, type ColorScheme } from 'tekivex-ui';
import { stories } from '../stories';
import { Sidebar } from './Sidebar';
import { Controls } from './Controls';
import { Toolbar } from './Toolbar';
import type { Story } from './types';

type Viewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_WIDTHS: Record<Viewport, number | undefined> = {
  mobile: 375,
  tablet: 768,
  desktop: undefined, // fluid
};

function readQuery() {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function writeQuery(params: URLSearchParams) {
  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', url);
}

export function Book() {
  const [activeSlug, setActiveSlug] = useState<string>(() => readQuery().get('story') || Object.keys(stories)[0]);
  const [theme, setTheme] = useState<ColorScheme>(() => (readQuery().get('theme') as ColorScheme) || 'auto');
  const [viewport, setViewport] = useState<Viewport>(() => (readQuery().get('viewport') as Viewport) || 'desktop');
  const [propValues, setPropValues] = useState<Record<string, any>>({});

  const story: Story | undefined = stories[activeSlug];

  // Reset prop values when the active story changes; seed from defaults.
  useEffect(() => {
    if (!story) return;
    const seed: Record<string, any> = {};
    for (const [key, spec] of Object.entries(story.controls)) {
      seed[key] = spec.default;
    }
    setPropValues(seed);
  }, [activeSlug, story]);

  // Persist to URL.
  useEffect(() => {
    const q = readQuery();
    q.set('story', activeSlug);
    q.set('theme', theme);
    q.set('viewport', viewport);
    writeQuery(q);
  }, [activeSlug, theme, viewport]);

  const containerStyle: CSSProperties = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gridTemplateRows: '48px 1fr',
    height: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  }), []);

  const toolbarStyle: CSSProperties = {
    gridColumn: '1 / -1',
    gridRow: '1',
  };

  const sidebarStyle: CSSProperties = {
    gridColumn: '1',
    gridRow: '2',
    overflow: 'auto',
    borderRight: '1px solid var(--tkx-border, #2a2a3e)',
    background: 'var(--tkx-surface, #12121a)',
  };

  const mainStyle: CSSProperties = {
    gridColumn: '2',
    gridRow: '2',
    display: 'grid',
    gridTemplateRows: '1fr 220px',
    overflow: 'hidden',
  };

  const canvasStyle: CSSProperties = {
    overflow: 'auto',
    background: 'var(--tkx-bg, #0a0a0f)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 24,
  };

  const viewportFrameStyle: CSSProperties = {
    width: VIEWPORT_WIDTHS[viewport] ?? '100%',
    maxWidth: '100%',
    minHeight: '100%',
    background: 'var(--tkx-surface, #12121a)',
    borderRadius: 8,
    border: '1px solid var(--tkx-border, #2a2a3e)',
    padding: 24,
    transition: 'width 0.2s ease',
    boxSizing: 'border-box',
  };

  return (
    <ThemeProvider mode={theme}>
      <div style={containerStyle}>
        <div style={toolbarStyle}>
          <Toolbar
            theme={theme}
            onTheme={setTheme}
            viewport={viewport}
            onViewport={setViewport}
            storyName={story?.name}
            shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
          />
        </div>
        <div style={sidebarStyle}>
          <Sidebar activeSlug={activeSlug} onActivate={setActiveSlug} />
        </div>
        <div style={mainStyle}>
          <div style={canvasStyle}>
            <div style={viewportFrameStyle}>
              {story ? (
                <ErrorBoundary>{story.render(propValues)}</ErrorBoundary>
              ) : (
                <div style={{ color: 'var(--tkx-textMuted, #888)' }}>
                  Pick a story from the sidebar.
                </div>
              )}
            </div>
          </div>
          <Controls
            controls={story?.controls ?? {}}
            values={propValues}
            onChange={(next) => setPropValues(next)}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

// Tiny error boundary so a misbehaving story doesn't blank the whole book.
import { Component, type ErrorInfo } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[tkx-book] story threw:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ color: '#f72585', padding: 12, border: '1px dashed #f72585', borderRadius: 6 }}>
          <strong>Story crashed:</strong> {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}
