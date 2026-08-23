"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import { Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { GroupDTO } from "@/lib/data/groups";
import { GroupMode } from "@/lib/generated/prisma/browser";
import Alert from "./Alert";

export const GroupCard = ({ group }: { group: GroupDTO }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const percent = Math.min(
    (group.spent / (group.totalBudget || 1)) * 100,
    100,
  );
  const overBudget = group.remaining < 0;

  return (
    <>
      <Card
        className={cn(
          "w-full rounded-2xl shadow-none",
          deleting && "opacity-50 pointer-events-none",
        )}
      >
        <CardContent className="p-4">
          <Link
            href={`/groups/${group.id}`}
            className="block active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="headline text-lg truncate">{group.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {group.memberCount}{" "}
                  {group.memberCount === 1 ? "person" : "people"}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-[10px] font-bold uppercase tracking-[0.07em] px-2.5 py-1 rounded-full",
                  group.mode === GroupMode.POOLED
                    ? "bg-sage-soft text-sage border border-sage/20"
                    : "bg-amber-soft text-amber border border-amber/25",
                )}
              >
                {group.mode === GroupMode.POOLED ? "Shared pool" : "Per person"}
              </span>
            </div>

            <div className="flex justify-between items-baseline mb-2">
              <span className="tabular headline text-xl">
                {formatCurrency(group.spent)}
              </span>
              <span className="tabular text-xs text-muted-foreground">
                of {formatCurrency(group.totalBudget)}
              </span>
            </div>

            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden mb-2">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  overBudget ? "bg-clay" : "bg-amber",
                )}
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="tabular text-xs font-semibold text-muted-foreground">
                {percent.toFixed(0)}% spent
              </span>
              <span
                className={cn(
                  "tabular text-xs",
                  overBudget ? "text-clay font-semibold" : "text-muted-foreground",
                )}
              >
                {overBudget
                  ? `${formatCurrency(Math.abs(group.remaining))} over`
                  : `${formatCurrency(group.remaining)} left`}
              </span>
            </div>
          </Link>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setAlertOpen(true)}
              disabled={deleting}
              aria-label="Delete group"
              className="p-1.5 rounded-md text-muted-foreground hover:text-clay hover:bg-clay-soft active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Alert
        open={alertOpen}
        onOpenChange={setAlertOpen}
        onPendingChange={setDeleting}
        apiUrl={`/api/user/groups/${group.id}`}
        successMessage="Group deleted"
        description="This won't delete any expenses already logged — they'll just stop being tracked against this group."
      />
    </>
  );
};
