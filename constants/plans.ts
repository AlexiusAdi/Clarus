import { PlanType } from "@/lib/generated/prisma/browser";

/**
 * The plans Certus actually sells. ELITE remains a valid PlanType for existing
 * rows and PlanHistory entries, but it is no longer purchasable, so it has no
 * price — which also stops the upgrade route from offering it by accident.
 */
export type SellablePlan = "PRO";

/**
 * Plan prices in IDR, billed yearly. The server is the only authority on what a
 * plan costs — the amount sent to Midtrans is read from here, never from the
 * request body, or a client could name its own price. Kept in this client-safe
 * module so the upgrade page shows exactly what the server charges.
 */
export const PLAN_PRICES: Record<SellablePlan, number> = {
  PRO: 99_000,
};

/**
 * Everything the single paid plan includes. Certus used to split these across
 * PRO and ELITE; the two tiers sat 50k apart, which was too narrow to be a real
 * choice, so PRO now carries the whole set.
 */
export const PRO_FEATURES = [
  { label: "Unlimited assets", included: true },
  { label: "Unlimited investments", included: true },
  { label: "Unlimited scheduled transactions", included: true },
  { label: "Goals tracking", included: true },
  { label: "Group transactions", included: true },
  { label: "AI summaries of your goals", included: true },
  { label: "Import and export your data", included: true },
  { label: "Email digests", included: true },
];

/**
 * What the free plan actually gives you, written positively. The caps here are
 * the same ones FREE_ASSET_LIMIT and friends enforce in lib/helper/plan.ts —
 * keep the two in step.
 */
export const FREE_FEATURES = [
  "Unlimited income and expense records",
  "Categories you control",
  "3 assets",
  "3 investments",
  "5 scheduled transactions",
];

export const FREE_LIMITS =
  "3 assets, 3 investments and 5 Scheduled Transactions · No goals · No AI";

/** Rows per import file, by plan. FREE = 0 means import is unavailable. */
export const IMPORT_LIMITS: Record<PlanType, number> = {
  FREE: 0,
  PRO: 3000,
  ELITE: 3000,
};
