// components/UserMenu.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import OptionCard from "./OptionCard";
import { SettingsUser } from "@/app/Types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

const UserMenu = ({ user }: { user: SettingsUser }) => {
  const [openSheet, setOpenSheet] = useState(false);

  const initials = (user.name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full">
            <Avatar className="w-7 h-7 shadow-xl cursor-pointer">
              <AvatarImage
                referrerPolicy="no-referrer"
                src={user.image}
                alt={user.name ?? "User"}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setOpenSheet(true)}>
              Option
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <OptionCard user={user} open={openSheet} onOpenChange={setOpenSheet} />
    </>
  );
};

export default UserMenu;
