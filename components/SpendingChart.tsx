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

// Warm editorial palette — mirrors --chart-1..5 in globals.css.
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function SpendingChart({ data }: SpendingChartProps) {
  const chartData = data.map((item, index) => ({
    category: item.category,
    amount: item.amount,
    fill: COLORS[index % COLORS.length],
  }));

  const chartConfig = Object.fromEntries(
    chartData.map((item, index) => [
      item.category,
      {
        label: item.category,
        color: COLORS[index % COLORS.length],
      },
    ]),
  ) satisfies ChartConfig;

  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <CardTitle className="headline text-lg">
          Spending Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {chartData.length === 0 ? (
          <p className="text-center py-10">No spending data available.</p>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto h-60 w-full">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel className="min-w-45" />}
              />
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                innerRadius={62}
                paddingAngle={2}
                cornerRadius={4}
                stroke="var(--card)"
                strokeWidth={3}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="category" />}
                className="flex flex-wrap gap-2 justify-center pt-4"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
