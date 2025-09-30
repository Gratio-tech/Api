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
    banner: { js: '#!/usr/bin/env node' },
    esbuildOptions: options => {
      options.outfile = 'dist/cli';
      options.outdir = undefined;
      options.minify = true;
      options.format = 'cjs';
      options.target = 'es2020';
      options.treeShaking = true;
    },
    external: ['readline'],
  },
]);
