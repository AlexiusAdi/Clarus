import { Check, Minus, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import Link from "next/link";
import { ELITE_FEATURES, PRO_FEATURES } from "@/constants";
import { Button } from "@/components/ui/button";

const FREE_LIMITS =
  "3 assets, 3 investments and 5 Scheduled Transactions · No goals · No AI";

const UpgradePage = async () => {
  const session = await auth();
  const userName = session?.user?.name ?? "there";

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
                Rp 19k
              </span>
              <span className="text-sm text-muted-foreground">/ mo</span>
            </div>
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

          <button className="mt-6 w-full rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors py-2.5 text-sm font-medium text-foreground">
            Get Pro
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
                Rp 39k
              </span>
              <span className="text-sm text-muted-foreground">/ mo</span>
            </div>
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

          <button className="mt-6 w-full rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors py-2.5 text-sm font-medium text-foreground">
            Get Elite
          </button>
        </div>
      </div>

      {/* Current plan footer */}
      <div className="mt-4 w-full max-w-2xl bg-background rounded-2xl border border-border px-5 py-4 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-foreground">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Currently on Free
          </p>
          <p className="text-xs text-muted-foreground">{FREE_LIMITS}</p>
        </div>
      </div>

      {/* Fine print */}
      <p className="mt-5 text-xs text-muted-foreground text-center">
        Cancel anytime · No hidden fees · IDR billing
      </p>

      {/* Back link */}
      <Link href="/" className="p-4">
        <Button className=" active:scale-95">← Back</Button>
      </Link>
    </div>
  );
};

export default UpgradePage;
