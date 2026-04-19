"use client";

import { GoalCard } from "@/components/GoalCard";
import { GoalDTO } from "@/lib/data/goals";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function GoalsContent({ goals }: { goals: GoalDTO[] }) {
  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);
  const avgProgress =
    activeGoals.reduce(
      (sum, g) => sum + Math.min((g.currentAmount / g.targetAmount) * 100, 100),
      0,
    ) / (activeGoals.length || 1);

  if (goals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No goals yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-xl font-bold">Goals</h2>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-foreground text-background">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold">{activeGoals.length}</p>
            <p className="text-xs mt-0.5">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold">{completedGoals.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold">{avgProgress.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Avg Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Active Goals
          </p>
          <Carousel opts={{ align: "center", dragFree: true }}>
            <CarouselContent>
              {activeGoals.map((goal) => (
                <CarouselItem key={goal.id} className="basis-1/1">
                  <GoalCard goal={goal} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Completed
          </p>
          <Carousel opts={{ align: "start", dragFree: true }}>
            <CarouselContent>
              {completedGoals.map((goal) => (
                <CarouselItem key={goal.id} className="basis-1/1">
                  <GoalCard goal={goal} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </>
      )}
    </div>
  );
}
