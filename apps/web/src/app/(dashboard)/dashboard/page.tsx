import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSdkClient } from "@/lib/graphql";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { GetTaskStatsQuery } from "@/graphql/generated";

type TaskStats = GetTaskStatsQuery["taskStats"];

type StatCard = {
  label: string;
  value: number;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
};

export default async function DashboardPage() {
  const token = await getSession();
  if (!token) redirect("/login");

  let stats: TaskStats = {
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
  };
  try {
    const data = await getSdkClient(token).GetTaskStats();
    stats = data.taskStats;
  } catch {
    // API down or token expired
  }

  const cards: StatCard[] = [
    { label: "Total", value: stats.total },
    { label: "To Do", value: stats.todo, badgeVariant: "outline" },
    {
      label: "In Progress",
      value: stats.inProgress,
      badgeVariant: "secondary",
    },
    { label: "Done", value: stats.done },
    { label: "Overdue", value: stats.overdue, badgeVariant: "destructive" },
  ];

  const pct =
    stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your tasks
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Link key={card.label} href="/dashboard/tasks">
            <Card className="gap-3 py-4 transition-shadow hover:shadow-md">
              <CardContent className="px-5">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-3xl font-semibold">{card.value}</p>
                {card.badgeVariant && card.value > 0 && (
                  <Badge
                    variant={card.badgeVariant}
                    className="mt-2 text-[10px]"
                  >
                    {card.label}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Completion progress */}
      {stats.total > 0 && (
        <Card>
          <CardContent className="px-6 py-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Completion</span>
              <span className="text-muted-foreground">
                {stats.done}/{stats.total} tasks · {pct}%
              </span>
            </div>
            <Progress value={pct} className="h-2.5" />
          </CardContent>
        </Card>
      )}

      <div>
        <Button asChild>
          <Link href="/dashboard/tasks">View all tasks</Link>
        </Button>
      </div>
    </div>
  );
}
