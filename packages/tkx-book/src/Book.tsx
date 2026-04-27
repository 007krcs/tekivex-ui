// ─────────────────────────────────────────────────────────────────────────────
// Book — root component for tkx-book.
//
// Layout:
//   ┌─ toolbar ──────────────────────────────────────────────────────────┐
//   │ tkx-book · story name · viewport · theme · share                   │
//   ├─ sidebar ──────────┬─ canvas ────────────────────────────────────┐
//   │                    │  story render area (viewport-aware frame)    │
//   │                    ├─ panel (tabbed addons) ────────────────────┤
//   │                    │  Controls · Docs · A11y · Viewport ·        │
//   │                    │  Snapshot · Interactions                    │
//   └────────────────────┴─────────────────────────────────────────────┘
// ─────────────────────────────────────────────────────────────────────────────

import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { ThemeProvider, type ColorScheme } from 'tekivex-ui';
import { stories } from '../stories';
import { Sidebar } from './Sidebar';
import { Toolbar } from './Toolbar';
import { Panel } from './Panel';
import { useViewport } from './addons';
import type { Story } from './types';

type Viewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_WIDTHS: Record<Viewport, number | undefined> = {
  mobile: 375,
  tablet: 768,
  desktop: undefined,
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
  const [activeSlug, setActiveSlug] = useState<string>(
    () => readQuery().get('story') || Object.keys(stories)[0],
  );
  const [theme, setTheme] = useState<ColorScheme>(
    () => (readQuery().get('theme') as ColorScheme) || 'auto',
  );
  const [viewport, setViewport] = useState<Viewport>(
    () => (readQuery().get('viewport') as Viewport) || 'desktop',
  );
  const [propValues, setPropValues] = useState<Record<string, any>>({});
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const deviceProfile = useViewport();

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

  // Listen for props changes from the Controls addon (it dispatches a
  // CustomEvent so the addon API stays one-way: addons receive ctx,
  // they emit events, Book is the only writer).
  useEffect(() => {
    const handler = (e: Event) => setPropValues((e as CustomEvent).detail);
    window.addEventListener('tkx-book-props-change', handler);
    return () => window.removeEventListener('tkx-book-props-change', handler);
  }, []);

  const containerStyle: CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      gridTemplateRows: '48px 1fr',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }),
    [],
  );

  const toolbarStyle: CSSProperties = { gridColumn: '1 / -1', gridRow: '1' };
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
    gridTemplateRows: '1fr 280px',
    overflow: 'hidden',
    minHeight: 0,
  };
  const canvasStyle: CSSProperties = {
    overflow: 'auto',
    background: 'var(--tkx-bg, #0a0a0f)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 24,
  };

  // Viewport sizing: device profile (from Viewport addon) wins; otherwise
  // fall back to the toolbar viewport switcher.
  const frameWidth = deviceProfile?.width ?? VIEWPORT_WIDTHS[viewport];
  const frameHeight = deviceProfile?.height;
  const viewportFrameStyle: CSSProperties = {
    width: frameWidth ?? '100%',
    minHeight: frameHeight ? frameHeight : '100%',
    maxWidth: '100%',
    background: 'var(--tkx-surface, #12121a)',
    borderRadius: deviceProfile ? 32 : 8,
    border: deviceProfile ? '8px solid #1a1a1a' : '1px solid var(--tkx-border, #2a2a3e)',
    padding: deviceProfile ? 16 : 24,
    transition: 'width 0.2s ease, min-height 0.2s ease, border-radius 0.2s ease',
    boxSizing: 'border-box',
    position: 'relative',
  };

  const ctx = useMemo(
    () =>
      story
        ? { story, slug: activeSlug, containerRef: canvasRef, props: propValues }
        : null,
    [story, activeSlug, propValues],
  );

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
            <div ref={canvasRef} style={viewportFrameStyle}>
              {deviceProfile && (
                <span
                  style={{
                    position: 'absolute',
                    top: -28,
                    left: 0,
                    fontSize: 11,
                    color: 'var(--tkx-textMuted)',
                    fontWeight: 600,
                  }}
                >
                  {deviceProfile.name} · {deviceProfile.width}×{deviceProfile.height}
                </span>
              )}
              {story ? (
                <ErrorBoundary>{story.render(propValues)}</ErrorBoundary>
              ) : (
                <div style={{ color: 'var(--tkx-textMuted)' }}>
                  Pick a story from the sidebar.
                </div>
              )}
            </div>
          </div>
          {ctx && <Panel ctx={ctx} />}
        </div>
      </div>
    </ThemeProvider>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[tkx-book] story threw:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            color: '#f72585',
            padding: 12,
            border: '1px dashed #f72585',
            borderRadius: 6,
          }}
        >
          <strong>Story crashed:</strong> {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}
