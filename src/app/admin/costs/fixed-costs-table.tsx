"use client";

import { DataTable } from "@crewcircle/admin-ui";
import type { DataTableColumn } from "@crewcircle/admin-ui";
import type { FixedCostItem } from "@/lib/admin/costs";

export function FixedCostsTable({ items }: { items: FixedCostItem[] }) {
  const columns: DataTableColumn<FixedCostItem>[] = [
    { key: "name" as const, header: "Name", sortable: true },
    { key: "category" as const, header: "Category", sortable: true },
    { key: "provider" as const, header: "Provider", sortable: true },
    {
      key: "amount_cents" as const,
      header: "Amount",
      sortable: true,
      render: (item: FixedCostItem) => {
        const monthly =
          item.frequency === "annual"
            ? item.amount_cents / 12
            : item.amount_cents;
        return `A$${(monthly / 100).toFixed(2)}/${item.frequency === "annual" ? "mo (annual)" : "mo"}`;
      },
    },
  ];

  return (
    <DataTable<FixedCostItem>
      columns={columns}
      rows={items}
      emptyMessage="No fixed costs recorded. Add one via the API."
    />
  );
}
