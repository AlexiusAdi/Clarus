"use client";

import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  Info,
  Download,
  AlertCircle,
  Check,
} from "lucide-react";
import { PlanType } from "@/lib/generated/prisma/browser";
import { IMPORT_LIMITS } from "@/constants/plans";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { ImportTutorial } from "./ImportTutorial";
import OpeningBalanceSheet from "./OpeningBalanceSheet";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: PlanType;
};

type BalanceSnapshot = {
  openingBalance: number;
  openingBalanceSetAt: string | null;
  cashBalance: number;
};

/** Null rather than throwing: a failed read costs the summary a row, not the import. */
async function readBalance(): Promise<BalanceSnapshot | null> {
  try {
    const res = await fetch("/api/user/opening-balance");
    if (!res.ok) return null;
    return (await res.json()) as BalanceSnapshot;
  } catch {
    return null;
  }
}

export default function ImportCard({ open, onOpenChange, planType }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    cashBefore: number | null;
    after: BalanceSnapshot | null;
  } | null>(null);

  const router = useRouter();

  const limit = IMPORT_LIMITS[planType];

  const handleFile = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "csv") {
      toast.error("Only .xlsx or .csv files are supported");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const cashBefore = (await readBalance())?.cashBalance ?? null;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message ?? "Import failed", {
          duration: 15000,
        });

        if (json.errors?.length) {
          json.errors.forEach((e: { row: number; errors: string[] }) => {
            toast.error(`Row ${e.row}: ${e.errors.join(", ")}`, {
              duration: 15000,
            });
          });
        }
        return;
      }

      // Held open on the summary instead of closing: importing older months
      // moves cash against a starting balance that may already have covered
      // them, and that is only obvious if the arithmetic is put in front of
      // the user right here.
      const after = await readBalance();
      setResult({ imported: json.imported, cashBefore, after });
      setFile(null);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setFile(null);
      setResult(null);
    }
    onOpenChange(v);
  };

  if (planType === "FREE") return null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85dvh]">
        <SheetHeader>
          <SheetTitle>
            {result ? "Import complete" : "Import transactions"}
          </SheetTitle>
        </SheetHeader>

        <div className="w-full max-w-md mx-auto px-4 flex flex-col gap-4 overflow-y-auto drawer-safe">
          {result ? (
            <ImportSummary
              result={result}
              onReconcile={() => setBalanceOpen(true)}
              onDone={() => handleOpenChange(false)}
            />
          ) : (
            <>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Plan
          </p>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {planType === "PRO" ? "Pro" : "Elite"} plan
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Up to {limit.toLocaleString("id-ID")} rows per import
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {planType}
                </span>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            File
          </p>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
            </div>
            {file ? (
              <>
                <p className="text-sm font-medium text-center">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB — tap to replace
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-center">
                  Drop your .xlsx file here
                </p>
                <p className="text-xs text-muted-foreground">
                  or <span className="text-emerald-500">browse to upload</span>
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>

          <ImportTutorial />

          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!file || importing}
          >
            <Upload className="w-4 h-4 mr-2" />
            {importing ? "Importing..." : "Import transactions"}
          </Button>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Import transactions?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will add all rows from the file to your transactions. If
                  you upload the same file twice, you will get duplicate
                  entries. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleImport}>
                  Yes, import
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
            </>
          )}
        </div>
      </SheetContent>

      <OpeningBalanceSheet open={balanceOpen} onOpenChange={setBalanceOpen} />
    </Sheet>
  );
}

// ─── Post-import summary ──────────────────────────────────────────────────────

function ImportSummary({
  result,
  onReconcile,
  onDone,
}: {
  result: {
    imported: number;
    cashBefore: number | null;
    after: BalanceSnapshot | null;
  };
  onReconcile: () => void;
  onDone: () => void;
}) {
  const { imported, cashBefore, after } = result;

  const delta =
    after && cashBefore !== null ? after.cashBalance - cashBefore : null;
  const anchored = after?.openingBalanceSetAt != null;

  return (
    <>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 shrink-0 rounded-full bg-sage-soft text-sage flex items-center justify-center">
          <Check className="w-4 h-4" />
        </span>
        <p className="text-base font-semibold">
          {imported} transaction{imported === 1 ? "" : "s"} imported
        </p>
      </div>

      {after && (
        <div className="rounded-xl border border-border bg-card px-4">
          <div className="flex items-center justify-between gap-3 py-2.5">
            <p className="text-[13px] text-ink-soft">Starting balance</p>
            <p className="tabular text-sm font-semibold">
              {formatCurrency(after.openingBalance)}
            </p>
          </div>
          {delta !== null && (
            <div className="flex items-center justify-between gap-3 py-2.5 border-t border-border">
              <p className="text-[13px] text-ink-soft">
                What you just imported
              </p>
              <p className="tabular text-sm font-semibold">
                {delta < 0 ? "−" : "+"} {formatCurrency(Math.abs(delta))}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 py-2.5 pb-3 border-t-2 border-foreground">
            <p className="text-[13px] font-semibold">Cash in Certus now</p>
            <p className="tabular text-base font-semibold">
              {formatCurrency(after.cashBalance)}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2.5 p-3 rounded-xl bg-amber-soft">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber" />
        <p className="text-xs leading-[18px] text-ink-soft">
          {!anchored
            ? "Your starting balance isn't set, so cash still counts up from zero. Set it and this history lines up with your bank."
            : delta === 0
              ? "Your cash didn't change: every row you imported is dated before your starting balance, which already covered them."
              : "This history covers days your starting balance already included, so your cash has changed. If it no longer matches your bank, set the starting balance again — Certus calculates the new amount for you."}
        </p>
      </div>

      <Button onClick={onReconcile}>
        {anchored ? "Set starting balance again" : "Set your starting balance"}
      </Button>
      <Button variant="ghost" onClick={onDone}>
        It already matches my bank
      </Button>
    </>
  );
}
