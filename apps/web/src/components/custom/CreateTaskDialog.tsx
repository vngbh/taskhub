"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createTask, type TaskFormState } from "@/app/actions/tasks";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);

  const [state, formAction, pending] = useActionState(
    async (_prev: TaskFormState, formData: FormData) => {
      const result = await createTask(_prev, formData);
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
      setDescriptionLength(0);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus size={16} />
          New task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to create a task.
          </p>
        </DialogHeader>

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
              rows={5}
              maxLength={100}
              onChange={(e) => setDescriptionLength(e.target.value.length)}
              placeholder="Optional description…"
              className="flex min-h-32 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-placeholdergrey focus-visible:outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-right text-xs text-muted-foreground">
              {descriptionLength}/100
            </p>
          </div>

          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="ct-priority">Priority</Label>
              <Select name="priority" defaultValue="MEDIUM">
                <SelectTrigger id="ct-priority" className="w-full">
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
              <Label>Deadline</Label>
              <DatePicker name="deadline" />
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
              {pending ? "Creating…" : "Create task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
