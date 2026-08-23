"use client";

import { useState } from "react";
import { Home, Target, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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
import { useScheduledTransactionsContext } from "./ScheduledTransactionsProvider";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const { items: scheduledTransactions, setItems: setScheduledTransactions } =
    useScheduledTransactionsContext();

  const { fetchScheduled } = useScheduledTransactionsContext();

  return (
    <>
      {/* bottom-safe: clears iOS Safari's collapsed toolbar (see globals.css) */}
      <div className="fixed bottom-safe left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-1 p-1.5 rounded-2xl bg-card/85 backdrop-blur-xl border border-border shadow-lg shadow-ink/10">
        {/* Add actions */}
        {DEFAULT_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <div key={action.value} className="relative group">
              {/* Tooltip */}
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 text-xs font-medium rounded-lg bg-ink text-background whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {action.label}
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedAction(action.value);
                  setDrawerOpen(true);
                }}
                className="rounded-xl w-10 h-10 text-muted-foreground hover:text-amber hover:bg-amber-soft transition-colors"
              >
                <Icon className="w-5 h-5" />
              </Button>
            </div>
          );
        })}
      </div>
      {/* repositionInputs={false}: vaul toggles its internal keyboardIsOpen flag on
          every visualViewport change over 60px instead of deriving it. The iOS numeric
          keypad fires two such changes (keypad, then the prev/next accessory bar), so the
          flag ends up false while the keyboard is open — vaul then restores the drawer to
          full height while still offsetting bottom by the keyboard height, pushing the form
          off the top of the screen. Only the amount field opens a numeric keypad. */}

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        repositionInputs={false}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {selectedAction === "expense" && "Add Transaction"}
              {selectedAction === "savings" && "Add Investments"}
              {selectedAction === "assets" && "Add Assets"}
              {selectedAction === "goals" && "Add Goals"}
            </DrawerTitle>
            <DrawerDescription>
              {selectedAction === "expense" &&
                "Record a new transaction to your account"}
              {selectedAction === "savings" &&
                "Add a new investment to your portfolio"}
              {selectedAction === "assets" &&
                "Add a new asset to track its value"}
              {selectedAction === "goals" &&
                "Set a new savings goal to work towards"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-auto max-h-[85dvh] p-4 drawer-safe">
            {selectedAction === "expense" && (
              <div className="flex items-center justify-center">
                <AddTransaction
                  categories={categories}
                  goals={goals}
                  onSuccess={() => setDrawerOpen(false)}
                  onScheduled={fetchScheduled}
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
