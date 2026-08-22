"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { format, subDays, subMonths, subYears } from "date-fns";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

export type DateRange = { from?: string; to?: string };

const PRESETS: { value: string; label: string; from: (() => Date) | null }[] = [
  { value: "7d", label: "7d", from: () => subDays(new Date(), 7) },
  { value: "3mo", label: "3mo", from: () => subMonths(new Date(), 3) },
  { value: "1yr", label: "1yr", from: () => subYears(new Date(), 1) },
  { value: "all", label: "All", from: null },
];

export const DateRangeFilter = ({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState("all");

  const isActive = Boolean(value.from || value.to);

  const applyPreset = (p: string) => {
    setPreset(p);
    const found = PRESETS.find((x) => x.value === p);

    if (!found?.from) {
      onChange({});
      return;
    }

    onChange({
      from: format(found.from(), "yyyy-MM-dd"),
      to: format(new Date(), "yyyy-MM-dd"),
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Filter by date"
        className={cn(
          "p-1.5 rounded-md border transition",
          isActive
            ? "border-amber text-amber bg-amber-soft"
            : "border-border text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
      >
        <Filter className="size-3.5" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="h-auto">
          <DrawerHeader>
            <DrawerTitle>Filter by date</DrawerTitle>
            <DrawerDescription>
              Narrow the list to a specific time range.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 drawer-safe flex flex-col gap-4">
            <Tabs value={preset} onValueChange={applyPreset}>
              <TabsList className="w-full">
                {PRESETS.map((p) => (
                  <TabsTrigger key={p.value} value={p.value}>
                    {p.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={value.from ?? ""}
                onChange={(e) => {
                  setPreset("custom");
                  onChange({ ...value, from: e.target.value || undefined });
                }}
              />
              <span className="text-xs text-muted-foreground shrink-0">
                to
              </span>
              <Input
                type="date"
                value={value.to ?? ""}
                onChange={(e) => {
                  setPreset("custom");
                  onChange({ ...value, to: e.target.value || undefined });
                }}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
