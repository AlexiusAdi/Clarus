import { PlanType } from "../generated/prisma/enums";

export function isPro(plan: PlanType) {
  return plan === PlanType.PRO || plan === PlanType.ELITE;
}

export function isElite(plan: PlanType) {
  return plan === PlanType.ELITE;
}

/**
 * FREE tier caps, as advertised by FREE_LIMITS in constants/index.ts —
 * keep the two in sync. PRO and ELITE are unlimited.
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
