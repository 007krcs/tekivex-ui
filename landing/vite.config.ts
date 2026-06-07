import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// VITE_BASE lets the merge script deploy this under any sub-path.
// Default '/' for `npm run dev`.
const base = process.env.VITE_BASE || '/';

export default defineConfig({
  base,
  plugins: [react()],
  // Force a single React copy (tekivex-ui ships its own; tekivex-3d uses
  // peer-dep three but no React; landing uses React directly). Without
  // dedupe + alias we'd get the "two React copies" useState-null crash.
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'three'],
    alias: [
      // Pin three explicitly: the tekivex-3d source files live OUTSIDE
      // landing/ and import 'three' bare. Without this alias, Vite's
      // node-style resolver walks UP from packages/tekivex-3d/src/ and
      // never reaches landing/node_modules/three. Pinning here forces
      // every 'three' import (from the landing OR from tekivex-3d's
      // source) to the same absolute path.
      { find: 'three', replacement: resolve(__dirname, 'node_modules/three') },

      { find: 'tekivex-ui/styles', replacement: resolve(__dirname, '../dist/tekivex-ui.css') },
      // Subpath exports — these MUST come before the bare 'tekivex-ui' alias
      // so the longer prefix wins.
      { find: 'tekivex-ui/charts', replacement: resolve(__dirname, '../src/charts/index.ts') },
      { find: 'tekivex-ui',        replacement: resolve(__dirname, '../index.ts') },
      { find: 'tekivex-3d',        replacement: resolve(__dirname, '../packages/tekivex-3d/src/index.ts') },
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    // ── modulepreload tuning ─────────────────────────────────────────────
    // Vite's default modulepreload behaviour eagerly hints every static
    // dep of every lazy chunk so navigation feels instant. That's right
    // for a 50 kB dependency but disastrous for vendor-three (531 kB /
    // 132 kB gzip) — most landing-page visitors never visit the 3D
    // example routes, so we'd be burning 132 kB of their data plan
    // for nothing.
    //
    // Custom resolver filters vendor-three (and any large opt-in deps
    // added in future) out of the preload list. The chunk is still
    // BUILT and still LOADS when the user actually navigates to a 3D
    // route — it's just not preloaded ahead of time.
    modulePreload: {
      resolveDependencies(_filename, deps) {
        return deps.filter((d) => !/vendor-three/.test(d));
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'vendor-three';
          if (id.includes('node_modules/react')) return 'vendor-react';
        },
      },
    },
  },
  server: { port: 5175, open: true },
});
