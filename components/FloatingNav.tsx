"use client";

import { useState } from "react";
import { Home, Target, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_ACTIONS } from "@/constants";
import { Category } from "@/lib/generated/prisma/client";
import { AddTransaction } from "./AddTransaction";
import { AddAssets } from "./AddAssets";
import { AddInvestment } from "./AddInvestment";
import { GoalDTO } from "@/lib/data/goals";
import { AssetDTO } from "@/lib/data/assets";
import { AddGoal } from "./AddGoalCard";

const NAV_ITEMS = [{ icon: Target, href: "/goals" }];

export default function FloatingNav({
  categories,
  goals,
  assets,
}: {
  categories: Category[];
  goals: GoalDTO[];
  assets: AssetDTO[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-1 p-2 rounded-2xl bg-background/80 backdrop-blur-md border shadow-lg">
        {/* Add actions */}
        {DEFAULT_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.value}
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedAction(action.value);
                setDrawerOpen(true);
              }}
              className="rounded-xl w-10 h-10 hover:scale-125 transition-all"
            >
              <Icon className="w-5 h-5" />
            </Button>
          );
        })}
      </div>

      {/* ✅ Drawer INSIDE component */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {selectedAction === "expense" && "Add Transaction"}
              {selectedAction === "savings" && "Add Investments"}
              {selectedAction === "assets" && "Add Assets"}
              {selectedAction === "goals" && "Add Goals"}
            </DrawerTitle>
          </DrawerHeader>

          <div className="overflow-auto p-4">
            {selectedAction === "expense" && (
              <div className="flex items-center justify-center">
                <AddTransaction
                  categories={categories}
                  goals={goals}
                  onSuccess={() => setDrawerOpen(false)}
                />
              </div>
            )}
            {selectedAction === "savings" && (
              <div className="flex items-center justify-center">
                <AddInvestment onSuccess={() => setDrawerOpen(false)} />
              </div>
            )}
            {selectedAction === "assets" && (
              <div className="flex items-center justify-center">
                <AddAssets onSuccess={() => setDrawerOpen(false)} />
              </div>
            )}
            {selectedAction === "goals" && (
              <div className="flex items-center justify-center">
                <AddGoal onSuccess={() => setDrawerOpen(false)} />
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
