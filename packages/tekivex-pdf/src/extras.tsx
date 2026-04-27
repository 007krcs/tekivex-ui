// ─────────────────────────────────────────────────────────────────────────────
// Extra PDF primitives — the gap-closing layer over the v0.3 core.
//
// Each component is a thin themed wrapper over the core primitives. The
// goal: a consumer can express most structured documents (resumes,
// invoices, biodatas) without ever dropping back to TkxPDFView/Text by
// hand.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Link as PdfLink,
  Text as PdfText,
} from '@react-pdf/renderer';
import type { Style } from '@react-pdf/stylesheet';
import type { ReactNode } from 'react';
import {
  TkxPDFText,
  TkxPDFView,
  TkxPDFRow,
  TkxPDFColumn,
  usePDFTheme,
} from './primitives';

// ─── TkxPDFHeading ────────────────────────────────────────────────────────────

export interface TkxPDFHeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: ReactNode;
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: Style;
}

const HEADING_SIZES: Record<NonNullable<TkxPDFHeadingProps['level']>, number> = {
  1: 24,
  2: 18,
  3: 14,
  4: 12,
  5: 11,
  6: 10,
};

export function TkxPDFHeading({
  level = 1,
  children,
  color,
  align,
  style,
}: TkxPDFHeadingProps) {
  return (
    <TkxPDFText
      size={HEADING_SIZES[level]}
      weight="bold"
      color={color}
      align={align}
      style={{ marginBottom: 6, ...style }}
    >
      {children}
    </TkxPDFText>
  );
}

// ─── TkxPDFDivider ────────────────────────────────────────────────────────────

export interface TkxPDFDividerProps {
  thickness?: number;
  color?: string;
  marginVertical?: number;
  style?: Style;
}

export function TkxPDFDivider({
  thickness = 1,
  color,
  marginVertical = 8,
  style,
}: TkxPDFDividerProps) {
  const theme = usePDFTheme();
  return (
    <TkxPDFView
      style={{
        borderBottomWidth: thickness,
        borderBottomColor: color ?? theme.border,
        marginVertical,
        ...style,
      }}
    />
  );
}

// ─── TkxPDFLink ──────────────────────────────────────────────────────────────

export interface TkxPDFLinkProps {
  href: string;
  children?: ReactNode;
  size?: number;
  weight?: 'normal' | 'bold';
  color?: string;
  style?: Style;
}

export function TkxPDFLink({ href, children, size, weight, color, style }: TkxPDFLinkProps) {
  const theme = usePDFTheme();
  return (
    <PdfLink
      src={href}
      style={{
        color: color ?? theme.primary,
        fontSize: size ?? theme.fontSize,
        fontFamily: theme.fontFamily,
        fontWeight: weight,
        textDecoration: 'underline',
        ...style,
      }}
    >
      {children as any}
    </PdfLink>
  );
}

// ─── TkxPDFList ──────────────────────────────────────────────────────────────

export interface TkxPDFListProps {
  items: ReactNode[];
  ordered?: boolean;
  /** Bullet character for unordered lists. Default: "•". */
  bullet?: string;
  /** Distance from bullet to text in points. Default: 8. */
  gap?: number;
  /** Spacing between items. Default: 4. */
  itemSpacing?: number;
  size?: number;
  color?: string;
  style?: Style;
}

export function TkxPDFList({
  items,
  ordered,
  bullet = '•',
  gap = 8,
  itemSpacing = 4,
  size,
  color,
  style,
}: TkxPDFListProps) {
  const theme = usePDFTheme();
  return (
    <TkxPDFView style={style}>
      {items.map((item, i) => (
        <TkxPDFRow
          key={i}
          style={{ marginBottom: i === items.length - 1 ? 0 : itemSpacing }}
        >
          <TkxPDFText
            size={size}
            color={color ?? theme.text}
            style={{ width: ordered ? 18 : 12, marginRight: gap - (ordered ? 0 : 4) }}
          >
            {ordered ? `${i + 1}.` : bullet}
          </TkxPDFText>
          <TkxPDFText
            size={size}
            color={color ?? theme.text}
            style={{ flex: 1, lineHeight: 1.4 }}
          >
            {item}
          </TkxPDFText>
        </TkxPDFRow>
      ))}
    </TkxPDFView>
  );
}

// ─── TkxPDFTable ─────────────────────────────────────────────────────────────

export interface TkxPDFTableColumn {
  header: string;
  /** Width as flex-grow factor (default 1). */
  flex?: number;
  /** Cell text alignment. */
  align?: 'left' | 'center' | 'right';
}

export interface TkxPDFTableProps {
  columns: TkxPDFTableColumn[];
  /** 2D array of cell values. Each row's length must match columns.length. */
  rows: ReactNode[][];
  /** Show alternating row stripes. Default: true. */
  striped?: boolean;
  /** Column header style override. */
  headerStyle?: Style;
  /** Cell text size. Default: theme.fontSize. */
  size?: number;
  style?: Style;
}

export function TkxPDFTable({
  columns,
  rows,
  striped = true,
  headerStyle,
  size,
  style,
}: TkxPDFTableProps) {
  const theme = usePDFTheme();

  return (
    <TkxPDFView style={{ borderWidth: 1, borderColor: theme.border, ...style }}>
      {/* Header */}
      <TkxPDFRow
        style={{
          backgroundColor: theme.primary,
          paddingVertical: 6,
          paddingHorizontal: 8,
          ...headerStyle,
        }}
      >
        {columns.map((col, i) => (
          <TkxPDFText
            key={i}
            size={(size ?? theme.fontSize) - 1}
            weight="bold"
            color={theme.bg}
            align={col.align}
            style={{ flex: col.flex ?? 1, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {col.header}
          </TkxPDFText>
        ))}
      </TkxPDFRow>

      {/* Rows */}
      {rows.map((row, ri) => (
        <TkxPDFRow
          key={ri}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 8,
            backgroundColor: striped && ri % 2 === 1 ? theme.surface : undefined,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          {row.map((cell, ci) => (
            <TkxPDFText
              key={ci}
              size={size}
              color={theme.text}
              align={columns[ci]?.align}
              style={{ flex: columns[ci]?.flex ?? 1 }}
            >
              {cell}
            </TkxPDFText>
          ))}
        </TkxPDFRow>
      ))}
    </TkxPDFView>
  );
}

// ─── TkxPDFHeader / TkxPDFFooter ─────────────────────────────────────────────
//
// React-PDF's `fixed` prop pins a View to every page. These are convenience
// wrappers with sensible defaults so users don't have to remember `fixed`.

export interface TkxPDFHeaderProps {
  children?: ReactNode;
  /** Distance from top of page in points. Default: 0 (sits at margin). */
  offset?: number;
  /** Show a thin separator line below the header. Default: true. */
  separator?: boolean;
  style?: Style;
}

export function TkxPDFHeader({ children, offset = 0, separator = true, style }: TkxPDFHeaderProps) {
  const theme = usePDFTheme();
  return (
    <TkxPDFView
      fixed
      style={{
        position: 'absolute',
        top: offset,
        left: 36,
        right: 36,
        paddingBottom: 6,
        borderBottomWidth: separator ? 1 : 0,
        borderBottomColor: theme.border,
        ...style,
      }}
    >
      {children}
    </TkxPDFView>
  );
}

export interface TkxPDFFooterProps {
  children?: ReactNode;
  /** Distance from bottom of page in points. Default: 18. */
  offset?: number;
  /** Show a thin separator line above the footer. Default: true. */
  separator?: boolean;
  /** Render a "Page X of Y" indicator alongside children. Default: false. */
  showPageNumber?: boolean;
  style?: Style;
}

export function TkxPDFFooter({
  children,
  offset = 18,
  separator = true,
  showPageNumber = false,
  style,
}: TkxPDFFooterProps) {
  const theme = usePDFTheme();
  return (
    <TkxPDFView
      fixed
      style={{
        position: 'absolute',
        bottom: offset,
        left: 36,
        right: 36,
        paddingTop: 6,
        borderTopWidth: separator ? 1 : 0,
        borderTopColor: theme.border,
        ...style,
      }}
    >
      <TkxPDFRow justify="space-between" align="center">
        <TkxPDFColumn flex={3}>
          <TkxPDFText size={9} color={theme.textMuted}>
            {children}
          </TkxPDFText>
        </TkxPDFColumn>
        {showPageNumber && (
          <TkxPDFColumn>
            <PdfText
              style={{
                fontSize: 9,
                color: theme.textMuted,
                fontFamily: theme.fontFamily,
                textAlign: 'right',
              }}
              render={({ pageNumber, totalPages }: any) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </TkxPDFColumn>
        )}
      </TkxPDFRow>
    </TkxPDFView>
  );
}
