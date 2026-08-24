import { prisma } from "@/lib/prisma";
import { TransactionType } from "../generated/prisma/browser";
import { UserNetWorth } from "@/app/Types";
import { getFinancialPeriod, DEFAULT_RESET_DAY } from "@/lib/helper/financialPeriod";

export async function getUserNetWorth(
  userId: string,
  resetDay: number = DEFAULT_RESET_DAY,
  now: Date = new Date(),
): Promise<UserNetWorth> {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { type: true, amount: true, date: true },
  });

  const sumOf = (type: TransactionType, rows: typeof transactions) =>
    rows
      .filter((txn) => txn.type === type)
      .reduce((acc, txn) => acc + txn.amount.toNumber(), 0);

  const totalIncome = sumOf(TransactionType.INCOME, transactions);
  const totalExpense = sumOf(TransactionType.EXPENSE, transactions);
  const totalSavings = sumOf(TransactionType.SAVINGS, transactions);
  const totalInvestmentTxns = sumOf(TransactionType.INVESTMENTS, transactions);

  const cashBalance =
    totalIncome - totalExpense - totalSavings - totalInvestmentTxns;

  // A second, separate figure from cashBalance — that one has to stay a true
  // lifetime running total (net worth and the overspending check both depend
  // on it), so "am I in the black this period" is surfaced here instead of
  // by scoping cashBalance itself.
  const period = getFinancialPeriod(resetDay, now);
  const periodTransactions = transactions.filter(
    (txn) => txn.date >= period.start && txn.date < period.end,
  );
  const periodCashFlow =
    sumOf(TransactionType.INCOME, periodTransactions) -
    sumOf(TransactionType.EXPENSE, periodTransactions) -
    sumOf(TransactionType.SAVINGS, periodTransactions) -
    sumOf(TransactionType.INVESTMENTS, periodTransactions);

  const investments = await prisma.investment.findMany({
    where: { userId },
    select: {
      quantity: true,
      unit: true,
      totalInvestment: true,
      assetPrice: { select: { priceIdr: true } },
    },
  });

  const totalInvestments = investments.reduce(
    (acc, inv) => acc + inv.totalInvestment.toNumber(),
    0,
  );

  // Only priced holdings feed the return figures, so an asset without a
  // fetched price yet can't fake a loss just by having no current value.
  let pricedCurrentValue = 0;
  let pricedCostBasis = 0;
  let unpricedCostBasis = 0;

  for (const inv of investments) {
    const quantity = inv.quantity.toNumber();
    const normalizedQuantity = inv.unit === "lot" ? quantity * 100 : quantity;
    const amountInvested = inv.totalInvestment.toNumber();
    const currentPriceIdr = inv.assetPrice?.priceIdr.toNumber() ?? null;

    if (currentPriceIdr !== null) {
      pricedCurrentValue += normalizedQuantity * currentPriceIdr;
      pricedCostBasis += amountInvested;
    } else {
      unpricedCostBasis += amountInvested;
    }
  }

  // IDR has no subunit — the app never shows decimals for it (see
  // formatCurrency.ts) — but summing converted USD/lot prices in JS
  // float leaves fractional noise (e.g. 17844943.2599999...) that
  // needs rounding off here rather than relying on every display site
  // to truncate it correctly.
  const investmentsCurrentValue =
    investments.length > 0
      ? Math.round(pricedCurrentValue + unpricedCostBasis)
      : null;
  const investmentsPnlAbs =
    pricedCostBasis > 0
      ? Math.round(pricedCurrentValue - pricedCostBasis)
      : null;
  const investmentsPnlPct =
    investmentsPnlAbs !== null && pricedCostBasis > 0
      ? Math.round((investmentsPnlAbs / pricedCostBasis) * 1000) / 10
      : null;

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
    periodCashFlow,
    investmentsCurrentValue,
    investmentsPnlAbs,
    investmentsPnlPct,
  };
}
