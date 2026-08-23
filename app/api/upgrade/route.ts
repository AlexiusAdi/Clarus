import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PlanType } from "@/lib/generated/prisma/enums";
import {
  PLAN_PRICES,
  createSnapTransaction,
  isMidtransConfigured,
} from "@/lib/payment/midtrans";

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

/**
 * POST /api/upgrade — start a payment.
 *
 * This route deliberately grants nothing. It records a PENDING PaymentOrder and
 * returns the Midtrans payment page; the plan is only applied by the webhook in
 * app/api/midtrans/notification, after a signed callback confirms the money
 * arrived. Anything the browser can call directly, the browser can call for
 * free — which is exactly what the previous version of this route did.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!isMidtransConfigured()) {
      return NextResponse.json(
        { message: "Payments are not available right now." },
        { status: 503 },
      );
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.plan === plan) {
      return NextResponse.json(
        { message: `You are already on the ${plan} plan.` },
        { status: 400 },
      );
    }

    // Price comes from the server, never from the request body.
    const amount = PLAN_PRICES[plan];

    const order = await prisma.paymentOrder.create({
      data: { userId, plan: plan as PlanType, amount },
      select: { id: true },
    });

    let snap;
    try {
      snap = await createSnapTransaction({
        orderId: order.id,
        amount,
        plan,
        customer: { name: user.name, email: user.email },
      });
    } catch (error) {
      console.error("POST /api/upgrade — Midtrans error:", error);
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { message: "Could not start payment. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      orderId: order.id,
      redirectUrl: snap.redirectUrl,
    });
  } catch (error) {
    console.error("POST /api/upgrade error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
