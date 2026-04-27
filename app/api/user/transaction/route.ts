import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TransactionType } from "@/lib/generated/prisma/enums";
import { TransactionDTO } from "@/lib/helper/getOverviewData";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, description, categoryId, type, date, goalId } = body;

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (
      (type === TransactionType.INCOME || type === TransactionType.EXPENSE) &&
      !categoryId
    ) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 },
      );
    }

    if (type === TransactionType.SAVINGS && !goalId) {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    // Cash balance check for SAVINGS and INVESTMENTS only (not ASSETS)
    if (
      type === TransactionType.SAVINGS ||
      type === TransactionType.INVESTMENTS
    ) {
      const totals = await prisma.transaction.groupBy({
        by: ["type"],
        where: { userId },
        _sum: { amount: true },
      });

      const totalIncome =
        totals
          .find((t) => t.type === TransactionType.INCOME)
          ?._sum.amount?.toNumber() ?? 0;
      const totalExpense =
        totals
          .find((t) => t.type === TransactionType.EXPENSE)
          ?._sum.amount?.toNumber() ?? 0;
      const totalSavings =
        totals
          .find((t) => t.type === TransactionType.SAVINGS)
          ?._sum.amount?.toNumber() ?? 0;
      const totalInvestments =
        totals
          .find((t) => t.type === TransactionType.INVESTMENTS)
          ?._sum.amount?.toNumber() ?? 0;

      const cashBalance =
        totalIncome - totalExpense - totalSavings - totalInvestments;

      if (Number(amount) > cashBalance) {
        return NextResponse.json(
          {
            error: `Insufficient cash balance. Available: Rp ${cashBalance.toLocaleString("id-ID")}`,
          },
          { status: 400 },
        );
      }
    }

    // Goal validation for SAVINGS
    if (type === TransactionType.SAVINGS && goalId) {
      const goal = await prisma.goal.findUnique({
        where: { id: goalId },
        select: { targetAmount: true, currentAmount: true },
      });

      if (!goal) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
      }

      const remaining =
        goal.targetAmount.toNumber() - goal.currentAmount.toNumber();

      if (Number(amount) > remaining) {
        return NextResponse.json(
          {
            error: `Amount exceeds remaining goal target. Remaining: Rp ${remaining.toLocaleString("id-ID")}`,
          },
          { status: 400 },
        );
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount),
        description: description || "",
        type,
        date: new Date(date),
        user: { connect: { id: userId } },
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        ...(goalId && { goal: { connect: { id: goalId } } }),
      },
    });

    // Update goal progress for SAVINGS
    if (type === TransactionType.SAVINGS && goalId) {
      const updatedGoal = await prisma.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: { increment: Number(amount) },
        },
      });

      if (updatedGoal.currentAmount >= updatedGoal.targetAmount) {
        await prisma.goal.update({
          where: { id: goalId },
          data: { isCompleted: true },
        });
      }
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("POST /transactions error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));

    const userDetail = await prisma.userDetail.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const pageSize = userDetail.pageSize;

    const [raw, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          amount: true,
          type: true,
          date: true,
          createdAt: true,
          description: true,
          category: { select: { name: true, id: true } },
          goal: { select: { name: true, id: true } },
        },
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    const data: TransactionDTO[] = raw.map((t) => ({
      id: t.id,
      amount: t.amount.toNumber(),
      type: t.type,
      date: t.date,
      createdAt: t.createdAt,
      description: t.description,
      category: t.category,
      goal: t.goal,
    }));

    return NextResponse.json({ data, total, page, pageSize });
  } catch (error) {
    console.error("GET /transaction error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
