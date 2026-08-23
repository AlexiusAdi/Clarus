"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  ArrowRight,
  ChevronRight,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { TransactionType } from "@/lib/generated/prisma/enums";
import Alert from "./Alert";
import { TopSpendingItem } from "@/app/Types";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { AddTransaction } from "./AddTransaction";
import { GoalDTO } from "@/lib/data/goals";
import { Category } from "@/lib/generated/prisma/browser";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      <Card
        className={cn(
          "p-0 w-full rounded-xl shadow-none hover:border-border/80 transition-colors active:scale-[0.99]",
          deleting && "opacity-50 pointer-events-none",
        )}
      >
        <CardHeader
          className="p-3 cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => setDetailOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setDetailOpen(true);
            }
          }}
        >
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
              <CardDescription className="flex items-baseline gap-1.5 text-xs mt-0.5 min-w-0">
                <span className="truncate min-w-0">
                  {transaction.type === TransactionType.SAVINGS
                    ? `Saved to goal`
                    : transaction.type === TransactionType.INVESTMENTS
                      ? `Investment`
                      : transaction.type === TransactionType.ASSETS
                        ? `Asset`
                        : transaction.description}
                </span>
                {transaction.group && (
                  <Link
                    href={`/groups/${transaction.group.id}`}
                    // Stops the click from bubbling into the card's own
                    // onClick (which opens the detail drawer instead); the
                    // two together also sidestep iOS Safari's two-tap-on-
                    // hover-styled-links quirk (see AppSidebar.tsx).
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 inline-flex items-center gap-1 font-semibold text-amber hover:underline"
                  >
                    <Users className="size-2.5" />
                    {transaction.group.name}
                  </Link>
                )}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditOpen(true);
                    }}
                    disabled={deleting}
                    aria-label="Edit transaction"
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(true);
                    }}
                    disabled={deleting}
                    aria-label="Delete transaction"
                    className="p-1 rounded-md text-muted-foreground hover:text-clay hover:bg-clay-soft active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* repositionInputs={false}: the iOS numeric keypad desyncs vaul's internal
          keyboardIsOpen flag and throws the drawer off-screen — see FloatingNav. */}
      <Drawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        repositionInputs={false}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Transaction details</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 drawer-safe overflow-y-auto flex flex-col gap-3 w-full max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "grid place-items-center size-11 rounded-2xl shrink-0",
                  isPositive(transaction.type)
                    ? "bg-sage-soft text-sage"
                    : "bg-clay-soft text-clay",
                )}
              >
                <ArrowRight
                  className={cn(
                    "size-5",
                    isPositive(transaction.type) ? "-rotate-45" : "rotate-45",
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground truncate">
                  {getLabel(transaction)}
                </p>
                <p
                  className={cn(
                    "headline tabular text-2xl",
                    isPositive(transaction.type) ? "text-sage" : "text-foreground",
                  )}
                >
                  {isPositive(transaction.type) ? "+" : "−"}{" "}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>

            {transaction.description && (
              <div className="rounded-xl bg-surface-2 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm leading-relaxed wrap-break-word">
                  {transaction.description}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2.5">
                <span className="text-xs text-muted-foreground">Date</span>
                <span className="text-sm font-medium">
                  {format(new Date(transaction.date), "EEEE, d MMMM yyyy")}
                </span>
              </div>
              {transaction.group && (
                <Link
                  href={`/groups/${transaction.group.id}`}
                  onClick={() => setDetailOpen(false)}
                  className="flex justify-between items-center px-3 py-2.5 active:bg-accent transition-colors"
                >
                  <span className="text-xs text-muted-foreground">Part of</span>
                  <span className="text-sm font-semibold text-amber flex items-center gap-1">
                    <Users className="size-3" />
                    {transaction.group.name}
                    <ChevronRight className="size-3 text-muted-foreground" />
                  </span>
                </Link>
              )}
              {transaction.type === TransactionType.SAVINGS &&
                transaction.goal && (
                  <div className="flex justify-between items-center px-3 py-2.5">
                    <span className="text-xs text-muted-foreground">
                      Contributed to
                    </span>
                    <span className="text-sm font-semibold">
                      {transaction.goal.name}
                    </span>
                  </div>
                )}
            </div>

            {isActionable && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setDetailOpen(false);
                    setEditOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground active:scale-95 transition"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDetailOpen(false);
                    setOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-clay/25 bg-clay-soft py-2.5 text-sm font-semibold text-clay active:scale-95 transition"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <Alert
        open={open}
        onOpenChange={setOpen}
        onPendingChange={setDeleting}
        apiUrl={`/api/user/transaction/${transaction.id}`}
        successMessage="Transaction deleted"
        description="This action cannot be undone. This will permanently delete this transaction."
      />

      {/* repositionInputs={false}: the iOS numeric keypad desyncs vaul's internal
          keyboardIsOpen flag and throws the drawer off-screen — see FloatingNav. */}
      <Drawer
        open={editOpen}
        onOpenChange={setEditOpen}
        repositionInputs={false}
      >
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
