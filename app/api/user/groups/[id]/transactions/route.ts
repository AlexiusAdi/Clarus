import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { GroupTransactionDTO } from "@/lib/data/groups";
import { z } from "zod";

const GetQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: groupId } = await params;

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

    const group = await prisma.group.findFirst({
      where: { id: groupId, userId },
      select: { id: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const userDetail = await prisma.userDetail.findUnique({
      where: { userId },
      select: { pageSize: true },
    });

    const pageSize = userDetail?.pageSize ?? 10;

    const where = { userId, groupId };

    const [raw, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          amount: true,
          description: true,
          date: true,
          groupMemberId: true,
          groupMember: { select: { name: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const data: GroupTransactionDTO[] = raw.map((t) => ({
      id: t.id,
      amount: t.amount.toNumber(),
      description: t.description,
      date: t.date,
      memberId: t.groupMemberId,
      memberName: t.groupMember?.name ?? null,
    }));

    return NextResponse.json({ data, total, page, pageSize });
  } catch (error) {
    console.error("GET /groups/[id]/transactions error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
