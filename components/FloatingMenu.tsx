"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DEFAULT_ACTIONS } from "@/constants";
import { Category } from "@/lib/generated/prisma/client";
import { AddTransaction } from "./AddTransaction";
import { AddAssets } from "./AddAssets";
import { AddInvestment } from "./AddInvestment";
import { GoalDTO } from "@/lib/data/goals";
import { AssetDTO } from "@/lib/data/assets";
import { useRouter } from "next/navigation";
import { useScheduledTransactionsContext } from "./ScheduledTransactionsProvider";
import { useDrawerScrollFix } from "@/hooks/useDrawerScrollFix";

export default function FloatingMenu({
  categories,
  goals,
}: {
  categories: Category[];
  goals: GoalDTO[];
  assets: AssetDTO[];
}) {
  const [fabOpen, setFabOpen] = useState(false);
  const [drawerOpen, setDrawerOpenRaw] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const router = useRouter();
  const { wrapSetOpen } = useDrawerScrollFix();
  const setDrawerOpen = wrapSetOpen(setDrawerOpenRaw);

  const { items: scheduledTransactions, setItems: setScheduledTransactions } =
    useScheduledTransactionsContext();

  const { fetchScheduled } = useScheduledTransactionsContext();

  return (
    <>
      {/* bottom-safe: clears iOS Safari's collapsed toolbar (see globals.css) */}
      <div className="fixed bottom-safe right-6 flex flex-col items-end gap-4 z-50">
        {/* Menu Items */}
        <AnimatePresence>
          {fabOpen &&
            DEFAULT_ACTIONS.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2"
                >
                  <span className="bg-card border border-border px-3 py-1 rounded-lg text-sm font-medium shadow-sm">
                    {action.label}
                  </span>

                  <Button
                    size="icon"
                    className="rounded-full shadow-sm"
                    onClick={() => {
                      if (action.value === "goals") {
                        router.push("/goals");
                        setFabOpen(false);
                        return;
                      }
                      setSelectedAction(action.value);
                      setDrawerOpen(true);
                      setFabOpen(false);
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}
        </AnimatePresence>

        {/* Main FAB */}
        <Button
          size="icon"
          className="rounded-full w-14 h-14 shadow-lg shadow-ink/25"
          onClick={() => setFabOpen((prev) => !prev)}
        >
          <motion.div
            animate={{ rotate: fabOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus />
          </motion.div>
        </Button>
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
            </DrawerTitle>
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
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
