import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { execSync } from 'node:child_process';

// In build mode, default base to '/playground/' because the demo SPA
// gets moved into that subfolder by the post-build merge step. In dev
// mode (`npm run dev:demo`), keep base='/' so http://localhost:5174/
// works as the SPA's root.
//
// VITE_BASE env var still wins for explicit overrides.
const isBuild = process.argv.includes('build');
const base = process.env.VITE_BASE || (isBuild ? '/playground/' : '/');

export default defineConfig({
  root: resolve(__dirname),
  base,
  plugins: [
    react(),
    // ── Post-build merge plugin ──────────────────────────────────────────
    // After Vite finishes writing demo/dist, run the unified merge so the
    // final tree at demo/dist looks like:
    //   /                  React landing (new ui.tekivex.com homepage)
    //   /playground/       The demo SPA (what Vite just produced)
    //   /book/             tkx-book catalog
    //
    // This runs ONLY in build mode and ONLY when SKIP_POST_MERGE isn't
    // set — local `npm run dev:demo` is unaffected.
    {
      name: 'tkx-post-build-merge',
      apply: 'build',
      closeBundle: {
        sequential: true,
        order: 'post',
        handler() {
          if (process.env.SKIP_POST_MERGE) {
            console.log('\n[tkx-merge] SKIP_POST_MERGE set — skipping');
            return;
          }
          console.log('\n[tkx-merge] running post-demo-merge.mjs…');
          try {
            execSync('node ' + resolve(__dirname, '../scripts/post-demo-merge.mjs'), {
              stdio: 'inherit',
              cwd: resolve(__dirname, '..'),
            });
          } catch (err) {
            console.error('[tkx-merge] FAILED — site will fall back to demo-only at /');
            console.error('         ', err instanceof Error ? err.message : err);
            // Don't throw — Render's deploy continues with whatever's in demo/dist
          }
        },
      },
    },
  ],
  resolve: {
    alias: {
      'tekivex-ui': resolve(__dirname, '../index.ts'),
      '@engine': resolve(__dirname, '../src/engine'),
      '@themes': resolve(__dirname, '../src/themes'),
      '@hooks': resolve(__dirname, '../src/hooks'),
      '@a11y': resolve(__dirname, '../src/a11y'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
        },
      },
    },
  },
  server: { port: 5174, open: true },
});
