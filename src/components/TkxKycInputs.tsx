'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Indian KYC inputs — PAN, Voter ID, Driving Licence.
//
// Each component validates the format defined by the relevant authority:
//   - PAN (Permanent Account Number) — Income Tax: 10 chars [A-Z]{5}[0-9]{4}[A-Z]
//   - Voter ID (EPIC) — Election Commission: 10 chars [A-Z]{3}[0-9]{7}
//   - Driving Licence — varies by state but a robust pattern is
//     (?:[A-Z]{2}[0-9]{2}|[A-Z]{2}-[0-9]{2})\s?[0-9]{11}
//
// All three:
//   - Auto-uppercase as the user types
//   - Validate format on every keystroke
//   - Surface { raw, normalised, valid } via onChange
//   - WCAG-compliant labels + error states
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useId,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';
import { useTheme } from '../themes';
import { useLocale } from '../i18n';

// ── PAN ─────────────────────────────────────────────────────────────────────

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
// 4th character indicates entity type:
//   P=Individual, F=Firm, C=Company, H=HUF, A=AOP, T=Trust, B=BOI, L=Local,
//   J=Artificial Juridical, G=Government
const PAN_ENTITY_CHARS = 'PFCHATBLJG';

export function isValidPan(input: string): boolean {
  const s = input.toUpperCase().trim();
  if (!PAN_PATTERN.test(s)) return false;
  // The 4th character must be one of the entity codes.
  return PAN_ENTITY_CHARS.includes(s[3]);
}

export interface PanChangePayload {
  raw: string;
  normalised: string; // uppercase, no spaces
  valid: boolean;
}

export interface TkxPanInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (payload: PanChangePayload) => void;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
}

export const TkxPanInput = forwardRef<HTMLInputElement, TkxPanInputProps>(function TkxPanInput(
  { value, defaultValue, onChange, label, disabled, required, id, name, className, style },
  ref: Ref<HTMLInputElement>,
) {
  const theme = useTheme();
  const t = useLocale();
  const autoId = useId();
  const inputId = id ?? autoId;
  const isControlled = value !== undefined;
  const [inner, setInner] = useState((defaultValue ?? '').toUpperCase().slice(0, 10));
  const current = (isControlled ? value ?? '' : inner).toUpperCase().slice(0, 10);
  const valid = isValidPan(current);

  const handleChange = (raw: string) => {
    const next = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    if (!isControlled) setInner(next);
    onChange?.({ raw, normalised: next, valid: isValidPan(next) });
  };

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 600, color: theme.css.text }}>
          {label}
          {required && <span style={{ color: theme.css.danger, marginLeft: 4 }}>*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        name={name}
        type="text"
        inputMode="text"
        autoComplete="off"
        maxLength={10}
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        required={required}
        aria-invalid={current.length === 10 && !valid}
        style={{
          width: '100%',
          padding: '0 12px',
          minHeight: 40,
          border: `1px solid ${current.length === 10 && !valid ? theme.css.danger : theme.css.border}`,
          borderRadius: 8,
          background: theme.css.surface,
          color: theme.css.text,
          fontSize: 14,
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: 2,
          outline: 'none',
          textTransform: 'uppercase',
        }}
        placeholder="ABCDE1234F"
      />
      {current.length === 10 && !valid && (
        <div role="alert" style={{ fontSize: 12, color: theme.css.danger }}>
          {t.invalidFormat ?? 'Invalid PAN format.'}
        </div>
      )}
    </div>
  );
});
TkxPanInput.displayName = 'TkxPanInput';

// ── Voter ID (EPIC) ─────────────────────────────────────────────────────────

const VOTER_ID_PATTERN = /^[A-Z]{3}[0-9]{7}$/;

export function isValidVoterId(input: string): boolean {
  const s = input.toUpperCase().trim();
  return VOTER_ID_PATTERN.test(s);
}

export interface VoterIdChangePayload {
  raw: string;
  normalised: string;
  valid: boolean;
}

export interface TkxVoterIdInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (payload: VoterIdChangePayload) => void;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
}

export const TkxVoterIdInput = forwardRef<HTMLInputElement, TkxVoterIdInputProps>(
  function TkxVoterIdInput(
    { value, defaultValue, onChange, label, disabled, required, id, name, className, style },
    ref: Ref<HTMLInputElement>,
  ) {
    const theme = useTheme();
    const t = useLocale();
    const autoId = useId();
    const inputId = id ?? autoId;
    const isControlled = value !== undefined;
    const [inner, setInner] = useState((defaultValue ?? '').toUpperCase().slice(0, 10));
    const current = (isControlled ? value ?? '' : inner).toUpperCase().slice(0, 10);
    const valid = isValidVoterId(current);

    const handleChange = (raw: string) => {
      const next = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
      if (!isControlled) setInner(next);
      onChange?.({ raw, normalised: next, valid: isValidVoterId(next) });
    };

    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
        {label && (
          <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 600, color: theme.css.text }}>
            {label}
            {required && <span style={{ color: theme.css.danger, marginLeft: 4 }}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="text"
          autoComplete="off"
          maxLength={10}
          value={current}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          required={required}
          aria-invalid={current.length === 10 && !valid}
          style={{
            width: '100%',
            padding: '0 12px',
            minHeight: 40,
            border: `1px solid ${current.length === 10 && !valid ? theme.css.danger : theme.css.border}`,
            borderRadius: 8,
            background: theme.css.surface,
            color: theme.css.text,
            fontSize: 14,
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: 1.5,
            outline: 'none',
            textTransform: 'uppercase',
          }}
          placeholder="ABC1234567"
        />
        {current.length === 10 && !valid && (
          <div role="alert" style={{ fontSize: 12, color: theme.css.danger }}>
            {t.invalidFormat ?? 'Invalid Voter ID format.'}
          </div>
        )}
      </div>
    );
  },
);
TkxVoterIdInput.displayName = 'TkxVoterIdInput';

// ── Driving Licence ─────────────────────────────────────────────────────────

// State code (2 chars) + RTO code (2 digits) + (year 4 digits) + sequence (7 digits)
// Example: MH12 20100012345 → MH1220100012345
// Some states use a hyphen (DL-01-...) — we accept and normalise.
const DL_PATTERN = /^[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[0-9]{4}[-\s]?[0-9]{7}$/;
const DL_NORMALISED_LEN = 15;

export function isValidDrivingLicence(input: string): boolean {
  const stripped = input.toUpperCase().replace(/[\s-]/g, '');
  if (stripped.length !== DL_NORMALISED_LEN) return false;
  return /^[A-Z]{2}[0-9]{13}$/.test(stripped);
}

export interface DrivingLicenceChangePayload {
  raw: string;
  normalised: string;
  /** Pretty form: XX-NN-YYYY-NNNNNNN. */
  pretty: string;
  valid: boolean;
}

export interface TkxDrivingLicenceInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (payload: DrivingLicenceChangePayload) => void;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
}

function prettyDL(s: string): string {
  const x = s.toUpperCase().replace(/[\s-]/g, '');
  if (x.length === 0) return '';
  const parts = [x.slice(0, 2), x.slice(2, 4), x.slice(4, 8), x.slice(8)].filter(Boolean);
  return parts.join('-');
}

export const TkxDrivingLicenceInput = forwardRef<HTMLInputElement, TkxDrivingLicenceInputProps>(
  function TkxDrivingLicenceInput(
    { value, defaultValue, onChange, label, disabled, required, id, name, className, style },
    ref: Ref<HTMLInputElement>,
  ) {
    const theme = useTheme();
    const t = useLocale();
    const autoId = useId();
    const inputId = id ?? autoId;
    const isControlled = value !== undefined;
    const [inner, setInner] = useState((defaultValue ?? '').toUpperCase());
    const current = isControlled ? value ?? '' : inner;
    const normalised = current.toUpperCase().replace(/[\s-]/g, '').slice(0, DL_NORMALISED_LEN);
    const valid = isValidDrivingLicence(normalised);

    const handleChange = (raw: string) => {
      const next = raw.toUpperCase();
      if (!isControlled) setInner(next);
      const norm = next.replace(/[\s-]/g, '').slice(0, DL_NORMALISED_LEN);
      onChange?.({
        raw,
        normalised: norm,
        pretty: prettyDL(norm),
        valid: isValidDrivingLicence(norm),
      });
    };

    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
        {label && (
          <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 600, color: theme.css.text }}>
            {label}
            {required && <span style={{ color: theme.css.danger, marginLeft: 4 }}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="text"
          autoComplete="off"
          maxLength={20}
          value={current}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          required={required}
          aria-invalid={normalised.length === DL_NORMALISED_LEN && !valid}
          style={{
            width: '100%',
            padding: '0 12px',
            minHeight: 40,
            border: `1px solid ${normalised.length === DL_NORMALISED_LEN && !valid ? theme.css.danger : theme.css.border}`,
            borderRadius: 8,
            background: theme.css.surface,
            color: theme.css.text,
            fontSize: 14,
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: 1.2,
            outline: 'none',
            textTransform: 'uppercase',
          }}
          placeholder="MH-12-2010-0012345"
        />
        {normalised.length === DL_NORMALISED_LEN && !valid && (
          <div role="alert" style={{ fontSize: 12, color: theme.css.danger }}>
            {t.invalidFormat ?? 'Invalid Driving Licence format.'}
          </div>
        )}
      </div>
    );
  },
);
TkxDrivingLicenceInput.displayName = 'TkxDrivingLicenceInput';
