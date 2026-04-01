import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
    },
    include: [
      'packages/core/__tests__/**/*.test.ts',
      'packages/react/__tests__/**/*.test.ts',
      'packages/vue/__tests__/**/*.test.ts',
    ],
  },
});
