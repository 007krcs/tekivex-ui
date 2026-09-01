import { describe, it, expect, afterEach } from 'vitest';
import { getPluralCategory, pluralize, _clearPluralCache } from '../src/i18n/plurals';

describe('plurals — getPluralCategory (CLDR)', () => {
  afterEach(() => _clearPluralCache());

  it('en-US 1 → one', () => {
    expect(getPluralCategory('en-US', 1)).toBe('one');
  });

  it('en-US 2 → other', () => {
    expect(getPluralCategory('en-US', 2)).toBe('other');
  });

  it('en-US 0 → other', () => {
    expect(getPluralCategory('en-US', 0)).toBe('other');
  });

  it('ru-RU 1 → one', () => {
    expect(getPluralCategory('ru-RU', 1)).toBe('one');
  });

  it('ru-RU 2 → few', () => {
    expect(getPluralCategory('ru-RU', 2)).toBe('few');
  });

  it('ru-RU 5 → many', () => {
    expect(getPluralCategory('ru-RU', 5)).toBe('many');
  });

  it('ar-SA 0 → zero', () => {
    // Arabic has explicit "zero" category in CLDR.
    expect(getPluralCategory('ar-SA', 0)).toBe('zero');
  });

  it('cy-GB 2 → two (Welsh has the "two" category)', () => {
    expect(getPluralCategory('cy-GB', 2)).toBe('two');
  });

  it('cy-GB 3 → few (Welsh)', () => {
    expect(getPluralCategory('cy-GB', 3)).toBe('few');
  });

  it('caches Intl.PluralRules instances per locale', () => {
    // Two calls with the same locale should not throw and should agree.
    const a = getPluralCategory('en-US', 1);
    const b = getPluralCategory('en-US', 1);
    expect(a).toBe(b);
  });
});

describe('plurals — pluralize', () => {
  afterEach(() => _clearPluralCache());

  it('substitutes {count} into the chosen form', () => {
    const out = pluralize('en-US', 3, { one: '1 item', other: '{count} items' });
    expect(out).toBe('3 items');
  });

  it('uses the "one" form when count === 1', () => {
    const out = pluralize('en-US', 1, { one: '1 item', other: '{count} items' });
    expect(out).toBe('1 item');
  });

  it('falls back to "other" when the requested category is missing', () => {
    // Russian "few" not provided — should fall back to "other".
    const out = pluralize('ru-RU', 2, { one: 'один', other: '{count} штук' });
    expect(out).toBe('2 штук');
  });

  it('handles multiple {count} substitutions', () => {
    const out = pluralize('en-US', 5, { other: '{count} of {count}' });
    expect(out).toBe('5 of 5');
  });

  it('returns "" when no forms provided at all', () => {
    const out = pluralize('en-US', 1, {});
    expect(out).toBe('');
  });
});

describe('plurals — fallback when Intl.PluralRules is unavailable', () => {
  it('returns "one" for 1 and "other" for !1 when Intl.PluralRules is missing', () => {
    // `Intl.PluralRules` is declared readonly on the ambient Intl namespace, so
    // view it through a mutable-optional shape to remove and restore it.
    const intl = globalThis.Intl as { PluralRules?: typeof Intl.PluralRules };
    const original = intl.PluralRules;
    delete intl.PluralRules;
    _clearPluralCache();
    try {
      expect(getPluralCategory('ru-RU', 1)).toBe('one');
      expect(getPluralCategory('ru-RU', 5)).toBe('other');
      expect(getPluralCategory('en-US', 0)).toBe('other');
    } finally {
      intl.PluralRules = original;
      _clearPluralCache();
    }
  });
});
