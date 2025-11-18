import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Disabled: Package needs error type updates
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@authsome/ui-core', '@clerk/clerk-js'],
});

