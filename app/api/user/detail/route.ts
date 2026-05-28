import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PatchBodySchema = z.object({
  pageSize: z.number().int().min(5).max(50).optional(),
  financialResetDay: z.number().int().min(1).max(28).optional(),
  emailNotification: z.boolean().optional(),
  notificationDay: z.number().int().min(1).max(28).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const detail = await prisma.userDetail.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    return NextResponse.json(detail);
  } catch (error) {
    console.error("GET /user/detail error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
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

    const { pageSize, financialResetDay, emailNotification, notificationDay } =
      parsed.data;

    const detail = await prisma.userDetail.upsert({
      where: { userId },
      update: {
        ...(pageSize !== undefined && { pageSize }),
        ...(financialResetDay !== undefined && { financialResetDay }),
        ...(emailNotification !== undefined && { emailNotification }),
        ...(notificationDay !== undefined && { notificationDay }),
      },
      create: { userId },
    });

    return NextResponse.json(detail);
  } catch (error) {
    console.error("PATCH /user/detail error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
