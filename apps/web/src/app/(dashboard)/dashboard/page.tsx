import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSdkClient } from "@/lib/graphql";
import {
  Priority,
  TaskStatus,
  type GetTaskStatsQuery,
} from "@/graphql/generated";
import { TaskStatusChart } from "@/components/custom/TaskStatusChart";

type TaskStats = GetTaskStatsQuery["taskStats"];

export default async function DashboardPage() {
  const token = await getSession();
  if (!token) redirect("/login");
  const sdk = getSdkClient(token);

  let stats: TaskStats = {
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
  };

  let inProgressByPriority = { low: 0, medium: 0, high: 0 };
  let todoByPriority = { low: 0, medium: 0, high: 0 };
  let doneByPriority = { low: 0, medium: 0, high: 0 };

  try {
    const [
      statsData,
      inProgressLow,
      inProgressMedium,
      inProgressHigh,
      todoLow,
      todoMedium,
      todoHigh,
      doneLow,
      doneMedium,
      doneHigh,
    ] = await Promise.all([
      sdk.GetTaskStats(),
      sdk.GetTasksCount({
        filter: { status: TaskStatus.InProgress, priority: Priority.Low },
      }),
      sdk.GetTasksCount({
        filter: { status: TaskStatus.InProgress, priority: Priority.Medium },
      }),
      sdk.GetTasksCount({
        filter: { status: TaskStatus.InProgress, priority: Priority.High },
      }),
      sdk.GetTasksCount({
        filter: { status: TaskStatus.Todo, priority: Priority.Low },
      }),
      sdk.GetTasksCount({
        filter: { status: TaskStatus.Todo, priority: Priority.Medium },
      }),
      sdk.GetTasksCount({
        filter: { status: TaskStatus.Todo, priority: Priority.High },
      }),
      sdk.GetTasksCount({
        filter: { status: TaskStatus.Done, priority: Priority.Low },
      }),
      sdk.GetTasksCount({
        filter: { status: TaskStatus.Done, priority: Priority.Medium },
      }),
      sdk.GetTasksCount({
        filter: { status: TaskStatus.Done, priority: Priority.High },
      }),
    ]);

    stats = statsData.taskStats;
    inProgressByPriority = {
      low: inProgressLow.tasksCount,
      medium: inProgressMedium.tasksCount,
      high: inProgressHigh.tasksCount,
    };
    todoByPriority = {
      low: todoLow.tasksCount,
      medium: todoMedium.tasksCount,
      high: todoHigh.tasksCount,
    };
    doneByPriority = {
      low: doneLow.tasksCount,
      medium: doneMedium.tasksCount,
      high: doneHigh.tasksCount,
    };
  } catch {
    // API down or token expired
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your tasks
        </p>
      </div>

      <TaskStatusChart
        stats={stats}
        inProgressByPriority={inProgressByPriority}
        todoByPriority={todoByPriority}
        doneByPriority={doneByPriority}
      />
    </div>
  );
}
