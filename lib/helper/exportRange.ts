import { prisma } from "@/lib/prisma";
import { getFinancialPeriod } from "./financialPeriod";

export const EXPORT_RANGES = ["all", "month", "year", "12m"] as const;
export type ExportRange = (typeof EXPORT_RANGES)[number];

/** Prisma `date` filter — `lt` is exclusive, matching FinancialPeriod.end. */
export type DateFilter = { gte?: Date; lt?: Date; lte?: Date };

/**
 * Turn a range keyword (or an explicit from/to pair) into a Prisma date filter.
 *
 * "month" deliberately means the user's **financial** period, not the calendar
 * month: someone paid on the 25th thinks of their month as the 25th to the 24th,
 * and an export that disagrees with the figures on their home screen is worse
 * than no export at all.
 */
export async function resolveDateFilter(
  userId: string,
  opts: { range?: ExportRange; from?: string; to?: string },
): Promise<DateFilter | undefined> {
  const { range, from, to } = opts;

  if (range === "month") {
    const detail = await prisma.userDetail.findUnique({
      where: { userId },
      select: { financialResetDay: true },
    });
    const period = getFinancialPeriod(detail?.financialResetDay ?? 1);
    return { gte: period.start, lt: period.end };
  }

  if (range === "year") {
    return { gte: new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1)) };
  }

  if (range === "12m") {
    const start = new Date();
    start.setUTCFullYear(start.getUTCFullYear() - 1);
    return { gte: start };
  }

  if (range === "all") return undefined;

  if (from || to) {
    return {
      ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
    };
  }

  return undefined;
}
