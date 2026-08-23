/**
 * Financial period = the user's personal month, running from their salary day
 * to the day before the next one, rather than from calendar 1st to month end.
 *
 * `UserDetail.financialResetDay` is capped at 28 (see app/api/user/detail/route.ts
 * and the settings picker) precisely so a period start always exists in every
 * month — no clamping for February, no 31st-of-April edge case.
 *
 * All boundaries are built in UTC. Transactions are persisted at UTC midnight
 * (`new Date("2026-03-01")`), so comparing against UTC-midnight boundaries keeps
 * a transaction dated on the reset day inside the period that starts that day.
 */

export type FinancialPeriod = {
  /** inclusive */
  start: Date;
  /** exclusive */
  end: Date;
  resetDay: number;
};

export const DEFAULT_RESET_DAY = 1;

/** Days before a period closes that the digest goes out. */
export const DIGEST_LEAD_DAYS = 2;
const MIN_RESET_DAY = 1;
const MAX_RESET_DAY = 28;

function normalizeResetDay(resetDay: number): number {
  const day = Math.trunc(resetDay);
  if (!Number.isFinite(day)) return DEFAULT_RESET_DAY;
  return Math.min(Math.max(day, MIN_RESET_DAY), MAX_RESET_DAY);
}

/**
 * The period containing `now`. If today is on or after the reset day the period
 * started this month; otherwise it started on the reset day of last month.
 */
export function getFinancialPeriod(
  resetDay: number,
  now: Date = new Date(),
): FinancialPeriod {
  const day = normalizeResetDay(resetDay);

  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const today = now.getUTCDate();

  // Date.UTC normalizes month overflow/underflow, so -1 rolls back to December.
  const startMonth = today >= day ? month : month - 1;

  return {
    start: new Date(Date.UTC(year, startMonth, day)),
    end: new Date(Date.UTC(year, startMonth + 1, day)),
    resetDay: day,
  };
}

/**
 * "1 Mar – 31 Mar" — the period rendered for a UI label. `end` is exclusive, so
 * the last day shown is the day before it.
 */
export function formatFinancialPeriod(period: FinancialPeriod): string {
  const lastDay = new Date(period.end.getTime() - 24 * 60 * 60 * 1000);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return `${fmt.format(period.start)} – ${fmt.format(lastDay)}`;
}
