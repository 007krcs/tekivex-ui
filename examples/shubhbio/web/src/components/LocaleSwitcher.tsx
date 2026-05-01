import { TkxSelect } from 'tekivex-ui';
import type { LocaleCode } from 'tekivex-ui';
import { useLocaleSwitcher } from '../i18n';

/**
 * Compact locale picker shown in the AppBar. Refresh-safe — selection is
 * persisted in localStorage and broadcast in the same tab via a synthetic
 * StorageEvent so the I18nProvider re-renders.
 */
export function LocaleSwitcher() {
  const { code, set, options } = useLocaleSwitcher();
  return (
    <TkxSelect
      size="sm"
      value={code}
      options={options}
      onChange={(value) => set(value as LocaleCode)}
      ariaLabel="Language"
      style={{ minWidth: 140 }}
    />
  );
}
