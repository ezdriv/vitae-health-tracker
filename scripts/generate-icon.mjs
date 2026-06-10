#!/usr/bin/env node
/**
 * Generate a 1024×1024 PNG app icon from icon.svg for Tauri bundler.
 * Uses macOS qlmanage when available; falls back to copying a minimal PNG stub message.
 */
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = join(root, 'icon.svg');
const out = join(root, 'app-icon.png');

if (existsSync(out)) {
  console.log('app-icon.png already exists');
  process.exit(0);
}

try {
  execSync(`qlmanage -t -s 1024 -o "${root}" "${svg}"`, { stdio: 'pipe' });
  execSync(`mv "${join(root, 'icon.svg.png')}" "${out}"`, { stdio: 'pipe' });
  console.log('Generated app-icon.png from icon.svg');
} catch {
  console.error(
    'Could not auto-generate app-icon.png. Place a 1024×1024 PNG at bmi-health-tracker/app-icon.png, then run: npm run icons'
  );
  process.exit(1);
}