// ─────────────────────────────────────────────────────────────────────────────
// Layout primitives — building blocks the resume + biodata templates compose
//
// Every template is roughly:
//   <Page accent={...}>
//     <Header />
//     <Section> contents </Section>
//   </Page>
//
// Pages render at A4 dimensions (210 × 297 mm) so print output is pixel-
// perfect. On screen they scale via CSS `transform: scale(...)` set by the
// surrounding preview component.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties, ReactNode } from 'react';

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

export interface PageProps {
  children: ReactNode;
  /** Background color. Default white. */
  background?: string;
  /** Default text color. Default near-black. */
  color?: string;
  /** Inner padding in mm. Default 14. */
  padding?: number;
  className?: string;
  style?: CSSProperties;
  /** Sets the Latin font family for the whole page. */
  fontFamily?: string;
}

/**
 * A4-sized page. Templates render their content inside this. Ready for
 * print at exactly 210 × 297 mm.
 */
export function Page({
  children,
  background = '#ffffff',
  color = '#1a1a1f',
  padding = 14,
  className,
  style,
  fontFamily = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
}: PageProps) {
  return (
    <div
      className={className}
      data-tkx-template-page=""
      style={{
        width: `${A4_WIDTH_MM}mm`,
        minHeight: `${A4_HEIGHT_MM}mm`,
        padding: `${padding}mm`,
        background,
        color,
        fontFamily,
        fontSize: '10.5pt',
        lineHeight: 1.45,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Section heading — a small, all-caps label with an accent rule.
 */
export function SectionHeading({
  children,
  accent,
  size = 'md',
}: {
  children: ReactNode;
  accent: string;
  size?: 'sm' | 'md';
}) {
  return (
    <h2
      style={{
        fontSize: size === 'md' ? '11pt' : '9.5pt',
        fontWeight: 800,
        color: accent,
        margin: '8mm 0 3mm',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        borderBottom: `0.5mm solid ${accent}`,
        paddingBottom: '1.5mm',
      }}
    >
      {children}
    </h2>
  );
}

/**
 * Two-column layout — sidebar + main. The sidebar holds contact + skills,
 * the main column holds experience + education. Sidebar width in mm.
 */
export function TwoColumn({
  sidebar,
  main,
  sidebarWidth = 65,
  sidebarBackground,
  sidebarColor,
  gap = 6,
}: {
  sidebar: ReactNode;
  main: ReactNode;
  sidebarWidth?: number;
  sidebarBackground?: string;
  sidebarColor?: string;
  gap?: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: `${gap}mm`,
        alignItems: 'stretch',
        marginTop: '4mm',
      }}
    >
      <aside
        style={{
          width: `${sidebarWidth}mm`,
          flex: `0 0 ${sidebarWidth}mm`,
          background: sidebarBackground,
          color: sidebarColor,
          padding: sidebarBackground ? '4mm' : 0,
          borderRadius: sidebarBackground ? '2mm' : 0,
        }}
      >
        {sidebar}
      </aside>
      <div style={{ flex: 1, minWidth: 0 }}>{main}</div>
    </div>
  );
}

/**
 * Row of label + value, used heavily in biodata templates.
 */
export function FieldRow({
  label,
  value,
  accent,
  labelWidth = 38,
}: {
  label: string;
  value: ReactNode;
  accent: string;
  labelWidth?: number;
}) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div
      style={{
        display: 'flex',
        marginBottom: '1.5mm',
        fontSize: '10pt',
      }}
    >
      <div
        style={{
          width: `${labelWidth}mm`,
          flex: `0 0 ${labelWidth}mm`,
          color: accent,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div style={{ flex: 1, color: '#222' }}>{value}</div>
    </div>
  );
}

/**
 * Hero / banner header used by several templates — name + title on a colored bar.
 */
export function HeaderBanner({
  name,
  subtitle,
  accent,
  textColor = '#ffffff',
  align = 'left',
  thin = false,
}: {
  name: string;
  subtitle?: string;
  accent: string;
  textColor?: string;
  align?: 'left' | 'center';
  thin?: boolean;
}) {
  return (
    <div
      style={{
        background: accent,
        color: textColor,
        padding: thin ? '6mm 8mm' : '10mm 8mm',
        borderRadius: '2mm',
        textAlign: align,
      }}
    >
      <h1 style={{ margin: 0, fontSize: thin ? '20pt' : '26pt', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
        {name}
      </h1>
      {subtitle && (
        <div style={{ marginTop: '2mm', fontSize: '11pt', opacity: 0.95, fontWeight: 500, letterSpacing: '0.04em' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

/**
 * Decorative ornamental corner — subtle geometric mandala-ish shape used
 * by a few biodata templates for visual flourish (purely geometric;
 * non-religious).
 */
export function CornerOrnament({
  color,
  size = 28,
  position = 'top-left',
}: {
  color: string;
  size?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const positionStyle: CSSProperties = {
    position: 'absolute',
    width: `${size}mm`,
    height: `${size}mm`,
  };
  if (position.startsWith('top')) positionStyle.top = 0;
  else positionStyle.bottom = 0;
  if (position.endsWith('left')) positionStyle.left = 0;
  else positionStyle.right = 0;

  return (
    <svg
      aria-hidden="true"
      style={positionStyle}
      viewBox="0 0 100 100"
    >
      <g stroke={color} strokeWidth={1} fill="none" opacity={0.6}>
        <circle cx="50" cy="50" r="35" />
        <circle cx="50" cy="50" r="25" />
        <circle cx="50" cy="50" r="15" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={50}
              y1={50}
              x2={50 + Math.cos(a) * 42}
              y2={50 + Math.sin(a) * 42}
            />
          );
        })}
      </g>
    </svg>
  );
}

/**
 * Helper: format experience date range. Empty `end` → "Present".
 */
export function dateRange(start?: string, end?: string): string {
  const s = start ?? '';
  const e = end && end.trim() !== '' ? end : 'Present';
  if (!s && e === 'Present') return 'Present';
  if (!s) return e;
  return `${s} – ${e}`;
}

// ── Religious / cultural marker ─────────────────────────────────────────────
//
// Matrimonial biodatas across cultures traditionally lead with a religious
// or cultural marker (Om, Cross, Khanda, etc.). These are cultural
// artifacts on a personal document — not religious endorsements — and
// most users expect them on a biodata for their faith.
//
// Mapping is conservative:
//   - Recognised religion strings get a Unicode glyph
//   - Unknown / blank → no mark renders
//   - Consumers can override via `mark` prop ('none' to suppress)
// ─────────────────────────────────────────────────────────────────────────────

export type ReligiousMarkOverride =
  | 'auto'
  | 'none'
  | 'om'        // Hindu: ॐ
  | 'cross'     // Christian: ✝
  | 'crescent'  // Muslim: ☪
  | 'khanda'    // Sikh: ☬
  | 'dharma'    // Buddhist: ☸
  | 'lotus';    // Jain / generic spiritual: 🪷

/** Map a free-form religion string + optional override to a glyph + name. */
export function symbolForReligion(
  religion?: string,
  override?: ReligiousMarkOverride,
): { glyph: string; label: string } | null {
  if (override === 'none') return null;

  const explicit: Record<string, { glyph: string; label: string }> = {
    om:       { glyph: 'ॐ', label: 'Om' },
    cross:    { glyph: '✝', label: 'Christian cross' },
    crescent: { glyph: '☪', label: 'Crescent and star' },
    khanda:   { glyph: '☬', label: 'Khanda' },
    dharma:   { glyph: '☸', label: 'Dharmachakra' },
    lotus:    { glyph: '🪷', label: 'Lotus' },
  };
  if (override && override in explicit) return explicit[override];

  if (!religion) return null;
  const r = religion.toLowerCase().trim();

  // Auto-derive from religion name
  if (/hindu|sanatan/.test(r))                        return explicit.om;
  if (/christian|catholic|protestant|orthodox/.test(r)) return explicit.cross;
  if (/muslim|islam/.test(r))                          return explicit.crescent;
  if (/sikh/.test(r))                                  return explicit.khanda;
  if (/buddhist|buddh/.test(r))                        return explicit.dharma;
  if (/jain/.test(r))                                  return explicit.lotus;

  return null;
}

/**
 * Religious header strip — renders a centered glyph (or custom logo)
 * + an optional blessing line above the biodata title.
 *
 * Resolution order:
 *   1. `customLogo` prop      → renders the user's uploaded image
 *      (takes precedence so users can ship a sect-specific or family
 *      monogram that the auto-glyph wouldn't capture)
 *   2. `override` prop        → forces a specific Unicode glyph
 *   3. `religion` field       → auto-derives a glyph
 *   4. nothing → null returned, header doesn't render at all
 */
export function ReligiousHeader({
  religion,
  override,
  blessing,
  color,
  size = 24,
  customLogo,
  customLogoLabel,
}: {
  religion?: string;
  override?: ReligiousMarkOverride;
  /** Optional short blessing line beneath the glyph. */
  blessing?: string;
  color: string;
  size?: number;
  /** URL / data-URI of a custom logo to render instead of the Unicode glyph. */
  customLogo?: string;
  /** Accessible label for the custom logo. Default "Custom religious symbol". */
  customLogoLabel?: string;
}) {
  // Custom logo wins outright
  if (customLogo) {
    return (
      <div style={{ textAlign: 'center', marginBottom: '3mm' }}>
        <img
          src={customLogo}
          alt={customLogoLabel ?? 'Custom religious symbol'}
          style={{
            height: `${size * 1.4}pt`,
            maxWidth: `${size * 2.2}pt`,
            objectFit: 'contain',
            display: 'inline-block',
          }}
        />
        {blessing && (
          <div
            style={{
              fontSize: '9pt',
              color,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              marginTop: '1.5mm',
              opacity: 0.85,
            }}
          >
            {blessing}
          </div>
        )}
      </div>
    );
  }

  const sym = symbolForReligion(religion, override);
  if (!sym) return null;
  return (
    <div style={{ textAlign: 'center', marginBottom: '3mm' }}>
      <div
        role="img"
        aria-label={sym.label}
        style={{
          fontSize: `${size}pt`,
          color,
          lineHeight: 1,
          fontFamily: '"Noto Sans", "Noto Sans Devanagari", "Noto Color Emoji", sans-serif',
        }}
      >
        {sym.glyph}
      </div>
      {blessing && (
        <div
          style={{
            fontSize: '9pt',
            color,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            marginTop: '1.5mm',
            opacity: 0.85,
          }}
        >
          {blessing}
        </div>
      )}
    </div>
  );
}

/**
 * Skills tag list — each skill rendered as a small pill.
 */
export function SkillTags({
  items,
  accent,
}: {
  items: string[];
  accent: string;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5mm' }}>
      {items.map((s, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            padding: '0.8mm 2mm',
            borderRadius: '1mm',
            background: `${accent}1a`,
            color: accent,
            fontSize: '8.5pt',
            fontWeight: 600,
            border: `0.2mm solid ${accent}55`,
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}
