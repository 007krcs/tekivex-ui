import { describe, it, expect } from 'vitest';
import {
  LOCALES,
  isRTL,
  hiIN,
  taIN,
  teIN,
  mrIN,
  guIN,
  bnIN,
  knIN,
  mlIN,
  paIN,
  urIN,
  orIN,
  asIN,
  enUS,
  type LocaleCode,
} from '../src/i18n';

const NEW_LOCALES: ReadonlyArray<LocaleCode> = [
  'hi-IN',
  'ta-IN',
  'te-IN',
  'mr-IN',
  'gu-IN',
  'bn-IN',
  'kn-IN',
  'ml-IN',
  'pa-IN',
  'ur-IN',
  'or-IN',
  'as-IN',
];

describe('i18n — Indian regional locales registered', () => {
  it('LOCALES map contains all 12 new codes', () => {
    for (const code of NEW_LOCALES) {
      expect(LOCALES[code]).toBeTruthy();
    }
  });

  it('every Indian locale has the same key shape as enUS', () => {
    const englishKeys = Object.keys(enUS).sort();
    for (const code of NEW_LOCALES) {
      const keys = Object.keys(LOCALES[code]).sort();
      expect(keys).toEqual(englishKeys);
    }
  });

  it('exports each locale by camelCase variable name', () => {
    expect(hiIN).toBe(LOCALES['hi-IN']);
    expect(taIN).toBe(LOCALES['ta-IN']);
    expect(teIN).toBe(LOCALES['te-IN']);
    expect(mrIN).toBe(LOCALES['mr-IN']);
    expect(guIN).toBe(LOCALES['gu-IN']);
    expect(bnIN).toBe(LOCALES['bn-IN']);
    expect(knIN).toBe(LOCALES['kn-IN']);
    expect(mlIN).toBe(LOCALES['ml-IN']);
    expect(paIN).toBe(LOCALES['pa-IN']);
    expect(urIN).toBe(LOCALES['ur-IN']);
    expect(orIN).toBe(LOCALES['or-IN']);
    expect(asIN).toBe(LOCALES['as-IN']);
  });
});

describe('i18n — translation spot-checks', () => {
  it('Hindi save is सहेजें', () => {
    expect(hiIN.save).toBe('सहेजें');
  });

  it('Tamil cancel is ரத்து செய்', () => {
    expect(taIN.cancel).toBe('ரத்து செய்');
  });

  it('Bengali confirm is নিশ্চিত করুন', () => {
    expect(bnIN.confirm).toBe('নিশ্চিত করুন');
  });

  it('Urdu close is بند کریں', () => {
    expect(urIN.close).toBe('بند کریں');
  });

  it('pageOf is a function returning a localized string', () => {
    expect(typeof hiIN.pageOf).toBe('function');
    expect(hiIN.pageOf(1, 5)).toBe('पृष्ठ 1 / 5');
    expect(taIN.pageOf(2, 9)).toBe('பக்கம் 2 / 9');
    expect(urIN.pageOf(3, 7)).toBe('صفحہ 3 / 7');
  });

  it('rowsSelected is a function returning a localized string', () => {
    expect(typeof hiIN.rowsSelected).toBe('function');
    expect(hiIN.rowsSelected(3)).toContain('3');
    expect(bnIN.rowsSelected(1)).toContain('1');
  });
});

describe('i18n — RTL', () => {
  it('marks ur-IN as RTL', () => {
    expect(isRTL('ur-IN')).toBe(true);
  });

  it('does not mark other Indian locales as RTL', () => {
    const ltrIndians = NEW_LOCALES.filter((c) => c !== 'ur-IN');
    for (const code of ltrIndians) {
      expect(isRTL(code)).toBe(false);
    }
  });

  it('ur-PK and ar-SA remain RTL', () => {
    expect(isRTL('ur-PK')).toBe(true);
    expect(isRTL('ar-SA')).toBe(true);
  });
});
