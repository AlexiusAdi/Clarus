import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const PatchBodySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  budgetAmount: z.coerce.number().min(0).optional(),
});

type RouteParams = { params: Promise<{ id: string; memberId: string }> };

async function getOwnedMember(userId: string, groupId: string, memberId: string) {
  return prisma.groupMember.findFirst({
    where: { id: memberId, groupId, group: { userId } },
    select: { id: true, group: { select: { mode: true } } },
  });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id, memberId } = await params;

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await getOwnedMember(userId, id, memberId);

    if (!member) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = PatchBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, budgetAmount } = parsed.data;

    const updated = await prisma.groupMember.update({
      where: { id: memberId },
      data: {
        ...(name && { name }),
        ...(budgetAmount !== undefined &&
          member.group.mode === "PER_MEMBER" && { budgetAmount }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /groups/[id]/members/[memberId] error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id, memberId } = await params;

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await getOwnedMember(userId, id, memberId);

    if (!member) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    const expenseCount = await prisma.transaction.count({
      where: { groupMemberId: memberId },
    });

    if (expenseCount > 0) {
      return NextResponse.json(
        {
          error:
            "This person already has expenses logged. Remove those first.",
        },
        { status: 400 },
      );
    }

    await prisma.groupMember.delete({ where: { id: memberId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /groups/[id]/members/[memberId] error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
