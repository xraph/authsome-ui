import { defineConfig } from 'tsup';

export default defineConfig([
  // Main package build
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['@authsome/ui-react', '@authsome/ui-react-headless', '@authsome/ui-core'],
  },
  // CLI build
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: false,
    clean: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
    external: [
      '@clack/prompts',
      'commander',
      'fs-extra',
      'chalk',
      'ora',
      'execa',
    ],
  },
]);
