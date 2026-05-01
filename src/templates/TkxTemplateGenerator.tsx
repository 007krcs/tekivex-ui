// ─────────────────────────────────────────────────────────────────────────────
// TkxTemplateGenerator — the smart UI that turns user data + a chosen
// template into a downloadable PDF.
//
// Three tabs:
//   1. Data    — form fields wired to ResumeData / BiodataData
//   2. Pick    — gallery of all 24 templates, click to select
//   3. Preview — live render of the chosen template with the user's data
//
// Download:
//   - Free templates: button is enabled, opens window.print() with a
//     scoped stylesheet that hides everything except the template page.
//     Browsers' "Save as PDF" path produces an A4 PDF with crisp output.
//   - Paid templates (priceCents > 0): download is gated. Until the
//     `paidIds` prop reports the template id as paid, the button shows
//     "🔒 Unlock — ₹X" and clicks fire `onPurchase(info)` so the host
//     app can wire its real payment flow.
//
// All state is local; the generator is fully self-contained and does
// not require a router, query client, or context provider.
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { RESUME_TEMPLATES, BIODATA_TEMPLATES, findTemplate } from './registry';
import type {
  ResumeData,
  BiodataData,
  TemplateInfo,
  TemplateKind,
} from './types';
import { SAMPLE_RESUME, SAMPLE_BIODATA } from './dummy-data';

export interface TkxTemplateGeneratorProps {
  /** Which kind of template to generate. Default 'resume'. */
  kind?: TemplateKind;
  /** Initial template id. If omitted, uses the first template of `kind`. */
  initialTemplateId?: string;
  /** Pre-fill the form with this resume data. */
  initialResumeData?: ResumeData;
  /** Pre-fill the form with this biodata. */
  initialBiodataData?: BiodataData;
  /** Set of template ids the current user has unlocked. */
  paidIds?: Set<string>;
  /** Per-template prices (cents / paisa). 0 or unset = free. */
  pricing?: Record<string, { priceCents: number; priceCurrency?: string }>;
  /**
   * If true (default), every template is locked unless its id is in
   * `paidIds`. The download button reads "🔒 Request access" (or
   * "🔒 Unlock — ₹X" when a price is configured), and clicks fire
   * `onPurchase`. Set false to revert to the older behaviour where
   * only templates with a price > 0 are locked.
   */
  lockedByDefault?: boolean;
  /** Fired when a locked template's download is attempted. */
  onPurchase?: (info: TemplateInfo) => void;
  /** Fired after a successful download trigger. */
  onDownload?: (info: TemplateInfo) => void;
  /** Outer style. */
  style?: CSSProperties;
  className?: string;
}

type Tab = 'data' | 'pick' | 'preview';

export function TkxTemplateGenerator({
  kind = 'resume',
  initialTemplateId,
  initialResumeData,
  initialBiodataData,
  paidIds,
  pricing,
  lockedByDefault = true,
  onPurchase,
  onDownload,
  style,
  className,
}: TkxTemplateGeneratorProps) {
  // ── State ──
  const allOfKind = kind === 'resume' ? RESUME_TEMPLATES : BIODATA_TEMPLATES;
  const [tab, setTab] = useState<Tab>('data');
  const [templateId, setTemplateId] = useState<string>(
    initialTemplateId ?? allOfKind[0].info.id,
  );
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData ?? SAMPLE_RESUME);
  const [biodataData, setBiodataData] = useState<BiodataData>(initialBiodataData ?? SAMPLE_BIODATA);

  const entry = useMemo(() => findTemplate(templateId) ?? allOfKind[0], [templateId, allOfKind]);

  // Resolve price from prop overrides falling back to template metadata
  const priceInfo = useMemo(() => {
    const fromProp = pricing?.[entry.info.id];
    if (fromProp) return fromProp;
    if (entry.info.priceCents) {
      return { priceCents: entry.info.priceCents, priceCurrency: entry.info.priceCurrency };
    }
    return null;
  }, [entry.info.id, entry.info.priceCents, entry.info.priceCurrency, pricing]);

  // Lock logic. Three states:
  //   priced   — price configured AND not in paidIds → "🔒 Unlock — ₹X"
  //   gated    — no price, lockedByDefault true, not in paidIds → "🔒 Request access"
  //   unlocked — paidIds has it OR (no price AND lockedByDefault=false) → "⬇ Download"
  const isPaid = !!priceInfo && priceInfo.priceCents > 0;
  const isInPaid = paidIds?.has(entry.info.id) ?? false;
  const isUnlocked = isInPaid || (!isPaid && !lockedByDefault);

  const handleDownload = () => {
    if (!isUnlocked) {
      onPurchase?.(entry.info);
      return;
    }
    onDownload?.(entry.info);
    triggerPrint();
  };

  const formattedPrice = useMemo(() => {
    if (!priceInfo) return '';
    const currency = priceInfo.priceCurrency ?? '$';
    const amount = (priceInfo.priceCents / 100).toFixed(0);
    return `${currency}${amount}`;
  }, [priceInfo]);

  // ── Tabs UI ──
  return (
    <div
      className={className}
      data-testid="tkx-template-generator"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--tkx-bg, #0a0a0f)',
        color: 'var(--tkx-fg, #e8e8f4)',
        border: '1px solid var(--tkx-border, #2a2a3e)',
        borderRadius: 12,
        overflow: 'hidden',
        minHeight: 480,
        ...style,
      }}
    >
      {/* Tab strip */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--tkx-border, #2a2a3e)',
          background: 'var(--tkx-bg-subtle, #0d0d14)',
        }}
      >
        {(['data', 'pick', 'preview'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            data-testid={`tab-${t}`}
            style={tabStyle(tab === t)}
          >
            {t === 'data' ? '① Your data' : t === 'pick' ? `② Pick · ${allOfKind.length} templates` : '③ Preview & download'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <DownloadButton
          isPaid={isPaid}
          isUnlocked={isUnlocked}
          formattedPrice={formattedPrice}
          onClick={handleDownload}
        />
      </div>

      {/* Locked banner — visible whenever the active template is locked,
          so the gate is unmistakable on the preview tab too. */}
      {!isUnlocked && (
        <div
          role="status"
          data-testid="locked-banner"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            background: 'rgba(255, 190, 11, 0.08)',
            borderBottom: '1px solid rgba(255, 190, 11, 0.25)',
            color: '#ffbe0b',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span aria-hidden="true">🔒</span>
          <span style={{ flex: 1 }}>
            <strong>Preview only.</strong>{' '}
            {isPaid
              ? `This template is paid (${formattedPrice}). Download unlocks after purchase.`
              : 'Templates are released on request. Click "Request access" to ask the team for the source download.'}
          </span>
        </div>
      )}

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {tab === 'data' && (
          kind === 'resume'
            ? <ResumeForm value={resumeData} onChange={setResumeData} />
            : <BiodataForm value={biodataData} onChange={setBiodataData} />
        )}
        {tab === 'pick' && (
          <TemplatePicker
            kind={kind}
            currentId={entry.info.id}
            pricing={pricing}
            paidIds={paidIds}
            lockedByDefault={lockedByDefault}
            onSelect={(id) => {
              setTemplateId(id);
              setTab('preview');
            }}
          />
        )}
        {tab === 'preview' && (
          <Preview
            entry={entry}
            data={kind === 'resume' ? resumeData : biodataData}
          />
        )}
      </div>
    </div>
  );
}

// ── DownloadButton ─────────────────────────────────────────────────────────

function DownloadButton({
  isPaid, isUnlocked, formattedPrice, onClick,
}: { isPaid: boolean; isUnlocked: boolean; formattedPrice: string; onClick: () => void }) {
  // Three states:
  //   unlocked          → "⬇ Download" (green) — fires print
  //   priced + locked   → "🔒 Unlock — ₹X" (amber) — fires onPurchase
  //   gated (no price)  → "🔒 Request access" (amber) — fires onPurchase
  let label: string;
  if (isUnlocked) {
    label = isPaid ? `⬇ Download (${formattedPrice})` : '⬇ Download';
  } else if (isPaid) {
    label = `🔒 Unlock — ${formattedPrice}`;
  } else {
    label = '🔒 Request access';
  }
  const accent = isUnlocked ? '#00f5d4' : '#ffbe0b';
  return (
    <button
      type="button"
      data-testid="download-button"
      onClick={onClick}
      style={{
        margin: '6px 8px',
        padding: '8px 16px',
        minHeight: 36,
        borderRadius: 8,
        border: `1px solid ${accent}`,
        background: `${accent}1a`,
        color: accent,
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

function tabStyle(active: boolean): CSSProperties {
  return {
    padding: '12px 18px',
    minHeight: 44,
    border: 'none',
    borderBottom: active ? '2px solid var(--tkx-accent, #00f5d4)' : '2px solid transparent',
    background: active ? 'var(--tkx-bg, #0a0a0f)' : 'transparent',
    color: active ? 'var(--tkx-accent, #00f5d4)' : '#aaa',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'inherit',
  };
}

// ── Picker ─────────────────────────────────────────────────────────────────

function TemplatePicker({
  kind, currentId, pricing, paidIds, lockedByDefault, onSelect,
}: {
  kind: TemplateKind;
  currentId: string;
  pricing?: Record<string, { priceCents: number; priceCurrency?: string }>;
  paidIds?: Set<string>;
  lockedByDefault: boolean;
  onSelect: (id: string) => void;
}) {
  const list = kind === 'resume' ? RESUME_TEMPLATES : BIODATA_TEMPLATES;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 12,
      }}
      data-testid="template-picker"
    >
      {list.map(({ info }) => {
        const price = pricing?.[info.id] ?? (info.priceCents ? { priceCents: info.priceCents, priceCurrency: info.priceCurrency } : null);
        const isPriced = !!price && price.priceCents > 0;
        const inPaid = paidIds?.has(info.id) ?? false;
        const unlocked = inPaid || (!isPriced && !lockedByDefault);
        const active = info.id === currentId;

        // Chip label: "unlocked", "₹X", or "🔒 Locked"
        let chipLabel: string | null = null;
        let chipBg = 'rgba(255,190,11,0.14)';
        let chipFg = '#ffbe0b';
        if (unlocked) {
          chipLabel = 'unlocked';
          chipBg = 'rgba(0,245,212,0.14)';
          chipFg = '#00f5d4';
        } else if (isPriced) {
          chipLabel = `${price!.priceCurrency ?? '$'}${(price!.priceCents / 100).toFixed(0)}`;
        } else {
          chipLabel = '🔒 Locked';
        }

        return (
          <button
            key={info.id}
            type="button"
            data-testid={`template-card-${info.id}`}
            onClick={() => onSelect(info.id)}
            style={{
              textAlign: 'left',
              padding: 14,
              borderRadius: 10,
              border: `1px solid ${active ? 'rgba(0,245,212,0.6)' : 'rgba(255,255,255,0.08)'}`,
              background: active ? 'rgba(0,245,212,0.06)' : 'rgba(18,20,38,0.55)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              transition: 'border-color 0.15s, transform 0.15s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{info.name}</span>
              <span
                style={{
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 999,
                  background: chipBg,
                  color: chipFg,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}
              >
                {chipLabel}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.5 }}>{info.description}</div>
          </button>
        );
      })}
    </div>
  );
}

// ── Preview ────────────────────────────────────────────────────────────────

function Preview({
  entry, data,
}: {
  entry: ReturnType<typeof findTemplate>;
  data: ResumeData | BiodataData;
}) {
  if (!entry) return null;
  const Comp = entry.Component as (props: { data: ResumeData | BiodataData }) => React.ReactElement;
  return (
    <div
      data-testid="template-preview"
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '12px 0',
        background: 'rgba(8,10,25,0.3)',
        borderRadius: 8,
      }}
    >
      <div
        id="tkx-template-print-region"
        style={{
          transform: 'scale(0.7)',
          transformOrigin: 'top center',
          boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
        }}
      >
        <Comp data={data as never} />
      </div>
    </div>
  );
}

// ── Forms ──────────────────────────────────────────────────────────────────
//
// Minimal forms — every top-level scalar field plus a JSON textarea for
// arrays (experience / education / siblings / etc.) so users can paste
// structured data without us shipping deeply nested form widgets.

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#aaa' }}>
      {label}
      {children}
    </label>
  );
}
const inputStyle: CSSProperties = {
  padding: '8px 10px', minHeight: 36, borderRadius: 6,
  border: '1px solid var(--tkx-border, #2a2a3e)',
  background: 'var(--tkx-bg-subtle, #0d0d14)',
  color: 'var(--tkx-fg, #e8e8f4)',
  fontSize: 13, fontFamily: 'inherit',
};

/**
 * Image upload control. Reads the picked file via FileReader and emits a
 * data: URI so the template can embed it without a server. Caps file size
 * at 4 MB so we don't blow up the print payload, and rejects non-image
 * MIME types defensively even though `accept="image/*"` already filters
 * the picker.
 */
function ImageUploadField({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  testId: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Pick an image file.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('File is over 4 MB — please pick a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') onChange(result);
    };
    reader.onerror = () => setError('Could not read the file.');
    reader.readAsDataURL(file);
  };
  return (
    <Field label={label}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {value ? (
          <img
            src={value}
            alt=""
            style={{
              width: 56, height: 56, objectFit: 'cover',
              borderRadius: 6, border: '1px solid var(--tkx-border, #2a2a3e)',
            }}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: 56, height: 56, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, border: '1px dashed var(--tkx-border, #2a2a3e)',
              background: 'var(--tkx-bg-subtle, #0d0d14)',
              fontSize: 18, color: '#666',
            }}
          >
            🖼️
          </div>
        )}
        <label
          style={{
            padding: '8px 14px', minHeight: 36, borderRadius: 6,
            border: '1px solid var(--tkx-border, #2a2a3e)',
            background: 'var(--tkx-bg-subtle, #0d0d14)',
            cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center',
          }}
        >
          {value ? 'Replace' : 'Upload image'}
          <input
            type="file"
            accept="image/*"
            data-testid={testId}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.currentTarget.value = ''; // allow re-picking the same file
            }}
            style={{ display: 'none' }}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            data-testid={`${testId}-clear`}
            style={{
              padding: '6px 10px', minHeight: 32, borderRadius: 6,
              border: '1px solid rgba(255,0,110,0.4)',
              background: 'transparent', color: '#ff7eaf',
              cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
            }}
          >
            Remove
          </button>
        )}
      </div>
      {error && (
        <div role="alert" style={{ marginTop: 6, color: '#ff7eaf', fontSize: 12 }}>
          {error}
        </div>
      )}
    </Field>
  );
}

function ResumeForm({ value, onChange }: { value: ResumeData; onChange: (v: ResumeData) => void }) {
  const set = (patch: Partial<ResumeData>) => onChange({ ...value, ...patch });
  return (
    <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
      <Field label="Full name"><input data-testid="form-fullName" style={inputStyle} value={value.fullName} onChange={(e) => set({ fullName: e.target.value })} /></Field>
      <Field label="Title / headline"><input style={inputStyle} value={value.title} onChange={(e) => set({ title: e.target.value })} /></Field>
      <Field label="Email"><input style={inputStyle} type="email" value={value.email} onChange={(e) => set({ email: e.target.value })} /></Field>
      <Field label="Phone"><input style={inputStyle} value={value.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
      <Field label="Location"><input style={inputStyle} value={value.location} onChange={(e) => set({ location: e.target.value })} /></Field>
      <ImageUploadField
        label="Photo (optional)"
        value={value.photo}
        onChange={(next) => set({ photo: next })}
        testId="resume-photo-upload"
      />
      <div style={{ gridColumn: '1 / -1' }}>
        <Field label="Summary">
          <textarea style={{ ...inputStyle, minHeight: 80 }} value={value.summary ?? ''} onChange={(e) => set({ summary: e.target.value })} />
        </Field>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <Field label="Experience (JSON)">
          <textarea
            style={{ ...inputStyle, minHeight: 140, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
            value={JSON.stringify(value.experience, null, 2)}
            onChange={(e) => {
              try { set({ experience: JSON.parse(e.target.value) }); } catch { /* invalid JSON — leave as-is */ }
            }}
          />
        </Field>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <Field label="Education (JSON)">
          <textarea
            style={{ ...inputStyle, minHeight: 90, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
            value={JSON.stringify(value.education, null, 2)}
            onChange={(e) => {
              try { set({ education: JSON.parse(e.target.value) }); } catch { /* */ }
            }}
          />
        </Field>
      </div>
      <Field label="Skills (comma-separated)">
        <input
          style={inputStyle}
          value={(value.skills ?? []).join(', ')}
          onChange={(e) => set({ skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
        />
      </Field>
    </div>
  );
}

function BiodataForm({ value, onChange }: { value: BiodataData; onChange: (v: BiodataData) => void }) {
  const set = (patch: Partial<BiodataData>) => onChange({ ...value, ...patch });
  return (
    <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
      <Field label="Full name"><input data-testid="form-fullName" style={inputStyle} value={value.fullName} onChange={(e) => set({ fullName: e.target.value })} /></Field>
      <Field label="Date of birth"><input style={inputStyle} value={value.dateOfBirth} onChange={(e) => set({ dateOfBirth: e.target.value })} /></Field>
      <Field label="Time of birth"><input style={inputStyle} value={value.timeOfBirth ?? ''} onChange={(e) => set({ timeOfBirth: e.target.value })} /></Field>
      <Field label="Place of birth"><input style={inputStyle} value={value.placeOfBirth ?? ''} onChange={(e) => set({ placeOfBirth: e.target.value })} /></Field>
      <Field label="Height"><input style={inputStyle} value={value.height} onChange={(e) => set({ height: e.target.value })} /></Field>
      <Field label="Religion"><input style={inputStyle} value={value.religion ?? ''} onChange={(e) => set({ religion: e.target.value })} /></Field>
      <Field label="Mother tongue"><input style={inputStyle} value={value.motherTongue ?? ''} onChange={(e) => set({ motherTongue: e.target.value })} /></Field>
      <Field label="Occupation"><input style={inputStyle} value={value.occupation} onChange={(e) => set({ occupation: e.target.value })} /></Field>
      <Field label="Company"><input style={inputStyle} value={value.company ?? ''} onChange={(e) => set({ company: e.target.value })} /></Field>
      <Field label="Father name"><input style={inputStyle} value={value.fatherName} onChange={(e) => set({ fatherName: e.target.value })} /></Field>
      <Field label="Mother name"><input style={inputStyle} value={value.motherName} onChange={(e) => set({ motherName: e.target.value })} /></Field>
      <Field label="Phone"><input style={inputStyle} value={value.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} /></Field>
      <Field label="Email"><input style={inputStyle} value={value.contactEmail ?? ''} onChange={(e) => set({ contactEmail: e.target.value })} /></Field>
      <ImageUploadField
        label="Photo (optional)"
        value={value.photo}
        onChange={(next) => set({ photo: next })}
        testId="biodata-photo-upload"
      />
      <ImageUploadField
        label="Religious logo (optional, overrides auto-glyph)"
        value={value.customReligiousLogo}
        onChange={(next) => set({ customReligiousLogo: next })}
        testId="biodata-religious-logo-upload"
      />
      <Field label="Blessing line (optional)">
        <input
          style={inputStyle}
          value={value.blessing ?? ''}
          placeholder="e.g. Shubh Vivah · Bismillah · By His grace"
          onChange={(e) => set({ blessing: e.target.value })}
        />
      </Field>
      <div style={{ gridColumn: '1 / -1' }}>
        <Field label="Address">
          <textarea style={{ ...inputStyle, minHeight: 60 }} value={value.address} onChange={(e) => set({ address: e.target.value })} />
        </Field>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <Field label="About">
          <textarea style={{ ...inputStyle, minHeight: 80 }} value={value.about ?? ''} onChange={(e) => set({ about: e.target.value })} />
        </Field>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <Field label="Education (JSON)">
          <textarea
            style={{ ...inputStyle, minHeight: 100, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
            value={JSON.stringify(value.education, null, 2)}
            onChange={(e) => {
              try { set({ education: JSON.parse(e.target.value) }); } catch { /* */ }
            }}
          />
        </Field>
      </div>
    </div>
  );
}

// ── Print trigger ──────────────────────────────────────────────────────────
//
// Earlier strategy used `visibility: hidden` to hide the rest of the document
// during print. Problem: hidden elements still occupy layout space, so the
// browser would generate one print page per "hidden" page-worth of DOM —
// hence the user's "Print: 20 sheets" report. The fix is to print from an
// isolated context (a new window or hidden iframe) that contains *only*
// the template's outerHTML and the inline styles needed to render it.
//
// We use a hidden <iframe> rather than window.open() because:
//   - window.open is frequently blocked by pop-up blockers
//   - the iframe stays inside the user's tab → no extra browser window
//   - we can clean it up after the print dialog closes

function triggerPrint() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const region = document.getElementById('tkx-template-print-region');
  if (!region) return;

  // Find the actual A4 page node inside the print region — primitive.tsx
  // tags it with data-tkx-template-page="" so we don't have to know the
  // class/id structure of every individual template.
  const page = region.querySelector('[data-tkx-template-page]') as HTMLElement | null;
  if (!page) {
    // Fallback: print the whole region. Shouldn't happen in practice.
    window.print();
    return;
  }

  // Snapshot every <style> + <link rel=stylesheet> in the host document so
  // template-specific CSS (font imports, etc.) flows into the iframe.
  const styles = Array.from(
    document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>('style, link[rel="stylesheet"]')
  ).map((el) => el.outerHTML).join('\n');

  // Inline the page node's HTML — including any uploaded image src as a
  // data: URI, which embeds in the print payload directly.
  const pageHtml = page.outerHTML;

  // Hidden iframe takes up zero layout space.
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    ${styles}
    <style>
      html, body { margin: 0; padding: 0; background: #fff; }
      /* Drop any transform from the on-screen preview wrapper so the page
         renders at its natural A4 size, not 0.7× scaled. */
      [data-tkx-template-page] {
        transform: none !important;
        box-shadow: none !important;
        margin: 0 !important;
      }
      @page { margin: 0; size: A4; }
    </style>
  </head>
  <body>${pageHtml}</body>
</html>`);
  doc.close();

  const cleanup = () => {
    // Some browsers fire afterprint; others just resolve the print() call.
    // Either way, give the user a moment to see the dialog before tearing down.
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 500);
  };

  // Wait for the iframe to be fully ready (images inside data URIs, etc.)
  const printNow = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      iframe.contentWindow?.addEventListener('afterprint', cleanup);
      // Backstop in case afterprint never fires (Safari quirk)
      setTimeout(cleanup, 4000);
    }
  };

  // Defer one frame so the iframe's layout settles before we print.
  if (iframe.contentDocument?.readyState === 'complete') {
    setTimeout(printNow, 50);
  } else {
    iframe.addEventListener('load', () => setTimeout(printNow, 50));
  }
}

