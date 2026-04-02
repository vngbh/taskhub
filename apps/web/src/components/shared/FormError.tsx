import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Form-level error banner — shows a server/cross-field error.
 */
export function FormError({
  message,
  className,
}: {
  message: string | undefined;
  className?: string;
}) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Inline field-level error — shown directly below an input.
 */
export function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null;

  return (
    <p role="alert" className="mt-1 text-xs text-destructive">
      {message}
    </p>
  );
}
