// ─────────────────────────────────────────────────────────────────────────────
// #15 · Record + replay — deterministic agent runs for tests / UI dev
// ─────────────────────────────────────────────────────────────────────────────

import {
  AnthropicProvider,
  Recorder,
  ReplayProvider,
  createAgent,
} from 'tekivex-ui/agent';
import * as fs from 'node:fs';

// ── Record once (with a real provider) ──────────────────────────────────────
async function record() {
  const recorder = new Recorder();
  const agent = createAgent({
    provider: new AnthropicProvider({ apiKey: process.env.ANTHROPIC_API_KEY }),
    model: 'claude-opus-4-7',
    middleware: [recorder.asMiddleware()],
  });
  for await (const _ of agent.run({ message: 'Tell me a joke' })) {
    /* drain */
  }
  fs.writeFileSync('fixtures/joke.jsonl', recorder.toJSONL());
}

// ── Replay (in tests or local UI dev — no API key required) ─────────────────
async function replay() {
  const recording = Recorder.fromJSONL(
    fs.readFileSync('fixtures/joke.jsonl', 'utf8'),
  );
  const agent = createAgent({
    provider: new ReplayProvider({ recording, delayMsBetweenEvents: 20 }),
    model: 'replay',
  });
  for await (const evt of agent.run({ message: 'anything' })) {
    if (evt.type === 'text_delta') process.stdout.write(evt.text);
  }
}

export { record, replay };
