import { prisma } from "@/lib/prisma";
import { TransactionType } from "../generated/prisma/browser";
import {
  DEFAULT_RESET_DAY,
  FinancialPeriod,
  getFinancialPeriod,
} from "@/lib/helper/financialPeriod";

export type TransactionDTO = {
  id: string;
  amount: number;
  type: TransactionType;
  date: Date;
  createdAt: Date;
  description: string | null;
  category: { name: string; id: string } | null;
  goal: { name: string; id: string } | null;
  group: { name: string; id: string } | null;
};

export type OverviewDataDTO = {
  /** Total EXPENSE inside the user's current financial period. */
  currentMonthTotal: number;
  topSpending: TransactionDTO[];
  spendingByCategory: { category: string; amount: number }[];
  period: FinancialPeriod;
};

const RECENT_ACTIVITY_COUNT = 3;

export async function getOverviewData(
  userId: string,
  resetDay: number = DEFAULT_RESET_DAY,
): Promise<OverviewDataDTO> {
  const period = getFinancialPeriod(resetDay);

  // Two scoped queries rather than one unbounded findMany: the spend aggregates
  // belong to the current period, while Recent Activities is a most-recent list
  // that must survive the reset day (otherwise the whole Overview tab renders
  // empty every time a new period starts).
  const [periodExpenses, recent] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: { gte: period.start, lt: period.end },
      },
      select: {
        amount: true,
        category: { select: { name: true } },
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        type: {
          in: [
            TransactionType.EXPENSE,
            TransactionType.INCOME,
            TransactionType.SAVINGS,
          ],
        },
      },
      orderBy: { date: "desc" },
      take: RECENT_ACTIVITY_COUNT,
      select: {
        id: true,
        amount: true,
        type: true,
        date: true,
        createdAt: true,
        category: { select: { name: true, id: true } },
        goal: { select: { name: true, id: true } },
        group: { select: { name: true, id: true } },
        description: true,
      },
    }),
  ]);

  const currentMonthTotal = periodExpenses.reduce(
    (sum, t) => sum + t.amount.toNumber(),
    0,
  );

  const categoryMap: Record<string, number> = {};
  for (const txn of periodExpenses) {
    const name = txn.category?.name ?? "Other";
    categoryMap[name] = (categoryMap[name] || 0) + txn.amount.toNumber();
  }

  const spendingByCategory = Object.entries(categoryMap).map(
    ([category, amount]) => ({ category, amount }),
  );

  const topSpending: TransactionDTO[] = recent.map((t) => ({
    id: t.id,
    amount: t.amount.toNumber(),
    type: t.type,
    date: t.date,
    createdAt: t.createdAt,
    description: t.description,
    category: t.category,
    goal: t.goal,
    group: t.group,
  }));

  return { currentMonthTotal, topSpending, spendingByCategory, period };
}
