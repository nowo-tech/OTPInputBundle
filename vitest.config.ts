import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/Resources/assets/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      reportsDirectory: './coverage-ts',
      include: [
        'src/Resources/assets/src/otp-input.ts',
        'src/Resources/assets/src/otp-input-lib.ts',
        'src/Resources/assets/src/nowo-otp-input-element.ts',
      ],
      exclude: ['**/*.test.ts', '**/node_modules/**'],
      // REQ-TEST-003: TS coverage gate (>= 90%); `vitest run --coverage` exits non-zero below it.
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 90,
      },
    },
  },
});
