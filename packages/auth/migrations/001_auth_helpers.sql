-- 001_auth_helpers.sql
-- Auth-specific helpers that build on top of the shared org model.
-- Run this *after* packages/database/migrations/001_base_schema.sql.
-- Idempotent: safe to run multiple times.

-- ─── Roles (RBAC metadata) ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb
);

COMMENT ON TABLE public.roles IS 'RBAC role metadata scoped to organizations';

INSERT INTO public.roles (name, permissions) VALUES
  ('owner',  '["*"]'::jsonb),
  ('admin',  '["org:manage", "members:manage", "billing:manage"]'::jsonb),
  ('member', '["org:view", "members:view"]'::jsonb),
  ('viewer', '["org:view"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ─── Updated-at trigger ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.organizations;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ─── Helper: set org claim on JWT ───────────────────────────────────────────

-- Call this RPC after org switch to update the user's JWT app_metadata.org_id.
CREATE OR REPLACE FUNCTION public.set_current_org(target_org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_member boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE org_id = target_org_id
      AND user_id = auth.uid()
  ) INTO is_member;

  IF NOT is_member THEN
    RAISE EXCEPTION 'User is not a member of organization %', target_org_id;
  END IF;

  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('org_id', target_org_id)
  WHERE id = auth.uid();
END;
$$;

COMMENT ON FUNCTION public.set_current_org(uuid) IS
  'Sets the active org_id in the user JWT. User must be a member of the org.';

-- ─── Row-Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roles_select_auth" ON public.roles;
CREATE POLICY "roles_select_auth"
  ON public.roles FOR SELECT
  USING (auth.uid() IS NOT NULL);
