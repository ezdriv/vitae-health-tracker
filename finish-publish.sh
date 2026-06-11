#!/bin/bash
# Tag v1.0.0 and trigger installer builds (workflow must exist on GitHub first)
set -euo pipefail
cd "$(dirname "$0")"

if ! gh api repos/ezdriv/vitae-health-tracker/contents/.github/workflows/release.yml --jq .name >/dev/null 2>&1; then
  echo "The GitHub Actions workflow is not on the repo yet."
  echo ""
  echo "Quickest fix — run this and paste a GitHub token when asked:"
  echo "  ./publish-with-token.sh"
  echo ""
  echo "Create token (check repo + workflow):"
  echo "  https://github.com/settings/tokens/new?scopes=repo,workflow&description=Vitae-publish"
  echo ""
  echo "Or add the file in your browser:"
  echo "  https://github.com/ezdriv/vitae-health-tracker/new/main/.github/workflows/release.yml"
  echo "  (paste contents from release-workflow.yml, then Commit changes)"
  exit 1
fi

git fetch origin
git pull --rebase origin main

if git rev-parse v1.0.0 >/dev/null 2>&1; then
  echo "Tag v1.0.0 exists locally."
else
  git tag v1.0.0
fi

echo "Pushing tag v1.0.0 to trigger installer builds..."
git push origin v1.0.0

echo ""
echo "Build started:"
echo "  https://github.com/ezdriv/vitae-health-tracker/actions"
echo "Installers:"
echo "  https://github.com/ezdriv/vitae-health-tracker/releases"