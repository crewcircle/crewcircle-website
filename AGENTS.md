<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:admin-app-instructions -->
# Internal Admin App

The CrewCircle internal admin dashboard lives under `src/app/admin/` on the
`crewcircle-website` Next.js site. It manages projects, costs, observability, and
provisioning for the entire org.

## Architecture overview

| Layer | Location | Purpose |
|-------|----------|---------|
| UI components | `packages/admin-ui/` | Shared React components: AdminShell, DataTable, StatCard, StatusBadge, CostChart, TrendChart |
| Pages | `src/app/admin/` | Route group at /admin: dashboard, costs, observability, project detail, provisioning wizard |
| API routes | `src/app/api/admin/` | REST endpoints: projects, costs, observability, provision/deprovision |
| Lib | `src/lib/admin/` | Auth, registry reader, GitHub enrichment, cost aggregation, CI scaffolding, Sentry/uptime/DO/Vercel provider modules |
| Migrations | `packages/database/migrations/` | 003 (llm_usage_logs), 004 (provisioning_jobs), 005 (fixed_costs) |

## Key design decisions

1. **Admin code lives in a route group** (`src/app/admin/`), not a separate app.
   Accessible at `crewcircle.com.au/admin`.
2. **Auth**: `@crewcircle/auth` (Supabase GoTrue). `requireAdmin()` in
   `src/lib/admin/auth.ts` handles auth gating. `ADMIN_AUTH_BYPASS=true` env var
   enables dev preview without real auth. Middleware in `src/middleware.ts` has
   a commented-out cookie check for early redirect — re-enable for production.
3. **Provisioning must run on a DO droplet**, not Vercel — `spawn()` runs in
   background and Vercel may reclaim the runtime after HTTP response.
4. **Registry**: `packages/infra/registry.json` (gitignored) managed by Python
   `shared/registry.py`, read by TypeScript `src/lib/admin/registry.ts`.
5. **Admin DB tables**: RLS enabled with zero policies — only `service_role` can
   access via API routes. Anon/authenticated are blocked.
6. **Server→Client boundary**: Server components CANNOT pass functions to client
   components. When a server page needs render functions or event handlers in
   DataTable, create a thin `"use client"` wrapper component (see
   `src/app/admin/projects-table.tsx` and `fixed-costs-table.tsx` as examples).

## Development

```bash
npm run dev        # starts Next.js 16 with Turbopack on port 3000
```

**Required env vars** (`.env.local`, gitignored):
```
CREWCIRCLE_ORG_SLUG=crewcircle
CREWCIRCLE_ORG_NAME=CrewCircle
ADMIN_AUTH_BYPASS=true              # skip auth for local dev
NEXT_PUBLIC_SUPABASE_URL=<url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
SUPABASE_URL=<url>
SUPABASE_SERVICE_ROLE_KEY=<key>
GITHUB_TOKEN=<token>               # for repo enrichment (stars, forks)
```

**Testing locally:**
```bash
curl localhost:3000/admin                    # project dashboard
curl localhost:3000/admin/costs              # cost dashboard
curl localhost:3000/admin/observability      # observability hub
curl localhost:3000/api/admin/projects       # projects JSON
curl localhost:3000/api/admin/costs          # costs JSON
curl localhost:3000/api/admin/health         # health check
```

## Gotchas

- **Server components can't pass functions to client components.** If you see
  `Error: Functions cannot be passed directly to Client Components`, extract the
  DataTable rendering into a `"use client"` wrapper that takes serializable props.
- **`createServerClient()` is async** — always `await` it. The returned
  `SupabaseClient` uses `client.auth.getUser()`, not `client.getUser()`.
- **`requireAdmin()` throws `Response` objects** (status 401/403), not `Error`.
  API route catch blocks must handle `e instanceof Response`.
- **`DEV_MODE` in `auth.ts`** checks `ADMIN_AUTH_BYPASS`; **`DEV_MODE` in
  `costs.ts`** checks `!NEXT_PUBLIC_SUPABASE_URL` (different check — costs should
  use real data when Supabase is configured regardless of auth bypass).
- **`packages/infra/registry.json` is gitignored** — create it locally to populate
  project data. Format: `{"projects": [{id, name, description, price_cents,
  status, created_at}]}`.
- **Cost page rendering time**: `getCostDashboard()` queries Supabase. If
  Supabase is unreachable, it can block for 7+ seconds. In dev with no Supabase,
  remove `NEXT_PUBLIC_SUPABASE_URL` from `.env.local` so `DEV_MODE` in costs.ts
  returns empty data fast.

## Where to continue building

- **Real GitHub enrichment**: Wire a real `GITHUB_TOKEN` for stars/forks
  display on project cards and detail pages.
- **Production auth**: Remove `ADMIN_AUTH_BYPASS`, uncomment the middleware
  cookie check, configure real Supabase GoTrue credentials.
- **DO droplet deployment for provision routes**: The provision/deprovision API
  routes need to deploy on a DO droplet per the C2 architecture decision.
- **Run migrations on production Supabase**: The three migration files need to
  be applied to the real Supabase instance.
- **Provider integrations**: `src/lib/admin/providers/` has stubs for
  DigitalOcean (balance), Vercel (usage), and Anthropic. Wire real API keys.
- **Sentry**: `src/lib/admin/sentry.ts` needs a real SENTRY_AUTH_TOKEN to pull
  org-level error data.
- **Stripe billing**: No Stripe integration exists yet — project pricing is
  read from registry.json only.
- **Notifications**: No alerting/notification hooks for provisioning failures
  or cost threshold breaches.
<!-- END:admin-app-instructions -->
