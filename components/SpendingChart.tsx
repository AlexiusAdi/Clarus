"use client";

import { SpendingChartProps } from "@/app/Types";
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

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#6366f1", "#a855f7"];

export default function SpendingChart({ data }: SpendingChartProps) {
  const chartData = data.map((item, index) => ({
    browser: item.category,
    visitors: item.amount,
    fill: COLORS[index % COLORS.length],
  }));

  const chartConfig = Object.fromEntries(
    chartData.map((item, index) => [
      item.browser,
      {
        label: item.browser,
        color: COLORS[index % COLORS.length],
      },
    ]),
  ) satisfies ChartConfig;

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
