"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "./ui/spinner";
import { GroupMode } from "@/lib/generated/prisma/browser";

export const AddGroupMember = ({
  groupId,
  mode,
  onSuccess,
}: {
  groupId: string;
  mode: GroupMode;
  onSuccess: () => void;
}) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (mode === GroupMode.PER_MEMBER && (!budgetAmount || parseFloat(budgetAmount) <= 0)) {
      setError("Budget is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/user/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ...(mode === GroupMode.PER_MEMBER && {
            budgetAmount: parseFloat(budgetAmount),
          }),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong");

      toast.success("Person added!", { position: "top-center" });
      router.refresh();
      onSuccess();
    } catch (err) {
      toast.error((err as Error).message || "Failed to add person");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full max-w-md mx-auto">
      <div className="flex flex-col gap-2">
        <span>Name</span>
        <Input
          type="text"
          placeholder="e.g. Budi"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      {mode === GroupMode.PER_MEMBER && (
        <div className="flex flex-col gap-2">
          <span>Budget</span>
          <NumericFormat
            customInput={Input}
            thousandSeparator="."
            decimalSeparator=","
            prefix="Rp "
            placeholder="Rp 0"
            value={budgetAmount}
            onValueChange={(v) => setBudgetAmount(v.value)}
          />
        </div>
      )}
      {error && <span className="text-red-500 text-sm">{error}</span>}
      <Button type="submit" disabled={submitting}>
        {submitting ? <Spinner /> : "Add person"}
      </Button>
    </form>
  );
};
