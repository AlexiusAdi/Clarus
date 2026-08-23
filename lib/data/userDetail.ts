import { prisma } from "@/lib/prisma";
import { DEFAULT_RESET_DAY } from "@/lib/helper/financialPeriod";

export type UserDetailDTO = {
  pageSize: number;
  financialResetDay: number;
  emailNotification: boolean;
  lastDigestSentAt: Date | null;
};

const FALLBACK: UserDetailDTO = {
  pageSize: 10,
  financialResetDay: DEFAULT_RESET_DAY,
  emailNotification: false,
  lastDigestSentAt: null,
};

/**
 * proxy.ts forces users without a UserDetail row through /onboarding, so a miss
 * here is not expected — the fallback exists so a server page can still render
 * rather than throwing if the row is somehow absent.
 */
export async function getUserDetail(userId: string): Promise<UserDetailDTO> {
  const detail = await prisma.userDetail.findUnique({
    where: { userId },
    select: {
      pageSize: true,
      financialResetDay: true,
      emailNotification: true,
      lastDigestSentAt: true,
    },
  });

  return detail ?? FALLBACK;
}
