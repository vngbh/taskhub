import { getSession } from "@/lib/session";
import { getSdkClient } from "@/lib/graphql";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CreateTaskDialog } from "@/app/(dashboard)/dashboard/tasks/CreateTaskDialog";
import { TaskItem } from "@/app/(dashboard)/dashboard/tasks/TaskItem";
import { TaskFilters } from "@/app/(dashboard)/dashboard/tasks/TaskFilters";
import { TaskPagination } from "@/app/(dashboard)/dashboard/tasks/TaskPagination";
import type { GetTasksQuery } from "@/graphql/generated";

type Task = GetTasksQuery["tasks"][number];

const PAGE_SIZE = 10;

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const token = await getSession();
  if (!token) redirect("/login");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const status = sp.status || undefined;
  const priority = sp.priority || undefined;
  const [rawSortBy, rawSortOrder] = (sp.sort ?? "createdAt:desc").split(":");
  const sortBy = rawSortBy || undefined;
  const sortOrder = rawSortOrder || undefined;

  const filter = {
    ...(status && { status }),
    ...(priority && { priority }),
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
  };

  let tasks: Task[] = [];
  let total = 0;

  try {
    const sdk = getSdkClient(token);
    const [tasksData, countData] = await Promise.all([
      sdk.GetTasks({
        filter: Object.keys(filter).length ? filter : undefined,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      sdk.GetTasksCount({
        filter: Object.keys(filter).length ? filter : undefined,
      }),
    ]);
    tasks = tasksData.tasks;
    total = countData.tasksCount;
  } catch {
    // token expired or API down
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Tasks</h1>
        <CreateTaskDialog />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Suspense>
          <TaskFilters />
        </Suspense>
        <span className="text-sm text-muted-foreground">{total} tasks</span>
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted-foreground">No tasks match your filters.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}

      <Suspense>
        <TaskPagination total={total} page={page} />
      </Suspense>
    </div>
  );
}
