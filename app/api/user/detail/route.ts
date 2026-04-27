import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
    const { pageSize, financialResetDay, emailNotification, notificationDay } =
      body;

    // Validate
    if (pageSize !== undefined && (pageSize < 5 || pageSize > 50)) {
      return NextResponse.json(
        { error: "pageSize must be between 5 and 50" },
        { status: 400 },
      );
    }
    if (
      financialResetDay !== undefined &&
      (financialResetDay < 1 || financialResetDay > 28)
    ) {
      return NextResponse.json(
        { error: "financialResetDay must be between 1 and 28" },
        { status: 400 },
      );
    }
    if (
      notificationDay !== undefined &&
      (notificationDay < 1 || notificationDay > 28)
    ) {
      return NextResponse.json(
        { error: "notificationDay must be between 1 and 28" },
        { status: 400 },
      );
    }

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
