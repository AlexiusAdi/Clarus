"use client";

import { useState } from "react";
import { GoalCard } from "@/components/GoalCard";
import { GoalDTO } from "@/lib/data/goals";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function GoalsContent({ goals }: { goals: GoalDTO[] }) {
  // Goals arrive as server props, so a deleted card would otherwise linger
  // until router.refresh() re-renders the page. Hide it locally right away.
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const visibleGoals = goals.filter((g) => !deletedIds.includes(g.id));

  const activeGoals = visibleGoals.filter((g) => !g.isCompleted);
  const completedGoals = visibleGoals.filter((g) => g.isCompleted);
  const avgProgress =
    activeGoals.reduce(
      (sum, g) => sum + Math.min((g.currentAmount / g.targetAmount) * 100, 100),
      0,
    ) / (activeGoals.length || 1);

  if (visibleGoals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No goals yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="headline text-xl">Goals</h2>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-obsidian text-porcelinwhite border-0 rounded-xl shadow-none">
          <CardContent className="p-3 text-center">
            <p className="headline tabular text-2xl">
              {activeGoals.length}
            </p>
            <p className="text-[10px] uppercase tracking-[0.08em] font-semibold text-porcelinwhite/60 mt-1">
              Active
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-none">
          <CardContent className="p-3 text-center">
            <p className="headline tabular text-2xl">
              {completedGoals.length}
            </p>
            <p className="text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground mt-1">
              Completed
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-none">
          <CardContent className="p-3 text-center">
            <p className="headline tabular text-2xl">
              {avgProgress.toFixed(0)}%
            </p>
            <p className="text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground mt-1">
              Avg Progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.13em]">
            Active Goals
          </p>
          <div className="px-12">
            <Carousel opts={{ align: "center", dragFree: true }}>
              <CarouselContent>
                {activeGoals.map((goal) => (
                  <CarouselItem key={goal.id} className="basis-1/1">
                    <GoalCard
                      goal={goal}
                      onDeleted={() => setDeletedIds((ids) => [...ids, goal.id])}
                      onDeleteFailed={() =>
                        setDeletedIds((ids) => ids.filter((i) => i !== goal.id))
                      }
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.13em]">
            Completed
          </p>
          <div className="px-12">
            <Carousel opts={{ align: "start", dragFree: true }}>
              <CarouselContent>
                {completedGoals.map((goal) => (
                  <CarouselItem key={goal.id} className="basis-1/1">
                    <GoalCard
                      goal={goal}
                      onDeleted={() => setDeletedIds((ids) => [...ids, goal.id])}
                      onDeleteFailed={() =>
                        setDeletedIds((ids) => ids.filter((i) => i !== goal.id))
                      }
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </>
      )}
    </div>
  );
}
