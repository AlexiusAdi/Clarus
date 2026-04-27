"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
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

type UserDetail = {
  pageSize: number;
  financialResetDay: number;
  emailNotification: boolean;
  notificationDay: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SettingsCard({ open, onOpenChange }: Props) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

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
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="w-full max-w-md mx-auto pb-24 px-4 flex flex-col gap-4">
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
                        {[5, 10, 15, 20, 25].map((n) => (
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
              {/* <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Notifications
              </p>
              <Card>
                <CardContent className="p-0 divide-y divide-border">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Email summary</p>
                      <p className="text-xs text-muted-foreground">
                        Receive a monthly financial summary
                      </p>
                    </div>
                    <Switch
                      checked={detail.emailNotification}
                      onCheckedChange={(v) =>
                        setDetail({ ...detail, emailNotification: v })
                      }
                    />
                  </div>
                  {detail.emailNotification && (
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">Summary day</p>
                        <p className="text-xs text-muted-foreground">
                          Day of month to receive summary
                        </p>
                      </div>
                      <Select
                        value={String(detail.notificationDay)}
                        onValueChange={(v) =>
                          setDetail({ ...detail, notificationDay: Number(v) })
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
                  )}
                </CardContent>
              </Card> */}

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
