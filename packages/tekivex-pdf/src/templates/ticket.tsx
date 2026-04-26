// ─────────────────────────────────────────────────────────────────────────────
// Ticket template — event admission. Tear-off stub layout with QR code area.
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
import type { PDFThemeTokens } from '../theme';
import { printLight } from '../theme';

export interface TicketData {
  /** Event title. */
  eventName: string;
  /** Subtitle (e.g. "Hall A · General Admission"). */
  subtitle?: string;
  /** Date in display form (e.g. "Sat 27 Apr 2026"). */
  date: string;
  /** Time (e.g. "7:00 PM"). */
  time: string;
  /** Venue name + address. */
  venue: string;
  /** Seat assignment (e.g. "Sec C · Row 12 · Seat 7"). */
  seat?: string;
  /** Attendee name. */
  attendee: string;
  /** Unique ticket id — also encoded in the QR. */
  ticketId: string;
  /** Pre-generated QR code data URL (caller responsible for encoding). */
  qrUrl?: string;
  /** Currency-formatted price for record. */
  price?: string;
}

export interface TicketTemplateProps {
  data: TicketData;
  theme?: PDFThemeTokens;
}

export function TicketTemplate({ data, theme = printLight }: TicketTemplateProps) {
  return (
    <TkxPDFDocument theme={theme} title={`Ticket — ${data.eventName}`}>
      {/* Half-letter portrait, prints two per page if duplicated. */}
      <TkxPDFPage size={[396, 280]} margin={0}>
        <TkxPDFRow style={{ height: '100%' }}>
          {/* Main body */}
          <TkxPDFColumn flex={2} style={{ padding: 20, backgroundColor: theme.bg }}>
            <TkxPDFText
              size={9}
              weight="bold"
              color={theme.primary}
              style={{ letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}
            >
              Admit One
            </TkxPDFText>
            <TkxPDFText size={20} weight="bold" color={theme.text} style={{ marginBottom: 4 }}>
              {data.eventName}
            </TkxPDFText>
            {data.subtitle && (
              <TkxPDFText size={11} color={theme.textMuted} style={{ marginBottom: 14 }}>
                {data.subtitle}
              </TkxPDFText>
            )}

            <TkxPDFRow style={{ marginBottom: 10 }} gap={20}>
              <TkxPDFColumn>
                <TkxPDFText size={8} color={theme.textMuted}>DATE</TkxPDFText>
                <TkxPDFText size={12} color={theme.text} weight="bold">{data.date}</TkxPDFText>
              </TkxPDFColumn>
              <TkxPDFColumn>
                <TkxPDFText size={8} color={theme.textMuted}>TIME</TkxPDFText>
                <TkxPDFText size={12} color={theme.text} weight="bold">{data.time}</TkxPDFText>
              </TkxPDFColumn>
            </TkxPDFRow>

            <TkxPDFView style={{ marginBottom: 10 }}>
              <TkxPDFText size={8} color={theme.textMuted}>VENUE</TkxPDFText>
              <TkxPDFText size={11} color={theme.text}>{data.venue}</TkxPDFText>
            </TkxPDFView>

            {data.seat && (
              <TkxPDFView style={{ marginBottom: 10 }}>
                <TkxPDFText size={8} color={theme.textMuted}>SEAT</TkxPDFText>
                <TkxPDFText size={12} color={theme.text} weight="bold">{data.seat}</TkxPDFText>
              </TkxPDFView>
            )}

            <TkxPDFView style={{ marginTop: 14 }}>
              <TkxPDFText size={8} color={theme.textMuted}>ATTENDEE</TkxPDFText>
              <TkxPDFText size={12} color={theme.text}>{data.attendee}</TkxPDFText>
            </TkxPDFView>
          </TkxPDFColumn>

          {/* Tear-off stub */}
          <TkxPDFColumn
            flex={1}
            style={{
              padding: 16,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              borderLeftWidth: 2,
              borderLeftColor: theme.bg,
              borderStyle: 'dashed',
            }}
          >
            {data.qrUrl && (
              <TkxPDFImage
                src={data.qrUrl}
                width={110}
                height={110}
                style={{ backgroundColor: '#ffffff', padding: 6 }}
              />
            )}
            <TkxPDFText size={9} color={theme.bg} style={{ marginTop: 10 }}>
              ID
            </TkxPDFText>
            <TkxPDFText
              size={11}
              weight="bold"
              color={theme.bg}
              style={{ fontFamily: 'Courier', letterSpacing: 1 }}
            >
              {data.ticketId}
            </TkxPDFText>
            {data.price && (
              <TkxPDFText size={10} color={theme.bg} style={{ marginTop: 8 }}>
                {data.price}
              </TkxPDFText>
            )}
          </TkxPDFColumn>
        </TkxPDFRow>
      </TkxPDFPage>
    </TkxPDFDocument>
  );
}
