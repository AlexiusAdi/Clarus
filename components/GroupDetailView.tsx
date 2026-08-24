"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Users } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { format } from "date-fns";
import { GroupDetailDTO, GroupTransactionDTO } from "@/lib/data/groups";
import { GroupMode } from "@/lib/generated/prisma/browser";
import Alert from "./Alert";
import { AddGroupExpense } from "./AddGroupExpense";
import { AddGroupMember } from "./AddGroupMemberCard";
import { useTabData } from "@/hooks/useTabData";
import { PaginationControls } from "./PaginationControls";
import { Skeleton } from "./ui/skeleton";

const AVATAR_STYLES = [
  "bg-amber-soft text-amber",
  "bg-sage-soft text-sage",
  "bg-clay-soft text-clay",
  "bg-surface-2 text-ink-soft",
];

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

export default function GroupDetailView({ group }: { group: GroupDetailDTO }) {
  const router = useRouter();
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    data: transactions,
    page: activityPage,
    totalPages: activityTotalPages,
    initialLoading: activityLoading,
    visible: activityVisible,
    handlePageChange: handleActivityPageChange,
    refetch: refetchActivity,
  } = useTabData<GroupTransactionDTO>(
    "Activity",
    "Activity",
    `/api/user/groups/${group.id}/transactions`,
    0,
  );

  const percent = Math.min((group.spent / (group.totalBudget || 1)) * 100, 100);
  const overBudget = group.remaining < 0;

  return (
    <div
      className={cn(
        "w-full min-h-dvh p-4 max-w-md mx-auto",
        deleting && "opacity-50 pointer-events-none",
      )}
    >
      <div className="flex items-center justify-between pb-4">
        <Link href="/groups">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-semibold text-base truncate px-2">{group.name}</h1>
        <button
          onClick={() => setDeleteOpen(true)}
          aria-label="Delete group"
          className="p-1.5 rounded-md text-muted-foreground hover:text-clay hover:bg-clay-soft transition"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.07em] px-2.5 py-1 rounded-full",
            group.mode === GroupMode.POOLED
              ? "bg-sage-soft text-sage border border-sage/20"
              : "bg-amber-soft text-amber border border-amber/25",
          )}
        >
          {group.mode === GroupMode.POOLED ? "Shared pool" : "Per person"}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Users className="w-3 h-3" />
          {group.memberCount} {group.memberCount === 1 ? "person" : "people"}
        </span>
      </div>

      {/* Rollup */}
      <Card className="rounded-2xl shadow-none mb-5">
        <CardContent className="p-4">
          <div className="flex justify-between items-baseline mb-2">
            <span className="tabular headline text-2xl">
              {formatCurrency(group.spent)}
            </span>
            <span className="tabular text-xs text-muted-foreground">
              of {formatCurrency(group.totalBudget)}
            </span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden mb-2">
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
        </CardContent>
      </Card>

      {/* Add expense */}
      <button
        onClick={() => setExpenseOpen(true)}
        className="w-full rounded-xl border border-border py-2.5 text-sm font-semibold mb-5 active:scale-[0.99] transition-transform"
      >
        + Add expense
      </button>

      {/* Members */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          People
        </p>
        <button
          onClick={() => setMemberOpen(true)}
          aria-label="Add person"
          className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center active:scale-110 transition-transform"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <div className="flex flex-col gap-2 mb-5">
        {group.members.map((member, i) => (
          <div
            key={member.id}
            className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5"
          >
            <span
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                AVATAR_STYLES[i % AVATAR_STYLES.length],
              )}
            >
              {initials(member.name)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {member.isOwner ? "You" : member.name}
              </p>
              {member.remaining !== null && (
                <div className="h-1 bg-surface-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      member.remaining < 0 ? "bg-clay" : "bg-sage",
                    )}
                    style={{
                      width: `${Math.min((member.spent / (member.budgetAmount || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
            <span
              className={cn(
                "tabular text-xs font-semibold shrink-0",
                member.remaining !== null && member.remaining < 0
                  ? "text-clay"
                  : "text-muted-foreground",
              )}
            >
              {member.remaining !== null
                ? member.remaining < 0
                  ? `${formatCurrency(Math.abs(member.remaining))} over`
                  : `${formatCurrency(member.remaining)} left`
                : formatCurrency(member.spent)}
            </span>
          </div>
        ))}
      </div>

      {/* Activity */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
        Activity
      </p>
      {activityLoading ? (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-0"
            >
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16 shrink-0" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No expenses logged yet.
        </p>
      ) : (
        <div
          className={cn(
            "transition-all duration-150",
            activityVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2",
          )}
        >
          <div className="flex flex-col gap-1.5">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {t.description || "Group expense"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.memberName ?? "Unassigned"} &middot;{" "}
                    {format(t.date, "d MMM")}
                  </p>
                </div>
                <span className="tabular text-sm font-semibold shrink-0">
                  {formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
          <PaginationControls
            page={activityPage}
            totalPages={activityTotalPages}
            onPageChange={handleActivityPageChange}
          />
        </div>
      )}

      {/* repositionInputs={false}: the iOS numeric keypad desyncs vaul's internal
          keyboardIsOpen flag and throws the drawer off-screen — see FloatingNav. */}
      <Drawer
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        repositionInputs={false}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add expense</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto max-h-[80dvh] drawer-safe">
            <AddGroupExpense
              groupId={group.id}
              mode={group.mode}
              members={group.members.map((m) => ({
                id: m.id,
                name: m.name,
                isOwner: m.isOwner,
              }))}
              onDone={() => {
                setExpenseOpen(false);
                router.refresh();
                refetchActivity();
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={memberOpen}
        onOpenChange={setMemberOpen}
        repositionInputs={false}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add person</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 drawer-safe">
            <AddGroupMember
              groupId={group.id}
              mode={group.mode}
              onSuccess={() => setMemberOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <Alert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onPendingChange={setDeleting}
        apiUrl={`/api/user/groups/${group.id}`}
        successMessage="Group deleted"
        description="This won't delete any expenses already logged — they'll just stop being tracked against this group."
      />
    </div>
  );
}
