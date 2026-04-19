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

  return (
    <>
      <Card className="p-1 w-full">
        <CardHeader className="p-3">
          <div className="flex w-full items-start gap-1 min-w-0">
            <div className="mt-1">
              {isPositive(transaction.type) ? (
                <ArrowRight className="inline-block mr-2 text-green-500 -rotate-45" />
              ) : (
                <ArrowRight className="inline-block mr-2 text-red-500 rotate-45" />
              )}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <CardTitle className="truncate">
                {getLabel(transaction)}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-xs wrap-break-word">
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
        </CardHeader>
      </Card>

      <Alert
        open={open}
        onOpenChange={setOpen}
        apiUrl={`/api/user/transaction/${transaction.id}`}
        successMessage="Transaction deleted"
        description="This action cannot be undone. This will permanently delete this transaction."
      />

      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Transaction</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto">
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
