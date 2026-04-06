import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import {
  Coins,
  Trash2,
  Building2,
  Car,
  Banknote,
  Landmark,
  PackageOpen,
  Pencil,
} from "lucide-react";
import { AssetType, InvestmentType } from "@/lib/generated/prisma/browser";
import { format } from "date-fns";
import Alert from "./Alert";
import { AssetDTO } from "@/lib/data/assets";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { AddAssets } from "./AddAssets";

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

interface AssetCardProps {
  asset: AssetDTO;
}

export const AssetCard = ({ asset }: AssetCardProps) => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      {asset.value === 0 ? (
        <p className="text-center py-10 text-sm text-muted-foreground">
          No recent transactions available.
        </p>
      ) : (
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
                    {formatCurrency(asset.value)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex-1 bg-accent rounded-xl p-1.5 mr-3 text-sm">
                  <span>
                    Acquired {format(new Date(asset.date), "EEE MMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditOpen(true)}>
                    <Pencil
                      width={16}
                      height={16}
                      className="text-blue-500 cursor-pointer"
                    />
                  </button>
                  <button onClick={() => setOpen(true)}>
                    <Trash2
                      width={16}
                      height={16}
                      className="text-red-500 cursor-pointer"
                    />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Alert
        open={open}
        onOpenChange={setOpen}
        apiUrl={`/api/user/asset/${asset.id}`}
        successMessage="Asset deleted"
        description="This action cannot be undone. This will permanently delete this asset."
      />

      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <DrawerContent className="h-auto">
          <DrawerHeader>
            <DrawerTitle>Edit Asset</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto">
            <AddAssets
              onSuccess={() => setEditOpen(false)}
              assetInitialValues={{
                id: asset.id,
                name: asset.name,
                type: asset.type as InvestmentType,
                value: asset.value,
                date: asset.date,
                acquisitionSource: asset.acquisitionSource,
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
