"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AuthCard } from "@/components/custom/AuthCard";

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

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [clientError, setClientError] = useState("");

  const allRulesPassed = RULES.every((r) => r.test(password));
  const confirmMismatch = submitted && password !== confirm;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setSubmitted(true);
    if (!allRulesPassed) {
      e.preventDefault();
      setClientError("Password does not meet all requirements.");
      return;
    }
    if (password !== confirm) {
      e.preventDefault();
      setClientError("Passwords do not match.");
      return;
    }
    setClientError("");
  }

  return (
    <AuthCard>
      <h2 className="mb-6 text-center text-2xl font-semibold">Register</h2>

      <form
        action={action}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={!password}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {password.length > 0 && (
            <ul className="mt-1 space-y-1">
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={cn(
                "pr-10",
                confirmMismatch &&
                  "border-destructive focus-visible:ring-destructive/20",
              )}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              disabled={!confirm}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {(clientError || state?.error) && (
          <p className="text-sm text-destructive">
            {clientError || state?.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Registering…" : "Register"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
