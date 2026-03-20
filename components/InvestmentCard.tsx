import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Coins, Trash2, TrendingUp } from "lucide-react";

const InvestmentCard = () => {
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
                <h1 className="font-bold">Gold Bars</h1>
                <span>Gold</span>
              </div>
              <div className="flex flex-col">
                <span className="text-right">Rp 17.200.000</span>
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
                  <span>Rp 15.000.000</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Purchase Date</span>
                  <span>Jan 1, 2026</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex-1 bg-accent rounded-xl p-1.5 mr-3">
                <span>10g at Rp 850.000/g</span>
              </div>
              <Trash2
                width={20}
                height={20}
                className="text-red-500 hover:text-red-700 cursor-pointer"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentCard;
