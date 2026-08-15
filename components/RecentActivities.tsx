import { TabsData } from "@/app/Types";
import TransactionCard from "./TransactionCard";
import { useMemo } from "react";
import { GoalDTO } from "@/lib/data/goals";
import { Category } from "@/lib/generated/prisma/browser";

/** "Today" / "Yesterday" for the two most recent days, otherwise a short date. */
const formatDayLabel = (dateKey: string) => {
  const date = new Date(dateKey);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();

  if (dateKey === today) return "Today";
  if (dateKey === yesterday) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

type RecentActivitiesProps = {
  isShown: boolean;
  data: TabsData["topSpending"];
  categories: Category[];
  goals: GoalDTO[];
};

const RecentActivities = ({
  isShown,
  data,
  categories,
  goals,
}: RecentActivitiesProps) => {
  const groupedByDate = useMemo(() => {
    const groups: { date: string; transactions: typeof data }[] = [];

    data.forEach((transaction) => {
      const dateKey = new Date(transaction.date).toDateString();
      const existing = groups.find((g) => g.date === dateKey);

      if (existing) {
        existing.transactions.push(transaction);
      } else {
        groups.push({ date: dateKey, transactions: [transaction] });
      }
    });

    return groups;
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      {isShown && (
        <h2 className="font-display text-xl">Recent activity</h2>
      )}
      {data.length === 0 ? (
        <p className="text-center py-10 text-sm text-muted-foreground">
          No recent transactions available.
        </p>
      ) : (
        groupedByDate.map(({ date, transactions }) => (
          <div key={date} className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.13em] text-muted-foreground font-bold">
              {formatDayLabel(date)}
            </span>
            {transactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                categories={categories}
                goals={goals}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default RecentActivities;
