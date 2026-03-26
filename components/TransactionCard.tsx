"use client";

import { useState } from "react";
import { TopSpendingItem } from "@/constants";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowRight, Trash2 } from "lucide-react";
import { TransactionType } from "@/lib/generated/prisma/enums";
import Alert from "./Alert";

const TransactionCard = ({ transaction }: { transaction: TopSpendingItem }) => {
  const [open, setOpen] = useState(false);

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
