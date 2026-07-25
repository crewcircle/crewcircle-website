"use client";

import { useEffect, useState } from "react";
import {
  StatCard,
  CostChart,
  TrendChart,
  DataTable,
  StatusBadge,
} from "@crewcircle/admin-ui";
import {
  Activity,
  AlertTriangle,
  Cpu,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

interface SentryData {
  total_unresolved: number;
  total_24h: number;
  total_7d: number;
  by_project: { project_slug: string; project_name: string; unresolved_count: number; total_24h: number; total_7d: number }[];
  recent_issues: { id: string; title: string; project: string; level: string; count: number; first_seen: string; last_seen: string; permalink: string }[];
}

interface LLMTrendData {
  total_usd: number;
  daily: { date: string; cost_usd: number; calls: number }[];
  by_model: { model: string; cost_usd: number }[];
}

interface UptimeData {
  results: { url: string; label: string; status: "up" | "down" | "unknown"; response_time_ms: number | null; status_code: number | null; error: string | null; checked_at: string }[];
}

export default function ObservabilityPage() {
  const [sentry, setSentry] = useState<SentryData | null>(null);
  const [llm, setLLM] = useState<LLMTrendData | null>(null);
  const [uptime, setUptime] = useState<UptimeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const [sentryRes, llmRes, uptimeRes] = await Promise.all([
        fetch("/api/admin/observability/sentry"),
        fetch("/api/admin/observability/llm?days=30"),
        fetch("/api/admin/observability/uptime"),
      ]);

      if (sentryRes.ok) setSentry(await sentryRes.json());
      if (llmRes.ok) setLLM(await llmRes.json());
      if (uptimeRes.ok) setUptime(await uptimeRes.json());
      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Observability
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Errors, LLM usage trends, and uptime across CrewCircle services.
        </p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Unresolved Errors"
          value={sentry?.total_unresolved ?? "—"}
          icon={AlertTriangle}
        />
        <StatCard
          title="Errors (24h)"
          value={sentry?.total_24h ?? "—"}
          description="Across all projects"
          icon={Activity}
        />
        <StatCard
          title="LLM Cost (30d)"
          value={`$${(llm?.total_usd ?? 0).toFixed(2)}`}
          icon={Cpu}
        />
        <StatCard
          title="Services Up"
          value={
            uptime
              ? `${uptime.results.filter((r) => r.status === "up").length}/${uptime.results.length}`
              : "—"
          }
          icon={CheckCircle2}
        />
      </div>

      {/* Sentry section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Per-project errors */}
        {sentry && sentry.by_project.length > 0 && (
          <CostChart
            title="Unresolved Errors by Project"
            data={sentry.by_project.map((p) => ({
              label: p.project_name,
              value: p.unresolved_count,
            }))}
            type="bar"
          />
        )}

        {/* LLM model costs */}
        {llm && llm.by_model.length > 0 && (
          <CostChart
            title="LLM Cost by Model (30d USD)"
            data={llm.by_model.map((m) => ({
              label: m.model,
              value: m.cost_usd,
            }))}
            type="pie"
          />
        )}
      </div>

      {/* LLM trend */}
      {llm && llm.daily.length > 1 && (
        <TrendChart
          title="Daily LLM Spend"
          data={llm.daily.map((d) => ({ date: d.date, value: d.cost_usd }))}
          height={80}
          color="#8b5cf6"
        />
      )}

      {/* Uptime section */}
      {uptime && uptime.results.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Uptime</h3>
          <div className="mt-3 space-y-2">
            {uptime.results.map((r) => (
              <div
                key={r.url}
                className="flex items-center gap-3 rounded-md border border-gray-100 bg-gray-50 px-4 py-3"
              >
                {r.status === "up" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {r.label}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">{r.url}</span>
                </div>
                {r.response_time_ms != null && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {r.response_time_ms}ms
                  </span>
                )}
                {r.status_code && (
                  <span className="text-xs text-gray-400">
                    {r.status_code}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sentry issues */}
      {sentry && sentry.recent_issues.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Recent Sentry Issues
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Issue
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Project
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Level
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Events
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Last Seen
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    View
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sentry.recent_issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">
                      {issue.title}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {issue.project}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          issue.level === "error"
                            ? "inline-flex rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
                            : "inline-flex rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700"
                        }
                      >
                        {issue.level}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {issue.count}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-400">
                      {new Date(issue.last_seen).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <a
                        href={issue.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty states */}
      {!sentry?.recent_issues.length &&
        !llm?.daily.length &&
        !uptime?.results.length && (
          <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
            <Activity className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              No observability data available.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Configure SENTRY_TOKEN and UPTIME_URL_* env vars to enable.
            </p>
          </div>
        )}
    </div>
  );
}
