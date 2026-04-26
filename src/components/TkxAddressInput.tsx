'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxAddressInput — Indian PIN-code → city/state autocomplete.
//
// Uses India Post's free public PIN code API (postalpincode.in). The
// component also accepts an `endpoint` prop so consumers can plug in any
// equivalent service (Smartystreets, Google Places, in-house CSV).
//
// Behaviour:
//   - User types 6-digit PIN
//   - On 6-digit completion, fetch lookup
//   - Render a list of matched post offices (one PIN can have multiple)
//   - Selection auto-fills city / state / district fields
//
// All output passes through onChange as a structured AddressValue payload.
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useEffect,
  useId,
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
  /** District / city. */
  city?: string;
  /** State / UT. */
  state?: string;
  /** Country (always "India" from the default endpoint). */
  country?: string;
  /** Optional second/third address line filled by the user. */
  line1?: string;
  line2?: string;
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
    { value, onChange, lookup = defaultLookup, label, showAddressLines = true, disabled, className, style },
    ref: Ref<HTMLInputElement>,
  ) {
    const theme = useTheme();
    const t = useLocale();
    const fieldId = useId();
    const [matches, setMatches] = useState<PostOffice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      background: theme.surface,
      color: theme.text,
      fontSize: 14,
      outline: 'none',
      minHeight: 40,
    };
    const dropdownStyle: CSSProperties = {
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      background: theme.surface,
      maxHeight: 200,
      overflow: 'auto',
      padding: 4,
    };
    const optionStyle: CSSProperties = {
      padding: '8px 10px',
      borderRadius: 6,
      cursor: 'pointer',
      fontSize: 13,
      color: theme.text,
    };
    const labelStyle: CSSProperties = { fontSize: 12, color: theme.textMuted };

    return (
      <div className={className} style={rootStyle}>
        {label && (
          <label htmlFor={`${fieldId}-pin`} style={{ fontSize: 13, fontWeight: 600 }}>
            {label}
          </label>
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
                  background: value.postOffice === po.Name ? theme.surfaceAlt : 'transparent',
                }}
              >
                <strong>{po.Name}</strong>{' '}
                <span style={{ color: theme.textMuted }}>
                  · {po.District}, {po.State}
                </span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div role="alert" style={{ fontSize: 12, color: theme.danger }}>
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
