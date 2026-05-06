import { auth } from "@/auth";
import { isPro } from "@/lib/helper/plan";
import { computeNextRunDate } from "@/lib/helper/scheduled-transactions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const FREE_LIMIT = 5;

// 1. remove Frequency import from /browser, use string literals instead
const patchSchema = z.object({
  isActive: z.boolean().optional(),
  amount: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]).optional(),
  interval: z.number().min(1).max(365).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // 2. await params
) {
  const { id } = await params;

  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.scheduledTransaction.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = patchSchema.parse(body);

    if (data.isActive === true && !existing.isActive) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });

      if (user && !isPro(user.plan)) {
        const activeCount = await prisma.scheduledTransaction.count({
          where: { userId, isActive: true },
        });

        if (activeCount >= FREE_LIMIT) {
          return NextResponse.json(
            {
              error: `Free plan is limited to ${FREE_LIMIT} active scheduled transactions. Upgrade to Pro to activate more.`,
            },
            { status: 403 },
          );
        }
      }
    }

    const frequencyChanged =
      data.frequency && data.frequency !== existing.frequency;
    const intervalChanged =
      data.interval && data.interval !== existing.interval;

    const nextRunDate =
      frequencyChanged || intervalChanged
        ? computeNextRunDate(
            new Date(),
            data.frequency ?? existing.frequency,
            data.interval ?? existing.interval,
          )
        : undefined;

    const updated = await prisma.scheduledTransaction.update({
      where: { id },
      data: {
        ...data,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        ...(nextRunDate && { nextRunDate }),
      },
    });

    return NextResponse.json(updated);
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }, // 2. await params
) {
  const { id } = await params;

  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.scheduledTransaction.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.scheduledTransaction.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
