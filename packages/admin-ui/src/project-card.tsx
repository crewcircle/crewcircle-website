import { StatusBadge } from "./status-badge";
import type { Project } from "./types";

interface ProjectCardProps {
  project: Project;
  href: string;
}

function formatAud(cents: number): string {
  return `A$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ProjectCard({ project, href }: ProjectCardProps) {
  return (
    <a
      href={href}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {project.name}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {project.id} · {formatAud(project.price_cents)}/mo
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>
      {project.description && (
        <p className="mt-3 line-clamp-2 text-xs text-gray-500">
          {project.description}
        </p>
      )}
      <p className="mt-3 text-xs text-gray-400">
        Created {formatDate(project.created_at)}
      </p>
    </a>
  );
}
