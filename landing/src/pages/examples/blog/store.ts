// ─────────────────────────────────────────────────────────────────────────────
// Tiny localStorage-backed blog store. Demonstrates how a static-deployed
// React blog can offer the full editor experience (write, upload images,
// drop in code blocks, tag, publish) without a server, by persisting posts
// in the visitor's own browser. In production you'd swap this module for a
// REST/GraphQL/Supabase client; the rest of the example stays unchanged.
// ─────────────────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;          // Markdown
  coverImage?: string;      // base64 data URL
  tags: string[];
  category: string;
  authorName: string;
  authorAvatar?: string;
  publishedAt: number;      // epoch ms
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

const POSTS_KEY = 'tkx-blog-example-posts-v1';
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
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ── Config ────────────────────────────────────────────────────────────────

export function loadConfig(): BlogConfig {
  return readJson(CONFIG_KEY, DEFAULT_CONFIG);
}

export function saveConfig(cfg: BlogConfig) {
  writeJson(CONFIG_KEY, cfg);
}

export function resetConfig(): BlogConfig {
  writeJson(CONFIG_KEY, DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

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

function persist(posts: BlogPost[]) {
  writeJson(POSTS_KEY, posts);
}

export function savePost(post: BlogPost) {
  const all = loadPosts();
  const idx = all.findIndex((p) => p.id === post.id);
  if (idx >= 0) all[idx] = post;
  else all.unshift(post);
  persist(all);
}

export function deletePost(id: string) {
  const all = loadPosts().filter((p) => p.id !== id);
  persist(all);
}

export function findPost(slug: string): BlogPost | undefined {
  return loadPosts().find((p) => p.slug === slug);
}

export function findPostById(id: string): BlogPost | undefined {
  return loadPosts().find((p) => p.id === id);
}

// ── Slug + reading-time helpers ──────────────────────────────────────────

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'post';
}

export function ensureUniqueSlug(slug: string, exceptId?: string): string {
  const all = loadPosts();
  let base = slug || 'post';
  let candidate = base;
  let n = 2;
  while (all.some((p) => p.slug === candidate && p.id !== exceptId)) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

export function readingMinutes(content: string): number {
  const words = content.replace(/```[\s\S]*?```/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function newPost(authorName: string, category: string): BlogPost {
  const now = Date.now();
  return {
    id: `post-${now}-${Math.random().toString(36).slice(2, 8)}`,
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    tags: [],
    category,
    authorName,
    publishedAt: now,
    updatedAt: now,
    status: 'draft',
    readingMinutes: 1,
  };
}

// ── Seed posts (so the blog isn't empty on first visit) ──────────────────

function seedPosts(): BlogPost[] {
  const now = Date.now();
  const day = 86400000;
  const posts: BlogPost[] = [
    {
      id: 'seed-1',
      slug: 'building-with-tekivex-ui',
      title: 'Building a static blog with TekiVex UI',
      excerpt:
        'How we wired up a fully editable blog inside a static deploy — markdown editor, image upload, code blocks, tags, and search, all without a backend.',
      content:
`# Building a static blog with TekiVex UI

This blog you're reading is **the example**. The post you're scrolling, the one you can edit live with the pencil button, the search at the top — all of it ships as a single React route built with [tekivex-ui](https://www.npmjs.com/package/tekivex-ui).

## Why no backend?

Most personal blogs don't need one. The cost of a static deploy on Render, Vercel, or Cloudflare Pages is zero, and the surface area for security issues drops to almost nothing.

We persist drafts and published posts in \`localStorage\` so the editor experience stays interactive without any server round-trip. When you're ready to ship a real publication, swap \`store.ts\` for a Supabase / Sanity / your-own-API client and the rest of the components stay identical.

## Code blocks

Triple-backtick blocks are rendered with a tiny syntax-highlighter:

\`\`\`tsx
import { TkxButton } from 'tekivex-ui';

export function Hello() {
  return <TkxButton>Click me</TkxButton>;
}
\`\`\`

## Image upload

Drop an image into the editor. It's converted to a data URL and embedded inline so it travels with the post — no upload server, no S3 bucket.

## What's next

- Comments via Giscus (no backend, GitHub Discussions)
- RSS feed generated at build time
- Search-engine-friendly slugs and OG images per post
`,
      coverImage: '',
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
      excerpt:
        'A short tour of the token system behind tekivex-ui — what we kept simple, what we got wrong twice, and the rule that finally made theming painless.',
      content:
`# Design tokens that scale across 113 components

We rewrote our token system three times before it stuck. Here's the version that survived contact with 113 components and four themes.

## Rule one: tokens are nouns, not adjectives

Early on we had \`--color-button-primary\`. That was wrong: every component had to know about every other component's colors. The version that scaled looks like this:

\`\`\`css
:root {
  --tk-bg: #ffffff;
  --tk-fg: #0f172a;
  --tk-accent: #4f46e5;
  --tk-surface: #f8fafc;
}
\`\`\`

A button doesn't get \`--button-bg\`. It gets \`var(--tk-accent)\` for primary, \`var(--tk-surface)\` for ghost.

## Rule two: dark theme is opt-in, not default

Every visitor sees the light theme. \`[data-theme="dark"]\` re-binds the same tokens to dark values. No component needs an \`if dark\` branch.
`,
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
      excerpt:
        'You can serve a full 360° tour from a CDN-only deploy. Here are the trade-offs around panorama loading, gyro permissions, and WebXR fallback.',
      content:
`# Shipping 360° experiences on static hosting

Your immersive tour fits inside an \`index.html\` — really. Here's the recipe.

## Panorama choice

Use **equirectangular** JPEGs around 4096×2048 for the desktop tier, 2048×1024 for mobile. Drop them onto your CDN and reference by URL. tekivex-3d's \`<TkxPanorama360>\` will lazy-load and crossfade.

## Gyro permission on iOS

iOS requires an explicit user gesture before \`devicemotion\` events fire. The \`gyro\` prop handles the request lifecycle, but you still need a tap somewhere on the page.

## WebXR fallback

If \`navigator.xr.isSessionSupported('immersive-vr')\` returns \`false\`, the same scene stays interactive — drag to orbit, click to teleport. No code changes.
`,
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
