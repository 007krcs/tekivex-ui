/**
 * In-memory draft store for the scaffold. Phase 6 swaps this for Redis with
 * AES-256-GCM encryption at rest. The interface stays the same so the
 * routes don't change.
 */

import { ENV } from '../env';

export interface DraftRecord {
  draftId: string;
  templateId: string;
  /** JSON-serialized biodata payload as stored. The route layer parses /
   *  validates against the Zod schema. */
  payload: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  paid: boolean;
  /** When paid, the Razorpay payment id we verified against. */
  paymentId?: string;
}

const map = new Map<string, DraftRecord>();

function pruneExpired(): void {
  const now = Date.now();
  for (const [k, v] of map) if (v.expiresAt < now) map.delete(k);
}

export const draftStore = {
  put(record: DraftRecord): void {
    pruneExpired();
    map.set(record.draftId, record);
  },
  get(id: string): DraftRecord | undefined {
    pruneExpired();
    return map.get(id);
  },
  patch(id: string, patch: Partial<DraftRecord>): DraftRecord | undefined {
    const cur = map.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, updatedAt: Date.now() };
    map.set(id, next);
    return next;
  },
  delete(id: string): boolean {
    return map.delete(id);
  },
  size(): number {
    pruneExpired();
    return map.size;
  },
};

export function newDraftId(): string {
  // 96-bit random hex; more than enough namespace for an in-memory map.
  const buf = new Uint8Array(12);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}

export const DRAFT_TTL_MS = ENV.draftTtlSeconds * 1000;
