import { gql } from "graphql-request";
import { getSession } from "@/lib/session";
import { getClient } from "@/lib/graphql";
import { redirect } from "next/navigation";

const TASKS_QUERY = gql`
  query {
    tasks {
      id
      title
      description
      status
      priority
      deadline
      createdAt
    }
  }
`;

type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: string;
  createdAt: string;
};

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

export default async function TasksPage() {
  const token = await getSession();
  if (!token) redirect("/login");

  let tasks: Task[] = [];
  try {
    const data = await getClient(token).request<{ tasks: Task[] }>(TASKS_QUERY);
    tasks = data.tasks;
  } catch {
    // token expired or API down — clear session handled by middleware
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          My Tasks
        </h1>
        <span className="text-sm text-zinc-500">{tasks.length} tasks</span>
      </div>

      {tasks.length === 0 ? (
        <p className="text-zinc-500">No tasks yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="mt-1 text-sm text-zinc-500">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`text-xs font-medium ${PRIORITY_COLORS[task.priority] ?? ""}`}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[task.status] ?? ""}`}
                  >
                    {STATUS_LABELS[task.status] ?? task.status}
                  </span>
                </div>
              </div>
              {task.deadline && (
                <p className="mt-2 text-xs text-zinc-400">
                  Due {new Date(task.deadline).toLocaleDateString()}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
