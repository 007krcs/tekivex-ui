// ─────────────────────────────────────────────────────────────────────────────
// BoardingPass template — airline-style. Two zones: passenger info + stub.
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

export interface BoardingPassData {
  passenger: string;
  airline: string;
  /** Flight number (e.g. "AI 142"). */
  flight: string;
  /** Origin airport: { code, city, time }. */
  from: { code: string; city: string; time: string };
  /** Destination airport. */
  to: { code: string; city: string; time: string };
  date: string;
  /** Boarding time. */
  boarding: string;
  gate?: string;
  seat: string;
  /** Class (e.g. "ECONOMY", "BUSINESS"). */
  class?: string;
  /** Frequent-flyer number. */
  ffNumber?: string;
  /** Sequence number / boarding zone. */
  sequence?: string;
  /** Pre-generated barcode/QR data URL. */
  barcodeUrl?: string;
  /** PNR / record locator. */
  pnr: string;
}

export interface BoardingPassTemplateProps {
  data: BoardingPassData;
  theme?: PDFThemeTokens;
}

export function BoardingPassTemplate({ data, theme = printLight }: BoardingPassTemplateProps) {
  return (
    <TkxPDFDocument theme={theme} title={`Boarding Pass — ${data.passenger} · ${data.flight}`}>
      <TkxPDFPage size={[612, 252]} margin={0}>
        <TkxPDFRow style={{ height: '100%' }}>
          {/* Main */}
          <TkxPDFColumn flex={3} style={{ padding: 18, backgroundColor: theme.bg }}>
            <TkxPDFRow justify="space-between" align="flex-start">
              <TkxPDFColumn>
                <TkxPDFText size={9} color={theme.textMuted} weight="bold" style={{ letterSpacing: 1 }}>
                  BOARDING PASS
                </TkxPDFText>
                <TkxPDFText size={14} weight="bold" color={theme.primary} style={{ marginTop: 2 }}>
                  {data.airline}
                </TkxPDFText>
              </TkxPDFColumn>
              <TkxPDFColumn style={{ alignItems: 'flex-end' }}>
                <TkxPDFText size={9} color={theme.textMuted}>FLIGHT</TkxPDFText>
                <TkxPDFText size={16} weight="bold" color={theme.text}>{data.flight}</TkxPDFText>
              </TkxPDFColumn>
            </TkxPDFRow>

            <TkxPDFRow justify="space-between" align="center" style={{ marginTop: 18 }}>
              <TkxPDFColumn>
                <TkxPDFText size={28} weight="bold" color={theme.text}>{data.from.code}</TkxPDFText>
                <TkxPDFText size={9} color={theme.textMuted}>{data.from.city}</TkxPDFText>
                <TkxPDFText size={11} color={theme.text} style={{ marginTop: 2 }}>{data.from.time}</TkxPDFText>
              </TkxPDFColumn>
              <TkxPDFText size={20} color={theme.primary}>→</TkxPDFText>
              <TkxPDFColumn style={{ alignItems: 'flex-end' }}>
                <TkxPDFText size={28} weight="bold" color={theme.text}>{data.to.code}</TkxPDFText>
                <TkxPDFText size={9} color={theme.textMuted}>{data.to.city}</TkxPDFText>
                <TkxPDFText size={11} color={theme.text} style={{ marginTop: 2 }}>{data.to.time}</TkxPDFText>
              </TkxPDFColumn>
            </TkxPDFRow>

            <TkxPDFView style={{ marginTop: 20 }}>
              <TkxPDFText size={9} color={theme.textMuted}>PASSENGER</TkxPDFText>
              <TkxPDFText size={13} weight="bold" color={theme.text}>{data.passenger.toUpperCase()}</TkxPDFText>
            </TkxPDFView>

            <TkxPDFRow style={{ marginTop: 14 }} gap={18}>
              <TkxPDFColumn>
                <TkxPDFText size={8} color={theme.textMuted}>DATE</TkxPDFText>
                <TkxPDFText size={11} weight="bold" color={theme.text}>{data.date}</TkxPDFText>
              </TkxPDFColumn>
              <TkxPDFColumn>
                <TkxPDFText size={8} color={theme.textMuted}>BOARDING</TkxPDFText>
                <TkxPDFText size={11} weight="bold" color={theme.text}>{data.boarding}</TkxPDFText>
              </TkxPDFColumn>
              {data.gate && (
                <TkxPDFColumn>
                  <TkxPDFText size={8} color={theme.textMuted}>GATE</TkxPDFText>
                  <TkxPDFText size={11} weight="bold" color={theme.text}>{data.gate}</TkxPDFText>
                </TkxPDFColumn>
              )}
              <TkxPDFColumn>
                <TkxPDFText size={8} color={theme.textMuted}>SEAT</TkxPDFText>
                <TkxPDFText size={11} weight="bold" color={theme.text}>{data.seat}</TkxPDFText>
              </TkxPDFColumn>
              {data.class && (
                <TkxPDFColumn>
                  <TkxPDFText size={8} color={theme.textMuted}>CLASS</TkxPDFText>
                  <TkxPDFText size={11} weight="bold" color={theme.text}>{data.class}</TkxPDFText>
                </TkxPDFColumn>
              )}
            </TkxPDFRow>

            {data.ffNumber && (
              <TkxPDFText size={9} color={theme.textMuted} style={{ marginTop: 12 }}>
                FF: {data.ffNumber}
              </TkxPDFText>
            )}
          </TkxPDFColumn>

          {/* Stub */}
          <TkxPDFColumn
            flex={1}
            style={{
              padding: 14,
              backgroundColor: theme.surface,
              borderLeftWidth: 2,
              borderLeftColor: theme.primary,
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <TkxPDFText size={8} color={theme.textMuted} weight="bold">
              {data.airline.toUpperCase()}
            </TkxPDFText>
            {data.barcodeUrl && (
              <TkxPDFImage src={data.barcodeUrl} width={120} height={40} />
            )}
            <TkxPDFView style={{ alignItems: 'center' }}>
              <TkxPDFText size={8} color={theme.textMuted}>PNR</TkxPDFText>
              <TkxPDFText size={11} weight="bold" color={theme.text} style={{ fontFamily: 'Courier' }}>
                {data.pnr}
              </TkxPDFText>
              {data.sequence && (
                <TkxPDFText size={8} color={theme.textMuted} style={{ marginTop: 4 }}>
                  SEQ {data.sequence}
                </TkxPDFText>
              )}
            </TkxPDFView>
          </TkxPDFColumn>
        </TkxPDFRow>
      </TkxPDFPage>
    </TkxPDFDocument>
  );
}
