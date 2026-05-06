import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeNextRunDate } from "@/lib/helper/scheduled-transactions";
import { fetchAndCacheAssetPrices } from "@/lib/helper/fetchAndCacheAssetPrices";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
  });

  let processed = 0;
  let failed = 0;

  for (const scheduled of due) {
    try {
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
