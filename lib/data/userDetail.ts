import { prisma } from "@/lib/prisma";
import { DEFAULT_RESET_DAY } from "@/lib/helper/financialPeriod";

export type UserDetailDTO = {
  pageSize: number;
  financialResetDay: number;
  emailNotification: boolean;
  notificationDay: number;
};

const FALLBACK: UserDetailDTO = {
  pageSize: 10,
  financialResetDay: DEFAULT_RESET_DAY,
  emailNotification: false,
  notificationDay: 1,
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
      notificationDay: true,
    },
  });

  return detail ?? FALLBACK;
}
