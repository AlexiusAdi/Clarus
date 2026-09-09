import { PlanType } from "../generated/prisma/enums";

/**
 * Certus sells one paid plan, PRO. ELITE stays in the enum because rows and
 * PlanHistory entries reference it, and anyone already on it keeps everything
 * — but nothing is sold at that tier any more, so every paid feature is gated
 * on isPro rather than on a specific tier.
 */
export function isPro(plan: PlanType) {
  return plan === PlanType.PRO || plan === PlanType.ELITE;
}

/**
 * FREE tier caps, as advertised by FREE_LIMITS in constants/plans.ts —
 * keep the two in sync. Paid plans are unlimited.
 */
export const FREE_ASSET_LIMIT = 3;
export const FREE_INVESTMENT_LIMIT = 3;
export const FREE_SCHEDULED_TRANSACTION_LIMIT = 5;

export function canAddScheduledTransaction(
  plan: PlanType,
  currentCount: number,
) {
  return isPro(plan) || currentCount < FREE_SCHEDULED_TRANSACTION_LIMIT;
}

export function canAddAsset(plan: PlanType, currentCount: number) {
  return isPro(plan) || currentCount < FREE_ASSET_LIMIT;
}

export function canAddInvestment(plan: PlanType, currentCount: number) {
  return isPro(plan) || currentCount < FREE_INVESTMENT_LIMIT;
}

export function canUseScheduledTransactions(plan: PlanType) {
  return isPro(plan);
}

export function canUseGroupExpenses(plan: PlanType) {
  return isPro(plan);
}

export function canExportData(plan: PlanType) {
  return isPro(plan);
}

export function canImportData(plan: PlanType) {
  return isPro(plan);
}

export function canUseEmailDigest(plan: PlanType) {
  return isPro(plan);
}
