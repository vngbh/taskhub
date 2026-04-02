"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/custom/AuthCard";
import { TermsDialog } from "@/components/custom/TermsDialog";
import { FormError, FieldError } from "@/components/custom/FormError";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    const errors: typeof fieldErrors = {};
    if (!fd.get("email")) errors.email = "Email is required.";
    if (!fd.get("password")) errors.password = "Password is required.";
    if (Object.keys(errors).length) {
      e.preventDefault();
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
  }

  return (
    <AuthCard>
      <h2 className="mb-6 text-center text-2xl font-semibold">Sign in</h2>

      <form
        action={action}
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(
              fieldErrors.email &&
                "border-destructive focus-visible:ring-destructive/20",
            )}
            onChange={() => setFieldErrors((p) => ({ ...p, email: undefined }))}
          />
          <FieldError message={fieldErrors.email} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(
              fieldErrors.password &&
                "border-destructive focus-visible:ring-destructive/20",
            )}
            onChange={() =>
              setFieldErrors((p) => ({ ...p, password: undefined }))
            }
          />
          <FieldError message={fieldErrors.password} />
        </div>

        <FormError message={state?.error} />

        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-8">
        <p className="mt-4 text-center text-xs text-neutral-400">
          By clicking Sign in, you agree to our <TermsDialog />
        </p>
        <p className="mt-4 text-center text-xs text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
