// ─────────────────────────────────────────────────────────────────────────────
// Template registry — every template gets a stable id + display metadata
// + a reference to its component. The generator UI reads from this to build
// the picker and to render the chosen template with the user's data.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  TemplateInfo,
  ResumeTemplateComponent,
  BiodataTemplateComponent,
} from './types';

import {
  ResumeModernMinimalist,
  ResumeExecutiveClassic,
  ResumeTechStack,
  ResumeCreativeBold,
  ResumeCompactATS,
  ResumePhotoPortfolio,
  ResumeSideRule,
  ResumeEditorial,
  ResumeMonoCode,
  ResumeBanner,
  ResumeTwoTone,
  ResumeEngineerBrief,
} from './resume/templates';

import {
  BiodataTraditionalRoyal,
  BiodataModernUniversal,
  BiodataSapphire,
  BiodataFloralPastel,
  BiodataCharcoal,
  BiodataCompact,
  BiodataBorderedFrame,
  BiodataMinimalist,
  BiodataDualPane,
  BiodataSaffron,
  BiodataEmeraldCards,
  BiodataGeometric,
} from './biodata/templates';

export const RESUME_TEMPLATES: { info: TemplateInfo; Component: ResumeTemplateComponent }[] = [
  { info: { id: 'resume-modern-minimalist',  kind: 'resume', name: 'Modern Minimalist',  description: 'Clean blue accent, ATS-friendly, single-column' }, Component: ResumeModernMinimalist },
  { info: { id: 'resume-executive-classic',  kind: 'resume', name: 'Executive Classic',  description: 'Serif, centered header, board-room feel' },        Component: ResumeExecutiveClassic },
  { info: { id: 'resume-tech-stack',         kind: 'resume', name: 'Tech Stack',         description: 'Dark sidebar with categorised skill chips' },     Component: ResumeTechStack },
  { info: { id: 'resume-creative-bold',      kind: 'resume', name: 'Creative Bold',      description: 'Gradient banner, designer / brand role vibe' },   Component: ResumeCreativeBold },
  { info: { id: 'resume-compact-ats',        kind: 'resume', name: 'Compact ATS',        description: 'Pure text, zero graphics, max ATS readability' }, Component: ResumeCompactATS },
  { info: { id: 'resume-photo-portfolio',    kind: 'resume', name: 'Photo Portfolio',    description: 'Round photo + amber accent, portfolio-style' },   Component: ResumePhotoPortfolio },
  { info: { id: 'resume-side-rule',          kind: 'resume', name: 'Side Rule',          description: 'Two-column with violet dividing rule' },          Component: ResumeSideRule },
  { info: { id: 'resume-editorial',          kind: 'resume', name: 'Editorial',          description: 'Magazine-style serif, two-column summary' },      Component: ResumeEditorial },
  { info: { id: 'resume-mono-code',          kind: 'resume', name: 'Mono Code',          description: 'Dark terminal palette, monospace, dev-focused' }, Component: ResumeMonoCode },
  { info: { id: 'resume-banner',             kind: 'resume', name: 'Banner',             description: 'Solid-color top banner, classic & versatile' },   Component: ResumeBanner },
  { info: { id: 'resume-two-tone',           kind: 'resume', name: 'Two-Tone',           description: 'Ivory background with navy left rule' },          Component: ResumeTwoTone },
  { info: { id: 'resume-engineer-brief',     kind: 'resume', name: 'Engineer Brief',     description: 'Dense info-rich grid, IC engineer style' },       Component: ResumeEngineerBrief },
];

export const BIODATA_TEMPLATES: { info: TemplateInfo; Component: BiodataTemplateComponent }[] = [
  { info: { id: 'biodata-traditional-royal',  kind: 'biodata', name: 'Traditional Royal',  description: 'Cream + maroon, ornamental corners' },         Component: BiodataTraditionalRoyal },
  { info: { id: 'biodata-modern-universal',   kind: 'biodata', name: 'Modern Universal',   description: 'Religion-agnostic, sage green, photo + grid' }, Component: BiodataModernUniversal },
  { info: { id: 'biodata-sapphire',           kind: 'biodata', name: 'Sapphire Sober',     description: 'Navy banner, professional + restrained' },     Component: BiodataSapphire },
  { info: { id: 'biodata-floral-pastel',      kind: 'biodata', name: 'Floral Pastel',      description: 'Soft lavender accent, modern' },               Component: BiodataFloralPastel },
  { info: { id: 'biodata-charcoal',           kind: 'biodata', name: 'Charcoal Modern',    description: 'Dark background, amber accent' },              Component: BiodataCharcoal },
  { info: { id: 'biodata-compact',            kind: 'biodata', name: 'Compact',            description: 'Two-column dense, no photo, fits one page' },  Component: BiodataCompact },
  { info: { id: 'biodata-bordered-frame',     kind: 'biodata', name: 'Bordered Frame',     description: 'Double-line decorative border, warm tones' },  Component: BiodataBorderedFrame },
  { info: { id: 'biodata-minimalist',         kind: 'biodata', name: 'Minimalist',         description: 'Swiss-style, photo + huge name' },             Component: BiodataMinimalist },
  { info: { id: 'biodata-dual-pane',          kind: 'biodata', name: 'Dual Pane',          description: 'Cyan sidebar with photo + contact' },          Component: BiodataDualPane },
  { info: { id: 'biodata-saffron',            kind: 'biodata', name: 'Saffron',            description: 'Warm orange gradient banner' },                Component: BiodataSaffron },
  { info: { id: 'biodata-emerald-cards',      kind: 'biodata', name: 'Emerald Cards',      description: 'Each section in its own soft-green card' },    Component: BiodataEmeraldCards },
  { info: { id: 'biodata-geometric',          kind: 'biodata', name: 'Geometric',          description: 'Mandala-style ornaments + violet' },           Component: BiodataGeometric },
];

export const ALL_TEMPLATES = [...RESUME_TEMPLATES, ...BIODATA_TEMPLATES];

export function findTemplate(id: string) {
  return ALL_TEMPLATES.find((t) => t.info.id === id);
}
