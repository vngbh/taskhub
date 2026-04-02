"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import { updateTask, type TaskFormState } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  deadline?: string | null;
};

export function EditTaskDialog({
  task,
  asMenuItem = false,
}: {
  task: Task;
  asMenuItem?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const deadlineDate = task.deadline
    ? new Date(task.deadline).toISOString().split("T")[0]
    : "";

  const [state, formAction, pending] = useActionState(
    async (_prev: TaskFormState, formData: FormData) => {
      const result = await updateTask(_prev, formData);
      if (!result?.error) {
        setOpen(false);
      }
      return result;
    },
    undefined,
  );

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setFormKey((k) => k + 1);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {asMenuItem ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Edit task"
          >
            <Pencil size={14} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Update the task details below.
          </p>
        </DialogHeader>

        <form key={formKey} action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={task.id} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="et-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="et-title"
              name="title"
              type="text"
              required
              defaultValue={task.title}
              placeholder="Task title"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="et-description">Description</Label>
            <textarea
              id="et-description"
              name="description"
              rows={3}
              defaultValue={task.description ?? ""}
              placeholder="Optional description…"
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="et-priority">Priority</Label>
              <select
                id="et-priority"
                name="priority"
                defaultValue={task.priority}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="et-status">Status</Label>
              <select
                id="et-status"
                name="status"
                defaultValue={task.status}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="et-deadline">Deadline</Label>
              <Input
                id="et-deadline"
                name="deadline"
                type="date"
                defaultValue={deadlineDate}
              />
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
