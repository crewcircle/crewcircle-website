-- Provisioning job queue for async project creation/destruction.
-- Used by the admin app's provisioning wizard.
-- Jobs are created by admin users and executed on the DO droplet.

CREATE TABLE IF NOT EXISTS public.provisioning_jobs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      text NOT NULL,
    job_type        text NOT NULL CHECK (job_type IN ('provision', 'deprovision')),
    status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    created_by      uuid NOT NULL REFERENCES auth.users(id),
    started_at      timestamptz,
    completed_at    timestamptz,
    output_log      text DEFAULT '',
    error_message   text,
    config          jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.provisioning_jobs ENABLE ROW LEVEL SECURITY;

-- Admin-only table: all access via service_role in API routes.
-- Zero RLS policies = anon/authenticated cannot read/write.
-- Only service_role bypasses RLS entirely, which is intentional for admin data.

CREATE INDEX IF NOT EXISTS idx_provisioning_jobs_project_id
    ON public.provisioning_jobs (project_id);

CREATE INDEX IF NOT EXISTS idx_provisioning_jobs_status
    ON public.provisioning_jobs (status);

CREATE INDEX IF NOT EXISTS idx_provisioning_jobs_created_at
    ON public.provisioning_jobs (created_at DESC);
