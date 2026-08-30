#!/usr/bin/env node
/**
 * Bundles test/*.test.mjs (which import the TSX route components) into
 * test/dist/ so `node --test` can run them without a TypeScript loader.
 * esbuild resolves the `@/` alias, compiles JSX and drops the CSS imports;
 * React, Next and every other package stay external.
 */
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'test');
const OUT = path.join(SRC, 'dist');

const entries = fs
  .readdirSync(SRC)
  .filter((f) => f.endsWith('.test.mjs'))
  .map((f) => path.join(SRC, f));

fs.rmSync(OUT, { recursive: true, force: true });
await build({
  entryPoints: entries,
  outdir: OUT,
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  jsx: 'automatic',
  packages: 'external',
  alias: { '@': ROOT, 'next/navigation': path.join(SRC, 'stubs', 'next-navigation.mjs') },
  loader: { '.css': 'empty' },
  outExtension: { '.js': '.mjs' },
  logLevel: 'warning',
});
console.log(`✔ built ${entries.length} test file(s) into test/dist/`);
