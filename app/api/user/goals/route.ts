import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TransactionType } from "@/lib/generated/prisma/browser";
import { isPro } from "@/lib/helper/plan";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, targetAmount, currentAmount, deadline } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Goal name is required" },
        { status: 400 },
      );
    }

    if (!targetAmount || isNaN(targetAmount) || Number(targetAmount) <= 0) {
      return NextResponse.json(
        { error: "Invalid target amount" },
        { status: 400 },
      );
    }

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
        targetAmount: Number(targetAmount),
        currentAmount: currentAmount ? Number(currentAmount) : 0,
        deadline: deadline ? new Date(deadline) : null,
        isCompleted: currentAmount
          ? Number(currentAmount) >= Number(targetAmount)
          : false,
        user: { connect: { id: userId } },
      },
    });

    if (currentAmount && Number(currentAmount) > 0) {
      await prisma.transaction.create({
        data: {
          type: TransactionType.SAVINGS,
          amount: Number(currentAmount),
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
