#!/usr/bin/env bash
# ControlPlane AI — Framework bundler
# Copies framework files from repo root into cli/framework/ for npm packaging.
# Run via `npm run prepack` before publishing.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$(dirname "$CLI_DIR")"
FRAMEWORK_DIR="$CLI_DIR/framework"

echo "Bundling framework files from $REPO_ROOT into $FRAMEWORK_DIR..."

# Clean previous bundle
rm -rf "$FRAMEWORK_DIR"

# Framework files to bundle (must match FRAMEWORK_FILES in src/constants.ts)
FILES=(
  "AGENTS.md"
  "CLAUDE.md"
  "LICENSE"
  "README.md"
  ".agent/control-plane-index.md"
  ".agent/commands/commit.md"
  ".agent/commands/execute.md"
  ".agent/commands/map.md"
  ".agent/commands/plan.md"
  ".agent/commands/review.md"
  ".agent/skills/bootstrap.md"
  ".agent/skills/change-management.md"
  ".agent/skills/code-quality.md"
  ".agent/skills/code-review.md"
  ".agent/skills/context-engineering.md"
  ".agent/skills/documentation.md"
  ".agent/skills/error-handling.md"
  ".agent/skills/git.md"
  ".agent/skills/security.md"
  ".agent/skills/testing.md"
  ".agent/templates/brief.md"
  ".agent/templates/commit-msg.md"
  ".agent/templates/plan.md"
  ".agent/templates/repo-map.md"
  ".agent/templates/repo-specific-index.md"
  ".agent/templates/skill.md"
  ".github/copilot-instructions.md"
  ".cursor/rules/controlplane.mdc"
  "scripts/validate.sh"
)

copied=0
for file in "${FILES[@]}"; do
  src="$REPO_ROOT/$file"
  dest="$FRAMEWORK_DIR/$file"

  if [ ! -f "$src" ]; then
    echo "  WARNING: $file not found in repo root, skipping"
    continue
  fi

  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"

  # Preserve executable permission
  if [ -x "$src" ]; then
    chmod +x "$dest"
  fi

  echo "  ✓ $file"
  copied=$((copied + 1))
done

echo ""
echo "Bundled $copied framework files into $FRAMEWORK_DIR"
