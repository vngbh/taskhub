"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AuthCard } from "@/app/(auth)/_components/AuthCard";
import { TermsDialog } from "@/app/(auth)/_components/TermsDialog";
import { FormError, FieldError } from "@/components/shared/FormError";

const RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    id: "upper",
    label: "Uppercase letter (A–Z)",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    id: "lower",
    label: "Lowercase letter (a–z)",
    test: (p: string) => /[a-z]/.test(p),
  },
  { id: "number", label: "Number (0–9)", test: (p: string) => /[0-9]/.test(p) },
  {
    id: "special",
    label: "Special character (!@#$%…)",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const allRulesPassed = RULES.every((r) => r.test(password));

  function clearField(field: keyof FieldErrors) {
    setFieldErrors((p) => ({ ...p, [field]: undefined }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    const errors: FieldErrors = {};

    if (!fd.get("name")) errors.name = "Name is required.";
    if (!fd.get("email")) errors.email = "Email is required.";
    if (!password) {
      errors.password = "Password is required.";
    } else if (!allRulesPassed) {
      errors.password = "Password does not meet all requirements.";
    }
    if (!confirm) {
      errors.confirm = "Please confirm your password.";
    } else if (password !== confirm) {
      errors.confirm = "Passwords do not match.";
    }

    if (Object.keys(errors).length) {
      e.preventDefault();
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
  }

  return (
    <AuthCard>
      <h2 className="mb-5 text-center text-2xl font-semibold">Register</h2>

      <form
        action={action}
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className={cn(fieldErrors.name && "border-destructive")}
            onChange={() => clearField("name")}
          />
          <FieldError message={fieldErrors.name} />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(fieldErrors.email && "border-destructive")}
            onChange={() => clearField("email")}
          />
          <FieldError message={fieldErrors.email} />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearField("password");
              }}
              className={cn(
                "pr-10",
                fieldErrors.password && "border-destructive",
              )}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={!password}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <FieldError message={fieldErrors.password} />
          {password.length > 0 && (
            <ul className="mt-0.5 space-y-1">
              {RULES.map((rule) => {
                const passed = rule.test(password);
                return (
                  <li
                    key={rule.id}
                    className={cn(
                      "flex items-center gap-1.5 text-xs transition-colors",
                      passed
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground",
                    )}
                  >
                    <span className="text-[10px]">{passed ? "✓" : "○"}</span>
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                clearField("confirm");
              }}
              className={cn(
                "pr-10",
                fieldErrors.confirm && "border-destructive",
              )}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              disabled={!confirm}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>
          <FieldError message={fieldErrors.confirm} />
        </div>

        {/* Server error */}
        <FormError message={state?.error} />

        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Registering…" : "Register"}
        </Button>

        <p className="mt-4 text-center text-xs text-neutral-400">
          By clicking Register, you agree to our <TermsDialog />
        </p>
      </form>

      <p className="mt-4 text-center text-xs text-neutral-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline"
        >
          Sign in here
        </Link>
      </p>
    </AuthCard>
  );
}
