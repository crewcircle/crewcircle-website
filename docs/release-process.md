# Release Process for @crewcircle/knowledge

## Overview

This package uses [Changesets](https://github.com/changesets/changesets) for automated versioning and changelog generation. The release process is fully automated via GitHub Actions.

## Quick Start

### For Contributors (Creating a Changeset)

When you make changes that should be released:

```bash
# From monorepo root
npx changeset
```

This will prompt you to:
1. Select packages to version (`@crewcircle/knowledge`)
2. Choose semver bump type (patch/minor/major)
3. Write a summary for the changelog

A markdown file is created in `.changeset/` - commit this with your PR.

### For Maintainers (Releasing)

#### Option 1: Automated (Recommended)

1. **Merge PRs with changesets** - The CI will detect changesets
2. **On merge to main** - The release workflow:
   - Runs `changeset version` to bump versions
   - Updates CHANGELOG.md
   - Creates a "Version Packages" PR
3. **Merge the Version PR** - This triggers a tag push
4. **Tag push** - The publish workflow publishes to npm

#### Option 2: Manual Release

```bash
# From monorepo root
./scripts/release.sh [patch|minor|major]
```

This script:
- Runs all checks (tests, lint, typecheck, build)
- Creates a changeset with specified bump
- Applies version bump
- Commits and pushes to main
- Triggers the automated release workflow

## Version Tags

Tags follow the pattern: `knowledge-v{major}.{minor}.{patch}`

Examples:
- `knowledge-v0.1.0` - First release
- `knowledge-v0.1.1` - Patch
- `knowledge-v0.2.0` - Minor
- `knowledge-v1.0.0` - Major

## GitHub Actions Workflows

### CI (`.github/workflows/ci.yml`)
Runs on every push/PR:
- TypeCheck
- Lint
- Test
- Build
- Changeset check (PRs only)

### Release (`.github/workflows/release.yml`)
Two modes:

**Version Job** (on push to main):
- Checks for pending changesets
- Runs `changeset version`
- Commits version bumps
- Creates Version PR

**Publish Job** (on tag `knowledge-v*`):
- Builds package
- Publishes to npm with provenance

## Required Secrets

Add these to GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `NPM_TOKEN` | npm automation token with publish access |
| `GITHUB_TOKEN` | Auto-provided, no setup needed |

## Publishing to npm

The package is published with:
- **Provenance** (npm attestation)
- **Public access** (`--access public`)
- **Dist tarball** from `dist/` directory

## Troubleshooting

### "No changesets found"
```bash
# Check status
npx changeset status --since=main

# Create one manually
npx changeset
```

### Version PR not created
Check workflow logs for:
- Missing `GITHUB_TOKEN` permissions
- Branch protection rules blocking push

### Publish fails
- Verify `NPM_TOKEN` secret is valid
- Check package name availability
- Ensure version doesn't already exist on npm

## File Structure

```
.github/workflows/
├── ci.yml           # Continuous Integration
└── release.yml      # Release & Publish

.changeset/
├── config.json      # Changeset config
└── *.md             # Generated changesets

packages/knowledge/
├── .npmrc           # npm registry config
├── package.json     # publishConfig, repository
├── CHANGELOG.md     # Auto-generated
└── dist/            # Build output (published)
```