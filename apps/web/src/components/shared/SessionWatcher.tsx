"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { logout } from "@/app/actions/auth";

const EXPIRES_COOKIE = "taskhub_expires";
/** Show warning this many milliseconds before the token actually expires. */
const WARN_BEFORE_MS = 2 * 60 * 1000; // 2 minutes

function readExpiry(): number | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)taskhub_expires=([^;]+)/);
  return match ? parseInt(match[1], 10) * 1000 : null;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SessionWatcher() {
  const [warningVisible, setWarningVisible] = useState(false);
  const [msLeft, setMsLeft] = useState(0);
  const [isPending, startTransition] = useTransition();

  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expireTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearAll() {
    if (warnTimer.current) clearTimeout(warnTimer.current);
    if (expireTimer.current) clearTimeout(expireTimer.current);
    if (tickInterval.current) clearInterval(tickInterval.current);
  }

  function startCountdown(expMs: number) {
    if (tickInterval.current) clearInterval(tickInterval.current);
    setMsLeft(expMs - Date.now());
    tickInterval.current = setInterval(() => {
      const remaining = expMs - Date.now();
      setMsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(tickInterval.current!);
      }
    }, 500);
  }

  function scheduleTimers() {
    clearAll();

    const expMs = readExpiry();
    if (!expMs) return;

    const now = Date.now();
    const msUntilExpiry = expMs - now;

    if (msUntilExpiry <= 0) {
      // Already expired — sign out immediately
      startTransition(() => logout());
      return;
    }

    const msUntilWarn = msUntilExpiry - WARN_BEFORE_MS;

    if (msUntilWarn > 0) {
      // Schedule the warning banner
      warnTimer.current = setTimeout(() => {
        setWarningVisible(true);
        startCountdown(expMs);
      }, msUntilWarn);
    } else {
      // Less than WARN_BEFORE_MS left — show warning right away
      setWarningVisible(true);
      startCountdown(expMs);
    }

    // Schedule hard signout at exact expiry
    expireTimer.current = setTimeout(() => {
      startTransition(() => logout());
    }, msUntilExpiry);
  }

  useEffect(() => {
    scheduleTimers();

    // Re-evaluate timers when the tab regains focus (handles device sleep/wake)
    function onVisible() {
      if (document.visibilityState === "visible") scheduleTimers();
    }

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      clearAll();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!warningVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-warning-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm mx-4 rounded-xl border bg-background shadow-2xl p-6 flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-yellow-500" aria-hidden>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
          </span>
          <div className="flex-1">
            <p
              id="session-warning-title"
              className="font-semibold text-foreground"
            >
              Session Expiring Soon
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              You will be automatically signed out in{" "}
              <span className="font-mono font-semibold tabular-nums text-foreground">
                {formatCountdown(msLeft)}
              </span>
              . Please save your work.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => startTransition(() => logout())}
            disabled={isPending}
            className="w-full rounded-md bg-destructive py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "Signing out…" : "Sign Out Now"}
          </button>
          <button
            onClick={() => setWarningVisible(false)}
            className="w-full rounded-md border py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
