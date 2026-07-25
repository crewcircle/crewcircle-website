# CrewCircle Infrastructure Migration Plan

## Goal
Standardize secrets, infrastructure, and observability across all CrewCircle apps using Doppler + Pulumi, then converge on common platform services for auth, billing, LLM, email, and database.

## Current State

| App | Auth | Database | Billing | LLM | Email/SMS | Hosting | Doppler Project |
|-----|------|----------|---------|-----|-----------|---------|-----------------|
| TaxFlowAI | Supabase Auth | Supabase Postgres | Stripe subscriptions | Anthropic (LiteLLM) | Supabase email | DigitalOcean + docker-compose | `taxflow` |
| LocalMate | Supabase Auth | Supabase Postgres | Stripe subscriptions | Claude (direct) | Resend + Twilio | DigitalOcean + docker-compose | `localmate` |
| CrewRoster | Clerk (web) + Supabase (mobile) | Neon Postgres | Stripe subscriptions | — | — | Vercel | none |
| SmartGL | Supabase Auth | Supabase Postgres + Formance/SQLite local | Not wired | Anthropic/OpenAI | — | Vercel | none |
| CardSnap | — | — | — | — | — | Vercel | none |
| AuRate | Supabase Auth | Supabase Postgres? | — | — | — | Vercel | none |

### Existing Assets
- `crewcircle-website/packages/infra/` — Pulumi master stack + per-project template with Doppler, Supabase, Stripe, Sentry, Cloudflare, GitHub.
- Doppler workspace has projects: `crewcircle-master`, `taxflow`, `localmate`.
- Cloudflare DNS managed for `crewcircle.com.au`.
- Stripe already used by TaxFlowAI, LocalMate, CrewRoster.
- Sentry only configured in LocalMate.

## Target Architecture

### 1. Secrets: Doppler for everything
- One Doppler project per app (`taxflow`, `localmate`, `crewroster`, `smartgl`, `cardsnap`, `aurate`).
- `crewcircle-master` holds shared provider tokens (Cloudflare, Supabase org, Stripe, Sentry, GitHub).
- Pulumi ESC environments (`crewcircle/<app>`) pull from Doppler and inject into CI/CD.
- Local dev uses `doppler run` so every developer gets the right secrets without `.env` drift.
- Social automation script reads from `crew-circle-social` Doppler project.

### 2. Infrastructure: Pulumi per app
- Use the existing `packages/infra/template/` to provision missing projects.
- Each app gets:
  - Supabase project (Postgres + Auth)
  - Stripe product + price
  - Doppler project with generated secrets
  - Sentry project
  - Cloudflare DNS records
  - GitHub repo (if new app)
- Master stack maintains GitHub org secrets and Sentry core team.

### 3. Common Platform Services
Longer term, converge each app on shared libraries/abstractions:

| Concern | Standard | Notes |
|---------|----------|-------|
| Auth | Supabase Auth | Migrate CrewRoster off Clerk; unify CardSnap/AuRate on Supabase |
| Billing | Stripe + shared webhook handler | Reuse LocalMate/TaxFlowAI patterns |
| LLM | LiteLLM gateway or shared `llm.py` | Route Anthropic/OpenAI through one place for cost tracking |
| Email | Resend for transactional | Replace Supabase email in TaxFlowAI |
| SMS | Twilio | Keep LocalMate pattern |
| Database | Supabase Postgres | Migrate CrewRoster from Neon; SmartGL uses Supabase as source of truth |
| Observability | Sentry + structured logs + uptime checks | Add to all apps |

## Phase-by-Phase Execution

### Phase A — Bootstrap (this week)
1. Install Pulumi CLI and authenticate.
2. Ensure `crewcircle-master` Doppler project has all provider tokens.
3. Provision Doppler projects for the four apps that lack them (`crewroster`, `smartgl`, `cardsnap`, `aurate`).
4. Add each app's existing secrets to its Doppler project.
5. Update GitHub Actions (or Vercel env) to pull from Doppler.

### Phase B — Per-App Infrastructure
For each app, run `packages/infra/bin/newproject` or an equivalent targeted migration:
1. `crewroster` — provision Supabase + Stripe + Doppler + Sentry + DNS.
2. `smartgl` — same.
3. `cardsnap` — same (can skip billing if free tool).
4. `aurate` — same (can skip billing if free tool).

### Phase C — Observability Stack
1. Add Sentry to every app backend/frontend.
2. Add structured JSON logging.
3. Add `/health` endpoints where missing.
4. Set up uptime monitoring (UptimeRobot / Pingdom / custom cron).
5. Add LLM cost tracking middleware and alerts.
6. Add Stripe event/log-based cost dashboards.

### Phase D — Common Services Convergence
1. Extract shared auth helpers.
2. Extract shared Stripe webhook handler.
3. Build LLM gateway with cost attribution.
4. Standardize Resend/Twilio notification modules.

## Immediate Next Steps
1. Verify `.env.local` has all required master tokens.
2. Install Pulumi CLI.
3. Provision the missing Doppler projects.
4. Backfill secrets for TaxFlowAI and LocalMate into their Doppler projects if not already there.

## Risks
- **Neon → Supabase migration for CrewRoster** requires data export/import and schema migration.
- **Clerk → Supabase Auth migration for CrewRoster** requires user password resets or invite flow.
- **Billing migrations** must preserve Stripe customer/subscription continuity.
- **LLM gateway** adds latency/cost; implement incrementally behind feature flag.

## Decision Needed
Should we start by provisioning the missing Doppler projects + Pulumi stacks for the four apps without Doppler, or first migrate CrewRoster's database/auth to Supabase?
