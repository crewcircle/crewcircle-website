import type { StatCardProps } from "./types";

export function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
        {Icon && <Icon className="h-4 w-4" />}
        {title}
      </div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      {description && (
        <div className="mt-1 text-sm text-gray-400">{description}</div>
      )}
    </div>
  );
}
