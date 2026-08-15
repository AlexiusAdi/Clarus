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
import { cn } from "@/lib/utils";

const ICON_CHIP = "rounded-xl p-2.5 size-10";

const ASSET_ICONS: Record<AssetType, React.ReactNode> = {
  GOLD: <Coins className={cn(ICON_CHIP, "text-sand bg-sand/12")} />,
  BANK: <Landmark className={cn(ICON_CHIP, "text-chart-5 bg-chart-5/12")} />,
  CASH: <Banknote className={cn(ICON_CHIP, "text-sage bg-sage-soft")} />,
  PROPERTY: <Building2 className={cn(ICON_CHIP, "text-amber bg-amber-soft")} />,
  VEHICLE: <Car className={cn(ICON_CHIP, "text-clay bg-clay-soft")} />,
  OTHER: (
    <PackageOpen className={cn(ICON_CHIP, "text-muted-foreground bg-surface-2")} />
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
        <Card className="w-full rounded-2xl shadow-none">
          <CardContent className="p-4 flex gap-3">
            <div className="shrink-0">{ASSET_ICONS[asset.type]}</div>
            <div className="flex flex-col gap-3 w-full min-w-0">
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="font-semibold truncate">{asset.name}</h1>
                  <span className="text-muted-foreground text-xs capitalize">
                    {asset.type.toLowerCase()}
                  </span>
                </div>
                <span className="tabular font-display text-lg shrink-0">
                  {formatCurrency(asset.value)}
                </span>
              </div>

              <div className="flex justify-between items-center gap-3">
                <span className="flex-1 min-w-0 truncate bg-surface-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground">
                  Acquired {format(new Date(asset.date), "EEE MMM dd, yyyy")}
                </span>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditOpen(true)}
                    aria-label="Edit asset"
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setOpen(true)}
                    aria-label="Delete asset"
                    className="p-1.5 rounded-md text-muted-foreground hover:text-clay hover:bg-clay-soft active:scale-95 transition"
                  >
                    <Trash2 className="size-3.5" />
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
          <div className="p-4 drawer-safe overflow-y-auto">
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
