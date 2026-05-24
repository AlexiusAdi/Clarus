import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PlanType } from "@/lib/generated/prisma/browser";

const upgradeSchema = z.object({
  plan: z.enum(["PRO", "ELITE"]),
});

// GET /api/upgrade — return current user plan info
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      planExpiresAt: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    plan: user.plan,
    planExpiresAt: user.planExpiresAt,
    name: user.name,
    email: user.email,
  });
}

// POST /api/upgrade — upgrade or downgrade plan (Midtrans stub)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = upgradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid plan. Must be PRO or ELITE." },
      { status: 400 },
    );
  }

  const { plan } = parsed.data;
  const userId = session.user.id;

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!currentUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (currentUser.plan === plan) {
    return NextResponse.json(
      { message: `You are already on the ${plan} plan.` },
      { status: 400 },
    );
  }

  const planExpiresAt = new Date();
  planExpiresAt.setDate(planExpiresAt.getDate() + 30);

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        plan: plan as PlanType,
        planExpiresAt,
      },
      select: {
        plan: true,
        planExpiresAt: true,
      },
    }),
    prisma.planHistory.create({
      data: {
        userId,
        fromPlan: currentUser.plan,
        toPlan: plan as PlanType,
        source: "MIDTRANS_STUB", // TODO: replace with real Midtrans order ID
        note: "Manual upgrade via upgrade page (payment stub)",
      },
    }),
  ]);

  return NextResponse.json({
    message: `Successfully upgraded to ${plan}`,
    plan: updatedUser.plan,
    planExpiresAt: updatedUser.planExpiresAt,
  });
}
