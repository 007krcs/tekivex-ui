import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      '@tekivex/ui': resolve(__dirname, '../index.ts'),
      '@engine': resolve(__dirname, '../src/engine'),
      '@themes': resolve(__dirname, '../src/themes'),
      '@hooks': resolve(__dirname, '../src/hooks'),
      '@a11y': resolve(__dirname, '../src/a11y'),
    },
  },
  server: { port: 5174, open: true },
});
