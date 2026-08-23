"use client";

import { Input } from "./ui/input";
import { Card, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "./ui/spinner";
import { NumericFormat } from "react-number-format";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GroupMode } from "@/lib/generated/prisma/browser";
import { useState } from "react";

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  budgetAmount: z.string().optional(),
});

const groupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Group name is required")
      .max(40, "Keep it short — 40 characters max"),
    mode: z.enum([GroupMode.POOLED, GroupMode.PER_MEMBER]),
    totalBudget: z.string().optional(),
    members: z.array(memberSchema).min(1, "Add at least one person"),
  })
  .superRefine((data, ctx) => {
    if (data.mode === GroupMode.POOLED) {
      const val = parseFloat(data.totalBudget ?? "");
      if (!data.totalBudget || isNaN(val) || val <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["totalBudget"],
          message: "Total budget is required",
        });
      }
    } else {
      data.members.forEach((m, i) => {
        const val = parseFloat(m.budgetAmount ?? "");
        if (!m.budgetAmount || isNaN(val) || val <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["members", i, "budgetAmount"],
            message: "Budget is required",
          });
        }
      });
    }
  });

type GroupForm = z.infer<typeof groupSchema>;

export const AddGroup = ({ onSuccess }: { onSuccess: () => void }) => {
  const router = useRouter();
  const [applyAllValue, setApplyAllValue] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      mode: GroupMode.POOLED,
      totalBudget: "",
      members: [{ name: "You", budgetAmount: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "members" });

  const mode = watch("mode");
  const totalBudget = watch("totalBudget");
  const members = watch("members");

  const membersTotal = members.reduce(
    (sum, m) => sum + (parseFloat(m.budgetAmount ?? "") || 0),
    0,
  );

  const handleModeChange = (newMode: GroupMode) => {
    setValue("mode", newMode);
  };

  const applyToAll = () => {
    const val = parseFloat(applyAllValue);
    if (isNaN(val) || val <= 0) return;
    fields.forEach((_, i) =>
      setValue(`members.${i}.budgetAmount`, String(val), {
        shouldValidate: true,
      }),
    );
  };

  const onSubmit = async (data: GroupForm) => {
    try {
      const res = await fetch("/api/user/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          mode: data.mode,
          totalBudget:
            data.mode === GroupMode.POOLED
              ? parseFloat(data.totalBudget ?? "0")
              : undefined,
          members: data.members.map((m, i) => ({
            name: m.name,
            isOwner: i === 0,
            budgetAmount:
              data.mode === GroupMode.PER_MEMBER
                ? parseFloat(m.budgetAmount ?? "0")
                : undefined,
          })),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong");

      toast.success("Group created!", { position: "top-center" });
      reset();
      onSuccess();
      router.refresh();
      router.push(`/groups/${result.id}`);
    } catch (error) {
      toast.error((error as Error).message || "Failed to create group", {
        position: "top-center",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-full max-w-md mx-auto"
    >
      {/* NAME */}
      <div className="flex flex-col gap-2">
        <span>Group name</span>
        <Input
          type="text"
          placeholder="e.g. Bali road trip"
          maxLength={40}
          {...register("name")}
        />
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name.message}</span>
        )}
      </div>

      {/* MODE */}
      <div className="flex flex-col gap-2">
        <span>How should this budget work</span>
        <div className="grid grid-cols-2 gap-2">
          <Card
            onClick={() => handleModeChange(GroupMode.POOLED)}
            className={cn(
              "h-14 p-2 flex justify-center items-center cursor-pointer text-center",
              mode === GroupMode.POOLED && "border-amber border-2",
            )}
          >
            <CardHeader className="justify-center font-semibold p-0">
              Shared pool
            </CardHeader>
          </Card>
          <Card
            onClick={() => handleModeChange(GroupMode.PER_MEMBER)}
            className={cn(
              "h-14 p-2 flex justify-center items-center cursor-pointer text-center",
              mode === GroupMode.PER_MEMBER && "border-amber border-2",
            )}
          >
            <CardHeader className="justify-center font-semibold p-0">
              Per person
            </CardHeader>
          </Card>
        </div>
        <p className="text-xs text-muted-foreground">
          {mode === GroupMode.POOLED
            ? "Everyone shares one budget. Any expense deducts from the same total."
            : "Each person gets their own budget. Expenses deduct from whoever it's charged to."}
        </p>
      </div>

      {/* TOTAL BUDGET — pooled only */}
      {mode === GroupMode.POOLED && (
        <div className="flex flex-col gap-2">
          <span>Total budget</span>
          <NumericFormat
            customInput={Input}
            thousandSeparator="."
            decimalSeparator=","
            prefix="Rp "
            placeholder="Rp 0"
            value={totalBudget ?? ""}
            onValueChange={(values) =>
              setValue("totalBudget", values.value, { shouldValidate: true })
            }
          />
          {errors.totalBudget && (
            <span className="text-red-500 text-sm">
              {errors.totalBudget.message}
            </span>
          )}
        </div>
      )}

      {/* MEMBERS */}
      <div className="flex flex-col gap-2">
        <span>Who&apos;s in this group</span>
        <div className="flex flex-col gap-2">
          {fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={i === 0 ? "You" : "e.g. Ardi"}
                {...register(`members.${i}.name`)}
                className="flex-1"
              />
              {mode === GroupMode.PER_MEMBER && (
                <NumericFormat
                  customInput={Input}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp "
                  placeholder="Rp 0"
                  className="w-36"
                  value={members[i]?.budgetAmount ?? ""}
                  onValueChange={(values) =>
                    setValue(`members.${i}.budgetAmount`, values.value, {
                      shouldValidate: true,
                    })
                  }
                />
              )}
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Remove person"
                  className="p-1.5 text-muted-foreground hover:text-clay transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.members?.root && (
          <span className="text-red-500 text-sm">
            {errors.members.root.message}
          </span>
        )}
        <button
          type="button"
          onClick={() => append({ name: "", budgetAmount: "" })}
          className="flex items-center gap-1 text-sm font-medium text-amber w-fit active:scale-95 transition-transform"
        >
          <Plus className="w-3.5 h-3.5" />
          Add person
        </button>
      </div>

      {/* APPLY TO ALL — per-member only */}
      {mode === GroupMode.PER_MEMBER && fields.length > 1 && (
        <div className="flex items-center gap-2 bg-surface-2 rounded-xl p-2">
          <span className="text-xs text-muted-foreground shrink-0 pl-1">
            Set all to
          </span>
          <NumericFormat
            customInput={Input}
            thousandSeparator="."
            decimalSeparator=","
            prefix="Rp "
            placeholder="Rp 0"
            className="flex-1 h-8 bg-card"
            value={applyAllValue}
            onValueChange={(values) => setApplyAllValue(values.value)}
          />
          <button
            type="button"
            onClick={applyToAll}
            className="text-xs font-semibold text-amber whitespace-nowrap pr-1 active:scale-95 transition-transform"
          >
            Apply to all
          </button>
        </div>
      )}

      {/* TOTAL SUMMARY — per-member only */}
      {mode === GroupMode.PER_MEMBER && (
        <div className="flex justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Total budget</span>
          <span className="tabular font-semibold text-sm">
            Rp {membersTotal.toLocaleString("id-ID")}
          </span>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Spinner /> : "Create group"}
      </Button>
    </form>
  );
};
