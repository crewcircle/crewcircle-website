/**
 * Vercel usage & cost integration.
 * Requires VERCEL_TOKEN + VERCEL_TEAM_ID env vars.
 */

const VERCEL_API = "https://api.vercel.com";

interface VercelUsage {
  total_bandwidth_gb: number;
  total_build_minutes: number;
  total_serverless_execution_gb_hrs: number;
  estimated_cost_usd: number;
}

export async function fetchVercelUsage(): Promise<VercelUsage | null> {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token || !teamId) return null;

  try {
    const res = await fetch(
      `${VERCEL_API}/v1/teams/${teamId}/usage?from=${getStartOfMonth().toISOString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();

    return {
      total_bandwidth_gb: data.bandwidth?.total ?? 0,
      total_build_minutes: data.builds?.total_minutes ?? 0,
      total_serverless_execution_gb_hrs:
        data.serverless_function_execution?.total_gb_hrs ?? 0,
      estimated_cost_usd: estimateVercelCost(data),
    };
  } catch {
    return null;
  }
}

function getStartOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function estimateVercelCost(data: Record<string, unknown>): number {
  // Rough estimates based on Vercel Pro pricing
  const bandwidth = ((data.bandwidth as Record<string, number>)?.total ?? 0) * 0.10; // $0.10/GB overage
  const buildMinutes =
    ((data.builds as Record<string, number>)?.total_minutes ?? 0) * 0.005; // $0.005/min overage
  return Math.round((bandwidth + buildMinutes + 20) * 100) / 100; // + $20 Pro plan
}
