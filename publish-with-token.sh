#!/bin/bash
# One-time publish: upload workflow + tag v1.0.0 using a GitHub Personal Access Token
set -euo pipefail
cd "$(dirname "$0")"

echo "Vitae — finish GitHub publish"
echo ""
echo "Create a classic token (repo + workflow scopes):"
echo "  https://github.com/settings/tokens/new?scopes=repo,workflow&description=Vitae-publish"
echo ""
echo "Paste token (hidden, then Enter):"
read -rs GH_TOKEN
echo ""

if [ -z "$GH_TOKEN" ]; then
  echo "No token entered."
  exit 1
fi

export GH_TOKEN
echo "$GH_TOKEN" | gh auth login --with-token 2>/dev/null

if ! gh auth status 2>&1 | grep -q workflow; then
  echo "Token missing 'workflow' scope. Create a new token with repo + workflow checked."
  exit 1
fi

# Upload workflow if missing
if ! gh api repos/ezdriv/vitae-health-tracker/contents/.github/workflows/release.yml --jq .name >/dev/null 2>&1; then
  echo "Uploading GitHub Actions workflow..."
  python3 << 'PY'
import base64, json, os, subprocess, pathlib
content = base64.b64encode(pathlib.Path("release-workflow.yml").read_bytes()).decode()
payload = {"message": "Add GitHub Actions release workflow", "content": content, "branch": "main"}
proc = subprocess.run(
    ["gh", "api", "repos/ezdriv/vitae-health-tracker/contents/.github/workflows/release.yml", "-X", "PUT", "--input", "-"],
    input=json.dumps(payload), text=True, capture_output=True
)
if proc.returncode != 0:
    print(proc.stdout or proc.stderr)
    raise SystemExit(proc.returncode)
print("Workflow uploaded.")
PY
else
  echo "Workflow already on GitHub."
fi

git fetch origin
git pull --rebase origin main

if ! git rev-parse v1.0.0 >/dev/null 2>&1; then
  git tag v1.0.0
fi

echo "Pushing tag v1.0.0..."
git push origin v1.0.0

echo ""
echo "Build started:"
echo "  https://github.com/ezdriv/vitae-health-tracker/actions"
echo "Installers:"
echo "  https://github.com/ezdriv/vitae-health-tracker/releases"