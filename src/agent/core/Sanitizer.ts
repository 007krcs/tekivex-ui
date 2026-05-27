// ══════════════════════════════════════════════════════════════════════════════
// SANITIZER — Port for cleaning model output before it reaches the consumer.
// Defaults to no-op. Wire to tekivex-ui's security engine for XSS protection.
// ══════════════════════════════════════════════════════════════════════════════

export interface Sanitizer {
  sanitize(text: string): string;
}

export const noopSanitizer: Sanitizer = {
  sanitize: (text) => text,
};
