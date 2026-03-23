"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { SmallCard } from "./SmallCard";
import { UserNetWorth } from "@/app/Types";

interface NetWorthCardProps {
  userNetWorth?: UserNetWorth; // optional
}

const NetWorthCard = ({ userNetWorth }: NetWorthCardProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  // Safe defaults
  const income = userNetWorth?.totalIncome ?? 0;
  const expense = userNetWorth?.totalExpense ?? 0;
  const netWorth = userNetWorth?.netWorth ?? 0;

  const cashBalance = userNetWorth?.cashBalance ?? 0;
  const totalInvestments = userNetWorth?.totalInvestments ?? 0;

  return (
    <div>
      <Card className="bg-obsidian text-white @2xs/main:gap-3">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl opacity-90">Total Net Worth</CardTitle>
          <button
            onClick={toggleVisibility}
            aria-label={isVisible ? "Hide amount" : "Show amount"}
            className="hover:opacity-70 transition"
          >
            {isVisible ? (
              <Eye className="w-6 h-6" />
            ) : (
              <EyeOff className="w-6 h-6" />
            )}
          </button>
        </CardHeader>

        <CardContent className="text-3xl">
          {isVisible ? netWorth : "******"}
        </CardContent>

        <CardContent className="flex justify-between gap-2">
          <Card className="w-50 @xs/main:gap-0 bg-stellyIce border-stellyIce text-white/70">
            <CardHeader className="text-bold @2xs/main:text-md @2xs/main:px-3 @md/main:px-6">
              <CardTitle>Cash Balance</CardTitle>
            </CardHeader>
            <CardContent className="@2xs/main:px-3 @md/main:px-6 font-semibold @2xs/main:text-md @md/main:text-lg">
              {cashBalance}
            </CardContent>
          </Card>

          <Card className="w-50 @xs/main:gap-0 bg-stellyIce border-stellyIce text-white/70">
            <CardHeader className="text-bold @2xs/main:text-md @2xs/main:px-3 @md/main:px-6">
              <CardTitle>Investments</CardTitle>
            </CardHeader>
            <CardContent className="@2xs/main:px-3 @md/main:px-6 font-semibold @2xs/main:text-md @md/main:text-lg">
              {totalInvestments}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="flex gap-2 py-3">
        <SmallCard
          header="Income"
          amount={income}
          icon={
            <ArrowRight className="inline-block mr-2 text-green-500 rotate-320" />
          }
          isVisible={isVisible}
        />
        <SmallCard
          header="Expenses"
          amount={expense}
          icon={
            <ArrowRight className="inline-block mr-2 text-red-500 rotate-30" />
          }
          isVisible={isVisible}
        />
      </div>
    </div>
  );
};

export default NetWorthCard;
