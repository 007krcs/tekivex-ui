import { describe, expect, it } from 'vitest';
import { generateObject } from '../../src/agent/structured/generateObject';
import { delta, scriptedProvider, stop } from './_helpers';

describe('generateObject', () => {
  it('extracts naked JSON', async () => {
    const provider = scriptedProvider([[delta('{"name":"test","value":42}'), stop()]]);
    const obj = await generateObject<{ name: string; value: number }>({
      provider,
      model: 'test',
      schema: { type: 'object' },
      prompt: 'go',
    });
    expect(obj).toEqual({ name: 'test', value: 42 });
  });

  it('extracts fenced JSON', async () => {
    const provider = scriptedProvider([
      [delta('Here is the JSON:\n```json\n{"x":1}\n```'), stop()],
    ]);
    const obj = await generateObject<{ x: number }>({
      provider,
      model: 'test',
      schema: { type: 'object' },
      prompt: 'go',
    });
    expect(obj.x).toBe(1);
  });

  it('retries on invalid JSON', async () => {
    const provider = scriptedProvider([
      [delta('not json'), stop()],
      [delta('{"ok":true}'), stop()],
    ]);
    const obj = await generateObject<{ ok: boolean }>({
      provider,
      model: 'test',
      schema: { type: 'object' },
      prompt: 'go',
      maxRetries: 1,
    });
    expect(obj.ok).toBe(true);
  });

  it('throws StructuredOutputError after retries exhausted', async () => {
    const provider = scriptedProvider([
      [delta('garbage'), stop()],
      [delta('still bad'), stop()],
    ]);
    await expect(
      generateObject({
        provider,
        model: 'test',
        schema: { type: 'object' },
        prompt: 'go',
        maxRetries: 1,
      }),
    ).rejects.toThrow(/Failed to parse JSON/);
  });

  it('runs the parse adapter for validation', async () => {
    const provider = scriptedProvider([[delta('{"n":"5"}'), stop()]]);
    const obj = await generateObject<{ n: number }>({
      provider,
      model: 'test',
      schema: { type: 'object' },
      prompt: 'go',
      parse: (raw) => ({ n: Number((raw as { n: string }).n) }),
    });
    expect(obj.n).toBe(5);
  });
});
