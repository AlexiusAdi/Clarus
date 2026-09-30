import { prisma } from "@/lib/prisma";
import { PLAN_PRICES } from "@/constants/plans";

export type CheckoutSummaryDTO = {
  /** False when the user already has a live paid plan and cannot check out. */
  canCheckout: boolean;
  amount: number;
  startsOn: Date;
  endsOn: Date;
};

/**
 * Everything the checkout page needs to show the exact charge.
 *
 * The clock lives here rather than in the page for a practical reason as well
 * as a tidy one: React's compiler rules forbid calling an impure function such
 * as Date.now() during render, and the dates on this screen are data the page
 * reads, not state it owns.
 */
export async function getCheckoutSummary(
  userId: string,
): Promise<CheckoutSummaryDTO | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true },
  });

  if (!user) return null;

  const now = Date.now();

  // Matches the session callback in auth.ts: a plan past its expiry reads as
  // FREE everywhere, so a lapsed user is allowed to buy again.
  const lapsed =
    !!user.planExpiresAt && user.planExpiresAt.getTime() <= now;

  const startsOn = new Date(now);
  const endsOn = new Date(now);
  endsOn.setFullYear(endsOn.getFullYear() + 1);

  return {
    canCheckout: user.plan === "FREE" || lapsed,
    amount: PLAN_PRICES.PRO,
    startsOn,
    endsOn,
  };
}
