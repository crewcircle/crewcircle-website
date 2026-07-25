/**
 * Row-Level Security helpers for CrewCircle multi-tenant Postgres.
 *
 * These functions generate SQL snippets you can run as part of migrations or
 * at connection time to set the `org_id` claim that RLS policies reference.
 *
 * Usage (TypeScript):
 *   import { setOrgId, createOrgRLSPolicy } from '@crewcircle/database/rls'
 *
 *   // Set org_id for the current session (run via RPC or direct query)
 *   await supabase.rpc('set_org_id', { p_org_id: 'org_abc123' })
 *
 *   // Generate an RLS policy for a table
 *   const policy = createOrgRLSPolicy('organizations')
 */

// ---------------------------------------------------------------------------
// SQL generators
// ---------------------------------------------------------------------------

/**
 * Generate the SQL to set `request.org_id()` for the current transaction.
 *
 * Supabase's PostgREST honours session settings via `SET LOCAL`. This helper
 * returns SQL that should be executed at the start of each request.
 */
export function setOrgIdSQL(orgId: string): string {
  // Escape single quotes to prevent injection
  const safe = orgId.replace(/'/g, "''")
  return `SET LOCAL request.org_id = '${safe}';`
}

/**
 * Build an RLS policy that restricts rows to the current org.
 *
 * Generates a USING expression compatible with the `app.current_org_id()`
 * helper function defined in `migrations/001_base_schema.sql`.
 *
 * @param tableName  - The table the policy applies to
 * @param operation  - Policy type: 'ALL' | 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
 * @returns SQL statement: CREATE POLICY ...
 */
export function createOrgRLSPolicy(
  tableName: string,
  operation: 'ALL' | 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' = 'ALL',
): string {
  const policyName = `org_isolation_${tableName}`
  const usings = operation === 'INSERT'
    ? `WITH CHECK (org_id = app.current_org_id())`
    : `USING (org_id = app.current_org_id())`

  return [
    `DO $$ BEGIN`,
    `  IF NOT EXISTS (`,
    `    SELECT 1 FROM pg_policies WHERE policyname = '${policyName}' AND tablename = '${tableName}'`,
    `  ) THEN`,
    `    CREATE POLICY ${policyName} ON public.${tableName}`,
    `      ${operation === 'ALL' ? 'FOR ALL' : `FOR ${operation}`}`,
    `      ${usings};`,
    `  END IF;`,
    `END $$;`,
  ].join('\n')
}

/**
 * Build SQL to enable RLS on a table (idempotent).
 */
export function enableRLSCheck(tableName: string): string {
  return `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`
}

export function setupTableRLS(tableName: string): string {
  return [
    enableRLSCheck(tableName),
    createOrgRLSPolicy(tableName, 'ALL'),
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Helpers for use in Supabase RPC / middleware
// ---------------------------------------------------------------------------

/**
 * Supabase RPC arguments to set org_id on the server side.
 * Call via: `supabase.rpc('set_org_id', { p_org_id: orgId })`
 *
 * The corresponding Postgres function is in migrations/001_base_schema.sql.
 */
export const SET_ORG_ID_RPC = 'set_org_id' as const

/**
 * Supabase RPC call to clear org_id (for cleanup / auth state changes).
 */
export const CLEAR_ORG_ID_RPC = 'clear_org_id' as const
