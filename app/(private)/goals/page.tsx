import { auth } from "@/auth";
import { getGoals } from "@/lib/data/goals";
import { GoalCard } from "@/components/GoalCard";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import GoalsAddButton from "@/components/GoalsAddButton";
import { getGoalsSummary } from "@/lib/helper/getGoalsSummary";

export default async function Goal() {
  const session = await auth();
  const goals = await getGoals(session?.user?.id!);
  const { activeGoals, completedGoals, avgProgress } = getGoalsSummary(goals);

  return (
    <div className="w-screen min-h-screen mb-20 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <a href="/home">
          <ArrowLeft className="w-5 h-5" />
        </a>
        <h1 className="font-semibold text-base">My Goals</h1>
        <GoalsAddButton />
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <Card className="bg-foreground text-background">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold">{activeGoals.length}</p>
            <p className="text-xs text-muted mt-0.5">Active Goals</p>
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
            <p className="text-xs text-muted-foreground mt-0.5">
              Avg. Progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Feedback */}

      {/* <GoalsAIFeedback /> */}

      {/* Active Goals */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
        Active Goals
      </p>
      <div className="flex flex-col gap-3 mb-5">
        {activeGoals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      {/* Completed */}
      {completedGoals.length > 0 && (
        <>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Completed
          </p>
          <div className="flex flex-col gap-3">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
