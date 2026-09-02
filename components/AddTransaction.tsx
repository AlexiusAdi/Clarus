"use client";

import { useEffect, useMemo } from "react";
import { Card, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDownIcon, RepeatIcon } from "lucide-react";
import {
  Category,
  Frequency,
  TransactionType,
} from "@/lib/generated/prisma/browser";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "./ui/spinner";
import { NumericFormat } from "react-number-format";
import { GoalDTO } from "@/lib/data/goals";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { TransactionInitialValues } from "@/app/Types";
import { useTabsContext } from "./TabsProvider";
import { FREQUENCY_OPTIONS } from "@/constants";

// A transaction loaded for editing carries a UTC-midnight instant (how it's
// stored), while `todayStart`/a freshly-picked date are local-midnight —
// comparing those as raw timestamps makes "today" read as "in the future"
// for anyone east of UTC (WIB is UTC+7: local midnight is still the
// previous UTC day). Comparing local calendar Y/M/D instead sidesteps the
// mismatch entirely.
const dayNumber = (d: Date) => d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
const isFutureDay = (d: Date) => dayNumber(d) > dayNumber(new Date());
const isPastDay = (d: Date) => dayNumber(d) < dayNumber(new Date());

const transactionSchema = z
  .object({
    type: z.enum([
      TransactionType.EXPENSE,
      TransactionType.INCOME,
      TransactionType.SAVINGS,
      TransactionType.INVESTMENTS,
      TransactionType.ASSETS,
    ]),
    categoryId: z.string("Please select a category"),
    date: z.date("Date is required"),
    amount: z
      .string("Amount is required")
      .refine((val) => !isNaN(parseFloat(val)), {
        message: "Amount is required",
      })
      .refine((val) => parseFloat(val) > 0, {
        message: "Amount must be greater than 0",
      })
      .refine((val) => val.replace(/\D/g, "").length <= 12, {
        message: "Amount must be at most 12 digits",
      }),
    description: z
      .string()
      .max(150, "Keep it under 150 characters")
      .optional(),
    goalId: z.string().optional(),

    // recurring fields — only validated when isRecurring is true
    isRecurring: z.boolean(),
    frequency: z.nativeEnum(Frequency).optional(),
    interval: z.number().min(1).max(365).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.frequency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a frequency",
        path: ["frequency"],
      });
    }
    if (data.isRecurring && data.frequency === Frequency.CUSTOM) {
      if (!data.interval || data.interval < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid interval",
          path: ["interval"],
        });
      }
    }

    if (data.date) {
      // A backdated recurring start sits "overdue" until the next cron run
      // catches it up, which reads as broken — see AddTransaction history.
      if (data.isRecurring && isPastDay(data.date)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Recurring transactions must start today or later",
          path: ["date"],
        });
      } else if (!data.isRecurring && isFutureDay(data.date)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Transaction can't be dated in the future, unless it's a recurring transaction",
          path: ["date"],
        });
      }
    }
  });

type TransactionForm = z.infer<typeof transactionSchema>;

export const AddTransaction = ({
  categories,
  goals,
  onSuccess,
  initialValues,
  onScheduled,
}: {
  categories: Category[];
  goals: GoalDTO[];
  onSuccess: () => void;
  initialValues?: TransactionInitialValues;
  onScheduled?: () => void;
}) => {
  const router = useRouter();
  const { refetchActive } = useTabsContext();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialValues
      ? {
          type: initialValues.type,
          categoryId: initialValues.categoryId ?? "",
          goalId: initialValues.goalId ?? "",
          date: new Date(initialValues.date),
          amount: String(initialValues.amount),
          description: initialValues.description ?? "",
          isRecurring: false,
        }
      : {
          type: TransactionType.EXPENSE,
          isRecurring: false,
        },
  });

  const isEditing = !!initialValues;
  const type = watch("type");
  const selectedCategory = watch("categoryId");
  const date = watch("date");
  const amount = watch("amount");
  const isRecurring = watch("isRecurring");
  const frequency = watch("frequency");
  const interval = watch("interval");

  const handleTypeChange = (newType: TransactionType) => {
    reset({
      type: newType,
      categoryId: "",
      amount: "",
      date: undefined,
      description: "",
      isRecurring: false,
    });
  };

  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.type === type),
    [categories, type],
  );

  const onInvalidSubmit = (formErrors: typeof errors) => {
    // Date has no inline error text below the field anymore — surface a
    // submit attempt against an invalid date as a toast instead.
    if (formErrors.date) {
      toast.error(formErrors.date.message ?? "Please pick a valid date", {
        position: "top-center",
      });
    }
  };

  const onSubmit = async (data: TransactionForm) => {
    try {
      // Route to scheduled or regular transaction endpoint
      const url = data.isRecurring
        ? "/api/user/scheduled-transaction"
        : isEditing
          ? `/api/user/transaction/${initialValues.id}`
          : "/api/user/transaction";

      const method = data.isRecurring ? "POST" : isEditing ? "PATCH" : "POST";

      const body = data.isRecurring
        ? {
            amount: data.amount,
            type: data.type,
            categoryId: data.categoryId,
            description: data.description,
            frequency: data.frequency,
            // CUSTOM uses the interval field, others default to 1
            interval: data.frequency === Frequency.CUSTOM ? data.interval : 1,
            startDate: format(data.date, "yyyy-MM-dd"),
          }
        : {
            ...data,
            date: format(data.date, "yyyy-MM-dd"),
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong");

      const label = data.isRecurring
        ? "Recurring transaction scheduled!"
        : data.type === TransactionType.SAVINGS
          ? isEditing
            ? "Savings updated successfully!"
            : "Savings added successfully!"
          : isEditing
            ? "Transaction updated successfully!"
            : "Transaction added successfully!";

      toast.success(label, { position: "top-center" });
      reset();

      if (data.isRecurring) {
        onScheduled?.(); // notify parent a scheduled tx was created
      }
      onSuccess();
      router.refresh();
      refetchActive();
    } catch (error) {
      toast.error((error as Error).message || "Failed to add transaction", {
        position: "top-center",
      });
    }
  };

  useEffect(() => {
    if (initialValues) {
      reset({
        type: initialValues.type,
        categoryId: initialValues.categoryId ?? undefined,
        goalId: initialValues.goalId ?? undefined,
        date: new Date(initialValues.date),
        amount: String(initialValues.amount),
        description: initialValues.description ?? "",
        isRecurring: false,
      });
    }
  }, [reset, initialValues]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
      className="flex flex-col gap-4 w-full max-w-md mx-auto"
    >
      {/* TYPE SELECTOR */}
      {isEditing ? (
        <div className="flex justify-center">
          <span
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold",
              type === TransactionType.EXPENSE && "border-red-500 border-2",
              type === TransactionType.INCOME && "border-green-500 border-2",
              type === TransactionType.SAVINGS && "border-blue-500 border-2",
              type === TransactionType.INVESTMENTS &&
                "bg-purple-100 text-purple-700",
              type === TransactionType.ASSETS &&
                "bg-yellow-100 text-yellow-700",
            )}
          >
            {type}
          </span>
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-2 gap-2 items-center justify-center",
            goals.length > 0 && "xl:grid-cols-3",
          )}
        >
          <Card
            onClick={() => handleTypeChange(TransactionType.EXPENSE)}
            className={cn(
              "h-12 p-2 flex justify-center items-center cursor-pointer",
              type === TransactionType.EXPENSE && "border-red-500 border-2",
            )}
          >
            <CardHeader className="justify-center font-semibold">
              Expense
            </CardHeader>
          </Card>

          <Card
            onClick={() => handleTypeChange(TransactionType.INCOME)}
            className={cn(
              "h-12 p-2 flex justify-center items-center cursor-pointer",
              type === TransactionType.INCOME && "border-green-500 border-2",
            )}
          >
            <CardHeader className="justify-center font-semibold">
              Income
            </CardHeader>
          </Card>

          {goals.length > 0 && (
            <Card
              onClick={() => handleTypeChange(TransactionType.SAVINGS)}
              className={cn(
                "w-40 h-12 p-2 flex justify-center items-center cursor-pointer",
                type === TransactionType.SAVINGS && "border-blue-500 border-2",
              )}
            >
              <CardHeader className="justify-center font-semibold">
                Savings
              </CardHeader>
            </Card>
          )}
        </div>
      )}

      {/* SAVINGS GOAL SELECTOR */}
      {type === TransactionType.SAVINGS && goals.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span>Select Goal</span>
          {isEditing ? (
            <div className="px-3 py-2 rounded-md border bg-muted text-sm">
              {goals.find((g) => g.id === watch("goalId"))?.name ?? "Savings"}
            </div>
          ) : (
            <Select
              onValueChange={(val) =>
                setValue("goalId", val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <span>Date</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                data-empty={!date}
                className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
              >
                {date ? format(date, "PPP") : <span>Pick a date</span>}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) setValue("date", d, { shouldValidate: true });
                }}
                onDayClick={(_day, modifiers) => {
                  if (modifiers.disabled) {
                    toast.error("Transactions can't be dated in the future", {
                      position: "top-center",
                    });
                  }
                }}
                disabled={{ after: new Date() }}
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <span className="text-red-500 text-sm">{errors.date.message}</span>
          )}
        </div>
      ) : (
        <>
          {/* CATEGORY */}
          <div className="flex flex-col gap-2">
            <span>Category</span>
            <div className="grid grid-cols-3 gap-2">
              {filteredCategories.map((cat) => (
                <Card
                  key={cat.id}
                  onClick={() =>
                    setValue("categoryId", cat.id, { shouldValidate: true })
                  }
                  className={cn(
                    "h-10 flex items-center justify-center cursor-pointer active:scale-95 transition-transform",
                    selectedCategory === cat.id
                      ? type === "INCOME"
                        ? "border-green-500 border-2"
                        : "border-red-500 border-2"
                      : "opacity-60",
                  )}
                >
                  <span className="text-sm font-semibold px-2">{cat.name}</span>
                </Card>
              ))}
            </div>
            {errors.categoryId && (
              <span className="text-red-500 text-sm">
                {errors.categoryId.message}
              </span>
            )}
          </div>

          {/* DATE */}
          <div className="flex flex-col gap-2">
            <span>{isRecurring ? "Start Date" : "Date"}</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  data-empty={!date}
                  className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                >
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (!d) return;
                    setValue("date", d, { shouldValidate: true });
                    // Any date is pickable here (recurring sits far below
                    // this field in the form, so blocking days upfront meant
                    // switching Recurring on after already picking a date
                    // never re-enabled the one you wanted). Flag it
                    // immediately instead — same rule the schema enforces.
                    if (isRecurring && isPastDay(d)) {
                      toast.error(
                        "Recurring transactions must start today or later",
                        { position: "top-center" },
                      );
                    } else if (!isRecurring && isFutureDay(d)) {
                      toast.error(
                        "Transaction can't be dated in the future, unless it's a recurring transaction",
                        { position: "top-center" },
                      );
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </>
      )}

      {/* AMOUNT */}
      <div className="flex flex-col gap-2">
        <span>Amount</span>
        <NumericFormat
          customInput={Input}
          thousandSeparator="."
          decimalSeparator=","
          prefix="Rp "
          placeholder="Enter value"
          value={amount ?? ""}
          inputMode="decimal"
          onValueChange={(val) =>
            setValue("amount", val.value, { shouldValidate: true })
          }
          onFocus={(e) =>
            e.target.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        />
        {errors.amount && (
          <span className="text-red-500 text-sm">{errors.amount.message}</span>
        )}
      </div>

      {/* DESCRIPTION — hidden for savings */}
      {type !== TransactionType.SAVINGS && (
        <div className="flex flex-col gap-2">
          <span>Description (Optional)</span>
          <Input
            type="text"
            placeholder="Enter description"
            maxLength={150}
            {...register("description")}
          />
        </div>
      )}

      {/* RECURRING TOGGLE — hidden when editing */}
      {!isEditing && type !== TransactionType.SAVINGS && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              const turningOn = !isRecurring;
              setValue("isRecurring", turningOn);
              setValue("frequency", undefined);
              setValue("interval", undefined);
              // A date already picked further up the form can be invalid for
              // the state being switched to (e.g. a past date, now that
              // Recurring is on) — flag it here, since Recurring sits well
              // below Date and that could easily go unnoticed off-screen.
              if (date) {
                if (turningOn && isPastDay(date)) {
                  toast.error(
                    "Recurring transactions must start today or later — update the date above",
                    { position: "top-center" },
                  );
                } else if (!turningOn && isFutureDay(date)) {
                  toast.error(
                    "Transaction can't be dated in the future, unless it's a recurring transaction — update the date above",
                    { position: "top-center" },
                  );
                }
              }
            }}
            className={cn(
              "flex items-center gap-2 w-fit text-sm font-medium active:scale-95 transition-transform",
              isRecurring ? "text-primary" : "text-muted-foreground",
            )}
          >
            <RepeatIcon size={15} />
            Recurring
            {/* pill indicator */}
            <span
              className={cn(
                "w-8 h-4 rounded-full transition-colors relative",
                isRecurring ? "bg-primary" : "bg-muted-foreground/30",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
                  isRecurring ? "left-4" : "left-0.5",
                )}
              />
            </span>
          </button>

          {/* FREQUENCY SELECTOR */}
          {isRecurring && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-4 gap-1.5 pb-4">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setValue("frequency", opt.value, {
                        shouldValidate: true,
                      });
                      if (opt.value !== Frequency.CUSTOM)
                        setValue("interval", 1);
                    }}
                    className={cn(
                      "h-9 rounded-md text-sm font-medium border transition-colors active:scale-95 active:opacity-75",
                      frequency === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-muted-foreground border-border hover:border-primary/50",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.frequency && (
                <span className="text-red-500 text-sm">
                  {errors.frequency.message}
                </span>
              )}

              {/* CUSTOM INTERVAL */}
              {frequency === Frequency.CUSTOM && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    Every
                  </span>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    placeholder="e.g. 10"
                    value={interval ?? ""}
                    onChange={(e) =>
                      setValue("interval", parseInt(e.target.value) || 1, {
                        shouldValidate: true,
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                  {errors.interval && (
                    <span className="text-red-500 text-sm">
                      {errors.interval.message}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Spinner />
        ) : isRecurring ? (
          "Schedule Transaction"
        ) : isEditing ? (
          "Update Transaction"
        ) : (
          "Add Transaction"
        )}
      </Button>
    </form>
  );
};
