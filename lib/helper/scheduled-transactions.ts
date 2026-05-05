import { addDays, addWeeks, addMonths } from "date-fns";
import { Frequency } from "../generated/prisma/browser";

export function computeNextRunDate(
  from: Date,
  frequency: Frequency,
  interval: number,
): Date {
  switch (frequency) {
    case Frequency.DAILY:
      return addDays(from, interval);
    case Frequency.WEEKLY:
      return addWeeks(from, interval);
    case Frequency.MONTHLY:
      return addMonths(from, interval);
    case Frequency.CUSTOM:
      return addDays(from, interval);
  }
}
