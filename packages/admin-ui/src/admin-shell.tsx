import { type ReactNode } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  DollarSign,
  Activity,
} from "lucide-react";
import { AdminTopbar } from "./admin-topbar";

const NAV_ITEMS = [
  { href: "/admin", label: "Projects", icon: LayoutDashboard },
  { href: "/admin/projects/new", label: "Provision", icon: PlusCircle },
  { href: "/admin/costs", label: "Costs", icon: DollarSign },
  { href: "/admin/observability", label: "Observability", icon: Activity },
] as const;

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const orgName = process.env.CREWCIRCLE_ORG_NAME ?? "CrewCircle Admin";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col bg-gray-900 text-gray-200">
        <div className="border-b border-gray-700 px-4 py-4">
          <h1 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            {orgName}
          </h1>
        </div>
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-gray-700 px-4 py-3">
          <p className="text-xs text-gray-500">CrewCircle Internal</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col bg-gray-50">
        <AdminTopbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
