import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  base: '/',
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
          // React core — single shared vendor chunk, cached aggressively
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // Recharts + d3 — only pulled in when chart pages load
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
        },
      },
    },
  },
  server: { port: 5174, open: true },
});
