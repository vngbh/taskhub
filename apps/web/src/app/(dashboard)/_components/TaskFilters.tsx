"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "To Do", value: "TODO" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
];

const PRIORITY_OPTIONS = [
  { label: "All priorities", value: "" },
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
];

const SORT_OPTIONS = [
  { label: "Newest first", value: "createdAt:desc" },
  { label: "Oldest first", value: "createdAt:asc" },
  { label: "Deadline ↑", value: "deadline:asc" },
  { label: "Deadline ↓", value: "deadline:desc" },
  { label: "Priority ↑", value: "priority:asc" },
  { label: "Priority ↓", value: "priority:desc" },
  { label: "Title A–Z", value: "title:asc" },
  { label: "Title Z–A", value: "title:desc" },
];

const selectCls =
  "h-8 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50";

export function TaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete("page"); // reset to page 1 on filter change
      router.replace(`${pathname}?${next.toString()}`);
    },
    [router, pathname, params],
  );

  const sort = params.get("sort") ?? "createdAt:desc";
  const status = params.get("status") ?? "";
  const priority = params.get("priority") ?? "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className={selectCls}
        value={status}
        onChange={(e) => update("status", e.target.value)}
        aria-label="Filter by status"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className={selectCls}
        value={priority}
        onChange={(e) => update("priority", e.target.value)}
        aria-label="Filter by priority"
      >
        {PRIORITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className={selectCls}
        value={sort}
        onChange={(e) => update("sort", e.target.value)}
        aria-label="Sort tasks"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
