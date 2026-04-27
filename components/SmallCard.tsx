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
    <Card className="flex-1 p-3 gap-0 shadow-md">
      <CardHeader className="px-2 pb-1 gap-1">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {icon}
            {header}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 font-semibold">
        {amount === 0 ? (
          <span className="text-base opacity-50">No transactions</span>
        ) : isVisible ? (
          <>
            <div>
              <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                Monthly {header}
              </span>
            </div>
            <NumericFormat
              value={amount}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="Rp "
            />
          </>
        ) : (
          "*******"
        )}
      </CardContent>
    </Card>
  );
};
