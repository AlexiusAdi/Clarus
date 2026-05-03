// lib/helper/getGoalsSummary.ts
import { GoalDTO } from "@/lib/data/goals";

function getGoalProgress(goal: GoalDTO): number {
  return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
}

function isGoalOnTrack(goal: GoalDTO): boolean {
  const progress = getGoalProgress(goal);

  // No deadline — fall back to 50% threshold
  if (!goal.deadline) return progress >= 50;

  const now = Date.now();
  const start = goal.createdAt.getTime();
  const end = goal.deadline.getTime();

  // Deadline already passed
  if (now >= end) return progress >= 100;

  const totalDuration = end - start;
  const elapsed = now - start;
  const expectedProgress = (elapsed / totalDuration) * 100;

  return progress >= expectedProgress;
}

export function getGoalsSummary(goals: GoalDTO[]) {
  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  const onTrackGoals = activeGoals.filter(isGoalOnTrack);

  const avgProgress =
    activeGoals.reduce((sum, g) => sum + getGoalProgress(g), 0) /
    (activeGoals.length || 1);

  return { activeGoals, completedGoals, onTrackGoals, avgProgress };
}
