"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { NumericFormat } from "react-number-format";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/helper/formatCurrency";

type Mode = "match" | "set";

type Snapshot = {
  openingBalance: number;
  openingBalanceDate: string | null;
  openingBalanceSetAt: string | null;
  recordedNet: number;
  cashBalance: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MODES: { id: Mode; label: string }[] = [
  { id: "match", label: "Match my bank" },
  { id: "set", label: "Set it directly" },
];

/** "Recorded since 4 August", or just "Recorded in Certus" with no anchor. */
function recordedLabel(anchorDate: string | null) {
  if (!anchorDate) return "Recorded in Certus";

  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Jakarta",
  }).format(new Date(anchorDate));

  return `Recorded since ${formatted}`;
}

function Row({
  label,
  value,
  className,
  labelClassName,
  valueClassName,
}: {
  label: string;
  value: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-2.5",
        className,
      )}
    >
      <p className={cn("text-[13px] text-ink-soft", labelClassName)}>{label}</p>
      <p className={cn("tabular text-sm font-semibold", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

export default function OpeningBalanceSheet({ open, onOpenChange }: Props) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<Mode>("match");
  const [input, setInput] = useState<string>("");

  const router = useRouter();

  // Declared inside the effect, and nothing is set before the first await:
  // `snapshot === null` is the loading state, so there is no second flag to
  // keep in sync and no synchronous setState to cascade a render.
  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        const res = await fetch("/api/user/opening-balance");
        if (!res.ok) throw new Error();
        const json: Snapshot = await res.json();
        setSnapshot(json);
        // Seeded with the figure the user is most likely confirming rather
        // than changing: their current cash under "match".
        setInput(String(json.cashBalance));
        setMode("match");
      } catch {
        toast.error("Couldn't load your starting balance");
      }
    };

    load();
  }, [open]);

  /** Dropped on close so reopening refetches rather than showing a stale sum. */
  const handleOpenChange = (next: boolean) => {
    if (!next) setSnapshot(null);
    onOpenChange(next);
  };

  const amount = input === "" ? null : Number(input);

  // Mirrors the server's arithmetic so the user sees the result before saving;
  // the server recomputes it rather than trusting this.
  const result =
    snapshot === null || amount === null
      ? null
      : mode === "match"
        ? amount - snapshot.recordedNet
        : amount + snapshot.recordedNet;

  const handleSave = async () => {
    if (amount === null) {
      toast.error("Enter an amount first");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/opening-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, amount }),
      });

      if (!res.ok) throw new Error();
      const json: Snapshot = await res.json();

      toast.success(
        `Starting balance saved. Cash is now ${formatCurrency(json.cashBalance)}.`,
      );
      router.refresh();
      handleOpenChange(false);
    } catch {
      toast.error("Couldn't save your starting balance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90dvh]">
        <SheetHeader>
          <SheetTitle>Starting balance</SheetTitle>
        </SheetHeader>

        <div className="w-full max-w-md mx-auto px-4 flex flex-col gap-4 overflow-y-auto drawer-safe">
          {!snapshot ? (
            <>
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-52 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </>
          ) : (
            <>
              <p className="text-[13px] leading-5 text-muted-foreground">
                Certus started counting from zero. Tell it what you already had,
                and the two numbers agree again.
              </p>

              <div className="flex gap-1 p-1 rounded-xl bg-muted">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id);
                      // The two modes ask for different figures, so carrying
                      // the typed value across would silently reinterpret it.
                      setInput(
                        String(
                          m.id === "match"
                            ? snapshot.cashBalance
                            : snapshot.openingBalance,
                        ),
                      );
                    }}
                    className={cn(
                      "flex-1 h-8 rounded-lg text-[13px] font-semibold transition-colors",
                      mode === m.id
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-card px-4">
                <Row
                  label="Starting balance"
                  value={formatCurrency(snapshot.openingBalance)}
                  valueClassName={
                    snapshot.openingBalanceSetAt
                      ? undefined
                      : "text-muted-foreground"
                  }
                />
                <Row
                  label={recordedLabel(snapshot.openingBalanceDate)}
                  value={`${snapshot.recordedNet < 0 ? "−" : "+"} ${formatCurrency(
                    Math.abs(snapshot.recordedNet),
                  )}`}
                  className="border-t border-border"
                />
                <Row
                  label="Cash in Certus today"
                  value={formatCurrency(snapshot.cashBalance)}
                  className="border-t-2 border-foreground"
                  labelClassName="font-semibold text-foreground"
                  valueClassName="text-[15px]"
                />

                <div className="flex items-center justify-between gap-3 py-2.5 border-t border-border">
                  <label
                    htmlFor="opening-balance-input"
                    className="text-[13px] font-semibold text-amber shrink-0"
                  >
                    {mode === "match"
                      ? "Your bank right now"
                      : "New starting balance"}
                  </label>
                  <NumericFormat
                    id="opening-balance-input"
                    customInput={Input}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="Rp "
                    inputMode="decimal"
                    allowNegative={false}
                    decimalScale={0}
                    value={input}
                    onValueChange={(v) => setInput(v.value)}
                    className="tabular h-9 max-w-[160px] text-right font-semibold"
                  />
                </div>

                <Row
                  label={
                    mode === "match"
                      ? "Starting balance becomes"
                      : "Cash in Certus becomes"
                  }
                  value={result === null ? "—" : formatCurrency(result)}
                  className="border-t border-dashed border-border pb-3"
                  labelClassName="font-semibold text-sage"
                  valueClassName="text-base text-sage"
                />
              </div>

              <div className="flex gap-2.5 p-3 rounded-xl bg-amber-soft">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber" />
                <p className="text-xs leading-[18px] text-ink-soft">
                  Did you enter your starting money as income when you signed
                  up? Delete that entry first, or Certus counts it twice.
                </p>
              </div>

              <Button onClick={handleSave} disabled={saving || amount === null}>
                {saving ? "Saving..." : "Save starting balance"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {mode === "match"
                  ? "Certus calculates the starting balance for you"
                  : "Use this when you already know the amount"}
              </p>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
