"use client";

import { useState } from "react";
import { TopSpendingItem } from "@/constants";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Spinner } from "./ui/spinner";
import { TransactionType } from "@/lib/generated/prisma/enums";

const TransactionCard = ({ transaction }: { transaction: TopSpendingItem }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const res = await fetch(`/api/user/transaction/${transaction.id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      toast.success("Transaction deleted", { position: "top-center" });
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete transaction",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="p-1 w-full">
        <CardHeader className="p-3">
          <div className="flex w-full items-center gap-1">
            <div>
              {transaction.type === TransactionType.INCOME ? (
                <ArrowRight className="inline-block mr-2 text-green-500 -rotate-45" />
              ) : (
                <ArrowRight className="inline-block mr-2 text-red-500 rotate-45" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate">
                {transaction.category?.name}
              </CardTitle>
              <CardDescription className="truncate">
                {transaction.description}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-md font-bold">
                Rp {transaction.amount.toLocaleString()}
              </span>
              <button disabled={isDeleting} onClick={() => setOpen(true)}>
                <Trash2
                  width={16}
                  height={16}
                  className={
                    isDeleting
                      ? "text-red-300 cursor-not-allowed"
                      : "text-red-500 cursor-pointer"
                  }
                />
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {isDeleting ? <Spinner /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TransactionCard;
