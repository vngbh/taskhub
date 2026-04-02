"use server";

import { revalidatePath } from "next/cache";
import { gql } from "graphql-request";
import { getClient } from "@/lib/graphql";
import { getSession } from "@/lib/session";

const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
    }
  }
`;

const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

const UPDATE_TASK_STATUS_MUTATION = gql`
  mutation UpdateTaskStatus($input: UpdateTaskStatusInput!) {
    updateTaskStatus(input: $input) {
      id
    }
  }
`;

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
  const priority = (formData.get("priority") as string) || "MEDIUM";
  const deadlineRaw = formData.get("deadline") as string | null;
  const deadline = deadlineRaw
    ? new Date(deadlineRaw).toISOString()
    : undefined;

  if (!title) return { error: "Title is required." };

  try {
    await getClient(token).request(CREATE_TASK_MUTATION, {
      input: { title, description, priority, deadline },
    });
  } catch {
    return { error: "Failed to create task." };
  }

  revalidatePath("/dashboard/tasks");
}

export async function deleteTask(id: string) {
  const token = await getSession();
  if (!token) return;

  try {
    await getClient(token).request(DELETE_TASK_MUTATION, { id });
  } catch {
    // ignore — page will re-render regardless
  }

  revalidatePath("/dashboard/tasks");
}

export async function updateTaskStatus(id: string, status: string) {
  const token = await getSession();
  if (!token) return;

  try {
    await getClient(token).request(UPDATE_TASK_STATUS_MUTATION, {
      input: { id, status },
    });
  } catch {
    // ignore
  }

  revalidatePath("/dashboard/tasks");
}
