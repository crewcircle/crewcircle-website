---
type: Package Documentation
title: Database Package
description: Documentation for the database package, handling Supabase Postgres client factories, RLS helpers, and base schema.
tags: [package, database, supabase, postgres, rls, typescript, python]
---
# Database Package

The `@crewcircle/database` package (`packages/database`) provides Supabase Postgres client factories, Row-Level Security (RLS) helpers, and the base schema for multi-tenant CrewCircle applications. It supports both TypeScript (for Next.js) and Python (for FastAPI).

## Purpose

This package standardizes database access and ensures data isolation for multi-tenant applications by providing utilities for creating database clients, managing RLS policies, and defining the core database schema.

## Structure

```
packages/database/
├── package.json          ← npm package metadata (TypeScript)
├── tsconfig.json         ← TypeScript configuration
├── src/                  ← TypeScript source
│   ├── client.ts         ← Supabase client factories (createDatabaseClient, createServiceClient, createOrgClient)
│   ├── index.ts          ← Barrel export
│   ├── rls.ts            ← RLS policy generation utilities (setupTableRLS)
│   └── schema.ts         ← TypeScript type definitions for the database schema
├── migrations/           ← SQL migrations for Supabase
│   ├── 001_base_schema.sql         ← Initial base schema
│   ├── 002_app_schema_template.sql ← Application schema template
│   ├── 003_llm_usage_logs.sql      ← LLM usage logging schema
│   ├── 004_provisioning_jobs.sql   ← Provisioning jobs schema
│   └── 005_fixed_costs.sql         ← Fixed costs schema
└── python/               ← Python source
    ├── pyproject.toml    ← Python project metadata
    └── crewcircle_database/ ← Python package
        ├── __init__.py   ← Imports for Python utilities
        ├── client.py     ← Supabase client factories (create_database_client, OrgContext)
        ├── migrate.py    ← Database migration scripts
        ├── rls.py        ← Python RLS utilities (setup_table_rls)
        └── models.py (implied) ← Pydantic models for database entities
```

## Setup

### Environment Variables

Database access relies on the following environment variables, typically managed via Doppler:

*   `SUPABASE_URL`: The URL of the Supabase project.
*   `SUPABASE_ANON_KEY`: The public anonymous key for Supabase (used by browser/SSR clients).
*   `SUPABASE_SERVICE_ROLE_KEY`: The service role key for Supabase (server-only, bypasses RLS).

### Installation

*   **TypeScript / Next.js**: The package is consumed directly as TypeScript source. `npm install` from the workspace root installs dependencies.
*   **Python / FastAPI**: Install the Python package in editable mode:
    ```bash
    cd packages/database/python
    pip install -e .
    ```

## Usage

### Creating Clients

The package provides functions to create different types of Supabase clients:

*   `createDatabaseClient()`: Anonymous client, subject to user-session RLS.
*   `createServiceClient()`: Service-role client (server only), which bypasses RLS.
*   `createOrgClient('org_abc123')`: Client scoped to a specific organization.

### Row-Level Security (RLS)

RLS is crucial for multi-tenancy, isolating data by `org_id`. Each request must set the `org_id`.

*   **TypeScript**: Use `supabase.rpc('set_org_id', { p_org_id: '...' })` to set the organization ID before querying.
*   **Python**: Use the `OrgContext` context manager with `psycopg` to automatically set the `org_id` for database operations within the context.

### Generating RLS Policies

For new tables with an `org_id` column, the `setupTableRLS` (TypeScript) and `setup_table_rls` (Python) utilities can generate the necessary `ALTER TABLE` and `CREATE POLICY` statements.

### Database Types

TypeScript applications can import `Database` types from `@crewcircle/database/schema` to get strong typing for Supabase client queries.
