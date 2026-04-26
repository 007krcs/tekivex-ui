// ─────────────────────────────────────────────────────────────────────────────
// Receipt template — POS-style payment receipt. Compact thermal-printer
// dimensions (80mm wide). For full A4 invoices, use InvoiceTemplate.
// ─────────────────────────────────────────────────────────────────────────────

import {
  TkxPDFDocument,
  TkxPDFPage,
  TkxPDFView,
  TkxPDFText,
  TkxPDFRow,
} from '../primitives';
import type { PDFThemeTokens } from '../theme';
import { printLight } from '../theme';

export interface ReceiptLineItem {
  label: string;
  quantity: number;
  unitPrice: number;
}

export interface ReceiptData {
  /** Merchant name. */
  merchant: string;
  /** Merchant address lines. */
  address?: string[];
  /** Phone / contact. */
  contact?: string;
  /** Tax registration. */
  taxId?: string;
  /** Receipt number. */
  number: string;
  /** ISO timestamp. */
  date: string;
  /** Line items. */
  items: ReceiptLineItem[];
  currency: string;
  taxRate?: number;
  /** Pre-computed total override (e.g. for rounded totals). */
  totalOverride?: number;
  /** Payment method (e.g. "Visa ****4242"). */
  paymentMethod: string;
  /** Cashier / server name. */
  cashier?: string;
  /** Optional barcode/QR data URL for verification. */
  qrUrl?: string;
  /** Bottom-of-receipt thank-you message. */
  footerNote?: string;
}

export interface ReceiptTemplateProps {
  data: ReceiptData;
  theme?: PDFThemeTokens;
}

function fmt(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function ReceiptTemplate({ data, theme = printLight }: ReceiptTemplateProps) {
  const subtotal = data.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const tax = data.taxRate ? subtotal * data.taxRate : 0;
  const total = data.totalOverride ?? subtotal + tax;

  return (
    <TkxPDFDocument theme={theme} title={`Receipt ${data.number}`}>
      {/* 80mm thermal-printer width = ~227pt. Page height auto-grows. */}
      <TkxPDFPage size={[227, 600]} margin={12}>
        {/* Header */}
        <TkxPDFView style={{ alignItems: 'center', marginBottom: 8 }}>
          <TkxPDFText size={13} weight="bold" color={theme.text}>
            {data.merchant.toUpperCase()}
          </TkxPDFText>
          {data.address?.map((line, i) => (
            <TkxPDFText key={i} size={8} color={theme.textMuted}>{line}</TkxPDFText>
          ))}
          {data.contact && (
            <TkxPDFText size={8} color={theme.textMuted}>{data.contact}</TkxPDFText>
          )}
          {data.taxId && (
            <TkxPDFText size={8} color={theme.textMuted}>Tax ID: {data.taxId}</TkxPDFText>
          )}
        </TkxPDFView>

        <TkxPDFView style={{ borderTopWidth: 1, borderTopColor: theme.text, marginVertical: 6 }} />

        <TkxPDFView style={{ marginBottom: 6 }}>
          <TkxPDFText size={8} color={theme.text} style={{ fontFamily: 'Courier' }}>
            #{data.number}
          </TkxPDFText>
          <TkxPDFText size={8} color={theme.textMuted}>{data.date}</TkxPDFText>
          {data.cashier && (
            <TkxPDFText size={8} color={theme.textMuted}>Cashier: {data.cashier}</TkxPDFText>
          )}
        </TkxPDFView>

        <TkxPDFView style={{ borderTopWidth: 1, borderTopColor: theme.text, marginVertical: 6 }} />

        {/* Items */}
        {data.items.map((it, i) => (
          <TkxPDFView key={i} style={{ marginBottom: 4 }}>
            <TkxPDFText size={9} color={theme.text}>{it.label}</TkxPDFText>
            <TkxPDFRow justify="space-between">
              <TkxPDFText size={8} color={theme.textMuted}>
                {it.quantity} × {fmt(it.unitPrice, data.currency)}
              </TkxPDFText>
              <TkxPDFText size={9} color={theme.text}>
                {fmt(it.quantity * it.unitPrice, data.currency)}
              </TkxPDFText>
            </TkxPDFRow>
          </TkxPDFView>
        ))}

        <TkxPDFView style={{ borderTopWidth: 1, borderTopColor: theme.text, marginVertical: 6 }} />

        <TkxPDFRow justify="space-between">
          <TkxPDFText size={9} color={theme.textMuted}>Subtotal</TkxPDFText>
          <TkxPDFText size={9} color={theme.text}>{fmt(subtotal, data.currency)}</TkxPDFText>
        </TkxPDFRow>
        {data.taxRate && (
          <TkxPDFRow justify="space-between">
            <TkxPDFText size={9} color={theme.textMuted}>Tax ({(data.taxRate * 100).toFixed(0)}%)</TkxPDFText>
            <TkxPDFText size={9} color={theme.text}>{fmt(tax, data.currency)}</TkxPDFText>
          </TkxPDFRow>
        )}
        <TkxPDFRow justify="space-between" style={{ marginTop: 4 }}>
          <TkxPDFText size={11} weight="bold" color={theme.text}>TOTAL</TkxPDFText>
          <TkxPDFText size={11} weight="bold" color={theme.text}>
            {fmt(total, data.currency)}
          </TkxPDFText>
        </TkxPDFRow>

        <TkxPDFView style={{ borderTopWidth: 1, borderTopColor: theme.text, marginVertical: 6 }} />

        <TkxPDFView style={{ alignItems: 'center', marginTop: 4 }}>
          <TkxPDFText size={9} color={theme.text}>Paid by {data.paymentMethod}</TkxPDFText>
        </TkxPDFView>

        {data.footerNote && (
          <TkxPDFView style={{ alignItems: 'center', marginTop: 12 }}>
            <TkxPDFText size={9} color={theme.textMuted} align="center">
              {data.footerNote}
            </TkxPDFText>
          </TkxPDFView>
        )}
      </TkxPDFPage>
    </TkxPDFDocument>
  );
}
