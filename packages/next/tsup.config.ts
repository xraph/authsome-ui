import { defineConfig } from 'tsup';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export default defineConfig([
  // Client components entry (with 'use client')
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: {
      resolve: true,
    },
    sourcemap: true,
    clean: false,
    external: [
      'react',
      'react-dom',
      'next',
      'next/navigation',
      'next/headers',      // Server-only
      'next/server',       // Server-only
      'iron-session',      // Server-only
      '@authsome/ui-core',
      '@authsome/ui-react',
    ],
    bundle: true,
    treeshake: true,
    splitting: false,
    minify: false,
    target: 'es2020',
    tsconfig: './tsconfig.json',
    // Add 'use client' directive after build
    async onSuccess() {
      const files = ['dist/index.js', 'dist/index.mjs'];
      for (const file of files) {
        try {
          const content = readFileSync(file, 'utf-8');
          if (!content.startsWith('"use client"')) {
            writeFileSync(file, '"use client";\n' + content);
            console.log(`✓ Added 'use client' to ${file}`);
          }
        } catch (err) {
          console.warn(`Warning: Could not process ${file}`);
        }
      }
    },
  },
  // Server entry (no 'use client')
  {
    entry: {
      'server/index': 'src/server/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: {
      resolve: true,
    },
    sourcemap: true,
    clean: false,
    external: [
      'react',
      'react-dom',
      'next',
      'next/server',
      'next/headers',
      'iron-session',
      '@authsome/ui-core',
      '@authsome/ui-react',
    ],
    treeshake: true,
    splitting: false,
    minify: false,
    target: 'es2020',
    tsconfig: './tsconfig.json',
  },
  // Middleware entry (no 'use client')
  {
    entry: {
      'middleware/index': 'src/middleware/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: {
      resolve: true,
    },
    sourcemap: true,
    clean: false,
    external: [
      'next',
      'next/server',
      'iron-session',
      '@authsome/ui-core',
    ],
    treeshake: true,
    splitting: false,
    minify: false,
    target: 'es2020',
    tsconfig: './tsconfig.json',
  },
]);

