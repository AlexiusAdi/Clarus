import { NextRequest, NextResponse } from "next/server";
import { fetchAndCacheAssetPrices } from "@/lib/helper/fetchAndCacheAssetPrices";
import { prisma } from "@/lib/prisma";
import { computeNextRunDate } from "@/lib/helper/scheduled-transactions";
import { isPro } from "@/lib/helper/plan";

function isAuthorized(req: NextRequest): boolean {
  return (
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  );
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Job 1 — fetch asset prices
  const priceResult = await fetchAndCacheAssetPrices();

  // Job 2 — process scheduled transactions
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = await prisma.scheduledTransaction.findMany({
    where: {
      isActive: true,
      nextRunDate: { lte: today },
      OR: [{ endDate: null }, { endDate: { gte: today } }],
    },
    include: { user: true },
  });

  let processed = 0;
  let failed = 0;

  const FREE_LIMIT = 5;
  const freeUserCount: Record<string, number> = {};

  for (const scheduled of due) {
    try {
      if (!isPro(scheduled.user.plan)) {
        const count = freeUserCount[scheduled.userId] ?? 0;
        if (count >= FREE_LIMIT) {
          // deactivate instead of silently skipping
          await prisma.scheduledTransaction.update({
            where: { id: scheduled.id },
            data: { isActive: false },
          });
          console.log(
            `Deactivated ${scheduled.id} — free user ${scheduled.userId} exceeded limit`,
          );
          continue;
        }
        freeUserCount[scheduled.userId] = count + 1;
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

  return NextResponse.json({
    prices: priceResult,
    scheduled: { processed, failed },
  });
}
