import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goal = await prisma.goal.findUnique({
      where: { id },
      include: { transactions: true },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    if (goal.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // delete linked transactions first
    await prisma.transaction.deleteMany({
      where: { goalId: id },
    });

    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /goal error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    const goal = await prisma.goal.findUnique({ where: { id } });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    if (goal.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const parsedCurrent = currentAmount
      ? Number(currentAmount)
      : goal.currentAmount.toNumber();
    const parsedTarget = Number(targetAmount);

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        name,
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        deadline: deadline ? new Date(deadline) : null,
        isCompleted: parsedCurrent >= parsedTarget,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PATCH /goal error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
