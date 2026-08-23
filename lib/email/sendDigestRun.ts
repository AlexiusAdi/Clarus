import { prisma } from "@/lib/prisma";
import { PlanType } from "@/lib/generated/prisma/enums";
import {
  getFinancialPeriod,
  DIGEST_LEAD_DAYS,
} from "@/lib/helper/financialPeriod";
import { getDigestData } from "@/lib/data/getDigestData";
import {
  digestHtml,
  digestSubject,
  digestText,
} from "@/lib/email/digestTemplate";
import { unsubscribeUrl } from "@/lib/email/unsubscribe";
import { sendDigests, DigestEmail } from "@/lib/email/send";

export type DigestRunResult = {
  candidates: number;
  due: number;
  sent: number;
  failed: number;
  skipped: number;
};

/**
 * One cycle-close digest per user per period.
 *
 * Two things make this safe to run every night:
 *
 *  - Recipients are selected by *their own* reset day, so a single daily pass
 *    covers every user regardless of when their cycle closes.
 *  - The idempotency guard is scoped to the period, not to the calendar day.
 *    A cron retry that lands after midnight UTC still sees lastDigestSentAt
 *    inside the current period and skips, so nobody is mailed twice.
 */
export async function sendDigestRun(
  now: Date = new Date(),
): Promise<DigestRunResult> {
  const candidates = await prisma.userDetail.findMany({
    where: {
      emailNotification: true,
      user: { plan: PlanType.ELITE },
    },
    select: {
      userId: true,
      financialResetDay: true,
      lastDigestSentAt: true,
      user: { select: { email: true, name: true } },
    },
  });

  const emails: DigestEmail[] = [];
  let skipped = 0;

  for (const detail of candidates) {
    const period = getFinancialPeriod(detail.financialResetDay, now);

    const daysUntilClose = Math.ceil(
      (period.end.getTime() - now.getTime()) / 86_400_000,
    );

    if (daysUntilClose !== DIGEST_LEAD_DAYS) {
      skipped++;
      continue;
    }

    // Already mailed inside this period — a retry, not a new cycle.
    if (detail.lastDigestSentAt && detail.lastDigestSentAt >= period.start) {
      skipped++;
      continue;
    }

    try {
      const data = await getDigestData(
        detail.userId,
        detail.financialResetDay,
        now,
      );

      const firstName = detail.user.name?.split(" ")[0] ?? "there";
      const link = unsubscribeUrl(detail.userId);

      emails.push({
        userId: detail.userId,
        to: detail.user.email,
        subject: digestSubject(data),
        html: digestHtml(data, firstName, link),
        text: digestText(data, firstName, link),
      });
    } catch (err) {
      console.error(
        `[cron/daily] Failed to build digest for ${detail.userId}:`,
        err,
      );
      skipped++;
    }
  }

  const result = await sendDigests(emails);

  // Stamped only for users that actually went out, so a failed send is retried
  // on tomorrow's run rather than being silently swallowed for the whole cycle.
  if (result.sent.length > 0) {
    await prisma.userDetail.updateMany({
      where: { userId: { in: result.sent } },
      data: { lastDigestSentAt: now },
    });
  }

  for (const failure of result.failed) {
    console.error(
      `[cron/daily] Digest send failed for ${failure.userId}: ${failure.error}`,
    );
  }

  return {
    candidates: candidates.length,
    due: emails.length,
    sent: result.sent.length,
    failed: result.failed.length,
    skipped,
  };
}
