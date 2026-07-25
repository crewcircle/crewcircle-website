# @crewcircle/auth

Supabase Auth + multi-tenant organization helpers for CrewCircle apps. Provides both TypeScript (Next.js) and Python (FastAPI) helpers with a shared SQL migration for the org model.

## Structure

```
packages/auth/
├── package.json          npm package (private, TypeScript)
├── tsconfig.json
├── src/
│   ├── types.ts          Organization, Role, UserWithOrg, AuthContext
│   ├── client.ts         Next.js browser helpers (createAuthClient, signIn, etc.)
│   ├── server.ts         Next.js server helpers (createServerClient, requireAuth, requireOrg)
│   ├── hooks.ts          React hooks (useAuth, useOrg, useIsMember)
│   └── index.ts          barrel export
├── migrations/
│   └── 001_org_model.sql Supabase SQL: org, members, roles, RLS, JWT helper
└── python/
    ├── pyproject.toml
    └── crewcircle_auth/
        ├── __init__.py       FastAPI deps: require_auth, require_org
        ├── client.py         Supabase client factories (anon + service-role)
        ├── models.py         Pydantic models: Organization, Role, UserWithOrg
        └── dependencies.py   FastAPI Depends() helpers
```

## Setup

### 1. Run the SQL migration

Copy `migrations/001_org_model.sql` into your Supabase SQL Editor and run it, or use `supabase db push`. It creates:

- `public.organizations` — tenant orgs
- `public.organization_members` — user ↔ org membership
- `public.roles` — RBAC roles (owner, admin, member, viewer)
- `public.set_current_org(uuid)` — RPC to switch active org in JWT
- RLS policies for all tables

### 2. Next.js app

```bash
npm install @crewcircle/auth @supabase/supabase-js @supabase/ssr
```

Set env vars (via Doppler):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server only, never expose
```

### 3. Python / FastAPI app

```bash
cd packages/auth/python
pip install -e .
```

Set env vars:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## TypeScript Usage

### Browser (client components)

```tsx
"use client";
import { useAuth, useOrg } from "@crewcircle/auth";

export function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const { org, role } = useOrg();

  if (loading) return <Spinner />;
  if (!user) return redirect("/login");

  return (
    <div>
      <p>Welcome {user.email} — {org?.name} ({role?.name})</p>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}
```

### Server Components / Route Handlers

```tsx
import { requireAuth, requireOrg } from "@crewcircle/auth";

export default async function OrgPage({ params }: { params: { id: string } }) {
  const { org, membership } = await requireOrg(params.id);
  return <h1>{org.name}</h1>;
}
```

### Middleware (session refresh)

```ts
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([k, v]) =>
            response.headers.set(k, v)
          );
        },
      },
    }
  );
  await supabase.auth.getSession();
  return response;
}
```

## Python / FastAPI Usage

```python
from fastapi import FastAPI, Depends
from crewcircle_auth import require_auth, get_current_user, require_org

app = FastAPI()

@app.get("/me")
async def me(user=Depends(get_current_user)):
    return {"user_id": user.user_id, "org": user.org}

@app.get("/org/{org_id}")
async def org_route(org_id: str, membership=Depends(require_org)):
    return {"org_id": org_id}
```

## Switching Organizations

After a user joins an org, call the `set_current_org` RPC to update their JWT:

```ts
await client.rpc("set_current_org", { target_org_id: "org-uuid" });
// Next session refresh will include org_id in app_metadata
```

## Required Secrets (Doppler)

| Secret | Used by | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | TS client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | TS client + server | Supabase anon key (public) |
| `SUPABASE_URL` | Python | Same as above |
| `SUPABASE_ANON_KEY` | Python | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Python (admin ops) | Supabase service role key — never expose to frontend |

## Design Decisions

- **Supabase Auth only** — no Clerk, no other providers
- **JWT-based multi-tenancy** — `org_id` lives in `app_metadata`, set via `set_current_org` RPC
- **RLS-first** — all org data is protected by Row-Level Security policies
- **Idempotent SQL** — migration uses `CREATE TABLE IF NOT EXISTS`, `ON CONFLICT DO NOTHING`
- **No build tooling** — the TS package exports source directly, consumed by the app bundler
