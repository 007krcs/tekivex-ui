'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxFormBuilder — visual form designer
//
// Design intent:
//   - Three-pane layout: palette · canvas · inspector
//   - Click a field type in the palette to append it (touch-friendly)
//   - Click a field on the canvas to select + edit in the inspector
//   - Reorder via ↑/↓ buttons (keyboard reachable, no drag DSL needed)
//   - Live preview tab that renders the actual form (validation included)
//   - Headless schema: parent owns the FormSchema, we emit onChange
//   - Zero runtime deps — uses native form elements + CSS custom props
//
// Schema shape is intentionally small + JSON-serialisable so consumers
// can persist it to a backend, version it, or hand it to a code generator.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useCallback,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type ReactNode,
} from 'react';

// ── Public types ────────────────────────────────────────────────────────────

export type FormFieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date';

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  /** Field name — used as the key in the submitted data object. */
  name: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  /** Options for select / radio. */
  options?: FormFieldOption[];
  /** Min / max for number + date inputs, or minLength / maxLength for text. */
  min?: number;
  max?: number;
  /** Regex pattern (text inputs only). Authored as a string for JSON safety. */
  pattern?: string;
}

export interface FormSchema {
  title?: string;
  description?: string;
  fields: FormField[];
}

export interface TkxFormBuilderProps {
  /** Current schema (controlled). */
  schema: FormSchema;
  /** Called whenever the schema changes. */
  onChange: (next: FormSchema) => void;
  /** Restrict the field types shown in the palette. */
  allowedTypes?: FormFieldType[];
  /** Initial active tab. Default 'design'. */
  defaultTab?: 'design' | 'preview' | 'json';
  /** Style overrides for the outer container. */
  style?: CSSProperties;
  className?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const ALL_TYPES: FormFieldType[] = [
  'text',
  'email',
  'number',
  'textarea',
  'select',
  'radio',
  'checkbox',
  'date',
];

const TYPE_LABELS: Record<FormFieldType, string> = {
  text: 'Text',
  email: 'Email',
  number: 'Number',
  textarea: 'Long text',
  select: 'Dropdown',
  radio: 'Radio group',
  checkbox: 'Checkbox',
  date: 'Date',
};

const TYPE_ICONS: Record<FormFieldType, string> = {
  text: '🔤',
  email: '✉️',
  number: '#️⃣',
  textarea: '📝',
  select: '🔽',
  radio: '🔘',
  checkbox: '☑️',
  date: '📅',
};

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function defaultLabelFor(type: FormFieldType, count: number): string {
  return `${TYPE_LABELS[type]} ${count}`;
}

function defaultNameFor(type: FormFieldType, count: number): string {
  return `${type}_${count}`;
}

function makeField(type: FormFieldType, existingCount: number): FormField {
  const idx = existingCount + 1;
  const base: FormField = {
    id: uid('fld'),
    type,
    name: defaultNameFor(type, idx),
    label: defaultLabelFor(type, idx),
  };
  if (type === 'select' || type === 'radio') {
    base.options = [
      { label: 'Option 1', value: 'option_1' },
      { label: 'Option 2', value: 'option_2' },
    ];
  }
  return base;
}

// Validate a single field given a value. Returns an error string or null.
export function validateField(field: FormField, value: unknown): string | null {
  const isEmpty =
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0);
  if (field.required && isEmpty) return `${field.label} is required`;
  if (isEmpty) return null;
  if (field.type === 'email' && typeof value === 'string') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email';
  }
  if (field.type === 'number' && typeof value === 'string') {
    const n = Number(value);
    if (Number.isNaN(n)) return 'Must be a number';
    if (field.min !== undefined && n < field.min) return `Must be ≥ ${field.min}`;
    if (field.max !== undefined && n > field.max) return `Must be ≤ ${field.max}`;
  }
  if (field.pattern && typeof value === 'string') {
    try {
      const re = new RegExp(field.pattern);
      if (!re.test(value)) return 'Format is invalid';
    } catch {
      // Bad pattern — ignore so the form still works.
    }
  }
  return null;
}

// ── Inner subcomponents ─────────────────────────────────────────────────────

function Palette({
  types,
  onAdd,
}: {
  types: FormFieldType[];
  onAdd: (type: FormFieldType) => void;
}) {
  return (
    <div
      role="toolbar"
      aria-label="Field types"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 12,
        borderRight: '1px solid var(--tkx-border, #2a2a3e)',
        minWidth: 180,
        background: 'var(--tkx-bg-subtle, #0d0d14)',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 4 }}>
        Add field
      </div>
      {types.map((t) => (
        <button
          key={t}
          type="button"
          data-testid={`palette-${t}`}
          onClick={() => onAdd(t)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            minHeight: 44,
            borderRadius: 6,
            border: '1px solid var(--tkx-border, #2a2a3e)',
            background: 'transparent',
            color: 'var(--tkx-fg, #e8e8f4)',
            fontSize: 13,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span aria-hidden="true">{TYPE_ICONS[t]}</span>
          <span>{TYPE_LABELS[t]}</span>
        </button>
      ))}
    </div>
  );
}

function Canvas({
  fields,
  selectedId,
  onSelect,
  onMove,
  onRemove,
}: {
  fields: FormField[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      role="list"
      aria-label="Form fields"
      style={{
        flex: 1,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 0,
        overflowY: 'auto',
      }}
    >
      {fields.length === 0 && (
        <div
          style={{
            padding: 32,
            textAlign: 'center',
            color: '#888',
            border: '1px dashed var(--tkx-border, #2a2a3e)',
            borderRadius: 8,
          }}
        >
          No fields yet — pick one from the palette to get started.
        </div>
      )}
      {fields.map((f, i) => {
        const selected = f.id === selectedId;
        return (
          <div
            key={f.id}
            role="listitem"
            data-testid={`canvas-field-${f.id}`}
            onClick={() => onSelect(f.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(f.id);
              }
            }}
            tabIndex={0}
            aria-selected={selected}
            style={{
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${selected ? 'var(--tkx-accent, #00f5d4)' : 'var(--tkx-border, #2a2a3e)'}`,
              background: selected ? 'rgba(0,245,212,0.06)' : 'var(--tkx-bg-subtle, #12121a)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 18 }}>
              {TYPE_ICONS[f.type]}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--tkx-fg, #e8e8f4)' }}>
                {f.label}
                {f.required && <span aria-hidden="true" style={{ color: '#ff006e', marginLeft: 4 }}>*</span>}
              </div>
              <div style={{ fontSize: 11, color: '#888', fontFamily: 'ui-monospace, monospace' }}>
                {f.type} · {f.name}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                aria-label={`Move ${f.label} up`}
                disabled={i === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(f.id, -1);
                }}
                style={iconBtn}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${f.label} down`}
                disabled={i === fields.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(f.id, 1);
                }}
                style={iconBtn}
              >
                ↓
              </button>
              <button
                type="button"
                aria-label={`Remove ${f.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(f.id);
                }}
                style={{ ...iconBtn, color: '#ff006e' }}
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const iconBtn: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 6,
  border: '1px solid var(--tkx-border, #2a2a3e)',
  background: 'transparent',
  color: 'var(--tkx-fg, #e8e8f4)',
  cursor: 'pointer',
  fontSize: 14,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

function Inspector({
  field,
  onPatch,
}: {
  field: FormField | null;
  onPatch: (patch: Partial<FormField>) => void;
}) {
  if (!field) {
    return (
      <div
        style={{
          minWidth: 260,
          padding: 16,
          borderLeft: '1px solid var(--tkx-border, #2a2a3e)',
          background: 'var(--tkx-bg-subtle, #0d0d14)',
          color: '#888',
          fontSize: 13,
        }}
      >
        Select a field to edit its properties.
      </div>
    );
  }
  const supportsOptions = field.type === 'select' || field.type === 'radio';
  const supportsPattern = field.type === 'text' || field.type === 'email';
  const supportsRange = field.type === 'number';
  return (
    <div
      style={{
        minWidth: 260,
        padding: 16,
        borderLeft: '1px solid var(--tkx-border, #2a2a3e)',
        background: 'var(--tkx-bg-subtle, #0d0d14)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        overflowY: 'auto',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>
        Properties
      </div>
      <LabelInput label="Label" value={field.label} onChange={(v) => onPatch({ label: v })} />
      <LabelInput
        label="Name (key)"
        value={field.name}
        onChange={(v) => onPatch({ name: v.replace(/[^a-zA-Z0-9_]/g, '_') })}
      />
      <LabelInput label="Placeholder" value={field.placeholder ?? ''} onChange={(v) => onPatch({ placeholder: v })} />
      <LabelInput label="Help text" value={field.helpText ?? ''} onChange={(v) => onPatch({ helpText: v })} />
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--tkx-fg, #e8e8f4)' }}>
        <input
          type="checkbox"
          checked={!!field.required}
          onChange={(e) => onPatch({ required: e.target.checked })}
        />
        Required
      </label>
      {supportsRange && (
        <>
          <LabelInput
            label="Min"
            value={field.min?.toString() ?? ''}
            onChange={(v) => onPatch({ min: v === '' ? undefined : Number(v) })}
            type="number"
          />
          <LabelInput
            label="Max"
            value={field.max?.toString() ?? ''}
            onChange={(v) => onPatch({ max: v === '' ? undefined : Number(v) })}
            type="number"
          />
        </>
      )}
      {supportsPattern && (
        <LabelInput
          label="Pattern (regex)"
          value={field.pattern ?? ''}
          onChange={(v) => onPatch({ pattern: v || undefined })}
        />
      )}
      {supportsOptions && (
        <OptionsEditor
          options={field.options ?? []}
          onChange={(options) => onPatch({ options })}
        />
      )}
    </div>
  );
}

function LabelInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: 'text' | 'number';
}) {
  const id = useId();
  return (
    <label htmlFor={id} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#aaa' }}>
      {label}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        style={{
          padding: '8px 10px',
          minHeight: 36,
          borderRadius: 6,
          border: '1px solid var(--tkx-border, #2a2a3e)',
          background: 'var(--tkx-bg, #0a0a0f)',
          color: 'var(--tkx-fg, #e8e8f4)',
          fontSize: 13,
        }}
      />
    </label>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: FormFieldOption[];
  onChange: (next: FormFieldOption[]) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 12, color: '#aaa' }}>Options</div>
      {options.map((opt, i) => (
        <div key={i} style={{ display: 'flex', gap: 4 }}>
          <input
            aria-label={`Option ${i + 1} label`}
            value={opt.label}
            onChange={(e) => {
              const next = options.slice();
              next[i] = { ...next[i], label: e.target.value };
              onChange(next);
            }}
            style={optionInput}
          />
          <input
            aria-label={`Option ${i + 1} value`}
            value={opt.value}
            onChange={(e) => {
              const next = options.slice();
              next[i] = { ...next[i], value: e.target.value };
              onChange(next);
            }}
            style={optionInput}
          />
          <button
            type="button"
            aria-label={`Remove option ${i + 1}`}
            onClick={() => onChange(options.filter((_, j) => j !== i))}
            style={{ ...iconBtn, color: '#ff006e' }}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...options, { label: `Option ${options.length + 1}`, value: `option_${options.length + 1}` }])}
        style={{
          padding: '6px 10px',
          minHeight: 36,
          borderRadius: 6,
          border: '1px dashed var(--tkx-border, #2a2a3e)',
          background: 'transparent',
          color: 'var(--tkx-fg, #e8e8f4)',
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        + Add option
      </button>
    </div>
  );
}

const optionInput: CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: '6px 8px',
  minHeight: 32,
  borderRadius: 6,
  border: '1px solid var(--tkx-border, #2a2a3e)',
  background: 'var(--tkx-bg, #0a0a0f)',
  color: 'var(--tkx-fg, #e8e8f4)',
  fontSize: 12,
};

// ── Live preview (renders the actual form) ──────────────────────────────────

function Preview({ schema }: { schema: FormSchema }) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null);

  const setValue = (name: string, value: unknown) => {
    setValues((v) => ({ ...v, [name]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string | null> = {};
    for (const f of schema.fields) {
      next[f.name] = validateField(f, values[f.name]);
    }
    setErrors(next);
    if (Object.values(next).every((x) => x === null)) {
      setSubmitted(values);
    } else {
      setSubmitted(null);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        flex: 1,
        padding: 24,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        maxWidth: 640,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {schema.title && <h2 style={{ margin: 0, color: 'var(--tkx-fg, #e8e8f4)' }}>{schema.title}</h2>}
      {schema.description && <p style={{ margin: 0, color: '#aaa' }}>{schema.description}</p>}
      {schema.fields.map((f) => (
        <PreviewField
          key={f.id}
          field={f}
          value={values[f.name]}
          error={errors[f.name] ?? null}
          onChange={(v) => setValue(f.name, v)}
        />
      ))}
      <button
        type="submit"
        style={{
          padding: '12px 20px',
          minHeight: 44,
          borderRadius: 8,
          border: 'none',
          background: 'var(--tkx-accent, #00f5d4)',
          color: '#0a0a0f',
          fontWeight: 700,
          cursor: 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        Submit
      </button>
      {submitted && (
        <pre
          data-testid="preview-submitted"
          style={{
            background: 'var(--tkx-bg-subtle, #0d0d14)',
            border: '1px solid var(--tkx-border, #2a2a3e)',
            borderRadius: 8,
            padding: 12,
            color: '#00f5d4',
            fontSize: 12,
            overflowX: 'auto',
          }}
        >
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </form>
  );
}

function PreviewField({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField;
  value: unknown;
  error: string | null;
  onChange: (v: unknown) => void;
}) {
  const id = useId();
  const labelEl = (
    <label htmlFor={id} style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--tkx-fg, #e8e8f4)' }}>
      {field.label}
      {field.required && <span aria-hidden="true" style={{ color: '#ff006e', marginLeft: 4 }}>*</span>}
    </label>
  );
  const helpEl = field.helpText && (
    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{field.helpText}</div>
  );
  const errorEl = error && (
    <div role="alert" style={{ fontSize: 12, color: '#ff006e', marginTop: 4 }}>
      {error}
    </div>
  );

  let control: ReactNode = null;
  switch (field.type) {
    case 'textarea':
      control = (
        <textarea
          id={id}
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          style={inputStyle}
        />
      );
      break;
    case 'select':
      control = (
        <select id={id} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
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
        <div role="radiogroup" aria-labelledby={id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(field.options ?? []).map((o) => (
            <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--tkx-fg, #e8e8f4)' }}>
              <input
                type="radio"
                name={field.name}
                value={o.value}
                checked={value === o.value}
                onChange={() => onChange(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      );
      break;
    case 'checkbox':
      control = (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--tkx-fg, #e8e8f4)' }}>
          <input
            id={id}
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
          {field.placeholder || 'Yes'}
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
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      );
  }

  return (
    <div>
      {labelEl}
      {control}
      {helpEl}
      {errorEl}
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  minHeight: 44,
  borderRadius: 8,
  border: '1px solid var(--tkx-border, #2a2a3e)',
  background: 'var(--tkx-bg, #0a0a0f)',
  color: 'var(--tkx-fg, #e8e8f4)',
  fontSize: 14,
  boxSizing: 'border-box',
};

// ── Main component ──────────────────────────────────────────────────────────

export function TkxFormBuilder({
  schema,
  onChange,
  allowedTypes = ALL_TYPES,
  defaultTab = 'design',
  style,
  className,
}: TkxFormBuilderProps) {
  const [tab, setTab] = useState<'design' | 'preview' | 'json'>(defaultTab);
  const [selectedId, setSelectedId] = useState<string | null>(
    schema.fields[0]?.id ?? null,
  );

  const selectedField = useMemo(
    () => schema.fields.find((f) => f.id === selectedId) ?? null,
    [schema.fields, selectedId],
  );

  const addField = useCallback(
    (type: FormFieldType) => {
      const field = makeField(type, schema.fields.length);
      onChange({ ...schema, fields: [...schema.fields, field] });
      setSelectedId(field.id);
    },
    [schema, onChange],
  );

  const moveField = useCallback(
    (id: string, dir: -1 | 1) => {
      const i = schema.fields.findIndex((f) => f.id === id);
      if (i < 0) return;
      const j = i + dir;
      if (j < 0 || j >= schema.fields.length) return;
      const next = schema.fields.slice();
      [next[i], next[j]] = [next[j], next[i]];
      onChange({ ...schema, fields: next });
    },
    [schema, onChange],
  );

  const removeField = useCallback(
    (id: string) => {
      onChange({ ...schema, fields: schema.fields.filter((f) => f.id !== id) });
      if (selectedId === id) setSelectedId(null);
    },
    [schema, onChange, selectedId],
  );

  const patchField = useCallback(
    (patch: Partial<FormField>) => {
      if (!selectedField) return;
      onChange({
        ...schema,
        fields: schema.fields.map((f) => (f.id === selectedField.id ? { ...f, ...patch } : f)),
      });
    },
    [schema, onChange, selectedField],
  );

  return (
    <div
      className={className}
      data-testid="tkx-form-builder"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 600,
        border: '1px solid var(--tkx-border, #2a2a3e)',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--tkx-bg, #0a0a0f)',
        color: 'var(--tkx-fg, #e8e8f4)',
        fontFamily: 'inherit',
        ...style,
      }}
    >
      <div
        role="tablist"
        aria-label="Form builder views"
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--tkx-border, #2a2a3e)',
          background: 'var(--tkx-bg-subtle, #0d0d14)',
        }}
      >
        {(['design', 'preview', 'json'] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            data-testid={`tab-${id}`}
            onClick={() => setTab(id)}
            style={{
              padding: '12px 18px',
              minHeight: 44,
              border: 'none',
              background: tab === id ? 'var(--tkx-bg, #0a0a0f)' : 'transparent',
              color: tab === id ? 'var(--tkx-accent, #00f5d4)' : '#aaa',
              borderBottom: tab === id ? '2px solid var(--tkx-accent, #00f5d4)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {id}
          </button>
        ))}
      </div>

      {tab === 'design' && (
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Palette types={allowedTypes} onAdd={addField} />
          <Canvas
            fields={schema.fields}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMove={moveField}
            onRemove={removeField}
          />
          <Inspector field={selectedField} onPatch={patchField} />
        </div>
      )}

      {tab === 'preview' && (
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Preview schema={schema} />
        </div>
      )}

      {tab === 'json' && (
        <pre
          data-testid="json-view"
          style={{
            flex: 1,
            margin: 0,
            padding: 16,
            overflow: 'auto',
            background: 'var(--tkx-bg-subtle, #0d0d14)',
            color: '#00f5d4',
            fontSize: 12,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          {JSON.stringify(schema, null, 2)}
        </pre>
      )}
    </div>
  );
}
