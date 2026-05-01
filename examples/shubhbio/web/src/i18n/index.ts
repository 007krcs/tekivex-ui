/**
 * App-side i18n binding. Reads/writes the user's locale preference to
 * localStorage and exposes a typed setter the language switcher uses.
 */

import { useCallback, useEffect, useState } from 'react';
import type { LocaleCode } from 'tekivex-ui';

const STORAGE_KEY = 'shubhbio.locale';
const DEFAULT_LOCALE: LocaleCode = 'en-US';

const SUPPORTED: ReadonlyArray<LocaleCode> = [
  'en-US',
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

function readStored(): LocaleCode {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw && (SUPPORTED as ReadonlyArray<string>).includes(raw)) return raw as LocaleCode;
  // Fall back to a best-effort match against navigator.language
  const lang = navigator?.language ?? '';
  for (const code of SUPPORTED) {
    if (lang.toLowerCase().startsWith(code.split('-')[0].toLowerCase())) return code;
  }
  return DEFAULT_LOCALE;
}

export function useLocaleCode(): LocaleCode {
  const [code, setCode] = useState<LocaleCode>(() => readStored());
  useEffect(() => {
    const onStorage = (e: StorageEvent): void => {
      if (e.key === STORAGE_KEY && e.newValue && (SUPPORTED as ReadonlyArray<string>).includes(e.newValue)) {
        setCode(e.newValue as LocaleCode);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return code;
}

export function setLocaleCode(next: LocaleCode): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, next);
  // Trigger a re-render by dispatching a storage event in the same tab.
  window.dispatchEvent(
    new StorageEvent('storage', { key: STORAGE_KEY, newValue: next }),
  );
}

export const SUPPORTED_LOCALES = SUPPORTED;

export const LOCALE_LABEL: Record<LocaleCode, string> = {
  'en-US': 'English',
  'hi-IN': 'हिन्दी',
  'ta-IN': 'தமிழ்',
  'te-IN': 'తెలుగు',
  'mr-IN': 'मराठी',
  'gu-IN': 'ગુજરાતી',
  'bn-IN': 'বাংলা',
  'kn-IN': 'ಕನ್ನಡ',
  'ml-IN': 'മലയാളം',
  'pa-IN': 'ਪੰਜਾਬੀ',
  'ur-IN': 'اردو',
  'or-IN': 'ଓଡ଼ିଆ',
  'as-IN': 'অসমীয়া',
} as const as Record<LocaleCode, string>;

export function useLocaleSwitcher(): {
  code: LocaleCode;
  set: (next: LocaleCode) => void;
  options: ReadonlyArray<{ value: LocaleCode; label: string }>;
} {
  const code = useLocaleCode();
  const set = useCallback((next: LocaleCode) => setLocaleCode(next), []);
  const options = SUPPORTED.map((c) => ({ value: c, label: LOCALE_LABEL[c] ?? c }));
  return { code, set, options };
}
