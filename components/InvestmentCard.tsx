"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "./ui/card";
import { Coins, Icon, Trash2, TrendingUp } from "lucide-react";
import { Investment, AssetPrice } from "@/lib/generated/prisma/browser";
import Alert from "./Alert";
import { cn } from "@/lib/utils";
import { TYPE_ICON } from "@/constants";

type Props = {
  investment: Investment & {
    assetPrice?: AssetPrice | null;
  };
};

const InvestmentCard = ({ investment }: Props) => {
  const [open, setOpen] = useState(false);

  const Icon = TYPE_ICON[investment.type].icon;
  const iconStyle = TYPE_ICON[investment.type].className;

  const normalizedQuantity = useMemo(() => {
    if (investment.unit === "lot") {
      return investment.quantity * 100;
    }
    return investment.quantity;
  }, [investment.quantity, investment.unit]);

  const costPerUnit = investment.costPerUnit;
  const currentPrice = investment.assetPrice?.priceIdr ?? null;

  // ✅ If no price yet (cron not run)
  const invested = normalizedQuantity * costPerUnit;
  const currentValue = currentPrice ? normalizedQuantity * currentPrice : null;

  const profit = currentValue !== null ? currentValue - invested : null;

  const percent =
    profit !== null && invested !== 0 ? (profit / invested) * 100 : null;

  const isUp = profit !== null ? profit >= 0 : null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="flex flex-col">
      <Card className="w-full">
        <CardContent className="p-4 flex gap-3">
          <Icon
            width={32}
            height={32}
            className={cn("rounded-md p-2", iconStyle)}
          />

          <div className="flex flex-col gap-3 w-full">
            {/* Header */}
            <div className="flex justify-between">
              <div>
                <h1 className="font-bold">{investment.name}</h1>
                <span className="text-sm text-muted-foreground">
                  {investment.assetIdentifier}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-sm">{formatCurrency(costPerUnit)}</span>

                {/* 🔥 Trend */}
                {profit !== null ? (
                  <span
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      isUp ? "text-green-500" : "text-red-500",
                    )}
                  >
                    <TrendingUp
                      width={16}
                      height={16}
                      className={!isUp ? "rotate-180" : ""}
                    />
                    {percent!.toFixed(2)}%<span>{formatCurrency(profit)}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No price data
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="font-semibold">Invested</span>
                <span>{formatCurrency(invested)}</span>
              </div>

              <div className="flex flex-col">
                <span className="font-semibold">Current Value</span>
                <span>
                  {currentValue !== null ? formatCurrency(currentValue) : "-"}
                </span>
              </div>
            </div>

            {/* Bottom */}
            <div className="flex justify-between items-center">
              <div className="flex-1 bg-accent rounded-xl p-1.5 mr-3 text-sm">
                <span>
                  {investment.quantity} {investment.unit} @{" "}
                  {formatCurrency(costPerUnit)}
                </span>
              </div>

              <button onClick={() => setOpen(true)}>
                <Trash2
                  width={16}
                  height={16}
                  className="text-red-500 cursor-pointer"
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert
        open={open}
        onOpenChange={setOpen}
        apiUrl={`/api/user/investment/${investment.id}`}
        successMessage="Investment deleted"
        description="This action cannot be undone."
      />
    </div>
  );
};

export default InvestmentCard;
