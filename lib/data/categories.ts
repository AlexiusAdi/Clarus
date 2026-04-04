import { prisma } from "@/lib/prisma";
import { TransactionType } from "../generated/prisma/enums";

export type CategoryDTO = {
  id: string;
  name: string;
  type: TransactionType;
  isDefault: boolean;
  createdAt: Date;
  userId: string | null;
};

export async function getCategories(userId: string): Promise<CategoryDTO[]> {
  const categories = await prisma.category.findMany({
    where: {
      OR: [{ userId: null }, { userId }],
    },
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    isDefault: c.isDefault,
    createdAt: c.createdAt,
    userId: c.userId,
  }));
}
