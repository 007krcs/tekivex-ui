// ─────────────────────────────────────────────────────────────────────────────
// #12 · Deep research — plan → parallel sub-agents → synthesis
// ─────────────────────────────────────────────────────────────────────────────

import {
  AnthropicProvider,
  createDeepResearch,
  type Retriever,
} from 'tekivex-ui/agent';

const knowledgeBase: Retriever = {
  async retrieve(query, { topK = 4 } = {}) {
    // your vector DB
    return [
      { text: 'GraphQL Federation v2 supports entities across subgraphs.', score: 0.91 },
      { text: 'Apollo Router is written in Rust for low latency.', score: 0.88 },
    ];
  },
};

const dr = createDeepResearch({
  provider: new AnthropicProvider({ endpoint: '/api/anthropic' }),
  model: 'claude-opus-4-7',
  retriever: knowledgeBase,
  maxSubtasks: 5,
  concurrency: 3,
});

async function main() {
  const result = await dr.run(
    'Compare GraphQL Federation vs Apollo Router for an e-commerce SaaS',
  );

  console.log('Plan:');
  for (const st of result.plan.subtasks) console.log(`  [${st.id}] ${st.question}`);

  console.log('\nFindings:');
  for (const f of result.subFindings) {
    console.log(`\n--- [${f.id}] ${f.question}`);
    console.log(f.error ? `Error: ${f.error}` : f.findings.slice(0, 200) + '...');
  }

  console.log('\nFinal synthesis:\n', result.synthesis);
}

main();
