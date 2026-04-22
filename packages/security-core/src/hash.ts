// ── FNV-1a 32-bit hash ───────────────────────────────────────────────────────
// Extracted from tekivex-ui's quantum engine so security-core is self-contained.

const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;

export function fnv1aHash(input: string): string {
  let hash = FNV_OFFSET;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}
