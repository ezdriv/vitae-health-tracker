#!/usr/bin/env node
/**
 * Copy web assets into dist/ for Tauri bundling (excludes src-tauri, node_modules, etc.)
 */
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const assets = [
  'index.html',
  'downloads.html',
  'release-config.json',
  'cdc-percentiles.js',
  'sw.js',
  'manifest.webmanifest',
  'icon.svg'
];

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const file of assets) {
  cpSync(join(root, file), join(dist, file));
}

console.log(`Prepared ${assets.length} files in dist/`);