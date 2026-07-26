/**
 * Cost aggregation logic for the admin cost dashboard.
 * Aggregates from llm_usage_logs, fixed_costs, and (future) Stripe.
 */
import { createServiceClient } from "@crewcircle/database";

export interface LLMCostSummary {
  total_usd: number;
  by_model: { model: string; calls: number; input_tokens: number; output_tokens: number; cost_usd: number }[];
  by_app: { app: string; calls: number; cost_usd: number }[];
  daily: { date: string; cost_usd: number; calls: number }[];
}

export interface FixedCostSummary {
  total_monthly_aud: number;
  by_category: { category: string; total_aud: number; count: number }[];
}

export interface CostDashboardData {
  llm: LLMCostSummary;
  fixed: FixedCostSummary;
  fixed_items: FixedCostItem[];
  summary: {
    total_monthly_aud_estimate: number;
    llm_monthly_usd: number;
    fixed_monthly_aud: number;
  };
}

export interface FixedCostItem {
  [key: string]: unknown;
  id: string;
  name: string;
  category: string;
  amount_cents: number;
  currency: string;
  frequency: string;
  provider: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// ---- LLM Cost Aggregation ----

const DEV_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function getLLMCostSummary(days = 30): Promise<LLMCostSummary> {
  if (DEV_MODE) return emptyLLMSummary();

  const client = createServiceClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await client
    .from("llm_usage_logs")
    .select("*")
    .gte("recorded_at", since.toISOString())
    .order("recorded_at", { ascending: false });

  const rows = (data ?? []) as {
    model: string;
    app: string | null;
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
    recorded_at: string;
  }[];

  // By model
  const modelMap = new Map<string, { calls: number; input_tokens: number; output_tokens: number; cost_usd: number }>();
  const appMap = new Map<string, { calls: number; cost_usd: number }>();
  const dailyMap = new Map<string, { cost_usd: number; calls: number }>();

  let total = 0;

  for (const row of rows) {
    total += row.cost_usd ?? 0;

    // By model
    const m = modelMap.get(row.model) ?? { calls: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0 };
    m.calls++;
    m.input_tokens += row.input_tokens;
    m.output_tokens += row.output_tokens;
    m.cost_usd += row.cost_usd ?? 0;
    modelMap.set(row.model, m);

    // By app
    const app = row.app ?? "unknown";
    const a = appMap.get(app) ?? { calls: 0, cost_usd: 0 };
    a.calls++;
    a.cost_usd += row.cost_usd ?? 0;
    appMap.set(app, a);

    // Daily
    const date = row.recorded_at.slice(0, 10);
    const d = dailyMap.get(date) ?? { cost_usd: 0, calls: 0 };
    d.cost_usd += row.cost_usd ?? 0;
    d.calls++;
    dailyMap.set(date, d);
  }

  return {
    total_usd: Math.round(total * 10000) / 10000,
    by_model: Array.from(modelMap.entries())
      .map(([model, v]) => ({ model, ...v, cost_usd: Math.round(v.cost_usd * 10000) / 10000 }))
      .sort((a, b) => b.cost_usd - a.cost_usd),
    by_app: Array.from(appMap.entries())
      .map(([app, v]) => ({ app, ...v, cost_usd: Math.round(v.cost_usd * 10000) / 10000 }))
      .sort((a, b) => b.cost_usd - a.cost_usd),
    daily: Array.from(dailyMap.entries())
      .map(([date, v]) => ({ date, ...v, cost_usd: Math.round(v.cost_usd * 10000) / 10000 }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

// ---- Fixed Cost Aggregation ----

function emptyLLMSummary(): LLMCostSummary {
  return { total_usd: 0, by_model: [], by_app: [], daily: [] };
}

function emptyFixedSummary(): FixedCostSummary {
  return { total_monthly_aud: 0, by_category: [] };
}

export async function getFixedCostSummary(): Promise<FixedCostSummary> {
  if (DEV_MODE) return emptyFixedSummary();

  const client = createServiceClient();
  const { data } = await client
    .from("fixed_costs")
    .select("*")
    .eq("active", true);

  const rows = (data ?? []) as FixedCostItem[];

  const categoryMap = new Map<string, { total_aud: number; count: number }>();
  let total = 0;

  for (const row of rows) {
    const monthlyAmount =
      row.frequency === "annual"
        ? row.amount_cents / 12
        : row.amount_cents;
    total += monthlyAmount;

    const c = categoryMap.get(row.category) ?? { total_aud: 0, count: 0 };
    c.total_aud += monthlyAmount / 100;
    c.count++;
    categoryMap.set(row.category, c);
  }

  return {
    total_monthly_aud: Math.round(total / 100 * 100) / 100,
    by_category: Array.from(categoryMap.entries())
      .map(([category, v]) => ({
        category,
        total_aud: Math.round(v.total_aud * 100) / 100,
        count: v.count,
      }))
      .sort((a, b) => b.total_aud - a.total_aud),
  };
}

// ---- Dashboard Aggregation ----

export async function getCostDashboard(days = 30): Promise<CostDashboardData> {
  if (DEV_MODE) {
    return {
      llm: emptyLLMSummary(),
      fixed: emptyFixedSummary(),
      fixed_items: [],
      summary: { total_monthly_aud_estimate: 0, llm_monthly_usd: 0, fixed_monthly_aud: 0 },
    };
  }

  const [llm, fixed, { data: fixedItems }] = await Promise.all([
    getLLMCostSummary(days),
    getFixedCostSummary(),
    createServiceClient().from("fixed_costs").select("*").eq("active", true).order("category"),
  ]);

  const llmAUD = llm.total_usd * 1.55; // rough USD→AUD conversion
  const totalEstimate = fixed.total_monthly_aud + llmAUD;

  return {
    llm,
    fixed,
    fixed_items: (fixedItems ?? []) as FixedCostItem[],
    summary: {
      total_monthly_aud_estimate: Math.round(totalEstimate * 100) / 100,
      llm_monthly_usd: llm.total_usd,
      fixed_monthly_aud: fixed.total_monthly_aud,
    },
  };
}
