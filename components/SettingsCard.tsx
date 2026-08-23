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
import { Zap } from "lucide-react";
import { PlanType } from "@/lib/generated/prisma/browser";
import { DIGEST_LEAD_DAYS } from "@/lib/helper/financialPeriod";

type UserDetail = {
  pageSize: number;
  financialResetDay: number;
  emailNotification: boolean;
  lastDigestSentAt?: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: PlanType;
};

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const isElite = planType === PlanType.ELITE;

  useEffect(() => {
    if (!open) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/user/detail");
        const json = await res.json();
        setDetail(json);
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open]);

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
      onOpenChange(false);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85dvh]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="w-full max-w-md mx-auto px-4 flex flex-col gap-4 overflow-y-auto drawer-safe">
          {loading || !detail ? (
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
    </Sheet>
  );
}
