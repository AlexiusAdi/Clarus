import { prisma } from "@/lib/prisma";

// This is your DTO — a plain object shape you own
export type GoalDTO = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date | null;
  isCompleted: boolean;
  createdAt: Date;
};

export async function getGoals(userId: string): Promise<GoalDTO[]> {
  const goals = await prisma.goal.findMany({ where: { userId } });
  return goals.map((g) => ({
    id: g.id,
    name: g.name,
    targetAmount: g.targetAmount.toNumber(),
    currentAmount: g.currentAmount.toNumber(),
    deadline: g.deadline,
    isCompleted: g.isCompleted,
    createdAt: g.createdAt,
  }));
}
