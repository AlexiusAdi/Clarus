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
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  // Read-only: onboarding guarantees this row exists before a user can reach
  // any private route, so there's no need to upsert on every page load.
  const userDetail = await prisma.userDetail.findUnique({
    where: { userId },
    select: { pageSize: true },
  });

  const pageSize = userDetail?.pageSize ?? 10;

  const where = {
    userId,
    ...((from || to) && {
      date: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(`${to}T23:59:59.999`) }),
      },
    }),
  };

  const [investments, total] = await Promise.all([
    prisma.investment.findMany({
      where,
      include: { assetPrice: true },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.investment.count({ where }),
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

import { z } from "zod";
import { InvestmentType } from "@/lib/generated/prisma/enums";
import {
  canAddInvestment,
  FREE_INVESTMENT_LIMIT,
  isPro,
} from "@/lib/helper/plan";
import { fetchAndCacheAssetPrices } from "@/lib/helper/fetchAndCacheAssetPrices";

const investmentPostSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(InvestmentType),
    assetIdentifier: z.string().optional(),
    quantity: z.coerce.number().optional(),
    unit: z.string().min(1, "Unit is required"),
    totalInvestment: z.coerce
      .number()
      .positive("Total investment must be greater than 0"),
    date: z.string().min(1, "Date is required"),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "OTHER") {
      if (!data.quantity || data.quantity <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Quantity is required",
          path: ["quantity"],
        });
      }
      if (!data.assetIdentifier?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Asset identifier is required",
          path: ["assetIdentifier"],
        });
      }
    }
  });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const parsed = investmentPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { name, type, assetIdentifier, quantity, unit, totalInvestment, date } =
    parsed.data;

  if (!isPro(session.user.plan)) {
    // Watch-list rows (trackOnly) hold no money and don't reach net worth, so
    // they don't consume a slot — the cap is on actual holdings.
    const investmentCount = await prisma.investment.count({
      where: { userId: session.user.id, trackOnly: false },
    });

    if (!canAddInvestment(session.user.plan, investmentCount)) {
      return NextResponse.json(
        {
          error: `Free plan is limited to ${FREE_INVESTMENT_LIMIT} investments. Upgrade to Pro for unlimited.`,
        },
        { status: 403 },
      );
    }
  }

  let normalizedIdentifier = assetIdentifier?.trim() ?? "";

  if (type === "OTHER") {
    normalizedIdentifier = `other_${name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
  } else if (type === "CRYPTO") {
    normalizedIdentifier = normalizedIdentifier.toLowerCase();
  }

  await prisma.assetPrice.upsert({
    where: { identifier: normalizedIdentifier },
    update: {},
    create: {
      identifier: normalizedIdentifier,
      type,
      priceIdr: 0,
    },
  });

  const parsedQuantity = quantity ?? 0;
  const costPerUnit = parsedQuantity > 0 ? totalInvestment / parsedQuantity : 0;

  const investment = await prisma.investment.create({
    data: {
      name,
      type,
      assetIdentifier: normalizedIdentifier,
      quantity: parsedQuantity,
      unit,
      costPerUnit,
      totalInvestment,
      date: new Date(date),
      userId: session.user.id,
    },
  });

  await prisma.transaction.create({
    data: {
      type: TransactionType.INVESTMENTS,
      amount: totalInvestment,
      date: new Date(date),
      user: { connect: { id: session.user.id } },
      investment: { connect: { id: investment.id } },
    },
  });

  if (type !== "OTHER") {
    // Seed just this asset's price in-process. The old version called the cron
    // route over HTTP, which refreshed every tracked asset and often never
    // finished — the lambda froze once this response was sent.
    try {
      await fetchAndCacheAssetPrices([normalizedIdentifier]);
    } catch (err) {
      console.error("[investments POST] Price seed failed:", err);
    }
  }

  return NextResponse.json(investment, { status: 201 });
}
