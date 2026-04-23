import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'src/index.ts',
        'src/cli.ts',
        'src/run-db.ts',
        'src/serve-dev.ts',
        'src/get-db-url.ts',
        'src/types/**',
        'src/constants/**',
        'src/config/**',
        'src/db/**',
        'src/middleware/**',
        'src/config-loader.ts',
        'src/utils/**',
        '**/*.d.ts',
        'tests/**',
      ],
    },
  },
});
