import { useMemo, type ReactNode } from 'react';
import { I18nContext, LOCALES, isRTL, enUS, type LocaleCode, type LocaleStrings, type Direction } from './index';

export interface I18nProviderProps {
  locale?: LocaleCode;
  direction?: Direction;
  strings?: Partial<LocaleStrings>;
  children: ReactNode;
}

export function I18nProvider({
  locale = 'en-US',
  direction,
  strings: overrides,
  children,
}: I18nProviderProps) {
  const value = useMemo(() => {
    const base = LOCALES[locale] ?? enUS;
    const merged = overrides ? { ...base, ...overrides } : base;
    const dir = direction ?? (isRTL(locale) ? 'rtl' : 'ltr');

    return {
      locale,
      direction: dir,
      strings: merged,
    };
  }, [locale, direction, overrides]);

  return (
    <I18nContext.Provider value={value}>
      <div dir={value.direction} style={{ direction: value.direction }}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}
