import { PlanType } from "@/lib/generated/prisma/browser";

export const PRO_FEATURES = [
  { label: "Unlimited assets", included: true },
  { label: "Unlimited investments", included: true },
  { label: "Unlimited Scheduled Transactions", included: true },
  { label: "Goals tracking", included: true },
  { label: "AI insights on goals", included: true },
  { label: "Spending forecasts", included: false },
  { label: "Full AI insights", included: false },
  { label: "CSV export", included: false },
  { label: "Email digests", included: false },
];

export const ELITE_FEATURES = [
  { label: "Unlimited assets", included: true },
  { label: "Unlimited investments", included: true },
  { label: "Unlimited Scheduled Transactions", included: true },
  { label: "Goals tracking", included: true },
  { label: "AI insights on goals", included: true },
  { label: "Spending forecasts", included: true },
  { label: "Full AI insights", included: true },
  { label: "CSV export", included: true },
  { label: "Email digests", included: true },
];

export const FREE_LIMITS =
  "3 assets, 3 investments and 5 Scheduled Transactions · No goals · No AI";


/** Rows per import file, by plan. FREE = 0 means import is unavailable. */
export const IMPORT_LIMITS: Record<PlanType, number> = {
  FREE: 0,
  PRO: 1000,
  ELITE: 3000,
};
