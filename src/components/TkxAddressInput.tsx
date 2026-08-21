'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxAddressInput — Indian PIN-code → city/state autocomplete, plus optional
// Country → State → District → Sub-district cascading dropdowns when a
// DivisionsLoader is supplied.
//
// Two complementary paths:
//   1. PIN-driven (default, no extra props needed): user types a 6-digit PIN,
//      we hit India Post's free public API (postalpincode.in) and auto-fill
//      city / state / country. Identical to v3.19 behaviour.
//   2. Divisions-driven (opt-in via `divisionsSource` prop): cascading
//      dropdowns let users pick Country → State → District → Sub-district
//      explicitly. Useful for forms that need an admin-division code (not
//      just a display string), for non-PIN-input flows, or for regions
//      where PIN lookup doesn't apply (the default endpoint covers India
//      only).
//
// Both paths coexist. Selecting from a dropdown does NOT clear the PIN
// field, and typing a PIN does NOT clear dropdown selections — the
// consumer's form decides which fields are required.
//
// All output passes through onChange as a structured AddressValue payload.
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';
import { useTheme } from '../themes';
import { useLocale } from '../i18n';

export interface AddressValue {
  /** 6-digit PIN code (validated). */
  pin: string;
  /** Selected post office name. */
  postOffice?: string;
  /** District / city display name. */
  city?: string;
  /** State / UT display name. */
  state?: string;
  /** Country display name (always "India" from the default endpoint). */
  country?: string;
  /**
   * Sub-district display name (taluka / tehsil / mandal / block / circle —
   * the term varies by region, see DivisionsLoader.subDistrictLabel).
   * Only populated when a DivisionsLoader supplies the data.
   */
  subDistrict?: string;
  /** ISO 3166-1 alpha-2 country code (e.g. "IN"). Populated when divisionsSource is used. */
  countryCode?: string;
  /** ISO 3166-2 state code (e.g. "IN-MH"). Populated when divisionsSource is used. */
  stateCode?: string;
  /** LGD district code or loader-defined district code. Populated when divisionsSource is used. */
  districtCode?: string;
  /** LGD sub-district code or loader-defined sub-district code. Populated when divisionsSource is used. */
  subDistrictCode?: string;
  /** Optional second/third address line filled by the user. */
  line1?: string;
  line2?: string;
}

// ── Divisions loader (opt-in cascading dropdown data source) ────────────────

/** One administrative division (country / state / district / sub-district). */
export interface AdminDivision {
  /**
   * Stable code for this division. ISO 3166-1 alpha-2 for countries
   * ("IN"), ISO 3166-2 for states ("IN-MH"), LGD code or loader-defined
   * stable identifier for districts and sub-districts.
   */
  code: string;
  /** Display name in English/Latin script. */
  name: string;
  /** Optional name in the regional script (Devanagari, Tamil, etc.). */
  localName?: string;
}

export type DivisionLevel = 'country' | 'state' | 'district' | 'subDistrict';

/**
 * Pluggable data source for the cascading dropdowns. Implementations may
 * return data synchronously (in-memory snapshot) or asynchronously (REST,
 * lazy chunk import) — the component awaits each level.
 *
 * Companion packages can ship preset loaders. See `tekivex-india-admin`
 * for an LGD-snapshot loader covering all Indian states / UTs / districts
 * / sub-districts.
 */
export interface DivisionsLoader {
  /** Top-level countries available in this loader. Often a single entry. */
  countries(signal?: AbortSignal): Promise<AdminDivision[]>;
  /** States / UTs of the given country. */
  states(countryCode: string, signal?: AbortSignal): Promise<AdminDivision[]>;
  /** Districts of the given state. */
  districts(countryCode: string, stateCode: string, signal?: AbortSignal): Promise<AdminDivision[]>;
  /** Sub-districts of the given district. */
  subDistricts(
    countryCode: string,
    stateCode: string,
    districtCode: string,
    signal?: AbortSignal,
  ): Promise<AdminDivision[]>;
  /**
   * Optional: the regional label for the sub-district level in this
   * (country, state). Used as the dropdown label and helper text.
   * Examples for India:
   *   - Maharashtra / Gujarat / Goa → "Taluka"
   *   - Karnataka / Kerala / Tamil Nadu → "Taluk"
   *   - Andhra Pradesh / Telangana → "Mandal"
   *   - West Bengal / Jharkhand → "Block"
   *   - UP / Bihar / Rajasthan / MP / Punjab → "Tehsil"
   * Falls back to "Sub-district" when not supplied.
   */
  subDistrictLabel?(countryCode: string, stateCode: string): string;
}

/** Shape of the response from postalpincode.in. Public API, free, no auth. */
interface PostOffice {
  Name: string;
  District: string;
  State: string;
  Country: string;
  Pincode: string;
}

interface PinLookupFn {
  (pin: string, signal?: AbortSignal): Promise<PostOffice[]>;
}

const defaultLookup: PinLookupFn = async (pin, signal) => {
  const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as Array<{
    Status: string;
    PostOffice: PostOffice[] | null;
  }>;
  if (!Array.isArray(json) || !json[0]) return [];
  if (json[0].Status !== 'Success' || !json[0].PostOffice) return [];
  return json[0].PostOffice;
};

export interface TkxAddressInputProps {
  /** Current value. */
  value: Partial<AddressValue>;
  /** Fires on every change. */
  onChange: (value: AddressValue) => void;
  /** Custom lookup function (override the India Post default). */
  lookup?: PinLookupFn;
  /**
   * Optional admin-divisions data source. When supplied, the component
   * prepends a cascading Country → State → District → Sub-district row
   * above the PIN field. When omitted, the UI is byte-for-byte identical
   * to the v3.19 behaviour (PIN-only).
   *
   * @example
   *   import { lgdSnapshot } from 'tekivex-india-admin';
   *   <TkxAddressInput value={addr} onChange={setAddr} divisionsSource={lgdSnapshot()} />
   */
  divisionsSource?: DivisionsLoader;
  /** Visible label. */
  label?: string;
  /** Show line1 / line2 fields under the PIN row. Default true. */
  showAddressLines?: boolean;
  /** Disable input. */
  disabled?: boolean;
  /** Optional className on the root container. */
  className?: string;
  /** Optional inline style. */
  style?: CSSProperties;
}

const PIN_PATTERN = /^\d{6}$/;

export const TkxAddressInput = forwardRef<HTMLInputElement, TkxAddressInputProps>(
  function TkxAddressInput(
    {
      value,
      onChange,
      lookup = defaultLookup,
      divisionsSource,
      label,
      showAddressLines = true,
      disabled,
      className,
      style,
    },
    ref: Ref<HTMLInputElement>,
  ) {
    const theme = useTheme();
    const t = useLocale();
    const fieldId = useId();
    const [matches, setMatches] = useState<PostOffice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Cascading-dropdown state (only used when divisionsSource is set) ──
    const [countries, setCountries] = useState<AdminDivision[]>([]);
    const [states, setStates] = useState<AdminDivision[]>([]);
    const [districts, setDistricts] = useState<AdminDivision[]>([]);
    const [subDistricts, setSubDistricts] = useState<AdminDivision[]>([]);
    const [divError, setDivError] = useState<string | null>(null);

    // Load top-level countries on mount when a source is supplied.
    useEffect(() => {
      if (!divisionsSource) return;
      const ac = new AbortController();
      setDivError(null);
      divisionsSource
        .countries(ac.signal)
        .then(setCountries)
        .catch((err) => {
          if ((err as DOMException)?.name === 'AbortError') return;
          setDivError((err as Error)?.message || 'Failed to load countries');
        });
      return () => ac.abort();
    }, [divisionsSource]);

    // Cascade: when countryCode changes, load states; clear children.
    useEffect(() => {
      if (!divisionsSource || !value.countryCode) {
        setStates([]);
        return;
      }
      const ac = new AbortController();
      divisionsSource
        .states(value.countryCode, ac.signal)
        .then(setStates)
        .catch((err) => {
          if ((err as DOMException)?.name === 'AbortError') return;
          setDivError((err as Error)?.message || 'Failed to load states');
        });
      return () => ac.abort();
    }, [divisionsSource, value.countryCode]);

    useEffect(() => {
      if (!divisionsSource || !value.countryCode || !value.stateCode) {
        setDistricts([]);
        return;
      }
      const ac = new AbortController();
      divisionsSource
        .districts(value.countryCode, value.stateCode, ac.signal)
        .then(setDistricts)
        .catch((err) => {
          if ((err as DOMException)?.name === 'AbortError') return;
          setDivError((err as Error)?.message || 'Failed to load districts');
        });
      return () => ac.abort();
    }, [divisionsSource, value.countryCode, value.stateCode]);

    useEffect(() => {
      if (
        !divisionsSource ||
        !value.countryCode ||
        !value.stateCode ||
        !value.districtCode
      ) {
        setSubDistricts([]);
        return;
      }
      const ac = new AbortController();
      divisionsSource
        .subDistricts(value.countryCode, value.stateCode, value.districtCode, ac.signal)
        .then(setSubDistricts)
        .catch((err) => {
          if ((err as DOMException)?.name === 'AbortError') return;
          setDivError((err as Error)?.message || 'Failed to load sub-districts');
        });
      return () => ac.abort();
    }, [divisionsSource, value.countryCode, value.stateCode, value.districtCode]);

    // Resolve the regional sub-district label for the current state.
    const subDistrictLabel = useMemo(() => {
      if (!divisionsSource?.subDistrictLabel || !value.countryCode || !value.stateCode) {
        return 'Sub-district';
      }
      try {
        return divisionsSource.subDistrictLabel(value.countryCode, value.stateCode) || 'Sub-district';
      } catch {
        return 'Sub-district';
      }
    }, [divisionsSource, value.countryCode, value.stateCode]);

    // Trigger lookup when PIN is exactly 6 digits.
    useEffect(() => {
      if (!value.pin || !PIN_PATTERN.test(value.pin)) {
        setMatches([]);
        setError(null);
        return;
      }
      const ac = new AbortController();
      setLoading(true);
      setError(null);
      lookup(value.pin, ac.signal)
        .then((list) => {
          setMatches(list);
          if (list.length === 0) setError(t.noResults);
        })
        .catch((err) => {
          if ((err as DOMException)?.name === 'AbortError') return;
          setError((err as Error)?.message || 'Lookup failed');
          setMatches([]);
        })
        .finally(() => setLoading(false));
      return () => ac.abort();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value.pin]);

    const setPin = (pin: string) => {
      const cleaned = pin.replace(/\D+/g, '').slice(0, 6);
      onChange({ ...value, pin: cleaned });
    };

    const choose = (po: PostOffice) => {
      onChange({
        ...value,
        pin: po.Pincode,
        postOffice: po.Name,
        city: po.District,
        state: po.State,
        country: po.Country,
      });
      setMatches([]);
    };

    const setLine = (field: 'line1' | 'line2', text: string) => {
      onChange({ ...value, pin: value.pin ?? '', [field]: text });
    };

    // ── Cascading-dropdown handlers ───────────────────────────────────────
    // Selecting a level fills its code + display name AND clears all
    // downstream codes/names so the cascade stays consistent.
    const pickCountry = (code: string) => {
      const c = countries.find((x) => x.code === code);
      onChange({
        ...value,
        pin: value.pin ?? '',
        countryCode: code || undefined,
        country: c?.name,
        stateCode: undefined,
        state: undefined,
        districtCode: undefined,
        city: undefined,
        subDistrictCode: undefined,
        subDistrict: undefined,
      });
    };
    const pickState = (code: string) => {
      const s = states.find((x) => x.code === code);
      onChange({
        ...value,
        pin: value.pin ?? '',
        stateCode: code || undefined,
        state: s?.name,
        districtCode: undefined,
        city: undefined,
        subDistrictCode: undefined,
        subDistrict: undefined,
      });
    };
    const pickDistrict = (code: string) => {
      const d = districts.find((x) => x.code === code);
      onChange({
        ...value,
        pin: value.pin ?? '',
        districtCode: code || undefined,
        city: d?.name,
        subDistrictCode: undefined,
        subDistrict: undefined,
      });
    };
    const pickSubDistrict = (code: string) => {
      const sd = subDistricts.find((x) => x.code === code);
      onChange({
        ...value,
        pin: value.pin ?? '',
        subDistrictCode: code || undefined,
        subDistrict: sd?.name,
      });
    };

    // ── Styles ─────────────────────────────────────────────────────────────
    const rootStyle: CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      width: '100%',
      ...style,
    };
    const rowStyle: CSSProperties = {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
    };
    const fieldStyle: CSSProperties = {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    };
    const inputStyle: CSSProperties = {
      width: '100%',
      padding: '8px 10px',
      border: `1px solid ${theme.css.border}`,
      borderRadius: 8,
      background: theme.css.surface,
      color: theme.css.text,
      fontSize: 14,
      outline: 'none',
      minHeight: 40,
    };
    // Native <select> shares input styling so the cascade row visually matches.
    const selectStyle: CSSProperties = {
      ...inputStyle,
      // appearance:none normalises the OS-default caret across browsers; the
      // chevron is drawn via a background-image SVG that respects theme.css.text.
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      paddingRight: 28,
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='${encodeURIComponent(theme.css.textMuted)}' d='M0 0l5 6 5-6z'/></svg>")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
    };
    const dropdownStyle: CSSProperties = {
      border: `1px solid ${theme.css.border}`,
      borderRadius: 8,
      background: theme.css.surface,
      maxHeight: 200,
      overflow: 'auto',
      padding: 4,
    };
    const optionStyle: CSSProperties = {
      padding: '8px 10px',
      borderRadius: 6,
      cursor: 'pointer',
      fontSize: 13,
      color: theme.css.text,
    };
    const labelStyle: CSSProperties = { fontSize: 12, color: theme.css.textMuted };

    return (
      <div className={className} style={rootStyle}>
        {label && (
          <label htmlFor={`${fieldId}-pin`} style={{ fontSize: 13, fontWeight: 600 }}>
            {label}
          </label>
        )}

        {/* Cascading-dropdown row — only when divisionsSource is supplied. */}
        {divisionsSource && (
          <>
            <div style={rowStyle}>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor={`${fieldId}-country`}>Country</label>
                <select
                  id={`${fieldId}-country`}
                  value={value.countryCode ?? ''}
                  onChange={(e) => pickCountry(e.target.value)}
                  disabled={disabled || countries.length === 0}
                  style={selectStyle}
                >
                  <option value="">{countries.length === 0 ? 'Loading…' : 'Select country'}</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor={`${fieldId}-state`}>State / UT</label>
                <select
                  id={`${fieldId}-state`}
                  value={value.stateCode ?? ''}
                  onChange={(e) => pickState(e.target.value)}
                  disabled={disabled || !value.countryCode || states.length === 0}
                  style={selectStyle}
                >
                  <option value="">{!value.countryCode ? 'Pick country first' : (states.length === 0 ? 'Loading…' : 'Select state')}</option>
                  {states.map((s) => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={rowStyle}>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor={`${fieldId}-district`}>District</label>
                <select
                  id={`${fieldId}-district`}
                  value={value.districtCode ?? ''}
                  onChange={(e) => pickDistrict(e.target.value)}
                  disabled={disabled || !value.stateCode || districts.length === 0}
                  style={selectStyle}
                >
                  <option value="">{!value.stateCode ? 'Pick state first' : (districts.length === 0 ? 'Loading…' : 'Select district')}</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor={`${fieldId}-subdistrict`}>{subDistrictLabel}</label>
                <select
                  id={`${fieldId}-subdistrict`}
                  value={value.subDistrictCode ?? ''}
                  onChange={(e) => pickSubDistrict(e.target.value)}
                  disabled={disabled || !value.districtCode || subDistricts.length === 0}
                  style={selectStyle}
                >
                  <option value="">
                    {!value.districtCode
                      ? 'Pick district first'
                      : subDistricts.length === 0
                        ? 'Loading…'
                        : `Select ${subDistrictLabel.toLowerCase()}`}
                  </option>
                  {subDistricts.map((sd) => (
                    <option key={sd.code} value={sd.code}>{sd.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {divError && (
              <div role="alert" style={{ fontSize: 12, color: theme.css.danger }}>{divError}</div>
            )}
          </>
        )}

        <div style={rowStyle}>
          <div style={{ ...fieldStyle, flex: '0 0 140px' }}>
            <span style={labelStyle}>PIN code</span>
            <input
              ref={ref}
              id={`${fieldId}-pin`}
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              value={value.pin ?? ''}
              onChange={(e) => setPin(e.target.value)}
              disabled={disabled}
              aria-busy={loading}
              aria-invalid={error !== null}
              style={inputStyle}
              placeholder="000000"
            />
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>City</span>
            <input
              type="text"
              autoComplete="address-level2"
              value={value.city ?? ''}
              onChange={(e) => onChange({ ...value, city: e.target.value, pin: value.pin ?? '' })}
              disabled={disabled}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>State</span>
            <input
              type="text"
              autoComplete="address-level1"
              value={value.state ?? ''}
              onChange={(e) => onChange({ ...value, state: e.target.value, pin: value.pin ?? '' })}
              disabled={disabled}
              style={inputStyle}
            />
          </div>
        </div>

        {matches.length > 1 && (
          <div role="listbox" aria-label="Matching post offices" style={dropdownStyle}>
            {matches.map((po) => (
              <div
                key={`${po.Pincode}-${po.Name}`}
                role="option"
                aria-selected={value.postOffice === po.Name}
                onClick={() => choose(po)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    choose(po);
                  }
                }}
                tabIndex={0}
                style={{
                  ...optionStyle,
                  background: value.postOffice === po.Name ? theme.css.surfaceAlt : 'transparent',
                }}
              >
                <strong>{po.Name}</strong>{' '}
                <span style={{ color: theme.css.textMuted }}>
                  · {po.District}, {po.State}
                </span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div role="alert" style={{ fontSize: 12, color: theme.css.danger }}>
            {error}
          </div>
        )}

        {showAddressLines && (
          <>
            <input
              type="text"
              autoComplete="address-line1"
              placeholder="Address line 1"
              value={value.line1 ?? ''}
              onChange={(e) => setLine('line1', e.target.value)}
              disabled={disabled}
              style={inputStyle}
            />
            <input
              type="text"
              autoComplete="address-line2"
              placeholder="Address line 2 (optional)"
              value={value.line2 ?? ''}
              onChange={(e) => setLine('line2', e.target.value)}
              disabled={disabled}
              style={inputStyle}
            />
          </>
        )}
      </div>
    );
  },
);

TkxAddressInput.displayName = 'TkxAddressInput';
