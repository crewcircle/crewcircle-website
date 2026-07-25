/**
 * Supabase Postgres client factories for CrewCircle.
 *
 * Usage:
 *   import { createDatabaseClient } from '@crewcircle/database/client'
 *
 *   // Anonymous client (browser / SSR with user session)
 *   const anon = createDatabaseClient()
 *
 *   // Service-role client (server-only, bypasses RLS)
 *   const admin = createDatabaseClient({ serviceRole: true })
 *
 *   // Scoped client (sets org_id claim for RLS)
 *   const scoped = createDatabaseClient({ orgId: 'org_abc123' })
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DatabaseClientOptions {
  /** Use the service-role key (server only, bypasses RLS). */
  serviceRole?: boolean
  /** Set the `org_id` claim on the JWT for row-level security. */
  orgId?: string
  /** Override the Supabase URL. Defaults to SUPABASE_URL env var. */
  supabaseUrl?: string
  /** Override the key. Defaults to the anon key or service-role key. */
  supabaseKey?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function requireEnv(name: string, fallback?: string): string {
  const value = fallback ?? (typeof process !== 'undefined' ? process.env?.[name] : undefined)
  if (!value) {
    throw new Error(
      `[crewcircle/database] Missing environment variable: ${name}. ` +
        `Set it via Doppler or your .env file.`,
    )
  }
  return value
}

/**
 * Build a minimal JWT payload that carries the `org_id` claim.
 * Supabase honours custom claims set via `supabase.auth.getSession()` or
 * via RPC, but the simplest way to inject a claim for RLS is through a
 * Postgres session setting.  See `rls.ts` for the companion helper.
 *
 * This function returns headers that can be passed to Supabase client
 * constructors to inject the claim at the RPC layer.
 */
export function buildOrgHeaders(orgId: string): Record<string, string> {
  return { 'x-cc-org-id': orgId }
}

// ---------------------------------------------------------------------------
// Client factory
// ---------------------------------------------------------------------------

/**
 * Create a Supabase client pre-configured for CrewCircle multi-tenant usage.
 *
 * - Default: uses `SUPABASE_URL` + `SUPABASE_ANON_KEY` (safe for browser/SSR).
 * - `serviceRole: true`: uses `SUPABASE_SERVICE_ROLE_KEY` (server-only!).
 * - `orgId`: attaches the org_id as a custom header; pair with the
 *   `set_org_id()` Postgres function in `rls.ts` for full RLS support.
 */
export function createDatabaseClient(
  options: DatabaseClientOptions = {},
): SupabaseClient {
  const url = options.supabaseUrl ?? requireEnv('SUPABASE_URL')

  let key: string
  if (options.serviceRole) {
    key = options.supabaseKey ?? requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  } else {
    key = options.supabaseKey ?? requireEnv('SUPABASE_ANON_KEY')
  }

  const headers: Record<string, string> = options.orgId
    ? buildOrgHeaders(options.orgId)
    : {}

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers,
    },
  })
}

/**
 * Convenience: create a service-role client (server-only, bypasses RLS).
 * Shorthand for `createDatabaseClient({ serviceRole: true })`.
 */
export function createServiceClient(
  overrides: Omit<DatabaseClientOptions, 'serviceRole'> = {},
): SupabaseClient {
  return createDatabaseClient({ ...overrides, serviceRole: true })
}

/**
 * Create a client scoped to a specific organisation.
 * Sets the org_id header and uses the anon key (user-session RLS applies).
 */
export function createOrgClient(
  orgId: string,
  overrides: Omit<DatabaseClientOptions, 'orgId'> = {},
): SupabaseClient {
  return createDatabaseClient({ ...overrides, orgId })
}
