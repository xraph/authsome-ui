import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disabled
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@authsome/ui-core', '@supabase/supabase-js'],
});

