import { prisma } from "@/lib/prisma";
import { TransactionType } from "./generated/prisma/browser";

export async function getTabsData(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: {
      id: true,
      amount: true,
      type: true,
      date: true,
      createdAt: true,
      category: {
        select: { name: true },
      },
      description: true,
    },
  });

  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-03"

  // 1️⃣ Expense per month
  const expensePerMonthMap: Record<string, number> = {};

  transactions.forEach((txn) => {
    if (txn.type !== TransactionType.EXPENSE) return;

    const date = new Date(txn.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    expensePerMonthMap[monthKey] =
      (expensePerMonthMap[monthKey] || 0) + txn.amount;
  });

  // 2️⃣ Current month total expense
  const currentMonthTotal = expensePerMonthMap[currentMonth] ?? 0;

  // 3️⃣ Top spending — latest transactions (both income and expense)
  const topSpending = transactions
    .filter(
      (txn) =>
        txn.type === TransactionType.EXPENSE ||
        txn.type === TransactionType.INCOME,
    )
    .slice(0, 3);

  // 4️⃣ Spending by category — current month only
  const categoryMap: Record<string, number> = {};

  transactions.forEach((txn) => {
    if (txn.type !== TransactionType.EXPENSE) return;

    const date = new Date(txn.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (monthKey !== currentMonth) return;

    const categoryName = txn.category?.name ?? "Other";
    categoryMap[categoryName] = (categoryMap[categoryName] || 0) + txn.amount;
  });

  const spendingByCategory = Object.entries(categoryMap).map(
    ([category, amount]) => ({ category, amount }),
  );

  return {
    transactions,
    currentMonthTotal,
    topSpending,
    spendingByCategory,
  };
}
