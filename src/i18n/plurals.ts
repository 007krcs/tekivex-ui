// ── CLDR plural-rules engine ────────────────────────────────────────────────
// Tiny wrapper around the platform `Intl.PluralRules` API. Zero deps, zero
// CLDR data bundled — the JS runtime ships the rules. Cached per locale.
//
// @example
//   getPluralCategory('en-US', 1);        // → 'one'
//   getPluralCategory('ru-RU', 2);        // → 'few'
//   pluralize('en', 3, { one: '1 item', other: '{count} items' }); // → '3 items'
// ─────────────────────────────────────────────────────────────────────────────

export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

// Cache `Intl.PluralRules` instances — construction is non-trivial and we
// expect the same handful of locales to repeat across a session.
const cache = new Map<string, Intl.PluralRules>();

function getRules(locale: string): Intl.PluralRules | null {
  const PR = (globalThis as { Intl?: typeof Intl }).Intl?.PluralRules as
    | typeof Intl.PluralRules
    | undefined;
  if (typeof PR !== 'function') return null;
  let r = cache.get(locale);
  if (!r) {
    try {
      r = new PR(locale);
      cache.set(locale, r);
    } catch {
      return null;
    }
  }
  return r;
}

/** Simple English-style fallback when `Intl.PluralRules` is unavailable. */
function fallback(count: number): PluralCategory {
  return count === 1 ? 'one' : 'other';
}

/**
 * Return the CLDR plural category for `count` in `locale`. Falls back to a
 * simple English-style rule (1 → 'one', else → 'other') if `Intl.PluralRules`
 * is missing.
 */
export function getPluralCategory(locale: string, count: number): PluralCategory {
  const rules = getRules(locale);
  if (!rules) return fallback(count);
  return rules.select(count) as PluralCategory;
}

/**
 * Pick the correct plural form for `count` in `locale` and substitute the
 * `{count}` placeholder with the numeric value. Falls back to `other`, then
 * the first provided form, then an empty string.
 */
export function pluralize(
  locale: string,
  count: number,
  forms: Partial<Record<PluralCategory, string>>,
): string {
  const category = getPluralCategory(locale, count);
  const template =
    forms[category] ??
    forms.other ??
    // Last-ditch fallback — pick any provided form so we never return undefined.
    Object.values(forms).find((v): v is string => typeof v === 'string') ??
    '';
  return template.replace(/\{count\}/g, String(count));
}

/** Internal — exported for tests. Clears the per-locale cache. */
export function _clearPluralCache(): void {
  cache.clear();
}
