"use client";

import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowRight, Trash2 } from "lucide-react";
import { TransactionType } from "@/lib/generated/prisma/enums";
import Alert from "./Alert";
import { TopSpendingItem } from "@/app/Types";
import { formatCurrency } from "@/lib/helper/formatCurrency";

const TransactionCard = ({ transaction }: { transaction: TopSpendingItem }) => {
  const [open, setOpen] = useState(false);

  const getLabel = (transaction: TopSpendingItem) => {
    if (transaction.category?.name) return transaction.category.name;
    switch (transaction.type) {
      case TransactionType.SAVINGS:
        return transaction.goal?.name ?? "Savings";
      case TransactionType.INVESTMENTS:
        return "Investment";
      case TransactionType.ASSETS:
        return "Asset";
      default:
        return "Unknown";
    }
  };

  const isPositive = (type: string) =>
    type === TransactionType.INCOME ||
    type === TransactionType.ASSETS ||
    type === TransactionType.INVESTMENTS;

  return (
    <>
      <Card className="p-1 w-full">
        <CardHeader className="p-3">
          <div className="flex w-full items-center gap-1">
            <div>
              {isPositive(transaction.type) ? (
                <ArrowRight className="inline-block mr-2 text-green-500 -rotate-45" />
              ) : (
                <ArrowRight className="inline-block mr-2 text-red-500 rotate-45" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate">
                {getLabel(transaction)}
              </CardTitle>
              <CardDescription className="truncate">
                {transaction.type === TransactionType.SAVINGS
                  ? `Saved to goal`
                  : transaction.type === TransactionType.INVESTMENTS
                    ? `Investment`
                    : transaction.type === TransactionType.ASSETS
                      ? `Asset`
                      : transaction.description}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-md font-bold">
                {formatCurrency(transaction.amount)}
              </span>
              <button onClick={() => setOpen(true)}>
                <Trash2
                  width={16}
                  height={16}
                  className="text-red-500 cursor-pointer"
                />
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Alert
        open={open}
        onOpenChange={setOpen}
        apiUrl={`/api/user/transaction/${transaction.id}`}
        successMessage="Transaction deleted"
        description="This action cannot be undone. This will permanently delete this transaction."
      />
    </>
  );
};

export default TransactionCard;
