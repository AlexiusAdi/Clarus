/**
 * The payment methods Midtrans presents on the Snap page, listed here so the
 * checkout screen can name them before the handoff.
 *
 * Client-safe on purpose, and deliberately a display list rather than a
 * configuration: Midtrans decides which methods are actually enabled for the
 * merchant account, and the Snap page is where one gets chosen. Naming them a
 * step earlier is what stops the redirect feeling like a leap into someone
 * else's site — the reader already knows what they are about to be offered.
 *
 * Keep in step with the channels enabled in the Midtrans dashboard.
 */
export const PAYMENT_METHODS = [
  { name: "QRIS", detail: "Any QRIS banking or e-wallet app" },
  { name: "Bank transfer", detail: "BNI, BRI, Mandiri, Permata, CIMB Niaga" },
  { name: "GoPay", detail: "Pay from the Gojek or GoPay app" },
] as const;
