# Changesets Workflow

This project uses [Changesets](https://github.com/changesets/changesets) for version management and changelog generation.

## Quick Start

```bash
# Install changesets globally (one-time)
npm install -g @changesets/cli

# Or use npx
npx changeset
```

## Creating a Changeset

When you make changes that should be released:

```bash
# From the monorepo root
npx changeset
```

This will prompt you:
1. **Select packages** - Choose `@crewcircle/knowledge` (or other packages)
2. **Select semver bump** - `patch` (bugfix), `minor` (feature), `major` (breaking)
3. **Write summary** - Brief description for the changelog

A markdown file will be created in `.changeset/` with a random name like `tidy-cats-play.md`.

## Versioning & Publishing

### Automated (via GitHub Actions)

1. Merge changes to `main`
2. GitHub Action detects changesets
3. Creates a "Version Packages" PR with version bumps + changelog
4. Merge the Version PR
5. GitHub Action publishes to npm on tag push

### Manual (if needed)

```bash
# Version packages (updates package.json, creates CHANGELOG.md)
npx changeset version

# Build packages
npm run build --workspace=@crewcircle/knowledge

# Publish to npm (requires NPM_TOKEN)
npx changeset publish
```

## Semver Guidelines

| Change Type | Bump | Example |
|-------------|------|---------|
| Bug fix | `patch` | Fix embedding dimension mismatch |
| New feature | `minor` | Add new provider type |
| Breaking change | `major` | Remove deprecated API |

## Release Tags

Tags follow the format: `knowledge-v{version}` (e.g., `knowledge-v1.2.3`)

This allows independent versioning if we add more packages later.

## GitHub Actions

Two workflows handle the pipeline:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `.github/workflows/ci.yml` | PR/push | Lint, typecheck, test, build |
| `.github/workflows/release.yml` | Changeset merged / tag pushed | Version + publish to npm |

## Adding a New Package

1. Add package to `packages/`
2. Add to `publishConfig` in package.json
3. Update `.changeset/config.json` if needed
4. Run `npx changeset` to create initial changeset