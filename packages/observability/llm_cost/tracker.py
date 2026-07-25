import os
import logging

logger = logging.getLogger(__name__)

MODEL_COSTS = {
    "claude-sonnet-4-20250514": {"input": 3.0, "output": 15.0, "currency": "USD"},
    "claude-haiku-3-5-20241022": {"input": 0.8, "output": 4.0, "currency": "USD"},
    "gpt-4o": {"input": 5.0, "output": 15.0, "currency": "USD"},
    "gpt-4o-mini": {"input": 0.15, "output": 0.6, "currency": "USD"},
}


def cost_usd(model, input_tokens, output_tokens):
    rates = MODEL_COSTS.get(model)
    if not rates:
        return None
    input_cost = (input_tokens / 1_000_000) * rates["input"]
    output_cost = (output_tokens / 1_000_000) * rates["output"]
    return round(input_cost + output_cost, 6)


class LLMCostTracker:
    def __init__(self):
        self._records = []

    def record(self, model, input_tokens, output_tokens, app=None, feature=None):
        cost = cost_usd(model, input_tokens, output_tokens)
        self._records.append(
            {
                "model": model,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "cost_usd": cost,
                "app": app,
                "feature": feature,
            }
        )
        return cost

    def summary(self):
        total = sum(r["cost_usd"] or 0 for r in self._records)
        by_model = {}
        for r in self._records:
            by_model.setdefault(r["model"], {"calls": 0, "cost_usd": 0})
            by_model[r["model"]]["calls"] += 1
            by_model[r["model"]]["cost_usd"] += r["cost_usd"] or 0
        return {"total_cost_usd": round(total, 6), "by_model": by_model}

    def persist_to_supabase(self, supabase_client=None):
        """Persist all in-memory records to the llm_usage_logs table.

        Args:
            supabase_client: Optional Supabase client. If not provided,
                attempts to create one from SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
                environment variables.

        Returns:
            int: Number of records persisted, or -1 on failure.
        """
        if not self._records:
            return 0

        client = supabase_client
        if client is None:
            try:
                from supabase import create_client

                url = os.environ.get("SUPABASE_URL")
                key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
                if not url or not key:
                    logger.warning(
                        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — "
                        "cannot persist LLM cost records"
                    )
                    return -1
                client = create_client(url, key)
            except ImportError:
                logger.warning(
                    "supabase-py not installed — cannot persist LLM cost records"
                )
                return -1

        try:
            rows = [
                {
                    "app": r.get("app"),
                    "feature": r.get("feature"),
                    "model": r["model"],
                    "input_tokens": r["input_tokens"],
                    "output_tokens": r["output_tokens"],
                    "cost_usd": r["cost_usd"],
                }
                for r in self._records
            ]
            result = client.table("llm_usage_logs").insert(rows).execute()
            count = len(result.data) if result.data else 0
            self._records.clear()
            return count
        except Exception as e:
            logger.error("Failed to persist LLM cost records: %s", e)
            return -1

    def reset(self):
        self._records.clear()


def track_cost(model=None, feature=None):
    def decorator(func):
        def wrapper(*args, **kwargs):
            tracker = kwargs.get("cost_tracker") or LLMCostTracker()
            result = func(*args, **kwargs)
            if isinstance(result, dict) and "usage" in result:
                usage = result["usage"]
                tracker.record(
                    model=model or result.get("model", "unknown"),
                    input_tokens=usage.get("input_tokens", 0),
                    output_tokens=usage.get("output_tokens", 0),
                    feature=feature,
                )
            return result

        return wrapper

    return decorator


if __name__ == "__main__":
    tracker = LLMCostTracker()
    tracker.record("claude-haiku-3-5-20241022", 1500, 400, app="taxflow-ai", feature="categorise")
    tracker.record("claude-sonnet-4-20250514", 3000, 800, app="taxflow-ai", feature="generate-report")
    tracker.record("gpt-4o-mini", 500, 200, app="smartGL", feature="embeddings")

    print("=== LLM Cost Summary ===")
    summary = tracker.summary()
    print(f"Total cost: ${summary['total_cost_usd']:.6f} USD")
    for model, stats in summary["by_model"].items():
        print(f"  {model}: {stats['calls']} calls, ${stats['cost_usd']:.6f}")

    count = tracker.persist_to_supabase()
    if count >= 0:
        print(f"\nPersisted {count} records to Supabase.")
    else:
        print("\nCould not persist to Supabase (check SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).")
