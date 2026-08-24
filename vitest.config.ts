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
    },
  },
});
