"use client";

import { useTransition } from "react";
import { deleteTask, updateTaskStatus } from "@/app/actions/tasks";

type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: string;
  createdAt: string;
};

const STATUS_SEQUENCE = ["TODO", "IN_PROGRESS", "DONE"] as const;
type TaskStatus = (typeof STATUS_SEQUENCE)[number];

const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  DONE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-zinc-400",
  MEDIUM: "text-yellow-500",
  HIGH: "text-red-500",
};

export function TaskItem({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();

  const currentIdx = STATUS_SEQUENCE.indexOf(task.status as TaskStatus);
  const nextStatus =
    STATUS_SEQUENCE[
      (currentIdx === -1 ? 1 : currentIdx + 1) % STATUS_SEQUENCE.length
    ];

  function handleStatusCycle() {
    startTransition(() => updateTaskStatus(task.id, nextStatus));
  }

  function handleDelete() {
    if (!confirm(`Delete "${task.title}"?`)) return;
    startTransition(() => deleteTask(task.id));
  }

  return (
    <li
      className={`rounded-xl border border-zinc-200 bg-white p-4 transition-opacity dark:border-zinc-800 dark:bg-zinc-950 ${isPending ? "opacity-40" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p
            className={`font-medium text-zinc-900 dark:text-zinc-50 ${task.status === "DONE" ? "line-through opacity-50" : ""}`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 text-sm text-zinc-500">{task.description}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`text-xs font-medium ${PRIORITY_COLORS[task.priority] ?? ""}`}
          >
            {task.priority}
          </span>

          <button
            onClick={handleStatusCycle}
            disabled={isPending}
            title={`Advance to ${STATUS_LABELS[nextStatus]}`}
            className={`rounded-full px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-70 disabled:cursor-not-allowed ${STATUS_COLORS[task.status] ?? ""}`}
          >
            {STATUS_LABELS[task.status] ?? task.status}
          </button>

          <button
            onClick={handleDelete}
            disabled={isPending}
            title="Delete task"
            className="text-zinc-400 transition-colors hover:text-red-500 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>

      {task.deadline && (
        <p className="mt-2 text-xs text-zinc-400">
          Due {new Date(task.deadline).toLocaleDateString()}
        </p>
      )}
    </li>
  );
}
