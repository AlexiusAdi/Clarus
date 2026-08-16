"use client";

import { useEffect, useState } from "react";
import { Check, Minus, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { ELITE_FEATURES, FREE_LIMITS, PRO_FEATURES } from "@/constants";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlanType } from "@/lib/generated/prisma/browser";
import { useRouter } from "next/navigation";
import { PlanInfo } from "@/app/Types";

const UpgradePage = () => {
  const router = useRouter();
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<PlanType | null>(null);

  useEffect(() => {
    fetch("/api/upgrade")
      .then((r) => r.json())
      .then((data) => setPlanInfo(data))
      .catch(() => toast.error("Failed to load plan info"))
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (plan: "PRO" | "ELITE") => {
    setUpgrading(plan);
    try {
      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "Upgrade failed");
        return;
      }
      toast.success(data.message);
      setPlanInfo((prev) =>
        prev
          ? { ...prev, plan: data.plan, planExpiresAt: data.planExpiresAt }
          : prev,
      );
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpgrading(null);
    }
  };

  const currentPlan = planInfo?.plan ?? "FREE";
  const userName = planInfo?.name ?? "there";

  const currentPlanLabel =
    currentPlan === "FREE" ? "Free" : currentPlan === "PRO" ? "Pro" : "Elite";

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
          Upgrade Clarus
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the plan that fits your financial journey
        </p>
      </div>

      {/* Plan cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
        {/* Pro */}
        <div className="flex-1 bg-background rounded-2xl border border-border p-6 flex flex-col">
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground mb-1">Pro</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-foreground">
                Rp 299k
              </span>
              <span className="text-sm text-muted-foreground">/ yr</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              About Rp 25k a month, billed yearly
            </p>
          </div>

          <div className="h-px bg-border mb-4" />

          <ul className="flex flex-col gap-2.5 flex-1">
            {PRO_FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-2.5">
                {f.included ? (
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Minus className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    f.included ? "text-foreground" : "text-muted-foreground/60"
                  }`}
                >
                  {f.label}
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleUpgrade("PRO")}
            disabled={currentPlan === "PRO" || upgrading !== null || loading}
            className="mt-6 w-full rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors py-2.5 text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {upgrading === "PRO" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : currentPlan === "PRO" ? (
              "Current plan"
            ) : (
              "Get Pro"
            )}
          </button>
        </div>

        {/* Elite */}
        <div className="flex-1 bg-background rounded-2xl border-2 border-violet-400 dark:border-violet-500 p-6 flex flex-col relative">
          {/* Best value badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 text-xs font-medium px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            Best value
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-foreground mb-1">Elite</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-violet-600 dark:text-violet-400">
                Rp 349k
              </span>
              <span className="text-sm text-muted-foreground">/ yr</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              About Rp 29k a month, billed yearly
            </p>
          </div>

          <div className="h-px bg-border mb-4" />

          <ul className="flex flex-col gap-2.5 flex-1">
            {ELITE_FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-foreground">{f.label}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleUpgrade("ELITE")}
            disabled={currentPlan === "ELITE" || upgrading !== null || loading}
            className="mt-6 w-full rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors py-2.5 text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {upgrading === "ELITE" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : currentPlan === "ELITE" ? (
              "Current plan"
            ) : (
              "Get Elite"
            )}
          </button>
        </div>
      </div>

      {/* Current plan footer */}
      <div className="mt-4 w-full max-w-2xl bg-background rounded-2xl border border-border px-5 py-4 flex items-center gap-3">
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
