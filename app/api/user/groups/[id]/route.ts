import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { GroupStatus } from "@/lib/generated/prisma/enums";
import { z } from "zod";

const PatchBodySchema = z.object({
  name: z
    .string()
    .min(1, "Group name is required")
    .max(40, "Keep it short — 40 characters max")
    .optional(),
  totalBudget: z.coerce.number().positive().optional(),
  status: z.nativeEnum(GroupStatus).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

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

    const group = await prisma.group.findFirst({
      where: { id, userId },
      select: { id: true, mode: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const { name, totalBudget, status } = parsed.data;

    const updated = await prisma.group.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        // Only POOLED groups keep a budget on the group itself.
        ...(totalBudget !== undefined &&
          group.mode === "POOLED" && { totalBudget }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /groups/[id] error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const group = await prisma.group.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Transaction.groupId/groupMemberId are ON DELETE SET NULL — the real
    // expense history stays in the user's ledger, it just stops being
    // tracked against this group.
    await prisma.group.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /groups/[id] error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
