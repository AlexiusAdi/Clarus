import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TransactionType } from "@/lib/generated/prisma/browser";
import { isPro } from "@/lib/helper/plan";
import { z } from "zod";

const PostBodySchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.coerce.number().positive("Target amount must be positive"),
  currentAmount: z.coerce.number().min(0).optional(),
  deadline: z.coerce.date().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = PostBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, targetAmount, currentAmount, deadline } = parsed.data;

    const GOAL_FREE_LIMIT = 2;

    if (!isPro(session.user.plan)) {
      const goalCount = await prisma.goal.count({
        where: { userId, isCompleted: false },
      });

      if (goalCount >= GOAL_FREE_LIMIT) {
        return NextResponse.json(
          {
            error:
              "Free plan is limited to 2 active goals. Upgrade to Pro for unlimited.",
          },
          { status: 403 },
        );
      }
    }

    const goal = await prisma.goal.create({
      data: {
        name,
        targetAmount,
        currentAmount: currentAmount ?? 0,
        deadline: deadline ?? null,
        isCompleted: currentAmount ? currentAmount >= targetAmount : false,
        user: { connect: { id: userId } },
      },
    });

    if (currentAmount && currentAmount > 0) {
      await prisma.transaction.create({
        data: {
          type: TransactionType.SAVINGS,
          amount: currentAmount,
          date: new Date(),
          goal: { connect: { id: goal.id } },
          user: { connect: { id: userId } },
        },
      });
    }

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("POST /goal error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
