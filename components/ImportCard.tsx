"use client";

import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Info, Download } from "lucide-react";
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: PlanType;
};

export default function ImportCard({ open, onOpenChange, planType }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

      toast.success(`${json.imported} transactions imported`);
      onOpenChange(false);
      setFile(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) setFile(null);
    onOpenChange(v);
  };

  if (planType === "FREE") return null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Import transactions</SheetTitle>
        </SheetHeader>

        <div className="w-full max-w-md mx-auto pb-24 px-4 flex flex-col gap-4">
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
