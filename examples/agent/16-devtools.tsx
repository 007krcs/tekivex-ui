// ─────────────────────────────────────────────────────────────────────────────
// #16 · DevTools panel — floating live event inspector
// ─────────────────────────────────────────────────────────────────────────────

import {
  AnthropicProvider,
  DevToolsPanel,
  useAgent,
  useEventCollector,
} from 'tekivex-ui/agent';

const provider = new AnthropicProvider({ endpoint: '/api/agent' });

export function App() {
  const { events, middleware, clear } = useEventCollector();
  const { messages, streamingText, send } = useAgent({
    provider,
    model: 'claude-opus-4-7',
    middleware: [middleware],
  });

  return (
    <>
      <ChatUI messages={messages} streamingText={streamingText} onSend={send} />

      {/* Drop the panel anywhere — fixed-positioned, dev-only */}
      {import.meta.env.DEV && (
        <DevToolsPanel
          events={events}
          onClear={clear}
          position="bottom-right"
          startOpen={false}
        />
      )}
    </>
  );
}

function ChatUI(_: { messages: unknown; streamingText: string; onSend: (s: string) => void }) {
  return null;
}
