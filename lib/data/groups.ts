import { prisma } from "@/lib/prisma";
import {
  GroupMode,
  GroupStatus,
  TransactionType,
} from "@/lib/generated/prisma/enums";

export type GroupMemberDTO = {
  id: string;
  name: string;
  isOwner: boolean;
  budgetAmount: number | null;
  spent: number;
  remaining: number | null;
};

export type GroupDTO = {
  id: string;
  name: string;
  mode: GroupMode;
  status: GroupStatus;
  totalBudget: number;
  spent: number;
  remaining: number;
  memberCount: number;
  createdAt: Date;
};

export type GroupTransactionDTO = {
  id: string;
  amount: number;
  description: string | null;
  date: Date;
  memberId: string | null;
  memberName: string | null;
};

export type GroupDetailDTO = GroupDTO & {
  members: GroupMemberDTO[];
};

// PER_MEMBER groups have no Group.totalBudget of their own — it's the sum of
// each member's budgetAmount, computed here so list and detail views don't
// duplicate the same rollup math.
function budgetForMode(
  mode: GroupMode,
  totalBudget: { toNumber(): number } | null,
  members: { budgetAmount: { toNumber(): number } | null }[],
) {
  if (mode === GroupMode.POOLED) return totalBudget?.toNumber() ?? 0;
  return members.reduce((sum, m) => sum + (m.budgetAmount?.toNumber() ?? 0), 0);
}

export async function getGroups(userId: string): Promise<GroupDTO[]> {
  const groups = await prisma.group.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { members: { select: { budgetAmount: true } } },
  });

  if (groups.length === 0) return [];

  const spendRows = await prisma.transaction.groupBy({
    by: ["groupId"],
    where: {
      userId,
      groupId: { in: groups.map((g) => g.id) },
      type: TransactionType.EXPENSE,
    },
    _sum: { amount: true },
  });
  const spendByGroup = new Map(
    spendRows.map((r) => [r.groupId as string, r._sum.amount?.toNumber() ?? 0]),
  );

  return groups.map((g) => {
    const spent = spendByGroup.get(g.id) ?? 0;
    const totalBudget = budgetForMode(g.mode, g.totalBudget, g.members);
    return {
      id: g.id,
      name: g.name,
      mode: g.mode,
      status: g.status,
      totalBudget,
      spent,
      remaining: totalBudget - spent,
      memberCount: g.members.length,
      createdAt: g.createdAt,
    };
  });
}

export async function getGroupDetail(
  userId: string,
  groupId: string,
): Promise<GroupDetailDTO | null> {
  const group = await prisma.group.findFirst({
    where: { id: groupId, userId },
    include: { members: true },
  });

  if (!group) return null;

  const memberSpendRows = await prisma.transaction.groupBy({
    by: ["groupMemberId"],
    where: { userId, groupId, type: TransactionType.EXPENSE },
    _sum: { amount: true },
  });

  const spendByMember = new Map(
    memberSpendRows.map((r) => [
      r.groupMemberId as string,
      r._sum.amount?.toNumber() ?? 0,
    ]),
  );

  const totalBudget = budgetForMode(group.mode, group.totalBudget, group.members);
  const spent = [...spendByMember.values()].reduce((a, b) => a + b, 0);

  const members: GroupMemberDTO[] = group.members.map((m) => {
    const memberSpent = spendByMember.get(m.id) ?? 0;
    const budgetAmount = m.budgetAmount?.toNumber() ?? null;
    return {
      id: m.id,
      name: m.name,
      isOwner: m.isOwner,
      budgetAmount,
      spent: memberSpent,
      remaining:
        group.mode === GroupMode.PER_MEMBER && budgetAmount !== null
          ? budgetAmount - memberSpent
          : null,
    };
  });

  return {
    id: group.id,
    name: group.name,
    mode: group.mode,
    status: group.status,
    totalBudget,
    spent,
    remaining: totalBudget - spent,
    memberCount: group.members.length,
    createdAt: group.createdAt,
    members,
  };
}
