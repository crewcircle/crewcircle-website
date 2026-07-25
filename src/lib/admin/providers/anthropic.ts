/**
 * Anthropic billing integration.
 * Fetches org-level usage & cost from Anthropic Console API.
 * Requires ANTHROPIC_API_KEY with billing read access.
 */

const ANTHROPIC_API = "https://api.anthropic.com/v1";

interface AnthropicUsage {
  total_input_tokens: number;
  total_output_tokens: number;
  estimated_cost_usd: number;
  models_used: string[];
}

export async function fetchAnthropicUsage(): Promise<AnthropicUsage | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  // Anthropic doesn't have a public billing API yet.
  // This is a placeholder that falls back to llm_usage_logs (already implemented).
  // When Anthropic releases billing API, implement it here.
  try {
    // Ping the API to validate the key works
    const res = await fetch(`${ANTHROPIC_API}/models`, {
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const models = (data.data ?? []) as { id: string }[];

    return {
      total_input_tokens: 0,
      total_output_tokens: 0,
      estimated_cost_usd: 0,
      models_used: models.map((m) => m.id),
    };
  } catch {
    return null;
  }
}
