'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxAutoForm — render a complete, working, accessible, security-hardened form
// from a declarative schema. No manual field wiring.
//
// This is the runtime counterpart to TkxFormBuilder: the builder *designs* a
// FormSchema (and emits it as JSON), TkxAutoForm *renders* one in production.
// Author a schema by hand, fetch it from an API, or pipe it straight out of the
// builder — `<TkxAutoForm schema={schema} onSubmit={...} />` and you have a live
// form with validation, an accessible error summary, themed controls, and
// kernel-grade input sanitisation.
//
// Security: on submit, every string value is run through the kernel
// (sanitizeUnicode → sanitizeString, optionally scrubPII) before it reaches
// your onSubmit handler. Those primitives emit SecurityEvents, so a
// <TkxSecurityDashboard /> on the page lights up as users submit.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useId,
  useRef,
  useState,
  useCallback,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString, sanitizeUnicode, scrubPII } from '../engine/security';
import { validateField, type FormField, type FormSchema } from './TkxFormBuilder';
// FormSchema / FormField / FormFieldType / FormFieldOption / validateField are
// re-exported from the package root via TkxFormBuilder — import them from
// 'tekivex-ui' alongside TkxAutoForm.

export interface TkxAutoFormProps {
  /** The form definition. Same shape TkxFormBuilder produces. */
  schema: FormSchema;
  /** Initial field values, keyed by field `name`. */
  defaultValues?: Record<string, unknown>;
  /** Called with the validated (and, by default, sanitised) values on submit. */
  onSubmit?: (data: Record<string, unknown>) => void;
  /** Called on every value change with the current (raw) values. */
  onChange?: (values: Record<string, unknown>) => void;
  /** Submit button label. Default "Submit". */
  submitLabel?: string;
  /**
   * Run string values through the security kernel (sanitizeUnicode →
   * sanitizeString) before handing them to onSubmit. Default `true`.
   */
  sanitize?: boolean;
  /**
   * Additionally redact PII (email, cards, SSN, phone, API keys) from string
   * values before onSubmit — e.g. when the payload is forwarded to an LLM.
   * Default `false`.
   */
  redactPII?: boolean;
  /** Validate a field when it loses focus, not only on submit. Default `true`. */
  validateOnBlur?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Sanitise a single string through the kernel per the active options. */
function hardenString(raw: string, sanitize: boolean, redact: boolean): string {
  let out = raw;
  if (sanitize) out = sanitizeString(sanitizeUnicode(out));
  if (redact) out = scrubPII(out);
  return out;
}

export function TkxAutoForm({
  schema,
  defaultValues,
  onSubmit,
  onChange,
  submitLabel = 'Submit',
  sanitize = true,
  redactPII = false,
  validateOnBlur = true,
  className,
  style,
}: TkxAutoFormProps) {
  const theme = useTheme();
  // Tolerate a missing/partial schema (e.g. data still loading): treat it as an
  // empty form rather than crashing on `schema.fields`.
  const fields = schema?.fields ?? [];
  const [values, setValues] = useState<Record<string, unknown>>(() => ({ ...defaultValues }));
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [showSummary, setShowSummary] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const setValue = useCallback(
    (name: string, value: unknown) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  const validateOne = useCallback(
    (field: FormField) => {
      const err = validateField(field, values[field.name]);
      setErrors((prev) => ({ ...prev, [field.name]: err }));
      return err;
    },
    [values],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const nextErrors: Record<string, string | null> = {};
      let firstInvalid: string | null = null;
      for (const f of fields) {
        const err = validateField(f, values[f.name]);
        nextErrors[f.name] = err;
        if (err && firstInvalid === null) firstInvalid = f.name;
      }
      setErrors(nextErrors);

      if (firstInvalid) {
        setShowSummary(true);
        // Move focus to the summary so screen readers announce the failures.
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }

      setShowSummary(false);

      // Build the clean payload. String values pass through the kernel.
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        const v = values[f.name];
        payload[f.name] =
          typeof v === 'string' ? hardenString(v, sanitize, redactPII) : v;
      }
      onSubmit?.(payload);
    },
    [fields, values, sanitize, redactPII, onSubmit],
  );

  const invalidFields = fields.filter((f) => errors[f.name]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className={className}
      aria-label={schema?.title ?? 'Form'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        color: theme.css.text,
        fontFamily: 'inherit',
        ...style,
      }}
    >
      {schema?.title && (
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: theme.css.text }}>
          {schema.title}
        </h2>
      )}
      {schema?.description && (
        <p style={{ margin: 0, color: theme.css.textMuted, fontSize: 14 }}>{schema.description}</p>
      )}

      {/* Accessible error summary */}
      {showSummary && invalidFields.length > 0 && (
        <div
          ref={summaryRef}
          role="alert"
          tabIndex={-1}
          style={{
            border: `1px solid ${theme.css.danger}`,
            background: theme.css.surfaceAlt,
            borderRadius: 8,
            padding: '12px 14px',
            outline: 'none',
          }}
        >
          <strong style={{ color: theme.css.danger, fontSize: 14 }}>
            {invalidFields.length} field{invalidFields.length === 1 ? '' : 's'} need
            {invalidFields.length === 1 ? 's' : ''} attention
          </strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13 }}>
            {invalidFields.map((f) => (
              <li key={f.id}>
                <a
                  href={`#tkx-af-${f.name}`}
                  style={{ color: theme.css.danger }}
                  onClick={(ev) => {
                    ev.preventDefault();
                    formRef.current
                      ?.querySelector<HTMLElement>(`#tkx-af-${CSS.escape(f.name)}`)
                      ?.focus();
                  }}
                >
                  {f.label}: {errors[f.name]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {fields.map((f) => (
        <AutoFormField
          key={f.id}
          field={f}
          value={values[f.name]}
          error={errors[f.name] ?? null}
          onChange={(v) => setValue(f.name, v)}
          onBlur={() => validateOnBlur && validateOne(f)}
        />
      ))}

      <button
        type="submit"
        style={{
          alignSelf: 'flex-start',
          padding: '12px 22px',
          minHeight: 44,
          borderRadius: 8,
          border: 'none',
          background: theme.css.primary,
          color: theme.css.bg,
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {submitLabel}
      </button>
    </form>
  );
}

// ── Field renderer ───────────────────────────────────────────────────────────

interface AutoFormFieldProps {
  field: FormField;
  value: unknown;
  error: string | null;
  onChange: (v: unknown) => void;
  onBlur: () => void;
}

function AutoFormField({ field, value, error, onChange, onBlur }: AutoFormFieldProps) {
  const theme = useTheme();
  const reactId = useId();
  // Stable id derived from the field name so the error-summary anchors resolve.
  const id = `tkx-af-${field.name}`;
  const helpId = `${reactId}-help`;
  const errId = `${reactId}-err`;
  const describedBy = [field.helpText ? helpId : null, error ? errId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    minHeight: 44,
    borderRadius: 8,
    border: `1px solid ${error ? theme.css.danger : theme.css.border}`,
    background: theme.css.surface,
    color: theme.css.text,
    fontSize: 14,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const labelEl = (
    <label
      htmlFor={field.type === 'radio' ? undefined : id}
      id={field.type === 'radio' ? id : undefined}
      style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: theme.css.text, fontSize: 14 }}
    >
      {field.label}
      {field.required && (
        <span aria-hidden="true" style={{ color: theme.css.danger, marginLeft: 4 }}>
          *
        </span>
      )}
    </label>
  );

  let control: ReactNode;
  switch (field.type) {
    case 'textarea':
      control = (
        <textarea
          id={id}
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          rows={4}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          style={inputStyle}
        />
      );
      break;
    case 'select':
      control = (
        <select
          id={id}
          value={(value as string) ?? ''}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          style={inputStyle}
        >
          <option value="">{field.placeholder ?? 'Choose…'}</option>
          {(field.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case 'radio':
      control = (
        <div
          role="radiogroup"
          aria-labelledby={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
        >
          {(field.options ?? []).map((o) => (
            <label
              key={o.value}
              style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.css.text }}
            >
              <input
                type="radio"
                name={field.name}
                value={o.value}
                checked={value === o.value}
                onChange={() => onChange(o.value)}
                onBlur={onBlur}
              />
              {o.label}
            </label>
          ))}
        </div>
      );
      break;
    case 'checkbox':
      control = (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.css.text }}>
          <input
            id={id}
            type="checkbox"
            checked={!!value}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            onChange={(e) => onChange(e.target.checked)}
            onBlur={onBlur}
          />
          {field.placeholder || field.label}
        </label>
      );
      break;
    default:
      control = (
        <input
          id={id}
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type}
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          pattern={field.pattern}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          style={inputStyle}
        />
      );
  }

  return (
    <div>
      {/* checkbox renders its own inline label */}
      {field.type !== 'checkbox' && labelEl}
      {control}
      {field.helpText && (
        <div id={helpId} style={{ fontSize: 12, color: theme.css.textMuted, marginTop: 4 }}>
          {field.helpText}
        </div>
      )}
      {error && (
        <div id={errId} role="alert" style={{ fontSize: 12, color: theme.css.danger, marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}
