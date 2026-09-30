"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * The handoff to Midtrans.
 *
 * Stays in its loading state after a successful response rather than clearing
 * it: the browser is already navigating to the payment page, and a button that
 * springs back to "Pay" mid-redirect invites a second click and a second order.
 */
const CheckoutPayButton = ({ amountLabel }: { amountLabel: string }) => {
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "PRO" }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? "Could not start payment");
        setPaying(false);
        return;
      }

      window.location.href = data.redirectUrl;
    } catch {
      toast.error("Could not reach the payment service. Try again.");
      setPaying(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={paying}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[17px] tracking-[-0.012em] text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {paying ? (
        <>
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          Opening Midtrans
        </>
      ) : (
        `Pay ${amountLabel}`
      )}
    </button>
  );
};

export default CheckoutPayButton;
