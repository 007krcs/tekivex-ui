// ─────────────────────────────────────────────────────────────────────────────
// Editor — full markdown editor for the blog example.
//
// Controls:
//   - Live preview side panel
//   - Image upload (drag-and-drop or file picker) → inserts ![alt](data:url)
//   - Toolbar buttons for bold / italic / heading / list / quote / code block
//   - Code-block insert with language selector
//   - Tag chips (add by typing + comma)
//   - Category / status / cover-image controls
//   - Slug auto-derived from title; can be overridden manually
//   - Saves to localStorage via store.savePost
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import type { BlogPost, BlogConfig } from './store';
import {
  ensureUniqueSlug,
  newPost,
  readingMinutes,
  savePost,
  slugify,
} from './store';
import { Markdown } from './Markdown';

interface EditorProps {
  config: BlogConfig;
  initial?: BlogPost;
  onClose: () => void;
  onSaved: (post: BlogPost) => void;
}

const CODE_LANGS = ['tsx', 'ts', 'jsx', 'js', 'css', 'html', 'json', 'bash', 'md'];

export function Editor({ config, initial, onClose, onSaved }: EditorProps) {
  const [post, setPost] = useState<BlogPost>(
    () => initial ?? newPost(config.authorName, config.defaultCategory),
  );
  const [tagInput, setTagInput] = useState('');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!slugTouched) {
      setPost((p) => ({ ...p, slug: slugify(p.title) }));
    }
  }, [post.title, slugTouched]);

  function update<K extends keyof BlogPost>(key: K, value: BlogPost[K]) {
    setPost((p) => ({ ...p, [key]: value }));
  }

  function insertAtCursor(before: string, after: string = '', placeholder: string = '') {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const value = ta.value;
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    update('content', next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
    });
  }

  function insertCodeBlock() {
    const lang = window.prompt('Language? (tsx, ts, js, css, html, bash, ...)', 'tsx') || '';
    insertAtCursor(`\n\n\`\`\`${lang}\n`, '\n\`\`\`\n\n', 'your code here');
  }

  function readImageAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function onPickImage(file: File, asCover: boolean) {
    if (!file.type.startsWith('image/')) {
      alert('Please pick an image file.');
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      const ok = window.confirm(
        'This image is over 1.5MB and will be embedded inline. Continue?',
      );
      if (!ok) return;
    }
    const url = await readImageAsDataURL(file);
    if (asCover) {
      update('coverImage', url);
    } else {
      const alt = window.prompt('Alt text for the image?', file.name) || file.name;
      insertAtCursor(`\n\n![${alt}](${url})\n\n`);
    }
  }

  function onDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onPickImage(f, false);
  }

  function addTag(value: string) {
    const v = value.trim().toLowerCase();
    if (!v || post.tags.includes(v)) return;
    update('tags', [...post.tags, v]);
  }

  function publish(status: 'draft' | 'published') {
    if (!post.title.trim()) {
      alert('Add a title first.');
      return;
    }
    const finalSlug = ensureUniqueSlug(post.slug || slugify(post.title), post.id);
    const final: BlogPost = {
      ...post,
      slug: finalSlug,
      status,
      updatedAt: Date.now(),
      readingMinutes: readingMinutes(post.content),
    };
    if (!initial) {
      final.publishedAt = Date.now();
    }
    savePost(final);
    onSaved(final);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: 'clamp(8px, 2vw, 24px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 1280,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #e6e8ef',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <strong style={{ color: '#0f172a', fontSize: 14 }}>
            {initial ? 'Edit post' : 'New post'}
          </strong>
          <span style={{ color: '#94a3b8', fontSize: 12 }}>
            {readingMinutes(post.content)} min read · {post.content.length} chars
          </span>
          <span style={{ flex: 1 }} />
          <button type="button" onClick={onClose} style={btnSecondary}>
            Cancel
          </button>
          <button type="button" onClick={() => publish('draft')} style={btnSecondary}>
            Save draft
          </button>
          <button
            type="button"
            onClick={() => publish('published')}
            style={{ ...btnPrimary, background: config.primaryColor }}
          >
            Publish
          </button>
        </div>

        {/* Body: editor + preview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Editor side */}
          <div
            style={{
              padding: 18,
              borderRight: '1px solid #e6e8ef',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              overflow: 'auto',
            }}
          >
            <Field label="Title">
              <input
                value={post.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="A working title…"
                style={input}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Slug">
                <input
                  value={post.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update('slug', slugify(e.target.value));
                  }}
                  placeholder="auto-from-title"
                  style={input}
                />
              </Field>
              <Field label="Category">
                <select
                  value={post.category}
                  onChange={(e) => update('category', e.target.value)}
                  style={input}
                >
                  {config.categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Excerpt (1-2 sentences shown on the index)">
              <textarea
                value={post.excerpt}
                onChange={(e) => update('excerpt', e.target.value)}
                rows={2}
                style={{ ...input, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </Field>

            <Field label="Tags">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                {post.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: '4px 10px',
                      background: '#eef2ff',
                      color: '#4338ca',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {t}
                    <button
                      type="button"
                      aria-label={`Remove ${t}`}
                      onClick={() => update('tags', post.tags.filter((x) => x !== t))}
                      style={{ background: 'transparent', border: 'none', color: '#4338ca', cursor: 'pointer', padding: 0, fontWeight: 700 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v.endsWith(',')) {
                      addTag(v.slice(0, -1));
                      setTagInput('');
                    } else {
                      setTagInput(v);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault();
                      addTag(tagInput);
                      setTagInput('');
                    }
                  }}
                  placeholder="Add tag, press Enter"
                  style={{ ...input, minWidth: 140, flex: 1 }}
                />
              </div>
            </Field>

            <Field label="Cover image">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt=""
                    style={{ height: 56, borderRadius: 6, border: '1px solid #e6e8ef' }}
                  />
                ) : (
                  <div
                    style={{
                      height: 56,
                      width: 100,
                      borderRadius: 6,
                      background: '#f1f5f9',
                      border: '1px dashed #cbd5e1',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#94a3b8',
                      fontSize: 11,
                    }}
                  >
                    no cover
                  </div>
                )}
                <label style={{ ...btnSecondary, cursor: 'pointer' }}>
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onPickImage(f, true);
                    }}
                  />
                </label>
                {post.coverImage && (
                  <button type="button" onClick={() => update('coverImage', '')} style={btnSecondary}>
                    Remove
                  </button>
                )}
              </div>
            </Field>

            {/* Toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <ToolbarBtn label="B" title="Bold (Ctrl+B)" onClick={() => insertAtCursor('**', '**', 'bold')} bold />
              <ToolbarBtn label="I" title="Italic" onClick={() => insertAtCursor('*', '*', 'italic')} italic />
              <ToolbarBtn label="H2" title="Heading" onClick={() => insertAtCursor('\n## ', '\n', 'Heading')} />
              <ToolbarBtn label="• list" title="Bulleted list" onClick={() => insertAtCursor('\n- ', '\n', 'item')} />
              <ToolbarBtn label="1. list" title="Ordered list" onClick={() => insertAtCursor('\n1. ', '\n', 'item')} />
              <ToolbarBtn label="❝" title="Quote" onClick={() => insertAtCursor('\n> ', '\n', 'a memorable line')} />
              <ToolbarBtn label="`code`" title="Inline code" onClick={() => insertAtCursor('`', '`', 'code')} />
              <ToolbarBtn label="{ } block" title="Code block" onClick={insertCodeBlock} />
              <ToolbarBtn label="🔗 link" title="Link" onClick={() => insertAtCursor('[', '](https://)', 'text')} />
              <label style={{ ...toolbarBase, cursor: 'pointer' }} title="Insert image">
                🖼 image
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onPickImage(f, false);
                  }}
                />
              </label>
              <select
                aria-label="Insert code block in language"
                onChange={(e) => {
                  if (e.target.value) {
                    insertAtCursor(`\n\n\`\`\`${e.target.value}\n`, '\n\`\`\`\n\n', 'your code here');
                    e.target.value = '';
                  }
                }}
                value=""
                style={{ ...toolbarBase, paddingRight: 8 }}
              >
                <option value="">Insert code…</option>
                {CODE_LANGS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <Field label="Content (Markdown)">
              <textarea
                ref={textareaRef}
                value={post.content}
                onChange={(e) => update('content', e.target.value)}
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                rows={20}
                style={{
                  ...input,
                  minHeight: 320,
                  resize: 'vertical',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 13.5,
                  lineHeight: 1.65,
                  padding: 14,
                }}
                placeholder="# Your headline&#10;&#10;Drop an image here, or use the toolbar to format. Markdown supported."
              />
            </Field>
          </div>

          {/* Preview side */}
          <div style={{ overflow: 'auto', padding: 18, background: '#fafafe' }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>
              Live preview
            </div>
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt=""
                style={{ width: '100%', borderRadius: 10, marginBottom: 14, maxHeight: 240, objectFit: 'cover' }}
              />
            )}
            <h1 style={{ margin: '0 0 4px', color: '#0f172a', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {post.title || 'Untitled post'}
            </h1>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
              by {post.authorName} · {post.category} · {readingMinutes(post.content)} min read
            </div>
            <div className="md-prose">
              <Markdown source={post.content} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── inline UI bits ──────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12, color: '#475569', fontWeight: 700, letterSpacing: '0.02em' }}>{label}</span>
      {children}
    </label>
  );
}

const toolbarBase: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #e6e8ef',
  background: '#ffffff',
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 600,
  color: '#1e293b',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

function ToolbarBtn({
  label, onClick, title, bold, italic,
}: { label: string; onClick: () => void; title?: string; bold?: boolean; italic?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        ...toolbarBase,
        fontWeight: bold ? 800 : 600,
        fontStyle: italic ? 'italic' : 'normal',
      }}
    >
      {label}
    </button>
  );
}

const input: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #e6e8ef',
  borderRadius: 8,
  fontSize: 14,
  color: '#0f172a',
  background: '#ffffff',
  outline: 'none',
  fontFamily: 'inherit',
};

const btnSecondary: React.CSSProperties = {
  padding: '8px 14px',
  background: '#ffffff',
  color: '#1e293b',
  border: '1px solid #e6e8ef',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const btnPrimary: React.CSSProperties = {
  padding: '8px 16px',
  background: '#4f46e5',
  color: '#ffffff',
  border: 'none',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};
