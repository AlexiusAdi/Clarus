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
import AddInvestment from "./AddInvestment";
import { DEFAULT_ACTIONS } from "@/constants";
import { Category } from "@/lib/generated/prisma/client";
import { AddTransaction } from "./AddTransaction";

export default function FloatingMenu({
  categories,
}: {
  categories: Category[];
}) {
  const [fabOpen, setFabOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

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
              {selectedAction === "income" && "Add Income"}
              {selectedAction === "savings" && "Add Investments"}
              {selectedAction === "assets" && "Add Assets"}
            </DrawerTitle>
          </DrawerHeader>

          <div className="p-4">
            {selectedAction === "expense" && (
              <div className="h-screen">
                <AddTransaction categories={categories} />
              </div>
            )}
            {selectedAction === "income" && <div>Income Form</div>}
            {selectedAction === "savings" && (
              <div className="h-screen">
                <AddInvestment />
              </div>
            )}
            {selectedAction === "assets" && (
              <div className="h-screen">
                <AddInvestment />
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
