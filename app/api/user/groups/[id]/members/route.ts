import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { GroupMode } from "@/lib/generated/prisma/enums";
import { z } from "zod";

const PostBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  budgetAmount: z.coerce.number().min(0).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const group = await prisma.group.findFirst({
      where: { id, userId },
      select: { id: true, mode: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = PostBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    if (group.mode === GroupMode.PER_MEMBER && !parsed.data.budgetAmount) {
      return NextResponse.json(
        { error: { budgetAmount: ["Budget is required for each person"] } },
        { status: 400 },
      );
    }

    const member = await prisma.groupMember.create({
      data: {
        name: parsed.data.name,
        budgetAmount:
          group.mode === GroupMode.PER_MEMBER
            ? parsed.data.budgetAmount
            : null,
        group: { connect: { id } },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("POST /groups/[id]/members error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
