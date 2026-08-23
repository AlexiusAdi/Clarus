import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { GroupMode } from "@/lib/generated/prisma/enums";
import { canUseGroupExpenses } from "@/lib/helper/plan";
import { z } from "zod";

const MemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  budgetAmount: z.coerce.number().min(0).optional(),
  isOwner: z.boolean().optional().default(false),
});

const PostBodySchema = z
  .object({
    name: z
      .string()
      .min(1, "Group name is required")
      .max(40, "Keep it short — 40 characters max"),
    mode: z.nativeEnum(GroupMode),
    totalBudget: z.coerce.number().positive().optional(),
    members: z.array(MemberSchema).min(1, "Add at least one person"),
  })
  .superRefine((data, ctx) => {
    if (data.mode === GroupMode.POOLED && !data.totalBudget) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["totalBudget"],
        message: "Total budget is required",
      });
    }
    if (data.mode === GroupMode.PER_MEMBER) {
      data.members.forEach((m, i) => {
        if (m.budgetAmount === undefined || m.budgetAmount <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["members", i, "budgetAmount"],
            message: "Budget is required for each person",
          });
        }
      });
    }
  });

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canUseGroupExpenses(session.user.plan)) {
      return NextResponse.json(
        { error: "Upgrade to Elite to use group transactions." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsed = PostBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, mode, totalBudget, members } = parsed.data;

    const group = await prisma.group.create({
      data: {
        name,
        mode,
        totalBudget: mode === GroupMode.POOLED ? totalBudget : null,
        user: { connect: { id: userId } },
        members: {
          create: members.map((m) => ({
            name: m.name,
            isOwner: m.isOwner,
            budgetAmount: mode === GroupMode.PER_MEMBER ? m.budgetAmount : null,
          })),
        },
      },
      include: { members: true },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("POST /groups error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
