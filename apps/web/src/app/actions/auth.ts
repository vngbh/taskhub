"use server";

import { redirect } from "next/navigation";
import { getSdkClient } from "@/lib/graphql";
import { createSession, deleteSession } from "@/lib/session";

export type AuthState = { error?: string } | undefined;

export async function login(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Email and password are required." };

  try {
    const data = await getSdkClient().Login({ input: { email, password } });
    await createSession(data.login.accessToken);
  } catch {
    return { error: "Invalid email or password." };
  }

  redirect("/dashboard");
}

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export async function register(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!name || !email || !password)
    return { error: "All fields are required." };

  if (password !== confirm) return { error: "Passwords do not match." };

  if (!PASSWORD_REGEX.test(password))
    return { error: "Password does not meet security requirements." };

  try {
    await getSdkClient().Register({ input: { name, email, password } });
  } catch {
    return { error: "Registration failed. Email may already be in use." };
  }

  redirect("/login");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
