import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['tests/setupTests.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['tests/e2e/**', 'node_modules/**', '.next/**'],
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'domain/**/*.ts',
        'features/**/*.ts',
        'features/**/*.tsx',
        'services/**/*.ts',
        'lib/**/*.ts',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/index.ts',
        '**/*Types.ts',
        '**/taxConfig.ts',
        'lib/constants/**',
        'lib/models/**',
        'features/**/components/**',
      ],
    },
  },
})
