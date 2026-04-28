"use client";

import { useEffect, useMemo } from "react";
import { Card, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Category, TransactionType } from "@/lib/generated/prisma/browser";
import { constructNow, format } from "date-fns";
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

const transactionSchema = z.object({
  type: z.enum([
    TransactionType.EXPENSE,
    TransactionType.INCOME,
    TransactionType.SAVINGS,
    TransactionType.INVESTMENTS,
    TransactionType.ASSETS,
  ]),
  categoryId: z.string().optional(),
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
  description: z.string().optional(),
  goalId: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export const AddTransaction = ({
  categories,
  goals,
  onSuccess,
  initialValues,
}: {
  categories: Category[];
  goals: GoalDTO[];
  onSuccess: () => void;
  initialValues?: TransactionInitialValues;
}) => {
  const router = useRouter();

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
        }
      : { type: TransactionType.EXPENSE },
  });
  const { refetchActive } = useTabsContext();

  const isEditing = !!initialValues;
  const type = watch("type");
  const selectedCategory = watch("categoryId");

  const date = watch("date");
  const amount = watch("amount");

  const handleTypeChange = (newType: TransactionType) => {
    reset({
      type: newType,
      categoryId: "",
      amount: "",
      date: undefined,
      description: "",
    });
  };

  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.type === type),
    [categories, type],
  );

  const onSubmit = async (data: TransactionForm) => {
    try {
      const res = await fetch(
        isEditing
          ? `/api/user/transaction/${initialValues.id}`
          : "/api/user/transaction",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            date: format(data.date, "yyyy-MM-dd"),
          }),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      if (data.type === TransactionType.SAVINGS) {
        toast.success(
          isEditing
            ? "Savings updated successfully!"
            : "Savings added successfully!",
          {
            position: "top-center",
          },
        );
      } else {
        toast.success(
          isEditing
            ? "Transaction updated successfully!"
            : "Transaction added successfully!",
          {
            position: "top-center",
          },
        );
      }

      reset();
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
      });
    }
  }, [reset, initialValues]);

  useEffect(() => {
    console.log("MOUNT AddTransaction", Math.random());
  }, []);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className=" flex flex-col gap-4 w-full max-w-md mx-auto"
    >
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
                type === TransactionType.SAVINGS && "border-blue-500",
              )}
            >
              <CardHeader className="justify-center font-semibold">
                Savings
              </CardHeader>
            </Card>
          )}
        </div>
      )}

      {/* {type === TransactionType.SAVINGS && goals.length > 0 ? (
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
                    "h-10 flex items-center justify-center cursor-pointer",
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

          <div className="flex flex-col gap-2">
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
                  disabled={{ after: new Date() }}
                />
              </PopoverContent>
            </Popover>

            {errors.date && (
              <span className="text-red-500 text-sm">
                {errors.date.message}
              </span>
            )}
          </div>
        </>
      )} */}

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
                "h-10 flex items-center justify-center cursor-pointer",
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

      <div className="flex flex-col gap-2">
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
              disabled={{ after: new Date() }}
            />
          </PopoverContent>
        </Popover>

        {errors.date && (
          <span className="text-red-500 text-sm">{errors.date.message}</span>
        )}
      </div>

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
          onValueChange={(val) => {
            setValue("amount", val.value, { shouldValidate: true });
          }}
        />
        {errors.amount && (
          <span className="text-red-500 text-sm">{errors.amount.message}</span>
        )}
      </div>
      {type !== TransactionType.SAVINGS && (
        <>
          {/* DESCRIPTION */}
          <div className="flex flex-col gap-2">
            <span>Description (Optional)</span>
            <Input
              type="text"
              placeholder="Enter description"
              {...register("description")}
            />
          </div>
        </>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Spinner />
        ) : isEditing ? (
          "Update Transaction"
        ) : (
          "Add Transaction"
        )}
      </Button>
    </form>
  );
};
