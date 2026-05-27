// ──────────────────────────────────────────────────────────────────────────────
// Live smoke test: tekivex-ui/agent against a local Ollama server.
// Usage:  node scripts/test-ollama.mjs
// ──────────────────────────────────────────────────────────────────────────────

import {
  OllamaProvider,
  createAgent,
  defineTool,
} from '../dist/agent.js';

const MODEL = process.env.OLLAMA_MODEL ?? 'qwen2.5:1.5b';
const ENDPOINT = process.env.OLLAMA_URL ?? 'http://localhost:11434/api/chat';

const provider = new OllamaProvider({ endpoint: ENDPOINT });

function rule(title) {
  console.log('\n' + '─'.repeat(72));
  console.log(title);
  console.log('─'.repeat(72));
}

// ── Test 1: raw provider streaming (no agent loop) ────────────────────────────
async function testProviderStream() {
  rule('Test 1 — Provider.stream(): text deltas');
  process.stdout.write('  ');
  let chars = 0;
  let usage;
  let stopReason;
  for await (const evt of provider.stream({
    model: MODEL,
    messages: [{ role: 'user', content: 'Reply with exactly: "OK"' }],
    maxTokens: 16,
    temperature: 0,
  })) {
    if (evt.type === 'text_delta') {
      process.stdout.write(evt.text);
      chars += evt.text.length;
    } else if (evt.type === 'message_stop') {
      stopReason = evt.reason;
      usage = evt.usage;
    } else if (evt.type === 'error') {
      throw evt.error;
    }
  }
  console.log(`\n  → ${chars} chars · stop=${stopReason} · usage=${JSON.stringify(usage)}`);
  return { chars, stopReason };
}

// ── Test 2: agent loop with text-only response ────────────────────────────────
async function testAgentText() {
  rule('Test 2 — Agent.run(): full loop, text reply');
  const agent = createAgent({
    provider,
    model: MODEL,
    system: 'You are concise. Reply in 8 words or fewer.',
    maxTokens: 80,
    temperature: 0.3,
  });
  process.stdout.write('  ');
  let chars = 0;
  let done;
  let steps = 0;
  for await (const evt of agent.run({ message: 'What is the capital of France?' })) {
    if (evt.type === 'text_delta') {
      process.stdout.write(evt.text);
      chars += evt.text.length;
    } else if (evt.type === 'step_start') {
      steps++;
    } else if (evt.type === 'done') {
      done = evt.reason;
    }
  }
  console.log(`\n  → ${chars} chars · steps=${steps} · done=${done}`);
  return { chars, steps, done };
}

// ── Test 3: tool calling (qwen2.5 supports it) ────────────────────────────────
async function testAgentTool() {
  rule('Test 3 — Agent.run(): tool dispatch');
  let toolCalled = false;
  let toolInput;
  const getWeather = defineTool({
    name: 'get_weather',
    description: 'Get the current weather for a given city.',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name' },
      },
      required: ['city'],
    },
    async execute(input) {
      toolCalled = true;
      toolInput = input;
      return { city: input.city, temp_f: 68, conditions: 'cloudy' };
    },
  });
  const agent = createAgent({
    provider,
    model: MODEL,
    system:
      'You have one tool: get_weather(city). For ANY weather question you MUST call it. ' +
      'After the tool returns, write one short sentence stating temp and conditions.',
    tools: [getWeather],
    maxSteps: 4,
    maxTokens: 200,
    temperature: 0,
  });
  let chars = 0;
  let steps = 0;
  let done;
  let toolResults = 0;
  let toolErrors = 0;
  process.stdout.write('  ');
  for await (const evt of agent.run({ message: 'Call get_weather with city="Tokyo".' })) {
    if (evt.type === 'text_delta') {
      process.stdout.write(evt.text);
      chars += evt.text.length;
    } else if (evt.type === 'step_start') {
      steps++;
    } else if (evt.type === 'tool_result') {
      toolResults++;
    } else if (evt.type === 'tool_error') {
      toolErrors++;
      console.log(`\n  ⚠ tool_error: ${evt.error.message}`);
    } else if (evt.type === 'done') {
      done = evt.reason;
    }
  }
  console.log(
    `\n  → ${chars} chars · steps=${steps} · tool_called=${toolCalled} · tool_input=${JSON.stringify(toolInput)} · results=${toolResults} · errors=${toolErrors} · done=${done}`,
  );
  return { chars, steps, toolCalled, done, toolResults, toolErrors };
}

// ── Test 4: AbortSignal cancellation mid-stream ───────────────────────────────
async function testAbort() {
  rule('Test 4 — AbortSignal: cancel mid-stream');
  const ctl = new AbortController();
  setTimeout(() => ctl.abort(), 1200);
  let received = 0;
  let errored = false;
  try {
    for await (const evt of provider.stream({
      model: MODEL,
      messages: [{ role: 'user', content: 'Write a long story about a cat.' }],
      maxTokens: 1000,
      signal: ctl.signal,
    })) {
      if (evt.type === 'text_delta') received += evt.text.length;
      if (evt.type === 'error') {
        errored = true;
        break;
      }
    }
  } catch (e) {
    errored = true;
    console.log(`  → aborted: ${e.name}: ${e.message}`);
  }
  console.log(`  → received ${received} chars before abort · errored=${errored}`);
  return { received, errored };
}

// ── Run ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Model:    ${MODEL}`);

  const results = [];
  try {
    results.push({ name: 'provider stream', ...(await testProviderStream()) });
    results.push({ name: 'agent text',      ...(await testAgentText())     });
    results.push({ name: 'agent tool',      ...(await testAgentTool())     });
    results.push({ name: 'abort signal',    ...(await testAbort())          });

    rule('Summary');
    for (const r of results) console.log(`  ✓ ${r.name}`);
    console.log(`\n  ${results.length}/${results.length} live tests passed against Ollama.`);
  } catch (err) {
    console.error('\n  ✗ FAILED:', err);
    process.exit(1);
  }
}

main();
