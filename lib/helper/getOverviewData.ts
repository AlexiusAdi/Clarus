import { prisma } from "@/lib/prisma";
import { TransactionType } from "../generated/prisma/browser";

export type TransactionDTO = {
  id: string;
  amount: number;
  type: TransactionType;
  date: Date;
  createdAt: Date;
  description: string | null;
  category: { name: string; id: string } | null;
  goal: { name: string; id: string } | null;
};

export type OverviewDataDTO = {
  currentMonthTotal: number;
  topSpending: TransactionDTO[];
  spendingByCategory: { category: string; amount: number }[];
};

export async function getOverviewData(
  userId: string,
): Promise<OverviewDataDTO> {
  const raw = await prisma.transaction.findMany({
    where: {
      userId,
    },
    orderBy: { date: "desc" },
    select: {
      id: true,
      amount: true,
      type: true,
      date: true,
      createdAt: true,
      category: { select: { name: true, id: true } },
      goal: { select: { name: true, id: true } },
      description: true,
    },
  });

  const transactions: TransactionDTO[] = raw.map((t) => ({
    id: t.id,
    amount: t.amount.toNumber(),
    type: t.type,
    date: t.date,
    createdAt: t.createdAt,
    description: t.description,
    category: t.category,
    goal: t.goal,
  }));

  const currentMonthTotal = transactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const topSpending = transactions
    .filter(
      (t) =>
        t.type === TransactionType.EXPENSE ||
        t.type === TransactionType.INCOME ||
        t.type === TransactionType.SAVINGS,
    )
    .slice(0, 3);

  const categoryMap: Record<string, number> = {};
  transactions.forEach((txn) => {
    if (txn.type !== TransactionType.EXPENSE) return;
    const name = txn.category?.name ?? "Other";
    categoryMap[name] = (categoryMap[name] || 0) + txn.amount;
  });

  const spendingByCategory = Object.entries(categoryMap).map(
    ([category, amount]) => ({ category, amount }),
  );

  return { currentMonthTotal, topSpending, spendingByCategory };
}
