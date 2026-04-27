// app/api/investments/route.ts
//
// Returns the current user's investments with P&L computed server-side.
// The frontend receives ready-to-render data — no price fetching, no useState
// for prices, no calculations needed on the client.
//
// Response shape per item:
// {
//   id, name, type, assetIdentifier,
//   quantity, unit, costPerUnit, date,
//   amountInvested,       ← quantity × costPerUnit
//   currentPriceIdr,      ← from AssetPrice (null if not yet fetched)
//   currentValue,         ← quantity × currentPriceIdr (null if no price)
//   pnlAbs,               ← currentValue - amountInvested (null if no price)
//   pnlPct,               ← pnlAbs / amountInvested × 100 (null if no price)
//   priceUpdatedAt,       ← when the price was last refreshed
// }

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/lib/generated/prisma/browser";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id; // ← was missing

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1")); // ← was missing

  const userDetail = await prisma.userDetail.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const pageSize = userDetail.pageSize;

  const [investments, total] = await Promise.all([
    prisma.investment.findMany({
      where: { userId },
      include: { assetPrice: true },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.investment.count({ where: { userId } }),
  ]);

  const data = investments.map((inv) => {
    const quantity = inv.quantity.toNumber();
    const costPerUnit = inv.costPerUnit.toNumber();
    const currentPriceIdr = inv.assetPrice?.priceIdr.toNumber() ?? null;
    const normalizedQuantity = inv.unit === "lot" ? quantity * 100 : quantity;
    const amountInvested = normalizedQuantity * costPerUnit;
    const currentValue =
      currentPriceIdr !== null ? normalizedQuantity * currentPriceIdr : null;
    const pnlAbs = currentValue !== null ? currentValue - amountInvested : null;
    const pnlPct =
      pnlAbs !== null && amountInvested !== 0
        ? (pnlAbs / amountInvested) * 100
        : null;

    return {
      id: inv.id,
      name: inv.name,
      type: inv.type,
      assetIdentifier: inv.assetIdentifier,
      quantity,
      unit: inv.unit,
      costPerUnit,
      totalInvestment: inv.totalInvestment.toNumber(),
      date: inv.date,
      amountInvested,
      currentPriceIdr,
      currentValue,
      pnlAbs,
      pnlPct,
      priceUpdatedAt: inv.assetPrice?.updatedAt ?? null,
      assetPrice: inv.assetPrice
        ? {
            identifier: inv.assetPrice.identifier,
            priceIdr: inv.assetPrice.priceIdr.toNumber(),
          }
        : null,
    };
  });

  return NextResponse.json({ data, total, page, pageSize });
}

// ── POST — create a new holding ───────────────────────────────────────────────
// After inserting, immediately triggers a price fetch for the new asset
// so the card shows P&L without waiting for the next cron run.

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, type, assetIdentifier, quantity, unit, totalInvestment, date } =
    body;

  if (
    !name ||
    !type ||
    !assetIdentifier ||
    !quantity ||
    !unit ||
    !totalInvestment ||
    !date
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  let normalizedIdentifier = assetIdentifier.trim();

  if (type === "STOCK" && !normalizedIdentifier.endsWith(".JK")) {
    normalizedIdentifier = `${normalizedIdentifier}.JK`;
  }

  // Optional: normalize crypto to lowercase (CoinGecko uses lowercase IDs)
  if (type === "CRYPTO") {
    normalizedIdentifier = normalizedIdentifier.toLowerCase();
  }

  await prisma.assetPrice.upsert({
    where: { identifier: normalizedIdentifier },
    update: {},
    create: {
      identifier: normalizedIdentifier,
      type,
      priceIdr: 0, // temporary placeholder until cron updates
    },
  });

  const costPerUnit = Number(totalInvestment) / Number(quantity);

  const investment = await prisma.investment.create({
    data: {
      name,
      type,
      assetIdentifier: normalizedIdentifier,
      quantity: Number(quantity),
      unit,
      costPerUnit,
      totalInvestment: Number(totalInvestment),
      date: new Date(date),
      userId: session.user.id,
    },
  });

  await prisma.transaction.create({
    data: {
      type: TransactionType.INVESTMENTS,
      amount: Number(totalInvestment),
      date: new Date(date),
      user: { connect: { id: session.user.id } },
      investment: { connect: { id: investment.id } },
    },
  });

  // check this logic since if have multiple user fetch same asset, it will trigger multiple times, maybe we can add a check if the price is already updated in last 24 hours, then skip the fetch
  // Immediately seed price for this asset (fire and forget — don't await)
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/fetch-prices`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  }).catch((err) =>
    console.error("[investments POST] Price seed failed:", err),
  );

  return NextResponse.json(investment, { status: 201 });
}
