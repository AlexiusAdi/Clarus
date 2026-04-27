"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { SmallCard } from "./SmallCard";
import { UserNetWorth } from "@/app/Types";
import { NumericFormat } from "react-number-format";

interface NetWorthCardProps {
  userNetWorth: UserNetWorth;
}

const VISIBILITY_KEY = "clarus_networth_visible";

export default function NetWorthCard({ userNetWorth }: NetWorthCardProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const {
    totalIncome = 0,
    totalExpense = 0,
    netWorth = 0,
    cashBalance = 0,
    totalInvestments = 0,
  } = userNetWorth ?? {};

  const hasData =
    totalIncome > 0 ||
    totalExpense > 0 ||
    cashBalance > 0 ||
    netWorth > 0 ||
    totalInvestments > 0;

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(VISIBILITY_KEY);
    if (stored !== null) {
      setIsVisible(stored === "true");
    }
  }, []);

  if (!mounted) return null;

  const toggleVisibility = () => {
    setIsVisible((prev) => {
      const next = !prev;
      localStorage.setItem(VISIBILITY_KEY, String(next));
      return next;
    });
  };

  return (
    <>
      <Card className="bg-obsidian text-white @2xs/main:gap-3 shadow-md">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl opacity-90">Total Net Worth</CardTitle>
          {mounted ? (
            hasData && (
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
            )
          ) : (
            <span className="text-sm opacity-50">Loading...</span>
          )}
        </CardHeader>

        <CardContent className="text-3xl">
          {!hasData || netWorth === 0 ? (
            <span className="text-base opacity-50">No transactions Yet</span>
          ) : isVisible ? (
            <NumericFormat
              value={netWorth}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="Rp "
            />
          ) : (
            "******"
          )}
        </CardContent>

        <CardContent className="flex justify-center gap-2 w-full">
          <Card className="flex-1 @xs/main:gap-0 bg-stellyIce border-stellyIce text-white/70">
            <CardHeader className="text-bold @2xs/main:text-md @2xs/main:px-3 @md/main:px-6">
              <CardTitle>Cash Balance</CardTitle>
            </CardHeader>
            <CardContent className="@2xs/main:px-3 @md/main:px-6 font-semibold @2xs/main:text-md @md/main:text-lg">
              {!hasData || cashBalance === 0 ? (
                <span className="text-base opacity-50">No transactions</span>
              ) : isVisible ? (
                <NumericFormat
                  value={cashBalance}
                  displayType="text"
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp "
                />
              ) : (
                "*******"
              )}
            </CardContent>
          </Card>

          <Card className="flex-1 @xs/main:gap-0 bg-stellyIce border-stellyIce text-white/70">
            <CardHeader className="text-bold @2xs/main:text-md @2xs/main:px-3 @md/main:px-6">
              <CardTitle>Investments</CardTitle>
            </CardHeader>
            <CardContent className="@2xs/main:px-3 @md/main:px-6 font-semibold @2xs/main:text-md @md/main:text-lg">
              {!hasData || totalInvestments == 0 ? (
                <span className="text-base opacity-50">No transactions</span>
              ) : isVisible ? (
                <NumericFormat
                  value={totalInvestments}
                  displayType="text"
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp "
                />
              ) : (
                "*******"
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="flex gap-2 py-3">
        <SmallCard
          header="Income"
          amount={totalIncome}
          icon={
            <ArrowRight className="inline-block mr-2 text-green-500 -rotate-45 shadow-accent" />
          }
          isVisible={isVisible}
        />
        <SmallCard
          header="Expenses"
          amount={totalExpense}
          icon={
            <ArrowRight className="inline-block mr-2 text-red-500 rotate-45 shadow-accent" />
          }
          isVisible={isVisible}
        />
      </div>
    </>
  );
}
