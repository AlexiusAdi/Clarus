"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Eye, EyeOff } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

const NetWorthCard = ({
  isVisible,
  toggleVisibility,
}: {
  isVisible: boolean;
  toggleVisibility: () => void;
}) => {
  return (
    <div className="pb-3">
      <Card className="bg-obsidian text-white @2xs/main:gap-3">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl opacity-90">Total Net Worth</CardTitle>
          <button
            onClick={toggleVisibility}
            aria-label={isVisible ? "Hide amount" : "Show amount"}
            className="hover:opacity-70 transition"
          >
            {isVisible ? (
              <Eye className="w-6 h-6" />
            ) : (
              <EyeOff className="w-6 h-6" />
            )}
          </button>
        </CardHeader>
        <CardContent className="text-3xl">
          {isVisible === null ? (
            <Skeleton className="w-40 h-8" />
          ) : isVisible ? (
            `Rp 150.000.000`
          ) : (
            "******"
          )}
        </CardContent>
        <CardContent className="flex justify-between gap-2">
          <Card className="w-50 @xs/main:gap-0 bg-stellyIce border-stellyIce text-white/70">
            <CardHeader className="text-bold @2xs/main:text-md @2xs/main:px-3 @md/main:px-6">
              <CardTitle>
                <span>Cash Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="@2xs/main:px-3 @md/main:px-6 font-semibold @2xs/main:text-md @md/main:text-lg">
              Rp 150.000.000
            </CardContent>
          </Card>
          <Card className="w-50 @xs/main:gap-0 bg-stellyIce border-stellyIce text-white/70">
            <CardHeader className="text-bold @2xs/main:text-md @2xs/main:px-3 @md/main:px-6">
              <CardTitle>
                <span>Investments</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="@2xs/main:px-3 @md/main:px-6 font-semibold @2xs/main:text-md @md/main:text-lg">
              Rp 500.000.000
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetWorthCard;
