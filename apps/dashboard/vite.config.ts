import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'src/main.tsx',
        'src/types/**',
        'src/icons/**',
        'src/constants/**',
        'src/theme/**',
        'src/routes/**',
        'src/utils/**',
        'src/index.css',
        '**/*.d.ts',
        '__tests__/**',
      ],
    },
  },
});
