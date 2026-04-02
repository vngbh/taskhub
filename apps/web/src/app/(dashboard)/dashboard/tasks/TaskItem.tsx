"use client";

import { useTransition } from "react";
import { deleteTask, updateTaskStatus } from "@/app/actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

const STATUS_VARIANTS: Record<string, "outline" | "secondary" | "default"> = {
  TODO: "outline",
  IN_PROGRESS: "secondary",
  DONE: "default",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const PRIORITY_VARIANTS: Record<string, "outline" | "secondary" | "destructive"> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "destructive",
};

function isOverdue(deadline?: string, status?: string) {
  if (!deadline || status === "DONE") return false;
  return new Date(deadline) < new Date();
}

export function TaskItem({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();

  const currentIdx = STATUS_SEQUENCE.indexOf(task.status as TaskStatus);
  const nextStatus =
    STATUS_SEQUENCE[(currentIdx === -1 ? 1 : currentIdx + 1) % STATUS_SEQUENCE.length];

  const overdue = isOverdue(task.deadline, task.status);

  function handleStatusCycle() {
    startTransition(() => updateTaskStatus(task.id, nextStatus));
  }

  function handleDelete() {
    if (!confirm(`Delete "${task.title}"?`)) return;
    startTransition(() => deleteTask(task.id));
  }

  return (
    <Card
      className={cn(
        "gap-2 py-4 transition-opacity",
        overdue && "border-destructive/50",
        isPending && "opacity-40",
      )}
    >
      <CardContent className="px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "font-medium truncate",
                task.status === "DONE" && "line-through text-muted-foreground",
              )}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
            {task.deadline && (
              <p className={cn("mt-1.5 text-xs", overdue ? "text-destructive font-medium" : "text-muted-foreground")}>
                Due {new Date(task.deadline).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {overdue && (
              <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
            )}

            <Badge variant={PRIORITY_VARIANTS[task.priority] ?? "outline"}>
              {PRIORITY_LABELS[task.priority] ?? task.priority}
            </Badge>

            <Badge
              variant={STATUS_VARIANTS[task.status] ?? "outline"}
              onClick={handleStatusCycle}
              className={cn(
                "cursor-pointer select-none transition-opacity hover:opacity-70",
                isPending && "cursor-not-allowed",
              )}
              title={
                task.status === "DONE"
                  ? "Click to reset to To Do"
                  : `Click to advance to ${STATUS_LABELS[nextStatus]}`
              }
            >
              {STATUS_LABELS[task.status] ?? task.status}
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
              disabled={isPending}
              title="Delete task"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
