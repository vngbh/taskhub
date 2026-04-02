import { getSession } from "@/lib/session";
import { getSdkClient } from "@/lib/graphql";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TasksTable } from "@/app/(dashboard)/dashboard/tasks/TasksTable";
import type { GetTasksQuery, TaskFilterInput } from "@/graphql/generated";
import { Priority, TaskStatus, SortBy, SortOrder } from "@/graphql/generated";

type Task = GetTasksQuery["tasks"][number];

const DEFAULT_PAGE_SIZE = 10;

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const token = await getSession();
  if (!token) redirect("/login");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const pageSize = [10, 20, 50].includes(parseInt(sp.pageSize ?? "", 10))
    ? parseInt(sp.pageSize, 10)
    : DEFAULT_PAGE_SIZE;

  const status = sp.status || undefined;
  const priority = sp.priority || undefined;
  const [rawSortBy, rawSortOrder] = (sp.sort ?? "createdAt:desc").split(":");
  const sortBy = rawSortBy || undefined;
  const sortOrder = rawSortOrder || undefined;

  const filter: TaskFilterInput = {
    ...(status && { status: status as TaskStatus }),
    ...(priority && { priority: priority as Priority }),
    ...(sortBy && { sortBy: sortBy as SortBy }),
    ...(sortOrder && { sortOrder: sortOrder as SortOrder }),
  };

  let tasks: Task[] = [];
  let total = 0;
  let userName: string | undefined;

  try {
    const sdk = getSdkClient(token);
    const hasFilter = Object.keys(filter).length > 0;
    const [tasksData, countData, meData] = await Promise.all([
      sdk.GetTasks({
        filter: hasFilter ? filter : undefined,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      sdk.GetTasksCount({
        filter: hasFilter ? filter : undefined,
      }),
      sdk.GetMe(),
    ]);
    tasks = tasksData.tasks;
    total = countData.tasksCount;
    userName = meData.me.name;
  } catch {
    // token expired or API down
  }

  return (
    <Suspense>
      <TasksTable
        tasks={tasks}
        total={total}
        page={page}
        pageSize={pageSize}
        userName={userName}
      />
    </Suspense>
  );
}
