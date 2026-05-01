import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  issueMath,
  verifyMath,
  issueSlider,
  verifySlider,
  issueImageGrid,
  verifyImageGrid,
  CaptchaIssuer,
  createMemoryChallengeStore,
  signChallenge,
  verifySignedChallenge,
  verifySignedSolution,
  type ImageGridItem,
} from '../src/engine/captcha';

describe('engine/captcha — math', () => {
  it('issues a valid challenge with a question and answer', () => {
    const { challenge, answer } = issueMath();
    expect(challenge.type).toBe('math');
    expect(challenge.question).toMatch(/\d+ [+\-×] \d+/);
    expect(typeof answer).toBe('number');
    expect(challenge.expiresAt).toBeGreaterThan(challenge.issuedAt);
  });

  it('verifies correct answer', () => {
    const { challenge, answer } = issueMath();
    expect(verifyMath(challenge, answer, answer).ok).toBe(true);
  });

  it('rejects wrong answer', () => {
    const { challenge, answer } = issueMath();
    expect(verifyMath(challenge, answer, answer + 1).ok).toBe(false);
  });

  it('rejects malformed (string) answer', () => {
    const { challenge, answer } = issueMath();
    const r = verifyMath(challenge, answer, '5' as unknown);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('malformed');
  });

  it('rejects expired challenge', () => {
    const { challenge, answer } = issueMath({ ttlMs: 1 });
    vi.useFakeTimers();
    vi.advanceTimersByTime(10);
    const r = verifyMath(challenge, answer, answer);
    vi.useRealTimers();
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('expired');
  });

  it('respects ops option', () => {
    for (let i = 0; i < 30; i++) {
      const { challenge } = issueMath({ ops: ['+'] });
      expect(challenge.question).toContain('+');
    }
  });

  it('avoids negative results for subtraction', () => {
    for (let i = 0; i < 50; i++) {
      const { answer } = issueMath({ ops: ['-'] });
      expect(answer).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('engine/captcha — slider', () => {
  it('issues a challenge with target inside edge margin', () => {
    const c = issueSlider({ trackWidth: 200, edgeMargin: 20 });
    expect(c.target).toBeGreaterThanOrEqual(20);
    expect(c.target).toBeLessThanOrEqual(180);
  });

  it('accepts position within tolerance', () => {
    const c = issueSlider({ tolerance: 5 });
    expect(verifySlider(c, c.target).ok).toBe(true);
    expect(verifySlider(c, c.target + 5).ok).toBe(true);
    expect(verifySlider(c, c.target - 5).ok).toBe(true);
  });

  it('rejects position outside tolerance', () => {
    const c = issueSlider({ tolerance: 5 });
    expect(verifySlider(c, c.target + 6).ok).toBe(false);
  });

  it('rejects non-numeric submission', () => {
    const c = issueSlider();
    const r = verifySlider(c, 'abc' as unknown);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('malformed');
  });
});

describe('engine/captcha — image-grid', () => {
  const makePool = (): ImageGridItem[] => [
    { id: '1', label: 'cat', correct: true },
    { id: '2', label: 'cat', correct: true },
    { id: '3', label: 'cat', correct: true },
    { id: '4', label: 'cat', correct: true },
    { id: '5', label: 'dog', correct: false },
    { id: '6', label: 'dog', correct: false },
    { id: '7', label: 'dog', correct: false },
    { id: '8', label: 'dog', correct: false },
    { id: '9', label: 'dog', correct: false },
    { id: '10', label: 'dog', correct: false },
  ];

  it('issues a 9-item grid with 3 correct', () => {
    const { challenge, expected } = issueImageGrid({
      prompt: 'Select all cats',
      pool: makePool(),
    });
    expect(challenge.items).toHaveLength(9);
    expect(expected).toHaveLength(3);
    expect(challenge.requiredCount).toBe(3);
  });

  it('verifies correct selection', () => {
    const { challenge, expected } = issueImageGrid({
      prompt: 'cats',
      pool: makePool(),
    });
    expect(verifyImageGrid(challenge, expected, [...expected]).ok).toBe(true);
  });

  it('verifies correct selection in any order', () => {
    const { challenge, expected } = issueImageGrid({
      prompt: 'cats',
      pool: makePool(),
    });
    const reversed = [...expected].reverse();
    expect(verifyImageGrid(challenge, expected, reversed).ok).toBe(true);
  });

  it('rejects wrong count', () => {
    const { challenge, expected } = issueImageGrid({
      prompt: 'cats',
      pool: makePool(),
    });
    expect(verifyImageGrid(challenge, expected, expected.slice(0, 2)).ok).toBe(false);
  });

  it('rejects wrong ids', () => {
    const { challenge, expected } = issueImageGrid({
      prompt: 'cats',
      pool: makePool(),
    });
    expect(verifyImageGrid(challenge, expected, ['5', '6', '7']).ok).toBe(false);
  });

  it('throws when pool has too few correct items', () => {
    expect(() =>
      issueImageGrid({
        prompt: 'cats',
        pool: [
          { id: '1', label: 'cat', correct: true },
          { id: '2', label: 'dog', correct: false },
          { id: '3', label: 'dog', correct: false },
          { id: '4', label: 'dog', correct: false },
          { id: '5', label: 'dog', correct: false },
          { id: '6', label: 'dog', correct: false },
          { id: '7', label: 'dog', correct: false },
          { id: '8', label: 'dog', correct: false },
          { id: '9', label: 'dog', correct: false },
        ],
      }),
    ).toThrow();
  });
});

describe('engine/captcha — CaptchaIssuer (stateful)', () => {
  let issuer: CaptchaIssuer;
  beforeEach(() => {
    issuer = new CaptchaIssuer();
  });

  it('issues and verifies a math challenge', () => {
    const c = issuer.issueMath();
    // We don't have the answer publicly — solve from question.
    const [a, op, b] = c.question.split(' ');
    const ans = op === '+' ? +a + +b : op === '-' ? +a - +b : +a * +b;
    expect(issuer.verify(c, ans).ok).toBe(true);
  });

  it('single-use: second verify fails as unknown', () => {
    const c = issuer.issueMath();
    const [a, op, b] = c.question.split(' ');
    const ans = op === '+' ? +a + +b : op === '-' ? +a - +b : +a * +b;
    expect(issuer.verify(c, ans).ok).toBe(true);
    const second = issuer.verify(c, ans);
    expect(second.ok).toBe(false);
    expect(second.reason).toBe('unknown');
  });

  it('issues and verifies a slider challenge', () => {
    const c = issuer.issueSlider();
    expect(issuer.verify(c, c.target).ok).toBe(true);
  });

  it('memory store prunes expired entries', () => {
    const store = createMemoryChallengeStore();
    store.put('a', 1, Date.now() - 1000);
    store.put('b', 2, Date.now() + 60_000);
    expect(store.take('a')).toBeUndefined();
    expect(store.take('b')).toBeDefined();
  });
});

describe('engine/captcha — stateless signed mode', () => {
  const SECRET = 'shubhbio-test-secret-do-not-use-in-prod';

  it('signs and verifies a math challenge', async () => {
    const { challenge, answer } = issueMath();
    const sig = await signChallenge(challenge, answer, SECRET);
    expect(sig).toMatch(/^[0-9a-f]+$/);
    const ok = await verifySignedChallenge(challenge, answer, sig, SECRET);
    expect(ok).toBe(true);
  });

  it('rejects wrong signature', async () => {
    const { challenge, answer } = issueMath();
    const sig = await signChallenge(challenge, answer, SECRET);
    const tampered = sig.slice(0, -2) + '00';
    const ok = await verifySignedChallenge(challenge, answer, tampered, SECRET);
    expect(ok).toBe(false);
  });

  it('rejects wrong secret', async () => {
    const { challenge, answer } = issueMath();
    const sig = await signChallenge(challenge, answer, SECRET);
    const ok = await verifySignedChallenge(challenge, answer, sig, 'other-secret');
    expect(ok).toBe(false);
  });

  it('verifySignedSolution returns ok for correct math', async () => {
    const { challenge, answer } = issueMath();
    const sig = await signChallenge(challenge, answer, SECRET);
    const r = await verifySignedSolution(challenge, answer, sig, answer, SECRET);
    expect(r.ok).toBe(true);
  });

  it('verifySignedSolution returns wrong for incorrect math', async () => {
    const { challenge, answer } = issueMath();
    const sig = await signChallenge(challenge, answer, SECRET);
    const r = await verifySignedSolution(challenge, answer, sig, answer + 1, SECRET);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('wrong');
  });

  it('verifySignedSolution flags signature mismatch', async () => {
    const { challenge, answer } = issueMath();
    const sig = await signChallenge(challenge, answer, SECRET);
    const r = await verifySignedSolution(challenge, answer + 99, sig, answer, SECRET);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('signature');
  });
});
