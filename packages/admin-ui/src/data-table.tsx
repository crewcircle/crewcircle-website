"use client";

import { useState, useCallback } from "react";
import type { DataTableProps, DataTableColumn } from "./types";

type SortDirection = "asc" | "desc" | null;

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  emptyMessage = "No data",
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const handleSort = useCallback(
    (col: DataTableColumn<T>) => {
      if (!col.sortable) return;
      if (sortKey === col.key) {
        const next: SortDirection =
          sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc";
        setSortDir(next);
        if (next === null) setSortKey(null);
      } else {
        setSortKey(col.key);
        setSortDir("asc");
      }
    },
    [sortKey, sortDir]
  );

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp =
          typeof aVal === "string" && typeof bVal === "string"
            ? aVal.localeCompare(bVal)
            : String(aVal).localeCompare(String(bVal));
        return sortDir === "desc" ? -cmp : cmp;
      })
    : rows;

  const renderSortIndicator = (col: DataTableColumn<T>) => {
    if (!col.sortable) return null;
    const active = sortKey === col.key;
    return (
      <span className="ml-1 text-gray-300">
        {active && sortDir === "asc" ? "▲" : active && sortDir === "desc" ? "▼" : "⇅"}
      </span>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col)}
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${
                  col.sortable ? "cursor-pointer select-none hover:text-gray-700" : ""
                }`}
              >
                {col.header}
                {renderSortIndicator(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={`${
                  onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
                } transition-colors`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                    {col.render
                      ? col.render(row)
                      : (row[col.key] as React.ReactNode) ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
