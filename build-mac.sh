#!/bin/bash
# Build Vitae Health Tracker .dmg for Apple Silicon (arm64) Mac
set -euo pipefail
cd "$(dirname "$0")"

echo "=== Vitae — Mac Apple Silicon installer (.dmg) ==="
echo ""

if ! command -v rustc >/dev/null 2>&1; then
  echo "Rust is required. Install from https://rustup.rs then re-run this script."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js/npm is required."
  exit 1
fi

ARCH="$(uname -m)"
if [[ "$ARCH" != "arm64" ]]; then
  echo "Note: You are on $ARCH. This script targets Apple Silicon (arm64)."
  echo "The build may still work, but the .dmg is intended for M-series Macs."
fi

npm install
npm run prepare-dist

if [[ ! -f app-icon.png ]]; then
  npm run icons || true
fi

if [[ ! -f src-tauri/icons/icon.icns ]]; then
  echo "Generating app icons..."
  npm run icons
fi

echo ""
echo "Building .dmg (this may take several minutes on first run)..."
npm run build:mac

echo ""
echo "Done! Look for the installer in:"
echo "  src-tauri/target/release/bundle/dmg/"
ls -la src-tauri/target/release/bundle/dmg/ 2>/dev/null || ls -la src-tauri/target/aarch64-apple-darwin/release/bundle/dmg/ 2>/dev/null || true