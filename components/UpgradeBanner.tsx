import { PlanType } from "@/lib/generated/prisma/browser";
import Link from "next/link";

interface UpgradeBannerProps {
  plan?: PlanType;
}

const UpgradeBanner = ({ plan }: UpgradeBannerProps) => {
  if (plan === "ELITE") return null;

  if (plan === "PRO") return null; // pro upsell lives in UserMenu dropdown instead

  return (
    <div className="mx-1 mt-3 mb-1 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          ✦ You&apos;re on Free
        </span>
        <span className="text-xs text-muted-foreground">
          Unlock goals, AI insights &amp; more
        </span>
      </div>
      <Link
        href="/upgrade"
        className="shrink-0 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
      >
        See plans →
      </Link>
    </div>
  );
};

export default UpgradeBanner;
