-- =============================================================================
-- CrewCircle base schema — idempotent migration
-- Run against: public schema
-- Safe to re-run (CREATE IF NOT EXISTS / CREATE OR REPLACE)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Ensure app schema exists
-- ---------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS app;

-- ---------------------------------------------------------------------------
-- Helper: current org_id from Postgres session setting
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION app.current_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('request.org_id', true)::uuid;
$$;

COMMENT ON FUNCTION app.current_org_id() IS
  'Returns the org_id set via SET LOCAL request.org_id = ... (used by RLS policies)';

-- ---------------------------------------------------------------------------
-- Helper: set_org_id RPC (called from Supabase client)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_org_id(p_org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('request.org_id', p_org_id::text, true);
END;
$$;

COMMENT ON FUNCTION public.set_org_id(uuid) IS
  'Sets the org_id session claim for RLS. Call via supabase.rpc("set_org_id", { p_org_id })';

-- ---------------------------------------------------------------------------
-- Helper: clear_org_id RPC
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.clear_org_id()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('request.org_id', '', true);
END;
$$;

-- ---------------------------------------------------------------------------
-- Table: public.organizations
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.organizations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text NOT NULL UNIQUE,
  owner_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_customer_id text,
  settings      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org_isolation_organizations' AND tablename = 'organizations'
  ) THEN
    CREATE POLICY org_isolation_organizations ON public.organizations
      FOR ALL
      USING (org_id = app.current_org_id());
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Table: public.organization_members
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.organization_members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org_isolation_organization_members' AND tablename = 'organization_members'
  ) THEN
    CREATE POLICY org_isolation_organization_members ON public.organization_members
      FOR ALL
      USING (org_id = app.current_org_id());
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Table: public.subscriptions
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                 uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL,
  status                 text NOT NULL CHECK (status IN (
    'active', 'canceled', 'incomplete', 'incomplete_expired',
    'past_due', 'trialing', 'unpaid', 'paused'
  )),
  product_id             text,
  price_id               text,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org_isolation_subscriptions' AND tablename = 'subscriptions'
  ) THEN
    CREATE POLICY org_isolation_subscriptions ON public.subscriptions
      FOR ALL
      USING (org_id = app.current_org_id());
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Table: public.audit_log
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.audit_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action     text NOT NULL,
  entity     text NOT NULL,
  entity_id  uuid,
  metadata   jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org_isolation_audit_log' AND tablename = 'audit_log'
  ) THEN
    CREATE POLICY org_isolation_audit_log ON public.audit_log
      FOR ALL
      USING (org_id = app.current_org_id());
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Template RLS policy for any table with org_id column
-- Usage: SELECT app.create_org_isolation_policy('my_table_name');
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION app.create_org_isolation_policy(p_table_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  policy_name text := 'org_isolation_' || p_table_name;
BEGIN
  EXECUTE format(
    'DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = %L AND tablename = %L) THEN '
    'CREATE POLICY %I ON public.%I FOR ALL USING (org_id = app.current_org_id()); '
    'END IF; END $$;',
    policy_name, p_table_name, policy_name, p_table_name
  );
END;
$$;

COMMENT ON FUNCTION app.create_org_isolation_policy(text) IS
  'Creates an RLS policy that isolates rows by org_id. Pass the table name (without schema).';

-- ---------------------------------------------------------------------------
-- Indexes for common queries
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON public.subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_org_id ON public.audit_log(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
