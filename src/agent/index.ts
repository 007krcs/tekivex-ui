// ══════════════════════════════════════════════════════════════════════════════
// tekivex-ui/agent — Public surface.
// Ports & Adapters: Provider · Transport · Memory · Sanitizer · Middleware · Retriever.
// ══════════════════════════════════════════════════════════════════════════════

// — Core —
export * from './core/types';
export * from './core/Provider';
export * from './core/Tool';
export * from './core/Memory';
export * from './core/Transport';
export * from './core/Middleware';
export * from './core/Sanitizer';
export * from './core/events';
export * from './core/sse';
export * from './core/Agent';

// — Providers —
export { AnthropicProvider } from './providers/anthropic';
export type { AnthropicProviderOptions } from './providers/anthropic';
export { OpenAIProvider } from './providers/openai';
export type { OpenAIProviderOptions } from './providers/openai';
export { GeminiProvider } from './providers/gemini';
export type { GeminiProviderOptions } from './providers/gemini';
export { OllamaProvider } from './providers/ollama';
export type { OllamaProviderOptions } from './providers/ollama';

// — RAG —
export * from './rag/Retriever';
export * from './rag/retrievalTool';

// — Multi-agent —
export * from './multi/agentAsTool';

// — Middleware (1, 2, 9, 11) —
export * from './middleware/tokenUsage';
export * from './middleware/retry';
export * from './middleware/otel';
export * from './middleware/guardrails';

// — Memory strategies (5) —
export * from './memory/SlidingWindowMemory';
export * from './memory/SummarizingMemory';
export * from './memory/VectorMemory';

// — Structured output (4) —
export * from './structured/generateObject';

// — Content helpers (3, 18) —
export * from './content/helpers';

// — MCP (6) —
export * from './mcp/MCPClient';
export * from './mcp/mcpAdapter';

// — Eval (7) —
export * from './eval/runEval';

// — Cancellable tools (8) —
export * from './tools/cancellable';

// — UI components (10) —
export * from './components/TkxAgentMessage';
export * from './components/TkxToolCallCard';
export * from './components/TkxReasoningTrace';

// — Deep research (12) —
export * from './research/DeepResearch';
export * from './research/citations';

// — Bindings (13) —
export * from './bindings/vanilla';
export * from './bindings/vue';
export * from './bindings/svelte';
export * from './bindings/solid';

// — Server (14) —
export * from './server/createAgentRoute';
export * from './server/createAgentClient';

// — Replay (15) —
export * from './replay/recorder';
export * from './replay/ReplayProvider';

// — DevTools (16) —
export * from './devtools/DevToolsPanel';
export * from './devtools/useEventCollector';

// — A2A (17) —
export * from './a2a/A2AClient';
export * from './a2a/a2aTool';
export * from './a2a/createA2ARoute';

// — React binding —
export { useAgent } from './react/useAgent';
export type { UseAgentReturn } from './react/useAgent';
