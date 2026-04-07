import {
  useState,
  useCallback,
  type ReactNode,
  type CSSProperties,
  createElement,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';

// ── Interfaces ──────────────────────────────────────────────────────────────

export type TypographyType = 'default' | 'secondary' | 'success' | 'warning' | 'danger';

export interface TkxTitleProps {
  level?: 1 | 2 | 3 | 4 | 5;
  children: ReactNode;
  copyable?: boolean;
  type?: TypographyType;
  style?: CSSProperties;
}

export interface TkxTextProps {
  children: ReactNode;
  type?: TypographyType;
  strong?: boolean;
  italic?: boolean;
  underline?: boolean;
  delete?: boolean;
  code?: boolean;
  mark?: boolean;
  copyable?: boolean;
  style?: CSSProperties;
}

export interface TkxParagraphProps {
  children: ReactNode;
  type?: 'default' | 'secondary';
  copyable?: boolean;
  ellipsis?: boolean | { rows?: number };
  style?: CSSProperties;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getTextContent(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return getTextContent((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}

// ── CopyButton ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return createElement(
    'button',
    {
      type: 'button' as const,
      onClick: handleCopy,
      'aria-label': copied ? 'Copied' : 'Copy to clipboard',
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        marginLeft: '4px',
        padding: '2px 6px',
        border: 'none',
        background: 'transparent',
        color: copied ? theme.success : theme.textMuted,
        cursor: 'pointer',
        fontSize: '0.8em',
        borderRadius: '4px',
        transition: 'color 0.2s',
      },
    },
    copied ? 'Copied!' : '\u2398',
  );
}

// ── Color Map ───────────────────────────────────────────────────────────────

function useTypeColor(type: TypographyType = 'default') {
  const theme = useTheme();
  const map: Record<TypographyType, string> = {
    default: theme.text,
    secondary: theme.textMuted,
    success: theme.success,
    warning: theme.warning,
    danger: theme.danger,
  };
  return map[type];
}

// ── Title Sizes ─────────────────────────────────────────────────────────────

const TITLE_SIZES: Record<number, { fontSize: string; lineHeight: string; fontWeight: number }> = {
  1: { fontSize: '2.25rem', lineHeight: '1.2', fontWeight: 700 },
  2: { fontSize: '1.875rem', lineHeight: '1.25', fontWeight: 700 },
  3: { fontSize: '1.5rem', lineHeight: '1.3', fontWeight: 600 },
  4: { fontSize: '1.25rem', lineHeight: '1.35', fontWeight: 600 },
  5: { fontSize: '1rem', lineHeight: '1.4', fontWeight: 600 },
};

// ── TkxTitle ────────────────────────────────────────────────────────────────

export function TkxTitle({
  level = 1,
  children,
  copyable = false,
  type = 'default',
  style,
}: TkxTitleProps) {
  const color = useTypeColor(type);
  const theme = useTheme();
  const sizeConfig = TITLE_SIZES[level];
  const tag = `h${level}` as keyof JSX.IntrinsicElements;

  const safeChildren = typeof children === 'string' ? sanitizeString(children) : children;
  const textContent = getTextContent(children);

  return createElement(
    tag,
    {
      style: {
        color,
        fontSize: sizeConfig.fontSize,
        lineHeight: sizeConfig.lineHeight,
        fontWeight: sizeConfig.fontWeight,
        margin: '0 0 0.5em 0',
        fontFamily: 'inherit',
        ...style,
      },
    },
    safeChildren,
    copyable && createElement(CopyButton, { text: textContent }),
  );
}

// ── TkxText ─────────────────────────────────────────────────────────────────

export function TkxText({
  children,
  type = 'default',
  strong = false,
  italic = false,
  underline = false,
  delete: strikethrough = false,
  code = false,
  mark = false,
  copyable = false,
  style,
}: TkxTextProps) {
  const color = useTypeColor(type);
  const theme = useTheme();
  const textContent = getTextContent(children);
  const safeChildren = typeof children === 'string' ? sanitizeString(children) : children;

  const decorations: string[] = [];
  if (underline) decorations.push('underline');
  if (strikethrough) decorations.push('line-through');

  let content: ReactNode = safeChildren;

  if (code) {
    content = createElement(
      'code',
      {
        style: {
          padding: '0.15em 0.4em',
          fontSize: '0.875em',
          backgroundColor: theme.surfaceAlt,
          border: `1px solid ${theme.border}`,
          borderRadius: '4px',
          fontFamily: 'monospace',
        },
      },
      content,
    );
  }

  if (mark) {
    content = createElement(
      'mark',
      {
        style: {
          backgroundColor: `${theme.warning}33`,
          color,
          padding: '0 2px',
          borderRadius: '2px',
        },
      },
      content,
    );
  }

  return createElement(
    'span',
    {
      style: {
        color,
        fontWeight: strong ? 600 : 'inherit',
        fontStyle: italic ? 'italic' : 'normal',
        textDecoration: decorations.length > 0 ? decorations.join(' ') : 'none',
        ...style,
      },
    },
    content,
    copyable && createElement(CopyButton, { text: textContent }),
  );
}

// ── TkxParagraph ────────────────────────────────────────────────────────────

export function TkxParagraph({
  children,
  type = 'default',
  copyable = false,
  ellipsis = false,
  style,
}: TkxParagraphProps) {
  const theme = useTheme();
  const color = type === 'secondary' ? theme.textMuted : theme.text;
  const textContent = getTextContent(children);
  const safeChildren = typeof children === 'string' ? sanitizeString(children) : children;

  const ellipsisStyle: CSSProperties = {};
  if (ellipsis) {
    const rows = typeof ellipsis === 'object' ? (ellipsis.rows ?? 3) : 3;
    ellipsisStyle.display = '-webkit-box';
    ellipsisStyle.WebkitLineClamp = rows;
    ellipsisStyle.WebkitBoxOrient = 'vertical';
    ellipsisStyle.overflow = 'hidden';
  }

  return createElement(
    'div',
    {
      style: {
        color,
        fontSize: '1rem',
        lineHeight: '1.6',
        margin: '0 0 1em 0',
        ...ellipsisStyle,
        ...style,
      },
    },
    safeChildren,
    copyable && createElement(CopyButton, { text: textContent }),
  );
}
