"use client";

import type { ChartConfig } from "@/components/ui/chart";
import { TASK_PRIORITY_VISUAL, TASK_STATUS_VISUAL } from "@/lib/task-visuals";
import type { GetTaskStatsQuery } from "@/graphql/generated";
import {
  TaskDonutCard,
  type DonutSlice,
} from "@/components/custom/TaskDonutCard";

type TaskStats = GetTaskStatsQuery["taskStats"];

type PriorityBreakdown = {
  low: number;
  medium: number;
  high: number;
};

const chartConfig = {
  todo: {
    label: TASK_STATUS_VISUAL.TODO.label,
    color: TASK_STATUS_VISUAL.TODO.color,
  },
  inProgress: {
    label: TASK_STATUS_VISUAL.IN_PROGRESS.label,
    color: TASK_STATUS_VISUAL.IN_PROGRESS.color,
  },
  done: {
    label: TASK_STATUS_VISUAL.DONE.label,
    color: TASK_STATUS_VISUAL.DONE.color,
  },
  low: {
    label: TASK_PRIORITY_VISUAL.LOW.label,
    color: TASK_PRIORITY_VISUAL.LOW.color,
  },
  medium: {
    label: TASK_PRIORITY_VISUAL.MEDIUM.label,
    color: TASK_PRIORITY_VISUAL.MEDIUM.color,
  },
  high: {
    label: TASK_PRIORITY_VISUAL.HIGH.label,
    color: TASK_PRIORITY_VISUAL.HIGH.color,
  },
} satisfies ChartConfig;

export function TaskStatusChart({
  stats,
  inProgressByPriority,
  todoByPriority,
  doneByPriority,
}: {
  stats: TaskStats;
  inProgressByPriority: PriorityBreakdown;
  todoByPriority: PriorityBreakdown;
  doneByPriority: PriorityBreakdown;
}) {
  const statusData: DonutSlice[] = [
    { key: "todo", value: stats.todo, fill: TASK_STATUS_VISUAL.TODO.color },
    {
      key: "inProgress",
      value: stats.inProgress,
      fill: TASK_STATUS_VISUAL.IN_PROGRESS.color,
    },
    { key: "done", value: stats.done, fill: TASK_STATUS_VISUAL.DONE.color },
  ];

  const inProgressData: DonutSlice[] = [
    {
      key: "low",
      value: inProgressByPriority.low,
      fill: TASK_PRIORITY_VISUAL.LOW.color,
    },
    {
      key: "medium",
      value: inProgressByPriority.medium,
      fill: TASK_PRIORITY_VISUAL.MEDIUM.color,
    },
    {
      key: "high",
      value: inProgressByPriority.high,
      fill: TASK_PRIORITY_VISUAL.HIGH.color,
    },
  ];

  const todoData: DonutSlice[] = [
    {
      key: "low",
      value: todoByPriority.low,
      fill: TASK_PRIORITY_VISUAL.LOW.color,
    },
    {
      key: "medium",
      value: todoByPriority.medium,
      fill: TASK_PRIORITY_VISUAL.MEDIUM.color,
    },
    {
      key: "high",
      value: todoByPriority.high,
      fill: TASK_PRIORITY_VISUAL.HIGH.color,
    },
  ];

  const doneData: DonutSlice[] = [
    {
      key: "low",
      value: doneByPriority.low,
      fill: TASK_PRIORITY_VISUAL.LOW.color,
    },
    {
      key: "medium",
      value: doneByPriority.medium,
      fill: TASK_PRIORITY_VISUAL.MEDIUM.color,
    },
    {
      key: "high",
      value: doneByPriority.high,
      fill: TASK_PRIORITY_VISUAL.HIGH.color,
    },
  ];

  const inProgressTotal =
    inProgressByPriority.low +
    inProgressByPriority.medium +
    inProgressByPriority.high;
  const todoTotal =
    todoByPriority.low + todoByPriority.medium + todoByPriority.high;
  const doneTotal =
    doneByPriority.low + doneByPriority.medium + doneByPriority.high;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-4">
        <TaskDonutCard
          title="Status / Total"
          total={stats.total}
          data={statusData}
          chartConfig={chartConfig}
        />
        <TaskDonutCard
          title="In Progress"
          total={inProgressTotal}
          data={inProgressData}
          chartConfig={chartConfig}
        />
        <TaskDonutCard
          title="To Do"
          total={todoTotal}
          data={todoData}
          chartConfig={chartConfig}
        />
        <TaskDonutCard
          title="Done"
          total={doneTotal}
          data={doneData}
          chartConfig={chartConfig}
        />
      </div>

      <div className="rounded-lg border bg-card px-4 py-3 text-xs text-muted-foreground shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: TASK_STATUS_VISUAL.TODO.color }}
            />
            <span>{TASK_STATUS_VISUAL.TODO.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: TASK_STATUS_VISUAL.IN_PROGRESS.color }}
            />
            <span>{TASK_STATUS_VISUAL.IN_PROGRESS.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: TASK_STATUS_VISUAL.DONE.color }}
            />
            <span>{TASK_STATUS_VISUAL.DONE.label}</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: TASK_PRIORITY_VISUAL.LOW.color }}
            />
            <span>{TASK_PRIORITY_VISUAL.LOW.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: TASK_PRIORITY_VISUAL.MEDIUM.color }}
            />
            <span>{TASK_PRIORITY_VISUAL.MEDIUM.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: TASK_PRIORITY_VISUAL.HIGH.color }}
            />
            <span>{TASK_PRIORITY_VISUAL.HIGH.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
