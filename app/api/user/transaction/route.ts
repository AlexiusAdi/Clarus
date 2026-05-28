import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TransactionType } from "@/lib/generated/prisma/enums";
import { TransactionDTO } from "@/lib/helper/getOverviewData";
import { isPro } from "@/lib/helper/plan";
import { z } from "zod";

const PostBodySchema = z
  .object({
    amount: z.coerce.number().positive("Invalid amount"),
    description: z.string().optional().default(""),
    categoryId: z.string().optional(),
    type: z.nativeEnum(TransactionType),
    date: z.coerce.date(),
    goalId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.type === TransactionType.INCOME ||
        data.type === TransactionType.EXPENSE) &&
      !data.categoryId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["categoryId"],
        message: "Category is required",
      });
    }

    if (data.type === TransactionType.SAVINGS && !data.goalId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["goalId"],
        message: "Goal is required",
      });
    }
  });

const GetQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
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

    const { amount, description, categoryId, type, date, goalId } = parsed.data;

    const GOAL_FREE_LIMIT = 2;

    if (
      type === TransactionType.SAVINGS &&
      goalId &&
      !isPro(session.user.plan)
    ) {
      const userGoals = await prisma.goal.findMany({
        where: { userId, isCompleted: false },
        orderBy: { createdAt: "asc" },
        select: { id: true },
        take: GOAL_FREE_LIMIT,
      });

      if (!userGoals.map((g) => g.id).includes(goalId)) {
        return NextResponse.json(
          { error: "Upgrade to Pro to contribute to this goal." },
          { status: 403 },
        );
      }
    }

    if (
      type === TransactionType.SAVINGS ||
      type === TransactionType.INVESTMENTS
    ) {
      const totals = await prisma.transaction.groupBy({
        by: ["type"],
        where: { userId },
        _sum: { amount: true },
      });

      const sum = (t: TransactionType) =>
        totals.find((r) => r.type === t)?._sum.amount?.toNumber() ?? 0;

      const cashBalance =
        sum(TransactionType.INCOME) -
        sum(TransactionType.EXPENSE) -
        sum(TransactionType.SAVINGS) -
        sum(TransactionType.INVESTMENTS);

      if (amount > cashBalance) {
        return NextResponse.json(
          {
            error: `Insufficient cash balance. Available: Rp ${cashBalance.toLocaleString("id-ID")}`,
          },
          { status: 400 },
        );
      }
    }

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

      if (amount > remaining) {
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
        amount,
        description,
        type,
        date,
        user: { connect: { id: userId } },
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        ...(goalId && { goal: { connect: { id: goalId } } }),
      },
    });

    if (type === TransactionType.SAVINGS && goalId) {
      const updatedGoal = await prisma.goal.update({
        where: { id: goalId },
        data: { currentAmount: { increment: amount } },
      });

      const current = updatedGoal.currentAmount.toNumber();
      const target = updatedGoal.targetAmount.toNumber();

      await prisma.goal.update({
        where: { id: goalId },
        data: { isCompleted: current >= target },
      });
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

    const parsed = GetQuerySchema.safeParse(
      Object.fromEntries(new URL(req.url).searchParams),
    );

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { page } = parsed.data;

    const userDetail = await prisma.userDetail.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const { pageSize } = userDetail;

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
