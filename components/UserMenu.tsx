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
import SettingsCard from "./SettingsCard";
import { Settings, User } from "lucide-react";

const UserMenu = ({ user }: { user: SettingsUser }) => {
  const [openSheet, setOpenSheet] = useState<"profile" | "settings" | null>(
    null,
  );

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
          <div className="rounded-full cursor-pointer active:scale-125">
            <Avatar className="w-7 h-7 shadow-xl cursor-pointer">
              <AvatarImage
                referrerPolicy="no-referrer"
                src={user.image}
                alt={user.name ?? "User"}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setOpenSheet("profile")}>
              <User width={14} className="mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOpenSheet("settings")}>
              <Settings width={14} className="mr-2" /> Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <OptionCard
        user={user}
        open={openSheet === "profile"}
        onOpenChange={(o) => setOpenSheet(o ? "profile" : null)}
      />
      <SettingsCard
        open={openSheet === "settings"}
        onOpenChange={(o) => setOpenSheet(o ? "settings" : null)}
      />
    </>
  );
};

export default UserMenu;
