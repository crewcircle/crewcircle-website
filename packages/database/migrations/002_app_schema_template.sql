-- =============================================================================
-- CrewCircle app schema template
-- Creates a per-app schema and applies RLS isolation for all org schemas.
--
-- Usage:
--   1. Replace <app_id> with your app identifier (e.g. 'crewroster', 'crewpay')
--   2. Run this migration to create: app_<app_id> schema
--   3. Add your app-specific tables inside that schema
--   4. Apply org isolation to app tables using app.create_org_isolation_policy()
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Create app-specific schema
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_namespace WHERE nspname = 'app_<app_id>'
  ) THEN
    CREATE SCHEMA app_<app_id>;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Grant usage to authenticated and service_role
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA app_<app_id> TO authenticated;
GRANT USAGE ON SCHEMA app_<app_id> TO service_role;

-- Default privileges: tables created in this schema are readable by authenticated
ALTER DEFAULT PRIVILEGES IN SCHEMA app_<app_id>
  GRANT SELECT ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA app_<app_id>
  GRANT ALL ON TABLES TO service_role;

-- ---------------------------------------------------------------------------
-- 3. Template: apply org isolation to any table in app_<app_id>
--
-- After creating a table, run:
--   SELECT app.create_org_isolation_policy('your_table_name');
--
-- Or apply to multiple tables:
--   SELECT app.create_org_isolation_policy('table1');
--   SELECT app.create_org_isolation_policy('table2');
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 4. Example app tables (uncomment and customise as needed)
-- ---------------------------------------------------------------------------
--
-- CREATE TABLE app_<app_id>.projects (
--   id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
--   name       text NOT NULL,
--   config     jsonb NOT NULL DEFAULT '{}'::jsonb,
--   created_at timestamptz NOT NULL DEFAULT now(),
--   updated_at timestamptz NOT NULL DEFAULT now()
-- );
--
-- ALTER TABLE app_<app_id>.projects ENABLE ROW LEVEL SECURITY;
-- SELECT app.create_org_isolation_policy('projects');
-- CREATE INDEX IF NOT EXISTS idx_projects_org_id ON app_<app_id>.projects(org_id);
