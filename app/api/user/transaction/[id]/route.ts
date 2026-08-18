import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TransactionType } from "@/lib/generated/prisma/browser";
import { z } from "zod";

const PatchBodySchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().optional().default(""),
  categoryId: z.string().optional(),
  date: z.coerce.date(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Scope the read to the owner so ownership and existence resolve in one
    // query instead of findUnique-then-check-then-delete.
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      select: { id: true, type: true, goalId: true, amount: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    if (
      transaction.type === TransactionType.ASSETS ||
      transaction.type === TransactionType.INVESTMENTS
    ) {
      return NextResponse.json(
        {
          error:
            "Assets and investments must be deleted from their respective tabs.",
        },
        { status: 400 },
      );
    }

    await prisma.transaction.delete({ where: { id } });

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /transaction error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = PatchBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { amount, description, categoryId, date } = parsed.data;

    const transaction = await prisma.transaction.findUnique({ where: { id } });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    if (transaction.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount,
        description,
        date,
        ...(categoryId && { category: { connect: { id: categoryId } } }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /transaction error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
