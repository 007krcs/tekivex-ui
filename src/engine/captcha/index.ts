/**
 * Tekivex UI — engine/captcha
 *
 * Native, dependency-free captcha primitives. Three challenge types:
 *  • math       — "What is 5 + 3?"  (cheapest, accessible)
 *  • slider     — drag puzzle piece to target position
 *  • image-grid — "Select images that match: <prompt>"
 *
 * Two operating modes:
 *  1. Stateful (client / dev) — CaptchaIssuer with in-memory ChallengeStore.
 *  2. Stateless (backend) — sign the answer with HMAC-SHA256 via Web Crypto;
 *     verifier recomputes signature, no DB needed. Works anywhere SubtleCrypto
 *     is available (modern browsers + Node 18+).
 *
 * Component layer (TkxCaptcha) handles rendering and user input.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type CaptchaType = 'math' | 'slider' | 'image-grid';

export interface ChallengeBase {
  id: string;
  type: CaptchaType;
  issuedAt: number;
  expiresAt: number;
}

export interface MathChallenge extends ChallengeBase {
  type: 'math';
  question: string;
}

export interface SliderChallenge extends ChallengeBase {
  type: 'slider';
  /** Track width in arbitrary units (typically pixels). */
  trackWidth: number;
  /** Tolerance (± units) for an acceptable drop position. */
  tolerance: number;
  /** Target position the user must reach. Public — security comes from the
   *  randomness, not secrecy; the verifier checks the *position* not a guess. */
  target: number;
}

export interface ImageGridChallenge extends ChallengeBase {
  type: 'image-grid';
  prompt: string;
  /** Items shown to user. id is the only thing submitted back. */
  items: ReadonlyArray<{ id: string; label: string }>;
  /** How many correct selections are required. */
  requiredCount: number;
}

export type Challenge = MathChallenge | SliderChallenge | ImageGridChallenge;

export interface CaptchaResult {
  ok: boolean;
  reason?: 'expired' | 'wrong' | 'unknown' | 'malformed' | 'signature';
}

/* -------------------------------------------------------------------------- */
/* RNG + utilities                                                             */
/* -------------------------------------------------------------------------- */

const cryptoRef: Crypto | undefined =
  typeof globalThis !== 'undefined' && (globalThis as { crypto?: Crypto }).crypto
    ? (globalThis as { crypto: Crypto }).crypto
    : undefined;

function randInt(min: number, max: number): number {
  // inclusive both ends
  if (cryptoRef && typeof cryptoRef.getRandomValues === 'function') {
    const buf = new Uint32Array(1);
    cryptoRef.getRandomValues(buf);
    return min + (buf[0] % (max - min + 1));
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomId(bytes = 12): string {
  if (cryptoRef && typeof cryptoRef.getRandomValues === 'function') {
    const buf = new Uint8Array(bytes);
    cryptoRef.getRandomValues(buf);
    return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function pick<T>(arr: ReadonlyArray<T>): T {
  return arr[randInt(0, arr.length - 1)];
}

function shuffled<T>(arr: ReadonlyArray<T>): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const now = (): number => Date.now();

/* -------------------------------------------------------------------------- */
/* Math challenge                                                              */
/* -------------------------------------------------------------------------- */

export interface IssueMathOptions {
  /** ms validity window. Default 5 minutes. */
  ttlMs?: number;
  /** Maximum operand value. Default 10 (keeps it accessible). */
  maxOperand?: number;
  /** Allowed operations. Default + and -. Multiplication adds difficulty. */
  ops?: ReadonlyArray<'+' | '-' | '×'>;
}

export interface MathSolution {
  challenge: MathChallenge;
  answer: number;
}

export function issueMath(options: IssueMathOptions = {}): MathSolution {
  const ttlMs = options.ttlMs ?? 5 * 60_000;
  const maxOperand = options.maxOperand ?? 10;
  const ops = options.ops ?? (['+', '-'] as const);
  const op = pick(ops);
  let a = randInt(1, maxOperand);
  let b = randInt(1, maxOperand);
  if (op === '-' && b > a) [a, b] = [b, a]; // avoid negatives
  let answer: number;
  switch (op) {
    case '+':
      answer = a + b;
      break;
    case '-':
      answer = a - b;
      break;
    case '×':
      answer = a * b;
      break;
  }
  const issuedAt = now();
  const challenge: MathChallenge = {
    id: randomId(),
    type: 'math',
    issuedAt,
    expiresAt: issuedAt + ttlMs,
    question: `${a} ${op} ${b}`,
  };
  return { challenge, answer };
}

export function verifyMath(
  challenge: MathChallenge,
  expected: number,
  submitted: unknown,
): CaptchaResult {
  if (challenge.expiresAt < now()) return { ok: false, reason: 'expired' };
  if (typeof submitted !== 'number' || !Number.isFinite(submitted)) {
    return { ok: false, reason: 'malformed' };
  }
  return submitted === expected ? { ok: true } : { ok: false, reason: 'wrong' };
}

/* -------------------------------------------------------------------------- */
/* Slider challenge                                                            */
/* -------------------------------------------------------------------------- */

export interface IssueSliderOptions {
  ttlMs?: number;
  /** Track width in pixels. Default 300. */
  trackWidth?: number;
  /** Tolerance ± px. Default 6. */
  tolerance?: number;
  /** Reject targets within this many px of the edges (so it isn't trivial). */
  edgeMargin?: number;
}

export function issueSlider(options: IssueSliderOptions = {}): SliderChallenge {
  const ttlMs = options.ttlMs ?? 5 * 60_000;
  const trackWidth = options.trackWidth ?? 300;
  const tolerance = options.tolerance ?? 6;
  const edgeMargin = options.edgeMargin ?? 30;
  const target = randInt(edgeMargin, trackWidth - edgeMargin);
  const issuedAt = now();
  return {
    id: randomId(),
    type: 'slider',
    issuedAt,
    expiresAt: issuedAt + ttlMs,
    trackWidth,
    tolerance,
    target,
  };
}

export function verifySlider(
  challenge: SliderChallenge,
  submittedPosition: unknown,
): CaptchaResult {
  if (challenge.expiresAt < now()) return { ok: false, reason: 'expired' };
  if (typeof submittedPosition !== 'number' || !Number.isFinite(submittedPosition)) {
    return { ok: false, reason: 'malformed' };
  }
  const delta = Math.abs(submittedPosition - challenge.target);
  return delta <= challenge.tolerance ? { ok: true } : { ok: false, reason: 'wrong' };
}

/* -------------------------------------------------------------------------- */
/* Image-grid challenge                                                        */
/* -------------------------------------------------------------------------- */

export interface ImageGridItem {
  id: string;
  label: string;
  /** Caller-controlled flag — true if this item is a correct selection. */
  correct: boolean;
}

export interface IssueImageGridOptions {
  ttlMs?: number;
  prompt: string;
  /** Pool of items to draw from. Must contain at least requiredCount correct items. */
  pool: ReadonlyArray<ImageGridItem>;
  /** Total grid size (e.g., 9 for 3×3). Default 9. */
  gridSize?: number;
  /** How many correct items the user must select. Default 3. */
  requiredCount?: number;
}

export interface ImageGridSolution {
  challenge: ImageGridChallenge;
  /** Sorted IDs of correct items — used by verifier. */
  expected: ReadonlyArray<string>;
}

export function issueImageGrid(options: IssueImageGridOptions): ImageGridSolution {
  const ttlMs = options.ttlMs ?? 5 * 60_000;
  const gridSize = options.gridSize ?? 9;
  const requiredCount = options.requiredCount ?? 3;

  const correctPool = options.pool.filter((i) => i.correct);
  const decoyPool = options.pool.filter((i) => !i.correct);
  if (correctPool.length < requiredCount) {
    throw new Error(
      `engine/captcha: image-grid pool needs >= ${requiredCount} correct items, got ${correctPool.length}`,
    );
  }
  if (correctPool.length + decoyPool.length < gridSize) {
    throw new Error(
      `engine/captcha: image-grid pool needs >= ${gridSize} total items, got ${
        correctPool.length + decoyPool.length
      }`,
    );
  }

  const chosenCorrect = shuffled(correctPool).slice(0, requiredCount);
  const chosenDecoy = shuffled(decoyPool).slice(0, gridSize - requiredCount);
  const items = shuffled([...chosenCorrect, ...chosenDecoy]).map(({ id, label }) => ({
    id,
    label,
  }));

  const issuedAt = now();
  const challenge: ImageGridChallenge = {
    id: randomId(),
    type: 'image-grid',
    issuedAt,
    expiresAt: issuedAt + ttlMs,
    prompt: options.prompt,
    items,
    requiredCount,
  };
  const expected = chosenCorrect.map((i) => i.id).sort();
  return { challenge, expected };
}

export function verifyImageGrid(
  challenge: ImageGridChallenge,
  expected: ReadonlyArray<string>,
  submitted: unknown,
): CaptchaResult {
  if (challenge.expiresAt < now()) return { ok: false, reason: 'expired' };
  if (!Array.isArray(submitted) || submitted.some((s) => typeof s !== 'string')) {
    return { ok: false, reason: 'malformed' };
  }
  if (submitted.length !== expected.length) return { ok: false, reason: 'wrong' };
  const sorted = (submitted as string[]).slice().sort();
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== expected[i]) return { ok: false, reason: 'wrong' };
  }
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Stateful issuer (in-memory store)                                           */
/* -------------------------------------------------------------------------- */

export interface ChallengeStore {
  put(id: string, expected: unknown, expiresAt: number): void;
  /** Single-use take: returns and removes. */
  take(id: string): { expected: unknown; expiresAt: number } | undefined;
  /** Optional housekeeping. */
  prune?(): void;
  size?(): number;
}

export function createMemoryChallengeStore(): ChallengeStore {
  const map = new Map<string, { expected: unknown; expiresAt: number }>();
  const prune = (): void => {
    const t = now();
    for (const [k, v] of map) if (v.expiresAt < t) map.delete(k);
  };
  return {
    put(id, expected, expiresAt) {
      prune();
      map.set(id, { expected, expiresAt });
    },
    take(id) {
      prune();
      const entry = map.get(id);
      if (!entry) return undefined;
      map.delete(id);
      return entry;
    },
    prune,
    size: () => map.size,
  };
}

export class CaptchaIssuer {
  constructor(private readonly store: ChallengeStore = createMemoryChallengeStore()) {}

  issueMath(options?: IssueMathOptions): MathChallenge {
    const { challenge, answer } = issueMath(options);
    this.store.put(challenge.id, answer, challenge.expiresAt);
    return challenge;
  }

  issueSlider(options?: IssueSliderOptions): SliderChallenge {
    const challenge = issueSlider(options);
    this.store.put(challenge.id, challenge.target, challenge.expiresAt);
    return challenge;
  }

  issueImageGrid(options: IssueImageGridOptions): ImageGridChallenge {
    const { challenge, expected } = issueImageGrid(options);
    this.store.put(challenge.id, expected, challenge.expiresAt);
    return challenge;
  }

  verify(challenge: Challenge, submitted: unknown): CaptchaResult {
    if (challenge.expiresAt < now()) return { ok: false, reason: 'expired' };
    const entry = this.store.take(challenge.id);
    if (!entry) return { ok: false, reason: 'unknown' };
    if (entry.expiresAt < now()) return { ok: false, reason: 'expired' };
    switch (challenge.type) {
      case 'math':
        return verifyMath(challenge, entry.expected as number, submitted);
      case 'slider':
        return verifySlider(challenge, submitted);
      case 'image-grid':
        return verifyImageGrid(challenge, entry.expected as string[], submitted);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Stateless signed mode (Web Crypto, HMAC-SHA256)                             */
/* -------------------------------------------------------------------------- */

const subtle: SubtleCrypto | undefined = cryptoRef?.subtle;

async function importHmacKey(secret: string): Promise<CryptoKey> {
  if (!subtle) throw new Error('engine/captcha: SubtleCrypto unavailable');
  const enc = new TextEncoder();
  return subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function bytesToHex(buf: ArrayBuffer): string {
  const view = new Uint8Array(buf);
  let out = '';
  for (let i = 0; i < view.length; i++) out += view[i].toString(16).padStart(2, '0');
  return out;
}

function hexToBytes(hex: string): ArrayBuffer {
  const buf = new ArrayBuffer(hex.length / 2);
  const view = new Uint8Array(buf);
  for (let i = 0; i < view.length; i++) view[i] = parseInt(hex.substr(i * 2, 2), 16);
  return buf;
}

/**
 * Compute HMAC-SHA256 signature over `${challengeId}|${expectedJson}|${expiresAt}`.
 * Backend issues challenge + signature; user submits answer; backend recomputes
 * signature from incoming challenge + their answer and compares — no DB needed.
 */
export async function signChallenge(
  challenge: Challenge,
  expected: unknown,
  secret: string,
): Promise<string> {
  if (!subtle) throw new Error('engine/captcha: SubtleCrypto unavailable');
  const key = await importHmacKey(secret);
  const enc = new TextEncoder();
  const payload = `${challenge.id}|${JSON.stringify(expected)}|${challenge.expiresAt}`;
  const sig = await subtle.sign('HMAC', key, enc.encode(payload));
  return bytesToHex(sig);
}

export async function verifySignedChallenge(
  challenge: Challenge,
  expected: unknown,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!subtle) throw new Error('engine/captcha: SubtleCrypto unavailable');
  const key = await importHmacKey(secret);
  const enc = new TextEncoder();
  const payload = `${challenge.id}|${JSON.stringify(expected)}|${challenge.expiresAt}`;
  try {
    return await subtle.verify('HMAC', key, hexToBytes(signature), enc.encode(payload));
  } catch {
    return false;
  }
}

/**
 * Convenience: verify a stateless challenge in one call.
 */
export async function verifySignedSolution(
  challenge: Challenge,
  expected: unknown,
  signature: string,
  submitted: unknown,
  secret: string,
): Promise<CaptchaResult> {
  if (challenge.expiresAt < now()) return { ok: false, reason: 'expired' };
  const sigOk = await verifySignedChallenge(challenge, expected, signature, secret);
  if (!sigOk) return { ok: false, reason: 'signature' };
  switch (challenge.type) {
    case 'math':
      return verifyMath(challenge, expected as number, submitted);
    case 'slider':
      return verifySlider(challenge, submitted);
    case 'image-grid':
      return verifyImageGrid(challenge, expected as string[], submitted);
  }
}
