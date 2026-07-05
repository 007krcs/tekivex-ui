'use client';

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { useTheme, type ThemeTokens } from '../themes';
import { tkx, cx } from '../engine/tkx';

// ─────────────────────────────────────────────────────────────────────────────
// TkxCode — a zero-dependency, syntax-highlighted code block.
//
// Highlighting is done by a small line-based regex tokenizer that emits React
// <span> elements — NEVER dangerouslySetInnerHTML — so HTML-escaping bugs are
// structurally impossible. It is a *lightweight snippet highlighter* for docs
// and dev-tool UIs, not a full language grammar: it handles comments, strings,
// numbers, keywords, function calls, JSX/HTML tags + attributes, CSS
// selectors/properties, and bash variables/flags, with simple cross-line state
// for /* */, <!-- --> and Python triple-quoted strings. It does NOT parse
// template-literal interpolation nesting, regex literals, heredocs, or other
// grammar-level constructs — for those, reach for a real highlighter.
//
// Token colours come exclusively from theme tokens (no hardcoded hex):
//   keyword → primary · string → success · comment → textMuted (italic)
//   number → warning · boolean/null → secondary · function call → info
//   tag/selector → danger · attribute/variable → secondary · property/flag → info
// ─────────────────────────────────────────────────────────────────────────────

export type TkxCodeLanguage =
  | 'ts'
  | 'tsx'
  | 'js'
  | 'jsx'
  | 'json'
  | 'bash'
  | 'css'
  | 'html'
  | 'python'
  | 'text';

export interface TkxCodeProps {
  /** The source code to display. Defaults to '' — a bare mount never crashes. */
  code?: string;
  /** Language for highlighting. Default 'text' = plain, no token spans. */
  language?: TkxCodeLanguage;
  /** Render a line-number gutter (aria-hidden). Default false. */
  showLineNumbers?: boolean;
  /** 1-based line numbers to emphasise with a theme.primary-tinted row. */
  highlightLines?: number[];
  /** Show a copy-to-clipboard button. Default true. */
  copyable?: boolean;
  /** Optional filename shown in a header bar above the code. */
  filename?: string;
  /** Soft-wrap long lines instead of horizontal scrolling. Default false. */
  wrap?: boolean;
  /** Cap the height of the scrollable code area (number = px). */
  maxHeight?: number | string;
  className?: string;
  style?: CSSProperties;
}

// ── Tokenizer ────────────────────────────────────────────────────────────────

type TokenType =
  | 'plain'
  | 'keyword'
  | 'string'
  | 'comment'
  | 'number'
  | 'boolean'
  | 'function'
  | 'tag'
  | 'attr'
  | 'property'
  | 'selector'
  | 'variable'
  | 'flag';

interface Token {
  t: TokenType;
  v: string;
}

/** Cross-line scanner state (multi-line comments / triple-quoted strings). */
interface ScanState {
  /** An open multi-line region waiting for its end marker. */
  open: { end: string; type: 'comment' | 'string' } | null;
  /** Inside an HTML/JSX tag (between `<name` and `>`). */
  inTag: boolean;
  /** CSS `{ }` nesting depth (0 = selector context). */
  cssDepth: number;
}

const JS_KEYWORDS = new Set([
  'abstract', 'as', 'async', 'await', 'break', 'case', 'catch', 'class',
  'const', 'continue', 'debugger', 'declare', 'default', 'delete', 'do',
  'else', 'enum', 'export', 'extends', 'finally', 'for', 'from', 'function',
  'get', 'if', 'implements', 'import', 'in', 'instanceof', 'interface',
  'keyof', 'let', 'namespace', 'new', 'of', 'private', 'protected', 'public',
  'readonly', 'return', 'satisfies', 'set', 'static', 'super', 'switch',
  'this', 'throw', 'try', 'type', 'typeof', 'var', 'void', 'while', 'with',
  'yield',
]);
const JS_LITERALS = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);

const PY_KEYWORDS = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
  'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global',
  'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass',
  'raise', 'return', 'try', 'while', 'with', 'yield',
]);
const PY_LITERALS = new Set(['True', 'False', 'None']);

const BASH_KEYWORDS = new Set([
  'if', 'then', 'elif', 'else', 'fi', 'for', 'while', 'until', 'do', 'done',
  'case', 'esac', 'function', 'in', 'select', 'time', 'return', 'exit',
  'export', 'local', 'readonly', 'declare', 'echo', 'cd', 'source', 'set',
  'unset', 'alias', 'sudo',
]);

const JSON_LITERALS = new Set(['true', 'false', 'null']);

const NUM_RE = /^(0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?)/;
const IDENT_RE = /^[A-Za-z_$][\w$]*/;

/** Is the character before index `i` a word character? (word-boundary check) */
function prevIsWord(line: string, i: number): boolean {
  return i > 0 && /[\w$]/.test(line[i - 1]);
}

/** Skip whitespace and return the next non-space character (or ''). */
function nextNonSpace(line: string, i: number): string {
  const m = /\S/.exec(line.slice(i));
  return m ? m[0] : '';
}

/**
 * Tokenize a single line. Appends tokens; returns nothing. Mutates `state`
 * for constructs that span lines. Precedence within a line is positional:
 * comment/string rules are tried first at each cursor position, so a keyword
 * inside a string is consumed as part of the string token.
 */
function tokenizeLine(line: string, lang: TkxCodeLanguage, state: ScanState): Token[] {
  const out: Token[] = [];
  let i = 0;
  let plainStart = 0;

  const flushPlain = (upTo: number) => {
    if (upTo > plainStart) out.push({ t: 'plain', v: line.slice(plainStart, upTo) });
  };
  const push = (t: TokenType, len: number) => {
    flushPlain(i);
    out.push({ t, v: line.slice(i, i + len) });
    i += len;
    plainStart = i;
  };

  // Resume an open multi-line region (block comment / triple-quoted string).
  if (state.open) {
    const idx = line.indexOf(state.open.end);
    if (idx === -1) {
      out.push({ t: state.open.type, v: line });
      return out;
    }
    const len = idx + state.open.end.length;
    out.push({ t: state.open.type, v: line.slice(0, len) });
    i = len;
    plainStart = i;
    state.open = null;
  }

  const jsLike = lang === 'ts' || lang === 'tsx' || lang === 'js' || lang === 'jsx';
  const jsxTags = lang === 'tsx' || lang === 'jsx';

  while (i < line.length) {
    const s = line.slice(i);
    const ch = s[0];

    // ── comments (highest precedence) ──
    if (jsLike || lang === 'css') {
      if (jsLike && s.startsWith('//')) { push('comment', s.length); continue; }
      if (s.startsWith('/*')) {
        const end = s.indexOf('*/', 2);
        if (end === -1) {
          state.open = { end: '*/', type: 'comment' };
          push('comment', s.length);
        } else push('comment', end + 2);
        continue;
      }
    }
    if ((lang === 'bash' || lang === 'python') && ch === '#') { push('comment', s.length); continue; }
    if (lang === 'html' && s.startsWith('<!--')) {
      const end = s.indexOf('-->', 4);
      if (end === -1) {
        state.open = { end: '-->', type: 'comment' };
        push('comment', s.length);
      } else push('comment', end + 3);
      continue;
    }

    // ── strings (second precedence) ──
    if (lang === 'python' && /^[rRbBfFuU]{0,2}('''|""")/.test(s)) {
      const m = /^[rRbBfFuU]{0,2}('''|""")/.exec(s)!;
      const q = m[1];
      const end = s.indexOf(q, m[0].length);
      if (end === -1) {
        state.open = { end: q, type: 'string' };
        push('string', s.length);
      } else push('string', end + q.length);
      continue;
    }
    const strPrefix = lang === 'python' ? (/^[rRbBfFuU]{0,2}/.exec(s)?.[0] ?? '') : '';
    const qch = s[strPrefix.length];
    if (
      (qch === "'" || qch === '"') &&
      !(lang === 'python' && strPrefix && prevIsWord(line, i)) &&
      // in HTML, quotes are only string delimiters inside a tag
      (lang !== 'html' || state.inTag) &&
      (lang !== 'json' || qch === '"')
    ) {
      const re = qch === "'" ? /'(?:\\.|[^'\\])*'/ : /"(?:\\.|[^"\\])*"/;
      const m = re.exec(s.slice(strPrefix.length));
      const len = m && m.index === 0 ? strPrefix.length + m[0].length : s.length;
      if (lang === 'json') {
        // A JSON string followed by ':' is an object key.
        const isKey = nextNonSpace(line, i + len) === ':';
        push(isKey ? 'property' : 'string', len);
      } else {
        push('string', len);
      }
      continue;
    }
    if (jsLike && ch === '`') {
      const end = s.indexOf('`', 1);
      if (end === -1) {
        state.open = { end: '`', type: 'string' };
        push('string', s.length);
      } else push('string', end + 1);
      continue;
    }

    // ── language-specific rules ──
    if (lang === 'bash') {
      const vm = /^\$(\{[^}]*\}|[\w?@#!*-]+|\$)/.exec(s);
      if (vm) { push('variable', vm[0].length); continue; }
      const atWordStart = i === 0 || /\s/.test(line[i - 1]);
      const fm = /^--?[A-Za-z][\w-]*/.exec(s);
      if (fm && atWordStart) { push('flag', fm[0].length); continue; }
      const im = /^[A-Za-z_][\w-]*/.exec(s);
      if (im && !prevIsWord(line, i)) {
        push(BASH_KEYWORDS.has(im[0]) ? 'keyword' : 'plain', im[0].length);
        continue;
      }
      const nm = NUM_RE.exec(s);
      if (nm && !prevIsWord(line, i)) { push('number', nm[0].length); continue; }
      push('plain', 1);
      continue;
    }

    if (lang === 'css') {
      const am = /^@[\w-]+/.exec(s);
      if (am) { push('keyword', am[0].length); continue; }
      if (s.startsWith('!important')) { push('keyword', '!important'.length); continue; }
      const hm = /^#[0-9a-fA-F]{3,8}\b/.exec(s);
      if (hm && state.cssDepth > 0) { push('number', hm[0].length); continue; }
      if (ch === '{') { state.cssDepth++; push('plain', 1); continue; }
      if (ch === '}') { state.cssDepth = Math.max(0, state.cssDepth - 1); push('plain', 1); continue; }
      if (state.cssDepth > 0) {
        const pm = /^-{0,2}[A-Za-z][\w-]*(?=\s*:)/.exec(s);
        if (pm) { push('property', pm[0].length); continue; }
        const nm = /^-?\d+(\.\d+)?[a-z%]*/.exec(s);
        if (nm && !prevIsWord(line, i)) { push('number', nm[0].length); continue; }
      } else {
        const sm = /^(::?[-\w]+|[.#]?-?[A-Za-z][\w-]*|\*)/.exec(s);
        if (sm) { push('selector', sm[0].length); continue; }
      }
      push('plain', 1);
      continue;
    }

    if (lang === 'html' || (jsxTags && !state.inTag)) {
      const tm = /^<\/?[A-Za-z][\w.:-]*/.exec(s);
      if (tm) {
        const openerLen = tm[0].startsWith('</') ? 2 : 1;
        push('plain', openerLen);
        push('tag', tm[0].length - openerLen);
        state.inTag = true;
        continue;
      }
      if (lang === 'html' && /^<!/.test(s)) {
        const end = s.indexOf('>');
        push('keyword', end === -1 ? s.length : end + 1);
        continue;
      }
    }
    if ((lang === 'html' || jsxTags) && state.inTag) {
      if (s.startsWith('/>')) { push('plain', 2); state.inTag = false; continue; }
      if (ch === '>') { push('plain', 1); state.inTag = false; continue; }
      if (lang === 'html') {
        const am = /^[A-Za-z_:][\w:.-]*/.exec(s);
        if (am) { push('attr', am[0].length); continue; }
        push('plain', 1);
        continue;
      }
      // JSX attribute names (value expressions fall through to normal JS rules)
      const am = /^[A-Za-z_][\w-]*(?=\s*[={\s/>])/.exec(s);
      if (am && !prevIsWord(line, i)) { push('attr', am[0].length); continue; }
    }
    if (lang === 'html') { push('plain', 1); continue; }

    if (lang === 'json') {
      const nm = NUM_RE.exec(s);
      if ((nm || /^-\d/.test(s)) && !prevIsWord(line, i)) {
        const neg = ch === '-' ? 1 : 0;
        const m2 = NUM_RE.exec(s.slice(neg));
        if (m2) { push('number', neg + m2[0].length); continue; }
      }
      const im = IDENT_RE.exec(s);
      if (im && !prevIsWord(line, i)) {
        push(JSON_LITERALS.has(im[0]) ? 'boolean' : 'plain', im[0].length);
        continue;
      }
      push('plain', 1);
      continue;
    }

    // js-like + python shared tail: numbers, decorators, identifiers
    if (lang === 'python' && ch === '@') {
      const dm = /^@[\w.]+/.exec(s);
      if (dm) { push('function', dm[0].length); continue; }
    }
    const nm = NUM_RE.exec(s);
    if (nm && !prevIsWord(line, i)) { push('number', nm[0].length); continue; }
    const im = IDENT_RE.exec(s);
    if (im && !prevIsWord(line, i)) {
      const word = im[0];
      const keywords = lang === 'python' ? PY_KEYWORDS : JS_KEYWORDS;
      const literals = lang === 'python' ? PY_LITERALS : JS_LITERALS;
      if (keywords.has(word)) push('keyword', word.length);
      else if (literals.has(word)) push('boolean', word.length);
      else if (nextNonSpace(line, i + word.length) === '(') push('function', word.length);
      else push('plain', word.length);
      continue;
    }
    push('plain', 1);
  }

  flushPlain(line.length);
  return out;
}

/** Tokenize a whole snippet into per-line token arrays. */
function tokenize(code: string, lang: TkxCodeLanguage): Token[][] {
  const lines = code.split('\n');
  if (lang === 'text') return lines.map((l) => (l ? [{ t: 'plain' as const, v: l }] : []));
  const state: ScanState = { open: null, inTag: false, cssDepth: 0 };
  return lines.map((l) => tokenizeLine(l, lang, state));
}

// ── Token → theme colour mapping (theme tokens only, no hardcoded hex) ──────

function tokenStyle(type: TokenType, theme: ThemeTokens): CSSProperties | undefined {
  switch (type) {
    case 'keyword': return { color: theme.primary };
    case 'string': return { color: theme.success };
    case 'comment': return { color: theme.textMuted, fontStyle: 'italic' };
    case 'number': return { color: theme.warning };
    case 'boolean': return { color: theme.secondary };
    case 'function': return { color: theme.info };
    case 'tag': return { color: theme.danger };
    case 'attr': return { color: theme.secondary };
    case 'property': return { color: theme.info };
    case 'selector': return { color: theme.danger };
    case 'variable': return { color: theme.secondary };
    case 'flag': return { color: theme.info };
    default: return undefined;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * TkxCode — zero-dependency syntax-highlighted code block for docs and
 * dev-tool UIs.
 *
 * Uses a lightweight line-based regex tokenizer (comments > strings > the
 * rest) that renders React `<span>` text nodes — never
 * `dangerouslySetInnerHTML` — so untrusted snippets cannot inject markup.
 * It is intentionally snippet-scale: no template-literal interpolation
 * nesting, regex-literal detection, heredocs, or full grammar fidelity.
 * Multi-line block comments (slash-star), HTML comments and Python
 * triple-quoted strings are handled via simple state carried across lines.
 *
 * SSR-safe: no `window`/`document` at module scope; the clipboard is only
 * touched inside the click handler behind a `typeof navigator` guard.
 */
export const TkxCode = forwardRef<HTMLDivElement, TkxCodeProps>(
  (
    {
      code = '',
      language = 'text',
      showLineNumbers = false,
      highlightLines,
      copyable = true,
      filename,
      wrap = false,
      maxHeight,
      className,
      style,
    },
    ref,
  ) => {
    const theme = useTheme();
    const [copied, setCopied] = useState(false);
    const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
      () => () => {
        if (copiedTimer.current) clearTimeout(copiedTimer.current);
      },
      [],
    );

    // Strip one trailing newline so a final '\n' doesn't render an empty row.
    const displayCode = code.endsWith('\n') ? code.slice(0, -1) : code;
    const lines = useMemo(() => tokenize(displayCode, language), [displayCode, language]);
    const highlighted = useMemo(() => new Set(highlightLines ?? []), [highlightLines]);
    const gutterWidth = `${String(lines.length).length}ch`;

    const handleCopy = () => {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;
      navigator.clipboard
        .writeText(code)
        .then(() => {
          setCopied(true);
          if (copiedTimer.current) clearTimeout(copiedTimer.current);
          copiedTimer.current = setTimeout(() => setCopied(false), 1500);
        })
        .catch(() => {
          /* clipboard unavailable (permissions / insecure context) — ignore */
        });
    };

    const copyButton = copyable ? (
      <button
        type="button"
        aria-label="Copy code"
        onClick={handleCopy}
        className={tkx('text-xs font-sans cursor-pointer rounded-md shrink-0')}
        style={{
          color: copied ? theme.success : theme.textMuted,
          backgroundColor: theme.surfaceAlt,
          border: `1px solid ${theme.border}`,
          padding: '0.25rem 0.5rem',
          lineHeight: 1.2,
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    ) : null;

    const codeLabel = filename
      ? `Code: ${filename}`
      : language === 'text'
        ? 'Code snippet'
        : `${language} code snippet`;

    return (
      <div
        ref={ref}
        className={cx(tkx('w-full rounded-lg overflow-hidden relative'), className)}
        style={{
          backgroundColor: theme.surface,
          border: `1px solid ${theme.border}`,
          ...style,
        }}
      >
        {filename && (
          <div
            className={tkx('flex items-center justify-between gap-2')}
            style={{
              padding: '0.375rem 0.75rem',
              borderBottom: `1px solid ${theme.border}`,
              backgroundColor: theme.surfaceAlt,
            }}
          >
            <span className={tkx('text-xs font-mono')} style={{ color: theme.textMuted }}>
              {filename}
            </span>
            {copyButton}
          </div>
        )}
        {!filename && copyButton && (
          <div className={tkx('absolute')} style={{ top: '0.5rem', right: '0.5rem', zIndex: 1 }}>
            {copyButton}
          </div>
        )}

        <pre
          className={tkx('font-mono text-sm')}
          style={{
            margin: 0,
            padding: '0.75rem 0',
            overflow: 'auto',
            maxHeight,
            color: theme.text,
          }}
        >
          <code aria-label={codeLabel} style={{ display: 'block', minWidth: 'max-content' }}>
            {lines.map((tokens, idx) => {
              const lineNo = idx + 1;
              const isHighlighted = highlighted.has(lineNo);
              return (
                <div
                  key={lineNo}
                  data-line={lineNo}
                  data-highlighted={isHighlighted || undefined}
                  className={tkx('flex')}
                  style={{
                    padding: '0 0.75rem',
                    borderLeft: `2px solid ${isHighlighted ? theme.primary : 'transparent'}`,
                    position: 'relative',
                  }}
                >
                  {isHighlighted && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: theme.primary,
                        opacity: 0.08,
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                  {showLineNumbers && (
                    <span
                      aria-hidden="true"
                      className={tkx('select-none text-right shrink-0')}
                      style={{
                        minWidth: gutterWidth,
                        marginRight: '1rem',
                        color: theme.textMuted,
                      }}
                    >
                      {lineNo}
                    </span>
                  )}
                  <span style={{ whiteSpace: wrap ? 'pre-wrap' : 'pre', flex: 1 }}>
                    {tokens.length === 0
                      ? '\n'
                      : tokens.map((tok, ti) => {
                          const ts = tokenStyle(tok.t, theme);
                          return ts ? (
                            <span key={ti} data-token={tok.t} style={ts}>
                              {tok.v}
                            </span>
                          ) : (
                            tok.v
                          );
                        })}
                    {tokens.length > 0 && '\n'}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    );
  },
);

TkxCode.displayName = 'TkxCode';
