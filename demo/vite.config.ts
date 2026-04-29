import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
// In build mode, default base to '/playground/' because the demo SPA
// gets moved into that subfolder by the unified merge in
// scripts/build-unified-site.mjs. In dev
// mode (`npm run dev:demo`), keep base='/' so http://localhost:5174/
// works as the SPA's root.
//
// VITE_BASE env var still wins for explicit overrides.
const isBuild = process.argv.includes('build');
const base = process.env.VITE_BASE || (isBuild ? '/playground/' : '/');

export default defineConfig({
  root: resolve(__dirname),
  base,
  plugins: [react()],
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
