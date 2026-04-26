// ─────────────────────────────────────────────────────────────────────────────
// Certificate template — formal recognition document.
// Landscape A4. Centered title, recipient, date, signature block.
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

export interface CertificateData {
  /** Title (e.g. "Certificate of Completion"). */
  title: string;
  /** Recipient name. */
  recipient: string;
  /** Body text — what was achieved. */
  description: string;
  /** Date of issue. */
  date: string;
  /** Issuing organisation. */
  issuer: { name: string; signatory?: string; signatureUrl?: string };
  /** Optional second signatory. */
  cosignatory?: { name: string; title?: string; signatureUrl?: string };
  /** Optional logo URL. */
  logoUrl?: string;
  /** Verification id printed at the bottom. */
  verificationId?: string;
}

export interface CertificateTemplateProps {
  data: CertificateData;
  theme?: PDFThemeTokens;
  watermark?: string | string[];
}

export function CertificateTemplate({ data, theme = printLight, watermark }: CertificateTemplateProps) {
  return (
    <TkxPDFDocument theme={theme} title={`Certificate — ${data.recipient}`}>
      <TkxPDFPage size="A4" margin={[36, 60, 36, 60]} orientation="landscape">
        {watermark && <TkxPDFWatermark text={watermark} pattern="single" opacity={0.05} fontSize={120} />}

        {/* Decorative top bar */}
        <TkxPDFView style={{ height: 8, backgroundColor: theme.primary, marginBottom: 24 }} />

        {data.logoUrl && (
          <TkxPDFView style={{ alignItems: 'center', marginBottom: 16 }}>
            <TkxPDFImage src={data.logoUrl} width={80} height={80} />
          </TkxPDFView>
        )}

        <TkxPDFText
          size={36}
          weight="bold"
          color={theme.primary}
          align="center"
          style={{ letterSpacing: 2, marginBottom: 8 }}
        >
          {data.title.toUpperCase()}
        </TkxPDFText>

        <TkxPDFText
          size={12}
          color={theme.textMuted}
          align="center"
          style={{ marginBottom: 36 }}
        >
          THIS IS PRESENTED TO
        </TkxPDFText>

        <TkxPDFText
          size={42}
          weight="bold"
          color={theme.text}
          align="center"
          font="Times-Italic"
          style={{ marginBottom: 28 }}
        >
          {data.recipient}
        </TkxPDFText>

        <TkxPDFText
          size={13}
          color={theme.text}
          align="center"
          style={{ marginBottom: 36, lineHeight: 1.6 }}
        >
          {data.description}
        </TkxPDFText>

        {/* Signatures row */}
        <TkxPDFRow justify="space-around" style={{ marginTop: 48, paddingHorizontal: 60 }}>
          <TkxPDFColumn style={{ alignItems: 'center', flex: 1 }}>
            {data.issuer.signatureUrl && (
              <TkxPDFImage src={data.issuer.signatureUrl} width={120} height={40} />
            )}
            <TkxPDFView style={{ borderTopWidth: 1, borderTopColor: theme.text, width: 160, marginTop: 4 }} />
            <TkxPDFText size={11} color={theme.text} style={{ marginTop: 6 }} weight="bold">
              {data.issuer.signatory ?? data.issuer.name}
            </TkxPDFText>
            <TkxPDFText size={9} color={theme.textMuted}>
              {data.issuer.name}
            </TkxPDFText>
          </TkxPDFColumn>

          <TkxPDFColumn style={{ alignItems: 'center', flex: 1 }}>
            <TkxPDFText size={11} color={theme.textMuted}>Date</TkxPDFText>
            <TkxPDFText size={14} color={theme.text} weight="bold" style={{ marginTop: 4 }}>
              {data.date}
            </TkxPDFText>
          </TkxPDFColumn>

          {data.cosignatory && (
            <TkxPDFColumn style={{ alignItems: 'center', flex: 1 }}>
              {data.cosignatory.signatureUrl && (
                <TkxPDFImage src={data.cosignatory.signatureUrl} width={120} height={40} />
              )}
              <TkxPDFView style={{ borderTopWidth: 1, borderTopColor: theme.text, width: 160, marginTop: 4 }} />
              <TkxPDFText size={11} color={theme.text} style={{ marginTop: 6 }} weight="bold">
                {data.cosignatory.name}
              </TkxPDFText>
              {data.cosignatory.title && (
                <TkxPDFText size={9} color={theme.textMuted}>
                  {data.cosignatory.title}
                </TkxPDFText>
              )}
            </TkxPDFColumn>
          )}
        </TkxPDFRow>

        {data.verificationId && (
          <TkxPDFView style={{ position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' }}>
            <TkxPDFText size={8} color={theme.textMuted}>
              Verify at /verify/{data.verificationId}
            </TkxPDFText>
          </TkxPDFView>
        )}

        {/* Decorative bottom bar */}
        <TkxPDFView
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: theme.primary,
          }}
        />
      </TkxPDFPage>
    </TkxPDFDocument>
  );
}
