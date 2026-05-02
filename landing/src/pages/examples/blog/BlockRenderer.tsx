// ─────────────────────────────────────────────────────────────────────────────
// BlockRenderer — turns the structured Block[] into clean HTML for the
// reader-facing post view. Same component used by the live preview in the
// editor so writers see exactly what readers will see.
// ─────────────────────────────────────────────────────────────────────────────
import type { Block } from './store';

const KEYWORDS: Record<string, string[]> = {
  js:   'const let var function return if else for while class extends import export from new typeof instanceof async await yield true false null undefined this'.split(' '),
  ts:   'const let var function return if else for while class extends import export from new typeof instanceof async await yield true false null undefined this interface type enum public private readonly as'.split(' '),
  tsx:  'const let var function return if else for while class extends import export from new typeof instanceof async await yield true false null undefined this interface type enum public private readonly as'.split(' '),
  jsx:  'const let var function return if else for while class extends import export from new typeof instanceof async await yield true false null undefined this'.split(' '),
  css:  '@media @keyframes @supports @import @font-face from to'.split(' '),
  html: ''.split(' '),
  json: 'true false null'.split(' '),
  bash: 'echo cd ls cat grep awk sed if then else fi for in do done while npm yarn pnpm node git curl wget'.split(' '),
  sh:   'echo cd ls cat grep awk sed if then else fi for in do done while npm yarn pnpm node git curl wget'.split(' '),
};

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlight(code: string, lang: string): string {
  const keywords = KEYWORDS[lang] ?? [];
  let out = escape(code);
  out = out.replace(/(['"`])((?:\\.|(?!\1).)*)\1/g, (m) => `<span class="md-code-str">${m}</span>`);
  out = out.replace(/(\/\/[^\n]*)/g, '<span class="md-code-cm">$1</span>');
  if (lang === 'bash' || lang === 'sh') {
    out = out.replace(/(#[^\n]*)/g, '<span class="md-code-cm">$1</span>');
  }
  out = out.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="md-code-num">$1</span>');
  if (keywords.length) {
    const re = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    out = out.replace(re, '<span class="md-code-kw">$1</span>');
  }
  return out;
}

function videoEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const v = url.match(/vimeo\.com\/(\d+)/);
  if (v) return `https://player.vimeo.com/video/${v[1]}`;
  return null;
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="md-prose">
      {blocks.map((b) => {
        switch (b.type) {
          case 'paragraph':
            return <p key={b.id}>{b.text || ' '}</p>;
          case 'heading':
            return b.level === 2
              ? <h2 key={b.id}>{b.text}</h2>
              : <h3 key={b.id}>{b.text}</h3>;
          case 'quote':
            return <blockquote key={b.id}>{b.text}</blockquote>;
          case 'divider':
            return <hr key={b.id} />;
          case 'image':
            return (
              <figure key={b.id} style={{ margin: '20px 0' }}>
                <img
                  src={b.src}
                  alt={b.alt}
                  loading="lazy"
                  style={{ width: '100%', borderRadius: 10, display: 'block' }}
                />
                {b.caption && (
                  <figcaption
                    style={{
                      textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 8, fontStyle: 'italic',
                    }}
                  >
                    {b.caption}
                  </figcaption>
                )}
              </figure>
            );
          case 'video': {
            const embed = videoEmbed(b.url);
            return (
              <figure key={b.id} style={{ margin: '20px 0' }}>
                {embed ? (
                  <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
                    <iframe
                      src={embed}
                      title={b.caption || 'embedded video'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                    />
                  </div>
                ) : (
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="md-link">
                    {b.url}
                  </a>
                )}
                {b.caption && (
                  <figcaption style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 8, fontStyle: 'italic' }}>
                    {b.caption}
                  </figcaption>
                )}
              </figure>
            );
          }
          case 'code':
            return (
              <pre className="md-pre" data-lang={b.lang} key={b.id}>
                <code dangerouslySetInnerHTML={{ __html: highlight(b.code, (b.lang || '').toLowerCase()) }} />
              </pre>
            );
          case 'list':
            return b.ordered
              ? <ol key={b.id}>{b.items.map((it, i) => <li key={i}>{it}</li>)}</ol>
              : <ul key={b.id}>{b.items.map((it, i) => <li key={i}>{it}</li>)}</ul>;
          default:
            return null;
        }
      })}
    </div>
  );
}
