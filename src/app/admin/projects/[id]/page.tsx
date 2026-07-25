import { notFound } from "next/navigation";
import { StatusBadge } from "@crewcircle/admin-ui";
import { readRegistry } from "@/lib/admin/registry";
import { getRepo } from "@/lib/admin/github";
import { ExternalLink, Github, BarChart3 } from "lucide-react";
import { DestroyProjectButton } from "./destroy-button";

export const dynamic = "force-dynamic";

interface ProjectDetailProps {
  params: Promise<{ id: string }>;
}

function formatAud(cents: number): string {
  return `A$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailProps) {
  const { id } = await params;
  const registry = readRegistry();
  const project = registry.projects.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  const github = await getRepo(project.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {project.name}
            </h2>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">{project.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {github && (
            <a
              href={github.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          )}
          <a
            href={`https://backstage.crewcircle.com.au/catalog/default/component/${project.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <BarChart3 className="h-4 w-4" />
            Backstage
          </a>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Overview card */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Overview</h3>
          <p className="mt-2 text-sm text-gray-700">
            {project.description || "No description provided."}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-400">Price</dt>
              <dd className="font-medium text-gray-900">
                {formatAud(project.price_cents)}/mo
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Created</dt>
              <dd className="font-medium text-gray-900">
                {formatDate(project.created_at)}
              </dd>
            </div>
            {project.killed_at && (
              <div>
                <dt className="text-gray-400">Killed</dt>
                <dd className="font-medium text-red-600">
                  {formatDate(project.killed_at)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* GitHub card */}
        {github && (
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-medium text-gray-500">GitHub</h3>
            <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-400">Stars</dt>
                <dd className="font-medium text-gray-900">★ {github.stars}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Open Issues</dt>
                <dd className="font-medium text-gray-900">
                  {github.open_issues}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Default Branch</dt>
                <dd className="font-medium text-gray-900">
                  {github.default_branch}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Language</dt>
                <dd className="font-medium text-gray-900">{github.language}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Last Push</dt>
                <dd className="font-medium text-gray-900">
                  {formatDate(github.last_push)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Visibility</dt>
                <dd className="font-medium text-gray-900">
                  {github.private ? "Private" : "Public"}
                  {github.archived ? " (Archived)" : ""}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Links section */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-medium text-gray-500">Quick Links</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <QuickLink
            label="Supabase"
            href={`https://supabase.com/dashboard/project/${project.id}`}
          />
          <QuickLink
            label="Vercel"
            href={`https://vercel.com/crewcircle/${project.id}`}
          />
          <QuickLink
            label="Doppler"
            href={`https://dashboard.doppler.com/workplace/crewcircle-master/projects/${project.id}`}
          />
        </div>
      </div>

      {/* Danger zone */}
      {project.status !== "killed" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Danger Zone
              </h3>
              <p className="mt-1 text-sm text-red-600">
                Destroying a project will delete its Pulumi stack, Supabase
                project, ESC environment, and archive its GitHub repo. This
                cannot be undone.
              </p>
            </div>
            <DestroyProjectButton
              projectId={project.id}
              projectName={project.name}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function QuickLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
    >
      {label}
      <ExternalLink className="h-3 w-3 text-gray-400" />
    </a>
  );
}
