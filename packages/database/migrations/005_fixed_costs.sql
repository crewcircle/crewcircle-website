-- Fixed cost tracking for CrewCircle admin cost dashboard.
-- Records infrastructure, SaaS, personnel, and other recurring costs.

CREATE TABLE IF NOT EXISTS public.fixed_costs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            text NOT NULL,
    category        text NOT NULL DEFAULT 'infrastructure'
                    CHECK (category IN ('infrastructure', 'saas', 'personnel', 'other')),
    amount_cents    integer NOT NULL,
    currency        text NOT NULL DEFAULT 'AUD',
    frequency       text NOT NULL DEFAULT 'monthly'
                    CHECK (frequency IN ('monthly', 'annual', 'one_time')),
    provider        text,
    notes           text,
    active          boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_fixed_costs_category ON public.fixed_costs (category);
CREATE INDEX IF NOT EXISTS idx_fixed_costs_active ON public.fixed_costs (active);
CREATE INDEX IF NOT EXISTS idx_fixed_costs_provider ON public.fixed_costs (provider);
