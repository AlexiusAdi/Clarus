"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { Pie, PieChart } from "recharts";

export const description = "A pie chart with a legend";

const chartData = [
  { browser: "Food", visitors: 275, fill: "#3b82f6" },
  { browser: "Transport", visitors: 200, fill: "#22c55e" },
  { browser: "Bills", visitors: 287, fill: "#f97316" },
  { browser: "Shopping", visitors: 173, fill: "#6366f1" },
  { browser: "Entertainment", visitors: 190, fill: "#a855f7" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  Food: {
    label: "Food",
    color: "var(--chart-1)",
  },
  Transport: {
    label: "Transport",
    color: "var(--chart-2)",
  },
  Bills: {
    label: "Bills",
    color: "var(--chart-3)",
  },
  Shopping: {
    label: "Shopping",
    color: "var(--chart-4)",
  },
  Entertainment: {
    label: "Entertainment",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export default function SpendingChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <ChartContainer config={chartConfig} className="mx-auto h-60 w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="browser" />}
              className="flex flex-wrap gap-2 justify-center pt-4"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
