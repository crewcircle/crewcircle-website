---
type: Package Documentation
title: Infrastructure Package
description: Documentation for the infra package, managing CrewCircle's cloud infrastructure with Pulumi.
tags: [package, infrastructure, pulumi, iac, esc, doppler, github, sentry, cloudflare]
---
# Infrastructure Package

The `@crewcircle/infra` package (`packages/infra`) manages CrewCircle's cloud infrastructure using Pulumi (Python) with Pulumi ESC for secrets management.

## Architecture

This package defines and manages infrastructure resources through two main Pulumi stacks:

1.  **Master Stack**: Manages organization-level resources that are shared across all projects. This stack is typically deployed once.
2.  **Per-Project Stack**: Manages resources specific to individual projects, deployed whenever a new project is provisioned.

### Directory Structure

```
packages/infra/
├── __main__.py              ← Master stack entry point (org-level resources)
├── Pulumi.yaml              ← Project definition for the master stack
├── Pulumi.master.yaml       ← Master stack configuration (ESC binding)
├── esc/                     ← Pulumi ESC environment definitions
│   ├── master.yaml          ← ESC environment for the master stack (imports Doppler)
│   └── project.yaml         ← ESC environment template for per-project stacks
├── shared/                  ← Shared Python modules for infrastructure logic
│   ├── config.py            ← Dotenv loader + Config dataclass
│   └── registry.py          ← Manages `registry.json` for project lifecycle
├── bin/                     ← Helper scripts for managing projects
│   ├── newproject           ← Script to create a new project stack, ESC environment, and deploy
│   └── killproject          ← Script to destroy a project stack and its ESC environment
├── template/                ← Template for new project stacks
│   ├── Pulumi.yaml          ← Template project definition
│   ├── __main__.py          ← Template stack entry point (per-project resources)
│   └── requirements.txt     ← Template Python dependencies
├── src/crewcircle_infra/    ← Python source for infrastructure utilities
├── requirements.txt         ← Master Python dependencies
└── pyproject.toml
```

### Two Stacks

| Stack             | Entry Point       | Purpose                                                    |
| :---------------- | :---------------- | :--------------------------------------------------------- |
| **Master**        | `__main__.py`     | Configures GitHub organization secrets, Sentry team (run once) |
| **Per-Project**   | `template/__main__.py` | Provisions Supabase, Stripe, GitHub repo, Cloudflare DNS, Doppler, Sentry project for each new project |

### ESC Environment Import Chain

Pulumi ESC is used for secrets management, with a clear import hierarchy:

<!-- openwiki: mermaid parse failed and this diagram was converted to a text fence so it does not break rendering. Fix the diagram source and restore the mermaid fence. Parser error: Heuristic: an unescaped angle bracket inside a label breaks rendering; rephrase the label. -->
```text
graph TD
    A[Doppler crewcircle-master/prod] --> B[crewcircle/master];
    B -- imports Doppler, maps to pulumiConfig --> C[crewcircle/<project-id>];
    C -- imports master, adds per-project config --> D[Pulumi Stack]
```

This chain ensures that sensitive credentials are sourced from Doppler and securely provided to the Pulumi stacks.

## Deployment Tasks

### Deploy Master Stack

This task is performed during initial setup or after updates to master stack resources.

```bash
cd packages/infra

# Install master Python dependencies
pip install -r requirements.txt

# Create / select master stack
pulumi stack init master 2>/dev/null || pulumi stack select master

# Bind ESC environment
pulumi config env add crewcircle/master --yes

# Preview and Deploy
pulumi preview
pulumi up --yes
```

**What it creates:**

*   GitHub Actions Secrets: `DOPPLER_TOKEN`, `SUPABASE_ACCESS_TOKEN`, `SENTRY_AUTH_TOKEN`, `CLOUDFLARE_API_TOKEN`
*   GitHub Actions Variable: `ESC_ENV=crewcircle/master`
*   Sentry team: `core`

**Prerequisites:**

*   Doppler project `crewcircle-master/prod` with all secrets populated.
*   ESC environment `crewcircle/master` created and configured to point at the Doppler project.
*   `pulumi` CLI installed and logged in.
*   Pulumi access token available via `PULUMI_ACCESS_TOKEN` environment variable.

### Provision a New Project

New projects are provisioned using the `newproject` helper script:

```bash
cd packages/infra
./bin/newproject <project-id> "<Name>" "<Description>" [price-cents]
```

This script automates the creation of a dedicated Pulumi stack and ESC environment for the new project, along with deploying its associated resources.
