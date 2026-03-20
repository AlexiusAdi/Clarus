import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Trash2 } from "lucide-react";

const TransactionCard = () => {
  return (
    <div className="flex flex-col gap-2">
      <span>Mar 10, 2026</span>
      <Card className="p-1 w-full">
        <CardHeader className="p-3">
          <div className="grid grid-cols-2 items-center">
            <div>
              <CardTitle>Salary</CardTitle>
              <CardDescription>Received monthly salary</CardDescription>
            </div>
            <div className="flex items-center justify-end gap-1">
              <span className="text-md font-bold">Rp 5,000,000</span>
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
