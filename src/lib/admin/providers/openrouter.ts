/**
 * OpenRouter billing integration.
 * Shared org-wide key (see packages/infra/esc/master.yaml) — one OPENROUTER_API_KEY
 * used across all CrewCircle apps. Requires OPENROUTER_API_KEY with usage read access.
 */

const OPENROUTER_API = "https://openrouter.ai/api/v1";

interface OpenRouterUsage {
  usage_usd: number;
  limit_usd: number | null;
  limit_remaining_usd: number | null;
  is_free_tier: boolean;
}

export async function fetchOpenRouterUsage(): Promise<OpenRouterUsage | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(`${OPENROUTER_API}/auth/key`, {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    if (!res.ok) return null;

    const { data } = await res.json();

    return {
      usage_usd: data.usage ?? 0,
      limit_usd: data.limit ?? null,
      limit_remaining_usd: data.limit_remaining ?? null,
      is_free_tier: Boolean(data.is_free_tier),
    };
  } catch {
    return null;
  }
}
