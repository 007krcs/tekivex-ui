import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  DevToolsPanel,
  OllamaProvider,
  ReplayProvider,
  TkxReasoningTrace,
  TkxToolCallCard,
  createAgent,
  useEventCollector,
  type AgentEvent,
  type Middleware,
  type Recording,
} from '../../src/agent';

interface Props {
  theme: ThemeTokens;
}

// ── Recorded streams — no API key needed ──────────────────────────────────────

const HELLO_RECORDING: Recording = {
  startedAt: 0,
  events: [
    { type: 'text_delta', text: 'Hello! This is a fully streaming agent powered by ' },
    { type: 'text_delta', text: 'ReplayProvider — no API key, no network calls.\n\n' },
    { type: 'text_delta', text: 'Every event you see is normalized through the same StreamEvent shape that ' },
    { type: 'text_delta', text: 'all four providers (Anthropic, OpenAI, Gemini, Ollama) emit. ' },
    { type: 'text_delta', text: 'Open the DevTools panel to inspect each event live.' },
    { type: 'message_stop', reason: 'end_turn' },
  ],
};

const TOOL_RECORDING: Recording = {
  startedAt: 0,
  events: [
    { type: 'text_delta', text: "I'll check the weather for you. " },
    { type: 'tool_call_start', id: 'call_1', name: 'get_weather' },
    { type: 'tool_call_delta', id: 'call_1', argsDelta: '{"city":"Tokyo"}' },
    { type: 'tool_call_end', id: 'call_1', input: { city: 'Tokyo' } },
    { type: 'message_stop', reason: 'end_turn' },
  ],
};

// ── Responsive hook ──────────────────────────────────────────────────────────

function useViewport(): { isMobile: boolean; isTablet: boolean } {
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1200 : window.innerWidth));
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024 };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function runReplay(
  recording: Recording,
  message: string,
  onEvent: (e: AgentEvent) => void,
  middleware?: Middleware,
  signal?: AbortSignal,
): Promise<void> {
  const agent = createAgent({
    provider: new ReplayProvider({ recording, delayMsBetweenEvents: 45 }),
    model: 'replay',
    middleware: middleware ? [middleware] : undefined,
  });
  for await (const evt of agent.run({ message, signal })) {
    onEvent(evt);
  }
}

// ── Shared styles ────────────────────────────────────────────────────────────

function cardStyle(theme: ThemeTokens, accent = false): CSSProperties {
  return {
    background: theme.surface,
    border: `1px solid ${accent ? `${theme.primary}33` : theme.border}`,
    borderRadius: 12,
    padding: 'clamp(16px, 3vw, 24px)',
  };
}

function primaryButton(theme: ThemeTokens, disabled = false): CSSProperties {
  return {
    padding: '10px 20px',
    borderRadius: 10,
    border: 'none',
    background: disabled
      ? `${theme.primary}55`
      : `linear-gradient(135deg, ${theme.primary}, ${theme.primary}cc)`,
    color: '#0a0a1a',
    fontWeight: 700,
    fontSize: 14,
    cursor: disabled ? 'default' : 'pointer',
    boxShadow: disabled ? 'none' : `0 4px 16px -4px ${theme.primary}88`,
    transition: 'transform 0.15s, box-shadow 0.15s',
    minWidth: 140,
  };
}

function ghostButton(theme: ThemeTokens): CSSProperties {
  return {
    padding: '8px 14px',
    borderRadius: 8,
    border: `1px solid ${theme.border}`,
    background: 'transparent',
    color: theme.textMuted,
    fontWeight: 500,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.15s',
  };
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ theme, isMobile }: { theme: ThemeTokens; isMobile: boolean }) {
  return (
    <header style={{ marginBottom: 32 }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px 6px 10px',
          borderRadius: 999,
          border: `1px solid ${theme.primary}44`,
          background: `${theme.primary}12`,
          marginBottom: 18,
          fontSize: 12,
          color: theme.primary,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: theme.primary,
            boxShadow: `0 0 12px ${theme.primary}`,
          }}
        />
        Agent runtime · v2.6.0
      </div>
      <h1
        style={{
          fontSize: isMobile ? 32 : 'clamp(36px, 5vw, 56px)',
          fontWeight: 800,
          margin: '0 0 14px',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          color: theme.text,
        }}
      >
        Build agents.{' '}
        <span
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, #8b5cf6)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Any model. Any system.
        </span>
      </h1>
      <p
        style={{
          color: theme.textMuted,
          fontSize: isMobile ? 14 : 16,
          lineHeight: 1.65,
          margin: 0,
          maxWidth: 720,
        }}
      >
        Zero-dependency agent runtime under{' '}
        <code
          style={{
            padding: '2px 6px',
            borderRadius: 4,
            background: theme.surfaceAlt,
            color: theme.primary,
            fontSize: '0.9em',
          }}
        >
          tekivex-ui/agent
        </code>
        . Streaming, tools, RAG, MCP, A2A, multi-agent — works against{' '}
        <strong style={{ color: theme.text }}>Anthropic</strong>,{' '}
        <strong style={{ color: theme.text }}>OpenAI</strong>,{' '}
        <strong style={{ color: theme.text }}>Gemini</strong>,{' '}
        <strong style={{ color: theme.text }}>Ollama</strong>, and any MCP/A2A endpoint.
      </p>
    </header>
  );
}

// ── Stat bar ─────────────────────────────────────────────────────────────────

function StatBar({ theme, isMobile }: { theme: ThemeTokens; isMobile: boolean }) {
  const stats = [
    { value: '16 kB', label: 'gzipped' },
    { value: '0', label: 'runtime deps' },
    { value: '79', label: 'unit tests' },
    { value: '4', label: 'providers' },
    { value: '18', label: 'features' },
  ];
  return (
    <div
      style={{
        display: 'grid',
        // Mobile: explicit 2-track form avoids the demo's global rule that
        // force-stacks any `repeat(2, ...)` grid below 768px.
        gridTemplateColumns: isMobile
          ? 'minmax(0, 1fr) minmax(0, 1fr)'
          : `repeat(${stats.length}, minmax(0, 1fr))`,
        gap: 8,
        marginBottom: 32,
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            ...cardStyle(theme),
            padding: '14px 16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: isMobile ? 18 : 22,
              fontWeight: 800,
              color: theme.primary,
              letterSpacing: '-0.01em',
            }}
          >
            {s.value}
          </div>
          <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  theme,
  num,
  title,
  description,
}: {
  theme: ThemeTokens;
  num: string;
  title: string;
  description: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 6,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: 8,
            background: `${theme.primary}1f`,
            color: theme.primary,
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {num}
        </span>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: theme.text }}>{title}</h2>
      </div>
      <p style={{ color: theme.textMuted, fontSize: 14, margin: 0, lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
  );
}

// ── Streaming chat demo ──────────────────────────────────────────────────────

function StreamingDemo({
  theme,
  middleware,
  isMobile,
}: {
  theme: ThemeTokens;
  middleware: Middleware;
  isMobile: boolean;
}) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const text = useMemo(() => {
    let buf = '';
    for (const e of events) if (e.type === 'text_delta') buf += e.text;
    return buf;
  }, [events]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [text]);

  async function send() {
    setEvents([]);
    setRunning(true);
    const ctl = new AbortController();
    abortRef.current = ctl;
    try {
      await runReplay(HELLO_RECORDING, 'demo', (e) => setEvents((prev) => [...prev, e]), middleware, ctl.signal);
    } catch {
      /* aborted */
    }
    setRunning(false);
    abortRef.current = null;
  }

  function stop() {
    abortRef.current?.abort();
  }

  return (
    <div style={cardStyle(theme)}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 14,
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <button
          onClick={send}
          disabled={running}
          style={primaryButton(theme, running)}
          aria-label="Run streaming agent demo"
        >
          {running ? '● Streaming…' : '▶ Run agent'}
        </button>
        {running && (
          <button onClick={stop} style={ghostButton(theme)} aria-label="Stop streaming">
            ■ Stop
          </button>
        )}
      </div>
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-atomic="false"
        style={{
          padding: 16,
          minHeight: 140,
          maxHeight: 240,
          overflowY: 'auto',
          borderRadius: 8,
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          color: theme.text,
          fontSize: 14,
          lineHeight: 1.65,
          whiteSpace: 'pre-wrap',
          fontFamily: 'inherit',
        }}
      >
        {text ? (
          <>
            {text}
            {running && (
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 16,
                  marginLeft: 2,
                  background: theme.primary,
                  verticalAlign: 'text-bottom',
                  animation: 'tkxBlink 1s steps(2) infinite',
                }}
                aria-hidden="true"
              />
            )}
          </>
        ) : (
          <span style={{ color: theme.textMuted, fontStyle: 'italic' }}>
            Press “Run agent” to start streaming.
          </span>
        )}
      </div>
    </div>
  );
}

// ── Tool-call demo ───────────────────────────────────────────────────────────

function ToolCallDemo({
  theme,
  middleware,
  isMobile,
}: {
  theme: ThemeTokens;
  middleware: Middleware;
  isMobile: boolean;
}) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [running, setRunning] = useState(false);

  const toolStart = events.find((e) => e.type === 'tool_call_start') as
    | { type: 'tool_call_start'; id: string; name: string }
    | undefined;
  const toolEnd = events.find((e) => e.type === 'tool_call_end') as
    | { type: 'tool_call_end'; id: string; input: unknown }
    | undefined;

  async function send() {
    setEvents([]);
    setRunning(true);
    await runReplay(TOOL_RECORDING, 'demo', (e) => setEvents((prev) => [...prev, e]), middleware);
    setRunning(false);
  }

  return (
    <div style={cardStyle(theme)}>
      <button
        onClick={send}
        disabled={running}
        style={{ ...primaryButton(theme, running), marginBottom: 14 }}
        aria-label="Run tool-calling agent demo"
      >
        {running ? '● Streaming…' : '▶ Run with tools'}
      </button>
      <div style={{ minHeight: 160 }}>
        {toolStart ? (
          <div
            style={{
              padding: 14,
              borderRadius: 8,
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              fontSize: isMobile ? 12 : 13,
            }}
          >
            <TkxToolCallCard
              name={toolStart.name}
              input={toolEnd?.input ?? '...'}
              output={toolEnd ? { temp: 72, conditions: 'sunny' } : undefined}
              status={toolEnd ? 'success' : 'running'}
            />
          </div>
        ) : (
          <p style={{ color: theme.textMuted, fontStyle: 'italic', margin: 0 }}>
            Tool call card appears when the agent invokes a tool.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Reasoning trace ──────────────────────────────────────────────────────────

function TraceDemo({
  theme,
  middleware,
}: {
  theme: ThemeTokens;
  middleware: Middleware;
}) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [running, setRunning] = useState(false);

  async function send() {
    setEvents([]);
    setRunning(true);
    await runReplay(TOOL_RECORDING, 'demo', (e) => setEvents((prev) => [...prev, e]), middleware);
    setRunning(false);
  }

  return (
    <div style={cardStyle(theme)}>
      <button
        onClick={send}
        disabled={running}
        style={{ ...primaryButton(theme, running), marginBottom: 14 }}
        aria-label="Run reasoning trace demo"
      >
        {running ? '● Streaming…' : '▶ Show trace'}
      </button>
      <div
        style={{
          padding: 14,
          minHeight: 160,
          borderRadius: 8,
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          color: theme.text,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 12,
          lineHeight: 1.8,
        }}
      >
        {events.length === 0 ? (
          <span style={{ color: theme.textMuted, fontStyle: 'italic', fontFamily: 'inherit' }}>
            Trace appears here.
          </span>
        ) : (
          <TkxReasoningTrace events={events} hideTextDeltas />
        )}
      </div>
    </div>
  );
}

// ── Ollama live section ──────────────────────────────────────────────────────

const OLLAMA_BASE = 'http://localhost:11434';

interface OllamaModel {
  name: string;
}

interface OllamaTagsResponse {
  models?: OllamaModel[];
}

type OllamaStatus = 'detecting' | 'ready' | 'no-models' | 'unreachable';

function OllamaSection({
  theme,
  middleware,
  isMobile,
}: {
  theme: ThemeTokens;
  middleware: Middleware;
  isMobile: boolean;
}) {
  const [status, setStatus] = useState<OllamaStatus>('detecting');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('What is the capital of France? Reply in one word.');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Detect Ollama on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${OLLAMA_BASE}/api/tags`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as OllamaTagsResponse;
        const names = (json.models ?? []).map((m) => m.name);
        if (cancelled) return;
        if (names.length === 0) {
          setStatus('no-models');
          return;
        }
        setModels(names);
        setSelectedModel(names[0]);
        setStatus('ready');
      } catch {
        if (cancelled) return;
        setStatus('unreachable');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function send() {
    if (!prompt.trim() || !selectedModel || running) return;
    setOutput('');
    setRunError(null);
    setRunning(true);
    const ctl = new AbortController();
    abortRef.current = ctl;
    try {
      const agent = createAgent({
        provider: new OllamaProvider({ endpoint: `${OLLAMA_BASE}/api/chat` }),
        model: selectedModel,
        middleware: [middleware],
        maxTokens: 256,
        temperature: 0.4,
      });
      let buf = '';
      for await (const evt of agent.run({ message: prompt, signal: ctl.signal })) {
        if (evt.type === 'text_delta') {
          buf += evt.text;
          setOutput(buf);
        } else if (evt.type === 'error') {
          throw evt.error;
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!ctl.signal.aborted) setRunError(msg);
    }
    setRunning(false);
    abortRef.current = null;
  }

  function stop() {
    abortRef.current?.abort();
  }

  // ── Status banner ──────────────────────────────────────────────────────────
  const banner = (() => {
    if (status === 'detecting') {
      return {
        color: theme.textMuted,
        bg: theme.surfaceAlt,
        text: 'Detecting Ollama at localhost:11434…',
      };
    }
    if (status === 'ready') {
      return {
        color: '#0a0a1a',
        bg: theme.primary,
        text: `✓ Connected · ${models.length} model${models.length === 1 ? '' : 's'} available`,
      };
    }
    if (status === 'no-models') {
      return {
        color: theme.text,
        bg: `${theme.warning ?? '#f9a826'}33`,
        text: 'Ollama is running but has no models. Run: ollama pull qwen2.5:1.5b',
      };
    }
    return {
      color: theme.text,
      bg: `${theme.danger ?? '#ff6b6b'}22`,
      text: 'Ollama not reachable. Is it running? CORS blocked? See setup below.',
    };
  })();

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: `1px solid ${theme.border}`,
    background: theme.bg,
    color: theme.text,
    fontSize: 14,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={cardStyle(theme, true)}>
      {/* Status banner */}
      <div
        role="status"
        aria-live="polite"
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          background: banner.bg,
          color: banner.color,
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 14,
          letterSpacing: '0.02em',
        }}
      >
        {banner.text}
      </div>

      {status === 'ready' && (
        <>
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 10,
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
            }}
          >
            <label
              htmlFor="ollama-model"
              style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600 }}
            >
              Model:
            </label>
            <select
              id="ollama-model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={running}
              style={{ ...inputStyle, width: isMobile ? '100%' : 'auto', flex: isMobile ? undefined : 1 }}
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 14,
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={running}
              aria-label="Prompt for Ollama"
              placeholder="Ask anything…"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="submit"
              disabled={running || !prompt.trim()}
              style={primaryButton(theme, running || !prompt.trim())}
            >
              {running ? '● Streaming…' : '▶ Send'}
            </button>
            {running && (
              <button type="button" onClick={stop} style={ghostButton(theme)}>
                ■ Stop
              </button>
            )}
          </form>

          <div
            role="log"
            aria-live="polite"
            style={{
              padding: 14,
              minHeight: 100,
              maxHeight: 260,
              overflowY: 'auto',
              borderRadius: 8,
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              color: theme.text,
              fontSize: 14,
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
            }}
          >
            {output ? (
              <>
                {output}
                {running && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 16,
                      marginLeft: 2,
                      background: theme.primary,
                      verticalAlign: 'text-bottom',
                      animation: 'tkxBlink 1s steps(2) infinite',
                    }}
                    aria-hidden="true"
                  />
                )}
              </>
            ) : (
              <span style={{ color: theme.textMuted, fontStyle: 'italic' }}>
                {running ? 'Waiting for first token…' : 'Output appears here.'}
              </span>
            )}
            {runError && (
              <p
                role="alert"
                style={{
                  color: theme.danger ?? '#ff6b6b',
                  marginTop: 12,
                  fontSize: 13,
                  marginBottom: 0,
                }}
              >
                Error: {runError}
              </p>
            )}
          </div>
        </>
      )}

      {(status === 'unreachable' || status === 'no-models') && (
        <div
          style={{
            padding: 14,
            borderRadius: 8,
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            fontSize: 13,
            lineHeight: 1.7,
            color: theme.text,
          }}
        >
          <strong style={{ display: 'block', marginBottom: 8 }}>Setup checklist:</strong>
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            <li>
              Install Ollama from{' '}
              <a
                href="https://ollama.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: theme.primary }}
              >
                ollama.com
              </a>
            </li>
            <li>
              Pull a small model:{' '}
              <code
                style={{
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: theme.surfaceAlt,
                  color: theme.primary,
                  fontSize: 12,
                }}
              >
                ollama pull qwen2.5:1.5b
              </code>
            </li>
            <li>
              Allow this origin (browser CORS):{' '}
              <code
                style={{
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: theme.surfaceAlt,
                  color: theme.primary,
                  fontSize: 12,
                  display: 'inline-block',
                  marginTop: 4,
                }}
              >
                OLLAMA_ORIGINS=http://localhost:5174 ollama serve
              </code>
            </li>
            <li>Reload this page.</li>
          </ol>
        </div>
      )}
    </div>
  );
}

// ── Code example ─────────────────────────────────────────────────────────────

function CodeBlock({ theme, code }: { theme: ThemeTokens; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch { /* ignore */ }
        }}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          padding: '4px 10px',
          fontSize: 11,
          borderRadius: 6,
          border: `1px solid ${theme.border}`,
          background: theme.surfaceAlt,
          color: copied ? theme.primary : theme.textMuted,
          cursor: 'pointer',
          fontWeight: 600,
        }}
        aria-label="Copy code"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
      <pre
        style={{
          margin: 0,
          padding: '16px 60px 16px 16px',
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          borderRadius: 10,
          overflow: 'auto',
          fontSize: 13,
          lineHeight: 1.6,
          color: theme.text,
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── Feature grid ─────────────────────────────────────────────────────────────

interface Feature {
  id: number;
  icon: string;
  name: string;
  module: string;
}
const FEATURES: Feature[] = [
  { id: 1, icon: '💰', name: 'Token usage + cost', module: 'createTokenUsageTracker' },
  { id: 2, icon: '🔁', name: 'Retry / backoff', module: 'withRetry' },
  { id: 3, icon: '⚡', name: 'Prompt cache', module: 'cacheable()' },
  { id: 4, icon: '🧬', name: 'Structured output', module: 'generateObject' },
  { id: 5, icon: '🧠', name: 'Memory strategies', module: 'Sliding/Summarizing/Vector' },
  { id: 6, icon: '🔌', name: 'MCP protocol', module: 'MCPClient + mcpTools' },
  { id: 7, icon: '🎯', name: 'Eval framework', module: 'runEval + judgeWithLLM' },
  { id: 8, icon: '⏹', name: 'Cancellable tools', module: 'cancellable()' },
  { id: 9, icon: '📊', name: 'OpenTelemetry', module: 'otelMiddleware' },
  { id: 10, icon: '🎨', name: 'UI components', module: 'TkxAgentMessage / TkxToolCallCard' },
  { id: 11, icon: '🛡', name: 'Guardrails', module: 'piiRedactor + injection detector' },
  { id: 12, icon: '🔬', name: 'Deep research', module: 'createDeepResearch' },
  { id: 13, icon: '⚛', name: 'Vue/Svelte/Solid', module: 'bindings/{vue,svelte,solid}' },
  { id: 14, icon: '🌐', name: 'Server runtime', module: 'createAgentRoute' },
  { id: 15, icon: '⏪', name: 'Replay', module: 'Recorder + ReplayProvider' },
  { id: 16, icon: '🔍', name: 'DevTools panel', module: 'DevToolsPanel' },
  { id: 17, icon: '🤝', name: 'A2A protocol', module: 'A2AClient + a2aTool' },
  { id: 18, icon: '🖼', name: 'Multimodal', module: 'imageBlock + cacheable' },
];

function FeatureGrid({ theme }: { theme: ThemeTokens }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 10,
      }}
    >
      {FEATURES.map((f) => (
        <div
          key={f.id}
          style={{
            ...cardStyle(theme),
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            transition: 'border-color 0.15s, transform 0.15s',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${theme.primary}66`;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.border;
            e.currentTarget.style.transform = '';
          }}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }} aria-hidden="true">
            {f.icon}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: theme.text,
                lineHeight: 1.3,
              }}
            >
              <span style={{ color: theme.primary, marginRight: 6 }}>#{f.id}</span>
              {f.name}
            </div>
            <code
              style={{
                fontSize: 11,
                color: theme.textMuted,
                display: 'block',
                marginTop: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={f.module}
            >
              {f.module}
            </code>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function AgentPage({ theme }: Props) {
  const { events, middleware, clear } = useEventCollector();
  const { isMobile, isTablet } = useViewport();

  const containerPadding = isMobile ? '20px 16px 32px' : '32px 0 48px';
  const sectionGap = isMobile ? 24 : 32;

  return (
    <div style={{ padding: containerPadding, maxWidth: 1200 }}>
      <style>{`
        @keyframes tkxBlink { 50% { opacity: 0; } }
      `}</style>

      <Hero theme={theme} isMobile={isMobile} />
      <StatBar theme={theme} isMobile={isMobile} />

      {/* Live demos — three cards in a row on desktop, stacked on mobile/tablet */}
      <section style={{ marginBottom: sectionGap }}>
        <SectionHeader
          theme={theme}
          num="1"
          title="Live demos"
          description="Powered by ReplayProvider — runs entirely in the browser, no API key needed."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile || isTablet ? '1fr' : 'repeat(3, minmax(0, 1fr))',
            gap: 14,
            marginTop: 16,
          }}
        >
          <StreamingDemo theme={theme} middleware={middleware} isMobile={isMobile} />
          <ToolCallDemo theme={theme} middleware={middleware} isMobile={isMobile} />
          <TraceDemo theme={theme} middleware={middleware} />
        </div>
      </section>

      {/* Live Ollama */}
      <section style={{ marginBottom: sectionGap }}>
        <SectionHeader
          theme={theme}
          num="2"
          title="Try it with your local Ollama"
          description="Hits http://localhost:11434 directly from this page. Set OLLAMA_ORIGINS=http://localhost:5174 if blocked by CORS."
        />
        <div style={{ marginTop: 16 }}>
          <OllamaSection theme={theme} middleware={middleware} isMobile={isMobile} />
        </div>
      </section>

      {/* Quick start code */}
      <section style={{ marginBottom: sectionGap }}>
        <SectionHeader
          theme={theme}
          num="3"
          title="Quick start"
          description="Wire any provider in three lines. Bring your own backend (or use the Ollama provider for local models)."
        />
        <div style={{ marginTop: 16 }}>
          <CodeBlock
            theme={theme}
            code={`import { createAgent, AnthropicProvider, useAgent } from 'tekivex-ui/agent';

const provider = new AnthropicProvider({ endpoint: '/api/anthropic' });
const agent = createAgent({ provider, model: 'claude-opus-4-7' });

// React
function Chat() {
  const { messages, streamingText, send } = useAgent({
    provider, model: 'claude-opus-4-7',
  });
  return <div>{streamingText}</div>;
}`}
          />
        </div>
      </section>

      {/* Feature matrix */}
      <section style={{ marginBottom: sectionGap }}>
        <SectionHeader
          theme={theme}
          num="4"
          title="What's in the box"
          description="18 capabilities — every one is a tree-shakeable sub-export. Pay only for what you import."
        />
        <div style={{ marginTop: 16 }}>
          <FeatureGrid theme={theme} />
        </div>
      </section>

      {/* Tool call example */}
      <section style={{ marginBottom: sectionGap }}>
        <SectionHeader
          theme={theme}
          num="5"
          title="Tools — typed, validated, cancellable"
          description="Define once with JSON Schema. The agent decides when to call. AbortSignal propagates end-to-end."
        />
        <div style={{ marginTop: 16 }}>
          <CodeBlock
            theme={theme}
            code={`import { defineTool, cancellable } from 'tekivex-ui/agent';

const fetchUrl = cancellable(defineTool<{ url: string }, string>({
  name: 'fetch_url',
  description: 'Fetches a URL and returns the body.',
  inputSchema: {
    type: 'object',
    properties: { url: { type: 'string' } },
    required: ['url'],
  },
  async execute({ url }, ctx) {
    const res = await fetch(url, { signal: ctx.signal });
    return await res.text();
  },
}));

const agent = createAgent({ provider, model, tools: [fetchUrl] });`}
          />
        </div>
      </section>

      {/* RAG + multi-agent */}
      <section style={{ marginBottom: sectionGap }}>
        <SectionHeader
          theme={theme}
          num="6"
          title="RAG and multi-agent — by composition"
          description="A Retriever becomes a tool. An Agent becomes a tool. The orchestrator does the rest."
        />
        <div style={{ marginTop: 16 }}>
          <CodeBlock
            theme={theme}
            code={`import { createAgent, retrievalTool, agentAsTool } from 'tekivex-ui/agent';

const researcher = createAgent({ provider, model, tools: [retrievalTool({ retriever })] });
const writer     = createAgent({ provider, model });

const orchestrator = createAgent({
  provider, model: 'claude-opus-4-7',
  system: 'Plan, delegate, synthesize.',
  tools: [
    agentAsTool({ name: 'researcher', description: 'Find facts.',  agent: researcher }),
    agentAsTool({ name: 'writer',     description: 'Write prose.', agent: writer }),
  ],
});`}
          />
        </div>
      </section>

      <DevToolsPanel
        events={events}
        onClear={clear}
        position={isMobile ? 'bottom-left' : 'bottom-right'}
        startOpen={false}
      />
    </div>
  );
}
