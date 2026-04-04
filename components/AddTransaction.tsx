"use client";

import { useMemo } from "react";
import { Card, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Category, TransactionType } from "@/lib/generated/prisma/browser";
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
}: {
  categories: Category[];
  goals: GoalDTO[];
  onSuccess: () => void;
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
    defaultValues: {
      type: TransactionType.EXPENSE,
    },
  });

  const type = watch("type");
  const selectedCategory = watch("categoryId");
  const date = watch("date");

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
      const res = await fetch("/api/user/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      if (data.type === TransactionType.SAVINGS) {
        toast.success("Savings added successfully!", {
          position: "top-center",
        });
      } else {
        toast.success("Transaction added successfully!", {
          position: "top-center",
        });
      }

      reset();
      onSuccess();
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message || "Failed to add transaction", {
        position: "top-center",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="container flex flex-col gap-4"
    >
      <div className="flex gap-2 justify-center">
        <Card
          onClick={() => handleTypeChange(TransactionType.EXPENSE)}
          className={cn(
            "w-40 h-12 p-2 flex justify-center items-center cursor-pointer",
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
            "w-40 h-12 p-2 flex justify-center items-center cursor-pointer",
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

      {type === TransactionType.SAVINGS && goals.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span>Select Goal</span>
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

            <div className="grid grid-cols-3 gap-2 h-24">
              {filteredCategories.map((cat) => (
                <Card
                  key={cat.id}
                  onClick={() =>
                    setValue("categoryId", cat.id, { shouldValidate: true })
                  }
                  className={cn(
                    "h-10 p-2 justify-center cursor-pointer",
                    selectedCategory === cat.id
                      ? type === "INCOME"
                        ? "border-green-500 border-2"
                        : "border-red-500 border-2"
                      : "opacity-60",
                  )}
                >
                  <CardHeader className="justify-center font-semibold">
                    {cat.name}
                  </CardHeader>
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
          onValueChange={(amount) => {
            setValue("amount", amount.value, { shouldValidate: true });
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
        {isSubmitting ? <Spinner /> : "Add Transaction"}
      </Button>
    </form>
  );
};
