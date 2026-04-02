"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export function TaskPagination({
  total,
  page,
}: {
  total: number;
  page: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function goTo(p: number) {
    const next = new URLSearchParams(params.toString());
    if (p === 1) {
      next.delete("page");
    } else {
      next.set("page", String(p));
    }
    router.replace(`${pathname}?${next.toString()}`);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} &middot; {total} tasks
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | "…")[]>((acc, p, idx, arr) => {
            if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1)
              acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="px-1 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => goTo(p as number)}
                aria-label={`Page ${p}`}
              >
                {p}
              </Button>
            ),
          )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
