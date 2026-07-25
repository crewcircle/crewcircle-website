"use client";

import { useRouter } from "next/navigation";
import { DataTable, StatusBadge } from "@crewcircle/admin-ui";

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  price_cents: number;
  created_at: string;
  github?: { stars: number } | null;
}

export function ProjectsTable({ projects }: { projects: ProjectRow[] }) {
  const router = useRouter();

  const columns = [
    { key: "name", header: "Project", sortable: true },
    { key: "id", header: "ID", sortable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item: ProjectRow) => (
        <StatusBadge status={item.status as "active" | "killed"} />
      ),
    },
    {
      key: "price_cents",
      header: "Price",
      sortable: true,
      render: (item: ProjectRow) =>
        `A$${(item.price_cents / 100).toFixed(2)}/mo`,
    },
    {
      key: "stars",
      header: "GitHub",
      sortable: true,
      render: (item: ProjectRow) =>
        item.github ? `★ ${item.github.stars}` : "—",
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      render: (item: ProjectRow) =>
        new Date(item.created_at).toLocaleDateString("en-AU", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={projects}
      emptyMessage="No projects registered yet. Provision one to get started."
      onRowClick={(item) => router.push(`/admin/projects/${item.id}`)}
    />
  );
}
