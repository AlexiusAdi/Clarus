import { PlanType } from "../generated/prisma/enums";

export function isPro(plan: PlanType) {
  return plan === PlanType.PRO || plan === PlanType.ELITE;
}

export function isElite(plan: PlanType) {
  return plan === PlanType.ELITE;
}

export function canUseScheduledTransactions(plan: PlanType) {
  return isPro(plan);
}

export function canUseGroupExpenses(plan: PlanType) {
  return isPro(plan);
}
