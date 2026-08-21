'use client';

// ── TkxQuantumForm ────────────────────────────────────────────────────────────
// Quantum-AI powered smart form. Field types, validation rules, labels, and
// placeholders are automatically inferred from field names via
// inferFieldIntelligence() from the quantum-ai engine.

import { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../themes';
import { inferFieldIntelligence, type FieldIntelligence } from '../engine/quantum-ai';
import { tkx } from '../engine/tkx';
import { sanitizeString } from '../engine/security';

// ── Public API ────────────────────────────────────────────────────────────────

export interface QuantumFieldConfig {
  name: string;
  label?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

export interface TkxQuantumFormProps {
  fields: QuantumFieldConfig[];
  onSubmit: (values: Record<string, string>) => void | Promise<void>;
  submitLabel?: string;
  layout?: 'vertical' | 'horizontal';
  showConfidence?: boolean;
  showQuantumState?: boolean;
}

// ── Validation runner ─────────────────────────────────────────────────────────

function runValidation(
  rule: string,
  ruleValue: number | string | undefined,
  fieldValue: string,
  allValues: Record<string, string>,
): boolean {
  const v = fieldValue.trim();
  switch (rule) {
    case 'required':
      return v !== '';
    case 'email':
    case 'pattern':
      if (typeof ruleValue === 'string') {
        try {
          return v === '' || new RegExp(ruleValue).test(v);
        } catch {
          return true;
        }
      }
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    case 'phone':
      return v === '' || /^\+?[\d\s\-()]{7,15}$/.test(v);
    case 'url':
      return v === '' || /^https?:\/\/.+/.test(v);
    case 'minLength':
    case 'min': {
      const n = Number(ruleValue ?? 0);
      return v === '' || (isNaN(Number(v)) ? v.length >= n : Number(v) >= n);
    }
    case 'maxLength':
    case 'max': {
      const n = Number(ruleValue ?? Infinity);
      return v === '' || (isNaN(Number(v)) ? v.length <= n : Number(v) <= n);
    }
    case 'integer':
      return v === '' || /^\d+$/.test(v);
    case 'alphanumeric':
      return v === '' || /^[a-zA-Z0-9]+$/.test(v);
    case 'match': {
      const otherField = typeof ruleValue === 'string' ? ruleValue : 'password';
      return v === (allValues[otherField] ?? '');
    }
    default:
      return true;
  }
}

// ── Bloch Sphere qubit visualizer ─────────────────────────────────────────────

interface QubitProps {
  phase: number;
  collapsed: boolean;
  primaryColor: string;
  borderColor: string;
}

function QubitVisualizer({ phase, collapsed, primaryColor, borderColor }: QubitProps) {
  const cx = 12;
  const cy = 12;
  const r = 10;
  const theta = collapsed ? 0 : phase;
  const phi = collapsed ? 0 : phase * 1.618;
  const tipX = cx + r * Math.sin(theta) * Math.cos(phi);
  const tipY = cy - r * Math.cos(theta);

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ flexShrink: 0, opacity: collapsed ? 0.4 : 1, transition: 'opacity 0.6s' }}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={borderColor} strokeWidth="0.8" />
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.3} fill="none" stroke={borderColor} strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={borderColor} strokeWidth="0.5" />
      <line
        x1={cx} y1={cy} x2={tipX} y2={tipY}
        stroke={primaryColor} strokeWidth="1.5"
        style={{ transition: collapsed ? 'all 0.6s ease-out' : 'none' }}
      />
      <circle cx={tipX} cy={tipY} r="2" fill={primaryColor}
        style={{ transition: collapsed ? 'all 0.6s ease-out' : 'none' }} />
    </svg>
  );
}

// ── Confidence Badge ──────────────────────────────────────────────────────────

function ConfidenceBadge({
  confidence,
  theme,
}: {
  confidence: number;
  theme: ReturnType<typeof useTheme>;
}) {
  // confidence is 0-1 in the existing engine
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 80 ? theme.css.success :
    pct >= 60 ? theme.css.warning :
    theme.css.danger;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        fontSize: '10px',
        fontWeight: 600,
        padding: '1px 5px',
        borderRadius: '999px',
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        marginLeft: '6px',
        verticalAlign: 'middle',
        letterSpacing: '0.03em',
      }}
    >
      ⚛ {pct}%
    </span>
  );
}

// ── Single field renderer ─────────────────────────────────────────────────────

interface FieldRendererProps {
  config: QuantumFieldConfig;
  intel: FieldIntelligence;
  qubitPhase: number;
  value: string;
  error: string;
  touched: boolean;
  showConfidence: boolean;
  showQuantumState: boolean;
  collapsed: boolean;
  onChange: (v: string) => void;
  onBlur: () => void;
  theme: ReturnType<typeof useTheme>;
  mounted: boolean;
  index: number;
}

function FieldRenderer({
  config,
  intel,
  qubitPhase,
  value,
  error,
  touched,
  showConfidence,
  showQuantumState,
  collapsed,
  onChange,
  onBlur,
  theme,
  mounted,
  index,
}: FieldRendererProps) {
  const resolvedType = config.type ?? intel.type;
  const resolvedLabel = config.label ?? intel.label;
  const resolvedPlaceholder = config.placeholder ?? intel.placeholder;
  const resolvedRequired =
    config.required !== undefined
      ? config.required
      : intel.validations.some((v) => v.rule === 'required');

  const safeLabel = sanitizeString(resolvedLabel);
  const isTextarea = resolvedType === 'textarea';
  const hasError = touched && error !== '';
  const fieldId = `qf-${config.name}`;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    border: `1.5px solid ${hasError ? theme.css.danger : theme.css.border}`,
    borderRadius: '8px',
    backgroundColor: theme.css.surface,
    color: theme.css.text,
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    resize: isTextarea ? 'vertical' : undefined,
    minHeight: isTextarea ? '80px' : undefined,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'scaleY(1)' : 'scaleY(0.92)',
        transition: `opacity 0.35s ease ${index * 60}ms, transform 0.35s ease ${index * 60}ms`,
        transformOrigin: 'top',
      }}
    >
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {showQuantumState && (
          <QubitVisualizer
            phase={qubitPhase}
            collapsed={collapsed}
            primaryColor={theme.css.primary}
            borderColor={theme.css.border}
          />
        )}
        <label
          htmlFor={fieldId}
          style={{ fontSize: '13px', fontWeight: 500, color: theme.css.text, cursor: 'pointer' }}
        >
          {safeLabel}
          {resolvedRequired && (
            <span aria-hidden="true" style={{ color: theme.css.danger, marginLeft: '3px' }}>*</span>
          )}
        </label>
        {showConfidence && <ConfidenceBadge confidence={intel.confidence} theme={theme} />}
      </div>

      {/* Input / Textarea */}
      {isTextarea ? (
        <textarea
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={resolvedPlaceholder}
          aria-invalid={hasError}
          aria-required={resolvedRequired}
          style={inputStyle}
        />
      ) : (
        <input
          id={fieldId}
          type={resolvedType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={resolvedPlaceholder}
          aria-invalid={hasError}
          aria-required={resolvedRequired}
          style={inputStyle}
        />
      )}

      {/* Error */}
      {hasError && (
        <span
          role="alert"
          style={{
            fontSize: '12px',
            color: theme.css.danger,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {sanitizeString(error)}
        </span>
      )}
    </div>
  );
}

// ── Deterministic qubit phase from field name ─────────────────────────────────

function fieldPhase(name: string): number {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h & 0xffff) / 0xffff * Math.PI * 2;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TkxQuantumForm({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  layout = 'vertical',
  showConfidence = true,
  showQuantumState = false,
}: TkxQuantumFormProps) {
  const theme = useTheme();

  // Compute inferred intelligence once per field name
  const intelligences = fields.map((f) => inferFieldIntelligence(f.name));

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, ''])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const validateField = useCallback(
    (name: string, currentValues: Record<string, string>): string => {
      const fieldConfig = fields.find((f) => f.name === name);
      const intel = intelligences[fields.findIndex((f) => f.name === name)];
      if (!fieldConfig || !intel) return '';
      const value = currentValues[name] ?? '';

      for (const { rule, value: ruleValue, message } of intel.validations) {
        if (rule === 'required' && fieldConfig.required === false) continue;
        if (!runValidation(rule, ruleValue, value, currentValues)) {
          return message;
        }
      }
      return '';
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fields],
  );

  const validateAll = useCallback(
    (currentValues: Record<string, string>): Record<string, string> => {
      const errs: Record<string, string> = {};
      for (const field of fields) {
        const err = validateField(field.name, currentValues);
        if (err) errs[field.name] = err;
      }
      return errs;
    },
    [fields, validateField],
  );

  const handleChange = useCallback(
    (name: string, value: string) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        if (touched[name]) {
          setErrors((e) => ({ ...e, [name]: validateField(name, next) }));
          // Re-validate confirm password when password changes (entanglement)
          if (name === 'password') {
            const confirmName = fields.find((f) =>
              ['confirmpassword', 'confirm_password', 'passwordconfirm'].includes(
                f.name.toLowerCase().replace(/[\s_-]/g, ''),
              ),
            )?.name;
            if (confirmName && touched[confirmName]) {
              setErrors((e) => ({ ...e, [confirmName]: validateField(confirmName, next) }));
            }
          }
        }
        return next;
      });
      setCollapsed(true);
    },
    [fields, touched, validateField],
  );

  const handleBlur = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      setErrors((prev) => ({ ...prev, [name]: validateField(name, values) }));
    },
    [values, validateField],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const allTouched = Object.fromEntries(fields.map((f) => [f.name, true]));
      setTouched(allTouched);
      const errs = validateAll(values);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
      setSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setSubmitting(false);
      }
    },
    [fields, values, validateAll, onSubmit],
  );

  // Overall confidence: average of all inferred confidences (0–1), converted to %
  const overallConfidence = intelligences.length > 0
    ? Math.round(
        (intelligences.reduce((s, i) => s + i.confidence, 0) / intelligences.length) * 100,
      )
    : 0;
  const confidenceColor =
    overallConfidence >= 80 ? theme.css.success :
    overallConfidence >= 60 ? theme.css.warning :
    theme.css.danger;

  const isHorizontal = layout === 'horizontal';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={tkx('w-full')}
      style={{
        backgroundColor: theme.css.surface,
        border: `1px solid ${theme.css.border}`,
        borderRadius: '12px',
        padding: '24px',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* ⚛ Quantum AI badge */}
      <span
        aria-label="Powered by Quantum AI"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          fontSize: '10px',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: '999px',
          backgroundColor: `${theme.css.primary}20`,
          color: theme.css.primary,
          border: `1px solid ${theme.css.primary}44`,
          letterSpacing: '0.04em',
          userSelect: 'none',
        }}
      >
        ⚛ Quantum AI
      </span>

      {/* Overall confidence meter */}
      {showConfidence && (
        <div style={{ marginBottom: '20px', paddingRight: '100px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <span style={{ fontSize: '11px', color: theme.css.textMuted, fontWeight: 500 }}>
              Form Intelligence Confidence
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: confidenceColor }}>
              {overallConfidence}%
            </span>
          </div>
          <div
            style={{
              height: '4px',
              borderRadius: '4px',
              backgroundColor: theme.css.border,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${overallConfidence}%`,
                backgroundColor: confidenceColor,
                borderRadius: '4px',
                transition: 'width 0.8s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Fields */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isHorizontal ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {fields.map((field, index) => (
          <FieldRenderer
            key={field.name}
            config={field}
            intel={intelligences[index]!}
            qubitPhase={fieldPhase(field.name)}
            value={values[field.name] ?? ''}
            error={errors[field.name] ?? ''}
            touched={touched[field.name] ?? false}
            showConfidence={showConfidence}
            showQuantumState={showQuantumState}
            collapsed={collapsed}
            onChange={(v) => handleChange(field.name, v)}
            onBlur={() => handleBlur(field.name)}
            theme={theme}
            mounted={mounted}
            index={index}
          />
        ))}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%',
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: submitting ? `${theme.css.primary}88` : theme.css.primary,
          color: theme.css.bg,
          fontSize: '14px',
          fontWeight: 700,
          fontFamily: 'inherit',
          cursor: submitting ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.15s, opacity 0.15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {submitting ? (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ animation: 'qf-spin 0.8s linear infinite' }}
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Processing…
          </>
        ) : (
          sanitizeString(submitLabel)
        )}
      </button>

      <style>{`@keyframes qf-spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

TkxQuantumForm.displayName = 'TkxQuantumForm';