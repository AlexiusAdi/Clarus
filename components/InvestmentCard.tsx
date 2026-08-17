"use client";

import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Pencil, Trash2, TrendingUp } from "lucide-react";
import Alert from "./Alert";
import { cn } from "@/lib/utils";
import { TYPE_ICON } from "@/constants";
import { InvestmentDTO } from "@/lib/data/investments";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { AddInvestment } from "./AddInvestment";

type Props = {
  investment: InvestmentDTO;
};

const InvestmentCard = ({ investment }: Props) => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const Icon = TYPE_ICON[investment.type].icon;
  const iconStyle = TYPE_ICON[investment.type].className;

  const isOther = investment.type === "OTHER";

  const profit = investment.pnlAbs;
  const percent = investment.pnlPct;
  const isUp = profit !== null ? profit >= 0 : null;
  const marketPricePerLot =
    investment.currentPriceIdr !== null
      ? investment.currentPriceIdr * 100
      : null;

  return (
    <div className="flex flex-col">
      <Card className="w-full rounded-2xl shadow-none">
        <CardContent className="p-4 flex gap-3">
          <Icon className={cn("rounded-xl p-2.5 size-10 shrink-0", iconStyle)} />

          <div className="flex flex-col gap-3 w-full min-w-0">
            {/* Header */}
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-semibold truncate">{investment.name}</h1>
                {!isOther && (
                  <span className="text-xs text-muted-foreground">
                    {investment.assetIdentifier}
                  </span>
                )}
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="tabular headline text-lg">
                  {formatCurrency(investment.totalInvestment)}
                </span>

                {isOther ? (
                  <span className="text-muted-foreground text-xs">
                    No price tracking
                  </span>
                ) : profit !== null ? (
                  <span
                    className={cn(
                      "tabular flex items-center gap-1 text-xs font-semibold mt-0.5",
                      isUp ? "text-sage" : "text-clay",
                    )}
                  >
                    <TrendingUp
                      className={cn("size-3.5", !isUp && "rotate-180")}
                    />
                    {percent!.toFixed(2)}%
                    <span className="text-muted-foreground font-medium">
                      {formatCurrency(profit)}
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">
                    No price data
                  </span>
                )}
              </div>
            </div>

            {/* Market price row — hidden for OTHER */}
            {!isOther && (
              <div className="flex justify-between gap-2 text-xs">
                <span className="text-muted-foreground font-medium">
                  Market Price / LOT
                </span>
                <span className="tabular font-semibold">
                  {marketPricePerLot !== null
                    ? formatCurrency(marketPricePerLot)
                    : "-"}
                </span>
              </div>
            )}

            {/* Bottom */}
            <div className="flex justify-between items-center gap-3">
              <div className="flex-1 min-w-0 truncate bg-surface-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground">
                {isOther ? (
                  <span>
                    {formatCurrency(investment.totalInvestment)} total
                  </span>
                ) : (
                  <span>
                    Qty : {investment.quantity} {investment.unit} —{" "}
                    {formatCurrency(investment.costPerUnit)} /{" "}
                    {investment.unit === "shares"
                      ? "share"
                      : investment.unit === "lots"
                        ? "lot"
                        : investment.unit}
                  </span>
                )}
              </div>

              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setEditOpen(true)}
                  aria-label="Edit investment"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => setOpen(true)}
                  aria-label="Delete investment"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-clay hover:bg-clay-soft active:scale-95 transition"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert
        open={open}
        onOpenChange={setOpen}
        itemId={investment.id}
        apiUrl={`/api/user/investment/${investment.id}`}
        successMessage="Investment deleted"
        description="This action cannot be undone."
      />

      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <DrawerContent className="h-auto">
          <DrawerHeader>
            <DrawerTitle>Edit Investment</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 drawer-safe overflow-y-auto">
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
