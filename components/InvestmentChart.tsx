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

export default function InvestmentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Allocation</CardTitle>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground">
        {/* CHART */}
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
          </PieChart>
        </ChartContainer>

        {/* ✅ CUSTOM LEGEND (OUTSIDE) */}
        <div className="mt-4 flex flex-col gap-3">
          {chartData.map((item, index) => {
            const total = chartData.reduce((acc, cur) => acc + cur.visitors, 0);
            const percentage = ((item.visitors / total) * 100).toFixed(1);

            return (
              <div
                key={index}
                className="flex items-center justify-between bg-muted rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="font-medium">{item.browser}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold">
                    Rp {item.visitors.toLocaleString("id-ID")}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
