"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Circle,
  CircleCheck,
  Clock3,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CalendarClock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CreateTaskDialog } from "./CreateTaskDialog";
import { EditTaskDialog } from "./EditTaskDialog";
import { deleteTask } from "@/app/actions/tasks";
import { cn } from "@/lib/utils";
import type { GetTasksQuery } from "@/graphql/generated";

// ─── Types ────────────────────────────────────────────────────────────────────

type Task = GetTasksQuery["tasks"][number];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ─── Icons ───────────────────────────────────────────────────────────────────

const STATUS_ICON: Record<string, React.ElementType> = {
  TODO: Circle,
  IN_PROGRESS: Clock3,
  DONE: CircleCheck,
};

const STATUS_LABEL: Record<string, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const STATUS_CLASS: Record<string, string> = {
  TODO: "text-muted-foreground",
  IN_PROGRESS: "text-blue-500",
  DONE: "text-green-600 dark:text-green-400",
};

const PRIORITY_ICON: Record<string, React.ElementType> = {
  LOW: ArrowDown,
  MEDIUM: ArrowRight,
  HIGH: ArrowUp,
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const PRIORITY_CLASS: Record<string, string> = {
  LOW: "text-muted-foreground",
  MEDIUM: "text-yellow-500",
  HIGH: "text-destructive",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusCell({ status }: { status: string }) {
  const Icon = STATUS_ICON[status] ?? Circle;
  return (
    <div
      className={cn("flex items-center gap-2 text-sm", STATUS_CLASS[status])}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{STATUS_LABEL[status] ?? status}</span>
    </div>
  );
}

function PriorityCell({ priority }: { priority: string }) {
  const Icon = PRIORITY_ICON[priority] ?? ArrowRight;
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        PRIORITY_CLASS[priority],
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{PRIORITY_LABEL[priority] ?? priority}</span>
    </div>
  );
}

function DeadlineBadge({
  deadline,
  status,
}: {
  deadline?: string | null;
  status: string;
}) {
  if (!deadline)
    return <span className="text-xs text-muted-foreground">—</span>;
  const d = new Date(deadline);
  const isOverdue = d < new Date() && status !== "DONE";
  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs",
        isOverdue ? "text-destructive" : "text-muted-foreground",
      )}
    >
      <CalendarClock className="h-3.5 w-3.5 shrink-0" />
      {d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface TasksTableProps {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  userName?: string;
}

export function TasksTable({
  tasks,
  total,
  page,
  pageSize,
  userName,
}: TasksTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  // ── URL helpers ───────────────────────────────────────────────────────────

  function pushParam(key: string, value: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      sp.delete(key);
    } else {
      sp.set(key, value);
    }
    if (key !== "page") sp.set("page", "1");
    router.replace(`${pathname}?${sp.toString()}`);
  }

  function setPage(p: number) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(p));
    router.replace(`${pathname}?${sp.toString()}`);
  }

  function setPageSize(size: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("pageSize", size);
    sp.set("page", "1");
    router.replace(`${pathname}?${sp.toString()}`);
  }

  // ── Filter values from URL ─────────────────────────────────────────────────

  const statusFilter = searchParams.get("status") ?? "all";
  const priorityFilter = searchParams.get("priority") ?? "all";

  // ── Client-side text search on current page ────────────────────────────────

  const filteredTasks = useMemo(() => {
    if (!query.trim()) return tasks;
    const q = query.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q),
    );
  }, [tasks, query]);

  // ── Selection helpers ──────────────────────────────────────────────────────

  const allSelected =
    filteredTasks.length > 0 && filteredTasks.every((t) => selected.has(t.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredTasks.map((t) => t.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    startTransition(() => deleteTask(id));
  }

  // ── Pagination ─────────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const initials = userName
    ? userName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <Card className="rounded-2xl border bg-background shadow-sm">
      <CardContent className="p-6">
        {/* ── Header ── */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">My Tasks</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {total} task{total !== 1 ? "s" : ""} in total
            </p>
          </div>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>
        </div>

        {/* ── Toolbar ── */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter tasks…"
                className="pl-9"
              />
            </div>

            {/* Status filter */}
            <Select
              value={statusFilter}
              onValueChange={(v) => pushParam("status", v)}
            >
              <SelectTrigger className="w-37.5">
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="TODO">Todo</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority filter */}
            <Select
              value={priorityFilter}
              onValueChange={(v) => pushParam("priority", v)}
            >
              <SelectTrigger className="w-37.5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <SelectValue placeholder="Priority" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CreateTaskDialog />
        </div>

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-30">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-37.5">Status</TableHead>
                <TableHead className="w-37.5">Priority</TableHead>
                <TableHead className="w-40">Deadline</TableHead>
                <TableHead className="w-15" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No tasks match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className={cn(
                      isPending && "opacity-50 pointer-events-none",
                    )}
                    data-state={selected.has(task.id) ? "selected" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.has(task.id)}
                        onCheckedChange={() => toggleOne(task.id)}
                        aria-label={`Select ${task.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {task.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 text-[11px]",
                            task.status === "DONE" &&
                              "border-green-500/30 text-green-600 dark:text-green-400",
                            task.status === "IN_PROGRESS" &&
                              "border-blue-500/30 text-blue-500",
                          )}
                        >
                          {STATUS_LABEL[task.status] ?? task.status}
                        </Badge>
                        <span
                          className="truncate max-w-[280px] text-sm"
                          title={task.title}
                        >
                          {task.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusCell status={task.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityCell priority={task.priority} />
                    </TableCell>
                    <TableCell>
                      <DeadlineBadge
                        deadline={task.deadline}
                        status={task.status}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <EditTaskDialog task={task} asMenuItem />
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => handleDelete(task.id, task.title)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination footer ── */}
        <div className="mt-4 flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            {selected.size} of {filteredTasks.length} row
            {filteredTasks.length !== 1 ? "s" : ""} selected
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="shrink-0">Rows per page</span>
              <Select value={String(pageSize)} onValueChange={setPageSize}>
                <SelectTrigger className="w-19">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className="shrink-0">
              Page {page} of {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage(1)}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage(totalPages)}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
