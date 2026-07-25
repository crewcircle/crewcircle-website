import { StatCard, CostChart, TrendChart } from "@crewcircle/admin-ui";
import { getCostDashboard } from "@/lib/admin/costs";
import { DollarSign, Cpu, Building2, Receipt } from "lucide-react";
import { FixedCostsTable } from "./fixed-costs-table";

export const dynamic = "force-dynamic";

export default async function CostDashboardPage() {
  const data = await getCostDashboard(30);

  const llmModelBars = data.llm.by_model.map((m) => ({
    label: m.model,
    value: m.cost_usd,
  }));

  const categoryBars = data.fixed.by_category.map((c) => ({
    label: c.category,
    value: c.total_aud,
  }));

  const trendData = data.llm.daily.map((d) => ({
    date: d.date,
    value: d.cost_usd,
  }));

  const providerBars = data.fixed_items
    .filter((f) => f.provider)
    .reduce(
      (acc, f) => {
        const existing = acc.find((a) => a.label === f.provider);
        const monthly =
          f.frequency === "annual" ? f.amount_cents / 12 : f.amount_cents;
        if (existing) {
          existing.value += monthly / 100;
        } else {
          acc.push({ label: f.provider!, value: monthly / 100 });
        }
        return acc;
      },
      [] as { label: string; value: number }[]
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Cost Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Infrastructure, LLM, and fixed costs across all CrewCircle projects.
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Estimate"
          value={`A$${data.summary.total_monthly_aud_estimate.toFixed(0)}`}
          description="LLM (USD→AUD) + Fixed costs"
          icon={DollarSign}
        />
        <StatCard
          title="LLM Cost (30d)"
          value={`$${data.llm.total_usd.toFixed(2)}`}
          description={`${data.llm.by_model.length} models, ${data.llm.daily.length} days`}
          icon={Cpu}
        />
        <StatCard
          title="Fixed Costs"
          value={`A$${data.fixed.total_monthly_aud.toFixed(0)}`}
          description={`${data.fixed_items.length} items across ${data.fixed.by_category.length} categories`}
          icon={Building2}
        />
        <StatCard
          title="Categories"
          value={data.fixed.by_category.length}
          description="Infrastructure, SaaS, Personnel, Other"
          icon={Receipt}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CostChart
          title="LLM Cost by Model (USD)"
          data={llmModelBars}
          type="pie"
        />
        <CostChart
          title="Fixed Costs by Category (AUD/mo)"
          data={categoryBars}
          type="bar"
        />
      </div>

      {/* Trend */}
      <TrendChart
        title="Daily LLM Cost (USD)"
        data={trendData}
        height={100}
      />

      {/* Provider costs */}
      {providerBars.length > 0 && (
        <CostChart
          title="Costs by Provider (AUD/mo estimated)"
          data={providerBars}
          type="bar"
        />
      )}

      {/* Fixed costs table — client wrapper handles DataTable render functions */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Fixed Costs
        </h3>
        <FixedCostsTable items={data.fixed_items} />
      </div>
    </div>
  );
}
