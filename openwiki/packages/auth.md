---
type: Package Documentation
title: Authentication Package
description: Documentation for the auth package, providing Supabase Auth and multi-tenant organization helpers.
tags: [package, auth, supabase, multi-tenancy, rls, typescript, python, fastapi]
---
# Authentication Package

The `@crewcircle/auth` package (`packages/auth`) provides authentication services and multi-tenant organization helpers for CrewCircle applications. It integrates with Supabase Auth and offers both TypeScript (for Next.js) and Python (for FastAPI) helpers, along with a shared SQL migration for the organization model.

## Purpose

This package centralizes authentication logic, user and organization management, and role-based access control (RBAC) across CrewCircle applications. It simplifies the implementation of secure, multi-tenant features.

## Structure

```
packages/auth/
├── package.json          ← npm package metadata (TypeScript)
├── tsconfig.json         ← TypeScript configuration
├── src/                  ← TypeScript source for Next.js helpers
│   ├── types.ts          ← TypeScript type definitions (Organization, Role, UserWithOrg, AuthContext)
│   ├── client.ts         ← Next.js browser helpers (createAuthClient, signIn, etc.)
│   ├── server.ts         ← Next.js server helpers (createServerClient, requireAuth, requireOrg)
│   ├── hooks.ts          ← React hooks (useAuth, useOrg, useIsMember)
│   └── index.ts          ← Barrel export for TypeScript modules
├── migrations/           ← SQL migrations for Supabase
│   └── 001_auth_helpers.sql ← Supabase SQL: org, members, roles, RLS, JWT helper
└── python/               ← Python source for FastAPI helpers
    ├── pyproject.toml    ← Python project metadata
    └── crewcircle_auth/  ← Python package
        ├── __init__.py   ← FastAPI dependencies: require_auth, require_org
        ├── client.py     ← Supabase client factories (anon + service-role)
        ├── models.py     ← Pydantic models: Organization, Role, UserWithOrg
        └── dependencies.py ← FastAPI Depends() helpers
```

## Setup

### 1. Run the SQL Migration

Apply `migrations/001_auth_helpers.sql` to your Supabase project. This script creates:

*   `public.organizations` table: Stores tenant organizations.
*   `public.organization_members` table: Manages user membership within organizations.
*   `public.roles` table: Defines RBAC roles (owner, admin, member, viewer).
*   `public.set_current_org(uuid)` RPC function: Allows switching the active organization within a user's JWT.
*   Row-Level Security (RLS) policies for all relevant tables.

### 2. Environment Variables

Configure the following environment variables, typically via Doppler:

*   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (for client-side/SSR).
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase public anonymous key (for client-side/SSR).
*   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-only, bypasses RLS). **Never expose this on the client-side.**

### 3. Installation

*   **Next.js (TypeScript)**:
    ```bash
    npm install @crewcircle/auth @supabase/supabase-js @supabase/ssr
    ```
*   **FastAPI (Python)**:
    ```bash
    cd packages/auth/python
    pip install -e .
    ```

## Usage

### TypeScript (Next.js)

The package provides React hooks and server-side helpers for seamless integration with Next.js applications:

*   **Client Components**: Use `useAuth()` and `useOrg()` hooks to access user and organization context in browser components.
*   **Server Components/Route Handlers**: Use `requireAuth()` and `requireOrg()` for server-side authentication and authorization checks.

### Python (FastAPI)

FastAPI applications can use `require_auth` and `require_org` dependencies to enforce authentication and organization context for API endpoints.
