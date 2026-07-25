"use client";

export function AdminTopbar() {
  return (
    <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Admin</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
          A
        </div>
      </div>
    </div>
  );
}
