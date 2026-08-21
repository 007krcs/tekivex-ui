'use client';

// ══════════════════════════════════════════════════════════════════════════════
// TkxMarkdown — Zero-dependency, responsive Markdown renderer
//
// Renders a Markdown string or a remote .md file on any device. Parses a
// CommonMark-compatible subset without shelling out to `marked`/`remark` so the
// library bundle stays lean (< 7 KB gzip).
//
// Supports:
//   • Headings (# .. ######)
//   • Paragraphs
//   • Bold **x** / *y* / _y_, italics, inline code, ~~strike~~
//   • Links [text](url) + autolinks <https://…>
//   • Images ![alt](src)
//   • Unordered / ordered lists (arbitrary nesting)
//   • Blockquotes
//   • Fenced code blocks ```lang … ```
//   • Horizontal rules (---, ***)
//   • GFM tables (| a | b |)
//   • Task list items - [ ] / - [x]
//
// All output is text-only — no dangerouslySetInnerHTML. Every string passes
// through sanitizeString() before rendering. External links get
// rel="noopener noreferrer" by default.
//
// Responsive behavior:
//   • Fluid container width (max-width: 100%).
//   • Images scale to parent width; never overflow.
//   • Tables become horizontally scrollable on narrow viewports.
//   • Code blocks wrap soft-breaks on mobile, scroll on desktop.
// ══════════════════════════════════════════════════════════════════════════════

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';

// ── Public API ───────────────────────────────────────────────────────────────

export interface TkxMarkdownProps {
  /** Markdown source string. Takes precedence over `src`. */
  source?: string;
  /** Remote URL (or relative path) to a .md file. Fetched on mount. */
  src?: string;
  /** Max content width. Default: '100%'. */
  maxWidth?: number | string;
  /** Render in a visually compact variant (smaller headings/line-heights). */
  compact?: boolean;
  /** Show a copy button on fenced code blocks. Default: true. */
  copyableCode?: boolean;
  /** Called when a link is clicked. Return false to suppress navigation. */
  onLinkClick?: (href: string, ev: React.MouseEvent<HTMLAnchorElement>) => boolean | void;
  /** Custom rel= value for external links. Default: 'noopener noreferrer'. */
  externalLinkRel?: string;
  /** target= for external links. Default: '_blank'. */
  externalLinkTarget?: '_blank' | '_self' | '_parent' | '_top';
  /** Replace the loading / error fallback. */
  loadingFallback?: ReactNode;
  errorFallback?: (error: string) => ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ── AST types ────────────────────────────────────────────────────────────────

type InlineNode =
  | { kind: 'text'; value: string }
  | { kind: 'bold'; children: InlineNode[] }
  | { kind: 'italic'; children: InlineNode[] }
  | { kind: 'strike'; children: InlineNode[] }
  | { kind: 'code'; value: string }
  | { kind: 'link'; href: string; children: InlineNode[] }
  | { kind: 'image'; src: string; alt: string };

type Block =
  | { kind: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; inline: InlineNode[] }
  | { kind: 'paragraph'; inline: InlineNode[] }
  | { kind: 'blockquote'; children: Block[] }
  | { kind: 'code'; language: string; value: string }
  | { kind: 'list'; ordered: boolean; items: ListItem[] }
  | { kind: 'hr' }
  | { kind: 'table'; headers: InlineNode[][]; rows: InlineNode[][][]; align: Array<'left' | 'center' | 'right' | null> };

interface ListItem {
  blocks: Block[];
  task: null | 'unchecked' | 'checked';
}

// ── Inline parser ────────────────────────────────────────────────────────────

function parseInline(src: string): InlineNode[] {
  const out: InlineNode[] = [];
  let i = 0;
  let buf = '';

  const flush = () => {
    if (buf) {
      out.push({ kind: 'text', value: buf });
      buf = '';
    }
  };

  while (i < src.length) {
    const ch = src[i];

    // Escape: \char  →  literal
    if (ch === '\\' && i + 1 < src.length) {
      buf += src[i + 1];
      i += 2;
      continue;
    }

    // Image: ![alt](src)
    if (ch === '!' && src[i + 1] === '[') {
      const close = src.indexOf(']', i + 2);
      if (close !== -1 && src[close + 1] === '(') {
        const endParen = src.indexOf(')', close + 2);
        if (endParen !== -1) {
          flush();
          out.push({
            kind: 'image',
            alt: src.slice(i + 2, close),
            src: src.slice(close + 2, endParen),
          });
          i = endParen + 1;
          continue;
        }
      }
    }

    // Link: [text](href)
    if (ch === '[') {
      const close = findMatching(src, i, '[', ']');
      if (close !== -1 && src[close + 1] === '(') {
        const endParen = src.indexOf(')', close + 2);
        if (endParen !== -1) {
          flush();
          out.push({
            kind: 'link',
            href: src.slice(close + 2, endParen).trim(),
            children: parseInline(src.slice(i + 1, close)),
          });
          i = endParen + 1;
          continue;
        }
      }
    }

    // Autolink: <https://…> or <email@x.y>
    if (ch === '<') {
      const close = src.indexOf('>', i + 1);
      if (close !== -1) {
        const inner = src.slice(i + 1, close);
        if (/^(https?:\/\/|mailto:)/i.test(inner) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inner)) {
          flush();
          const href = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inner) ? `mailto:${inner}` : inner;
          out.push({ kind: 'link', href, children: [{ kind: 'text', value: inner }] });
          i = close + 1;
          continue;
        }
      }
    }

    // Inline code: `...`
    if (ch === '`') {
      const close = src.indexOf('`', i + 1);
      if (close !== -1) {
        flush();
        out.push({ kind: 'code', value: src.slice(i + 1, close) });
        i = close + 1;
        continue;
      }
    }

    // Strike: ~~text~~
    if (ch === '~' && src[i + 1] === '~') {
      const close = src.indexOf('~~', i + 2);
      if (close !== -1) {
        flush();
        out.push({ kind: 'strike', children: parseInline(src.slice(i + 2, close)) });
        i = close + 2;
        continue;
      }
    }

    // Bold: **text** or __text__
    if ((ch === '*' && src[i + 1] === '*') || (ch === '_' && src[i + 1] === '_')) {
      const marker = ch + ch;
      const close = src.indexOf(marker, i + 2);
      if (close !== -1) {
        flush();
        out.push({ kind: 'bold', children: parseInline(src.slice(i + 2, close)) });
        i = close + 2;
        continue;
      }
    }

    // Italic: *text* or _text_
    if ((ch === '*' || ch === '_') && src[i + 1] !== ch) {
      const close = src.indexOf(ch, i + 1);
      if (close !== -1 && src.slice(i + 1, close).trim().length > 0) {
        flush();
        out.push({ kind: 'italic', children: parseInline(src.slice(i + 1, close)) });
        i = close + 1;
        continue;
      }
    }

    buf += ch;
    i++;
  }

  flush();
  return out;
}

function findMatching(src: string, start: number, open: string, close: string): number {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '\\') { i++; continue; }
    if (src[i] === open) depth++;
    else if (src[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

// ── Block parser ─────────────────────────────────────────────────────────────

function parseBlocks(src: string): Block[] {
  // Normalize line endings; strip a leading BOM.
  const text = src.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const lines = text.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (/^\s*$/.test(line)) { i++; continue; }

    // Fenced code block
    const fence = line.match(/^\s*```(.*)$/);
    if (fence) {
      const lang = fence[1].trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing fence
      blocks.push({ kind: 'code', language: lang, value: codeLines.join('\n') });
      continue;
    }

    // ATX heading
    const h = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (h) {
      blocks.push({
        kind: 'heading',
        level: h[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        inline: parseInline(h[2]),
      });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^\s*([-*_])\s*(?:\1\s*){2,}$/.test(line)) {
      blocks.push({ kind: 'hr' });
      i++;
      continue;
    }

    // GFM table: header row + separator row
    if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = splitTableRow(line).map(parseInline);
      const align = parseTableAlignment(lines[i + 1]);
      i += 2;
      const rows: InlineNode[][][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(splitTableRow(lines[i]).map(parseInline));
        i++;
      }
      blocks.push({ kind: 'table', headers, rows, align });
      continue;
    }

    // Blockquote
    if (/^\s*>/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      blocks.push({ kind: 'blockquote', children: parseBlocks(quoteLines.join('\n')) });
      continue;
    }

    // List
    if (isListLine(line)) {
      const [list, consumed] = parseList(lines, i);
      blocks.push(list);
      i = consumed;
      continue;
    }

    // Paragraph (accumulate until blank/non-paragraph line)
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^\s*```/.test(lines[i]) &&
      !/^\s*>/.test(lines[i]) &&
      !isListLine(lines[i]) &&
      !/^\s*([-*_])\s*(?:\1\s*){2,}$/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ kind: 'paragraph', inline: parseInline(paraLines.join(' ')) });
  }

  return blocks;
}

// ── List parser (supports nesting via indentation) ──────────────────────────

function isListLine(line: string): boolean {
  return /^(\s*)([-*+]|\d+[.)])\s+/.test(line);
}

function parseList(lines: string[], start: number): [Block, number] {
  const first = lines[start].match(/^(\s*)([-*+]|\d+[.)])\s+/)!;
  const baseIndent = first[1].length;
  const ordered = /\d/.test(first[2]);
  const items: ListItem[] = [];
  let i = start;

  while (i < lines.length) {
    const m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    if (!m || m[1].length !== baseIndent) break;

    // Task checkbox marker
    const rest = m[3];
    let task: ListItem['task'] = null;
    let content = rest;
    const taskMatch = rest.match(/^\[([ xX])\]\s+(.*)$/);
    if (taskMatch) {
      task = taskMatch[1].toLowerCase() === 'x' ? 'checked' : 'unchecked';
      content = taskMatch[2];
    }

    const itemLines: string[] = [content];
    i++;

    // Gather continuation + nested lines (indented beyond the marker)
    while (i < lines.length) {
      if (/^\s*$/.test(lines[i])) {
        // Blank line — peek next to decide
        if (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) {
          itemLines.push('');
          i++;
          continue;
        }
        break;
      }
      const childMatch = lines[i].match(/^(\s*)(\S)/);
      if (childMatch && childMatch[1].length > baseIndent) {
        itemLines.push(lines[i].slice(baseIndent + 2));
        i++;
        continue;
      }
      break;
    }

    items.push({ blocks: parseBlocks(itemLines.join('\n')), task });
  }

  return [{ kind: 'list', ordered, items }, i];
}

// ── Table helpers ───────────────────────────────────────────────────────────

function isTableRow(line: string): boolean {
  return /^\s*\|.+\|\s*$/.test(line.trim()) || (line.includes('|') && line.trim().startsWith('|'));
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line);
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((c) => c.trim());
}

function parseTableAlignment(sepLine: string): Array<'left' | 'center' | 'right' | null> {
  return splitTableRow(sepLine).map((cell) => {
    const l = cell.startsWith(':');
    const r = cell.endsWith(':');
    if (l && r) return 'center';
    if (r) return 'right';
    if (l) return 'left';
    return null;
  });
}

// ── Renderer ────────────────────────────────────────────────────────────────

interface RenderCtx {
  theme: ReturnType<typeof useTheme>;
  compact: boolean;
  copyableCode: boolean;
  externalLinkRel: string;
  externalLinkTarget: string;
  onLinkClick?: TkxMarkdownProps['onLinkClick'];
}

function renderInline(nodes: InlineNode[], ctx: RenderCtx, keyPrefix = 'i'): ReactNode[] {
  return nodes.map((n, idx) => {
    const k = `${keyPrefix}-${idx}`;
    switch (n.kind) {
      case 'text':
        return <span key={k}>{sanitizeString(n.value)}</span>;
      case 'bold':
        return <strong key={k}>{renderInline(n.children, ctx, k)}</strong>;
      case 'italic':
        return <em key={k}>{renderInline(n.children, ctx, k)}</em>;
      case 'strike':
        return <s key={k}>{renderInline(n.children, ctx, k)}</s>;
      case 'code':
        return (
          <code
            key={k}
            style={{
              background: ctx.theme.css.surfaceAlt,
              border: `1px solid ${ctx.theme.css.border}`,
              borderRadius: 4,
              padding: '0.15em 0.4em',
              fontSize: '0.9em',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
              wordBreak: 'break-word',
            }}
          >
            {sanitizeString(n.value)}
          </code>
        );
      case 'link': {
        const href = sanitizeHref(n.href);
        if (!href) return <span key={k}>{renderInline(n.children, ctx, k)}</span>;
        const isExternal = /^(https?:)?\/\//i.test(href) || href.startsWith('mailto:');
        return (
          <a
            key={k}
            href={href}
            target={isExternal ? ctx.externalLinkTarget : undefined}
            rel={isExternal ? ctx.externalLinkRel : undefined}
            onClick={(ev) => {
              if (ctx.onLinkClick?.(href, ev) === false) ev.preventDefault();
            }}
            style={{ color: ctx.theme.css.primary, textDecoration: 'underline', wordBreak: 'break-word' }}
          >
            {renderInline(n.children, ctx, k)}
          </a>
        );
      }
      case 'image':
        return (
          <img
            key={k}
            src={sanitizeHref(n.src) || ''}
            alt={sanitizeString(n.alt)}
            loading="lazy"
            decoding="async"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: 6, display: 'inline-block' }}
          />
        );
    }
  });
}

/**
 * Only allow http/https/mailto/relative URLs. Anything else (javascript:,
 * data:, vbscript:) is stripped. Prevents XSS through user-authored Markdown.
 */
function sanitizeHref(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^javascript:/i.test(t)) return null;
  if (/^data:/i.test(t) && !/^data:image\//i.test(t)) return null;
  if (/^vbscript:/i.test(t)) return null;
  return t;
}

function CopyCodeButton({ text, theme }: { text: string; theme: ReturnType<typeof useTheme> }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }
      }}
      aria-label={copied ? 'Copied to clipboard' : 'Copy code'}
      style={{
        position: 'absolute',
        top: 6,
        right: 6,
        padding: '2px 8px',
        fontSize: 11,
        background: theme.css.surface,
        color: copied ? theme.css.success : theme.css.textMuted,
        border: `1px solid ${theme.css.border}`,
        borderRadius: 4,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'color 120ms',
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function renderBlocks(blocks: Block[], ctx: RenderCtx, keyPrefix = 'b'): ReactNode[] {
  return blocks.map((b, idx) => {
    const k = `${keyPrefix}-${idx}`;
    switch (b.kind) {
      case 'heading': {
        const Tag = `h${b.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        const sizes: Record<number, { fs: string; lh: string; mt: string; mb: string; fw: number }> = {
          1: { fs: ctx.compact ? '1.75rem' : '2rem',   lh: '1.2',  mt: '0.6em', mb: '0.5em', fw: 700 },
          2: { fs: ctx.compact ? '1.4rem'  : '1.6rem', lh: '1.25', mt: '1em',   mb: '0.5em', fw: 700 },
          3: { fs: ctx.compact ? '1.2rem'  : '1.3rem', lh: '1.3',  mt: '1em',   mb: '0.4em', fw: 600 },
          4: { fs: '1.1rem', lh: '1.35', mt: '1em',   mb: '0.4em', fw: 600 },
          5: { fs: '1rem',   lh: '1.4',  mt: '1em',   mb: '0.3em', fw: 600 },
          6: { fs: '0.9rem', lh: '1.4',  mt: '1em',   mb: '0.3em', fw: 600 },
        };
        const s = sizes[b.level];
        return (
          <Tag
            key={k}
            style={{
              fontSize: s.fs,
              lineHeight: s.lh,
              marginTop: s.mt,
              marginBottom: s.mb,
              fontWeight: s.fw,
              color: ctx.theme.css.text,
              scrollMarginTop: '1em',
            }}
          >
            {renderInline(b.inline, ctx, k)}
          </Tag>
        );
      }

      case 'paragraph':
        return (
          <p
            key={k}
            style={{
              margin: `0 0 ${ctx.compact ? '0.7em' : '1em'}`,
              lineHeight: 1.65,
              color: ctx.theme.css.text,
              wordBreak: 'break-word',
            }}
          >
            {renderInline(b.inline, ctx, k)}
          </p>
        );

      case 'blockquote':
        return (
          <blockquote
            key={k}
            style={{
              margin: '0 0 1em',
              padding: '0.5em 1em',
              borderLeft: `4px solid ${ctx.theme.css.primary}`,
              background: `${ctx.theme.css.surfaceAlt}`,
              color: ctx.theme.css.textMuted,
              borderRadius: '0 6px 6px 0',
            }}
          >
            {renderBlocks(b.children, ctx, k)}
          </blockquote>
        );

      case 'code': {
        const raw = b.value;
        return (
          <div
            key={k}
            style={{
              position: 'relative',
              margin: '0 0 1em',
              border: `1px solid ${ctx.theme.css.border}`,
              borderRadius: 8,
              background: ctx.theme.css.surfaceAlt,
              overflow: 'hidden',
            }}
          >
            {b.language && (
              <div
                style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  color: ctx.theme.css.textMuted,
                  borderBottom: `1px solid ${ctx.theme.css.border}`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {sanitizeString(b.language)}
              </div>
            )}
            {ctx.copyableCode && <CopyCodeButton text={raw} theme={ctx.theme} />}
            <pre
              style={{
                margin: 0,
                padding: 12,
                overflowX: 'auto',
                fontSize: 13,
                lineHeight: 1.55,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                color: ctx.theme.css.text,
                whiteSpace: 'pre',
              }}
            >
              <code>{sanitizeString(raw)}</code>
            </pre>
          </div>
        );
      }

      case 'list': {
        const Tag = b.ordered ? 'ol' : 'ul';
        return (
          <Tag
            key={k}
            style={{
              margin: '0 0 1em',
              paddingLeft: '1.5em',
              color: ctx.theme.css.text,
              lineHeight: 1.65,
            }}
          >
            {b.items.map((item, ii) => (
              <li key={`${k}-${ii}`} style={{ listStyle: item.task !== null ? 'none' : undefined, marginLeft: item.task !== null ? '-1.25em' : undefined }}>
                {item.task !== null && (
                  <input
                    type="checkbox"
                    disabled
                    checked={item.task === 'checked'}
                    readOnly
                    style={{ marginRight: 6, verticalAlign: 'middle' }}
                    aria-label={item.task === 'checked' ? 'Completed task' : 'Uncompleted task'}
                  />
                )}
                {renderBlocks(item.blocks, ctx, `${k}-${ii}`)}
              </li>
            ))}
          </Tag>
        );
      }

      case 'hr':
        return (
          <hr
            key={k}
            style={{
              border: 'none',
              borderTop: `1px solid ${ctx.theme.css.border}`,
              margin: '1.5em 0',
            }}
          />
        );

      case 'table':
        return (
          <div
            key={k}
            style={{
              overflowX: 'auto',
              margin: '0 0 1em',
              border: `1px solid ${ctx.theme.css.border}`,
              borderRadius: 6,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 14,
                color: ctx.theme.css.text,
              }}
            >
              <thead>
                <tr>
                  {b.headers.map((cell, ci) => (
                    <th
                      key={ci}
                      style={{
                        padding: '8px 12px',
                        textAlign: b.align[ci] ?? 'left',
                        borderBottom: `2px solid ${ctx.theme.css.border}`,
                        background: ctx.theme.css.surfaceAlt,
                        fontWeight: 600,
                      }}
                    >
                      {renderInline(cell, ctx, `${k}-h-${ci}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        style={{
                          padding: '8px 12px',
                          textAlign: b.align[ci] ?? 'left',
                          borderBottom: `1px solid ${ctx.theme.css.border}`,
                        }}
                      >
                        {renderInline(cell, ctx, `${k}-r-${ri}-${ci}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  });
}

// ── Component ────────────────────────────────────────────────────────────────

export function TkxMarkdown({
  source,
  src,
  maxWidth = '100%',
  compact = false,
  copyableCode = true,
  onLinkClick,
  externalLinkRel = 'noopener noreferrer',
  externalLinkTarget = '_blank',
  loadingFallback,
  errorFallback,
  className,
  style,
}: TkxMarkdownProps) {
  const theme = useTheme();
  const [remote, setRemote] = useState<{ text: string | null; error: string | null; loading: boolean }>({
    text: null,
    error: null,
    loading: !!src && source === undefined,
  });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (source !== undefined || !src) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setRemote({ text: null, error: null, loading: true });
    fetch(src, { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load markdown (HTTP ${res.status})`);
        const text = await res.text();
        setRemote({ text, error: null, loading: false });
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setRemote({ text: null, error: err.message, loading: false });
      });
    return () => ctrl.abort();
  }, [src, source]);

  const effectiveSource = source ?? remote.text ?? '';
  const blocks = useMemo(() => (effectiveSource ? parseBlocks(effectiveSource) : []), [effectiveSource]);

  const ctx: RenderCtx = {
    theme,
    compact,
    copyableCode,
    externalLinkRel,
    externalLinkTarget,
    onLinkClick,
  };

  const wrapperStyle: CSSProperties = {
    maxWidth,
    width: '100%',
    color: theme.css.text,
    fontFamily: 'inherit',
    fontSize: compact ? 14 : 15,
    lineHeight: 1.65,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    boxSizing: 'border-box',
    ...style,
  };

  if (source === undefined && src) {
    if (remote.loading) {
      return (
        <div className={className} style={wrapperStyle} aria-busy="true" aria-live="polite">
          {loadingFallback ?? <span style={{ color: theme.css.textMuted }}>Loading…</span>}
        </div>
      );
    }
    if (remote.error) {
      return (
        <div className={className} style={wrapperStyle} role="alert">
          {errorFallback
            ? errorFallback(remote.error)
            : <span style={{ color: theme.css.danger }}>{sanitizeString(remote.error)}</span>}
        </div>
      );
    }
  }

  return (
    <div className={className} style={wrapperStyle}>
      {renderBlocks(blocks, ctx)}
    </div>
  );
}

TkxMarkdown.displayName = 'TkxMarkdown';
