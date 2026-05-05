import { computeNextRunDate } from "@/lib/helper/scheduled-transactions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Verify Vercel cron secret so this can't be triggered by anyone
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to midnight

  // Fetch all due scheduled transactions
  const due = await prisma.scheduledTransaction.findMany({
    where: {
      isActive: true,
      nextRunDate: { lte: today },
      OR: [{ endDate: null }, { endDate: { gte: today } }],
    },
  });

  if (due.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let processed = 0;
  let failed = 0;

  for (const scheduled of due) {
    try {
      await prisma.$transaction([
        // 1. Create the real transaction
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

        // 2. Advance nextRunDate + record lastRunDate
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
      // Don't let one failure block the rest
      console.error(
        `Failed to process scheduled transaction ${scheduled.id}:`,
        err,
      );
      failed++;
    }
  }

  return NextResponse.json({ processed, failed });
}
