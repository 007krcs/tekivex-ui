/**
 * @shubhbio/templates
 *
 * Biodata template registry. Each template is a pure function from a Biodata
 * data object to a tekivex-ui Scene. The same Scene drives DOM preview,
 * canvas image export, and PDF rendering — guaranteeing pixel parity.
 *
 * Phase 1 ships the registry shell + a single placeholder template per
 * religion / style. Phase 2 fleshes out the visual designs. Phase 5 wires
 * them into PDF output.
 */

import type { Scene, TkxBiodataTemplate } from 'tekivex-ui';
import { createTemplateRegistry, PAGE_A4 } from 'tekivex-ui';
import type { Biodata } from '@shubhbio/schemas';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const pageMargin = 36;
const accentColors: Record<string, { primary: string; surface: string }> = {
  'hindu-traditional': { primary: '#a16207', surface: '#fef3c7' },
  'muslim-traditional': { primary: '#15803d', surface: '#dcfce7' },
  'christian-traditional': { primary: '#0e7490', surface: '#cffafe' },
  'sikh-traditional': { primary: '#c2410c', surface: '#ffedd5' },
  'jain-traditional': { primary: '#7c2d12', surface: '#fff1e0' },
  'modern-minimal': { primary: '#111827', surface: '#f3f4f6' },
  'royal-card': { primary: '#7c2d12', surface: '#fef3c7' },
  'resume-style': { primary: '#1e293b', surface: '#f1f5f9' },
};

function placeholder(templateId: string, data: Partial<Biodata>): Scene {
  const accent = accentColors[templateId] ?? accentColors['modern-minimal'];
  const fullName = data.personal?.fullName ?? 'Your Name';
  return {
    width: PAGE_A4.width,
    height: PAGE_A4.height,
    background: '#ffffff',
    meta: { title: `Biodata — ${fullName}`, author: 'ShubhBio' },
    nodes: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: PAGE_A4.width,
        height: 80,
        fill: accent.primary,
      },
      {
        type: 'text',
        x: pageMargin,
        y: 30,
        text: 'Marriage Biodata',
        fontSize: 22,
        fontWeight: 'bold',
        fill: '#ffffff',
      },
      {
        type: 'text',
        x: PAGE_A4.width - pageMargin,
        y: 30,
        text: fullName,
        fontSize: 18,
        fontWeight: 'bold',
        align: 'right',
        fill: '#ffffff',
      },
      {
        type: 'rect',
        x: pageMargin,
        y: 100,
        width: PAGE_A4.width - pageMargin * 2,
        height: 40,
        fill: accent.surface,
      },
      {
        type: 'text',
        x: pageMargin + 12,
        y: 116,
        text: `Template — ${templateId}`,
        fontSize: 12,
        fill: accent.primary,
      },
      {
        type: 'text',
        x: pageMargin,
        y: 200,
        text: 'Phase 2 will replace this placeholder with the real design.',
        fontSize: 12,
        fill: '#6b7280',
        maxWidth: PAGE_A4.width - pageMargin * 2,
      },
    ],
  };
}

function defineTemplate(
  id: string,
  label: string,
  audience: string,
): TkxBiodataTemplate<Biodata> {
  return {
    id,
    label,
    audience,
    build: (data: Biodata): Scene => placeholder(id, data),
  };
}

/* -------------------------------------------------------------------------- */
/* Built-in templates                                                          */
/* -------------------------------------------------------------------------- */

export const HINDU_TRADITIONAL = defineTemplate(
  'hindu-traditional',
  'Hindu Traditional',
  'hindu',
);
export const MUSLIM_TRADITIONAL = defineTemplate(
  'muslim-traditional',
  'Muslim Traditional',
  'muslim',
);
export const CHRISTIAN_TRADITIONAL = defineTemplate(
  'christian-traditional',
  'Christian Traditional',
  'christian',
);
export const SIKH_TRADITIONAL = defineTemplate(
  'sikh-traditional',
  'Sikh Traditional',
  'sikh',
);
export const JAIN_TRADITIONAL = defineTemplate(
  'jain-traditional',
  'Jain Traditional',
  'jain',
);
export const MODERN_MINIMAL = defineTemplate(
  'modern-minimal',
  'Modern Minimal',
  'all',
);
export const ROYAL_CARD = defineTemplate('royal-card', 'Royal Wedding Card', 'all');
export const RESUME_STYLE = defineTemplate('resume-style', 'Resume Style', 'all');

export const ALL_TEMPLATES: ReadonlyArray<TkxBiodataTemplate<Biodata>> = [
  HINDU_TRADITIONAL,
  MUSLIM_TRADITIONAL,
  CHRISTIAN_TRADITIONAL,
  SIKH_TRADITIONAL,
  JAIN_TRADITIONAL,
  MODERN_MINIMAL,
  ROYAL_CARD,
  RESUME_STYLE,
];

/** Pre-populated registry the web app and api both consume. */
export function createBiodataRegistry() {
  const r = createTemplateRegistry();
  for (const t of ALL_TEMPLATES) r.register(t);
  return r;
}
