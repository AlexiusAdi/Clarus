import { auth } from "@/auth";
import { TransactionType } from "@/lib/generated/prisma/browser";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { InvestmentType } from "@/lib/generated/prisma/browser";

const PatchBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(InvestmentType),
  assetIdentifier: z.string().optional().default(""),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  totalInvestment: z.coerce
    .number()
    .positive("Total investment must be positive"),
  date: z.coerce.date(),
  isExistingHolding: z.boolean().optional().default(false),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const investment = await prisma.investment.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!investment) {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: 404 },
      );
    }

    await prisma.investment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /investment error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

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

    const {
      name,
      type,
      assetIdentifier,
      quantity,
      unit,
      totalInvestment,
      date,
      isExistingHolding,
    } = parsed.data;

    let normalizedIdentifier = assetIdentifier.trim();
    if (type === "CRYPTO") {
      normalizedIdentifier = normalizedIdentifier.toLowerCase();
    }

    await prisma.assetPrice.upsert({
      where: { identifier: normalizedIdentifier },
      update: {},
      create: { identifier: normalizedIdentifier, type, priceIdr: 0 },
    });

    const investment = await prisma.investment.update({
      where: { id, userId },
      data: {
        name,
        type,
        assetIdentifier: normalizedIdentifier,
        quantity,
        unit,
        costPerUnit: totalInvestment / quantity,
        totalInvestment,
        date,
        isExistingHolding,
      },
    });

    // Linked by investmentId rather than matching on date — the previous
    // date-based lookup silently missed the transaction (leaving it stale)
    // whenever the investment's date changed as part of the same edit.
    const existingTxn = await prisma.transaction.findFirst({
      where: { userId, investmentId: id },
    });

    if (isExistingHolding) {
      // Now marked as portfolio-only — a cash-flow transaction shouldn't exist.
      if (existingTxn) {
        await prisma.transaction.delete({ where: { id: existingTxn.id } });
      }
    } else if (existingTxn) {
      await prisma.transaction.update({
        where: { id: existingTxn.id },
        data: { amount: totalInvestment, date },
      });
    } else {
      // Was previously an existing holding (no transaction) and is now a
      // real cash-flow entry.
      await prisma.transaction.create({
        data: {
          type: TransactionType.INVESTMENTS,
          amount: totalInvestment,
          date,
          user: { connect: { id: userId } },
          investment: { connect: { id } },
        },
      });
    }

    return NextResponse.json(investment);
  } catch (error) {
    console.error("[investments PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update investment" },
      { status: 500 },
    );
  }
}
