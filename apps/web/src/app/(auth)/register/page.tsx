"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Create account
        </h1>

        <form action={action} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
