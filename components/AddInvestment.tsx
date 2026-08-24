"use client";

import { Card, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDownIcon, History } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "./ui/spinner";
import { NumericFormat } from "react-number-format";
import { InvestmentType } from "@/lib/generated/prisma/enums";
import { DEFAULT_INVESTMENT_TYPES } from "@/constants";
import {
  PREDEFINED_CRYPTO_ASSETS,
  PREDEFINED_STOCKS_ASSETS,
} from "@/constants/assets";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { InvestmentInitialValues } from "@/app/Types";
import { useTabsContext } from "./TabsProvider";

const TYPE_ACCENT: Record<InvestmentType, string> = {
  STOCK: "border-blue-500 border-2",
  CRYPTO: "border-orange-500 border-2",
  GOLD: "border-yellow-500 border-2",
  OTHER: "border-gray-500 border-2",
};

// ── Zod schema ───────────────────────────────────────────────────────────────
const investmentSchema = z
  .object({
    type: z.enum(InvestmentType),
    name: z.string().min(1, "Asset name is required"),
    assetIdentifier: z.string().optional(),
    date: z.date("Purchase date is required"),
    quantity: z.string().optional(),
    unit: z.string().min(1, "Unit is required"),
    totalInvestment: z
      .string()
      .min(1, "Total investment is required")
      .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
        message: "Total investment must be greater than 0",
      }),
    isExistingHolding: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "OTHER") {
      if (!data.quantity) {
        ctx.addIssue({
          code: "custom",
          message: "Quantity is required",
          path: ["quantity"],
        });
      } else if (
        isNaN(parseFloat(data.quantity)) ||
        parseFloat(data.quantity) <= 0
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Quantity must be greater than 0",
          path: ["quantity"],
        });
      }
    }
  });

type InvestmentForm = z.infer<typeof investmentSchema>;

// ── Component ────────────────────────────────────────────────────────────────
export const AddInvestment = ({
  onSuccess,
  investmentInitialValues,
}: {
  onSuccess: () => void;
  investmentInitialValues?: InvestmentInitialValues;
}) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InvestmentForm>({
    resolver: zodResolver(investmentSchema),
    defaultValues: investmentInitialValues
      ? {
          name: investmentInitialValues.name,
          type: investmentInitialValues.type as InvestmentType,
          assetIdentifier: investmentInitialValues.assetIdentifier ?? "",
          totalInvestment: investmentInitialValues.totalInvestment.toString(),
          quantity: investmentInitialValues.quantity.toString(),
          unit: investmentInitialValues.unit,
          date: new Date(investmentInitialValues.date),
          isExistingHolding: investmentInitialValues.isExistingHolding,
        }
      : {
          type: InvestmentType.STOCK,
          name: "",
          assetIdentifier: "",
          quantity: "",
          totalInvestment: "",
          unit: "shares",
          date: undefined,
          isExistingHolding: false,
        },
  });
  const { refetchActive } = useTabsContext();

  const type = watch("type");
  const purchaseDate = watch("date");
  const quantity = watch("quantity");
  const totalInvestment = watch("totalInvestment");
  const isExistingHolding = watch("isExistingHolding");
  const isEditing = !!investmentInitialValues;

  // Live total calculation
  const total =
    quantity && totalInvestment
      ? parseFloat(quantity) * parseFloat(totalInvestment)
      : null;

  const handleTypeChange = (newType: InvestmentType) => {
    const unitMap: Record<InvestmentType, string> = {
      STOCK: "shares",
      CRYPTO: "coin",
      GOLD: "gram",
      OTHER: "unit",
    };

    const extraDefaults =
      newType === InvestmentType.GOLD
        ? { assetIdentifier: "gold" }
        : { assetIdentifier: "" };

    reset({
      type: newType,
      name: "",
      quantity: "",
      totalInvestment: "",
      unit: unitMap[newType],
      date: undefined,
      isExistingHolding,
      ...extraDefaults,
    });
  };

  const onSubmit = async (data: InvestmentForm) => {
    try {
      const res = await fetch(
        isEditing
          ? `/api/user/investment/${investmentInitialValues?.id}`
          : "/api/user/investment",
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

      toast.success("Investment added successfully!", {
        position: "top-center",
      });

      reset();
      onSuccess();
      router.refresh();
      refetchActive();
    } catch (error) {
      toast.error((error as Error).message || "Failed to add investment", {
        position: "top-center",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 justify-center w-full max-w-md mx-auto"
    >
      {/* ── Asset type selector ── */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
        {DEFAULT_INVESTMENT_TYPES.map((t) => (
          <Card
            key={t.value}
            onClick={() => handleTypeChange(t.value)}
            className={cn(
              "h-12 p-2 flex justify-center items-center cursor-pointer shadow-md active:scale-95 transition-transform",
              type === t.value ? TYPE_ACCENT[t.value] : "opacity-60",
            )}
          >
            <CardHeader className="justify-center font-semibold">
              {t.name}
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* ── Purchase date ── */}
      <div className="flex flex-col gap-2">
        <span>Purchase Date</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              data-empty={!purchaseDate}
              className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground active:scale-95 transition-transform"
            >
              {purchaseDate ? (
                format(purchaseDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={purchaseDate}
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

      {/* ── Ticker / symbol (optional, not shown for Gold) ── */}
      {type !== InvestmentType.GOLD && type !== InvestmentType.OTHER && (
        <div className="flex flex-col gap-2">
          <span>{type === InvestmentType.STOCK ? "Stock" : "Crypto"}</span>
          <Controller
            control={control}
            name="assetIdentifier"
            render={({ field }) => (
              <Select
                key={type}
                value={field.value} // ✅ VERY IMPORTANT
                onValueChange={field.onChange} // ✅ VERY IMPORTANT
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a stock" />
                </SelectTrigger>
                <SelectContent>
                  <div className="max-h-60 overflow-y-auto">
                    <SelectGroup>
                      {type === InvestmentType.CRYPTO ? (
                        <>
                          <SelectLabel>Coin</SelectLabel>
                          {PREDEFINED_CRYPTO_ASSETS.map((asset) => (
                            <SelectItem
                              key={asset.identifier}
                              value={asset.identifier}
                            >
                              {asset.identifier} - {asset.label}
                            </SelectItem>
                          ))}
                        </>
                      ) : (
                        <>
                          <SelectLabel>Stocks</SelectLabel>
                          {PREDEFINED_STOCKS_ASSETS.map((asset) => (
                            <SelectItem
                              key={asset.identifier}
                              value={asset.identifier}
                            >
                              {asset.identifier} - {asset.label}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectGroup>
                  </div>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      {/* ── Asset name ── */}
      <div className="flex flex-col gap-2">
        <span>Asset Name</span>
        <Input
          type="text"
          placeholder={
            type === InvestmentType.GOLD
              ? "e.g. Antam 10g"
              : type === InvestmentType.STOCK
                ? "e.g. Bank Central Asia"
                : type === InvestmentType.CRYPTO
                  ? "e.g. Bitcoin"
                  : "Asset name"
          }
          {...register("name")}
        />
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name.message}</span>
        )}
      </div>

      {/* ── Quantity ── */}
      <div className="flex flex-col gap-2">
        <span>
          {type === InvestmentType.GOLD ? "Weight (grams)" : "Quantity / Units"}
          {type === InvestmentType.OTHER && (
            <span className="text-muted-foreground text-sm"> (optional)</span>
          )}
        </span>
        <Controller
          control={control}
          name="quantity"
          render={({ field }) => (
            <NumericFormat
              customInput={Input}
              thousandSeparator="."
              decimalSeparator=","
              value={field.value || ""}
              inputMode="decimal"
              placeholder={type === InvestmentType.OTHER ? "e.g. 1" : ""}
              onValueChange={(v) => field.onChange(v.value)}
              onFocus={(e) =>
                e.target.scrollIntoView({ behavior: "smooth", block: "center" })
              }
            />
          )}
        />
        {errors.quantity && type !== InvestmentType.OTHER && (
          <span className="text-red-500 text-sm">
            {errors.quantity.message}
          </span>
        )}
      </div>

      {/* ── Asset name ── */}
      {type === InvestmentType.STOCK && (
        <div className="flex flex-col gap-2">
          <span>Unit</span>
          <Controller
            control={control}
            name="unit"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shares">Shares</SelectItem>
                  <SelectItem value="lot">Lot</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      {/* ── Price per unit ── */}
      <div className="flex flex-col gap-2">
        <span>
          {type === InvestmentType.GOLD ? "Price per Gram" : "Total Investment"}
        </span>
        <Controller
          control={control}
          name="totalInvestment"
          render={({ field }) => (
            <NumericFormat
              customInput={Input}
              thousandSeparator="."
              decimalSeparator=","
              prefix="Rp "
              inputMode="decimal"
              value={field.value || ""}
              onValueChange={(v) => field.onChange(v.value)}
              onFocus={(e) =>
                e.target.scrollIntoView({ behavior: "smooth", block: "center" })
              }
            />
          )}
        />
        {errors.totalInvestment && (
          <span className="text-red-500 text-sm">
            {errors.totalInvestment.message}
          </span>
        )}
      </div>

      {/* ── Existing holding toggle ── */}
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() =>
            setValue("isExistingHolding", !isExistingHolding, {
              shouldValidate: true,
            })
          }
          className={cn(
            "flex items-center gap-2 w-fit text-sm font-medium active:scale-95 transition-transform",
            isExistingHolding ? "text-primary" : "text-muted-foreground",
          )}
        >
          <History size={15} />
          I already own this
          {/* pill indicator */}
          <span
            className={cn(
              "w-8 h-4 rounded-full transition-colors relative",
              isExistingHolding ? "bg-primary" : "bg-muted-foreground/30",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
                isExistingHolding ? "left-4" : "left-0.5",
              )}
            />
          </span>
        </button>
        <span className="text-xs text-muted-foreground pl-[23px]">
          Won&apos;t be subtracted from your cash balance
        </span>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Spinner />
        ) : isEditing ? (
          "Update Investment"
        ) : (
          "Add Investment"
        )}
      </Button>
    </form>
  );
};
