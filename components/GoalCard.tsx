"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { GoalDTO } from "@/lib/data/goals";
import Alert from "./Alert";
import { format } from "date-fns";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { AddGoal } from "./AddGoalCard";

type GoalStatus = "on-track" | "behind" | "completed";

const STATUS_CONFIG: Record<
  GoalStatus,
  { label: string; className: string; barColor: string }
> = {
  "on-track": {
    label: "On Track",
    className: "bg-sage-soft text-sage border border-sage/20",
    barColor: "bg-sage",
  },
  behind: {
    label: "Behind",
    className: "bg-clay-soft text-clay border border-clay/20",
    barColor: "bg-clay",
  },
  completed: {
    label: "✓ Done",
    className: "bg-amber-soft text-amber border border-amber/25",
    barColor: "bg-gradient-to-r from-sand to-amber",
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
  const [editOpen, setEditOpen] = useState(false);

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
      <Card className="w-full rounded-2xl shadow-none">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg truncate">{goal.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {goal.isCompleted
                  ? `Completed ${goal.deadline ? format(goal.deadline, "MMM yyyy") : ""}`
                  : goal.deadline
                    ? `Target: ${format(goal.deadline, "MMM yyyy")}`
                    : "No deadline"}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 text-[10px] font-bold uppercase tracking-[0.07em] px-2.5 py-1 rounded-full",
                status.className,
              )}
            >
              {status.label}
            </span>
          </div>

          {/* Progress amounts */}
          <div className="flex justify-between items-baseline mb-2">
            <span className="tabular font-display text-xl">
              {formatCurrency(goal.currentAmount)}
            </span>
            <span className="tabular text-xs text-muted-foreground">
              of {formatCurrency(goal.targetAmount)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden mb-2">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                status.barColor,
              )}
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Meta */}
          <div className="flex justify-between items-center">
            <span className="tabular text-xs font-semibold text-muted-foreground">
              {percent.toFixed(1)}% saved
            </span>
            <span className="tabular text-xs text-muted-foreground">
              {goal.isCompleted
                ? "Goal reached!"
                : monthlyNeeded
                  ? `Need ${formatCurrency(monthlyNeeded)}/mo`
                  : "-"}
            </span>
          </div>

          <div className="flex justify-end gap-1 pt-3">
            <button
              onClick={() => setEditOpen(true)}
              aria-label="Edit goal"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              onClick={() => setAlertOpen(true)}
              aria-label="Delete goal"
              className="p-1.5 rounded-md text-muted-foreground hover:text-clay hover:bg-clay-soft active:scale-95 transition"
            >
              <Trash2 className="size-3.5" />
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

      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <DrawerContent className="h-auto">
          <DrawerHeader>
            <DrawerTitle>Edit Goal</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 drawer-safe overflow-y-auto">
            <AddGoal
              onSuccess={() => setEditOpen(false)}
              goalInitialValues={{
                id: goal.id,
                name: goal.name,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount,
                deadline: goal.deadline ? new Date(goal.deadline) : null,
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
