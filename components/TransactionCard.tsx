import { TopSpendingItem } from "@/constants";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Trash2 } from "lucide-react";

const TransactionCard = ({ transaction }: { transaction: TopSpendingItem }) => {
  return (
    <div className="flex flex-col gap-2">
      <Card className="p-1 w-full">
        <CardHeader className="p-3">
          <div className="grid grid-cols-2 items-center">
            <div>
              <CardTitle>{transaction.category?.name}</CardTitle>
              <CardDescription>{transaction.description}</CardDescription>
            </div>
            <div className="flex items-center justify-end gap-1">
              <span className="text-md font-bold">
                Rp {transaction.amount.toLocaleString()}
              </span>
              <Trash2
                width={16}
                height={16}
                className="text-red-500 cursor-pointer"
              />
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default TransactionCard;
