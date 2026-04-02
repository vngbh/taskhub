"use client";

import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type DonutSlice = {
  key: string;
  value: number;
  fill: string;
};

export function TaskDonutCard({
  title,
  total,
  data,
  chartConfig,
}: {
  title: string;
  total: number;
  data: DonutSlice[];
  chartConfig: ChartConfig;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="min-h-16 items-center justify-center pb-0 text-center">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center pb-2 pt-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-52 [&_.recharts-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip
              content={(props) => <ChartTooltipContent {...props} />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="key"
              innerRadius={42}
              outerRadius={70}
              strokeWidth={4}
            >
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-lg font-semibold"
              >
                {total}
              </text>
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
