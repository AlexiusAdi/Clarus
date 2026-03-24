import { prisma } from "@/lib/prisma";
import { TransactionType } from "./generated/prisma/browser";
import { UserNetWorth } from "@/app/Types";

export async function getUserNetWorth(userId: string): Promise<UserNetWorth> {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { type: true, amount: true },
  });

  const totalIncome = transactions
    .filter((txn) => txn.type === TransactionType.INCOME)
    .reduce((acc, txn) => acc + txn.amount, 0);

  const totalExpense = transactions
    .filter((txn) => txn.type === TransactionType.EXPENSE)
    .reduce((acc, txn) => acc + txn.amount, 0);

  const cashBalance = totalIncome - totalExpense;

  const investments = await prisma.investment.findMany({
    where: { userId },
    select: { currentValue: true },
  });
  const totalInvestments = investments.reduce(
    (acc, inv) => acc + inv.currentValue,
    0,
  );

  const assets = await prisma.asset.findMany({
    where: { userId },
    select: { name: true, value: true },
  });

  const totalAssets = assets.reduce((acc, asset) => acc + asset.value, 0);

  const netWorth = cashBalance + totalInvestments + totalAssets;

  return {
    totalIncome,
    totalExpense,
    cashBalance,
    totalInvestments,
    netWorth,
  };
}
