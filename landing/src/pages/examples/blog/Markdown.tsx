// ─────────────────────────────────────────────────────────────────────────────
// Tiny self-contained markdown renderer for the blog example.
//
// Why hand-roll instead of pulling marked / markdown-it?
//   - Zero extra bundle weight (every byte counts on the landing site)
//   - Full control over which features we expose (we explicitly skip raw
//     HTML pass-through to keep user-content-driven posts safe)
//   - The set of features needed for a blog is small: headings, paragraphs,
//     bold/italic/inline-code, links, images, lists, blockquotes, hr, and
//     fenced code blocks with naive language tinting.
// ─────────────────────────────────────────────────────────────────────────────
import { useMemo } from 'react';

interface Token {
  kind:
    | 'h1' | 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'quote' | 'code' | 'hr' | 'image';
  text?: string;
  items?: string[];
  lang?: string;
  url?: string;
  alt?: string;
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s: string): string {
  // Order matters: process code spans first to protect their content, then
  // links, images, bold, italic.
  let out = escape(s);
  out = out.replace(/`([^`]+)`/g, '<code class="md-code-inline">$1</code>');
  out = out.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img alt="$1" src="$2" loading="lazy" class="md-img" />',
  );
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>',
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  return out;
}

function tokenize(src: string): Token[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const tokens: Token[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced code
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const lang = fence[1] || '';
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      tokens.push({ kind: 'code', lang, text: buf.join('\n') });
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      tokens.push({ kind: 'hr' });
      i++;
      continue;
    }

    if (/^#\s+/.test(line)) {
      tokens.push({ kind: 'h1', text: line.replace(/^#\s+/, '').trim() });
      i++;
      continue;
    }
    if (/^##\s+/.test(line)) {
      tokens.push({ kind: 'h2', text: line.replace(/^##\s+/, '').trim() });
      i++;
      continue;
    }
    if (/^###\s+/.test(line)) {
      tokens.push({ kind: 'h3', text: line.replace(/^###\s+/, '').trim() });
      i++;
      continue;
    }

    if (/^>\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s+/, ''));
        i++;
      }
      tokens.push({ kind: 'quote', text: buf.join(' ') });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      tokens.push({ kind: 'ul', items });
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      tokens.push({ kind: 'ol', items });
      continue;
    }

    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph: gather until blank
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#|>|\d+\.\s|[-*]\s|```)/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    tokens.push({ kind: 'p', text: buf.join(' ') });
  }
  return tokens;
}

// Naive but readable code highlighter. Tints keywords, strings, comments,
// and numbers for the half-dozen languages a blog actually shows.
function highlight(code: string, lang: string): string {
  const KEYWORDS: Record<string, string[]> = {
    js: 'const let var function return if else for while class extends import export from new typeof instanceof async await yield true false null undefined this'.split(' '),
    ts: 'const let var function return if else for while class extends import export from new typeof instanceof async await yield true false null undefined this interface type enum public private readonly as'.split(' '),
    tsx: 'const let var function return if else for while class extends import export from new typeof instanceof async await yield true false null undefined this interface type enum public private readonly as'.split(' '),
    jsx: 'const let var function return if else for while class extends import export from new typeof instanceof async await yield true false null undefined this'.split(' '),
    css: '@media @keyframes @supports @import @font-face from to'.split(' '),
    bash: 'echo cd ls cat grep awk sed if then else fi for in do done while npm yarn pnpm node git curl wget'.split(' '),
    sh: 'echo cd ls cat grep awk sed if then else fi for in do done while npm yarn pnpm node git curl wget'.split(' '),
  };
  const keywords = KEYWORDS[lang] || [];
  let out = escape(code);
  // strings
  out = out.replace(/(&quot;|&#039;|&#x27;|`)([^`]*?)\1/g, (_, q, s) =>
    `<span class="md-code-str">${q}${s}${q}</span>`,
  );
  out = out.replace(/(['"])(?:(?=(\\?))\2.)*?\1/g, (m) => `<span class="md-code-str">${m}</span>`);
  // single-line comments
  out = out.replace(/(\/\/[^\n]*)/g, '<span class="md-code-cm">$1</span>');
  out = out.replace(/(#[^\n]*)/g, (m) => (lang === 'bash' || lang === 'sh' ? `<span class="md-code-cm">${m}</span>` : m));
  // numbers
  out = out.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="md-code-num">$1</span>');
  // keywords
  if (keywords.length) {
    const re = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    out = out.replace(re, '<span class="md-code-kw">$1</span>');
  }
  return out;
}

function render(tokens: Token[]): string {
  return tokens
    .map((t) => {
      switch (t.kind) {
        case 'h1':    return `<h1>${inline(t.text!)}</h1>`;
        case 'h2':    return `<h2>${inline(t.text!)}</h2>`;
        case 'h3':    return `<h3>${inline(t.text!)}</h3>`;
        case 'p':     return `<p>${inline(t.text!)}</p>`;
        case 'hr':    return `<hr />`;
        case 'quote': return `<blockquote>${inline(t.text!)}</blockquote>`;
        case 'ul':    return `<ul>${(t.items || []).map((it) => `<li>${inline(it)}</li>`).join('')}</ul>`;
        case 'ol':    return `<ol>${(t.items || []).map((it) => `<li>${inline(it)}</li>`).join('')}</ol>`;
        case 'code': {
          const html = highlight(t.text || '', (t.lang || '').toLowerCase());
          return `<pre class="md-pre" data-lang="${t.lang || ''}"><code>${html}</code></pre>`;
        }
        default: return '';
      }
    })
    .join('\n');
}

export function Markdown({ source }: { source: string }) {
  const html = useMemo(() => render(tokenize(source || '')), [source]);
  return (
    <div
      className="md-body"
      // Sanitised: every text segment passed through inline()/escape();
      // raw HTML in the source is escaped, not pass-through.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
