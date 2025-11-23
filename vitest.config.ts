import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'), // adjust path as needed
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // include our test setup which mocks firebase early to avoid real initialization
    setupFiles: [path.resolve(__dirname, './client/src/setupTests.ts'), path.resolve(__dirname, './test-setup/vitest.setup.ts')],
    include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
