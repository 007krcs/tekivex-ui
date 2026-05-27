# `tekivex-ui/agent` — Agent runtime reference

A framework-free, runtime-free, provider-agnostic agent runtime built on **Ports & Adapters**.
Zero runtime dependencies. Tree-shakeable. Works in browser, Node, edge, Deno, Bun, React Native.

```
┌──────────────────────────────────────────────────────────┐
│ Bindings                                                  │
│   React useAgent · Vue · Svelte · Solid · vanilla        │
├──────────────────────────────────────────────────────────┤
│ Agent Core                                                │
│   Agent loop · Tool dispatch · Event stream              │
├──────────────────────────────────────────────────────────┤
│ Ports (interfaces)                                        │
│   Provider · Transport · Memory · Sanitizer · Middleware │
│   Retriever                                              │
├──────────────────────────────────────────────────────────┤
│ Adapters                                                  │
│   Anthropic · OpenAI · Gemini · Ollama · MCP · A2A       │
│   fetch · axios · RN · Tauri (Transport)                 │
│   InMemory · SlidingWindow · Summarizing · Vector        │
└──────────────────────────────────────────────────────────┘
```

---

## Quick start

```ts
import {
  createAgent, AnthropicProvider, defineTool, useAgent,
} from 'tekivex-ui/agent';

const provider = new AnthropicProvider({ endpoint: '/api/anthropic' });

const agent = createAgent({
  provider,
  model: 'claude-opus-4-7',
  system: 'You are a helpful assistant.',
});

// Node / server
for await (const evt of agent.run({ message: 'Hello' })) {
  if (evt.type === 'text_delta') process.stdout.write(evt.text);
}

// React
function Chat() {
  const { messages, streamingText, send } = useAgent({
    provider, model: 'claude-opus-4-7',
  });
  // wire into TkxChat
}
```

---

## Ports

| Port | File | Purpose |
|---|---|---|
| `Provider` | [core/Provider.ts](../src/agent/core/Provider.ts) | Model adapter. Yields normalized `StreamEvent`. |
| `Transport` | [core/Transport.ts](../src/agent/core/Transport.ts) | HTTP layer. Default = `fetchTransport`. |
| `Memory` | [core/Memory.ts](../src/agent/core/Memory.ts) | Conversation store. |
| `Sanitizer` | [core/Sanitizer.ts](../src/agent/core/Sanitizer.ts) | Output cleaning (XSS, profanity). |
| `Middleware` | [core/Middleware.ts](../src/agent/core/Middleware.ts) | HTTP + event hooks. |
| `Retriever` | [rag/Retriever.ts](../src/agent/rag/Retriever.ts) | Vector / search backend. |

---

## Providers

```ts
new AnthropicProvider({ endpoint, apiKey?, apiVersion?, transport? })
new OpenAIProvider({ endpoint, apiKey?, organization?, transport? })
new GeminiProvider({ endpoint, apiKey?, transport? })
new OllamaProvider({ endpoint, transport? })
```

All four implement `Provider.stream(opts: ChatOptions): AsyncIterable<StreamEvent>`.

**Never put `apiKey` in a browser bundle.** Use `endpoint` to point at your proxy.

---

## Feature index

| # | Feature | Module |
|---|---|---|
| 1 | Token usage + cost tracking | [middleware/tokenUsage](../src/agent/middleware/tokenUsage.ts) |
| 2 | Retry / backoff | [middleware/retry](../src/agent/middleware/retry.ts) |
| 3 | Prompt cache (Anthropic) | [content/helpers](../src/agent/content/helpers.ts) |
| 4 | Structured output | [structured/generateObject](../src/agent/structured/generateObject.ts) |
| 5 | Memory strategies | [memory/*](../src/agent/memory/) |
| 6 | MCP (Model Context Protocol) | [mcp/*](../src/agent/mcp/) |
| 7 | Eval framework | [eval/runEval](../src/agent/eval/runEval.ts) |
| 8 | Cancellable tools | [tools/cancellable](../src/agent/tools/cancellable.ts) |
| 9 | OpenTelemetry / observability | [middleware/otel](../src/agent/middleware/otel.ts) |
| 10 | UI components | [components/*](../src/agent/components/) |
| 11 | Guardrails (PII, prompt injection) | [middleware/guardrails](../src/agent/middleware/guardrails.ts) |
| 12 | Deep research | [research/DeepResearch](../src/agent/research/DeepResearch.ts) |
| 13 | Vue / Svelte / Solid bindings | [bindings/*](../src/agent/bindings/) |
| 14 | Server runtime (Next/Hono/edge) | [server/*](../src/agent/server/) |
| 15 | Replay / time-travel | [replay/*](../src/agent/replay/) |
| 16 | DevTools panel | [devtools/*](../src/agent/devtools/) |
| 17 | A2A (Agent-to-Agent) | [a2a/*](../src/agent/a2a/) |
| 18 | Multimodal content helpers | [content/helpers](../src/agent/content/helpers.ts) |

---

## 1 · Token usage + cost

```ts
import { createTokenUsageTracker } from 'tekivex-ui/agent';

const tracker = createTokenUsageTracker({
  model: 'claude-opus-4-7',
  pricing: {
    'claude-opus-4-7': { inputPerMillion: 15, outputPerMillion: 75 },
  },
  onUpdate: (totals) => console.log('Cost so far:', totals.totalCostUSD),
});

const agent = createAgent({
  provider, model: 'claude-opus-4-7',
  middleware: [tracker.middleware],
});

await runOnce(agent);
console.log(tracker.totals());  // { inputTokens, outputTokens, totalCostUSD, byModel }
```

## 2 · Retry / backoff

```ts
import { withRetry, fetchTransport, AnthropicProvider } from 'tekivex-ui/agent';

const transport = withRetry(fetchTransport, {
  maxRetries: 3, initialDelayMs: 500, factor: 2, jitter: true,
});
const provider = new AnthropicProvider({ endpoint: '/api/anthropic', transport });
```

Retries on 429 + 5xx by default. Customize via `retryOn(res)` / `retryOnError(err)`.

## 3 · Prompt cache

```ts
import { cacheable, createAgent, AnthropicProvider } from 'tekivex-ui/agent';

const agent = createAgent({
  provider, model: 'claude-opus-4-7',
  system: 'You are helpful.',
  // Pass long context as cached content blocks in the user message:
});

// In your message construction:
await agent.run({
  message: 'Summarize this',
  // Or build messages directly:
});
```

To cache a large context block, send it as a content block with `cacheControl`:

```ts
import { cacheable } from 'tekivex-ui/agent';
// messages: [{ role: 'user', content: [cacheable(longDocument), { type: 'text', text: question }] }]
```

Anthropic provider passes `cache_control` through. Other providers ignore it silently.

## 4 · Structured output

```ts
import { generateObject } from 'tekivex-ui/agent';

const result = await generateObject<{ city: string; days: number }>({
  provider, model: 'claude-opus-4-7',
  schema: {
    type: 'object',
    properties: { city: { type: 'string' }, days: { type: 'integer' } },
    required: ['city', 'days'],
  },
  prompt: 'Plan a 3-day trip to Tokyo.',
});
```

Auto-retries on parse failure. Bring your own validator via `parse?(raw) => T` (Zod, Valibot, ...).

## 5 · Memory strategies

```ts
import { SlidingWindowMemory, SummarizingMemory, VectorMemory } from 'tekivex-ui/agent';

// (a) Last N messages
const memory = new SlidingWindowMemory(20);

// (b) Auto-summarize old turns
const memory = new SummarizingMemory({
  threshold: 30,
  keepRecent: 6,
  summarizer: async (msgs) => {
    // call a cheap model to summarize
    return 'Earlier: user asked X, agent answered Y...';
  },
});

// (c) Long-term recall via vector DB
const memory = new VectorMemory({
  retriever: myVectorDB,
  keepRecent: 4,
  topK: 6,
  onAppend: async (m) => await myVectorDB.upsert(m),
});
```

## 6 · MCP (Model Context Protocol)

```ts
import { MCPClient, mcpTools, createAgent } from 'tekivex-ui/agent';

const mcp = new MCPClient({ endpoint: 'https://my-mcp-server/jsonrpc' });
const tools = await mcpTools(mcp);

const agent = createAgent({ provider, model: 'claude-opus-4-7', tools });
```

One adapter call gives the agent every tool the MCP server exposes.

## 7 · Eval framework

```ts
import { runEval, judgeWithLLM } from 'tekivex-ui/agent';

const summary = await runEval(agent, [
  { name: 'capital', input: 'Capital of France?', expected: 'Paris' },
  { name: 'math', input: 'What is 17 * 19?', expected: '323' },
  {
    name: 'tone',
    input: 'Explain quantum entanglement to a 10-year-old',
    judge: judgeWithLLM(provider, 'claude-haiku-4-5-20251001',
      'Answer must be accurate AND child-friendly.'),
  },
]);

console.log(`${summary.passed}/${summary.total} (${(summary.passRate * 100).toFixed(0)}%)`);
```

## 8 · Cancellable tools

```ts
import { cancellable, defineTool } from 'tekivex-ui/agent';

const slowTool = cancellable(defineTool({
  name: 'fetch_data',
  description: 'Hits a slow API.',
  inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
  async execute({ url }, ctx) {
    const res = await fetch(url, { signal: ctx.signal });
    return await res.text();
  },
}));
```

`AbortSignal` propagates from `useAgent.stop()` → `agent.run` → `provider.stream` → `tool.execute`.

## 9 · OpenTelemetry / observability

```ts
import { otelMiddleware } from 'tekivex-ui/agent';

const otel = otelMiddleware({
  serviceName: 'my-app',
  sink: {
    spanStart(name, attrs) {
      const span = tracer.startSpan(name, { attributes: attrs });
      return { end: (a) => { if (a) span.setAttributes(a); span.end(); } };
    },
    event(name, attrs) {
      tracer.getActiveSpan()?.addEvent(name, attrs);
    },
  },
});

const agent = createAgent({ provider, model, middleware: [otel] });
```

Spans per step + per tool call; events for HTTP + message_stop + errors.

## 10 · UI components

```tsx
import { TkxAgentMessage, TkxToolCallCard, TkxReasoningTrace } from 'tekivex-ui/agent';

<TkxAgentMessage
  message={msg}
  streamingText={streamingText}
  renderToolCall={(b) => <TkxToolCallCard name={b.name} input={b.input} status="success" />}
/>

<TkxReasoningTrace events={events} />
```

WAI-ARIA roles are set; you bring the styling (or use `tekivex-ui` theme tokens).

## 11 · Guardrails

```ts
import { guardrailsMiddleware, piiRedactor, promptInjectionDetector, checkGuardrails } from 'tekivex-ui/agent';

const guardrails = [piiRedactor, promptInjectionDetector];

const agent = createAgent({
  provider, model,
  middleware: [guardrailsMiddleware(guardrails)],  // silently redacts inputs
});

// For outputs, check explicitly during render:
const verdict = await checkGuardrails(streamingText, guardrails, 'output');
if (!verdict.allow) showBlockedMessage(verdict.reason);
```

Built-ins: `piiRedactor` (SSN / credit-card / email), `promptInjectionDetector` (common jailbreak patterns).

## 12 · Deep research

```ts
import { createDeepResearch } from 'tekivex-ui/agent';

const dr = createDeepResearch({
  provider, model: 'claude-opus-4-7',
  retriever: myKnowledgeBase,
  maxSubtasks: 5,
  concurrency: 3,
});

const result = await dr.run('Compare GraphQL Federation vs Apollo Router for an e-commerce SaaS');
console.log(result.synthesis);
// result.plan         — generated sub-questions
// result.subFindings  — per-sub-task findings
// result.synthesis    — final answer
```

Three steps: plan (structured output) → parallel sub-agents → synthesizer.

## 13 · Vue / Svelte / Solid

```ts
// Vue
import { ref, onScopeDispose } from 'vue';
import { createUseAgentVue } from 'tekivex-ui/agent';
const useAgent = createUseAgentVue({ shallowRef: ref, onScopeDispose });

// Svelte
import { createAgentStore } from 'tekivex-ui/agent';
const agent = createAgentStore({ provider, model });
// $agent in template

// Solid
import { createSignal, onCleanup } from 'solid-js';
import { createUseAgentSolid } from 'tekivex-ui/agent';
const useAgent = createUseAgentSolid({ createSignal, onCleanup });
```

All bindings wrap the same `createAgentController` (framework-free) so behavior matches React.

## 14 · Server runtime

```ts
// app/api/agent/route.ts (Next.js)
import { createAgentRoute, AnthropicProvider, createAgent } from 'tekivex-ui/agent';

export const POST = createAgentRoute({
  agent: async () => ({
    provider: new AnthropicProvider({ apiKey: process.env.ANTHROPIC_API_KEY }),
    model: 'claude-opus-4-7',
  }),
});
```

```ts
// Browser side
import { createAgentClient } from 'tekivex-ui/agent';

const client = createAgentClient({ endpoint: '/api/agent' });
for await (const evt of client.run('Hello')) {
  if (evt.type === 'text_delta') console.log(evt.text);
}
```

Works on Next.js route handlers, Hono, Cloudflare Workers, Bun, Deno Deploy — anywhere `(Request) => Response` is the contract.

## 15 · Replay / time-travel

```ts
import { Recorder, ReplayProvider, createAgent } from 'tekivex-ui/agent';

// 1. Record
const recorder = new Recorder();
const agent = createAgent({ provider, model, middleware: [recorder.asMiddleware()] });
for await (const _ of agent.run({ message: 'Hi' })) {}
const jsonl = recorder.toJSONL();
fs.writeFileSync('fixture.jsonl', jsonl);

// 2. Replay (e.g., in tests or local UI dev)
const recording = Recorder.fromJSONL(fs.readFileSync('fixture.jsonl', 'utf8'));
const replayAgent = createAgent({
  provider: new ReplayProvider({ recording, delayMsBetweenEvents: 20 }),
  model: 'replay',
});
```

## 16 · DevTools panel

```tsx
import { useAgent, useEventCollector, DevToolsPanel } from 'tekivex-ui/agent';

function App() {
  const { events, middleware, clear } = useEventCollector();
  const { send } = useAgent({ provider, model, middleware: [middleware] });
  return (
    <>
      <ChatUI onSend={send} />
      {import.meta.env.DEV && <DevToolsPanel events={events} onClear={clear} />}
    </>
  );
}
```

Floating panel: filter events by type, see live token counts, inspect tool calls.

## 17 · A2A (Agent-to-Agent)

```ts
// Client side: call a remote agent as a tool
import { A2AClient, a2aTool, createAgent } from 'tekivex-ui/agent';

const remote = new A2AClient({ endpoint: 'https://partner.example/agent' });
const agent = createAgent({
  provider, model,
  tools: [a2aTool({ name: 'partner_lookup', description: '...', client: remote })],
});

// Server side: expose YOUR agent as A2A
import { createA2ARoute, AnthropicProvider } from 'tekivex-ui/agent';
export const POST = createA2ARoute({
  agent: async () => ({ provider, model: 'claude-opus-4-7' }),
});
```

## 18 · Multimodal helpers

```ts
import { textBlock, imageBlock, toolUseBlock, toolResultBlock, cacheable } from 'tekivex-ui/agent';

const message = {
  role: 'user' as const,
  content: [
    textBlock('What is in this image?'),
    imageBlock({ url: 'https://example.com/cat.jpg' }),
    cacheable(longDocument),  // marks for prompt cache (Anthropic)
  ],
};
```

---

## Composition recipes

### Multi-agent (orchestrator + specialists)

```ts
import { createAgent, agentAsTool } from 'tekivex-ui/agent';

const researcher = createAgent({ provider, model: 'claude-sonnet-4-6', tools: [retrievalTool(...)] });
const writer     = createAgent({ provider, model: 'claude-sonnet-4-6' });

const orchestrator = createAgent({
  provider, model: 'claude-opus-4-7',
  system: 'Delegate research, then prose, then synthesize.',
  tools: [
    agentAsTool({ name: 'researcher', description: 'Find facts.', agent: researcher }),
    agentAsTool({ name: 'writer',     description: 'Write prose.', agent: writer }),
  ],
});
```

### Agentic RAG

```ts
import { retrievalTool, createAgent } from 'tekivex-ui/agent';

const agent = createAgent({
  provider, model,
  tools: [retrievalTool({ retriever: myVectorDB, topK: 4 })],
  system: 'When the user asks about stored content, call search_knowledge.',
});
```

### Forced RAG (always retrieve)

```ts
const docs = await myVectorDB.retrieve(userQuery, { topK: 4 });
const context = docs.map((d, i) => `[${i + 1}] ${d.text}`).join('\n\n');
const agent = createAgent({
  provider, model,
  system: `Use this context to answer:\n${context}`,
});
await agent.run({ message: userQuery });
```

---

## Type reference (excerpt)

```ts
interface Provider {
  readonly name: string;
  stream(opts: ChatOptions): AsyncIterable<StreamEvent>;
}

type StreamEvent =
  | { type: 'text_delta'; text: string }
  | { type: 'tool_call_start'; id: string; name: string }
  | { type: 'tool_call_delta'; id: string; argsDelta: string }
  | { type: 'tool_call_end'; id: string; input: unknown }
  | { type: 'message_stop'; reason: StopReason; usage?: Usage }
  | { type: 'error'; error: Error };

type AgentEvent =
  | StreamEvent
  | { type: 'step_start'; step: number }
  | { type: 'tool_result'; id: string; name: string; output: unknown }
  | { type: 'tool_error'; id: string; name: string; error: Error }
  | { type: 'done'; reason: StopReason };
```
