import Image from "next/image";
import { cn } from "@/lib/utils";

interface AppBrandingProps {
  variant?: "light" | "dark";
}

export function AppBranding({ variant = "light" }: AppBrandingProps) {
  const isDark = variant === "dark";
  return (
    <div className="flex flex-col items-center text-center">
      <Image
        src="/logo.svg"
        alt="TaskHub logo"
        width={80}
        height={80}
        className={isDark ? "invert" : "dark:invert"}
      />
      <h1
        className={cn(
          "mt-4 text-5xl font-bold tracking-tight",
          isDark && "text-white",
        )}
      >
        TaskHub
      </h1>
      <p
        className={cn(
          "mt-1.5 text-xs",
          isDark ? "text-zinc-700" : "text-muted-foreground",
        )}
      >
        Track, prioritize, and ship — effortlessly.
      </p>
    </div>
  );
}
