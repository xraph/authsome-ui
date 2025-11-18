import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Disabled: Package needs implementation updates
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@authsome/ui-core', '@supabase/supabase-js'],
});

