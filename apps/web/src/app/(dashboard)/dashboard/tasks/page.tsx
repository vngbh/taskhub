import { getSession } from "@/lib/session";
import { getSdkClient } from "@/lib/graphql";
import { redirect } from "next/navigation";
import { CreateTaskDialog } from "@/app/(dashboard)/dashboard/tasks/CreateTaskDialog";
import { TaskItem } from "@/app/(dashboard)/dashboard/tasks/TaskItem";
import type { GetTasksQuery } from "@/graphql/generated";

type Task = GetTasksQuery["tasks"][number];

export default async function TasksPage() {
  const token = await getSession();
  if (!token) redirect("/login");

  let tasks: Task[] = [];
  try {
    const data = await getSdkClient(token).GetTasks();
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
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{tasks.length} tasks</span>
          <CreateTaskDialog />
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="text-zinc-500">
          No tasks yet. Create one to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
}
