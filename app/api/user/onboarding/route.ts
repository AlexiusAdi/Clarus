import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { resetDay } = await req.json();

  await prisma.userDetail.upsert({
    where: { userId: session.user.id },
    update: { financialResetDay: resetDay },
    create: { userId: session.user.id, financialResetDay: resetDay },
  });

  return NextResponse.json({ success: true });
}
