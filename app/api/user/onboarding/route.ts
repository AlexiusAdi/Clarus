import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { jakartaTodayAsUtcMidnight } from "@/lib/helper/jakartaDay";

/** Comfortably inside Decimal(18,2) while still absurd for a personal balance. */
const MAX_AMOUNT = 1_000_000_000_000_000;

const BodySchema = z.object({
  resetDay: z.coerce.number().int().min(1).max(28),
  /**
   * Absent means the user skipped the step, which is different from answering
   * zero: skipping leaves the anchor unset so the home screen still prompts,
   * while a deliberate zero is an answer and stops the prompt.
   */
  openingBalance: z.coerce
    .number()
    .finite()
    .min(0)
    .max(MAX_AMOUNT)
    .optional(),
  agreedToTnc: z.boolean().optional(),
  agreedToPrivacy: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { resetDay, openingBalance } = parsed.data;

    // Anchored to today because a brand-new account has no history behind it.
    // Anything the user backdates or imports later therefore sits before the
    // anchor and feeds the charts without moving cash, which is correct — the
    // figure they just typed already reflects it.
    const anchor =
      openingBalance === undefined
        ? {}
        : {
            openingBalance: Math.round(openingBalance),
            openingBalanceDate: jakartaTodayAsUtcMidnight(),
            openingBalanceSetAt: new Date(),
          };

    await prisma.userDetail.upsert({
      where: { userId: session.user.id },
      update: { financialResetDay: resetDay, ...anchor },
      create: {
        userId: session.user.id,
        financialResetDay: resetDay,
        ...anchor,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /user/onboarding error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
