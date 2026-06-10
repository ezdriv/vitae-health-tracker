#!/bin/bash
# Complete publish after GitHub CLI has the 'workflow' scope
set -euo pipefail
cd "$(dirname "$0")"

if ! gh auth status 2>&1 | grep -q "workflow"; then
  echo "GitHub CLI needs the 'workflow' scope to upload the Actions file."
  echo "Run this first and complete the browser step:"
  echo "  gh auth refresh -h github.com -s workflow -c"
  exit 1
fi

echo "Pushing release workflow..."
git push origin main

if git rev-parse v1.0.0 >/dev/null 2>&1; then
  echo "Tag v1.0.0 already exists locally."
else
  git tag v1.0.0
fi

echo "Pushing tag v1.0.0 to trigger installer builds..."
git push origin v1.0.0

echo ""
echo "Done! Watch the build:"
echo "  https://github.com/ezdriv/vitae-health-tracker/actions"
echo "Releases (installers appear in ~10-15 min):"
echo "  https://github.com/ezdriv/vitae-health-tracker/releases"