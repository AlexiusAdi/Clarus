"use client";

import { Card, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { AcquisitionSource, AssetType } from "@/lib/generated/prisma/browser";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "./ui/spinner";
import { ACQUISITION_SOURCES, DEFAULT_ASSETS } from "@/constants";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { NumericFormat } from "react-number-format";
import { AssetInitialValues } from "@/app/Types";
import { useTabsContext } from "./TabsProvider";

const assetSchema = z.object({
  type: z.enum(AssetType, "Asset type is required"),
  acquisitionSource: z.enum(
    AcquisitionSource,
    "Please select how you acquired this asset",
  ),
  name: z.string().min(1, "Asset name is required"),
  value: z
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
  date: z.date("Date is required"),
});

type AssetForm = z.infer<typeof assetSchema>;

export const AddAssets = ({
  onSuccess,
  assetInitialValues,
}: {
  onSuccess: () => void;
  assetInitialValues?: AssetInitialValues;
}) => {
  const router = useRouter();
  const isEditing = !!assetInitialValues;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
    defaultValues: assetInitialValues
      ? {
          type: assetInitialValues.type as AssetType,
          acquisitionSource:
            assetInitialValues.acquisitionSource as AcquisitionSource,
          name: assetInitialValues.name,
          value: String(assetInitialValues.value),
          date: new Date(assetInitialValues.date),
        }
      : undefined,
  });
  const { refetchActive } = useTabsContext();

  const selectedType = watch("type");
  const selectedSource = watch("acquisitionSource");
  const date = watch("date");
  const value = watch("value");

  const onSubmit = async (data: AssetForm) => {
    try {
      const res = await fetch(
        isEditing
          ? `/api/user/asset/${assetInitialValues.id}`
          : "/api/user/asset",
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

      toast.success("Asset added successfully!", { position: "top-center" });
      reset();
      onSuccess();
      router.refresh();
      refetchActive();
    } catch (error) {
      toast.error((error as Error).message || "Failed to add asset");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-full max-w-md mx-auto"
    >
      <div className="flex flex-col gap-2">
        <span>Asset Type</span>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
          {DEFAULT_ASSETS.map((asset) => (
            <Card
              key={asset.type}
              onClick={() =>
                setValue("type", asset.type, { shouldValidate: true })
              }
              className={cn(
                "h-12 p-2 flex justify-center items-center cursor-pointer",
                selectedType === asset.type
                  ? "border-blue-500 bg-blue-100 dark:bg-blue-900/30"
                  : "opacity-60",
              )}
            >
              <CardHeader className="justify-center font-semibold">
                {asset.name}
              </CardHeader>
            </Card>
          ))}
        </div>
        {errors.type && (
          <span className="text-red-500 text-sm">{errors.type.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span>Acquisition Source</span>
        <div className="grid grid-cols-4 gap-2">
          {ACQUISITION_SOURCES.map((source) => (
            <Card
              key={source.value}
              onClick={() =>
                setValue("acquisitionSource", source.value, {
                  shouldValidate: true,
                })
              }
              className={cn(
                "h-10 flex items-center justify-center cursor-pointer",
                selectedSource === source.value
                  ? "border-blue-500 bg-blue-100 dark:bg-blue-900/30"
                  : "opacity-60",
              )}
            >
              <span className="text-sm font-semibold px-2">{source.name}</span>
            </Card>
          ))}
        </div>
        {errors.acquisitionSource && (
          <span className="text-red-500 text-sm">
            {errors.acquisitionSource.message}
          </span>
        )}
      </div>

      {/* ASSET NAME */}
      <div className="flex flex-col gap-2">
        <span>Asset Name</span>
        <Input
          type="text"
          placeholder="e.g. 1g Gold Bar, Honda Civic, etc."
          {...register("name")}
        />
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name.message}</span>
        )}
      </div>

      {/* CURRENT VALUE */}
      <div className="flex flex-col gap-2">
        <span>Current Value</span>
        <NumericFormat
          customInput={Input}
          thousandSeparator="."
          decimalSeparator=","
          prefix="Rp "
          placeholder="Enter value"
          value={value ?? ""}
          onValueChange={(values) => {
            setValue("value", values.value, { shouldValidate: true });
          }}
        />
        {errors.value && (
          <span className="text-red-500 text-sm">{errors.value.message}</span>
        )}
      </div>

      {/* DATE */}
      <div className="flex flex-col gap-2">
        <span>Date Acquired</span>
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
          <PopoverContent className="w-auto p-0" align="center">
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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Spinner /> : isEditing ? "Update Asset" : "Add Asset"}
      </Button>
    </form>
  );
};
