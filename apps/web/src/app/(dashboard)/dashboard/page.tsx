import { gql } from "graphql-request";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getClient } from "@/lib/graphql";

const STATS_QUERY = gql`
  query {
    taskStats {
      total
      todo
      inProgress
      done
      overdue
    }
  }
`;

type TaskStats = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
};

type StatCard = {
  label: string;
  value: number;
  href: string;
  accent: string;
};

export default async function DashboardPage() {
  const token = await getSession();
  if (!token) redirect("/login");

  let stats: TaskStats = {
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
  };
  try {
    const data = await getClient(token).request<{ taskStats: TaskStats }>(
      STATS_QUERY,
    );
    stats = data.taskStats;
  } catch {
    // API down or token expired
  }

  const cards: StatCard[] = [
    {
      label: "Total",
      value: stats.total,
      href: "/dashboard/tasks",
      accent: "border-zinc-300 dark:border-zinc-700",
    },
    {
      label: "To Do",
      value: stats.todo,
      href: "/dashboard/tasks",
      accent: "border-zinc-300 dark:border-zinc-700",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      href: "/dashboard/tasks",
      accent: "border-blue-400 dark:border-blue-600",
    },
    {
      label: "Done",
      value: stats.done,
      href: "/dashboard/tasks",
      accent: "border-green-400 dark:border-green-600",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      href: "/dashboard/tasks",
      accent: "border-red-400 dark:border-red-600",
    },
  ];

  const pct =
    stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Overview of your tasks</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-xl border-l-4 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-950 ${card.accent}`}
          >
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Completion progress */}
      {stats.total > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Completion
            </span>
            <span className="text-zinc-500">
              {stats.done}/{stats.total} tasks
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-2.5 rounded-full bg-green-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-zinc-400">{pct}%</p>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/dashboard/tasks"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          View all tasks
        </Link>
      </div>
    </div>
  );
}
