// ─────────────────────────────────────────────────────────────────────────────
// Blog post registry — single source of truth for the blog index + per-post
// pages + sitemap generation. Each post entry has metadata + a render
// function. Posts live in their own .tsx files but register here.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react';
import { OnePagePrint } from './posts/one-page-print';
import { BidirectionalSpreadsheetChart } from './posts/spreadsheet-chart-sync';
import { FlowchartWindowListeners } from './posts/flowchart-window-listeners';
import { Procedural360Tour } from './posts/procedural-360-tour';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** Plain-text summary used on the index page + meta description. */
  summary: string;
  publishedAt: string;       // ISO date, controls index order
  readingMinutes: number;
  tags: string[];
  render: () => ReactNode;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'one-page-print',
    title: 'How a hidden iframe gives us 1-page browser-only PDFs',
    description:
      'When our resume + biodata templates started printing 20 sheets instead of 1, the fix was not "patch the print stylesheet" — it was "isolate the print context entirely." Here is the deep dive.',
    summary:
      'When our resume + biodata templates started printing 20 sheets instead of 1, the fix was not "patch the print stylesheet" — it was "isolate the print context entirely." Here is the deep dive.',
    publishedAt: '2026-04-30',
    readingMinutes: 6,
    tags: ['printing', 'PDF', 'CSS', 'browser quirks'],
    render: OnePagePrint,
  },
  {
    slug: 'spreadsheet-chart-sync',
    title: 'Bidirectional spreadsheet ↔ chart sync in 100 lines',
    description:
      'Two views of the same data, no React form library, no GraphQL plumbing — just two pure functions and a useMemo. Here is the pattern that powers our Data Demo section.',
    summary:
      'Two views of the same data, no React form library, no GraphQL plumbing — just two pure functions and a useMemo. Here is the pattern that powers our Data Demo section.',
    publishedAt: '2026-04-25',
    readingMinutes: 8,
    tags: ['React', 'state management', 'spreadsheets'],
    render: BidirectionalSpreadsheetChart,
  },
  {
    slug: 'flowchart-window-listeners',
    title: 'When setPointerCapture is not enough: a FlowChart drag bug',
    description:
      'We shipped a node-connector port, the visual was perfect, the tests passed, but real browsers refused to draw the edge. The fix was to give up on pointer capture and listen on window directly. Here is the story.',
    summary:
      'We shipped a node-connector port, the visual was perfect, the tests passed, but real browsers refused to draw the edge. The fix was to give up on pointer capture and listen on window directly. Here is the story.',
    publishedAt: '2026-04-22',
    readingMinutes: 7,
    tags: ['React', 'pointer events', 'debugging'],
    render: FlowchartWindowListeners,
  },
  {
    slug: 'procedural-360-tour',
    title: 'A 360° tour without equirectangular photos',
    description:
      'Our landing tour goes from Earth orbit to the surface of Mars to deep space. Zero asset bytes ship — every star, planet, satellite, and orbit ring is generated at runtime from primitives. Here is how.',
    summary:
      'Our landing tour goes from Earth orbit to the surface of Mars to deep space. Zero asset bytes ship — every star, planet, satellite, and orbit ring is generated at runtime from primitives. Here is how.',
    publishedAt: '2026-04-12',
    readingMinutes: 9,
    tags: ['three.js', 'WebGL', 'procedural generation'],
    render: Procedural360Tour,
  },
];

export function findPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function blogIndex() {
  // Sort newest first
  return [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
