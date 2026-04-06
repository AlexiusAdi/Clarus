import { auth } from "@/auth";
import { TransactionType } from "@/lib/generated/prisma/browser";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const investment = await prisma.investment.findUnique({
      where: { id },
    });

    if (!investment) {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: 404 },
      );
    }

    if (investment.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.investment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /investment error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      type,
      assetIdentifier,
      quantity,
      unit,
      totalInvestment,
      date,
    } = body;

    if (!name || !type || !quantity || !unit || !totalInvestment || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const parsedQuantity = Number(quantity);
    const parsedTotal = Number(totalInvestment);

    if (
      isNaN(parsedQuantity) ||
      parsedQuantity <= 0 ||
      isNaN(parsedTotal) ||
      parsedTotal <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid quantity or totalInvestment" },
        { status: 400 },
      );
    }

    let normalizedIdentifier = (assetIdentifier ?? "").trim();
    if (type === "STOCK" && !normalizedIdentifier.endsWith(".JK")) {
      normalizedIdentifier = `${normalizedIdentifier}.JK`;
    }
    if (type === "CRYPTO") {
      normalizedIdentifier = normalizedIdentifier.toLowerCase();
    }

    await prisma.assetPrice.upsert({
      where: { identifier: normalizedIdentifier },
      update: {},
      create: { identifier: normalizedIdentifier, type, priceIdr: 0 },
    });

    const costPerUnit = parsedTotal / parsedQuantity;

    const investment = await prisma.investment.update({
      where: { id, userId: session.user.id },
      data: {
        name,
        type,
        assetIdentifier: normalizedIdentifier,
        quantity: parsedQuantity,
        unit,
        costPerUnit,
        totalInvestment: parsedTotal,
        date: new Date(date),
      },
    });

    // update the linked transaction amount
    await prisma.transaction.updateMany({
      where: {
        userId: session.user.id,
        type: TransactionType.INVESTMENTS,
        date: investment.date,
      },
      data: { amount: parsedTotal },
    });

    return NextResponse.json(investment);
  } catch (error) {
    console.error("[investments PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update investment" },
      { status: 500 },
    );
  }
}
