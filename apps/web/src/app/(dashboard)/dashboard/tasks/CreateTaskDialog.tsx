"use client";

import { useRef, useActionState, useState } from "react";
import { createTask, type TaskFormState } from "@/app/actions/tasks";

export function CreateTaskDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0);

  const [state, formAction, pending] = useActionState(
    async (_prev: TaskFormState, formData: FormData) => {
      const result = await createTask(_prev, formData);
      if (!result?.error) {
        dialogRef.current?.close();
        setFormKey((k) => k + 1); // reset form fields
      }
      return result;
    },
    undefined,
  );

  function handleOpen() {
    setFormKey((k) => k + 1); // clear previous values when re-opening
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        New task
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl backdrop:bg-black/50 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          New task
        </h2>

        <form key={formKey} action={formAction} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="ct-title"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="ct-title"
              name="title"
              type="text"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label
              htmlFor="ct-description"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Description
            </label>
            <textarea
              id="ct-description"
              name="description"
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="ct-priority"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Priority
              </label>
              <select
                id="ct-priority"
                name="priority"
                defaultValue="MEDIUM"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="ct-deadline"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Deadline
              </label>
              <input
                id="ct-deadline"
                name="deadline"
                type="date"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {pending ? "Creating…" : "Create task"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
