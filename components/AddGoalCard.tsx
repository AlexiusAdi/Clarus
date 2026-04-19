"use client";

import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "./ui/spinner";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { NumericFormat } from "react-number-format";
import { GoalInitialValues } from "@/app/Types";

const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Target amount is required",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    })
    .refine((val) => val.replace(/\D/g, "").length <= 12, {
      message: "Amount must be at most 12 digits",
    }),
  currentAmount: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(parseFloat(val)), {
      message: "Invalid amount",
    }),
  deadline: z.date().optional(),
});

type GoalForm = z.infer<typeof goalSchema>;

export const AddGoal = ({
  onSuccess,
  goalInitialValues,
}: {
  onSuccess: () => void;
  goalInitialValues?: GoalInitialValues;
}) => {
  const router = useRouter();
  const isEditing = !!goalInitialValues;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GoalForm>({
    resolver: zodResolver(goalSchema),
    defaultValues: goalInitialValues
      ? {
          name: goalInitialValues.name,
          targetAmount: String(goalInitialValues.targetAmount),
          currentAmount: String(goalInitialValues.currentAmount),
          deadline: goalInitialValues.deadline
            ? new Date(goalInitialValues.deadline)
            : undefined,
        }
      : undefined,
  });

  const deadline = watch("deadline");
  const targetAmount = watch("targetAmount");
  const currentAmount = watch("currentAmount");

  const onSubmit = async (data: GoalForm) => {
    try {
      const res = await fetch(
        isEditing
          ? `/api/user/goals/${goalInitialValues!.id}`
          : "/api/user/goals",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      toast.success(isEditing ? "Goal updated!" : "Goal added!", {
        position: "top-center",
      });
      reset();
      onSuccess();
      router.refresh();
    } catch (error) {
      toast.error(
        (error as Error).message ||
          "Failed to " + (isEditing ? "update" : "add") + " goal",
        { position: "top-center" },
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="container flex flex-col gap-4"
    >
      {/* GOAL NAME */}
      <div className="flex flex-col gap-2">
        <span>Goal Name</span>
        <Input
          type="text"
          placeholder="e.g. Bali Trip, Emergency Fund"
          {...register("name")}
        />
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name.message}</span>
        )}
      </div>

      {/* TARGET AMOUNT */}
      <div className="flex flex-col gap-2">
        <span>Target Amount</span>
        <NumericFormat
          customInput={Input}
          thousandSeparator="."
          decimalSeparator=","
          prefix="Rp "
          placeholder="Rp 0"
          value={targetAmount ?? ""}
          onValueChange={(values) =>
            setValue("targetAmount", values.value, { shouldValidate: true })
          }
        />
        {errors.targetAmount && (
          <span className="text-red-500 text-sm">
            {errors.targetAmount.message}
          </span>
        )}
      </div>

      {/* ALREADY SAVED */}
      <div className="flex flex-col gap-2">
        <span>
          Already Saved{" "}
          <span className="text-muted-foreground text-sm">(optional)</span>
        </span>
        <NumericFormat
          customInput={Input}
          thousandSeparator="."
          decimalSeparator=","
          prefix="Rp "
          placeholder="Rp 0"
          value={currentAmount ?? ""}
          onValueChange={(values) =>
            setValue("currentAmount", values.value, { shouldValidate: true })
          }
        />
        {errors.currentAmount && (
          <span className="text-red-500 text-sm">
            {errors.currentAmount.message}
          </span>
        )}
      </div>

      {/* TARGET DATE */}
      <div className="flex flex-col gap-2">
        <span>
          Target Date{" "}
          <span className="text-muted-foreground text-sm">(optional)</span>
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              data-empty={!deadline}
              className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
            >
              {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={deadline}
              onSelect={(d) => {
                if (d) setValue("deadline", d, { shouldValidate: true });
              }}
              disabled={{ before: new Date() }}
            />
          </PopoverContent>
        </Popover>
        {errors.deadline && (
          <span className="text-red-500 text-sm">
            {errors.deadline.message}
          </span>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Spinner /> : isEditing ? "Update Goal" : "Add Goal"}
      </Button>
    </form>
  );
};
