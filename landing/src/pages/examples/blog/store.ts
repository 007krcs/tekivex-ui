// ─────────────────────────────────────────────────────────────────────────────
// Blog store — block-based content model + localStorage persistence.
//
// Content is no longer a markdown string. It's a structured array of blocks
// (paragraph, heading, image, code, quote, list, divider, video, embed),
// the same shape Medium / Notion / Ghost use. The editor never shows raw
// markdown to the user; the renderer produces clean HTML.
// ─────────────────────────────────────────────────────────────────────────────

export type Block =
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'heading'; level: 2 | 3; text: string }
  | { id: string; type: 'quote'; text: string }
  | { id: string; type: 'image'; src: string; alt: string; caption?: string }
  | { id: string; type: 'code'; lang: string; code: string }
  | { id: string; type: 'list'; ordered: boolean; items: string[] }
  | { id: string; type: 'divider' }
  | { id: string; type: 'video'; url: string; caption?: string };

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  blocks: Block[];
  coverImage?: string;
  tags: string[];
  category: string;
  authorName: string;
  authorAvatar?: string;
  publishedAt: number;
  updatedAt: number;
  status: 'draft' | 'published';
  readingMinutes: number;
}

export interface BlogConfig {
  brandName: string;
  brandTagline: string;
  brandLogoEmoji: string;
  primaryColor: string;
  accentColor: string;
  authorName: string;
  authorAvatar?: string;
  enableComments: boolean;
  postsPerPage: number;
  defaultCategory: string;
  categories: string[];
}

const POSTS_KEY = 'tkx-blog-example-posts-v2';   // bumped: schema changed
const CONFIG_KEY = 'tkx-blog-example-config-v1';

const DEFAULT_CONFIG: BlogConfig = {
  brandName: 'Lumen Field',
  brandTagline: 'Notes from the edge of the platform',
  brandLogoEmoji: '✦',
  primaryColor: '#4f46e5',
  accentColor: '#06b6d4',
  authorName: 'Anya Chen',
  authorAvatar: '',
  enableComments: true,
  postsPerPage: 6,
  defaultCategory: 'Engineering',
  categories: ['Engineering', 'Design', 'Product', 'Notes'],
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as object) } as T;
  } catch {
    return fallback;
  }
}
function writeJson<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Config ────────────────────────────────────────────────────────────────

export function loadConfig(): BlogConfig { return readJson(CONFIG_KEY, DEFAULT_CONFIG); }
export function saveConfig(cfg: BlogConfig) { writeJson(CONFIG_KEY, cfg); }
export function resetConfig(): BlogConfig { writeJson(CONFIG_KEY, DEFAULT_CONFIG); return DEFAULT_CONFIG; }

// ── Posts ─────────────────────────────────────────────────────────────────

export function loadPosts(): BlogPost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) return seedPosts();
    const parsed = JSON.parse(raw) as BlogPost[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seedPosts();
    return parsed;
  } catch {
    return seedPosts();
  }
}
function persist(posts: BlogPost[]) { writeJson(POSTS_KEY, posts); }

export function savePost(post: BlogPost) {
  const all = loadPosts();
  const idx = all.findIndex((p) => p.id === post.id);
  if (idx >= 0) all[idx] = post; else all.unshift(post);
  persist(all);
}
export function deletePost(id: string) { persist(loadPosts().filter((p) => p.id !== id)); }
export function findPost(slug: string): BlogPost | undefined { return loadPosts().find((p) => p.slug === slug); }

// ── Helpers ───────────────────────────────────────────────────────────────

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'post';
}
export function ensureUniqueSlug(slug: string, exceptId?: string): string {
  const all = loadPosts();
  let candidate = slug || 'post';
  let n = 2;
  while (all.some((p) => p.slug === candidate && p.id !== exceptId)) {
    candidate = `${slug}-${n++}`;
  }
  return candidate;
}
export function blockId(): string {
  return `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
export function plainText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'paragraph': case 'heading': case 'quote': return b.text;
        case 'list': return b.items.join(' ');
        case 'code': return b.code;
        case 'image': return b.alt + ' ' + (b.caption || '');
        case 'video': return b.caption || '';
        default: return '';
      }
    })
    .join(' ');
}
export function readingMinutes(blocks: Block[]): number {
  const text = plainText(blocks);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
export function deriveExcerpt(blocks: Block[]): string {
  const para = blocks.find((b) => b.type === 'paragraph') as { text: string } | undefined;
  if (!para) return '';
  return para.text.slice(0, 220);
}
export function newPost(authorName: string, category: string): BlogPost {
  const now = Date.now();
  return {
    id: `post-${now}-${Math.random().toString(36).slice(2, 8)}`,
    slug: '',
    title: '',
    subtitle: '',
    excerpt: '',
    blocks: [{ id: blockId(), type: 'paragraph', text: '' }],
    tags: [],
    category,
    authorName,
    publishedAt: now,
    updatedAt: now,
    status: 'draft',
    readingMinutes: 1,
  };
}

// ── Seed posts (block-form) ──────────────────────────────────────────────

function seedPosts(): BlogPost[] {
  const now = Date.now();
  const day = 86400000;
  const posts: BlogPost[] = [
    {
      id: 'seed-1',
      slug: 'building-a-medium-style-blog',
      title: 'Building a Medium-style blog with TekiVex UI',
      subtitle: 'No markdown, no backend — just write.',
      excerpt:
        'A block-based editor where readers and writers see the same beautiful page. Click the + button between blocks to add an image, a code snippet, a quote, or a divider.',
      blocks: [
        { id: blockId(), type: 'paragraph', text: 'You\'re reading the example. The post above and the one you\'re scrolling, the editor, the cover image upload, the code snippet — all of it ships as a single React route.' },
        { id: blockId(), type: 'heading', level: 2, text: 'Why a block editor instead of markdown?' },
        { id: blockId(), type: 'paragraph', text: 'Most people don\'t know what *italic* or `inline code` mean. A block editor speaks the language readers already know — they see the same thing you see while writing.' },
        { id: blockId(), type: 'quote', text: 'The best UI for writing is the one you forget you\'re using.' },
        { id: blockId(), type: 'heading', level: 2, text: 'How it works' },
        { id: blockId(), type: 'paragraph', text: 'Click the + button between any two blocks to insert a new one. Pick from text, heading, image, code, quote, list, video, or divider.' },
        { id: blockId(), type: 'code', lang: 'tsx', code: `import { TkxButton } from 'tekivex-ui';\n\nexport function Hello() {\n  return <TkxButton>Click me</TkxButton>;\n}` },
        { id: blockId(), type: 'paragraph', text: 'Code blocks are syntax-highlighted automatically. The language picker lives in the block toolbar.' },
        { id: blockId(), type: 'divider' },
        { id: blockId(), type: 'heading', level: 2, text: 'What\'s next' },
        { id: blockId(), type: 'list', ordered: false, items: [
          'Comments via Giscus (no backend, GitHub Discussions)',
          'RSS feed generated at build time',
          'Search-engine-friendly slugs and OG images per post',
        ] },
      ],
      tags: ['tekivex-ui', 'react', 'static-site'],
      category: 'Engineering',
      authorName: 'Anya Chen',
      publishedAt: now - 2 * day,
      updatedAt: now - 2 * day,
      status: 'published',
      readingMinutes: 4,
    },
    {
      id: 'seed-2',
      slug: 'design-tokens-that-scale',
      title: 'Design tokens that scale across 113 components',
      subtitle: 'Three rewrites. One rule that finally stuck.',
      excerpt:
        'A short tour of the token system behind tekivex-ui — what we kept simple, what we got wrong twice, and the rule that made theming painless.',
      blocks: [
        { id: blockId(), type: 'paragraph', text: 'We rewrote our token system three times before it stuck. Here\'s the version that survived contact with 113 components and four themes.' },
        { id: blockId(), type: 'heading', level: 2, text: 'Rule one: tokens are nouns, not adjectives' },
        { id: blockId(), type: 'paragraph', text: 'Early on we had --color-button-primary. That was wrong: every component had to know about every other component\'s colors.' },
        { id: blockId(), type: 'code', lang: 'css', code: ':root {\n  --tk-bg: #ffffff;\n  --tk-fg: #0f172a;\n  --tk-accent: #4f46e5;\n  --tk-surface: #f8fafc;\n}' },
        { id: blockId(), type: 'heading', level: 2, text: 'Rule two: dark theme is opt-in' },
        { id: blockId(), type: 'paragraph', text: 'Every visitor sees the light theme by default. [data-theme="dark"] re-binds the same tokens to dark values. No component needs an "if dark" branch.' },
      ],
      tags: ['design-tokens', 'css', 'theming'],
      category: 'Design',
      authorName: 'Anya Chen',
      publishedAt: now - 7 * day,
      updatedAt: now - 7 * day,
      status: 'published',
      readingMinutes: 3,
    },
    {
      id: 'seed-3',
      slug: 'shipping-360-on-static-hosting',
      title: 'Shipping 360° experiences on static hosting',
      subtitle: 'You can serve a full immersive tour from a CDN-only deploy.',
      excerpt:
        'You can serve a full 360° tour from a CDN-only deploy. Trade-offs around panorama loading, gyro permissions, and WebXR fallback.',
      blocks: [
        { id: blockId(), type: 'paragraph', text: 'Your immersive tour fits inside an index.html — really. Here\'s the recipe.' },
        { id: blockId(), type: 'heading', level: 2, text: 'Panorama choice' },
        { id: blockId(), type: 'paragraph', text: 'Use equirectangular JPEGs around 4096×2048 for the desktop tier, 2048×1024 for mobile. Drop them onto your CDN and reference by URL.' },
        { id: blockId(), type: 'heading', level: 2, text: 'Gyro permission on iOS' },
        { id: blockId(), type: 'paragraph', text: 'iOS requires an explicit user gesture before devicemotion events fire. The gyro prop handles the request lifecycle, but you still need a tap somewhere on the page.' },
        { id: blockId(), type: 'heading', level: 2, text: 'WebXR fallback' },
        { id: blockId(), type: 'paragraph', text: 'If navigator.xr.isSessionSupported(\'immersive-vr\') returns false, the same scene stays interactive — drag to orbit, click to teleport. No code changes.' },
      ],
      tags: ['360', 'webxr', 'three.js'],
      category: 'Engineering',
      authorName: 'Anya Chen',
      publishedAt: now - 14 * day,
      updatedAt: now - 14 * day,
      status: 'published',
      readingMinutes: 5,
    },
  ];
  persist(posts);
  return posts;
}
