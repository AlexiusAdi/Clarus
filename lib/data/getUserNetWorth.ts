import { prisma } from "@/lib/prisma";
import { TransactionType } from "../generated/prisma/browser";
import { UserNetWorth } from "@/app/Types";
import { getFinancialPeriod, DEFAULT_RESET_DAY } from "@/lib/helper/financialPeriod";
import {
  countsTowardCash,
  getOpeningBalanceAnchor,
} from "@/lib/data/openingBalance";

export async function getUserNetWorth(
  userId: string,
  resetDay: number = DEFAULT_RESET_DAY,
  now: Date = new Date(),
): Promise<UserNetWorth> {
  // The anchor is read here rather than taken as an argument: every caller
  // needs it applied, and a forgotten argument would silently show a cash
  // figure that disagrees with the user's bank by the whole opening balance —
  // the exact bug this field exists to fix.
  const [transactions, anchor] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      select: { type: true, amount: true, date: true },
    }),
    getOpeningBalanceAnchor(userId),
  ]);

  const sumOf = (type: TransactionType, rows: typeof transactions) =>
    rows
      .filter((txn) => txn.type === type)
      .reduce((acc, txn) => acc + txn.amount.toNumber(), 0);

  const totalIncome = sumOf(TransactionType.INCOME, transactions);
  const totalExpense = sumOf(TransactionType.EXPENSE, transactions);

  // Cash counts only what the anchor does not already account for. Anything
  // dated before it — a backfilled month, an import of older statements — still
  // feeds the totals and charts above, but the money it moved is already inside
  // the opening balance, so adding it again would double it.
  const cashTransactions = transactions.filter((txn) =>
    countsTowardCash(txn.date, anchor.date),
  );

  const cashBalance =
    anchor.amount +
    sumOf(TransactionType.INCOME, cashTransactions) -
    sumOf(TransactionType.EXPENSE, cashTransactions) -
    sumOf(TransactionType.SAVINGS, cashTransactions) -
    sumOf(TransactionType.INVESTMENTS, cashTransactions);

  // A second, separate figure from cashBalance — that one has to stay a true
  // lifetime running total (net worth and the overspending check both depend
  // on it), so "am I in the black this period" is surfaced here instead of
  // by scoping cashBalance itself.
  const period = getFinancialPeriod(resetDay, now);
  const periodTransactions = transactions.filter(
    (txn) => txn.date >= period.start && txn.date < period.end,
  );
  // Surfaced on their own as well as netted: the home screen's income and
  // expense tiles are labelled "Monthly", so they have to read the period —
  // the lifetime totals above would grow forever and never reset on payday.
  const periodIncome = sumOf(TransactionType.INCOME, periodTransactions);
  const periodExpense = sumOf(TransactionType.EXPENSE, periodTransactions);

  const periodCashFlow =
    periodIncome -
    periodExpense -
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
    openingBalance: anchor.amount,
    openingBalanceSet: anchor.setAt !== null,
    totalIncome,
    totalExpense,
    cashBalance,
    totalInvestments,
    netWorth,
    periodCashFlow,
    periodIncome,
    periodExpense,
    investmentsCurrentValue,
    investmentsPnlAbs,
    investmentsPnlPct,
  };
}
