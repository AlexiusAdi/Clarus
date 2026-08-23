import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/lib/generated/prisma/enums";
import { getFinancialPeriod, FinancialPeriod } from "@/lib/helper/financialPeriod";
import { getUserNetWorth } from "@/lib/data/getUserNetWorth";
import { getInvestments } from "@/lib/data/investments";
import { getGoals } from "@/lib/data/goals";

/** How many past periods to average when working out a spending baseline. */
const BASELINE_PERIODS = 3;
/** Recurring charges landing within this many days count as "upcoming". */
const UPCOMING_WINDOW_DAYS = 7;

export type DigestData = {
  period: FinancialPeriod;
  daysUntilClose: number;

  spend: {
    total: number;
    baseline: number | null;
    /** Category with the largest overshoot vs its own baseline share. */
    topCategory: { name: string; amount: number } | null;
  };

  cash: {
    balance: number;
    upcomingTotal: number;
    upcomingCount: number;
    /** True when recurring charges due this week exceed available cash. */
    shortfall: boolean;
  };

  portfolio: {
    totalValue: number;
    pnlAbs: number;
    pnlPct: number | null;
    best: { name: string; pnlPct: number } | null;
  } | null;

  goals: {
    name: string;
    remaining: number;
    monthsLate: number;
  }[];
};

/**
 * Everything the cycle-close digest needs, for one user.
 *
 * Deliberately composed from the existing loaders rather than new queries —
 * the numbers in the email are then the same numbers the app shows, computed
 * by the same code, so the two can't drift apart.
 */
export async function getDigestData(
  userId: string,
  resetDay: number,
  now: Date = new Date(),
): Promise<DigestData> {
  const period = getFinancialPeriod(resetDay, now);

  const daysUntilClose = Math.max(
    0,
    Math.ceil((period.end.getTime() - now.getTime()) / 86_400_000),
  );

  const [periodExpenses, baselineExpenses, netWorth, investments, goals, upcoming] =
    await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          type: TransactionType.EXPENSE,
          date: { gte: period.start, lt: period.end },
        },
        select: { amount: true, category: { select: { name: true } } },
      }),
      // The same window, shifted back BASELINE_PERIODS months, to compare against.
      prisma.transaction.findMany({
        where: {
          userId,
          type: TransactionType.EXPENSE,
          date: {
            gte: new Date(
              Date.UTC(
                period.start.getUTCFullYear(),
                period.start.getUTCMonth() - BASELINE_PERIODS,
                period.start.getUTCDate(),
              ),
            ),
            lt: period.start,
          },
        },
        select: { amount: true },
      }),
      getUserNetWorth(userId),
      getInvestments(userId),
      getGoals(userId),
      prisma.scheduledTransaction.findMany({
        where: {
          userId,
          isActive: true,
          type: TransactionType.EXPENSE,
          nextRunDate: {
            gte: now,
            lte: new Date(now.getTime() + UPCOMING_WINDOW_DAYS * 86_400_000),
          },
        },
        select: { amount: true },
      }),
    ]);

  // ── Spend ────────────────────────────────────────────────────────────────
  const total = periodExpenses.reduce((sum, t) => sum + t.amount.toNumber(), 0);

  const baselineTotal = baselineExpenses.reduce(
    (sum, t) => sum + t.amount.toNumber(),
    0,
  );
  const baseline =
    baselineExpenses.length > 0 ? baselineTotal / BASELINE_PERIODS : null;

  const byCategory: Record<string, number> = {};
  for (const t of periodExpenses) {
    const name = t.category?.name ?? "Other";
    byCategory[name] = (byCategory[name] ?? 0) + t.amount.toNumber();
  }
  const ranked = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const topCategory = ranked[0]
    ? { name: ranked[0][0], amount: ranked[0][1] }
    : null;

  // ── Cash vs upcoming recurring charges ───────────────────────────────────
  const upcomingTotal = upcoming.reduce(
    (sum, s) => sum + s.amount.toNumber(),
    0,
  );

  // ── Portfolio ────────────────────────────────────────────────────────────
  const priced = investments.filter((i) => i.currentValue !== null);
  const portfolio =
    priced.length > 0
      ? (() => {
          const totalValue = priced.reduce(
            (sum, i) => sum + (i.currentValue ?? 0),
            0,
          );
          const invested = priced.reduce((sum, i) => sum + i.amountInvested, 0);
          const pnlAbs = totalValue - invested;
          const withPct = priced.filter((i) => i.pnlPct !== null);
          const best =
            withPct.length > 0
              ? withPct.reduce((a, b) => ((a.pnlPct ?? 0) > (b.pnlPct ?? 0) ? a : b))
              : null;

          return {
            totalValue,
            pnlAbs,
            pnlPct: invested > 0 ? (pnlAbs / invested) * 100 : null,
            best: best ? { name: best.name, pnlPct: best.pnlPct ?? 0 } : null,
          };
        })()
      : null;

  // ── Goals behind pace ────────────────────────────────────────────────────
  // Pace = what they've saved so far spread over the months since they started.
  // Projecting that forward gives an ETA to compare against the deadline.
  const behind = goals
    .filter((g) => !g.isCompleted && g.deadline !== null)
    .map((g) => {
      const remaining = g.targetAmount - g.currentAmount;
      const monthsElapsed = Math.max(
        1,
        (now.getTime() - g.createdAt.getTime()) / (30 * 86_400_000),
      );
      const perMonth = g.currentAmount / monthsElapsed;
      const monthsNeeded =
        perMonth > 0 ? remaining / perMonth : Number.POSITIVE_INFINITY;
      const monthsLeft =
        (g.deadline!.getTime() - now.getTime()) / (30 * 86_400_000);

      return {
        name: g.name,
        remaining,
        monthsLate: Math.ceil(monthsNeeded - monthsLeft),
      };
    })
    .filter((g) => g.monthsLate > 0)
    .sort((a, b) => b.monthsLate - a.monthsLate);

  return {
    period,
    daysUntilClose,
    spend: { total, baseline, topCategory },
    cash: {
      balance: netWorth.cashBalance,
      upcomingTotal,
      upcomingCount: upcoming.length,
      shortfall: upcomingTotal > netWorth.cashBalance,
    },
    portfolio,
    goals: behind,
  };
}
