"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { SmallCard } from "./SmallCard";
import { UserNetWorth } from "@/app/Types";
import { NumericFormat } from "react-number-format";
import { Button } from "./ui/button";
import { GoalDTO } from "@/lib/data/goals";
import { useRouter } from "next/navigation";
import { getGoalsSummary } from "@/lib/helper/getGoalsSummary";
import { PlanType } from "@/lib/generated/prisma/browser";
import { cn } from "@/lib/utils";

const VISIBILITY_KEY = "clarus_networth_visible";

export default function NetWorthCard({
  userNetWorth,
  goals,
  showGoals = false,
  userPlan,
}: {
  userNetWorth: UserNetWorth;
  goals: GoalDTO[];
  showGoals?: boolean;
  userPlan: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const {
    totalIncome = 0,
    totalExpense = 0,
    netWorth = 0,
    cashBalance = 0,
    totalInvestments = 0,
  } = userNetWorth ?? {};

  // Accent wash layered over the ink card — keeps every plan on the same
  // warm base so only the glow differs, rather than three different cards.
  const planGlow =
    userPlan === PlanType.ELITE
      ? "bg-[radial-gradient(circle_at_top_right,var(--sand),transparent_62%)] opacity-25"
      : userPlan === PlanType.PRO
        ? "bg-[radial-gradient(circle_at_top_right,var(--chart-5),transparent_62%)] opacity-25"
        : "bg-[radial-gradient(circle_at_top_right,var(--amber),transparent_62%)] opacity-15";

  const router = useRouter();

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

  const { activeGoals, onTrackGoals } = getGoalsSummary(goals);

  return (
    <>
      <Card className="relative overflow-hidden bg-obsidian text-porcelinwhite border-0 gap-3 shadow-lg shadow-ink/25 rounded-2xl">
        <div
          className={cn("pointer-events-none absolute inset-0", planGlow)}
          aria-hidden
        />
        <CardHeader className="relative pb-0">
          <span className="text-[10px] font-bold tracking-[0.11em] uppercase px-2.5 py-1 rounded-full bg-sand/10 text-sand border border-sand/30 w-fit">
            ✦ {userPlan} plan
          </span>
        </CardHeader>
        <CardHeader className="relative flex justify-between items-center">
          <div className="flex justify-between items-center w-full">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.13em] text-porcelinwhite/55">
              Total Net Worth
            </CardTitle>
            {showGoals && (
              <Button
                onClick={() => router.push("/goals")}
                size="sm"
                className={cn(
                  "rounded-full h-7 px-3 text-xs font-semibold bg-transparent transition-colors @md/main:hidden",
                  activeGoals.length > 0
                    ? "text-sage-soft border border-sage-soft/35 bg-sage-soft/10 hover:bg-sage-soft/20"
                    : "text-porcelinwhite/60 border border-porcelinwhite/20 bg-porcelinwhite/5 hover:bg-porcelinwhite/10",
                )}
              >
                {activeGoals.length > 0 ? (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="8" cy="8" r="6.5" />
                      <path
                        d="M5 8.5l2 2 4-4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {onTrackGoals.length} of {activeGoals.length} on track
                  </>
                ) : (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="8" cy="8" r="6.5" />
                      <path d="M8 5v3l1.5 1.5" strokeLinecap="round" />
                    </svg>
                    Set a goal
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative flex justify-between items-start">
          <span className="font-display tabular text-4xl @md/main:text-5xl leading-none">
            {!hasData || netWorth === 0 ? (
              <span className="font-sans text-base opacity-50">
                No transactions yet
              </span>
            ) : isVisible ? (
              <NumericFormat
                value={netWorth}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="Rp "
              />
            ) : (
              "••••••"
            )}
          </span>
          {hasData && (
            <button
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide amount" : "Show amount"}
              className="shrink-0 text-porcelinwhite/50 hover:text-porcelinwhite transition-colors"
            >
              {isVisible ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          )}
        </CardContent>

        <CardContent className="relative grid grid-cols-2 gap-2 w-full">
          {[
            { label: "Cash Balance", value: cashBalance },
            { label: "Investments", value: totalInvestments },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl bg-porcelinwhite/[0.06] border border-porcelinwhite/10 px-3 py-2.5 @md/main:px-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-porcelinwhite/50">
                {label}
              </p>
              <p className="tabular font-semibold text-base @md/main:text-lg mt-1">
                {!hasData || value === 0 ? (
                  <span className="text-sm font-normal opacity-50">—</span>
                ) : isVisible ? (
                  <NumericFormat
                    value={value}
                    displayType="text"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="Rp "
                  />
                ) : (
                  "••••••"
                )}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2 py-3">
        <SmallCard
          header="Income"
          amount={totalIncome}
          icon={<ArrowRight className="w-4 h-4 text-sage -rotate-45" />}
          isVisible={isVisible}
        />
        <SmallCard
          header="Expenses"
          amount={totalExpense}
          icon={<ArrowRight className="w-4 h-4 text-clay rotate-45" />}
          isVisible={isVisible}
        />
      </div>
    </>
  );
}
