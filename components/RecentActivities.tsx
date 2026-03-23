import { TabsData } from "@/app/Types";
import TransactionCard from "./TransactionCard";
import { useMemo } from "react";

type RecentActivitiesProps = {
  isShown: boolean;
  data: TabsData["topSpending"];
};

const RecentActivities = ({ isShown, data }: RecentActivitiesProps) => {
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
    <div className="flex flex-col gap-2">
      {isShown && (
        <h2 className="text-lg font-semibold mb-2">Recent Activities</h2>
      )}
      {groupedByDate.map(({ date, transactions }) => (
        <div key={date} className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground font-medium">
            {date}
          </span>
          {transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default RecentActivities;
