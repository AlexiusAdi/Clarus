"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Download, FileSpreadsheet } from "lucide-react";
import { PlanType } from "@/lib/generated/prisma/browser";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: PlanType;
};

type Range = "month" | "year" | "12m" | "all";

const RANGES: { value: Range; label: string }[] = [
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "12m", label: "Last 12 months" },
  { value: "all", label: "All time" },
];

export default function ExportCard({ open, onOpenChange, planType }: Props) {
  const [range, setRange] = useState<Range>("month");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/export?range=${range}`);

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        toast.error(json?.message ?? "Export failed");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("content-disposition")?.match(/filename="(.+)"/)?.[1] ??
        "clarus-transactions.csv";
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Export downloaded");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (planType !== "ELITE") return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85dvh]">
        <SheetHeader>
          <SheetTitle>Export transactions</SheetTitle>
        </SheetHeader>

        <div className="w-full h-[min(43.75rem,60dvh)] mx-auto px-4 flex flex-col gap-4 overflow-y-auto drawer-safe">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Range
          </p>
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {RANGES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRange(r.value)}
                    className="flex items-center justify-between px-4 py-3 text-left border-b border-border last:border-b-0"
                  >
                    <span className="text-sm font-medium">{r.label}</span>
                    <span
                      className={`w-4 h-4 rounded-full border ${
                        range === r.value
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            File
          </p>
          <div className="border border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-center">
              A .csv of your income and expenses
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Same columns Import expects, so you can edit it in Excel and bring
              it back. Savings and investment entries are left out — Clarus
              creates those itself, and re-importing them would double-count.
            </p>
          </div>

          <Button onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            {exporting ? "Preparing..." : "Download CSV"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
