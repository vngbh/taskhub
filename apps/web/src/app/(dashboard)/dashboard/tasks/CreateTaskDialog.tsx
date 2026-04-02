"use client";

import { useRef, useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createTask, type TaskFormState } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateTaskDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0);

  const [state, formAction, pending] = useActionState(
    async (_prev: TaskFormState, formData: FormData) => {
      const result = await createTask(_prev, formData);
      if (!result?.error) {
        dialogRef.current?.close();
        setFormKey((k) => k + 1);
      }
      return result;
    },
    undefined,
  );

  function handleOpen() {
    setFormKey((k) => k + 1);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <Button onClick={handleOpen} size="sm">
        <Plus size={16} />
        New task
      </Button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-xl backdrop:bg-black/50 p-0"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">New task</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Fill in the details below to create a task.
          </p>

          <form
            key={formKey}
            action={formAction}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ct-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ct-title"
                name="title"
                type="text"
                required
                placeholder="Task title"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ct-description">Description</Label>
              <textarea
                id="ct-description"
                name="description"
                rows={3}
                placeholder="Optional description…"
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ct-priority">Priority</Label>
                <select
                  id="ct-priority"
                  name="priority"
                  defaultValue="MEDIUM"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ct-deadline">Deadline</Label>
                <Input id="ct-deadline" name="deadline" type="date" />
              </div>
            </div>

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => dialogRef.current?.close()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating…" : "Create task"}
              </Button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
