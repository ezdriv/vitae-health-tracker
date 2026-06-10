#!/bin/bash
# Build Vitae Health Tracker .deb for Linux Mint / Debian / Ubuntu (64-bit)
set -euo pipefail
cd "$(dirname "$0")"

echo "=== Vitae — Linux Mint installer (.deb) ==="
echo ""

if ! command -v rustc >/dev/null 2>&1; then
  echo "Rust is required. Install: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js/npm is required."
  exit 1
fi

echo "Installing Linux build dependencies (Mint/Ubuntu/Debian)..."
echo "You may be prompted for your sudo password."
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

npm install
npm run prepare-dist

if [[ ! -f app-icon.png ]]; then
  if command -v rsvg-convert >/dev/null 2>&1; then
    rsvg-convert -w 1024 -h 1024 icon.svg -o app-icon.png
  else
    npm run icons || true
  fi
fi

if [[ ! -f src-tauri/icons/icon.png ]]; then
  echo "Generating app icons..."
  npm run icons
fi

echo ""
echo "Building .deb package (first run downloads Rust crates; may take several minutes)..."
npm run build:linux

echo ""
echo "Done! Install on Linux Mint with:"
echo "  sudo dpkg -i src-tauri/target/release/bundle/deb/*.deb"
echo ""
ls -la src-tauri/target/release/bundle/deb/ 2>/dev/null || true