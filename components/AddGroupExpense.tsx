"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { GroupMode, TransactionType } from "@/lib/generated/prisma/browser";

type Member = { id: string; name: string; isOwner: boolean };

const AVATAR_STYLES = [
  "bg-amber-soft text-amber",
  "bg-sage-soft text-sage",
  "bg-clay-soft text-clay",
  "bg-surface-2 text-ink-soft",
];

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

type Entry = {
  transactionId: string;
  memberId: string;
  memberName: string;
  amount: number;
};

export const AddGroupExpense = ({
  groupId,
  mode,
  members,
  onDone,
}: {
  groupId: string;
  mode: GroupMode;
  members: Member[];
  onDone: () => void;
}) => {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState(
    members[0]?.id ?? "",
  );
  const [nextAmount, setNextAmount] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // POOLED expenses don't split per person, so a single ordinary submit
  // covers it — the running-split flow below only applies to PER_MEMBER.
  const [pooledAmount, setPooledAmount] = useState("");
  const [pooledSubmitting, setPooledSubmitting] = useState(false);

  const assigned = entries.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalAmount ? parseFloat(totalAmount) - assigned : null;

  const postExpense = async (amount: number, memberId?: string) => {
    const res = await fetch("/api/user/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        description: note || "Group expense",
        type: TransactionType.EXPENSE,
        date: new Date().toISOString().slice(0, 10),
        groupId,
        ...(memberId && { groupMemberId: memberId }),
      }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Something went wrong");
    return result;
  };

  const handleAddEntry = async () => {
    setError(null);
    const amount = parseFloat(nextAmount);

    if (!selectedMemberId) {
      setError("Pick who this is for");
      return;
    }
    if (!amount || amount <= 0) {
      setError("Enter an amount first");
      return;
    }

    setAdding(true);
    try {
      const tx = await postExpense(amount, selectedMemberId);
      const member = members.find((m) => m.id === selectedMemberId)!;
      setEntries((prev) => [
        ...prev,
        {
          transactionId: tx.id,
          memberId: member.id,
          memberName: member.name,
          amount,
        },
      ]);
      setNextAmount("");
    } catch (e) {
      toast.error((e as Error).message || "Failed to add expense");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveEntry = async (entry: Entry) => {
    setEntries((prev) =>
      prev.filter((e) => e.transactionId !== entry.transactionId),
    );
    try {
      const res = await fetch(`/api/user/transaction/${entry.transactionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove");
    } catch {
      toast.error("Failed to remove that entry");
      setEntries((prev) => [...prev, entry]);
    }
  };

  const finishSession = () => {
    if (entries.length > 0) {
      toast.success(`Logged ${entries.length} expense${entries.length > 1 ? "s" : ""}`, {
        position: "top-center",
      });
      router.refresh();
    }
    onDone();
  };

  const handlePooledSubmit = async () => {
    const amount = parseFloat(pooledAmount);
    if (!amount || amount <= 0) {
      setError("Enter an amount first");
      return;
    }
    setPooledSubmitting(true);
    try {
      await postExpense(
        amount,
        selectedMemberId || undefined,
      );
      toast.success("Expense added!", { position: "top-center" });
      router.refresh();
      onDone();
    } catch (e) {
      toast.error((e as Error).message || "Failed to add expense");
    } finally {
      setPooledSubmitting(false);
    }
  };

  if (mode === GroupMode.POOLED) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
        <div className="flex flex-col gap-2">
          <span>What&apos;s this for</span>
          <Input
            type="text"
            placeholder="e.g. Dinner"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span>Amount</span>
          <NumericFormat
            customInput={Input}
            thousandSeparator="."
            decimalSeparator=","
            prefix="Rp "
            placeholder="Rp 0"
            value={pooledAmount}
            onValueChange={(v) => setPooledAmount(v.value)}
          />
        </div>
        {members.length > 0 && (
          <div className="flex flex-col gap-2">
            <span>
              Paid for{" "}
              <span className="text-muted-foreground text-sm">(optional)</span>
            </span>
            <div className="flex gap-2 flex-wrap">
              {members.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    setSelectedMemberId((prev) => (prev === m.id ? "" : m.id))
                  }
                  className={cn(
                    "flex items-center gap-1.5 rounded-full pl-1 pr-3 py-1 border text-xs font-medium transition-colors",
                    selectedMemberId === m.id
                      ? "border-amber border-2"
                      : "border-border text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold",
                      AVATAR_STYLES[i % AVATAR_STYLES.length],
                    )}
                  >
                    {initials(m.name)}
                  </span>
                  {m.isOwner ? "You" : m.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {error && <span className="text-red-500 text-sm">{error}</span>}
        <Button onClick={handlePooledSubmit} disabled={pooledSubmitting}>
          Save expense
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-border bg-card p-3.5">
        <div className="flex flex-col gap-1.5 mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.05em]">
            What&apos;s this for
          </span>
          <Input
            type="text"
            placeholder="e.g. Dinner"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.05em]">
            Total amount
          </span>
          <NumericFormat
            customInput={Input}
            thousandSeparator="."
            decimalSeparator=","
            prefix="Rp "
            placeholder="Rp 0 (optional)"
            value={totalAmount}
            onValueChange={(v) => setTotalAmount(v.value)}
          />
        </div>
      </div>

      {remaining !== null && (
        <div className="flex justify-between items-center rounded-2xl bg-ink px-4 py-3">
          <span className="text-xs text-background/60">
            Remaining to assign
          </span>
          <span
            className={cn(
              "tabular font-semibold",
              remaining < 0 ? "text-clay" : "text-background",
            )}
          >
            {formatCurrency(remaining)}
          </span>
        </div>
      )}

      {entries.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {entries.map((entry) => (
            <div
              key={entry.transactionId}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl"
            >
              <span className="flex-1 text-sm font-medium">
                {entry.memberName}
              </span>
              <span className="tabular text-sm text-muted-foreground">
                {formatCurrency(entry.amount)}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveEntry(entry)}
                aria-label={`Remove ${entry.memberName}'s share`}
                className="text-muted-foreground hover:text-clay transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-border pt-3 flex flex-col gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.05em]">
          Next person
        </span>
        <div className="flex gap-2 flex-wrap">
          {members.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMemberId(m.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full pl-1 pr-3 py-1 border text-xs font-medium transition-colors",
                selectedMemberId === m.id
                  ? "border-amber border-2"
                  : "border-border text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold",
                  AVATAR_STYLES[i % AVATAR_STYLES.length],
                )}
              >
                {initials(m.name)}
              </span>
              {m.isOwner ? "You" : m.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <NumericFormat
            customInput={Input}
            thousandSeparator="."
            decimalSeparator=","
            prefix="Rp "
            placeholder="Rp 0"
            className="flex-1"
            value={nextAmount}
            onValueChange={(v) => setNextAmount(v.value)}
          />
          <Button
            type="button"
            onClick={handleAddEntry}
            disabled={adding}
            className="shrink-0"
          >
            Add
          </Button>
        </div>
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>

      <Button type="button" variant="outline" onClick={finishSession}>
        Done for now
      </Button>
    </div>
  );
};
