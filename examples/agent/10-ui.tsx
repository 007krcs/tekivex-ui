// ─────────────────────────────────────────────────────────────────────────────
// #10 · UI components — agent message, tool-call card, reasoning trace
// ─────────────────────────────────────────────────────────────────────────────

import {
  AnthropicProvider,
  DevToolsPanel,
  TkxAgentMessage,
  TkxReasoningTrace,
  TkxToolCallCard,
  useAgent,
  useEventCollector,
} from 'tekivex-ui/agent';

const provider = new AnthropicProvider({ endpoint: '/api/anthropic' });

export function ChatWithTrace() {
  const { events, middleware, clear } = useEventCollector();
  const { messages, streamingText, isStreaming, send } = useAgent({
    provider,
    model: 'claude-opus-4-7',
    middleware: [middleware],
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
      <main>
        {messages.map((m, i) => (
          <TkxAgentMessage
            key={i}
            message={m}
            streamingText={i === messages.length - 1 ? streamingText : undefined}
            renderToolCall={(b) => (
              <TkxToolCallCard
                name={b.name}
                input={b.input}
                status="success"
              />
            )}
          />
        ))}
        <ChatInput onSend={send} disabled={isStreaming} />
      </main>
      <aside>
        <TkxReasoningTrace events={events} />
      </aside>
      <DevToolsPanel events={events} onClear={clear} startOpen />
    </div>
  );
}

function ChatInput({ onSend, disabled }: { onSend: (t: string) => void; disabled: boolean }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const v = String(fd.get('msg') ?? '');
        if (v) {
          onSend(v);
          e.currentTarget.reset();
        }
      }}
    >
      <input name="msg" disabled={disabled} placeholder="Ask…" />
    </form>
  );
}
