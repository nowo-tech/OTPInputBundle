import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __OTP_INPUT_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    outDir: 'src/Resources/public',
    emptyOutDir: false,
    rollupOptions: {
      input: 'src/Resources/assets/src/otp-input.ts',
      output: {
        format: 'iife',
        entryFileNames: 'otp-input.js',
        assetFileNames: 'otp-input.[ext]',
      },
    },
    minify: true,
    sourcemap: false,
  },
});
