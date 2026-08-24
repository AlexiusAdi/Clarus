"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { AddGroup } from "@/components/AddGroupCard";
import { useDrawerScrollFix } from "@/hooks/useDrawerScrollFix";

export default function GroupsAddButton() {
  const [open, setOpenRaw] = useState(false);
  const { wrapSetOpen } = useDrawerScrollFix();
  const setOpen = wrapSetOpen(setOpenRaw);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center transition-transform active:scale-110"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* repositionInputs={false}: the iOS numeric keypad desyncs vaul's internal
          keyboardIsOpen flag and throws the drawer off-screen — see FloatingNav. */}
      <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>New group</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto max-h-[80dvh] drawer-safe">
            <AddGroup onSuccess={() => setOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
