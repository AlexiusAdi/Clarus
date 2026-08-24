import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeNextRunDate } from "@/lib/helper/scheduled-transactions";
import { fetchAndCacheAssetPrices } from "@/lib/helper/fetchAndCacheAssetPrices";
import { FREE_SCHEDULED_TRANSACTION_LIMIT, isPro } from "@/lib/helper/plan";
import { PlanType } from "@/lib/generated/prisma/enums";
import { sendDigestRun } from "@/lib/email/sendDigestRun";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Job 1 — fetch asset prices
  const priceResult = await fetchAndCacheAssetPrices();

  // Job 2 — expire lapsed plans.
  //
  // Ordered before the scheduled-transaction job deliberately: that job reads
  // user.plan straight from the database to decide the free-plan trim, so the
  // downgrade has to be persisted first. Otherwise a user whose plan lapsed
  // today would get one more night at paid-tier limits.
  const now = new Date();
  let expired = 0;

  // planExpiresAt: null never matches lte, so users on a plan with no expiry
  // set are excluded without an explicit null guard.
  const lapsed = await prisma.user.findMany({
    where: {
      plan: { not: PlanType.FREE },
      planExpiresAt: { lte: now },
    },
    select: { id: true, plan: true },
  });

  for (const user of lapsed) {
    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { plan: PlanType.FREE, planExpiresAt: null },
        }),
        prisma.planHistory.create({
          data: {
            userId: user.id,
            fromPlan: user.plan,
            toPlan: PlanType.FREE,
            source: "EXPIRY",
            note: "Plan lapsed at planExpiresAt — downgraded by cron/daily",
          },
        }),
      ]);
      expired++;
    } catch (err) {
      console.error(`[cron/daily] Failed to expire plan for ${user.id}:`, err);
    }
  }

  if (expired > 0) {
    console.log(`[cron/daily] Expired ${expired} lapsed plan(s).`);
  }

  // Job 3 — process scheduled transactions
  // UTC explicitly, matching financialPeriod.ts — setHours() would use the
  // server's local timezone instead, which happens to line up with UTC on
  // Vercel today but shouldn't be left implicit.
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  const due = await prisma.scheduledTransaction.findMany({
    where: {
      isActive: true,
      nextRunDate: { lte: today },
      OR: [{ endDate: null }, { endDate: { gte: today } }],
    },
    include: { user: { select: { plan: true } } },
  });

  let processed = 0;
  let failed = 0;
  let deactivated = 0;

  // The free cap is on how many schedules a user *has*, not how many happen to
  // fire tonight — so for every free user in tonight's batch, rank all of their
  // active schedules oldest-first and keep only the first N. Everything past the
  // cap is switched off now, whether or not it was due, so a downgraded user
  // sees the whole trim in one go instead of losing schedules one at a time.
  const freeUserIds = [
    ...new Set(due.filter((s) => !isPro(s.user.plan)).map((s) => s.userId)),
  ];

  const allowedIds = new Set<string>();

  if (freeUserIds.length > 0) {
    const freeUserSchedules = await prisma.scheduledTransaction.findMany({
      where: { userId: { in: freeUserIds }, isActive: true },
      select: { id: true, userId: true },
      orderBy: { createdAt: "asc" },
    });

    const kept: Record<string, number> = {};
    const overCapIds: string[] = [];

    for (const { id, userId } of freeUserSchedules) {
      const count = kept[userId] ?? 0;
      if (count < FREE_SCHEDULED_TRANSACTION_LIMIT) {
        allowedIds.add(id);
        kept[userId] = count + 1;
      } else {
        overCapIds.push(id);
      }
    }

    if (overCapIds.length > 0) {
      const result = await prisma.scheduledTransaction.updateMany({
        where: { id: { in: overCapIds } },
        data: { isActive: false },
      });
      deactivated = result.count;
      console.log(
        `[cron/daily] Deactivated ${result.count} schedule(s) over the ${FREE_SCHEDULED_TRANSACTION_LIMIT} free-plan cap: ${overCapIds.join(", ")}`,
      );
    }
  }

  for (const scheduled of due) {
    try {
      // Switched off in the trim above — don't materialize it.
      if (!isPro(scheduled.user.plan) && !allowedIds.has(scheduled.id)) {
        continue;
      }

      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            userId: scheduled.userId,
            amount: scheduled.amount,
            type: scheduled.type,
            categoryId: scheduled.categoryId,
            description: scheduled.description,
            date: today,
          },
        }),
        prisma.scheduledTransaction.update({
          where: { id: scheduled.id },
          data: {
            lastRunDate: today,
            nextRunDate: computeNextRunDate(
              today,
              scheduled.frequency,
              scheduled.interval,
            ),
          },
        }),
      ]);
      processed++;
    } catch (err) {
      console.error(
        `Failed to process scheduled transaction ${scheduled.id}:`,
        err,
      );
      failed++;
    }
  }

  // Job 4 — cycle-close digests. Last, so a mail provider outage cannot stop
  // prices refreshing or scheduled transactions materializing.
  let digest;
  try {
    digest = await sendDigestRun(now);
  } catch (err) {
    console.error("[cron/daily] Digest run failed:", err);
    digest = { error: err instanceof Error ? err.message : String(err) };
  }

  return NextResponse.json({
    prices: priceResult,
    plans: { expired },
    scheduled: { processed, failed, deactivated },
    digest,
  });
}
