import { prisma } from "@/lib/prisma";

export async function getScheduledTransactions(userId: string) {
  const scheduled = await prisma.scheduledTransaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return scheduled.map((item) => ({
    ...item,
    amount: item.amount.toNumber(),
  }));
}

export type ScheduledTransactionDTO = Awaited<
  ReturnType<typeof getScheduledTransactions>
>[number];
