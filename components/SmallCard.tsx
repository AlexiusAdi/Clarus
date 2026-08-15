"use client";

import { IncomeCardProps } from "@/app/Types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { NumericFormat } from "react-number-format";

export const SmallCard = ({
  header,
  amount,
  icon,
  isVisible,
}: IncomeCardProps) => {
  return (
    <Card className="flex-1 p-0 gap-0 rounded-xl shadow-none">
      <CardHeader className="px-4 pt-3.5 pb-0 gap-0">
        <CardTitle className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
          {icon}
          Monthly {header}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-1.5 pb-3.5">
        <span className="headline tabular text-xl @md/main:text-2xl">
          {amount === 0 ? (
            <span className="font-sans text-sm opacity-50">—</span>
          ) : isVisible ? (
            <NumericFormat
              value={amount}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="Rp "
            />
          ) : (
            "••••••"
          )}
        </span>
      </CardContent>
    </Card>
  );
};
