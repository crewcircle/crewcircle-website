#!/usr/bin/env bash
# Release script for @crewcircle/knowledge
# Usage: ./scripts/release.sh [patch|minor|major]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PACKAGE_DIR="$ROOT_DIR/packages/knowledge"

echo "🚀 Release script for @crewcircle/knowledge"
echo "=========================================="

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "❌ Error: Must be on main branch to release. Current: $CURRENT_BRANCH"
  exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "❌ Error: Uncommitted changes detected. Commit or stash first."
  exit 1
fi

# Pull latest
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
cd "$ROOT_DIR"
npm ci

# Run tests
echo "🧪 Running tests..."
npm run test --workspace=@crewcircle/knowledge

# Run typecheck
echo "🔍 Type checking..."
npm run typecheck --workspace=@crewcircle/knowledge

# Run lint
echo "🔧 Linting..."
npm run lint --workspace=@crewcircle/knowledge

# Build
echo "🏗️  Building..."
npm run build --workspace=@crewcircle/knowledge

# Determine version bump
BUMP_TYPE="${1:-patch}"
if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo "❌ Error: Invalid bump type. Use: patch, minor, or major"
  exit 1
fi

echo "📝 Creating changeset ($BUMP_TYPE)..."
cd "$ROOT_DIR"
npx changeset add --empty --message "chore: release" --bump "$BUMP_TYPE"

echo "✅ Changeset created. Now version bump..."
npx changeset version

# Show what changed
echo ""
echo "📋 Version changes:"
git diff --stat

# Ask for confirmation
read -p "❓ Commit version bump and push? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Aborted. Changes not committed."
  exit 1
fi

git add -A
git commit -m "chore: version packages"
git push origin main

echo ""
echo "✅ Release PR created! Next steps:"
echo "  1. Review the PR at GitHub"
echo "  2. Merge the PR"
echo "  3. Tag will be pushed automatically on merge"
echo "  4. Publish workflow will publish to npm"
echo ""
echo "🎉 Done!"