import { getOrgMemory } from "@crewcircle/knowledge";
import { Search, FileText, Database, Zap, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface KnowledgeStats {
  standards: number;
  decisions: number;
  projects: number;
  retrospectives: number;
  technologies: number;
  adrs: number;
}

async function getKnowledgeStats(): Promise<KnowledgeStats> {
  try {
    const memory = await getOrgMemory({ provider: "mock" });

    const [standards, decisions, projects, retros, techs, adrs] = await Promise.all([
      memory.searchStandards("").then(r => r.chunks.length),
      memory.searchDecisions("").then(r => r.chunks.length),
      memory.searchProjects("").then(r => r.chunks.length),
      memory.searchRetrospectives("").then(r => r.chunks.length),
      memory.searchProjects("").then(r => r.chunks.length),
      memory.searchADRs("").then(r => r.chunks.length),
    ]);

    return { standards, decisions, projects, retrospectives: retros, technologies: techs, adrs };
  } catch (error) {
    console.error("Failed to get knowledge stats:", error);
    return { standards: 0, decisions: 0, projects: 0, retrospectives: 0, technologies: 0, adrs: 0 };
  }
}

export default async function KnowledgePage() {
  const stats = await getKnowledgeStats();

  const statItems = [
    { title: "Standards", value: stats.standards, icon: FileText, description: "Code standards & guidelines" },
    { title: "Decisions", value: stats.decisions, icon: Zap, description: "Architectural decisions" },
    { title: "Projects", value: stats.projects, icon: Database, description: "Active & archived projects" },
    { title: "Retrospectives", value: stats.retrospectives, icon: TrendingUp, description: "Sprint retrospectives" },
    { title: "Technologies", value: stats.technologies, icon: Zap, description: "Approved tech stack" },
    { title: "ADRs", value: stats.adrs, icon: FileText, description: "Architecture Decision Records" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Knowledge Base</h2>
        <p className="mt-1 text-sm text-gray-500">
          CrewCircle organizational memory — standards, decisions, projects, and institutional knowledge.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statItems.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">{item.title}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Knowledge</h3>
        <div className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search standards, decisions, projects..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              id="knowledge-search"
            />
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            disabled
          >
            Search
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Search across all internal knowledge: standards, decisions, ADRs, retrospectives, and projects.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Add new coding standard</p>
            <p>Record architectural decision</p>
            <p>Create project retrospective</p>
            <p>Update technology catalog</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h4 className="font-medium text-gray-900 mb-2">Providers</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Mock Provider (Development)
            </p>
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gray-400" />
              Embedded Provider (Cognee Local)
            </p>
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gray-400" />
              Postgres Provider (Production)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}