import { prisma } from "@/lib/prisma";
import { TransactionType } from "./generated/prisma/browser";

export async function getTabsData(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amount: true,
      type: true,
      createdAt: true,
      category: {
        select: { name: true },
      },
      description: true,
    },
  });

  // 1️⃣ Expense per month (sorted & stable)
  const expensePerMonthMap: Record<string, number> = {};

  transactions.forEach((txn) => {
    if (txn.type !== TransactionType.EXPENSE) return;

    const date = new Date(txn.createdAt);

    // safer key (sortable)
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

    expensePerMonthMap[monthKey] =
      (expensePerMonthMap[monthKey] || 0) + txn.amount;
  });

  const expensePerMonth = Object.entries(expensePerMonthMap)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([month, total]) => ({
      month,
      total,
    }));

  // 2️⃣ Top 3 newest spending
  const topSpending = transactions
    .filter(
      (txn) =>
        txn.type === TransactionType.EXPENSE ||
        txn.type === TransactionType.INCOME,
    )
    .slice(0, 3);

  // 3️⃣ Spending by category (for pie chart)
  const categoryMap: Record<string, number> = {};

  transactions.forEach((txn) => {
    if (txn.type !== TransactionType.EXPENSE) return;

    const categoryName = txn.category?.name ?? "Other";

    categoryMap[categoryName] = (categoryMap[categoryName] || 0) + txn.amount;
  });

  const spendingByCategory = Object.entries(categoryMap).map(
    ([category, amount]) => ({
      category,
      amount,
    }),
  );

  return {
    transactions,
    expensePerMonth,
    topSpending,
    spendingByCategory,
  };
}
