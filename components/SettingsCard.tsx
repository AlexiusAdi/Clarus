"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Switch } from "./ui/switch";
import { ChevronRight, Zap } from "lucide-react";
import { PlanType } from "@/lib/generated/prisma/browser";
import { DIGEST_LEAD_DAYS } from "@/lib/helper/financialPeriod";
import OpeningBalanceSheet from "./OpeningBalanceSheet";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { cn } from "@/lib/utils";

type UserDetail = {
  pageSize: number;
  financialResetDay: number;
  emailNotification: boolean;
  lastDigestSentAt?: string | null;
  openingBalance: number;
  openingBalanceSetAt?: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: PlanType;
};

const longDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));

/** 1 -> "1st", 22 -> "22nd". Reset day is capped at 28, so no teens edge past 13. */
function ordinal(n: number): string {
  if (n >= 11 && n <= 13) return n + "th";
  const suffix = { 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th";
  return n + suffix;
}

export default function SettingsCard({
  open,
  onOpenChange,
  planType,
}: Props) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [reloads, setReloads] = useState(0);

  const router = useRouter();
  const isElite = planType === PlanType.ELITE;

  // Declared inside the effect, and nothing is set before the first await:
  // `detail === null` is the loading state, so there is no second flag to keep
  // in sync and no synchronous setState to cascade a render. `reloads` is how
  // the starting-balance sheet asks for a refetch when it closes.
  useEffect(() => {
    if (!open) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch("/api/user/detail");
        const json = await res.json();
        setDetail(json);
      } catch {
        toast.error("Failed to load settings");
      }
    };

    fetchDetail();
  }, [open, reloads]);

  /** Dropped on close so reopening refetches rather than showing stale values. */
  const handleOpenChange = (next: boolean) => {
    if (!next) setDetail(null);
    onOpenChange(next);
  };

  const handleSave = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/detail", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detail),
      });

      if (!res.ok) throw new Error();
      toast.success("Settings saved");
      router.refresh();
      handleOpenChange(false);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85dvh]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="w-full max-w-md mx-auto px-4 flex flex-col gap-4 overflow-y-auto drawer-safe">
          {!detail ? (
            <>
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </>
          ) : (
            <>
              {/* Display */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Display
              </p>
              <Card>
                <CardContent className="p-0 divide-y divide-border">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Items per page</p>
                      <p className="text-xs text-muted-foreground">
                        Number of items shown per page
                      </p>
                    </div>
                    <Select
                      value={String(detail.pageSize)}
                      onValueChange={(v) =>
                        setDetail({ ...detail, pageSize: Number(v) })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 10, 15, 20, 25, 50, 100].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Finance */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Finance
              </p>
              <Card>
                <CardContent className="p-0 divide-y divide-border">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Financial reset day</p>
                      <p className="text-xs text-muted-foreground">
                        Day of month your financial period resets
                      </p>
                    </div>
                    <Select
                      value={String(detail.financialResetDay)}
                      onValueChange={(v) =>
                        setDetail({ ...detail, financialResetDay: Number(v) })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(
                          (n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <button
                    onClick={() => setBalanceOpen(true)}
                    className="w-full text-left flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Starting balance</p>
                      {detail.openingBalanceSetAt ? (
                        <p className="text-xs text-muted-foreground">
                          Set {longDate(detail.openingBalanceSetAt)} · not
                          counted as income
                        </p>
                      ) : (
                        <p className="text-xs font-medium text-amber">
                          Not set — your cash may not match your bank
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                      <span
                        className={cn(
                          "tabular text-sm font-semibold",
                          detail.openingBalanceSetAt ? "" : "text-amber",
                        )}
                      >
                        {detail.openingBalanceSetAt
                          ? formatCurrency(detail.openingBalance)
                          : "Not set"}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                </CardContent>
              </Card>

              {/* Notifications */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Notifications
              </p>
              <Card>
                <CardContent className="p-0 divide-y divide-border">
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Email digest</p>
                      <p className="text-xs text-muted-foreground">
                        {isElite
                          ? `Sent ${DIGEST_LEAD_DAYS} days before your cycle closes on the ${ordinal(
                              detail.financialResetDay,
                            )}`
                          : "Spending, portfolio and goal pace, on Elite"}
                      </p>
                    </div>
                    {isElite ? (
                      <Switch
                        checked={detail.emailNotification}
                        onCheckedChange={(v) =>
                          setDetail({ ...detail, emailNotification: v })
                        }
                      />
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-7 shrink-0 gap-1.5 px-2.5 text-xs text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500"
                      >
                        <Link href="/upgrade">
                          <Zap width={11} />
                          Upgrade
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </>
          )}
        </div>
      </SheetContent>

      <OpeningBalanceSheet
        open={balanceOpen}
        onOpenChange={(next) => {
          setBalanceOpen(next);
          // The row shows a figure the sheet may have just rewritten.
          if (!next && open) setReloads((n) => n + 1);
        }}
      />
    </Sheet>
  );
}
