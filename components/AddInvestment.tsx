"use client";

import { Card, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDownIcon } from "lucide-react";
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
import {
  DEFAULT_INVESTMENT_TYPES,
  PREDEFINED_CRYPTO_ASSETS,
  PREDEFINED_STOCKS_ASSETS,
} from "@/constants";
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

const TYPE_ACCENT: Record<InvestmentType, string> = {
  STOCK: "border-blue-500 border-2",
  CRYPTO: "border-orange-500 border-2",
  GOLD: "border-yellow-500 border-2",
  OTHER: "border-gray-500 border-2",
};

// ── Zod schema ───────────────────────────────────────────────────────────────
const investmentSchema = z.object({
  type: z.enum(InvestmentType),
  name: z.string().min(1, "Asset name is required"),
  assetIdentifier: z.string().optional(),
  date: z.date("Purchase date is required"),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Quantity must be greater than 0",
    }),
  unit: z.string().min(1, "Unit is required"),
  totalInvestment: z
    .string()
    .min(1, "Total investment is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Total investment must be greater than 0",
    }),
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
        }
      : {
          type: InvestmentType.STOCK,
          name: "",
          assetIdentifier: "",
          quantity: "",
          totalInvestment: "",
          unit: "shares",
          date: undefined,
        },
  });

  const type = watch("type");
  const purchaseDate = watch("date");
  const quantity = watch("quantity");
  const totalInvestment = watch("totalInvestment");
  const isEditing = !!investmentInitialValues;

  // Live total calculation
  const total =
    quantity && totalInvestment
      ? parseFloat(quantity) * parseFloat(totalInvestment)
      : null;

  const handleTypeChange = (newType: InvestmentType) => {
    reset({ type: newType });
    if (newType === InvestmentType.GOLD) {
      setValue("unit", "gram");
    } else if (newType === InvestmentType.CRYPTO) {
      setValue("unit", "coin");
    } else if (newType === InvestmentType.STOCK) {
      setValue("unit", "shares"); // default
    }

    if (newType === InvestmentType.GOLD) {
      setValue("unit", "gram");
      setValue("assetIdentifier", "gold");
    }

    setValue("name", "");
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
    } catch (error) {
      toast.error((error as Error).message || "Failed to add investment", {
        position: "top-center",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 justify-center"
    >
      {/* ── Asset type selector ── */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
        {DEFAULT_INVESTMENT_TYPES.map((t) => (
          <Card
            key={t.value}
            onClick={() => handleTypeChange(t.value)}
            className={cn(
              "w-40 h-12 p-2 flex justify-center items-center cursor-pointer",
              type === t.value ? TYPE_ACCENT[t.value] : "opacity-60",
            )}
          >
            <CardHeader className="justify-center font-semibold text-sm">
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
              className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
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
              onValueChange={(v) => field.onChange(v.value)}
            />
          )}
        />
        {errors.quantity && (
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
              value={field.value || ""}
              onValueChange={(v) => field.onChange(v.value)}
            />
          )}
        />
        {errors.totalInvestment && (
          <span className="text-red-500 text-sm">
            {errors.totalInvestment.message}
          </span>
        )}
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
