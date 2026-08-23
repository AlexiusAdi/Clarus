import { createHmac, timingSafeEqual } from "crypto";

/**
 * Unsubscribe links are opened from a mail client, where there is no session —
 * so the link itself has to carry proof. The token is an HMAC of the user id
 * keyed on NEXTAUTH_SECRET: it can't be forged without the secret, and it
 * can't be pointed at another user by editing the id in the URL.
 *
 * No expiry: an unsubscribe link must keep working in an email from a year
 * ago, and the worst case for a leaked token is that someone unsubscribes a
 * user from a digest they can re-enable in settings.
 */
function sign(userId: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  return createHmac("sha256", secret).update(userId).digest("hex");
}

export function createUnsubscribeToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const userId = token.slice(0, separator);
  const provided = token.slice(separator + 1);

  let expected: string;
  try {
    expected = sign(userId);
  } catch {
    return null;
  }

  const a = Buffer.from(provided, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return null;

  return timingSafeEqual(a, b) ? userId : null;
}

export function unsubscribeUrl(userId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}/api/unsubscribe?token=${encodeURIComponent(
    createUnsubscribeToken(userId),
  )}`;
}
