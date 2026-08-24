"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { SmallCard } from "./SmallCard";
import { UserNetWorth } from "@/app/Types";
import { NumericFormat } from "react-number-format";
import { Button } from "./ui/button";
import { GoalDTO } from "@/lib/data/goals";
import { GroupDTO } from "@/lib/data/groups";
import { useRouter } from "next/navigation";
import { getGoalsSummary } from "@/lib/data/getGoalsSummary";
import { PlanType, GroupStatus } from "@/lib/generated/prisma/browser";
import { cn } from "@/lib/utils";
import { Users2 } from "lucide-react";

const VISIBILITY_KEY = "clarus_networth_visible";

export default function NetWorthCard({
  userNetWorth,
  goals,
  showGoals = false,
  groups = [],
  showGroups = false,
  userPlan,
}: {
  userNetWorth: UserNetWorth;
  goals: GoalDTO[];
  showGoals?: boolean;
  groups?: GroupDTO[];
  showGroups?: boolean;
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
    periodCashFlow = 0,
    investmentsCurrentValue = null,
    investmentsPnlAbs = null,
    investmentsPnlPct = null,
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
  const activeGroups = groups.filter((g) => g.status === GroupStatus.ACTIVE);
  const withinBudgetGroups = activeGroups.filter((g) => g.remaining >= 0);

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
          </div>
        </CardHeader>

        <CardContent className="relative flex justify-between items-start">
          <span className="headline tabular text-4xl @md/main:text-5xl leading-none">
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

        <CardContent>
          <div className="flex justify-between items-center gap-1.5 @md/main:hidden">
            {showGoals && (
              <Button
                onClick={() => router.push("/goals")}
                size="sm"
                className={cn(
                  "rounded-full h-7 px-3 text-xs font-semibold bg-transparent transition-colors",
                  activeGoals.length > 0
                    ? // This card stays dark regardless of app theme, but sage-soft
                      // is a theme-aware token that flips dark in dark mode — pin
                      // it to the light-mode value so it's always legible here.
                      "text-[oklch(0.943_0.021_152)] border border-[oklch(0.943_0.021_152)]/35 bg-[oklch(0.943_0.021_152)]/10 hover:bg-[oklch(0.943_0.021_152)]/20"
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
            {showGroups && (
              <Button
                onClick={() => router.push("/groups")}
                size="sm"
                className={cn(
                  "rounded-full h-7 px-3 text-xs font-semibold bg-transparent transition-colors",
                  activeGroups.length > 0
                    ? "text-sand border border-sand/35 bg-sand/10 hover:bg-sand/20"
                    : "text-porcelinwhite/60 border border-porcelinwhite/20 bg-porcelinwhite/5 hover:bg-porcelinwhite/10",
                )}
              >
                <Users2 className="w-3 h-3" />
                {activeGroups.length > 0
                  ? `${withinBudgetGroups.length} of ${activeGroups.length} on budget`
                  : "Start a group"}
              </Button>
            )}
          </div>
        </CardContent>

        <CardContent className="relative flex flex-col gap-1.5 w-full">
          {/* Cash Balance — the lifetime running total net worth depends on,
              plus a separate "this period" flow line so it's clear that
              second number isn't part of the balance itself. */}
          <div className="flex items-center justify-between gap-3 rounded-xl bg-porcelinwhite/6 border border-porcelinwhite/10 px-3 py-2.5 @md/main:px-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-porcelinwhite/50">
              Cash Balance
            </p>
            <div className="text-right">
              <p className="tabular font-semibold text-sm @md/main:text-base">
                {!hasData || cashBalance === 0 ? (
                  <span className="text-sm font-normal opacity-50">—</span>
                ) : isVisible ? (
                  <NumericFormat
                    value={cashBalance}
                    displayType="text"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="Rp "
                    decimalScale={0}
                  />
                ) : (
                  "••••••"
                )}
              </p>
              {hasData && (
                <p className="tabular text-[10px] font-semibold mt-0.5">
                  <span className="text-porcelinwhite/45 font-medium">
                    This month{" "}
                  </span>
                  {isVisible ? (
                    <span
                      // This card stays dark regardless of app theme — pinned
                      // to the dark-mode sage/clay values (see the goals
                      // button above) so it stays legible in light mode too.
                      className={
                        periodCashFlow >= 0
                          ? "text-[oklch(0.7_0.09_152)]"
                          : "text-[oklch(0.68_0.13_32)]"
                      }
                    >
                      {periodCashFlow >= 0 ? "+" : "−"}
                      <NumericFormat
                        value={Math.abs(periodCashFlow)}
                        displayType="text"
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="Rp "
                        decimalScale={0}
                      />
                    </span>
                  ) : (
                    "••••••"
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Investments — headline is current market value (falls back to
              cost when no holding has a price yet), with return % and what
              was actually put in on the same secondary line beneath it. */}
          <div className="flex items-center justify-between gap-3 rounded-xl bg-porcelinwhite/6 border border-porcelinwhite/10 px-3 py-2.5 @md/main:px-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-porcelinwhite/50">
              Investments
            </p>
            <div className="text-right">
              <p className="tabular font-semibold text-sm @md/main:text-base">
                {!hasData || totalInvestments === 0 ? (
                  <span className="text-sm font-normal opacity-50">—</span>
                ) : isVisible ? (
                  <NumericFormat
                    value={investmentsCurrentValue ?? totalInvestments}
                    displayType="text"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="Rp "
                    decimalScale={0}
                  />
                ) : (
                  "••••••"
                )}
              </p>
              {hasData && totalInvestments > 0 && isVisible && (
                <p className="tabular flex items-center justify-end gap-1 text-[10px] font-semibold mt-0.5">
                  {investmentsPnlPct !== null && (
                    <span
                      // Pinned to the dark-mode sage/clay values — see the
                      // "This month" line above for why.
                      className={cn(
                        "flex items-center gap-0.5",
                        investmentsPnlAbs !== null && investmentsPnlAbs >= 0
                          ? "text-[oklch(0.7_0.09_152)]"
                          : "text-[oklch(0.68_0.13_32)]",
                      )}
                    >
                      <ArrowRight
                        className={cn(
                          "size-2.5",
                          investmentsPnlAbs !== null &&
                            investmentsPnlAbs >= 0
                            ? "-rotate-45"
                            : "rotate-45",
                        )}
                      />
                      {investmentsPnlPct >= 0 ? "+" : "−"}
                      {Math.abs(investmentsPnlPct).toFixed(1)}%
                    </span>
                  )}
                  <span className="text-porcelinwhite/45">
                    &middot; Invested{" "}
                    <NumericFormat
                      value={totalInvestments}
                      displayType="text"
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="Rp "
                      decimalScale={0}
                    />
                  </span>
                </p>
              )}
            </div>
          </div>
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
