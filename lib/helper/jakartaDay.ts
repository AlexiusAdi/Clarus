const jakartaDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Today's Jakarta calendar day, as UTC midnight.
 *
 * Transaction dates arrive from the client as a bare `yyyy-MM-dd` and are
 * parsed by `z.coerce.date()` into UTC midnight, so anything compared against
 * them has to use the same convention. Using a plain `new Date()` instead
 * would sit hours past today's transactions and quietly exclude them.
 */
export function jakartaTodayAsUtcMidnight(now: Date = new Date()): Date {
  return new Date(`${jakartaDay.format(now)}T00:00:00.000Z`);
}
