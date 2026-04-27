// Astro 5 requires content collections to be explicitly defined in
// src/content.config.ts. Without this file, Astro auto-generates a
// collection definition that's missing slug-to-route mappings Starlight
// relies on for its built-in 404 page generator — which surfaces as:
//
//   Entry docs → 404 was not found.
//   Cannot read properties of undefined (reading '_zod')
//
// during the "generating static routes" build phase.
//
// This file uses Starlight's official docsLoader + docsSchema so that
// every page under src/content/docs/ is loaded with the same frontmatter
// schema Starlight expects (title, description, sidebar order, etc.).

import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema(),
  }),
};
