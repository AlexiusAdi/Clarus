"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { FREE_LIMITS, PLAN_PRICES, PRO_FEATURES } from "@/constants/plans";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { PlanInfo } from "@/app/Types";

const UpgradePage = () => {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetch("/api/upgrade")
      .then((r) => r.json())
      .then((data) => setPlanInfo(data))
      .catch(() => toast.error("Failed to load plan info"))
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "PRO" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "Upgrade failed");
        setUpgrading(false);
        return;
      }

      // The plan is granted by the Midtrans webhook once payment clears, not
      // here — so this hands off to the payment page and leaves the button in
      // its loading state until the browser navigates away.
      window.location.href = data.redirectUrl;
    } catch {
      toast.error("Something went wrong");
      setUpgrading(false);
    }
  };

  const currentPlan = planInfo?.plan ?? "FREE";
  const userName = planInfo?.name ?? "there";
  const isPaid = currentPlan !== "FREE";

  const yearly = PLAN_PRICES.PRO;
  // Shown alongside the yearly price because a monthly figure is how people
  // judge whether a subscription is affordable, even when they pay once a year.
  const monthly = Math.round(yearly / 12);

  const currentPlanLabel = currentPlan === "FREE" ? "Free" : "Pro";

  const planExpiresLabel = planInfo?.planExpiresAt
    ? `Expires ${new Date(planInfo.planExpiresAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`
    : null;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-start px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Upgrade Certus
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          One plan, everything included
        </p>
      </div>

      {/* Plan card */}
      <div className="w-full max-w-md">
        <div className="bg-background rounded-2xl border border-border p-6 flex flex-col">
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground mb-1">Pro</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-foreground">
                {formatCurrency(yearly)}
              </span>
              <span className="text-sm text-muted-foreground">/ yr</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              About {formatCurrency(monthly)} a month, billed yearly
            </p>
          </div>

          <div className="h-px bg-border mb-4" />

          <ul className="flex flex-col gap-2.5 flex-1">
            {PRO_FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-foreground">{f.label}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={isPaid || upgrading || loading}
            className="mt-6 w-full rounded-xl border border-border bg-ink hover:opacity-90 transition-opacity py-2.5 text-sm font-medium text-background disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {upgrading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPaid ? (
              "Current plan"
            ) : (
              "Get Pro"
            )}
          </button>
        </div>

        {/* Current plan footer */}
        <div className="mt-4 w-full bg-background rounded-2xl border border-border px-5 py-4 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-foreground">
              {loading ? "·" : userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {loading ? "Loading..." : `Currently on ${currentPlanLabel}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentPlan === "FREE" ? FREE_LIMITS : (planExpiresLabel ?? "")}
            </p>
          </div>
        </div>
      </div>

      {/* Fine print */}
      <p className="mt-5 text-xs text-muted-foreground text-center">
        Billed yearly · Cancel anytime · No hidden fees · IDR billing
      </p>

      {/* Back link */}
      <Link href="/" className="p-4">
        <Button className="active:scale-95 transition-transform">← Back</Button>
      </Link>
    </div>
  );
};

export default UpgradePage;
