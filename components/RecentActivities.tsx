import TransactionCard from "./TransactionCard";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Trash2 } from "lucide-react";

type RecentActivitiesProps = {
  isShown: boolean;
};

const RecentActivities = ({ isShown }: RecentActivitiesProps) => {
  return (
    <div className="flex flex-col gap-2">
      {isShown && (
        <h2 className="text-lg font-semibold mb-2">Recent Activities</h2>
      )}
      <TransactionCard />
      <TransactionCard />
      <TransactionCard />
    </div>
  );
};

export default RecentActivities;
