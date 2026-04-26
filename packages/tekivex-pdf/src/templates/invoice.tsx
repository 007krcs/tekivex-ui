// ─────────────────────────────────────────────────────────────────────────────
// Invoice template — minimal, professional, A4 portrait. Demonstrates:
//   - Header with logo + invoice metadata
//   - Bill-to / bill-from blocks
//   - Line-items table with computed totals
//   - Footer with payment terms
// ─────────────────────────────────────────────────────────────────────────────

import {
  TkxPDFDocument,
  TkxPDFPage,
  TkxPDFView,
  TkxPDFText,
  TkxPDFRow,
  TkxPDFColumn,
} from '../primitives';
import type { PDFThemeTokens } from '../theme';
import { printLight } from '../theme';

export interface InvoiceParty {
  name: string;
  lines: string[];
  email?: string;
  phone?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  number: string;
  date: string;
  dueDate?: string;
  currency: string;
  from: InvoiceParty;
  to: InvoiceParty;
  items: InvoiceLineItem[];
  taxRate?: number;
  notes?: string;
}

export interface InvoiceTemplateProps {
  data: InvoiceData;
  theme?: PDFThemeTokens;
}

function fmt(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function InvoiceTemplate({ data, theme = printLight }: InvoiceTemplateProps) {
  const subtotal = data.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const tax = data.taxRate ? subtotal * data.taxRate : 0;
  const total = subtotal + tax;

  return (
    <TkxPDFDocument theme={theme} title={`Invoice ${data.number}`}>
      <TkxPDFPage size="A4" margin={36}>
        {/* Header */}
        <TkxPDFRow justify="space-between" align="flex-start" style={{ marginBottom: 24 }}>
          <TkxPDFColumn>
            <TkxPDFText size={24} weight="bold" color={theme.primary}>
              INVOICE
            </TkxPDFText>
            <TkxPDFText size={10} color={theme.textMuted}>
              #{data.number}
            </TkxPDFText>
          </TkxPDFColumn>
          <TkxPDFColumn>
            <TkxPDFText size={10} color={theme.textMuted}>
              Issued
            </TkxPDFText>
            <TkxPDFText size={11} color={theme.text}>
              {data.date}
            </TkxPDFText>
            {data.dueDate && (
              <>
                <TkxPDFText size={10} color={theme.textMuted} style={{ marginTop: 6 }}>
                  Due
                </TkxPDFText>
                <TkxPDFText size={11} color={theme.text}>
                  {data.dueDate}
                </TkxPDFText>
              </>
            )}
          </TkxPDFColumn>
        </TkxPDFRow>

        {/* Parties */}
        <TkxPDFRow gap={24} style={{ marginBottom: 24 }}>
          <TkxPDFColumn flex={1}>
            <TkxPDFText size={9} color={theme.textMuted} style={{ marginBottom: 4 }}>
              FROM
            </TkxPDFText>
            <TkxPDFText size={12} weight="bold" color={theme.text}>
              {data.from.name}
            </TkxPDFText>
            {data.from.lines.map((line, i) => (
              <TkxPDFText key={i} size={10} color={theme.textMuted}>
                {line}
              </TkxPDFText>
            ))}
            {data.from.email && (
              <TkxPDFText size={10} color={theme.textMuted}>
                {data.from.email}
              </TkxPDFText>
            )}
          </TkxPDFColumn>
          <TkxPDFColumn flex={1}>
            <TkxPDFText size={9} color={theme.textMuted} style={{ marginBottom: 4 }}>
              BILL TO
            </TkxPDFText>
            <TkxPDFText size={12} weight="bold" color={theme.text}>
              {data.to.name}
            </TkxPDFText>
            {data.to.lines.map((line, i) => (
              <TkxPDFText key={i} size={10} color={theme.textMuted}>
                {line}
              </TkxPDFText>
            ))}
            {data.to.email && (
              <TkxPDFText size={10} color={theme.textMuted}>
                {data.to.email}
              </TkxPDFText>
            )}
          </TkxPDFColumn>
        </TkxPDFRow>

        {/* Line items table */}
        <TkxPDFView
          style={{
            backgroundColor: theme.primary,
            paddingVertical: 6,
            paddingHorizontal: 8,
            marginBottom: 4,
          }}
        >
          <TkxPDFRow>
            <TkxPDFText size={9} weight="bold" color={theme.bg} style={{ flex: 3 }}>
              DESCRIPTION
            </TkxPDFText>
            <TkxPDFText size={9} weight="bold" color={theme.bg} align="right" style={{ flex: 1 }}>
              QTY
            </TkxPDFText>
            <TkxPDFText size={9} weight="bold" color={theme.bg} align="right" style={{ flex: 1 }}>
              UNIT
            </TkxPDFText>
            <TkxPDFText size={9} weight="bold" color={theme.bg} align="right" style={{ flex: 1 }}>
              AMOUNT
            </TkxPDFText>
          </TkxPDFRow>
        </TkxPDFView>

        {data.items.map((item, i) => (
          <TkxPDFView
            key={i}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 8,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}
          >
            <TkxPDFRow>
              <TkxPDFText size={10} color={theme.text} style={{ flex: 3 }}>
                {item.description}
              </TkxPDFText>
              <TkxPDFText size={10} color={theme.text} align="right" style={{ flex: 1 }}>
                {item.quantity}
              </TkxPDFText>
              <TkxPDFText size={10} color={theme.text} align="right" style={{ flex: 1 }}>
                {fmt(item.unitPrice, data.currency)}
              </TkxPDFText>
              <TkxPDFText size={10} color={theme.text} align="right" style={{ flex: 1 }}>
                {fmt(item.quantity * item.unitPrice, data.currency)}
              </TkxPDFText>
            </TkxPDFRow>
          </TkxPDFView>
        ))}

        {/* Totals */}
        <TkxPDFView style={{ marginTop: 12, alignItems: 'flex-end' }}>
          <TkxPDFRow style={{ width: 220, justifyContent: 'space-between' }}>
            <TkxPDFText size={10} color={theme.textMuted}>
              Subtotal
            </TkxPDFText>
            <TkxPDFText size={10} color={theme.text}>
              {fmt(subtotal, data.currency)}
            </TkxPDFText>
          </TkxPDFRow>
          {data.taxRate && (
            <TkxPDFRow style={{ width: 220, justifyContent: 'space-between' }}>
              <TkxPDFText size={10} color={theme.textMuted}>
                Tax ({(data.taxRate * 100).toFixed(0)}%)
              </TkxPDFText>
              <TkxPDFText size={10} color={theme.text}>
                {fmt(tax, data.currency)}
              </TkxPDFText>
            </TkxPDFRow>
          )}
          <TkxPDFRow
            style={{
              width: 220,
              justifyContent: 'space-between',
              marginTop: 6,
              paddingTop: 6,
              borderTopWidth: 2,
              borderTopColor: theme.text,
            }}
          >
            <TkxPDFText size={12} weight="bold" color={theme.text}>
              Total
            </TkxPDFText>
            <TkxPDFText size={12} weight="bold" color={theme.primary}>
              {fmt(total, data.currency)}
            </TkxPDFText>
          </TkxPDFRow>
        </TkxPDFView>

        {data.notes && (
          <TkxPDFView style={{ marginTop: 32 }}>
            <TkxPDFText size={9} color={theme.textMuted} style={{ marginBottom: 4 }}>
              NOTES
            </TkxPDFText>
            <TkxPDFText size={10} color={theme.text}>
              {data.notes}
            </TkxPDFText>
          </TkxPDFView>
        )}
      </TkxPDFPage>
    </TkxPDFDocument>
  );
}
