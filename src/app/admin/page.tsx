import { StatCard } from "@crewcircle/admin-ui";
import { readRegistry } from "@/lib/admin/registry";
import { getRepo } from "@/lib/admin/github";
import { LayoutDashboard, TrendingUp, DollarSign } from "lucide-react";
import { ProjectsTable } from "./projects-table";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const registry = readRegistry();
  const projects = registry.projects;

  // Enrich with GitHub metadata (best-effort)
  const enriched = await Promise.all(
    projects.map(async (p) => {
      const github = await getRepo(p.id);
      return { ...p, github };
    })
  );

  const activeCount = projects.filter((p) => p.status === "active").length;
  const totalMmr = projects
    .filter((p) => p.status === "active")
    .reduce((sum, p) => sum + p.price_cents, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
        <p className="mt-1 text-sm text-gray-500">
          Overview of all CrewCircle projects and their status.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Projects"
          value={projects.length}
          icon={LayoutDashboard}
        />
        <StatCard
          title="Active Projects"
          value={activeCount}
          description={`${projects.length - activeCount} killed`}
          icon={TrendingUp}
        />
        <StatCard
          title="Total MRR"
          value={`A$${(totalMmr / 100).toFixed(2)}`}
          description="Active projects only"
          icon={DollarSign}
        />
      </div>

      {/* Project table — client wrapper handles DataTable render functions */}
      <ProjectsTable projects={enriched} />
    </div>
  );
}
