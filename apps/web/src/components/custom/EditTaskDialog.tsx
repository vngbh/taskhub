"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import { updateTask, type TaskFormState } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/custom/DatePicker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [descriptionLength, setDescriptionLength] = useState(
    task.description?.length ?? 0,
  );

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
    if (next) {
      setFormKey((k) => k + 1);
      setDescriptionLength(task.description?.length ?? 0);
    }
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
              rows={5}
              maxLength={100}
              onChange={(e) => setDescriptionLength(e.target.value.length)}
              defaultValue={task.description ?? ""}
              placeholder="Optional description…"
              className="flex min-h-32 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-placeholdergrey focus-visible:outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-right text-xs text-muted-foreground">
              {descriptionLength}/100
            </p>
          </div>

          <div className="grid grid-cols-8 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="et-priority">Priority</Label>
              <Select name="priority" defaultValue={task.priority}>
                <SelectTrigger id="et-priority" className="w-full">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-3 flex flex-col gap-1.5">
              <Label htmlFor="et-status">Status</Label>
              <Select name="status" defaultValue={task.status}>
                <SelectTrigger id="et-status" className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-3 flex flex-col gap-1.5">
              <Label>Deadline</Label>
              <DatePicker
                name="deadline"
                defaultValue={deadlineDate || undefined}
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
