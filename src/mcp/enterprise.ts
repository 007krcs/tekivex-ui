/**
 * Enterprise controls shared by every tool: authentication, rate limiting, and
 * an append-only audit log.
 *
 * These are deliberately small and dependency-free. The threat model for an MCP
 * server is narrow but real: it runs with the privileges of whoever launched
 * it, and it answers questions about (and can read) a source tree. So the
 * server must be able to prove who called it, refuse to be hammered, and leave
 * a record of what was asked.
 */

export interface AuditEntry {
  readonly at: string;
  readonly tool: string;
  readonly principal: string;
  readonly outcome: 'ok' | 'denied' | 'error';
  readonly detail?: string;
}

export interface ServerConfig {
  /**
   * Shared secrets that authorise a call, as `token -> principal name`.
   * Sourced from TEKIVEX_MCP_TOKENS ("name:token,name:token").
   *
   * When empty the server runs UNAUTHENTICATED, which is the correct default
   * for a developer running it over stdio on their own machine (the transport
   * is the trust boundary there). Any network transport must set tokens.
   */
  readonly tokens: ReadonlyMap<string, string>;
  /** Max calls per principal per window. */
  readonly rateLimit: number;
  readonly rateWindowMs: number;
  /** Cap on how much text a tool will accept, to bound memory. */
  readonly maxInputBytes: number;
}

export function configFromEnv(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const tokens = new Map<string, string>();
  const raw = env.TEKIVEX_MCP_TOKENS?.trim();
  if (raw) {
    for (const pair of raw.split(',')) {
      const idx = pair.indexOf(':');
      if (idx <= 0) continue;
      const principal = pair.slice(0, idx).trim();
      const token = pair.slice(idx + 1).trim();
      if (principal && token) tokens.set(token, principal);
    }
  }
  return {
    tokens,
    rateLimit: Number(env.TEKIVEX_MCP_RATE_LIMIT ?? 240),
    rateWindowMs: Number(env.TEKIVEX_MCP_RATE_WINDOW_MS ?? 60_000),
    maxInputBytes: Number(env.TEKIVEX_MCP_MAX_INPUT_BYTES ?? 256_000),
  };
}

/** Constant-time-ish comparison so token checks don't leak length by timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export class Guard {
  private readonly hits = new Map<string, number[]>();
  private readonly log: AuditEntry[] = [];

  constructor(private readonly config: ServerConfig, private readonly maxLog = 5000) {}

  /** Resolve a caller to a principal, or throw. */
  authenticate(token: string | undefined): string {
    if (this.config.tokens.size === 0) return 'local';
    if (!token) throw new ToolError('unauthenticated', 'A bearer token is required.');
    for (const [known, principal] of this.config.tokens) {
      if (safeEqual(token, known)) return principal;
    }
    throw new ToolError('unauthenticated', 'Token not recognised.');
  }

  /** Throw if the principal has exceeded its budget. */
  checkRate(principal: string, now = Date.now()): void {
    const window = now - this.config.rateWindowMs;
    const recent = (this.hits.get(principal) ?? []).filter((t) => t > window);
    if (recent.length >= this.config.rateLimit) {
      throw new ToolError(
        'rate_limited',
        `Rate limit of ${this.config.rateLimit} calls per ${this.config.rateWindowMs}ms exceeded.`,
      );
    }
    recent.push(now);
    this.hits.set(principal, recent);
  }

  checkSize(text: string | undefined): void {
    if (text && Buffer.byteLength(text, 'utf8') > this.config.maxInputBytes) {
      throw new ToolError(
        'payload_too_large',
        `Input exceeds ${this.config.maxInputBytes} bytes.`,
      );
    }
  }

  record(entry: AuditEntry): void {
    this.log.push(entry);
    if (this.log.length > this.maxLog) this.log.shift();
  }

  /** Read-only view of the audit trail, newest last. */
  auditLog(): readonly AuditEntry[] {
    return this.log;
  }
}

/** A tool failure that is safe to return to the caller. */
export class ToolError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'ToolError';
  }
}
