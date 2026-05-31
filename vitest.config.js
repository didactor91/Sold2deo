import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    exclude: ['tests/unit/server/routes/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js', 'server/src/**/*.js'],
      exclude: ['src/types/**'],
    },
    bench: { reportMedian: true, reportPercentiles: true },
  },
  resolve: {
    alias: {
      '@server': resolve(__dirname, 'server/src'),
      '@src': resolve(__dirname, 'src'),
    },
  },
});