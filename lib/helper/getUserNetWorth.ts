import { prisma } from "@/lib/prisma";
import { TransactionType } from "../generated/prisma/browser";
import { UserNetWorth } from "@/app/Types";

export async function getUserNetWorth(userId: string): Promise<UserNetWorth> {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { type: true, amount: true },
  });

  const totalIncome = transactions
    .filter((txn) => txn.type === TransactionType.INCOME)
    .reduce((acc, txn) => acc + txn.amount.toNumber(), 0);

  const totalExpense = transactions
    .filter((txn) => txn.type === TransactionType.EXPENSE)
    .reduce((acc, txn) => acc + txn.amount.toNumber(), 0);

  const totalSavings = transactions
    .filter((txn) => txn.type === TransactionType.SAVINGS)
    .reduce((acc, txn) => acc + txn.amount.toNumber(), 0);

  const totalInvestmentTxns = transactions
    .filter((txn) => txn.type === TransactionType.INVESTMENTS)
    .reduce((acc, txn) => acc + txn.amount.toNumber(), 0);

  const cashBalance =
    totalIncome - totalExpense - totalSavings - totalInvestmentTxns;

  const investments = await prisma.investment.findMany({
    where: { userId },
    select: {
      costPerUnit: true,
      quantity: true,
      unit: true,
      totalInvestment: true,
    },
  });

  const totalInvestments = investments.reduce(
    (acc, inv) => acc + inv.totalInvestment.toNumber(),
    0,
  );

  const assets = await prisma.asset.findMany({
    where: { userId },
    select: { value: true },
  });

  const totalAssets = assets.reduce(
    (acc, asset) => acc + asset.value.toNumber(),
    0,
  );

  const netWorth = cashBalance + totalInvestments + totalAssets;

  return {
    totalIncome,
    totalExpense,
    cashBalance,
    totalInvestments,
    netWorth,
  };
}
