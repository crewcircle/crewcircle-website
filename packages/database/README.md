# @crewcircle/database

Supabase Postgres client factories, RLS helpers, and base schema for multi-tenant CrewCircle apps.

## Setup

### TypeScript / Next.js

The package is consumed directly as TypeScript source — no build step needed:

```bash
# From workspace root
npm install
```

```ts
import { createDatabaseClient, createServiceClient } from '@crewcircle/database/client'
import type { Database, Organization } from '@crewcircle/database/schema'
```

### Python / FastAPI

```bash
cd packages/database/python
pip install -e .
```

```python
from crewcircle_database import create_database_client, OrgContext
```

## Environment Variables

All secrets come from Doppler or `.env` — never hardcoded.

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Public anon key (browser/SSR) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service-role key (bypasses RLS) |

## Usage

### Create Clients

```ts
// Anonymous (user-session RLS applies)
const db = createDatabaseClient()

// Service-role (server only, bypasses RLS)
const admin = createServiceClient()

// Scoped to an org
const orgDb = createOrgClient('org_abc123')
```

### RLS: Set org_id

Row-level security isolates data by `org_id`. Each request must set it:

```ts
// Via Supabase RPC (recommended)
await supabase.rpc('set_org_id', { p_org_id: 'org_abc123' })

// Then query — RLS filters automatically
const { data } = await supabase.from('organizations').select('*')
```

```python
# Via psycopg context manager
with OrgContext(conn, "org_abc123"):
    cur = conn.execute("SELECT * FROM organizations")
```

### RLS: Generate Policies

For new tables with an `org_id` column:

```ts
import { setupTableRLS } from '@crewcircle/database/rls'

const sql = setupTableRLS('my_new_table')
// Returns: ALTER TABLE + CREATE POLICY (idempotent)
```

```python
from crewcircle_database import setup_table_rls

sql = setup_table_rls("my_new_table")
```

### Database Types

```ts
import type { Database } from '@crewcircle/database/schema'

const supabase = createClient<Database>(url, key)
const { data } = await supabase.from('organizations').select('*')
// data is typed as Organization[]
```

## RLS Architecture

```
Request arrives → set_org_id('org_abc') → SET LOCAL request.org_id
                                                    ↓
                              app.current_org_id() reads the setting
                                                    ↓
                              RLS policies: org_id = app.current_org_id()
                                                    ↓
                              PostgREST adds WHERE clause automatically
```

**Flow:**
1. Auth middleware calls `set_org_id` RPC with the user's org
2. Postgres stores it in the session via `SET LOCAL`
3. `app.current_org_id()` returns it for RLS `USING` clauses
4. PostgREST/Supabase auto-filters rows by org

**Key points:**
- Service-role clients bypass RLS entirely (use for admin operations)
- Anonymous/anon clients have RLS enforced — users only see their org's data
- The `audit_log` table requires explicit `org_id` on inserts

## Migrations

### Run Base Schema

```sql
-- Connect to your Supabase Postgres and run:
\i packages/database/migrations/001_base_schema.sql
```

This creates:
- `app.current_org_id()` helper function
- `public.set_org_id()` / `public.clear_org_id()` RPC functions
- `public.organizations`, `public.organization_members`, `public.subscriptions`, `public.audit_log` tables
- RLS policies on all tables
- `app.create_org_isolation_policy()` template function

### Create App Schema

1. Copy `002_app_schema_template.sql`
2. Replace `<app_id>` with your app identifier
3. Run against your database

### Python Migration Runner

```python
from crewcircle_database.migrate import run_migrations
import psycopg

conn = psycopg.connect("postgresql://...")
applied = run_migrations(conn, "packages/database/migrations")
```

### Idempotency

All migrations are safe to re-run:
- `CREATE TABLE IF NOT EXISTS`
- `CREATE OR REPLACE FUNCTION`
- `DO $$ ... END $$` blocks check for existing policies
- Indexes use `CREATE INDEX IF NOT EXISTS`

## Table Schema

| Table | Description | Key Columns |
|---|---|---|
| `organizations` | Tenant org | `id`, `name`, `slug`, `owner_id`, `stripe_customer_id`, `settings` |
| `organization_members` | User-org membership | `org_id`, `user_id`, `role` (owner/admin/member/viewer) |
| `subscriptions` | Stripe subscriptions | `org_id`, `stripe_subscription_id`, `status`, `price_id` |
| `audit_log` | Activity tracking | `org_id`, `user_id`, `action`, `entity`, `entity_id`, `metadata` |
