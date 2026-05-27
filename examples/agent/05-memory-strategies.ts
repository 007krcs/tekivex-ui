// ─────────────────────────────────────────────────────────────────────────────
// #5 · Memory strategies — sliding window, summarizing, vector
// ─────────────────────────────────────────────────────────────────────────────

import {
  AnthropicProvider,
  createAgent,
  SlidingWindowMemory,
  SummarizingMemory,
  VectorMemory,
  type Message,
  type Retriever,
} from 'tekivex-ui/agent';

const provider = new AnthropicProvider({ endpoint: '/api/anthropic' });
const model = 'claude-opus-4-7';

// (a) Sliding window — only last 20 messages
const slidingAgent = createAgent({
  provider, model,
  memory: new SlidingWindowMemory(20),
});

// (b) Summarizing — collapse old turns via a cheap-model summarizer
async function summarize(msgs: Message[]): Promise<string> {
  let buf = '';
  for await (const evt of provider.stream({
    model: 'claude-haiku-4-5-20251001',
    messages: [{
      role: 'user',
      content: `Summarize this conversation in 3 bullet points:\n${
        msgs.map(m => `${m.role}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`).join('\n')
      }`,
    }],
    maxTokens: 200,
    temperature: 0,
  })) {
    if (evt.type === 'text_delta') buf += evt.text;
  }
  return buf;
}

const summarizingAgent = createAgent({
  provider, model,
  memory: new SummarizingMemory({ threshold: 30, keepRecent: 6, summarizer: summarize }),
});

// (c) Vector memory — long-term recall
const myVectorDB: Retriever = {
  async retrieve(query, { topK = 4 } = {}) {
    // call your pgvector / Pinecone / Weaviate here
    return [];
  },
};
const vectorAgent = createAgent({
  provider, model,
  memory: new VectorMemory({
    retriever: myVectorDB,
    keepRecent: 4,
    topK: 6,
    onAppend: async (m) => { /* upsert m to your DB */ },
  }),
});

export { slidingAgent, summarizingAgent, vectorAgent };
