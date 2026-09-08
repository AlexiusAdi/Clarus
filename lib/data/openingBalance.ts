import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/lib/generated/prisma/enums";

/**
 * The money a user already held when they started recording in Certus.
 *
 * Cash is still derived rather than stored, but it is derived from this anchor
 * instead of from zero. Without it the only way to make Certus agree with a
 * real bank account is to log the starting money as an income transaction,
 * which inflates every income-derived figure in the app — income totals, the
 * category breakdown, the home screen's income-vs-expense split and the digest.
 */
export type OpeningBalanceAnchor = {
  /** The figure itself, already converted off Prisma's Decimal. */
  amount: number;
  /**
   * The day the figure describes. Transactions before it are already baked
   * into `amount`, so they are excluded from cash. NULL means "applies to
   * everything", the behaviour of every account created before this existed.
   */
  date: Date | null;
  /** NULL when the user has never set one — what the UI prompt keys off. */
  setAt: Date | null;
};

export const EMPTY_ANCHOR: OpeningBalanceAnchor = {
  amount: 0,
  date: null,
  setAt: null,
};

export async function getOpeningBalanceAnchor(
  userId: string,
): Promise<OpeningBalanceAnchor> {
  const detail = await prisma.userDetail.findUnique({
    where: { userId },
    select: {
      openingBalance: true,
      openingBalanceDate: true,
      openingBalanceSetAt: true,
    },
  });

  if (!detail) return EMPTY_ANCHOR;

  return {
    amount: detail.openingBalance.toNumber(),
    date: detail.openingBalanceDate,
    setAt: detail.openingBalanceSetAt,
  };
}

/**
 * True when a transaction should move the cash balance. A transaction dated
 * before the anchor describes money that had already come and gone by the time
 * the user counted their accounts, so counting it again would double it — this
 * is what makes importing older months safe after the anchor is set.
 */
export function countsTowardCash(
  transactionDate: Date,
  anchorDate: Date | null,
): boolean {
  return anchorDate === null || transactionDate >= anchorDate;
}

/**
 * Net of everything the user has recorded on or after the anchor, ignoring the
 * anchor amount itself. Kept separate from the anchor so the reconcile endpoint
 * can show the user both halves of the sum rather than only the total.
 */
export async function getRecordedNet(
  userId: string,
  since: Date | null,
): Promise<number> {
  const totals = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      userId,
      ...(since ? { date: { gte: since } } : {}),
    },
    _sum: { amount: true },
  });

  const sum = (type: TransactionType) =>
    totals.find((row) => row.type === type)?._sum.amount?.toNumber() ?? 0;

  return (
    sum(TransactionType.INCOME) -
    sum(TransactionType.EXPENSE) -
    sum(TransactionType.SAVINGS) -
    sum(TransactionType.INVESTMENTS)
  );
}

/**
 * The single definition of spendable cash, for callers that need the number
 * without the rest of the net-worth payload (the overspending check, the
 * reconcile endpoint). getUserNetWorth derives the same figure from the
 * transaction rows it already has in memory.
 */
export async function getCashBalance(userId: string): Promise<{
  cash: number;
  anchor: OpeningBalanceAnchor;
  recordedNet: number;
}> {
  const anchor = await getOpeningBalanceAnchor(userId);
  const recordedNet = await getRecordedNet(userId, anchor.date);

  return { cash: anchor.amount + recordedNet, anchor, recordedNet };
}
