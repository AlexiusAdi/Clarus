"use client";

import { useState, useEffect } from "react";
import {
  RepeatIcon,
  Pencil,
  Trash2,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { NumericFormat } from "react-number-format";
import { Input } from "@/components/ui/input";
import { ScheduledTransactionDTO } from "@/lib/data/getScheduledTransactions";
import { useScheduledTransactions } from "@/hooks/useScheduledTransactions";

type ScheduledTransaction = ScheduledTransactionDTO;

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  CUSTOM: "Custom",
};

const TYPE_COLORS: Record<string, string> = {
  EXPENSE: "text-red-500",
  INCOME: "text-green-500",
  SAVINGS: "text-blue-500",
  INVESTMENTS: "text-purple-500",
  ASSETS: "text-yellow-500",
};

function frequencyLabel(frequency: string, interval: number) {
  if (frequency === "CUSTOM") return `Every ${interval} days`;
  if (frequency === "WEEKLY" && interval > 1) return `Every ${interval} weeks`;
  if (frequency === "MONTHLY" && interval > 1)
    return `Every ${interval} months`;
  return FREQUENCY_LABELS[frequency];
}

// ── Edit Form ─────────────────────────────────────────────────────────────────
function EditForm({
  item,
  onSuccess,
  onCancel,
}: {
  item: ScheduledTransaction;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(String(item.amount));
  const [description, setDesc] = useState(item.description ?? "");
  const [frequency, setFrequency] = useState(item.frequency);
  const [interval, setInterval] = useState(item.interval);
  const [saving, setSaving] = useState(false);

  const FREQUENCY_OPTIONS = ["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"] as const;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/user/scheduled-transaction/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          description,
          frequency,
          interval: frequency === "CUSTOM" ? interval : 1,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");
      toast.success("Scheduled transaction updated", {
        position: "top-center",
      });
      onSuccess();
    } catch {
      toast.error("Failed to update", { position: "top-center" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-2">
        <span className="text-sm">Amount</span>
        <NumericFormat
          customInput={Input}
          thousandSeparator="."
          decimalSeparator=","
          prefix="Rp "
          value={amount}
          inputMode="decimal"
          onValueChange={(val) => setAmount(val.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm">Description</span>
        <Input
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Optional"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm">Frequency</span>
        <div className="grid grid-cols-4 gap-1.5">
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFrequency(opt)}
              className={cn(
                "h-9 rounded-md text-sm font-medium border transition-colors",
                frequency === opt
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border",
              )}
            >
              {FREQUENCY_LABELS[opt]}
            </button>
          ))}
        </div>
      </div>

      {frequency === "CUSTOM" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Every
          </span>
          <Input
            type="number"
            min={1}
            max={365}
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">days</span>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner /> : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ── Main Drawer ───────────────────────────────────────────────────────────────
export function ScheduledTransactionDrawer({
  open,
  onOpenChange,
  onListChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onListChange?: (items: ScheduledTransaction[]) => void;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { items, loading, fetchScheduled } = useScheduledTransactions(
    [],
    onListChange,
  );

  useEffect(() => {
    if (open) fetchScheduled();
  }, [open]);

  const handleToggle = async (item: ScheduledTransaction) => {
    try {
      const res = await fetch(`/api/user/scheduled-transaction/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(item.isActive ? "Paused" : "Resumed", {
        position: "top-center",
      });
      fetchScheduled();
      router.refresh();
    } catch {
      toast.error("Failed to update", { position: "top-center" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/user/scheduled-transaction/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Deleted", { position: "top-center" });
      fetchScheduled();
      router.refresh();
    } catch {
      toast.error("Failed to delete", { position: "top-center" });
    }
  };

  // repositionInputs={false}: the iOS numeric keypad desyncs vaul's internal
  // keyboardIsOpen flag and throws the drawer off-screen — see FloatingNav.
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      repositionInputs={false}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center justify-center gap-2">
            <RepeatIcon size={16} />
            Scheduled Transactions
          </DrawerTitle>
          <DrawerDescription>
            Manage your recurring transactions
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-auto max-h-[85dvh] w-full p-4 drawer-safe max-w-md mx-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              No scheduled transactions yet
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-xl border p-4 flex flex-col gap-3 transition-opacity",
                    !item.isActive && "opacity-50",
                  )}
                >
                  {editingId === item.id ? (
                    <EditForm
                      item={item}
                      onSuccess={() => {
                        setEditingId(null);
                        fetchScheduled();
                        router.refresh();
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      {/* Top row — category + amount */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {item.category?.name ?? item.type}
                          </span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          )}
                        </div>
                        <span
                          className={cn(
                            "font-semibold",
                            TYPE_COLORS[item.type],
                          )}
                        >
                          <NumericFormat
                            value={item.amount}
                            displayType="text"
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix="Rp "
                          />
                        </span>
                      </div>

                      {/* Frequency badge + next run */}
                      <div className="flex justify-between w-full">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-0.5 rounded-full border text-xs">
                            {frequencyLabel(item.frequency, item.interval)}
                          </span>
                          <span>
                            Next:{" "}
                            {new Date(item.nextRunDate).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>

                          <div>
                            {item.isActive ? (
                              <span className="text-green-500">Active</span>
                            ) : (
                              <span className="text-red-500">Paused</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(item)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {item.isActive ? (
                            <PauseCircle size={18} />
                          ) : (
                            <PlayCircle size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingId(item.id)}
                          className="text-muted-foreground hover:text-blue-500 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
