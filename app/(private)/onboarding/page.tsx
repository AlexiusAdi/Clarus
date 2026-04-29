// app/(private)/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!selectedDay) return;
    setLoading(true);

    await fetch("/api/user/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetDay: selectedDay }),
    });

    router.push("/home");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">One quick thing</h1>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          Which day of the month do your finances reset? This is usually your
          salary day or the start of your budgeting cycle.
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2 max-w-sm w-full">
        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
          <Card
            key={day}
            onClick={() => setSelectedDay(day)}
            className={cn(
              "h-10 w-10 flex items-center justify-center cursor-pointer text-sm font-medium transition-all",
              selectedDay === day
                ? "border-2 border-primary bg-primary/10"
                : "opacity-60 hover:opacity-100",
            )}
          >
            {day}
          </Card>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedDay || loading}
        className="w-full max-w-sm"
      >
        {loading ? "Saving..." : "Get Started"}
      </Button>
    </div>
  );
}
