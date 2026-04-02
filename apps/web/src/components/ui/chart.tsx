"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  type DefaultLegendContentProps,
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  type TooltipContentProps,
} from "recharts";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within ChartContainer");
  }
  return context;
}

function ChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig;
  className?: string;
  children: React.ReactNode;
}) {
  const style = Object.entries(config).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (value.color) acc[`--color-${key}`] = value.color;
      return acc;
    },
    {},
  );

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn("w-full", className)}
        style={style as React.CSSProperties}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartLegend = RechartsLegend;
const ChartTooltip = RechartsTooltip;

function ChartLegendContent({
  payload,
  nameKey,
  className,
}: {
  payload?: DefaultLegendContentProps["payload"];
  nameKey?: string;
  className?: string;
}) {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      {payload.map((entry) => {
        const key = String(
          (nameKey && (entry.payload as Record<string, unknown>)?.[nameKey]) ??
            entry.value,
        );
        const mapped = config[key];
        const label = mapped?.label ?? key;
        const color = entry.color ?? mapped?.color ?? "currentColor";

        return (
          <div
            key={key}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: String(color) }}
            />
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function ChartTooltipContent({
  active,
  payload,
  hideLabel = false,
}: TooltipContentProps & { hideLabel?: boolean }) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      {payload.map((entry, index) => {
        const rawKey =
          String((entry.payload as Record<string, unknown>)?.status ?? "") ||
          String((entry.payload as Record<string, unknown>)?.priority ?? "") ||
          String(entry.name ?? "");
        const key = rawKey;
        const label = config[key]?.label ?? key;
        const color =
          String((entry.payload as Record<string, unknown>)?.fill ?? "") ||
          String(entry.color ?? "currentColor");

        return (
          <div key={`${key}-${index}`} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: color }}
            />
            {!hideLabel && (
              <span className="text-muted-foreground">{label}</span>
            )}
            <span className="font-medium">{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
}

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
};
