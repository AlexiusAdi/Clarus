import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Coins, Trash2, TrendingUp } from "lucide-react";
import { Investment } from "@/lib/generated/prisma/browser";
import Alert from "./Alert";

const InvestmentCard = ({ investment }: { investment: Investment }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col">
      <Card className="w-full">
        <CardContent>
          <Coins
            width={32}
            height={32}
            className="text-yellow-500 bg-amber-200 rounded-md p-2"
          />
          <div className="grid-span-11 flex flex-col gap-3">
            <div className="flex justify-between pt-2">
              <div>
                <h1 className="font-bold">{investment.name}</h1>
                <span>{investment.assetIdentifier}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-right">
                  {investment.costPerUnit?.toLocaleString("id-ID")}
                </span>
                <span className="text-green-500 flex items-center gap-1">
                  <TrendingUp width={16} height={16} />
                  +2.5%
                  <span>Rp 200.000</span>
                </span>
              </div>
            </div>
            <div className="flex">
              <div className="w-100 grid grid-cols-2">
                <div className="flex flex-col">
                  <span className="font-semibold">Invested</span>
                  <span>{investment.costPerUnit?.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Purchase Date</span>
                  <span>{investment.date.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex-1 bg-accent rounded-xl p-1.5 mr-3">
                <span>
                  {investment.quantity} {investment.unit} at Rp{" "}
                  {investment.costPerUnit?.toLocaleString("id-ID")}
                </span>
              </div>
              <button onClick={() => setOpen(true)}>
                <Trash2
                  width={16}
                  height={16}
                  className="text-red-500 cursor-pointer"
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert
        open={open}
        onOpenChange={setOpen}
        apiUrl={`/api/user/investment/${investment.id}`}
        successMessage="Investment deleted"
        description="This action cannot be undone. This will permanently delete this investment."
      />
    </div>
  );
};

export default InvestmentCard;
