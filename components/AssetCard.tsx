import React, { use, useState } from "react";
import { Card, CardContent } from "./ui/card";
import {
  Coins,
  Trash2,
  TrendingUp,
  Building2,
  Car,
  Banknote,
  Landmark,
  PackageOpen,
  TrendingDown,
} from "lucide-react";
import {
  Asset,
  Investment,
  AssetType,
  InvestmentType,
} from "@/lib/generated/prisma/browser";
import { format } from "date-fns";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";
import Alert from "./Alert";

const ASSET_ICONS: Record<AssetType, React.ReactNode> = {
  GOLD: (
    <Coins
      className="text-yellow-500 bg-amber-100   dark:bg-amber-900/40  rounded-md p-2"
      width={32}
      height={32}
    />
  ),
  BANK: (
    <Landmark
      className="text-blue-500   bg-blue-100    dark:bg-blue-900/40   rounded-md p-2"
      width={32}
      height={32}
    />
  ),
  CASH: (
    <Banknote
      className="text-green-500  bg-green-100   dark:bg-green-900/40  rounded-md p-2"
      width={32}
      height={32}
    />
  ),
  PROPERTY: (
    <Building2
      className="text-orange-500 bg-orange-100  dark:bg-orange-900/40 rounded-md p-2"
      width={32}
      height={32}
    />
  ),
  VEHICLE: (
    <Car
      className="text-purple-500 bg-purple-100  dark:bg-purple-900/40 rounded-md p-2"
      width={32}
      height={32}
    />
  ),
  OTHER: (
    <PackageOpen
      className="text-gray-500 bg-gray-100    dark:bg-gray-800      rounded-md p-2"
      width={32}
      height={32}
    />
  ),
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

interface AssetCardProps {
  asset: Asset;
}

export const AssetCard = ({ asset }: AssetCardProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="w-full">
        <CardContent className="pt-4">
          {ASSET_ICONS[asset.type]}
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex justify-between pt-2">
              <div>
                <h1 className="font-bold">{asset.name}</h1>
                <span className="text-muted-foreground text-sm capitalize">
                  {asset.type.toLowerCase()}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-semibold">
                  {formatRupiah(asset.value)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex-1 bg-accent rounded-xl p-1.5 mr-3 text-sm">
                <span>
                  Acquired {format(new Date(asset.date), "MMM d, yyyy")}
                </span>
              </div>
              <button onClick={() => setOpen(true)}>
                <Trash2
                  width={16}
                  height={16}
                  className="text-red-500 cursor-pointer"
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Alert
        open={open}
        onOpenChange={setOpen}
        apiUrl={`/api/user/asset/${asset.id}`}
        successMessage="Asset deleted"
        description="This action cannot be undone. This will permanently delete this asset."
      />
    </>
  );
};
