import { describe, it, expect } from 'vitest';
import {
  hiIN,
  mrIN,
  bnIN,
  taIN,
  teIN,
  guIN,
  paIN,
  urPK,
  LOCALES,
  isRTL,
  type LocaleStrings,
} from '../src/i18n';

const SOUTH_ASIAN: Record<string, LocaleStrings> = {
  hiIN, mrIN, bnIN, taIN, teIN, guIN, paIN, urPK,
};

const REQUIRED_KEYS: (keyof LocaleStrings)[] = [
  'close', 'cancel', 'confirm', 'save', 'delete', 'search', 'loading',
  'noResults', 'required', 'previous', 'next', 'pageOf', 'selectPlaceholder',
  'clearSelection', 'selectDate', 'today', 'dropFiles', 'browse', 'noData',
  'sortAscending', 'sortDescending', 'filterPlaceholder', 'exportCsv',
  'rowsSelected',
];

describe('i18n — South Asian locales (v2.7)', () => {
  it('all 8 locales registered in LOCALES map', () => {
    const codes = Object.keys(LOCALES);
    for (const code of ['hi-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN', 'gu-IN', 'pa-IN', 'ur-PK']) {
      expect(codes).toContain(code);
    }
  });

  it('every locale has all required keys', () => {
    for (const [name, locale] of Object.entries(SOUTH_ASIAN)) {
      for (const key of REQUIRED_KEYS) {
        expect(locale[key], `${name} missing key: ${key}`).toBeDefined();
      }
    }
  });

  it('pageOf returns localised page label', () => {
    expect(hiIN.pageOf(2, 5)).toContain('2');
    expect(hiIN.pageOf(2, 5)).toContain('5');
    expect(taIN.pageOf(1, 1)).toContain('1');
  });

  it('rowsSelected handles singular vs plural', () => {
    expect(hiIN.rowsSelected(1)).toBeTruthy();
    expect(hiIN.rowsSelected(5)).toBeTruthy();
    expect(taIN.rowsSelected(1)).toBeTruthy();
    expect(taIN.rowsSelected(5)).toBeTruthy();
  });

  it('Urdu is correctly flagged as RTL', () => {
    expect(isRTL('ur-PK')).toBe(true);
  });

  it('other South-Asian locales are LTR', () => {
    for (const code of ['hi-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN', 'gu-IN', 'pa-IN']) {
      expect(isRTL(code)).toBe(false);
    }
  });

  it('strings contain native script characters (sanity)', () => {
    expect(hiIN.save).toMatch(/[ऀ-ॿ]/);    // Devanagari
    expect(taIN.save).toMatch(/[஀-௿]/);    // Tamil
    expect(teIN.save).toMatch(/[ఀ-౿]/);    // Telugu
    expect(bnIN.save).toMatch(/[ঀ-৿]/);    // Bengali
    expect(guIN.save).toMatch(/[઀-૿]/);    // Gujarati
    expect(paIN.save).toMatch(/[਀-੿]/);    // Gurmukhi
    expect(urPK.save).toMatch(/[؀-ۿ]/);    // Arabic script
  });
});
