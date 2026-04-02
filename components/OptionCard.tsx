"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { LogOut, User, Mail, Coins } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { SettingsUser } from "@/app/Types";

type Props = {
  user: SettingsUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function OptionCard({ user, open, onOpenChange }: Props) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initials = (user.name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Account</SheetTitle>
        </SheetHeader>

        <div className="w-full max-w-md mx-auto pb-24 px-4">
          <div className="flex flex-col items-center gap-2 pb-6">
            <Avatar className="w-18 h-18">
              <AvatarImage
                referrerPolicy="no-referrer"
                src={user.image}
                alt={user.name ?? "User"}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Personal Info
          </p>
          <Card className="mb-4">
            <CardContent className="p-0 divide-y divide-border">
              <div className="flex flex-col px-4 py-3">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Full Name
                </span>
                <div className="flex items-center gap-2">
                  <User width={14} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {user.name}
                  </span>
                </div>
              </div>
              <div className="flex flex-col px-4 py-3">
                <span className="font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Email
                </span>
                <div className="flex items-center gap-2">
                  <Mail width={14} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
              <div className="flex flex-col px-4 py-3">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Currency
                </span>
                <div className="flex items-center gap-2">
                  <Coins
                    width={14}
                    className="text-muted-foreground shrink-0"
                  />
                  <span className="text-sm text-muted-foreground">
                    IDR — Indonesian Rupiah
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Account
          </p>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-border"
          >
            {isLoggingOut ? (
              <Spinner />
            ) : (
              <>
                <LogOut width={15} className="mr-2" />
                Log Out
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
