"use server";

import { redirect } from "next/navigation";
import { gql } from "graphql-request";
import { getClient } from "@/lib/graphql";
import { createSession, deleteSession } from "@/lib/session";

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        email
        name
        role
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export type AuthState = { error?: string } | undefined;

export async function login(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Email and password are required." };

  try {
    const data = await getClient().request<{
      login: { accessToken: string };
    }>(LOGIN_MUTATION, { input: { email, password } });

    await createSession(data.login.accessToken);
  } catch {
    return { error: "Invalid email or password." };
  }

  redirect("/dashboard");
}

export async function register(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password)
    return { error: "All fields are required." };

  try {
    const data = await getClient().request<{
      register: { accessToken: string };
    }>(REGISTER_MUTATION, { input: { name, email, password } });

    await createSession(data.register.accessToken);
  } catch {
    return { error: "Registration failed. Email may already be in use." };
  }

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
