import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TransactionType } from "@/lib/generated/prisma/browser";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // ← Promise type
) {
  try {
    const { id } = await params; // ← await it first

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id }, // ← use destructured id
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    if (transaction.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    if (transaction.type === TransactionType.SAVINGS && transaction.goalId) {
      const updatedGoal = await prisma.goal.update({
        where: { id: transaction.goalId },
        data: { currentAmount: { decrement: transaction.amount.toNumber() } },
      });

      if (
        updatedGoal.isCompleted &&
        updatedGoal.currentAmount < updatedGoal.targetAmount
      ) {
        await prisma.goal.update({
          where: { id: transaction.goalId },
          data: { isCompleted: false },
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /transaction error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
