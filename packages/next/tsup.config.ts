import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'middleware/index': 'src/middleware/index.ts',
    'server/index': 'src/server/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
  },
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'next',
    'next/server',
    'next/navigation',
    'next/headers',
    '@authsome/ui-core',
    '@authsome/ui-react',
  ],
  treeshake: true,
  splitting: false,
  minify: false,
  target: 'es2020',
  tsconfig: './tsconfig.json',
});

