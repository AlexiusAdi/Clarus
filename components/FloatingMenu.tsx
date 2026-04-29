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

export default function FloatingMenu({
  categories,
  goals,
}: {
  categories: Category[];
  goals: GoalDTO[];
  assets: AssetDTO[];
}) {
  const [fabOpen, setFabOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const router = useRouter();

  return (
    <>
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-50">
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
                  <span className="bg-background border px-3 py-1 rounded-md shadow text-sm">
                    {action.label}
                  </span>

                  <Button
                    size="icon"
                    className="rounded-full"
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
          className="rounded-xl w-12 h-12 shadow-lg"
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

      {/* ✅ Drawer INSIDE component */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {selectedAction === "expense" && "Add Transaction"}
              {selectedAction === "savings" && "Add Investments"}
              {selectedAction === "assets" && "Add Assets"}
            </DrawerTitle>
          </DrawerHeader>

          <div className="overflow-auto max-h-[85dvh] p-4">
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
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
