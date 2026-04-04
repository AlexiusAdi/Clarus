"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { GoalDTO } from "@/lib/data/goals";
import Alert from "./Alert";
import { format } from "date-fns";

type GoalStatus = "on-track" | "behind" | "completed";

const STATUS_CONFIG: Record<
  GoalStatus,
  { label: string; className: string; barColor: string }
> = {
  "on-track": {
    label: "On Track",
    className: "bg-green-50 text-green-700",
    barColor: "bg-green-500",
  },
  behind: {
    label: "Behind",
    className: "bg-red-50 text-red-700",
    barColor: "bg-orange-400",
  },
  completed: {
    label: "✓ Done",
    className: "bg-blue-50 text-blue-700",
    barColor: "bg-blue-400",
  },
};

const getStatus = (goal: GoalDTO): GoalStatus => {
  if (goal.isCompleted) return "completed";
  if (!goal.deadline) return "on-track";
  const monthsLeft =
    (goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
  const remaining = goal.targetAmount - goal.currentAmount;
  const monthlyNeeded = remaining / (monthsLeft || 1);
  // behind if they'd need to save more than 150% of proportional pace
  return monthlyNeeded > (goal.targetAmount / 12) * 1.5 ? "behind" : "on-track";
};

export const GoalCard = ({ goal }: { goal: GoalDTO }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const { status, monthlyNeeded, percent } = useMemo(() => {
    const now = Date.now();
    const percent = Math.min(
      (goal.currentAmount / goal.targetAmount) * 100,
      100,
    );
    const monthsLeft = goal.deadline
      ? Math.max(
          (goal.deadline.getTime() - now) / (1000 * 60 * 60 * 24 * 30),
          1,
        )
      : null;
    const monthlyNeeded = monthsLeft
      ? (goal.targetAmount - goal.currentAmount) / monthsLeft
      : null;

    let status: GoalStatus = "on-track";
    if (goal.isCompleted) {
      status = "completed";
    } else if (monthsLeft && monthlyNeeded) {
      status =
        monthlyNeeded > (goal.targetAmount / 12) * 1.5 ? "behind" : "on-track";
    }

    return { status: STATUS_CONFIG[status], monthlyNeeded, percent };
  }, [goal]);

  return (
    <>
      <Card className="w-full">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg">{goal.name}</h3>
              <p className="text-sm text-muted-foreground">
                {goal.isCompleted
                  ? `Completed ${goal.deadline ? format(goal.deadline, "MMM yyyy") : ""}`
                  : goal.deadline
                    ? `Target: ${format(goal.deadline, "MMM yyyy")}`
                    : "No deadline"}
              </p>
            </div>
            <span
              className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-full",
                status.className,
              )}
            >
              {status.label}
            </span>
          </div>

          {/* Progress amounts */}
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-sm font-bold">
              {formatCurrency(goal.currentAmount)}
            </span>
            <span className="text-xs text-muted-foreground">
              of {formatCurrency(goal.targetAmount)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-accent rounded-full overflow-hidden mb-2">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                status.barColor,
              )}
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Meta */}
          <div className="flex justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {percent.toFixed(1)}% saved
            </span>
            <span className="text-xs text-muted-foreground">
              {goal.isCompleted
                ? "Goal reached!"
                : monthlyNeeded
                  ? `Need ${formatCurrency(monthlyNeeded)}/mo`
                  : "-"}
            </span>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={() => setAlertOpen(true)}>
              <Trash2
                width={18}
                height={18}
                className="text-red-500 cursor-pointer"
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Alert
        open={alertOpen}
        onOpenChange={setAlertOpen}
        apiUrl={`/api/user/goals/${goal.id}`}
        successMessage="Goal deleted"
        description="This action cannot be undone."
      />
    </>
  );
};
