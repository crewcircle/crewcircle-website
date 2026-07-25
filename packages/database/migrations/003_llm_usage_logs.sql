-- Persisted LLM usage logs for cost tracking and observability.
-- Written to by apps using LLMCostTracker.persist_to_supabase().

CREATE TABLE IF NOT EXISTS public.llm_usage_logs (
    id              BIGSERIAL PRIMARY KEY,
    app             TEXT,
    feature         TEXT,
    model           TEXT NOT NULL,
    input_tokens    INTEGER NOT NULL DEFAULT 0,
    output_tokens   INTEGER NOT NULL DEFAULT 0,
    cost_usd        NUMERIC(10,6),
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dashboard queries: cost by date range, by app, by model
CREATE INDEX IF NOT EXISTS idx_llm_usage_logs_recorded_at
    ON public.llm_usage_logs (recorded_at);

CREATE INDEX IF NOT EXISTS idx_llm_usage_logs_app
    ON public.llm_usage_logs (app);

CREATE INDEX IF NOT EXISTS idx_llm_usage_logs_model
    ON public.llm_usage_logs (model);
