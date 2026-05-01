/**
 * Single-use signed download tokens. Phase 6 grafts this onto Redis so a
 * `jti` blacklist survives process restarts. The interface here is what the
 * /pay/verify and /download/:token routes call.
 */

import crypto from 'node:crypto';
import { ENV } from '../env';

interface TokenPayload {
  draftId: string;
  iat: number;
  exp: number;
  jti: string;
}

const usedJti = new Set<string>();

function base64url(buf: Buffer | string): string {
  const b = typeof buf === 'string' ? Buffer.from(buf) : buf;
  return b.toString('base64').replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function fromBase64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

export function issueDownloadToken(draftId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    draftId,
    iat: now,
    exp: now + ENV.downloadTokenTtlSeconds,
    jti: crypto.randomBytes(12).toString('hex'),
  };
  const body = base64url(JSON.stringify(payload));
  const sig = base64url(
    crypto.createHmac('sha256', ENV.tokenSecret).update(body).digest(),
  );
  return `${body}.${sig}`;
}

export interface VerifiedToken {
  payload: TokenPayload;
}

export function verifyAndConsumeToken(token: string): VerifiedToken | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = base64url(
    crypto.createHmac('sha256', ENV.tokenSecret).update(body).digest(),
  );
  // Constant-time compare to prevent timing oracles.
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(fromBase64url(body).toString('utf8')) as TokenPayload;
  } catch {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return null;
  if (usedJti.has(payload.jti)) return null;
  usedJti.add(payload.jti);
  return { payload };
}
