"use server";

import { revalidatePath } from "next/cache";
import { Priority, TaskStatus } from "@/graphql/generated";
import { getSdkClient } from "@/lib/graphql";
import { getSession } from "@/lib/session";

export type TaskFormState = { error?: string } | undefined;

export async function createTask(
  _state: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const token = await getSession();
  if (!token) return { error: "Not authenticated." };

  const title = (formData.get("title") as string)?.trim();
  const description =
    (formData.get("description") as string)?.trim() || undefined;
  const priority = ((formData.get("priority") as string) ||
    "MEDIUM") as Priority;
  const deadlineRaw = formData.get("deadline") as string | null;
  const deadline = deadlineRaw
    ? new Date(deadlineRaw).toISOString()
    : undefined;

  if (!title) return { error: "Title is required." };

  try {
    await getSdkClient(token).CreateTask({
      input: { title, description, priority, deadline },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg || "Failed to create task." };
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string) {
  const token = await getSession();
  if (!token) return;

  try {
    await getSdkClient(token).DeleteTask({ id });
  } catch {
    // ignore — page will re-render regardless
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

export async function updateTask(
  _state: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const token = await getSession();
  if (!token) return { error: "Not authenticated." };

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = ((formData.get("description") as string)?.trim() ||
    null) as string | null | undefined;
  const priority = ((formData.get("priority") as string) || undefined) as
    | Priority
    | undefined;
  const status = ((formData.get("status") as string) || undefined) as
    | TaskStatus
    | undefined;
  const deadlineRaw = formData.get("deadline") as string | null;
  const deadline = deadlineRaw
    ? (new Date(deadlineRaw).toISOString() as unknown as Date)
    : (null as unknown as Date | null | undefined);

  if (!id) return { error: "Task ID is required." };
  if (!title) return { error: "Title is required." };

  try {
    await getSdkClient(token).UpdateTask({
      input: { id, title, description, priority, status, deadline },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg || "Failed to update task." };
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

export async function updateTaskStatus(id: string, status: string) {
  const token = await getSession();
  if (!token) return;

  try {
    await getSdkClient(token).UpdateTaskStatus({
      input: { id, status: status as TaskStatus },
    });
  } catch {
    // ignore
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}
