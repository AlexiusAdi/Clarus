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
  date: Date;
  createdAt: Date;
  userId: string;
};

export async function getInvestments(userId: string): Promise<InvestmentDTO[]> {
  const investments = await prisma.investment.findMany({ where: { userId } });
  return investments.map((i) => ({
    id: i.id,
    name: i.name,
    type: i.type,
    assetIdentifier: i.assetIdentifier,
    quantity: i.quantity.toNumber(),
    unit: i.unit,
    costPerUnit: i.costPerUnit.toNumber(),
    date: i.date,
    createdAt: i.createdAt,
    userId: i.userId,
  }));
}
