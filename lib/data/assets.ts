import { AssetType } from "../generated/prisma/enums";
import { prisma } from "../prisma";

export type AssetDTO = {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  date: Date;
  createdAt: Date;
  acquisitionSource: string;
};

export async function getAssets(userId: string): Promise<AssetDTO[]> {
  const assets = await prisma.asset.findMany({ where: { userId } });
  return assets.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    value: a.value.toNumber(),
    date: a.date,
    createdAt: a.createdAt,
    acquisitionSource: a.acquisitionSource,
  }));
}
