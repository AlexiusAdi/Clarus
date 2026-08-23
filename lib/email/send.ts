import { Resend } from "resend";
import { createUnsubscribeToken } from "./unsubscribe";

let client: Resend | null = null;

function resend(): Resend {
  if (!client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    client = new Resend(key);
  }
  return client;
}

export type DigestEmail = {
  userId: string;
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendResult = {
  sent: string[];
  failed: { userId: string; error: string }[];
};

/** Resend caps a single batch call at 100 messages. */
const BATCH_SIZE = 100;

/**
 * Sends via the batch endpoint rather than one call per recipient — the same
 * lesson as the price fetcher: a sequential loop is what eventually times the
 * cron out. Failures are reported per user so the caller can leave those
 * users' lastDigestSentAt untouched and retry them tomorrow.
 */
export async function sendDigests(emails: DigestEmail[]): Promise<SendResult> {
  const result: SendResult = { sent: [], failed: [] };
  if (emails.length === 0) return result;

  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not set");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);

    try {
      const { error } = await resend().batch.send(
        chunk.map((email) => ({
          from,
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text,
          headers: {
            // Gmail and Outlook require these for bulk senders; without them
            // the digest is much more likely to be filtered.
            "List-Unsubscribe": `<${appUrl}/api/unsubscribe?token=${encodeURIComponent(
              createUnsubscribeToken(email.userId),
            )}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        })),
      );

      if (error) {
        for (const email of chunk) {
          result.failed.push({ userId: email.userId, error: error.message });
        }
        continue;
      }

      result.sent.push(...chunk.map((email) => email.userId));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      for (const email of chunk) {
        result.failed.push({ userId: email.userId, error: message });
      }
    }
  }

  return result;
}
