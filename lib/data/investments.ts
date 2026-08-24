import { prisma } from "@/lib/prisma";
import { InvestmentType } from "../generated/prisma/enums";

export type AssetPriceDTO = {
  identifier: string;
  type: InvestmentType;
  priceIdr: number;
  updatedAt: Date;
};

export type InvestmentDTO = {
  id: string;
  name: string;
  type: InvestmentType;
  assetIdentifier: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalInvestment: number;
  date: Date;
  createdAt: Date;
  userId: string;
  isExistingHolding: boolean;
  amountInvested: number;
  currentPriceIdr: number | null;
  currentValue: number | null;
  pnlAbs: number | null;
  pnlPct: number | null;
  priceUpdatedAt: Date | null;
};

export async function getInvestments(userId: string): Promise<InvestmentDTO[]> {
  const investments = await prisma.investment.findMany({
    where: { userId },
    include: { assetPrice: true },
  });

  return investments.map((i) => {
    const quantity = i.quantity.toNumber();
    const costPerUnit = i.costPerUnit.toNumber();
    const currentPriceIdr = i.assetPrice?.priceIdr.toNumber() ?? null;
    const normalizedQuantity = i.unit === "lot" ? quantity * 100 : quantity;
    // costPerUnit is totalInvestment / quantity using the quantity exactly as
    // entered (lots, for IDX stocks) — re-multiplying it by normalizedQuantity
    // (share-converted) inflates this 100x for lot-based holdings. The total
    // cost is already known directly, so just use it.
    const amountInvested = i.totalInvestment.toNumber();
    const currentValue =
      currentPriceIdr !== null ? normalizedQuantity * currentPriceIdr : null;
    const pnlAbs = currentValue !== null ? currentValue - amountInvested : null;
    const pnlPct =
      pnlAbs !== null && amountInvested !== 0
        ? (pnlAbs / amountInvested) * 100
        : null;

    return {
      id: i.id,
      name: i.name,
      type: i.type,
      assetIdentifier: i.assetIdentifier,
      quantity,
      unit: i.unit,
      costPerUnit,
      totalInvestment: i.totalInvestment.toNumber(),
      date: i.date,
      createdAt: i.createdAt,
      userId: i.userId,
      isExistingHolding: i.isExistingHolding,
      amountInvested,
      currentPriceIdr,
      currentValue,
      pnlAbs,
      pnlPct,
      priceUpdatedAt: i.assetPrice?.updatedAt ?? null,
    };
  });
}
