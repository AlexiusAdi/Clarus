"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "./ui/card";
import { Pencil, Trash2, TrendingUp } from "lucide-react";
import Alert from "./Alert";
import { cn } from "@/lib/utils";
import { TYPE_ICON } from "@/constants";
import { AssetPriceDTO, InvestmentDTO } from "@/lib/data/investments";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { AddInvestment } from "./AddInvestment";

type Props = {
  investment: InvestmentDTO & {
    assetPrice?: AssetPriceDTO | null;
  };
};

const InvestmentCard = ({ investment }: Props) => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const Icon = TYPE_ICON[investment.type].icon;
  const iconStyle = TYPE_ICON[investment.type].className;

  const costPerUnit = investment.costPerUnit;
  const currentPrice = investment.assetPrice?.priceIdr ?? null;
  const marketPlacePerLot = currentPrice !== null ? currentPrice * 100 : null;

  const currentPriceNormalized = useMemo(() => {
    if (investment.unit === "lot" && currentPrice) {
      return currentPrice * 100;
    }
    return currentPrice;
  }, [investment.unit, currentPrice]);

  const invested = investment.totalInvestment;
  const currentValue =
    currentPriceNormalized !== null
      ? investment.quantity * currentPriceNormalized
      : null;

  const profit = currentValue !== null ? currentValue - invested : null;

  const percent =
    profit !== null && invested !== 0 ? (profit / invested) * 100 : null;

  const isUp = profit !== null ? profit >= 0 : null;

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
                <span className="text-md font-semibold shadow-sm">
                  {formatCurrency(investment.totalInvestment)}
                </span>

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
              <span className="font-semibold">Market Price / LOT</span>
              <span className="flex justify-end">
                {marketPlacePerLot !== null
                  ? formatCurrency(marketPlacePerLot)
                  : "-"}
              </span>
            </div>

            {/* Bottom */}
            <div className="flex justify-between items-center">
              <div className="flex-1 bg-accent rounded-xl p-1.5 mr-3 text-sm">
                <span>
                  {investment.quantity} {investment.unit} -{" "}
                  {formatCurrency(costPerUnit)} / {investment.unit}
                </span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setEditOpen(true)}>
                  <Pencil
                    width={16}
                    height={16}
                    className="text-blue-500 cursor-pointer"
                  />
                </button>
                <button onClick={() => setOpen(true)}>
                  <Trash2
                    width={16}
                    height={16}
                    className="text-red-500 cursor-pointer"
                  />
                </button>
              </div>
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

      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <DrawerContent className="h-auto">
          <DrawerHeader>
            <DrawerTitle>Edit Investment</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto">
            <AddInvestment
              onSuccess={() => setEditOpen(false)}
              investmentInitialValues={{
                id: investment.id,
                name: investment.name,
                type: investment.type,
                assetIdentifier: investment.assetIdentifier,
                totalInvestment: investment.totalInvestment,
                quantity: investment.quantity,
                unit: investment.unit,
                date: investment.date,
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default InvestmentCard;
