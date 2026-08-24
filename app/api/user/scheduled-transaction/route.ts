import { auth } from "@/auth";
import { Frequency, TransactionType } from "@/lib/generated/prisma/browser";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  canAddScheduledTransaction,
  FREE_SCHEDULED_TRANSACTION_LIMIT,
} from "@/lib/helper/plan";

const createSchema = z.object({
  amount: z.string().refine((v) => parseFloat(v) > 0),
  type: z.enum(TransactionType),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  frequency: z.enum(Frequency),
  interval: z.number().min(1).max(365).default(1),
  startDate: z.string().refine(
    (v) => {
      const now = new Date();
      const todayUtc = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      );
      return new Date(v) >= todayUtc;
    },
    {
      // A backdated start sits "overdue" until the next cron run catches it
      // up — the client already blocks this in the date picker, this is a
      // second line of defense against calling the API directly.
      message: "Start date must be today or later",
    },
  ), // "yyyy-MM-dd"
});

// POST — create
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createSchema.parse(body);

    const userScheduledCount = await prisma.scheduledTransaction.count({
      where: { userId: session.user.id },
    });

    if (!canAddScheduledTransaction(session.user.plan, userScheduledCount)) {
      return NextResponse.json(
        {
          error: `Free plan users can only have up to ${FREE_SCHEDULED_TRANSACTION_LIMIT} scheduled transactions. Please upgrade to add more.`,
        },
        { status: 403 },
      );
    }

    const startDate = new Date(data.startDate);

    const scheduled = await prisma.scheduledTransaction.create({
      data: {
        userId: session.user.id,
        amount: parseFloat(data.amount),
        type: data.type,
        categoryId: data.categoryId,
        description: data.description,
        frequency: data.frequency,
        interval: data.interval,
        startDate,
        nextRunDate: startDate, // first run = startDate
        isActive: true,
      },
    });

    return NextResponse.json(scheduled, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET — list all for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scheduled = await prisma.scheduledTransaction.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(scheduled);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
