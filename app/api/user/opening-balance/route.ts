import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getCashBalance } from "@/lib/data/openingBalance";

/** Comfortably inside Decimal(18,2) while still absurd for a personal balance. */
const MAX_AMOUNT = 1_000_000_000_000_000;

const PostBodySchema = z.object({
  /**
   * `match` is the figure the user reads off their bank; the server subtracts
   * what Certus has already recorded to get the opening balance. `set` writes
   * the opening balance straight through, for users who know it outright.
   */
  mode: z.enum(["match", "set"]),
  amount: z.coerce
    .number()
    .finite("must be a number")
    .min(0, "cannot be negative")
    .max(MAX_AMOUNT, "is too large"),
});

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cash, anchor, recordedNet } = await getCashBalance(userId);

    return NextResponse.json({
      openingBalance: anchor.amount,
      openingBalanceDate: anchor.date,
      openingBalanceSetAt: anchor.setAt,
      recordedNet,
      cashBalance: cash,
    });
  } catch (error) {
    console.error("GET /user/opening-balance error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = PostBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { mode, amount } = parsed.data;

    // Recomputed here rather than trusted from the client: the arithmetic is
    // the whole feature, and a stale figure in the browser would quietly write
    // the wrong anchor.
    const { anchor, recordedNet } = await getCashBalance(userId);

    // A negative result is legitimate — it means the user recorded more income
    // than their bank actually holds, and the anchor has to correct downward.
    const openingBalance = Math.round(
      mode === "match" ? amount - recordedNet : amount,
    );

    // The date is deliberately left alone. It marks where the user's recorded
    // history begins; moving it forward on every reconcile would drop that
    // history out of cash and silently change what the number means.
    const detail = await prisma.userDetail.upsert({
      where: { userId },
      update: { openingBalance, openingBalanceSetAt: new Date() },
      create: {
        userId,
        openingBalance,
        openingBalanceSetAt: new Date(),
      },
      select: {
        openingBalance: true,
        openingBalanceDate: true,
        openingBalanceSetAt: true,
      },
    });

    return NextResponse.json({
      openingBalance: detail.openingBalance.toNumber(),
      openingBalanceDate: detail.openingBalanceDate,
      openingBalanceSetAt: detail.openingBalanceSetAt,
      recordedNet,
      cashBalance: openingBalance + recordedNet,
      previousOpeningBalance: anchor.amount,
    });
  } catch (error) {
    console.error("POST /user/opening-balance error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
