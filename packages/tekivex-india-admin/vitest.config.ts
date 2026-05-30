import { defineConfig } from 'vitest/config';

// Self-contained vitest config so this package can be tested without
// pulling in the root tekivex-ui setup (which mocks browser APIs not
// needed by this pure-data package).

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: false,
  },
});
