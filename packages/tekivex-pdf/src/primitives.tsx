// ─────────────────────────────────────────────────────────────────────────────
// Tkx PDF primitives — thin themed wrappers over @react-pdf/renderer.
//
// Why thin: @react-pdf/renderer already has Document/Page/View/Text/Image.
// Our value-add is consistent themed defaults (font, colours, spacing) and
// a tekivex-ui-shaped API surface so consumers move between browser and PDF
// with minimal cognitive overhead.
//
// All components accept a `theme` prop (defaults to the closest Provider's
// theme, which itself defaults to printLight). They also accept arbitrary
// `style` overrides which are merged on top.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Document,
  Page,
  View,
  Text,
  Image,
  type DocumentProps,
  type PageProps,
  type ViewProps,
  type TextProps,
  type ImageProps,
  type Style,
} from '@react-pdf/renderer';
import { createContext, useContext, type ReactNode } from 'react';
import type { PDFThemeTokens } from './theme';
import { printLight } from './theme';

// ── Theme context ────────────────────────────────────────────────────────────

const PDFThemeContext = createContext<PDFThemeTokens>(printLight);

export interface TkxPDFThemeProviderProps {
  theme?: PDFThemeTokens;
  children: ReactNode;
}

export function TkxPDFThemeProvider({
  theme = printLight,
  children,
}: TkxPDFThemeProviderProps) {
  return (
    <PDFThemeContext.Provider value={theme}>{children}</PDFThemeContext.Provider>
  );
}

export function usePDFTheme(): PDFThemeTokens {
  return useContext(PDFThemeContext);
}

// ── TkxPDFDocument ───────────────────────────────────────────────────────────

export interface TkxPDFDocumentProps extends Omit<DocumentProps, 'children'> {
  theme?: PDFThemeTokens;
  children: ReactNode;
}

export function TkxPDFDocument({ theme, children, ...rest }: TkxPDFDocumentProps) {
  const inner = (
    <Document {...rest}>{children as any}</Document>
  );
  return theme ? (
    <TkxPDFThemeProvider theme={theme}>{inner}</TkxPDFThemeProvider>
  ) : (
    inner
  );
}

// ── TkxPDFPage ───────────────────────────────────────────────────────────────

export interface TkxPDFPageProps extends Omit<PageProps, 'style' | 'children'> {
  /** Page size shorthand. Maps to react-pdf's accepted size strings/tuples. */
  size?: 'A4' | 'A5' | 'LETTER' | 'LEGAL' | [number, number];
  /** Margin in points (1pt = 1/72in). Single number or [v, h] or [t, r, b, l]. */
  margin?: number | [number, number] | [number, number, number, number];
  style?: Style;
  children?: ReactNode;
}

function resolveMargin(m: TkxPDFPageProps['margin']): Style {
  if (m === undefined) return { padding: 36 };
  if (typeof m === 'number') return { padding: m };
  if (m.length === 2) return { paddingVertical: m[0], paddingHorizontal: m[1] };
  return {
    paddingTop: m[0],
    paddingRight: m[1],
    paddingBottom: m[2],
    paddingLeft: m[3],
  };
}

export function TkxPDFPage({
  size = 'A4',
  margin,
  style,
  children,
  ...rest
}: TkxPDFPageProps) {
  const theme = usePDFTheme();
  const baseStyle: Style = {
    backgroundColor: theme.bg,
    color: theme.text,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize,
    lineHeight: theme.lineHeight,
    ...resolveMargin(margin),
    ...style,
  };
  return (
    <Page size={size} style={baseStyle} {...rest}>
      {children as any}
    </Page>
  );
}

// ── TkxPDFView (layout container) ────────────────────────────────────────────

export interface TkxPDFViewProps extends Omit<ViewProps, 'style' | 'children'> {
  style?: Style;
  children?: ReactNode;
}

export function TkxPDFView({ style, children, ...rest }: TkxPDFViewProps) {
  return (
    <View style={style} {...rest}>
      {children as any}
    </View>
  );
}

// ── TkxPDFRow / TkxPDFColumn — flexbox sugar ────────────────────────────────

export interface TkxPDFRowProps extends TkxPDFViewProps {
  gap?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
}

export function TkxPDFRow({
  gap = 0,
  align = 'flex-start',
  justify = 'flex-start',
  style,
  children,
  ...rest
}: TkxPDFRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: align,
        justifyContent: justify,
        gap,
        ...style,
      }}
      {...rest}
    >
      {children as any}
    </View>
  );
}

export interface TkxPDFColumnProps extends TkxPDFViewProps {
  flex?: number;
  gap?: number;
}

export function TkxPDFColumn({ flex, gap = 0, style, children, ...rest }: TkxPDFColumnProps) {
  return (
    <View style={{ flexDirection: 'column', flex, gap, ...style }} {...rest}>
      {children as any}
    </View>
  );
}

// ── TkxPDFText ───────────────────────────────────────────────────────────────

export interface TkxPDFTextProps extends Omit<TextProps, 'style' | 'children'> {
  size?: number;
  weight?: 'normal' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  italic?: boolean;
  font?: string;
  style?: Style;
  children?: ReactNode;
}

export function TkxPDFText({
  size,
  weight,
  color,
  align,
  italic,
  font,
  style,
  children,
  ...rest
}: TkxPDFTextProps) {
  const theme = usePDFTheme();
  return (
    <Text
      style={{
        fontFamily: font ?? theme.fontFamily,
        fontSize: size ?? theme.fontSize,
        color: color ?? theme.text,
        fontWeight: weight,
        textAlign: align,
        fontStyle: italic ? 'italic' : undefined,
        ...style,
      }}
      {...rest}
    >
      {children as any}
    </Text>
  );
}

// ── TkxPDFImage ──────────────────────────────────────────────────────────────

export interface TkxPDFImageProps extends Omit<ImageProps, 'style'> {
  width?: number;
  height?: number;
  rounded?: number;
  style?: Style;
}

export function TkxPDFImage({ width, height, rounded, style, ...rest }: TkxPDFImageProps) {
  return (
    <Image
      style={{ width, height, borderRadius: rounded, ...style }}
      {...rest}
    />
  );
}
