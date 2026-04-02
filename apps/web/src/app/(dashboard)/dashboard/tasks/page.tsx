import { gql } from "graphql-request";
import { getSession } from "@/lib/session";
import { getClient } from "@/lib/graphql";
import { redirect } from "next/navigation";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskItem } from "./TaskItem";

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
