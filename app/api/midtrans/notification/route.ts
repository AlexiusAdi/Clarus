import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PlanType } from "@/lib/generated/prisma/enums";
import {
  verifyNotificationSignature,
  resolveTransactionStatus,
} from "@/lib/payment/midtrans";

const notificationSchema = z.object({
  order_id: z.string().min(1),
  status_code: z.string().min(1),
  gross_amount: z.string().min(1),
  signature_key: z.string().min(1),
  transaction_status: z.string().min(1),
  fraud_status: z.string().optional(),
  transaction_id: z.string().optional(),
  payment_type: z.string().optional(),
});

/** Paid plans run for a year. */
const PLAN_DURATION_YEARS = 1;

/**
 * POST /api/midtrans/notification — the only place a paid plan is granted.
 *
 * Unauthenticated by necessity: Midtrans calls it server-to-server, so there is
 * no session. The HMAC signature is the credential, and a payload that fails it
 * is rejected before anything is read from the database.
 *
 * proxy.ts already excludes /api from its matcher, so no routing change is
 * needed. This URL must be registered as the Payment Notification URL in the
 * Midtrans dashboard.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = notificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const payload = parsed.data;

    if (!verifyNotificationSignature(payload)) {
      console.warn(
        `[midtrans] Rejected notification for ${payload.order_id}: bad signature`,
      );
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    const order = await prisma.paymentOrder.findUnique({
      where: { id: payload.order_id },
      select: { id: true, userId: true, plan: true, amount: true, status: true },
    });

    if (!order) {
      // 200 so Midtrans stops retrying a callback we can never resolve.
      console.warn(`[midtrans] No order for ${payload.order_id}`);
      return NextResponse.json({ message: "Order not found" }, { status: 200 });
    }

    // Midtrans retries until it gets a 200, so the same successful callback
    // arrives more than once. Without this an order could extend a plan twice.
    if (order.status === "PAID") {
      return NextResponse.json({ message: "Already processed" });
    }

    // The amount is checked against what we recorded, not what was sent, so a
    // forged-but-somehow-signed payload cannot buy ELITE at the PRO price.
    const paidAmount = Number(payload.gross_amount);
    if (Math.round(paidAmount) !== Math.round(order.amount.toNumber())) {
      console.error(
        `[midtrans] Amount mismatch on ${order.id}: paid ${paidAmount}, expected ${order.amount.toNumber()}`,
      );
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ message: "Amount mismatch" }, { status: 200 });
    }

    const status = resolveTransactionStatus(
      payload.transaction_status,
      payload.fraud_status,
    );

    if (status !== "PAID") {
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: { status },
      });
      return NextResponse.json({ message: `Recorded as ${status}` });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: order.userId },
      select: { plan: true, planExpiresAt: true },
    });

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 200 });
    }

    // Extend from the existing expiry when one is still in the future, so
    // renewing early adds to the remaining time instead of discarding it.
    const base =
      currentUser.planExpiresAt && currentUser.planExpiresAt > new Date()
        ? currentUser.planExpiresAt
        : new Date();
    const planExpiresAt = new Date(base);
    planExpiresAt.setFullYear(planExpiresAt.getFullYear() + PLAN_DURATION_YEARS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: order.userId },
        data: { plan: order.plan as PlanType, planExpiresAt },
      }),
      prisma.paymentOrder.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: new Date() },
      }),
      prisma.planHistory.create({
        data: {
          userId: order.userId,
          fromPlan: currentUser.plan,
          toPlan: order.plan as PlanType,
          source: payload.transaction_id ?? order.id,
          note: `Midtrans ${payload.payment_type ?? "payment"} — order ${order.id}`,
        },
      }),
    ]);

    console.log(`[midtrans] Granted ${order.plan} to ${order.userId}`);
    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("POST /api/midtrans/notification error:", error);
    // 500 so Midtrans retries — the payment is real even if we failed to record it.
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
