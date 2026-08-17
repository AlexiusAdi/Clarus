"use client";

import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { TransactionType } from "@/lib/generated/prisma/enums";
import Alert from "./Alert";
import { TopSpendingItem } from "@/app/Types";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { AddTransaction } from "./AddTransaction";
import { GoalDTO } from "@/lib/data/goals";
import { Category } from "@/lib/generated/prisma/browser";
import { cn } from "@/lib/utils";

const TransactionCard = ({
  transaction,
  categories,
  goals,
}: {
  transaction: TopSpendingItem;
  categories: Category[];
  goals: GoalDTO[];
}) => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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

  const isActionable =
    transaction.type !== TransactionType.ASSETS &&
    transaction.type !== TransactionType.INVESTMENTS;

  return (
    <>
      <Card className="p-0 w-full rounded-xl shadow-none hover:border-border/80 transition-colors">
        <CardHeader className="p-3">
          <div className="flex w-full items-center gap-3 min-w-0">
            <div
              className={cn(
                "grid place-items-center size-9 rounded-xl shrink-0",
                isPositive(transaction.type)
                  ? "bg-sage-soft text-sage"
                  : "bg-clay-soft text-clay",
              )}
            >
              <ArrowRight
                className={cn(
                  "size-4",
                  isPositive(transaction.type) ? "-rotate-45" : "rotate-45",
                )}
              />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <CardTitle className="truncate text-sm">
                {getLabel(transaction)}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-xs wrap-break-word mt-0.5">
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
              <span
                className={cn(
                  "tabular text-sm font-semibold",
                  isPositive(transaction.type) ? "text-sage" : "text-foreground",
                )}
              >
                {isPositive(transaction.type) ? "+" : "−"}{" "}
                {formatCurrency(transaction.amount)}
              </span>
              {isActionable && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditOpen(true)}
                    aria-label="Edit transaction"
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setOpen(true)}
                    aria-label="Delete transaction"
                    className="p-1 rounded-md text-muted-foreground hover:text-clay hover:bg-clay-soft active:scale-95 transition"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Alert
        open={open}
        onOpenChange={setOpen}
        itemId={transaction.id}
        apiUrl={`/api/user/transaction/${transaction.id}`}
        successMessage="Transaction deleted"
        description="This action cannot be undone. This will permanently delete this transaction."
      />

      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Transaction</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 drawer-safe overflow-y-auto">
            <AddTransaction
              categories={categories}
              goals={goals}
              onSuccess={() => setEditOpen(false)}
              initialValues={{
                id: transaction.id,
                type: transaction.type as TransactionType,
                amount: transaction.amount,
                categoryId: transaction.category?.id ?? "",
                goalId: transaction.goal?.id ?? "",
                date: transaction.date,
                description: transaction.description,
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default TransactionCard;
