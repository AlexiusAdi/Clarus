"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";
import { Investment } from "@/lib/generated/prisma/client";
import { useMemo } from "react";

const COLORS = {
  STOCK: "#3b82f6",
  CRYPTO: "#22c55e",
  GOLD: "#f59e0b",
  OTHER: "#6366f1",
};

export default function InvestmentChart({
  investments,
}: {
  investments: Investment[];
}) {
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};

    investments.forEach((inv) => {
      const value = inv.quantity * inv.costPerUnit;

      let key: string;

      if (inv.type === "STOCK") {
        // ✅ group by ticker
        key = inv.assetIdentifier;
      } else {
        // ✅ group by type
        key = inv.type || "OTHER";
      }

      grouped[key] = (grouped[key] || 0) + value;
    });

    return Object.entries(grouped).map(([key, value]) => {
      const isStock = key.includes("."); // simple heuristic for ticker

      return {
        name: key,
        value,
        fill: isStock
          ? "#3b82f6" // all stocks same color (or randomize later)
          : COLORS[key as keyof typeof COLORS] || "#888",
      };
    });
  }, [investments]);

  const total = chartData.reduce((acc, cur) => acc + cur.value, 0);

  const chartConfig = {
    value: { label: "Value" },
    STOCK: { label: "Stock", color: COLORS.STOCK },
    CRYPTO: { label: "Crypto", color: COLORS.CRYPTO },
    GOLD: { label: "Gold", color: COLORS.GOLD },
    OTHER: { label: "Other", color: COLORS.OTHER },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Allocation</CardTitle>
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
              dataKey="value"
              nameKey="type"
              innerRadius={60}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 flex flex-col gap-3">
          {chartData.map((item, index) => {
            const percentage = total
              ? ((item.value / total) * 100).toFixed(1)
              : "0";

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
                  <span className="font-medium">{item.name}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold">
                    Rp {item.value.toLocaleString("id-ID")}
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
