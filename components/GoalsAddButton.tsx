"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { AddGoal } from "@/components/AddGoalCard";

export default function GoalsAddButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center transition-transform active:scale-110"
      >
        <Plus className="w-4 h-4" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add New Goal</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <AddGoal onSuccess={() => setOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
