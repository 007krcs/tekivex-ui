// ─────────────────────────────────────────────────────────────────────────────
// Editor — Medium-style block-based editor.
//
// No markdown visible to the user. Each block (paragraph, heading, image,
// code, quote, list, divider, video) renders as the same WYSIWYG element
// the reader sees. A floating "+" button appears between blocks to insert
// a new one; pick from a small picker.
//
// Why block-based:
//   - Most writers don't know markdown — Medium / Notion / Substack proved
//     a block UI is the default expectation.
//   - The data model is JSON, so future export formats (HTML, MDX, Notion)
//     are pure transformations without parsing user-typed syntax.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import type { Block, BlockKind, BlogConfig, BlogPost } from './types';
import {
  blockId,
  deriveExcerpt,
  ensureUniqueSlug,
  newPost,
  readingMinutes,
  savePost,
  slugify,
} from './store';
import { BlockRenderer } from './BlockRenderer';

interface EditorProps {
  config: BlogConfig;
  initial?: BlogPost;
  onClose: () => void;
  onSaved: (post: BlogPost) => void;
}

const CODE_LANGS = ['tsx', 'ts', 'jsx', 'js', 'css', 'html', 'json', 'bash', 'md', 'sql', 'py'];

export function Editor({ config, initial, onClose, onSaved }: EditorProps) {
  const [post, setPost] = useState<BlogPost>(
    () => initial ?? newPost(config.authorName, config.defaultCategory),
  );
  const [tagInput, setTagInput] = useState('');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!slugTouched) {
      setPost((p) => ({ ...p, slug: slugify(p.title) }));
    }
  }, [post.title, slugTouched]);

  function update<K extends keyof BlogPost>(key: K, value: BlogPost[K]) {
    setPost((p) => ({ ...p, [key]: value }));
  }
  function updateBlock(id: string, patch: Partial<Block>) {
    setPost((p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)) }));
  }
  function deleteBlock(id: string) {
    setPost((p) => ({
      ...p,
      blocks: p.blocks.length > 1 ? p.blocks.filter((b) => b.id !== id) : p.blocks,
    }));
  }
  function moveBlock(id: string, dir: -1 | 1) {
    setPost((p) => {
      const idx = p.blocks.findIndex((b) => b.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= p.blocks.length) return p;
      const blocks = p.blocks.slice();
      [blocks[idx], blocks[next]] = [blocks[next], blocks[idx]];
      return { ...p, blocks };
    });
  }
  function insertBlockAfter(afterId: string | null, kind: BlockKind) {
    setPost((p) => {
      const newBlock = makeBlock(kind);
      if (afterId === null) return { ...p, blocks: [newBlock, ...p.blocks] };
      const idx = p.blocks.findIndex((b) => b.id === afterId);
      const blocks = p.blocks.slice();
      blocks.splice(idx + 1, 0, newBlock);
      return { ...p, blocks };
    });
  }

  async function readImageDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  async function setCoverFromFile(file: File) {
    if (!file.type.startsWith('image/')) return alert('Pick an image.');
    update('coverImage', await readImageDataUrl(file));
  }

  function publish(status: 'draft' | 'published') {
    if (!post.title.trim()) return alert('Add a title first.');
    const finalSlug = ensureUniqueSlug(post.slug || slugify(post.title), post.id);
    const final: BlogPost = {
      ...post,
      slug: finalSlug,
      status,
      updatedAt: Date.now(),
      readingMinutes: readingMinutes(post.blocks),
      excerpt: post.excerpt || deriveExcerpt(post.blocks),
    };
    if (!initial) final.publishedAt = Date.now();
    savePost(final);
    onSaved(final);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <EditorStyles />

      {/* Top bar */}
      <header
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid #e6e8ef',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
          background: '#ffffff',
        }}
      >
        <button type="button" onClick={onClose} aria-label="Close editor"
          style={{ padding: '6px 10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 22, color: '#64748b', lineHeight: 1 }}>×</button>
        <strong style={{ color: '#0f172a', fontSize: 14 }}>
          {initial ? 'Edit story' : 'New story'}
        </strong>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>
          {readingMinutes(post.blocks)} min read · {post.blocks.length} blocks
        </span>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={() => setShowSettings(true)} style={btnSecondary}>⚙ Settings</button>
        <button type="button" onClick={() => publish('draft')} style={btnSecondary}>Save draft</button>
        <button
          type="button"
          onClick={() => publish('published')}
          style={{ ...btnPrimary, background: config.primaryColor }}
        >
          Publish
        </button>
      </header>

      {/* Scrollable canvas */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 200px' }}>
          {/* Cover */}
          <CoverPicker
            value={post.coverImage}
            onChange={(v) => update('coverImage', v)}
            onPick={setCoverFromFile}
          />

          {/* Title */}
          <textarea
            value={post.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Title"
            rows={1}
            ref={autoGrowRef}
            style={titleStyle}
          />
          <textarea
            value={post.subtitle}
            onChange={(e) => update('subtitle', e.target.value)}
            placeholder="Subtitle (optional)"
            rows={1}
            ref={autoGrowRef}
            style={subtitleStyle}
          />

          {/* Blocks */}
          <div style={{ marginTop: 12 }}>
            {/* Insert at top */}
            <BlockInserter onInsert={(k) => insertBlockAfter(null, k)} />
            {post.blocks.map((b, i) => (
              <div key={b.id}>
                <BlockEditor
                  block={b}
                  primary={config.primaryColor}
                  onChange={(patch) => updateBlock(b.id, patch)}
                  onDelete={() => deleteBlock(b.id)}
                  onMove={(d) => moveBlock(b.id, d)}
                  onEnter={() => insertBlockAfter(b.id, 'paragraph')}
                  isFirst={i === 0}
                  isLast={i === post.blocks.length - 1}
                />
                <BlockInserter onInsert={(k) => insertBlockAfter(b.id, k)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsDrawer
          post={post}
          tagInput={tagInput}
          setTagInput={setTagInput}
          config={config}
          onUpdate={update}
          onSlugTouched={() => setSlugTouched(true)}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

// ─── Cover picker ────────────────────────────────────────────────────────

function CoverPicker({
  value, onChange, onPick,
}: { value: string | undefined; onChange: (v: string) => void; onPick: (f: File) => void }) {
  return value ? (
    <div style={{ position: 'relative', marginBottom: 24 }}>
      <img src={value} alt="" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 12, display: 'block' }} />
      <button
        type="button"
        onClick={() => onChange('')}
        style={{
          position: 'absolute', top: 12, right: 12,
          padding: '6px 12px', borderRadius: 8, border: 'none',
          background: 'rgba(15,23,42,0.85)', color: '#fff', cursor: 'pointer',
          fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
        }}
      >
        Remove cover
      </button>
    </div>
  ) : (
    <label
      style={{
        display: 'block', marginBottom: 24,
        height: 180, borderRadius: 12,
        border: '2px dashed #cbd5e1', background: '#f8fafc',
        display_inner: 'grid' as never,
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        color: '#64748b', fontSize: 13, fontWeight: 600, gap: 4, textAlign: 'center', padding: 20,
      }}>
        <div style={{ fontSize: 28 }}>🖼️</div>
        <div>Click to add a cover image</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>PNG, JPG, WebP — embedded as a data URL</div>
      </div>
      <input
        type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }}
      />
    </label>
  );
}

// ─── Insert button (the floating "+" between blocks) ─────────────────────

function BlockInserter({ onInsert }: { onInsert: (k: BlockKind) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', height: open ? 'auto' : 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' }}>
      {!open && (
        <button
          type="button"
          aria-label="Insert block"
          onClick={() => setOpen(true)}
          className="bp-add-btn"
          title="Add block"
        >
          +
        </button>
      )}
      {open && (
        <div className="bp-popover" role="menu" aria-label="Pick block type">
          {INSERT_OPTIONS.map((opt) => (
            <button
              key={opt.kind}
              type="button"
              role="menuitem"
              className="bp-popover-item"
              onClick={() => { onInsert(opt.kind); setOpen(false); }}
            >
              <span style={{ fontSize: 22 }} aria-hidden="true">{opt.icon}</span>
              <span style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <strong>{opt.label}</strong>
                <span style={{ fontSize: 11, color: '#64748b' }}>{opt.hint}</span>
              </span>
            </button>
          ))}
          <button type="button" className="bp-popover-close" onClick={() => setOpen(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

const INSERT_OPTIONS: { kind: BlockKind; icon: string; label: string; hint: string }[] = [
  { kind: 'paragraph', icon: '¶',  label: 'Text',     hint: 'Plain paragraph' },
  { kind: 'heading2',  icon: 'H',  label: 'Heading',  hint: 'Section heading' },
  { kind: 'heading3',  icon: 'h',  label: 'Subheading', hint: 'Smaller heading' },
  { kind: 'image',     icon: '🖼️', label: 'Image',    hint: 'Upload from your device' },
  { kind: 'code',      icon: '⌘',  label: 'Code',     hint: 'Syntax-highlighted snippet' },
  { kind: 'quote',     icon: '❝',  label: 'Quote',    hint: 'Pull-quote' },
  { kind: 'list-ul',   icon: '•',  label: 'Bulleted list', hint: 'Unordered list' },
  { kind: 'list-ol',   icon: '1.', label: 'Numbered list', hint: 'Ordered list' },
  { kind: 'video',     icon: '▶',  label: 'Video',    hint: 'YouTube / Vimeo URL' },
  { kind: 'divider',   icon: '—',  label: 'Divider',  hint: 'Horizontal rule' },
];

// ─── Block editor (one of these per block) ────────────────────────────────

interface BlockEditorProps {
  block: Block;
  primary: string;
  onChange: (patch: Partial<Block>) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onEnter: () => void;
  isFirst: boolean;
  isLast: boolean;
}
function BlockEditor({ block, primary, onChange, onDelete, onMove, onEnter, isFirst, isLast }: BlockEditorProps) {
  return (
    <div className="bp-block">
      <div className="bp-block-toolbar" aria-label="Block controls">
        <button type="button" className="bp-tool" disabled={isFirst} onClick={() => onMove(-1)} aria-label="Move up" title="Move up">↑</button>
        <button type="button" className="bp-tool" disabled={isLast} onClick={() => onMove(1)} aria-label="Move down" title="Move down">↓</button>
        <button type="button" className="bp-tool" onClick={onDelete} aria-label="Delete block" title="Delete">×</button>
      </div>
      <div className="bp-block-body">
        {block.type === 'paragraph' && (
          <textarea
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value } as Partial<Block>)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEnter(); }
            }}
            placeholder="Write your story…"
            ref={autoGrowRef}
            rows={1}
            className="bp-text bp-paragraph"
          />
        )}
        {block.type === 'heading' && (
          <textarea
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value } as Partial<Block>)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEnter(); } }}
            placeholder={block.level === 2 ? 'Section heading' : 'Subheading'}
            ref={autoGrowRef}
            rows={1}
            className={`bp-text ${block.level === 2 ? 'bp-h2' : 'bp-h3'}`}
          />
        )}
        {block.type === 'quote' && (
          <textarea
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value } as Partial<Block>)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEnter(); } }}
            placeholder="A memorable line…"
            ref={autoGrowRef}
            rows={1}
            className="bp-text bp-quote"
            style={{ borderLeftColor: primary }}
          />
        )}
        {block.type === 'divider' && (
          <hr className="bp-divider" />
        )}
        {block.type === 'image' && (
          <ImageBlock block={block} onChange={onChange as (p: Partial<Block>) => void} />
        )}
        {block.type === 'code' && (
          <CodeBlock block={block} onChange={onChange as (p: Partial<Block>) => void} />
        )}
        {block.type === 'list' && (
          <ListBlock block={block} onChange={onChange as (p: Partial<Block>) => void} onEnter={onEnter} />
        )}
        {block.type === 'video' && (
          <VideoBlock block={block} onChange={onChange as (p: Partial<Block>) => void} />
        )}
      </div>
    </div>
  );
}

// ─── Specialised block bodies ────────────────────────────────────────────

function ImageBlock({
  block, onChange,
}: { block: Extract<Block, { type: 'image' }>; onChange: (p: Partial<Block>) => void }) {
  const [uploading, setUploading] = useState(false);
  async function pick(file: File) {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ src: String(reader.result) } as Partial<Block>);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }
  return (
    <div>
      {block.src ? (
        <figure style={{ margin: 0 }}>
          <img src={block.src} alt={block.alt} style={{ width: '100%', borderRadius: 10, display: 'block' }} />
          <input
            value={block.caption || ''}
            onChange={(e) => onChange({ caption: e.target.value } as Partial<Block>)}
            placeholder="Caption (optional)"
            className="bp-text"
            style={{ textAlign: 'center', fontSize: 14, fontStyle: 'italic', color: '#64748b', marginTop: 8 }}
          />
          <input
            value={block.alt}
            onChange={(e) => onChange({ alt: e.target.value } as Partial<Block>)}
            placeholder="Alt text — describe the image for screen readers"
            className="bp-text"
            style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}
          />
        </figure>
      ) : (
        <label className="bp-image-drop">
          <div style={{ fontSize: 28 }}>🖼️</div>
          <div style={{ fontWeight: 700 }}>{uploading ? 'Reading…' : 'Click or drop an image'}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>PNG, JPG, WebP, GIF</div>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); }}
          />
        </label>
      )}
    </div>
  );
}

function CodeBlock({
  block, onChange,
}: { block: Extract<Block, { type: 'code' }>; onChange: (p: Partial<Block>) => void }) {
  return (
    <div className="bp-codeblock">
      <div className="bp-codeblock-bar">
        <select
          value={block.lang}
          onChange={(e) => onChange({ lang: e.target.value } as Partial<Block>)}
          aria-label="Language"
          className="bp-codeblock-lang"
        >
          {CODE_LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <textarea
        value={block.code}
        onChange={(e) => onChange({ code: e.target.value } as Partial<Block>)}
        placeholder="// your code"
        rows={Math.max(4, (block.code || '').split('\n').length)}
        className="bp-code-textarea"
        spellCheck={false}
      />
    </div>
  );
}

function ListBlock({
  block, onChange, onEnter,
}: { block: Extract<Block, { type: 'list' }>; onChange: (p: Partial<Block>) => void; onEnter: () => void }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => onChange({ ordered: !block.ordered } as Partial<Block>)}
          className="bp-tool"
          title="Toggle ordered/unordered"
        >
          {block.ordered ? '1.' : '•'}
        </button>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>
          {block.ordered ? 'Numbered list' : 'Bulleted list'} · Enter for new item, Backspace to remove
        </span>
      </div>
      {block.items.map((it, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 24, color: '#64748b', fontSize: 16, paddingTop: 6 }} aria-hidden="true">
            {block.ordered ? `${i + 1}.` : '•'}
          </span>
          <textarea
            value={it}
            onChange={(e) => {
              const items = block.items.slice();
              items[i] = e.target.value;
              onChange({ items } as Partial<Block>);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const items = block.items.slice();
                items.splice(i + 1, 0, '');
                onChange({ items } as Partial<Block>);
              } else if (e.key === 'Backspace' && it === '' && block.items.length > 1) {
                e.preventDefault();
                const items = block.items.slice();
                items.splice(i, 1);
                onChange({ items } as Partial<Block>);
              }
            }}
            placeholder="List item"
            ref={autoGrowRef}
            rows={1}
            className="bp-text bp-list-item"
          />
        </div>
      ))}
      {block.items.length === 0 && (
        <button type="button" onClick={() => onChange({ items: [''] } as Partial<Block>)} className="bp-tool">
          + Add item
        </button>
      )}
    </div>
  );
}

function VideoBlock({
  block, onChange,
}: { block: Extract<Block, { type: 'video' }>; onChange: (p: Partial<Block>) => void }) {
  return (
    <div>
      <input
        value={block.url}
        onChange={(e) => onChange({ url: e.target.value } as Partial<Block>)}
        placeholder="Paste a YouTube or Vimeo URL"
        className="bp-text"
        style={{ fontSize: 14 }}
      />
      <input
        value={block.caption || ''}
        onChange={(e) => onChange({ caption: e.target.value } as Partial<Block>)}
        placeholder="Caption (optional)"
        className="bp-text"
        style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}
      />
      {block.url && (
        <div style={{ marginTop: 10 }}>
          <BlockRenderer blocks={[{ ...block, id: 'preview' }]} />
        </div>
      )}
    </div>
  );
}

// ─── Settings drawer ─────────────────────────────────────────────────────

interface SettingsDrawerProps {
  post: BlogPost;
  tagInput: string;
  setTagInput: (v: string) => void;
  config: BlogConfig;
  onUpdate: <K extends keyof BlogPost>(k: K, v: BlogPost[K]) => void;
  onSlugTouched: () => void;
  onClose: () => void;
}
function SettingsDrawer({
  post, tagInput, setTagInput, config, onUpdate, onSlugTouched, onClose,
}: SettingsDrawerProps) {
  function addTag(value: string) {
    const v = value.trim().toLowerCase();
    if (!v || post.tags.includes(v)) return;
    onUpdate('tags', [...post.tags, v]);
  }
  return (
    <div
      role="dialog"
      aria-label="Story settings"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 110,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <aside
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: 'min(420px, 100%)',
          background: '#fff', padding: '24px 22px',
          overflowY: 'auto',
          boxShadow: '-12px 0 40px rgba(15, 23, 42, 0.12)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: 16, color: '#0f172a' }}>Story settings</strong>
          <button type="button" onClick={onClose} style={{ ...btnSecondary, padding: '4px 10px' }}>Done</button>
        </div>
        <Field label="Slug">
          <input
            value={post.slug}
            onChange={(e) => { onSlugTouched(); onUpdate('slug', slugify(e.target.value)); }}
            placeholder="auto-from-title"
            style={inputStyle}
          />
        </Field>
        <Field label="Category">
          <select
            value={post.category}
            onChange={(e) => onUpdate('category', e.target.value)}
            style={inputStyle}
          >
            {config.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Excerpt (auto-derived if empty)">
          <textarea
            value={post.excerpt}
            onChange={(e) => onUpdate('excerpt', e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="A 1-2 sentence summary shown on the index"
          />
        </Field>
        <Field label="Tags">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {post.tags.map((t) => (
              <span key={t} style={{
                padding: '4px 10px', background: '#eef2ff', color: '#4338ca',
                borderRadius: 999, fontSize: 12, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {t}
                <button
                  type="button"
                  onClick={() => onUpdate('tags', post.tags.filter((x) => x !== t))}
                  style={{ background: 'transparent', border: 'none', color: '#4338ca', cursor: 'pointer', padding: 0, fontWeight: 700 }}
                  aria-label={`Remove ${t}`}
                >×</button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => {
                const v = e.target.value;
                if (v.endsWith(',')) { addTag(v.slice(0, -1)); setTagInput(''); }
                else setTagInput(v);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  e.preventDefault(); addTag(tagInput); setTagInput('');
                }
              }}
              placeholder="Add tag, press Enter"
              style={{ ...inputStyle, minWidth: 140, flex: 1 }}
            />
          </div>
        </Field>
        <Field label="Author">
          <input value={post.authorName} onChange={(e) => onUpdate('authorName', e.target.value)} style={inputStyle} />
        </Field>
      </aside>
    </div>
  );
}

// ─── Bits ────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>{label}</span>
      {children}
    </label>
  );
}

function makeBlock(kind: BlockKind): Block {
  switch (kind) {
    case 'paragraph':  return { id: blockId(), type: 'paragraph', text: '' };
    case 'heading2':   return { id: blockId(), type: 'heading', level: 2, text: '' };
    case 'heading3':   return { id: blockId(), type: 'heading', level: 3, text: '' };
    case 'image':      return { id: blockId(), type: 'image', src: '', alt: '' };
    case 'code':       return { id: blockId(), type: 'code', lang: 'tsx', code: '' };
    case 'quote':      return { id: blockId(), type: 'quote', text: '' };
    case 'list-ul':    return { id: blockId(), type: 'list', ordered: false, items: [''] };
    case 'list-ol':    return { id: blockId(), type: 'list', ordered: true, items: [''] };
    case 'video':      return { id: blockId(), type: 'video', url: '' };
    case 'divider':    return { id: blockId(), type: 'divider' };
  }
}

// Auto-grow textareas that wrap text to fill their content.
function autoGrowRef(el: HTMLTextAreaElement | null) {
  if (!el) return;
  // run on mount + every input
  const grow = () => { el.style.height = '0px'; el.style.height = el.scrollHeight + 'px'; };
  grow();
  el.removeEventListener('input', grow);
  el.addEventListener('input', grow);
}

// ─── Styles (scoped) ─────────────────────────────────────────────────────

const titleStyle: React.CSSProperties = {
  width: '100%', border: 'none', resize: 'none', outline: 'none',
  fontSize: 48, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.15,
  color: '#0f172a', background: 'transparent', fontFamily: 'inherit',
  padding: 0, marginBottom: 4, overflow: 'hidden',
};
const subtitleStyle: React.CSSProperties = {
  width: '100%', border: 'none', resize: 'none', outline: 'none',
  fontSize: 22, fontWeight: 400, lineHeight: 1.4,
  color: '#64748b', background: 'transparent', fontFamily: 'inherit',
  padding: 0, marginBottom: 16, overflow: 'hidden',
};
const inputStyle: React.CSSProperties = {
  padding: '10px 12px', border: '1px solid #e6e8ef', borderRadius: 8,
  fontSize: 14, color: '#0f172a', background: '#fff', fontFamily: 'inherit',
};
const btnSecondary: React.CSSProperties = {
  padding: '8px 14px', background: '#fff', color: '#1e293b',
  border: '1px solid #e6e8ef', borderRadius: 8, fontSize: 13,
  fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
};
const btnPrimary: React.CSSProperties = {
  padding: '8px 16px', background: '#4f46e5', color: '#fff',
  border: 'none', borderRadius: 8, fontSize: 13,
  fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
};

function EditorStyles() {
  return (
    <style>{`
      .bp-block { position: relative; padding: 4px 0; }
      .bp-block:hover .bp-block-toolbar { opacity: 1; }
      .bp-block-toolbar {
        position: absolute; left: -64px; top: 8px;
        display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s;
      }
      .bp-tool {
        width: 28px; height: 28px; border-radius: 6px;
        background: #fff; border: 1px solid #e6e8ef; cursor: pointer;
        color: #475569; font-size: 14px; font-family: inherit; font-weight: 700;
        display: grid; place-items: center;
      }
      .bp-tool:hover { background: #f1f5f9; color: #0f172a; }
      .bp-tool:disabled { opacity: 0.4; cursor: not-allowed; }
      .bp-block-body { width: 100%; }
      .bp-text {
        width: 100%; border: none; outline: none; resize: none;
        background: transparent; font-family: inherit; padding: 4px 0;
        color: #0f172a;
      }
      .bp-paragraph { font-size: 19px; line-height: 1.7; }
      .bp-h2 { font-size: 32px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.25; }
      .bp-h3 { font-size: 24px; font-weight: 700; letter-spacing: -0.015em; line-height: 1.3; }
      .bp-quote {
        font-size: 22px; line-height: 1.5; font-style: italic;
        border-left: 3px solid #4f46e5; padding: 6px 0 6px 16px; color: #1e293b;
      }
      .bp-list-item { font-size: 18px; line-height: 1.6; }
      .bp-divider { border: none; border-top: 2px solid #e6e8ef; margin: 18px 0; }

      .bp-image-drop {
        display: grid; place-items: center; gap: 6px;
        height: 200px; border: 2px dashed #cbd5e1; border-radius: 12;
        background: #f8fafc; color: #475569; cursor: pointer;
        font-family: inherit; font-size: 14px;
      }
      .bp-image-drop:hover { border-color: #4f46e5; color: #4338ca; }

      .bp-codeblock {
        background: #0f172a; border-radius: 10px; overflow: hidden;
        margin: 8px 0; padding: 0;
      }
      .bp-codeblock-bar {
        display: flex; justify-content: flex-end; align-items: center;
        padding: 8px 12px; border-bottom: 1px solid #1e293b;
      }
      .bp-codeblock-lang {
        background: #1e293b; color: #cbd5e1;
        border: 1px solid #334155; border-radius: 6px;
        font-size: 11px; padding: 4px 8px; font-family: inherit;
      }
      .bp-code-textarea {
        width: 100%; background: transparent; color: #e2e8f0;
        border: none; outline: none; resize: vertical;
        padding: 14px 18px; font-family: ui-monospace, monospace;
        font-size: 13.5px; line-height: 1.65; min-height: 80px;
      }

      .bp-add-btn {
        width: 28px; height: 28px; border-radius: 50%;
        background: #fff; border: 1.5px solid #cbd5e1; cursor: pointer;
        color: #64748b; font-size: 18px; font-weight: 400; line-height: 1;
        display: grid; place-items: center;
        opacity: 0.4; transition: opacity 0.15s, border-color 0.15s, color 0.15s;
        font-family: inherit;
      }
      .bp-add-btn:hover { opacity: 1; border-color: #4f46e5; color: #4f46e5; }
      .bp-popover {
        background: #fff; border: 1px solid #e6e8ef; border-radius: 12;
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
        padding: 8px;
        display: grid; grid-template-columns: 1fr 1fr; gap: 4px;
        max-width: 540px; margin: 8px 0;
        z-index: 5;
      }
      .bp-popover-item {
        display: flex; gap: 12px; align-items: center;
        padding: 10px 12px; border-radius: 8;
        background: transparent; border: none; cursor: pointer;
        text-align: left; font-family: inherit; color: #0f172a;
      }
      .bp-popover-item:hover { background: #f1f5f9; }
      .bp-popover-item strong { font-size: 14px; font-weight: 700; }
      .bp-popover-close {
        grid-column: 1 / -1; padding: 8px;
        background: transparent; border: none; cursor: pointer;
        color: #64748b; font-size: 13px; font-family: inherit;
        margin-top: 4px;
      }
    `}</style>
  );
}
