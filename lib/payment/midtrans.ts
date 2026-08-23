import { createHash, timingSafeEqual } from "crypto";
import { PlanType } from "@/lib/generated/prisma/enums";

/**
 * Plan prices in IDR, billed yearly. The server is the only authority on what a
 * plan costs — the amount sent to Midtrans is read from here, never from the
 * request body, or a client could name its own price.
 */
export const PLAN_PRICES: Record<Exclude<PlanType, "FREE">, number> = {
  PRO: 299_000,
  ELITE: 349_000,
};

const SANDBOX_BASE = "https://app.sandbox.midtrans.com/snap/v1";
const PRODUCTION_BASE = "https://app.midtrans.com/snap/v1";

function serverKey(): string {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) throw new Error("MIDTRANS_SERVER_KEY is not set");
  return key;
}

function snapBase(): string {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? PRODUCTION_BASE
    : SANDBOX_BASE;
}

export function isMidtransConfigured(): boolean {
  return Boolean(process.env.MIDTRANS_SERVER_KEY);
}

export type SnapTransaction = {
  token: string;
  redirectUrl: string;
};

/**
 * Creates a Snap transaction and returns the hosted payment page to send the
 * user to. Returning a redirect URL rather than a Snap token keeps the whole
 * flow server-driven — no third-party script on our pages, nothing for a CSP
 * to allow, and no client-side SDK to keep in step.
 */
export async function createSnapTransaction(params: {
  orderId: string;
  amount: number;
  plan: Exclude<PlanType, "FREE">;
  customer: { name: string | null; email: string };
}): Promise<SnapTransaction> {
  const auth = Buffer.from(`${serverKey()}:`).toString("base64");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const res = await fetch(`${snapBase()}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        // Midtrans rejects non-integer IDR amounts.
        gross_amount: Math.round(params.amount),
      },
      item_details: [
        {
          id: params.plan,
          price: Math.round(params.amount),
          quantity: 1,
          name: `Clarus ${params.plan} — 1 year`,
        },
      ],
      customer_details: {
        first_name: params.customer.name ?? undefined,
        email: params.customer.email,
      },
      callbacks: { finish: `${appUrl}/upgrade` },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Midtrans returned ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    token?: string;
    redirect_url?: string;
  };

  if (!data.token || !data.redirect_url) {
    throw new Error("Midtrans response was missing token or redirect_url");
  }

  return { token: data.token, redirectUrl: data.redirect_url };
}

/**
 * Midtrans signs each notification with
 * sha512(order_id + status_code + gross_amount + server_key).
 *
 * This is the only thing separating a real payment callback from anyone who
 * knows the webhook URL, so a notification that fails it must never grant
 * anything.
 */
export function verifyNotificationSignature(payload: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}): boolean {
  let expected: string;
  try {
    expected = createHash("sha512")
      .update(
        `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey()}`,
      )
      .digest("hex");
  } catch {
    return false;
  }

  const a = Buffer.from(payload.signature_key ?? "", "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

/** Maps Midtrans transaction_status onto whether the plan should be granted. */
export function resolveTransactionStatus(
  transactionStatus: string,
  fraudStatus?: string,
): "PAID" | "PENDING" | "FAILED" | "EXPIRED" {
  switch (transactionStatus) {
    case "capture":
      // Card payments land here; only an accepted fraud check is a real sale.
      return fraudStatus === "accept" ? "PAID" : "PENDING";
    case "settlement":
      return "PAID";
    case "pending":
      return "PENDING";
    case "deny":
    case "cancel":
      return "FAILED";
    case "expire":
      return "EXPIRED";
    default:
      return "PENDING";
  }
}
