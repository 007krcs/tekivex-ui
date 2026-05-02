// ─────────────────────────────────────────────────────────────────────────────
// /examples/blog — fully configurable static blog example.
//
// Single-page React example covering the entire blog publishing loop without
// a server: brand configuration, post list with search + tag + category
// filters, post detail with markdown rendering, full editor with image
// upload + code blocks + tag chips, and (mock) comments.
//
// All state lives in localStorage via ./store. To wire a real backend, swap
// store.ts for a fetch/Supabase/Sanity client and the rest of the example
// keeps working unchanged.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from 'react';
import { ExampleShell } from '../ExampleShell';
import { usePageMeta } from '../../../use-page-meta';
import {
  type BlogConfig,
  type BlogPost,
  deletePost,
  loadConfig,
  loadPosts,
  saveConfig,
  resetConfig,
} from './store';
import { Editor } from './Editor';
import { BlockRenderer } from './BlockRenderer';
import { plainText } from './store';

type View =
  | { kind: 'list' }
  | { kind: 'detail'; slug: string }
  | { kind: 'editor'; postId?: string }
  | { kind: 'config' };

export function BlogExample() {
  usePageMeta(
    'Configurable blog example — TekiVex UI',
    'A fully configurable static blog built with tekivex-ui: write posts with a markdown editor, upload images, drop in syntax-highlighted code blocks, organise by tags and categories, all without a backend.',
    { keywords: 'tekivex, tekivex-ui, blog example, markdown editor, image upload, code blocks, static blog, react' },
  );

  const [posts, setPosts] = useState<BlogPost[]>(() => loadPosts());
  const [config, setConfig] = useState<BlogConfig>(() => loadConfig());
  const [view, setView] = useState<View>({ kind: 'list' });
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [page, setPage] = useState(1);

  function refreshPosts() {
    setPosts(loadPosts());
  }

  function applyConfig(next: BlogConfig) {
    setConfig(next);
    saveConfig(next);
  }

  // Filter + paginate
  const filtered = useMemo(() => {
    return posts
      .filter((p) => statusFilter === 'all' ? true : p.status === statusFilter)
      .filter((p) => (categoryFilter ? p.category === categoryFilter : true))
      .filter((p) => (tagFilter ? p.tags.includes(tagFilter) : true))
      .filter((p) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          plainText(p.blocks).toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
        );
      })
      .sort((a, b) => b.publishedAt - a.publishedAt);
  }, [posts, statusFilter, categoryFilter, tagFilter, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / config.postsPerPage));
  const pageItems = filtered.slice((page - 1) * config.postsPerPage, page * config.postsPerPage);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount, page]);

  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => map.set(t, (map.get(t) || 0) + 1)));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  return (
    <ExampleShell
      title="Configurable blog"
      eyebrow="Examples · Blog"
      description="A complete blog application: write posts with a markdown editor, upload cover images, drop in syntax-highlighted code blocks, organise by category + tags, search the archive, configure your brand. All persisted in your browser — swap one file to point at a real backend."
      sourceUrl="https://github.com/007krcs/tekivex-ui/tree/master/landing/src/pages/examples/blog"
      surface="light"
    >
      <BlogStyles primary={config.primaryColor} accent={config.accentColor} />

      {/* Brand strip */}
      <header
        style={{
          maxWidth: 1280,
          margin: '24px auto 0',
          padding: '16px 24px',
          borderRadius: 16,
          background: `linear-gradient(135deg, ${config.primaryColor}10, ${config.accentColor}10)`,
          border: `1px solid ${config.primaryColor}33`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          onClick={() => setView({ kind: 'list' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#0f172a', textAlign: 'left', padding: 0,
          }}
        >
          <span
            style={{
              width: 44, height: 44, borderRadius: 10,
              display: 'grid', placeItems: 'center',
              background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})`,
              color: '#fff', fontSize: 22, fontWeight: 800,
            }}
          >
            {config.brandLogoEmoji}
          </span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>
              {config.brandName}
            </div>
            <div style={{ fontSize: 13, color: '#475569' }}>{config.brandTagline}</div>
          </div>
        </button>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search posts…"
            aria-label="Search"
            style={{
              padding: '10px 14px', minWidth: 240,
              border: '1px solid #e6e8ef', borderRadius: 10,
              fontSize: 14, fontFamily: 'inherit', color: '#0f172a', background: '#fff',
            }}
          />
          <button type="button" onClick={() => setView({ kind: 'config' })} style={btnGhost}>
            ⚙ Configure
          </button>
          <button
            type="button"
            onClick={() => setView({ kind: 'editor' })}
            style={{ ...btnPrimary, background: config.primaryColor }}
          >
            ✎ Write a post
          </button>
        </div>
      </header>

      <div
        style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '24px 24px 64px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 280px',
          gap: 24,
        }}
        className="blog-layout"
      >
        <main>
          {view.kind === 'list' && (
            <PostList
              posts={pageItems}
              total={filtered.length}
              page={page}
              pageCount={pageCount}
              onPage={setPage}
              statusFilter={statusFilter}
              onStatusFilter={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryFilter={setCategoryFilter}
              tagFilter={tagFilter}
              onTagFilter={setTagFilter}
              categories={config.categories}
              onOpen={(p) => setView({ kind: 'detail', slug: p.slug })}
              onEdit={(p) => setView({ kind: 'editor', postId: p.id })}
              onDelete={(p) => {
                if (window.confirm(`Delete "${p.title}"?`)) {
                  deletePost(p.id);
                  refreshPosts();
                }
              }}
            />
          )}
          {view.kind === 'detail' && (
            <PostDetail
              slug={view.slug}
              posts={posts}
              config={config}
              onBack={() => setView({ kind: 'list' })}
              onEdit={(p) => setView({ kind: 'editor', postId: p.id })}
              onTagClick={(t) => { setTagFilter(t); setView({ kind: 'list' }); }}
            />
          )}
          {view.kind === 'config' && (
            <ConfigPanel
              config={config}
              onChange={applyConfig}
              onClose={() => setView({ kind: 'list' })}
              onReset={() => applyConfig(resetConfig())}
            />
          )}
        </main>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Side title="Categories">
            <Chip
              label="All"
              active={categoryFilter === null}
              onClick={() => { setCategoryFilter(null); setPage(1); }}
            />
            {config.categories.map((c) => (
              <Chip
                key={c}
                label={c}
                active={categoryFilter === c}
                onClick={() => { setCategoryFilter(c); setPage(1); }}
              />
            ))}
          </Side>
          <Side title={`Tags · ${allTags.length}`}>
            {allTags.length === 0 && <span style={{ fontSize: 13, color: '#94a3b8' }}>No tags yet.</span>}
            {allTags.map(([t, count]) => (
              <Chip
                key={t}
                label={`${t} · ${count}`}
                active={tagFilter === t}
                onClick={() => { setTagFilter(tagFilter === t ? null : t); setPage(1); }}
              />
            ))}
          </Side>
          <Side title="Author">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {config.authorAvatar
                ? <img src={config.authorAvatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})`,
                    color: '#fff', display: 'grid', placeItems: 'center',
                    fontWeight: 800,
                  }}>{config.authorName.charAt(0).toUpperCase()}</div>}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{config.authorName}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{posts.filter((p) => p.status === 'published').length} published posts</div>
              </div>
            </div>
          </Side>
        </aside>
      </div>

      {view.kind === 'editor' && (
        <Editor
          config={config}
          initial={view.postId ? posts.find((p) => p.id === view.postId) : undefined}
          onClose={() => setView({ kind: 'list' })}
          onSaved={(p) => {
            refreshPosts();
            setView({ kind: 'detail', slug: p.slug });
          }}
        />
      )}
    </ExampleShell>
  );
}

// ─── List ─────────────────────────────────────────────────────────────────

interface PostListProps {
  posts: BlogPost[];
  total: number;
  page: number;
  pageCount: number;
  onPage: (n: number) => void;
  statusFilter: 'all' | 'published' | 'draft';
  onStatusFilter: (s: 'all' | 'published' | 'draft') => void;
  categoryFilter: string | null;
  onCategoryFilter: (c: string | null) => void;
  tagFilter: string | null;
  onTagFilter: (t: string | null) => void;
  categories: string[];
  onOpen: (p: BlogPost) => void;
  onEdit: (p: BlogPost) => void;
  onDelete: (p: BlogPost) => void;
}
function PostList(p: PostListProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: '#475569' }}>
          {p.total} {p.total === 1 ? 'post' : 'posts'}
        </span>
        <span style={{ flex: 1 }} />
        {(['all', 'published', 'draft'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => p.onStatusFilter(s)}
            style={{
              ...btnGhost,
              padding: '6px 12px', fontSize: 12,
              background: p.statusFilter === s ? '#eef2ff' : '#fff',
              color: p.statusFilter === s ? '#4338ca' : '#475569',
              borderColor: p.statusFilter === s ? '#c7d2fe' : '#e6e8ef',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {(p.tagFilter || p.categoryFilter) && (
        <div style={{ marginBottom: 12, fontSize: 13, color: '#475569' }}>
          Filtering by{' '}
          {p.categoryFilter && <strong>{p.categoryFilter}</strong>}
          {p.categoryFilter && p.tagFilter && ' · '}
          {p.tagFilter && <strong>#{p.tagFilter}</strong>}{' '}
          <button
            type="button"
            onClick={() => { p.onCategoryFilter(null); p.onTagFilter(null); }}
            style={{ ...btnGhost, padding: '4px 10px', fontSize: 12 }}
          >
            clear
          </button>
        </div>
      )}

      {p.posts.length === 0 ? (
        <div style={{
          padding: 40, border: '1px dashed #cbd5e1', borderRadius: 12,
          textAlign: 'center', color: '#64748b',
        }}>
          No posts match those filters.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {p.posts.map((post) => (
            <article
              key={post.id}
              style={{
                background: '#fff', border: '1px solid #e6e8ef', borderRadius: 14,
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              }}
            >
              {post.coverImage && (
                <button
                  type="button"
                  onClick={() => p.onOpen(post)}
                  aria-label={`Open ${post.title}`}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  <img
                    src={post.coverImage}
                    alt=""
                    style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                  />
                </button>
              )}
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {post.category}
                  </span>
                  {post.status === 'draft' && (
                    <span style={{ fontSize: 11, padding: '2px 8px', background: '#fef3c7', color: '#92400e', borderRadius: 999, fontWeight: 700 }}>
                      DRAFT
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>· {post.readingMinutes} min</span>
                </div>
                <h3
                  style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a', cursor: 'pointer' }}
                  onClick={() => p.onOpen(post)}
                >
                  {post.title || 'Untitled'}
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.55, flex: 1 }}>
                  {post.excerpt || plainText(post.blocks).slice(0, 140)}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {post.tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => p.onTagFilter(t)}
                      style={{
                        background: '#eef2ff', color: '#4338ca', border: 'none',
                        padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button type="button" onClick={() => p.onOpen(post)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 12 }}>Read</button>
                  <button type="button" onClick={() => p.onEdit(post)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 12 }}>Edit</button>
                  <button type="button" onClick={() => p.onDelete(post)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 12, color: '#b91c1c', borderColor: '#fecaca' }}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {p.pageCount > 1 && (
        <div style={{ marginTop: 24, display: 'flex', gap: 6, justifyContent: 'center' }}>
          <button type="button" disabled={p.page <= 1} onClick={() => p.onPage(p.page - 1)} style={btnGhost}>
            ← Prev
          </button>
          {Array.from({ length: p.pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => p.onPage(n)}
              style={{
                ...btnGhost,
                minWidth: 36,
                background: p.page === n ? '#4f46e5' : '#fff',
                color: p.page === n ? '#fff' : '#475569',
                borderColor: p.page === n ? '#4f46e5' : '#e6e8ef',
              }}
            >
              {n}
            </button>
          ))}
          <button type="button" disabled={p.page >= p.pageCount} onClick={() => p.onPage(p.page + 1)} style={btnGhost}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Detail ───────────────────────────────────────────────────────────────

interface PostDetailProps {
  slug: string;
  posts: BlogPost[];
  config: BlogConfig;
  onBack: () => void;
  onEdit: (p: BlogPost) => void;
  onTagClick: (t: string) => void;
}
function PostDetail(p: PostDetailProps) {
  const post = p.posts.find((x) => x.slug === p.slug);
  if (!post) {
    return (
      <div>
        <button type="button" onClick={p.onBack} style={btnGhost}>← Back</button>
        <p style={{ marginTop: 16, color: '#64748b' }}>Post not found.</p>
      </div>
    );
  }
  return (
    <article>
      <button type="button" onClick={p.onBack} style={{ ...btnGhost, marginBottom: 16 }}>← Back to all posts</button>
      {post.coverImage && (
        <img src={post.coverImage} alt="" style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 14, marginBottom: 24 }} />
      )}
      <div style={{ fontSize: 12, fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {post.category} · {post.readingMinutes} min · {new Date(post.publishedAt).toLocaleDateString()}
      </div>
      <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.025em', color: '#0f172a', fontWeight: 800, lineHeight: 1.1 }}>
        {post.title}
      </h1>
      {post.excerpt && (
        <p style={{ margin: '0 0 24px', color: '#475569', fontSize: 17, lineHeight: 1.6 }}>{post.excerpt}</p>
      )}
      <div className="md-prose">
        <BlockRenderer blocks={post.blocks} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 24 }}>
        {post.tags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => p.onTagClick(t)}
            style={{ background: '#eef2ff', color: '#4338ca', border: 'none', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            #{t}
          </button>
        ))}
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #e6e8ef', margin: '32px 0 20px' }} />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => p.onEdit(post)} style={btnGhost}>✎ Edit</button>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          style={btnGhost}
        >
          🔗 Copy link
        </button>
      </div>
      {p.config.enableComments && <Comments slug={post.slug} />}
    </article>
  );
}

// ─── Mock comments (localStorage) ────────────────────────────────────────

interface Comment { id: string; name: string; body: string; at: number; }
function Comments({ slug }: { slug: string }) {
  const key = `tkx-blog-comments-${slug}`;
  const [items, setItems] = useState<Comment[]>(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  });
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    const next: Comment = { id: String(Date.now()), name: name.trim() || 'Anonymous', body: body.trim(), at: Date.now() };
    const all = [next, ...items];
    setItems(all);
    localStorage.setItem(key, JSON.stringify(all));
    setBody('');
  }
  return (
    <section style={{ marginTop: 32 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
        Comments · {items.length}
      </h3>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)"
          style={{ padding: '10px 12px', border: '1px solid #e6e8ef', borderRadius: 8, fontSize: 14 }} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add a comment…"
          rows={3}
          style={{ padding: '10px 12px', border: '1px solid #e6e8ef', borderRadius: 8, fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }} />
        <button type="submit" style={{ ...btnPrimary, alignSelf: 'flex-start' }}>Post comment</button>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((c) => (
          <div key={c.id} style={{ padding: 14, background: '#f8fafc', border: '1px solid #e6e8ef', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
              <strong style={{ color: '#0f172a' }}>{c.name}</strong>
              <span>{new Date(c.at).toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 14, color: '#1e293b', whiteSpace: 'pre-wrap' }}>{c.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Config panel ─────────────────────────────────────────────────────────

function ConfigPanel({
  config, onChange, onClose, onReset,
}: { config: BlogConfig; onChange: (c: BlogConfig) => void; onClose: () => void; onReset: () => void }) {
  const [draft, setDraft] = useState(config);
  function set<K extends keyof BlogConfig>(key: K, value: BlogConfig[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function save() {
    onChange(draft);
    onClose();
  }
  return (
    <div style={{ background: '#fff', border: '1px solid #e6e8ef', borderRadius: 14, padding: 24 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Configure your blog</h2>
      <p style={{ margin: '0 0 20px', color: '#475569', fontSize: 14 }}>
        Every field is editable. Changes save to <code>localStorage</code> in your browser; refresh to persist.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <Cfg label="Brand name">
          <input value={draft.brandName} onChange={(e) => set('brandName', e.target.value)} style={inputStyle} />
        </Cfg>
        <Cfg label="Logo emoji">
          <input value={draft.brandLogoEmoji} onChange={(e) => set('brandLogoEmoji', e.target.value)} style={inputStyle} />
        </Cfg>
        <Cfg label="Tagline">
          <input value={draft.brandTagline} onChange={(e) => set('brandTagline', e.target.value)} style={inputStyle} />
        </Cfg>
        <Cfg label="Author name">
          <input value={draft.authorName} onChange={(e) => set('authorName', e.target.value)} style={inputStyle} />
        </Cfg>
        <Cfg label="Primary color">
          <input type="color" value={draft.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} style={{ ...inputStyle, padding: 4, height: 40 }} />
        </Cfg>
        <Cfg label="Accent color">
          <input type="color" value={draft.accentColor} onChange={(e) => set('accentColor', e.target.value)} style={{ ...inputStyle, padding: 4, height: 40 }} />
        </Cfg>
        <Cfg label="Posts per page">
          <input type="number" min={1} max={48} value={draft.postsPerPage} onChange={(e) => set('postsPerPage', Math.max(1, Number(e.target.value) || 1))} style={inputStyle} />
        </Cfg>
        <Cfg label="Default category">
          <select value={draft.defaultCategory} onChange={(e) => set('defaultCategory', e.target.value)} style={inputStyle}>
            {draft.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Cfg>
        <Cfg label="Categories (comma-separated)">
          <input
            value={draft.categories.join(', ')}
            onChange={(e) => set('categories', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            style={inputStyle}
          />
        </Cfg>
        <Cfg label="Comments">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#1e293b' }}>
            <input type="checkbox" checked={draft.enableComments} onChange={(e) => set('enableComments', e.target.checked)} />
            Enabled
          </label>
        </Cfg>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button type="button" onClick={onReset} style={{ ...btnGhost, color: '#b91c1c', borderColor: '#fecaca' }}>Reset to defaults</button>
        <button type="button" onClick={onClose} style={btnGhost}>Cancel</button>
        <button type="button" onClick={save} style={btnPrimary}>Save</button>
      </div>
    </div>
  );
}

// ─── small bits ──────────────────────────────────────────────────────────

function Side({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: '#fff', border: '1px solid #e6e8ef', borderRadius: 14, padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{children}</div>
    </section>
  );
}
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
        background: active ? '#4f46e5' : '#f1f5f9',
        color: active ? '#fff' : '#475569',
        border: 'none',
      }}
    >
      {label}
    </button>
  );
}
function Cfg({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>{label}</span>
      {children}
    </label>
  );
}
function BlogStyles({ primary, accent }: { primary: string; accent: string }) {
  // Inject scoped CSS for the markdown body + prose typography. Kept as a
  // <style> tag so the example stays self-contained.
  return (
    <style>{`
      .md-prose { color: #1a1f2e; font-size: 16px; line-height: 1.75; }
      .md-prose h1 { font-size: 1.8rem; font-weight: 800; margin: 24px 0 10px; color: #0f172a; }
      .md-prose h2 { font-size: 1.4rem; font-weight: 800; margin: 22px 0 8px; color: #0f172a; }
      .md-prose h3 { font-size: 1.15rem; font-weight: 700; margin: 18px 0 6px; color: #0f172a; }
      .md-prose p  { margin: 0 0 14px; }
      .md-prose ul, .md-prose ol { margin: 0 0 14px; padding-left: 22px; }
      .md-prose li { margin: 4px 0; }
      .md-prose blockquote { border-left: 3px solid ${primary}; padding: 4px 14px; color: #475569; font-style: italic; margin: 14px 0; background: #f8fafc; border-radius: 4px; }
      .md-prose hr { border: none; border-top: 1px solid #e6e8ef; margin: 24px 0; }
      .md-prose .md-link { color: ${primary}; text-decoration: underline; }
      .md-prose .md-img { max-width: 100%; border-radius: 8px; margin: 12px 0; display: block; }
      .md-prose .md-code-inline { background: ${primary}15; color: ${accent}; padding: 1px 6px; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.92em; }
      .md-prose .md-pre {
        background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 10px;
        overflow-x: auto; font-family: ui-monospace, monospace; font-size: 13px; line-height: 1.6;
        margin: 14px 0; position: relative;
      }
      .md-prose .md-pre[data-lang]::before {
        content: attr(data-lang); position: absolute; top: 8px; right: 12px;
        font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;
      }
      .md-prose .md-pre .md-code-kw  { color: #c4a8ff; font-weight: 600; }
      .md-prose .md-pre .md-code-str { color: #5eead4; }
      .md-prose .md-pre .md-code-cm  { color: #64748b; font-style: italic; }
      .md-prose .md-pre .md-code-num { color: #fbbf24; }
      @media (max-width: 880px) {
        .blog-layout { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px', border: '1px solid #e6e8ef', borderRadius: 8,
  fontSize: 14, color: '#0f172a', background: '#fff', fontFamily: 'inherit',
};
const btnGhost: React.CSSProperties = {
  padding: '8px 14px', background: '#fff', color: '#1e293b',
  border: '1px solid #e6e8ef', borderRadius: 8, fontSize: 13,
  fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
};
const btnPrimary: React.CSSProperties = {
  padding: '8px 16px', background: '#4f46e5', color: '#fff',
  border: 'none', borderRadius: 8, fontSize: 13,
  fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
};
