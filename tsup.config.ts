import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    dts: true,
    format: ['cjs', 'esm'],
    treeshake: 'smallest',
    outDir: './dist',
    minify: 'terser',
    target: 'es2020',
    // Clean should be done for first target only
    clean: true,
  },
  {
    entry: ['src/cli.ts'],
    dts: false,
    format: 'cjs',
    treeshake: 'smallest',
    outDir: './dist',
    minify: 'terser',
    target: 'es2020',
    external: ['readline'],
  },
]);
