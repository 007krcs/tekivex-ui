// ─────────────────────────────────────────────────────────────────────────────
// Biodata template — a reference implementation for South-Asian-style
// matrimonial biodata. Designed to be copy-modify-fork; not a one-size-fits-
// all component. Demonstrates how to compose the PDF primitives.
// ─────────────────────────────────────────────────────────────────────────────

import {
  TkxPDFDocument,
  TkxPDFPage,
  TkxPDFView,
  TkxPDFText,
  TkxPDFRow,
  TkxPDFColumn,
  TkxPDFImage,
} from '../primitives';
import { TkxPDFWatermark } from '../watermark';
import type { PDFThemeTokens } from '../theme';
import { printLight } from '../theme';

export interface BiodataField {
  label: string;
  value: string;
}

export interface BiodataData {
  name: string;
  /** URL or data-URL. Will be rendered at 120×150 by default. */
  photoUrl?: string;
  /** Lines of contact info / location shown under the name. */
  subtitle?: string[];
  /** Personal details section: DOB, height, complexion, etc. */
  personal: BiodataField[];
  /** Education + profession. */
  education: BiodataField[];
  /** Family details. */
  family: BiodataField[];
  /** Optional: contact details. */
  contact?: BiodataField[];
}

export interface BiodataTemplateProps {
  data: BiodataData;
  theme?: PDFThemeTokens;
  /** Watermark text (e.g. session ID). Defaults to no watermark. */
  watermark?: string | string[];
  /** Optional decorative title above the name (e.g. ॥ श्री ॥). */
  blessing?: string;
}

function FieldGrid({ fields, theme }: { fields: BiodataField[]; theme: PDFThemeTokens }) {
  return (
    <TkxPDFView style={{ marginBottom: 12 }}>
      {fields.map((f, i) => (
        <TkxPDFRow key={i} style={{ marginBottom: 4 }}>
          <TkxPDFText size={10} color={theme.textMuted} style={{ width: 130 }}>
            {f.label}
          </TkxPDFText>
          <TkxPDFText size={10} color={theme.text} style={{ flex: 1 }}>
            {f.value}
          </TkxPDFText>
        </TkxPDFRow>
      ))}
    </TkxPDFView>
  );
}

function SectionHeading({ children, theme }: { children: string; theme: PDFThemeTokens }) {
  return (
    <TkxPDFView
      style={{
        backgroundColor: theme.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginBottom: 8,
        marginTop: 4,
      }}
    >
      <TkxPDFText size={11} weight="bold" color={theme.bg} style={{ textTransform: 'uppercase' }}>
        {children}
      </TkxPDFText>
    </TkxPDFView>
  );
}

export function BiodataTemplate({
  data,
  theme = printLight,
  watermark,
  blessing,
}: BiodataTemplateProps) {
  return (
    <TkxPDFDocument theme={theme} title={`${data.name} — Biodata`}>
      <TkxPDFPage size="A4" margin={36}>
        {watermark && <TkxPDFWatermark text={watermark} pattern="tiled" opacity={0.07} />}

        {blessing && (
          <TkxPDFText
            size={14}
            color={theme.primary}
            align="center"
            style={{ marginBottom: 6 }}
          >
            {blessing}
          </TkxPDFText>
        )}

        {/* Header — name + photo */}
        <TkxPDFRow style={{ marginBottom: 16 }} gap={16} align="flex-start">
          <TkxPDFColumn flex={2}>
            <TkxPDFText size={22} weight="bold" color={theme.text}>
              {data.name}
            </TkxPDFText>
            {data.subtitle?.map((line, i) => (
              <TkxPDFText key={i} size={10} color={theme.textMuted} style={{ marginTop: 2 }}>
                {line}
              </TkxPDFText>
            ))}
          </TkxPDFColumn>
          {data.photoUrl && (
            <TkxPDFColumn>
              <TkxPDFImage
                src={data.photoUrl}
                width={120}
                height={150}
                rounded={4}
                style={{ borderColor: theme.border, borderWidth: 1 }}
              />
            </TkxPDFColumn>
          )}
        </TkxPDFRow>

        <SectionHeading theme={theme}>Personal Details</SectionHeading>
        <FieldGrid fields={data.personal} theme={theme} />

        <SectionHeading theme={theme}>Education & Profession</SectionHeading>
        <FieldGrid fields={data.education} theme={theme} />

        <SectionHeading theme={theme}>Family Details</SectionHeading>
        <FieldGrid fields={data.family} theme={theme} />

        {data.contact && data.contact.length > 0 && (
          <>
            <SectionHeading theme={theme}>Contact</SectionHeading>
            <FieldGrid fields={data.contact} theme={theme} />
          </>
        )}

        {/* Footer */}
        <TkxPDFView
          style={{
            position: 'absolute',
            bottom: 18,
            left: 36,
            right: 36,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            paddingTop: 4,
          }}
        >
          <TkxPDFText size={8} color={theme.textMuted} align="center">
            Generated with tekivex-pdf · {new Date().toISOString().slice(0, 10)}
          </TkxPDFText>
        </TkxPDFView>
      </TkxPDFPage>
    </TkxPDFDocument>
  );
}
